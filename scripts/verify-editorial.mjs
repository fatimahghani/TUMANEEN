import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const base = 'http://127.0.0.1:4173/';
const sizes = [[320,700],[375,812],[768,1024],[1280,800],[1440,900],[1920,1080]];
fs.mkdirSync('editorial-snapshots', { recursive: true });
const angle = async (page) => Number(await page.locator('.tm-explorer-moon').getAttribute('data-angle'));
const wait = (page, ms) => page.waitForTimeout(ms);
const delta = (a,b) => (b-a+360)%360;

try {
  for (const [width,height] of sizes) {
    const page = await browser.newPage({ viewport:{width,height}, reducedMotion:'reduce', deviceScaleFactor:1 });
    const errors=[];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base,{waitUntil:'networkidle'});
    await page.locator('[data-coded-hero]').waitFor();
    await page.evaluate(async()=>{
      await document.fonts.ready;
      await document.querySelector('.tm-explorer-foreground').decode();
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    });
    await page.waitForFunction(()=>document.querySelector('.tm-explorer-moon')?.dataset.renderMode==='webgl');
    await page.waitForFunction(()=>document.querySelector('.tm-explorer-masthead')?.dataset.typeReady==='true');
    const layout = await page.evaluate(()=>{
      const hero=document.querySelector('.tm-explorer-hero');
      const moon=document.querySelector('.tm-explorer-moon');
      const image=document.querySelector('.tm-explorer-foreground');
      const title=document.querySelector('.tm-explorer-heading');
      const tag=document.querySelector('.tm-explorer-tagline');
      const h=hero.getBoundingClientRect(), m=moon.getBoundingClientRect();
      return {
        width:h.width,height:h.height,viewport:[innerWidth,innerHeight],
        overflow:document.documentElement.scrollWidth-innerWidth,
        round:Math.abs(m.width-m.height),diameter:m.width,
        imageLoaded:image.naturalWidth>0,imageSource:image.getAttribute('src'),
        titleText:title.textContent,letters:title.querySelectorAll('svg text').length,
        tagline:tag.textContent,font:getComputedStyle(title.querySelector('text')).fontFamily,
        layers:[title,moon,image,tag].map(el=>Number(getComputedStyle(el).zIndex)),
        flatImages:hero.querySelectorAll('img').length,
        oldPoster:hero.querySelectorAll('.tm-retro-cover-art,.tm-retro-red-disc').length,
      };
    });
    assert(Math.abs(layout.width-width)<2,'Hero must fill the viewport width');
    assert(Math.abs(layout.height-height)<2,'Hero must fill the viewport height');
    assert(layout.overflow<=2,'Page has horizontal overflow');
    assert(layout.round<2,'Moon must remain a circle');
    assert(layout.imageLoaded&&layout.imageSource.endsWith('/astronaut.webp'),'Isolated foreground did not load');
    assert.equal(layout.flatImages,1,'Hero must use only one isolated foreground image');
    assert.equal(layout.oldPoster,0,'Flattened cover/red sun returned');
    assert.equal(layout.letters,8,'Masthead must be eight editable SVG letters');
    assert(layout.titleText.includes('TUMANEEN'),'Accessible masthead missing');
    assert.equal(layout.tagline,'VisualExplorer','Live Visual Explorer text missing');
    assert.deepEqual(layout.layers,[1,2,3,4],'Scene layer order changed');
    assert(layout.font.includes('Anton'),'Condensed masthead font failed');

    // Optical fit: equal cap tops and visible gaps, without clipping glyphs.
    const typography = await page.locator('.tm-explorer-masthead').evaluate(svg=>{
      const letters=[...svg.querySelectorAll('text')].map(el=>{
        const r=el.getBoundingClientRect();
        return {letter:el.textContent,x:r.left,y:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
      });
      const m=document.querySelector('.tm-explorer-moon').getBoundingClientRect();
      return {letters, clips:svg.querySelectorAll('clipPath').length, moon:{x:m.x,y:m.y,width:m.width}, width:innerWidth};
    });
    assert.equal(typography.clips,0,'Do not cut letterforms with an arbitrary arc clip');
    assert.equal(typography.letters.map(l=>l.letter).join(''),'TUMANEEN');
    const capTops=typography.letters.map(l=>l.y);
    assert(Math.max(...capTops)-Math.min(...capTops)<2,'Masthead cap tops must align');
    const radius=typography.moon.width/2;
    const centerX=typography.moon.x+radius;
    const centerY=typography.moon.y+radius;
    typography.letters.forEach((letter,index)=>{
      assert(letter.width>8&&letter.height>20,'Letter collapsed: '+letter.letter);
      assert(letter.x>=0&&letter.right<=width,'Letter cropped by viewport');
      if(index) assert(letter.x-typography.letters[index-1].right>1,'Adjacent letters touch');
      const nearestX=Math.min(letter.right,Math.max(letter.x,centerX));
      const dx=Math.abs(nearestX-centerX);
      if(dx<radius){
        const moonEdge=centerY-Math.sqrt(radius*radius-dx*dx);
        assert(letter.bottom<moonEdge-2,'Moon obscures a masthead letter');
      }
    });
    const finish = await page.locator('.tm-explorer-hero').evaluate(hero=>{
      const grain=getComputedStyle(hero.querySelector('.tm-explorer-film-grain'));
      const image=getComputedStyle(hero.querySelector('.tm-explorer-foreground'));
      const moon=getComputedStyle(hero.querySelector('.tm-explorer-moon'));
      const tagline=getComputedStyle(hero.querySelector('.tm-explorer-tagline'));
      return {grainOpacity:Number(grain.opacity),grainEvents:grain.pointerEvents,
        grainImage:grain.backgroundImage,imageFilter:image.filter,moonFilter:moon.filter,
        typeFilter:tagline.filter,lineHeight:parseFloat(tagline.lineHeight)/parseFloat(tagline.fontSize)};
    });
    assert(finish.grainOpacity>0&&finish.grainOpacity<.04,'Film grain must stay subtle');
    assert.equal(finish.grainEvents,'none','Film layer must not intercept controls');
    assert(finish.grainImage.includes('data:image/svg+xml'),'Lightweight static grain missing');
    assert(finish.imageFilter.includes('sepia')&&!finish.imageFilter.includes('blur'),'Foreground film grade should be gentle, not blurred');
    assert(finish.moonFilter.includes('contrast')&&!finish.moonFilter.includes('blur'),'Moon must retain sharp craters');
    assert.equal(finish.typeFilter,'none','Do not blur/grade the tagline');
    assert(finish.lineHeight>=1,'Visual Explorer lines need breathing room');

    const still=await angle(page); await wait(page,240);
    assert.equal(await angle(page),still,'Reduced motion should stop automatic rotation');
    const canvas=page.locator('.tm-explorer-moon canvas');
    await canvas.focus();
    await page.keyboard.press('ArrowRight');
    assert(Math.abs(delta(still,await angle(page))-15)<.02,'Keyboard step should be 15 degrees');
    for(let i=0;i<23;i++) await page.keyboard.press('ArrowRight');
    assert(Math.min(delta(still,await angle(page)),delta(await angle(page),still))<.03,'Twenty-four steps must complete 360 degrees');
    await page.keyboard.press('Home');
    await canvas.evaluate(el=>el.blur());
    await page.locator('.tm-explorer-hero').screenshot({path:`editorial-snapshots/hero-${width}.png`});

    await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    assert(await page.getByRole('navigation',{name:'Portfolio navigation',exact:true}).isVisible(),'Hero navigation did not open');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.tm-explorer-nav').count(),0,'Escape should close menu');

    for(const id of ['home','posters','project','process','about','services','contact-form'])
      assert.equal(await page.locator('#'+id).count(),1,'Section missing: '+id);
    assert.equal(await page.locator('.tm-ma-exhibit').count(),6,'Museum archive changed');
    assert.equal(await page.locator('.tm-ma-primary-paper img,.tm-ma-secondary-paper img').count(),8,'Original posters changed');
    assert.equal(await page.locator('.tm-hung-study').count(),4,'Four hanging case studies changed');
    assert.equal(await page.locator('.tm-hung-clip').count(),8,'Original project clips changed');

    if(width===1440){
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.waitForFunction(()=>document.querySelector('.tm-explorer-moon')?.dataset.animating==='true');
      const before=await angle(page);await wait(page,900);const after=await angle(page);
      assert(delta(before,after)>1,'WebGL surface is not rotating');
      await page.getByRole('button',{name:'Pause moon rotation'}).click();
      const stopped=await angle(page);await wait(page,250);
      assert.equal(await angle(page),stopped,'Pause button did not stop rotation');
      await canvas.focus();await page.keyboard.press('ArrowRight');
      assert(Math.abs(delta(stopped,await angle(page))-15)<.02,'Paused moon must still allow manual rotation');
      await page.getByRole('button',{name:'Resume moon rotation'}).click();
      await page.locator('#posters').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('.tm-explorer-moon')?.dataset.animating==='false');
      const offscreen=await angle(page);await wait(page,250);
      assert.equal(await angle(page),offscreen,'Offscreen animation was not suspended');

      await page.getByRole('button',{name:'Open LUMERA case study',exact:true}).click();
      await page.locator('.tm-case-modal').waitFor({state:'visible'});
      await page.keyboard.press('Escape');await page.locator('.tm-case-modal').waitFor({state:'hidden'});
      await page.getByRole('button',{name:'Open Poster Typography case study',exact:true}).click();
      await page.locator('.tm-epok-study-overlay').waitFor({state:'visible'});
      assert.equal(await page.locator('.tm-epok-study-thumbnails button').count(),3,'Grouped posters lost');
      await page.keyboard.press('Escape');await page.locator('.tm-epok-study-overlay').waitFor({state:'hidden'});
      await page.locator('.tm-explorer-hero').scrollIntoViewIfNeeded();
      await page.emulateMedia({reducedMotion:'reduce'});
      await canvas.focus();await page.keyboard.press('Home');
      await page.keyboard.press('ArrowRight');
      await page.locator('.tm-explorer-hero').screenshot({path:'editorial-snapshots/hero-1440-rotated.png'});
    }
    assert.deepEqual(errors,[],'Browser runtime error');
    await page.close();
  }

  // Missing WebGL and blocked web fonts must not hide navigation or typography.
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
  await fallback.waitForFunction(()=>document.querySelector('.tm-explorer-moon')?.dataset.renderMode==='fallback');
  await fallback.waitForFunction(()=>document.querySelector('.tm-explorer-masthead')?.dataset.typeReady==='true');
  assert(await fallback.locator('.tm-retro-moon-fallback').isVisible(),'Static fallback missing');
  assert(await fallback.locator('.tm-explorer-masthead').isVisible(),'Fallback typography missing');
  await fallback.screenshot({path:'editorial-snapshots/hero-fallback.png'});
  await fallback.close();
  console.log('PASS: live typography fit, gentle film finish, full-screen hero, 360-degree rotation, pause, reduced motion, fallback and preserved portfolio.');
}finally{await browser.close();}
