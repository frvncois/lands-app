import type { SectionType } from '@/types/sections'

// ============================================
// SECTION BLUEPRINT
// ============================================

/**
 * A Blueprint is a reusable section configuration.
 * It defines a section type + variant + optional default data overrides.
 */
export interface SectionBlueprint {
  /** Unique ID for this blueprint (e.g., 'music-hero', 'food-menu') */
  id: string

  /** Section type from registry */
  type: SectionType

  /** Which variant to use */
  variant: string

  /** Optional: partial data to merge with section defaults */
  dataOverrides?: Record<string, unknown>

  /** Optional: style overrides */
  styleOverrides?: Record<string, unknown>
}

// ============================================
// USE CASE PRESET
// ============================================

/**
 * A Preset defines which section blueprints to include for a use case.
 * Uses string references to blueprints for maximum flexibility.
 */
export interface UseCasePreset {
  /** Unique ID (e.g., 'artist-band', 'restaurant') */
  id: string

  /** Display name */
  name: string

  /** Description for UI */
  description: string

  /** Icon (lineicons name) */
  icon: string

  /** Parent category ID */
  categoryId: string

  /** Recommended theme ID */
  themeId: string

  /**
   * Section composition - array of blueprint IDs or inline configs
   * Order matters - defines section order in template
   */
  sections: (string | SectionBlueprint)[]

  /** Optional: Tags for search/filtering */
  tags?: string[]
}

// ============================================
// CATEGORY
// ============================================

/**
 * A Category groups related use cases.
 */
export interface PresetCategory {
  /** Unique ID (e.g., 'music-creative', 'food-hospitality') */
  id: string

  /** Display name */
  name: string

  /** Description */
  description: string

  /** Icon (lineicons name) */
  icon: string

  /** Order in UI (lower = first) */
  order: number

  /** Use case IDs in this category (order matters for UI) */
  useCases: string[]
}
