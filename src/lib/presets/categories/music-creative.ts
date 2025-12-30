import type { PresetCategory, UseCasePreset } from '../types'

// ============================================
// USE CASE PRESETS
// ============================================

export const artistBandPreset: UseCasePreset = {
  id: 'artist-band',
  name: 'Artist / Band',
  description: 'Showcase your music, tour dates, and connect with fans',
  icon: 'music',
  categoryId: 'music-creative',
  themeId: 'bold',
  sections: [
    'simple-header',
    'artist-hero',
    'streaming-links',
    'tour-dates',
    'gallery-section',
    'merch-store',
    'subscribe-newsletter',
    'default-footer',
  ],
  tags: ['music', 'artist', 'band', 'musician', 'singer'],
}

export const albumPresavePreset: UseCasePreset = {
  id: 'album-presave',
  name: 'Album or Single Pre-save',
  description: 'Build hype for your upcoming release',
  icon: 'music-note',
  categoryId: 'music-creative',
  themeId: 'modern',
  sections: [
    'simple-header',
    'album-hero',
    'streaming-links',
    'subscribe-newsletter',
    'default-footer',
  ],
  tags: ['music', 'album', 'presave', 'release', 'single'],
}

export const tourShowPreset: UseCasePreset = {
  id: 'tour-show-dates',
  name: 'Tour / Show Dates',
  description: 'Promote your upcoming shows and tours',
  icon: 'ticket',
  categoryId: 'music-creative',
  themeId: 'bold',
  sections: [
    'simple-header',
    'artist-hero',
    'tour-dates',
    'streaming-links',
    'default-footer',
  ],
  tags: ['music', 'tour', 'concert', 'shows', 'live'],
}

export const djProducerPreset: UseCasePreset = {
  id: 'dj-producer',
  name: 'DJ / Producer',
  description: 'Bookings, mixes, and upcoming shows',
  icon: 'control-panel',
  categoryId: 'music-creative',
  themeId: 'bold',
  sections: [
    'simple-header',
    'dj-hero',
    'streaming-links',
    'tour-dates',
    'gallery-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['music', 'dj', 'producer', 'electronic', 'edm'],
}

export const labelCollectivePreset: UseCasePreset = {
  id: 'label-collective',
  name: 'Label / Collective',
  description: 'Showcase your roster and releases',
  icon: 'tag',
  categoryId: 'music-creative',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'label-hero',
    'artist-roster',
    'streaming-links',
    'contact-section',
    'default-footer',
  ],
  tags: ['music', 'label', 'collective', 'records'],
}

export const studioServicesPreset: UseCasePreset = {
  id: 'studio-services',
  name: 'Studio / Services',
  description: 'Promote your recording and production services',
  icon: 'microphone',
  categoryId: 'music-creative',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'studio-hero',
    'studio-services',
    'gallery-section',
    'faq-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['music', 'studio', 'recording', 'production', 'mixing'],
}

export const musicFestivalPreset: UseCasePreset = {
  id: 'music-festival',
  name: 'Music Festival',
  description: 'Promote your festival with lineup and tickets',
  icon: 'star',
  categoryId: 'music-creative',
  themeId: 'bold',
  sections: [
    'centeredHeader',
    'festival-hero',
    'festival-lineup',
    'tour-dates',
    'faq-section',
    'subscribe-newsletter',
    'default-footer',
  ],
  tags: ['music', 'festival', 'concert', 'event'],
}

export const podcastPreset: UseCasePreset = {
  id: 'podcast',
  name: 'Podcast',
  description: 'Grow your podcast audience',
  icon: 'mic',
  categoryId: 'music-creative',
  themeId: 'modern',
  sections: [
    'simple-header',
    'podcast-hero',
    'podcast-platforms',
    'episode-list',
    'subscribe-newsletter',
    'default-footer',
  ],
  tags: ['podcast', 'audio', 'show', 'episodes'],
}

export const audiobookPreset: UseCasePreset = {
  id: 'audiobook',
  name: 'Audiobook / Spoken Word',
  description: 'Promote your audiobook or spoken word content',
  icon: 'book',
  categoryId: 'music-creative',
  themeId: 'modern',
  sections: [
    'simple-header',
    'album-hero',
    'streaming-links',
    'faq-section',
    'default-footer',
  ],
  tags: ['audiobook', 'audio', 'book', 'spoken word'],
}

export const soundDesignerPreset: UseCasePreset = {
  id: 'sound-designer',
  name: 'Sound Designer',
  description: 'Showcase your sound design work',
  icon: 'waveform',
  categoryId: 'music-creative',
  themeId: 'bold',
  sections: [
    'simple-header',
    'composer-hero',
    'music-portfolio',
    'studio-services',
    'contact-section',
    'default-footer',
  ],
  tags: ['sound', 'design', 'audio', 'sfx', 'foley'],
}

export const composerPreset: UseCasePreset = {
  id: 'composer',
  name: 'Composer',
  description: 'Film, TV, and game composition portfolio',
  icon: 'music-note',
  categoryId: 'music-creative',
  themeId: 'modern',
  sections: [
    'simple-header',
    'composer-hero',
    'music-portfolio',
    'studio-services',
    'contact-section',
    'default-footer',
  ],
  tags: ['composer', 'film', 'tv', 'games', 'score'],
}

export const musicTeacherPreset: UseCasePreset = {
  id: 'music-teacher',
  name: 'Music Teacher',
  description: 'Offer music lessons and grow your student base',
  icon: 'graduation',
  categoryId: 'music-creative',
  themeId: 'modern',
  sections: [
    'simple-header',
    'music-teacher-hero',
    'lesson-types',
    'faq-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['music', 'teacher', 'lessons', 'piano', 'guitar'],
}

// ============================================
// CATEGORY DEFINITION
// ============================================

export const musicCreativeCategory: PresetCategory = {
  id: 'music-creative',
  name: 'Music & Creative',
  description: 'For artists, labels, and music professionals',
  icon: 'music',
  order: 1,
  useCases: [
    'artist-band',
    'album-presave',
    'tour-show-dates',
    'dj-producer',
    'label-collective',
    'studio-services',
    'music-festival',
    'podcast',
    'audiobook',
    'sound-designer',
    'composer',
    'music-teacher',
  ],
}

// ============================================
// EXPORT ALL PRESETS
// ============================================

export const musicPresets = {
  artistBandPreset,
  albumPresavePreset,
  tourShowPreset,
  djProducerPreset,
  labelCollectivePreset,
  studioServicesPreset,
  musicFestivalPreset,
  podcastPreset,
  audiobookPreset,
  soundDesignerPreset,
  composerPreset,
  musicTeacherPreset,
}
