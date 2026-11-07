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
    const expectedWorks = ['LUMERA', 'RIWAQ Fragrances', 'Roast & Rhythm', 'Poster Typography', 'Untitled'];
    if (await gallery.count() !== 5) errors.push(width + ': expected five aligned study slots');

    for (const title of expectedWorks) {
      if (await page.locator('.tm-epok-item[data-gallery-title="' + title + '"]').count() !== 1) {
        errors.push(width + ': missing case study ' + title);
      }
    }
    if (await page.locator('.tm-epok-item[data-gallery-kind="case"]').count() !== 3)
      errors.push(width + ': expected three brand identities');
    if (await page.locator('.tm-epok-item[data-gallery-kind="poster-series"]').count() !== 1)
      errors.push(width + ': poster typography should be a single case study');
    if (await page.locator('.tm-epok-item[data-gallery-kind="empty"]').count() !== 1)
      errors.push(width + ': one reserved case study should fill the layout');
    for (const title of ['Shanakht', 'Wajood', 'Chai']) {
      if (await page.locator('.tm-epok-item[data-gallery-title="' + title + '"]').count() !== 0)
        errors.push(width + ': ' + title + ' incorrectly appears as separate case study');
    }
    if (await page.locator('.tm-projects-title-row').count() !== 0)
      errors.push(width + ': oversized section heading returned');
    if (await page.locator('.tm-bridge').count() !== 0)
      errors.push(width + ': featured banner returned');
    if (await page.locator('.tm-epok-blank-leaf img').count() !== 0)
      errors.push(width + ': empty folio contains fake project imagery');

    const columnGroups = page.locator('.tm-epok-column');
    if (await columnGroups.count() !== 3) errors.push(width + ': expected three independent masonry columns');
    const itemsPerColumn = await columnGroups.evaluateAll(nodes =>
      nodes.map(node => node.querySelectorAll('.tm-epok-item').length)
    );
    if (JSON.stringify(itemsPerColumn) !== JSON.stringify([2,2,1]))
      errors.push(width + ': unexpected masonry distribution ' + itemsPerColumn);

    const layout = await page.locator('.tm-epok-grid').evaluate(element => ({
      display: getComputedStyle(element).display,
      tracks: getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length,
    }));
    if (width > 950 && (layout.display !== 'grid' || layout.tracks !== 3))
      errors.push(width + ': desktop requires three equal grid columns');
    if (width > 580 && width <= 950 && (layout.display !== 'grid' || layout.tracks !== 2))
      errors.push(width + ': tablet requires two columns');
    if (width <= 580 && layout.display !== 'flex')
      errors.push(width + ': mobile requires one ordered column');

    // Reference-specific composition: first two covers start level, third
    // is offset below, and each column flows independently of the others.
    if (width > 950) {
      const geometry = await columnGroups.evaluateAll(nodes =>
        nodes.map(node => {
          const first = node.querySelector('.tm-epok-item');
          const items = [...node.querySelectorAll('.tm-epok-item')];
          const column = node.getBoundingClientRect();
          return {
            left: Math.round(column.left),
            width: Math.round(column.width),
            top: Math.round(first.getBoundingClientRect().top),
            next: items[1] ? items[1].getBoundingClientRect().top : null,
            bottom: first.getBoundingClientRect().bottom,
          };
        })
      );
      console.log('REFERENCE_GEOMETRY', width, JSON.stringify(geometry));
      if (new Set(geometry.map(c => c.left)).size !== 3)
        errors.push(width + ': three masonry columns not visually distinct');
      if (Math.max(...geometry.map(c => c.width)) - Math.min(...geometry.map(c => c.width)) > 3)
        errors.push(width + ': reference uses equal column widths');
      if (Math.abs(geometry[0].top - geometry[1].top) > 4)
        errors.push(width + ': first two columns must align at top');
      if (geometry[2].top - geometry[0].top < 16)
        errors.push(width + ': third column must start lower');
      if (!geometry[0].next || geometry[0].next <= geometry[0].bottom)
        errors.push(width + ': first column does not flow independently');
      if (!geometry[1].next || geometry[1].next <= geometry[1].bottom)
        errors.push(width + ': second column does not flow independently');
    }

    const captionStyles = await page.locator('.tm-epok-caption-heading button').first().evaluate(el => {
      const cs = getComputedStyle(el);
      return { size: parseFloat(cs.fontSize), display: cs.display };
    });
    if (captionStyles.size > 16)
      errors.push(width + ': project caption should be small like the reference');
    if (await page.locator('.tm-epok-caption-dash').count() !== 5)
      errors.push(width + ': missing fine dash prefixes beside project titles');
    if (await page.locator('.tm-epok-caption-arrow').count() !== 5)
      errors.push(width + ': missing inline project arrows');

    const images = page.locator('.tm-epok-image img');
    if (await images.count() !== 6) errors.push(width + ': expected three brands and three posters inside one grouped preview');
    for (let i = 0; i < await images.count(); i++) {
      await images.nth(i).scrollIntoViewIfNeeded();
      const data = await images.nth(i).evaluate(async img => {
        try { await img.decode(); } catch {}
        return {
          loaded: img.naturalWidth > 0,
          fit: getComputedStyle(img).objectFit,
          filter: getComputedStyle(img).filter,
          background: getComputedStyle(img.parentElement).backgroundColor,
        };
      });
      if (!data.loaded) errors.push(width + ': gallery artwork ' + i + ' failed to load');
      if (data.fit !== 'contain' || data.filter !== 'none')
        errors.push(width + ': original artwork was cropped or filtered');
      if (i < 3 && data.background !== 'rgba(0, 0, 0, 0)')
        errors.push(width + ': colored project placeholder returned');
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
    if (typeSizes.projectCaption > 26) errors.push(width + ': project caption oversized');

    await page.locator('#project').screenshot({
      path: 'editorial-snapshots/project-gallery-' + width + '.png',
      animations: 'disabled',
    });

    if (width === 1440) {
      await page.getByRole('button', { name: 'Open LUMERA case study' }).click();
      await page.locator('.tm-case-modal').waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await page.locator('.tm-case-modal').waitFor({ state: 'hidden' });

      await page.getByRole('button', { name: 'Open Poster Typography case study' }).click();
      await page.locator('.tm-epok-study-overlay').waitFor({ state: 'visible' });
      if (await page.locator('.tm-epok-study-thumbnails button').count() !== 3)
        errors.push('poster typography case study must hold three posters');
      if (!(await page.locator('.tm-epok-study-meta h3').textContent())?.includes('Shanakht'))
        errors.push('poster case should open on Shanakht');
      await page.getByRole('button', { name: 'Next poster' }).click();
      if (!(await page.locator('.tm-epok-study-meta h3').textContent())?.includes('Wajood'))
        errors.push('next poster should show Wajood');
      await page.getByRole('button', { name: /View Chai.*plate/i }).click();
      if (!(await page.locator('.tm-epok-study-meta h3').textContent())?.includes('Chai'))
        errors.push('poster series should include Chai');
      const posterFilter = await page.locator('.tm-epok-study-art img').evaluate(el => getComputedStyle(el).filter);
      if (posterFilter !== 'none') errors.push('poster case study filters the original artwork');
      await page.keyboard.press('Escape');
      await page.locator('.tm-epok-study-overlay').waitFor({ state: 'hidden' });

      await page.getByRole('button', { name: 'Open empty Untitled case study' }).click();
      await page.locator('.tm-epok-empty-panel').waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await page.locator('.tm-epok-empty-panel').waitFor({ state: 'hidden' });

      await page.getByRole('button', { name: /VIEW INDEX/i }).click();
      await page.locator('.tm-epok-index-list .tm-epok-index-row').first().waitFor();
      if (await page.locator('.tm-epok-index-row').count() !== 5)
        errors.push('index does not show all five studies');
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
