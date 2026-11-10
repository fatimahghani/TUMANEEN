import React, { useLayoutEffect, useRef } from 'react';

const WORD = 'TUMANEEN';
const VIEW_WIDTH = 1600;
const VIEW_HEIGHT = 720;
const SIDE_BEARING = 12;
const LETTER_GAP = 16;

/**
 * Live, accessible SVG lettering, not outlined artwork or a raster headline.
 * A shared horizontal scale preserves relative glyph widths. Complete glyphs
 * follow a shallow editorial arch; the moon is only a clearance constraint,
 * so reducing it no longer stretches the outer letters down the whole screen.
 */
export const ExplorerMasthead: React.FC = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const heading = headingRef.current;
    const svg = svgRef.current;
    const hero = heading?.closest<HTMLElement>('.tm-explorer-hero');
    const moon = hero?.querySelector<HTMLElement>('.tm-explorer-moon');
    if (!heading || !svg || !hero || !moon) return;
    let disposed = false;
    let scheduled = 0;
    const context = document.createElement('canvas').getContext('2d');

    const fitLetters = () => {
      if (disposed) return;
      const texts = [...svg.querySelectorAll<SVGTextElement>('text')];
      const boxes = texts.map((text) => {
        if (context) {
          const style = getComputedStyle(text);
          context.font = `${style.fontStyle} ${style.fontWeight} 100px ${style.fontFamily}`;
          context.textBaseline = 'alphabetic';
          const metrics = context.measureText(text.textContent || '');
          const width = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
          const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
          if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
            return { x: -metrics.actualBoundingBoxLeft, y: -metrics.actualBoundingBoxAscent, width, height };
          }
        }
        return text.getBBox();
      });
      const bounds = svg.getBoundingClientRect();
      const globe = moon.getBoundingClientRect();
      if (!bounds.width || !bounds.height || boxes.some((box) => box.width <= 0 || box.height <= 0)) return;

      const scaleX = (VIEW_WIDTH - 2 * SIDE_BEARING - LETTER_GAP * (texts.length - 1)) /
        boxes.reduce((sum, box) => sum + box.width, 0);
      const radius = globe.width / 2;
      const centerX = globe.left + radius;
      const centerY = globe.top + radius;
      const clearance = Math.max(10, Math.min(20, bounds.width * .01));
      let cursor = SIDE_BEARING;

      texts.forEach((text, index) => {
        const box = boxes[index];
        const width = box.width * scaleX;
        const left = bounds.left + cursor / VIEW_WIDTH * bounds.width;
        const right = bounds.left + (cursor + width) / VIEW_WIDTH * bounds.width;
        const midpoint = (cursor + width / 2) / VIEW_WIDTH;
        const distanceFromMiddle = Math.abs(2 * midpoint - 1);
        const editorialHeight = VIEW_HEIGHT * (.50 + .46 * Math.pow(distanceFromMiddle, 1.6));
        const nearestX = Math.min(right, Math.max(left, centerX));
        const distance = Math.abs(nearestX - centerX);
        const moonCeiling = distance < radius
          ? centerY - Math.sqrt(Math.max(0, radius * radius - distance * distance)) - clearance
          : bounds.bottom;
        const availableHeight = (moonCeiling - bounds.top) * VIEW_HEIGHT / bounds.height - 8;
        const height = Math.max(80, Math.min(editorialHeight, availableHeight));
        const scaleY = height / box.height;
        text.parentElement?.setAttribute('transform',
          `matrix(${scaleX} 0 0 ${scaleY} ${cursor - box.x * scaleX} ${8 - box.y * scaleY})`);
        cursor += width + LETTER_GAP;
      });
      svg.dataset.typeReady = 'true';
    };

    const scheduleFit = () => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(fitLetters);
    };
    fitLetters();
    document.fonts.ready.then(() => { if (!disposed) scheduleFit(); });
    document.fonts.addEventListener('loadingdone', scheduleFit);
    const observer = new ResizeObserver(scheduleFit);
    observer.observe(hero);
    observer.observe(moon);
    observer.observe(heading);
    return () => {
      disposed = true;
      cancelAnimationFrame(scheduled);
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', scheduleFit);
    };
  }, []);

  return (
    <h1 id="tm-hero-title" className="tm-explorer-heading" ref={headingRef}>
      <span className="tm-explorer-sr">TUMANEEN</span>
      <svg ref={svgRef} viewBox="0 0 1600 720" preserveAspectRatio="none"
        aria-hidden="true" focusable="false" className="tm-explorer-masthead"
        data-type-ready="false">
        {WORD.split('').map((letter, index) => (
          <g key={index}>
            <text x="0" y="0" fontSize="100" data-explorer-letter={letter}>{letter}</text>
          </g>
        ))}
      </svg>
    </h1>
  );
};
