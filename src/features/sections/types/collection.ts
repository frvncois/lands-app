export interface CollectionItem {
  id: string
  collection_id: string
  title: string
  subtitle: string
  description: string
  media_url: string
  content: string
  external_url: string
  settings_json: Record<string, unknown>
  position: string // fractional index
  created_at: string
}

export interface Collection {
  id: string
  section_id: string
  title: string
  subtitle?: string
  description?: string
  cover_url?: string
  price?: number
  billing_period?: 'monthly' | 'yearly'
  position: string // fractional index
  items: CollectionItem[]
}

// ─── Type-specific item settings (stored in CollectionItem.settings_json) ───

export interface Track {
  id: string
  title: string
  length: string
}

export interface ItemLink {
  id: string
  title: string
  url: string
}

export interface BuyLink {
  id: string
  title: string
  url: string
  merch_item_id?: string
}

export interface ReleaseItemSettings {
  year?: string
  tracks?: Track[]
  labels?: ItemLink[]
  stream_links?: ItemLink[]
  buy_links?: BuyLink[]
}

export interface ConcertItemSettings {
  date?: string
  hour?: string
  price?: string
  venue?: string
  city?: string
  country?: string
  links?: ItemLink[]
  ticket_label?: string
  ticket_url?: string
}

export interface VideoItemSettings {
  year?: string
  video_url?: string
  credits?: ItemLink[]
}
