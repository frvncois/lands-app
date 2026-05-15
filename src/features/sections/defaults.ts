import {
  SECTION_TYPES,
  COLLECTION_DISPLAY_STYLES,
  LINKS_STYLES,
  HEADER_PROFILE_POSITIONS,
  HEADER_COVER_MEDIA_TYPES,
  type SectionType,
} from '@/features/sections/types'
import { generatePositionAfter } from '@/shared/lib/position'


interface SectionDefault {
  style_variant: string
  settings_json: Record<string, unknown>
  content: Record<string, unknown> | null
  visible: boolean
}

export const DEFAULT_LAND_SECTIONS: SectionType[] = [
  'header', 'about', 'content_media', 'releases', 'videos', 'concert', 'store', 'campaign', 'footer',
]

export function createDefaultContent(type: SectionType): Record<string, unknown> {
  if (type === 'releases' || type === 'concert' || type === 'videos') {
    const collectionId = crypto.randomUUID()
    return {
      collections: [{
        id: collectionId,
        section_id: '',
        title: '',
        description: '',
        position: generatePositionAfter(null),
        items: [],
      }],
    }
  }
  if (type === 'store') {
    return {
      stores: [{
        id: crypto.randomUUID(),
        section_id: '',
        title: '',
        description: '',
        mode: 'products',
        membership_price: 0,
        position: generatePositionAfter(null),
        items: [],
      }],
    }
  }
  if (type === 'links') {
    return { items: [] }
  }
  const def = SECTION_DEFAULTS[type]
  return def.content ? structuredClone(def.content) : {}
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
    },
    visible: true,
  },
  [SECTION_TYPES.releases]: {
    style_variant: COLLECTION_DISPLAY_STYLES.grid,
    settings_json: { style: COLLECTION_DISPLAY_STYLES.grid },
    content: null,
    visible: true,
  },
  [SECTION_TYPES.concert]: {
    style_variant: COLLECTION_DISPLAY_STYLES.grid,
    settings_json: { style: COLLECTION_DISPLAY_STYLES.grid },
    content: null,
    visible: true,
  },
  [SECTION_TYPES.videos]: {
    style_variant: COLLECTION_DISPLAY_STYLES.grid,
    settings_json: { style: COLLECTION_DISPLAY_STYLES.grid },
    content: null,
    visible: true,
  },
  [SECTION_TYPES.store]: {
    style_variant: COLLECTION_DISPLAY_STYLES.grid,
    settings_json: { style: COLLECTION_DISPLAY_STYLES.grid },
    content: null,
    visible: true,
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
    visible: true,
  },
  [SECTION_TYPES.about]: {
    style_variant: 'default',
    settings_json: {},
    content: {
      media_type: 'image',
      media_url: '',
      title: 'About',
      subtitle: 'A little about me',
      body: 'Share your story, background and what drives you.',
      buttons: [],
    },
    visible: true,
  },
  [SECTION_TYPES.links]: {
    style_variant: LINKS_STYLES.default,
    settings_json: { style: LINKS_STYLES.default },
    content: null,
    visible: true,
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
    visible: true,
  },
  [SECTION_TYPES.footer]: {
    style_variant: 'default',
    settings_json: { cover_media_value: '' },
    content: {
      title: 'Project Title',
      subtitle: 'A short tagline',
    },
    visible: true,
  },
}
