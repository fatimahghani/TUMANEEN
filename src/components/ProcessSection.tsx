import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const PROCESS_STEPS = [
  { number: '01', title: 'Discovery', description: 'We talk through the brief and gather visual references.' },
  { number: '02', title: 'Strategy', description: 'I sketch two or three directions for you to choose from.' },
  { number: '03', title: 'Design', description: 'I develop the chosen direction through type, color and layouts.' },
  { number: '04', title: 'Build', description: 'We review the mockups and refine the details together.' },
  { number: '05', title: 'Launch', description: 'I hand over the final artwork and files for print or screen.' },
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
      PROCESS_STEPS.length - 1,
      Math.max(0, Math.round(latest * (PROCESS_STEPS.length - 1)))
    );
    setActiveStepIndex(idx);
  });

  const scrollToCardIndex = (index: number) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const scrollableDistance = sectionRef.current.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return;

    const targetProgress = index / (PROCESS_STEPS.length - 1);
    window.scrollTo({
      top: sectionTop + targetProgress * scrollableDistance,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-labelledby="tm-process-title"
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
      <div className="sticky top-0 w-full h-svh overflow-hidden flex flex-col justify-between items-center py-4 sm:py-9 md:py-12">
        <div className="tm-process-heading-row w-full max-w-[1100px] px-4 sm:px-5 flex items-baseline justify-between">
          <h2 id="tm-process-title" className="font-display">Process</h2>
          <span className="text-xs tabular-nums" aria-hidden="true">
            {PROCESS_STEPS[activeStepIndex].number} / {String(PROCESS_STEPS.length).padStart(2, '0')}
          </span>
        </div>

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
              {PROCESS_STEPS.map((card, index) => (
                <article
                  data-step={card.number}
                  key={card.number}
                  onClick={() => scrollToCardIndex(index)}
                  className="tm-process-card group relative w-[calc(100vw-32px)] sm:w-[460px] md:w-[525px] h-[425px] sm:h-[510px] md:h-[548px] max-h-[calc(100svh-150px)] sm:max-h-[calc(100svh-135px)] shrink-0 overflow-hidden bg-[#8A795D] cursor-pointer shadow-[0_20px_50px_rgba(57,30,37,0.16)]"
                >
                  <div className="tm-process-artboard" aria-hidden="true">
                    <span className="tm-process-artboard-registration">+&nbsp;&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;&nbsp;+</span>
                  </div>
                  <div className="tm-process-step-label absolute top-5 left-5 z-10 text-sm font-mono text-[#F0E4D2]">
                    {card.number}
                  </div>
                  <div className="tm-process-note absolute bottom-0 inset-x-0 z-10 p-5 sm:p-8">
                    <h3 className="font-display">{card.title}</h3>
                    <p className="text-sm leading-relaxed mt-2">{card.description}</p>
                  </div>
                </article>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="w-full max-w-[1140px] px-5 sm:px-8 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-5 overflow-x-auto no-scrollbar py-1">
            {PROCESS_STEPS.map((card, idx) => {
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
                  {card.title}
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
                scrollToCardIndex(Math.min(PROCESS_STEPS.length - 1, activeStepIndex + 1))
              }
              disabled={activeStepIndex === PROCESS_STEPS.length - 1}
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
