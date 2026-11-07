import fs from 'node:fs';
import { chromium } from 'playwright';

/* PR-only smoke checks and visual snapshots; not bundled into the app. */
const browser = await chromium.launch({ headless: true });
const base = 'http://127.0.0.1:4173/';
const expected = [
  ['.tm-hero', 'rgb(75, 40, 48)'],
  ['#project', 'rgb(239, 230, 214)'],
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

    const gallery = page.locator('.tm-epok-item');
    const expectedWorks = ['LUMERA','Shanakht','RIWAQ Fragrances','Wajood','Roast & Rhythm','Chai'];
    if (await gallery.count() !== 6) errors.push(width + ': expected six mixed gallery works');
    for (const title of expectedWorks) {
      if (await page.locator('.tm-epok-item[data-gallery-title="' + title + '"]').count() !== 1) {
        errors.push(width + ': missing original artwork ' + title);
      }
    }
    if (await page.locator('.tm-epok-item[data-gallery-kind="poster"]').count() !== 3)
      errors.push(width + ': missing featured posters');
    if (await page.locator('.tm-epok-item[data-gallery-kind="case"]').count() !== 3)
      errors.push(width + ': missing identity case studies');
    if (await page.locator('.tm-projects-title-row').count() !== 0)
      errors.push(width + ': oversized section title returned');
    if (await page.locator('.tm-bridge').count() !== 0)
      errors.push(width + ': separate featured project banner returned');

    const columns = await page.locator('.tm-epok-grid').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
    );
    const want = width > 950 ? 3 : width > 580 ? 2 : 1;
    if (columns !== want) errors.push(width + ': expected ' + want + ' editorial columns, got ' + columns);

    const images = page.locator('.tm-epok-image img');
    for (let i = 0; i < await images.count(); i++) {
      await images.nth(i).scrollIntoViewIfNeeded();
      const data = await images.nth(i).evaluate(async img => {
        try { await img.decode(); } catch {}
        return {
          loaded: img.naturalWidth > 0,
          fit: getComputedStyle(img).objectFit,
          filter: getComputedStyle(img).filter,
          height: getComputedStyle(img).height,
          background: getComputedStyle(img.parentElement).backgroundColor,
        };
      });
      if (!data.loaded) errors.push(width + ': gallery artwork ' + i + ' failed to load');
      if (data.fit !== 'contain' || data.filter !== 'none') errors.push(width + ': artwork was cropped or filtered');
      if (data.background !== 'rgba(0, 0, 0, 0)') errors.push(width + ': colored placeholder behind art');
    }

    const typeSizes = await page.evaluate(() => {
      const size = selector => {
        const el = document.querySelector(selector);
        return el ? parseFloat(getComputedStyle(el).fontSize) : NaN;
      };
      return {
        masthead: size('.tm-masthead'),
        projectCaption: size('.tm-epok-caption-heading button'),
        aboutHeading: size('.tm-about h2'),
        servicesHeading: size('.tm-services h2'),
        contactHeading: size('#contact-form h2'),
      };
    });
    const headingLimit = width <= 580 ? 58 : width <= 820 ? 83 : 120;
    for (const [name, value] of Object.entries(typeSizes)) {
      if (!Number.isFinite(value)) errors.push(width + ': typography element missing ' + name);
      if (value > headingLimit) errors.push(width + ': oversized ' + name + ' at ' + value + 'px');
    }
    if (typeSizes.projectCaption > 26) errors.push(width + ': project caption title oversized');

    await page.locator('#project').screenshot({
      path: 'editorial-snapshots/project-gallery-' + width + '.png',
      animations: 'disabled',
    });

    if (width === 1440) {
      // Identity items still open the existing case study, posters open their own full-art viewer.
      await page.getByRole('button', { name: 'Open LUMERA case study' }).click();
      await page.locator('.tm-case-modal').waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await page.locator('.tm-case-modal').waitFor({ state: 'hidden' });

      for (const title of ['Shanakht','Wajood','Chai']) {
        await page.locator('.tm-epok-item[data-gallery-title="' + title + '"] .tm-epok-image').click();
        await page.locator('.tm-epok-poster-overlay').waitFor({ state: 'visible' });
        const isUnfiltered = await page.locator('.tm-epok-poster-art img').evaluate(el => getComputedStyle(el).filter === 'none');
        if (!isUnfiltered) errors.push('poster viewer modified artwork: ' + title);
        await page.keyboard.press('Escape');
        await page.locator('.tm-epok-poster-overlay').waitFor({ state: 'hidden' });
      }
      await page.getByRole('button', { name: /VIEW INDEX/i }).click();
      await page.locator('.tm-epok-index-list .tm-epok-index-row').first().waitFor();
      if (await page.locator('.tm-epok-index-row').count() !== 6) errors.push('index does not show all six entries');
      await page.keyboard.press('Escape');
      await page.locator('.tm-epok-overlay').waitFor({ state: 'hidden' });
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
