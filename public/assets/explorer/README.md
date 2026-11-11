# Visual Explorer — coded hero

The hero is not a screenshot of the approved design. Its layers are independently editable:

- `ReadingNookHero.tsx`: semantic H1, eight real SVG text characters, HTML Visual Explorer tagline, navigation and motion controls.
- `ReadingNookHero.css` lays out the full-screen cream sky and its fine paper grain. The masthead uses Bodoni Moda and the tagline uses Fraunces.
- `RotatingMoon.tsx` projects the NASA map onto a sphere under fixed lighting. A 48-second revolution carries the craters around the globe. Pointer movement across the hero adds an eased horizontal and vertical turn.
- `lunarDust.ts` draws fine grains close to the lunar rim. They move with the surface, disperse near the pointer and settle as it moves away.
- `RotatingMoon.css`: viewport-dependent moon position and round silhouette, plus a static fallback.
- `astronaut.webp` is a 2169 × 661 transparent foreground. A woman wearing a cream astronaut helmet with an opaque mirrored visor sits facing right on a sunlit rock ledge, her arms resting on her raised knees.

The reference is an art-direction target, not a claim of pixel-identical rendering on every viewport. The layout adapts for narrow and ultrawide screens without a centered portrait card.

The moon uses `../retro/moon-nasa-lroc-2k.jpg`, already in this repository. Source: NASA Scientific Visualization Studio CGI Moon Kit, https://svs.gsfc.nasa.gov/4720/ . Credit: NASA's Scientific Visualization Studio / Ernie Wright (USRA) / Noah Petro (NASA/GSFC).

Move the pointer across the hero to turn the moon toward it. Drag the moon or use the arrow keys to explore, and press Home to reset the view. On touchscreens, horizontal swipes rotate the moon and vertical swipes scroll the page. Pausing or selecting reduced motion disables automatic spin, pointer tracking and dust while keeping manual controls available. Rendering suspends offscreen and in hidden tabs.
