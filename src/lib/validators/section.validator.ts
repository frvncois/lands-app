import { SECTION_TYPES, type SectionType } from '@/types/section'

export function isValidSectionType(type: string): type is SectionType {
  return Object.values(SECTION_TYPES).includes(type as SectionType)
}
