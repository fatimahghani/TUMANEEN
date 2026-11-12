# Visual Explorer — coded hero

The hero is composed of editable type, canvas particles and a transparent foreground.

- `ReadingNookHero.tsx` arranges the hero, menu, Visual Explorer tagline and link to the poster archive.
- `ReadingNookHero.css` lays out the full-screen cream sky and its fine paper grain. `ExplorerMasthead.tsx` and `HeroTypography.css` set the TUMANEEN wordmark and the Visual Explorer caption. The six original capitals are drawn in SVG path notation in `scripts/build-masthead-font.py`. Running the script with Python and fontTools rebuilds the bundled Tumaneen Titling webfont.
- `CometCursor.tsx` and `CometCursor.css` draw a glowing point with a short tapered trail, inspired by Daniel Ingrassia’s portfolio (https://ingrassiadaniel.it/). The point opens into a ring over links and buttons. Text fields, reduced motion and touch keep the system’s usual pointer behavior.
- `particleMoon.ts` draws the moon with individually shaded WebGL points. The NASA map gives each grain its tone, so the packed center shows the lunar maria and craters. A silver highlight follows the direction of the cursor all the way around the rim. With the cursor outside the hero, the light returns to center.
- `lunarDust.ts` carries grains outward around the rim. The dust and the surface share one grain diameter in `lunarGrain.ts`. Moving the cursor across either layer lights that side and displaces nearby grains.
- `RotatingMoon.tsx` coordinates the 48-second rotation, dust motion and visibility. `RotatingMoon.css` positions the moon at each viewport size. `lunarFallback.ts` draws the same grain set in 2D when WebGL is unavailable.
- `astronaut.webp` is a 2169 × 661 transparent foreground. A woman wearing a cream astronaut helmet with an opaque mirrored visor sits facing right on a sunlit rock ledge, her arms resting on her raised knees.

The reference is an art-direction target, not a claim of pixel-identical rendering on every viewport. The layout adapts for narrow and ultrawide screens without a centered portrait card.

The moon uses `../retro/moon-nasa-lroc-2k.jpg`, already in this repository. Source: NASA Scientific Visualization Studio CGI Moon Kit, https://svs.gsfc.nasa.gov/4720/ . Credit: NASA's Scientific Visualization Studio / Ernie Wright (USRA) / Noah Petro (NASA/GSFC).

With the system’s reduced-motion setting enabled, the moon and dust stay still. Touch gestures scroll the portfolio, and rendering suspends offscreen and in hidden tabs.
