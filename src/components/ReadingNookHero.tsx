import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import './ReadingNookHero.css';

type Section = 'home' | 'project' | 'about' | 'services' | 'posters' | 'process';

interface ReadingNookHeroProps {
  activeNav?: Section;
  onSelectNav?: (section: Section) => void;
  onEmailClick?: () => void;
}

const NAV_ITEMS: { section: Section; label: string; index: string }[] = [
  { section: 'home', label: 'Index', index: '00' },
  { section: 'posters', label: 'Posters', index: '01' },
  { section: 'project', label: 'Projects', index: '02' },
  { section: 'process', label: 'Process', index: '03' },
  { section: 'about', label: 'About', index: '04' },
  { section: 'services', label: 'Services', index: '05' },
];

const SHANAKHT_ARTWORK = import.meta.env.BASE_URL + 'assets/aistudio/shnakht_449796d0.jpg';

/**
 * TUMANEEN's opening page is deliberately composed as one magazine spread,
 * not a collection of independent cards. The original Shanakht artwork is
 * reproduced without cropping and the rest of the portfolio remains intact.
 */
export const ReadingNookHero: React.FC<ReadingNookHeroProps> = ({
  activeNav = 'home',
  onSelectNav,
  onEmailClick,
}) => {
  const goTo = (event: React.MouseEvent<HTMLAnchorElement>, section: Section) => {
    if (!onSelectNav) return;
    event.preventDefault();
    onSelectNav(section);
  };

  return (
    <section className="tm-hero" aria-labelledby="tm-hero-title">
      <div className="tm-paper-grain" aria-hidden="true" />

      <div className="tm-sheet">
        <div className="tm-running">
          <span>AN INDEPENDENT VISUAL NOTEBOOK</span>
          <span className="tm-running-center">ART / TYPE / IDENTITY / ALL THE IN-BETWEEN</span>
          <span>VOLUME I <span aria-hidden="true">—</span> 2026</span>
        </div>

        <header className="tm-header">
          <div className="tm-masthead-wrap">
            <div className="tm-masthead-aside" aria-hidden="true">
              <span lang="ur" dir="rtl">دفترِ نقش</span>
              <span>NOTES ON<br />MAKING &amp; MEANING</span>
            </div>
            <h1 id="tm-hero-title" className="tm-masthead">TUMANEEN<span aria-hidden="true">.</span></h1>
            <div className="tm-masthead-signature">
              <span>ISSUE Nº 001</span>
              <strong>FG.</strong>
              <span>A VISUAL DIARY</span>
            </div>
          </div>

          <div className="tm-navigation">
            <nav className="tm-nav-items" aria-label="Portfolio navigation">
              {NAV_ITEMS.map(({ section, label, index }) => (
                <a
                  key={section}
                  href={'#' + section}
                  className={activeNav === section ? 'tm-nav-item tm-nav-active' : 'tm-nav-item'}
                  aria-current={activeNav === section ? 'page' : undefined}
                  onClick={(event) => goTo(event, section)}
                >
                  <span className="tm-nav-index">{index}.</span> {label}
                </a>
              ))}
            </nav>
            <button className="tm-contact-link" type="button" onClick={() => onEmailClick?.()}>
              HAVE A PROJECT? <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="tm-cover">
          <span className="tm-cover-rail" aria-hidden="true">TUMANEEN / COVER STORY / 001</span>
          <div className="tm-cover-inner">
            <div className="tm-story">
              <div className="tm-story-topline">
                <span>THE COVER STORY</span>
                <span className="tm-story-rule" aria-hidden="true" />
                <span>02 / 08</span>
              </div>

              <div className="tm-cover-heading">
                <p className="tm-heading-prefix">On belonging, memory &amp; a city.</p>
                <h2>
                  <span className="tm-heading-line-one">The address</span>
                  <span className="tm-heading-line-two">changed.</span>
                  <span className="tm-heading-line-three">Not the <em>identity.</em></span>
                </h2>
                <span className="tm-heading-mark" aria-hidden="true">“</span>
              </div>

              <p className="tm-story-urdu" lang="ur" dir="rtl">پتہ بدلا ہے، شناخت نہیں</p>

              <div className="tm-story-end">
                <p className="tm-story-essay">
                  <span className="tm-essay-initial" aria-hidden="true">S</span>
                  <span className="tm-essay-body">
                    <strong>SHANAKHT / شناخت</strong>
                    <span>A poster about identity and the streets of Androon Lahore.
                      One of the pieces in my growing collection of visual notes.</span>
                  </span>
                </p>
                <a href="#posters" onClick={(event) => goTo(event, 'posters')} className="tm-cover-link">
                  SEE THE POSTER ARCHIVE <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="tm-picture-column">
              <span className="tm-urdu-backdrop" lang="ur" dir="rtl" aria-hidden="true">شناخت</span>
              <span className="tm-picture-notch tm-picture-notch-top" aria-hidden="true" />
              <span className="tm-picture-notch tm-picture-notch-bottom" aria-hidden="true" />
              <div className="tm-picture-underprint" aria-hidden="true" />
              <figure className="tm-picture-print">
                <img
                  src={SHANAKHT_ARTWORK}
                  alt="Shanakht — Fatimah Ghani's original cultural identity and Urdu typography poster set around Androon Lahore."
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
                <figcaption className="tm-picture-caption">
                  <span>PLATE II</span>
                  <span>SHANAKHT / ORIGINAL ARTWORK</span>
                </figcaption>
              </figure>
              <div className="tm-picture-index" aria-hidden="true">II.</div>
              <span className="tm-picture-vertical" aria-hidden="true">THE ADDRESS CHANGED / THE IDENTITY DID NOT</span>
            </div>
          </div>

          <div className="tm-cover-baseline">
            <span>FIG. 02 / CULTURAL IDENTITY · URDU TYPOGRAPHY</span>
            <span>ANDROON LAHORE — PAKISTAN</span>
            <span className="tm-cover-baseline-star" aria-hidden="true">✳</span>
          </div>
        </div>

        <div className="tm-afterword">
          <div className="tm-afterword-number" aria-hidden="true">01<span>/</span></div>
          <div className="tm-afterword-copy">
            <span className="tm-label">FROM THE DESK OF FATIMAH GHANI</span>
            <p>Things I made.<br /><em>Things I kept thinking about.</em></p>
          </div>
          <div className="tm-afterword-body">
            <p>TUMANEEN is my ongoing index of posters, identities, experiments
              and happy accidents. More sketchbook than showroom.</p>
            <a href="#about" onClick={(event) => goTo(event, 'about')}>MEET THE DESIGNER <ArrowUpRight size={14} aria-hidden="true" /></a>
          </div>
          <div className="tm-contents">
            <span className="tm-label">IN THIS EDITION</span>
            <a href="#posters" onClick={(event) => goTo(event, 'posters')}><span>01</span> THE POSTER ARCHIVE <ArrowUpRight size={13} aria-hidden="true" /></a>
            <a href="#project" onClick={(event) => goTo(event, 'project')}><span>02</span> SELECTED PROJECTS <ArrowUpRight size={13} aria-hidden="true" /></a>
            <a href="#process" onClick={(event) => goTo(event, 'process')}><span>03</span> HOW I WORK <ArrowUpRight size={13} aria-hidden="true" /></a>
          </div>
        </div>

        <footer className="tm-footer">
          <span>FATIMAH GHANI / GRAPHIC DESIGN &amp; VISUAL IDENTITY</span>
          <span lang="ur" dir="rtl">ایک بصری ڈائری</span>
          <a href="#posters" onClick={(event) => goTo(event, 'posters')}>
            TURN THE PAGE <ArrowDownRight size={15} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </footer>
      </div>
      <div className="tm-final-rule" aria-hidden="true" />
    </section>
  );
};
