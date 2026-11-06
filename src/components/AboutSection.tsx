import React, { useState } from 'react';
import { ArrowDownRight, Check, Copy, Mail } from 'lucide-react';

interface AboutSectionProps {
  onContactClick?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onContactClick }) => {
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const designerEmail = 'naqloonstudio@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(designerEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 1800);
  };

  return (
    <section
      id="about"
      aria-label="About Fatimah Ghani"
      className="tm-about relative pt-12 pb-16 md:pt-16 md:pb-20 bg-[#F0E4D2] text-[#5D182B] overflow-hidden"
    >
      {/* Continuous Vertical Architectural Studio Margin Lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-4 sm:left-10 lg:left-16 w-px bg-[#5D182B]/[0.08]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-4 sm:right-10 lg:right-16 w-px bg-[#5D182B]/[0.08]"
      />

      {/* Structured Architectural Chapter Rule (04 · Atelier Portrait) */}
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12 mb-8 sm:mb-10 md:mb-14">
        <div className="border-t border-b border-[#5D182B]/15 py-3 sm:py-3.5 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#945640]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="font-semibold text-[#5D182B]">04 / 06</span>
            <span className="h-3 w-px bg-[#5D182B]/20" />
            <span>A NOTE FROM THE DESIGNER</span>
          </div>
          <span className="hidden md:inline font-serif italic normal-case tracking-[0.02em] text-sm text-[#945640]">
            Independent Multidisciplinary Design Practice
          </span>
          <span className="text-[#A87B6C] shrink-0">FATIMAH GHANI</span>
        </div>
      </div>
      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* LEFT COLUMN (5 Cols): Original Portfolio Print as an Editorial Plate */}
          <div className="lg:col-span-5">
            <div
              className="tm-about-plate group relative bg-[#945640] text-[#F0E4D2] p-5"
            >
              {/* Editorial Print Credit */}
              <div className="flex items-center justify-between border-b border-[#F0E4D2]/25 text-[11px] font-mono uppercase tracking-wider text-[#D9C0A8] pb-2.5 mb-3">
                <span>FATIMAH GHANI</span>
                <span>TUMANEEN</span>
              </div>

              {/* A real portfolio plate, not a generated studio illustration. */}
              <figure className="tm-about-artwork">
                <div className="tm-about-artwork-window">
                  <img
                    src={String(import.meta.env.BASE_URL) + 'assets/aistudio/wajood_ac0f25c9.jpg'}
                    alt="Wajood, Fatimah Ghani's original Urdu poetic editorial poster"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption><span>PLATE III / WAJOOD</span><span>ORIGINAL PRINT STUDY</span></figcaption>
              </figure>

              {/* Bottom Archival Ticket Bar (matching Hero Ticket Cards) */}
              <div className="pt-3 mt-3 border-t border-[#F0E4D2]/25 flex items-center justify-between text-[11px] font-mono text-[#D9C0A8]">
                <span>GRAPHIC DESIGNER</span>
                <div className="flex items-center gap-2">
                  <span>AVAILABLE FOR WORK</span>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-2.5 h-1.5 bg-[#5D182B]" />
                    <span className="inline-block w-2.5 h-1.5 bg-[#D9C0A8]" />
                    <span className="inline-block w-2.5 h-1.5 bg-[#A87B6C]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 Cols): Short, Clean Bio for Fatimah Ghani */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="text-[11px] font-sans font-medium uppercase tracking-[0.24em] text-[#945640] mb-2.5">
                04 / THE PERSON BEHIND THE PAGES
              </div>

              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#5D182B] leading-[1.04]">
                A little about the maker.
              </h2>

              <div className="font-serif italic text-2xl sm:text-[28px] tracking-[0.01em] text-[#945640] mt-2">
                Designer, collector of ideas &amp; keeper of TUMANEEN
              </div>
            </div>

            <p className="font-sans text-base sm:text-lg text-[#945640] leading-relaxed max-w-[52ch]">
              I’m Fatimah, a graphic designer drawn to the little details: how type feels, the stories objects carry, and the space between a first sketch and a finished piece. I make identities, packaging, interfaces and moving images with the same curiosity.
            </p>

            {/* Compact 2-Row Specs */}
            <div className="border-t border-b border-[#D9C0A8] divide-y divide-[#D9C0A8] text-xs sm:text-sm">
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A87B6C]">
                  FOCUS
                </span>
                <span className="font-serif italic text-base sm:text-lg font-medium text-[#5D182B]">
                  Brand Identity · Packaging · UI/UX · Motion
                </span>
              </div>
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A87B6C]">
                  TOOLKIT
                </span>
                <span className="font-serif italic text-base sm:text-lg font-medium text-[#5D182B]">
                  Affinity · Figma · Illustrator · After Effects
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onContactClick}
                className="px-6 py-3.5 sm:py-3 bg-[#5D182B] hover:bg-[#945640] text-[#F0E4D2] text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Work With Me</span>
                <ArrowDownRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-4 py-3.5 sm:py-3 bg-[#D9C0A8]/60 hover:bg-[#D9C0A8] text-[#5D182B] border border-[#A87B6C]/40 text-xs font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#945640] shrink-0" />
                <span className="truncate">{designerEmail}</span>
                {emailCopied ? (
                  <Check className="w-3.5 h-3.5 text-[#5D182B] shrink-0" />
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
