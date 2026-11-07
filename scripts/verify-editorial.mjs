import fs from 'node:fs';
import { chromium } from 'playwright';

/* PR-only smoke checks and visual snapshots; not bundled into the app. */
const browser = await chromium.launch({ headless: true });
const base = 'http://127.0.0.1:4173/';
const expected = [
  ['.tm-hero', 'rgb(75, 40, 48)'],
  ['.tm-projects-intro', 'rgb(239, 230, 214)'],
  ['#posters', 'rgb(36, 32, 29)'],
  ['.tm-about', 'rgb(239, 230, 214)'],
  ['.tm-process', 'rgb(239, 230, 214)'],
  ['.tm-services', 'rgb(239, 230, 214)'],
  ['#contact-form', 'rgb(75, 40, 48)'],
];
const sizes = [320, 375, 768, 1280, 1440];
const errors = [];
fs.mkdirSync('editorial-snapshots', { recursive: true });

try {
  for (const width of sizes) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('.tm-masthead').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const actual = await page.evaluate(() => ({
      hero: getComputedStyle(document.querySelector('.tm-hero')).backgroundColor,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      masthead: document.querySelector('.tm-masthead')?.textContent,
      artLoaded: Boolean(document.querySelector('.tm-picture-print img')?.naturalWidth),
    }));
    if (actual.hero !== 'rgb(75, 40, 48)') errors.push(width + ': hero background ' + actual.hero);
    if (actual.overflow > 2) errors.push(width + ': horizontal overflow ' + actual.overflow + 'px');
    if (!actual.artLoaded) errors.push(width + ': Shanakht did not load');
    if (!actual.masthead?.includes('TUMANEEN')) errors.push(width + ': masthead missing');
    await page.screenshot({ path: 'editorial-snapshots/hero-' + width + '.png', animations: 'disabled' });

    // New staggered, Epok-inspired gallery: three original projects, no cropped artwork.
    const gallery = page.locator('.tm-project-entry');
    if (await gallery.count() !== 3) errors.push(width + ': expected three project entries');
    for (const project of ['lumera-candle-identity', 'riwaq-fragrance-identity', 'roast-and-rhythm-cafe']) {
      if (await page.locator('[data-project-id="' + project + '"]').count() !== 1) {
        errors.push(width + ': project missing ' + project);
      }
    }

    const covers = page.locator('.tm-project-entry-cover img');
    for (let i = 0; i < await covers.count(); i++) {
      await covers.nth(i).scrollIntoViewIfNeeded();
      const data = await covers.nth(i).evaluate(async (img) => {
        try { await img.decode(); } catch {}
        return {
          loaded: img.naturalWidth > 0,
          fit: getComputedStyle(img).objectFit,
          filter: getComputedStyle(img).filter,
        };
      });
      if (!data.loaded) errors.push(width + ': project cover ' + i + ' did not load');
      if (data.fit !== 'contain' || data.filter !== 'none') errors.push(width + ': project artwork display changed');
    }

    const columns = await gallery.evaluateAll(nodes =>
      nodes.map(node => Math.round(node.getBoundingClientRect().left))
    );
    if (width >= 1100 && new Set(columns).size !== 3) errors.push(width + ': expected three columns');
    if (width <= 580 && new Set(columns).size !== 1) errors.push(width + ': expected one column');

    await page.locator('#project').screenshot({
      path: 'editorial-snapshots/project-gallery-' + width + '.png',
      animations: 'disabled',
    });

    if (width === 1440) {
      await page.getByRole('button', { name: 'Open LUMERA case study' }).click();
      await page.locator('.tm-case-modal').waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await page.locator('.tm-case-modal').waitFor({ state: 'hidden' });

      await page.locator('.tm-project-index-trigger').click();
      await page.locator('.tm-project-index-overlay').waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await page.locator('.tm-project-index-overlay').waitFor({ state: 'hidden' });
      await page.locator('.tm-project-index-trigger').click();
      await page.locator('.tm-project-index-overlay').waitFor({ state: 'visible' });
      await page.locator('.tm-project-index-backdrop').click({ position: { x: 4, y: 4 } });
      await page.locator('.tm-project-index-overlay').waitFor({ state: 'hidden' });
    }

    if (width === 1440) {
      for (const [selector, color] of expected) {
        const element = page.locator(selector).first();
        await element.scrollIntoViewIfNeeded();
        const computed = await element.evaluate(el => getComputedStyle(el).backgroundColor);
        if (computed !== color) errors.push(selector + ': background ' + computed + ' (expected ' + color + ')');
        await page.screenshot({ path: 'editorial-snapshots/' + selector.replace(/[^a-z]+/gi, '-') + '-1440.png', animations: 'disabled' });
      }
      const imageStyle = await page.locator('.tm-picture-print img').evaluate(el => ({
        filter: getComputedStyle(el).filter,
        objectFit: getComputedStyle(el).objectFit,
      }));
      if (imageStyle.filter !== 'none') errors.push('Shanakht image is filtered');
      if (imageStyle.objectFit !== 'contain') errors.push('Shanakht image fit changed');
      for (const id of ['home', 'posters', 'project', 'process', 'about', 'services', 'contact-form']) {
        if (await page.locator('#' + id).count() !== 1) errors.push('Missing or duplicated section id: ' + id);
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Editorial colors, Shanakht artwork, anchors and responsive overflow checks passed.');
}
