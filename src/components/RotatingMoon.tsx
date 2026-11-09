import React, { useEffect, useRef } from 'react';
import './RotatingMoon.css';

// NASA Scientific Visualization Studio CGI Moon Kit (LROC 2025 color map).
// The sphere is rendered in WebGL 1 — a true 3D surface projection with
// a fixed light and a rotating texture, not a rotating two-dimensional photo.
// Source & credit: https://svs.gsfc.nasa.gov/4720/
const MOON_MAP = import.meta.env.BASE_URL + 'assets/retro/moon-nasa-lroc-2k.jpg';
const FULL_CIRCLE = Math.PI * 2;
const ROTATION_MS = 38000;

const VERTEX = String.raw`
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * .5 + .5;
  gl_Position = vec4(aPosition, 0., 1.);
}
`;

const FRAGMENT = String.raw`
precision highp float;
varying vec2 vUv;
uniform sampler2D uMoon;
uniform float uAngle;
const float PI = 3.141592653589793;
void main() {
  vec2 xy = (vUv - .5) * 2.;
  float r2 = dot(xy, xy);
  if (r2 >= 1.) discard;

  // Surface point on the viewer-facing hemisphere of a unit sphere.
  vec3 n = vec3(xy, sqrt(1. - r2));
  float c = cos(uAngle), s = sin(uAngle);
  // Longitude changes across all 360 degrees; the light does NOT rotate.
  vec3 surface = vec3(c*n.x - s*n.z, n.y, s*n.x + c*n.z);
  float longitude = atan(surface.z, surface.x) / (2. * PI) + .5;
  float latitude = acos(clamp(surface.y, -1., 1.)) / PI;

  vec3 mapColor = texture2D(uMoon, vec2(fract(longitude), latitude)).rgb;
  float albedo = dot(mapColor, vec3(.29, .59, .12));
  albedo = pow(clamp(albedo * 1.18, .08, 1.), .9);

  // Amber highlights / burnt-sienna maria, matching the print artwork.
  vec3 warmDark = vec3(.18, .045, .029);
  vec3 warmLight = vec3(.98, .69, .43);
  vec3 earthTones = mix(warmDark, warmLight, albedo);
  vec3 lightDirection = normalize(vec3(.63, .62, 1.18));
  float diffuse = max(dot(n, lightDirection), 0.);
  float lighting = .11 + .97 * pow(diffuse, 1.12);
  // Side shadow and small warm rim retain a spherical silhouette.
  float contour = pow(1. - max(n.z, 0.), 3.);
  vec3 color = earthTones * lighting + vec3(.12, .032, .014) * contour;
  float edge = 1. - smoothstep(.987, 1., sqrt(r2));
  gl_FragColor = vec4(color, edge);
}
`;

const buildShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('No shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Moon shader failed: ' + message);
  }
  return shader;
};

export const RotatingMoon: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power',
    });
    if (!gl) {
      container.dataset.renderMode = 'fallback';
      return;
    }

    let frame = 0;
    let visible = true;
    let dragging = false;
    let lastPointerX = 0;
    let lastFrameTime = 0;
    let angle = 0;
    let active = true;
    let ready = false;
    let image: HTMLImageElement | null = null;

    let vertex: WebGLShader;
    let fragment: WebGLShader;
    let program: WebGLProgram;
    let buffer: WebGLBuffer;
    let texture: WebGLTexture;

    try {
      vertex = buildShader(gl, gl.VERTEX_SHADER, VERTEX);
      fragment = buildShader(gl, gl.FRAGMENT_SHADER, FRAGMENT);
      const createdProgram = gl.createProgram();
      const createdBuffer = gl.createBuffer();
      const createdTexture = gl.createTexture();
      if (!createdProgram || !createdBuffer || !createdTexture) throw new Error('WebGL unavailable');
      program = createdProgram;
      buffer = createdBuffer;
      texture = createdTexture;

      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Moon program failed');
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
      ]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'aPosition');
      if (position < 0) throw new Error('Missing vertex attribute');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([188, 140, 111, 255]));
      gl.uniform1i(gl.getUniformLocation(program, 'uMoon'), 0);
    } catch {
      container.dataset.renderMode = 'fallback';
      return;
    }

    const angleUniform = gl.getUniformLocation(program, 'uAngle');

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      const side = Math.round(Math.min(box.width, box.height) * dpr);
      if (canvas.width !== side || canvas.height !== side) {
        canvas.width = side;
        canvas.height = side;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(angleUniform, angle);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      container.dataset.angle = String(Math.round(((angle % FULL_CIRCLE + FULL_CIRCLE) % FULL_CIRCLE) * 180 / Math.PI));
    };

    const tick = (time: number) => {
      frame = 0;
      if (!active || !visible || document.hidden) return;
      const delta = lastFrameTime ? Math.min(time - lastFrameTime, 70) : 0;
      lastFrameTime = time;
      if (!reducedMotion.matches && !dragging) {
        angle = (angle + delta * FULL_CIRCLE / ROTATION_MS) % FULL_CIRCLE;
      }
      draw();
      if (!reducedMotion.matches) frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrameTime = 0;
      if (!visible || document.hidden) return;
      if (reducedMotion.matches) draw();
      else frame = requestAnimationFrame(tick);
    };

    const onDown = (event: PointerEvent) => {
      dragging = true;
      lastPointerX = event.clientX;
      canvas.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      angle += (event.clientX - lastPointerX) / Math.max(100, canvas.clientWidth) * FULL_CIRCLE;
      lastPointerX = event.clientX;
      if (reducedMotion.matches) draw();
    };
    const onUp = () => { dragging = false; };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      angle += (event.key === 'ArrowRight' ? 1 : -1) * Math.PI / 12;
      draw();
    };

    const onMotionChange = () => start();
    const onVisibility = () => start();
    const onContextLost = (event: Event) => {
      event.preventDefault();
      active = false;
      cancelAnimationFrame(frame);
      container.dataset.renderMode = 'fallback';
    };
    const observer = new IntersectionObserver((entries) => {
      visible = Boolean(entries[0]?.isIntersecting);
      start();
    }, { threshold: .02 });
    const sizing = new ResizeObserver(() => { resize(); draw(); });
    observer.observe(container);
    sizing.observe(container);

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('keydown', onKey);
    canvas.addEventListener('webglcontextlost', onContextLost);
    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener?.('change', onMotionChange);

    image = new Image();
    image.onload = () => {
      if (!active) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image!);
      container.dataset.renderMode = 'webgl';
      ready = true;
      draw();
    };
    image.onerror = () => {
      container.dataset.renderMode = 'fallback';
      cancelAnimationFrame(frame);
      ready = false;
    };
    image.src = MOON_MAP;
    draw();
    start();

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizing.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('keydown', onKey);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener?.('change', onMotionChange);
      if (image) { image.onload = null; image.onerror = null; }
      if (ready) gl.bindTexture(gl.TEXTURE_2D, null);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return (
    <div className="tm-retro-moon" ref={containerRef} data-render-mode="loading" data-angle="0" style={{ ["--moon-texture" as string]: `url("${MOON_MAP}")` } as React.CSSProperties}>
      <div className="tm-retro-moon-fallback" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        aria-label="Rotating three-dimensional Moon. Drag horizontally or use the arrow keys to rotate."
        role="img"
        tabIndex={0}
      />
    </div>
  );
};
