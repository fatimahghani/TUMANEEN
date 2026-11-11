import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Menu, Pause, Play, X } from 'lucide-react';
import { RotatingMoon } from './RotatingMoon';
import { ExplorerMasthead } from './ExplorerMasthead';
import { ExplorerSky } from './ExplorerSky';
import './ReadingNookHero.css';

type Section = 'home' | 'project' | 'about' | 'services' | 'posters' | 'process';
interface ReadingNookHeroProps {
  activeNav?: Section;
  onSelectNav?: (section: Section) => void;
  onEmailClick?: () => void;
}

// The existing transparent astronaut/rock is the only composited image.
// The new sky, lettering, grain and layout are HTML/SVG/CSS; the moon is WebGL.
const FOREGROUND = import.meta.env.BASE_URL + 'assets/explorer/astronaut.webp';

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
      <ExplorerSky />
      <ExplorerMasthead />
      <RotatingMoon paused={paused} />
      <img className="tm-explorer-foreground" src={FOREGROUND} alt="" aria-hidden="true" decoding="sync" fetchPriority="high" draggable={false} />
      <div className="tm-explorer-film-grain" aria-hidden="true" />
      <p className="tm-explorer-tagline"><span className="tm-explorer-tagline-line">Visual</span><span className="tm-explorer-tagline-line">Explorer</span><span className="tm-explorer-tagline-rule" aria-hidden="true" /></p>

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
        <button type="button" className="tm-explorer-motion" aria-label={paused ? 'Resume lunar animation' : 'Pause lunar animation'} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
          {paused ? <Play size={17} strokeWidth={1.5} /> : <Pause size={17} strokeWidth={1.5} />}
        </button>
        <a href="#posters" className="tm-explorer-next" aria-label="Explore the poster archive" onClick={(event) => navigate(event, 'posters')}>
          <ArrowRight size={34} strokeWidth={1.2} />
        </a>
      </div>
    </section>
  );
};
