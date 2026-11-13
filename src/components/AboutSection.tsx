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
      className="tm-about relative pt-12 pb-16 md:pt-16 md:pb-20 bg-[#EFE6D6] text-[#24201D] overflow-hidden"
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

      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* LEFT COLUMN (5 Cols): Original Portfolio Print as an Editorial Plate */}
          <div className="lg:col-span-5">
            <div
              className="tm-about-plate group relative bg-[#945640] text-[#F0E4D2] p-5"
            >
              <figure className="tm-about-artwork">
                <div className="tm-about-artwork-window">
                  <img
                    src={String(import.meta.env.BASE_URL) + 'assets/aistudio/wajood_ac0f25c9.jpg'}
                    alt="Wajood, Fatimah Ghani's original Urdu poetic editorial poster"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption>Wajood · Urdu poster study</figcaption>
              </figure>

            </div>
          </div>

          {/* RIGHT COLUMN (7 Cols): Short, Clean Bio for Fatimah Ghani */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-display">About Fatimah</h2>
            <p className="font-sans text-base sm:text-lg leading-relaxed max-w-[46ch]">
              I’m Fatimah Ghani, a graphic designer. I make identities, packaging and posters shaped by type and culture.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onContactClick}
                className="px-6 py-3.5 sm:py-3 bg-[#5D182B] hover:bg-[#945640] text-[#F0E4D2] text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get in touch</span>
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
