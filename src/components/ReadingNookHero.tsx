import React from 'react';
import { ArrowDownRight } from 'lucide-react';
import { RotatingMoon } from './RotatingMoon';
import './ReadingNookHero.css';

type Section = 'home' | 'project' | 'about' | 'services' | 'posters' | 'process';

interface ReadingNookHeroProps {
  activeNav?: Section;
  onSelectNav?: (section: Section) => void;
  onEmailClick?: () => void;
}

const COVER = import.meta.env.BASE_URL + 'assets/retro/visual-explorer-poster.webp';

/**
 * A single vintage print cover, not a collection of marketing cards.
 * The letterpress masthead, seated traveler and bottom title stay still;
 * only the NASA-mapped three-dimensional lunar sphere moves.
 */
export const ReadingNookHero: React.FC<ReadingNookHeroProps> = ({
  onSelectNav,
  onEmailClick,
}) => {
  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, section: Section) => {
    if (!onSelectNav) return;
    event.preventDefault();
    onSelectNav(section);
  };

  return (
    <section className="tm-hero tm-retro-hero" aria-labelledby="tm-hero-title">
      <div className="tm-retro-cover">
        <img
          src={COVER}
          className="tm-retro-cover-art"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <RotatingMoon />

        {/* Restore the original still foreground over the dynamic lunar disc.
            The clip follows the seated figure and the cliff silhouette. */}
        <img className="tm-retro-foreground" src={COVER} alt="" aria-hidden="true" />

        <h1 id="tm-hero-title" className="tm-retro-screen-reader">TUMANEEN</h1>
        <p className="tm-retro-screen-reader">Visual Explorer</p>

        <a
          className="tm-retro-turn"
          href="#posters"
          aria-label="Explore the poster archive"
          onClick={(event) => navigate(event, 'posters')}
        >
          <ArrowDownRight size={17} strokeWidth={1.7} aria-hidden="true" />
        </a>
      </div>

      <nav className="tm-retro-nav" aria-label="Portfolio introduction navigation">
        <a href="#project" onClick={(event) => navigate(event, 'project')}>WORK</a>
        <a href="#about" onClick={(event) => navigate(event, 'about')}>ABOUT</a>
        <a href="#services" onClick={(event) => {
          event.preventDefault();
          if (onEmailClick) onEmailClick();
          else if (onSelectNav) onSelectNav('services');
        }}>CONTACT</a>
      </nav>
    </section>
  );
};
