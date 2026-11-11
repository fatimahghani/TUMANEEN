type PointerPosition = { x: number; y: number };

const TAU = Math.PI * 2;
const PALETTE = ['#5b493d', '#715b49', '#8b7560', '#fff3d9'];

function makeGrains() {
  // Repeatable source patches keep the dust attached to the same lunar terrain.
  let seed = 49317;
  function random() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  return Array.from({ length: 32 }, (_, patch) => {
    const sunward = patch % 3 !== 1;
    const latitude = sunward ? -.2 - random() * .72 : .08 + random() * .55;
    const longitude = (patch + random() * .7) * TAU / 32;
    return Array.from({ length: 10 }, () => {
      const lon = longitude + (random() - .5) * .39;
      const lat = latitude + (random() - .5) * .21;
      return {
        x: Math.cos(lat) * Math.sin(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.cos(lon),
        side: sunward ? 1 : -1,
        period: 3.6 + random() * 5.4,
        phase: random(),
        reach: .018 + random() * .105,
        size: .46 + random() ** 2 * .85,
        ink: PALETTE[Math.floor(random() * PALETTE.length)],
        opacity: .32 + random() * .47,
        driftX: 0,
        driftY: 0,
      };
    });
  }).flat();
}

export function createLunarDust(canvas: HTMLCanvasElement) {
  const grains = makeGrains();
  const ctx = canvas.getContext('2d');
  let rimRadius = 0;
  let center = 0;
  let clock = 0;

  function resize(diameter: number, dpr: number) {
    rimRadius = diameter / 2;
    const side = Math.max(1, diameter * 1.2);
    center = side / 2;
    const pixels = Math.max(1, Math.round(side * Math.min(dpr, 1.6)));
    if (canvas.width !== pixels || canvas.height !== pixels) {
      canvas.width = pixels;
      canvas.height = pixels;
    }
    ctx?.setTransform(pixels / side, 0, 0, pixels / side, 0, 0);
  }

  function draw(dt: number, yaw: number, pitch: number, pointer: PointerPosition | null) {
    if (!ctx || !rimRadius) return;
    ctx.clearRect(0, 0, center * 2, center * 2);
    const step = Math.max(0, Math.min(dt, .1));
    clock += step;
    const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
    const scatter = 1 - Math.exp(-15 * step);
    const settle = 1 - Math.exp(-5 * step);
    const dotScale = Math.max(.83, Math.min(1.35, rimRadius / 330));

    for (const grain of grains) {
      const x = cosYaw * grain.x + sinYaw * grain.z;
      const depth = cosYaw * grain.z - sinYaw * grain.x;
      const y = cosPitch * grain.y + sinPitch * depth;
      const z = cosPitch * depth - sinPitch * grain.y;
      // Two loose, asymmetrical plumes, one on each side of the silhouette.
      if (x * grain.side <= 0 || Math.abs(z) > .62) {
        grain.driftX *= 1 - settle;
        grain.driftY *= 1 - settle;
        continue;
      }
      const life = (grain.phase + clock / grain.period) % 1;
      const height = life * grain.reach;
      const restX = x * (1 + height) + grain.side * height * .13;
      const restY = y * (1 + height) - height * .15;
      let pushX = 0, pushY = 0;
      if (pointer) {
        const dx = restX - pointer.x, dy = restY - pointer.y;
        const distance = Math.hypot(dx, dy);
        const falloff = Math.max(0, 1 - distance / .31);
        const push = .17 * falloff ** 2 / Math.max(.008, distance);
        pushX = dx * push;
        pushY = dy * push;
      }
      const easing = pushX || pushY ? scatter : settle;
      grain.driftX += (pushX - grain.driftX) * easing;
      grain.driftY += (pushY - grain.driftY) * easing;
      const px = restX + grain.driftX, py = restY + grain.driftY;
      if (z < 0 && px * px + py * py < 1) continue;

      const limb = 1 - (z / .62) ** 2;
      const fade = Math.min(1, life * 8, (1 - life) * 5);
      ctx.globalAlpha = grain.opacity * limb * fade;
      ctx.fillStyle = grain.ink;
      ctx.beginPath();
      ctx.arc(center + px * rimRadius, center + py * rimRadius, grain.size * dotScale, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function clear() {
    ctx?.clearRect(0, 0, center * 2, center * 2);
    for (const grain of grains) {
      grain.driftX = 0;
      grain.driftY = 0;
    }
  }

  return { resize, draw, clear };
}
