/**
 * CANONICAL PROJECT HYDRATOR
 * Ensures consistent data shape between editor and publish
 * NO Vue, NO computed, NO side effects
 */

import { sectionRegistry } from './section-registry'
import type { SectionInstance } from '@/types/sections'

interface Project {
  sections: SectionInstance[]
  [key: string]: unknown
}

export function hydrateProject(project: Project): Project {
  return {
    ...project,
    sections: project.sections.map(section => hydrateSection(section))
  }
}

function hydrateSection(section: SectionInstance): SectionInstance {
  const def = sectionRegistry.get(section.type)

  if (!def) {
    throw new Error(`[hydrate] Unknown section type: ${section.type}`)
  }

  // Merge default data with section data
  const defaultData = def.createDefaultData()

  return {
    ...section,
    data: {
      ...structuredClone(defaultData),
      ...(section.data ?? {})
    },
    styles: {
      ...(section.styles ?? {})
    },
    fieldStyles: {
      ...(section.fieldStyles ?? {})
    },
    itemStyles: {
      ...(section.itemStyles ?? {})
    }
  }
}
