export interface LandTheme {
  theme_preset: 'minimal' | 'bold' | 'editorial' | 'structure'
  color_main: string
  color_accent: string
  color_surface: string
  typography_style: 'sans' | 'serif' | 'mono'
}

export interface ContentMediaButton {
  id: string
  label: string
  url: string
}

export interface HeaderContent {
  title: string
  subtitle: string
  logo: string
  description?: string
  buttons?: ContentMediaButton[]
}

export interface HeaderSettings {
  cover_media_value: string
  cover_media_type: string
  profile_position: string
}

export interface ContentMediaContent {
  media_type: 'image' | 'video'
  media_url: string
  title: string
  subtitle: string
  body: string
  buttons: ContentMediaButton[]
}

export interface ListItem {
  id: string
  title: string
  url: string
  description: string
  icon: string
  position: string
}

export interface ListContent {
  title: string
  items: ListItem[]
}

export interface CollectionItem {
  id: string
  title: string
  description: string
  media_url: string
  content: string
  external_url: string
  position: string
}

export interface Collection {
  id: string
  title: string
  items: CollectionItem[]
}

export interface CollectionContent {
  collections: Collection[]
}

export interface CollectionSettings {
  style: 'grid' | 'list' | 'cards'
}

export interface StoreItem {
  id: string
  title: string
  description: string
  image: string
  price: number
  position: string
}

export interface Store {
  id: string
  title: string
  items: StoreItem[]
}

export interface StoreContent {
  stores: Store[]
}

export interface StoreSettings {
  style: 'grid' | 'list'
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
  buttons?: ContentMediaButton[]
}

export interface FooterSettings {
  cover_media_value: string
}

export interface Section {
  id: string
  type: string
  position: string
  style_variant: string
  settings_json: Record<string, unknown>
  content: Record<string, unknown> | null
}

export interface Land {
  id: string
  handle: string
  title: string
  description: string
  avatar_image: string
  sections: Section[]
  theme: LandTheme
}
