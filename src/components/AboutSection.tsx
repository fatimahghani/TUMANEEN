import React, { useState, useMemo } from 'react';
import { ArrowDownRight, Check, Copy, Mail } from 'lucide-react';

interface AboutSectionProps {
  onContactClick?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onContactClick }) => {
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const designerEmail = 'naqloonstudio@gmail.com';

  // Matching 35mm analog film grain tile for the vintage studio frame
  const grainTileUrl = useMemo(() => {
    if (typeof document === 'undefined') return '';
    const size = 200;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    let seed = 7331;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < data.length; i += 4) {
      const luma = (rand() - 0.5) * 150;
      const warm = (rand() - 0.45) * 40;
      data[i] = Math.min(255, Math.max(0, 128 + luma + warm));
      data[i + 1] = Math.min(255, Math.max(0, 126 + luma));
      data[i + 2] = Math.min(255, Math.max(0, 120 + luma));
      data[i + 3] = 92;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(designerEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 1800);
  };

  return (
    <section
      id="about"
      aria-label="About Fatimah Ghani"
      className="relative pt-12 pb-16 md:pt-16 md:pb-20 bg-[#FDFBD4] text-[#18383C] overflow-hidden"
    >
      {/* Continuous Vertical Architectural Studio Margin Lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-4 sm:left-10 lg:left-16 w-px bg-[#18383C]/[0.08]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-4 sm:right-10 lg:right-16 w-px bg-[#18383C]/[0.08]"
      />

      {/* Structured Architectural Chapter Rule (04 · Atelier Portrait) */}
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12 mb-8 sm:mb-10 md:mb-14">
        <div className="border-t border-b border-[#18383C]/15 py-3 sm:py-3.5 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#545333]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="font-semibold text-[#18383C]">04 / 06</span>
            <span className="h-3 w-px bg-[#18383C]/20" />
            <span>ATELIER PORTRAIT</span>
          </div>
          <span className="hidden md:inline font-serif italic normal-case tracking-[0.02em] text-sm text-[#545333]">
            Independent Multidisciplinary Design Practice
          </span>
          <span className="text-[#878672] shrink-0">FATIMAH GHANI</span>
        </div>
      </div>
      {/* Postage-Stamp Cutout Mask & Main-Page Style Duotone/Halation Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <mask id="about-stamp-mask" maskContentUnits="objectBoundingBox">
            <rect x="0" y="0" width="1" height="1" fill="white" />
            {Array.from({ length: 16 }).map((_, i) => {
              const cx = (i + 0.5) / 16;
              return (
                <g key={`atb-${i}`}>
                  <ellipse cx={cx} cy={0} rx={0.015} ry={0.013} fill="black" />
                  <ellipse cx={cx} cy={1} rx={0.015} ry={0.013} fill="black" />
                </g>
              );
            })}
            {Array.from({ length: 18 }).map((_, i) => {
              const cy = (i + 0.5) / 18;
              return (
                <g key={`alr-${i}`}>
                  <ellipse cx={0} cy={cy} rx={0.015} ry={0.013} fill="black" />
                  <ellipse cx={1} cy={cy} rx={0.015} ry={0.013} fill="black" />
                </g>
              );
            })}
          </mask>

          {/* Maps black-and-white sketch into Deep Teal (#18383C) ink + Warm Vintage Cream (#FDFBD4) paper with warm golden halation */}
          <filter id="naqloom-sketch-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.33 0.33 0.33 0 0
                      0.33 0.33 0.33 0 0
                      0.33 0.33 0.33 0 0
                      0    0    0    1 0"
              result="gray"
            />
            <feComponentTransfer in="gray" result="duotone">
              {/* R: #18383C (0.094) -> #545333 (0.33) -> #FDFBD4 (0.992) */}
              <feFuncR type="table" tableValues="0.094 0.28 0.68 0.96 0.992" />
              {/* G: #18383C (0.220) -> #545333 (0.325) -> #FDFBD4 (0.984) */}
              <feFuncG type="table" tableValues="0.220 0.31 0.62 0.91 0.984" />
              {/* B: #18383C (0.235) -> #545333 (0.200) -> #FDFBD4 (0.831) */}
              <feFuncB type="table" tableValues="0.235 0.22 0.45 0.74 0.831" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* LEFT COLUMN (5 Cols): Vintage Grainy Stamp Card in Main Page Style */}
          <div className="lg:col-span-5">
            <div
              style={{
                mask: 'url(#about-stamp-mask)',
                WebkitMask: 'url(#about-stamp-mask)',
              }}
              className="group relative bg-[#545333] text-[#FDFBD4] p-5 shadow-[0_20px_50px_rgba(24,56,60,0.16)]"
            >
              {/* Top Monospace Ticket Header (matching Hero Ticket Cards) */}
              <div className="flex items-center justify-between border-b border-[#FDFBD4]/25 text-[11px] font-mono uppercase tracking-wider text-[#D9D7B6] pb-2.5 mb-3">
                <span>FATIMAH GHANI</span>
                <span>TUMANEEN</span>
              </div>

              {/* Studio Illustration Viewport */}
              <div className="relative w-full aspect-square overflow-hidden bg-[#18383C] border border-[#FDFBD4]/20">
                {/* 1. Base Overhead Designer Desk Illustration mapped to Deep Teal & Vintage Cream */}
                <img
                  src={`${import.meta.env.BASE_URL}ref-pinterest.jpg`}
                  alt="Overhead illustration of Fatimah Ghani working at her design desk with laptop, coffee, sketchbook, and studio lamp"
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  style={{
                    filter: 'url(#naqloom-sketch-grade) contrast(1.06)',
                  }}
                  className="w-full h-full object-cover object-top-left scale-[1.08] origin-top-left transition-transform duration-700 ease-out group-hover:scale-[1.11]"
                />

                {/* 2. Warm Chromatic Halation Ghost Pass (Matches Main Page Courtyard Halation & Hand-Drawn Misregistration) */}
                <img
                  src={`${import.meta.env.BASE_URL}ref-pinterest.jpg`}
                  alt=""
                  aria-hidden="true"
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  style={{
                    filter: 'sepia(0.85) saturate(2.2) hue-rotate(-18deg) brightness(1.02)',
                  }}
                  className="pointer-events-none absolute inset-0 w-full h-full object-cover object-top-left scale-[1.08] origin-top-left translate-x-[2px] translate-y-[1.5px] opacity-30 mix-blend-multiply"
                />

                {/* 3. Main Page Retro Graphic Design Studio Texture Overlay */}
                <img
                  src={`${import.meta.env.BASE_URL}assets/aistudio/retro_design_studio_poster.jpg`}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 w-full h-full object-cover object-center opacity-55 mix-blend-soft-light transition-opacity duration-700 group-hover:opacity-65"
                />

                {/* 4. Warm Golden Sunbeam & Deep Teal Corner Vignette */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 mix-blend-multiply"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(253, 251, 212, 0.18) 0%, rgba(232, 168, 92, 0.26) 42%, rgba(84, 83, 51, 0.38) 78%, rgba(24, 56, 60, 0.58) 100%)',
                  }}
                />

                {/* 5. Subtle Warm Glow on Desk Lamp & Candle */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 mix-blend-screen opacity-75"
                  style={{
                    background:
                      'radial-gradient(circle at 73% 78%, rgba(253, 251, 212, 0.42) 0%, rgba(235, 160, 75, 0.18) 22%, transparent 50%), radial-gradient(circle at 31% 78%, rgba(253, 251, 212, 0.35) 0%, transparent 16%)',
                  }}
                />

                {/* 6. 35mm Analog Film Grain Texture (Matches Main Page) */}
                {grainTileUrl && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-75"
                    style={{
                      backgroundImage: `url(${grainTileUrl})`,
                      backgroundRepeat: 'repeat',
                      backgroundSize: '160px 160px',
                    }}
                  />
                )}

                {/* 7. Inner Archival Hairline Frame */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-2.5 border border-[#18383C]/25"
                />
              </div>

              {/* Bottom Archival Ticket Bar (matching Hero Ticket Cards) */}
              <div className="pt-3 mt-3 border-t border-[#FDFBD4]/25 flex items-center justify-between text-[11px] font-mono text-[#D9D7B6]">
                <span>GRAPHIC DESIGNER</span>
                <div className="flex items-center gap-2">
                  <span>AVAILABLE FOR WORK</span>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-2.5 h-1.5 bg-[#18383C]" />
                    <span className="inline-block w-2.5 h-1.5 bg-[#D9D7B6]" />
                    <span className="inline-block w-2.5 h-1.5 bg-[#878672]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 Cols): Short, Clean Bio for Fatimah Ghani */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="text-[11px] font-sans font-medium uppercase tracking-[0.24em] text-[#545333] mb-2.5">
                04 · THE DESIGNER
              </div>

              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#18383C] leading-[1.04]">
                Hi, I’m Fatimah Ghani.
              </h2>

              <div className="font-serif italic text-2xl sm:text-[28px] tracking-[0.01em] text-[#545333] mt-2">
                Founder &amp; Principal Designer at TUMANEEN
              </div>
            </div>

            <p className="font-sans text-base sm:text-lg text-[#545333] leading-relaxed max-w-[52ch]">
              I’m a multidisciplinary graphic designer crafting brand identities, packaging, clean UI/UX interfaces, and expressive motion graphics—turning thoughtful ideas into clear, ready-to-use visuals.
            </p>

            {/* Compact 2-Row Specs */}
            <div className="border-t border-b border-[#D9D7B6] divide-y divide-[#D9D7B6] text-xs sm:text-sm">
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#878672]">
                  FOCUS
                </span>
                <span className="font-serif italic text-base sm:text-lg font-medium text-[#18383C]">
                  Brand Identity · Packaging · UI/UX · Motion
                </span>
              </div>
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#878672]">
                  TOOLKIT
                </span>
                <span className="font-serif italic text-base sm:text-lg font-medium text-[#18383C]">
                  Affinity · Figma · Illustrator · After Effects
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onContactClick}
                className="px-6 py-3.5 sm:py-3 bg-[#18383C] hover:bg-[#545333] text-[#FDFBD4] text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Work With Me</span>
                <ArrowDownRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-4 py-3.5 sm:py-3 bg-[#D9D7B6]/60 hover:bg-[#D9D7B6] text-[#18383C] border border-[#878672]/40 text-xs font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#545333] shrink-0" />
                <span className="truncate">{designerEmail}</span>
                {emailCopied ? (
                  <Check className="w-3.5 h-3.5 text-[#18383C] shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-70 shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
