export interface StoreVariant {
  id: string
  title: string  // e.g. "Size: Large"
  type: string   // freeform category label, e.g. "Size", "Color"
  price: number
  image: string
  inventory: number
}

export interface StoreItem {
  id: string
  store_id: string
  type: 'product' | 'membership'
  title: string
  description: string
  image: string
  gallery: string[]
  price: number
  product_type: 'physical' | 'digital'
  variants: StoreVariant[]
  inventory: number
  file_url: string
  content: string
  position: string
  created_at: string
}

export interface Store {
  id: string
  section_id: string
  title: string
  description: string
  mode: 'products' | 'membership'
  membership_price: number
  position: string
  items: StoreItem[]
}
