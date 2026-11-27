import React, { useLayoutEffect, useRef } from 'react';
import { documentTop } from '../utils/documentTop';
import './OpeningCamera.css';

interface OpeningCameraProps {
  home: React.ReactNode;
  children: React.ReactNode;
}

export const OpeningCamera: React.FC<OpeningCameraProps> = ({ home, children }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scene = sceneRef.current, cover = homeRef.current, projects = projectsRef.current;
    if (!scene || !cover || !projects) return;
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 600px)');
    let start = 0, distance = 0, width = 0, frame = 0;

    const clear = () => {
      cover.style.removeProperty('transform');
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
      // Share one pixel-aligned edge; fractional clipping can expose a hairline
      // of the page underneath on odd-width phone viewports.
      const pan = Math.round(progress * width);
      // Counter the vertical scroll for one viewport. The two pages then share
      // a horizon while the camera travels right across their joined edge.
      cover.style.transform = `translate3d(${-pan}px, ${travelled}px, 0)`;
      if (progress < 1) {
        projects.style.transform = `translate3d(${width - pan}px, ${travelled - distance}px, 0)`;
      } else {
        projects.style.removeProperty('transform');
      }
      scene.style.setProperty('--camera-sky-x', `${progress * width * .14}px`);
      scene.style.setProperty('--camera-orbit-x', `${(1 - progress) * width * .08}px`);
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
      <div id="home" className="tm-camera-home" ref={homeRef}>{home}</div>
      <div className="tm-camera-projects" ref={projectsRef}>{children}</div>
    </div>
  );
};
