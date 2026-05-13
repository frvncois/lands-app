import {
  SECTION_TYPES,
  COLLECTION_DISPLAY_STYLES,
  LINKS_STYLES,
  HEADER_PROFILE_POSITIONS,
  HEADER_COVER_MEDIA_TYPES,
  type SectionType,
} from '@/features/sections/types'


interface SectionDefault {
  style_variant: string
  settings_json: Record<string, unknown>
  content: Record<string, unknown> | null
}

export const SECTION_DEFAULTS: Record<SectionType, SectionDefault> = {
  [SECTION_TYPES.header]: {
    style_variant: HEADER_PROFILE_POSITIONS.below,
    settings_json: {
      cover_media_type: HEADER_COVER_MEDIA_TYPES.image,
      cover_media_value: '',
      profile_position: HEADER_PROFILE_POSITIONS.below,
    },
    content: {
      title: '',
      subtitle: '',
      logo: '',
      buttons: [],
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
  [SECTION_TYPES.monetize]: {
    style_variant: COLLECTION_DISPLAY_STYLES.grid,
    settings_json: { style: COLLECTION_DISPLAY_STYLES.grid },
    content: null,
  },
  [SECTION_TYPES.content_media]: {
    style_variant: 'default',
    settings_json: {},
    content: {
      media_type: 'image',
      media_url: '',
      title: '',
      subtitle: '',
      body: '',
      buttons: [],
    },
  },
  [SECTION_TYPES.links]: {
    style_variant: LINKS_STYLES.default,
    settings_json: { style: LINKS_STYLES.default },
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
