// Each print grain has a place on the little sphere and on the final orbit.
// Keeping both ends fixed makes travelling back up the page retrace the sweep.
const TAU = Math.PI * 2;
const INKS = ['#aa8c73', '#d3b69b', '#e8d5ba', '#f5e6ce'];

type Grain = {
  fromX: number; fromY: number; toX: number; toY: number;
  bend: number; delay: number; size: number;
};

const unit = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => { const t = unit(v); return t * t * (3 - 2 * t); };

function makeOrbit(width: number, height: number) {
  let seed = 0x438faced;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const bands: Grain[][] = INKS.map(() => []);
  const portrait = width < height;
  const cx = width * (portrait ? .59 : .54), cy = height * (portrait ? .57 : .52);
  const rx = width * (portrait ? .81 : .58), ry = height * (portrait ? .30 : .32);
  const tilt = portrait ? -.50 : -.27;
  const cos = Math.cos(tilt), sin = Math.sin(tilt);
  const count = Math.round(Math.min(23000, Math.max(9500, width * 16)));

  for (let i = 0; i < count; i++) {
    // The crescent has a bright outer lip, two fine grooves and a feathered
    // inner edge. Its breadth tapers to almost a hairline on the far side.
    const a = random() * TAU;
    const fullness = .12 + .88 * (.5 + .5 * Math.cos(a + .85)) ** 1.7;
    const lane = random();
    let depth = random() ** 1.9;
    if (lane < .14) depth = .03 + random() * .012;
    else if (lane < .23) depth = .32 + random() * .025;
    const fringe = (random() - .5) * (lane > .94 ? .17 : .025);
    const thickness = (.27 * depth + fringe) * fullness;
    const ex = rx * (1 - thickness) * Math.cos(a);
    const ey = ry * (1 - thickness * 1.5) * Math.sin(a);
    const alpha = random();
    const ring = random() * TAU, radius = Math.sqrt(random());
    const bucket = alpha > .985 ? 3 : alpha > .85 ? 2 : alpha > .47 ? 1 : 0;
    bands[bucket].push({
      fromX: Math.cos(ring) * radius, fromY: Math.sin(ring) * radius,
      toX: cx + ex * cos - ey * sin, toY: cy + ex * sin + ey * cos,
      bend: (random() - .28) * Math.min(width, height) * .24,
      delay: random() * .20,
      size: (bucket === 3 ? 1.35 : .72) + random() * .73,
    });
  }
  return bands;
}

export function followLunarOrbit(hero: HTMLElement, moon: HTMLElement, canvas: HTMLCanvasElement,
  motion: MediaQueryList, onBodyVisible: (visible: boolean) => void) {
  const ctx = canvas.getContext('2d');
  let bands: Grain[][] = [];
  let width = 0, height = 0, pixelRatio = 0;
  let frame = 0, lastProgress = -1, lastSpread = -1;
  let bodyVisible = true;

  function draw(spread: number, originX: number, originY: number, radius: number) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (spread <= 0) return;
    const bloom = ease(spread / .30);
    for (let ink = 0; ink < bands.length; ink++) {
      ctx.fillStyle = INKS[ink];
      ctx.globalAlpha = [.31, .42, .60, .78][ink] * bloom;
      ctx.beginPath();
      for (const grain of bands[ink]) {
        const t = ease((spread - grain.delay) / (1 - grain.delay));
        const sx = originX + radius * grain.fromX, sy = originY + radius * grain.fromY;
        // A little tangential curl lifts grains from the rim on the outward arc.
        const bow = t * (1 - t) * grain.bend;
        const x = sx + (grain.toX - sx) * t + bow * .26;
        const y = sy + (grain.toY - sy) * t - bow;
        ctx.rect(x, y, grain.size, grain.size);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function paint() {
    frame = 0;
    const heroBox = hero.getBoundingClientRect();
    const p = unit(-heroBox.top / Math.max(1, heroBox.height));
    const progress = motion.matches ? 0 : p;
    const spread = motion.matches ? 1 : unit((progress - .39) / .61);
    if (progress === lastProgress && spread === lastSpread) return;
    const size = moon.offsetWidth, homeY = moon.offsetTop + size * .5;
    const landingY = Math.min(heroBox.height * .88, Math.max(homeY + heroBox.height * .09, heroBox.height * .79));
    const travel = ease(progress / .53);
    const dx = heroBox.width * .325 * travel;
    const centerY = homeY + (landingY - homeY) * travel;
    const dy = heroBox.height * progress + centerY - homeY;
    const dissolve = ease((progress - .47) / .35);
    const scale = (1 - .68 * travel) * (1 - .86 * dissolve);

    if (progress !== lastProgress) {
      if (progress === 0) {
        moon.style.removeProperty('transform');
        moon.style.removeProperty('opacity');
        moon.style.removeProperty('--lunar-exposure');
      } else {
        moon.style.transform = `translate3d(calc(-50% + ${dx}px), ${dy}px, 0) scale(${scale})`;
        moon.style.opacity = String(1 - dissolve);
        // The charcoal lunar map catches light as it enters the dark wall.
        moon.style.setProperty('--lunar-exposure', String(1.025 + 2.2 * ease((progress - .19) / .28)));
      }
      if (bodyVisible !== (dissolve < 1)) {
        bodyVisible = dissolve < 1;
        onBodyVisible(bodyVisible);
      }
    }

    // Once the orbit settles the pinned prints can travel for several
    // viewports without redrawing the backdrop or running an animation loop.
    if (lastSpread !== spread || (spread > 0 && spread < 1)) {
      const rect = canvas.getBoundingClientRect();
      const x = heroBox.left + heroBox.width * .5 + dx - rect.left;
      const y = heroBox.top + homeY + dy - rect.top;
      draw(spread, x, y, size * scale * .48);
    }
    lastProgress = progress;
    lastSpread = spread;
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const dpr = Math.min(1.5, devicePixelRatio || 1, 2400 / Math.max(w, h, 1));
    if (w !== width || h !== height || dpr !== pixelRatio) {
      width = w; height = h; pixelRatio = dpr;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      bands = makeOrbit(width, height);
    }
    lastProgress = lastSpread = -1;
    schedule();
  }
  const sizing = new ResizeObserver(resize);
  sizing.observe(hero);
  sizing.observe(canvas);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', resize);
  motion.addEventListener('change', resize);
  resize();
  return () => {
    cancelAnimationFrame(frame);
    sizing.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', resize);
    motion.removeEventListener('change', resize);
    moon.style.removeProperty('transform');
    moon.style.removeProperty('opacity');
    moon.style.removeProperty('--lunar-exposure');
  };
}
