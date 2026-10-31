import React, { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Mail,
  Send,
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tools: string;
  deliverables: string[];
}

const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'brand-identity',
    number: '01',
    title: 'Brand Identity',
    subtitle: 'Complete visual systems that make your brand unmistakable.',
    tools: 'Illustrator · Affinity',
    deliverables: [
      'Primary & Secondary Logos',
      'Color Palette & Type System',
      'Brand Guidelines Book',
      'Social & Stationery Kit',
    ],
  },
  {
    id: 'packaging-design',
    number: '02',
    title: 'Packaging Design',
    subtitle: 'Tactile labels, boxes, and print-ready dielines that stand out.',
    tools: 'Illustrator · Dimension',
    deliverables: [
      'Box & Bottle Labels',
      'Print-Ready Dielines',
      'Material & Finish Specs',
      '3D Product Mockups',
    ],
  },
  {
    id: 'ui-ux-design',
    number: '03',
    title: 'UI/UX Design',
    subtitle: 'Clean, intuitive websites and app interfaces designed for clarity.',
    tools: 'Figma · Prototyping',
    deliverables: [
      'Website & Landing Pages',
      'Mobile & Web App Screens',
      'Interactive Figma Prototypes',
      'Component Design Systems',
    ],
  },
  {
    id: 'motion-graphics',
    number: '04',
    title: 'Motion Graphics',
    subtitle: 'Expressive animations that bring logos and campaigns to life.',
    tools: 'After Effects · Figma',
    deliverables: [
      'Animated Logo Reveals',
      'Social Media Reels & Loops',
      'UI Micro-Interactions',
      'Launch Promo Videos',
    ],
  },
];

interface ServicesSectionProps {
  clientName: string;
  setClientName: (val: string) => void;
  clientEmail: string;
  setClientEmail: (val: string) => void;
  projectNotes: string;
  setProjectNotes: (val: string) => void;
  inquirySubmitted: boolean;
  setInquirySubmitted: (val: boolean) => void;
  onSubmitInquiry: (e: React.FormEvent) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  clientName,
  setClientName,
  clientEmail,
  setClientEmail,
  projectNotes,
  setProjectNotes,
  inquirySubmitted,
  setInquirySubmitted,
  onSubmitInquiry,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('brand-identity');
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const designerEmail = 'naqloonstudio@gmail.com';

  const handleSelectService = (service: ServiceItem) => {
    setSelectedServiceId(service.id);
    const contactEl = document.getElementById('contact-form');
    contactEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(designerEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 1800);
  };

  const activeService =
    SERVICES_LIST.find((s) => s.id === selectedServiceId) || SERVICES_LIST[0];

  const inquirySubject = `Naqloom Studio Inquiry: ${activeService.number} · ${activeService.title} — ${clientName.trim()}`;

  const handleInitiateInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || isSending) return;

    setIsSending(true);
    const payload = {
      Client_Name: clientName.trim(),
      Client_Email: clientEmail.trim(),
      Selected_Scope: `${activeService.number} · ${activeService.title}`,
      Project_Brief: projectNotes.trim() || 'Looking forward to discussing this project.',
      name: clientName.trim(),
      email: clientEmail.trim(),
      _replyto: clientEmail.trim(),
      _subject: inquirySubject,
      _template: 'table',
      _captcha: 'false',
    };

    try {
      await fetch(`https://formsubmit.co/ajax/${designerEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // Handled gracefully by confirmation state
    } finally {
      setIsSending(false);
      onSubmitInquiry(e);
    }
  };

  return (
    <>
      {/* SECTION 05 · DESIGN CAPABILITIES (SEAMLESS ARCHIVAL PARCHMENT FLOW FROM ABOUT SECTION) */}
      <section
        id="services"
        aria-label="Design Services"
        className="relative pt-10 pb-20 md:pt-14 md:pb-24 bg-[#FDFBD4] text-[#18383C] overflow-hidden"
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

        {/* Structured Architectural Chapter Rule (05 · Studio Capabilities) */}
        <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12 mb-8 sm:mb-10 md:mb-12">
          <div className="border-t border-b border-[#18383C]/15 py-3 sm:py-3.5 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#545333]">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="font-semibold text-[#18383C]">05 / 06</span>
              <span className="h-3 w-px bg-[#18383C]/20" />
              <span>STUDIO CAPABILITIES</span>
            </div>
            <span className="hidden md:inline font-serif italic normal-case tracking-[0.02em] text-sm text-[#545333]">
              Archival Deliverables &amp; Commission Scopes
            </span>
            <span className="text-[#878672] shrink-0">01 — 04</span>
          </div>
        </div>

        <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12 space-y-8 sm:space-y-10 md:space-y-14">
          {/* EDITORIAL SECTION HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#18383C] leading-[1.05]">
                Design Capabilities
              </h2>
              <div className="font-serif italic text-2xl sm:text-[28px] tracking-[0.01em] text-[#545333] mt-2">
                Clear deliverables, crafted with care
              </div>
            </div>

            <p className="font-sans text-sm text-[#545333] max-w-md leading-relaxed">
              Select a discipline below to inspect its archival deliverables or commission a tailored scope in the studio inquiry ledger.
            </p>
          </div>

          {/* ARCHITECTURAL 4-COLUMN EDITORIAL LEDGER (SHARED HAIRLINE BORDERS INSTEAD OF SEPARATE FLOATING BOXES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-y border-[#18383C]/15 divide-y sm:divide-y-0 sm:divide-x divide-[#18383C]/15">
            {SERVICES_LIST.map((service) => {
              const isSelected = selectedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`group relative flex flex-col justify-between p-7 md:p-8 min-h-[390px] transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-[#18383C] text-[#FDFBD4]'
                      : 'bg-transparent hover:bg-[#18383C]/[0.03] text-[#18383C]'
                  }`}
                >
                  {/* Top Number & Tools Row */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono pb-4 mb-6 border-b border-current/15">
                      <span className="font-bold tabular-nums">{service.number}</span>
                      <span
                        className={
                          isSelected ? 'text-[#D9D7B6]/80' : 'text-[#545333]'
                        }
                      >
                        {service.tools}
                      </span>
                    </div>

                    {/* Service Title & Short Description */}
                    <h3 className="font-display text-2xl md:text-[26px] font-semibold tracking-tight mb-2.5">
                      {service.title}
                    </h3>
                    <p
                      className={`font-serif italic text-lg leading-snug mb-6 ${
                        isSelected ? 'text-[#D9D7B6]' : 'text-[#545333]'
                      }`}
                    >
                      {service.subtitle}
                    </p>
                  </div>

                  {/* Deliverables List & Action */}
                  <div>
                    <div
                      className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-3 ${
                        isSelected ? 'text-[#D9D7B6]/70' : 'text-[#878672]'
                      }`}
                    >
                      Included Deliverables
                    </div>
                    <ul className="space-y-2.5 mb-8">
                      {service.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-xs leading-snug"
                        >
                          <span
                            className={`font-mono select-none ${
                              isSelected ? 'text-[#D9D7B6]' : 'text-[#545333]'
                            }`}
                          >
                            —
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectService(service);
                      }}
                      className={`w-full py-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#FDFBD4] text-[#18383C] hover:bg-[#D9D7B6]'
                          : 'border border-[#18383C]/25 text-[#18383C] group-hover:bg-[#18383C] group-hover:text-[#FDFBD4]'
                      }`}
                    >
                      <span>Commission {service.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 06 · INITIATE A PROJECT & GRAND STUDIO COLOPHON (UNIFIED DEEP STUDIO FINALE) */}
      <section
        id="contact-form"
        aria-label="Start a Project"
        className="relative bg-[#122629] text-[#FDFBD4] pt-24 pb-14 md:pt-32 md:pb-16 overflow-hidden"
      >
        {/* Top Atmospheric Transition Veil from Parchment into Deep Studio */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FDFBD4]/25 to-transparent"
        />
        {/* Ambient Warm Radial Studio Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_80%_15%,rgba(253,251,212,0.06),transparent_65%),radial-gradient(700px_circle_at_15%_85%,rgba(84,83,51,0.18),transparent_65%)]"
        />
        {/* Continuous Vertical Architectural Studio Margin Lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-4 sm:left-10 lg:left-16 w-px bg-[#FDFBD4]/[0.07]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-4 sm:right-10 lg:right-16 w-px bg-[#FDFBD4]/[0.07]"
        />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12">
          {/* Open Architectural Editorial Inquiry Layout (No Heavy Box Container) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-start pb-16 sm:pb-20 md:pb-24 border-b border-[#FDFBD4]/15">
            {/* Left Info Column (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div>
                <div className="text-[11px] font-sans font-medium uppercase tracking-[0.24em] text-[#D9D7B6]/75 mb-3">
                  06 · INITIATE A PROJECT
                </div>
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#FDFBD4] leading-[1.04]">
                  Start a Project
                </h2>
                <div className="font-serif italic text-2xl sm:text-[28px] tracking-[0.01em] text-[#D9D7B6] mt-2">
                  Let’s build something timeless together
                </div>
                <p className="font-sans text-sm text-[#D9D7B6]/80 mt-4 leading-relaxed max-w-md">
                  Have a brand identity, packaging ritual, or digital experience in mind? Share a few notes below and I’ll respond personally within 24 hours.
                </p>
              </div>

              <div className="border-t border-[#FDFBD4]/15 pt-6 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono uppercase tracking-wider text-[#D9D7B6]/60">DESIGNER</span>
                  <span className="font-medium text-[#FDFBD4]">Fatimah Ghani</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono uppercase tracking-wider text-[#D9D7B6]/60">ATELIER</span>
                  <span className="font-medium text-[#FDFBD4]">Naqloom Studio</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono uppercase tracking-wider text-[#D9D7B6]/60">SELECTED SCOPE</span>
                  <span className="font-mono font-semibold text-[#FDFBD4]">
                    {activeService.number} · {activeService.title}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="font-mono uppercase tracking-wider text-[#D9D7B6]/60">DIRECT MAIL</span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 font-mono text-[#FDFBD4] hover:text-[#D9D7B6] underline underline-offset-4 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{designerEmail}</span>
                    {emailCopied ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-70 shrink-0" />
                    )}
                  </button>
                </div>

                {/* Social & Portfolio Channels in Inquiry Ledger */}
                <div className="pt-4 mt-4 border-t border-[#FDFBD4]/15">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[#D9D7B6]/60 mb-3">
                    SOCIAL &amp; PORTFOLIO CHANNELS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        label: 'Behance',
                        handle: '@fatimahghani',
                        href: 'https://www.behance.net/fatimahghani',
                      },
                      {
                        label: 'LinkedIn',
                        handle: '/in/fatimahghani',
                        href: 'https://www.linkedin.com/in/fatimahghani/',
                      },
                      {
                        label: 'Instagram',
                        handle: '@tumaneen',
                        href: 'https://www.instagram.com/tumaneen/',
                      },
                    ].map((account) => (
                      <a
                        key={account.label}
                        href={account.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex sm:flex-col items-center sm:items-stretch justify-between p-3 bg-[#FDFBD4]/[0.04] hover:bg-[#FDFBD4] border border-[#FDFBD4]/20 hover:border-[#FDFBD4] text-[#FDFBD4] hover:text-[#122629] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">
                            {account.label}
                          </span>
                          <ArrowUpRight className="hidden sm:block w-3.5 h-3.5 opacity-75 group-hover:opacity-100 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                        <div className="flex items-center gap-1.5 sm:mt-1">
                          <span className="font-serif italic text-xs text-[#D9D7B6]/80 group-hover:text-[#122629]/80 truncate">
                            {account.handle}
                          </span>
                          <ArrowUpRight className="sm:hidden w-3.5 h-3.5 opacity-75 group-hover:opacity-100" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Column (7 Cols) */}
            <div className="lg:col-span-7">
              {inquirySubmitted ? (
                <div className="py-10 sm:py-14 px-5 sm:px-8 bg-[#FDFBD4]/[0.04] border border-[#FDFBD4]/20 text-center space-y-5">
                  <div className="w-11 h-11 bg-[#FDFBD4] text-[#122629] mx-auto flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="font-display text-2xl sm:text-3xl font-normal text-[#FDFBD4]">
                    Thank you, {clientName}.
                  </h4>
                  <p className="text-xs text-[#D9D7B6]/90 font-mono max-w-lg mx-auto leading-relaxed">
                    Your inquiry regarding {activeService.title} has been sent directly to Naqloom Studio ({designerEmail}). Below is the exact information submitted:
                  </p>
                  <div className="max-w-lg mx-auto text-left bg-[#FDFBD4]/[0.04] border border-[#FDFBD4]/15 p-4 sm:p-5 space-y-2.5 text-xs font-mono text-[#D9D7B6]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#D9D7B6]/65 shrink-0">1. CLIENT NAME:</span>
                      <span className="text-[#FDFBD4] text-right break-all">{clientName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#D9D7B6]/65 shrink-0">2. CLIENT EMAIL:</span>
                      <span className="text-[#FDFBD4] text-right break-all">{clientEmail}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#D9D7B6]/65 shrink-0">3. SELECTED SCOPE:</span>
                      <span className="text-[#FDFBD4] text-right">
                        {activeService.number} · {activeService.title}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#FDFBD4]/10 space-y-1">
                      <span className="block text-[#D9D7B6]/65">4. PROJECT BRIEF:</span>
                      <p className="text-[#FDFBD4] leading-relaxed whitespace-pre-wrap break-words">
                        {projectNotes.trim() || 'Looking forward to discussing this project.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInquirySubmitted(false);
                        setClientName('');
                        setClientEmail('');
                        setProjectNotes('');
                      }}
                      className="px-6 py-3 text-xs font-mono uppercase tracking-wider border border-[#FDFBD4]/30 text-[#FDFBD4] hover:bg-[#FDFBD4] hover:text-[#122629] transition-colors cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInitiateInquirySubmit} className="space-y-6">
                  {/* Interactive Service Selector Bar */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[#D9D7B6]/75 mb-3">
                      01 · Select Commission Scope
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {SERVICES_LIST.map((srv) => {
                        const active = selectedServiceId === srv.id;
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => setSelectedServiceId(srv.id)}
                            className={`px-3.5 py-3 text-xs font-mono text-left transition-colors border cursor-pointer truncate ${
                              active
                                ? 'bg-[#FDFBD4] text-[#122629] border-[#FDFBD4] font-semibold'
                                : 'bg-[#FDFBD4]/[0.04] text-[#FDFBD4]/85 border-[#FDFBD4]/20 hover:border-[#FDFBD4]/45 hover:bg-[#FDFBD4]/[0.08]'
                            }`}
                          >
                            {srv.number} · {srv.title.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[#D9D7B6]/75 mb-3">
                      02 · Your Coordinates
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Your Name *"
                        className="w-full px-4 py-3.5 text-base sm:text-xs bg-[#FDFBD4]/[0.04] border border-[#FDFBD4]/20 text-[#FDFBD4] placeholder:text-[#D9D7B6]/50 focus:outline-none focus:border-[#FDFBD4]"
                      />
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="Your Email *"
                        className="w-full px-4 py-3.5 text-base sm:text-xs bg-[#FDFBD4]/[0.04] border border-[#FDFBD4]/20 text-[#FDFBD4] placeholder:text-[#D9D7B6]/50 focus:outline-none focus:border-[#FDFBD4]"
                      />
                    </div>
                  </div>

                  {/* Project Notes */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[#D9D7B6]/75 mb-3">
                      03 · Project Brief &amp; Timeline
                    </label>
                    <textarea
                      rows={4}
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                      placeholder={`Tell me about your ${activeService.title.toLowerCase()} vision, deliverables, or target launch...`}
                      className="w-full px-4 py-3.5 text-base sm:text-xs bg-[#FDFBD4]/[0.04] border border-[#FDFBD4]/20 text-[#FDFBD4] placeholder:text-[#D9D7B6]/50 focus:outline-none focus:border-[#FDFBD4]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-4 px-6 bg-[#FDFBD4] hover:bg-[#D9D7B6] disabled:opacity-60 text-[#122629] text-xs font-mono font-semibold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSending
                        ? 'Transmitting to Studio Gmail...'
                        : `Transmit ${activeService.title} Inquiry`}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Grand Studio Colophon & Footer */}
          <div className="pt-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div>
              <div className="font-display text-3xl sm:text-4xl tracking-tight text-[#FDFBD4]">
                NAQLOOM STUDIO
              </div>
              <p className="font-serif italic text-lg text-[#D9D7B6]/80 mt-1">
                Brand worlds, tactile packaging, and visual storytelling by Fatimah Ghani.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4">
              {/* Direct Social & Portfolio Links in Colophon */}
              <div className="flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-[0.2em]">
                <a
                  href="https://www.behance.net/fatimahghani"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#FDFBD4] hover:text-[#D9D7B6] underline underline-offset-4 transition-colors"
                >
                  <span>Behance</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/fatimahghani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#FDFBD4] hover:text-[#D9D7B6] underline underline-offset-4 transition-colors"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.instagram.com/tumaneen/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#FDFBD4] hover:text-[#D9D7B6] underline underline-offset-4 transition-colors"
                >
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 text-[11px] font-mono tracking-[0.16em] text-[#D9D7B6]/65">
                <span>© 2026 NAQLOOM STUDIO</span>
                <span>BRAND IDENTITY · PACKAGING · UI/UX · MOTION</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
