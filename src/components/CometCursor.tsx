import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import './CometCursor.css';

type Sample = { x: number; y: number; time: number };
const LIFETIME = 150;
const CONTROLS = 'a[href],button,summary,[role="button"],[role="tab"],[role="link"]';

// Vary the ribbon width with age. Neighboring points supply the tangent even on tight turns.
function ribbonOutline(points: Sample[], now: number) {
  const left: string[] = [];
  const right: string[] = [];
  points.forEach((point, i) => {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const length = Math.hypot(dx, dy) || 1;
    const half = .75 + 3.75 * Math.max(0, 1 - (now - point.time) / LIFETIME);
    const nx = -dy * half / length;
    const ny = dx * half / length;
    left.push(`${(point.x + nx).toFixed(1)},${(point.y + ny).toFixed(1)}`);
    right.push(`${(point.x - nx).toFixed(1)},${(point.y - ny).toFixed(1)}`);
  });
  return 'M' + left.concat(right.reverse()).join(' L') + ' Z';
}

export function CometCursor() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const gradientId = 'tm-comet-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');

  useEffect(() => {
    const overlay = overlayRef.current, head = headRef.current;
    const trail = trailRef.current, gradient = gradientRef.current;
    if (!overlay || !head || !trail || !gradient) return;
    const media = window.matchMedia('(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)');
    const root = document.documentElement;
    const points: Sample[] = [];
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let frame = 0, lastTime = 0, hasMouse = false, active = false;

    function rest() {
      active = false;
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      points.length = 0;
      delete root.dataset.tmCometActive;
      overlay!.dataset.visible = 'false';
      overlay!.dataset.hover = 'false';
      trail!.removeAttribute('d');
    }

    function render(now: number) {
      frame = 0;
      const elapsed = lastTime ? Math.min(64, now - lastTime) : 1000 / 60;
      lastTime = now;
      // Match the follow at 60Hz and keep its speed consistent on high-refresh screens.
      const follow = 1 - Math.pow(.72, elapsed * .06);
      x += (targetX - x) * follow;
      y += (targetY - y) * follow;
      const moving = Math.hypot(targetX - x, targetY - y) > .08;
      if (!moving) { x = targetX; y = targetY; }
      head!.style.transform = `translate3d(${x}px,${y}px,0)`;
      const last = points[points.length - 1];
      if (!last || Math.hypot(x - last.x, y - last.y) >= 1.5) points.push({ x, y, time: now });
      while (points.length && now - points[0].time >= LIFETIME) points.shift();

      if (points.length >= 2) {
        const tail = points[0], tip = points[points.length - 1];
        gradient!.setAttribute('x1', String(tail.x));
        gradient!.setAttribute('y1', String(tail.y));
        gradient!.setAttribute('x2', String(tip.x));
        gradient!.setAttribute('y2', String(tip.y));
        trail!.setAttribute('d', ribbonOutline(points, now));
        trail!.style.opacity = String(1 - (now - tip.time) / LIFETIME);
      } else {
        trail!.removeAttribute('d');
      }
      if (moving || points.length > 1) frame = requestAnimationFrame(render);
      else lastTime = 0;
    }

    function aim(element: Element | null) {
      if (!element || element.closest('input,textarea,select,iframe,[contenteditable]:not([contenteditable="false"]),:disabled,[aria-disabled="true"]')) {
        rest();
        return;
      }
      if (!active) {
        x = targetX; y = targetY;
        head!.style.transform = `translate3d(${x}px,${y}px,0)`;
        active = true;
        overlay!.dataset.visible = 'true';
        root.dataset.tmCometActive = '';
      }
      overlay!.dataset.hover = String(Boolean(element.closest(CONTROLS)));
      if (!frame) frame = requestAnimationFrame(render);
    }
    function clear() { hasMouse = false; rest(); }
    function move(event: PointerEvent) {
      if (event.pointerType !== 'mouse') { clear(); return; }
      hasMouse = true;
      targetX = event.clientX; targetY = event.clientY;
      aim(event.target instanceof Element ? event.target : null);
    }
    function over(event: PointerEvent) {
      if (event.pointerType !== 'mouse') clear();
      else if (hasMouse) move(event);
    }
    function underPointer() {
      if (hasMouse) aim(document.elementFromPoint(targetX, targetY));
    }
    function leave(event: PointerEvent) { if (!event.relatedTarget) clear(); }
    function visibility() { if (document.hidden) clear(); }

    let listeners: AbortController | null = null;
    function disconnect() {
      listeners?.abort();
      listeners = null;
      clear();
    }
    function sync() {
      disconnect();
      if (!media.matches) return;
      listeners = new AbortController();
      const options = { passive: true, signal: listeners.signal };
      window.addEventListener('pointermove', move, options);
      window.addEventListener('pointerover', over, options);
      window.addEventListener('pointerdown', over, options);
      window.addEventListener('pointerout', leave, options);
      document.documentElement.addEventListener('pointerleave', clear, options);
      window.addEventListener('pointercancel', clear, options);
      window.addEventListener('scroll', underPointer, { ...options, capture: true });
      window.addEventListener('keydown', clear, options);
      window.addEventListener('blur', clear, options);
      document.addEventListener('visibilitychange', visibility, options);
    }
    sync();
    media.addEventListener('change', sync);
    return () => {
      media.removeEventListener('change', sync);
      disconnect();
    };
  }, []);

  return createPortal(
    <div ref={overlayRef} className="tm-comet-cursor" data-visible="false" data-hover="false" aria-hidden="true">
      <svg width="100%" height="100%" focusable="false">
        <defs>
          <linearGradient ref={gradientRef} id={gradientId} gradientUnits="userSpaceOnUse">
            <stop stopColor="#f0f2f0" stopOpacity="0" />
            <stop offset="1" stopColor="#f0f2f0" />
          </linearGradient>
        </defs>
        <path ref={trailRef} className="tm-comet-trail" fill={`url(#${gradientId})`} />
      </svg>
      <span ref={headRef} className="tm-comet-head" />
    </div>, document.body,
  );
}
