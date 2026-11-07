import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, X } from 'lucide-react';
import { PORTFOLIO_PROJECTS, type PortfolioProject } from '../data/portfolioData';
import { LENS_BLOOM_POSTERS, type LensBloomPosterCard } from './PosterSection';
import './ProjectsSection.css';

interface ProjectsSectionProps {
  onSelectProject: (projectId: string) => void;
  isAllProjectsOpen?: boolean;
  onOpenAllProjects?: () => void;
  onCloseAllProjects?: () => void;
}

type GalleryEntry =
  | { kind: 'case'; project: PortfolioProject }
  | { kind: 'poster'; poster: LensBloomPosterCard };

// Edit the actual work, not a layer of decorative cards or filler images.
const findCase = (id: string): GalleryEntry | undefined => {
  const project = PORTFOLIO_PROJECTS.find((item) => item.id === id);
  return project ? { kind: 'case', project } : undefined;
};

const findPoster = (name: string): GalleryEntry | undefined => {
  const poster = LENS_BLOOM_POSTERS.find((item) => item.name.startsWith(name));
  return poster ? { kind: 'poster', poster } : undefined;
};

const selectedEntries = [
  findCase('lumera-candle-identity'),
  findPoster('Shanakht'),
  findCase('riwaq-fragrance-identity'),
  findPoster('Wajood'),
  findCase('roast-and-rhythm-cafe'),
  findPoster('Chai'),
].filter((entry): entry is GalleryEntry => Boolean(entry));

const entryTitle = (entry: GalleryEntry) =>
  entry.kind === 'case' ? entry.project.title : entry.poster.name;
const entryCaption = (entry: GalleryEntry) =>
  entry.kind === 'case' ? entry.project.location : entry.poster.project;
const entryImage = (entry: GalleryEntry) =>
  entry.kind === 'case'
    ? entry.project.slides.find((slide) => slide.imageUrl)?.imageUrl || ''
    : entry.poster.src;

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onSelectProject,
  isAllProjectsOpen,
  onOpenAllProjects,
  onCloseAllProjects,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activePoster, setActivePoster] = useState<LensBloomPosterCard | null>(null);
  const isIndexOpen = isAllProjectsOpen ?? internalOpen;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onCloseAllProjects);
  onCloseRef.current = onCloseAllProjects;

  const closeIndex = () => {
    if (onCloseRef.current) onCloseRef.current();
    else setInternalOpen(false);
  };
  const openIndex = () => {
    if (onOpenAllProjects) onOpenAllProjects();
    else setInternalOpen(true);
  };

  const openEntry = (entry: GalleryEntry) => {
    if (isIndexOpen) closeIndex();
    if (entry.kind === 'case') {
      setActivePoster(null);
      onSelectProject(entry.project.id);
    } else {
      setActivePoster(entry.poster);
    }
  };

  // Keep both gallery dialogs above the fixed navigation and keyboard accessible.
  useEffect(() => {
    if (!isIndexOpen && !activePoster) return;
    const priorFocus = document.activeElement as HTMLElement | null;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (activePoster) setActivePoster(null);
      else if (onCloseRef.current) onCloseRef.current();
      else setInternalOpen(false);
    };
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('keydown', escape);
      document.body.style.overflow = priorOverflow;
      priorFocus?.focus();
    };
  }, [isIndexOpen, activePoster]);

  const trapTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = panelRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
    if (!focusable?.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <section id="project" className="tm-projects tm-epok-gallery" aria-labelledby="tm-gallery-title">
      <div className="tm-epok-shell">
        <h2 id="tm-gallery-title" className="sr-only">Selected projects and posters</h2>

        <div className="tm-epok-running" aria-label="Portfolio index">
          <span>02 / WORK &amp; PRINT</span>
          <span>TUMANEEN — 2026</span>
        </div>

        <div className="tm-epok-grid" aria-label="Works by Fatimah Ghani">
          {selectedEntries.map((entry, index) => {
            const number = String(index + 1).padStart(2, '0');
            const title = entryTitle(entry);
            const image = entryImage(entry);
            const isPoster = entry.kind === 'poster';
            return (
              <article
                key={entry.kind === 'case' ? entry.project.id : entry.poster.src}
                className={'tm-epok-item tm-epok-item--' + number}
                data-gallery-kind={entry.kind}
                data-gallery-title={isPoster ? entry.poster.name.split(' ')[0] : title}
              >
                <button
                  type="button"
                  className="tm-epok-image"
                  onClick={() => openEntry(entry)}
                  aria-label={isPoster ? 'View ' + title + ' poster' : 'Open ' + title + ' case study'}
                >
                  <img
                    src={image}
                    alt={title + (isPoster ? ' — original poster design' : ' — original identity design')}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <span className="tm-epok-image-arrow" aria-hidden="true"><ArrowUpRight size={18} strokeWidth={1.6} /></span>
                </button>
                <div className="tm-epok-caption">
                  <div className="tm-epok-caption-heading">
                    <button type="button" onClick={() => openEntry(entry)}>
                      {title}
                    </button>
                    <span>{number}</span>
                  </div>
                  <p>{entryCaption(entry)}</p>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="tm-epok-footer">
          <span>FATIMAH GHANI / SELECTED WORK</span>
          <button type="button" onClick={openIndex}>
            VIEW INDEX <span>{String(selectedEntries.length).padStart(2, '0')}</span> <ArrowUpRight size={15} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </footer>
      </div>

      {isIndexOpen && createPortal(
        <div className="tm-epok-overlay" role="dialog" aria-modal="true" aria-labelledby="tm-epok-index-title">
          <button className="tm-epok-overlay-scrim" type="button" onClick={closeIndex} aria-label="Close works index" tabIndex={-1} />
          <div className="tm-epok-overlay-panel" onKeyDown={trapTab} ref={panelRef}>
            <div className="tm-epok-overlay-head">
              <span>02 / THE INDEX</span>
              <button type="button" onClick={closeIndex} ref={closeRef}>CLOSE <X size={17} aria-hidden="true" /></button>
            </div>
            <h2 id="tm-epok-index-title">Works <em>&amp; posters</em></h2>
            <div className="tm-epok-index-list">
              {selectedEntries.map((entry, index) => (
                <button
                  type="button"
                  className="tm-epok-index-row"
                  key={entry.kind === 'case' ? entry.project.id : entry.poster.src}
                  onClick={() => openEntry(entry)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span className="tm-epok-index-name">{entryTitle(entry)}</span>
                  <span className="tm-epok-index-type">{entry.kind === 'case' ? 'IDENTITY' : 'POSTER'}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
            <p className="tm-epok-overlay-foot">TUMANEEN / WORKS IN PRINT</p>
          </div>
        </div>,
        document.body
      )}

      {activePoster && createPortal(
        <div className="tm-epok-overlay tm-epok-poster-overlay" role="dialog" aria-modal="true" aria-labelledby="tm-epok-poster-title">
          <button className="tm-epok-overlay-scrim" type="button" onClick={() => setActivePoster(null)} aria-label="Close poster" tabIndex={-1} />
          <div className="tm-epok-poster-panel" onKeyDown={trapTab} ref={panelRef}>
            <div className="tm-epok-overlay-head">
              <span>POSTER / {activePoster.roman}</span>
              <button type="button" ref={closeRef} onClick={() => setActivePoster(null)}>CLOSE <X size={17} aria-hidden="true" /></button>
            </div>
            <div className="tm-epok-poster-art">
              <img src={activePoster.src} alt={activePoster.name + ' original poster artwork'} />
            </div>
            <div className="tm-epok-poster-foot">
              <h2 id="tm-epok-poster-title">{activePoster.name}</h2>
              <span>{activePoster.project}</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
