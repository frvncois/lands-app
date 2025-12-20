import type { SectionBlock, PageSettings, UseCaseCategory, ButtonSettings } from '@/types/designer'
import {
  createSectionBlock,
  getDefaultPageSettings,
  generateId,
} from './designer-utils'

// Re-export UseCaseCategory from editor types
export type { UseCaseCategory } from '@/types/designer'

// ============================================
// INTERFACES
// ============================================

export interface UseCase {
  id: UseCaseCategory
  name: string
  description: string
  icon: string
}

export interface ContentSection {
  id: string
  name: string
  description: string
  icon: string
}

export interface UseCaseSections {
  useCase: UseCaseCategory
  sections: string[] // Section IDs
  defaultSelected: string[] // Pre-selected section IDs
}

export interface ColorPalette {
  id: string
  name: string
  colors: {
    background: string
    foreground: string
    primary: string
    secondary: string
    accent: string
    muted: string
  }
  isDark: boolean
}

export interface StylePreset {
  id: string
  name: string
  description: string
  fontHeading: string
  fontBody: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

export interface LayoutStyle {
  id: string
  name: string
  description: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  spacing: 'compact' | 'comfortable' | 'spacious'
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'dramatic'
  borderStyle: 'none' | 'subtle' | 'defined' | 'bold'
  visualWeight: 'light' | 'balanced' | 'heavy'
}

export interface ProjectLayout {
  id: string
  name: string
  description: string
  useCase: UseCaseCategory
  thumbnail?: string
  pageSettings: PageSettings
  blocks: SectionBlock[]
}

// Available use cases
export const USE_CASES: UseCase[] = [
  {
    id: 'personal',
    name: 'Personal & Bio',
    description: 'Personal websites and about me pages',
    icon: 'lni-user-4',
  },
  {
    id: 'links',
    name: 'Links & Social',
    description: 'Link hub for social media profiles',
    icon: 'lni-link',
  },
  {
    id: 'portfolio',
    name: 'Portfolio & Work',
    description: 'Showcase creative work and projects',
    icon: 'lni-briefcase-1',
  },
  {
    id: 'services',
    name: 'Services & Freelance',
    description: 'Professional services and booking',
    icon: 'lni-handshake',
  },
  {
    id: 'startup',
    name: 'Startup & Business',
    description: 'Company and product landing pages',
    icon: 'lni-rocket-3',
  },
  {
    id: 'product',
    name: 'Product & Launch',
    description: 'New product announcements',
    icon: 'lni-gift',
  },
  {
    id: 'event',
    name: 'Event & Conference',
    description: 'Conferences, meetups, and parties',
    icon: 'lni-calendar-2',
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Menu',
    description: 'Menu, hours, and location info',
    icon: 'lni-restaurant',
  },
  {
    id: 'creator',
    name: 'Creator & Artist',
    description: 'Musicians, artists, and creators',
    icon: 'lni-brush',
  },
  {
    id: 'newsletter',
    name: 'Newsletter & Signup',
    description: 'Email capture and subscriptions',
    icon: 'lni-envelope-1',
  },
  {
    id: 'wedding',
    name: 'Wedding & Celebration',
    description: 'Save the date and event details',
    icon: 'lni-heart',
  },
  {
    id: 'nonprofit',
    name: 'Nonprofit & Cause',
    description: 'Charity and cause awareness',
    icon: 'lni-world-2',
  },
]

// ============================================
// CONTENT SECTIONS
// ============================================

export const CONTENT_SECTIONS: ContentSection[] = [
  { id: 'hero', name: 'Hero', description: 'Main banner with headline', icon: 'lni-layout-11' },
  { id: 'about', name: 'About', description: 'Introduction and story', icon: 'lni-user-4' },
  { id: 'features', name: 'Features', description: 'Key features or benefits', icon: 'lni-star' },
  { id: 'services', name: 'Services', description: 'What you offer', icon: 'lni-briefcase-1' },
  { id: 'portfolio', name: 'Portfolio', description: 'Showcase your work', icon: 'lni-image' },
  { id: 'gallery', name: 'Gallery', description: 'Photo gallery', icon: 'lni-gallery' },
  { id: 'pricing', name: 'Pricing', description: 'Plans and pricing', icon: 'lni-tag' },
  { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews', icon: 'lni-quotation' },
  { id: 'team', name: 'Team', description: 'Team members', icon: 'lni-users-2' },
  { id: 'faq', name: 'FAQ', description: 'Frequently asked questions', icon: 'lni-question-circle' },
  { id: 'contact', name: 'Contact', description: 'Contact information', icon: 'lni-envelope-1' },
  { id: 'cta', name: 'Call to Action', description: 'Conversion section', icon: 'lni-pointer-right' },
  { id: 'newsletter', name: 'Newsletter', description: 'Email signup form', icon: 'lni-inbox' },
  { id: 'social', name: 'Social Links', description: 'Social media links', icon: 'lni-share' },
  { id: 'links', name: 'Links', description: 'List of links', icon: 'lni-link' },
  { id: 'menu', name: 'Menu', description: 'Food or service menu', icon: 'lni-restaurant' },
  { id: 'schedule', name: 'Schedule', description: 'Event agenda or timeline', icon: 'lni-calendar-2' },
  { id: 'location', name: 'Location', description: 'Address and map', icon: 'lni-map-marker-1' },
  { id: 'speakers', name: 'Speakers', description: 'Event speakers or guests', icon: 'lni-mic-1' },
  { id: 'rsvp', name: 'RSVP', description: 'Event registration', icon: 'lni-ticket-1' },
  { id: 'story', name: 'Our Story', description: 'Your journey or history', icon: 'lni-book-open-1' },
  { id: 'impact', name: 'Impact', description: 'Stats and achievements', icon: 'lni-graph' },
  { id: 'donate', name: 'Donate', description: 'Donation call to action', icon: 'lni-heart' },
  { id: 'media', name: 'Media', description: 'Videos or music', icon: 'lni-play' },
  { id: 'shop', name: 'Shop', description: 'Products or merch', icon: 'lni-shopping-cart-1' },
]

// ============================================
// USE CASE SPECIFIC GOALS
// ============================================

export interface UseCaseGoal {
  id: string
  name: string
  description: string
  icon: string
}

export interface UseCaseGoalConfig {
  useCase: UseCaseCategory
  goals: UseCaseGoal[]
}

// Goals mapped to each use case
export const USE_CASE_GOALS: UseCaseGoalConfig[] = [
  // ===== PERSONAL & BIO =====
  {
    useCase: 'personal',
    goals: [
      { id: 'personal-landing', name: 'Personal Landing Page', description: 'Simple about me page', icon: 'lni-user-4' },
      { id: 'personal-resume', name: 'Online Resume', description: 'Showcase experience & skills', icon: 'lni-graduation' },
      { id: 'personal-blog', name: 'Blog / Writing', description: 'Share articles and thoughts', icon: 'lni-pencil-1' },
      { id: 'personal-contact', name: 'Contact Page', description: 'Let people reach you', icon: 'lni-envelope-1' },
    ],
  },

  // ===== LINKS & SOCIAL =====
  {
    useCase: 'links',
    goals: [
      { id: 'links-bio', name: 'Link in Bio', description: 'All your links in one place', icon: 'lni-link' },
      { id: 'links-social', name: 'Social Hub', description: 'Connect all social profiles', icon: 'lni-network' },
      { id: 'links-store', name: 'Mini Store', description: 'Links to products & merch', icon: 'lni-shopping-basket' },
      { id: 'links-content', name: 'Content Links', description: 'Latest videos, posts, etc.', icon: 'lni-play' },
    ],
  },

  // ===== PORTFOLIO & WORK =====
  {
    useCase: 'portfolio',
    goals: [
      { id: 'portfolio-showcase', name: 'Work Showcase', description: 'Display your best projects', icon: 'lni-gallery' },
      { id: 'portfolio-case-studies', name: 'Case Studies', description: 'Deep dive into projects', icon: 'lni-book' },
      { id: 'portfolio-hire', name: 'Get Hired', description: 'Attract job opportunities', icon: 'lni-briefcase-1' },
      { id: 'portfolio-clients', name: 'Win Clients', description: 'Convert visitors to clients', icon: 'lni-handshake' },
    ],
  },

  // ===== SERVICES & FREELANCE =====
  {
    useCase: 'services',
    goals: [
      { id: 'services-booking', name: 'Book Services', description: 'Get appointments & calls', icon: 'lni-calendar-2' },
      { id: 'services-showcase', name: 'Service Showcase', description: 'Display what you offer', icon: 'lni-cog' },
      { id: 'services-pricing', name: 'Show Pricing', description: 'Transparent pricing page', icon: 'lni-money-protection' },
      { id: 'services-leads', name: 'Generate Leads', description: 'Collect inquiries', icon: 'lni-envelope-1' },
    ],
  },

  // ===== STARTUP & BUSINESS =====
  {
    useCase: 'startup',
    goals: [
      { id: 'startup-launch', name: 'Launch Page', description: 'Announce your startup', icon: 'lni-rocket-3' },
      { id: 'startup-waitlist', name: 'Build Waitlist', description: 'Collect early signups', icon: 'lni-users-2' },
      { id: 'startup-investors', name: 'Attract Investors', description: 'Pitch to VCs & angels', icon: 'lni-investment' },
      { id: 'startup-hiring', name: 'We\'re Hiring', description: 'Recruit team members', icon: 'lni-add-user' },
    ],
  },

  // ===== PRODUCT & LAUNCH =====
  {
    useCase: 'product',
    goals: [
      { id: 'product-launch', name: 'Product Launch', description: 'Announce new product', icon: 'lni-gift' },
      { id: 'product-preorder', name: 'Pre-orders', description: 'Collect pre-launch orders', icon: 'lni-shopping-basket' },
      { id: 'product-waitlist', name: 'Waitlist', description: 'Build anticipation', icon: 'lni-timer' },
      { id: 'product-sales', name: 'Direct Sales', description: 'Sell product directly', icon: 'lni-cart' },
    ],
  },

  // ===== EVENT & CONFERENCE =====
  {
    useCase: 'event',
    goals: [
      { id: 'event-tickets', name: 'Sell Tickets', description: 'Event ticket sales', icon: 'lni-ticket-1' },
      { id: 'event-rsvp', name: 'Collect RSVPs', description: 'Free event registration', icon: 'lni-checkmark-circle' },
      { id: 'event-info', name: 'Event Info', description: 'Share schedule & details', icon: 'lni-information' },
      { id: 'event-speakers', name: 'Speaker Lineup', description: 'Showcase speakers', icon: 'lni-mic' },
    ],
  },

  // ===== RESTAURANT & MENU =====
  {
    useCase: 'restaurant',
    goals: [
      { id: 'restaurant-menu', name: 'Show Menu', description: 'Display food & drinks', icon: 'lni-dinner' },
      { id: 'restaurant-reservation', name: 'Reservations', description: 'Book tables online', icon: 'lni-calendar-2' },
      { id: 'restaurant-order', name: 'Online Orders', description: 'Takeout & delivery', icon: 'lni-delivery' },
      { id: 'restaurant-info', name: 'Location & Hours', description: 'Find us easily', icon: 'lni-map-marker' },
    ],
  },

  // ===== CREATOR & ARTIST =====
  {
    useCase: 'creator',
    goals: [
      { id: 'creator-landing', name: 'Artist Landing', description: 'Your creative home', icon: 'lni-brush' },
      { id: 'creator-release', name: 'New Release', description: 'Promote single/album/work', icon: 'lni-music' },
      { id: 'creator-tour', name: 'Tour / Shows', description: 'Upcoming performances', icon: 'lni-map' },
      { id: 'creator-merch', name: 'Sell Merch', description: 'Merchandise store', icon: 'lni-tshirt' },
      { id: 'creator-epk', name: 'Press Kit', description: 'Media & booking info', icon: 'lni-folder' },
    ],
  },

  // ===== NEWSLETTER & SIGNUP =====
  {
    useCase: 'newsletter',
    goals: [
      { id: 'newsletter-subscribe', name: 'Newsletter Signup', description: 'Grow your list', icon: 'lni-envelope-1' },
      { id: 'newsletter-lead', name: 'Lead Magnet', description: 'Free download for email', icon: 'lni-download' },
      { id: 'newsletter-community', name: 'Join Community', description: 'Discord/Slack invite', icon: 'lni-users-2' },
      { id: 'newsletter-course', name: 'Free Course', description: 'Email course signup', icon: 'lni-graduation' },
    ],
  },

  // ===== WEDDING & CELEBRATION =====
  {
    useCase: 'wedding',
    goals: [
      { id: 'wedding-savedate', name: 'Save the Date', description: 'Announce your wedding', icon: 'lni-heart' },
      { id: 'wedding-rsvp', name: 'Collect RSVPs', description: 'Guest responses', icon: 'lni-checkmark-circle' },
      { id: 'wedding-info', name: 'Wedding Info', description: 'Schedule & venue details', icon: 'lni-information' },
      { id: 'wedding-registry', name: 'Gift Registry', description: 'Link to registries', icon: 'lni-gift' },
    ],
  },

  // ===== NONPROFIT & CAUSE =====
  {
    useCase: 'nonprofit',
    goals: [
      { id: 'nonprofit-donate', name: 'Collect Donations', description: 'Fundraising page', icon: 'lni-heart' },
      { id: 'nonprofit-awareness', name: 'Raise Awareness', description: 'Share your mission', icon: 'lni-world-2' },
      { id: 'nonprofit-volunteer', name: 'Recruit Volunteers', description: 'Get people involved', icon: 'lni-users-2' },
      { id: 'nonprofit-event', name: 'Charity Event', description: 'Promote fundraiser', icon: 'lni-calendar-2' },
    ],
  },
]

// ============================================
// GOAL → SECTION WEIGHTS
// ============================================

// Section weights for each goal (higher = more important, will be included)
export const GOAL_SECTION_WEIGHTS: Record<string, Record<string, number>> = {
  // ----- PERSONAL -----
  'personal-landing': {
    hero: 1.0, about: 1.0, social: 0.8, contact: 0.7,
  },
  'personal-resume': {
    hero: 1.0, about: 0.9, portfolio: 0.9, testimonials: 0.7, contact: 0.8,
  },
  'personal-blog': {
    hero: 0.9, about: 0.8, portfolio: 1.0, newsletter: 0.7, social: 0.6,
  },
  'personal-contact': {
    hero: 0.8, about: 0.7, contact: 1.0, social: 0.6,
  },

  // ----- LINKS -----
  'links-bio': {
    hero: 0.9, links: 1.0, social: 0.9, about: 0.5,
  },
  'links-social': {
    hero: 0.8, social: 1.0, links: 0.8, about: 0.5,
  },
  'links-store': {
    hero: 0.8, links: 1.0, portfolio: 0.7, social: 0.6,
  },
  'links-content': {
    hero: 0.9, links: 1.0, social: 0.8, newsletter: 0.6,
  },

  // ----- PORTFOLIO -----
  'portfolio-showcase': {
    hero: 1.0, about: 0.8, portfolio: 1.0, gallery: 0.7, contact: 0.6,
  },
  'portfolio-case-studies': {
    hero: 0.9, about: 0.8, portfolio: 1.0, testimonials: 0.7, contact: 0.7,
  },
  'portfolio-hire': {
    hero: 1.0, about: 0.9, portfolio: 1.0, testimonials: 0.8, contact: 1.0,
  },
  'portfolio-clients': {
    hero: 1.0, services: 0.8, portfolio: 1.0, testimonials: 0.9, pricing: 0.7, contact: 1.0,
  },

  // ----- SERVICES -----
  'services-booking': {
    hero: 1.0, services: 1.0, testimonials: 0.8, contact: 1.0, faq: 0.6,
  },
  'services-showcase': {
    hero: 1.0, services: 1.0, about: 0.7, testimonials: 0.7, contact: 0.8,
  },
  'services-pricing': {
    hero: 0.9, services: 1.0, pricing: 1.0, faq: 0.8, contact: 0.7,
  },
  'services-leads': {
    hero: 1.0, services: 0.9, testimonials: 0.8, contact: 1.0, newsletter: 0.7,
  },

  // ----- STARTUP -----
  'startup-launch': {
    hero: 1.0, features: 1.0, about: 0.7, testimonials: 0.6, cta: 1.0,
  },
  'startup-waitlist': {
    hero: 1.0, features: 0.8, newsletter: 1.0, testimonials: 0.5, cta: 0.9,
  },
  'startup-investors': {
    hero: 1.0, about: 0.9, features: 1.0, team: 0.9, testimonials: 0.7, contact: 0.8,
  },
  'startup-hiring': {
    hero: 1.0, about: 0.9, team: 1.0, features: 0.7, contact: 1.0,
  },

  // ----- PRODUCT -----
  'product-launch': {
    hero: 1.0, features: 1.0, testimonials: 0.8, faq: 0.7, cta: 1.0,
  },
  'product-preorder': {
    hero: 1.0, features: 0.9, pricing: 1.0, testimonials: 0.7, faq: 0.8, cta: 1.0,
  },
  'product-waitlist': {
    hero: 1.0, features: 0.8, newsletter: 1.0, testimonials: 0.6, cta: 0.9,
  },
  'product-sales': {
    hero: 1.0, features: 1.0, pricing: 1.0, testimonials: 0.9, faq: 0.8, cta: 1.0,
  },

  // ----- EVENT -----
  'event-tickets': {
    hero: 1.0, about: 0.7, schedule: 0.9, speakers: 0.7, location: 0.8, rsvp: 1.0,
  },
  'event-rsvp': {
    hero: 1.0, about: 0.8, schedule: 0.9, location: 0.9, rsvp: 1.0, faq: 0.6,
  },
  'event-info': {
    hero: 1.0, about: 0.9, schedule: 1.0, speakers: 0.8, location: 1.0, faq: 0.7,
  },
  'event-speakers': {
    hero: 0.9, speakers: 1.0, schedule: 0.9, about: 0.7, rsvp: 0.8,
  },

  // ----- RESTAURANT -----
  'restaurant-menu': {
    hero: 1.0, menu: 1.0, about: 0.6, gallery: 0.7, location: 0.8,
  },
  'restaurant-reservation': {
    hero: 0.9, menu: 0.8, about: 0.6, contact: 1.0, location: 0.9,
  },
  'restaurant-order': {
    hero: 0.9, menu: 1.0, contact: 0.9, location: 0.7,
  },
  'restaurant-info': {
    hero: 1.0, about: 0.8, menu: 0.7, location: 1.0, contact: 0.8,
  },

  // ----- CREATOR/ARTIST -----
  'creator-landing': {
    hero: 1.0, about: 0.9, portfolio: 0.9, social: 0.8, contact: 0.7,
  },
  'creator-release': {
    hero: 1.0, about: 0.6, media: 0.9, social: 0.9, links: 0.8, newsletter: 0.7,
  },
  'creator-tour': {
    hero: 1.0, schedule: 1.0, about: 0.6, location: 0.8, social: 0.7,
  },
  'creator-merch': {
    hero: 0.9, portfolio: 1.0, shop: 1.0, social: 0.7, newsletter: 0.6,
  },
  'creator-epk': {
    hero: 1.0, about: 1.0, portfolio: 0.9, gallery: 0.8, testimonials: 0.7, contact: 1.0,
  },

  // ----- NEWSLETTER -----
  'newsletter-subscribe': {
    hero: 1.0, features: 0.7, newsletter: 1.0, testimonials: 0.6, about: 0.5,
  },
  'newsletter-lead': {
    hero: 1.0, features: 0.9, newsletter: 1.0, testimonials: 0.7, faq: 0.5,
  },
  'newsletter-community': {
    hero: 1.0, about: 0.8, features: 0.7, newsletter: 1.0, social: 0.8,
  },
  'newsletter-course': {
    hero: 1.0, features: 1.0, testimonials: 0.8, newsletter: 1.0, faq: 0.7,
  },

  // ----- WEDDING -----
  'wedding-savedate': {
    hero: 1.0, story: 0.9, location: 0.8, rsvp: 0.7,
  },
  'wedding-rsvp': {
    hero: 1.0, story: 0.7, schedule: 0.9, location: 0.9, rsvp: 1.0, faq: 0.6,
  },
  'wedding-info': {
    hero: 1.0, story: 0.8, schedule: 1.0, location: 1.0, gallery: 0.6, faq: 0.8,
  },
  'wedding-registry': {
    hero: 0.9, story: 0.6, links: 1.0, rsvp: 0.7,
  },

  // ----- NONPROFIT -----
  'nonprofit-donate': {
    hero: 1.0, about: 0.9, impact: 1.0, testimonials: 0.8, donate: 1.0,
  },
  'nonprofit-awareness': {
    hero: 1.0, about: 1.0, impact: 0.9, testimonials: 0.7, social: 0.8, newsletter: 0.6,
  },
  'nonprofit-volunteer': {
    hero: 1.0, about: 0.9, impact: 0.8, contact: 1.0, faq: 0.6,
  },
  'nonprofit-event': {
    hero: 1.0, about: 0.7, schedule: 0.9, location: 0.8, rsvp: 1.0, donate: 0.8,
  },
}

// ============================================
// FONT PRESETS
// ============================================

export interface FontPreset {
  id: string
  name: string
  family: string
  category: 'sans-serif' | 'serif' | 'display' | 'monospace'
  googleFont: boolean
}

export const HEADING_FONTS: FontPreset[] = [
  { id: 'inter', name: 'Inter', family: 'Inter', category: 'sans-serif', googleFont: true },
  { id: 'geist', name: 'Geist', family: 'Geist', category: 'sans-serif', googleFont: false },
  { id: 'space-grotesk', name: 'Space Grotesk', family: 'Space Grotesk', category: 'sans-serif', googleFont: true },
  { id: 'sora', name: 'Sora', family: 'Sora', category: 'sans-serif', googleFont: true },
  { id: 'dm-sans', name: 'DM Sans', family: 'DM Sans', category: 'sans-serif', googleFont: true },
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display', category: 'serif', googleFont: true },
  { id: 'dm-serif', name: 'DM Serif Display', family: 'DM Serif Display', category: 'serif', googleFont: true },
  { id: 'lora', name: 'Lora', family: 'Lora', category: 'serif', googleFont: true },
]

export const BODY_FONTS: FontPreset[] = [
  { id: 'inter', name: 'Inter', family: 'Inter', category: 'sans-serif', googleFont: true },
  { id: 'dm-sans', name: 'DM Sans', family: 'DM Sans', category: 'sans-serif', googleFont: true },
  { id: 'outfit', name: 'Outfit', family: 'Outfit', category: 'sans-serif', googleFont: true },
  { id: 'manrope', name: 'Manrope', family: 'Manrope', category: 'sans-serif', googleFont: true },
  { id: 'source-serif', name: 'Source Serif Pro', family: 'Source Serif Pro', category: 'serif', googleFont: true },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather', category: 'serif', googleFont: true },
  { id: 'lora', name: 'Lora', family: 'Lora', category: 'serif', googleFont: true },
]

// ============================================
// USE CASE SECTIONS
// ============================================

// Map sections to use cases with defaults
export const USE_CASE_SECTIONS: UseCaseSections[] = [
  {
    useCase: 'personal',
    sections: ['hero', 'about', 'services', 'portfolio', 'contact', 'social'],
    defaultSelected: ['hero', 'about', 'portfolio', 'contact'],
  },
  {
    useCase: 'links',
    sections: ['hero', 'links', 'social', 'newsletter', 'about'],
    defaultSelected: ['hero', 'links', 'social'],
  },
  {
    useCase: 'portfolio',
    sections: ['hero', 'about', 'portfolio', 'gallery', 'services', 'testimonials', 'contact'],
    defaultSelected: ['hero', 'about', 'portfolio', 'contact'],
  },
  {
    useCase: 'services',
    sections: ['hero', 'about', 'services', 'portfolio', 'pricing', 'testimonials', 'faq', 'contact'],
    defaultSelected: ['hero', 'services', 'pricing', 'contact'],
  },
  {
    useCase: 'startup',
    sections: ['hero', 'features', 'about', 'pricing', 'testimonials', 'team', 'faq', 'cta', 'contact'],
    defaultSelected: ['hero', 'features', 'pricing', 'cta'],
  },
  {
    useCase: 'product',
    sections: ['hero', 'features', 'pricing', 'testimonials', 'faq', 'newsletter', 'cta'],
    defaultSelected: ['hero', 'features', 'cta', 'newsletter'],
  },
  {
    useCase: 'event',
    sections: ['hero', 'about', 'schedule', 'speakers', 'location', 'rsvp', 'faq', 'contact'],
    defaultSelected: ['hero', 'about', 'schedule', 'location', 'rsvp'],
  },
  {
    useCase: 'restaurant',
    sections: ['hero', 'about', 'menu', 'gallery', 'location', 'contact'],
    defaultSelected: ['hero', 'menu', 'location', 'contact'],
  },
  {
    useCase: 'creator',
    sections: ['hero', 'about', 'portfolio', 'gallery', 'media', 'shop', 'contact', 'social'],
    defaultSelected: ['hero', 'about', 'portfolio', 'social'],
  },
  {
    useCase: 'newsletter',
    sections: ['hero', 'features', 'newsletter', 'testimonials', 'faq', 'about'],
    defaultSelected: ['hero', 'features', 'newsletter'],
  },
  {
    useCase: 'wedding',
    sections: ['hero', 'story', 'schedule', 'location', 'gallery', 'rsvp', 'faq'],
    defaultSelected: ['hero', 'story', 'schedule', 'location', 'rsvp'],
  },
  {
    useCase: 'nonprofit',
    sections: ['hero', 'about', 'impact', 'services', 'team', 'testimonials', 'donate', 'contact'],
    defaultSelected: ['hero', 'about', 'impact', 'donate'],
  },
]

// ============================================
// COLOR PALETTES
// ============================================

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    colors: {
      background: '#ffffff',
      foreground: '#09090b',
      primary: '#18181b',
      secondary: '#f4f4f5',
      accent: '#3b82f6',
      muted: '#71717a',
    },
    isDark: false,
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    colors: {
      background: '#09090b',
      foreground: '#fafafa',
      primary: '#fafafa',
      secondary: '#27272a',
      accent: '#3b82f6',
      muted: '#a1a1aa',
    },
    isDark: true,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      background: '#f0f9ff',
      foreground: '#0c4a6e',
      primary: '#0284c7',
      secondary: '#e0f2fe',
      accent: '#06b6d4',
      muted: '#64748b',
    },
    isDark: false,
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      background: '#f0fdf4',
      foreground: '#14532d',
      primary: '#16a34a',
      secondary: '#dcfce7',
      accent: '#22c55e',
      muted: '#64748b',
    },
    isDark: false,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      background: '#fffbeb',
      foreground: '#78350f',
      primary: '#f59e0b',
      secondary: '#fef3c7',
      accent: '#ef4444',
      muted: '#78716c',
    },
    isDark: false,
  },
  {
    id: 'lavender',
    name: 'Lavender',
    colors: {
      background: '#faf5ff',
      foreground: '#581c87',
      primary: '#9333ea',
      secondary: '#f3e8ff',
      accent: '#d946ef',
      muted: '#6b7280',
    },
    isDark: false,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      background: '#0f172a',
      foreground: '#f1f5f9',
      primary: '#6366f1',
      secondary: '#1e293b',
      accent: '#8b5cf6',
      muted: '#94a3b8',
    },
    isDark: true,
  },
  {
    id: 'rose',
    name: 'Rose',
    colors: {
      background: '#fff1f2',
      foreground: '#881337',
      primary: '#e11d48',
      secondary: '#ffe4e6',
      accent: '#f43f5e',
      muted: '#71717a',
    },
    isDark: false,
  },
  {
    id: 'earth',
    name: 'Earth',
    colors: {
      background: '#fafaf9',
      foreground: '#292524',
      primary: '#78716c',
      secondary: '#f5f5f4',
      accent: '#a16207',
      muted: '#78716c',
    },
    isDark: false,
  },
  {
    id: 'neon',
    name: 'Neon',
    colors: {
      background: '#18181b',
      foreground: '#fafafa',
      primary: '#22d3ee',
      secondary: '#27272a',
      accent: '#f472b6',
      muted: '#a1a1aa',
    },
    isDark: true,
  },
]

// ============================================
// STYLE PRESETS
// ============================================

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary',
    fontHeading: 'Inter',
    fontBody: 'Inter',
    borderRadius: 'md',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless and elegant',
    fontHeading: 'Playfair Display',
    fontBody: 'Lora',
    borderRadius: 'sm',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Strong and impactful',
    fontHeading: 'Oswald',
    fontBody: 'Open Sans',
    borderRadius: 'none',
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Fun and friendly',
    fontHeading: 'Poppins',
    fontBody: 'Nunito',
    borderRadius: 'full',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and focused',
    fontHeading: 'DM Sans',
    fontBody: 'DM Sans',
    borderRadius: 'lg',
  },
]

// Layout styles
export const LAYOUT_STYLES: LayoutStyle[] = [
  {
    id: 'minimal',
    name: 'Minimal & Clean',
    description: 'Generous whitespace, subtle details',
    borderRadius: 'md',
    spacing: 'spacious',
    shadowIntensity: 'none',
    borderStyle: 'subtle',
    visualWeight: 'light',
  },
  {
    id: 'bold',
    name: 'Bold & Graphic',
    description: 'Strong contrasts, dramatic layouts',
    borderRadius: 'lg',
    spacing: 'comfortable',
    shadowIntensity: 'dramatic',
    borderStyle: 'bold',
    visualWeight: 'heavy',
  },
  {
    id: 'elegant',
    name: 'Elegant & Refined',
    description: 'Sophisticated, delicate details',
    borderRadius: 'sm',
    spacing: 'spacious',
    shadowIntensity: 'subtle',
    borderStyle: 'subtle',
    visualWeight: 'light',
  },
  {
    id: 'brutalist',
    name: 'Brutalist & Raw',
    description: 'Harsh edges, stark contrast',
    borderRadius: 'none',
    spacing: 'compact',
    shadowIntensity: 'none',
    borderStyle: 'bold',
    visualWeight: 'heavy',
  },
  {
    id: 'soft',
    name: 'Soft & Rounded',
    description: 'Friendly curves, gentle shadows',
    borderRadius: '2xl',
    spacing: 'comfortable',
    shadowIntensity: 'medium',
    borderStyle: 'none',
    visualWeight: 'balanced',
  },
  {
    id: 'editorial',
    name: 'Editorial & Magazine',
    description: 'Asymmetric, visual hierarchy',
    borderRadius: 'sm',
    spacing: 'comfortable',
    shadowIntensity: 'subtle',
    borderStyle: 'defined',
    visualWeight: 'balanced',
  },
]

// ============================================
// HELPER FUNCTIONS FOR PROJECT CREATION
// ============================================

export function getSectionsForUseCase(useCase: UseCaseCategory): {
  available: ContentSection[]
  defaultSelected: string[]
} {
  const mapping = USE_CASE_SECTIONS.find(m => m.useCase === useCase)
  if (!mapping) {
    return { available: [], defaultSelected: [] }
  }

  const available = mapping.sections
    .map(id => CONTENT_SECTIONS.find(s => s.id === id))
    .filter((s): s is ContentSection => s !== undefined)

  return {
    available,
    defaultSelected: mapping.defaultSelected,
  }
}

/**
 * Get goals available for a specific use case
 */
export function getGoalsForUseCase(useCase: UseCaseCategory): UseCaseGoal[] {
  const config = USE_CASE_GOALS.find(c => c.useCase === useCase)
  return config?.goals || []
}

/**
 * Get recommended sections based on use case and goal
 * Returns sections sorted by relevance with recommendations
 */
export function getRecommendedSections(
  useCase: UseCaseCategory,
  goalId: string
): { available: ContentSection[]; recommended: string[] } {
  // 1. Get base sections for use case
  const useCaseMapping = USE_CASE_SECTIONS.find(m => m.useCase === useCase)
  if (!useCaseMapping) {
    return { available: [], recommended: [] }
  }

  // 2. Get goal weights
  const goalWeights = GOAL_SECTION_WEIGHTS[goalId] || {}

  // 3. Score and sort sections
  const scoredSections = useCaseMapping.sections.map(sectionId => ({
    id: sectionId,
    score: goalWeights[sectionId] ?? 0.3, // Default weight for sections not in goal
  }))

  // Sort by score (highest first)
  scoredSections.sort((a, b) => b.score - a.score)

  // 4. Get recommended (score >= 0.6)
  const recommended = scoredSections
    .filter(s => s.score >= 0.6)
    .map(s => s.id)

  // 5. Map to ContentSection objects
  const available = useCaseMapping.sections
    .map(id => CONTENT_SECTIONS.find(s => s.id === id))
    .filter((s): s is ContentSection => s !== undefined)

  return { available, recommended }
}

export function getContentSectionById(id: string): ContentSection | undefined {
  return CONTENT_SECTIONS.find(s => s.id === id)
}

export function getColorPaletteById(id: string): ColorPalette | undefined {
  return COLOR_PALETTES.find(p => p.id === id)
}

export function getStylePresetById(id: string): StylePreset | undefined {
  return STYLE_PRESETS.find(s => s.id === id)
}

// ============================================
// PROJECT GENERATOR FROM WIZARD
// ============================================

export interface WizardSelections {
  useCase: UseCaseCategory
  sections: string[]
  layoutStyle: LayoutStyle
  palette: ColorPalette
  style: StylePreset
}

export interface GeneratedProject {
  pageSettings: PageSettings
  blocks: SectionBlock[]
}

/**
 * Generate a project from wizard selections
 */
export function generateProjectFromWizard(selections: WizardSelections): GeneratedProject {
  const { useCase, sections, layoutStyle, palette, style } = selections

  // Create page settings based on palette, style, and layout
  const pageSettings: PageSettings = {
    ...getDefaultPageSettings(),
    backgroundColor: palette.colors.background,
    textColor: palette.colors.foreground,
    fontFamily: style.fontBody,
    useCase,
  }

  // Add Google fonts for the style preset
  if (style.fontHeading !== 'Inter' || style.fontBody !== 'Inter') {
    pageSettings.googleFonts = []
    if (style.fontHeading !== 'Inter') {
      pageSettings.googleFonts.push({ family: style.fontHeading, category: 'sans-serif', variants: ['400', '500', '600', '700'] })
    }
    if (style.fontBody !== 'Inter' && style.fontBody !== style.fontHeading) {
      pageSettings.googleFonts.push({ family: style.fontBody, category: 'sans-serif', variants: ['400', '500', '600', '700'] })
    }
  }

  // Generate section blocks based on selections
  const sectionBlocks: SectionBlock[] = sections.map(sectionId => {
    return createSectionFromId(sectionId, layoutStyle, palette, style)
  })

  return {
    pageSettings,
    blocks: sectionBlocks,
  }
}

/**
 * Get spacing values based on layout style
 */
function getLayoutSpacing(layoutStyle: LayoutStyle): { section: { top: string; bottom: string; left: string; right: string }; gap: string } {
  switch (layoutStyle.spacing) {
    case 'compact':
      return { section: { top: '48', bottom: '48', left: '16', right: '16' }, gap: '16' }
    case 'spacious':
      return { section: { top: '120', bottom: '120', left: '32', right: '32' }, gap: '40' }
    case 'comfortable':
    default:
      return { section: { top: '80', bottom: '80', left: '24', right: '24' }, gap: '24' }
  }
}

/**
 * Get border radius value based on layout style
 */
function getLayoutBorderRadius(layoutStyle: LayoutStyle): string {
  switch (layoutStyle.borderRadius) {
    case 'none': return '0'
    case 'sm': return '4'
    case 'md': return '8'
    case 'lg': return '12'
    case 'xl': return '16'
    case '2xl': return '24'
    case 'full': return '9999'
    default: return '8'
  }
}

/**
 * Create a section block based on section ID
 */
function createSectionFromId(sectionId: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  const section = CONTENT_SECTIONS.find(s => s.id === sectionId)
  const sectionName = section?.name || sectionId

  // Get layout-based spacing
  const spacing = getLayoutSpacing(layoutStyle)
  const altBgColor = palette.isDark ? palette.colors.secondary : palette.colors.secondary

  // Create section based on type
  switch (sectionId) {
    case 'hero':
      return createHeroSection(sectionName, layoutStyle, palette, style)
    case 'about':
      return createAboutSection(sectionName, layoutStyle, palette, style, altBgColor)
    case 'features':
      return createFeaturesSection(sectionName, layoutStyle, palette, style)
    case 'services':
      return createServicesSection(sectionName, layoutStyle, palette, style, altBgColor)
    case 'portfolio':
    case 'gallery':
      return createPortfolioSection(sectionName, layoutStyle, palette, style)
    case 'pricing':
      return createPricingSection(sectionName, layoutStyle, palette, style, altBgColor)
    case 'testimonials':
      return createTestimonialsSection(sectionName, layoutStyle, palette, style)
    case 'team':
      return createTeamSection(sectionName, layoutStyle, palette, style, altBgColor)
    case 'faq':
      return createFAQSection(sectionName, layoutStyle, palette, style)
    case 'contact':
      return createContactSection(sectionName, layoutStyle, palette, style, altBgColor)
    case 'cta':
    case 'newsletter':
      return createCTASection(sectionName, layoutStyle, palette, style)
    case 'social':
    case 'links':
      return createLinksSection(sectionName, layoutStyle, palette, style)
    case 'menu':
      return createMenuSection(sectionName, layoutStyle, palette, style, altBgColor)
    case 'schedule':
      return createScheduleSection(sectionName, layoutStyle, palette, style)
    case 'location':
      return createLocationSection(sectionName, layoutStyle, palette, style, altBgColor)
    case 'speakers':
      return createSpeakersSection(sectionName, layoutStyle, palette, style)
    case 'rsvp':
      return createRSVPSection(sectionName, layoutStyle, palette, style, altBgColor)
    case 'story':
      return createStorySection(sectionName, layoutStyle, palette, style)
    case 'impact':
      return createImpactSection(sectionName, layoutStyle, palette, style, altBgColor)
    case 'donate':
      return createDonateSection(sectionName, layoutStyle, palette, style)
    case 'media':
      return createMediaSection(sectionName, layoutStyle, palette, style, altBgColor)
    case 'shop':
      return createShopSection(sectionName, layoutStyle, palette, style)
    default:
      return createGenericSection(sectionName, layoutStyle, palette, style)
  }
}

// Section generators
function createHeroSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  const spacing = getLayoutSpacing(layoutStyle)
  const borderRadius = getLayoutBorderRadius(layoutStyle)

  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { height: '100vh', backgroundType: 'color' },
    styles: {
      padding: { top: '64', bottom: '64', left: spacing.section.left, right: spacing.section.right },
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.gap,
      backgroundColor: palette.colors.background,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Headline',
        settings: { content: 'Welcome to Your Site', level: 'h1' },
        styles: { fontSize: '5xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
      {
        id: generateId(),
        type: 'text',
        name: 'Subheadline',
        settings: { content: 'A compelling description of what you do and why visitors should care.' },
        styles: { fontSize: 'xl', alignment: 'center', color: palette.colors.muted, maxWidth: '600px' },
      },
      {
        id: generateId(),
        type: 'button',
        name: 'CTA Button',
        settings: { label: 'Get Started', url: '#' } as ButtonSettings,
        styles: { backgroundColor: palette.colors.primary, textColor: palette.colors.background, borderRadius },
      },
    ],
  }
}

function createAboutSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset, altBg: string): SectionBlock {
  const spacing = getLayoutSpacing(layoutStyle)

  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: spacing.section,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: spacing.gap,
      backgroundColor: altBg,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: 'About', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
      {
        id: generateId(),
        type: 'text',
        name: 'About Text',
        settings: { content: 'Share your story, mission, or background here. Tell visitors who you are and what makes you unique.' },
        styles: { fontSize: 'lg', alignment: 'center', color: palette.colors.muted, maxWidth: '700px', lineHeight: 'relaxed' },
      },
    ],
  }
}

function createFeaturesSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48',
      backgroundColor: palette.colors.background,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: 'Features', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
      {
        id: generateId(),
        type: 'grid',
        name: 'Feature List',
        settings: { columns: 3, gap: '24', mobileColumns: 1, tabletColumns: 2 },
        styles: {},
        children: [
          createFeatureCard('Feature One', 'lni-star', 'Description of your first key feature or benefit.', palette, style),
          createFeatureCard('Feature Two', 'lni-rocket-3', 'Description of your second key feature or benefit.', palette, style),
          createFeatureCard('Feature Three', 'lni-shield-2-check', 'Description of your third key feature or benefit.', palette, style),
        ],
      },
    ],
  }
}

function createFeatureCard(title: string, icon: string, description: string, palette: ColorPalette, style: StylePreset): SectionBlock {
  return {
    id: generateId(),
    type: 'stack',
    name: title,
    settings: { gap: '16', direction: 'vertical' },
    styles: { padding: { top: '24', bottom: '24', left: '24', right: '24' }, backgroundColor: palette.colors.secondary, border: { radius: '16' }, alignItems: 'center' },
    children: [
      { id: generateId(), type: 'icon', name: 'Icon', settings: { icon, size: '32' }, styles: { color: palette.colors.primary } },
      { id: generateId(), type: 'heading', name: 'Title', settings: { content: title, level: 'h3' }, styles: { fontSize: 'xl', fontWeight: 'semibold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading } },
      { id: generateId(), type: 'text', name: 'Description', settings: { content: description }, styles: { fontSize: 'base', alignment: 'center', color: palette.colors.muted } },
    ],
  }
}

function createServicesSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset, altBg: string): SectionBlock {
  return createFeaturesSection(name, layoutStyle, palette, style) // Reuse features layout
}

function createPortfolioSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48',
      backgroundColor: palette.colors.background,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: 'Work', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
      {
        id: generateId(),
        type: 'grid',
        name: 'Portfolio Grid',
        settings: { columns: 2, gap: '24', mobileColumns: 1 },
        styles: {},
        children: [
          createPortfolioItem('Project One', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', palette, style),
          createPortfolioItem('Project Two', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop', palette, style),
        ],
      },
    ],
  }
}

function createPortfolioItem(title: string, imageUrl: string, palette: ColorPalette, style: StylePreset): SectionBlock {
  return {
    id: generateId(),
    type: 'stack',
    name: title,
    settings: { gap: '16', direction: 'vertical' },
    styles: {},
    children: [
      { id: generateId(), type: 'image', name: 'Cover', settings: { src: imageUrl, alt: title }, styles: { aspectRatio: '16:9', objectFit: 'cover', border: { radius: '12' } } },
      { id: generateId(), type: 'heading', name: 'Title', settings: { content: title, level: 'h3' }, styles: { fontSize: 'xl', fontWeight: 'semibold', color: palette.colors.foreground, fontFamily: style.fontHeading } },
    ],
  }
}

function createPricingSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset, altBg: string): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48',
      backgroundColor: altBg,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: 'Pricing', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
      {
        id: generateId(),
        type: 'text',
        name: 'Subtitle',
        settings: { content: 'Choose the plan that works best for you' },
        styles: { fontSize: 'lg', alignment: 'center', color: palette.colors.muted },
      },
    ],
  }
}

function createTestimonialsSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48',
      backgroundColor: palette.colors.background,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: 'What People Say', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
    ],
  }
}

function createTeamSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset, altBg: string): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48',
      backgroundColor: altBg,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: 'Our Team', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
    ],
  }
}

function createFAQSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48',
      backgroundColor: palette.colors.background,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: 'Frequently Asked Questions', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
    ],
  }
}

function createContactSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset, altBg: string): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '32',
      backgroundColor: altBg,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: 'Get in Touch', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
      {
        id: generateId(),
        type: 'text',
        name: 'Contact Text',
        settings: { content: 'Have a question or want to work together? Reach out!' },
        styles: { fontSize: 'lg', alignment: 'center', color: palette.colors.muted, maxWidth: '500px' },
      },
      {
        id: generateId(),
        type: 'button',
        name: 'Email Button',
        settings: { label: 'Contact Us', url: 'mailto:hello@example.com' },
        styles: { textColor: palette.colors.foreground, backgroundColor: 'transparent', border: { width: '1', color: palette.colors.foreground } },
      },
    ],
  }
}

function createCTASection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24',
      backgroundColor: palette.colors.primary,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'CTA Title',
        settings: { content: 'Ready to Get Started?', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.background, fontFamily: style.fontHeading },
      },
      {
        id: generateId(),
        type: 'text',
        name: 'CTA Text',
        settings: { content: 'Join thousands of happy customers today.' },
        styles: { fontSize: 'lg', alignment: 'center', color: palette.colors.background, opacity: '0.9' },
      },
      {
        id: generateId(),
        type: 'button',
        name: 'CTA Button',
        settings: { label: 'Sign Up Now', url: '#' } as ButtonSettings,
        styles: { backgroundColor: palette.colors.background, textColor: palette.colors.primary },
      },
    ],
  }
}

function createLinksSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '48', bottom: '48', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16',
      backgroundColor: palette.colors.background,
    },
    children: [
      {
        id: generateId(),
        type: 'stack',
        name: 'Social Links',
        settings: { gap: '16', direction: 'horizontal' },
        styles: { justifyContent: 'center', alignItems: 'center' },
        children: [
          { id: generateId(), type: 'icon', name: 'Twitter', settings: { icon: 'lni-x', size: '24', linkUrl: '#' }, styles: { color: palette.colors.foreground } },
          { id: generateId(), type: 'icon', name: 'Instagram', settings: { icon: 'lni-instagram', size: '24', linkUrl: '#' }, styles: { color: palette.colors.foreground } },
          { id: generateId(), type: 'icon', name: 'LinkedIn', settings: { icon: 'lni-linkedin', size: '24', linkUrl: '#' }, styles: { color: palette.colors.foreground } },
        ],
      },
    ],
  }
}

function createMenuSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset, altBg: string): SectionBlock {
  return createFeaturesSection(name, layoutStyle, palette, style) // Placeholder
}

function createScheduleSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48',
      backgroundColor: palette.colors.background,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: 'Schedule', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
    ],
  }
}

function createLocationSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset, altBg: string): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '32',
      backgroundColor: altBg,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: 'Location', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
      {
        id: generateId(),
        type: 'text',
        name: 'Address',
        settings: { content: '123 Main Street, City, Country' },
        styles: { fontSize: 'lg', alignment: 'center', color: palette.colors.muted },
      },
    ],
  }
}

function createSpeakersSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return createTeamSection(name, layoutStyle, palette, style, palette.colors.background)
}

function createRSVPSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset, altBg: string): SectionBlock {
  return createCTASection(name, layoutStyle, palette, style)
}

function createStorySection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return createAboutSection(name, layoutStyle, palette, style, palette.colors.background)
}

function createImpactSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset, altBg: string): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48',
      backgroundColor: altBg,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: 'Our Impact', level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
    ],
  }
}

function createDonateSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return createCTASection(name, layoutStyle, palette, style)
}

function createMediaSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset, altBg: string): SectionBlock {
  return createPortfolioSection(name, layoutStyle, palette, style)
}

function createShopSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return createPortfolioSection(name, layoutStyle, palette, style)
}

function createGenericSection(name: string, layoutStyle: LayoutStyle, palette: ColorPalette, style: StylePreset): SectionBlock {
  return {
    id: generateId(),
    type: 'container',
    name,
    settings: { backgroundType: 'color' },
    styles: {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      alignItems: 'center',
      gap: '32',
      backgroundColor: palette.colors.background,
    },
    children: [
      {
        id: generateId(),
        type: 'heading',
        name: 'Section Title',
        settings: { content: name, level: 'h2' },
        styles: { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: palette.colors.foreground, fontFamily: style.fontHeading },
      },
    ],
  }
}

// ============================================
// LAYOUT TEMPLATES
// ============================================

// Helper to create blocks with unique IDs
function createBlock(
  type: SectionBlock['type'],
  name: string,
  settings: Partial<SectionBlock['settings']>,
  styles: Partial<SectionBlock['styles']>,
  children?: SectionBlock[]
): SectionBlock {
  return {
    id: generateId(),
    type,
    name,
    settings: settings as SectionBlock['settings'],
    styles: styles as SectionBlock['styles'],
    children,
  }
}

// Personal Bio Layout - A clean, modern personal portfolio/bio page
function createPersonalBioLayout(): ProjectLayout {
  // Hero Section
  const heroSection = createBlock(
    'container',
    'Hero',
    { height: '100vh', backgroundType: 'color' },
    {
      padding: { top: '64', bottom: '64', left: '24', right: '24' },
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '24',
      backgroundColor: '#fafafa',
    },
    [
      createBlock(
        'image',
        'Avatar',
        { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face', alt: 'Profile photo' },
        { width: '150px', height: '150px', objectFit: 'cover', mask: 'circle' }
      ),
      createBlock(
        'heading',
        'Name',
        { content: 'Alex Johnson', level: 'h1' },
        { fontSize: '5xl', fontWeight: 'bold', alignment: 'center', color: '#09090b' }
      ),
      createBlock(
        'text',
        'Title',
        { content: 'Product Designer & Creative Developer' },
        { fontSize: 'xl', alignment: 'center', color: '#71717a' }
      ),
      createBlock(
        'text',
        'Bio',
        { content: 'I design and build digital experiences that delight users. Based in San Francisco, working with startups and established brands to create memorable products.', maxWidth: '600px' },
        { fontSize: 'base', alignment: 'center', color: '#52525b', lineHeight: 'relaxed' }
      ),
      createBlock(
        'stack',
        'Social Links',
        { gap: '16', direction: 'horizontal' },
        { justifyContent: 'center', alignItems: 'center', padding: { top: '16', bottom: '0', left: '0', right: '0' } },
        [
          createBlock('icon', 'Twitter', { icon: 'lni-x', size: '24', linkUrl: '#' }, { color: '#09090b' }),
          createBlock('icon', 'Instagram', { icon: 'lni-instagram', size: '24', linkUrl: '#' }, { color: '#09090b' }),
          createBlock('icon', 'LinkedIn', { icon: 'lni-linkedin', size: '24', linkUrl: '#' }, { color: '#09090b' }),
          createBlock('icon', 'Dribbble', { icon: 'lni-dribbble', size: '24', linkUrl: '#' }, { color: '#09090b' }),
        ]
      ),
    ]
  )

  // About Section
  const aboutSection = createBlock(
    'container',
    'About',
    { backgroundType: 'color' },
    {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '32',
      backgroundColor: '#ffffff',
    },
    [
      createBlock(
        'heading',
        'Section Title',
        { content: 'About Me', level: 'h2' },
        { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: '#09090b' }
      ),
      createBlock(
        'text',
        'About Text',
        { content: 'With over 8 years of experience in product design and development, I\'ve had the privilege of working with incredible teams at companies like Airbnb, Stripe, and various early-stage startups. My approach combines strategic thinking with hands-on execution, ensuring that every project not only looks beautiful but also solves real user problems.', maxWidth: '700px' },
        { fontSize: 'lg', alignment: 'center', color: '#52525b', lineHeight: 'relaxed' }
      ),
    ]
  )

  // Skills Section
  const skillsSection = createBlock(
    'container',
    'Skills',
    { backgroundType: 'color' },
    {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '48',
      backgroundColor: '#fafafa',
    },
    [
      createBlock(
        'heading',
        'Section Title',
        { content: 'What I Do', level: 'h2' },
        { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: '#09090b' }
      ),
      createBlock(
        'grid',
        'Skills Grid',
        { columns: 3, gap: '32', mobileColumns: 1, tabletColumns: 2 },
        { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
        [
          createBlock(
            'stack',
            'Skill 1',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '24', bottom: '24', left: '24', right: '24' }, backgroundColor: '#ffffff', border: { radius: '16' }, alignItems: 'center' },
            [
              createBlock('icon', 'Icon', { icon: 'lni-pencil-1', size: '32' }, { color: '#09090b' }),
              createBlock('heading', 'Title', { content: 'UI/UX Design', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', alignment: 'center', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'Creating intuitive interfaces and seamless user experiences that drive engagement.' }, { fontSize: 'base', alignment: 'center', color: '#71717a' }),
            ]
          ),
          createBlock(
            'stack',
            'Skill 2',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '24', bottom: '24', left: '24', right: '24' }, backgroundColor: '#ffffff', border: { radius: '16' }, alignItems: 'center' },
            [
              createBlock('icon', 'Icon', { icon: 'lni-code-2', size: '32' }, { color: '#09090b' }),
              createBlock('heading', 'Title', { content: 'Development', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', alignment: 'center', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'Building responsive, performant web applications with modern technologies.' }, { fontSize: 'base', alignment: 'center', color: '#71717a' }),
            ]
          ),
          createBlock(
            'stack',
            'Skill 3',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '24', bottom: '24', left: '24', right: '24' }, backgroundColor: '#ffffff', border: { radius: '16' }, alignItems: 'center' },
            [
              createBlock('icon', 'Icon', { icon: 'lni-book-open-1', size: '32' }, { color: '#09090b' }),
              createBlock('heading', 'Title', { content: 'Strategy', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', alignment: 'center', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'Defining product vision and roadmaps that align with business goals.' }, { fontSize: 'base', alignment: 'center', color: '#71717a' }),
            ]
          ),
        ]
      ),
    ]
  )

  // Portfolio/Work Section
  const workSection = createBlock(
    'container',
    'Work',
    { backgroundType: 'color' },
    {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '48',
      backgroundColor: '#ffffff',
    },
    [
      createBlock(
        'heading',
        'Section Title',
        { content: 'Selected Work', level: 'h2' },
        { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: '#09090b' }
      ),
      createBlock(
        'grid',
        'Work Grid',
        { columns: 2, gap: '24', mobileColumns: 1 },
        { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
        [
          createBlock(
            'stack',
            'Project 1',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
            [
              createBlock('image', 'Cover', { src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', alt: 'Project screenshot' }, { aspectRatio: '16:9', objectFit: 'cover' }),
              createBlock('heading', 'Title', { content: 'Fintech Dashboard', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'A comprehensive analytics dashboard for a leading fintech startup.' }, { fontSize: 'base', color: '#71717a' }),
            ]
          ),
          createBlock(
            'stack',
            'Project 2',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
            [
              createBlock('image', 'Cover', { src: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop', alt: 'Project screenshot' }, { aspectRatio: '16:9', objectFit: 'cover' }),
              createBlock('heading', 'Title', { content: 'E-commerce Mobile App', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'A delightful shopping experience for iOS and Android platforms.' }, { fontSize: 'base', color: '#71717a' }),
            ]
          ),
          createBlock(
            'stack',
            'Project 3',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
            [
              createBlock('image', 'Cover', { src: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&h=400&fit=crop', alt: 'Project screenshot' }, { aspectRatio: '16:9', objectFit: 'cover' }),
              createBlock('heading', 'Title', { content: 'SaaS Landing Page', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'High-converting landing page that increased sign-ups by 40%.' }, { fontSize: 'base', color: '#71717a' }),
            ]
          ),
          createBlock(
            'stack',
            'Project 4',
            { gap: '16', direction: 'vertical' },
            { padding: { top: '0', bottom: '0', left: '0', right: '0' } },
            [
              createBlock('image', 'Cover', { src: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop', alt: 'Project screenshot' }, { aspectRatio: '16:9', objectFit: 'cover' }),
              createBlock('heading', 'Title', { content: 'Brand Identity System', level: 'h3' }, { fontSize: 'xl', fontWeight: 'semibold', color: '#09090b' }),
              createBlock('text', 'Description', { content: 'Complete visual identity for an emerging wellness brand.' }, { fontSize: 'base', color: '#71717a' }),
            ]
          ),
        ]
      ),
    ]
  )

  // Contact Section
  const contactSection = createBlock(
    'container',
    'Contact',
    { backgroundType: 'color' },
    {
      padding: { top: '80', bottom: '80', left: '24', right: '24' },
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '32',
      backgroundColor: '#09090b',
    },
    [
      createBlock(
        'heading',
        'Section Title',
        { content: 'Let\'s Work Together', level: 'h2' },
        { fontSize: '3xl', fontWeight: 'bold', alignment: 'center', color: '#ffffff' }
      ),
      createBlock(
        'text',
        'Contact Text',
        { content: 'I\'m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.', maxWidth: '500px' },
        { fontSize: 'lg', alignment: 'center', color: '#a1a1aa' }
      ),
      createBlock(
        'button',
        'Email Button',
        { label: 'hello@alexjohnson.design', url: 'mailto:hello@alexjohnson.design' },
        { textColor: '#ffffff', backgroundColor: 'transparent', border: { width: '1', color: '#ffffff' } }
      ),
    ]
  )

  return {
    id: 'personal-bio',
    name: 'Personal Bio',
    description: 'A clean, modern personal portfolio page',
    useCase: 'personal',
    pageSettings: {
      ...getDefaultPageSettings(),
      backgroundColor: '#ffffff',
      fontFamily: 'Inter',
      textColor: '#09090b',
      sectionGap: '0',
    },
    blocks: [heroSection, aboutSection, skillsSection, workSection, contactSection],
  }
}

export const LAYOUTS: ProjectLayout[] = [
  // ===== BLANK LAYOUT =====
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from scratch',
    useCase: 'personal',
    pageSettings: getDefaultPageSettings(),
    blocks: [],
  },
  // ===== PERSONAL BIO LAYOUT =====
  createPersonalBioLayout(),
]

// Helper functions
export function getUseCaseById(id: UseCaseCategory): UseCase | undefined {
  return USE_CASES.find(uc => uc.id === id)
}

export function getLayoutsByUseCase(_useCase: UseCaseCategory): ProjectLayout[] {
  // For now, just return blank layout
  return LAYOUTS.map(layout => ({
    ...layout,
    pageSettings: {
      ...layout.pageSettings,
      useCase: layout.useCase,
      layoutId: layout.id,
    },
    blocks: layout.blocks,
  }))
}

export function getLayoutById(id: string): ProjectLayout | undefined {
  const layout = LAYOUTS.find(l => l.id === id)
  if (!layout) return undefined

  // Return a copy with useCase/layoutId in pageSettings
  return {
    ...layout,
    pageSettings: {
      ...layout.pageSettings,
      useCase: layout.useCase,
      layoutId: layout.id,
    },
    blocks: layout.blocks,
  }
}

export function getBlankLayout(): ProjectLayout {
  const blank = LAYOUTS.find(l => l.id === 'blank')!
  return {
    ...blank,
    pageSettings: {
      ...blank.pageSettings,
      useCase: undefined,
      layoutId: 'blank',
    },
    blocks: [],
  }
}

// Get all layouts for a use case (for style switching in editor)
export function getStylesForUseCase(_useCase: UseCaseCategory): ProjectLayout[] {
  // For now, just return blank layout
  return LAYOUTS.map(layout => ({
    ...layout,
    pageSettings: {
      ...layout.pageSettings,
      useCase: layout.useCase,
      layoutId: layout.id,
    },
    blocks: layout.blocks,
  }))
}
