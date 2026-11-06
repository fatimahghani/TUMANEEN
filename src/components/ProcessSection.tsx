import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface InrootProcessCard {
  number: string;
  phaseKicker: string;
  centerWord: string;
  subtitle: string;
  description: string;
  bullets: string[];
  tools: string;
  imageUrl: string;
  courtyardCropPosition: string;
  sunbeamOverlay: string;
  wordGradient: string;
  boxTint: string;
}

const INROOT_PROCESS_CARDS: InrootProcessCard[] = [
  {
    number: '01',
    phaseKicker: '01 · Ignition',
    centerWord: 'DISCOVERY',
    subtitle: 'Brief & Research',
    description:
      'We listen, research and find the right questions.',
    bullets: [
      'Deep dive call or client questionnaire',
      'Visual references, moodboard & roadmap',
    ],
    tools: 'Brief · Research · Moodboard',
    // Vintage sunlit bistro table with open book, coffee cup & dappled shadows matching the main page
    imageUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    courtyardCropPosition: '28% 72%',
    sunbeamOverlay:
      'radial-gradient(circle at 75% 22%, rgba(253, 251, 212, 0.45) 0%, rgba(217, 167, 110, 0.28) 42%, rgba(57, 30, 37, 0.48) 82%, rgba(57, 30, 37, 0.68) 100%)',
    wordGradient:
      'linear-gradient(90deg, #F0E4D2 0%, #D9C0A8 35%, #FFFFFF 68%, #F0E4D2 100%)',
    boxTint:
      'linear-gradient(135deg, rgba(148, 86, 64, 0.82) 0%, rgba(57, 30, 37, 0.88) 100%)',
  },
  {
    number: '02',
    phaseKicker: '02 · Direction',
    centerWord: 'STRATEGY',
    subtitle: 'Concepts & Sketches',
    description:
      'Two or three directions, drawn from one clear idea.',
    bullets: [
      '2–3 distinct creative & brand directions',
      'Curated color systems & brand positioning',
    ],
    tools: 'Sketches · Palette · Typography',
    // Warm sunlit notebook sketches, fountain pen & dappled window shadows
    imageUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
    courtyardCropPosition: '52% 28%',
    sunbeamOverlay:
      'linear-gradient(135deg, rgba(253, 251, 212, 0.44) 0%, rgba(217, 175, 122, 0.30) 45%, rgba(148, 86, 64, 0.50) 76%, rgba(57, 30, 37, 0.68) 100%)',
    wordGradient:
      'linear-gradient(90deg, #F0E4D2 0%, #D9C0A8 48%, #F0E4D2 100%)',
    boxTint:
      'linear-gradient(135deg, rgba(148, 86, 64, 0.84) 0%, rgba(36, 48, 46, 0.90) 100%)',
  },
  {
    number: '03',
    phaseKicker: '03 · Visual System',
    centerWord: 'DESIGN',
    subtitle: 'Identity & Layouts',
    description:
      'Type, color and form find their place.',
    bullets: [
      'Primary & secondary logo mark architecture',
      'High-fidelity UI layouts & brand touchpoints',
    ],
    tools: 'Identity · Grids · Art Direction',
    // Sun-drenched Mediterranean stone wall, shutters & dappled olive tree shadows
    imageUrl:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    courtyardCropPosition: '48% 40%',
    sunbeamOverlay:
      'radial-gradient(circle at 25% 30%, rgba(253, 251, 212, 0.48) 0%, rgba(217, 215, 182, 0.28) 44%, rgba(57, 30, 37, 0.52) 80%, rgba(57, 30, 37, 0.70) 100%)',
    wordGradient:
      'linear-gradient(90deg, #F0E4D2 0%, #D9C0A8 42%, #FFFFFF 75%, #D9C0A8 100%)',
    boxTint:
      'linear-gradient(135deg, rgba(135, 134, 114, 0.76) 0%, rgba(57, 30, 37, 0.90) 100%)',
  },
  {
    number: '04',
    phaseKicker: '04 · Craft',
    centerWord: 'BUILD',
    subtitle: 'Design & Revisions',
    description:
      'Make it, test it, refine it.',
    bullets: [
      'Vector execution in Illustrator, Affinity & Figma',
      'Focused feedback & iterative refinement rounds',
    ],
    tools: 'Vector Design · Mockups · Feedback',
    // Tactile ceramic, botanical shadows, linen paper & warm golden afternoon light
    imageUrl:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80',
    courtyardCropPosition: '18% 45%',
    sunbeamOverlay:
      'linear-gradient(155deg, rgba(253, 251, 212, 0.42) 0%, rgba(217, 165, 112, 0.28) 40%, rgba(148, 86, 64, 0.52) 74%, rgba(57, 30, 37, 0.68) 100%)',
    wordGradient:
      'linear-gradient(90deg, #D9C0A8 0%, #F0E4D2 50%, #FFFFFF 80%, #D9C0A8 100%)',
    boxTint:
      'linear-gradient(135deg, rgba(148, 86, 64, 0.82) 0%, rgba(57, 30, 37, 0.90) 100%)',
  },
  {
    number: '05',
    phaseKicker: '05 · Launch',
    centerWord: 'LAUNCH',
    subtitle: 'Final Files & Handover',
    description:
      'Final files, prepared for the real world.',
    bullets: [
      'Final master logo packages (PDF, PNG, SVG, EPS)',
      'Print-ready & digital handover with support',
    ],
    tools: 'Logo Files · Guidelines · Export',
    // Sunlit sheer linen curtains & Mediterranean archway glowing in golden hour
    imageUrl:
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=900&q=80',
    courtyardCropPosition: '84% 52%',
    sunbeamOverlay:
      'radial-gradient(circle at 80% 35%, rgba(253, 251, 212, 0.50) 0%, rgba(217, 168, 108, 0.30) 44%, rgba(57, 30, 37, 0.52) 80%, rgba(57, 30, 37, 0.70) 100%)',
    wordGradient:
      'linear-gradient(90deg, #F0E4D2 0%, #D9C0A8 45%, #FFFFFF 78%, #F0E4D2 100%)',
    boxTint:
      'linear-gradient(135deg, rgba(148, 86, 64, 0.80) 0%, rgba(57, 30, 37, 0.90) 100%)',
  },
];

export const ProcessSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [maxScrollX, setMaxScrollX] = useState<number>(1926);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Measure the exact horizontal travel distance so the last card aligns cleanly with the right edge of the 1100px frame
  useEffect(() => {
    const updateMeasurements = () => {
      if (!trackRef.current || !trackWrapperRef.current) return;
      const trackWidth = trackRef.current.scrollWidth;
      const visibleWidth = trackWrapperRef.current.clientWidth;
      const padAllowance = window.innerWidth < 640 ? 32 : 24;
      const computedMax = Math.max(0, trackWidth - visibleWidth + padAllowance);
      setMaxScrollX(computedMax);
    };

    updateMeasurements();
    const observer = new ResizeObserver(updateMeasurements);
    if (trackRef.current) observer.observe(trackRef.current);
    if (trackWrapperRef.current) observer.observe(trackWrapperRef.current);
    window.addEventListener('resize', updateMeasurements);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateMeasurements);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Translate the horizontal track from 0px to -maxScrollX as the user scrolls vertically through the 3000px section
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxScrollX]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const idx = Math.min(
      INROOT_PROCESS_CARDS.length - 1,
      Math.max(0, Math.round(latest * (INROOT_PROCESS_CARDS.length - 1)))
    );
    setActiveStepIndex(idx);
  });

  const scrollToCardIndex = (index: number) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const scrollableDistance = sectionRef.current.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return;

    const targetProgress = index / (INROOT_PROCESS_CARDS.length - 1);
    window.scrollTo({
      top: sectionTop + targetProgress * scrollableDistance,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-label="How the work happens"
      className="tm-process relative w-full h-[3000px] bg-[#EFE6D6] text-[#24201D] select-none"
    >
      {/* Continuous Vertical Architectural Studio Margin Lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-4 sm:left-10 lg:left-16 w-px bg-[#5D182B]/[0.08] z-20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-4 sm:right-10 lg:right-16 w-px bg-[#5D182B]/[0.08] z-20"
      />
      {/* Sticky 100vh Viewport Container (Matches .framer-1dlexu3 on inrootdesign.com) */}
      <div className="sticky top-0 w-full h-svh overflow-hidden flex flex-col justify-between items-center py-4 sm:py-9 md:py-12">
        {/* Top Quiet Studio Context Bar + Mobile Section Title */}
        <div className="w-full max-w-[1280px] px-4 sm:px-14 lg:px-24 shrink-0 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.22em] sm:tracking-[0.24em] text-[#945640]">
            <span>03 / PROCESS</span>
            <span className="hidden sm:inline font-serif italic normal-case tracking-[0.02em] text-base text-[#945640]">
              From idea to artifact
            </span>
            <span className="font-mono tabular-nums text-[#5D182B]">
              0{activeStepIndex + 1} / 0{INROOT_PROCESS_CARDS.length}
            </span>
          </div>

          {/* Mobile-only Compact Title Header (Replaces Left Column so Card 01 is Centered on Mobile) */}
          <div className="sm:hidden flex items-baseline justify-between gap-2 pt-0.5 border-t border-[#5D182B]/12">
            <h2 className="font-display text-xl font-normal tracking-tight text-[#5D182B]">
              How the work happens
            </h2>
            <span className="font-serif italic text-xs text-[#945640]">
              Five-stage discipline
            </span>
          </div>
        </div>

        {/* Center Horizontal Scroll Stage (Matches .framer-13tztxc & .framer-nocpvy on inrootdesign.com) */}
        <div className="w-full flex-1 flex items-center justify-center overflow-hidden my-auto">
          <div
            ref={trackWrapperRef}
            className="w-full max-w-[1100px] h-full max-h-[560px] px-4 sm:px-5 flex items-center justify-start overflow-visible"
          >
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex flex-row items-center justify-start gap-4 sm:gap-6 h-full will-change-transform"
            >
              {/* ITEM 0: Left Title Block (Desktop & Tablet >= 640px) */}
              <div className="hidden sm:flex w-[265px] h-[510px] md:h-[548px] max-h-[calc(100svh-135px)] shrink-0 flex-col justify-center items-start gap-5 pr-2">
                <div className="flex flex-col items-start">
                  <p className="font-display text-[62px] font-normal leading-[0.98] tracking-[-0.02em] text-[#5D182B]">
                    The
                  </p>
                  <p className="font-display text-[54px] font-normal leading-[0.98] tracking-[-0.02em] text-[#5D182B]">
                    TUMANEEN
                  </p>
                  <p className="font-display text-[62px] font-normal leading-[0.98] tracking-[-0.02em] text-[#5D182B]">
                    Process
                  </p>
                </div>

                {/* Editorial Luxury Serif Secondary Subtitle */}
                <div className="font-serif italic text-[26px] leading-[1.18] tracking-[0.01em] text-[#945640] -mt-1">
                  Five chapters, no shortcuts
                </div>

                {/* Studio process intro text */}
                <div className="pt-3 border-t border-[#D9C0A8] space-y-2 max-w-[245px]">
                  <p className="font-serif italic text-base font-medium text-[#5D182B] leading-snug">
                    From sketch to handover.
                  </p>
                  <p className="font-sans text-xs text-[#945640] leading-relaxed">
                    From first sketch to final files.
                  </p>
                </div>
              </div>

              {/* ITEMS 1..5: Edition-style print plates following the five design stages */}
              {INROOT_PROCESS_CARDS.map((card, index) => (
                <article
                  data-step={card.number}
                  key={card.number}
                  onClick={() => scrollToCardIndex(index)}
                  className="tm-process-card group relative w-[calc(100vw-32px)] sm:w-[460px] md:w-[525px] h-[425px] sm:h-[510px] md:h-[548px] max-h-[calc(100svh-150px)] sm:max-h-[calc(100svh-135px)] shrink-0 overflow-hidden bg-[#8A795D] cursor-pointer shadow-[0_20px_50px_rgba(57,30,37,0.16)]"
                >
                  {/* Original typographic print plate: no synthetic studio photography. */}
                  <div className="tm-process-artboard" aria-hidden="true">
                    <span className="tm-process-artboard-series">TUMANEEN / STUDIO NOTES</span>
                    <span className="tm-process-artboard-number">{card.number}</span>
                    <span className="tm-process-artboard-sidenote">THE MAKING OF</span>
                    <span className="tm-process-artboard-registration">+&nbsp;&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;&nbsp;+</span>
                  </div>

                  {/* 6. Top-Left & Top-Right Quiet Step Metadata */}
                  <div className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-5 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.12em] sm:tracking-[0.14em] text-[#F0E4D2] drop-shadow-[0_1px_4px_rgba(57,30,37,0.8)]">
                    <span className="truncate">{card.phaseKicker}</span>
                    <span className="text-[#F0E4D2]/90 shrink-0">{card.subtitle}</span>
                  </div>

                  {/* 7. Center Giant All-Caps Editorial Wordmark (DISCOVERY / STRATEGY / DESIGN / BUILD / LAUNCH) */}
                  <div className="
                    absolute inset-x-0 top-[33%] sm:top-[42%] -translate-y-1/2
                    z-10 flex items-center justify-center px-3 sm:px-4
                    pointer-events-none select-none
                  ">
                    <h3
                      className="
                        font-display font-normal uppercase
                        text-[38px] sm:text-[64px] md:text-[74px]
                        leading-none tracking-[0.02em] text-center
                        drop-shadow-[0_6px_26px_rgba(57,30,37,0.65)]
                        transition-transform duration-700 ease-out
                        group-hover:scale-[1.03]
                      "
                      style={{
                        backgroundImage: card.wordGradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {card.centerWord}
                    </h3>
                  </div>

                  {/* 8. Printed annotation at the foot of each process plate */}
                  <div
                    className="
                      absolute bottom-3.5 sm:bottom-5 right-3.5 sm:right-5 left-3.5 sm:left-[26%]
                      z-20 rounded-[12px] p-3.5 sm:p-5
                      backdrop-blur-md border border-[#F0E4D2]/20
                      text-[#F0E4D2] shadow-[0_12px_32px_rgba(0,0,0,0.34)]
                      transition-transform duration-500 ease-out
                      group-hover:-translate-y-1
                    "
                    style={{ background: card.boxTint }}
                  >
                    <p className="text-[11px] sm:text-[12.5px] leading-[1.45] sm:leading-[1.48] text-[#F0E4D2]/95 font-normal mb-2 sm:mb-3">
                      {card.description}
                    </p>

                    <ul className="space-y-0.5 text-[10.5px] sm:text-[12px] leading-[1.38] sm:leading-[1.42] text-[#F0E4D2]/90">
                      {card.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-1.5">
                          <span aria-hidden="true">-</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-[#F0E4D2]/15 flex items-center justify-between text-[9px] sm:text-[10px] font-mono tracking-wider uppercase text-[#D9C0A8]">
                      <span className="truncate pr-2">{card.tools}</span>
                      <span className="shrink-0">Step {card.number}</span>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom Step Navigation Bar (Allows both scroll progress tracking & one-click jump to any card) */}
        <div className="w-full max-w-[1140px] px-5 sm:px-8 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-5 overflow-x-auto no-scrollbar py-1">
            {INROOT_PROCESS_CARDS.map((card, idx) => {
              const isCurrent = activeStepIndex === idx;
              return (
                <button
                  key={card.number}
                  aria-current={isCurrent ? 'step' : undefined}
                  type="button"
                  onClick={() => scrollToCardIndex(idx)}
                  className={`
                    text-xs font-mono uppercase tracking-wider whitespace-nowrap
                    transition-colors duration-200 cursor-pointer py-1
                    ${
                      isCurrent
                        ? 'text-[#5D182B] font-semibold border-b-2 border-[#5D182B]'
                        : 'text-[#A87B6C] hover:text-[#945640]'
                    }
                  `}
                >
                  {card.number} · {card.centerWord}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollToCardIndex(Math.max(0, activeStepIndex - 1))}
              disabled={activeStepIndex === 0}
              aria-label="Previous process step"
              className="
                w-9 h-9 flex items-center justify-center
                border border-[#A87B6C]/50 text-[#5D182B]
                hover:bg-[#5D182B] hover:text-[#F0E4D2]
                disabled:opacity-30 disabled:pointer-events-none
                transition-colors cursor-pointer
              "
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                scrollToCardIndex(Math.min(INROOT_PROCESS_CARDS.length - 1, activeStepIndex + 1))
              }
              disabled={activeStepIndex === INROOT_PROCESS_CARDS.length - 1}
              aria-label="Next process step"
              className="
                w-9 h-9 flex items-center justify-center
                border border-[#A87B6C]/50 text-[#5D182B]
                hover:bg-[#5D182B] hover:text-[#F0E4D2]
                disabled:opacity-30 disabled:pointer-events-none
                transition-colors cursor-pointer
              "
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
