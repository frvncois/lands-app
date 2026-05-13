import type { ListItem } from '@/types/list'
import type { Collection } from '@/types/collection'
import type { Store } from '@/types/store'

export const MOCK_LIST_ITEMS: ListItem[] = [
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
      { id: 'mock-col-item-1', collection_id: 'mock-col-1', title: '[ Item Title ]', subtitle: '', description: '[ Description ]', media_url: '', content: '', external_url: '', position: 'a', created_at: '' },
      { id: 'mock-col-item-2', collection_id: 'mock-col-1', title: '[ Item Title ]', subtitle: '', description: '[ Description ]', media_url: '', content: '', external_url: '', position: 'b', created_at: '' },
      { id: 'mock-col-item-3', collection_id: 'mock-col-1', title: '[ Item Title ]', subtitle: '', description: '[ Description ]', media_url: '', content: '', external_url: '', position: 'c', created_at: '' },
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
      { id: 'mock-store-item-1', store_id: 'mock-store-1', type: 'product', title: '[ Product Name ]', description: '[ Short description ]', image: '', price: 29, variants: [], inventory: 0, product_type: 'physical', file_url: '', content: '', position: 'a', created_at: '' },
      { id: 'mock-store-item-2', store_id: 'mock-store-1', type: 'product', title: '[ Product Name ]', description: '[ Short description ]', image: '', price: 49, variants: [], inventory: 0, product_type: 'physical', file_url: '', content: '', position: 'b', created_at: '' },
      { id: 'mock-store-item-3', store_id: 'mock-store-1', type: 'product', title: '[ Product Name ]', description: '[ Short description ]', image: '', price: 19, variants: [], inventory: 0, product_type: 'physical', file_url: '', content: '', position: 'c', created_at: '' },
    ],
  },
]

export const MOCK_MONETIZE_COLLECTIONS: Collection[] = [
  {
    id: 'mock-monetize-1',
    section_id: '',
    title: '[ Collection Name ]',
    subtitle: '[ For your biggest fans ]',
    description: '[ Exclusive content for paying members ]',
    cover_url: '',
    price: 9,
    billing_period: 'monthly',
    position: 'a',
    items: [
      { id: 'mock-mon-item-1', collection_id: 'mock-monetize-1', title: '[ Exclusive item ]', subtitle: '', description: '[ Description ]', media_url: '', content: '', external_url: '', position: 'a', created_at: '' },
      { id: 'mock-mon-item-2', collection_id: 'mock-monetize-1', title: '[ Exclusive item ]', subtitle: '', description: '[ Description ]', media_url: '', content: '', external_url: '', position: 'b', created_at: '' },
    ],
  },
]

export const MOCK_MEDIA_CONTENT = { media_type: 'image' as const, url: '', caption: '[ Your caption here ]' }

export const MOCK_TEXT_CONTENT = {
  title: '[ Section Title ]',
  subtitle: '[ Subtitle or eyebrow text ]',
  body: '<p>[ Your content goes here. Open the section settings to start writing. ]</p>',
  buttons: [] as { id: string; label: string; url: string }[],
}
