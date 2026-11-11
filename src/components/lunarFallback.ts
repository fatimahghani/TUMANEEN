import { GRAIN_DIAMETER } from './lunarGrain';

// Rasterize the grain field once. Cursor lighting can then be composited onto
// its existing alpha without rebuilding hundreds of thousands of tiny marks.
export function drawLunarFallback(canvas: HTMLCanvasElement, grains: Float32Array, diameter: number, dpr: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx || diameter <= 0) return;
  const side = diameter * 1.1;
  const pixels = Math.max(1, Math.min(2000, Math.round(side * dpr)));
  canvas.width = canvas.height = pixels;
  const unlit = document.createElement('canvas');
  unlit.width = unlit.height = pixels;
  const source = unlit.getContext('2d');
  if (!source) return;

  const bitmap = source.createImageData(pixels, pixels);
  const center = pixels * .5;
  const radius = center / 1.1;
  const halfGrain = .5 * GRAIN_DIAMETER * pixels / side;
  for (let i = 0; i < grains.length; i += 8) {
    const x = grains[i], y = grains[i + 1], z = grains[i + 2];
    const rock = grains[i + 3], threshold = grains[i + 5], drift = grains[i + 6], sheen = grains[i + 7];
    const radial = Math.hypot(x, y);
    const t = Math.max(0, Math.min(1, (radial - .83) / (.995 - .83)));
    const erosion = t * t * (3 - 2 * t);
    if (threshold >= (1 - erosion) ** 2.4) continue;
    const spread = 1 + erosion * erosion * (.01 + .038 * drift) / Math.max(.0001, radial);
    const px = center + radius * x * spread, py = center - radius * y * spread;
    const ambient = .35 + .65 * z;
    const tone = 255 * Math.max(.025, .032 + (.055 + .23 * rock * rock) * ambient + (sheen - .5) * .077);
    const left = Math.max(0, Math.ceil(px - halfGrain - .5));
    const right = Math.min(pixels, Math.ceil(px + halfGrain - .5));
    const top = Math.max(0, Math.ceil(py - halfGrain - .5));
    const bottom = Math.min(pixels, Math.ceil(py + halfGrain - .5));
    for (let row = top; row < bottom; row++) {
      let index = (row * pixels + left) * 4;
      for (let col = left; col < right; col++, index += 4) {
        bitmap.data[index] = tone * 1.025;
        bitmap.data[index + 1] = tone;
        bitmap.data[index + 2] = tone * .97;
        bitmap.data[index + 3] = 255;
      }
    }
  }
  source.putImageData(bitmap, 0, 0);
  ctx.drawImage(unlit, 0, 0);
  let lastX = 0, lastY = 0;
  return (x: number, y: number) => {
    if (Math.abs(x - lastX) + Math.abs(y - lastY) < .004) return;
    lastX = x; lastY = y;
    ctx.clearRect(0, 0, pixels, pixels);
    ctx.drawImage(unlit, 0, 0);
    const strength = Math.hypot(x, y);
    if (strength < .004) return;
    const dx = x * radius / strength, dy = y * radius / strength;
    const light = ctx.createLinearGradient(center, center, center + dx, center + dy);
    light.addColorStop(0, 'rgba(204,200,192,0)');
    light.addColorStop(.12, 'rgba(204,200,192,0)');
    light.addColorStop(.55, `rgba(204,200,192,${.18 * strength})`);
    light.addColorStop(1, `rgba(204,200,192,${.43 * strength})`);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, pixels, pixels);
    ctx.globalCompositeOperation = 'source-over';
  };
}
