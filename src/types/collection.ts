export interface CollectionItem {
  id: string
  collection_id: string
  title: string
  subtitle: string
  description: string
  media_url: string
  content: string
  external_url: string
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

