import React, { useLayoutEffect, useRef } from 'react';
import { ExplorerSky } from './ExplorerSky';
import { documentTop } from '../utils/documentTop';
import './OpeningCamera.css';

interface OpeningCameraProps {
  home: React.ReactNode;
  children: React.ReactNode;
}

export const OpeningCamera: React.FC<OpeningCameraProps> = ({ home, children }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scene = sceneRef.current, world = worldRef.current;
    const cover = homeRef.current, projects = projectsRef.current;
    if (!scene || !world || !cover || !projects) return;
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 600px)');
    let start = 0, distance = 0, width = 0, frame = 0;

    const clear = () => {
      world.style.removeProperty('transform');
      projects.style.removeProperty('transform');
      scene.style.removeProperty('--camera-sky-x');
      scene.style.removeProperty('--camera-orbit-x');
      scene.style.removeProperty('--camera-tint');
    };
    const paint = () => {
      if (!motion.matches || !distance) {
        clear();
        return;
      }
      const travelled = Math.max(0, Math.min(distance, window.scrollY - start));
      const progress = travelled / distance;
      const pan = Math.round(progress * width);
      // Move one world beneath the camera. Vertical compensation holds its
      // horizon still, then lets the gallery use its existing document scroll.
      world.style.transform = `translate3d(${-pan}px, ${travelled}px, 0)`;
      scene.style.setProperty('--camera-sky-x', `${-pan * .4}px`);
      scene.style.setProperty('--camera-orbit-x', `${-pan * .65}px`);
      scene.style.setProperty('--camera-tint', `${progress * 100}%`);
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        paint();
      });
    };
    const measure = () => {
      start = documentTop(cover);
      distance = cover.offsetHeight;
      width = scene.clientWidth;
      scene.dataset.cameraMode = motion.matches ? 'pan' : 'native';
      // Projects occupies the right side of the same world. Keeping its native
      // layout position preserves anchor, keyboard and sticky-gallery offsets.
      if (motion.matches) projects.style.transform = `translate3d(${width}px, ${-distance}px, 0)`;
      paint();
    };
    const revealFocusedPanel = (event: FocusEvent) => {
      if (!motion.matches || !(event.target instanceof HTMLElement) || !event.target.matches(':focus-visible')) return;
      if (cover.contains(event.target) && window.scrollY > start + 1) {
        window.scrollTo({ top: start, behavior: 'instant' });
      } else if (projects.contains(event.target) && window.scrollY < start + distance - 1) {
        window.scrollTo({ top: start + distance, behavior: 'instant' });
      } else return;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(cover);
    observer.observe(scene);
    motion.addEventListener('change', measure);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', schedule, { passive: true });
    // Complete the camera move before the gallery handles focus within its rail.
    scene.addEventListener('focusin', revealFocusedPanel, true);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', measure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', schedule);
      scene.removeEventListener('focusin', revealFocusedPanel, true);
      cancelAnimationFrame(frame);
      clear();
      delete scene.dataset.cameraMode;
    };
  }, []);

  return (
    <div className="tm-camera-sequence" ref={sceneRef}>
      <div className="tm-camera-space" aria-hidden="true">
        <span className="tm-camera-orbit" />
        <ExplorerSky panorama />
      </div>
      <div className="tm-camera-world" ref={worldRef}>
        <div id="home" className="tm-camera-home" ref={homeRef}>{home}</div>
        <div className="tm-camera-projects" ref={projectsRef}>{children}</div>
      </div>
    </div>
  );
};
