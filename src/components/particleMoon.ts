import { drawLunarFallback } from './lunarFallback';
import { GRAIN_DIAMETER } from './lunarGrain';

type Pointer = { x: number; y: number } | null;
const TAU = Math.PI * 2;
const PADDING = 1.10;

// A longitude and its opposite share one vertex. Exactly one faces the viewer
// at any rotation, so the GPU only processes the visible population.
function sampleGrains(map: ImageData, count: number) {
  const grains = new Float32Array(count * 8);
  const goldenStep = Math.PI * (3 - Math.sqrt(5)) / 2;
  const spacing = Math.sqrt(TAU / count);
  let seed = 0x73a149cd;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const albedo = (u: number, row: number) => {
    const index = 4 * (row + Math.floor((u % 1) * map.width));
    const raw = (.299 * map.data[index] + .587 * map.data[index + 1] + .114 * map.data[index + 2]) / 255;
    const rock = Math.max(0, Math.min(1, (raw - .23) / .68));
    return rock * rock * (3 - 2 * rock);
  };
  for (let i = 0; i < count; i++) {
    const latitude = Math.acos(1 - 2 * (i + .5) / count) + spacing * (random() - .5) * .44;
    const ring = Math.sin(latitude);
    const longitude = (i * goldenStep + spacing * (random() - .5) * .44 / Math.max(.01, ring)) % Math.PI;
    const u = longitude / TAU + 1.25;
    const row = Math.min(map.height - 1, Math.max(0, Math.floor(latitude * map.height / Math.PI))) * map.width;
    const at = i * 8;
    grains[at] = Math.cos(longitude) * ring;
    grains[at + 1] = Math.cos(latitude);
    grains[at + 2] = Math.sin(longitude) * ring;
    grains[at + 3] = albedo(u, row);
    grains[at + 4] = albedo(u + .5, row);
    for (let j = 5; j < 8; j++) grains[at + j] = random();
  }
  return grains;
}

const VERTEX = `
precision highp float;
attribute vec4 aRock;
attribute vec4 aSeed;
uniform vec2 uSpin;
uniform vec2 uBrush;
uniform vec2 uLight;
uniform float uPressure;
uniform float uPointSize;
uniform float uPadding;
varying float vTone;

void main() {
  vec3 n = vec3(uSpin.x*aRock.x + uSpin.y*aRock.z, aRock.y, -uSpin.y*aRock.x + uSpin.x*aRock.z);
  bool opposite = n.z < 0.;
  if (opposite) n.xz *= -1.;
  float rock = opposite ? aSeed.x : aRock.w;
  vec3 seed = opposite ? fract(aSeed.yzw + vec3(.37, .59, .73)) : aSeed.yzw;
  float radius = length(n.xy);
  vec2 radial = n.xy / max(radius, .0001);
  float erosion = smoothstep(.83, .995, radius);
  float retention = pow(1. - erosion, 2.4);
  if (seed.x >= retention) {
    gl_Position = vec4(2., 2., 2., 1.);
    gl_PointSize = uPointSize;
    return;
  }
  vec2 pos = n.xy + radial * erosion * erosion * (.01 + .038 * seed.y);
  vec2 offset = pos - uBrush;
  float dist = length(offset);
  float brush = max(0., 1. - dist / .32);
  vec2 away = dist > .0001 ? offset / dist : radial;
  pos += away * (.045 + .14 * seed.y) * brush * brush * uPressure;

  // Frontal ambient light has no preferred limb. The cursor adds raking silver light.
  float ambient = .35 + .65 * n.z;
  float silver = smoothstep(.12, .94, dot(n.xy, uLight));
  vTone = max(.025, .032 + (.055 + .23 * rock * rock) * ambient
    + (seed.z - .5) * .077 + silver * (.16 + .13 * rock + .09 * seed.z));
  gl_Position = vec4(pos / uPadding, -.55 * n.z, 1.);
  gl_PointSize = uPointSize;
}`;

const FRAGMENT = `
precision mediump float;
varying float vTone;
void main() {
  gl_FragColor = vec4(vTone * vec3(1.025, 1., .97), 1.);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Lunar shader allocation failed');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error('Lunar shader compilation failed');
  }
  return shader;
}

function createPointRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', {alpha: true, antialias: true, depth: true, powerPreference: 'low-power'});
  if (!gl) return null;
  const program = gl.createProgram(), buffer = gl.createBuffer();
  let vertex: WebGLShader | null = null, fragment: WebGLShader | null = null;
  const dispose = () => {
    gl.deleteBuffer(buffer); gl.deleteProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
  };
  try {
    if (!program || !buffer) throw new Error('Lunar geometry allocation failed');
    vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    gl.attachShader(program, vertex); gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Lunar shader link failed');
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    for (const [offset, name] of ['aRock', 'aSeed'].entries()) {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 4, gl.FLOAT, false, 32, offset * 16);
    }
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
    const spin = gl.getUniformLocation(program, 'uSpin');
    const brush = gl.getUniformLocation(program, 'uBrush');
    const pressure = gl.getUniformLocation(program, 'uPressure');
    const light = gl.getUniformLocation(program, 'uLight');
    const pointSize = gl.getUniformLocation(program, 'uPointSize');
    gl.uniform1f(gl.getUniformLocation(program, 'uPadding'), PADDING);
    return {
      upload(grains: Float32Array) { gl.bufferData(gl.ARRAY_BUFFER, grains, gl.STATIC_DRAW); },
      resize(diameter: number, dpr: number) {
        const pixels = Math.max(1, Math.min(2000, Math.round(diameter * dpr * PADDING)));
        if (canvas.width !== pixels || canvas.height !== pixels) canvas.width = canvas.height = pixels;
        gl.viewport(0, 0, pixels, pixels);
        gl.uniform1f(pointSize, GRAIN_DIAMETER * pixels / (diameter * PADDING));
      },
      draw(angle: number, count: number, x: number, y: number, force: number, lightX: number, lightY: number) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniform2f(spin, Math.cos(angle), Math.sin(angle));
        gl.uniform2f(brush, x, -y);
        gl.uniform2f(light, lightX, -lightY);
        gl.uniform1f(pressure, force);
        gl.drawArrays(gl.POINTS, 0, count);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

export function createParticleMoon(canvas: HTMLCanvasElement, fallback: HTMLCanvasElement, mapUrl: string,
  onReady: (webgl: boolean) => void) {
  let renderer: ReturnType<typeof createPointRenderer> = null;
  try { renderer = createPointRenderer(canvas); } catch { /* Use the same grains in the 2D fallback. */ }
  let map: ImageData | null = null, grains: Float32Array | null = null;
  let diameter = 0, dpr = 1, brushX = 0, brushY = 0, pressure = 0;
  let lightX = 0, lightY = 0;
  let paintFallback: ReturnType<typeof drawLunarFallback>;
  const update = () => {
    if (!map || !diameter) return;
    // Quantize the sample budget so a small viewport change can reuse its buffer.
    const bucket = Math.min(1024, Math.ceil(diameter / 48) * 48);
    const count = Math.ceil(1.85 * bucket * bucket);
    if (grains?.length !== count * 8) {
      grains = sampleGrains(map, count);
      renderer?.upload(grains);
    }
    if (renderer) renderer.resize(diameter, dpr);
    else {
      paintFallback = drawLunarFallback(fallback, grains, diameter, dpr);
      fallback.dataset.grains = 'true';
    }
  };
  const image = new Image();
  image.onload = () => {
    try {
      const sampler = document.createElement('canvas');
      sampler.width = image.naturalWidth; sampler.height = image.naturalHeight;
      const ctx = sampler.getContext('2d', {willReadFrequently: true});
      if (!ctx) throw new Error('Lunar map sampler unavailable');
      ctx.drawImage(image, 0, 0);
      map = ctx.getImageData(0, 0, sampler.width, sampler.height);
      update();
      onReady(Boolean(renderer));
    } catch { onReady(false); }
  };
  image.onerror = () => onReady(false);
  image.src = mapUrl;
  return {
    resize(width: number, pixelRatio: number) {
      if (diameter === width && dpr === pixelRatio) return;
      diameter = width; dpr = pixelRatio; update();
    },
    draw(angle: number, elapsed: number, pointer: Pointer, playing: boolean) {
      if (!grains) return;
      if (playing) {
        const ease = 1 - Math.exp(-elapsed * 14);
        if (pointer) {
          if (pressure < .002) { brushX = pointer.x; brushY = pointer.y; }
          brushX += (pointer.x - brushX) * ease;
          brushY += (pointer.y - brushY) * ease;
        }
        pressure += ((pointer ? 1 : 0) - pressure) * ease;
        const distance = pointer ? Math.max(1, Math.hypot(pointer.x, pointer.y)) : 1;
        lightX += ((pointer ? pointer.x / distance : 0) - lightX) * ease;
        lightY += ((pointer ? pointer.y / distance : 0) - lightY) * ease;
      }
      if (renderer) renderer.draw(angle, grains.length / 8, brushX, brushY, pressure, lightX, lightY);
      else paintFallback?.(lightX, lightY);
    },
    useFallback() {
      renderer?.dispose();
      renderer = null;
      update();
      onReady(false);
    },
    dispose() {
      image.onload = null; image.onerror = null;
      renderer?.dispose();
      map = null; grains = null; paintFallback = undefined;
    },
  };
}
