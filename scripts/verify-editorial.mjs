import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL,
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
const base = 'http://127.0.0.1:4173/';
const sizes = [[320,700],[375,812],[768,1024],[1024,768],[1280,800],[1440,900],[1920,1080],[2560,1080]];
fs.mkdirSync('editorial-snapshots', { recursive: true });
const angle = async page => Number(await page.locator('.tm-explorer-moon').getAttribute('data-angle'));
const wait = (page, ms) => page.waitForTimeout(ms);
const delta = (a,b) => (b-a+360)%360;

async function waitForHero(page) {
  await page.locator('[data-coded-hero]').waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document.querySelector('.tm-explorer-foreground').decode();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.waitForFunction(() => document.querySelector('.tm-explorer-masthead')?.dataset.typeReady === 'true');
}

// Sample an unobstructed patch of lunar terrain, including CSS compositing and fallback.
async function checkLunarTone(page) {
  const moon = await page.locator('.tm-explorer-moon').boundingBox();
  const clip = {
    x: Math.floor(moon.x + .4 * moon.width), y: Math.floor(moon.y + .20 * moon.height),
    width: Math.floor(.23 * moon.width), height: Math.floor(.19 * moon.height),
  };
  const png = await page.screenshot({ clip });
  const tone = await page.evaluate(async encoded => {
    const image = new Image();
    image.src = 'data:image/png;base64,' + encoded;
    await image.decode();
    const sample = document.createElement('canvas');
    sample.width = image.width;
    sample.height = image.height;
    const ctx = sample.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const rgba = ctx.getImageData(0, 0, sample.width, sample.height).data;
    const levels = [];
    for (let i = 0; i < rgba.length; i += 4) {
      levels.push((rgba[i] + rgba[i + 1] + rgba[i + 2]) / 3);
    }
    levels.sort((a, b) => a - b);
    return [.1, .6, .85].map(quantile => levels[Math.floor(levels.length * quantile)]);
  }, png.toString('base64'));
  assert(tone[1] < 95 && tone[2] - tone[0] > 4, 'Expected a charcoal face with visible terrain, got ' + tone);
}

// Sample the four sides at matched animation times. The contrasting backing lets
// us measure the brightness of the grains separately from holes between them.
async function sampleSurface(page, box) {
  const png = await page.screenshot({
    clip: { x: Math.floor(box.x), y: Math.floor(box.y), width: Math.floor(box.width), height: Math.floor(box.height) },
    style: `
      .tm-explorer-moon { background: #ff00ff !important; }
      .tm-lunar-dust, .tm-explorer-foreground, .tm-explorer-tagline { visibility: hidden !important; }
    `,
  });
  return page.evaluate(async encoded => {
    const image = new Image();
    image.src = 'data:image/png;base64,' + encoded;
    await image.decode();
    const canvas = document.createElement('canvas');
    const w = canvas.width = image.width, h = canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, w, h).data;
    const sectors = Object.fromEntries(['left', 'right', 'top', 'bottom'].map(name =>
      [name, { total: 0, gaps: 0, edges: 0, ink: 0, light: 0 }]));
    const isGap = i => pixels[i] - pixels[i + 1] > 85 && pixels[i + 2] - pixels[i + 1] > 65;
    for (let y = 1; y < h - 1; y++) {
      const ny = (y + .5) * 2 / h - 1;
      for (let x = 1; x < w - 1; x++) {
        const nx = (x + .5) * 2 / w - 1;
        const r2 = nx * nx + ny * ny;
        if (r2 < .60 ** 2 || r2 > .975 ** 2) continue;
        const side = Math.abs(nx) > Math.abs(ny) ? (nx < 0 ? 'left' : 'right') : (ny < 0 ? 'top' : 'bottom');
        const sector = sectors[side], i = 4 * (y * w + x);
        if (r2 > .90 ** 2) {
          sector.total++;
          sector.gaps += Number(isGap(i));
          sector.edges += Number(isGap(i) !== isGap(i + 4));
        }
        // Green carries the brightness of the rendered grain. Reject magenta
        // and its antialiased boundary before averaging.
        if (pixels[i] - pixels[i + 1] < 18 && pixels[i + 2] - pixels[i + 1] < 18) {
          sector.ink++;
          sector.light += pixels[i + 1];
        }
      }
    }
    return Object.fromEntries(Object.entries(sectors).map(([side, s]) =>
      [side, { light: s.light / s.ink, gaps: s.gaps / s.total, edges: s.edges / s.total }]));
  }, png.toString('base64'));
}

// Read actual dust pixels, including those that have crossed the silhouette.
function sampleDust() {
  const canvas = document.querySelector('.tm-lunar-dust');
  const ctx = canvas.getContext('2d');
  const {width, height} = canvas;
  const moonWidth = document.querySelector('.tm-explorer-moon').getBoundingClientRect().width;
  const rim = width * moonWidth / canvas.getBoundingClientRect().width / 2;
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const light = { left: 0, right: 0, top: 0, bottom: 0 };
  const weight = { left: 0, right: 0, top: 0, bottom: 0 };
  let exterior = 0, rightExterior = 0, checksum = 2166136261;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const alpha = rgba[4 * (py * width + px) + 3];
      if (!alpha) continue;
      checksum = Math.imul(checksum ^ (py * width + px), 16777619) ^ alpha;
      const dx = px - width / 2, dy = py - height / 2;
      if (dx * dx + dy * dy > rim * rim) {
        exterior++;
        if (dx > 0) rightExterior++;
        const side = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'top' : 'bottom');
        light[side] += alpha * rgba[4 * (py * width + px) + 1];
        weight[side] += alpha;
      }
    }
  }
  for (const side of Object.keys(light)) light[side] /= weight[side];
  return { exterior, rightExterior, checksum, light };
}

// Replay the same motion clock with each cursor position. Using the same
// angle keeps the real variations in the mapped crater field out of the test.
const directions = { left: [-1, 0], right: [1, 0], top: [0, -1], bottom: [0, 1] };
async function replayParticles(side) {
  const page = await browser.newPage({viewport: {width: 900, height: 700}, reducedMotion: 'reduce'});
  await page.clock.install({time: new Date('2026-01-01T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
  await page.goto(base, {waitUntil: 'networkidle'});
  await page.clock.runFor(80);
  const box = await page.locator('.tm-explorer-moon[data-render-mode="webgl"]').boundingBox();
  assert(box, 'WebGL surface should be ready for particle replay');
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.clock.runFor(128);
  if (side) {
    const [x, y] = directions[side];
    await page.mouse.move(box.x + box.width * (.5 + .46 * x), box.y + box.height * (.5 + .46 * y));
  }
  const start = await page.evaluate(sampleDust);
  await page.clock.runFor(640);
  const end = await page.evaluate(sampleDust);
  const rotation = await angle(page);
  const surface = await sampleSurface(page, box);
  if (side === 'left' || side === 'right') {
    await page.screenshot({path: `editorial-snapshots/moon-light-${side}.png`, clip: {
      x: Math.floor(box.x - .12 * box.width), y: Math.floor(box.y - .1 * box.height),
      width: Math.floor(box.width * 1.24), height: Math.floor(box.height * 1.18),
    }});
  }
  await page.mouse.move(-4, -4);
  await page.clock.runFor(960);
  const released = await sampleSurface(page, box);
  await page.close();
  assert(end.exterior > 20 && end.checksum !== start.checksum, 'Dust should travel beyond the moon rim');
  return { rotation, surface, released, end };
}

// Hardware cursors are excluded from browser captures. On the demonstration frame
// only, composite the cursor image from computed CSS at its real pointer hotspot.
async function inspectStar(page, point, capture = false) {
  const geometry = await page.evaluate(async ({point, capture}) => {
    const hit = document.elementFromPoint(point.x, point.y);
    const value = getComputedStyle(hit).cursor;
    const cursor = value.match(/^url\("([^"]+)"\)\s+([\d.]+)\s+([\d.]+)\s*,/);
    if (!cursor) return { value };
    const image = new Image();
    image.src = cursor[1];
    await image.decode();
    const hotspot = [Number(cursor[2]), Number(cursor[3])];
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const sample = (x, y) => [...ctx.getImageData(x, y, 1, 1).data];
    if (capture) {
      image.id = 'qa-star-capture';
      image.alt = '';
      Object.assign(image.style, {position: 'fixed', width: canvas.width + 'px', height: canvas.height + 'px',
        left: (point.x - hotspot[0]) + 'px', top: (point.y - hotspot[1]) + 'px', pointerEvents: 'none', zIndex: '10000'});
      document.body.append(image);
    }
    return {value, width: canvas.width, height: canvas.height, hotspot, center: sample(...hotspot), corner: sample(0, 0)};
  }, {point, capture});
  assert(geometry.width >= 16 && geometry.width <= 40 && geometry.width === geometry.height,
    'The star cursor must decode as a small square image');
  assert.deepEqual(geometry.hotspot, [geometry.width / 2, geometry.height / 2], 'The light and click hotspots must coincide');
  assert(geometry.center[0] > 190 && geometry.center[3] > 200 && geometry.corner[3] < 24,
    'Cursor should have a luminous center and transparent margins');
  if (capture) {
    try {
      await page.screenshot({path: 'editorial-snapshots/hero-1440-star.png'});
    } finally {
      await page.locator('#qa-star-capture').evaluate(el => el.remove());
    }
  }
}

async function swipe(session, from, to) {
  const dispatch = (type, points) => session.send('Input.dispatchTouchEvent', { type, touchPoints: points });
  await dispatch('touchStart', [from]);
  for (let step = 1; step <= 8; step++) {
    await dispatch('touchMove', [{
      x: from.x + (to.x - from.x) * step / 8,
      y: from.y + (to.y - from.y) * step / 8,
    }]);
  }
  await dispatch('touchEnd', []);
}

async function checkChapters(page, width) {
  const paper = 'rgb(241, 226, 206)', wine = 'rgb(100, 22, 19)', night = 'rgb(27, 27, 26)';
  const chapters = [['posters', paper], ['project', night], ['process', paper],
    ['about', paper], ['services', paper], ['contact-form', wine]];
  for (const [id, background] of chapters) {
    const section = page.locator('#' + id);
    await section.evaluate(el => {
      const navHeight = document.querySelector('[data-editorial-nav]').getBoundingClientRect().height;
      window.scrollTo({top: scrollY + el.getBoundingClientRect().top - navHeight, behavior: 'instant'});
    });
    await page.waitForFunction(() => document.querySelector('[data-editorial-nav]').getBoundingClientRect().y >= -1);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const presentation = await section.evaluate(el => {
      const heading = el.querySelector('h2');
      const bounds = el.getBoundingClientRect();
      const tone = (value, background) => {
        const ctx = document.createElement('canvas').getContext('2d');
        if (background) {
          ctx.fillStyle = background;
          ctx.fillRect(0, 0, 1, 1);
        }
        ctx.fillStyle = value;
        ctx.fillRect(0, 0, 1, 1);
        const [r,g,b] = [...ctx.getImageData(0, 0, 1, 1).data].map(channel => {
          const s = channel / 255;
          return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
        });
        return .2126*r + .7152*g + .0722*b;
      };
      const background = getComputedStyle(el).backgroundColor;
      const contrast = (foreground, surface) => {
        const a = tone(surface), b = tone(foreground, surface);
        return (Math.max(a,b) + .05) / (Math.min(a,b) + .05);
      };
      const selectedService = el.querySelector('.tm-service-card[data-selected="true"]');
      const toolsLabel = selectedService?.querySelector(':scope > div:first-child > div:first-child > span:last-child');
      return {background, contrast:contrast(getComputedStyle(heading).color, background), font: getComputedStyle(heading).fontFamily,
        toolsContrast: toolsLabel ? contrast(getComputedStyle(toolsLabel).color, getComputedStyle(selectedService).backgroundColor) : null,
        left: bounds.left, right: bounds.right, overflow: document.documentElement.scrollWidth - innerWidth};
    });
    assert.equal(presentation.background, background, id + ' chapter palette');
    assert(presentation.font.includes('Bodoni Moda'), id + ' chapter typography');
    assert(presentation.contrast >= 3, id + ' chapter heading should be readable against its surface');
    if (id === 'services') assert(presentation.toolsContrast >= 4.5, 'The selected service tools must be readable against the cream card');
    assert(presentation.left >= -1 && presentation.right <= width + 1 && presentation.overflow <= 2,
      id + ' must fit the viewport');
    await page.screenshot({path: `editorial-snapshots/chapter-${width}-${id}.png`, animations: 'disabled'});
  }

  const form = page.locator('#contact-form form');
  assert.equal(await form.evaluate(el => el.checkValidity()), false, 'An empty inquiry should fail validation');
  await form.locator('input[type="text"]').fill('Preview');
  await form.locator('input[type="email"]').fill('invalid');
  assert.equal(await form.evaluate(el => el.checkValidity()), false, 'An invalid email should fail validation');
  await form.locator('input[type="email"]').fill('preview@example.com');
  assert.equal(await form.evaluate(el => el.checkValidity()), true, 'The required inquiry fields should accept valid input');

  const trigger = page.locator('.tm-ma-primary-paper').first();
  await trigger.click();
  const viewer = page.locator('.tm-ma-viewer-panel');
  await viewer.waitFor({state: 'visible'});
  assert.equal(await viewer.evaluate(el => getComputedStyle(el).backgroundColor), paper, 'Poster viewer palette');
  assert(await viewer.evaluate(el => el.contains(document.activeElement)), 'Poster viewer should receive focus');
  const artwork = viewer.locator('.tm-ma-viewer-picture img');
  await artwork.evaluate(el => el.decode());
  assert.equal(await artwork.evaluate(el => getComputedStyle(el).filter), 'none', 'Keep the original artwork colors');
  await page.screenshot({path: `editorial-snapshots/poster-viewer-${width}.png`, animations: 'disabled'});
  await page.keyboard.press('Escape');
  await viewer.waitFor({state: 'hidden'});
  assert(await trigger.evaluate(el => el === document.activeElement), 'Closing the poster should restore focus');
  const navigation = page.getByRole('navigation', {name: width < 768 ? 'Mobile section navigation' : 'Floating navigation'});
  await navigation.getByRole('button', {name: 'About', exact: true}).click();
  await page.waitForFunction(() => Math.abs(document.getElementById('about').getBoundingClientRect().top) < 180);
}

try {
  for (const [width,height] of sizes) {
    const page = await browser.newPage({viewport:{width,height},reducedMotion:'reduce',deviceScaleFactor:1,hasTouch:width===375});
    if (width === 375 || width === 1440) {
      // Record submitted particle footprints before antialiasing and overlapping
      // neighbors change their apparent dimensions in a screenshot.
      await page.addInitScript(() => {
        const nativeRect = CanvasRenderingContext2D.prototype.rect;
        const samples = window.lunarGrainSample = {count: 0, min: Infinity, max: 0};
        CanvasRenderingContext2D.prototype.rect = function(x, y, w, h) {
          if (this.canvas.classList.contains('tm-lunar-dust')) {
            samples.count++;
            samples.min = Math.min(samples.min, w, h);
            samples.max = Math.max(samples.max, w, h);
            if (samples.count === 2048) CanvasRenderingContext2D.prototype.rect = nativeRect;
          }
          return nativeRect.call(this, x, y, w, h);
        };
      });
    }
    const errors=[];
    page.on('pageerror', error=>errors.push(error.message));
    await page.goto(base,{waitUntil:'networkidle'});
    await waitForHero(page);
    await page.waitForFunction(()=>document.querySelector('.tm-explorer-moon')?.dataset.renderMode==='webgl');
    const layout=await page.evaluate(()=>{
      const hero=document.querySelector('.tm-explorer-hero'),moon=document.querySelector('.tm-explorer-moon');
      const image=document.querySelector('.tm-explorer-foreground'),title=document.querySelector('.tm-explorer-heading');
      const tag=document.querySelector('.tm-explorer-tagline');
      const h=hero.getBoundingClientRect(),m=moon.getBoundingClientRect();
      return {width:h.width,height:h.height,overflow:document.documentElement.scrollWidth-innerWidth,
        round:Math.abs(m.width-m.height),moonWidth:m.width,moonTop:m.top-h.top,
        imageWidth:image.naturalWidth,imageSource:image.getAttribute('src'),
        titleText:title.textContent,letters:title.querySelectorAll('svg text').length,tagline:tag.textContent,
        font:getComputedStyle(title.querySelector('text')).fontFamily,
        weight:getComputedStyle(title.querySelector('text')).fontWeight,
        layers:[title,moon,image,tag].map(el=>Number(getComputedStyle(el).zIndex)),
        flatImages:hero.querySelectorAll('img').length,
        oldPoster:hero.querySelectorAll('.tm-retro-cover-art,.tm-retro-red-disc').length};
    });
    assert(Math.abs(layout.width-width)<2&&Math.abs(layout.height-height)<2,'Hero must fill viewport');
    assert(layout.overflow<=2,'Page has horizontal overflow');
    assert(layout.round<2,'Moon must remain circular');
    const portrait = height > width;
    const expectedMoon = width / height >= 2 ? .72 * height
      : portrait && width <= 760 ? Math.min(.98 * width, .60 * height)
      : portrait && width <= 1100 ? Math.min(.84 * width, .64 * height)
      : Math.min(.39 * width, .74 * height);
    assert(Math.abs(layout.moonWidth-expectedMoon)<3,'Moon should use the smaller approved diameter');
    assert(layout.moonTop>=height*.29,'Moon should leave open space below the masthead');
    assert(layout.imageWidth>=1920&&layout.imageSource.endsWith('/astronaut.webp'),'High-resolution explorer foreground failed to load');
    assert.equal(layout.flatImages,1,'No flattened hero image');
    assert.equal(layout.oldPoster,0,'Old red poster returned');
    assert.equal(layout.letters,8,'Eight editable letters required');
    assert(layout.titleText.includes('TUMANEEN'),'Accessible headline missing');
    assert.equal(layout.tagline,'VisualExplorer','Tagline wording changed');
    assert.deepEqual(layout.layers,[1,2,3,4],'Scene order changed');
    assert(layout.font.includes('Bodoni Moda'),'Literary serif display face missing');
    assert.equal(layout.weight,'700','Display metrics must match the actual serif weight');

    // Inspect visible ink in the chosen weight, not a larger font line box.
    const typography=await page.locator('.tm-explorer-masthead').evaluate(svg=>{
      const ctx=document.createElement('canvas').getContext('2d');
      const letters=[...svg.querySelectorAll('text')].map(el=>{
        const style=getComputedStyle(el);
        ctx.font=`${style.fontStyle} ${style.fontWeight} 100px ${style.fontFamily}`;
        ctx.textBaseline='alphabetic';
        const m=ctx.measureText(el.textContent),matrix=el.getScreenCTM();
        const x=el.x.baseVal[0]?.value || 0, y=el.y.baseVal[0]?.value || 0;
        const top=new DOMPoint(x-m.actualBoundingBoxLeft,y-m.actualBoundingBoxAscent).matrixTransform(matrix);
        const bottom=new DOMPoint(x+m.actualBoundingBoxRight,y+m.actualBoundingBoxDescent).matrixTransform(matrix);
        const baseline=new DOMPoint(x,y).matrixTransform(matrix).y;
        return {letter:el.textContent,x:top.x,y:top.y,right:bottom.x,bottom:bottom.y,width:bottom.x-top.x,height:bottom.y-top.y,
          baseline, scaleRatio:matrix.a / matrix.d};
      });
      const m=document.querySelector('.tm-explorer-moon').getBoundingClientRect();
      return {letters,clips:svg.querySelectorAll('clipPath').length,moon:{x:m.x,y:m.y,width:m.width}};
    });
    assert.equal(typography.clips,0,'Do not clip letters');
    assert.equal(typography.letters.map(l=>l.letter).join(''),'TUMANEEN');
    const narrow = portrait && width <= 600;
    const lines = narrow
      ? [typography.letters.slice(0, 4), typography.letters.slice(4)]
      : [typography.letters];
    const radius=typography.moon.width/2,cx=typography.moon.x+radius,cy=typography.moon.y+radius;
    for (const line of lines) {
      const baselines = line.map(letter => letter.baseline);
      assert(Math.max(...baselines) - Math.min(...baselines) < 2, 'Each line should share a baseline');
      line.forEach((letter, i) => {
        assert(letter.width > 8 && letter.height > 20 && Math.abs(letter.scaleRatio - 1) < .02,
          'Use full, proportionate live letterforms');
        assert(letter.x >= 0 && letter.right <= width && letter.y >= 0, 'Letter cropped by viewport');
        if (i) assert(letter.x > line[i - 1].right - .5, 'Adjacent letterforms overlap');
        const dx=Math.abs(Math.min(letter.right,Math.max(letter.x,cx))-cx);
        if(dx<radius)assert(letter.bottom<cy-Math.sqrt(radius*radius-dx*dx)-2,'Moon obscures a letter');
      });
    }
    if (narrow) {
      assert(Math.max(...lines[0].map(letter => letter.bottom)) < Math.min(...lines[1].map(letter => letter.y)),
        'The two mobile lines must clear each other');
    }
    const caption = await page.locator('.tm-explorer-tagline').evaluate(el => {
      const [label, title] = el.querySelectorAll('.tm-explorer-tagline-line');
      return { label: getComputedStyle(label).fontStyle, title: getComputedStyle(title).fontStyle,
        small: parseFloat(getComputedStyle(label).fontSize), large: parseFloat(getComputedStyle(title).fontSize),
        gap: title.getBoundingClientRect().top - label.getBoundingClientRect().bottom };
    });
    assert(caption.small >= 11 && caption.small < caption.large && caption.label === 'normal' && caption.title === 'italic' && caption.gap >= 2,
      'Visual and Explorer should have distinct typographic roles');

    const finish=await page.locator('.tm-explorer-hero').evaluate(hero=>{
      const grain=getComputedStyle(hero.querySelector('.tm-explorer-film-grain'));
      const image=getComputedStyle(hero.querySelector('.tm-explorer-foreground'));
      const moon=getComputedStyle(hero.querySelector('.tm-explorer-moon'));
      const tag=getComputedStyle(hero.querySelector('.tm-explorer-tagline'));
      const sky=hero.querySelector('.tm-explorer-sky'),skyStyle=getComputedStyle(sky);
      return {opacity:Number(grain.opacity),events:grain.pointerEvents,grain:grain.backgroundImage,grainLayer:Number(grain.zIndex),
        foreground:image.filter,moon:moon.filter,type:tag.filter,
        skyEvents:skyStyle.pointerEvents,skyLayer:Number(skyStyle.zIndex),skyHidden:sky.getAttribute('aria-hidden'),
        stars:sky.querySelectorAll('.tm-explorer-star').length,
        trails:sky.querySelectorAll('.tm-explorer-stardust').length,
        skyImages:sky.querySelectorAll('img,canvas,video').length,
        animatedStars:[...sky.querySelectorAll('.tm-explorer-star')].some(el=>getComputedStyle(el).animationName!=='none')};
    });
    assert(finish.opacity>.02&&finish.opacity<.04,'Grain must remain subtle');
    assert.equal(finish.grainLayer,0,'Film grain should stay in the sky behind the lettering and artwork');
    assert.equal(finish.events,'none','Filter intercepts clicks');
    assert(finish.grain.includes('data:image/svg+xml'),'Static grain missing');
    assert(finish.foreground.includes('sepia')&&!finish.foreground.includes('blur'),'Foreground grade not sharp');
    assert(finish.moon.includes('contrast')&&!finish.moon.includes('blur'),'Moon grade not sharp');
    assert.equal(finish.type,'none','Tagline must stay clear');
    assert.equal(finish.skyEvents,'none','Sky should never intercept moon gestures');
    assert.equal(finish.skyLayer,0,'Celestial details must stay behind the scene');
    assert.equal(finish.skyHidden,'true','Decorative sky should be hidden from screen readers');
    assert.equal(finish.stars,14,'Sparse fixed star composition changed');
    assert.equal(finish.trails,2,'Use only two quiet stardust wisps');
    assert.equal(finish.skyImages,0,'Sky must be coded HTML/CSS, not a raster');
    assert.equal(finish.animatedStars,false,'Do not add flashing or distracting stars');

    const still=await angle(page);await wait(page,240);
    assert.equal(await angle(page),still,'Reduced motion must stop rotation');
    const canvas=page.locator('.tm-explorer-moon .tm-lunar-surface');
    assert.equal(await canvas.evaluate(el=>el.tabIndex),-1,'The passive moon surface should not be a keyboard control');
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.locator('.tm-explorer-hero').screenshot({path:`editorial-snapshots/hero-${width}.png`});

    assert.equal(await page.locator('.tm-explorer-motion').count(),0,'Remove the lunar pause control');
    assert.equal(await page.getByRole('button',{name:/(?:pause|resume).*lunar/i}).count(),0);
    const menu = page.getByRole('button',{name:'Open navigation',exact:true});
    const next = page.getByRole('link',{name:'Explore the poster archive',exact:true});
    assert(await next.isVisible(),'Keep the archive link');
    const cursorOf = el => getComputedStyle(el).cursor;
    assert(!/url\(/.test(await menu.evaluate(cursorOf)) && !/url\(/.test(await next.evaluate(cursorOf)),
      'Actionable hero controls should use native cursors');
    await menu.focus();
    await page.keyboard.press('Enter');
    const nav = page.getByRole('navigation',{name:'Portfolio navigation',exact:true});
    assert(await nav.isVisible(),'Navigation failed');
    assert(await nav.evaluate(el => el.contains(document.activeElement)), 'Open navigation should receive keyboard focus');
    assert(!/url\(/.test(await nav.getByRole('link').first().evaluate(cursorOf)), 'Keep link cursors in the open menu');
    assert(!/url\(/.test(await page.locator('.tm-explorer-menu-scrim').evaluate(cursorOf)), 'Keep a native cursor on the open menu scrim');
    await page.keyboard.press('Escape');
    assert(await menu.evaluate(el => document.activeElement === el), 'Escape should return focus to the menu toggle');
    assert.equal(await page.locator('.tm-explorer-nav').count(),0,'Escape failed');
    for(const id of ['home','posters','project','process','about','services','contact-form'])
      assert.equal(await page.locator('#'+id).count(),1,'Section missing: '+id);
    assert.equal(await page.locator('.tm-ma-exhibit').count(),6,'Archive changed');
    assert.equal(await page.locator('.tm-ma-primary-paper img,.tm-ma-secondary-paper img').count(),8,'Original posters changed');
    assert.equal(await page.locator('.tm-hung-study').count(),4,'Case studies changed');
    assert.equal(await page.locator('.tm-hung-clip').count(),8,'Project clips changed');

    if (width === 375 || width === 1440) {
      const sample = await page.evaluate(() => window.lunarGrainSample);
      assert(sample.count > 500 && sample.min > 0 && sample.max <= 1.6 && sample.max - sample.min < .025,
        'Airborne particles should share one tiny diameter: ' + JSON.stringify(sample));
    }

    if (width === 375) {
      const session = await page.context().newCDPSession(page);
      const box = await page.locator('.tm-explorer-moon').boundingBox();
      const from = { x: box.x + box.width * .4, y: box.y + box.height * .38 };
      const beforeSwipe = await angle(page);
      assert(!/url\(/.test(await page.locator('.tm-explorer-hero').evaluate(cursorOf)), 'Touch-only view should use native input');
      await swipe(session, from, { x: from.x + box.width * .22, y: from.y });
      assert.equal(await angle(page), beforeSwipe, 'A horizontal swipe must leave the surface alone');
      await swipe(session, from, { x: from.x, y: from.y - 140 });
      await page.waitForFunction(() => document.querySelector('.tm-explorer-hero').getBoundingClientRect().top < -30);
      await session.detach();
    }

    if(width===1440){
      const dust = page.locator('.tm-lunar-dust');
      assert.equal(await dust.getAttribute('aria-hidden'), 'true');
      assert.equal(await dust.evaluate(el => getComputedStyle(el).pointerEvents), 'none');
      await checkLunarTone(page);
      const reducedDust = await page.evaluate(sampleDust);
      // This fixed viewport and DPR previously painted about 1,400 exterior pixels.
      assert(reducedDust.exterior > 2800, 'The denser particle stream should remain visible beyond the rim');
      const box=await page.locator('.tm-explorer-moon').boundingBox();
      const neutral = await sampleSurface(page, box);
      for (const [side, patch] of Object.entries(neutral)) {
        assert(patch.gaps > .025 && patch.edges > .02,
          `The unlit ${side} rim should break up into individual grains, got ${JSON.stringify(patch)}`);
      }
      const eastShare = reducedDust.rightExterior / reducedDust.exterior;
      assert(eastShare > .32 && eastShare < .68, 'Idle dust should drift from both sides of the moon');
      await page.screenshot({
        path: 'editorial-snapshots/moon-grains-detail.png',
        clip: { x: Math.floor(box.x - .14 * box.width), y: Math.floor(box.y - .08 * box.height),
          width: Math.floor(1.28 * box.width), height: Math.floor(1.09 * box.height) },
      });
      const reducedPoint = {x: Math.round(box.x + box.width * .4), y: Math.round(box.y + box.height * .3)};
      await page.mouse.move(reducedPoint.x, reducedPoint.y);
      await inspectStar(page, reducedPoint);
      await page.mouse.down();
      await page.mouse.move(box.x+box.width*.72,box.y+box.height*.45,{steps:8});
      await page.mouse.up();
      await page.keyboard.press('ArrowRight');
      assert.equal(await angle(page),still,'Pointer, drag and keyboard inputs must not turn the surface');
      assert.deepEqual(await page.evaluate(sampleDust), reducedDust, 'Reduced motion should freeze the grains');
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.waitForFunction(()=>document.querySelector('.tm-explorer-moon')?.dataset.animating==='true');
      const before=await angle(page);await wait(page,900);
      assert(delta(before,await angle(page))>1,'Automatic rotation failed');
      const star = {x: Math.round(box.x + box.width * .89), y: Math.round(box.y + box.height * .30)};
      await page.mouse.move(star.x, star.y);
      await wait(page, 320);
      await inspectStar(page, star, true);
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>document.querySelector('.tm-explorer-moon')?.dataset.animating==='false');
      const stopped=await angle(page), stoppedDust=await page.evaluate(sampleDust);
      await page.mouse.move(box.x+box.width*.3,box.y+box.height*.2);
      await wait(page,250);
      assert.equal(await angle(page),stopped,'Switching to reduced motion should stop rotation');
      assert.deepEqual(await page.evaluate(sampleDust),stoppedDust,'Reduced motion should hold cursor-displaced grains still');
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.waitForFunction(()=>document.querySelector('.tm-explorer-moon')?.dataset.animating==='true');
      await page.locator('#posters').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('.tm-explorer-moon')?.dataset.animating==='false');
      assert(/url\(/.test(await page.locator('#posters').evaluate(cursorOf)), 'The star should continue across portfolio backgrounds');
      assert(!/url\(/.test(await page.locator('.tm-ma-primary-paper').first().evaluate(cursorOf)), 'Keep the original poster action cursor');
      assert(!/url\(/.test(await page.locator('#contact-form input[type="text"]').evaluate(cursorOf)), 'Keep a native text-entry cursor');
      const offscreen=await angle(page);await wait(page,250);
      assert.equal(await angle(page),offscreen,'Offscreen suspension failed');
      await page.getByRole('button',{name:'Open LUMERA case study',exact:true}).click();
      await page.locator('.tm-case-modal').waitFor({state:'visible'});
      await page.keyboard.press('Escape');await page.locator('.tm-case-modal').waitFor({state:'hidden'});
      await page.getByRole('button',{name:'Open Poster Typography case study',exact:true}).click();
      await page.locator('.tm-epok-study-overlay').waitFor({state:'visible'});
      assert.equal(await page.locator('.tm-epok-study-thumbnails button').count(),3,'Grouped posters changed');
      await page.keyboard.press('Escape');await page.locator('.tm-epok-study-overlay').waitFor({state:'hidden'});
      await page.locator('.tm-explorer-hero').scrollIntoViewIfNeeded();
    }
    if (width === 375 || width === 1440) {
      await page.emulateMedia({reducedMotion: 'reduce'});
      await checkChapters(page, width);
    }
    assert.deepEqual(errors,[],'Browser error');
    await page.close();
  }

  const control = await replayParticles(null);
  const opposite = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' };
  for (const side of Object.keys(directions)) {
    const hovered = await replayParticles(side);
    const gain = key => hovered.surface[key].light - control.surface[key].light;
    const direct = gain(side), far = gain(opposite[side]);
    console.log(`Light on ${side}: cursor-facing grains Δ${direct.toFixed(1)}, opposite grains Δ${far.toFixed(1)}`);
    assert.equal(hovered.rotation, control.rotation, 'Cursor position must have no effect on rotation');
    assert(direct > 4 && direct > far + 4, `The light must travel to the ${side} side`);
    const dustGain = key => hovered.end.light[key] - control.end.light[key];
    assert(dustGain(side) > 3 && dustGain(side) > dustGain(opposite[side]) + 3,
      `Airborne grains should catch the light on the ${side} side, got ${JSON.stringify(hovered.end.light)}`);
    assert.notEqual(hovered.end.checksum, control.end.checksum, `Brush motion should displace nearby ${side} dust`);
    for (const key of Object.keys(directions)) {
      assert(Math.abs(hovered.released[key].light - control.released[key].light) < 2,
        `After leaving from ${side}, the ${key} side should return to its neutral light`);
    }
  }

  // Keep a readable black moon without WebGL or web fonts.
  const fallback=await browser.newPage({viewport:{width:1280,height:800}});
  await fallback.route('**/fonts.googleapis.com/**',route=>route.abort());
  await fallback.route('**/fonts.gstatic.com/**',route=>route.abort());
  await fallback.addInitScript(()=>{
    const get=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      return type==='webgl'||type==='webgl2'?null:get.call(this,type,...args);
    };
  });
  await fallback.goto(base,{waitUntil:'networkidle'});
  await waitForHero(fallback);
  await fallback.waitForFunction(()=>document.querySelector('.tm-explorer-moon')?.dataset.renderMode==='fallback');
  assert(await fallback.locator('.tm-retro-moon-fallback').isVisible(),'Moon fallback missing');
  await checkLunarTone(fallback);
  await fallback.waitForFunction(() => document.querySelector('.tm-explorer-moon')?.dataset.animating === 'true');
  assert((await fallback.evaluate(sampleDust)).exterior > 20, 'Dust should work with the CSS fallback');
  assert(await fallback.locator('.tm-explorer-masthead').isVisible(),'Font fallback missing');
  assert.equal(await fallback.locator('.tm-explorer-star').count(),14,'CSS sky should work without WebGL');
  await fallback.screenshot({path:'editorial-snapshots/hero-fallback.png'});
  const fallbackBox = await fallback.locator('.tm-explorer-moon').boundingBox();
  const unlit = await sampleSurface(fallback, fallbackBox);
  for (const side of ['left', 'right']) {
    const [x] = directions[side];
    await fallback.mouse.move(fallbackBox.x + fallbackBox.width * (.5 + .46 * x), fallbackBox.y + fallbackBox.height * .5);
    await wait(fallback, 350);
    const lit = await sampleSurface(fallback, fallbackBox);
    assert(lit[side].light > unlit[side].light + 4, 'The 2D lunar grains should follow the cursor on the ' + side);
  }
  await fallback.close();
  console.log('PASS: responsive proportional lettering, native star cursor, fine lunar grains, cursor lighting on all four sides, neutral light on exit, independent rotation, responsive portfolio and motion preferences.');
}finally{await browser.close();}
