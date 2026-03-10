import type { ListItem } from '@/types/list'
import type { Collection } from '@/types/collection'
import type { Store } from '@/types/store'

export const MOCK_LIST_ITEMS: ListItem[] = [
  { id: 'mock-list-1', section_id: '', title: '[ Your first link ]', url: '#', description: 'A short description', icon: '', position: 'a' },
  { id: 'mock-list-2', section_id: '', title: '[ Another link ]', url: '#', description: 'Where it leads to', icon: '', position: 'b' },
  { id: 'mock-list-3', section_id: '', title: '[ One more link ]', url: '#', description: '', icon: '', position: 'c' },
]

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'mock-col-1',
    section_id: '',
    title: '[ Collection Name ]',
    description: '[ A short description of this collection ]',
    position: 'a',
    items: [
      { id: 'mock-col-item-1', collection_id: 'mock-col-1', title: '[ Item Title ]', description: '[ Description ]', media_url: '', content: '', external_url: '', position: 'a', created_at: '' },
      { id: 'mock-col-item-2', collection_id: 'mock-col-1', title: '[ Item Title ]', description: '[ Description ]', media_url: '', content: '', external_url: '', position: 'b', created_at: '' },
      { id: 'mock-col-item-3', collection_id: 'mock-col-1', title: '[ Item Title ]', description: '[ Description ]', media_url: '', content: '', external_url: '', position: 'c', created_at: '' },
    ],
  },
]

export const MOCK_STORES: Store[] = [
  {
    id: 'mock-store-1',
    section_id: '',
    title: '[ Store Name ]',
    mode: 'products',
    membership_price: 0,
    position: 'a',
    items: [
      { id: 'mock-store-item-1', store_id: 'mock-store-1', type: 'product', title: '[ Product Name ]', description: '[ Short description ]', image: '', price: 29, variants: [], inventory: 0, product_type: 'physical', file_url: '', position: 'a', created_at: '' },
      { id: 'mock-store-item-2', store_id: 'mock-store-1', type: 'product', title: '[ Product Name ]', description: '[ Short description ]', image: '', price: 49, variants: [], inventory: 0, product_type: 'physical', file_url: '', position: 'b', created_at: '' },
      { id: 'mock-store-item-3', store_id: 'mock-store-1', type: 'product', title: '[ Product Name ]', description: '[ Short description ]', image: '', price: 19, variants: [], inventory: 0, product_type: 'physical', file_url: '', position: 'c', created_at: '' },
    ],
  },
]

export const MOCK_MEDIA_CONTENT = { media_type: 'image' as const, url: '', caption: '[ Your caption here ]' }

export const MOCK_TEXT_BODY = '[ Your content goes here. Open the section settings to start writing. ]'
