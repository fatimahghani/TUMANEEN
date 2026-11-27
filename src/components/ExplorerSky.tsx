import React from 'react';

// Fixed coordinates keep the decorative sky stable across renders and hydration.
// Stars do not flicker; the shared opening sky can drift with the camera.
const STARS: ReadonlyArray<readonly [number, number, number, 'cross' | 'dot']> = [
  [7, 63, 3, 'dot'], [16, 54, 10, 'cross'], [28, 45.5, 8, 'cross'],
  [71.5, 47.5, 8, 'cross'], [78, 53.5, 10, 'cross'], [91, 60, 8, 'cross'],
  [86.5, 74, 6, 'cross'], [79.5, 76, 9, 'cross'], [73.5, 83, 3, 'dot'],
  [27, 74, 7, 'cross'], [10, 70, 2, 'dot'], [20, 61, 2, 'dot'],
  [92, 66, 2, 'dot'], [84, 58, 2, 'dot'],
];
const PANORAMA_STARS: typeof STARS = [
  [111, 63, 9, 'cross'], [122, 37, 3, 'dot'], [132, 48, 8, 'cross'],
  [141, 75, 7, 'cross'], [152, 54, 10, 'cross'], [163, 33, 3, 'dot'],
  [175, 67, 8, 'cross'], [188, 46, 3, 'dot'],
];

/** Decorative DOM/CSS only; no screenshot, downloaded stars, or canvas loop. */
export const ExplorerSky: React.FC<{ panorama?: boolean }> = ({ panorama = false }) => (
  <div className="tm-explorer-sky" aria-hidden="true" data-celestial-background="true">
    <span className="tm-explorer-stardust tm-explorer-stardust--left" />
    <span className="tm-explorer-stardust tm-explorer-stardust--right" />
    {panorama && <span className="tm-explorer-stardust tm-explorer-stardust--beyond" />}
    {(panorama ? [...STARS, ...PANORAMA_STARS] : STARS).map(([x, y, size, kind], index) => (
      <span
        key={index}
        className={'tm-explorer-star tm-explorer-star--' + kind}
        style={{ left: x + '%', top: y + '%', '--star-size': size + 'px' } as React.CSSProperties}
      />
    ))}
  </div>
);
