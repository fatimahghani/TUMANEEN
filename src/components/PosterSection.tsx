import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import './PosterSection.css';

export interface LensBloomPosterCard {
  src: string;
  roman: string;
  name: string;
  project: string;
  description: string;
  aspect: number;
}

/**
 * Curated by Color Spectrum & Thematic Progression:
 * I.   Warm Parchment, Terracotta & Olive (Mixed-Media Manifesto Collage)
 * II.  Warm Sepia Ochre & Coral Crimson (Urdu Cultural Identity — Shanakht)
 * III. Chartreuse Gold & Deep Indigo (Urdu Poetic Halftone — Wajood)
 * IV.  Chartreuse Yellow & Cerulean Blue (Urdu Calligraphic Ritual — Chai)
 * V.   Tropical Teal-Cyan & Sunshine Yellow (Music & Event Poster — Chill & Mix)
 * VI.  Sunset Gold, Violet & Neon Indigo (Synthwave Vector Illustration — Retro Horizon)
 * VII. Luminous Cobalt & Royal Midnight Blue (Editorial Portrait — Tehreem)
 * VIII. Deep Midnight Noir & Kinetic Typography (Conceptual Print — Reality Vol. 01)
 */
const BASE_URL = import.meta.env.BASE_URL;

export const LENS_BLOOM_POSTERS: LensBloomPosterCard[] = [
  {
    src: `${BASE_URL}assets/aistudio/Trying_New_Things__A_Designer_s_Collage_a361d455.jpg`,
    roman: 'I',
    name: 'Trying New Things',
    project: 'Mixed Media · Designer Manifesto',
    description:
      'Tactile torn-paper collage, archival photography, and botanical specimens exploring identity and visual stories.',
    aspect: 0.8,
  },
  {
    src: `${BASE_URL}assets/aistudio/shnakht_449796d0.jpg`,
    roman: 'II',
    name: 'Shanakht (شناخت)',
    project: 'Cultural Identity · Urdu Typography',
    description:
      '“The address changed, not the identity” — neo-futurist character study set in the historic streets of Androon Lahore.',
    aspect: 0.71,
  },
  {
    src: `${BASE_URL}assets/aistudio/wajood_ac0f25c9.jpg`,
    roman: 'III',
    name: 'Wajood (وجود)',
    project: 'Poetic Editorial · Halftone Print',
    description:
      'Duotone indigo and chartreuse halftone composition meditating on presence, dignity, depth, and selfhood.',
    aspect: 0.71,
  },
  {
    src: `${BASE_URL}assets/aistudio/chai..._7ec612bc.jpg`,
    roman: 'IV',
    name: 'Chai — Ishq Kya Hai?',
    project: 'Cultural Ritual · Calligraphic Poster',
    description:
      'Expressive Urdu lettering woven around a shared cup of tea—celebrating warmth, conversation, and memory.',
    aspect: 0.71,
  },
  {
    src: `${BASE_URL}assets/aistudio/chill_and_mix_d3fa2d26.jpg`,
    roman: 'V',
    name: 'Chill & Mix',
    project: 'Event & Music · Visual Direction',
    description:
      'High-contrast condensed display typography layered with tropical foliage and sunlit cyan-lime color grading.',
    aspect: 0.8,
  },
  {
    src: `${BASE_URL}assets/aistudio/new_pic_4c93e253.jpg`,
    roman: 'VI',
    name: 'Retro Horizon',
    project: 'Vector Illustration · Synthwave Print',
    description:
      'Outrun golden sun, palm silhouettes, and a classic fastback poised over a neon perspective grid.',
    aspect: 1.0,
  },
  {
    src: `${BASE_URL}assets/aistudio/birthday_eeadee85.jpg`,
    roman: 'VII',
    name: 'Tehreem · 03 March',
    project: 'Editorial Portrait · Archway Print',
    description:
      'Luminous cobalt archway framing an intimate editorial portrait paired with heartfelt typographic blessings.',
    aspect: 0.8,
  },
  {
    src: `${BASE_URL}assets/aistudio/Group_6cd15385.jpg`,
    roman: 'VIII',
    name: 'Reality · Vol. 01',
    project: 'Kinetic Typography · Conceptual Poster',
    description:
      '“Nothing is quite what it seems” — atmospheric motion blur and repeating typographic echoes in deep noir.',
    aspect: 0.75,
  },
];

type ExhibitVariant = 'archival' | 'calligraphy' | 'moodboard' | 'geometry' | 'triptych' | 'collage';

type MuseumExhibit = {
  number: string;
  name: string;
  descriptor: string;
  variant: ExhibitVariant;
  primary: LensBloomPosterCard;
  companions: LensBloomPosterCard[];
};

const posterNamed = (name: string): LensBloomPosterCard => {
  const poster = LENS_BLOOM_POSTERS.find((item) => item.name.startsWith(name));
  if (!poster) throw new Error('Missing original TUMANEEN poster: ' + name);
  return poster;
};

// Six installations of the existing eight authentic posters. Process-style
// scraps are decorative crops of those originals, not invented portfolio works.
const MUSEUM_EXHIBITS: MuseumExhibit[] = [
  {
    number: '01',
    name: 'Shanakht',
    descriptor: 'Identity / visual memory',
    variant: 'archival',
    primary: posterNamed('Shanakht'),
    companions: [],
  },
  {
    number: '02',
    name: 'Wajood',
    descriptor: 'Urdu form / presence',
    variant: 'calligraphy',
    primary: posterNamed('Wajood'),
    companions: [],
  },
  {
    number: '03',
    name: 'Chai',
    descriptor: 'Ritual / typographic culture',
    variant: 'moodboard',
    primary: posterNamed('Chai'),
    companions: [],
  },
  {
    number: '04',
    name: 'Tehreem',
    descriptor: 'Editorial portrait / print',
    variant: 'geometry',
    primary: posterNamed('Tehreem'),
    companions: [],
  },
  {
    number: '05',
    name: 'Color & Motion',
    descriptor: 'Three experiments in image-making',
    variant: 'triptych',
    primary: posterNamed('Chill & Mix'),
    companions: [posterNamed('Retro Horizon'), posterNamed('Reality')],
  },
  {
    number: '06',
    name: 'Trying New Things',
    descriptor: 'Collage / visual diary',
    variant: 'collage',
    primary: posterNamed('Trying New Things'),
    companions: [],
  },
];

const ExhibitClip: React.FC<{ twin?: boolean; small?: boolean }> = ({ twin = true, small = false }) => (
  <span className={'tm-ma-clip-set' + (small ? ' tm-ma-clip-set--small' : '')} aria-hidden="true">
    <span className="tm-ma-clip-anchor tm-ma-clip-anchor--left">
      <span className="tm-ma-clip-wire" />
      <span className="tm-ma-clip-metal" />
    </span>
    {twin && (
      <span className="tm-ma-clip-anchor tm-ma-clip-anchor--right">
        <span className="tm-ma-clip-wire" />
        <span className="tm-ma-clip-metal" />
      </span>
    )}
  </span>
);

// One small companion study for three key prints, not a second collage wall.
const StudyDecoration: React.FC<{ poster: LensBloomPosterCard }> = ({ poster }) => (
  <div className="tm-ma-study-group" aria-hidden="true">
    <div className="tm-ma-study-sheet">
      <img src={poster.src} alt="" loading="lazy" decoding="async" />
    </div>
  </div>
);

export const PosterSection: React.FC = () => {
  const [activePoster, setActivePoster] = useState<LensBloomPosterCard | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const modalOpen = activePoster !== null;

  const openPoster = (poster: LensBloomPosterCard) => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setActivePoster(poster);
  };

  const movePoster = (direction: number) => {
    setActivePoster((previous) => {
      if (!previous) return null;
      const index = LENS_BLOOM_POSTERS.findIndex((item) => item.src === previous.src);
      return LENS_BLOOM_POSTERS[(index + direction + LENS_BLOOM_POSTERS.length) % LENS_BLOOM_POSTERS.length];
    });
  };

  useEffect(() => {
    if (!modalOpen) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setActivePoster(null);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        movePoster(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        movePoster(-1);
      }
    };

    window.addEventListener('keydown', onKeyboard);
    return () => {
      window.removeEventListener('keydown', onKeyboard);
      document.body.style.overflow = oldOverflow;
      triggerRef.current?.focus();
    };
  }, [modalOpen]);

  const handleModalTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const controls = panelRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <section id="posters" data-museum-posters="" className="tm-ma-museum" aria-labelledby="tm-ma-title">
      <div className="tm-ma-content">
        <header className="tm-ma-running-head">
          <div className="tm-ma-running-heading">
            <span>02 / POSTER ARCHIVE</span>
            <h2 id="tm-ma-title">Studies in print</h2>
          </div>
          <span>TUMANEEN / COLLECTED WORKS</span>
        </header>

        <div className="tm-ma-exhibition" aria-label="Six poster exhibits on an archival museum wall">
          {MUSEUM_EXHIBITS.map((exhibit) => (
            <article
              key={exhibit.number}
              className={'tm-ma-exhibit tm-ma-exhibit--' + exhibit.number + ' tm-ma-exhibit--' + exhibit.variant}
              data-exhibit-number={exhibit.number}
              data-exhibit-name={exhibit.name}
            >
              <span className="tm-ma-number-plaque" aria-hidden="true">{exhibit.number}</span>
              <div className="tm-ma-stage">
                <div className="tm-ma-primary">
                  <ExhibitClip small={exhibit.variant === 'triptych'} />
                  <button
                    type="button"
                    className="tm-ma-primary-paper"
                    onClick={() => openPoster(exhibit.primary)}
                    aria-label={'View ' + exhibit.primary.name + ' poster'}
                  >
                    <img src={exhibit.primary.src} alt={exhibit.primary.name + ' original poster'} loading="lazy" decoding="async" />
                    <span className="tm-ma-open-arrow" aria-hidden="true"><ArrowUpRight size={18} strokeWidth={1.5} /></span>
                  </button>
                </div>

                {exhibit.variant === 'triptych' ? (
                  exhibit.companions.map((poster, i) => (
                    <div className={'tm-ma-secondary tm-ma-secondary--' + (i + 1)} key={poster.src}>
                      <ExhibitClip twin={false} small />
                      <button
                        type="button"
                        className="tm-ma-secondary-paper"
                        onClick={() => openPoster(poster)}
                        aria-label={'View ' + poster.name + ' poster'}
                      >
                        <img src={poster.src} alt={poster.name + ' original poster'} loading="lazy" decoding="async" />
                      </button>
                    </div>
                  ))
                ) : ['archival', 'calligraphy', 'moodboard'].includes(exhibit.variant) ? (
                  <StudyDecoration poster={exhibit.primary} />
                ) : null}
              </div>
              <div className="tm-ma-exhibit-caption">
                <button type="button" onClick={() => openPoster(exhibit.primary)}>
                  {exhibit.name} <ArrowUpRight size={13} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <span>{exhibit.descriptor}</span>
              </div>
            </article>
          ))}
        </div>

        <footer className="tm-ma-footer">
          <span>TUMANEEN / POSTER ARCHIVE</span>
          <span>06 EXHIBITS · 08 PRINTS</span>
        </footer>
      </div>

      {activePoster && createPortal(
        <div className="tm-ma-viewer" role="dialog" aria-modal="true" aria-labelledby="tm-ma-viewer-title">
          <button
            type="button"
            className="tm-ma-viewer-scrim"
            onClick={() => setActivePoster(null)}
            aria-label="Close poster preview"
            tabIndex={-1}
          />
          <div className="tm-ma-viewer-panel" ref={panelRef} onKeyDown={handleModalTab}>
            <div className="tm-ma-viewer-head">
              <span>PRINT ARCHIVE / {activePoster.roman}</span>
              <button type="button" ref={closeButtonRef} onClick={() => setActivePoster(null)}>
                CLOSE <X size={17} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>
            <div className="tm-ma-viewer-body">
              <div className="tm-ma-viewer-picture">
                <img src={activePoster.src} alt={activePoster.name + ' original full-size poster'} />
              </div>
              <div className="tm-ma-viewer-notes">
                <span>ORIGINAL ARTWORK</span>
                <h3 id="tm-ma-viewer-title">{activePoster.name}</h3>
                <p>{activePoster.project}</p>
                <p>{activePoster.description}</p>
                <div className="tm-ma-viewer-controls">
                  <button type="button" onClick={() => movePoster(-1)} aria-label="Previous poster">
                    <ArrowLeft size={20} strokeWidth={1.6} />
                  </button>
                  <button type="button" onClick={() => movePoster(1)} aria-label="Next poster">
                    <ArrowRight size={20} strokeWidth={1.6} />
                  </button>
                  <span>{LENS_BLOOM_POSTERS.findIndex((p) => p.src === activePoster.src) + 1} / {LENS_BLOOM_POSTERS.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>, document.body
      )}
    </section>
  );
};
