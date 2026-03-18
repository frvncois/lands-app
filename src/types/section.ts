export const SECTION_TYPES = {
  header: 'header',
  content_media: 'content_media',
  list: 'list',
  collection: 'collection',
  store: 'store',
  monetize: 'monetize',
  campaign: 'campaign',
  footer: 'footer',
} as const

export type SectionType = typeof SECTION_TYPES[keyof typeof SECTION_TYPES]

// --- Style variants per section type ---

export const TEXT_STYLES = {
  default: 'default',
  centered: 'centered',
  wide: 'wide',
} as const

export type TextStyle = typeof TEXT_STYLES[keyof typeof TEXT_STYLES]

export const COLLECTION_DISPLAY_STYLES = {
  grid: 'grid',
  list: 'list',
  cards: 'cards',
} as const

export type CollectionDisplayStyle = typeof COLLECTION_DISPLAY_STYLES[keyof typeof COLLECTION_DISPLAY_STYLES]

export const MEDIA_STYLES = {
  default: 'default',
  fullwidth: 'fullwidth',
  compact: 'compact',
} as const

export type MediaStyle = typeof MEDIA_STYLES[keyof typeof MEDIA_STYLES]

export const LIST_STYLES = {
  default: 'default',
  compact: 'compact',
} as const

export type ListStyle = typeof LIST_STYLES[keyof typeof LIST_STYLES]

// --- Header-specific constants ---

export const HEADER_COVER_MEDIA_TYPES = {
  color: 'color',
  image: 'image',
  video: 'video',
} as const

export type HeaderCoverMediaType = typeof HEADER_COVER_MEDIA_TYPES[keyof typeof HEADER_COVER_MEDIA_TYPES]

export const HEADER_PROFILE_POSITIONS = {
  overlapping: 'overlapping',
  below: 'below',
  overlay: 'overlay',
} as const

export type HeaderProfilePosition = typeof HEADER_PROFILE_POSITIONS[keyof typeof HEADER_PROFILE_POSITIONS]

// --- Settings JSON types per section ---

export interface HeaderSettings {
  cover_media_type: HeaderCoverMediaType
  cover_media_value: string
  profile_position: HeaderProfilePosition
}

export interface TextSettings {
  style: TextStyle
}

export interface CollectionSettings {
  style: CollectionDisplayStyle
}

export interface StoreSettings {
  style: CollectionDisplayStyle
}

export interface MonetizeSettings {
  style: CollectionDisplayStyle
}

export interface MediaSettings {
  style: MediaStyle
}

export interface ListSettings {
  style: ListStyle
}

export interface CampaignSettings {
  show_name_field: boolean
}

export interface FooterSettings {
  cover_media_value: string
}

export type SectionSettings =
  | HeaderSettings
  | TextSettings
  | CollectionSettings
  | StoreSettings
  | MonetizeSettings
  | MediaSettings
  | ListSettings
  | CampaignSettings
  | FooterSettings

// --- Section content types ---

export interface HeaderContent {
  title: string
  subtitle: string
  logo: string
  description?: string
  buttons?: ContentMediaButton[]
}

export interface TextContent {
  title: string
  subtitle: string
  body: string // rich text
  buttons: ContentMediaButton[]
}

export const MEDIA_TYPES = {
  image: 'image',
  video: 'video',
} as const

export type MediaType = typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES]

export interface MediaItem {
  id: string
  media_type: MediaType
  url: string
  caption: string
  position: string // fractional index
}

export interface MediaContent {
  media_type: MediaType
  url: string
  caption: string
}

export interface CampaignContent {
  title: string
  description: string
  button_label: string
  placeholder: string
}

export interface FooterContent {
  title: string
  subtitle: string
  description?: string
  buttons?: ContentMediaButton[]
  privacy_policy?: string
  terms_conditions?: string
}

export interface ContentMediaButton {
  id: string
  label: string
  url: string
}

export interface ContentMediaContent {
  media_type: MediaType
  media_url: string
  title: string
  subtitle: string
  body: string
  buttons: ContentMediaButton[]
}

// --- Base section ---

export interface Section {
  id: string
  land_id: string
  type: SectionType
  position: string // fractional index
  style_variant: string
  settings_json: SectionSettings
  content: HeaderContent | TextContent | MediaContent | ContentMediaContent | CampaignContent | FooterContent | null
  created_at: string
}
