import React, { useEffect, useRef, useState } from 'react';
import { createLunarDust } from './lunarDust';
import './RotatingMoon.css';

// NASA SVS CGI Moon Kit; attribution in public/assets/retro/README.md.
const MAP = import.meta.env.BASE_URL + 'assets/retro/moon-nasa-lroc-2k.jpg';
const TAU = Math.PI * 2;
const PERIOD = 48; // Seconds for one full, continuous revolution.
const DEGREE = Math.PI / 180;
const LOOK_IDLE_MS = 2800;
const VERTEX = `attribute vec2 aPosition; varying vec2 vUv;
void main(){ vUv=aPosition*.5+.5; gl_Position=vec4(aPosition,0.,1.); }`;
const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uMoon;
uniform float uAngle;
uniform float uPitch;
uniform vec2 uTexel;
const float PI=3.141592653589793;
float value(vec2 uv){return dot(texture2D(uMoon,vec2(fract(uv.x),clamp(uv.y,0.,1.))).rgb,vec3(.299,.587,.114));}
void main(){
  vec2 p=(vUv-.5)*2.; float r=dot(p,p); if(r>=1.) discard;
  // Analytic sphere intersection: independent longitude under fixed lighting.
  vec3 n=vec3(p,sqrt(1.-r));
  float cp=cos(uPitch),sp=sin(uPitch);
  vec3 tilted=vec3(n.x,cp*n.y+sp*n.z,-sp*n.y+cp*n.z);
  float c=cos(uAngle),s=sin(uAngle);
  vec3 q=vec3(c*tilted.x-s*tilted.z,tilted.y,s*tilted.x+c*tilted.z);
  vec2 uv=vec2(atan(q.z,q.x)/(2.*PI)+.25,acos(clamp(q.y,-1.,1.))/PI);
  float raw=value(uv);
  // Preserve lunar maria instead of clipping the entire map to white.
  float a=pow(clamp((raw-.22)/.65,0.,1.),.9);
  float dx=value(uv+vec2(uTexel.x,0.))-value(uv-vec2(uTexel.x,0.));
  float dy=value(uv+vec2(0.,uTexel.y))-value(uv-vec2(0.,uTexel.y));
  vec3 detail=normalize(n+vec3(-dx*1.2,dy*1.2,0.));
  vec3 light=normalize(vec3(.45,.6,1.7));
  float lit=.56+.44*max(dot(detail,light),0.);
  vec3 stone=mix(vec3(.30,.29,.27),vec3(1.,.985,.955),a);
  vec3 color=stone*lit;
  float edge=1.-smoothstep(.997,1.,sqrt(r));
  gl_FragColor=vec4(color,edge);
}`;

function shader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const result=gl.createShader(type);
  if(!result) throw new Error('Shader allocation failed');
  gl.shaderSource(result,source); gl.compileShader(result);
  if(!gl.getShaderParameter(result,gl.COMPILE_STATUS)) {
    gl.deleteShader(result); throw new Error('Moon shader compilation failed');
  }
  return result;
}

export const RotatingMoon: React.FC<{ paused?: boolean }> = ({ paused=false }) => {
  const hostRef=useRef<HTMLDivElement>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const dustRef=useRef<HTMLCanvasElement>(null);
  const pausedRef=useRef(paused);
  const wakeRef=useRef<() => void>(()=>{});
  const [generation,setGeneration]=useState(0);
  useEffect(()=>{ pausedRef.current=paused; wakeRef.current(); },[paused]);

  useEffect(()=>{
    const host=hostRef.current,canvas=canvasRef.current,dustCanvas=dustRef.current;
    const hero=host?.closest<HTMLElement>('.tm-explorer-hero');
    if(!host||!canvas||!dustCanvas||!hero) return;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    let gl:WebGLRenderingContext|null=null;
    try { gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'}); } catch { /* Static fallback below. */ }
    if(!gl){host.dataset.renderMode='fallback';return;}
    const context=gl;
    let alive=true,lost=false,ready=false,visible=true,dragging=false;
    let angle=0,frame=0,lastTime=0,lastX=0,lastY=0,dragPointer=-1;
    let lookYaw=0,lookPitch=0,targetYaw=0,targetPitch=0,manualPitch=0;
    let lastPointerTime=0;
    let dustPointer:{x:number;y:number}|null=null;
    let vertex:WebGLShader|null=null,fragment:WebGLShader|null=null;
    let program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null,texture:WebGLTexture|null=null;
    const dispose=()=>{
      if(texture) context.deleteTexture(texture);
      if(buffer) context.deleteBuffer(buffer);
      if(program) context.deleteProgram(program);
      if(vertex) context.deleteShader(vertex);
      if(fragment) context.deleteShader(fragment);
    };
    try {
      vertex=shader(context,context.VERTEX_SHADER,VERTEX);
      fragment=shader(context,context.FRAGMENT_SHADER,FRAGMENT);
      program=context.createProgram();buffer=context.createBuffer();texture=context.createTexture();
      if(!program||!buffer||!texture) throw new Error('WebGL resource allocation failed');
      context.attachShader(program,vertex);context.attachShader(program,fragment);context.linkProgram(program);
      if(!context.getProgramParameter(program,context.LINK_STATUS)) throw new Error('Moon shader link failed');
      context.useProgram(program);context.bindBuffer(context.ARRAY_BUFFER,buffer);
      context.bufferData(context.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),context.STATIC_DRAW);
      const pos=context.getAttribLocation(program,'aPosition');
      if(pos<0) throw new Error('Missing geometry attribute');
      context.enableVertexAttribArray(pos);context.vertexAttribPointer(pos,2,context.FLOAT,false,0,0);
      context.activeTexture(context.TEXTURE0);context.bindTexture(context.TEXTURE_2D,texture);
      context.texParameteri(context.TEXTURE_2D,context.TEXTURE_WRAP_S,context.CLAMP_TO_EDGE);
      context.texParameteri(context.TEXTURE_2D,context.TEXTURE_WRAP_T,context.CLAMP_TO_EDGE);
      context.texParameteri(context.TEXTURE_2D,context.TEXTURE_MIN_FILTER,context.LINEAR);
      context.texParameteri(context.TEXTURE_2D,context.TEXTURE_MAG_FILTER,context.LINEAR);
      context.uniform1i(context.getUniformLocation(program,'uMoon'),0);
    }catch{dispose();host.dataset.renderMode='fallback';return;}
    const angleLocation=context.getUniformLocation(program,'uAngle');
    const pitchLocation=context.getUniformLocation(program,'uPitch');
    const texelLocation=context.getUniformLocation(program,'uTexel');
    const dust=createLunarDust(dustCanvas);
    const normalize=()=>{angle=((angle%TAU)+TAU)%TAU;};
    const canRun=()=>alive&&!lost&&ready&&visible&&!document.hidden&&!motion.matches&&!pausedRef.current;
    const draw=(elapsed=0)=>{
      if(!alive||lost||!ready) return;
      context.clearColor(0,0,0,0);context.clear(context.COLOR_BUFFER_BIT);
      const yaw=angle+lookYaw;
      const pitch=manualPitch+lookPitch;
      context.uniform1f(angleLocation,yaw);
      context.uniform1f(pitchLocation,pitch);
      context.drawArrays(context.TRIANGLES,0,6);
      if(canRun()) dust.draw(elapsed,yaw,pitch,dustPointer);
      host.dataset.angle=(angle*180/Math.PI).toFixed(3);
      host.dataset.lookYaw=(lookYaw/DEGREE).toFixed(2);
      host.dataset.lookPitch=(lookPitch/DEGREE).toFixed(2);
    };
    const resize=()=>{
      if(!alive||lost) return;
      const size=host.getBoundingClientRect();
      const dpr=Math.min(devicePixelRatio||1,1.6);
      const side=Math.max(1,Math.min(1800,Math.round(size.width*dpr)));
      if(canvas.width!==side||canvas.height!==side){canvas.width=side;canvas.height=side;}
      dust.resize(size.width,dpr);
      context.viewport(0,0,side,side);draw();
    };
    const releaseLook=()=>{
      targetYaw=0;targetPitch=0;dustPointer=null;
    };
    const tick=(now:number)=>{
      frame=0;
      if(!canRun()){lastTime=0;host.dataset.animating='false';return;}
      const elapsed=lastTime?Math.min((now-lastTime)/1000,.1):0;lastTime=now;
      if(!dragging&&now-lastPointerTime>LOOK_IDLE_MS) releaseLook();
      const easing=1-Math.exp(-elapsed*(dustPointer?7:4.5));
      lookYaw+=(targetYaw-lookYaw)*easing;
      lookPitch+=(targetPitch-lookPitch)*easing;
      if(!dragging){angle+=elapsed*TAU/PERIOD;normalize();}
      draw(elapsed);host.dataset.animating='true';frame=requestAnimationFrame(tick);
    };
    const wake=()=>{
      cancelAnimationFrame(frame);frame=0;lastTime=0;
      host.dataset.animating='false';
      if(!alive||lost) return;
      if(!canRun()){
        releaseLook();lookYaw=0;lookPitch=0;dust.clear();
      }
      if(visible&&!document.hidden) draw();
      if(canRun()) frame=requestAnimationFrame(tick);
    };
    wakeRef.current=wake;
    const trackPointer=(event:PointerEvent)=>{
      if(!event.isPrimary||!canRun()||(event.pointerType==='touch'&&!dragging)) return;
      const surface=canvas.getBoundingClientRect();
      if(!surface.width) return;
      dustPointer={
        x:2*(event.clientX-surface.left)/surface.width-1,
        y:2*(event.clientY-surface.top)/surface.height-1,
      };
      lastPointerTime=performance.now();
      if(dragging) return;
      const bounds=hero.getBoundingClientRect();
      const x=Math.max(-1,Math.min(1,2*(event.clientX-bounds.left)/bounds.width-1));
      const y=Math.max(-1,Math.min(1,2*(event.clientY-bounds.top)/bounds.height-1));
      targetYaw=x*22*DEGREE;
      targetPitch=y*14*DEGREE;
    };
    const clampPitch=(value:number)=>Math.max(-50*DEGREE,Math.min(50*DEGREE,value));
    const onDown=(event:PointerEvent)=>{
      if(event.button!==0||!event.isPrimary) return;
      dragging=true;lastX=event.clientX;lastY=event.clientY;dragPointer=event.pointerId;
      targetYaw=lookYaw;targetPitch=lookPitch;
      trackPointer(event);
      canvas.setPointerCapture(event.pointerId);
    };
    const onMove=(event:PointerEvent)=>{
      if(!dragging||event.pointerId!==dragPointer) return;
      const diameter=Math.max(100,canvas.clientWidth);
      angle+=(event.clientX-lastX)/diameter*TAU;
      manualPitch=clampPitch(manualPitch+(event.clientY-lastY)/diameter*Math.PI);
      lastX=event.clientX;lastY=event.clientY;normalize();draw();
    };
    const onUp=(event:PointerEvent)=>{
      if(event.pointerId!==dragPointer) return;
      dragging=false;dragPointer=-1;releaseLook();
    };
    const onKey=(event:KeyboardEvent)=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      if(event.key==='Home'){angle=0;manualPitch=0;releaseLook();lookYaw=0;lookPitch=0;}
      else if(event.key==='End') angle=TAU-Math.PI/12;
      else if(event.key==='ArrowUp'||event.key==='ArrowDown') manualPitch=clampPitch(manualPitch+(event.key==='ArrowUp'?-1:1)*10*DEGREE);
      else angle+=(event.key==='ArrowRight'?1:-1)*Math.PI/12;
      normalize();draw();
    };
    const onLost=(event:Event)=>{
      event.preventDefault();lost=true;ready=false;cancelAnimationFrame(frame);dust.clear();
      host.dataset.renderMode='fallback';host.dataset.animating='false';
    };
    const onRestored=()=>{if(alive) setGeneration((value)=>value+1);};
    const observer=new IntersectionObserver((entries)=>{visible=Boolean(entries[0]?.isIntersecting);wake();},{threshold:.01});
    const sizing=new ResizeObserver(resize);
    observer.observe(host);sizing.observe(host);
    hero.addEventListener('pointermove',trackPointer,{passive:true});
    hero.addEventListener('pointerleave',releaseLook);
    canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointermove',onMove);
    canvas.addEventListener('pointerup',onUp);canvas.addEventListener('pointercancel',onUp);canvas.addEventListener('lostpointercapture',onUp);
    canvas.addEventListener('keydown',onKey);canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',onRestored);
    document.addEventListener('visibilitychange',wake);motion.addEventListener('change',wake);
    const image=new Image();
    image.onload=()=>{
      if(!alive||lost) return;
      try{
        context.bindTexture(context.TEXTURE_2D,texture);
        context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL,false);
        context.texImage2D(context.TEXTURE_2D,0,context.RGBA,context.RGBA,context.UNSIGNED_BYTE,image);
        const powerOfTwo=(n:number)=>(n&(n-1))===0;
        if(powerOfTwo(image.width)&&powerOfTwo(image.height))context.texParameteri(context.TEXTURE_2D,context.TEXTURE_WRAP_S,context.REPEAT);
        context.uniform2f(texelLocation,1/image.width,1/image.height);
        ready=true;host.dataset.renderMode='webgl';resize();wake();
      }catch{host.dataset.renderMode='fallback';ready=false;wake();}
    };
    image.onerror=()=>{ready=false;host.dataset.renderMode='fallback';wake();};
    host.dataset.renderMode='loading';image.src=MAP;resize();
    return ()=>{
      alive=false;cancelAnimationFrame(frame);wakeRef.current=()=>{};
      image.onload=null;image.onerror=null;observer.disconnect();sizing.disconnect();
      hero.removeEventListener('pointermove',trackPointer);hero.removeEventListener('pointerleave',releaseLook);
      canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointermove',onMove);
      canvas.removeEventListener('pointerup',onUp);canvas.removeEventListener('pointercancel',onUp);canvas.removeEventListener('lostpointercapture',onUp);
      canvas.removeEventListener('keydown',onKey);canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);
      document.removeEventListener('visibilitychange',wake);motion.removeEventListener('change',wake);dispose();
    };
  },[generation]);

  return (
    <div className="tm-retro-moon tm-explorer-moon" ref={hostRef} data-render-mode="loading" data-angle="0" data-animating="false" data-rotation-seconds={PERIOD} style={{'--moon-texture':`url("${MAP}")`} as React.CSSProperties}>
      <div className="tm-retro-moon-fallback" aria-hidden="true" />
      <canvas className="tm-lunar-surface" ref={canvasRef} role="img" tabIndex={0} aria-label="White three-dimensional Moon. Move across the scene to turn the Moon. Drag or use the arrow keys to explore its surface. Home resets the view." />
      <canvas className="tm-lunar-dust" ref={dustRef} aria-hidden="true" />
    </div>
  );
};
