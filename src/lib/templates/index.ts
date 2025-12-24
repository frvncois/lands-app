/**
 * TEMPLATE SYSTEM
 *
 * Templates define the STRUCTURAL starting point for a project.
 * They are applied ONCE at project creation and never referenced again.
 *
 * TEMPLATES vs THEMES:
 * - Template = WHAT a site starts with (sections, order, content)
 * - Theme = HOW a site looks (colors, fonts, spacing)
 *
 * Adding a new template requires ONLY:
 * 1. Create a template file with Template type
 * 2. Import and add to registry here
 *
 * Templates MUST NOT:
 * - Define colors, fonts, or any style tokens
 * - Override theme settings
 * - Introduce new section types
 * - Be referenced after project creation
 */

import type { Template, TemplateSectionData, SectionInstance } from '@/types/sections'
import { blankTemplate } from './blank'
import { portfolioTemplate } from './portfolio'
import { creatorTemplate } from './creator'
import { landingTemplate } from './landing'

// ============================================
// TEMPLATE REGISTRY
// ============================================

/**
 * All available templates
 */
export const templateRegistry: Map<string, Template> = new Map([
  ['blank', blankTemplate],
  ['portfolio', portfolioTemplate],
  ['creator', creatorTemplate],
  ['landing', landingTemplate],
])

/**
 * Get a template by ID
 */
export function getTemplate(id: string): Template | undefined {
  return templateRegistry.get(id)
}

/**
 * Get all templates
 */
export function getAllTemplates(): Template[] {
  return Array.from(templateRegistry.values())
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: Template['category']): Template[] {
  return getAllTemplates().filter(t => t.category === category)
}

/**
 * Get default template
 */
export function getDefaultTemplate(): Template {
  return blankTemplate
}

// ============================================
// TEMPLATE APPLICATION
// ============================================

/**
 * Generate a unique ID for a section instance
 */
function generateSectionId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Convert template section data to full section instances
 * This is called ONCE at project creation
 *
 * After this point, the template is NEVER referenced again.
 * The sections become owned by the project.
 */
export function instantiateTemplate(template: Template): {
  themeId: string
  sections: SectionInstance[]
} {
  const sections: SectionInstance[] = template.sections.map(
    (sectionData: TemplateSectionData) => ({
      id: generateSectionId(),
      type: sectionData.type,
      variant: sectionData.variant,
      data: { ...sectionData.data }, // Deep copy to prevent mutations
      fieldStyles: {},
      styles: {},
      itemStyles: {},
    })
  )

  return {
    themeId: template.themeId,
    sections,
  }
}

// Re-export templates for direct access
export { blankTemplate } from './blank'
export { portfolioTemplate } from './portfolio'
export { creatorTemplate } from './creator'
export { landingTemplate } from './landing'
