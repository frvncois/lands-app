import {
  SECTION_TYPES,
  TEXT_STYLES,
  COLLECTION_DISPLAY_STYLES,
  MEDIA_STYLES,
  LIST_STYLES,
  type SectionType,
} from '@/types/section'

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
  [SECTION_TYPES.text]: [
    { value: TEXT_STYLES.default, label: 'Default' },
    { value: TEXT_STYLES.centered, label: 'Centered' },
    { value: TEXT_STYLES.wide, label: 'Wide' },
  ],
  [SECTION_TYPES.collection]: [
    { value: COLLECTION_DISPLAY_STYLES.grid, label: 'Grid' },
    { value: COLLECTION_DISPLAY_STYLES.list, label: 'List' },
    { value: COLLECTION_DISPLAY_STYLES.cards, label: 'Cards' },
  ],
  [SECTION_TYPES.media]: [
    { value: MEDIA_STYLES.default, label: 'Default' },
    { value: MEDIA_STYLES.fullwidth, label: 'Full Width' },
    { value: MEDIA_STYLES.compact, label: 'Compact' },
  ],
  [SECTION_TYPES.list]: [
    { value: LIST_STYLES.default, label: 'Default' },
    { value: LIST_STYLES.compact, label: 'Compact' },
  ],
}
