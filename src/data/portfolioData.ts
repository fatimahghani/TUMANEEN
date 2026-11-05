const BASE_URL = import.meta.env.BASE_URL;

export type ProjectDiscipline = 'Brand Identity' | 'Editorial & Print' | 'Packaging' | 'Type Systems';

export interface ExtractedColorSwatch {
  name: string;
  hex: string;
  role: string;
}

export interface DeliverableSlide {
  title: string;
  kicker?: string;
  caption: string;
  spec: string;
  imageUrl?: string;
  secondaryImageUrl?: string;
  boardUrl?: string;
  tags?: string[];
  visualType: 'monogram' | 'poster' | 'packaging' | 'editorial' | 'typespecimen' | 'gridsystem';
  bgHex: string;
  fgHex: string;
  accentHex: string;
}

export interface PortfolioProject {
  id: string;
  index: string;
  title: string;
  tagline?: string;
  client: string;
  location: string;
  year: string;
  discipline: ProjectDiscipline;
  behanceUrl?: string;
  behanceBoards?: { url: string; title: string; spec: string }[];
  extractedPalette?: ExtractedColorSwatch[];
  featuredSpan: 'wide' | 'tall' | 'standard';
  summary: string;
  challenge: string;
  solution: string;
  impactMetric: string;
  impactDetail: string;
  deliverables: string[];
  printSpecs: string;
  primaryColor: '#545333' | '#878672' | '#D9D7B6' | '#FDFBD4';
  secondaryColor: '#FDFBD4' | '#D9D7B6' | '#878672' | '#545333';
  artworkType:
    | 'lumera-candle-identity'
    | 'riwaq-fragrance'
    | 'roast-rhythm-cafe'
    | 'swiss-poster'
    | 'botanical-packaging'
    | 'editorial-monograph'
    | 'type-foundry'
    | 'wine-label'
    | 'architectural-wayfinding';
  slides: DeliverableSlide[];
}

export interface ColorSwatchSpec {
  id: string;
  name: string;
  role: string;
  hex: string;
  rgb: string;
  cmyk: string;
  pantoneRef: string;
  contrastOnLight: string;
  contrastOnDark: string;
  usageNotes: string;
  proportion: string;
}

export const QUITE_CLEAR_SWATCHES: ColorSwatchSpec[] = [
  {
    id: 'cream',
    name: 'Vintage Cream',
    role: 'Dominant Archival Canvas',
    hex: '#FDFBD4',
    rgb: '253, 251, 212',
    cmyk: '01, 01, 18, 00',
    pantoneRef: 'P 1-1 C · Cotton Rag',
    contrastOnLight: '1.0 : 1',
    contrastOnDark: '11.4 : 1',
    usageNotes: 'Warm parchment canvas for editorial spreads, framed matting, and tactile print substrates.',
    proportion: '60% Canvas',
  },
  {
    id: 'beige',
    name: 'Mid-Tone Linen Beige',
    role: 'Structural Grid & Framing',
    hex: '#D9D7B6',
    rgb: '217, 215, 182',
    cmyk: '14, 11, 29, 00',
    pantoneRef: 'Warm Gray 2 C',
    contrastOnLight: '1.35 : 1',
    contrastOnDark: '8.2 : 1',
    usageNotes: 'Secondary elevation containers, Swiss grid rules, structural borders, and bookbinding endpapers.',
    proportion: '30% Surface',
  },
  {
    id: 'taupe',
    name: 'Sepia Taupe',
    role: 'Woven Accents & Interactive States',
    hex: '#878672',
    rgb: '135, 134, 114',
    cmyk: '46, 39, 52, 11',
    pantoneRef: '403 C · Spot Ink',
    contrastOnLight: '3.6 : 1',
    contrastOnDark: '3.2 : 1',
    usageNotes: 'Warm sepia tone for study rugs, exhibition numbering, book spines, and hover transitions.',
    proportion: '10% Accent',
  },
  {
    id: 'olive',
    name: 'Deep Olive Umber',
    role: 'Primary Wall & Typographic Anchor',
    hex: '#545333',
    rgb: '84, 83, 51',
    cmyk: '58, 49, 77, 42',
    pantoneRef: '7771 C · Archival Ink',
    contrastOnLight: '8.4 : 1 (AAA)',
    contrastOnDark: '1.0 : 1',
    usageNotes: 'High-contrast deep olive anchor for study walls, primary typography, logotypes, and cloth bindings.',
    proportion: '60% Hero / Ink',
  },
];

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'lumera-candle-identity',
    index: '01',
    title: 'LUMERA',
    tagline: 'Light. Memory. Ritual.',
    client: 'LUMERA Studio',
    location: 'Brand Identity · Scented Candles · Packaging',
    year: '2026',
    discipline: 'Packaging',
    behanceUrl: 'https://www.behance.net/gallery/257004895/LUMERA-Brand-Identity-Packaging-Design',
    featuredSpan: 'wide',
    summary:
      'LUMERA is a luxury scented candle brand inspired by light, memory, and everyday ritual — uniting a radiant sun symbol, arched forms, rich nocturnal illustration, and tactile ceramic vessels.',
    challenge:
      'Each fragrance is created to bring a soft glow into everyday life, turning simple moments into intimate experiences inspired by moonlit landscapes, florals, earth, and memory.',
    solution:
      'An elegant, luminous identity combining a radiant sun emblem, arched label geometry, nocturnal landscape box illustrations, gold-foil ritual matchboxes, and three signature scents: Marigold Night, Casa Rosa, and After the Rain.',
    impactMetric: '3 Signature Scents',
    impactDetail: 'Brand Identity · Scented Candles · Packaging',
    deliverables: [
      'Radiant Sun Emblem & Arch Identity',
      'Ceramic Candle Vessels & Gold Lids',
      'Illustrated Nocturnal Packaging Boxes',
      'Gold-Foil Matchboxes & Die-Cut Stationery',
    ],
    printSpecs: 'Brand Identity · Scented Candles · Packaging',
    primaryColor: '#545333',
    secondaryColor: '#FDFBD4',
    artworkType: 'lumera-candle-identity',
    extractedPalette: [
      { name: 'Espresso Brown', hex: '#3A2218', role: 'Marigold Night warmth and grounded earth.' },
      { name: 'Velvet Plum', hex: '#4B1D26', role: 'Casa Rosa twilight florals and depth.' },
      { name: 'Nocturnal Teal', hex: '#133836', role: 'After the Rain washed earth and stillness.' },
      { name: 'Radiant Gold', hex: '#D99B3C', role: 'Sun emblem, foil stamping, and candle glow.' },
      { name: 'Warm Ivory', hex: '#F7F5EE', role: 'Tactile paper stock and calm editorial space.' },
    ],
    slides: [
      {
        title: 'LUMERA — Light. Memory. Ritual.',
        kicker: '01 / COVER',
        caption: 'Fragrance for the memories we keep. A luxury scented candle brand inspired by light, memory, and everyday ritual.',
        spec: '01 · Cover',
        imageUrl: `${BASE_URL}behance-lumera-cover.jpg?v=4k`,
        visualType: 'packaging',
        bgHex: '#24110E',
        fgHex: '#F7F5EE',
        accentHex: '#D99B3C',
      },
      {
        title: 'LUMERA — Brand Identity & Story',
        kicker: '02 / BRAND STORY',
        caption: 'LUMERA is a scent brand built around light, warmth, and ritual — where light becomes ritual.',
        spec: '02 · Brand Story',
        imageUrl: `${BASE_URL}behance-lumera-fs-01.jpg`,
        visualType: 'packaging',
        bgHex: '#261811',
        fgHex: '#F7F5EE',
        accentHex: '#D99B3C',
      },
      {
        title: 'Three Scent Atmospheres',
        kicker: '03 / SCENT STORIES',
        caption: 'After the Rain (Wet Earth · Vetiver · Jasmine) · Casa Rosa (Rose · Hibiscus · Warm Musk) · Marigold Night (Orange Blossom · Amber · Sandalwood)',
        spec: '03 · Scent Stories',
        imageUrl: `${BASE_URL}behance-lumera-fs-02.jpg`,
        visualType: 'packaging',
        bgHex: '#1B1412',
        fgHex: '#F7F5EE',
        accentHex: '#D99B3C',
      },
      {
        title: 'Tactile Ceramic Candle Vessels',
        kicker: '04 / CERAMIC VESSELS',
        caption: 'Matte blush-terracotta 250g vessels with arched labels and gold-rimmed lids suspended from a sculptural natural branch.',
        spec: '04 · Vessels',
        imageUrl: `${BASE_URL}behance-lumera-fs-03.jpg`,
        visualType: 'packaging',
        bgHex: '#E5D7C8',
        fgHex: '#24110E',
        accentHex: '#D99B3C',
      },
      {
        title: 'Nocturnal Landscape Packaging Boxes',
        kicker: '05 / ILLUSTRATED BOXES',
        caption: 'Richly illustrated moonlit landscape boxes for After the Rain, Casa Rosa, and Marigold Night nestled in golden-hour mist.',
        spec: '05 · Illustrated Boxes',
        imageUrl: `${BASE_URL}behance-lumera-fs-04.jpg`,
        visualType: 'packaging',
        bgHex: '#1C130E',
        fgHex: '#F7F5EE',
        accentHex: '#D99B3C',
      },
      {
        title: 'Die-Cut Keepsake Cards & Campaign Poster',
        kicker: '06 / STATIONERY & PRINT',
        caption: 'Ornate laser-cut botanical cards, translucent vellum overlays, and "bring glow — a brighter atmosphere awaits" campaign poster.',
        spec: '06 · Stationery & Print',
        imageUrl: `${BASE_URL}behance-lumera-fs-05.jpg`,
        visualType: 'packaging',
        bgHex: '#23281E',
        fgHex: '#F7F5EE',
        accentHex: '#D99B3C',
      },
      {
        title: 'Starlit Collection Grid',
        kicker: '07 / COLLECTION GRID',
        caption: 'Overhead flat-lay of the illustrated outer boxes paired with colored-wax candle vessels against a starlit night backdrop.',
        spec: '07 · Collection Grid',
        imageUrl: `${BASE_URL}behance-lumera-fs-06.jpg`,
        visualType: 'packaging',
        bgHex: '#050B0E',
        fgHex: '#F7F5EE',
        accentHex: '#D99B3C',
      },
      {
        title: 'Gold-Foil Ritual Matchboxes',
        kicker: '08 / RITUAL MATCHBOXES',
        caption: 'Deep espresso matchboxes stamped in radiant gold foil with botanical keys, flames, and the arched LUMERA sun emblem.',
        spec: '08 · Matchboxes',
        imageUrl: `${BASE_URL}behance-lumera-fs-07.jpg`,
        visualType: 'packaging',
        bgHex: '#24110E',
        fgHex: '#F7F5EE',
        accentHex: '#D99B3C',
      },
      {
        title: 'Flagship Storefront & Spatial Experience',
        kicker: '09 / STOREFRONT',
        caption: 'lumera — Scents for a Brighter You · Arched travertine sanctuary glowing warmly at dusk.',
        spec: '09 · Storefront',
        imageUrl: `${BASE_URL}behance-lumera-fs-08.jpg`,
        visualType: 'packaging',
        bgHex: '#241C19',
        fgHex: '#F7F5EE',
        accentHex: '#D99B3C',
      },
      {
        title: 'Marigold Night — Ritual Scene',
        kicker: '10 / MARIGOLD NIGHT',
        caption: 'Orange Blossom · Amber · Sandalwood — Lit ceramic candle and illustrated box on a carved walnut tray under a crescent moon.',
        spec: '10 · Marigold Night',
        imageUrl: `${BASE_URL}behance-lumera-fs-09.jpg`,
        visualType: 'packaging',
        bgHex: '#24110E',
        fgHex: '#F7F5EE',
        accentHex: '#D99B3C',
      },
      {
        title: 'What Light Will You Hold Tonight?',
        kicker: '11 / CLOSING IDENTITY',
        caption: 'LUMERA Studio — Fragrance for the memories we keep.',
        spec: '11 · Closing',
        imageUrl: `${BASE_URL}behance-lumera-fs-10.jpg`,
        visualType: 'packaging',
        bgHex: '#24110E',
        fgHex: '#F7F5EE',
        accentHex: '#D99B3C',
      },
    ],
  },
  {
    id: 'riwaq-fragrance-identity',
    index: '02',
    title: 'RIWAQ Fragrances',
    tagline: 'Inspired by Land, Rooted in Culture',
    client: 'RIWAQ Fragrances',
    location: 'Brand Identity · Fragrance · Packaging',
    year: '2026',
    discipline: 'Packaging',
    behanceUrl: 'https://www.behance.net/gallery/256314323/RIWAQ-Fragrance-Brand-Identity-Packaging',
    featuredSpan: 'wide',
    summary:
      'A luxury fragrance brand built around architectural arches and desert heritage — uniting Arabic calligraphy and high-contrast Latin serif across heavy glass vessels and tactile arch packaging.',
    challenge:
      'Translating the quiet grandeur of sunlit desert courtyards, travertine stone arches, and regional scent rituals into a contemporary luxury fragrance house.',
    solution:
      'A dual-script identity pairing custom Arabic calligraphy with an arched Latin serif, expressed across four signature Eau de Parfum atmospheres (Layl, Sahra, Noor, Ajwad), carved dark walnut caps etched with the RQ monogram, and embossed arch-window boxes.',
    impactMetric: '4 Signature Scents',
    impactDetail: 'Brand Identity · Fragrance · Packaging',
    deliverables: [
      'Dual-Script Logo & RQ Monogram',
      'Desert Palette & 4 Scent Moodboards',
      'Tactile Arch Window Outer Packaging',
      'Heavy Glass Vessels & Carved Walnut Caps',
    ],
    printSpecs: 'Brand Identity · Fragrance · Packaging',
    primaryColor: '#545333',
    secondaryColor: '#FDFBD4',
    artworkType: 'riwaq-fragrance',
    extractedPalette: [
      { name: 'Primary Crimson', hex: '#780C18', role: 'Rich, warm and ceremonial.' },
      { name: 'Secondary Sand', hex: '#E8C7A0', role: 'Sunlit travertine and desert warmth.' },
      { name: 'Dark Base Espresso', hex: '#1C0800', role: 'Deep nocturnal shadow and walnut.' },
      { name: 'Light Base Ivory', hex: '#F4E7D7', role: 'Soft uncoated tactile paper stock.' },
      { name: 'Accent Brass', hex: '#A98252', role: 'Foil stamping and collar detailing.' },
    ],
    slides: [
      {
        title: 'RIWAQ Fragrances',
        kicker: '01 / COVER',
        caption: 'Inspired by land, rooted in culture. A luxury fragrance brand built around architectural arches and desert heritage.',
        spec: '01 · Cover',
        imageUrl: `${BASE_URL}behance-riwaq-cover.jpg?v=4k`,
        visualType: 'packaging',
        bgHex: '#1C0800',
        fgHex: '#F4E7D7',
        accentHex: '#A98252',
      },
      {
        title: 'RIWAQ Fragrances — Full Collection Showcase',
        kicker: '02 / COLLECTION SHOWCASE',
        caption: 'Inspired by land, rooted in culture. Four signature Eau de Parfum scents: Noor, Sahra, Ajwad, and Layl.',
        spec: '02 · Collection',
        imageUrl: `${BASE_URL}behance-riwaq-01.jpg`,
        visualType: 'packaging',
        bgHex: '#1C0800',
        fgHex: '#F4E7D7',
        accentHex: '#A98252',
      },
      {
        title: 'Logo Construction & Spacing Grid',
        kicker: '03 / BRAND ARCHITECTURE',
        caption: 'Arabic Calligraphy Core · Latin High-Contrast Serif · Integrated Arch Curve Baseline',
        spec: '03 · Architecture',
        imageUrl: `${BASE_URL}behance-riwaq-02.jpg`,
        visualType: 'packaging',
        bgHex: '#F8F5F0',
        fgHex: '#1C0800',
        accentHex: '#780C18',
      },
      {
        title: 'Desert Tones & Timeless Stories',
        kicker: '04 / BRAND PALETTE',
        caption: 'Primary Crimson #780C18 · Secondary Sand #E8C7A0 · Dark Base Espresso #1C0800 · Light Base Ivory #F4E7D7 · Accent Brass #A98252',
        spec: '04 · Brand Palette',
        imageUrl: `${BASE_URL}behance-riwaq-03.jpg`,
        visualType: 'packaging',
        bgHex: '#F8F5F0',
        fgHex: '#1C0800',
        accentHex: '#780C18',
      },
      {
        title: 'Four Scent Atmospheres',
        kicker: '05 / COLLECTION MOODBOARDS',
        caption: 'Layl (Smoked Espresso) · Sahra (Burnt Terracotta) · Noor (Desert Champagne) · Ajwad (Deep Garnet)',
        spec: '05 · Moodboards',
        imageUrl: `${BASE_URL}behance-riwaq-04.jpg`,
        visualType: 'packaging',
        bgHex: '#F8F5F0',
        fgHex: '#1C0800',
        accentHex: '#A98252',
      },
      {
        title: 'Tactile Arch Packaging Concept',
        kicker: '06 / OUTER PACKAGING',
        caption: 'Embossed arch window, Arabic calligraphy spine, color-coded traditional pattern base trim, and uncoated soft-touch stock.',
        spec: '06 · Packaging',
        imageUrl: `${BASE_URL}behance-riwaq-05.jpg`,
        visualType: 'packaging',
        bgHex: '#1C0800',
        fgHex: '#F4E7D7',
        accentHex: '#A98252',
      },
      {
        title: 'Heavy Glass & Carved Timber Caps',
        kicker: '07 / PRODUCT LINEUP',
        caption: 'Thick-walled glass vessels matched with carved dark walnut caps, laser-etched with the RQ monogram emblem.',
        spec: '07 · Lineup',
        imageUrl: `${BASE_URL}behance-riwaq-06.jpg`,
        visualType: 'packaging',
        bgHex: '#F8F5F0',
        fgHex: '#1C0800',
        accentHex: '#A98252',
      },
      {
        title: 'Sunlight & Architectural Shadows',
        kicker: '08 / ENVIRONMENTAL SCENE',
        caption: 'Set against travertine marble and soft desert sunlight, capturing shadows that evoke traditional arched courtyards.',
        spec: '08 · Environment',
        imageUrl: `${BASE_URL}behance-riwaq-07.jpg`,
        visualType: 'packaging',
        bgHex: '#F8F5F0',
        fgHex: '#1C0800',
        accentHex: '#A98252',
      },
      {
        title: 'Fragrance in Everyday Rituals',
        kicker: '09 / DAILY LIFE MOMENTS',
        caption: 'Morning Clarity (Noor) · Afternoon Escape (Sahra) · Evening Reflection (Layl)',
        spec: '09 · Daily Rituals',
        imageUrl: `${BASE_URL}behance-riwaq-09.jpg`,
        visualType: 'packaging',
        bgHex: '#F4EFE6',
        fgHex: '#1C0800',
        accentHex: '#A98252',
      },
      {
        title: 'Same Places, Different Atmospheres',
        kicker: '10 / ATMOSPHERIC LIFESTYLE',
        caption: 'Scents travel further than places — Layl & Ajwad in nocturnal and sunset architectural settings.',
        spec: '10 · Atmosphere',
        imageUrl: `${BASE_URL}behance-riwaq-08.jpg`,
        visualType: 'packaging',
        bgHex: '#1C0800',
        fgHex: '#F4E7D7',
        accentHex: '#780C18',
      },
      {
        title: 'A Fragrance Rooted in Place',
        kicker: '11 / CLOSING',
        caption: 'RIWAQ Fragrances — Places · People · Traditions · Fragrance',
        spec: '11 · Closing',
        imageUrl: `${BASE_URL}behance-riwaq-10.jpg`,
        visualType: 'packaging',
        bgHex: '#1C0800',
        fgHex: '#F4E7D7',
        accentHex: '#A98252',
      },
    ],
  },
  {
    id: 'roast-and-rhythm-cafe',
    index: '03',
    title: 'Roast & Rhythm',
    tagline: 'A Modern Mehfil',
    client: 'Roast & Rhythm Café',
    location: 'Brand Identity · Café · Packaging',
    year: '2026',
    discipline: 'Packaging',
    behanceUrl: 'https://www.behance.net/gallery/254960309/Roast-Rhythm-Caf-Branding-Packaging',
    featuredSpan: 'wide',
    summary:
      'Roast & Rhythm is a desi-modern café where bold flavours, warm conversations and playful energy come together.',
    challenge:
      'More than coffee, it’s a rhythm — inspired by everyday chai breaks, coffee rituals and the rhythm of city life.',
    solution:
      'Handcrafted typography with a playful desi character, bringing warmth, personality and rhythm into a modern café experience.',
    impactMetric: 'A Modern Mehfil',
    impactDetail: 'Brand Identity · Café · Packaging',
    deliverables: [
      'Logo & Variations',
      'Color Palette & Typography',
      'Menu & Coffee Cup',
      'Takeaway Packaging & Storefront',
    ],
    printSpecs: 'Brand Identity · Café · Packaging',
    primaryColor: '#545333',
    secondaryColor: '#FDFBD4',
    artworkType: 'roast-rhythm-cafe',
    extractedPalette: [
      { name: 'Espresso', hex: '#3B2A20', role: 'Strong, grounded and rich.' },
      { name: 'Terracotta', hex: '#C75A2E', role: 'Warm, energetic and inviting.' },
      { name: 'Chai Beige', hex: '#E8D9C3', role: 'Soft, warm and comforting.' },
      { name: 'Tea Leaf', hex: '#6B6F4A', role: 'Natural, calm and earthy.' },
      { name: 'Kraft', hex: '#B7926A', role: 'Organic, rustic and handcrafted.' },
      { name: 'Cream', hex: '#F7F3E9', role: 'Clean, minimal and timeless.' },
    ],
    slides: [
      {
        title: 'Roast & Rhythm',
        kicker: '01 / COVER',
        caption: 'Brand Identity · Café · Packaging',
        spec: '01 · Cover',
        imageUrl: `${BASE_URL}behance-roast-fs-11c.jpg?v=4k`,
        visualType: 'packaging',
        bgHex: '#2B1B14',
        fgHex: '#F7F3E9',
        accentHex: '#C75A2E',
      },
      {
        title: 'Roast & Rhythm — Brand Identity',
        kicker: '02 / OVERVIEW',
        caption: 'Brand Identity · Café · Packaging',
        spec: '02 · Roast & Rhythm',
        imageUrl: `${BASE_URL}behance-roast-fs-01.jpg`,
        visualType: 'packaging',
        bgHex: '#F0E6DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'A Moment In Your Rhythm',
        kicker: '03 / BRAND STORY',
        caption: 'More than coffee, it’s a rhythm.',
        spec: '03 · Brand Story',
        imageUrl: `${BASE_URL}behance-roast-fs-02.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'Bold, Playful & Rooted in Café Culture.',
        kicker: '04 / THE LOGO',
        caption: 'Primary Logo · Monogram · Character',
        spec: '04 · The Logo',
        imageUrl: `${BASE_URL}behance-roast-fs-03.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'Warm. Bold. Full of Soul.',
        kicker: '05 / COLOR PALETTE',
        caption: 'Desi at heart, modern in spirit.',
        spec: '05 · Color Palette',
        imageUrl: `${BASE_URL}behance-roast-fs-04.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'Good Coffee. Good Rhythm.',
        kicker: '06 / TYPOGRAPHY',
        caption: 'Impact Regular · Arial Bold',
        spec: '06 · Typography',
        imageUrl: `${BASE_URL}behance-roast-fs-05.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'Designed to Be Clear. Made to Feel the Brand.',
        kicker: '07 / MENU DESIGN',
        caption: 'A Modern Mehfil · Coffee aur guftagu',
        spec: '07 · Menu Design',
        imageUrl: `${BASE_URL}behance-roast-fs-06.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'Made to Be Held. Made to Be Remembered.',
        kicker: '08 / COFFEE CUP',
        caption: 'Roast & Rhythm · Premium Coffee',
        spec: '08 · Coffee Cup',
        imageUrl: `${BASE_URL}behance-roast-fs-07.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'Packed With Personality.',
        kicker: '09 / TAKEAWAY PACKAGING',
        caption: 'Good coffee. Good music. Good company. That’s our mehfil.',
        spec: '09 · Takeaway Packaging',
        imageUrl: `${BASE_URL}behance-roast-fs-08.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'Where the Brand Comes to Life.',
        kicker: '10 / TABLE SCENE',
        caption: 'Everyday café moments — from the menu to the cup, packaging and table details.',
        spec: '10 · Table Scene',
        imageUrl: `${BASE_URL}behance-roast-fs-09.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'A Warm Welcome, From the Very First Look.',
        kicker: '11 / STOREFRONT',
        caption: 'Roast & Rhythm · Whole Bean Coffee',
        spec: '11 · Storefront',
        imageUrl: `${BASE_URL}behance-roast-fs-10.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'Brand Collection',
        kicker: '12 / BRAND COLLECTION',
        caption: 'Roast & Rhythm · Whole Bean Coffee',
        spec: '12 · Brand Collection',
        imageUrl: `${BASE_URL}behance-roast-fs-11a.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'A Modern Mehfil',
        kicker: '13 / CAFÉ INTERIOR',
        caption: 'Coffee aur guftagu',
        spec: '13 · Café Interior',
        imageUrl: `${BASE_URL}behance-roast-fs-11b.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
      {
        title: 'Thank You For Watching',
        kicker: '14 / CREDITS',
        caption: 'Designed by Fatimah Ghani',
        spec: '14 · Thank You',
        imageUrl: `${BASE_URL}behance-roast-fs-12.jpg`,
        visualType: 'packaging',
        bgHex: '#EFE7DC',
        fgHex: '#2B1B14',
        accentHex: '#C75A2E',
      },
    ],
  },
];

export interface ArchiveEntry {
  year: string;
  code: string;
  project: string;
  client: string;
  discipline: ProjectDiscipline;
  location: string;
  deliverable: string;
  accent: '#545333' | '#878672';
}

export const ARCHIVE_INDEX: ArchiveEntry[] = [
  { year: '2026', code: 'NL—003', project: 'LUMERA Scented Candles', client: 'LUMERA Studio', discipline: 'Packaging', location: 'Featured', deliverable: 'Brand Identity & Candle Packaging', accent: '#545333' },
  { year: '2026', code: 'NL—002', project: 'RIWAQ Fragrances', client: 'RIWAQ Fragrances', discipline: 'Packaging', location: 'Featured', deliverable: 'Fragrance Identity & Packaging', accent: '#545333' },
  { year: '2026', code: 'NL—001', project: 'Roast & Rhythm Café', client: 'Roast & Rhythm', discipline: 'Packaging', location: 'Featured', deliverable: 'Café Branding & Packaging', accent: '#545333' },
];

export interface CapabilityItem {
  number: string;
  title: string;
  lead: string;
  duration: string;
  deliverables: string[];
  proofQuote: string;
  proofAuthor: string;
  proofRole: string;
  proofMetric: string;
}

export const STUDIO_CAPABILITIES: CapabilityItem[] = [
  {
    number: '01.',
    title: 'Brand Architecture & Visual Identity Systems',
    lead: 'We build enduring visual languages anchored in geometric proportion, bespoke wordmarks, and disciplined color systems that scale effortlessly from architectural signage to favicon.',
    duration: '6–10 Weeks Typical Engagement',
    deliverables: [
      'Brand Positioning & Visual Audit',
      'Primary Logotype, Monogram & Grid Construction',
      'Bespoke Color Proportions (Spot, CMYK, RGB, HEX)',
      'Comprehensive Brand Guidelines Dossier',
    ],
    proofQuote: 'Before working with TUMANEEN, our regional sub-brands looked fragmented. Their unified identity system consolidated four product lines and lifted wholesale buyer commitments in our first season.',
    proofAuthor: 'Lukas Lindqvist',
    proofRole: 'Managing Director, Veridian Formulation AG',
    proofMetric: '+210% Direct Conversion & 100% Retail Packaging Consistency',
  },
  {
    number: '02.',
    title: 'Editorial Monographs, Books & Print Production',
    lead: 'From museum exhibition catalogues to architectural monographs, we oversee every stage of bookmaking—from baseline grid mathematics to paper stock specification and press-check supervision.',
    duration: '8–14 Weeks Typical Engagement',
    deliverables: [
      'Multi-Column Swiss Baseline Grid Engineering',
      'Bilingual & Footnote Typesetting Architecture',
      'Tactile Paper, Cloth & Foil Binding Specification',
      'On-Site Lithographic & Letterpress Press Checks',
    ],
    proofQuote: 'Their command of typographic rhythm and physical bookbinding turned a dense 380-page academic manuscript into our fastest-selling exhibition publication in twenty years.',
    proofAuthor: 'Dr. Helena Vogt',
    proofRole: 'Chief Curator of Publications, Kunsthalle Basel',
    proofMetric: '12,500 First-Edition Hardcovers Sold Out in 9 Weeks',
  },
  {
    number: '03.',
    title: 'Structural Packaging & Tactile Object Design',
    lead: 'Packaging is where graphic design becomes physical sculpture. We engineer glue-free folding cartons, letterpress labels, and embossed vessel systems that command shelf presence without visual noise.',
    duration: '6–12 Weeks Typical Engagement',
    deliverables: [
      'Custom Die-Line & Structural Folding Engineering',
      'Embossed, Debossed & Wax-Sealed Finishing Specs',
      'Sustainable Mono-Material Board Sourcing',
      '3D Physical Mockups & Production CAD Files',
    ],
    proofQuote: 'Switching to the stepped cotton rag ledger label and sepia wax seal transformed how sommeliers present our bottles tableside across Europe and Japan.',
    proofAuthor: 'Henri Moreau',
    proofRole: 'Proprietor, Domaine Vespera Côte de Nuits',
    proofMetric: '+165% Export Allocation Requests Across 14 Countries',
  },
  {
    number: '04.',
    title: 'Custom Typography & Kinetic Art Direction',
    lead: 'When off-the-shelf fonts fall short, we draw proprietary display alphabets, monograms, and motion systems that give cultural and commercial clients an unmistakable voice.',
    duration: '4–8 Weeks Typical Engagement',
    deliverables: [
      'Bespoke Display & Titling Typeface Design',
      'Kinetic Typography & Motion Guidelines',
      'Exhibition & Spatial Wayfinding Systems',
      'Interactive Digital Design Systems',
    ],
    proofQuote: 'The harmonic ratio poster system became an instant landmark across Oslo. Subscriptions among under-35 concertgoers surged by 42% in a single quarter.',
    proofAuthor: 'Ingrid Solberg',
    proofRole: 'Artistic Director, Oslo Chamber Philharmonic',
    proofMetric: '+42% Youth Season Subscriptions & 180 City Kiosk Displays',
  },
];
