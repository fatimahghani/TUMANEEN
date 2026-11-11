import React, { useEffect, useRef, useState } from 'react';
import { createParticleMoon } from './particleMoon';
import { createLunarDust } from './lunarDust';
import './RotatingMoon.css';

// NASA SVS CGI Moon Kit; attribution in public/assets/retro/README.md.
// Resolve from the document so the CSS fallback also works from a bundled stylesheet.
const MAP = new URL(import.meta.env.BASE_URL + 'assets/retro/moon-nasa-lroc-2k.jpg', document.baseURI).href;
const TAU = Math.PI * 2;
const PERIOD = 48;

export const RotatingMoon: React.FC<{ paused?: boolean }> = ({ paused = false }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLCanvasElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const wakeRef = useRef<() => void>(() => {});
  const [generation, setGeneration] = useState(0);
  useEffect(() => { pausedRef.current = paused; wakeRef.current(); }, [paused]);

  useEffect(() => {
    const host = hostRef.current, canvas = canvasRef.current, dustCanvas = dustRef.current, fallback = fallbackRef.current;
    const hero = host?.closest<HTMLElement>('.tm-explorer-hero');
    if (!host || !canvas || !dustCanvas || !fallback || !hero) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dust = createLunarDust(dustCanvas);
    let pointer: { x: number; y: number } | null = null;
    let surface: ReturnType<typeof createParticleMoon> | null = null;
    let visible = true, angle = 0, frame = 0, previousTime = 0;

    const draw = (elapsed = 0) => {
      surface?.draw(angle, elapsed, pointer, canAnimate());
      dust.draw(elapsed, pointer);
      host.dataset.angle = (angle * 360 / TAU).toFixed(3);
    };
    const canAnimate = () => visible && !document.hidden && !motion.matches && !pausedRef.current;
    const tick = (now: number) => {
      const elapsed = previousTime ? Math.min((now - previousTime) / 1000, .1) : 0;
      previousTime = now;
      angle = (angle + elapsed * TAU / PERIOD) % TAU;
      draw(elapsed);
      frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      cancelAnimationFrame(frame);
      previousTime = 0;
      const playing = canAnimate();
      host.dataset.animating = String(playing);
      if (!playing) pointer = null;
      if (visible && !document.hidden) draw();
      if (playing) frame = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;
    const setReady = (loaded: boolean) => {
      host.dataset.renderMode = loaded ? 'webgl' : 'fallback';
      if (visible && !document.hidden) draw();
    };
    host.dataset.renderMode = 'loading';
    surface = createParticleMoon(canvas, fallback, MAP, setReady);

    const resize = () => {
      const diameter = host.getBoundingClientRect().width;
      const dpr = Math.min(devicePixelRatio || 1, 1.6);
      surface?.resize(diameter, dpr);
      dust.resize(diameter, dpr);
      draw();
    };
    const trackPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !event.isPrimary || !canAnimate()) return;
      const bounds = host.getBoundingClientRect();
      if (bounds.width <= 0) return;
      pointer = {
        x: 2 * (event.clientX - bounds.left) / bounds.width - 1,
        y: 2 * (event.clientY - bounds.top) / bounds.height - 1,
      };
    };
    const releasePointer = () => { pointer = null; };
    const onLost = (event: Event) => { event.preventDefault(); surface?.useFallback(); };
    const onRestored = () => setGeneration(value => value + 1);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    }, { threshold: .01 });
    const sizing = new ResizeObserver(resize);
    observer.observe(host);
    sizing.observe(host);
    hero.addEventListener('pointermove', trackPointer, { passive: true });
    hero.addEventListener('pointerleave', releasePointer);
    hero.addEventListener('pointercancel', releasePointer);
    window.addEventListener('blur', releasePointer);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    document.addEventListener('visibilitychange', wake);
    motion.addEventListener('change', wake);
    resize();
    wake();
    return () => {
      cancelAnimationFrame(frame);
      wakeRef.current = () => {};
      observer.disconnect();
      sizing.disconnect();
      hero.removeEventListener('pointermove', trackPointer);
      hero.removeEventListener('pointerleave', releasePointer);
      hero.removeEventListener('pointercancel', releasePointer);
      window.removeEventListener('blur', releasePointer);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      document.removeEventListener('visibilitychange', wake);
      motion.removeEventListener('change', wake);
      surface?.dispose();
      dust.clear();
    };
  }, [generation]);

  return (
    <div className="tm-retro-moon tm-explorer-moon" ref={hostRef} role="img"
      aria-label="A rotating charcoal moon made of tiny grains. A silver light follows the cursor around its rim."
      data-render-mode="loading" data-angle="0" data-animating="false" data-rotation-seconds={PERIOD}
      style={{ '--moon-texture': `url("${MAP}")` } as React.CSSProperties}>
      <canvas className="tm-retro-moon-fallback" ref={fallbackRef} aria-hidden="true" />
      <canvas className="tm-lunar-surface" ref={canvasRef} aria-hidden="true" />
      <canvas className="tm-lunar-dust" ref={dustRef} aria-hidden="true" />
    </div>
  );
};
