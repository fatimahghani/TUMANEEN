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
      .tm-lunar-dust, .tm-explorer-foreground, .tm-explorer-tagline, .tm-comet-cursor { visibility: hidden !important; }
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
  // Chromium delivers the media-change event asynchronously. Begin at the first
  // moving frame, so the renderer starts at the same longitude in every replay.
  let firstAngle = 0;
  for (let frame = 0; frame < 60 && firstAngle === 0; frame++) {
    await page.clock.runFor(16);
    firstAngle = await angle(page);
  }
  assert(firstAngle > 0 && firstAngle <= .13, 'Replay must begin on the first 16ms rotation step');
  if (side) {
    const [x, y] = directions[side];
    await page.mouse.move(box.x + box.width * (.5 + .46 * x), box.y + box.height * (.5 + .46 * y));
  } else {
    await page.mouse.move(-4, -4);
  }
  const start = await page.evaluate(sampleDust);
  await page.clock.runFor(640);
  const end = await page.evaluate(sampleDust);
  const rotation = delta(firstAngle, await angle(page));
  assert(Math.abs(rotation - 4.8) < .002, 'A 640ms replay must advance the 48-second spin by 4.8 degrees');
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

// Advance real pointer events on a fixed clock to capture the rendered trail
// mid-flight. A slow software GPU must not decide when the trail has expired.
async function checkComet() {
  const page = await browser.newPage({viewport: {width: 1440, height: 900}});
  await page.clock.install({time: new Date('2026-01-01T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
  await page.goto(base, {waitUntil: 'networkidle'});
  await page.clock.runFor(80);
  const moon = await page.locator('.tm-explorer-moon[data-render-mode="webgl"]').boundingBox();
  const overlay = page.locator('.tm-comet-cursor');
  const head = overlay.locator('.tm-comet-head');
  const path = overlay.locator('.tm-comet-trail');
  const getShape = () => path.evaluate(el => el.getAttribute('d') || '');
  const bounds = () => head.evaluate(el => {
    const r = el.getBoundingClientRect();
    return {x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width};
  });
  const start = {x: Math.round(moon.x + .66 * moon.width), y: Math.round(moon.y + .49 * moon.height)};
  const end = {x: Math.round(moon.x + .84 * moon.width), y: Math.round(moon.y + .28 * moon.height)};
  await page.mouse.move(start.x, start.y);
  await page.clock.runFor(480);
  assert.equal(await overlay.getAttribute('data-visible'), 'true', 'A fine-pointer move should reveal the comet');
  assert.equal(await overlay.evaluate(el => getComputedStyle(el).pointerEvents), 'none');
  assert.equal(await overlay.getAttribute('aria-hidden'), 'true');
  const normal = await bounds();
  assert(normal.width >= 7 && normal.width <= 10, 'The glowing cursor head should be a small dot');
  assert(Math.hypot(start.x - normal.x, start.y - normal.y) < 2, 'The head should settle on the actual pointer');

  for (let step = 1; step <= 6; step++) {
    const t = step / 6;
    await page.mouse.move(Math.round(start.x + t * (end.x - start.x)),
      Math.round(start.y + t * (end.y - start.y) - 18 * Math.sin(Math.PI * t)));
    await page.clock.runFor(16);
  }
  const moving = await bounds(), ribbon = await getShape();
  assert(moving.x > start.x && moving.x < end.x - 1, 'The comet should ease behind the moving pointer');
  assert(ribbon && await path.evaluate(el => el.getTotalLength() > 12), 'Movement should leave a visible tapered path');
  await page.screenshot({path: 'editorial-snapshots/hero-1440-comet.png'});
  await page.clock.runFor(800);
  const settled = await bounds();
  assert(Math.hypot(end.x - settled.x, end.y - settled.y) < 2, 'The head should catch up at rest');
  assert.equal(await getShape(), '', 'The moving ribbon should disappear after its short lifetime');

  const menu = page.getByRole('button',{name:'Open navigation',exact:true});
  const menuBox = await menu.boundingBox();
  await page.mouse.move(menuBox.x + menuBox.width / 2, menuBox.y + menuBox.height / 2);
  await page.clock.runFor(480);
  assert.equal(await overlay.getAttribute('data-hover'), 'true', 'Links and buttons should switch to the ring');
  await head.evaluate(el => el.getAnimations().forEach(animation => animation.finish()));
  const ring = await bounds();
  assert(ring.width >= 38 && ring.width <= 42, 'The active control cursor should expand to a 40px ring');
  assert.equal(await head.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'The ring center should be open');

  await page.keyboard.press('Shift');
  assert.equal(await overlay.getAttribute('data-visible'), 'false', 'Keyboard navigation should hide the decorative pointer');
  await page.mouse.move(start.x, start.y);
  await page.clock.runFor(32);
  assert.equal(await overlay.getAttribute('data-visible'), 'true', 'A mouse move should restore the comet');
  await page.mouse.move(-4, -4);
  assert.equal(await page.locator('html[data-tm-comet-active]').count(), 0, 'Leaving the page should restore the native cursor');

  const field = page.locator('#contact-form input[type="text"]');
  await field.evaluate(el => el.scrollIntoView({block: 'center', behavior: 'instant'}));
  const fieldBox = await field.boundingBox();
  await page.mouse.move(fieldBox.x + fieldBox.width / 2, fieldBox.y + fieldBox.height / 2);
  await page.clock.runFor(320);
  assert(['auto', 'text'].includes(await field.evaluate(el => getComputedStyle(el).cursor)), 'Keep native text editing');
  assert.equal(await overlay.getAttribute('data-visible'),'false','Hide the comet inside editable fields');
  await page.close();
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

// Scroll the document itself. The project boundary is measured afresh because
// changing the motion preference can change the gallery's section height.
async function seekHeroScroll(page, fraction) {
  await page.locator('#project').evaluate(async (project, progress) => {
    let stable = 0;
    const deadline = performance.now() + 5000;
    do {
      const boundary = scrollY + project.getBoundingClientRect().top;
      const destination = Math.round(boundary * progress);
      if (Math.abs(scrollY - destination) > 1) {
        stable = 0;
        window.scrollTo({top:destination, behavior:'instant'});
      } else stable++;
      await new Promise(resolve => requestAnimationFrame(resolve));
    } while (stable < 3 && performance.now() < deadline);
    if (stable < 3) throw new Error('Moon capture could not settle at ' + progress + ' of the cover');
  }, fraction);
}

async function checkLunarScroll(page, width) {
  const project = page.locator('#project');
  const moon = page.locator('.tm-explorer-moon');
  const orbit = project.locator('canvas.tm-lunar-orbit');
  const height = page.viewportSize().height;
  const body = () => moon.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return {x:rect.x + rect.width / 2, y:rect.y + rect.height / 2, diameter:rect.width,
      projectTop:document.querySelector('#project').getBoundingClientRect().top, scroll:scrollY,
      overflow:document.documentElement.scrollWidth - innerWidth};
  });
  // Measure pixels actually painted into the gallery decoration, including
  // sparse, antialiased grains. A canvas that is sized but blank has zero span.
  const footprint = () => orbit.evaluate(canvas => {
    const thumb = document.createElement('canvas');
    thumb.width = 300;
    thumb.height = Math.max(1, Math.round(300 * canvas.height / Math.max(1, canvas.width)));
    const ctx = thumb.getContext('2d');
    if (canvas.width && canvas.height) ctx.drawImage(canvas, 0, 0, thumb.width, thumb.height);
    const rgba = ctx.getImageData(0, 0, thumb.width, thumb.height).data;
    let count = 0, left = thumb.width, right = -1;
    for (let i = 3; i < rgba.length; i += 4) {
      if (rgba[i] < 3) continue;
      const x = ((i - 3) / 4) % thumb.width;
      left = Math.min(left, x);
      right = Math.max(right, x);
      count++;
    }
    return {count, span:Math.max(0, right-left+1)/thumb.width};
  });
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('#project[data-gallery-mode="pinned"]').waitFor();
  await page.mouse.move(-4, -4);
  const positions = [], paint = [];
  for (let frame = 0; frame <= 21; frame++) {
    await seekHeroScroll(page, frame / 21);
    positions.push(await body());
    if (frame >= 10) paint.push(await footprint());
    if (width === 1440 || [7,12,21].includes(frame)) {
      const prefix = width === 1440 ? 'lunar-scroll' : 'lunar-phone';
      await page.screenshot({path:`editorial-snapshots/${prefix}-${String(frame).padStart(2,'0')}.png`});
    }
  }
  const origin = positions[0], moving = positions[7], full = paint.at(-1);
  assert(moving.x > origin.x + width*.04 && moving.y > origin.y + height*.015 && moving.diameter < origin.diameter,
    'The same moon must shrink and move lower-right in the viewport: ' + JSON.stringify({origin,moving}));
  assert(positions.slice(7,14).some(p => p.x > width*.60 && p.y > height*.60 && p.y > p.projectTop),
    'The lower-right moon must cross the visible boundary into Projects');
  assert(positions.every(p => p.overflow <= 2), 'Lunar travel must stay inside the page width');
  assert(full.count > 100 && full.span > .48 && paint.some(p => p.count > 5 && p.span < full.span*.88),
    'A compact field of visible grains must spread into a wide composition: ' + JSON.stringify(paint));
  await seekProjectGallery(project, .65);
  assert((await footprint()).span >= full.span*.95, 'The finished lunar shape must persist behind the moving gallery');
  const reachable = await project.locator('.tm-hung-paper').evaluateAll(covers =>
    covers.some(cover => {
      const box = cover.getBoundingClientRect();
      const hit = document.elementFromPoint(box.x + box.width/2, box.y + box.height/2);
      return hit && cover.contains(hit);
    }));
  assert(reachable, 'The lunar background must leave the framed projects clickable');
  await seekHeroScroll(page, 7/21);
  const reverse = await body();
  assert(Math.abs(moving.x-reverse.x) < 3 && Math.abs(moving.y-reverse.y) < 3,
    'Scrolling back must retrace the lunar path');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#project[data-gallery-mode="native"]').waitFor();
  await seekHeroScroll(page, 7/21);
  const still = await body();
  assert(Math.abs(still.x-origin.x) < 3 && Math.abs(still.y+still.scroll-origin.y) < 3,
    'Reduced motion should leave the moon in its original cover position: ' + JSON.stringify({origin,still}));
  await seekHeroScroll(page, 1);
  const staticArt = await footprint();
  assert(staticArt.count > 100 && staticArt.span > .48, 'Reduced motion should show the completed gallery artwork');
}

async function seekProjectGallery(section, fraction) {
  const state = await section.evaluate(async (el, progress) => {
    const track = el.querySelector('.tm-hung-strip');
    const aperture = el.querySelector('.tm-hung-window');
    const first = el.querySelector('.tm-hung-paper');
    const sample = () => {
      const sectionTop = el.getBoundingClientRect().top;
      const travel = track.scrollWidth - aperture.clientWidth;
      const offset = Math.min(travel, Math.max(0, travel * progress));
      const transform = getComputedStyle(track).transform;
      return {sectionTop, pageY:scrollY, targetY:scrollY + sectionTop + travel * progress,
        travel, expectedOffset:offset, trackX:new DOMMatrixReadOnly(transform === 'none' ? undefined : transform).m41,
        transform, first:first.getBoundingClientRect().left, expectedFirst:aperture.getBoundingClientRect().left - offset};
    };
    let reading = sample(), targetY = reading.targetY, stableFrames = 0;
    window.scrollTo({top:targetY, behavior:'instant'});
    const deadline = performance.now() + 5000;
    do {
      await new Promise(resolve => requestAnimationFrame(resolve));
      reading = sample();
      // Layout shifts can move either the rail or the browser's scroll anchor.
      if (Math.abs(reading.targetY - targetY) > 1 || Math.abs(reading.pageY - reading.targetY) >= 1.1) {
        targetY = reading.targetY;
        window.scrollTo({top:targetY, behavior:'instant'});
      }
      const atTarget = Math.abs(reading.pageY - targetY) < 1.1 &&
        Math.abs(reading.trackX + reading.expectedOffset) < 2 &&
        Math.abs(reading.first - reading.expectedFirst) < 4;
      stableFrames = atTarget ? stableFrames + 1 : 0;
    } while (stableFrames < 3 && performance.now() < deadline);
    return {...reading, stableFrames};
  }, fraction);
  assert.equal(state.stableFrames, 3, `Project gallery failed to settle at ${fraction}: ${JSON.stringify(state)}`);
  return state;
}

async function checkGalleryFocus(target) {
  const state = await target.evaluate(async button => {
    const section = document.querySelector('#project');
    const track = section.querySelector('.tm-hung-strip');
    const label = el => el?.getAttribute('aria-label') || el?.textContent?.trim().slice(0, 80) || el?.tagName;
    const deadline = performance.now() + 5000;
    let result, stableFrames = 0;
    do {
      await new Promise(resolve => requestAnimationFrame(resolve));
      const rect = button.getBoundingClientRect();
      const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
      const focused = document.activeElement === button;
      const aperture = section.querySelector('.tm-hung-window').getBoundingClientRect();
      const inRail = !track.contains(button) || (x >= aperture.left && x <= aperture.right);
      stableFrames = focused && inRail && x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight ? stableFrames + 1 : 0;
      result = {intended:label(button), active:label(document.activeElement), rect:rect.toJSON(), aperture:aperture.toJSON(),
        trackScrollLeft:track.scrollLeft, sectionTop:section.getBoundingClientRect().top, scrollY, stableFrames};
    } while (stableFrames < 3 && performance.now() < deadline);
    return result;
  });
  assert.equal(state.stableFrames, 3, `Keyboard focus must reach the visible gallery control: ${JSON.stringify(state)}`);
}

async function checkProjectInk(covers) {
  assert.equal(await covers.count(), 4, 'Each of the four project covers needs an ink frame');
  const frames = await covers.evaluateAll(buttons => Promise.all(buttons.map(async button => {
    const overlay = getComputedStyle(button, '::after');
    const url = overlay.maskImage.match(/^url\("(.+)"\)$/)?.[1];
    if (!url || overlay.content === 'none' || overlay.pointerEvents !== 'none') {
      throw new Error('Missing passive ink frame on ' + button.getAttribute('aria-label'));
    }
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, 128, 128);
    const alpha = ctx.getImageData(0, 0, 128, 128).data;
    let rim = 0, interior = 0;
    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        const inset = Math.min(x, y, 127 - x, 127 - y);
        if (alpha[(y * 128 + x) * 4 + 3] > 25) {
          if (inset < 22) rim++;
          else interior++;
        }
      }
    }
    return { rim, interior, artworkFit: getComputedStyle(button.querySelector('img')).objectFit };
  })));
  assert(frames.every(frame => frame.rim > 80 && frame.interior < 20 && frame.artworkFit === 'contain'),
    'Ink should surround each cover and leave its artwork clear: ' + JSON.stringify(frames));
}

async function checkProjectGallery(page, width) {
  await page.emulateMedia({reducedMotion:'no-preference'});
  const section = page.locator('#project');
  const stage = section.locator('.tm-hung-shell');
  const covers = section.locator('.tm-hung-paper');
  await page.locator('#project[data-gallery-mode="pinned"]').waitFor();
  await page.evaluate(() => window.scrollTo({top:0, behavior:'instant'}));
  await page.getByRole('link',{name:'Explore selected projects',exact:true}).focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => {
    const project = document.querySelector('#project');
    return Math.abs(project.getBoundingClientRect().top) < 2 &&
      !project.closest('.section-reveal-active') && !document.querySelector('.tm-page-turn-flash');
  });
  const {travel} = await seekProjectGallery(section, 0);
  await checkProjectInk(covers);
  assert(travel > 150, 'The gallery must have real horizontal travel');
  const seek = fraction => seekProjectGallery(section, fraction);
  let initial;
  for (const [name, fraction] of [['start',0],['middle',.5],['end',1]]) {
    const settled = await seek(fraction);
    const frame = await stage.evaluate(async el => {
      const view = el.querySelector('.tm-hung-window').getBoundingClientRect();
      const sheets = [...el.querySelectorAll('.tm-hung-paper')];
      const visible = sheets.filter(sheet => {
        const b = sheet.getBoundingClientRect();
        return b.right > view.left && b.left < view.right;
      });
      await Promise.all(visible.map(sheet => sheet.querySelector('img').decode()));
      return {top:el.getBoundingClientRect().top, first:sheets[0].getBoundingClientRect().left,
        last:sheets.at(-1).getBoundingClientRect().right, left:view.left, right:view.right,
        bodyOverflow:document.documentElement.scrollWidth-innerWidth};
    });
    if (!initial) initial = frame;
    assert(Math.abs(frame.top-initial.top) < 3, 'The gallery stage must stay pinned while the sheets advance');
    assert(Math.abs((initial.first-frame.first) - settled.travel*fraction) < 4,
      `The sheets must move horizontally with page scroll: ${JSON.stringify({initialFirst:initial.first, frameFirst:frame.first, ...settled})}`);
    assert(frame.bodyOverflow <= 2, 'The gallery should never widen the document');
    if (fraction === 0) assert(Math.abs(frame.first-frame.left) < 4, 'First case study should start at the gallery edge');
    if (fraction === 1) assert(Math.abs(frame.last-frame.right) < 4, 'Last case study should finish at the gallery edge');
    await page.screenshot({path:`editorial-snapshots/projects-${width}-${name}.png`, animations:'disabled'});
    if (fraction === 0) {
      await section.locator('.tm-hung-study').first().screenshot({
        path:`editorial-snapshots/project-ink-${width}.png`, animations:'disabled',
      });
    }
  }
  if (width === 1440) {
    for (let frame = 0; frame <= 24; frame++) {
      await seek(frame / 24);
      const number = String(frame).padStart(2, '0');
      await page.screenshot({path:`editorial-snapshots/projects-scroll-${number}.png`, animations:'disabled'});
    }
  }
  const posters = page.locator('#posters');
  await seek(1 + page.viewportSize().height * .6 / travel);
  assert((await posters.boundingBox()).y < page.viewportSize().height * .6, 'Scrolling past the last project must reveal Posters');

  await seek(0);
  const firstCover = section.getByRole('button',{name:'Open LUMERA case study',exact:true});
  const lastCover = section.getByRole('button',{name:'Open Poster Typography case study',exact:true});
  await firstCover.focus();
  await page.keyboard.press('Enter');
  const caseStudy = page.locator('.tm-case-modal');
  await caseStudy.waitFor({state:'visible'});
  await page.keyboard.press('Escape');
  await caseStudy.waitFor({state:'hidden'});
  await page.waitForFunction(() => document.activeElement === document.querySelector('#project .tm-hung-paper'));
  await page.keyboard.press('End');
  assert(await lastCover.evaluate(el => el === document.activeElement), 'End should focus the last project');
  await page.waitForFunction(() => {
    const last = document.querySelector('#project .tm-hung-study:last-child button').getBoundingClientRect();
    return last.x >= -1 && last.right <= innerWidth + 1;
  });
  await page.keyboard.press('Enter');
  const posterStudy = page.locator('.tm-epok-study-overlay');
  await posterStudy.waitFor({state:'visible'});
  const thumbs = posterStudy.locator('.tm-epok-study-thumbnails button');
  assert.equal(await thumbs.count(),3,'Grouped posters changed');
  await page.keyboard.press('ArrowRight');
  assert.equal(await thumbs.nth(1).getAttribute('aria-pressed'),'true','The next poster plate must open with the keyboard');
  await page.keyboard.press('Escape');
  await posterStudy.waitFor({state:'hidden'});
  await checkGalleryFocus(lastCover);

  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#project[data-gallery-mode="native"]').waitFor();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#project .tm-hung-strip')).transform === 'none');
  assert.notEqual(await stage.evaluate(el => getComputedStyle(el).position), 'sticky', 'Reduced motion should release the gallery');
  await checkGalleryFocus(lastCover);
  await page.keyboard.press('Home');
  for (const cover of await covers.all()) {
    await checkGalleryFocus(cover);
    // The title button follows its cover and precedes the next study in tab order.
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
  }
  const indexButton = section.getByRole('button',{name:/view index/i});
  await checkGalleryFocus(indexButton);
  await page.keyboard.press('Enter');
  const index = page.locator('.tm-epok-overlay[role="dialog"]');
  await index.waitFor({state:'visible'});
  assert.equal(await index.locator('.tm-epok-index-row').count(),4,'The index should include all four studies');
  await page.keyboard.press('Tab');
  assert(await index.locator('.tm-epok-index-row').first().evaluate(el => el === document.activeElement), 'Tab should reach the first index entry');
  await page.keyboard.press('Escape');
  await index.waitFor({state:'hidden'});
  await checkGalleryFocus(indexButton);
}

// Run real gestures last. Touch momentum can continue moving the page after
// touchEnd and must not carry over into exact capture positions or keyboard tests.
async function checkProjectScrollInput(page, width) {
  await page.emulateMedia({reducedMotion:'no-preference'});
  const section = page.locator('#project[data-gallery-mode="pinned"]');
  await section.waitFor();
  // Begin inside the pinned section so the gesture measures horizontal motion.
  const start = await seekProjectGallery(section, 0.1);
  const {height} = page.viewportSize();
  if (width === 375) {
    const touch = await page.context().newCDPSession(page);
    await swipe(touch, {x:width/2,y:height*.65}, {x:width/2,y:height*.47});
    await touch.detach();
  } else {
    await page.mouse.move(width/2, height*.6);
    await page.mouse.wheel(0, 160);
  }
  await page.waitForFunction(({first, pageY}) =>
    scrollY > pageY + 20 && document.querySelector('#project .tm-hung-paper').getBoundingClientRect().left < first - 20, start);
}

async function checkChapters(page, width) {
  const paper = 'rgb(241, 226, 206)';
  const surface = await page.locator('.tm-explorer-hero').evaluate(hero => {
    const style = getComputedStyle(hero);
    return {color:style.backgroundColor, grain:style.backgroundImage, size:style.backgroundSize, repeat:style.backgroundRepeat};
  });
  assert.equal(surface.color, paper, 'The cover should establish the warm paper color');
  assert(surface.grain.includes('data:image/svg+xml'), 'The paper should have a fine printed grain');
  const chapters = ['project', 'posters', 'process', 'about', 'services', 'contact-form'];
  const orbitSources = new Set();
  for (const id of chapters) {
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
      const style = getComputedStyle(el);
      const background = style.backgroundColor;
      const contrast = (foreground, surface) => {
        const a = tone(surface), b = tone(foreground, surface);
        return (Math.max(a,b) + .05) / (Math.min(a,b) + .05);
      };
      const selectedService = el.querySelector('.tm-service-card[data-selected="true"]');
      const serviceSummary = selectedService?.querySelector('.tm-service-summary');
      const backgroundLayer = el.id === 'process' ? el.querySelector('.sticky') : el;
      const orbitStyle = getComputedStyle(backgroundLayer, '::before');
      const headings = [...el.querySelectorAll('h2,h3')].filter(title => title.getClientRects().length);
      return {surface:{color:background, grain:style.backgroundImage, size:style.backgroundSize, repeat:style.backgroundRepeat},
        contrast:contrast(getComputedStyle(heading).color, background), font:getComputedStyle(heading).fontFamily,
        titleSize:parseFloat(getComputedStyle(heading).fontSize),
        h2Count:headings.filter(title => title.tagName === 'H2').length,
        largestHeading:Math.max(...headings.map(title => parseFloat(getComputedStyle(title).fontSize))),
        summaryContrast:serviceSummary ? contrast(getComputedStyle(serviceSummary).color, getComputedStyle(selectedService).backgroundColor) : null,
        orbitImage:orbitStyle.backgroundImage, orbitVisible:orbitStyle.content !== 'none' && Number(orbitStyle.opacity) > 0,
        orbitEvents:orbitStyle.pointerEvents,
        left: bounds.left, right: bounds.right, overflow: document.documentElement.scrollWidth - innerWidth};
    });
    assert.deepEqual(presentation.surface, surface, id + ' must share the cover paper, grain and tile scale');
    assert.equal(presentation.h2Count, 1, id + ' should have one visible section heading');
    assert(presentation.titleSize >= 24 && presentation.largestHeading <= 32.1,
      id + ' heading sizes should be readable and restrained: ' + JSON.stringify(presentation));
    assert(presentation.font.includes('Bodoni Moda'), id + ' chapter typography');
    assert(presentation.contrast >= 4.5, id + ' chapter heading should be readable against the paper');
    if (id === 'services') assert(presentation.summaryContrast >= 4.5, 'The selected service description must be readable');
    if (id !== 'project') {
      const orbit = presentation.orbitImage.match(/url\("([^"]*lunar-paper-[^"]+)"\)/);
      assert(orbit && presentation.orbitVisible && presentation.orbitEvents === 'none',
        id + ' should have a visible, passive lunar backdrop');
      orbitSources.add(orbit[1]);
    }
    assert(presentation.left >= -1 && presentation.right <= width + 1 && presentation.overflow <= 2,
      id + ' must fit the viewport');
    await page.screenshot({path: `editorial-snapshots/chapter-${width}-${id}.png`, animations: 'disabled'});
  }
  await page.evaluate(async sources => {
    for (const url of sources) {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (!image.naturalWidth) throw new Error('Empty lunar artwork: ' + url);
    }
  }, [...orbitSources]);

  assert.deepEqual(await page.locator('.tm-process-card').evaluateAll(cards =>
    cards.map(card => card.querySelectorAll('p').length)), [1,1,1,1,1],
    'Each process step should have one short description');
  assert.equal(await page.locator('#about p').count(), 1, 'The designer bio should be one paragraph');
  assert.equal(await page.locator('.tm-service-card .tm-service-summary').count(), 4,
    'Each design service should have a single summary');

  const form = page.locator('#contact-form form');
  await page.getByRole('button', {name:'Inquire about Packaging Design'}).click();
  assert.equal(await form.getByRole('button', {name:'Packaging', exact:true}).getAttribute('aria-pressed'), 'true',
    'The project form should select the service the visitor chose');
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
  let brushAtlasUrl;
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
    assert(layout.font.includes('Tumaneen Brush'),'Use the hand-painted TUMANEEN lettering');
    assert.equal(layout.weight,'400','Optical fitting should measure the actual display cut');
    assert(await page.evaluate(() => [...document.fonts].some(face =>
      face.family.includes('Tumaneen Brush') && face.status === 'loaded')), 'The local masthead font must load');

    // Inspect visible ink in the chosen weight, not a larger font line box.
    await page.waitForSelector('.tm-explorer-masthead[data-paint-ready="true"]');
    const typography=await page.locator('.tm-explorer-masthead').evaluate(svg=>{
      const ctx=document.createElement('canvas').getContext('2d');
      const patterns = [...svg.querySelectorAll('pattern')];
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
          baseline, scaleX:matrix.a, scaleY:matrix.d, ascent:m.actualBoundingBoxAscent, descent:m.actualBoundingBoxDescent,
          paintId: style.fill.match(/url\(["']?[^)"']*#([^)"']+)["']?\)/)?.[1]};
      });
      const m=document.querySelector('.tm-explorer-moon').getBoundingClientRect();
      const menu=document.querySelector('.tm-explorer-menu-button').getBoundingClientRect();
      const atlas = svg.querySelector('image')?.href.baseVal;
      return {letters,clips:svg.querySelectorAll('clipPath').length,moon:{x:m.x,y:m.y,width:m.width},
        heading:svg.getBoundingClientRect().toJSON(), menu:{right:menu.right, bottom:menu.bottom},
        patternIds: patterns.filter(p => p.querySelector('image, use')).map(p => p.id),
        atlasUrl: atlas && new URL(atlas, document.baseURI).href};
    });
    assert.equal(typography.clips,0,'Do not clip letters');
    assert.equal(typography.letters.map(l=>l.letter).join(''),'TUMANEEN');
    const paintByLetter = new Map(typography.letters.map(l => [l.letter, l.paintId]));
    assert.equal(new Set(typography.patternIds).size, 6, 'Each distinct capital needs its own brush tile');
    assert.deepEqual(new Set(paintByLetter.values()), new Set(typography.patternIds), 'Every brush tile must paint live type');
    assert(typography.letters.every(l => l.paintId === paintByLetter.get(l.letter)), 'Repeated capitals must use the matching tile');
    assert(typography.atlasUrl, 'The SVG must reference the painted atlas');
    brushAtlasUrl = typography.atlasUrl;
    const narrow = portrait && width <= 600;
    const lines = narrow
      ? [typography.letters.slice(0, 4), typography.letters.slice(4)]
      : [typography.letters];
    const inkWidths = lines.map(line => line.at(-1).right - line[0].x);
    // Recover the natural row width in font units and measure its height from the ink.
    const nativeWidth = Math.max(...lines.map((line, i) => inkWidths[i] / line[0].scaleX));
    const capHeight = Math.max(...lines.map(line => Math.max(...line.map(l => l.ascent)) + Math.max(...line.map(l => l.descent))));
    const nativeHeight = capHeight * lines.length + 9 * (lines.length - 1);
    const heading = typography.heading;
    const clearance = Math.min(26, Math.max(11, heading.width * .024));
    const availableHeight = Math.min(heading.height, typography.moon.y - heading.top - clearance);
    const widthFit = heading.width / nativeWidth;
    const expectedY = Math.min(widthFit, availableHeight / nativeHeight);
    const expectedExpansion = Math.min(1.60, widthFit / expectedY);
    if (width === 1440 || width === 375) {
      assert(inkWidths[0] >= width * (width === 1440 ? .82 : .72),
        `The first row at ${width}px should fill the cover (actual ink width: ${inkWidths[0].toFixed(1)}px)`);
    }
    const radius=typography.moon.width/2,cx=typography.moon.x+radius,cy=typography.moon.y+radius;
    for (const line of lines) {
      const baselines = line.map(letter => letter.baseline);
      assert(Math.max(...baselines) - Math.min(...baselines) < 2, 'Each line should share a baseline');
      line.forEach((letter, i) => {
        assert(letter.width > 8 && letter.height > 20 && Math.abs(letter.scaleY - expectedY) < .02,
          'Widening the glyphs should preserve their fitted height above the moon');
        assert(Math.abs(letter.scaleX / letter.scaleY - expectedExpansion) < .02,
          'Each glyph should use the available width up to the 1.60 expansion limit');
        assert(letter.x >= 0 && letter.right <= width && letter.y >= 0, 'Letter cropped by viewport');
        assert(letter.x >= typography.menu.right || letter.y >= typography.menu.bottom,
          'Lettering must clear the navigation button');
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
      const small = getComputedStyle(label), large = getComputedStyle(title);
      return { label: label.innerText, sameFamily: small.fontFamily === large.fontFamily && large.fontFamily.includes('Baskerville'),
        bothItalic: small.fontStyle === 'italic' && large.fontStyle === 'italic',
        regularWeight: small.fontWeight === '400' && large.fontWeight === '400',
        small: parseFloat(small.fontSize), large: parseFloat(large.fontSize),
        gap: title.getBoundingClientRect().top - label.getBoundingClientRect().bottom };
    });
    assert(caption.label === 'Visual' && caption.sameFamily && caption.bothItalic && caption.regularWeight,
      'Visual and Explorer should share the existing regular-weight italic serif, with Visual in title case');
    assert(caption.small >= 11 && caption.small < caption.large && caption.gap >= 2,
      'Both words should remain readable on separate lines');

    const finish=await page.locator('.tm-explorer-hero').evaluate(hero=>{
      const image=getComputedStyle(hero.querySelector('.tm-explorer-foreground'));
      const moon=getComputedStyle(hero.querySelector('.tm-explorer-moon'));
      const tag=getComputedStyle(hero.querySelector('.tm-explorer-tagline'));
      const sky=hero.querySelector('.tm-explorer-sky'),skyStyle=getComputedStyle(sky);
      return {foreground:image.filter,moon:moon.filter,type:tag.filter,
        skyEvents:skyStyle.pointerEvents,skyLayer:Number(skyStyle.zIndex),skyHidden:sky.getAttribute('aria-hidden'),
        stars:sky.querySelectorAll('.tm-explorer-star').length,
        trails:sky.querySelectorAll('.tm-explorer-stardust').length,
        skyImages:sky.querySelectorAll('img,canvas,video').length,
        animatedStars:[...sky.querySelectorAll('.tm-explorer-star')].some(el=>getComputedStyle(el).animationName!=='none')};
    });
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
    const next = page.getByRole('link',{name:'Explore selected projects',exact:true});
    assert(await next.isVisible() && await next.getAttribute('href') === '#project','The cover arrow should lead to selected projects');
    const cursorOf = el => getComputedStyle(el).cursor;
    assert(await menu.evaluate(cursorOf) !== 'none' && await next.evaluate(cursorOf) !== 'none',
      'Reduced motion should keep native cursors over controls');
    await menu.focus();
    await page.keyboard.press('Enter');
    const nav = page.getByRole('navigation',{name:'Portfolio navigation',exact:true});
    assert(await nav.isVisible(),'Navigation failed');
    assert(await nav.evaluate(el => el.contains(document.activeElement)), 'Open navigation should receive keyboard focus');
    assert(await nav.getByRole('link').first().evaluate(cursorOf) !== 'none', 'Keep link cursors in the open menu');
    assert(await page.locator('.tm-explorer-menu-scrim').evaluate(cursorOf) !== 'none', 'Keep a native cursor on the open menu scrim');
    await page.keyboard.press('Escape');
    assert(await menu.evaluate(el => document.activeElement === el), 'Escape should return focus to the menu toggle');
    assert.equal(await page.locator('.tm-explorer-nav').count(),0,'Escape failed');
    const chapterIds = ['home','project','posters','process','about','services','contact-form'];
    const renderedChapters = await page.locator(chapterIds.map(id => '#'+id).join(',')).evaluateAll(nodes => nodes.map(el => el.id));
    assert.deepEqual(renderedChapters, chapterIds, 'Projects should follow the cover, then posters and process');
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
      assert(await page.locator('.tm-explorer-hero').evaluate(cursorOf) !== 'none', 'Touch-only view should use native input');
      await swipe(session, from, { x: from.x + box.width * .22, y: from.y });
      assert.equal(await angle(page), beforeSwipe, 'A horizontal swipe must leave the surface alone');
      await swipe(session, from, { x: from.x, y: from.y - 140 });
      await page.waitForFunction(() => document.querySelector('.tm-explorer-hero').getBoundingClientRect().top < -30);
      // Start the separate tap check on the original moon after the swipe.
      await seekHeroScroll(page, 0);
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.waitForFunction(() => document.querySelector('.tm-explorer-moon')?.dataset.animating === 'true');
      await session.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: from.x, y: from.y}]});
      await session.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
      assert.equal(await page.locator('html[data-tm-comet-active]').count(), 0, 'A real touch must not start a cursor trail');
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
      assert.equal(await page.locator('html[data-tm-comet-active]').count(), 0, 'Reduced motion should keep the system pointer');
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
      await page.mouse.move(box.x + box.width * .89, box.y + box.height * .30);
      await page.waitForSelector('html[data-tm-comet-active]');
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
      const posters = page.locator('#posters');
      const posterBounds = await posters.boundingBox();
      await page.mouse.move(posterBounds.x + 3, Math.min(720, Math.max(120, posterBounds.y + 140)));
      await page.waitForSelector('.tm-comet-cursor[data-visible=true]');
      assert.equal(await posters.evaluate(cursorOf), 'none', 'The comet should continue across portfolio backgrounds');
      const offscreen=await angle(page);await wait(page,250);
      assert.equal(await angle(page),offscreen,'Offscreen suspension failed');
      await page.locator('.tm-explorer-hero').scrollIntoViewIfNeeded();
    }
    if (width === 375 || width === 1440) {
      await checkLunarScroll(page, width);
      await checkProjectGallery(page, width);
      await checkChapters(page, width);
      await checkProjectScrollInput(page, width);
    }
    assert.deepEqual(errors,[],'Browser error');
    await page.close();
  }

  await checkComet();
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

  // Keep the title and moon readable when the brush artwork and WebGL are unavailable.
  const fallback=await browser.newPage({viewport:{width:1280,height:800}});
  let blockedAtlas = false;
  await fallback.route(brushAtlasUrl, route => { blockedAtlas = true; return route.abort(); });
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
  assert(blockedAtlas, 'The fallback must exercise a failed brush atlas request');
  const fallbackInk = await fallback.locator('.tm-explorer-masthead text').evaluateAll(letters =>
    letters.map(el => el.textContent).join('') === 'TUMANEEN' && letters.every(el => {
      const fill = getComputedStyle(el).fill;
      return CSS.supports('color', fill) && fill !== 'transparent' && !fill.endsWith(', 0)') && el.getBoundingClientRect().height > 20;
    }));
  assert(fallbackInk, 'All eight letters should have visible solid ink when the atlas fails');
  assert.notEqual(await fallback.locator('.tm-explorer-masthead').getAttribute('data-paint-ready'), 'true');
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
  console.log('PASS: locally served editorial lettering, pointer-following comet and hover ring, fine lunar grains, cursor lighting on all four sides, neutral light on exit, independent rotation, responsive portfolio and motion preferences.');
}finally{await browser.close();}
