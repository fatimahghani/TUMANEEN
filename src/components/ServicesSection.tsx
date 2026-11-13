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
  summary: string;
  shortTitle: string;
}

const SERVICES_LIST: ServiceItem[] = [
  { id: 'brand-identity', number: '01', title: 'Brand Identity', shortTitle: 'Branding',
    summary: 'Logos, palettes and type systems with guidelines for everyday use.' },
  { id: 'packaging-design', number: '02', title: 'Packaging Design', shortTitle: 'Packaging',
    summary: 'Labels, boxes and print-ready dielines.' },
  { id: 'ui-ux-design', number: '03', title: 'UI/UX Design', shortTitle: 'UI/UX',
    summary: 'Websites, app screens and interactive prototypes.' },
  { id: 'motion-graphics', number: '04', title: 'Motion Graphics', shortTitle: 'Motion',
    summary: 'Animated identities, social loops and interface details.' },
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
      <section
        id="services"
        data-editorial-services=""
        aria-label="Design Services"
        className="tm-services relative pt-10 pb-20 md:pt-14 md:pb-24 bg-[#EFE6D6] text-[#24201D] overflow-hidden"
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
          <h2 className="font-display mb-6">Services</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-y border-[#5D182B]/15 divide-y sm:divide-y-0 sm:divide-x divide-[#5D182B]/15">
            {SERVICES_LIST.map((service) => {
              const isSelected = selectedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  data-selected={isSelected}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`tm-service-card group relative flex flex-col justify-between gap-6 p-6 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-[#5D182B] text-[#F0E4D2]'
                      : 'bg-transparent hover:bg-[#5D182B]/[0.03] text-[#5D182B]'
                  }`}
                >
                  <div>
                    <h3 className="font-display">{service.title}</h3>
                    <p className="tm-service-summary text-sm leading-relaxed mt-3">{service.summary}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Inquire about ${service.title}`}
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
                    <span>Inquire</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="contact-form"
        data-editorial-contact=""
        aria-labelledby="tm-contact-title"
        className="relative pt-16 pb-12 md:pt-20 overflow-hidden"
      >
        <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-10 border-b">
            <div className="lg:col-span-5">
              <h2 id="tm-contact-title" className="font-display">Start a project</h2>
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label={emailCopied ? 'Email copied' : 'Copy ' + designerEmail}
                className="tm-contact-email inline-flex items-center gap-2 mt-4 text-sm underline underline-offset-4"
              >
                <Mail size={15} aria-hidden="true" />
                {designerEmail}
                {emailCopied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              </button>
            </div>

            <div className="lg:col-span-7">
              {inquirySubmitted ? (
                <div className="tm-inquiry-confirmation border p-5 sm:p-8 space-y-4">
                  <h3 className="font-display">Thank you, {clientName}.</h3>
                  <dl className="space-y-2 text-sm">
                    <div><dt>Reply to</dt><dd>{clientEmail}</dd></div>
                    <div><dt>Project type</dt><dd>{activeService.title}</dd></div>
                    {projectNotes.trim() && (
                      <div><dt>Project brief</dt><dd className="whitespace-pre-wrap break-words">{projectNotes}</dd></div>
                    )}
                  </dl>
                  <button
                    type="button"
                    onClick={() => {
                      setInquirySubmitted(false);
                      setClientName('');
                      setClientEmail('');
                      setProjectNotes('');
                    }}
                    className="px-4 py-3 text-xs border"
                  >
                    Write another note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInitiateInquirySubmit} className="space-y-6">
                  <fieldset>
                    <legend className="mb-2">Project type</legend>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SERVICES_LIST.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          aria-pressed={selectedServiceId === service.id}
                          onClick={() => setSelectedServiceId(service.id)}
                          className="px-3 py-3 text-sm border"
                        >
                          {service.shortTitle}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tm-client-name" className="block mb-2">Name</label>
                      <input
                        id="tm-client-name"
                        type="text"
                        autoComplete="name"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-4 py-3 text-base border"
                      />
                    </div>
                    <div>
                      <label htmlFor="tm-client-email" className="block mb-2">Email</label>
                      <input
                        id="tm-client-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-4 py-3 text-base border"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="tm-project-brief" className="block mb-2">Project brief (optional)</label>
                    <textarea
                      id="tm-project-brief"
                      rows={4}
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                      placeholder="What do you have in mind?"
                      className="w-full px-4 py-3 text-base border"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3 px-6 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Send size={14} aria-hidden="true" />
                    {isSending ? 'Sending…' : 'Send inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <footer className="tm-contact-footer flex flex-wrap items-center justify-between gap-4 pt-6">
            <span className="text-xs">© 2026 TUMANEEN</span>
            <div className="flex flex-wrap gap-5 text-sm">
              {[
                ['Behance', 'https://www.behance.net/fatimahghani'],
                ['LinkedIn', 'https://www.linkedin.com/in/fatimahghani/'],
                ['Instagram', 'https://www.instagram.com/tumaneen/'],
              ].map(([name, href]) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline underline-offset-4">
                  {name}<ArrowUpRight size={13} aria-hidden="true" />
                </a>
              ))}
            </div>
          </footer>
        </div>
      </section>
    </>
  );
};
