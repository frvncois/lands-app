import type { Template, TemplateSectionData } from '@/types/sections'
import type { UseCasePreset, SectionBlueprint } from './types'
import { getSectionDefinition } from '@/lib/section-registry'

/**
 * Get a blueprint from string ID or return the inline blueprint
 */
function resolveBlueprint(
  sectionRef: string | SectionBlueprint,
  blueprintRegistry: Map<string, SectionBlueprint>
): SectionBlueprint | undefined {
  if (typeof sectionRef === 'string') {
    return blueprintRegistry.get(sectionRef)
  }
  return sectionRef
}

/**
 * Compose a Template from a UseCasePreset
 */
export function composeTemplate(
  preset: UseCasePreset,
  blueprintRegistry: Map<string, SectionBlueprint>
): Template | null {
  const sections: TemplateSectionData[] = []

  for (const sectionRef of preset.sections) {
    // Resolve blueprint (string ID or inline config)
    const blueprint = resolveBlueprint(sectionRef, blueprintRegistry)

    if (!blueprint) {
      console.warn(`[Presets] Blueprint not found: ${typeof sectionRef === 'string' ? sectionRef : sectionRef.id}`)
      continue
    }

    // Get section definition from registry
    const definition = getSectionDefinition(blueprint.type)
    if (!definition) {
      console.warn(`[Presets] Section type not found: ${blueprint.type}`)
      continue
    }

    // Merge default data with blueprint overrides
    const defaultData = definition.createDefaultData()
    const mergedData = deepMerge(defaultData, blueprint.dataOverrides ?? {})

    const sectionData: TemplateSectionData = {
      type: blueprint.type,
      variant: blueprint.variant,
      data: mergedData,
    }

    // Apply style overrides if provided
    if (blueprint.styleOverrides) {
      sectionData.styles = blueprint.styleOverrides
    }

    sections.push(sectionData)
  }

  return {
    id: `preset-${preset.id}`,
    name: preset.name,
    description: preset.description,
    category: 'landing',
    themeId: preset.themeId,
    sections,
  }
}

/**
 * Deep merge utility for nested objects
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target }

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[typeof key]
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[typeof key]
    }
  }

  return result
}
