# Visual Explorer — coded hero

The hero is not a screenshot of the approved design. Its layers are independently editable:

- `ReadingNookHero.tsx`: semantic H1, eight real SVG text characters, HTML Visual Explorer tagline, navigation and motion controls.
- `ReadingNookHero.css` lays out the full-screen cream sky and its fine paper grain. The masthead uses Bodoni Moda and the tagline uses Fraunces.
- `RotatingMoon.tsx` projects the NASA map onto a charcoal-black sphere. Fixed side lighting reveals the craters as the surface completes one revolution every 48 seconds.
- `lunarDust.ts` sends fine grains outward from the face and rim. Nearby grains deflect around the cursor and ease back into the stream as it passes.
- `RotatingMoon.css`: viewport-dependent moon position and round silhouette, plus a static fallback.
- `astronaut.webp` is a 2169 × 661 transparent foreground. A woman wearing a cream astronaut helmet with an opaque mirrored visor sits facing right on a sunlit rock ledge, her arms resting on her raised knees.

The reference is an art-direction target, not a claim of pixel-identical rendering on every viewport. The layout adapts for narrow and ultrawide screens without a centered portrait card.

The moon uses `../retro/moon-nasa-lroc-2k.jpg`, already in this repository. Source: NASA Scientific Visualization Studio CGI Moon Kit, https://svs.gsfc.nasa.gov/4720/ . Credit: NASA's Scientific Visualization Studio / Ernie Wright (USRA) / Noah Petro (NASA/GSFC).

Move the cursor through the particle stream to scatter the grains. The pause button freezes the current composition. Reduced motion presents a still moon and particle field. Touch gestures scroll the portfolio, and rendering suspends offscreen and in hidden tabs.
