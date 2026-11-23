export interface MediaAssetConfig {
  id: string;
  videoPath?: string;
  enableVideo?: boolean;
  posterPath: string;
  alt: string;
  caption?: string;
  focalPoint?: string;
}

export interface ChapterItem {
  id: string;
  number: string;
  index: number;
  title: string;
  shortTitle: string;
  description: string;
  detailNote: string;
  media: MediaAssetConfig;
}

export interface RitualItem {
  id: string;
  name: string;
  duration: string;
  examplePrice: string;
  summary: string;
  includes: string[];
}

export interface TreatmentCategory {
  id: string;
  index: string;
  title: string;
  shortLabel: string;
  subtitle: string;
  description: string;
  media: MediaAssetConfig;
  rituals: RitualItem[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  image: string;
  alt: string;
  isPlaceholder: boolean;
}

/**
 * CENTRALIZED MEDIA & CONTENT CONFIGURATION
 * Replace video paths in /public/videos/*.mp4 and set `enableVideo: true`
 * when real salon film assets are supplied.
 * All prices, staff names, and contact details are clearly marked editable placeholders.
 */
export const SALON_CONFIG = {
  brand: {
    name: 'NOVA',
    subBrand: 'UNISEX SALON',
    shortTagline: 'Bespoke hair, skin & beauty artistry for timeless elegance.',
    heroHeadline: 'Beauty, in its own time.',
    heroSubhead: 'Thoughtful rituals. Exceptional care. A more personal approach to beauty.',
    primaryCta: 'BOOK AN APPOINTMENT',
    secondaryCta: 'EXPLORE OUR APPROACH',
    editionNotice: 'Editable Salon Template · Sample Pricing & Placeholder Contact Info',
    creatorPrefix: 'Made by',
    creatorName: 'Anurag',
    creatorTrademark: '™',
    creatorRole: 'Digital Craft & Design',
  },

  mediaSlots: {
    hero: {
      id: 'hero-media',
      videoPath: '/videos/hero.mp4',
      enableVideo: true,
      posterPath: '/images/spread-left-lips.jpg',
      alt: 'Close-up editorial beauty film showing luminous natural skin texture and botanical serum ritual',
      focalPoint: 'center 32%',
    } satisfies MediaAssetConfig,

    introduction: {
      id: 'intro-media',
      posterPath: '/images/nova-intro-portrait.jpg',
      alt: 'Editorial profile portrait of a serene model blending softly into warm ivory light',
      caption: 'Figure 01 — Quiet restoration in our private treatment suites',
      focalPoint: 'center center',
    } satisfies MediaAssetConfig,

    spreadLeft: {
      id: 'spread-left',
      videoPath: '/videos/approach-2.mp4',
      enableVideo: true,
      posterPath: '/images/hero-portrait.jpg',
      alt: 'Close-up beauty film of silk skincare cream on natural skin texture',
      caption: 'Tactile precision & natural balance',
      focalPoint: 'center center',
    } satisfies MediaAssetConfig,

    spreadRight: {
      id: 'spread-right',
      posterPath: '/images/spread-right-texture.jpg',
      alt: 'Botanical skincare essence and glass dropper with warm mineral texture',
      caption: 'Formulations chosen for skin integrity',
      focalPoint: 'center center',
    } satisfies MediaAssetConfig,

    philosophy: {
      id: 'philosophy-media',
      posterPath: '/images/philosophy-space.jpg',
      alt: 'Calm, sunlit treatment sanctuary at NOVA with warm linen and natural stone',
      caption: 'Our sanctuary space — designed for unhurried stillness',
      focalPoint: 'center center',
    } satisfies MediaAssetConfig,

    closingTreatments: {
      id: 'closing-treatments',
      posterPath: '/images/service-facial.jpg',
      alt: 'Close-up of a bespoke facial ritual with gentle botanical application',
      focalPoint: 'center center',
    } satisfies MediaAssetConfig,

    closingApproach: {
      id: 'closing-approach',
      posterPath: '/images/chapter-3-professionals.jpg',
      alt: 'Skilled hands performing a restorative facial massage ritual',
      focalPoint: 'center center',
    } satisfies MediaAssetConfig,

    footer: {
      id: 'footer-media',
      videoPath: '/videos/approach-1.mp4',
      enableVideo: true,
      posterPath: '/images/footer-macro.jpg',
      alt: 'Softly animated facial massage and botanical skincare ritual film',
      focalPoint: 'center center',
    } satisfies MediaAssetConfig,
  },

  introduction: {
    kicker: 'THE SANCTUARY',
    headline:
      'At Nova, we believe beauty is a personal expression of who you are. Step into our sanctuary for unhurried rituals shaped around your natural rhythm.',
    body:
      'True radiance rarely comes from haste. Every appointment begins with attentive listening—observing how you live, how your skin responds to the season, and what brings you a sense of calm restoration.',
    ctaLabel: 'Book Consultation',
  },

  chapters: [
    {
      id: 'chapter-1',
      number: '(1).',
      index: 1,
      title: 'A considered experience',
      shortTitle: 'Considered space',
      description:
        'More than an appointment, NOVA is a quiet pause. From warm linen and softened acoustics to unhurried transition time between rituals, every detail is composed to restore stillness.',
      detailNote: 'Private suites · Unhurried pacing · Sensory calm',
      media: {
        id: 'approach-1',
        videoPath: '/videos/approach-1.mp4',
        enableVideo: true,
        posterPath: '/images/service-facial.jpg',
        alt: 'Serene facial treatment ritual in warm diffused light',
        focalPoint: 'center center',
      },
    },
    {
      id: 'chapter-2',
      number: '(2).',
      index: 2,
      title: 'Care tailored to you',
      shortTitle: 'Tailored care',
      description:
        'No two complexions or schedules are alike. Each facial, manicure, or makeup session is adapted on the day of your visit to match your skin’s current condition and personal preferences.',
      detailNote: 'Bespoke formulation pairing · Seasonal adaptation',
      media: {
        id: 'approach-2',
        videoPath: '/videos/approach-2.mp4',
        enableVideo: true,
        posterPath: '/images/chapter-2-tailored.jpg',
        alt: 'Macro beauty portrait highlighting natural skin texture and hydration',
        focalPoint: 'center 40%',
      },
    },
    {
      id: 'chapter-3',
      number: '(3).',
      index: 3,
      title: 'Skilled beauty professionals',
      shortTitle: 'Skilled artisans',
      description:
        'Our estheticians, nail artists, and makeup specialists unite refined manual technique with a gentle, observant touch—prioritizing comfort, hygiene, and timeless aesthetic harmony.',
      detailNote: 'Sculptural massage · Precision nail care · Editorial eye',
      media: {
        id: 'approach-3',
        videoPath: '/videos/approach-3.mp4',
        enableVideo: true,
        posterPath: '/images/chapter-3-professionals.jpg',
        alt: 'Esthetician hands performing a precise, gentle facial massage',
        focalPoint: 'center center',
      },
    },
    {
      id: 'chapter-4',
      number: '(4).',
      index: 4,
      title: 'The art of everyday rituals',
      shortTitle: 'Everyday rituals',
      description:
        'We believe beauty should feel effortless long after you leave our chair. We pair in-salon treatments with simple, sustainable home rituals that support healthy skin and nails every day.',
      detailNote: 'Thoughtful home guidance · Enduring simplicity',
      media: {
        id: 'approach-4',
        videoPath: '/videos/approach-4.mp4',
        enableVideo: true,
        posterPath: '/images/chapter-4-rituals.jpg',
        alt: 'Close-up of elegant hands and natural manicure ritual',
        focalPoint: 'center center',
      },
    },
  ] satisfies ChapterItem[],

  spreadStatement: {
    partOne: 'PERSONAL.',
    partTwo: 'PRECISE.',
    partThree: 'BEAUTIFUL.',
    caption:
      'We bring together restorative touch, clean botanical formulations, and quiet editorial artistry to create care that feels deeply personal.',
  },

  treatmentCategories: [
    {
      id: 'facials',
      index: '01',
      title: 'Facials and skin treatments',
      shortLabel: 'Facials & Skin',
      subtitle: 'Restorative manual sculpting, barrier nourishment, and luminous hydration.',
      description:
        'Our facial treatments focus on gentle surface renewal, lymphatic drainage, and deep moisture replenishment. Every session begins with a quiet skin reading so masks, oils, and massage pressure are attuned to how your complexion feels today.',
      media: {
        id: 'media-facials',
        posterPath: '/images/service-facial.jpg',
        alt: 'Close-up of a soothing botanical facial treatment',
      },
      rituals: [
        {
          id: 'nova-signature-facial',
          name: 'The NOVA Signature Facial',
          duration: '75 min',
          examplePrice: '₹2,500',
          summary:
            'A customized ritual combining double botanical cleansing, gentle enzymatic polish, extended sculptural facial massage, and a bespoke hydro-soothing mask.',
          includes: ['Skin consultation', 'Sculptural buccal & lymphatic massage', 'Custom botanical mask', 'Scalp & neck release'],
        },
        {
          id: 'barrier-calm-infusion',
          name: 'Barrier Calm & Moisture Infusion',
          duration: '60 min',
          examplePrice: '₹1,800',
          summary:
            'Designed for sensitive, fatigued, or seasonally dry complexions seeking immediate comfort, lipid replenishment, and a soft, rested glow.',
          includes: ['Chamomile & oat compress', 'Cooling stone drainage', 'Ceramide & squalane layering'],
        },
        {
          id: 'sculpt-and-illuminate',
          name: 'Sculpt & Illuminate Ritual',
          duration: '90 min',
          examplePrice: '₹3,200',
          summary:
            'An extended facial focused on releasing jaw and facial tension through slow, rhythmic manual contouring and warm botanical oil compresses.',
          includes: ['Extended 40-min facial massage', 'Warm herbal poultice', 'Décolletage nourishment'],
        },
      ],
    },
    {
      id: 'nails',
      index: '02',
      title: 'Manicure, pedicure and nail art',
      shortLabel: 'Nails & Manicure',
      subtitle: 'Meticulous cuticle care, breathable polishes, and understated nail artistry.',
      description:
        'We approach nail care as a restorative hand and foot ritual. Using gentle e-file and manual preparation, nourishing botanical balms, and curated sheer neutrals or minimalist hand-painted details, we prioritize natural nail health.',
      media: {
        id: 'media-nails',
        posterPath: '/images/service-nails.jpg',
        alt: 'Elegant hands showing a sheer neutral manicure',
      },
      rituals: [
        {
          id: 'bare-luxury-manicure',
          name: 'The Bare Luxury Manicure',
          duration: '50 min',
          examplePrice: '₹1,200',
          summary:
            'Detailed shaping, gentle cuticle refinement, warm mineral hand soak, exfoliating sugar polish, massage, and your choice of buff-to-shine or sheer tint.',
          includes: ['Precision cuticle care', 'Botanical scrub & warm towel wrap', 'Sheer gloss or natural polish'],
        },
        {
          id: 'minimalist-nail-art-gel',
          name: 'Structured Gel & Minimalist Nail Art',
          duration: '75 min',
          examplePrice: '₹1,800',
          summary:
            'A protective structured base finished with fine micro-French lines, Negative-space accents, or custom translucent tones mixed to flatter your skin undertone.',
          includes: ['Gentle soak-off if required', 'Custom tone blending', 'Bespoke minimalist art detail'],
        },
        {
          id: 'restorative-stone-pedicure',
          name: 'Restorative Warm Stone Pedicure',
          duration: '65 min',
          examplePrice: '₹1,500',
          summary:
            'Unhurried foot care featuring a warm aromatic soak, gentle callus smoothing, lower-leg tension massage with warm basalt stones, and pristine polish.',
          includes: ['Aromatic mineral foot bath', 'Warm stone calf massage', 'Cuticle oil & polish finish'],
        },
      ],
    },
    {
      id: 'makeup',
      index: '03',
      title: 'Professional and bridal makeup',
      shortLabel: 'Makeup & Bridal',
      subtitle: 'Skin-first complexion artistry for weddings, editorials, and intimate occasions.',
      description:
        'Our makeup philosophy celebrates skin that looks like skin—luminous, breathable, and unmistakably you. Every application begins with luxury skin preparation so pigments melt seamlessly and wear comfortably from morning light to evening.',
      media: {
        id: 'media-makeup',
        posterPath: '/images/service-makeup.jpg',
        alt: 'Close-up bridal and editorial beauty portrait with soft luminous skin',
      },
      rituals: [
        {
          id: 'bridal-bespoke-preview',
          name: 'Bridal Beauty Consultation & Preview',
          duration: '90 min',
          examplePrice: '₹8,500',
          summary:
            'A collaborative session exploring your dress, lighting, and personal style to design a timeless bridal complexion and eye look tailored exclusively for you.',
          includes: ['Mini hydrating skin prep', 'Custom shade charting', 'Wear-test notes & touch-up kit guide'],
        },
        {
          id: 'wedding-day-application',
          name: 'Wedding Day Bespoke Artistry',
          duration: '75 min',
          examplePrice: '₹15,000',
          summary:
            'Calm, unhurried wedding morning skin preparation and makeup application in our private suite or at your chosen venue by arrangement.',
          includes: ['Cooling eye & lip prep', 'Long-wear skin-first finish', 'Complimentary lip touch-up vial'],
        },
        {
          id: 'evening-editorial-makeup',
          name: 'Occasion & Editorial Makeup',
          duration: '60 min',
          examplePrice: '₹5,500',
          summary:
            'Refined, camera-ready makeup for events, portraits, or gala evenings—balancing softly sculpted structure with effortless freshness.',
          includes: ['Express lymphatic skin prep', 'Individual lash placement (optional)', 'Custom complexion finish'],
        },
      ],
    },
    {
      id: 'consultations',
      index: '04',
      title: 'Skincare consultations and treatments',
      shortLabel: 'Consultations',
      subtitle: 'Thoughtful routine editing, ingredient clarity, and seasonal skin planning.',
      description:
        'For guests seeking clarity amidst an overwhelming world of products, our consultations offer an unhurried, objective review of your current routine, lifestyle factors, and seasonal skin needs—without pressure or over-complicated regimens.',
      media: {
        id: 'media-consultations',
        posterPath: '/images/service-consultation.jpg',
        alt: 'Bespoke skincare dropper bottles and consultation notes on natural stone',
      },
      rituals: [
        {
          id: 'holistic-skin-consultation',
          name: 'One-on-One Skincare Edit & Consultation',
          duration: '45 min',
          examplePrice: '₹999',
          summary:
            'Bring your current skincare bag for an honest, ingredient-by-ingredient review. Leave with a simplified morning and evening ritual plan tailored to your skin.',
          includes: ['Current product audit', 'Written seasonal routine card', 'Redeemable toward any facial ritual on the day'],
        },
        {
          id: 'consultation-plus-custom-facial',
          name: 'First Visit: Consultation + Bespoke Facial',
          duration: '90 min',
          examplePrice: '₹2,999',
          summary:
            'Our recommended introduction to NOVA—combining a 25-minute in-depth consultation with a 65-minute tailored facial treatment.',
          includes: ['Comprehensive skin & lifestyle intake', '65-min customized facial', 'Follow-up home ritual notes'],
        },
        {
          id: 'bridal-skin-journey-plan',
          name: 'Pre-Event & Bridal Skin Preparation Plan',
          duration: '60 min',
          examplePrice: '₹1,999',
          summary:
            'A structured 3-to-6-month calendar of gentle facials, nail care, and home rituals leading up to a wedding or milestone occasion.',
          includes: ['Timeline scheduling', 'Express hydrating treatment', 'Home care simplicity guide'],
        },
      ],
    },
  ] satisfies TreatmentCategory[],

  philosophy: {
    kicker: 'METHOD & PHILOSOPHY',
    title: 'Care, with intention.',
    lead:
      'Every ritual at NOVA is guided by restraint, tactile skill, and respect for your natural features. We favour thoughtful consistency over aggressive trends.',
    paragraphs: [
      'We believe the most meaningful beauty treatments do not seek to disguise who you are. Instead, they create the quiet conditions in which healthy skin, cared-for hands, and unforced confidence can surface naturally.',
      'From the temperature of our compresses to the pacing of our consultations, nothing is rushed and nothing is standardized. We take the time to understand what feels restorative to you.',
    ],
    linkLabel: 'Discover our sanctuary & team',
  },

  about: {
    heroKicker: 'ABOUT',
    heroTitleLeft: 'Evolving',
    heroTitleRight: 'with you.',
    heroInsetCaption:
      'A restorative space delivering timeless beauty through a long term partnership',
    heroTitle: 'A quiet house devoted to unhurried beauty rituals.',
    manifesto:
      'is founded upon a philosophy of integrity and quiet artistry in hair, skin, and bridal beauty. This manifests in bespoke treatments, a timeless approach rather than following trends, and maintaining a long-lasting relationship with our guests throughout their beauty journey. We understand that what makes you feel radiant evolves with every season of life, and we are here to support and guide you through these natural stages.',
    founder: {
      label: 'Founder & Owner',
      title: 'Founder of NOVA Unisex Salon',
      specialty: 'Bespoke Skin Architecture, Hair Artistry & Bridal Direction',
      bio: 'Founded with a devotion to calm precision and personal care, she leads NOVA’s signature consultations and bespoke rituals—blending refined technique with unhurried hospitality at our Kingship by Kahlon sanctuary in Lucknow.',
      consultationCaption: 'Personal ritual planning & tailored beauty consultations',
    },
    storyParagraphs: [
      'Conceived as an intimate alternative to high-turnover salons, NOVA was created for guests who value stillness as much as craft. Our space pairs warm limewashed walls, natural travertine stone, and filtered daylight to soften the transition from the outside world.',
      'Every visit begins with attentive listening—tailoring skin rituals, hair artistry, nail care, and bridal looks around your natural features and lifestyle.',
    ],
    atmosphereHighlights: [
      {
        label: 'Private Suites',
        detail: 'Quiet, individually climate-tuned rooms designed for uninterrupted rest.',
      },
      {
        label: 'Considered Formulations',
        detail: 'Curated botanical oils, barrier-supportive creams, and breathable nail systems.',
      },
      {
        label: 'Unhurried Scheduling',
        detail: 'Generous buffer time between appointments so you never feel rushed at reception.',
      },
    ],
    team: [
      {
        id: 'member-1',
        name: 'Nova',
        role: 'Founder & Owner',
        specialty: 'Bespoke Skin Architecture & Bridal Artistry',
        bio: 'Founder & Owner of NOVA Unisex Salon. Leads private consultations, barrier-first skincare rituals, and bespoke bridal direction with calm, unhurried precision at Kingship by Kahlon in Lucknow.',
        image: '/images/founder-owner-portrait.jpg',
        alt: 'Editorial portrait of Hershita, Founder and Owner of NOVA Unisex Salon',
        isPlaceholder: false,
      },
    ] satisfies TeamMember[],
  },

  contact: {
    placeholderNotice: 'Nova Unisex Salon — Kingship by Kahlon, Sector 16, Vrindavan Colony, Lucknow',
    addressLine1: 'Shop no UGF 04, 12A, Nova Unisex Salon, Kingship by Kahlon',
    addressLine2: 'Sector 16, Vrindavan Colony, Lucknow, Uttar Pradesh 226029',
    directionsUrl: 'https://www.google.com/maps/place/Nova+Unisex+Salon+%26+Makeup+Studio/@26.7504532,80.9539723,19z/data=!4m6!3m5!1s0x399bfb002f5ba615:0xf862f22ac3bd16b4!8m2!3d26.7504532!4d80.9539723!16s%2Fg%2F11z_gsgz1h',
    email: 'info@novasalonlucknow.in',
    phoneDisplay: '(+91) 72752 56535',
    phoneHref: 'tel:+917275256535',
    hours: [
      { days: 'Mo', time: '10:00AM - 9:00PM' },
      { days: 'Tu', time: '10:00AM - 9:00PM' },
      { days: 'We', time: '10:00AM - 9:00PM' },
      { days: 'Th', time: '10:00AM - 9:00PM' },
      { days: 'Fr', time: '10:00AM - 9:00PM' },
      { days: 'Sa', time: '10:00AM - 9:00PM' },
      { days: 'Su', time: '10:00AM - 9:00PM' },
    ],
    socials: [
      { label: 'Instagram', url: 'https://www.instagram.com/nova.unisexsalon8866?jplx=MXBtdTUweHdtMjJrdw==' },
      { label: 'WhatsApp', url: 'https://wa.me/917275256535?text=Hello%20NOVA%20Sanctuary%2C%20I%20would%20like%20to%20connect%20with%20your%20reception.' },
    ],
  },

  integrations: {
    // Google Sheets Webhook: every booking & VIP lead is automatically appended to owner's Google Sheet
    googleSheetsWebhookUrl:
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL) || '',
    // Airtable CRM direct integration (Token + Base)
    airtable: {
      token:
        (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AIRTABLE_TOKEN) ||
        (typeof process !== 'undefined' && process.env ? process.env.VITE_AIRTABLE_TOKEN : '') ||
        '',
      baseId:
        (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AIRTABLE_BASE_ID) ||
        (typeof process !== 'undefined' && process.env ? process.env.VITE_AIRTABLE_BASE_ID : '') ||
        'appy0KzWMlpXE4TNN',
      bookingsTableId:
        (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AIRTABLE_BOOKINGS_TABLE_ID) ||
        (typeof process !== 'undefined' && process.env ? process.env.VITE_AIRTABLE_BOOKINGS_TABLE_ID : '') ||
        'tblzJVBkuxP6xSINF',
      vipTableId:
        (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AIRTABLE_VIP_TABLE_ID) ||
        (typeof process !== 'undefined' && process.env ? process.env.VITE_AIRTABLE_VIP_TABLE_ID : '') ||
        'tblGXJsK7tQWqf0kP',
      settingsTableId:
        (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AIRTABLE_SETTINGS_TABLE_ID) ||
        (typeof process !== 'undefined' && process.env ? process.env.VITE_AIRTABLE_SETTINGS_TABLE_ID : '') ||
        'tblFhgDOcFoqyKjAT',
    },
    // Optional Airtable Webhook URL
    airtableWebhookUrl:
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AIRTABLE_WEBHOOK_URL) || '',
  },
};
