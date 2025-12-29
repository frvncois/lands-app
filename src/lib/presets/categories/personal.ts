import type { PresetCategory, UseCasePreset } from '../types'

export const personalWebsitePreset: UseCasePreset = {
  id: 'personal-website',
  name: 'Personal Website',
  description: 'Your home on the internet',
  icon: 'user',
  categoryId: 'personal',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'personal-hero',
    'gallery-section',
    'social-links',
    'default-footer',
  ],
  tags: ['personal', 'website', 'about'],
}

export const portfolioPreset: UseCasePreset = {
  id: 'portfolio',
  name: 'Portfolio',
  description: 'Showcase your best work',
  icon: 'image',
  categoryId: 'personal',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'personal-hero',
    'portfolio-gallery',
    'contact-section',
    'default-footer',
  ],
  tags: ['portfolio', 'work', 'projects', 'design'],
}

export const resumeCvPreset: UseCasePreset = {
  id: 'resume-cv',
  name: 'Resume / CV',
  description: 'Digital resume for job seekers',
  icon: 'file',
  categoryId: 'personal',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'personal-hero',
    'services-grid',
    'contact-section',
    'minimal-footer',
  ],
  tags: ['resume', 'cv', 'job', 'career', 'hire'],
}

export const linkInBioPreset: UseCasePreset = {
  id: 'link-in-bio',
  name: 'Link-in-bio',
  description: 'All your links in one place',
  icon: 'link',
  categoryId: 'personal',
  themeId: 'bold',
  sections: [
    'simple-header',
    'personal-hero',
    'links-section',
    'default-footer',
  ],
  tags: ['link in bio', 'links', 'linktree', 'social'],
}

export const creatorHubPreset: UseCasePreset = {
  id: 'creator-hub',
  name: 'Creator Hub',
  description: 'Central hub for your content',
  icon: 'star',
  categoryId: 'personal',
  themeId: 'bold',
  sections: [
    'simple-header',
    'personal-hero',
    'links-section',
    'subscribe-newsletter',
    'default-footer',
  ],
  tags: ['creator', 'content', 'hub', 'youtube', 'tiktok'],
}

export const mediaKitPreset: UseCasePreset = {
  id: 'media-kit',
  name: 'Influencer Media Kit',
  description: 'Attract brand partnerships',
  icon: 'star',
  categoryId: 'personal',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'personal-hero',
    'portfolio-gallery',
    'contact-section',
    'default-footer',
  ],
  tags: ['media kit', 'influencer', 'brand', 'partnership', 'collab'],
}

export const speakerPagePreset: UseCasePreset = {
  id: 'speaker-page',
  name: 'Speaker Page',
  description: 'Get booked for speaking gigs',
  icon: 'microphone',
  categoryId: 'personal',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'personal-hero',
    'testimonials-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['speaker', 'keynote', 'talks', 'conferences'],
}

export const jobApplicationPreset: UseCasePreset = {
  id: 'job-application',
  name: 'Job Application Page',
  description: 'Stand out to employers',
  icon: 'briefcase',
  categoryId: 'personal',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'personal-hero',
    'services-grid',
    'portfolio-gallery',
    'minimal-footer',
  ],
  tags: ['job', 'application', 'hire me', 'career'],
}

export const digitalBusinessCardPreset: UseCasePreset = {
  id: 'digital-business-card',
  name: 'Digital Business Card',
  description: 'Share your contact info easily',
  icon: 'credit-card',
  categoryId: 'personal',
  themeId: 'minimal',
  sections: [
    'simple-header',
    'personal-hero',
    'social-links',
    'minimal-footer',
  ],
  tags: ['business card', 'vcard', 'contact', 'digital card'],
}

export const personalCategory: PresetCategory = {
  id: 'personal',
  name: 'Personal & Professional',
  description: 'Portfolios, resumes, and personal branding',
  icon: 'user',
  order: 6,
  useCases: [
    'personal-website',
    'portfolio',
    'resume-cv',
    'link-in-bio',
    'creator-hub',
    'media-kit',
    'speaker-page',
    'job-application',
    'digital-business-card',
  ],
}

export const personalPresets = {
  personalWebsitePreset,
  portfolioPreset,
  resumeCvPreset,
  linkInBioPreset,
  creatorHubPreset,
  mediaKitPreset,
  speakerPagePreset,
  jobApplicationPreset,
  digitalBusinessCardPreset,
}
