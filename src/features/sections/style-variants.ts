import {
  SECTION_TYPES,
  COLLECTION_DISPLAY_STYLES,
  LIST_STYLES,
  type SectionType,
} from '@/features/sections/types'

export interface StyleVariantOption {
  value: string
  label: string
}

export const STYLE_VARIANTS_BY_SECTION: Record<SectionType, StyleVariantOption[]> = {
  [SECTION_TYPES.header]: [
    { value: 'below', label: 'Below' },
    { value: 'overlapping', label: 'Overlapping' },
    { value: 'overlay', label: 'Overlay' },
  ],
  [SECTION_TYPES.content_media]: [
    { value: 'default', label: 'Default' },
    { value: 'reversed', label: 'Reversed' },
  ],
  [SECTION_TYPES.list]: [
    { value: LIST_STYLES.default, label: 'Default' },
    { value: LIST_STYLES.compact, label: 'Compact' },
  ],
  [SECTION_TYPES.collection]: [
    { value: COLLECTION_DISPLAY_STYLES.grid, label: 'Grid' },
    { value: COLLECTION_DISPLAY_STYLES.list, label: 'List' },
    { value: COLLECTION_DISPLAY_STYLES.cards, label: 'Cards' },
  ],
  [SECTION_TYPES.store]: [
    { value: COLLECTION_DISPLAY_STYLES.grid, label: 'Grid' },
    { value: COLLECTION_DISPLAY_STYLES.list, label: 'List' },
  ],
  [SECTION_TYPES.monetize]: [
    { value: COLLECTION_DISPLAY_STYLES.grid, label: 'Grid' },
    { value: COLLECTION_DISPLAY_STYLES.list, label: 'List' },
    { value: COLLECTION_DISPLAY_STYLES.cards, label: 'Cards' },
  ],
  [SECTION_TYPES.campaign]: [
    { value: 'default', label: 'Default' },
    { value: 'minimal', label: 'Minimal' },
  ],
  [SECTION_TYPES.footer]: [
    { value: 'default', label: 'Default' },
  ],
}
