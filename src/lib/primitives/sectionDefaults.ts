import {
  SECTION_TYPES,
  TEXT_STYLES,
  COLLECTION_DISPLAY_STYLES,
  MEDIA_STYLES,
  LIST_STYLES,
  HEADER_PROFILE_POSITIONS,
  type SectionType,
  type SectionSettings,
  type HeaderContent,
  type TextContent,
  type MediaContent,
  type CampaignContent,
  type FooterContent,
} from '@/types/section'


interface SectionDefault {
  style_variant: string
  settings_json: SectionSettings
  content: HeaderContent | TextContent | MediaContent | CampaignContent | FooterContent | null
}

export const SECTION_DEFAULTS: Record<SectionType, SectionDefault> = {
  [SECTION_TYPES.header]: {
    style_variant: HEADER_PROFILE_POSITIONS.below,
    settings_json: {},
    content: {
      title: '',
      subtitle: '',
    },
  },
  [SECTION_TYPES.text]: {
    style_variant: TEXT_STYLES.default,
    settings_json: { style: TEXT_STYLES.default },
    content: {
      body: '',
    },
  },
  [SECTION_TYPES.collection]: {
    style_variant: COLLECTION_DISPLAY_STYLES.grid,
    settings_json: { style: COLLECTION_DISPLAY_STYLES.grid },
    content: null,
  },
  [SECTION_TYPES.store]: {
    style_variant: COLLECTION_DISPLAY_STYLES.grid,
    settings_json: { style: COLLECTION_DISPLAY_STYLES.grid },
    content: null,
  },
  [SECTION_TYPES.media]: {
    style_variant: MEDIA_STYLES.default,
    settings_json: { style: MEDIA_STYLES.default },
    content: {
      items: [],
    },
  },
  [SECTION_TYPES.list]: {
    style_variant: LIST_STYLES.default,
    settings_json: { style: LIST_STYLES.default },
    content: null,
  },
  [SECTION_TYPES.campaign]: {
    style_variant: 'default',
    settings_json: { show_name_field: false },
    content: {
      title: 'Stay in the loop',
      description: 'Subscribe to get updates directly in your inbox.',
      button_label: 'Subscribe',
      placeholder: 'Your email address',
    },
  },
  [SECTION_TYPES.footer]: {
    style_variant: 'default',
    settings_json: { cover_media_value: '' },
    content: {
      title: 'Project Title',
      subtitle: 'A short tagline',
    },
  },
}
