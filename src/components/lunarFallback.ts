function smoothstep(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

// The fallback projects the same seeded lunar grains at longitude zero.
// Gaps in the silhouette are transparent all the way through to the paper.
export function drawLunarFallback(
  canvas: HTMLCanvasElement,
  grains: Float32Array,
  diameter: number,
  dpr: number,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || diameter <= 0) return;

  const side = diameter * 1.1;
  const pixels = Math.max(1, Math.min(2200, Math.round(side * Math.min(dpr, 1.6))));
  if (canvas.width !== pixels || canvas.height !== pixels) {
    canvas.width = pixels;
    canvas.height = pixels;
  }
  const scale = pixels / side;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, side, side);
  if (!grains.length) return;

  const center = side / 2;
  const moonRadius = diameter / 2;
  const count = grains.length / 8;
  const spacing = diameter / Math.sqrt(count);
  const tones = Array.from({ length: 32 }, () => new Path2D());

  for (let i = 0; i < grains.length; i += 8) {
    const x = grains[i], y = grains[i + 1], z = grains[i + 2];
    if (z <= 0) continue;
    const rock = grains[i + 3], size = grains[i + 4];
    const erosion = grains[i + 5], drift = grains[i + 6], sheen = grains[i + 7];

    // A denser left limb grades into isolated grains on the upper-right edge.
    const radial = Math.hypot(x, y);
    const unitX = x / Math.max(.0001, radial);
    const unitY = y / Math.max(.0001, radial);
    const east = smoothstep(-.18, .78, .97 * unitX + .24 * unitY);
    const onset = .77 + .018 * Math.sin(12 * unitY + 3 * unitX) + .009 * Math.sin(29 * unitY);
    const fray = smoothstep(onset, .995, radial) * east;
    if (erosion < .965 * fray ** 1.2) continue;
    const outward = fray * fray * (drift - .32) * (.016 + .065 * erosion);
    const px = center + moonRadius * (x + outward);
    const py = center - moonRadius * (y + .28 * outward);
    const innerSize = spacing * (2.65 + 1.4 * size);
    const edgeSize = .72 + 1.05 * size;
    const r = .5 * (innerSize + (edgeSize - innerSize) * fray);

    const light = Math.max(0, -.46 * x + .52 * y + .72 * z);
    const glint = sheen > .975 ? (sheen - .975) * (1200 + 1400 * east) : 0;
    const value = 8 + 12 * light + rock * rock * (16 + 34 * light) + 7 * size + glint;
    const tone = Math.min(tones.length - 1, Math.round(value / 4));
    const path = tones[tone];
    if (fray > .18 && size > .62) {
      path.rect(px - r, py - r, 2 * r, 2 * r);
    } else {
      path.moveTo(px + r, py);
      path.arc(px, py, r, 0, Math.PI * 2);
    }
  }

  for (let tone = 0; tone < tones.length; tone++) {
    const value = tone * 4;
    ctx.fillStyle = `rgb(${value + 1},${value},${Math.max(0, value - 1)})`;
    ctx.fill(tones[tone]);
  }
}
