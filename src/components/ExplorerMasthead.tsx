import React, { useLayoutEffect, useRef } from 'react';

const WORD = 'TUMANEEN';
const VIEW_WIDTH = 1600;
const VIEW_HEIGHT = 720;
const SIDE_BEARING = 12;
const LETTER_GAP = 22;

/**
 * Preserve the approved tall, arched display word without cropping the U, M,
 * A or E with an arbitrary clip path. A single horizontal scale preserves the
 * font's relative character widths; each complete glyph fits above the moon.
 * All eight letters remain editable SVG text rather than outlined imagery.
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

    const fitLetters = () => {
      if (disposed) return;
      const texts = [...svg.querySelectorAll<SVGTextElement>('text')];
      const boxes = texts.map((text) => text.getBBox());
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
        // Use the closest point to the lunar center so no part of a complete
        // letter is hidden behind the sphere at any responsive breakpoint.
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
    fitLetters(); // A readable system-font fallback is available immediately.
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
