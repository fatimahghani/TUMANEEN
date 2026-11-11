type PointerPosition = { x: number; y: number };

const TAU = Math.PI * 2;
const CANVAS_SCALE = 1.5;
const FIELD_RADIUS = .33;
const MAX_GRAINS = 1800;
const OPACITY_STEPS = 12;

// Each broad fan has a denser center. Narrow jets break across the gaps.
const PLUMES = [
  { angle: -2.70, width: .55, bend: -.14, weight: 16 },
  { angle: -2.19, width: .17, bend: .07, weight: 8 },
  { angle: -1.47, width: .39, bend: -.10, weight: 9 },
  { angle: -.76, width: .58, bend: .15, weight: 18 },
  { angle: -.45, width: .14, bend: .09, weight: 10 },
  { angle: .22, width: .34, bend: -.10, weight: 7 },
  { angle: 1.31, width: .54, bend: -.12, weight: 6 },
  { angle: 2.57, width: .50, bend: .11, weight: 13 },
];
const TOTAL_WEIGHT = PLUMES.reduce((sum, plume) => sum + plume.weight, 0);

function plumeAt(weight: number) {
  for (const plume of PLUMES) {
    if (weight < plume.weight) return plume;
    weight -= plume.weight;
  }
  return PLUMES[PLUMES.length - 1];
}

// Silver over the lunar surface, graphite as grains emerge onto warm paper.
const INK = Array.from({ length: 8 }, (_, index) => {
  const t = index / 7;
  return `rgb(${Math.round(214 - 155 * t)}, ${Math.round(206 - 157 * t)}, ${Math.round(194 - 151 * t)})`;
});

function makeGrains() {
  let seed = 49317;
  function random() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  return Array.from({ length: MAX_GRAINS }, () => {
    const plume = plumeAt(random() * TOTAL_WEIGHT);
    const stray = random() < .16;
    const angle = stray ? random() * TAU : plume.angle + (random() + random() - 1) * plume.width;
    const origin = random() < .25 ? .12 + .64 * random() : .77 + .20 * random();
    const edge = 1.22 + .25 * random();
    return {
      angle,
      bend: plume.bend + (random() - .5) * .12,
      origin,
      distance: edge - origin,
      life: random(),
      duration: 3.3 + random() * 3.7,
      size: stray ? .38 + random() * .45 : .49 + random() ** 2 * .99,
      opacity: (stray ? .31 : .46) + random() * .39,
      sliver: !stray && random() < .11,
      offsetX: 0, offsetY: 0,
      px: 0, py: 0, ux: 0, uy: 0,
    };
  });
}

export function createLunarDust(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const grains = makeGrains();
  const batches: number[][] = Array.from({ length: INK.length * OPACITY_STEPS }, () => []);
  let radius = 0, center = 0, count = 0;

  function resize(diameter: number, dpr: number) {
    radius = diameter / 2;
    const side = Math.max(1, diameter * CANVAS_SCALE);
    center = side / 2;
    count = Math.round(Math.min(MAX_GRAINS, Math.max(660, diameter * 2.45)));
    const pixels = Math.max(1, Math.min(2200, Math.round(side * Math.min(dpr, 1.6))));
    if (canvas.width !== pixels || canvas.height !== pixels) {
      canvas.width = pixels;
      canvas.height = pixels;
    }
    ctx?.setTransform(pixels / side, 0, 0, pixels / side, 0, 0);
  }

  function draw(dt: number, pointer: PointerPosition | null) {
    if (!ctx || !radius) return;
    ctx.clearRect(0, 0, center * 2, center * 2);
    const step = Math.min(.1, Math.max(0, dt));
    const repel = 1 - Math.exp(-18 * step);
    const settle = 1 - Math.exp(-5 * step);
    const dotScale = Math.max(.80, Math.min(1.25, radius / 310));
    for (const batch of batches) batch.length = 0;

    for (let i = 0; i < count; i++) {
      const grain = grains[i];
      grain.life = (grain.life + step / grain.duration) % 1;
      const life = grain.life;
      const distance = grain.origin + grain.distance * life;
      const direction = grain.angle + grain.bend * life * life;
      grain.ux = Math.cos(direction);
      grain.uy = Math.sin(direction);
      const restX = grain.ux * distance, restY = grain.uy * distance;
      let pushX = 0, pushY = 0;
      if (pointer) {
        const dx = restX - pointer.x, dy = restY - pointer.y;
        const squared = dx * dx + dy * dy;
        if (squared < FIELD_RADIUS * FIELD_RADIUS) {
          const gap = Math.sqrt(squared);
          const force = .24 * (1 - gap / FIELD_RADIUS) ** 2;
          pushX = force * (gap > .001 ? dx / gap : grain.ux);
          pushY = force * (gap > .001 ? dy / gap : grain.uy);
        }
      }
      const ease = pushX || pushY ? repel : settle;
      grain.offsetX += (pushX - grain.offsetX) * ease;
      grain.offsetY += (pushY - grain.offsetY) * ease;
      const x = restX + grain.offsetX, y = restY + grain.offsetY;
      const margin = CANVAS_SCALE - Math.max(Math.abs(x), Math.abs(y));
      const fade = Math.max(0, Math.min(1, life * 9, (1 - life) * 5, margin * 12));
      const opacity = Math.round(grain.opacity * fade * OPACITY_STEPS);
      if (!opacity) continue;
      const level = Math.max(0, Math.min(1, (x * x + y * y - .95) * 10));
      const ink = Math.round(level * (INK.length - 1));
      grain.px = center + x * radius;
      grain.py = center + y * radius;
      batches[ink * OPACITY_STEPS + opacity - 1].push(i);
    }

    // Share a fill for grains of the same tone and opacity, including tapered flecks.
    for (let b = 0; b < batches.length; b++) {
      const batch = batches[b];
      if (!batch.length) continue;
      ctx.fillStyle = INK[Math.floor(b / OPACITY_STEPS)];
      ctx.globalAlpha = ((b % OPACITY_STEPS) + 1) / OPACITY_STEPS;
      ctx.beginPath();
      for (const index of batch) {
        const {px, py, ux, uy, size, sliver} = grains[index];
        const r = size * dotScale;
        if (sliver) {
          ctx.moveTo(px - ux * r * 3.3, py - uy * r * 3.3);
          ctx.lineTo(px + ux * r + uy * r * .62, py + uy * r - ux * r * .62);
          ctx.lineTo(px + ux * r - uy * r * .62, py + uy * r + ux * r * .62);
          ctx.closePath();
        } else {
          ctx.moveTo(px + r, py);
          ctx.arc(px, py, r, 0, TAU);
        }
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function clear() {
    ctx?.clearRect(0, 0, center * 2, center * 2);
    for (const grain of grains) {
      grain.offsetX = 0;
      grain.offsetY = 0;
    }
  }

  return { resize, draw, clear };
}
