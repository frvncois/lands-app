/**
 * Section Documentation for AI
 *
 * Simplified section info formatted for AI prompts.
 * Maps section types to use cases and provides structure.
 */

import { getAllSectionDefinitions } from '@/lib/section-registry'
import type { SectionDefinition, FieldSchema } from '@/types/sections'

export interface SectionDocForAI {
  type: string
  displayName: string
  description: string
  useCases: string[]
  variants: string[]
  contentFields: string[]
}

const SECTION_USE_CASES: Record<string, string[]> = {
  header: ['site navigation', 'branding', 'sticky header'],
  hero: ['landing intro', 'product launch', 'hero banner', 'main message'],
  cards: ['features showcase', 'testimonials', 'team members', 'services', 'benefits list'],
  products: ['product listings', 'pricing plans', 'e-commerce items', 'packages'],
  cta: ['call to action', 'newsletter signup', 'conversion prompt', 'sign up banner'],
  accordion: ['FAQ', 'collapsible content'],
  faq: ['frequently asked questions', 'support', 'Q&A'],
  menu: ['restaurant menu', 'food menu', 'service menu'],
  events: ['event schedule', 'upcoming events', 'workshops', 'launches'],
  services: ['service offerings', 'what we offer', 'capabilities'],
  gallery: ['portfolio', 'photo gallery', 'image showcase', 'client logos'],
  links: ['social links', 'resource links', 'navigation shortcuts'],
  contact: ['contact form', 'get in touch', 'inquiry form'],
  footer: ['site footer', 'copyright', 'bottom navigation'],
}

function extractFieldNames(schema: FieldSchema[]): string[] {
  const fields: string[] = []

  for (const field of schema) {
    if (field.type === 'repeater') {
      fields.push(`${field.label} (repeater)`)
    } else {
      fields.push(field.label || field.key)
    }
  }

  return fields
}

function convertToAIDoc(definition: SectionDefinition): SectionDocForAI {
  return {
    type: definition.type,
    displayName: definition.displayName,
    description: definition.description || '',
    useCases: SECTION_USE_CASES[definition.type] || [],
    variants: definition.variants.map(v => v.id),
    contentFields: extractFieldNames(definition.schema),
  }
}

export function getSectionDocsForAI(): SectionDocForAI[] {
  const definitions = getAllSectionDefinitions()
  return definitions
    .filter(def => !def.hidden)
    .map(convertToAIDoc)
}

export function formatSectionDocsForPrompt(): string {
  const docs = getSectionDocsForAI()

  const sections = docs
    .map(doc => {
      const parts = [`- ${doc.displayName} (${doc.type}): ${doc.description}`]
      if (doc.useCases.length > 0) {
        parts.push(`  Use cases: ${doc.useCases.join(', ')}`)
      }
      if (doc.variants.length > 0) {
        parts.push(`  Variants: ${doc.variants.join(', ')}`)
      }
      if (doc.contentFields.length > 0) {
        parts.push(`  Fields: ${doc.contentFields.join(', ')}`)
      }
      return parts.join('\n')
    })
    .join('\n')

  return `Available Section Types:\n${sections}`
}
