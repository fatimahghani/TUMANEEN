import React, { useEffect, useRef, useState } from 'react';
import { createLunarDust } from './lunarDust';
import './RotatingMoon.css';

// NASA SVS CGI Moon Kit; attribution in public/assets/retro/README.md.
const MAP = import.meta.env.BASE_URL + 'assets/retro/moon-nasa-lroc-2k.jpg';
const TAU = Math.PI * 2;
const PERIOD = 48;

const VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * .5 + .5;
  gl_Position = vec4(aPosition, 0., 1.);
}`;
const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uMoon;
uniform float uAngle;
uniform vec2 uTexel;
const float PI = 3.141592653589793;
float albedo(vec2 uv) {
  vec2 point = vec2(fract(uv.x), clamp(uv.y, 0., 1.));
  return dot(texture2D(uMoon, point).rgb, vec3(.299, .587, .114));
}
void main() {
  vec2 p = (vUv - .5) * 2.;
  float r = dot(p, p);
  if (r >= 1.) discard;
  vec3 normal = vec3(p, sqrt(1. - r));
  float c = cos(uAngle), s = sin(uAngle);
  vec3 surface = vec3(c * normal.x - s * normal.z, normal.y, s * normal.x + c * normal.z);
  vec2 uv = vec2(atan(surface.z, surface.x) / (2. * PI) + .25, acos(surface.y) / PI);
  float rock = smoothstep(.23, .91, albedo(uv));
  float dx = albedo(uv + vec2(uTexel.x, 0.)) - albedo(uv - vec2(uTexel.x, 0.));
  float dy = albedo(uv + vec2(0., uTexel.y)) - albedo(uv - vec2(0., uTexel.y));
  vec3 relief = normalize(normal + vec3(-2.0 * dx, 2.0 * dy, 0.));
  vec3 sun = normalize(vec3(-.64, .7, 1.0));
  float lit = max(dot(relief, sun), 0.);
  float charcoal = .026 + (.045 + .23 * rock * rock) * (.22 + .78 * lit);
  float rim = pow(1. - normal.z, 3.5) * (.018 + .092 * lit);
  vec3 color = vec3(1.02, 1., .98) * (charcoal + rim);
  gl_FragColor = vec4(color, 1. - smoothstep(.996, 1., sqrt(r)));
}`;

function shader(gl: WebGLRenderingContext, type: number, source: string) {
  const result = gl.createShader(type);
  if (!result) throw new Error('Shader allocation failed');
  gl.shaderSource(result, source);
  gl.compileShader(result);
  if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
    gl.deleteShader(result);
    throw new Error('Moon shader compilation failed');
  }
  return result;
}

function createMoonSurface(canvas: HTMLCanvasElement, onReady: (ready: boolean) => void) {
  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power',
  });
  if (!gl) return null;

  let vertex: WebGLShader | null = null;
  let fragment: WebGLShader | null = null;
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  const image = new Image();
  function dispose() {
    image.onload = null;
    image.onerror = null;
    gl!.deleteTexture(texture);
    gl!.deleteBuffer(buffer);
    gl!.deleteProgram(program);
    gl!.deleteShader(vertex);
    gl!.deleteShader(fragment);
  }

  try {
    if (!program || !buffer || !texture) throw new Error('Moon allocation failed');
    vertex = shader(gl, gl.VERTEX_SHADER, VERTEX);
    fragment = shader(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Moon shader link failed');
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'uMoon'), 0);
    const angleLocation = gl.getUniformLocation(program, 'uAngle');
    const texelLocation = gl.getUniformLocation(program, 'uTexel');
    image.onload = () => {
      if (gl.isContextLost()) return;
      try {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        const powerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;
        if (powerOfTwo(image.width) && powerOfTwo(image.height)) {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        }
        gl.uniform2f(texelLocation, 1 / image.width, 1 / image.height);
        onReady(true);
      } catch { onReady(false); }
    };
    image.onerror = () => onReady(false);
    image.src = MAP;
    return {
      resize(side: number) {
        if (canvas.width !== side || canvas.height !== side) {
          canvas.width = side;
          canvas.height = side;
        }
        gl.viewport(0, 0, side, side);
      },
      draw(angle: number) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(angleLocation, angle);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

export const RotatingMoon: React.FC<{ paused?: boolean }> = ({ paused = false }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const wakeRef = useRef<() => void>(() => {});
  const [generation, setGeneration] = useState(0);
  useEffect(() => { pausedRef.current = paused; wakeRef.current(); }, [paused]);

  useEffect(() => {
    const host = hostRef.current, canvas = canvasRef.current, dustCanvas = dustRef.current;
    const hero = host?.closest<HTMLElement>('.tm-explorer-hero');
    if (!host || !canvas || !dustCanvas || !hero) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dust = createLunarDust(dustCanvas);
    let pointer: { x: number; y: number } | null = null;
    let surface: ReturnType<typeof createMoonSurface> = null;
    let ready = false, visible = true, angle = 0, frame = 0, previousTime = 0;

    const draw = (elapsed = 0) => {
      if (ready) surface?.draw(angle);
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
      ready = loaded;
      host.dataset.renderMode = loaded ? 'webgl' : 'fallback';
      if (visible && !document.hidden) draw();
    };
    host.dataset.renderMode = 'loading';
    try { surface = createMoonSurface(canvas, setReady); } catch { /* Use the textured CSS moon. */ }
    if (!surface) setReady(false);

    const resize = () => {
      const diameter = host.getBoundingClientRect().width;
      const dpr = Math.min(devicePixelRatio || 1, 1.6);
      surface?.resize(Math.max(1, Math.min(1800, Math.round(diameter * dpr))));
      dust.resize(diameter, dpr);
      draw();
    };
    const trackDust = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !event.isPrimary || !canAnimate()) return;
      const bounds = host.getBoundingClientRect();
      if (bounds.width <= 0) return;
      pointer = {
        x: 2 * (event.clientX - bounds.left) / bounds.width - 1,
        y: 2 * (event.clientY - bounds.top) / bounds.height - 1,
      };
    };
    const releaseDust = () => { pointer = null; };
    const onLost = (event: Event) => { event.preventDefault(); setReady(false); };
    const onRestored = () => setGeneration(value => value + 1);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    }, { threshold: .01 });
    const sizing = new ResizeObserver(resize);
    observer.observe(host);
    sizing.observe(host);
    hero.addEventListener('pointermove', trackDust, { passive: true });
    hero.addEventListener('pointerleave', releaseDust);
    hero.addEventListener('pointercancel', releaseDust);
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
      hero.removeEventListener('pointermove', trackDust);
      hero.removeEventListener('pointerleave', releaseDust);
      hero.removeEventListener('pointercancel', releaseDust);
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
      aria-label="Black cratered moon with fine particles streaming outward from its rim."
      data-render-mode="loading" data-angle="0" data-animating="false" data-rotation-seconds={PERIOD}
      style={{ '--moon-texture': `url("${MAP}")` } as React.CSSProperties}>
      <div className="tm-retro-moon-fallback" aria-hidden="true" />
      <canvas className="tm-lunar-surface" ref={canvasRef} aria-hidden="true" />
      <canvas className="tm-lunar-dust" ref={dustRef} aria-hidden="true" />
    </div>
  );
};
