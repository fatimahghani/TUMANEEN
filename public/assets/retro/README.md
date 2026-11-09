# TUMANEEN / Retro Visual Explorer assets

- `visual-explorer-poster.webp`: adapted and compressed from the approved original TUMANEEN retro poster artwork. The central lunar image has been replaced with a red field so the live 3D globe can move independently while the seated figure and lettering remain still.
- `moon-nasa-lroc-2k.jpg`: 2K LROC lunar color map from [NASA Scientific Visualization Studio — CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/). Credit: NASA's Scientific Visualization Studio / Ernie Wright (USRA) / Noah Petro (NASA/GSFC). Used as the 360° sphere's surface texture.

The live globe is drawn with WebGL by `src/components/RotatingMoon.tsx`. A static texture fallback and reduced-motion behavior are provided.
