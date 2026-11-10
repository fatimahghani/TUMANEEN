import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Menu, Pause, Play, X } from 'lucide-react';
import { RotatingMoon } from './RotatingMoon';
import './ReadingNookHero.css';

type Section = 'home' | 'project' | 'about' | 'services' | 'posters' | 'process';
interface ReadingNookHeroProps {
  activeNav?: Section;
  onSelectNav?: (section: Section) => void;
  onEmailClick?: () => void;
}

// Only the isolated astronaut/rock is an image. The heading, backdrop, moon,
// navigation and tagline are separate editable, responsive elements.
const FOREGROUND = import.meta.env.BASE_URL + 'assets/explorer/astronaut.webp';
const LETTER_HEIGHTS = [630, 420, 300, 205, 270, 355, 490, 685];

export const ReadingNookHero: React.FC<ReadingNookHeroProps> = ({ onSelectNav, onEmailClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const uid = useId().replace(/:/g, '');

  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);

  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, section: Section) => {
    setMenuOpen(false);
    if (onSelectNav) {
      event.preventDefault();
      onSelectNav(section);
    }
  };

  return (
    <section className="tm-hero tm-explorer-hero" aria-labelledby="tm-hero-title" data-coded-hero="true">
      <h1 id="tm-hero-title" className="tm-explorer-heading">
        <span className="tm-explorer-sr">TUMANEEN</span>
        <svg viewBox="0 0 1600 720" preserveAspectRatio="none" aria-hidden="true" className="tm-explorer-masthead">
          <defs>
            <clipPath id={'masthead-arc-' + uid}>
              <path d="M0 0H1600V720C1395 497 1144 186 800 186S211 457 0 672Z" />
            </clipPath>
          </defs>
          <g clipPath={'url(#masthead-arc-' + uid + ')'}>
            {'TUMANEEN'.split('').map((letter, index) => (
              <svg key={index} x={index * 200 + 2} y="0" width="190" height={LETTER_HEIGHTS[index]} viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible">
                <text x="0" y="94" fontSize="128" textLength="100" lengthAdjust="spacingAndGlyphs">{letter}</text>
              </svg>
            ))}
          </g>
        </svg>
      </h1>

      <RotatingMoon paused={paused} />
      <img className="tm-explorer-foreground" src={FOREGROUND} alt="" aria-hidden="true" decoding="sync" fetchPriority="high" draggable={false} />
      <p className="tm-explorer-tagline">Visual<br />Explorer<span aria-hidden="true" /></p>

      <button
        ref={menuButton}
        type="button"
        className="tm-explorer-menu-button"
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={menuOpen}
        aria-controls={'explorer-nav-' + uid}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={23} strokeWidth={1.5} /> : <Menu size={23} strokeWidth={1.5} />}
      </button>
      {menuOpen && (
        <>
          <button className="tm-explorer-menu-scrim" onClick={() => setMenuOpen(false)} tabIndex={-1} aria-label="Dismiss navigation" />
          <nav ref={menuRef} id={'explorer-nav-' + uid} className="tm-explorer-nav" aria-label="Portfolio navigation">
            <a href="#project" onClick={(event) => navigate(event, 'project')}>Work</a>
            <a href="#posters" onClick={(event) => navigate(event, 'posters')}>Posters</a>
            <a href="#about" onClick={(event) => navigate(event, 'about')}>About</a>
            <a href="#contact-form" onClick={(event) => {
              setMenuOpen(false);
              if (onEmailClick) { event.preventDefault(); onEmailClick(); }
            }}>Contact</a>
          </nav>
        </>
      )}
      <div className="tm-explorer-controls">
        <button type="button" className="tm-explorer-motion" aria-label={paused ? 'Resume moon rotation' : 'Pause moon rotation'} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
          {paused ? <Play size={17} strokeWidth={1.5} /> : <Pause size={17} strokeWidth={1.5} />}
        </button>
        <a href="#posters" className="tm-explorer-next" aria-label="Explore the poster archive" onClick={(event) => navigate(event, 'posters')}>
          <ArrowRight size={34} strokeWidth={1.2} />
        </a>
      </div>
    </section>
  );
};
