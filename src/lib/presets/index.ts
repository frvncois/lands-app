import type { Template } from '@/types/sections'
import type { PresetCategory, UseCasePreset, SectionBlueprint } from './types'
import { composeTemplate } from './composer'
import {
  categoryRegistry,
  presetRegistry,
  allCategories,
  allPresets
} from './categories'
import { blueprintRegistry, getBlueprint as getBlueprintFromRegistry, getAllBlueprints } from './blueprints'

// ============================================
// PUBLIC API
// ============================================

/**
 * Get all preset categories (sorted by order)
 */
export function getAllCategories(): PresetCategory[] {
  return allCategories
}

/**
 * Get a category by ID
 */
export function getCategory(id: string): PresetCategory | undefined {
  return categoryRegistry.get(id)
}

/**
 * Get all presets
 */
export function getAllPresets(): UseCasePreset[] {
  return allPresets
}

/**
 * Get a preset by ID
 */
export function getPreset(id: string): UseCasePreset | undefined {
  return presetRegistry.get(id)
}

/**
 * Get all presets for a category
 */
export function getPresetsForCategory(categoryId: string): UseCasePreset[] {
  const category = getCategory(categoryId)
  if (!category) return []

  return category.useCases
    .map(id => getPreset(id))
    .filter((p): p is UseCasePreset => p !== undefined)
}

/**
 * Search presets by name, description, or tags
 */
export function searchPresets(query: string): UseCasePreset[] {
  const lower = query.toLowerCase().trim()
  if (!lower) return []

  return allPresets.filter(preset =>
    preset.name.toLowerCase().includes(lower) ||
    preset.description.toLowerCase().includes(lower) ||
    preset.tags?.some(tag => tag.toLowerCase().includes(lower))
  )
}

/**
 * Get a ready-to-use Template from a preset ID
 */
export function getTemplateFromPreset(presetId: string): Template | null {
  const preset = getPreset(presetId)
  if (!preset) return null
  return composeTemplate(preset, blueprintRegistry)
}

// ============================================
// RE-EXPORTS
// ============================================

export type { PresetCategory, UseCasePreset, SectionBlueprint }
export { getBlueprintFromRegistry as getBlueprint, getAllBlueprints }
export { composeTemplate }
