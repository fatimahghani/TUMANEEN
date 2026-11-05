import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Mail } from 'lucide-react';

interface ReadingNookHeroProps {
  activeNav?: 'home' | 'project' | 'about' | 'services' | 'posters' | 'process';
  onSelectNav?: (section: 'home' | 'project' | 'about' | 'services' | 'posters' | 'process') => void;
  onEmailClick?: () => void;
}

interface HeroReelCardItem {
  id: string;
  kind: 'service' | 'toolkit' | 'availability';
  label: string;
  title: string;
  subtitle?: string;
  variant: 'cream' | 'sage' | 'olive' | 'teal-cream';
}

const HERO_REEL_CARDS: HeroReelCardItem[] = [
  {
    id: 'service-01',
    kind: 'service',
    label: 'SERVICE 01',
    title: 'Brand Identity',
    subtitle: 'Logos, color, type and guidelines',
    variant: 'cream',
  },
  {
    id: 'service-02',
    kind: 'service',
    label: 'SERVICE 02',
    title: 'Packaging Design',
    subtitle: 'Labels, boxes and mockups',
    variant: 'sage',
  },
  {
    id: 'service-03',
    kind: 'service',
    label: 'SERVICE 03',
    title: 'UI/UX Design',
    subtitle: 'Web and app screens in Figma',
    variant: 'olive',
  },
  {
    id: 'service-04',
    kind: 'service',
    label: 'SERVICE 04',
    title: 'Motion Graphics',
    subtitle: 'Logo animations and social reels',
    variant: 'cream',
  },
  {
    id: 'toolkit',
    kind: 'toolkit',
    label: 'TOOLKIT',
    title: 'Affinity · Figma · Illustrator · After Effects',
    subtitle: 'Vector, interface & motion workflow',
    variant: 'sage',
  },
  {
    id: 'availability',
    kind: 'availability',
    label: 'AVAILABILITY',
    title: 'Open for freelance and junior design work',
    variant: 'teal-cream',
  },
];

const TUMANEEN_LETTERS = [
  { char: 'T', rot: -1.4, ox: -2.5, oy: 2.0 },
  { char: 'U', rot: 1.1, ox: 2.0, oy: -2.0 },
  { char: 'M', rot: -0.9, ox: -2.0, oy: 2.5 },
  { char: 'A', rot: 1.5, ox: 2.5, oy: 1.5 },
  { char: 'N', rot: -1.2, ox: -2.0, oy: -2.0 },
  { char: 'E', rot: 1.0, ox: 2.0, oy: 2.0 },
  { char: 'E', rot: -1.3, ox: -2.5, oy: -1.5 },
  { char: 'N', rot: 1.2, ox: 2.0, oy: 1.5 },
];

export const ReadingNookHero: React.FC<ReadingNookHeroProps> = ({
  activeNav = 'home',
  onSelectNav,
  onEmailClick,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Duplicate 4x (even multiple) for a mathematically seamless -50% full-bleed infinite rolling reel
  const reelItems: HeroReelCardItem[] = [
    ...HERO_REEL_CARDS,
    ...HERO_REEL_CARDS,
    ...HERO_REEL_CARDS,
    ...HERO_REEL_CARDS,
  ];

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.muted = true;
      vid.playbackRate = 1.0;
      vid.play().catch(() => {});
    }
  }, []);

  const renderHandDrawnLetter = (
    item: { char: string; rot: number; ox: number; oy: number },
    idx: number,
    rowPrefix: string,
    baseDelay: number,
    fontSize: string
  ) => (
    <motion.div
      key={`${rowPrefix}-${idx}`}
      initial={{ opacity: 0, scale: 0.82, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: baseDelay + idx * 0.06,
        duration: 0.55,
        type: 'spring',
        stiffness: 160,
        damping: 14,
      }}
      className="relative inline-block"
    >
      <div
        style={
          {
            '--letter-rot': `${item.rot}deg`,
            '--fill-ox': `${item.ox}px`,
            '--fill-oy': `${item.oy}px`,
            '--boil-delay': `${(idx * 0.09).toFixed(2)}s`,
            fontFamily: "'Anton', 'Oswald', sans-serif",
            fontSize,
            lineHeight: 0.96,
          } as React.CSSProperties
        }
        className="animate-hero-letter relative inline-block uppercase tracking-[0.03em] px-[0.015em]"
      >
        {/* 1. Primary Solid Fill Layer (Misregistered Offset like AE Tutorial) */}
        <span
          style={{
            color: '#FDFBD4',
            textShadow: '4px 5px 0px #18383C',
            filter: 'url(#ae-hand-drawn-fill)',
          }}
          className="animate-ae-fill relative z-10 block select-none"
        >
          {item.char}
        </span>

        {/* 2. Primary Hand-Drawn Sketch Outline (Thick Dark Teal #18383C Boil Line 1) */}
        <span
          aria-hidden="true"
          style={{
            WebkitTextStroke: '3.6px #18383C',
            color: 'transparent',
            filter: 'url(#ae-hand-drawn-1)',
          }}
          className="animate-ae-stroke-a pointer-events-none absolute inset-0 z-20 block select-none"
        >
          {item.char}
        </span>

        {/* 3. Secondary Hand-Drawn Sketch Outline (Offset Dark Teal #18383C Boil Line 2) */}
        <span
          aria-hidden="true"
          style={{
            WebkitTextStroke: '2.3px #18383C',
            color: 'transparent',
            filter: 'url(#ae-hand-drawn-2)',
          }}
          className="animate-ae-stroke-b pointer-events-none absolute inset-0 z-20 block select-none opacity-90"
        >
          {item.char}
        </span>

        {/* 4. Outer Cream Chalk/Pencil Accent Line (Matches Reference Light Sketch Pass) */}
        <span
          aria-hidden="true"
          style={{
            WebkitTextStroke: '1.4px rgba(253, 251, 212, 0.78)',
            color: 'transparent',
            filter: 'url(#ae-hand-drawn-2)',
          }}
          className="animate-ae-stroke-c pointer-events-none absolute inset-0 z-30 block select-none"
        >
          {item.char}
        </span>
      </div>
    </motion.div>
  );

  const renderTicketReelCard = (card: HeroReelCardItem, idx: number) => {
    // Card surface styles matching the cream paper + olive/sage/deep-teal courtyard theme
    const isOlive = card.variant === 'olive';
    const isSage = card.variant === 'sage';
    const isTealCream = card.variant === 'teal-cream';

    const containerClasses = isOlive
      ? 'bg-[#545333] text-[#FDFBD4]'
      : isSage
        ? 'bg-[#D9D7B6] text-[#18383C]'
        : isTealCream
          ? 'bg-[#FDFBD4] text-[#18383C]'
          : 'bg-[#FDFBD4] text-[#545333]';

    const dividerClasses = isOlive
      ? 'border-[#FDFBD4]/25'
      : isSage
        ? 'border-[#545333]/20'
        : 'border-[#D9D7B6]';

    const labelClasses = isOlive
      ? 'text-[#D9D7B6]'
      : isSage
        ? 'text-[#545333]'
        : 'text-[#878672]';

    const titleClasses = isOlive
      ? 'text-[#FDFBD4]'
      : isSage || isTealCream
        ? 'text-[#18383C]'
        : 'text-[#545333]';

    const subtitleClasses = isOlive
      ? 'text-[#D9D7B6]'
      : isSage
        ? 'text-[#545333]'
        : 'text-[#878672]';

    const handleCardClick = () => {
      if (card.kind === 'availability') {
        onEmailClick?.();
      } else {
        onSelectNav?.('services');
      }
    };

    return (
      <div
        key={`${card.id}-${idx}`}
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        style={{
          mask: 'url(#ticket-stamp-mask)',
          WebkitMask: 'url(#ticket-stamp-mask)',
        }}
        className={`group relative w-[232px] sm:w-[340px] md:w-[380px] h-[144px] sm:h-[190px] md:h-[202px] shrink-0 px-4 sm:px-6 py-3.5 sm:py-5 flex flex-col justify-between transition-transform duration-200 hover:scale-[1.015] text-left cursor-pointer overflow-hidden ${containerClasses}`}
      >
        {/* Top Monospace Label Row + Thin Divider Line */}
        <div
          className={`flex items-center justify-between border-b pb-1.5 sm:pb-2 text-[10px] sm:text-[11px] font-mono tracking-wider uppercase tabular-nums ${dividerClasses} ${labelClasses}`}
        >
          <span className="truncate pr-2">{card.label}</span>
          <span className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
            {card.kind === 'service' && (
              <>
                <span>SERVICES</span>
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </>
            )}
            {card.kind === 'toolkit' && <span>STACK</span>}
            {card.kind === 'availability' && <span>STATUS</span>}
          </span>
        </div>

        {/* Middle Bold Title & Short Line */}
        <div className="my-auto py-1 sm:py-1.5">
          {card.kind === 'toolkit' ? (
            <div className="space-y-0.5 sm:space-y-1">
              <div
                className={`font-display text-base sm:text-xl font-semibold leading-snug tracking-tight ${titleClasses}`}
              >
                {card.title}
              </div>
              {card.subtitle && (
                <p className={`font-serif italic text-xs sm:text-base ${subtitleClasses}`}>
                  {card.subtitle}
                </p>
              )}
            </div>
          ) : card.kind === 'availability' ? (
            <div className="flex items-center justify-between gap-2.5 sm:gap-3">
              <div
                className={`font-display text-sm sm:text-lg font-semibold leading-snug tracking-tight ${titleClasses}`}
              >
                {card.title}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEmailClick?.();
                }}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-md bg-[#18383C] hover:bg-[#545333] text-[#FDFBD4] text-[11px] sm:text-xs font-sans font-medium tracking-wide transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Email me</span>
              </button>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div
                className={`font-display text-lg sm:text-2xl font-semibold leading-tight tracking-tight ${titleClasses}`}
              >
                {card.title}
              </div>
              {card.subtitle && (
                <p className={`font-serif italic text-xs sm:text-[17px] leading-snug line-clamp-1 sm:line-clamp-none ${subtitleClasses}`}>
                  {card.subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Thin Divider Line + Subtle Archival Footer Bar */}
        <div
          className={`pt-1.5 sm:pt-2 border-t flex items-center justify-between text-[9px] sm:text-[10px] font-mono tabular-nums ${dividerClasses} ${labelClasses}`}
        >
          <span>TUMANEEN</span>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 sm:w-3 h-1.5 bg-[#18383C]" />
            <span className="inline-block w-2.5 sm:w-3 h-1.5 bg-[#545333]" />
            <span className="inline-block w-2.5 sm:w-3 h-1.5 bg-[#878672]" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative w-full h-[100svh] min-h-[560px] bg-[#18383C] overflow-hidden flex flex-col justify-between select-none">
      {/* SVG Filters & Transparent Postage-Stamp Ticket Cutout Mask */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <mask id="ticket-stamp-mask" maskContentUnits="objectBoundingBox">
            <rect x="0" y="0" width="1" height="1" fill="white" />
            {/* Top & Bottom transparent circular cutouts */}
            {Array.from({ length: 18 }).map((_, i) => {
              const cx = (i + 0.5) / 18;
              return (
                <g key={`tb-hole-${i}`}>
                  <ellipse cx={cx} cy={0} rx={0.014} ry={0.026} fill="black" />
                  <ellipse cx={cx} cy={1} rx={0.014} ry={0.026} fill="black" />
                </g>
              );
            })}
            {/* Left & Right transparent circular cutouts */}
            {Array.from({ length: 10 }).map((_, i) => {
              const cy = (i + 0.5) / 10;
              return (
                <g key={`lr-hole-${i}`}>
                  <ellipse cx={0} cy={cy} rx={0.014} ry={0.026} fill="black" />
                  <ellipse cx={1} cy={cy} rx={0.014} ry={0.026} fill="black" />
                </g>
              );
            })}
          </mask>

          <filter id="ae-hand-drawn-1" x="-35%" y="-35%" width="170%" height="170%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.02 0.025"
              numOctaves="2"
              seed="5"
              result="noise"
            >
              <animate
                attributeName="seed"
                values="5;11;19;27;5"
                dur="1.8s"
                calcMode="discrete"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <filter id="ae-hand-drawn-2" x="-35%" y="-35%" width="170%" height="170%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.024 0.02"
              numOctaves="2"
              seed="14"
              result="noise"
            >
              <animate
                attributeName="seed"
                values="14;23;7;31;14"
                dur="2.1s"
                calcMode="discrete"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3.6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <filter id="ae-hand-drawn-fill" x="-35%" y="-35%" width="170%" height="170%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="2"
              seed="3"
              result="noise"
            >
              <animate
                attributeName="seed"
                values="3;9;17;25;3"
                dur="2.4s"
                calcMode="discrete"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* FULL-SCREEN LOOPING RETRO VINTAGE GRAPHIC DESIGN & LETTERPRESS STUDIO ANIMATION */}
      <motion.video
        ref={videoRef}
        src={`${import.meta.env.BASE_URL}assets/aistudio/retro_design_studio_loop.mp4`}
        poster={`${import.meta.env.BASE_URL}assets/aistudio/retro_design_studio_poster.jpg`}
        preload="auto"
        autoPlay
        loop
        muted
        playsInline
        initial={{ scale: 1.04, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* RETRO ANALOG 35MM FILM GRAIN & WARM STUDIO VIGNETTE OVERLAY */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(24,56,60,0.14)_0%,rgba(18,34,37,0.56)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.14] mix-blend-overlay bg-[radial-gradient(#FDFBD4_1px,transparent_1px)] [background-size:3px_3px]"
      />
      {/* SEAMLESS BOTTOM ATMOSPHERIC MELT INTO POSTER ARCHIVE (#122629) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 z-20 bg-gradient-to-b from-transparent via-[#122629]/55 to-[#122629]"
      />

      {/* 1. SIMPLE TOP NAVIGATION TEXT DIRECTLY INSIDE THE PICTURE */}
      <nav
        aria-label="Primary navigation"
        className="relative z-30 w-full max-w-2xl mx-auto pt-4 sm:pt-7 flex items-center justify-between sm:justify-center gap-2 sm:gap-10 md:gap-12 px-4 sm:px-6 shrink-0"
      >
        {(
          [
            { id: 'home', label: 'Home' },
            { id: 'posters', label: 'Posters' },
            { id: 'project', label: 'Project' },
            { id: 'process', label: 'Process' },
            { id: 'about', label: 'About' },
            { id: 'services', label: 'Services' },
          ] as const
        ).map((navItem) => {
          const isActive = activeNav === navItem.id;
          return (
            <a
              key={navItem.id}
              href={`#${navItem.id}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectNav?.(navItem.id);
              }}
              className={`py-1 font-sans text-[11px] sm:text-base font-medium tracking-wide text-[#FDFBD4] drop-shadow-[0_1px_4px_rgba(24,56,60,0.65)] transition-opacity whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'opacity-100 underline decoration-[#FDFBD4] underline-offset-6'
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              {navItem.label}
            </a>
          );
        })}
      </nav>

      {/* 2. HAND-DRAWN TITLE IN MIDDLE OF THE COURTYARD */}
      <div className="relative z-20 my-auto flex flex-col items-center justify-center px-3 sm:px-4 py-2 sm:py-4 max-w-full overflow-hidden">
        {/* ROW 1: "TUMANEEN" */}
        <div className="flex items-center justify-center gap-0.5 sm:gap-2 md:gap-2.5">
          {TUMANEEN_LETTERS.map((item, idx) =>
            renderHandDrawnLetter(item, idx, 'tumaneen', 0, 'clamp(2.35rem, 11.2vw, 10.2rem)')
          )}
        </div>
      </div>

      {/* 3. FULL-WIDTH EDGE-TO-EDGE PERFORATED TICKET / STAMP ROLLING REEL AT BOTTOM OF HERO (NO BACKGROUND BOX) */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        role="region"
        aria-label="Studio services, toolkit, and availability ticket reel"
        aria-roledescription="carousel"
        className="relative z-30 w-full pb-4 sm:pb-7 overflow-hidden shrink-0"
      >
        <div className="animate-marquee flex items-start gap-3 sm:gap-4 pr-3 sm:pr-4">
          {reelItems.map((card, idx) => renderTicketReelCard(card, idx))}
        </div>
      </motion.div>
    </section>
  );
};
