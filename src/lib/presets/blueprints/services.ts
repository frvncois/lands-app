import type { SectionBlueprint } from '../types'

// ============================================
// SERVICES BLUEPRINTS
// ============================================

// --- HEROES ---
export const freelancerHero: SectionBlueprint = {
  id: 'freelancer-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Your Name',
    subheadline: 'Freelance Designer & Developer',
    primaryCTA: { label: 'Hire Me', url: '#' },
    secondaryCTA: { label: 'View Work', url: '#' },
  },
}

export const agencyHero: SectionBlueprint = {
  id: 'agency-hero',
  type: 'hero',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Agency Name',
    subheadline: 'We Build Brands That Matter',
    primaryCTA: { label: 'Start a Project', url: '#' },
  },
}

export const consultantHero: SectionBlueprint = {
  id: 'consultant-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Consultant Name',
    subheadline: 'Business Strategy & Growth',
    primaryCTA: { label: 'Book a Call', url: '#' },
  },
}

export const coachHero: SectionBlueprint = {
  id: 'coach-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Coach Name',
    subheadline: 'Executive & Life Coaching',
    primaryCTA: { label: 'Book Discovery Call', url: '#' },
  },
}

export const photographerHero: SectionBlueprint = {
  id: 'photographer-hero',
  type: 'hero',
  variant: 'overlay',
  dataOverrides: {
    headline: 'Photographer Name',
    subheadline: 'Portrait • Wedding • Commercial',
    primaryCTA: { label: 'Book a Session', url: '#' },
  },
}

export const videographerHero: SectionBlueprint = {
  id: 'videographer-hero',
  type: 'hero',
  variant: 'overlay',
  dataOverrides: {
    headline: 'Videographer Name',
    subheadline: 'Cinematic Storytelling',
    primaryCTA: { label: 'Get a Quote', url: '#' },
  },
}

export const copywriterHero: SectionBlueprint = {
  id: 'copywriter-hero',
  type: 'hero',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Words That Convert',
    subheadline: 'Copywriter & Content Strategist',
    primaryCTA: { label: "Let's Talk", url: '#' },
  },
}

export const marketingHero: SectionBlueprint = {
  id: 'marketing-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Grow Your Business',
    subheadline: 'Full-Service Marketing Agency',
    primaryCTA: { label: 'Get Started', url: '#' },
  },
}

export const seoHero: SectionBlueprint = {
  id: 'seo-hero',
  type: 'hero',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Rank Higher, Grow Faster',
    subheadline: 'SEO & Paid Ads Specialist',
    primaryCTA: { label: 'Free Audit', url: '#' },
  },
}

export const techServicesHero: SectionBlueprint = {
  id: 'tech-services-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'IT Solutions',
    subheadline: 'Support • Security • Cloud',
    primaryCTA: { label: 'Get Support', url: '#' },
  },
}

export const legalHero: SectionBlueprint = {
  id: 'legal-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Firm Name',
    subheadline: 'Legal & Accounting Services',
    primaryCTA: { label: 'Schedule Consultation', url: '#' },
  },
}

// --- SERVICES-SPECIFIC SECTIONS ---
export const servicesGrid: SectionBlueprint = {
  id: 'services-grid',
  type: 'services',
  variant: 'list',
  dataOverrides: {
    headline: 'Services',
    useCase: 'faq',
  },
}

export const servicesList: SectionBlueprint = {
  id: 'services-list',
  type: 'services',
  variant: 'list',
  dataOverrides: {
    headline: 'What I Do',
    useCase: 'faq',
  },
}

export const portfolioGallery: SectionBlueprint = {
  id: 'portfolio-gallery',
  type: 'gallery',
  variant: 'masonry',
  dataOverrides: {
    headline: 'Selected Work',
  },
}

export const portfolioCards: SectionBlueprint = {
  id: 'portfolio-cards',
  type: 'cards',
  variant: 'grid',
  dataOverrides: {
    headline: 'Case Studies',
  },
}

export const testimonialsSection: SectionBlueprint = {
  id: 'testimonials-section',
  type: 'cards',
  variant: 'carousel',
  dataOverrides: {
    headline: 'What Clients Say',
  },
}

export const bookingCta: SectionBlueprint = {
  id: 'booking-cta',
  type: 'cta',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Ready to Get Started?',
    paragraph: 'Book a free consultation call',
    primaryCTA: { label: 'Book Now', url: '#' },
  },
}

export const processSection: SectionBlueprint = {
  id: 'process-section',
  type: 'cards',
  variant: 'grid',
  dataOverrides: {
    headline: 'How It Works',
    items: [
      { headline: '1. Discovery', paragraph: 'We learn about your needs' },
      { headline: '2. Strategy', paragraph: 'We create a custom plan' },
      { headline: '3. Execute', paragraph: 'We bring it to life' },
      { headline: '4. Deliver', paragraph: 'You get results' },
    ],
  },
}

export const pricingPackages: SectionBlueprint = {
  id: 'pricing-packages',
  type: 'cards',
  variant: 'grid',
  dataOverrides: {
    headline: 'Packages',
  },
}

// ============================================
// EXPORT ALL
// ============================================

export const servicesBlueprints: SectionBlueprint[] = [
  freelancerHero,
  agencyHero,
  consultantHero,
  coachHero,
  photographerHero,
  videographerHero,
  copywriterHero,
  marketingHero,
  seoHero,
  techServicesHero,
  legalHero,
  servicesGrid,
  servicesList,
  portfolioGallery,
  portfolioCards,
  testimonialsSection,
  bookingCta,
  processSection,
  pricingPackages,
]
