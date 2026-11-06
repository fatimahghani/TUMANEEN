import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, LayoutGrid, X } from 'lucide-react';
import { PORTFOLIO_PROJECTS, ARCHIVE_INDEX, PortfolioProject } from '../data/portfolioData';

interface ProjectsSectionProps {
  onSelectProject: (projectId: string) => void;
  isAllProjectsOpen?: boolean;
  onOpenAllProjects?: () => void;
  onCloseAllProjects?: () => void;
}

const BASE_URL = import.meta.env.BASE_URL;

const PROJECT_SLIDE_IMAGES: Record<string, { url: string; label: string; bgHex?: string }[]> = {
  'lumera-candle-identity': [
    {
      url: `${BASE_URL}behance-lumera-cover.jpg?v=4k`,
      label: '01 / Cover',
      bgHex: '#24110E',
    },
    {
      url: `${BASE_URL}behance-lumera-fs-01.jpg`,
      label: '02 / Brand Story',
      bgHex: '#24110E',
    },
    {
      url: `${BASE_URL}behance-lumera-fs-02.jpg`,
      label: '03 / Scent Stories',
      bgHex: '#24110E',
    },
    {
      url: `${BASE_URL}behance-lumera-fs-03.jpg`,
      label: '04 / Ceramic Vessels',
      bgHex: '#E5D7C8',
    },
    {
      url: `${BASE_URL}behance-lumera-fs-04.jpg`,
      label: '05 / Illustrated Boxes',
      bgHex: '#1C130E',
    },
    {
      url: `${BASE_URL}behance-lumera-fs-05.jpg`,
      label: '06 / Stationery & Print',
      bgHex: '#23281E',
    },
    {
      url: `${BASE_URL}behance-lumera-fs-06.jpg`,
      label: '07 / Collection Grid',
      bgHex: '#050B0E',
    },
    {
      url: `${BASE_URL}behance-lumera-fs-07.jpg`,
      label: '08 / Ritual Matchboxes',
      bgHex: '#24110E',
    },
    {
      url: `${BASE_URL}behance-lumera-fs-08.jpg`,
      label: '09 / Flagship Storefront',
      bgHex: '#241C19',
    },
    {
      url: `${BASE_URL}behance-lumera-fs-09.jpg`,
      label: '10 / Marigold Night',
      bgHex: '#24110E',
    },
    {
      url: `${BASE_URL}behance-lumera-fs-10.jpg`,
      label: '11 / Closing Identity',
      bgHex: '#24110E',
    },
  ],
  'riwaq-fragrance-identity': [
    {
      url: `${BASE_URL}behance-riwaq-cover.jpg?v=4k`,
      label: '01 / Cover',
      bgHex: '#1C0800',
    },
    {
      url: `${BASE_URL}behance-riwaq-01.jpg`,
      label: '02 / Collection Showcase',
      bgHex: '#1C0800',
    },
    {
      url: `${BASE_URL}behance-riwaq-02.jpg`,
      label: '03 / Brand Architecture',
      bgHex: '#F8F5F0',
    },
    {
      url: `${BASE_URL}behance-riwaq-03.jpg`,
      label: '04 / Brand Palette',
      bgHex: '#F8F5F0',
    },
    {
      url: `${BASE_URL}behance-riwaq-04.jpg`,
      label: '05 / Scent Moodboards',
      bgHex: '#F8F5F0',
    },
    {
      url: `${BASE_URL}behance-riwaq-05.jpg`,
      label: '06 / Outer Packaging',
      bgHex: '#1C0800',
    },
    {
      url: `${BASE_URL}behance-riwaq-06.jpg`,
      label: '07 / Product Lineup',
      bgHex: '#F8F5F0',
    },
    {
      url: `${BASE_URL}behance-riwaq-07.jpg`,
      label: '08 / Environmental Scene',
      bgHex: '#F8F5F0',
    },
    {
      url: `${BASE_URL}behance-riwaq-09.jpg`,
      label: '09 / Daily Life Rituals',
      bgHex: '#F4EFE6',
    },
    {
      url: `${BASE_URL}behance-riwaq-08.jpg`,
      label: '10 / Atmospheric Lifestyle',
      bgHex: '#1C0800',
    },
    {
      url: `${BASE_URL}behance-riwaq-10.jpg`,
      label: '11 / Closing',
      bgHex: '#1C0800',
    },
  ],
  'roast-and-rhythm-cafe': [
    {
      url: `${BASE_URL}behance-roast-fs-11c.jpg?v=4k`,
      label: '01 / Cover',
      bgHex: '#2B1B14',
    },
    {
      url: `${BASE_URL}behance-roast-fs-01.jpg`,
      label: '02 / Roast & Rhythm',
      bgHex: '#F0E6DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-02.jpg`,
      label: '03 / Brand Story',
      bgHex: '#EFE7DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-03.jpg`,
      label: '04 / The Logo',
      bgHex: '#EFE7DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-04.jpg`,
      label: '05 / Color Palette',
      bgHex: '#EFE7DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-05.jpg`,
      label: '06 / Typography',
      bgHex: '#EFE7DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-06.jpg`,
      label: '07 / Menu Design',
      bgHex: '#EFE7DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-07.jpg`,
      label: '08 / Coffee Cup',
      bgHex: '#EFE7DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-08.jpg`,
      label: '09 / Takeaway Packaging',
      bgHex: '#EFE7DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-09.jpg`,
      label: '10 / Table Scene',
      bgHex: '#EFE7DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-10.jpg`,
      label: '11 / Storefront',
      bgHex: '#EFE7DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-11a.jpg`,
      label: '12 / Brand Collection',
      bgHex: '#EFE7DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-11b.jpg`,
      label: '13 / Café Interior',
      bgHex: '#EFE7DC',
    },
    {
      url: `${BASE_URL}behance-roast-fs-12.jpg`,
      label: '14 / Thank You',
      bgHex: '#EFE7DC',
    },
  ],
};

const getSlideFitClass = (url: string): string => {
  // Pure photographic full-bleed slides without edge-bound typography boards can safely cover
  if (
    /behance-lumera-fs-(03|04|08|09)\.jpg(\?.*)?$/.test(url) ||
    /behance-roast-fs-11[abc]\.jpg(\?.*)?$/.test(url) ||
    /behance-riwaq-01\.(png|jpg)(\?.*)?$/.test(url)
  ) {
    return 'object-cover object-center';
  }
  // All typography, brand story, palette, packaging grid, and split-screen boards preserve 1:1 aspect ratio
  return 'object-contain object-center';
};

const FullScreenProjectSlide: React.FC<{
  project: PortfolioProject;
  index: number;
  total: number;
  onSelectProject: (projectId: string) => void;
  onOpenAllProjects: () => void;
}> = ({ project, index, total, onSelectProject, onOpenAllProjects }) => {
  const gallery = PROJECT_SLIDE_IMAGES[project.id] || [
    { url: project.slides[0]?.imageUrl || '', label: '01 · Overview' },
  ];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cursorBadgeRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Preload adjacent slides so scrubbing through slides is instant
  React.useEffect(() => {
    const nextIdx = (activeImageIdx + 1) % gallery.length;
    const prevIdx = (activeImageIdx - 1 + gallery.length) % gallery.length;
    [gallery[activeImageIdx], gallery[nextIdx], gallery[prevIdx]].forEach((item) => {
      if (item?.url) {
        const img = new Image();
        img.decoding = 'async';
        img.src = item.url;
      }
    });
  }, [activeImageIdx, gallery]);

  const isBehanceSlideDeck = Boolean(project.behanceUrl);
  const isLumera = project.id === 'lumera-candle-identity';
  const isRiwaq = project.id === 'riwaq-fragrance-identity';
  const isCoverSlide = activeImageIdx === 0;
  const showCoverBrandOverlay = !isBehanceSlideDeck || isCoverSlide;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cursorBadgeRef.current) {
      cursorBadgeRef.current.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY - 18}px, 0)`;
    }

    if (!isBehanceSlideDeck) {
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(0.999, relX / rect.width));
      const nextIdx = Math.floor(ratio * gallery.length);
      if (nextIdx !== activeImageIdx) {
        setActiveImageIdx(nextIdx);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
    touchStartYRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const endY = e.changedTouches[0]?.clientY ?? touchStartYRef.current;
    const dx = endX - touchStartXRef.current;
    const dy = endY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Horizontal swipe cycles through project gallery slides on touch devices
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      if (dx < 0) {
        setActiveImageIdx((prev) => (prev + 1) % gallery.length);
      } else {
        setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length);
      }
    }
  };

  const currentMedia = gallery[activeImageIdx] || gallery[0];
  const formatNum = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className="sticky top-0 h-svh w-full overflow-hidden"
      style={{ zIndex: index + 1 }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectProject(project.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectProject(project.id);
          }
        }}
        aria-label={`Open case study for ${project.title}`}
        style={{ backgroundColor: currentMedia.bgHex || '#5D182B' }}
        className="tm-project-spread group relative flex flex-col justify-between h-svh w-full cursor-pointer outline-none text-left select-none overflow-hidden"
      >
        {isBehanceSlideDeck && !isCoverSlide ? (
          /* ASPECT-RATIO-PRESERVING FULL SCREEN SLIDE FOR INNER BEHANCE BOARDS (NO STRETCHING) */
          <AnimatePresence mode="wait">
            <motion.img
              key={currentMedia.url}
              src={currentMedia.url}
              alt={currentMedia.label}
              decoding="sync"
              fetchPriority="high"
              draggable={false}
              initial={{ opacity: 0.85, scale: 1.005 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.85 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`absolute inset-0 h-svh w-full pointer-events-none [image-rendering:-webkit-optimize-contrast] ${getSlideFitClass(
                currentMedia.url
              )}`}
            />
          </AnimatePresence>
        ) : (
          /* THEMED COVER EFFECT (APPLIES TO SLIDE 01 COVER & STANDARD COVERS) */
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentMedia.url}
                src={currentMedia.url}
                alt={project.title}
                decoding="sync"
                fetchPriority="high"
                draggable={false}
                initial={{ opacity: 0.75, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.75 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04] [image-rendering:-webkit-optimize-contrast]"
              />
            </AnimatePresence>

            {isLumera ? (
              /* Candlelit Ritual · Espresso, Plum & Radiant Gold Cover Atmosphere for LUMERA */
              <>
                <div className="absolute inset-0 bg-[#24110E]/8 mix-blend-multiply pointer-events-none transition-opacity duration-700 group-hover:opacity-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#24110E]/78 via-transparent to-[#24110E]/88 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#24110E]/75 via-[#24110E]/12 to-transparent pointer-events-none" />
                {/* Subtle Warm Candle Flame Glow across the 3 Vessels */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-700 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(850px circle at 52% 38%, rgba(217, 155, 60, 0.14), rgba(75, 29, 38, 0.05) 45%, transparent 72%)',
                  }}
                />
              </>
            ) : isRiwaq ? (
              /* Desert Heritage · Espresso, Crimson & Sunlit Brass Cover Atmosphere for RIWAQ */
              <>
                <div className="absolute inset-0 bg-[#1C0800]/6 mix-blend-multiply pointer-events-none transition-opacity duration-700 group-hover:opacity-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1C0800]/75 via-transparent to-[#1C0800]/86 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1C0800]/80 via-[#1C0800]/15 to-transparent pointer-events-none" />
                {/* Subtle Warm Desert Sunlight Glow on Arch & Vessels */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-75 transition-opacity duration-700 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(900px circle at 76% 42%, rgba(232, 199, 160, 0.12), rgba(169, 130, 82, 0.05) 40%, transparent 70%)',
                  }}
                />
              </>
            ) : (
              /* Studio Theme Color Wash & Duotone Undertone */
              <>
                <div className="absolute inset-0 bg-[#5D182B]/12 mix-blend-multiply pointer-events-none transition-opacity duration-700 group-hover:opacity-5" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#5D182B]/84 via-transparent to-[#5D182B]/90 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#5D182B]/76 via-[#5D182B]/12 to-transparent pointer-events-none" />
              </>
            )}

            {/* Archival Studio Inner Hairline Frame & Corner Marks */}
            <div className="pointer-events-none absolute inset-3 sm:inset-5 border border-[#F0E4D2]/15 transition-colors duration-500 group-hover:border-[#F0E4D2]/30">
              <span className="absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 border-[#F0E4D2]/60" />
              <span className="absolute -top-px -right-px h-3 w-3 border-t-2 border-r-2 border-[#F0E4D2]/60" />
              <span className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-[#F0E4D2]/60" />
              <span className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-[#F0E4D2]/60" />
            </div>
          </>
        )}

        {/* Custom Floating Cursor Follower */}
        {isHovered && (
          <div
            ref={cursorBadgeRef}
            className="pointer-events-none hidden md:flex items-center gap-2 fixed top-0 left-0 z-30 bg-[#5D182B]/95 border border-[#F0E4D2]/25 px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[#F0E4D2] shadow-xl will-change-transform"
          >
            <span>Read the story</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D9C0A8]" />
          </div>
        )}

        {/* TOP BAR: BRAND HEADER & CONTROLS */}
        <div className="relative z-10 w-full flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 px-4 pt-4 sm:px-10 sm:pt-8 md:px-12 md:pt-10 pointer-events-none">
          {showCoverBrandOverlay ? (
            <div className="max-w-2xl space-y-1.5 sm:space-y-2">
              {/* Unboxed Metadata Line */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#D9C0A8]">
                <span className="text-[#F0E4D2] font-semibold">
                  {formatNum(index + 1)} / {formatNum(total)}
                </span>
                <span aria-hidden="true" className="text-[#A87B6C]">
                  ·
                </span>
                <span>{project.location}</span>
                <span aria-hidden="true" className="text-[#A87B6C]">
                  ·
                </span>
                <span>{project.year}</span>
              </div>

              {/* Project Title & Tagline */}
              <div className="space-y-1">
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
            </div>
          ) : (
            /* Mobile-only compact project header on inner slides so vertical phone screen is framed */
            <div className="sm:hidden bg-[#5D182B]/85 backdrop-blur-md border border-[#F0E4D2]/20 px-3 py-1.5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F0E4D2]">
                <span className="font-semibold">{project.title}</span>
                <span className="text-[#D9C0A8]/50">·</span>
                <span className="text-[#D9C0A8]">{currentMedia.label}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 pointer-events-auto sm:ml-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAllProjects();
              }}
              className="inline-flex items-center gap-1.5 bg-[#5D182B]/85 backdrop-blur-md border border-[#F0E4D2]/25 px-3 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] text-[#F0E4D2] hover:bg-[#F0E4D2] hover:text-[#5D182B] transition-colors shadow-md cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>View All Projects</span>
            </button>
            {project.behanceUrl && (
              <a
                href={project.behanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 bg-[#5D182B]/85 backdrop-blur-md border border-[#F0E4D2]/25 px-3 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] text-[#F0E4D2] hover:bg-[#F0E4D2] hover:text-[#5D182B] transition-colors shadow-md"
              >
                <span>Behance</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
            <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#F0E4D2] px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] font-semibold text-[#5D182B] shadow-md transition-transform duration-300 group-hover:translate-x-0.5">
              <span>Case Study</span>
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>

        {/* BOTTOM BAR: MINIMAL BRAND CAPTION & SLIDE SCRUBBER */}
        <div className="relative z-10 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-3.5 sm:gap-6 px-4 pb-4 sm:px-10 sm:pb-8 md:px-12 md:pb-10 pointer-events-none">
          {showCoverBrandOverlay ? (
            <div className="max-w-lg space-y-2">
              <p
                className={`border-l-2 ${
                  isLumera
                    ? 'border-[#D99B3C]'
                    : isRiwaq
                      ? 'border-[#A98252]'
                      : 'border-[#C75A2E]'
                } pl-3 sm:pl-3.5 text-xs sm:text-sm text-[#F0E4D2]/95 leading-snug line-clamp-2`}
              >
                {project.summary}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#D9C0A8]">
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
                          title={swatch.name}
                          className="h-2.5 w-2.5 border border-[#F0E4D2]/40"
                          style={{ backgroundColor: swatch.hex }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* Slide Scrubber Navigation with Touch Prev/Next Buttons */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto self-start lg:self-end max-w-full overflow-x-auto no-scrollbar bg-[#5D182B]/88 backdrop-blur-md border border-[#F0E4D2]/20 px-3 sm:px-3.5 py-1.5 sm:py-2 pointer-events-auto shadow-lg"
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length)
                }
                aria-label="Previous slide"
                className="px-1.5 py-0.5 text-[11px] font-mono text-[#F0E4D2]/80 hover:text-[#F0E4D2] border border-[#F0E4D2]/20 cursor-pointer"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setActiveImageIdx((prev) => (prev + 1) % gallery.length)}
                aria-label="Next slide"
                className="px-1.5 py-0.5 text-[11px] font-mono text-[#F0E4D2]/80 hover:text-[#F0E4D2] border border-[#F0E4D2]/20 cursor-pointer"
              >
                →
              </button>
              <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[#D9C0A8] ml-1 whitespace-nowrap shrink-0">
                {currentMedia.label}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
              {gallery.map((item, idx) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  aria-label={item.label}
                  className="py-1.5 px-0.5 flex items-center cursor-pointer shrink-0"
                >
                  <span
                    className={`h-1.5 transition-all duration-300 ${
                      activeImageIdx === idx
                        ? 'w-4 sm:w-6 bg-[#F0E4D2]'
                        : 'w-1.5 sm:w-2 bg-[#F0E4D2]/35 hover:bg-[#F0E4D2]/75'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onSelectProject,
  isAllProjectsOpen,
  onOpenAllProjects,
  onCloseAllProjects,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isModalOpen = isAllProjectsOpen !== undefined ? isAllProjectsOpen : internalOpen;

  const handleOpen = () => {
    if (onOpenAllProjects) {
      onOpenAllProjects();
    } else {
      setInternalOpen(true);
    }
  };

  const handleClose = () => {
    if (onCloseAllProjects) {
      onCloseAllProjects();
    } else {
      setInternalOpen(false);
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  return (
    <section
      id="project"
      aria-label="Selected Projects"
      className="tm-projects portfolio-section relative bg-[#5D182B]"
    >
      <header className="tm-projects-intro">
        <div className="tm-projects-kicker"><span>02 / FEATURED CASE STUDIES</span><span>BRAND IDENTITIES &amp; OBJECTS</span></div>
        <div className="tm-projects-title-row">
          <h2>Selected <em>work.</em></h2>
          <p>A few complete worlds, from the first idea to the last printed detail.<br /><span>SCROLL TO TURN THE PAGES ↓</span></p>
        </div>
      </header>
      <div>
        {PORTFOLIO_PROJECTS.map((project, index) => (
          <FullScreenProjectSlide
            key={project.id}
            project={project}
            index={index}
            total={PORTFOLIO_PROJECTS.length}
            onSelectProject={onSelectProject}
            onOpenAllProjects={handleOpen}
          />
        ))}
      </div>

      {/* Bottom Studio Archive Bar right below the Project Section */}
      <div className="relative z-20 bg-[#391E25] border-t border-b border-[#F0E4D2]/15 px-5 sm:px-10 md:px-16 py-8 sm:py-10">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#D9C0A8]/70">
              02 · COMPLETE STUDIO ARCHIVE ({PORTFOLIO_PROJECTS.length} FEATURED CASE STUDIES)
            </span>
            <p className="font-serif italic text-base sm:text-xl text-[#F0E4D2]">
              Explore the complete index of brand identity, fragrance, and packaging systems.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            className="group inline-flex items-center gap-2.5 bg-[#F0E4D2] text-[#391E25] hover:bg-[#D9C0A8] px-5 sm:px-6 py-3 text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] font-semibold transition-all duration-300 shadow-lg cursor-pointer shrink-0"
          >
            <LayoutGrid className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span>View All Projects</span>
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </div>
      </div>

      {/* ALL PROJECTS ARCHIVE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="tm-project-archive-dialog fixed inset-0 z-[880] bg-[#391E25]/96 backdrop-blur-md text-[#F0E4D2] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="All Projects Archive"
          >
            <div className="max-w-[1280px] mx-auto px-5 sm:px-8 md:px-12 py-8 sm:py-12">
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between gap-4 pb-6 mb-8 sm:mb-10 border-b border-[#F0E4D2]/15">
                <div>
                  <span className="block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#D9C0A8]/75">
                    TUMANEEN · ARCHIVE INDEX
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl text-[#F0E4D2] mt-1">
                    The complete index ({PORTFOLIO_PROJECTS.length})
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 border border-[#F0E4D2]/25 bg-[#5D182B] hover:bg-[#F0E4D2] hover:text-[#391E25] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.18em] transition-colors cursor-pointer"
                >
                  <span>Close</span>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Project Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {PORTFOLIO_PROJECTS.map((project, idx) => {
                  const slides = PROJECT_SLIDE_IMAGES[project.id] || [];
                  const coverUrl = slides[0]?.url || project.slides[0]?.imageUrl || '';
                  return (
                    <div
                      key={project.id}
                      onClick={() => {
                        handleClose();
                        onSelectProject(project.id);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleClose();
                          onSelectProject(project.id);
                        }
                      }}
                      className="group flex flex-col border border-[#F0E4D2]/18 bg-[#5D182B]/65 hover:border-[#F0E4D2]/50 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#391E25]">
                        <img
                          src={coverUrl}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#391E25]/80 via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 bg-[#391E25]/85 border border-[#F0E4D2]/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#F0E4D2]">
                          0{idx + 1} · {project.year}
                        </span>
                        <span className="absolute top-3 right-3 bg-[#F0E4D2] text-[#391E25] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                          {slides.length} Slides
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-between p-5 sm:p-6 space-y-4">
                        <div className="space-y-2">
                          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#D9C0A8]/75">
                            {project.location}
                          </div>
                          <h3 className="font-display text-2xl text-[#F0E4D2] group-hover:text-[#D9C0A8] transition-colors">
                            {project.title}
                          </h3>
                          {project.tagline && (
                            <p className="font-serif italic text-sm text-[#D9C0A8]">
                              “{project.tagline}”
                            </p>
                          )}
                          <p className="text-xs sm:text-sm text-[#F0E4D2]/80 line-clamp-3 leading-relaxed pt-1">
                            {project.summary}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-[#F0E4D2]/12 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F0E4D2] font-semibold group-hover:translate-x-0.5 transition-transform">
                            <span>Open the story</span>
                            <span>→</span>
                          </span>
                          {project.behanceUrl && (
                            <a
                              href={project.behanceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#D9C0A8] hover:text-[#F0E4D2] border border-[#F0E4D2]/20 px-2.5 py-1"
                            >
                              <span>Behance</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Complete Archival Index Ledger */}
              <div className="mt-10 sm:mt-12 pt-8 border-t border-[#F0E4D2]/15">
                <div className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#D9C0A8]/70 mb-4">
                  CATALOGUED STUDIO INDEX
                </div>
                <div className="divide-y divide-[#F0E4D2]/12 border-t border-b border-[#F0E4D2]/12">
                  {ARCHIVE_INDEX.map((entry, idx) => {
                    const matchedProject = PORTFOLIO_PROJECTS[idx];
                    return (
                      <div
                        key={entry.code}
                        onClick={() => {
                          if (matchedProject) {
                            handleClose();
                            onSelectProject(matchedProject.id);
                          }
                        }}
                        className="py-3.5 px-2 flex flex-wrap items-center justify-between gap-3 hover:bg-[#F0E4D2]/5 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-xs text-[#D9C0A8]/70">{entry.code}</span>
                          <span className="font-display text-base sm:text-lg text-[#F0E4D2]">
                            {entry.project}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#D9C0A8]">
                          <span className="hidden sm:inline">{entry.deliverable}</span>
                          <span>{entry.year}</span>
                          <span className="text-[#F0E4D2]">View →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

