import type { ListItem } from '@/features/sections/types/links'
import type { Collection } from '@/features/sections/types/collection'
import type { Store } from '@/features/sections/types/store'

export const MOCK_LINKS_ITEMS: ListItem[] = [
  { id: 'mock-list-1', section_id: '', title: '[ Your first link ]', subtitle: '', url: '#', description: 'A short description', icon: '', position: 'a' },
  { id: 'mock-list-2', section_id: '', title: '[ Another link ]', subtitle: '', url: '#', description: 'Where it leads to', icon: '', position: 'b' },
  { id: 'mock-list-3', section_id: '', title: '[ One more link ]', subtitle: '', url: '#', description: '', icon: '', position: 'c' },
]

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'mock-col-1',
    section_id: '',
    title: '[ Collection Name ]',
    description: '[ A short description of this collection ]',
    position: 'a',
    items: [
      { id: 'mock-col-item-1', collection_id: 'mock-col-1', title: '[ Item Title ]', subtitle: '', description: '[ Description ]', media_url: '', content: '', external_url: '', settings_json: {}, position: 'a', created_at: '' },
      { id: 'mock-col-item-2', collection_id: 'mock-col-1', title: '[ Item Title ]', subtitle: '', description: '[ Description ]', media_url: '', content: '', external_url: '', settings_json: {}, position: 'b', created_at: '' },
      { id: 'mock-col-item-3', collection_id: 'mock-col-1', title: '[ Item Title ]', subtitle: '', description: '[ Description ]', media_url: '', content: '', external_url: '', settings_json: {}, position: 'c', created_at: '' },
    ],
  },
]

export const MOCK_STORES: Store[] = [
  {
    id: 'mock-store-1',
    section_id: '',
    title: '[ Store Name ]',
    description: '',
    mode: 'products',
    membership_price: 0,
    position: 'a',
    items: [
      { id: 'mock-store-item-1', store_id: 'mock-store-1', type: 'product', title: '[ Product Name ]', description: '[ Short description ]', image: '', gallery: [], price: 29, variants: [], inventory: 0, product_type: 'physical', file_url: '', content: '', position: 'a', created_at: '' },
      { id: 'mock-store-item-2', store_id: 'mock-store-1', type: 'product', title: '[ Product Name ]', description: '[ Short description ]', image: '', gallery: [], price: 49, variants: [], inventory: 0, product_type: 'physical', file_url: '', content: '', position: 'b', created_at: '' },
      { id: 'mock-store-item-3', store_id: 'mock-store-1', type: 'product', title: '[ Product Name ]', description: '[ Short description ]', image: '', gallery: [], price: 19, variants: [], inventory: 0, product_type: 'physical', file_url: '', content: '', position: 'c', created_at: '' },
    ],
  },
]
