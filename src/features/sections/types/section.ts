import type { ListItem } from '@/features/sections/types/links'
import type { Collection } from '@/features/sections/types/collection'
import type { Store } from '@/features/sections/types/store'

export const SECTION_TYPES = {
  header: 'header',
  content_media: 'content_media',
  links: 'links',
  collection: 'collection',
  store: 'store',
  monetize: 'monetize',
  campaign: 'campaign',
  footer: 'footer',
} as const

export type SectionType = typeof SECTION_TYPES[keyof typeof SECTION_TYPES]

// --- Style variants per section type ---

export const COLLECTION_DISPLAY_STYLES = {
  grid: 'grid',
  list: 'list',
  cards: 'cards',
} as const

export type CollectionDisplayStyle = typeof COLLECTION_DISPLAY_STYLES[keyof typeof COLLECTION_DISPLAY_STYLES]

export const LINKS_STYLES = {
  default: 'default',
  compact: 'compact',
} as const

export type LinksStyle = typeof LINKS_STYLES[keyof typeof LINKS_STYLES]

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

export interface ContentMediaSettings {
  // content_media has no settings fields
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

export interface LinksSettings {
  style: LinksStyle
}

export interface CampaignSettings {
  show_name_field: boolean
}

export interface FooterSettings {
  cover_media_value: string
}

export type SectionSettings =
  | HeaderSettings
  | ContentMediaSettings
  | CollectionSettings
  | StoreSettings
  | MonetizeSettings
  | LinksSettings
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

const MEDIA_TYPES = {
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

export interface LinksContent {
  title: string
  description: string
  items: ListItem[]
}

export interface CollectionContent {
  collections: Collection[]
}

export interface StoreContent {
  stores: Store[]
}

export interface MonetizeContent {
  collections: Collection[]
}

export type SectionContent =
  | HeaderContent
  | ContentMediaContent
  | LinksContent
  | CollectionContent
  | StoreContent
  | MonetizeContent
  | CampaignContent
  | FooterContent

// --- Discriminated Section union ---

interface BaseSection<TType extends SectionType, TContent, TSettings> {
  id: string
  land_id: string
  type: TType
  position: string
  style_variant: string
  settings_json: TSettings
  content: TContent
  created_at: string
}

export type HeaderSection = BaseSection<'header', HeaderContent, HeaderSettings>
export type ContentMediaSection = BaseSection<'content_media', ContentMediaContent, ContentMediaSettings>
export type LinksSection = BaseSection<'links', LinksContent | null, LinksSettings>
export type CollectionSection = BaseSection<'collection', CollectionContent | null, CollectionSettings>
export type StoreSection = BaseSection<'store', StoreContent | null, StoreSettings>
export type MonetizeSection = BaseSection<'monetize', MonetizeContent | null, MonetizeSettings>
export type CampaignSection = BaseSection<'campaign', CampaignContent, CampaignSettings>
export type FooterSection = BaseSection<'footer', FooterContent, FooterSettings>

export type Section =
  | HeaderSection
  | ContentMediaSection
  | LinksSection
  | CollectionSection
  | StoreSection
  | MonetizeSection
  | CampaignSection
  | FooterSection
