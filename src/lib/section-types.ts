/**
 * Section Type Constants and Helpers
 *
 * Centralized definitions for all section types used in the editor.
 */

// All section types
export const SECTION_TYPES = {
  HERO: 'hero',
  CARDS: 'cards',
  PRODUCTS: 'products',
  FAQ: 'faq',
  MENU: 'menu',
  EVENTS: 'events',
  SERVICES: 'services',
  LINKS: 'links',
  CONTACT: 'contact',
  CTA: 'cta',
  GALLERY: 'gallery',
  HEADER: 'header',
  FOOTER: 'footer',
  TEXT: 'text',
  MEDIA_TEXT: 'media-text',
} as const

// Accordion section types (multiple types map to accordion behavior)
export const ACCORDION_TYPES = ['faq', 'menu', 'events', 'services'] as const

/**
 * Check if a section type is an accordion type
 */
export function isAccordionType(type: string | undefined): boolean {
  if (!type) return false
  return ACCORDION_TYPES.includes(type as typeof ACCORDION_TYPES[number])
}

// Type exports for strict typing
export type SectionType = typeof SECTION_TYPES[keyof typeof SECTION_TYPES]
export type AccordionType = typeof ACCORDION_TYPES[number]
