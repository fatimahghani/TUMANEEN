import React, { useId, useLayoutEffect, useRef } from 'react';
import brushTexture from '../assets/fonts/brush-atlas.webp';
import atlas from '../assets/fonts/brush-atlas.json';
import './HeroTypography.css';

const WORD = 'TUMANEEN';
const MEASURE_SIZE = 100;
const ROW_GAP = 9;
const TRACKING = -2;
const INK_CLEARANCE = 1.1;
const BRUSH_WIDTH_FACTOR = 1.6;

// Register each scan to the font's baseline. A text element's SVG bounding
// box also includes its side bearings, so it cannot align the bristles.
function BrushPatterns({ id }: { id: string }) {
  const unit = MEASURE_SIZE / atlas.unitsPerEm;
  return (
    <defs>
      <image id={id} href={brushTexture} width={atlas.width} height={atlas.height} />
      {Object.entries(atlas.glyphs).map(([letter, column]) => (
        <pattern
          key={letter} id={`${id}-${letter}`} patternUnits="userSpaceOnUse"
          x={0} y={-atlas.baseline * unit}
          width={atlas.cellWidth * unit} height={atlas.height * unit}
          viewBox={`${column * atlas.cellWidth} 0 ${atlas.cellWidth} ${atlas.height}`}
        >
          <use href={`#${id}`} />
        </pattern>
      ))}
    </defs>
  );
}

// Measure the original ink edges before widening the whole line.
function measureLine(letters: SVGTextElement[], ctx: CanvasRenderingContext2D) {
  let pen = 0, lastRight = 0;
  let ascent = 0, descent = 0;
  const glyphs = letters.map((element, index) => {
    const char = element.textContent || '';
    const ink = ctx.measureText(char);
    if (index === 0) {
      pen = ink.actualBoundingBoxLeft;
    } else {
      const previous = letters[index - 1].textContent || '';
      const advance = ctx.measureText(previous + char).width - ink.width;
      pen = Math.max(pen + advance + TRACKING, lastRight + INK_CLEARANCE + ink.actualBoundingBoxLeft);
    }
    lastRight = pen + ink.actualBoundingBoxRight;
    ascent = Math.max(ascent, ink.actualBoundingBoxAscent);
    descent = Math.max(descent, ink.actualBoundingBoxDescent);
    return { element, x: pen };
  });
  return { glyphs, width: lastRight, ascent, descent };
}

export const ExplorerMasthead: React.FC = () => {
  const paintId = useId().replace(/:/g, '') + '-brush';
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const hero = svg?.closest<HTMLElement>('.tm-explorer-hero');
    const moon = hero?.querySelector<HTMLElement>('.tm-explorer-moon');
    const ctx = document.createElement('canvas').getContext('2d');
    if (!svg || !hero || !moon || !ctx) return;
    const portrait = window.matchMedia('(max-width: 600px) and (orientation: portrait)');
    const letters = [...svg.querySelectorAll<SVGTextElement>('text')];
    let scheduled = 0, disposed = false;

    const fit = () => {
      if (disposed) return;
      const bounds = svg.getBoundingClientRect();
      const clearance = Math.max(11, Math.min(26, bounds.width * .024));
      const moonTop = hero.getBoundingClientRect().top + moon.offsetTop;
      const height = Math.min(bounds.height, moonTop - bounds.top - clearance);
      if (height <= 0 || bounds.width <= 0) return;
      const style = getComputedStyle(letters[0]);
      ctx.font = `${style.fontStyle} ${style.fontWeight} ${MEASURE_SIZE}px ${style.fontFamily}`;
      ctx.fontKerning = 'normal';
      const groups = portrait.matches ? [letters.slice(0, 4), letters.slice(4)] : [letters];
      const lines = groups.map(group => measureLine(group, ctx));
      if (lines.some(line => !Number.isFinite(line.width + line.ascent + line.descent) || !line.width || !line.ascent)) {
        svg.dataset.typeReady = 'false';
        return;
      }
      const capHeight = Math.max(...lines.map(line => line.ascent + line.descent));
      const totalHeight = lines.length * capHeight + (lines.length - 1) * ROW_GAP;
      const widthFit = bounds.width / Math.max(...lines.map(line => line.width));
      const scaleY = Math.min(widthFit, height / totalHeight);
      // Widen the painted strokes and their texture together, up to the side margins.
      const scaleX = Math.min(widthFit, scaleY * BRUSH_WIDTH_FACTOR);
      const top = (height - totalHeight * scaleY) * (portrait.matches ? .66 : .56);
      svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      lines.forEach((line, row) => {
        const spare = Math.max(0, bounds.width - line.width * scaleX);
        // Keep the narrower brush letters together as one stacked title.
        const stagger = portrait.matches ? Math.min(spare / 2, bounds.width * .025) : 0;
        const left = spare / 2 + (row ? stagger : -stagger);
        const baseline = top + (row * (capHeight + ROW_GAP) + line.ascent) * scaleY;
        for (const { element, x } of line.glyphs) {
          element.parentElement?.setAttribute('transform', `translate(${left + x * scaleX} ${baseline}) scale(${scaleX} ${scaleY})`);
        }
      });
      svg.dataset.typeReady = 'true';
    };

    const schedule = () => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(fit);
    };
    fit();
    const paint = new Image();
    paint.src = brushTexture;
    Promise.all([paint.decode(), document.fonts.load(`400 ${MEASURE_SIZE}px "Tumaneen Brush"`, WORD)])
      .then(([, faces]) => {
        if (disposed || !faces.length) return;
        fit();
        svg.dataset.paintReady = 'true';
      })
      .catch(() => { /* Keep the solid, readable lettering when an asset is unavailable. */ });
    document.fonts.ready.then(() => { if (!disposed) schedule(); });
    document.fonts.addEventListener('loadingdone', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(svg);
    observer.observe(moon);
    return () => {
      disposed = true;
      cancelAnimationFrame(scheduled);
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', schedule);
    };
  }, []);

  return (
    <h1 id="tm-hero-title" className="tm-explorer-heading">
      <svg ref={svgRef} className="tm-explorer-masthead" aria-hidden="true" focusable="false" data-type-ready="false">
        <BrushPatterns id={paintId} />
        {[...WORD].map((letter, index) => (
          <g key={index}>
            <text
              x="0" y="0" fontSize={MEASURE_SIZE} data-explorer-letter={letter}
              style={{ '--brush-paint': `url(#${paintId}-${letter})` } as React.CSSProperties}
            >{letter}</text>
          </g>
        ))}
      </svg>
      <span className="tm-explorer-sr">{WORD}</span>
    </h1>
  );
};
