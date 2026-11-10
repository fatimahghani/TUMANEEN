# Visual Explorer — coded hero

The hero is not a screenshot of the approved design. Its layers are independently editable:

- `ReadingNookHero.tsx`: semantic H1, eight real SVG text characters, HTML Visual Explorer tagline, navigation and motion controls.
- `ReadingNookHero.css`: responsive full-screen cream backdrop and composition. The condensed display face is Anton; tagline uses the portfolio's existing Fraunces.
- `RotatingMoon.tsx`: WebGL analytic sphere projection of the local NASA lunar map, white/ivory lighting and a 48-second 360-degree rotation. The geographic surface moves under fixed lighting; this is not CSS rotation of a flat picture.
- `RotatingMoon.css`: viewport-dependent moon position and round silhouette, plus a static fallback.
- `astronaut.webp`: 1100 × 327 transparent foreground, isolated from the latest user-approved helmeted explorer illustration. It contains only the seated astronaut and rock, with the original background and baked-in lettering removed. All lettering is rendered by the browser instead.

The reference is an art-direction target, not a claim of pixel-identical rendering on every viewport. The layout adapts for narrow and ultrawide screens without a centered portrait card.

The moon uses `../retro/moon-nasa-lroc-2k.jpg`, already in this repository. Source: NASA Scientific Visualization Studio CGI Moon Kit, https://svs.gsfc.nasa.gov/4720/ . Credit: NASA's Scientific Visualization Studio / Ernie Wright (USRA) / Noah Petro (NASA/GSFC).

Controls: drag the moon or use left/right arrows; Home resets its longitude; the pause button stops automatic motion. Reduced motion, hidden tabs and offscreen rendering suspend automatic rotation. No new runtime dependency was added. Assets honor Vite's BASE_URL for GitHub Pages deployment.
