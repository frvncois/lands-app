export interface StoreVariantOption {
  value: string
  inventory: number
}

export interface StoreVariant {
  id: string
  name: string
  options: StoreVariantOption[]
}

export interface StoreItem {
  id: string
  store_id: string
  title: string
  description: string
  image: string
  price: number
  product_type: 'physical' | 'digital'
  variants: StoreVariant[]
  inventory: number
  file_url: string
  position: string
  created_at: string
}

export interface Store {
  id: string
  section_id: string
  title: string
  position: string
  items: StoreItem[]
}
