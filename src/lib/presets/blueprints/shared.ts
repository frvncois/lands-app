import type { SectionBlueprint } from '../types'

// ============================================
// HEADERS
// ============================================

export const simpleHeader: SectionBlueprint = {
  id: 'simple-header',
  type: 'header',
  variant: 'default',
}

export const centeredHeader: SectionBlueprint = {
  id: 'centered-header',
  type: 'header',
  variant: 'centered',
}

// ============================================
// FOOTERS
// ============================================

export const defaultFooter: SectionBlueprint = {
  id: 'default-footer',
  type: 'footer',
  variant: 'default',
}

export const centeredFooter: SectionBlueprint = {
  id: 'centered-footer',
  type: 'footer',
  variant: 'centered',
}

export const minimalFooter: SectionBlueprint = {
  id: 'minimal-footer',
  type: 'footer',
  variant: 'minimal',
}

// ============================================
// COMMON SECTIONS
// ============================================

export const contactSection: SectionBlueprint = {
  id: 'contact-section',
  type: 'contact',
  variant: 'split',
}

export const ctaSection: SectionBlueprint = {
  id: 'cta-section',
  type: 'cta',
  variant: 'stacked',
}

export const faqSection: SectionBlueprint = {
  id: 'faq-section',
  type: 'faq',
  variant: 'list',
  dataOverrides: {
    headline: 'Frequently Asked Questions',
  },
}

export const gallerySection: SectionBlueprint = {
  id: 'gallery-section',
  type: 'gallery',
  variant: 'grid',
}

export const linksSection: SectionBlueprint = {
  id: 'links-section',
  type: 'links',
  variant: 'stacked',
}

export const socialLinks: SectionBlueprint = {
  id: 'social-links',
  type: 'links',
  variant: 'grid',
  dataOverrides: {
    headline: 'Connect',
    items: [
      { label: 'Instagram', url: '#' },
      { label: 'Twitter', url: '#' },
      { label: 'LinkedIn', url: '#' },
    ],
  },
}

// ============================================
// EXPORT ALL
// ============================================

export const sharedBlueprints: SectionBlueprint[] = [
  simpleHeader,
  centeredHeader,
  defaultFooter,
  centeredFooter,
  minimalFooter,
  contactSection,
  ctaSection,
  faqSection,
  gallerySection,
  linksSection,
  socialLinks,
]
