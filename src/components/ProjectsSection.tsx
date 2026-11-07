import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, X } from 'lucide-react';
import { PORTFOLIO_PROJECTS, type PortfolioProject } from '../data/portfolioData';
import './ProjectsSection.css';

interface ProjectsSectionProps {
  onSelectProject: (projectId: string) => void;
  isAllProjectsOpen?: boolean;
  onOpenAllProjects?: () => void;
  onCloseAllProjects?: () => void;
}

const imageFor = (project: PortfolioProject, position: number) =>
  project.slides[position]?.imageUrl ??
  project.slides.find((slide) => slide.imageUrl)?.imageUrl ??
  '';

const imageBackground = (project: PortfolioProject, position: number) =>
  project.slides[position]?.bgHex ?? '#EFE6D6';

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onSelectProject,
  isAllProjectsOpen,
  onOpenAllProjects,
  onCloseAllProjects,
}) => {
  const [localIndexOpen, setLocalIndexOpen] = useState(false);
  const indexOpen = isAllProjectsOpen ?? localIndexOpen;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const openIndex = () => {
    if (onOpenAllProjects) onOpenAllProjects();
    else setLocalIndexOpen(true);
  };

  const closeIndex = () => {
    if (onCloseAllProjects) onCloseAllProjects();
    else setLocalIndexOpen(false);
  };

  const openProject = (project: PortfolioProject) => {
    if (indexOpen) closeIndex();
    onSelectProject(project.id);
  };

  useEffect(() => {
    if (!indexOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (onCloseAllProjects) onCloseAllProjects();
        else setLocalIndexOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = oldOverflow;
      previouslyFocused?.focus();
    };
  }, [indexOpen, onCloseAllProjects]);

  return (
    <section
      id="project"
      aria-labelledby="tm-project-gallery-title"
      className="tm-projects tm-project-grid-section"
    >
      <div className="tm-project-gallery-shell">
        <header className="tm-projects-intro tm-project-gallery-intro">
          <div className="tm-projects-kicker">
            <span>02 / SELECTED WORK</span>
            <span>TUMANEEN / VOL. I</span>
          </div>
          <div className="tm-projects-title-row">
            <h2 id="tm-project-gallery-title">Selected <em>work.</em></h2>
            <div className="tm-project-gallery-intro-side">
              <p>Identity, print &amp; objects.</p>
              <span>{String(PORTFOLIO_PROJECTS.length).padStart(2, '0')} PROJECTS / 2026</span>
            </div>
          </div>
        </header>

        <div className="tm-project-gallery" aria-label="Selected projects">
          {PORTFOLIO_PROJECTS.map((project, index) => {
            const number = String(index + 1).padStart(2, '0');
            const detailPosition = project.slides[3]?.imageUrl ? 3 : 1;

            return (
              <article
                key={project.id}
                data-project-id={project.id}
                className={'tm-project-entry tm-project-entry--' + number}
              >
                <button
                  type="button"
                  className="tm-project-entry-image tm-project-entry-cover"
                  onClick={() => openProject(project)}
                  aria-label={'Open ' + project.title + ' case study'}
                  style={{ backgroundColor: imageBackground(project, 0) }}
                >
                  <img
                    src={imageFor(project, 0)}
                    alt={project.title + ' — featured brand artwork'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <span className="tm-project-entry-image-action" aria-hidden="true">
                    <ArrowUpRight size={20} strokeWidth={1.6} />
                  </span>
                </button>

                <div className="tm-project-entry-caption">
                  <div className="tm-project-entry-caption-rule">
                    <span>{number} / {project.year}</span>
                    <span aria-hidden="true">—</span>
                  </div>
                  <button
                    type="button"
                    className="tm-project-entry-title"
                    onClick={() => openProject(project)}
                    aria-label={'Read ' + project.title + ' case study'}
                  >
                    <span>{project.title}</span>
                    <ArrowUpRight size={23} strokeWidth={1.4} aria-hidden="true" />
                  </button>
                  <p>{project.discipline}{project.tagline ? ' / ' + project.tagline : ''}</p>
                </div>

                {imageFor(project, detailPosition) && (
                  <button
                    type="button"
                    className="tm-project-entry-image tm-project-entry-detail"
                    onClick={() => openProject(project)}
                    aria-label={'Explore more of ' + project.title}
                    style={{ backgroundColor: imageBackground(project, detailPosition) }}
                  >
                    <img
                      src={imageFor(project, detailPosition)}
                      alt={project.title + ' — additional original project artwork'}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="tm-project-entry-detail-note" aria-hidden="true">
                      {number} / DETAIL
                    </span>
                    <span className="tm-project-entry-image-action" aria-hidden="true">
                      <ArrowUpRight size={18} strokeWidth={1.6} />
                    </span>
                  </button>
                )}
              </article>
            );
          })}
        </div>

        <footer className="tm-project-gallery-footer">
          <div>
            <span className="tm-project-gallery-rule-label">THE PROJECT INDEX</span>
            <p>More than an image. <em>Explore the story.</em></p>
          </div>
          <button type="button" onClick={openIndex} className="tm-project-index-trigger">
            ALL PROJECTS <span>{String(PORTFOLIO_PROJECTS.length).padStart(2, '0')}</span>
            <ArrowDownRight size={18} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </footer>
      </div>

      {indexOpen && (
        <div
          className="tm-project-index-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tm-project-index-title"
        >
          <button
            type="button"
            className="tm-project-index-backdrop"
            onClick={closeIndex}
            aria-label="Close project index"
            tabIndex={-1}
          />
          <div className="tm-project-index-panel">
            <div className="tm-project-index-head">
              <span>02 / PROJECT INDEX</span>
              <button
                type="button"
                ref={closeButtonRef}
                onClick={closeIndex}
                className="tm-project-index-close"
              >
                CLOSE <X size={19} aria-hidden="true" />
              </button>
            </div>
            <h2 id="tm-project-index-title">The <em>index.</em></h2>
            <div className="tm-project-index-list">
              {PORTFOLIO_PROJECTS.map((project, index) => (
                <button
                  type="button"
                  key={project.id}
                  onClick={() => openProject(project)}
                  className="tm-project-index-item"
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span className="tm-project-index-item-name">{project.title}</span>
                  <span className="tm-project-index-item-discipline">{project.discipline}</span>
                  <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="tm-project-index-foot">TUMANEEN / SELECTED WORK / 2026</div>
          </div>
        </div>
      )}
    </section>
  );
};
