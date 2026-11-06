/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  PORTFOLIO_PROJECTS,
  ProjectDiscipline,
} from './data/portfolioData';
import { CaseStudyModal } from './components/CaseStudyModal';
import { ReadingNookHero } from './components/ReadingNookHero';
import { EditorialBridge } from './components/EditorialBridge';
import './EditorialSystem.css';
import { ProcessSection } from './components/ProcessSection';
import { ProjectsSection } from './components/ProjectsSection';
import { PosterSection } from './components/PosterSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';

type NavSectionId = 'home' | 'project' | 'about' | 'services' | 'posters' | 'process' | 'contact-form';

export default function App() {
  const [activeNav, setActiveNav] = useState<'home' | 'posters' | 'project' | 'process' | 'about' | 'services'>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAllProjectsOpen, setIsAllProjectsOpen] = useState<boolean>(false);
  const [showFloatingHeader, setShowFloatingHeader] = useState<boolean>(false);

  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [projectNotes, setProjectNotes] = useState<string>('');
  const [inquirySubmitted, setInquirySubmitted] = useState<boolean>(false);

  // Brief ink-page transition when navigating between editorial chapters
  const [activeTransitionKey, setActiveTransitionKey] = useState<number | null>(null);
  const [revealedSection, setRevealedSection] = useState<{
    id: string;
    key: number;
  } | null>(null);
  const transitionTimersRef = useRef<number[]>([]);

  const clearTransitionTimers = useCallback(() => {
    transitionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    transitionTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTransitionTimers();
  }, [clearTransitionTimers]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowFloatingHeader(y > window.innerHeight * 0.65);

      // Keep active top-header indicator synced with scroll position
      const sections: Array<{ id: 'home' | 'posters' | 'project' | 'process' | 'about' | 'services'; el: HTMLElement | null }> = [
        { id: 'home', el: document.getElementById('home') },
        { id: 'posters', el: document.getElementById('posters') },
        { id: 'project', el: document.getElementById('project') },
        { id: 'process', el: document.getElementById('process') },
        { id: 'about', el: document.getElementById('about') },
        { id: 'services', el: document.getElementById('services') },
      ];
      const viewportMid = window.scrollY + window.innerHeight * 0.38;
      for (let i = sections.length - 1; i >= 0; i--) {
        const item = sections[i];
        if (item.el && item.el.offsetTop <= viewportMid) {
          setActiveNav(item.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeModalProject = useMemo(
    () => PORTFOLIO_PROJECTS.find((p) => p.id === selectedProjectId) || null,
    [selectedProjectId]
  );

  const handleNextModalProject = () => {
    if (!selectedProjectId) return;
    const idx = PORTFOLIO_PROJECTS.findIndex((p) => p.id === selectedProjectId);
    const nextIdx = (idx + 1) % PORTFOLIO_PROJECTS.length;
    setSelectedProjectId(PORTFOLIO_PROJECTS[nextIdx].id);
  };

  const handlePrevModalProject = () => {
    if (!selectedProjectId) return;
    const idx = PORTFOLIO_PROJECTS.findIndex((p) => p.id === selectedProjectId);
    const prevIdx = (idx - 1 + PORTFOLIO_PROJECTS.length) % PORTFOLIO_PROJECTS.length;
    setSelectedProjectId(PORTFOLIO_PROJECTS[prevIdx].id);
  };

  const scrollToSection = useCallback(
    (sectionId: NavSectionId) => {
      if (
        sectionId === 'home' ||
        sectionId === 'project' ||
        sectionId === 'posters' ||
        sectionId === 'process' ||
        sectionId === 'about' ||
        sectionId === 'services'
      ) {
        setActiveNav(sectionId);
      } else if (sectionId === 'contact-form') {
        setActiveNav('services');
      }

      clearTransitionTimers();
      const transitionKey = Date.now();
      setActiveTransitionKey(transitionKey);

      // Snap to target section immediately as the center-outward reveal begins
      const scrollTimer = window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top, behavior: 'auto' });
        }
        const wrapperId = sectionId === 'contact-form' ? 'services' : sectionId;
        setRevealedSection({ id: wrapperId, key: transitionKey });
      }, 16);

      // Clear overlay right after the quick center reveal completes
      const endTimer = window.setTimeout(() => {
        setActiveTransitionKey(null);
      }, 310);

      const clearRevealTimer = window.setTimeout(() => {
        setRevealedSection(null);
      }, 420);

      transitionTimersRef.current.push(scrollTimer, endTimer, clearRevealTimer);
    },
    [clearTransitionTimers]
  );

  const handleSelectScopeFromModal = (discipline: ProjectDiscipline, projectTitle: string) => {
    setSelectedProjectId(null);
    setProjectNotes(`Inquiring about a ${discipline} project similar to "${projectTitle}".`);
    scrollToSection('contact-form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim()) return;
    setInquirySubmitted(true);
  };

  return (
    <div className="tm-site min-h-screen flex flex-col">
      {/* A short printed-page flick, without the previous cinematic flash. */}
      <AnimatePresence>
        {activeTransitionKey !== null && (
          <motion.div
            key={activeTransitionKey}
            initial={{ opacity: 0.62, scaleX: 0.02 }}
            animate={{ opacity: 0, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1] }}
            className="tm-page-turn-flash fixed inset-0 z-[950] pointer-events-none origin-left"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* PERSISTENT ARCHITECTURAL STUDIO HEADER ON SCROLL */}
      <header
        aria-label="Site header" data-editorial-nav="true"
        className={`fixed top-0 inset-x-0 z-[700] transition-all duration-500 ${
          showFloatingHeader && !selectedProjectId
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        <div className="tm-floating-surface relative bg-[#4B2830] text-[#EFE6D6] border-b border-[#F0E4D2]/15">
          <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
            {/* Left Brand Identity Lockup */}
            <button
              type="button"
              onClick={() => scrollToSection('home')}
              className="group flex items-center gap-3 text-left cursor-pointer shrink-0"
            >
              <span className="font-display text-sm sm:text-[17px] text-[#F0E4D2] group-hover:text-[#D9C0A8] transition-colors">
                tumaneen.
              </span>
              <span className="hidden sm:inline-block h-3.5 w-px bg-[#F0E4D2]/20" />
              <span className="hidden lg:inline-block font-serif italic text-xs tracking-[0.04em] text-[#D9C0A8]/75">
                Fatimah Ghani
              </span>
            </button>

            {/* Center Editorial Section Index (Desktop & Tablet) */}
            <nav aria-label="Floating navigation" className="hidden md:flex items-center gap-6 lg:gap-8">
              {(
                [
                  { id: 'home', label: 'Home' },
                  { id: 'posters', label: 'Posters' },
                  { id: 'project', label: 'Selected Work' },
                  { id: 'process', label: 'Process' },
                  { id: 'about', label: 'About' },
                  { id: 'services', label: 'Services' },
                ] as const
              ).map((item) => {
                const isCurrent = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`group relative py-1 font-sans font-medium text-[11px] tracking-[0.18em] uppercase transition-colors cursor-pointer whitespace-nowrap ${
                      isCurrent ? 'text-[#F0E4D2]' : 'text-[#F0E4D2]/75 hover:text-[#F0E4D2]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`absolute inset-x-0 -bottom-0.5 h-px bg-[#F0E4D2] transition-transform origin-left duration-300 ${
                        isCurrent ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Right Studio Inquiry Action */}
            <button
              type="button"
              onClick={() => scrollToSection('contact-form')}
              className="group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F0E4D2] text-[#391E25] hover:bg-[#D9C0A8] transition-colors cursor-pointer shrink-0"
            >
              <span className="font-sans font-semibold text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.2em]">
                Start a Project
              </span>
              <span className="font-mono text-xs transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </button>
          </div>

          {/* Mobile Horizontal Scrollable Section Bar (< 768px) */}
          <nav
            aria-label="Mobile section navigation"
            className="md:hidden flex items-center gap-5 px-4 py-2 border-t border-[#F0E4D2]/10 overflow-x-auto no-scrollbar"
          >
            {(
              [
                { id: 'home', label: 'Home' },
                { id: 'posters', label: 'Posters' },
                { id: 'project', label: 'Work' },
                { id: 'process', label: 'Process' },
                { id: 'about', label: 'About' },
                { id: 'services', label: 'Services' },
              ] as const
            ).map((item) => {
              const isCurrent = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`relative py-0.5 font-sans font-medium text-[10px] tracking-[0.18em] uppercase whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isCurrent ? 'text-[#F0E4D2]' : 'text-[#F0E4D2]/65'
                  }`}
                >
                  <span>{item.label}</span>
                  {isCurrent && (
                    <span className="absolute inset-x-0 -bottom-0.5 h-px bg-[#F0E4D2]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ISSUE COVER — SHANAKHT / THE VISUAL NOTEBOOK */}
        <div
          id="home"
          className={revealedSection?.id === 'home' ? 'section-reveal-active' : undefined}
        >
          <ReadingNookHero
            activeNav={activeNav}
            onSelectNav={(section) => scrollToSection(section)}
            onEmailClick={() => scrollToSection('contact-form')}
          />
        </div>

        {/* 01 / THE POSTER ARCHIVE */}
        <div className={revealedSection?.id === 'posters' ? 'section-reveal-active' : undefined}>
          <PosterSection />
        </div>

        <EditorialBridge
          projectCount={PORTFOLIO_PROJECTS.length}
          onOpenProjects={() => setIsAllProjectsOpen(true)}
        />

        {/* 3. PROJECTS SECTION (02 · SELECTED CASE STUDIES) */}
        <div className={revealedSection?.id === 'project' ? 'section-reveal-active' : undefined}>
          <ProjectsSection
            onSelectProject={(id) => setSelectedProjectId(id)}
            isAllProjectsOpen={isAllProjectsOpen}
            onOpenAllProjects={() => setIsAllProjectsOpen(true)}
            onCloseAllProjects={() => setIsAllProjectsOpen(false)}
          />
        </div>

        {/* 4. PROCESS SECTION (03 · THE PROCESS) */}
        <div className={revealedSection?.id === 'process' ? 'section-reveal-active' : undefined}>
          <ProcessSection />
        </div>

        {/* 5. ABOUT ME SECTION (04 · THE DESIGNER) */}
        <div className={revealedSection?.id === 'about' ? 'section-reveal-active' : undefined}>
          <AboutSection onContactClick={() => scrollToSection('contact-form')} />
        </div>

        {/* 6. SERVICES & STUDIO INQUIRY FINALE (05 · CAPABILITIES & 06 · INITIATE A PROJECT) */}
        <div className={revealedSection?.id === 'services' ? 'section-reveal-active' : undefined}>
          <ServicesSection
            clientName={clientName}
            setClientName={setClientName}
            clientEmail={clientEmail}
            setClientEmail={setClientEmail}
            projectNotes={projectNotes}
            setProjectNotes={setProjectNotes}
            inquirySubmitted={inquirySubmitted}
            setInquirySubmitted={setInquirySubmitted}
            onSubmitInquiry={handleFormSubmit}
          />
        </div>
      </main>

      <CaseStudyModal
        project={activeModalProject}
        onClose={() => setSelectedProjectId(null)}
        onNextProject={handleNextModalProject}
        onPrevProject={handlePrevModalProject}
        onSelectScope={handleSelectScopeFromModal}
      />
    </div>
  );
}

