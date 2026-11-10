import React, { useLayoutEffect, useRef } from 'react';

const WORD = 'TUMANEEN';
const VIEW_WIDTH = 1600;
const VIEW_HEIGHT = 720;
const SIDE_BEARING = 12;
const LETTER_GAP = 22;

/** Eight editable letters, optically fitted above the moon without cutting
 * their strokes. The measuring canvas only supplies metrics; all visible
 * typography is SVG text, not a rasterized headline. */
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
    const measuringContext = document.createElement('canvas').getContext('2d');

    const fitLetters = () => {
      if (disposed) return;
      const texts = [...svg.querySelectorAll<SVGTextElement>('text')];
      // SVG getBBox can include font-cell whitespace. Canvas ink metrics let
      // rounded U/N and square E/T share the same visible cap line and gaps.
      const boxes = texts.map((text) => {
        if (measuringContext) {
          measuringContext.font = `400 100px ${getComputedStyle(text).fontFamily}`;
          measuringContext.textBaseline = 'alphabetic';
          const m = measuringContext.measureText(text.textContent || '');
          const width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
          const height = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
          if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
            return { x: -m.actualBoundingBoxLeft, y: -m.actualBoundingBoxAscent, width, height };
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
      const clearance = Math.max(9, Math.min(18, bounds.width * 0.009));
      let cursor = SIDE_BEARING;

      texts.forEach((text, index) => {
        const box = boxes[index];
        const width = box.width * scaleX;
        const left = bounds.left + cursor / VIEW_WIDTH * bounds.width;
        const right = bounds.left + (cursor + width) / VIEW_WIDTH * bounds.width;
        const nearestX = Math.min(right, Math.max(left, centerX));
        const distance = Math.abs(nearestX - centerX);
        const lowerEdge = distance < radius
          ? centerY - Math.sqrt(Math.max(0, radius * radius - distance * distance)) - clearance
          : bounds.bottom - clearance;
        const height = Math.max(120, Math.min(656,
          (lowerEdge - bounds.top) * VIEW_HEIGHT / bounds.height - 8));
        const scaleY = height / box.height;
        const translateX = cursor - box.x * scaleX;
        const translateY = 8 - box.y * scaleY;
        text.parentElement?.setAttribute('transform',
          `matrix(${scaleX} 0 0 ${scaleY} ${translateX} ${translateY})`);
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
