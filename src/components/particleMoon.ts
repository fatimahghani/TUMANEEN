import { drawLunarFallback } from './lunarFallback';

type Pointer = { x: number; y: number } | null;
const TAU = Math.PI * 2;
const PADDING = 1.10;

// Each vertex is a grain on the rotating sphere, with a fixed map sample and
// four independent seeds for its diameter, erosion, drift and reflectance.
function sampleGrains(map: ImageData, count: number) {
  const grains = new Float32Array(count * 8);
  const goldenStep = Math.PI * (3 - Math.sqrt(5));
  const spacing = Math.sqrt(4 * Math.PI / count);
  let seed = 0x73a149cd;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const latitude = Math.acos(1 - 2 * (i + .5) / count) + spacing * (random() - .5) * .65;
    const ring = Math.sin(latitude);
    const longitude = (i * goldenStep + spacing * (random() - .5) * .65 / Math.max(.01, ring)) % TAU;
    const u = (longitude / TAU + 1.25) % 1;
    const v = Math.max(0, Math.min(.999999, latitude / Math.PI));
    const texel = 4 * (Math.floor(v * map.height) * map.width + Math.floor(u * map.width));
    const raw = (.299 * map.data[texel] + .587 * map.data[texel + 1] + .114 * map.data[texel + 2]) / 255;
    const rock = Math.max(0, Math.min(1, (raw - .23) / .68));
    const at = i * 8;
    grains[at] = Math.cos(longitude) * ring;
    grains[at + 1] = Math.cos(latitude);
    grains[at + 2] = Math.sin(longitude) * ring;
    grains[at + 3] = rock * rock * (3 - 2 * rock);
    for (let j = 4; j < 8; j++) grains[at + j] = random();
  }
  return grains;
}

const VERTEX = `
precision highp float;
attribute vec4 aRock;
attribute vec4 aSeed;
uniform vec2 uSpin;
uniform vec2 uBrush;
uniform float uPressure;
uniform float uSpacing;
uniform float uDpr;
uniform float uPadding;
varying float vInk;
varying float vGlint;
varying float vSquare;

void main() {
  vec3 n = vec3(uSpin.x*aRock.x + uSpin.y*aRock.z, aRock.y, -uSpin.y*aRock.x + uSpin.x*aRock.z);
  float radius = length(n.xy);
  vec2 radial = n.xy / max(radius, .0001);
  float east = smoothstep(-.18, .78, dot(radial, vec2(.97,.24)));
  float coast = .018 * sin(12. * radial.y + 3. * radial.x) + .009 * sin(29. * radial.y);
  float erosion = east * smoothstep(.77 + coast, .995, radius);
  if (n.z < 0. || aSeed.y < .965 * pow(erosion, 1.2)) {
    gl_Position = vec4(2., 2., 2., 1.);
    gl_PointSize = 1.;
    return;
  }

  // The last surviving grains come loose before the wind carries them across the sky.
  vec2 drift = erosion * erosion * (aSeed.z - .32) * (.016 + .065 * aSeed.y) * vec2(1., .28);
  vec2 pos = n.xy + drift;
  vec2 offset = pos - uBrush;
  float dist = length(offset);
  float brush = max(0., 1. - dist / .32);
  vec2 away = dist > .0001 ? offset / dist : radial;
  pos += away * (.045 + .14 * aSeed.z) * brush * brush * uPressure;

  float lit = max(dot(n, normalize(vec3(-.64, .7, 1.))), 0.);
  float grain = (aSeed.w - .5) * (.055 + .045 * lit);
  vInk = max(.025, .031 + (.052 + .24 * aRock.w * aRock.w) * (.25 + .75 * lit) + grain);
  vGlint = smoothstep(.88, 1., aSeed.w) * (.075 + .19 * east);
  vSquare = step(.74, aSeed.z);
  gl_Position = vec4(pos / uPadding, -.55 * n.z, 1.);
  float packedSize = uSpacing * (2.65 + 1.4 * aSeed.x);
  float looseSize = .72 + 1.05 * aSeed.x;
  gl_PointSize = max(1., mix(packedSize, looseSize, erosion) * uDpr);
}`;

const FRAGMENT = `
precision mediump float;
varying float vInk;
varying float vGlint;
varying float vSquare;
void main() {
  vec2 p = 2. * gl_PointCoord - 1.;
  float edge = mix(dot(p,p), max(abs(p.x),abs(p.y)), vSquare);
  if (edge > 1.) discard;
  // Tiny mineral flecks in the moon's graphite, brighter on a few individual grains.
  float fleck = 1. - smoothstep(.08, .39, length(p - vec2(-.18, -.16)));
  float tone = vInk * (1. - .15 * edge) + vGlint * fleck;
  gl_FragColor = vec4(tone * vec3(1.025, 1., .97), 1.);
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
    const spacing = gl.getUniformLocation(program, 'uSpacing');
    const dprUniform = gl.getUniformLocation(program, 'uDpr');
    gl.uniform1f(gl.getUniformLocation(program, 'uPadding'), PADDING);
    return {
      upload(grains: Float32Array) { gl.bufferData(gl.ARRAY_BUFFER, grains, gl.STATIC_DRAW); },
      resize(diameter: number, dpr: number, count: number) {
        const pixels = Math.max(1, Math.min(2000, Math.round(diameter * dpr * PADDING)));
        if (canvas.width !== pixels || canvas.height !== pixels) canvas.width = canvas.height = pixels;
        gl.viewport(0, 0, pixels, pixels);
        gl.uniform1f(spacing, diameter / Math.sqrt(count));
        gl.uniform1f(dprUniform, pixels / (diameter * PADDING));
      },
      draw(angle: number, count: number, x: number, y: number, force: number) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniform2f(spin, Math.cos(angle), Math.sin(angle));
        gl.uniform2f(brush, x, -y);
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
  const update = () => {
    if (!map || !diameter) return;
    const count = diameter < 420 ? 64000 : diameter < 650 ? 136000 : 240000;
    if (grains?.length !== count * 8) {
      grains = sampleGrains(map, count);
      renderer?.upload(grains);
    }
    if (renderer) renderer.resize(diameter, dpr, count);
    else {
      drawLunarFallback(fallback, grains, diameter, dpr);
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
      if (!renderer || !grains) return;
      if (playing) {
        const ease = 1 - Math.exp(-elapsed * 14);
        if (pointer) {
          if (pressure < .002) { brushX = pointer.x; brushY = pointer.y; }
          brushX += (pointer.x - brushX) * ease;
          brushY += (pointer.y - brushY) * ease;
        }
        pressure += ((pointer ? 1 : 0) - pressure) * ease;
      }
      renderer.draw(angle, grains.length / 8, brushX, brushY, pressure);
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
      map = null; grains = null;
    },
  };
}
