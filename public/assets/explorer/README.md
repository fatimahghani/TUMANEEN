# Visual Explorer — coded hero

The hero is not a screenshot of the approved design. Its layers are independently editable:

- `ReadingNookHero.tsx`: semantic H1, eight real SVG text characters, HTML Visual Explorer tagline, navigation and motion controls.
- `ReadingNookHero.css` lays out the full-screen cream sky and its fine paper grain. The masthead uses Bodoni Moda and the tagline uses Fraunces.
- `particleMoon.ts` draws the moon with individually shaded WebGL points. The NASA map gives each grain its tone, so the packed center shows the lunar maria and craters. Along the upper-right limb the grains thin out, exposing the sky between them.
- `lunarDust.ts` carries finer grains outward from the dissolving rim. Moving the cursor across the surface or plume displaces nearby grains.
- `RotatingMoon.tsx` coordinates the 48-second rotation, dust motion, pause control and visibility. `RotatingMoon.css` positions the moon at each viewport size. `lunarFallback.ts` draws the same grain set in 2D when WebGL is unavailable.
- `astronaut.webp` is a 2169 × 661 transparent foreground. A woman wearing a cream astronaut helmet with an opaque mirrored visor sits facing right on a sunlit rock ledge, her arms resting on her raised knees.

The reference is an art-direction target, not a claim of pixel-identical rendering on every viewport. The layout adapts for narrow and ultrawide screens without a centered portrait card.

The moon uses `../retro/moon-nasa-lroc-2k.jpg`, already in this repository. Source: NASA Scientific Visualization Studio CGI Moon Kit, https://svs.gsfc.nasa.gov/4720/ . Credit: NASA's Scientific Visualization Studio / Ernie Wright (USRA) / Noah Petro (NASA/GSFC).

Move the cursor through the particle stream to scatter the grains. The pause button freezes the current composition. Reduced motion presents a still moon and particle field. Touch gestures scroll the portfolio, and rendering suspends offscreen and in hidden tabs.
