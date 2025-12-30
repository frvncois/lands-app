import type { SectionBlueprint } from '../types'

// ============================================
// MUSIC & CREATIVE BLUEPRINTS
// ============================================

// --- HEROES ---
export const artistHero: SectionBlueprint = {
  id: 'artist-hero',
  type: 'hero',
  variant: 'overlay',
  dataOverrides: {
    headline: 'Artist Name',
    subheadline: 'Singer / Songwriter',
    primaryCTA: { label: 'Listen Now', url: '#' },
    secondaryCTA: { label: 'Tour Dates', url: '#' },
  },
}

export const albumHero: SectionBlueprint = {
  id: 'album-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'New Album Out Now',
    subheadline: 'Available on all platforms',
    primaryCTA: { label: 'Pre-Save', url: '#' },
  },
  styleOverrides: {
    spacingY: 0,
    spacingX: 60,
  },
}

export const djHero: SectionBlueprint = {
  id: 'dj-hero',
  type: 'hero',
  variant: 'overlay',
  dataOverrides: {
    headline: 'DJ / Producer Name',
    subheadline: 'Electronic • House • Techno',
    primaryCTA: { label: 'Book Now', url: '#' },
  },
}

export const podcastHero: SectionBlueprint = {
  id: 'podcast-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Podcast Name',
    subheadline: 'New episodes every week',
    primaryCTA: { label: 'Listen Now', url: '#' },
  },
  styleOverrides: {
    spacingY: 0,
    spacingX: 60,
  },
}

export const labelHero: SectionBlueprint = {
  id: 'label-hero',
  type: 'hero',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Label Name',
    subheadline: 'Independent Music Collective',
  },
}

export const studioHero: SectionBlueprint = {
  id: 'studio-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Studio Name',
    subheadline: 'Professional Recording & Production',
    primaryCTA: { label: 'Book a Session', url: '#' },
  },
  styleOverrides: {
    spacingY: 0,
    spacingX: 60,
  },
}

export const festivalHero: SectionBlueprint = {
  id: 'festival-hero',
  type: 'hero',
  variant: 'overlay',
  dataOverrides: {
    headline: 'Festival Name 2025',
    subheadline: 'July 15-17 • City, Country',
    primaryCTA: { label: 'Get Tickets', url: '#' },
  },
}

export const composerHero: SectionBlueprint = {
  id: 'composer-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Composer Name',
    subheadline: 'Film • TV • Games',
    primaryCTA: { label: 'Listen to Reel', url: '#' },
  },
  styleOverrides: {
    spacingY: 0,
    spacingX: 60,
  },
}

export const teacherHero: SectionBlueprint = {
  id: 'music-teacher-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Music Lessons',
    subheadline: 'Piano • Guitar • Voice',
    primaryCTA: { label: 'Book a Lesson', url: '#' },
  },
  styleOverrides: {
    spacingY: 0,
    spacingX: 60,
  },
}

// --- MUSIC-SPECIFIC SECTIONS ---
export const streamingLinks: SectionBlueprint = {
  id: 'streaming-links',
  type: 'links',
  variant: 'grid',
  dataOverrides: {
    headline: 'Listen',
    items: [
      { label: 'Spotify', url: '#' },
      { label: 'Apple Music', url: '#' },
      { label: 'YouTube Music', url: '#' },
      { label: 'SoundCloud', url: '#' },
    ],
  },
}

export const tourDates: SectionBlueprint = {
  id: 'tour-dates',
  type: 'events',
  variant: 'list',
  dataOverrides: {
    headline: 'Tour Dates',
    useCase: 'event',
    items: [
      {
        headline: 'City Name',
        datetime: 'June 15, 2025',
        location: 'Venue Name',
        button: { label: 'Tickets', url: '#' },
      },
    ],
  },
}

export const merchStore: SectionBlueprint = {
  id: 'merch-store',
  type: 'products',
  variant: 'grid',
  dataOverrides: {
    headline: 'Merch',
    items: [
      {
        heading: 'T-Shirt',
        variants: [{ label: 'Default', price: 25 }],
        ctaLabel: 'Buy Now',
        ctaUrl: '#',
      },
    ],
  },
}

export const podcastPlatforms: SectionBlueprint = {
  id: 'podcast-platforms',
  type: 'links',
  variant: 'grid',
  dataOverrides: {
    headline: 'Listen On',
    items: [
      { label: 'Apple Podcasts', url: '#' },
      { label: 'Spotify', url: '#' },
      { label: 'YouTube', url: '#' },
      { label: 'RSS Feed', url: '#' },
    ],
  },
}

export const episodeList: SectionBlueprint = {
  id: 'episode-list',
  type: 'cards',
  variant: 'grid',
  dataOverrides: {
    headline: 'Latest Episodes',
    items: [
      { headline: 'Episode 1', paragraph: 'Episode description' },
      { headline: 'Episode 2', paragraph: 'Episode description' },
    ],
  },
}

export const artistRoster: SectionBlueprint = {
  id: 'artist-roster',
  type: 'cards',
  variant: 'grid',
  dataOverrides: {
    headline: 'Artists',
    items: [
      { headline: 'Artist Name', subheadline: 'Genre' },
      { headline: 'Artist Name', subheadline: 'Genre' },
    ],
  },
}

export const festivalLineup: SectionBlueprint = {
  id: 'festival-lineup',
  type: 'cards',
  variant: 'grid',
  dataOverrides: {
    headline: 'Lineup',
    items: [
      { headline: 'Headliner', subheadline: 'Day 1' },
      { headline: 'Featured Artist', subheadline: 'Day 2' },
    ],
  },
}

export const studioServices: SectionBlueprint = {
  id: 'studio-services',
  type: 'services',
  variant: 'list',
  dataOverrides: {
    headline: 'Services',
    useCase: 'faq',
    items: [
      { headline: 'Recording', content: 'Professional studio recording' },
      { headline: 'Mixing', content: 'Industry-standard mixing' },
      { headline: 'Mastering', content: 'Final polish for your tracks' },
    ],
  },
}

export const musicPortfolio: SectionBlueprint = {
  id: 'music-portfolio',
  type: 'gallery',
  variant: 'grid',
  dataOverrides: {
    headline: 'Portfolio',
  },
}

export const lessonTypes: SectionBlueprint = {
  id: 'lesson-types',
  type: 'services',
  variant: 'list',
  dataOverrides: {
    headline: 'Lessons Offered',
    useCase: 'faq',
    items: [
      { headline: 'Piano Lessons', content: 'All levels welcome' },
      { headline: 'Guitar Lessons', content: 'Acoustic and electric' },
      { headline: 'Voice Lessons', content: 'Vocal technique and performance' },
    ],
  },
}

export const subscribeNewsletter: SectionBlueprint = {
  id: 'subscribe-newsletter',
  type: 'subscribe',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Stay Updated',
    paragraph: 'Get the latest news and updates delivered to your inbox.',
    emailPlaceholder: 'Enter your email',
    submitButton: { label: 'Subscribe', url: '#' },
  },
}

export const musicSubscribe: SectionBlueprint = {
  id: 'music-subscribe',
  type: 'subscribe',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Join the Mailing List',
    paragraph: 'Be the first to hear about new releases, tour dates, and exclusive content.',
    emailPlaceholder: 'Your email',
    submitButton: { label: 'Sign Up', url: '#' },
  },
}

export const fanClubSubscribe: SectionBlueprint = {
  id: 'fan-club-subscribe',
  type: 'subscribe',
  variant: 'split',
  dataOverrides: {
    headline: 'Join the Fan Club',
    paragraph: 'Get early access to tickets, exclusive merch, and behind-the-scenes content.',
    emailPlaceholder: 'Enter your email',
    submitButton: { label: 'Join Now', url: '#' },
  },
}

// ============================================
// EXPORT ALL
// ============================================

export const musicBlueprints: SectionBlueprint[] = [
  artistHero,
  albumHero,
  djHero,
  podcastHero,
  labelHero,
  studioHero,
  festivalHero,
  composerHero,
  teacherHero,
  streamingLinks,
  tourDates,
  merchStore,
  podcastPlatforms,
  episodeList,
  artistRoster,
  festivalLineup,
  studioServices,
  musicPortfolio,
  lessonTypes,
  subscribeNewsletter,
  musicSubscribe,
  fanClubSubscribe,
]
