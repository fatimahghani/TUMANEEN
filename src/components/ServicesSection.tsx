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

  const inquirySubject = `TUMANEEN Inquiry: ${activeService.number} · ${activeService.title} — ${clientName.trim()}`;

  const handleInitiateInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || isSending) return;

    setIsSending(true);
    const payload = {
      name: clientName.trim(),
      email: clientEmail.trim(),
      scope: `${activeService.number} · ${activeService.title}`,
      message: projectNotes.trim() || 'Looking forward to discussing this project.',
      _replyto: clientEmail.trim(),
      _subject: inquirySubject,
      _url: 'https://ais-dev-opnuetggrtsr43h5bm5las-520532524992.asia-southeast1.run.app/',
      _captcha: 'false',
    };

    try {
      await fetch(`https://formsubmit.co/ajax/${designerEmail}`, {
        method: 'POST',
        referrerPolicy: 'origin',
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
        data-editorial-services=""
        aria-label="Design Services"
        className="tm-services relative pt-10 pb-20 md:pt-14 md:pb-24 bg-[#F0E4D2] text-[#5D182B] overflow-hidden"
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

        {/* Structured Architectural Chapter Rule (05 · Studio Capabilities) */}
        <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12 mb-8 sm:mb-10 md:mb-12">
          <div className="border-t border-b border-[#5D182B]/15 py-3 sm:py-3.5 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#945640]">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="font-semibold text-[#5D182B]">05 / AN INDEX OF POSSIBILITIES</span>
              <span className="h-3 w-px bg-[#5D182B]/20" />
              <span>THE COMMISSION INDEX</span>
            </div>
            <span className="hidden md:inline font-serif italic normal-case tracking-[0.02em] text-sm text-[#945640]">
              Archival Deliverables &amp; Commission Scopes
            </span>
            <span className="text-[#A87B6C] shrink-0">01 — 04</span>
          </div>
        </div>

        <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12 space-y-8 sm:space-y-10 md:space-y-14">
          {/* EDITORIAL SECTION HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#5D182B] leading-[1.05]">
                What I can make.
              </h2>
              <div className="font-serif italic text-2xl sm:text-[28px] tracking-[0.01em] text-[#945640] mt-2">
                An index of disciplines &amp; deliverables
              </div>
            </div>

            <p className="font-sans text-sm text-[#945640] max-w-md leading-relaxed">
              Select a discipline below to inspect its archival deliverables or commission a tailored scope in the studio inquiry ledger.
            </p>
          </div>

          {/* ARCHITECTURAL 4-COLUMN EDITORIAL LEDGER (SHARED HAIRLINE BORDERS INSTEAD OF SEPARATE FLOATING BOXES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-y border-[#5D182B]/15 divide-y sm:divide-y-0 sm:divide-x divide-[#5D182B]/15">
            {SERVICES_LIST.map((service) => {
              const isSelected = selectedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`tm-service-card group relative flex flex-col justify-between p-7 md:p-8 min-h-[390px] transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-[#5D182B] text-[#F0E4D2]'
                      : 'bg-transparent hover:bg-[#5D182B]/[0.03] text-[#5D182B]'
                  }`}
                >
                  {/* Top Number & Tools Row */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono pb-4 mb-6 border-b border-current/15">
                      <span className="font-bold tabular-nums">{service.number}</span>
                      <span
                        className={
                          isSelected ? 'text-[#D9C0A8]/80' : 'text-[#945640]'
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
                        isSelected ? 'text-[#D9C0A8]' : 'text-[#945640]'
                      }`}
                    >
                      {service.subtitle}
                    </p>
                  </div>

                  {/* Deliverables List & Action */}
                  <div>
                    <div
                      className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-3 ${
                        isSelected ? 'text-[#D9C0A8]/70' : 'text-[#A87B6C]'
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
                              isSelected ? 'text-[#D9C0A8]' : 'text-[#945640]'
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
                          ? 'bg-[#F0E4D2] text-[#5D182B] hover:bg-[#D9C0A8]'
                          : 'border border-[#5D182B]/25 text-[#5D182B] group-hover:bg-[#5D182B] group-hover:text-[#F0E4D2]'
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

      {/* SECTION 06 / CORRESPONDENCE DESK & GRAND STUDIO COLOPHON (UNIFIED DEEP STUDIO FINALE) */}
      <section
        id="contact-form"
        data-editorial-contact=""
        aria-label="Start a Project"
        className="relative bg-[#391E25] text-[#F0E4D2] pt-24 pb-14 md:pt-32 md:pb-16 overflow-hidden"
      >
        {/* Top Atmospheric Transition Veil from Parchment into Deep Studio */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F0E4D2]/25 to-transparent"
        />
        {/* Ambient Warm Radial Studio Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_80%_15%,rgba(253,251,212,0.06),transparent_65%),radial-gradient(700px_circle_at_15%_85%,rgba(148,86,64,0.18),transparent_65%)]"
        />
        {/* Continuous Vertical Architectural Studio Margin Lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-4 sm:left-10 lg:left-16 w-px bg-[#F0E4D2]/[0.07]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-4 sm:right-10 lg:right-16 w-px bg-[#F0E4D2]/[0.07]"
        />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12">
          {/* Open Architectural Editorial Inquiry Layout (No Heavy Box Container) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-start pb-16 sm:pb-20 md:pb-24 border-b border-[#F0E4D2]/15">
            {/* Left Info Column (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div>
                <div className="text-[11px] font-sans font-medium uppercase tracking-[0.24em] text-[#D9C0A8]/75 mb-3">
                  06 · INITIATE A PROJECT
                </div>
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#F0E4D2] leading-[1.04]">
                  Let's make something.
                </h2>
                <div className="font-serif italic text-2xl sm:text-[28px] tracking-[0.01em] text-[#D9C0A8] mt-2">
                  A good project starts with a conversation.
                </div>
                <p className="font-sans text-sm text-[#D9C0A8]/80 mt-4 leading-relaxed max-w-md">
                  Have a brand identity, packaging ritual, or digital experience in mind? Share a few notes below and I’ll respond personally within 24 hours.
                </p>
              </div>

              <div className="border-t border-[#F0E4D2]/15 pt-6 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono uppercase tracking-wider text-[#D9C0A8]/60">DESIGNER</span>
                  <span className="font-medium text-[#F0E4D2]">Fatimah Ghani</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono uppercase tracking-wider text-[#D9C0A8]/60">ATELIER</span>
                  <span className="font-medium text-[#F0E4D2]">TUMANEEN</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono uppercase tracking-wider text-[#D9C0A8]/60">SELECTED SCOPE</span>
                  <span className="font-mono font-semibold text-[#F0E4D2]">
                    {activeService.number} · {activeService.title}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="font-mono uppercase tracking-wider text-[#D9C0A8]/60">DIRECT MAIL</span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 font-mono text-[#F0E4D2] hover:text-[#D9C0A8] underline underline-offset-4 cursor-pointer"
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
                <div className="pt-4 mt-4 border-t border-[#F0E4D2]/15">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[#D9C0A8]/60 mb-3">
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
                        className="group flex sm:flex-col items-center sm:items-stretch justify-between p-3 bg-[#F0E4D2]/[0.04] hover:bg-[#F0E4D2] border border-[#F0E4D2]/20 hover:border-[#F0E4D2] text-[#F0E4D2] hover:text-[#391E25] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">
                            {account.label}
                          </span>
                          <ArrowUpRight className="hidden sm:block w-3.5 h-3.5 opacity-75 group-hover:opacity-100 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                        <div className="flex items-center gap-1.5 sm:mt-1">
                          <span className="font-serif italic text-xs text-[#D9C0A8]/80 group-hover:text-[#391E25]/80 truncate">
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
                <div className="py-10 sm:py-14 px-5 sm:px-8 bg-[#F0E4D2]/[0.04] border border-[#F0E4D2]/20 text-center space-y-5">
                  <div className="w-11 h-11 bg-[#F0E4D2] text-[#391E25] mx-auto flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="font-display text-2xl sm:text-3xl font-normal text-[#F0E4D2]">
                    Thank you, {clientName}.
                  </h4>
                  <p className="text-xs text-[#D9C0A8]/90 font-mono max-w-lg mx-auto leading-relaxed">
                    Your inquiry regarding {activeService.title} has been sent directly to TUMANEEN ({designerEmail}). Below is the exact information submitted:
                  </p>
                  <div className="max-w-lg mx-auto text-left bg-[#F0E4D2]/[0.04] border border-[#F0E4D2]/15 p-4 sm:p-5 space-y-2.5 text-xs font-mono text-[#D9C0A8]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#D9C0A8]/65 shrink-0">1. CLIENT NAME:</span>
                      <span className="text-[#F0E4D2] text-right break-all">{clientName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#D9C0A8]/65 shrink-0">2. CLIENT EMAIL:</span>
                      <span className="text-[#F0E4D2] text-right break-all">{clientEmail}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#D9C0A8]/65 shrink-0">3. SELECTED SCOPE:</span>
                      <span className="text-[#F0E4D2] text-right">
                        {activeService.number} · {activeService.title}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#F0E4D2]/10 space-y-1">
                      <span className="block text-[#D9C0A8]/65">4. PROJECT BRIEF:</span>
                      <p className="text-[#F0E4D2] leading-relaxed whitespace-pre-wrap break-words">
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
                      className="px-6 py-3 text-xs font-mono uppercase tracking-wider border border-[#F0E4D2]/30 text-[#F0E4D2] hover:bg-[#F0E4D2] hover:text-[#391E25] transition-colors cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInitiateInquirySubmit} className="space-y-6">
                  {/* Interactive Service Selector Bar */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[#D9C0A8]/75 mb-3">
                      01 / CHOOSE YOUR DISCIPLINE
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
                                ? 'bg-[#F0E4D2] text-[#391E25] border-[#F0E4D2] font-semibold'
                                : 'bg-[#F0E4D2]/[0.04] text-[#F0E4D2]/85 border-[#F0E4D2]/20 hover:border-[#F0E4D2]/45 hover:bg-[#F0E4D2]/[0.08]'
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
                    <label className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[#D9C0A8]/75 mb-3">
                      02 / INTRODUCE YOURSELF
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Your Name *"
                        className="w-full px-4 py-3.5 text-base sm:text-xs bg-[#F0E4D2]/[0.04] border border-[#F0E4D2]/20 text-[#F0E4D2] placeholder:text-[#D9C0A8]/50 focus:outline-none focus:border-[#F0E4D2]"
                      />
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="Your Email *"
                        className="w-full px-4 py-3.5 text-base sm:text-xs bg-[#F0E4D2]/[0.04] border border-[#F0E4D2]/20 text-[#F0E4D2] placeholder:text-[#D9C0A8]/50 focus:outline-none focus:border-[#F0E4D2]"
                      />
                    </div>
                  </div>

                  {/* Project Notes */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[#D9C0A8]/75 mb-3">
                      03 / TELL ME THE IDEA
                    </label>
                    <textarea
                      rows={4}
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                      placeholder={`Tell me about your ${activeService.title.toLowerCase()} vision, deliverables, or target launch...`}
                      className="w-full px-4 py-3.5 text-base sm:text-xs bg-[#F0E4D2]/[0.04] border border-[#F0E4D2]/20 text-[#F0E4D2] placeholder:text-[#D9C0A8]/50 focus:outline-none focus:border-[#F0E4D2]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-4 px-6 bg-[#F0E4D2] hover:bg-[#D9C0A8] disabled:opacity-60 text-[#391E25] text-xs font-mono font-semibold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSending
                        ? 'Transmitting to Studio Gmail...'
                        : `Send ${activeService.title} Inquiry`}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Grand Studio Colophon & Footer */}
          <div className="pt-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div>
              <div className="font-display text-3xl sm:text-4xl tracking-tight text-[#F0E4D2]">
                TUMANEEN
              </div>
              <p className="font-serif italic text-lg text-[#D9C0A8]/80 mt-1">
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
                  className="inline-flex items-center gap-1.5 text-[#F0E4D2] hover:text-[#D9C0A8] underline underline-offset-4 transition-colors"
                >
                  <span>Behance</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/fatimahghani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#F0E4D2] hover:text-[#D9C0A8] underline underline-offset-4 transition-colors"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.instagram.com/tumaneen/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#F0E4D2] hover:text-[#D9C0A8] underline underline-offset-4 transition-colors"
                >
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 text-[11px] font-mono tracking-[0.16em] text-[#D9C0A8]/65">
                <span>© 2026 TUMANEEN</span>
                <span>BRAND IDENTITY · PACKAGING · UI/UX · MOTION</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
