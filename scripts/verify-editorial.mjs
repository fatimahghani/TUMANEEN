import fs from 'node:fs';
import { chromium } from 'playwright';

/* PR-only smoke checks and visual snapshots; not bundled into the app. */
const browser = await chromium.launch({ headless: true });
const base = 'http://127.0.0.1:4173/';
const expected = [
  ['.tm-hero', 'rgb(75, 40, 48)'],
  ['#project', 'rgb(217, 214, 210)'],
  ['#posters', 'rgb(170, 156, 144)'],
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

    // The Poster Archive is a six-exhibit, three-column museum installation.
    // All eight original poster files must still be accessible and unfiltered.
    const museum = page.locator('#posters[data-museum-posters]');
    if (await museum.count() !== 1) errors.push(width + ': museum archive missing');
    const exhibits = page.locator('.tm-ma-exhibit');
    if (await exhibits.count() !== 6) errors.push(width + ': expected six poster exhibits');
    const plaques = page.locator('.tm-ma-number-plaque');
    if (await plaques.count() !== 6) errors.push(width + ': missing six exhibit number plaques');
    const mainPapers = page.locator('.tm-ma-primary-paper');
    if (await mainPapers.count() !== 6) errors.push(width + ': six original poster sheets required');
    const realPosterImages = page.locator('.tm-ma-primary-paper img, .tm-ma-secondary-paper img');
    if (await realPosterImages.count() !== 8)
      errors.push(width + ': eight real original designs must be preserved in the museum');
    if (await page.locator('.tm-ma-clip-metal').count() !== 14 ||
        await page.locator('.tm-ma-clip-wire').count() !== 14)
      errors.push(width + ': museum exhibit clips and suspension wires are incomplete');
    if (await page.locator('.tm-ma-study-group').count() !== 3)
      errors.push(width + ': expected three restrained companion paper slips');
    if (await page.locator('.tm-ma-study-sheet').count() !== 3)
      errors.push(width + ': expected one small supporting sheet per featured study');
    if (await page.locator('.tm-ma-shelf-scene, .tm-ma-glass-case, .tm-ma-paper-samples, .tm-ma-color-chips, .tm-ma-pressed-flower').count() !== 0)
      errors.push(width + ': retired decorative clutter returned');

    const exhibitGrid = await page.locator('.tm-ma-exhibition').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
    );
    const expectedExhibitColumns = width > 1160 ? 3 : width > 690 ? 2 : 1;
    if (exhibitGrid !== expectedExhibitColumns)
      errors.push(width + ': expected ' + expectedExhibitColumns + ' museum columns, found ' + exhibitGrid);

    const seenSources = new Set();
    for (let i = 0; i < await realPosterImages.count(); i++) {
      await realPosterImages.nth(i).scrollIntoViewIfNeeded();
      const details = await realPosterImages.nth(i).evaluate(async img => {
        try { await img.decode(); } catch {}
        const style = getComputedStyle(img);
        return { loaded: img.naturalWidth > 0, fit: style.objectFit, filter: style.filter, src: img.currentSrc };
      });
      if (!details.loaded) errors.push(width + ': original museum artwork ' + i + ' failed to load');
      if (details.fit !== 'contain' || details.filter !== 'none')
        errors.push(width + ': museum artwork was cropped or filtered');
      seenSources.add(details.src);
    }
    if (seenSources.size !== 8) errors.push(width + ': museum must contain eight distinct original poster files');

    const interferingScraps = await exhibits.evaluateAll(nodes => nodes.flatMap((exhibit) => {
      const labelTop = exhibit.querySelector('.tm-ma-exhibit-caption')?.getBoundingClientRect().top;
      if (labelTop == null) return [];
      return [...exhibit.querySelectorAll('.tm-ma-study-sheet')].flatMap(sheet => {
        const bottom = sheet.getBoundingClientRect().bottom;
        return bottom > labelTop - 2 ? [{ exhibit: exhibit.dataset.exhibitNumber, bottom, labelTop }] : [];
      });
    }));
    if (interferingScraps.length)
      errors.push(width + ': archival study scraps overlap exhibit captions ' + JSON.stringify(interferingScraps));

    // Hide only the fixed navigation while taking the full-section screenshot.
    // Otherwise Playwright stitches it across the middle of the exhibition.
    const fixedHeader = page.locator('[data-editorial-nav]');
    const oldVisibility = await fixedHeader.evaluate(el => {
      const before = el.style.visibility;
      el.style.visibility = 'hidden';
      return before;
    });
    await museum.screenshot({
      path: 'editorial-snapshots/poster-museum-' + width + '.png',
      animations: 'disabled',
    });
    await fixedHeader.evaluate((el, previous) => { el.style.visibility = previous; }, oldVisibility);

    if (width === 1440) {
      await page.getByRole('button', { name: /View Wajood.*poster/ }).first().click();
      await page.locator('.tm-ma-viewer').waitFor({ state: 'visible' });
      if (!(await page.locator('#tm-ma-viewer-title').textContent())?.includes('Wajood'))
        errors.push('Wajood poster did not open in full-size viewer');
      if (await page.locator('.tm-ma-viewer-picture img').evaluate(el => getComputedStyle(el).filter) !== 'none')
        errors.push('full-size viewer filters original work');
      await page.getByRole('button', { name: 'Next poster' }).click();
      if (!(await page.locator('#tm-ma-viewer-title').textContent())?.includes('Chai'))
        errors.push('museum next button failed to browse originals');
      await page.keyboard.press('Escape');
      await page.locator('.tm-ma-viewer').waitFor({ state: 'hidden' });

      await page.getByRole('button', { name: /View Retro Horizon poster/ }).click();
      await page.locator('.tm-ma-viewer').waitFor({ state: 'visible' });
      if (!(await page.locator('#tm-ma-viewer-title').textContent())?.includes('Retro Horizon'))
        errors.push('secondary triptych poster is not interactive');
      await page.getByRole('button', { name: 'Close poster preview' }).click({ position: { x: 3, y: 3 } });
      await page.locator('.tm-ma-viewer').waitFor({ state: 'hidden' });
    }

    // Four case studies, each hung on two thin wires and black binder clips.
    // At every breakpoint they must stay in one horizontal line.
    const studies = page.locator('.tm-hung-study');
    if (await studies.count() !== 4) errors.push(width + ': expected exactly four hanging studies');
    if (await page.locator('.tm-epok-item').count() !== 0)
      errors.push(width + ': outdated masonry cards still present');
    if (await page.locator('.tm-museum-frame').count() !== 0)
      errors.push(width + ': ornate picture frames should be removed');
    if (await page.locator('.tm-hung-wire').count() !== 8)
      errors.push(width + ': each poster requires two hanging wires');
    if (await page.locator('.tm-hung-clip').count() !== 8)
      errors.push(width + ': each poster requires two black binder clips');
    if (await page.locator('.tm-hung-paper').count() !== 4)
      errors.push(width + ': expected four paper sheets');
    if (await page.locator('.tm-hung-label').count() !== 4)
      errors.push(width + ': expected one small caption per case study');
    if (await page.locator('[data-gallery-kind="poster-series"]').count() !== 1)
      errors.push(width + ': poster typography should be a single case study');
    if (await page.locator('[data-gallery-kind="empty"]').count() !== 0)
      errors.push(width + ': empty fifth study must be removed');

    for (const title of ['LUMERA', 'RIWAQ Fragrances', 'Roast & Rhythm', 'Poster Typography']) {
      if (await page.locator('.tm-hung-study[data-gallery-title="' + title + '"]').count() !== 1)
        errors.push(width + ': missing ' + title);
    }


    const backgroundAccents = await page.locator('#project').evaluate(el => {
      const a = getComputedStyle(el, '::before');
      const b = getComputedStyle(el, '::after');
      const shell = getComputedStyle(el.querySelector('.tm-hung-shell'));
      return {
        left: a.backgroundImage,
        right: b.backgroundImage,
        leftPointerEvents: a.pointerEvents,
        rightPointerEvents: b.pointerEvents,
        leftZIndex: a.zIndex,
        shellZIndex: shell.zIndex,
      };
    });
    if (backgroundAccents.left === 'none' || backgroundAccents.right === 'none')
      errors.push(width + ': archival wall details are missing');
    if (backgroundAccents.leftPointerEvents !== 'none' || backgroundAccents.rightPointerEvents !== 'none')
      errors.push(width + ': background accents intercept gallery interactions');
    if (backgroundAccents.leftZIndex !== '0' || backgroundAccents.shellZIndex !== '1')
      errors.push(width + ': wall accents must stay behind the artwork');

    const strip = page.locator('.tm-hung-strip');
    const geometry = await studies.evaluateAll(nodes => nodes.map(el => {
      const r = el.getBoundingClientRect();
      const paper = el.querySelector('.tm-hung-paper').getBoundingClientRect();
      return { x:r.left, y:r.top, bottom:r.bottom, width:r.width, paperY:paper.top };
    }));
    if (geometry.length === 4) {
      if (Math.max(...geometry.map(g => g.paperY)) - Math.min(...geometry.map(g => g.paperY)) > 2)
        errors.push(width + ': hanging poster top edges must align horizontally');
      if (geometry.some((g,i) => i > 0 && g.x <= geometry[i-1].x))
        errors.push(width + ': case studies are not arranged left-to-right in one row');
    }
    const arrangement = await strip.evaluate(el => {
      const style = getComputedStyle(el);
      return {
        display:style.display,
        columns:style.gridTemplateColumns.split(' ').filter(Boolean).length,
        scrollWidth:el.scrollWidth,
        clientWidth:el.clientWidth,
        wrap:style.flexWrap,
      };
    });
    if (width > 1050 && (arrangement.display !== 'grid' || arrangement.columns !== 4))
      errors.push(width + ': desktop must use a four-column single-row grid');
    if (width <= 1050 && (arrangement.display !== 'flex' || arrangement.wrap !== 'nowrap'))
      errors.push(width + ': smaller screens must use a single nowrap horizontal carousel');
    if (width <= 580 && arrangement.scrollWidth <= arrangement.clientWidth + 40)
      errors.push(width + ': mobile gallery needs horizontal overflow for all four studies');

    // Only gallery chrome may have texture/shadows, never the source artwork.
    const photos = page.locator('.tm-hung-paper img');
    for (let i=0; i<await photos.count(); i++) {
      await photos.nth(i).scrollIntoViewIfNeeded();
      const data = await photos.nth(i).evaluate(async el => {
        try { await el.decode(); } catch {}
        const style = getComputedStyle(el);
        return { loaded:el.naturalWidth>0, fit:style.objectFit, filter:style.filter };
      });
      if (!data.loaded) errors.push(width + ': hanging art ' + i + ' not loaded');
      if (data.fit !== 'contain' || data.filter !== 'none')
        errors.push(width + ': hanging original art is cropped or filtered');
    }
    await page.locator('#project').screenshot({
      path: 'editorial-snapshots/project-gallery-' + width + '.png',
      animations: 'disabled',
    });

    if (width === 1440) {
      await page.getByRole('button', { name:'Open LUMERA case study' }).click();
      await page.locator('.tm-case-modal').waitFor({ state:'visible' });
      await page.keyboard.press('Escape');
      await page.locator('.tm-case-modal').waitFor({ state:'hidden' });

      await page.getByRole('button', { name:'Open Poster Typography case study' }).click();
      await page.locator('.tm-epok-study-overlay').waitFor({ state:'visible' });
      if (await page.locator('.tm-epok-study-thumbnails button').count() !== 3)
        errors.push('Poster Typography must retain three original plates');
      if (!(await page.locator('.tm-epok-study-meta h3').textContent())?.includes('Shanakht'))
        errors.push('grouped poster study should start on Shanakht');
      await page.getByRole('button', { name:'Next poster' }).click();
      if (!(await page.locator('.tm-epok-study-meta h3').textContent())?.includes('Wajood'))
        errors.push('Poster Typography next action should show Wajood');
      await page.getByRole('button', { name:/View Chai.*plate/i }).click();
      if (!(await page.locator('.tm-epok-study-meta h3').textContent())?.includes('Chai'))
        errors.push('Poster Typography must retain Chai');
      await page.keyboard.press('Escape');
      await page.locator('.tm-epok-study-overlay').waitFor({ state:'hidden' });

      await page.getByRole('button', { name:/VIEW INDEX/i }).click();
      await page.locator('.tm-epok-index-row').first().waitFor();
      if (await page.locator('.tm-epok-index-row').count() !== 4)
        errors.push('index should show four case studies');
      await page.keyboard.press('Escape');
      await page.locator('.tm-epok-overlay').waitFor({ state:'hidden' });
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
