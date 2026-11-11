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
    return [levels[Math.floor(levels.length * .1)], levels[Math.floor(levels.length * .9)]];
  }, png.toString('base64'));
  assert(tone[1] < 95 && tone[1] - tone[0] > 4, 'Expected a charcoal face with visible terrain, got ' + tone);
}

// Read actual dust pixels, including those that have crossed the silhouette.
function sampleDust() {
  const canvas = document.querySelector('.tm-lunar-dust');
  const ctx = canvas.getContext('2d');
  const {width, height} = canvas;
  const moonWidth = document.querySelector('.tm-explorer-moon').getBoundingClientRect().width;
  const rim = width * moonWidth / canvas.getBoundingClientRect().width / 2;
  const rgba = ctx.getImageData(0, 0, width, height).data;
  let exterior = 0, checksum = 2166136261;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const alpha = rgba[4 * (py * width + px) + 3];
      if (!alpha) continue;
      checksum = Math.imul(checksum ^ (py * width + px), 16777619) ^ alpha;
      const dx = px - width / 2, dy = py - height / 2;
      if (dx * dx + dy * dy > rim * rim) exterior++;
    }
  }
  return { exterior, checksum };
}

// Replay the same frames twice so outward travel and cursor deflection can be
// distinguished. Also compare the actual surface at the same rotation angle.
async function replayParticles(hover) {
  const page = await browser.newPage({viewport: {width: 900, height: 700}, reducedMotion: 'reduce'});
  await page.clock.install({time: new Date('2026-01-01T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
  await page.goto(base, {waitUntil: 'networkidle'});
  await page.clock.runFor(80);
  const moon = page.locator('.tm-explorer-moon[data-render-mode="webgl"]');
  const box = await moon.boundingBox();
  assert(box, 'WebGL surface should be ready for particle replay');
  await page.mouse.move(box.x + box.width * (hover ? .95 : -.60), box.y + box.height * .32);
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.clock.runFor(128);
  // Deliver real pointer input after the media query and first draw.
  await page.mouse.move(box.x + box.width * (hover ? .96 : -.61), box.y + box.height * .31);
  const start = await page.evaluate(sampleDust);
  await page.clock.runFor(512);
  const end = await page.evaluate(sampleDust);
  const rotation = await angle(page);
  const face = await page.screenshot({
    clip: {x: Math.floor(box.x + .31 * box.width), y: Math.floor(box.y + .26 * box.height),
      width: Math.floor(.25 * box.width), height: Math.floor(.22 * box.height)},
    style: '.tm-lunar-dust { visibility: hidden !important; }',
  });
  await page.close();
  assert(end.exterior > 20 && end.checksum !== start.checksum, 'Dust should travel beyond the moon rim');
  return { rotation, face, end };
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

try {
  for (const [width,height] of sizes) {
    const page = await browser.newPage({viewport:{width,height},reducedMotion:'reduce',deviceScaleFactor:1,hasTouch:width===375});
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
        const top=new DOMPoint(-m.actualBoundingBoxLeft,-m.actualBoundingBoxAscent).matrixTransform(matrix);
        const bottom=new DOMPoint(m.actualBoundingBoxRight,m.actualBoundingBoxDescent).matrixTransform(matrix);
        return {letter:el.textContent,x:top.x,y:top.y,right:bottom.x,bottom:bottom.y,width:bottom.x-top.x,height:bottom.y-top.y};
      });
      const m=document.querySelector('.tm-explorer-moon').getBoundingClientRect();
      return {letters,clips:svg.querySelectorAll('clipPath').length,moon:{x:m.x,y:m.y,width:m.width}};
    });
    assert.equal(typography.clips,0,'Do not clip letters');
    assert.equal(typography.letters.map(l=>l.letter).join(''),'TUMANEEN');
    const tops=typography.letters.map(l=>l.y);
    assert(Math.max(...tops)-Math.min(...tops)<2,'Visible cap tops must align');
    const radius=typography.moon.width/2,cx=typography.moon.x+radius,cy=typography.moon.y+radius;
    typography.letters.forEach((l,i)=>{
      assert(l.width>8&&l.height>20,'Collapsed letter');
      assert(l.x>=0&&l.right<=width&&l.y>=0,'Letter cropped by viewport');
      if(i)assert(l.x-typography.letters[i-1].right>1,'Letters touch');
      const dx=Math.abs(Math.min(l.right,Math.max(l.x,cx))-cx);
      if(dx<radius)assert(l.bottom<cy-Math.sqrt(radius*radius-dx*dx)-2,'Moon obscures a letter');
    });
    assert(typography.letters[0].height>typography.letters[3].height,'Serif headline must retain the editorial arch');

    const finish=await page.locator('.tm-explorer-hero').evaluate(hero=>{
      const grain=getComputedStyle(hero.querySelector('.tm-explorer-film-grain'));
      const image=getComputedStyle(hero.querySelector('.tm-explorer-foreground'));
      const moon=getComputedStyle(hero.querySelector('.tm-explorer-moon'));
      const tag=getComputedStyle(hero.querySelector('.tm-explorer-tagline'));
      const sky=hero.querySelector('.tm-explorer-sky'),skyStyle=getComputedStyle(sky);
      return {opacity:Number(grain.opacity),events:grain.pointerEvents,grain:grain.backgroundImage,grainLayer:Number(grain.zIndex),
        foreground:image.filter,moon:moon.filter,type:tag.filter,
        lineHeight:parseFloat(tag.lineHeight)/parseFloat(tag.fontSize),
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
    assert(finish.lineHeight>=1,'Tagline lines are cramped');
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

    await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    assert(await page.getByRole('navigation',{name:'Portfolio navigation',exact:true}).isVisible(),'Navigation failed');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.tm-explorer-nav').count(),0,'Escape failed');
    for(const id of ['home','posters','project','process','about','services','contact-form'])
      assert.equal(await page.locator('#'+id).count(),1,'Section missing: '+id);
    assert.equal(await page.locator('.tm-ma-exhibit').count(),6,'Archive changed');
    assert.equal(await page.locator('.tm-ma-primary-paper img,.tm-ma-secondary-paper img').count(),8,'Original posters changed');
    assert.equal(await page.locator('.tm-hung-study').count(),4,'Case studies changed');
    assert.equal(await page.locator('.tm-hung-clip').count(),8,'Project clips changed');

    if (width === 375) {
      const session = await page.context().newCDPSession(page);
      const box = await canvas.boundingBox();
      const from = { x: box.x + box.width * .4, y: box.y + box.height * .38 };
      const beforeSwipe = await angle(page);
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
      assert(reducedDust.exterior > 20, 'Reduced motion should show a still dust field');
      const box=await canvas.boundingBox();
      await page.mouse.move(box.x+box.width*.4,box.y+box.height*.3);
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
      await page.mouse.move(box.x + box.width * .96, box.y + box.height * .31);
      await wait(page, 320);
      await page.screenshot({ path:'editorial-snapshots/hero-1440-dust.png' });
      await page.getByRole('button',{name:/Pause lunar animation/i}).click();
      const stopped=await angle(page), stoppedDust=await page.evaluate(sampleDust);
      await page.mouse.move(box.x+box.width*.3,box.y+box.height*.2);
      await wait(page,250);
      assert.equal(await angle(page),stopped,'Pause should stop rotation');
      assert.deepEqual(await page.evaluate(sampleDust),stoppedDust,'Paused dust should stay still as the pointer moves');
      await page.getByRole('button',{name:/Resume lunar animation/i}).click();
      await page.locator('#posters').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('.tm-explorer-moon')?.dataset.animating==='false');
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
    assert.deepEqual(errors,[],'Browser error');
    await page.close();
  }

  const control = await replayParticles(false);
  const hovered = await replayParticles(true);
  assert.equal(control.rotation, hovered.rotation, 'The same 48-second spin should run independently of pointer position');
  assert(control.face.equals(hovered.face), 'Cursor movement must not turn or tilt the visible lunar surface');
  assert.notEqual(control.end.checksum, hovered.end.checksum, 'Pointer proximity should displace the dust');

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
  await fallback.close();
  console.log('PASS: black textured moon, outward and cursor-reactive dust, independent rotation, touch scrolling, motion preferences, eight viewport sizes and original portfolio.');
}finally{await browser.close();}
