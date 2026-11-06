import React, { useEffect, useRef, useState } from 'react';
import { PortfolioProject, QUITE_CLEAR_SWATCHES } from '../data/portfolioData';
import { GraphicArtwork } from './GraphicArtwork';
import { X, ArrowLeft, ArrowRight, ArrowUpRight, Grid, ArrowDown } from 'lucide-react';

interface CaseStudyModalProps {
  project: PortfolioProject | null;
  onClose: () => void;
  onNextProject: () => void;
  onPrevProject: () => void;
  onSelectScope: (discipline: PortfolioProject['discipline'], projectTitle: string) => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  project,
  onClose,
  onNextProject,
  onPrevProject,
  onSelectScope,
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [showCursor, setShowCursor] = useState(false);
  const cursorIndicatorRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);

  const totalItems = project ? project.slides.length : 0;

  useEffect(() => {
    setShowGrid(false);
    setActiveSlide(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }
  }, [project?.id]);

  const scrollToSlide = (index: number) => {
    const target = slideRefs.current[index];
    if (target && scrollContainerRef.current) {
      target.scrollIntoView({ behavior: 'smooth' });
      setActiveSlide(index);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!project) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        scrollToSlide(Math.min(totalItems - 1, activeSlide + 1));
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollToSlide(Math.max(0, activeSlide - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose, activeSlide, totalItems]);

  if (!project) return null;

  const slides = project.slides;
  const isBehanceProject = Boolean(project.behanceUrl);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollTop = scrollContainerRef.current.scrollTop;
    const viewportHeight = scrollContainerRef.current.clientHeight;
    if (viewportHeight > 0) {
      const idx = Math.round(scrollTop / viewportHeight);
      if (idx !== activeSlide && idx >= 0 && idx < totalItems) {
        setActiveSlide(idx);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cursorIndicatorRef.current) {
      cursorIndicatorRef.current.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY + 18}px, 0)`;
    }
  };

  const formatNum = (n: number) => String(n).padStart(2, '0');

  const handleCopyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1400);
  };

  return (
    <div
      className="tm-case-modal fixed inset-0 z-[800] h-svh w-screen bg-[#5D182B] text-[#F0E4D2] overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowCursor(true)}
      onMouseLeave={() => setShowCursor(false)}
    >
      {/* Floating Custom Cursor Indicator */}
      {showCursor && (
        <div
          ref={cursorIndicatorRef}
          className="pointer-events-none fixed top-0 left-0 z-50 hidden lg:flex items-center gap-2 px-3 py-1 bg-[#F0E4D2]/95 text-[#5D182B] font-mono text-[10px] uppercase tracking-[0.2em] shadow-xl will-change-transform"
        >
          <span>
            {formatNum(activeSlide + 1)} / {formatNum(totalItems)}
          </span>
          <span className="text-[#A87B6C]">·</span>
          <span>{activeSlide < totalItems - 1 ? 'Next ↓' : 'Top ↑'}</span>
        </div>
      )}

      {/* Floating Minimal Corner Controls (No full-width solid bar blocking full-screen slides) */}
      <header className="fixed top-3 right-3 left-3 sm:left-auto sm:top-4 sm:right-5 z-40 flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 pointer-events-none">
        <div className="pointer-events-auto px-2.5 sm:px-3 py-1.5 bg-[#5D182B]/85 backdrop-blur-md text-[#F0E4D2] font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums shadow-lg">
          {formatNum(activeSlide + 1)} / {formatNum(totalItems)}
        </div>

        {project.behanceUrl && (
          <a
            href={project.behanceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto px-2.5 sm:px-3 py-1.5 bg-[#5D182B]/85 backdrop-blur-md text-[#F0E4D2] hover:bg-[#F0E4D2] hover:text-[#5D182B] transition-colors font-mono text-[10px] uppercase tracking-[0.18em] inline-flex items-center gap-1 sm:gap-1.5 shadow-lg"
          >
            <span>Behance</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}

        {!slides[activeSlide]?.imageUrl && slides[activeSlide]?.visualType === 'monogram' && (
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`pointer-events-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-2.5 sm:px-3 py-1.5 transition-colors cursor-pointer shadow-lg ${
              showGrid
                ? 'bg-[#F0E4D2] text-[#5D182B]'
                : 'bg-[#5D182B]/85 text-[#F0E4D2] hover:bg-[#F0E4D2] hover:text-[#5D182B]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Grid
          </button>
        )}

        <button
          onClick={onPrevProject}
          className="pointer-events-auto px-2 sm:px-2.5 py-1.5 bg-[#5D182B]/85 backdrop-blur-md text-[#F0E4D2] hover:bg-[#F0E4D2] hover:text-[#5D182B] transition-colors cursor-pointer font-mono text-[10px] uppercase tracking-[0.18em] inline-flex items-center gap-1 shadow-lg"
          title="Previous Project"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Prev</span>
        </button>
        <button
          onClick={onNextProject}
          className="pointer-events-auto px-2 sm:px-2.5 py-1.5 bg-[#5D182B]/85 backdrop-blur-md text-[#F0E4D2] hover:bg-[#F0E4D2] hover:text-[#5D182B] transition-colors cursor-pointer font-mono text-[10px] uppercase tracking-[0.18em] inline-flex items-center gap-1 shadow-lg"
          title="Next Project"
        >
          <span className="hidden md:inline">Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClose}
          className="pointer-events-auto p-1.5 bg-[#5D182B] text-[#F0E4D2] hover:bg-[#F0E4D2] hover:text-[#5D182B] transition-colors cursor-pointer shadow-lg"
          aria-label="Close Slides"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      <h2 id="modal-project-title" className="sr-only">
        {project.title}
      </h2>

      {/* Right Vertical Slide Dots Navigation */}
      <nav
        aria-label="Case study slides"
        className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5"
      >
        {slides.map((item, idx) => (
          <button
            key={idx}
            onClick={() => scrollToSlide(idx)}
            className="group flex items-center justify-end gap-2 cursor-pointer py-0.5"
            aria-label={`Slide ${idx + 1}: ${item.title}`}
          >
            <span
              className={`hidden md:inline-block font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-200 px-2 py-0.5 bg-[#5D182B]/90 text-[#F0E4D2] ${
                activeSlide === idx
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-95'
              }`}
            >
              {item.spec}
            </span>
            <span
              className={`block transition-all duration-300 shadow-sm ${
                activeSlide === idx
                  ? 'w-2 h-5 bg-[#5D182B] ring-1 ring-[#F0E4D2]'
                  : 'w-1.5 h-2 bg-[#5D182B]/50 ring-1 ring-[#F0E4D2]/60 group-hover:bg-[#5D182B]'
              }`}
            />
          </button>
        ))}
      </nav>

      {/* Full-Screen Vertical Scroll-Snap Slides Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-svh w-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      >
        {slides.map((slide, idx) => {
          const isLastSlide = idx === slides.length - 1;
          const nextIdx = idx < slides.length - 1 ? idx + 1 : 0;

          /* 1. ASPECT-RATIO-PRESERVING FULL SCREEN SLIDE VIEW (NO NON-UNIFORM STRETCHING) */
          if (slide.imageUrl) {
            const isBehanceCoverSlide = isBehanceProject && idx === 0;
            const isLumera = project.id === 'lumera-candle-identity';
            const isRiwaq = project.id === 'riwaq-fragrance-identity';
            const isFullBleedPhotoSlide =
              /behance-lumera-fs-(03|04|08|09)\.jpg(\?.*)?$/.test(slide.imageUrl) ||
              /behance-roast-fs-11[abc]\.jpg(\?.*)?$/.test(slide.imageUrl) ||
              /behance-riwaq-01\.(png|jpg)(\?.*)?$/.test(slide.imageUrl);

            return (
              <section
                key={idx}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                onClick={() => scrollToSlide(nextIdx)}
                style={{ backgroundColor: slide.bgHex || '#EFE7DC' }}
                className="group relative h-svh w-screen snap-start overflow-hidden cursor-pointer flex items-center justify-center"
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  loading="eager"
                  decoding="sync"
                  fetchPriority={idx === activeSlide ? 'high' : 'auto'}
                  draggable={false}
                  className={`h-svh w-screen [image-rendering:-webkit-optimize-contrast] ${
                    isBehanceCoverSlide
                      ? 'object-cover object-center transition-transform duration-[1.6s] ease-out group-hover:scale-[1.035]'
                      : !isBehanceProject || isFullBleedPhotoSlide
                        ? 'object-cover object-center'
                        : 'object-contain object-center'
                  }`}
                />

                {/* Themed Cover Effect & Brand Text Detail Overlay on Slide 01 (Cover) */}
                {isBehanceCoverSlide && (
                  <>
                    {isLumera ? (
                      <>
                        <div className="pointer-events-none absolute inset-0 bg-[#24110E]/8 mix-blend-multiply" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#24110E]/78 via-transparent to-[#24110E]/88" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#24110E]/75 via-[#24110E]/12 to-transparent" />
                      </>
                    ) : isRiwaq ? (
                      <>
                        <div className="pointer-events-none absolute inset-0 bg-[#1C0800]/6 mix-blend-multiply" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1C0800]/75 via-transparent to-[#1C0800]/86" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1C0800]/80 via-[#1C0800]/15 to-transparent" />
                      </>
                    ) : (
                      <>
                        {/* Studio Theme Color Wash & Vignette */}
                        <div className="pointer-events-none absolute inset-0 bg-[#5D182B]/12 mix-blend-multiply" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#5D182B]/84 via-transparent to-[#5D182B]/90" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#5D182B]/76 via-[#5D182B]/12 to-transparent" />
                      </>
                    )}

                    {/* Archival Studio Frame & Corner Marks */}
                    <div className="pointer-events-none absolute inset-3 sm:inset-5 border border-[#F0E4D2]/15">
                      <span className="absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 border-[#F0E4D2]/60" />
                      <span className="absolute -top-px -right-px h-3 w-3 border-t-2 border-r-2 border-[#F0E4D2]/60" />
                      <span className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-[#F0E4D2]/60" />
                      <span className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-[#F0E4D2]/60" />
                    </div>

                    {/* Cover Brand Header & Story Details */}
                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-5 pt-14 pr-8 sm:p-10 md:p-12">
                      <div className="max-w-2xl space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#D9C0A8]">
                          <span className="text-[#F0E4D2] font-semibold">01 / COVER</span>
                          <span aria-hidden="true" className="text-[#A87B6C]">
                            ·
                          </span>
                          <span>{project.location}</span>
                          <span aria-hidden="true" className="text-[#A87B6C]">
                            ·
                          </span>
                          <span>{project.year}</span>
                        </div>
                        <h3 className="font-display text-2xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F0E4D2] leading-[1.04]">
                          {project.title}
                        </h3>
                        {project.tagline && (
                          <p className="font-serif italic text-sm sm:text-xl text-[#D9C0A8] leading-snug">
                            {isLumera
                              ? `“${project.tagline}” — Fragrance for the memories we keep.`
                              : isRiwaq
                                ? `“${project.tagline}” — Architectural arches & desert heritage.`
                                : `“${project.tagline}” — More than coffee, it’s a rhythm.`}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="max-w-lg space-y-2">
                          <p
                            className={`border-l-2 ${
                              isLumera
                                ? 'border-[#D99B3C]'
                                : isRiwaq
                                  ? 'border-[#A98252]'
                                  : 'border-[#C75A2E]'
                            } pl-3.5 text-xs sm:text-sm text-[#F0E4D2]/95 leading-snug line-clamp-2`}
                          >
                            {project.summary}
                          </p>
                          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#D9C0A8]">
                            <span>{project.discipline}</span>
                            {project.extractedPalette && (
                              <>
                                <span aria-hidden="true" className="text-[#A87B6C]">
                                  ·
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {project.extractedPalette.map((swatch) => (
                                    <span
                                      key={swatch.hex}
                                      className="h-2.5 w-2.5 border border-[#F0E4D2]/40"
                                      style={{ backgroundColor: swatch.hex }}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#F0E4D2] bg-[#5D182B]/85 border border-[#F0E4D2]/25 px-4 py-2 self-start lg:self-end">
                          <span>Scroll Case Study</span>
                          <ArrowDown className="w-3.5 h-3.5 text-[#D9C0A8]" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Minimal Floating Action on Last Slide Only (or non-Behance slides, plus mobile caption bar on inner slides) */}
                {!isBehanceProject ? (
                  <div className="absolute inset-x-0 bottom-0 z-10 px-6 sm:px-12 py-3 bg-[#5D182B]/90 backdrop-blur-md border-t border-[#F0E4D2]/15 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D9C0A8] tabular-nums shrink-0">
                        {slide.kicker || `${formatNum(idx + 1)} / ${formatNum(slides.length)}`}
                      </span>
                      <span className="text-[#A87B6C] hidden sm:inline">·</span>
                      <h3 className="font-serif text-sm sm:text-base text-[#F0E4D2] truncate">
                        {slide.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToSlide(nextIdx);
                      }}
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#D9C0A8] hover:text-[#F0E4D2] cursor-pointer"
                    >
                      <span>Next Slide</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : isLastSlide ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-5 right-5 z-10 flex items-center gap-2"
                  >
                    <button
                      onClick={() => onSelectScope(project.discipline, project.title)}
                      className="inline-flex items-center gap-1.5 bg-[#5D182B] text-[#F0E4D2] font-mono text-[10px] uppercase tracking-[0.18em] px-4 py-2 hover:bg-[#2B1B14] transition-colors cursor-pointer font-semibold shadow-lg"
                    >
                      <span>Inquire</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onNextProject}
                      className="inline-flex items-center gap-1.5 bg-[#5D182B]/85 text-[#F0E4D2] font-mono text-[10px] uppercase tracking-[0.18em] px-4 py-2 hover:bg-[#5D182B] transition-colors cursor-pointer shadow-lg"
                    >
                      <span>Next Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : !isBehanceCoverSlide ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="sm:hidden absolute inset-x-0 bottom-0 z-10 px-4 py-2.5 bg-[#5D182B]/90 backdrop-blur-md border-t border-[#F0E4D2]/15 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#D9C0A8] tabular-nums shrink-0">
                        {formatNum(idx + 1)} / {formatNum(slides.length)}
                      </span>
                      <span className="text-[#A87B6C]">·</span>
                      <span className="font-serif text-xs text-[#F0E4D2] truncate">
                        {slide.title}
                      </span>
                    </div>
                    <button
                      onClick={() => scrollToSlide(nextIdx)}
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#D9C0A8] shrink-0 cursor-pointer"
                    >
                      <span>Next</span>
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                ) : null}
              </section>
            );
          }

          /* 2. STUDIO PALETTE SLIDE (FOR NON-IMAGE PALETTE SLIDES) */
          if (slide.visualType === 'gridsystem') {
            return (
              <section
                key={idx}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                className="relative h-svh w-screen snap-start overflow-hidden flex flex-col justify-between bg-[#5D182B]"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 flex-1 w-full h-full pt-14">
                  {QUITE_CLEAR_SWATCHES.map((swatch) => (
                    <div
                      key={swatch.id}
                      onClick={(e) => handleCopyHex(swatch.hex, e)}
                      className="relative flex flex-col justify-end p-6 sm:p-10 border-r border-b border-[#5D182B]/20 cursor-pointer transition-transform duration-500 hover:scale-[1.01]"
                      style={{ backgroundColor: swatch.hex }}
                    >
                      <div className="bg-[#5D182B]/85 backdrop-blur-md p-4 border border-[#F0E4D2]/15">
                        <p className="font-mono text-xs text-[#F0E4D2] uppercase tracking-[0.15em]">
                          {swatch.name}
                        </p>
                        <p className="font-mono text-[11px] text-[#D9C0A8] mt-0.5">
                          {copiedHex === swatch.hex ? 'Copied' : swatch.hex}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#5D182B] border-t border-[#F0E4D2]/20 px-6 sm:px-12 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D9C0A8]">
                      {slide.spec}
                    </span>
                    <span className="text-[#A87B6C]">·</span>
                    <h3 className="font-serif text-base sm:text-lg text-[#F0E4D2]">
                      {slide.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => onSelectScope(project.discipline, project.title)}
                      className="inline-flex items-center gap-1.5 bg-[#F0E4D2] text-[#5D182B] font-mono text-[10px] uppercase tracking-[0.18em] px-3.5 py-1.5 hover:bg-[#D9C0A8] transition-colors cursor-pointer font-semibold"
                    >
                      <span>Inquire</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onNextProject}
                      className="inline-flex items-center gap-1.5 border border-[#F0E4D2]/30 text-[#F0E4D2] font-mono text-[10px] uppercase tracking-[0.18em] px-3.5 py-1.5 hover:bg-[#F0E4D2] hover:text-[#5D182B] transition-colors cursor-pointer"
                    >
                      <span>Next Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>
            );
          }

          /* 3. VECTOR SPECIMEN SLIDE (FOR NON-IMAGE SLIDES) */
          return (
            <section
              key={idx}
              ref={(el) => {
                slideRefs.current[idx] = el;
              }}
              onClick={() => scrollToSlide(nextIdx)}
              className="relative h-svh w-screen snap-start overflow-hidden bg-[#5D182B] cursor-pointer flex flex-col justify-between"
            >
              <div className="flex-1 w-full h-full pt-14 overflow-hidden">
                <GraphicArtwork
                  type={project.artworkType}
                  showGrid={showGrid}
                  className="w-full h-full"
                />
              </div>

              <div className="px-6 sm:px-12 py-3.5 bg-[#5D182B]/90 backdrop-blur-md border-t border-[#F0E4D2]/15 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D9C0A8]">
                    {slide.spec}
                  </span>
                  <span className="text-[#A87B6C]">·</span>
                  <h3 className="font-serif text-base sm:text-lg text-[#F0E4D2]">
                    {slide.title}
                  </h3>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D9C0A8]">
                  Next Slide ↓
                </span>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
