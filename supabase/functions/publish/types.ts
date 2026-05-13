export interface LandTheme {
  theme_preset: 'minimal' | 'baseline' | 'structure'
  color_main: string
  color_accent: string
  color_surface: string
  font_title: string  // Full CSS font-family stack for headings
  font_body: string   // Full CSS font-family stack for body text
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
  subtitle?: string
  description?: string
  cover_url?: string
  price?: number
  billing_period?: 'monthly' | 'yearly'
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
  content?: string
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

export interface TextContent {
  title?: string
  subtitle?: string
  body?: string
  buttons?: ContentMediaButton[]
}

export interface MediaContent {
  media_type?: 'image' | 'video'
  url?: string
  caption?: string
}

export interface FooterContent {
  title?: string
  subtitle?: string
  description?: string
  buttons?: ContentMediaButton[]
  privacy_policy?: string
  terms_conditions?: string
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

export interface CampaignConfig {
  api_key?: string
  list_id?: string
  webhook_url?: string
  headers?: Record<string, string>
}

export interface CampaignIntegration {
  provider: 'brevo' | 'flodesk' | 'kit' | 'loops' | 'resend' | 'mailchimp' | 'webhook' | 'custom'
  config: CampaignConfig
}

export interface Land {
  id: string
  handle: string
  title: string
  description: string
  avatar_image: string
  sections: Section[]
  theme: LandTheme
  campaign_integration?: CampaignIntegration | null
  meta_title?: string
  meta_description?: string
  og_image?: string
}
