import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { PORTFOLIO_PROJECTS, type PortfolioProject } from '../data/portfolioData';
import { LENS_BLOOM_POSTERS, type LensBloomPosterCard } from './PosterSection';
import './ProjectsSection.css';

interface ProjectsSectionProps {
  onSelectProject: (projectId: string) => void;
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

  const closeIndex = () => {
    if (onCloseRef.current) onCloseRef.current();
    else setLocalIndexOpen(false);
  };

  const closeDialogs = () => {
    if (posterStudyOpen) setPosterStudyOpen(false);
    else closeIndex();
  };

  const openIndex = () => {
    lastTrigger.current = document.activeElement as HTMLElement;
    if (onOpenAllProjects) onOpenAllProjects();
    else setLocalIndexOpen(true);
  };

  const openEntry = (entry: GalleryEntry) => {
    lastTrigger.current = document.activeElement as HTMLElement;
    if (isIndexOpen) closeIndex();

    switch (entry.kind) {
      case 'case':
        onSelectProject(entry.project.id);
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
    closeRef.current?.focus();

    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (posterStudyOpen) setPosterStudyOpen(false);
        else if (onCloseRef.current) onCloseRef.current();
        else setLocalIndexOpen(false);
      }
      if (posterStudyOpen && POSTER_SERIES.length > 0) {
        if (event.key === 'ArrowRight') {
          setPosterSlide((index) => (index + 1) % POSTER_SERIES.length);
        } else if (event.key === 'ArrowLeft') {
          setPosterSlide((index) => (index - 1 + POSTER_SERIES.length) % POSTER_SERIES.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => {
      window.removeEventListener('keydown', handleKeys);
      document.body.style.overflow = priorOverflow;
      lastTrigger.current?.focus();
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
    <section id="project" className="tm-projects tm-epok-gallery tm-hanging-gallery" aria-labelledby="tm-gallery-title">
      <div className="tm-epok-shell tm-hung-shell">
        <h2 id="tm-gallery-title" className="sr-only">Selected design projects</h2>
        <div className="tm-hung-running">
          <span>02 / SELECTED PROJECTS</span>
          <span>TUMANEEN — A VISUAL NOTEBOOK</span>
        </div>

        {/* Four original case studies share one continuous horizontal hanging rail.
            On narrow screens the row scrolls, rather than wrapping into cards. */}
        <div
          className="tm-hung-strip"
          role="region"
          aria-label="Four horizontally arranged hanging case studies"
          tabIndex={0}
        >
          {galleryEntries.map((entry, index) => {
            const title = entryTitle(entry);
            const number = String(index + 1).padStart(2, '0');
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
                    onClick={() => openEntry(entry)}
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
                  <span className="tm-hung-label-folio">{number} / 04</span>
                  <button type="button" onClick={() => openEntry(entry)} aria-label={'View ' + title}>
                    {title} <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <p>{entryCaption(entry)}</p>
                </div>
              </article>
            );
          })}
        </div>
        <div className="tm-hung-mobile-cue" aria-hidden="true">SWIPE TO VIEW ALL FOUR STUDIES <span>→</span></div>

        <footer className="tm-epok-footer tm-hung-footer">
          <span>FATIMAH GHANI / SELECTED CASE STUDIES</span>
          <button type="button" onClick={openIndex}>
            VIEW INDEX <span>{String(galleryEntries.length).padStart(2, '0')}</span>
            <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </footer>
      </div>

      {isIndexOpen && createPortal(
        <div className="tm-epok-overlay" role="dialog" aria-modal="true" aria-labelledby="tm-epok-index-title">
          <button className="tm-epok-overlay-scrim" type="button" onClick={closeIndex} aria-label="Close works index" tabIndex={-1} />
          <div className="tm-epok-overlay-panel" onKeyDown={handlePanelTab} ref={panelRef}>
            <div className="tm-epok-overlay-head">
              <span>02 / THE INDEX</span>
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
                  onClick={() => openEntry(entry)}
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
            <p className="tm-epok-overlay-foot">TUMANEEN / WORKS IN PROGRESS</p>
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
