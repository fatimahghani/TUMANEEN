import { GRAIN_DIAMETER } from './lunarGrain';

type PointerPosition = { x: number; y: number };

const CANVAS_SCALE = 1.5;
const FIELD_RADIUS = .27;
const MAX_GRAINS = 9000;
const OPACITY_STEPS = 8;
// The lit end of the scale picks up the warm tint of the paper sky.
const INK = ['#242322', '#393733', '#57544f', '#7b7770', '#a39d92', '#d1c9bc'];

function makeGrains() {
  let seed = 49317;
  function random() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  return Array.from({ length: MAX_GRAINS }, () => {
    const angle = random() * Math.PI * 2;
    const nx = Math.cos(angle), ny = Math.sin(angle);
    const irregularity = .016 * Math.sin(5 * angle + 1) + .009 * Math.sin(11 * angle);
    const origin = .875 + .113 * Math.sqrt(random()) + irregularity;
    const reach = .075 + .50 * random() ** 1.8;
    const crosswind = .11 * Math.sin(3 * angle + .7) + .16 * (random() - .5);
    return {
      nx, ny,
      originX: nx * origin,
      originY: ny * origin,
      travelX: reach * (nx - crosswind * ny),
      travelY: reach * (ny + crosswind * nx),
      curl: (random() - .5) * .17 + .075 * Math.sin(3 * angle),
      life: random(),
      speed: 1 / (3.1 + random() * 3.5),
      tone: random() ** 1.8 * 1.55,
      opacity: .48 + .41 * random(),
      dx: 0, dy: 0, px: 0, py: 0,
    };
  });
}

export function createLunarDust(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const grains = makeGrains();
  const batches: number[][] = Array.from({ length: INK.length * OPACITY_STEPS }, () => []);
  let radius = 0, side = 0, count = 0;
  let lightX = 0, lightY = 0;

  function resize(diameter: number, dpr: number) {
    radius = diameter * .5;
    side = Math.max(1, diameter * CANVAS_SCALE);
    count = Math.min(MAX_GRAINS, Math.max(2400, Math.round(diameter * 12)));
    const pixels = Math.max(1, Math.min(2200, Math.round(side * Math.min(dpr, 1.6))));
    if (canvas.width !== pixels || canvas.height !== pixels) {
      canvas.width = pixels;
      canvas.height = pixels;
    }
    ctx?.setTransform(pixels / side, 0, 0, pixels / side, 0, 0);
  }

  function draw(dt: number, pointer: PointerPosition | null) {
    if (!ctx || !radius) return;
    ctx.clearRect(0, 0, side, side);
    for (const batch of batches) batch.length = 0;
    const step = Math.min(.1, Math.max(0, dt));
    const repel = 1 - Math.exp(-18 * step);
    const settle = 1 - Math.exp(-5 * step);
    const lightEase = 1 - Math.exp(-14 * step);
    const distance = pointer ? Math.max(1, Math.hypot(pointer.x, pointer.y)) : 1;
    lightX += ((pointer ? pointer.x / distance : 0) - lightX) * lightEase;
    lightY += ((pointer ? pointer.y / distance : 0) - lightY) * lightEase;
    const center = side * .5;

    for (let i = 0; i < count; i++) {
      const grain = grains[i];
      grain.life = (grain.life + step * grain.speed) % 1;
      const t = grain.life;
      // Grains start slowly in close contact with the surface, then fan out.
      const travel = t * (.40 + .60 * t);
      const bend = t * t * (1 - t) * grain.curl;
      const restX = grain.originX + travel * grain.travelX - bend * grain.travelY;
      const restY = grain.originY + travel * grain.travelY + bend * grain.travelX;

      let pushX = 0, pushY = 0;
      if (pointer) {
        const dx = restX - pointer.x, dy = restY - pointer.y;
        const squared = dx * dx + dy * dy;
        if (squared < FIELD_RADIUS * FIELD_RADIUS) {
          const gap = Math.sqrt(squared);
          const force = .19 * (1 - gap / FIELD_RADIUS) ** 2 / Math.max(.002, gap);
          pushX = dx * force;
          pushY = dy * force;
        }
      }
      const ease = pushX || pushY ? repel : settle;
      grain.dx += (pushX - grain.dx) * ease;
      grain.dy += (pushY - grain.dy) * ease;
      const x = restX + grain.dx, y = restY + grain.dy;
      const margin = CANVAS_SCALE - Math.max(Math.abs(x), Math.abs(y));
      const fade = Math.max(0, Math.min(1, t * 12, (1 - t) * 6, margin * 12));
      const opacity = Math.round(grain.opacity * fade * OPACITY_STEPS);
      if (!opacity) continue;
      grain.px = center + x * radius;
      grain.py = center + y * radius;
      const facing = Math.max(0, grain.nx * lightX + grain.ny * lightY);
      const ink = Math.min(INK.length - 1, Math.round(grain.tone + facing ** 3 * 4.2));
      batches[ink * OPACITY_STEPS + opacity - 1].push(i);
    }

    // A few dozen shared paths draw thousands of flecks at subpixel positions.
    for (let b = 0; b < batches.length; b++) {
      const batch = batches[b];
      if (!batch.length) continue;
      ctx.fillStyle = INK[Math.floor(b / OPACITY_STEPS)];
      ctx.globalAlpha = (b % OPACITY_STEPS + 1) / OPACITY_STEPS;
      ctx.beginPath();
      for (const index of batch) {
        const grain = grains[index];
        ctx.rect(grain.px - GRAIN_DIAMETER / 2, grain.py - GRAIN_DIAMETER / 2, GRAIN_DIAMETER, GRAIN_DIAMETER);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function clear() {
    ctx?.clearRect(0, 0, side, side);
    lightX = 0;
    lightY = 0;
    for (const grain of grains) {
      grain.dx = 0;
      grain.dy = 0;
    }
  }

  return { resize, draw, clear };
}
