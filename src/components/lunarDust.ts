type PointerPosition = { x: number; y: number };

const TAU = Math.PI * 2;
const CANVAS_SCALE = 1.5;
const FIELD_RADIUS = .33;
const MAX_GRAINS = 560;

// Broad fans and finer jets break up the contour of the otherwise circular moon.
const PLUMES = [
  { angle: -2.72, width: .68, bend: -.10 },
  { angle: -2.12, width: .23, bend: .08 },
  { angle: -1.39, width: .49, bend: -.07 },
  { angle: -.63, width: .68, bend: .15 },
  { angle: -.35, width: .23, bend: .11 },
  { angle: .24, width: .44, bend: -.09 },
  { angle: 1.31, width: .62, bend: -.11 },
  { angle: 2.48, width: .55, bend: .08 },
];

// Silver grains over the dark surface become charcoal as they cross onto paper.
const INK = Array.from({ length: 16 }, (_, index) => {
  const t = index / 15;
  return `rgb(${Math.round(214 - 155 * t)}, ${Math.round(206 - 157 * t)}, ${Math.round(194 - 151 * t)})`;
});

function makeGrains() {
  let seed = 49317;
  function random() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  return Array.from({ length: MAX_GRAINS }, () => {
    const plume = PLUMES[Math.floor(random() * PLUMES.length)];
    const angle = random() < .24 ? random() * TAU
      : plume.angle + (random() + random() - 1) * plume.width;
    const origin = random() < .32 ? .06 + .66 * random() : .75 + .23 * random();
    const edge = 1.20 + .26 * random();
    return {
      angle,
      bend: plume.bend + (random() - .5) * .12,
      origin,
      distance: edge - origin,
      life: random(),
      duration: 3.4 + random() * 3.3,
      size: .43 + random() ** 2 * 1.04,
      opacity: .40 + random() * .45,
      sliver: random() < .11,
      offsetX: 0,
      offsetY: 0,
    };
  });
}

export function createLunarDust(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const grains = makeGrains();
  let radius = 0;
  let center = 0;
  let count = 0;

  function resize(diameter: number, dpr: number) {
    radius = diameter / 2;
    const side = Math.max(1, diameter * CANVAS_SCALE);
    center = side / 2;
    count = Math.round(Math.min(MAX_GRAINS, Math.max(220, diameter * .76)));
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
    ctx.lineCap = 'round';

    for (let i = 0; i < count; i++) {
      const grain = grains[i];
      grain.life = (grain.life + step / grain.duration) % 1;
      const life = grain.life;
      const radialDistance = grain.origin + grain.distance * life;
      const direction = grain.angle + grain.bend * life * life;
      const ux = Math.cos(direction), uy = Math.sin(direction);
      const restX = ux * radialDistance, restY = uy * radialDistance;
      let pushX = 0, pushY = 0;
      if (pointer) {
        const dx = restX - pointer.x, dy = restY - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < FIELD_RADIUS) {
          const force = .24 * (1 - distance / FIELD_RADIUS) ** 2;
          pushX = force * (distance > .001 ? dx / distance : ux);
          pushY = force * (distance > .001 ? dy / distance : uy);
        }
      }
      const ease = pushX || pushY ? repel : settle;
      grain.offsetX += (pushX - grain.offsetX) * ease;
      grain.offsetY += (pushY - grain.offsetY) * ease;
      const x = restX + grain.offsetX, y = restY + grain.offsetY;
      const margin = CANVAS_SCALE - Math.max(Math.abs(x), Math.abs(y));
      const fade = Math.max(0, Math.min(1, life * 9, (1 - life) * 5, margin * 12));
      if (fade <= 0) continue;

      const inkLevel = Math.max(0, Math.min(1, (x * x + y * y - .95) * 10));
      const ink = INK[Math.round(inkLevel * (INK.length - 1))];
      const px = center + x * radius, py = center + y * radius;
      const size = grain.size * dotScale;
      ctx.globalAlpha = grain.opacity * fade;
      ctx.beginPath();
      if (grain.sliver) {
        ctx.strokeStyle = ink;
        ctx.lineWidth = size;
        ctx.moveTo(px - ux * size * 2.8, py - uy * size * 2.8);
        ctx.lineTo(px, py);
        ctx.stroke();
      } else {
        ctx.fillStyle = ink;
        ctx.arc(px, py, size, 0, TAU);
        ctx.fill();
      }
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
