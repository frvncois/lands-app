export interface CollectionItem {
  id: string
  collection_id: string
  title: string
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
  description: string
  position: string // fractional index
  items: CollectionItem[]
}

export interface CollectionSection {
  section_id: string
  collections: Collection[]
}
