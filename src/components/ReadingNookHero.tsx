import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import './ReadingNookHero.css';

type Section = 'home' | 'project' | 'about' | 'services' | 'posters' | 'process';

interface ReadingNookHeroProps {
  activeNav?: Section;
  onSelectNav?: (section: Section) => void;
  onEmailClick?: () => void;
}

const NAV_ITEMS: { id: Section; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'posters', label: 'Posters' },
  { id: 'project', label: 'Projects' },
  { id: 'process', label: 'Process' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
];

// Keep the artist's original Shanakht asset rather than replacing or modifying the work.
const SHANAKHT_ARTWORK = import.meta.env.BASE_URL + 'assets/aistudio/shnakht_449796d0.jpg';

export const ReadingNookHero: React.FC<ReadingNookHeroProps> = ({
  activeNav = 'home',
  onSelectNav,
  onEmailClick,
}) => {
  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, section: Section) => {
    if (onSelectNav) {
      event.preventDefault();
      onSelectNav(section);
    }
  };

  return (
    <section className="tm-hero" aria-labelledby="tm-hero-title">
      <div className="tm-hero-paper" aria-hidden="true" />
      <div className="tm-hero-page">
        <div className="tm-edition-line" aria-label="Portfolio edition information">
          <span>THE ART OF MAKING THINGS MEAN SOMETHING</span>
          <span>AN INDEPENDENT DESIGN JOURNAL <span aria-hidden="true">✳</span> VOL. 01 / 2026</span>
        </div>

        <header className="tm-hero-header">
          <div className="tm-masthead-row">
            <p className="tm-masthead-side">A collection of<br />thoughtful visual things.</p>
            <h1 id="tm-hero-title" className="tm-masthead">TUMANEEN<span className="tm-masthead-period">.</span></h1>
            <div className="tm-masthead-stamp" aria-label="Independent design studio">
              <span>EST.</span>
              <strong>FG</strong>
              <span>2026</span>
            </div>
          </div>

          <div className="tm-hero-navigation">
            <span className="tm-nav-deck">FATIMAH GHANI <span aria-hidden="true">/</span> VISUAL DESIGNER</span>
            <nav aria-label="Primary navigation" className="tm-nav-links">
              {NAV_ITEMS.map((item) => (
                <a
                  href={'#' + item.id}
                  key={item.id}
                  aria-current={activeNav === item.id ? 'page' : undefined}
                  className={activeNav === item.id ? 'tm-nav-current' : undefined}
                  onClick={(event) => navigate(event, item.id)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <button className="tm-nav-contact" type="button" onClick={() => onEmailClick?.()}>
              Let's talk <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="tm-feature">
          <div className="tm-story">
            <div className="tm-story-kicker">
              <span className="tm-story-star" aria-hidden="true">✳</span>
              <span>FROM THE DESIGNER'S DESK</span>
              <span className="tm-story-number">/ NO. 001</span>
            </div>

            <div className="tm-story-headline">
              <p className="tm-story-overline">ART, IDENTITY &amp; THE IN-BETWEEN</p>
              <h2>Some things<br /><em>are felt.</em></h2>
              <span className="tm-story-asterisk" aria-hidden="true">*</span>
            </div>

            <p className="tm-story-urdu" lang="ur" dir="rtl">
              دل سے بنے، دل تک پہنچے
            </p>
            <p className="tm-story-description">
              TUMANEEN is a little space for curious ideas, evocative identities
              and design with a story to tell. Rooted in culture, shaped by
              feeling, made to linger.
            </p>

            <div className="tm-story-actions">
              <a href="#project" className="tm-story-primary" onClick={(event) => navigate(event, 'project')}>
                Explore the work <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>
              <a href="#about" className="tm-story-secondary" onClick={(event) => navigate(event, 'about')}>
                A note about me <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="tm-story-colophon">
              <span className="tm-colophon-mark" aria-hidden="true">✳</span>
              <p>For the things that deserve<br />to be remembered.</p>
              <span className="tm-colophon-folio">T. / 01</span>
            </div>
          </div>

          <div className="tm-artwork">
            <div className="tm-artwork-index">
              <span>AN EDITORIAL FEATURE</span>
              <span>PLATE 01 / ORIGINAL ARTWORK</span>
            </div>

            <div className="tm-artwork-stage">
              <div className="tm-artwork-underprint" aria-hidden="true">
                <span>THE<br />ARCHIVE</span>
              </div>
              <figure className="tm-artwork-print">
                <div className="tm-artwork-print-inner">
                  <img
                    src={SHANAKHT_ARTWORK}
                    alt="Shanakht, an original artwork by Fatimah Ghani, presented as the featured print."
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <figcaption className="tm-artwork-image-label">ORIGINAL WORK <span>© FATIMAH GHANI</span></figcaption>
              </figure>
              <div className="tm-artwork-seal" aria-hidden="true">
                <span>THE</span>
                <strong>TMN</strong>
                <span>EDITION</span>
              </div>
              <span className="tm-artwork-side-note" aria-hidden="true">A STUDY IN SELF &amp; SYMBOL</span>
            </div>

            <div className="tm-artwork-caption">
              <div>
                <span className="tm-artwork-caption-label">FEATURED IN THE JOURNAL</span>
                <h3>Shanakht <span lang="ur" dir="rtl">شناخت</span></h3>
              </div>
              <p>Identity, memory and the marks we carry.<br /><span>ARTWORK NO. 01 — FROM THE ARCHIVE</span></p>
            </div>
          </div>
        </div>

        <footer className="tm-hero-footer">
          <span className="tm-footer-label">TUMANEEN — A VISUAL DIARY</span>
          <span className="tm-footer-center" lang="ur" dir="rtl">تصویر، تہذیب، تخیل</span>
          <a href="#posters" onClick={(event) => navigate(event, 'posters')}>
            TURN THE PAGE <ArrowDownRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </footer>
      </div>
    </section>
  );
};
