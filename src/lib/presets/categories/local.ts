import type { PresetCategory, UseCasePreset } from '../types'

export const realEstatePreset: UseCasePreset = {
  id: 'real-estate',
  name: 'Real Estate Agent',
  description: 'Showcase listings and generate leads',
  icon: 'home',
  categoryId: 'local',
  themeId: 'modern',
  sections: [
    'simple-header',
    'real-estate-hero',
    'gallery-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['real estate', 'realtor', 'agent'],
}

export const constructionPreset: UseCasePreset = {
  id: 'construction',
  name: 'Construction / Renovation',
  description: 'Showcase your projects and get quotes',
  icon: 'hammer',
  categoryId: 'local',
  themeId: 'bold',
  sections: [
    'centeredHeader',
    'real-estate-hero',
    'services-grid',
    'gallery-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['construction', 'renovation', 'contractor', 'building'],
}

export const landscapingPreset: UseCasePreset = {
  id: 'landscaping',
  name: 'Landscaping',
  description: 'Beautiful lawns and outdoor spaces',
  icon: 'tree',
  categoryId: 'local',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'real-estate-hero',
    'services-grid',
    'gallery-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['landscaping', 'lawn', 'garden', 'outdoor'],
}

export const cleaningPreset: UseCasePreset = {
  id: 'cleaning',
  name: 'Cleaning Services',
  description: 'Professional cleaning for homes and offices',
  icon: 'spray',
  categoryId: 'local',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'real-estate-hero',
    'services-grid',
    'pricing-packages',
    'faq-section',
    'booking-cta',
    'default-footer',
  ],
  tags: ['cleaning', 'maid', 'housekeeping', 'janitorial'],
}

export const autoRepairPreset: UseCasePreset = {
  id: 'auto-repair',
  name: 'Auto Repair',
  description: 'Trusted auto service and repair',
  icon: 'car',
  categoryId: 'local',
  themeId: 'bold',
  sections: [
    'centeredHeader',
    'real-estate-hero',
    'services-grid',
    'hours-location',
    'default-footer',
  ],
  tags: ['auto', 'repair', 'mechanic', 'car', 'service'],
}

export const gymFitnessPreset: UseCasePreset = {
  id: 'gym-fitness',
  name: 'Gym / Fitness Studio',
  description: 'Memberships, classes, and facilities',
  icon: 'dumbbell',
  categoryId: 'local',
  themeId: 'bold',
  sections: [
    'centeredHeader',
    'real-estate-hero',
    'pricing-packages',
    'gallery-section',
    'hours-location',
    'default-footer',
  ],
  tags: ['gym', 'fitness', 'workout', 'training'],
}

export const yogaPilatesPreset: UseCasePreset = {
  id: 'yoga-pilates',
  name: 'Yoga / Pilates Studio',
  description: 'Classes, schedules, and community',
  icon: 'heart',
  categoryId: 'local',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'real-estate-hero',
    'pricing-packages',
    'gallery-section',
    'hours-location',
    'default-footer',
  ],
  tags: ['yoga', 'pilates', 'wellness', 'studio', 'classes'],
}

export const tattooShopPreset: UseCasePreset = {
  id: 'tattoo-shop',
  name: 'Tattoo Shop',
  description: 'Showcase your art and book consultations',
  icon: 'pen',
  categoryId: 'local',
  themeId: 'bold',
  sections: [
    'centeredHeader',
    'real-estate-hero',
    'gallery-section',
    'faq-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['tattoo', 'ink', 'art', 'piercing'],
}

export const hairSalonPreset: UseCasePreset = {
  id: 'hair-salon',
  name: 'Hair Salon / Barber',
  description: 'Services, stylists, and appointments',
  icon: 'scissors',
  categoryId: 'local',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'real-estate-hero',
    'services-grid',
    'gallery-section',
    'booking-cta',
    'default-footer',
  ],
  tags: ['salon', 'hair', 'barber', 'stylist', 'beauty'],
}

export const localCategory: PresetCategory = {
  id: 'local',
  name: 'Local & IRL Businesses',
  description: 'Service businesses and local shops',
  icon: 'map-marker',
  order: 8,
  useCases: [
    'real-estate',
    'construction',
    'landscaping',
    'cleaning',
    'auto-repair',
    'gym-fitness',
    'yoga-pilates',
    'tattoo-shop',
    'hair-salon',
  ],
}

export const localPresets = {
  realEstatePreset,
  constructionPreset,
  landscapingPreset,
  cleaningPreset,
  autoRepairPreset,
  gymFitnessPreset,
  yogaPilatesPreset,
  tattooShopPreset,
  hairSalonPreset,
}
