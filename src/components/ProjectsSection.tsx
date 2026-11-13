import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { PORTFOLIO_PROJECTS, type PortfolioProject } from '../data/portfolioData';
import { LENS_BLOOM_POSTERS, type LensBloomPosterCard } from './PosterSection';
import './ProjectsSection.css';

interface ProjectsSectionProps {
  onSelectProject: (projectId: string, trigger: HTMLElement | null) => void;
  isAllProjectsOpen?: boolean;
  onOpenAllProjects?: () => void;
  onCloseAllProjects?: () => void;
}

// One editorial case study for the three Urdu poster designs.
const POSTER_SERIES = ['Shanakht', 'Wajood', 'Chai']
  .map((name) => LENS_BLOOM_POSTERS.find((poster) => poster.name.startsWith(name)))
  .filter((poster): poster is LensBloomPosterCard => Boolean(poster));

type GalleryEntry =
  | { kind: 'case'; project: PortfolioProject }
  | { kind: 'poster-series'; id: 'poster-typography' };

const featuredIds = [
  'lumera-candle-identity',
  'riwaq-fragrance-identity',
  'roast-and-rhythm-cafe',
];

const galleryEntries: GalleryEntry[] = [
  ...featuredIds.flatMap((id): GalleryEntry[] => {
    const project = PORTFOLIO_PROJECTS.find((item) => item.id === id);
    return project ? [{ kind: 'case', project }] : [];
  }),
  { kind: 'poster-series', id: 'poster-typography' },
];

const entryTitle = (entry: GalleryEntry): string =>
  entry.kind === 'case' ? entry.project.title : 'Poster Typography';

const entryCaption = (entry: GalleryEntry): string =>
  entry.kind === 'case' ? entry.project.location : 'Shanakht · Wajood · Chai';

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onSelectProject,
  isAllProjectsOpen,
  onOpenAllProjects,
  onCloseAllProjects,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const apertureRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const indexTrigger = useRef<HTMLButtonElement>(null);
  const handingOff = useRef(false);
  const [localIndexOpen, setLocalIndexOpen] = useState(false);
  const [posterStudyOpen, setPosterStudyOpen] = useState(false);
  const [posterSlide, setPosterSlide] = useState(0);

  const isIndexOpen = isAllProjectsOpen ?? localIndexOpen;
  const isAnyDialogOpen = isIndexOpen || posterStudyOpen;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onCloseAllProjects);
  onCloseRef.current = onCloseAllProjects;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const aperture = apertureRef.current;
    const track = trackRef.current;
    if (!section || !aperture || !track) return;

    const motion = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 600px)');
    const header = document.querySelector<HTMLElement>('[data-editorial-nav]');
    let travel = 0;
    let frame = 0;
    let focusFrame = 0;

    const offset = () => Math.max(0, Math.min(travel, -section.getBoundingClientRect().top));
    const paint = () => {
      if (travel) track.style.transform = `translate3d(${-offset()}px, 0, 0)`;
    };
    const schedule = () => {
      if (!travel || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        paint();
      });
    };
    const revealNative = (control: HTMLElement) => {
      const study = control.closest<HTMLElement>('.tm-hung-study');
      if (!study || section.dataset.galleryMode !== 'native') return;
      const rail = track.getBoundingClientRect();
      const card = study.getBoundingClientRect();
      const limit = track.scrollWidth - track.clientWidth;
      if (limit > 0 && (card.left < rail.left - 1 || card.right > rail.right + 1)) {
        const left = Math.min(limit, Math.max(0, track.scrollLeft + card.left - rail.left));
        track.scrollTo({ left, behavior: 'instant' });
      }
      const rect = control.getBoundingClientRect();
      const top = (header?.offsetHeight ?? 0) + 8;
      const bottom = window.innerHeight - 8;
      let delta = 0;
      if (rect.height > bottom - top) delta = (rect.top + rect.bottom - top - bottom) / 2;
      else if (rect.top < top) delta = rect.top - top;
      else if (rect.bottom > bottom) delta = rect.bottom - bottom;
      if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' });
    };
    const keepNativeFocusVisible = (control: HTMLElement) => {
      revealNative(control);
      // Focus can trigger a browser scroll after focusin. Recheck once, using
      // the final layout, without following a control the user has since left.
      cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(() => {
        if (document.activeElement === control) revealNative(control);
      });
    };
    const measure = () => {
      const wasPinned = section.dataset.galleryMode === 'pinned';
      const focused = document.activeElement;
      const keepFocus = wasPinned && !motion.matches && focused instanceof HTMLElement &&
        track.contains(focused) && section.getBoundingClientRect().bottom > 0 &&
        section.getBoundingClientRect().top < window.innerHeight;
      section.style.setProperty('--gallery-header', `${header?.offsetHeight ?? 96}px`);
      section.dataset.galleryMode = motion.matches ? 'pinned' : 'native';
      travel = motion.matches ? Math.max(0, track.scrollWidth - aperture.clientWidth) : 0;
      section.style.setProperty('--gallery-travel', `${travel}px`);
      if (travel) {
        track.scrollLeft = 0;
        paint();
      } else {
        track.style.removeProperty('transform');
        if (keepFocus) keepNativeFocusVisible(focused);
      }
    };

    // A clipped viewport cannot acquire a second, browser-managed scrollLeft
    // when Tab moves to an offscreen print. Move along the page's scroll axis.
    const revealFocusedStudy = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement) || !event.target.matches(':focus-visible')) return;
      if (!travel) {
        keepNativeFocusVisible(event.target);
        return;
      }
      const study = event.target.closest<HTMLElement>('.tm-hung-study');
      if (!study) return;
      const current = offset();
      const left = study.offsetLeft;
      const right = left + study.offsetWidth;
      let next: number;
      if (left < current - 1) next = left;
      else if (right > current + aperture.clientWidth + 1) next = right - aperture.clientWidth;
      else return;
      const start = window.scrollY + section.getBoundingClientRect().top;
      window.scrollTo({ top: start + Math.min(travel, Math.max(0, next)), behavior: 'instant' });
      paint();
    };
    const handleRailKeys = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (!['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const studies = [...track.querySelectorAll<HTMLElement>('.tm-hung-study')];
      const currentStudy = document.activeElement?.closest<HTMLElement>('.tm-hung-study');
      const current = currentStudy ? studies.indexOf(currentStudy) : -1;
      let next = current + (event.key === 'ArrowLeft' ? -1 : 1);
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = studies.length - 1;
      const target = studies[Math.max(0, Math.min(next, studies.length - 1))];
      event.preventDefault();
      target?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(aperture);
    observer.observe(track);
    if (header) observer.observe(header);
    motion.addEventListener('change', measure);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', schedule, { passive: true });
    track.addEventListener('focusin', revealFocusedStudy);
    track.addEventListener('keydown', handleRailKeys);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', measure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', schedule);
      track.removeEventListener('focusin', revealFocusedStudy);
      track.removeEventListener('keydown', handleRailKeys);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(focusFrame);
    };
  }, []);

  const closeIndex = () => {
    if (onCloseRef.current) onCloseRef.current();
    else setLocalIndexOpen(false);
  };

  const closeDialogs = () => {
    if (posterStudyOpen) setPosterStudyOpen(false);
    else closeIndex();
  };

  const openIndex = () => {
    lastTrigger.current = indexTrigger.current;
    if (onOpenAllProjects) onOpenAllProjects();
    else setLocalIndexOpen(true);
  };

  const openEntry = (entry: GalleryEntry, button: HTMLButtonElement) => {
    const trigger = isIndexOpen ? indexTrigger.current : button;
    lastTrigger.current = trigger;
    if (isIndexOpen) closeIndex();

    switch (entry.kind) {
      case 'case':
        handingOff.current = isIndexOpen;
        onSelectProject(entry.project.id, trigger);
        break;
      case 'poster-series':
        setPosterSlide(0);
        setPosterStudyOpen(true);
        break;
    }
  };

  useEffect(() => {
    if (!isAnyDialogOpen) return;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });

    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (posterStudyOpen) setPosterStudyOpen(false);
        else if (onCloseRef.current) onCloseRef.current();
        else setLocalIndexOpen(false);
      }
      if (posterStudyOpen && POSTER_SERIES.length > 0) {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          setPosterSlide((index) => (index + 1) % POSTER_SERIES.length);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          setPosterSlide((index) => (index - 1 + POSTER_SERIES.length) % POSTER_SERIES.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => {
      window.removeEventListener('keydown', handleKeys);
      document.body.style.overflow = priorOverflow;
      if (!handingOff.current) lastTrigger.current?.focus({ preventScroll: true });
      handingOff.current = false;
    };
  }, [isAnyDialogOpen, posterStudyOpen]);

  const handlePanelTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const controls = panelRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    if (!controls?.length) return;
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const activePoster = POSTER_SERIES[posterSlide];

  return (
    <section ref={sectionRef} id="project" className="tm-projects tm-epok-gallery tm-hanging-gallery" aria-labelledby="tm-gallery-title">
      <div className="tm-epok-shell tm-hung-shell">
        <canvas className="tm-lunar-orbit" aria-hidden="true" />
        <h2 id="tm-gallery-title" className="tm-hung-heading">Selected projects</h2>

        <div className="tm-hung-window" ref={apertureRef}>
          <div
            className="tm-hung-strip"
            ref={trackRef}
            role="region"
            aria-label="Four horizontally arranged hanging case studies"
            tabIndex={0}
          >
            {galleryEntries.map((entry, index) => {
              const title = entryTitle(entry);
              const isPoster = entry.kind === 'poster-series';
              const image = isPoster
                ? POSTER_SERIES[0]?.src || ''
                : entry.project.slides.find((slide) => slide.imageUrl)?.imageUrl || '';

              return (
                <article
                  key={entry.kind === 'case' ? entry.project.id : entry.id}
                  className="tm-hung-study"
                  data-gallery-kind={entry.kind}
                  data-gallery-title={title}
                >
                  <div className="tm-hung-piece">
                    <div className="tm-hung-hardware" aria-hidden="true">
                      <span className="tm-hung-anchor tm-hung-anchor--left">
                        <span className="tm-hung-wire" />
                        <span className="tm-hung-clip" />
                      </span>
                      <span className="tm-hung-anchor tm-hung-anchor--right">
                        <span className="tm-hung-wire" />
                        <span className="tm-hung-clip" />
                      </span>
                    </div>
                    <button
                      type="button"
                      className="tm-hung-paper"
                      onClick={(event) => openEntry(entry, event.currentTarget)}
                      aria-label={isPoster
                        ? 'Open Poster Typography case study'
                        : 'Open ' + title + ' case study'}
                    >
                      <img
                        src={image}
                        alt={isPoster
                          ? 'Shanakht — cover of the Shanakht, Wajood and Chai typography case study'
                          : title + ' original project artwork'}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                      <span className="tm-hung-open" aria-hidden="true">
                        <ArrowUpRight size={17} strokeWidth={1.6} />
                      </span>
                    </button>
                  </div>
                  <div className="tm-hung-label">
                    <button type="button" onClick={(event) => openEntry(entry, event.currentTarget)} aria-label={'View ' + title}>
                      {title} <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                    <p>{entryCaption(entry)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        <div className="tm-hung-mobile-cue" aria-hidden="true">Swipe for more <span>→</span></div>

        <footer className="tm-epok-footer tm-hung-footer">
          <button type="button" ref={indexTrigger} onClick={openIndex}>
            View index
            <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </footer>
      </div>

      {isIndexOpen && createPortal(
        <div className="tm-epok-overlay" role="dialog" aria-modal="true" aria-labelledby="tm-epok-index-title">
          <button className="tm-epok-overlay-scrim" type="button" onClick={closeIndex} aria-label="Close works index" tabIndex={-1} />
          <div className="tm-epok-overlay-panel" onKeyDown={handlePanelTab} ref={panelRef}>
            <div className="tm-epok-overlay-head">
              <span>01 / THE INDEX</span>
              <button type="button" onClick={closeIndex} ref={closeRef}>
                CLOSE <X size={17} aria-hidden="true" />
              </button>
            </div>
            <h2 id="tm-epok-index-title">Selected <em>work</em></h2>
            <div className="tm-epok-index-list">
              {galleryEntries.map((entry, index) => (
                <button
                  type="button"
                  className="tm-epok-index-row"
                  key={entry.kind === 'case' ? entry.project.id : entry.id}
                  onClick={(event) => openEntry(entry, event.currentTarget)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span className="tm-epok-index-name">{entryTitle(entry)}</span>
                  <span className="tm-epok-index-type">
                    {entry.kind === 'case' ? 'IDENTITY' : 'PRINT'}
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {posterStudyOpen && activePoster && createPortal(
        <div className="tm-epok-overlay tm-epok-study-overlay" role="dialog" aria-modal="true" aria-labelledby="tm-epok-study-title">
          <button className="tm-epok-overlay-scrim" type="button" onClick={closeDialogs} aria-label="Close poster typography case study" tabIndex={-1} />
          <div className="tm-epok-study-panel" onKeyDown={handlePanelTab} ref={panelRef}>
            <div className="tm-epok-overlay-head">
              <span>04 / POSTER TYPOGRAPHY</span>
              <button type="button" ref={closeRef} onClick={closeDialogs}>
                CLOSE <X size={17} aria-hidden="true" />
              </button>
            </div>
            <div className="tm-epok-study-header">
              <h2 id="tm-epok-study-title">Poster <em>Typography</em></h2>
              <p>Three studies in Urdu lettering, culture and print.</p>
            </div>
            <div className="tm-epok-study-layout">
              <div className="tm-epok-study-art">
                <img src={activePoster.src} alt={activePoster.name + ' original poster artwork'} />
              </div>
              <div className="tm-epok-study-meta">
                <span className="tm-epok-study-counter">PLATE {String(posterSlide + 1).padStart(2, '0')} / 03</span>
                <h3>{activePoster.name}</h3>
                <p>{activePoster.description}</p>
                <div className="tm-epok-study-actions">
                  <button
                    type="button"
                    onClick={() => setPosterSlide((index) => (index - 1 + POSTER_SERIES.length) % POSTER_SERIES.length)}
                    aria-label="Previous poster"
                  >
                    <ArrowLeft size={19} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosterSlide((index) => (index + 1) % POSTER_SERIES.length)}
                    aria-label="Next poster"
                  >
                    <ArrowRight size={19} aria-hidden="true" />
                  </button>
                </div>
                <div className="tm-epok-study-thumbnails" aria-label="Poster plates">
                  {POSTER_SERIES.map((poster, index) => (
                    <button
                      type="button"
                      key={poster.src}
                      onClick={() => setPosterSlide(index)}
                      aria-label={'View ' + poster.name + ' plate'}
                      aria-pressed={index === posterSlide}
                    >
                      <img src={poster.src} alt="" loading="lazy" />
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}


    </section>
  );
};
