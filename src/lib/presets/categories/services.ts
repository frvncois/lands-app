import type { PresetCategory, UseCasePreset } from '../types'

// ============================================
// USE CASE PRESETS
// ============================================

export const freelancerPreset: UseCasePreset = {
  id: 'freelancer',
  name: 'Freelancer',
  description: 'Showcase your skills and attract clients',
  icon: 'user',
  categoryId: 'services',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'freelancer-hero',
    'services-list',
    'portfolio-gallery',
    'testimonials-section',
    'booking-cta',
    'default-footer',
  ],
  tags: ['freelancer', 'independent', 'contractor', 'self-employed'],
}

export const creativeStudioPreset: UseCasePreset = {
  id: 'creative-studio',
  name: 'Creative Studio / Agency',
  description: 'Present your agency and case studies',
  icon: 'brush',
  categoryId: 'services',
  themeId: 'bold',
  sections: [
    'centeredHeader',
    'agency-hero',
    'services-grid',
    'portfolio-cards',
    'process-section',
    'testimonials-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['agency', 'studio', 'creative', 'design', 'branding'],
}

export const consultantPreset: UseCasePreset = {
  id: 'consultant',
  name: 'Consultant',
  description: 'Build credibility and generate leads',
  icon: 'briefcase',
  categoryId: 'services',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'consultant-hero',
    'services-grid',
    'testimonials-section',
    'faq-section',
    'booking-cta',
    'default-footer',
  ],
  tags: ['consultant', 'consulting', 'advisor', 'expert'],
}

export const coachMentorPreset: UseCasePreset = {
  id: 'coach-mentor',
  name: 'Coach / Mentor',
  description: 'Connect with potential clients',
  icon: 'heart',
  categoryId: 'services',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'coach-hero',
    'services-grid',
    'testimonials-section',
    'pricing-packages',
    'faq-section',
    'booking-cta',
    'default-footer',
  ],
  tags: ['coach', 'mentor', 'life coach', 'executive coach'],
}

export const photographerPreset: UseCasePreset = {
  id: 'photographer',
  name: 'Photographer',
  description: 'Display your portfolio beautifully',
  icon: 'camera',
  categoryId: 'services',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'photographer-hero',
    'portfolio-gallery',
    'services-list',
    'testimonials-section',
    'booking-cta',
    'default-footer',
  ],
  tags: ['photographer', 'photography', 'portrait', 'wedding'],
}

export const videographerPreset: UseCasePreset = {
  id: 'videographer',
  name: 'Videographer',
  description: 'Showcase your video work',
  icon: 'video',
  categoryId: 'services',
  themeId: 'dark',
  sections: [
    'simple-header',
    'videographer-hero',
    'portfolio-gallery',
    'services-list',
    'testimonials-section',
    'booking-cta',
    'default-footer',
  ],
  tags: ['videographer', 'video', 'film', 'production'],
}

export const copywriterPreset: UseCasePreset = {
  id: 'copywriter',
  name: 'Copywriter',
  description: 'Words that sell, stories that connect',
  icon: 'pencil',
  categoryId: 'services',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'copywriter-hero',
    'services-list',
    'portfolio-cards',
    'testimonials-section',
    'booking-cta',
    'default-footer',
  ],
  tags: ['copywriter', 'writer', 'content', 'copy'],
}

export const marketingServicesPreset: UseCasePreset = {
  id: 'marketing-services',
  name: 'Marketing Services',
  description: 'Full-service marketing solutions',
  icon: 'rocket',
  categoryId: 'services',
  themeId: 'bold',
  sections: [
    'centeredHeader',
    'marketing-hero',
    'services-grid',
    'process-section',
    'portfolio-cards',
    'testimonials-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['marketing', 'digital marketing', 'growth', 'advertising'],
}

export const seoAdsPreset: UseCasePreset = {
  id: 'seo-ads',
  name: 'SEO / Ads Specialist',
  description: 'Help businesses grow online',
  icon: 'search',
  categoryId: 'services',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'seo-hero',
    'services-grid',
    'process-section',
    'testimonials-section',
    'faq-section',
    'booking-cta',
    'default-footer',
  ],
  tags: ['seo', 'ads', 'ppc', 'google ads', 'facebook ads'],
}

export const techServicesPreset: UseCasePreset = {
  id: 'it-tech',
  name: 'IT / Tech Services',
  description: 'Technology solutions and support',
  icon: 'laptop',
  categoryId: 'services',
  themeId: 'minimal',
  sections: [
    'centeredHeader',
    'tech-services-hero',
    'services-grid',
    'faq-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['it', 'tech', 'support', 'cloud', 'security'],
}

export const legalAccountingPreset: UseCasePreset = {
  id: 'legal-accounting',
  name: 'Legal / Accounting',
  description: 'Professional services with trust',
  icon: 'balance',
  categoryId: 'services',
  themeId: 'minimal',
  sections: [
    'centeredHeader',
    'legal-hero',
    'services-grid',
    'faq-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['legal', 'law', 'accounting', 'tax', 'cpa', 'lawyer'],
}

// ============================================
// CATEGORY DEFINITION
// ============================================

export const servicesCategory: PresetCategory = {
  id: 'services',
  name: 'Services',
  description: 'Freelancers, agencies, and service providers',
  icon: 'briefcase',
  order: 3,
  useCases: [
    'freelancer',
    'creative-studio',
    'consultant',
    'coach-mentor',
    'photographer',
    'videographer',
    'copywriter',
    'marketing-services',
    'seo-ads',
    'it-tech',
    'legal-accounting',
  ],
}

// ============================================
// EXPORT ALL PRESETS
// ============================================

export const servicesPresets = {
  freelancerPreset,
  creativeStudioPreset,
  consultantPreset,
  coachMentorPreset,
  photographerPreset,
  videographerPreset,
  copywriterPreset,
  marketingServicesPreset,
  seoAdsPreset,
  techServicesPreset,
  legalAccountingPreset,
}
