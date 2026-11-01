import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

export interface LensBloomPosterCard {
  src: string;
  roman: string;
  name: string;
  project: string;
  description: string;
  aspect: number;
}

/**
 * Curated by Color Spectrum & Thematic Progression:
 * I.   Warm Parchment, Terracotta & Olive (Mixed-Media Manifesto Collage)
 * II.  Warm Sepia Ochre & Coral Crimson (Urdu Cultural Identity — Shanakht)
 * III. Chartreuse Gold & Deep Indigo (Urdu Poetic Halftone — Wajood)
 * IV.  Chartreuse Yellow & Cerulean Blue (Urdu Calligraphic Ritual — Chai)
 * V.   Tropical Teal-Cyan & Sunshine Yellow (Music & Event Poster — Chill & Mix)
 * VI.  Sunset Gold, Violet & Neon Indigo (Synthwave Vector Illustration — Retro Horizon)
 * VII. Luminous Cobalt & Royal Midnight Blue (Editorial Portrait — Tehreem)
 * VIII. Deep Midnight Noir & Kinetic Typography (Conceptual Print — Reality Vol. 01)
 */
const BASE_URL = import.meta.env.BASE_URL;

export const LENS_BLOOM_POSTERS: LensBloomPosterCard[] = [
  {
    src: `${BASE_URL}assets/aistudio/Trying_New_Things__A_Designer_s_Collage_a361d455.jpg`,
    roman: 'I',
    name: 'Trying New Things',
    project: 'Mixed Media · Designer Manifesto',
    description:
      'Tactile torn-paper collage, archival photography, and botanical specimens exploring identity and visual stories.',
    aspect: 0.8,
  },
  {
    src: `${BASE_URL}assets/aistudio/shnakht_449796d0.jpg`,
    roman: 'II',
    name: 'Shanakht (شناخت)',
    project: 'Cultural Identity · Urdu Typography',
    description:
      '“The address changed, not the identity” — neo-futurist character study set in the historic streets of Androon Lahore.',
    aspect: 0.71,
  },
  {
    src: `${BASE_URL}assets/aistudio/wajood_ac0f25c9.jpg`,
    roman: 'III',
    name: 'Wajood (وجود)',
    project: 'Poetic Editorial · Halftone Print',
    description:
      'Duotone indigo and chartreuse halftone composition meditating on presence, dignity, depth, and selfhood.',
    aspect: 0.71,
  },
  {
    src: `${BASE_URL}assets/aistudio/chai..._7ec612bc.jpg`,
    roman: 'IV',
    name: 'Chai — Ishq Kya Hai?',
    project: 'Cultural Ritual · Calligraphic Poster',
    description:
      'Expressive Urdu lettering woven around a shared cup of tea—celebrating warmth, conversation, and memory.',
    aspect: 0.71,
  },
  {
    src: `${BASE_URL}assets/aistudio/chill_and_mix_d3fa2d26.jpg`,
    roman: 'V',
    name: 'Chill & Mix',
    project: 'Event & Music · Visual Direction',
    description:
      'High-contrast condensed display typography layered with tropical foliage and sunlit cyan-lime color grading.',
    aspect: 0.8,
  },
  {
    src: `${BASE_URL}assets/aistudio/new_pic_4c93e253.jpg`,
    roman: 'VI',
    name: 'Retro Horizon',
    project: 'Vector Illustration · Synthwave Print',
    description:
      'Outrun golden sun, palm silhouettes, and a classic fastback poised over a neon perspective grid.',
    aspect: 1.0,
  },
  {
    src: `${BASE_URL}assets/aistudio/birthday_eeadee85.jpg`,
    roman: 'VII',
    name: 'Tehreem · 03 March',
    project: 'Editorial Portrait · Archway Print',
    description:
      'Luminous cobalt archway framing an intimate editorial portrait paired with heartfelt typographic blessings.',
    aspect: 0.8,
  },
  {
    src: `${BASE_URL}assets/aistudio/Group_6cd15385.jpg`,
    roman: 'VIII',
    name: 'Reality · Vol. 01',
    project: 'Kinetic Typography · Conceptual Poster',
    description:
      '“Nothing is quite what it seems” — atmospheric motion blur and repeating typographic echoes in deep noir.',
    aspect: 0.75,
  },
];

const LB = {
  CARD_H_FRAC: 0.66,
  CARD_ASPECT: 0.72,
  CLUSTER_SCALE: 0.48,
  ROW_SCALE: 0.48,
  OPEN_SCALE: 1.0,
  ROW_GAP_FRAC: 0.016,
  TITLE_MIN: 0.33,
  WORDS_IN: 0.26,
  CARD_ONSET: 0.06,
  CARD_APPEAR: 0.3,
  LOAD_DUR: 2.2,
  EASE: 0.14,
  SNAP: 0.0005,
};

const smoothstep = (x: number) => x * x * (3 - 2 * x);
const clamp = (val: number, min: number, max: number) =>
  val < min ? min : val > max ? max : val;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export const PosterSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const wordLeftRef = useRef<HTMLDivElement | null>(null);
  const wordRightRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imgsRef = useRef<(HTMLImageElement | null)[]>([]);
  const hintRef = useRef<HTMLDivElement | null>(null);

  const hoveredIndexRef = useRef<number | null>(null);
  const [hoveredPoster, setHoveredPoster] = useState<LensBloomPosterCard | null>(null);

  const controlsRef = useRef<{
    replayBloom: () => void;
  } | null>(null);
  const wakeLoopRef = useRef<(() => void) | null>(null);

  const cards = LENS_BLOOM_POSTERS;
  const u = cards.length;
  const d = (0.94 - LB.CARD_ONSET - LB.CARD_APPEAR) / Math.max(1, u - 1);

  useEffect(() => {
    const t = sectionRef.current;
    if (!t) return;

    let o = 0;
    let P = 0;
    let F = 0;
    let B = 0;
    let I = 0;
    let H = 0;
    let z = 0;
    let U = 0;
    let W = 0;
    let q = 0;
    let eo = 0;
    let cachedLeftWordW = 0;
    let cachedRightWordW = 0;

    let introStartTime: number | null = null;
    let introActive = false;

    // Smooth per-card hover progress (0 = in line, 1 = opened full image)
    const hoverProgress = new Array<number>(u).fill(0);
    // Smooth neighbor horizontal shift when a card opens
    const neighborShift = new Array<number>(u).fill(0);

    const rowPose = (e: number) => ({
      x: (e - (u - 1) / 2) * U,
      y: 0,
      s: LB.ROW_SCALE,
      z: 0,
      op: 1,
      zi: 300 - 12 * e,
    });

    const lerpPose = (
      aPose: { x: number; y: number; s: number; z: number; op: number; zi: number },
      bPose: { x: number; y: number; s: number; z: number; op: number; zi: number },
      r: number
    ) => ({
      x: lerp(aPose.x, bPose.x, r),
      y: lerp(aPose.y, bPose.y, r),
      s: lerp(aPose.s, bPose.s, r),
      z: lerp(aPose.z, bPose.z, r),
      op: lerp(aPose.op, bPose.op, r),
      zi: Math.round(lerp(aPose.zi, bPose.zi, r)),
    });

    const baseLinePose = (e: number, tVal: number, r: number) => {
      const targetRow = rowPose(e);
      if (tVal < 1) {
        const tPose = lerpPose(
          {
            x: (e - (u - 1) / 2) * W,
            y: 0,
            s: LB.CLUSTER_SCALE,
            z: 0,
            op: 1,
            zi: 100,
          },
          targetRow,
          r
        );
        const n = smoothstep(clamp((r - LB.CARD_ONSET - e * d) / LB.CARD_APPEAR, 0, 1));
        return {
          ...tPose,
          s: tPose.s * (0.7 + 0.3 * n),
          y: tPose.y + (1 - n) * I * 0.03,
          op: n,
          zi: 300 - 12 * e,
        };
      }
      return targetRow;
    };

    const wakeUp = () => {
      if (!F && !document.hidden) {
        F = requestAnimationFrame(ev);
      }
    };
    wakeLoopRef.current = wakeUp;

    const eh = () => {
      B = t.clientWidth;
      I = t.clientHeight;
      const isMobile = B < 768;
      z = (isMobile ? 0.48 : LB.CARD_H_FRAC) * I;
      H = z * LB.CARD_ASPECT;
      const spanFrac = isMobile ? 0.56 : B < 1024 ? 0.48 : 0.38;
      U = Math.min(
        LB.ROW_SCALE * H + LB.ROW_GAP_FRAC * B,
        (spanFrac * B) / Math.max(1, u - 1)
      );
      W = 0.6 * U;
      q = ((u - 1) * U) / 2 + (LB.ROW_SCALE * H) / 2;

      if (wordLeftRef.current) cachedLeftWordW = wordLeftRef.current.offsetWidth;
      if (wordRightRef.current) cachedRightWordW = wordRightRef.current.offsetWidth;

      for (let idx = 0; idx < u; idx++) {
        const cardEl = cardsRef.current[idx];
        if (cardEl) {
          cardEl.style.width = `${H}px`;
          cardEl.style.height = `${z}px`;
        }
      }
      wakeUp();
    };

    const startIntroAnimation = (now: number) => {
      introStartTime = now;
      introActive = true;
      o = 0;
      P = 0;
      if (hintRef.current) hintRef.current.style.opacity = '0';
      wakeUp();
    };

    const ev = (now: number) => {
      F = 0;
      let isAnimating = false;

      if (introActive && introStartTime !== null) {
        const elapsed = (now - introStartTime) / 1000;
        const progress = clamp(elapsed / LB.LOAD_DUR, 0, 1);
        const eased = easeInOutQuad(progress);
        o = eased;
        P = eased;
        isAnimating = true;
        if (progress >= 1) {
          introActive = false;
          o = 1;
          P = 1;
          if (hintRef.current) hintRef.current.style.opacity = '1';
        }
      } else {
        const diff = P - o;
        if (Math.abs(diff) >= LB.SNAP) {
          o += diff * LB.EASE;
          isAnimating = true;
        } else {
          o = P;
        }
      }

      const i = o < 1 ? smoothstep(clamp((o - LB.WORDS_IN) / (1 - LB.WORDS_IN), 0, 1)) : 1;

      const dWord = wordLeftRef.current;
      const wWord = wordRightRef.current;
      if (dWord && wWord) {
        const eWidth = cachedLeftWordW || dWord.offsetWidth;
        const tWidth = cachedRightWordW || wWord.offsetWidth;
        const centerX = B / 2;
        const gap = 0.045 * B;
        const startLeft = centerX - (eWidth + gap + tWidth) / 2;
        const margin = Math.max(10, 0.025 * B);
        const scale = lerp(1, LB.TITLE_MIN, i);
        const targetLeftX = Math.max(8, centerX - q - margin - eWidth * scale);
        const targetRightX = Math.min(B - tWidth * scale - 8, centerX + q + margin);
        const leftX = lerp(startLeft, targetLeftX, i);
        const rightX = lerp(startLeft + eWidth + gap, targetRightX, i);
        eo = lerp(startLeft + eWidth + gap / 2, centerX, i);
        const wordOpacity = o < 1 ? smoothstep(clamp(o / LB.WORDS_IN, 0, 1)) : 1;

        dWord.style.transform = `translateY(-50%) translate(${leftX.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        wWord.style.transform = `translateY(-50%) translate(${rightX.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        dWord.style.opacity = wordOpacity.toFixed(3);
        wWord.style.opacity = wordOpacity.toFixed(3);
      } else {
        eo = B / 2;
      }

      const activeHoverIdx = hoveredIndexRef.current;

      for (let idx = 0; idx < u; idx++) {
        const cardEl = cardsRef.current[idx];
        if (!cardEl) continue;

        const targetH = activeHoverIdx === idx ? 1 : 0;
        const hDiff = targetH - hoverProgress[idx];
        if (Math.abs(hDiff) >= 0.001) {
          hoverProgress[idx] += hDiff * 0.16;
          isAnimating = true;
        } else {
          hoverProgress[idx] = targetH;
        }

        // Subtle horizontal breathing room in the line around the hovered poster
        let targetShift = 0;
        if (activeHoverIdx !== null && activeHoverIdx !== idx) {
          const dist = idx - activeHoverIdx;
          const dir = dist > 0 ? 1 : -1;
          const falloff = Math.max(0.25, 1 - (Math.abs(dist) - 1) * 0.12);
          targetShift = dir * (0.26 * H) * falloff;
        }
        const sDiff = targetShift - neighborShift[idx];
        if (Math.abs(sDiff) >= 0.1) {
          neighborShift[idx] += sDiff * 0.16;
          isAnimating = true;
        } else {
          neighborShift[idx] = targetShift;
        }

        const basePose = baseLinePose(idx, o, i);
        const hAmt = hoverProgress[idx];
        const isNarrow = B < 900;

        // Smoothly morph card width from uniform row aspect (0.72) to the poster's true native aspect when opened
        const openWidth = z * cards[idx].aspect;
        const currentWidth = lerp(H, openWidth, hAmt);
        cardEl.style.width = `${currentWidth.toFixed(1)}px`;

        // Ensure opened poster always fits comfortably inside mobile/tablet viewport
        const maxOpenScaleW = (B * (isNarrow ? 0.84 : 0.92)) / Math.max(1, openWidth);
        const maxOpenScaleH = (I * (isNarrow ? 0.56 : 0.72)) / Math.max(1, z);
        const effectiveOpenScale = Math.min(LB.OPEN_SCALE, maxOpenScaleW, maxOpenScaleH);

        // On narrow viewports, smoothly center the opened card horizontally so edge posters never clip
        const openTargetX = isNarrow ? 0 : basePose.x + neighborShift[idx];
        const finalX = lerp(basePose.x + neighborShift[idx], openTargetX, hAmt);
        const finalY = lerp(basePose.y, isNarrow ? -24 : -12, hAmt);
        const finalS = lerp(basePose.s, effectiveOpenScale, hAmt);
        const finalZ = lerp(basePose.z, 90, hAmt);
        const finalZi = hAmt > 0.05 ? 600 + Math.round(hAmt * 100) : basePose.zi;

        cardEl.style.transform = `translate3d(${(eo + finalX).toFixed(1)}px, ${(I / 2 + finalY).toFixed(1)}px, ${finalZ.toFixed(1)}px) translate(-50%, -50%) scale(${finalS.toFixed(3)})`;
        cardEl.style.opacity = basePose.op.toFixed(3);
        cardEl.style.zIndex = String(finalZi);
      }

      if (isAnimating && !document.hidden) {
        F = requestAnimationFrame(ev);
      }
    };

    controlsRef.current = {
      replayBloom: () => {
        startIntroAnimation(performance.now());
      },
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (F) cancelAnimationFrame(F);
        F = 0;
      } else {
        wakeUp();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    const resizeObserver = new ResizeObserver(() => eh());
    resizeObserver.observe(t);
    eh();
    document.fonts?.ready.then(() => eh());

    let hasTriggeredIntro = false;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.22) {
          if (!hasTriggeredIntro) {
            hasTriggeredIntro = true;
            startIntroAnimation(performance.now());
          }
        } else if (!entry.isIntersecting) {
          // Reset when scrolled completely out of view so returning to Posters replays the Bloom animation
          hasTriggeredIntro = false;
          introActive = false;
          o = 0;
          P = 0;
          wakeUp();
        }
      },
      { threshold: [0, 0.22, 0.5] }
    );
    intersectionObserver.observe(t);

    wakeUp();

    return () => {
      if (F) cancelAnimationFrame(F);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [cards, d, u]);

  const selectPosterByIndex = (idx: number | null) => {
    hoveredIndexRef.current = idx;
    setHoveredPoster(idx !== null ? cards[idx] || null : null);
    wakeLoopRef.current?.();
  };

  return (
    <section
      id="posters"
      ref={sectionRef}
      data-lens-bloom=""
      aria-label="My Posters"
      className="relative h-[100svh] min-h-[580px] w-full !cursor-default"
    >
      <div
        className="lb-stage"
        onClick={() => {
          if (hoveredIndexRef.current !== null) {
            selectPosterByIndex(null);
          }
        }}
      >
        {/* Top Studio Context & Bloom Replay */}
        <div
          data-lb-ui="true"
          className="absolute top-0 left-0 right-0 z-[630] flex items-center justify-between px-4 sm:px-12 lg:px-[clamp(24px,7vw,100px)] py-5 sm:py-7 pointer-events-auto"
        >
          <div className="flex items-center gap-3">
            <span className="font-sans text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em] sm:tracking-[0.26em] text-[#FDFBD4]/65">
              01 · POSTER ARCHIVE
            </span>
            <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-[#D9D7B6]/40" />
            <span className="hidden sm:inline-block font-serif italic text-[16px] sm:text-[19px] tracking-[0.02em] text-[#D9D7B6]/90">
              Curated by color &amp; theme · Hover or tap any poster to inspect full frame
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                controlsRef.current?.replayBloom();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[#FDFBD4]/70 hover:text-[#FDFBD4] border border-[#FDFBD4]/15 hover:border-[#FDFBD4]/40 transition-colors cursor-pointer bg-[#122629]/50 backdrop-blur-sm"
              title="Replay Bloom Animation"
            >
              <Sparkles className="w-3 h-3" />
              Bloom
            </button>
          </div>
        </div>

        {/* Flanking Split Editorial Words */}
        <div
          ref={wordLeftRef}
          className="lb-word lb-word-l"
          aria-hidden="true"
        >
          My
        </div>
        <div
          ref={wordRightRef}
          className="lb-word lb-word-r"
          aria-hidden="true"
        >
          Posters
        </div>

        {/* 8 Curated Poster Cards in Horizontal Line — Hovering or Tapping a Card Opens ONLY That Card to Full Native Image */}
        <div className="lb-cards">
          {cards.map((card, idx) => (
            <div
              key={card.src}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (hoveredIndexRef.current === idx) {
                  selectPosterByIndex(null);
                } else {
                  selectPosterByIndex(idx);
                }
              }}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'touch') {
                  selectPosterByIndex(idx);
                }
              }}
              onPointerLeave={(e) => {
                if (e.pointerType !== 'touch' && hoveredIndexRef.current === idx) {
                  selectPosterByIndex(null);
                }
              }}
              className="lb-card group cursor-pointer"
            >
              <img
                ref={(el) => {
                  imgsRef.current[idx] = el;
                }}
                src={card.src}
                alt={card.name}
                loading="eager"
                decoding="async"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Bottom Caption & Hover Cue */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute inset-x-0 bottom-4 sm:bottom-7 z-[650] flex flex-col items-center justify-center gap-2.5 px-4 sm:px-6 text-center"
        >
          {hoveredPoster ? (
            <div className="bg-[#122629]/92 backdrop-blur-md border border-[#FDFBD4]/20 px-4 sm:px-6 py-2.5 sm:py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-200 max-w-[92vw] sm:max-w-xl">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs sm:text-base font-display text-[#FDFBD4]">
                <span>{hoveredPoster.name}</span>
                <span className="text-[#D9D7B6]/40">·</span>
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-[#D9D7B6]/80">
                  {hoveredPoster.project}
                </span>
              </div>
              <p className="mt-1 font-serif italic text-xs sm:text-base text-[#D9D7B6]/90 line-clamp-2 sm:line-clamp-none">
                {hoveredPoster.description}
              </p>
            </div>
          ) : (
            <div ref={hintRef} className="lb-hint !static !transform-none" aria-hidden="true">
              <span className="lb-hint-track !h-3.5 sm:!h-[22px]" />
              <span className="lb-hint-label">Hover or tap any poster to open</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
