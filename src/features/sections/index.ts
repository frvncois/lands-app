import type { FunctionalComponent } from 'vue'
import type { SectionType } from '@/features/sections/types'
import { SECTION_REGISTRY } from '@/features/sections/registry'

export interface SectionPrimitive {
  id: SectionType
  label: string
  description: string
  icon: FunctionalComponent
}

export const sectionPrimitives: SectionPrimitive[] = (Object.values(SECTION_REGISTRY) as typeof SECTION_REGISTRY[SectionType][]).map(
  ({ type, label, description, icon }) => ({ id: type, label, description, icon }),
)
