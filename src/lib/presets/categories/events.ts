import type { PresetCategory, UseCasePreset } from '../types'

export const eventLandingPreset: UseCasePreset = {
  id: 'event-landing',
  name: 'Event Landing Page',
  description: 'Promote any type of event',
  icon: 'calendar',
  categoryId: 'events',
  themeId: 'bold',
  sections: [
    'simple-header',
    'event-hero',
    'gallery-section',
    'faq-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['event', 'landing', 'tickets'],
}

export const concertPartyPreset: UseCasePreset = {
  id: 'concert-party',
  name: 'Concert / Party',
  description: 'Promote your show or party',
  icon: 'music',
  categoryId: 'events',
  themeId: 'bold',
  sections: [
    'simple-header',
    'event-hero',
    'gallery-section',
    'cta-section',
    'default-footer',
  ],
  tags: ['concert', 'party', 'show', 'live music', 'nightlife'],
}

export const bookingPreset: UseCasePreset = {
  id: 'booking',
  name: 'Booking',
  description: 'Let clients book appointments',
  icon: 'clock',
  categoryId: 'events',
  themeId: 'modern',
  sections: [
    'simple-header',
    'event-hero',
    'services-grid',
    'faq-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['booking', 'appointment', 'schedule', 'calendar'],
}

export const conferencePreset: UseCasePreset = {
  id: 'conference',
  name: 'Conference',
  description: 'Multi-day conference with speakers',
  icon: 'users',
  categoryId: 'events',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'event-hero',
    'gallery-section',
    'faq-section',
    'cta-section',
    'default-footer',
  ],
  tags: ['conference', 'summit', 'speakers', 'networking'],
}

export const workshopPreset: UseCasePreset = {
  id: 'workshop',
  name: 'Workshop',
  description: 'Hands-on learning event',
  icon: 'tool',
  categoryId: 'events',
  themeId: 'modern',
  sections: [
    'simple-header',
    'event-hero',
    'faq-section',
    'cta-section',
    'default-footer',
  ],
  tags: ['workshop', 'training', 'hands-on', 'learning'],
}

export const webinarPreset: UseCasePreset = {
  id: 'webinar',
  name: 'Webinar',
  description: 'Online presentation or training',
  icon: 'video',
  categoryId: 'events',
  themeId: 'modern',
  sections: [
    'simple-header',
    'event-hero',
    'faq-section',
    'default-footer',
  ],
  tags: ['webinar', 'online', 'virtual', 'presentation'],
}

export const meetupPreset: UseCasePreset = {
  id: 'meetup',
  name: 'Meetup',
  description: 'Community gathering',
  icon: 'users',
  categoryId: 'events',
  themeId: 'modern',
  sections: [
    'simple-header',
    'event-hero',
    'gallery-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['meetup', 'community', 'gathering', 'networking'],
}

export const retreatPreset: UseCasePreset = {
  id: 'retreat',
  name: 'Retreat',
  description: 'Immersive getaway experience',
  icon: 'sun',
  categoryId: 'events',
  themeId: 'modern',
  sections: [
    'simple-header',
    'event-hero',
    'gallery-section',
    'faq-section',
    'cta-section',
    'default-footer',
  ],
  tags: ['retreat', 'wellness', 'getaway', 'immersive'],
}

export const exhibitionPreset: UseCasePreset = {
  id: 'exhibition',
  name: 'Exhibition / Gallery Show',
  description: 'Art exhibition or gallery opening',
  icon: 'frame',
  categoryId: 'events',
  themeId: 'modern',
  sections: [
    'simple-header',
    'event-hero',
    'gallery-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['exhibition', 'gallery', 'art', 'show', 'opening'],
}

export const popupShopPreset: UseCasePreset = {
  id: 'popup-shop',
  name: 'Pop-up Shop',
  description: 'Temporary retail experience',
  icon: 'shopping-bag',
  categoryId: 'events',
  themeId: 'bold',
  sections: [
    'simple-header',
    'event-hero',
    'gallery-section',
    'subscribe-newsletter',
    'default-footer',
  ],
  tags: ['popup', 'shop', 'retail', 'temporary', 'store'],
}

export const eventsCategory: PresetCategory = {
  id: 'events',
  name: 'Events & Experiences',
  description: 'Conferences, workshops, and live experiences',
  icon: 'calendar',
  order: 5,
  useCases: [
    'event-landing',
    'concert-party',
    'booking',
    'conference',
    'workshop',
    'webinar',
    'meetup',
    'retreat',
    'exhibition',
    'popup-shop',
  ],
}

export const eventsPresets = {
  eventLandingPreset,
  concertPartyPreset,
  bookingPreset,
  conferencePreset,
  workshopPreset,
  webinarPreset,
  meetupPreset,
  retreatPreset,
  exhibitionPreset,
  popupShopPreset,
}
