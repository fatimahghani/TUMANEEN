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
  | { kind: 'poster-series'; id: 'poster-typography' }
  | { kind: 'empty'; id: 'untitled-case-study' };

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
  { kind: 'empty', id: 'untitled-case-study' },
];

const entryTitle = (entry: GalleryEntry): string => {
  if (entry.kind === 'case') return entry.project.title;
  return entry.kind === 'poster-series' ? 'Poster Typography' : 'Untitled';
};

const entryCaption = (entry: GalleryEntry): string => {
  if (entry.kind === 'case') return entry.project.location;
  return entry.kind === 'poster-series' ? 'Shanakht · Wajood · Chai' : 'Reserved for a future case study';
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onSelectProject,
  isAllProjectsOpen,
  onOpenAllProjects,
  onCloseAllProjects,
}) => {
  const [localIndexOpen, setLocalIndexOpen] = useState(false);
  const [posterStudyOpen, setPosterStudyOpen] = useState(false);
  const [posterSlide, setPosterSlide] = useState(0);
  const [emptyStudyOpen, setEmptyStudyOpen] = useState(false);

  const isIndexOpen = isAllProjectsOpen ?? localIndexOpen;
  const isAnyDialogOpen = isIndexOpen || posterStudyOpen || emptyStudyOpen;
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
    else if (emptyStudyOpen) setEmptyStudyOpen(false);
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
      case 'empty':
        setEmptyStudyOpen(true);
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
        else if (emptyStudyOpen) setEmptyStudyOpen(false);
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
  }, [isAnyDialogOpen, posterStudyOpen, emptyStudyOpen]);

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
    <section id="project" className="tm-projects tm-epok-gallery" aria-labelledby="tm-gallery-title">
      <div className="tm-epok-shell">
        <h2 id="tm-gallery-title" className="sr-only">Selected design projects</h2>
        <div className="tm-epok-running">
          <span>02 / SELECTED PROJECTS</span>
          <span>TUMANEEN — 2026</span>
        </div>

        {/* Independent columns: the second project in one column never waits
            for the tallest artwork in another (as in the Epok grid). */}
        <div className="tm-epok-grid" aria-label="Case studies by Fatimah Ghani">
          {[[0, 3], [1, 4], [2]].map((indexes, columnIndex) => (
            <div
              className={'tm-epok-column tm-epok-column--' + String(columnIndex + 1).padStart(2, '0')}
              data-gallery-column={columnIndex + 1}
              key={columnIndex}
            >
              {indexes.map((entryIndex) => {
                const entry = galleryEntries[entryIndex];
                const number = String(entryIndex + 1).padStart(2, '0');
                const title = entryTitle(entry);
                const key = entry.kind === 'case' ? entry.project.id : entry.id;

                return (
                  <article
                    key={key}
                    className={'tm-epok-item tm-epok-item--' + number}
                    data-gallery-kind={entry.kind}
                    data-gallery-title={title}
                  >
                    <div className="tm-museum-hanging">
                      <svg
                        className="tm-museum-wire"
                        viewBox="0 0 100 28"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path d="M13 28 L50 3 L87 28" />
                        <circle cx="50" cy="3" r="1.5" />
                      </svg>
                      <div className="tm-museum-frame">
                        <div className="tm-museum-mat">
                          {entry.kind === 'empty' ? (
                            <button
                              type="button"
                              className="tm-epok-blank-leaf"
                              onClick={() => openEntry(entry)}
                              aria-label="Open empty Untitled case study"
                            >
                              <span className="tm-epok-blank-overline">A PAGE TO COME</span>
                              <span className="tm-epok-blank-bottom">CASE STUDY RESERVED</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="tm-epok-image"
                              onClick={() => openEntry(entry)}
                              aria-label={entry.kind === 'poster-series'
                                ? 'Open Poster Typography case study'
                                : 'Open ' + title + ' case study'}
                            >
                              {entry.kind === 'poster-series' ? (
                                <span className="tm-epok-poster-collage" aria-hidden="true">
                                  {POSTER_SERIES.map((poster, i) => (
                                    <img
                                      key={poster.src}
                                      src={poster.src}
                                      alt=""
                                      data-poster-preview={poster.name.split(' ')[0]}
                                      loading="lazy"
                                      decoding="async"
                                      className={'tm-epok-poster-preview tm-epok-poster-preview--' + (i + 1)}
                                    />
                                  ))}
                                </span>
                              ) : (
                                <img
                                  src={entry.project.slides.find((slide) => slide.imageUrl)?.imageUrl || ''}
                                  alt={title + ' original brand identity artwork'}
                                  loading={entryIndex === 0 ? 'eager' : 'lazy'}
                                  decoding="async"
                                />
                              )}
                              <span className="tm-epok-image-arrow" aria-hidden="true">
                                <ArrowUpRight size={18} strokeWidth={1.6} />
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="tm-epok-caption">
                      <span className="tm-museum-label-number">EXHIBIT {number}</span>
                      <div className="tm-epok-caption-heading">
                        <button
                          type="button"
                          onClick={() => openEntry(entry)}
                          aria-label={'View ' + title}
                        >
                          <span className="tm-epok-caption-name">{title}</span>
                          <ArrowUpRight className="tm-epok-caption-arrow" size={14} strokeWidth={1.7} aria-hidden="true" />
                        </button>
                      </div>
                      <p>{entryCaption(entry)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ))}
        </div>

        <footer className="tm-epok-footer">
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
                    {entry.kind === 'case' ? 'IDENTITY' : entry.kind === 'poster-series' ? 'PRINT' : 'UPCOMING'}
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

      {emptyStudyOpen && createPortal(
        <div className="tm-epok-overlay" role="dialog" aria-modal="true" aria-labelledby="tm-epok-empty-title">
          <button className="tm-epok-overlay-scrim" type="button" onClick={closeDialogs} aria-label="Close empty case study" tabIndex={-1} />
          <div className="tm-epok-overlay-panel tm-epok-empty-panel" onKeyDown={handlePanelTab} ref={panelRef}>
            <div className="tm-epok-overlay-head">
              <span>05 / CASE STUDY RESERVED</span>
              <button type="button" ref={closeRef} onClick={closeDialogs}>
                CLOSE <X size={17} aria-hidden="true" />
              </button>
            </div>
            <div className="tm-epok-empty-detail">
              <span>STUDY NO. 05</span>
              <h2 id="tm-epok-empty-title">Untitled<span aria-hidden="true">.</span></h2>
              <div className="tm-epok-empty-rule" aria-hidden="true" />
              <p>A blank page for the next project.</p>
            </div>
            <p className="tm-epok-overlay-foot">TUMANEEN / OPEN EDITION</p>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
