import React, { useLayoutEffect, useRef } from 'react';
import './HeroTypography.css';

const WORD = 'TUMANEEN';
const MEASURE_SIZE = 100;
const ROW_GAP = 8;

// Measure the ink at the font's native proportions. Keep the font's pair
// kerning, with a small optical clearance between neighboring serifs.
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
      pen = Math.max(pen + advance - 1.3, lastRight + 1.4 + ink.actualBoundingBoxLeft);
    }
    lastRight = pen + ink.actualBoundingBoxRight;
    ascent = Math.max(ascent, ink.actualBoundingBoxAscent);
    descent = Math.max(descent, ink.actualBoundingBoxDescent);
    return { element, x: pen };
  });
  return { glyphs, width: lastRight, ascent, descent };
}

export const ExplorerMasthead: React.FC = () => {
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
      const height = Math.min(bounds.height, moon.getBoundingClientRect().top - bounds.top - clearance);
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
      const scale = Math.min(bounds.width / Math.max(...lines.map(line => line.width)), height / totalHeight);
      const top = (height - totalHeight * scale) * (portrait.matches ? .66 : .56);
      // Screen-space coordinates give every glyph the same scale in both axes.
      svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      lines.forEach((line, row) => {
        const spare = bounds.width - line.width * scale;
        const left = portrait.matches ? (row ? spare : 0) : spare * .5;
        const baseline = top + (row * (capHeight + ROW_GAP) + line.ascent) * scale;
        for (const { element, x } of line.glyphs) {
          element.parentElement?.setAttribute('transform', `translate(${left + x * scale} ${baseline}) scale(${scale})`);
        }
      });
      svg.dataset.typeReady = 'true';
    };

    const schedule = () => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(fit);
    };
    fit();
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
        {[...WORD].map((letter, index) => (
          <g key={index}>
            <text x="0" y="0" fontSize={MEASURE_SIZE} data-explorer-letter={letter}>{letter}</text>
          </g>
        ))}
      </svg>
      <span className="tm-explorer-sr">{WORD}</span>
    </h1>
  );
};
