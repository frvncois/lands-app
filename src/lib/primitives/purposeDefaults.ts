import {
  MusicalNoteIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon,
  DevicePhoneMobileIcon,
  TicketIcon,
  PencilIcon,
} from '@heroicons/vue/24/outline'
import type { FunctionalComponent } from 'vue'
import { generatePositionAfter } from '@/lib/utils/position'
import type { SectionType } from '@/types/section'
import type { Collection } from '@/types/collection'
import type { Store } from '@/types/store'
import type { ListItem } from '@/types/list'

// ─── Purpose type ───

export type Purpose =
  | 'artist'
  | 'product'
  | 'business'
  | 'creator'
  | 'event'
  | 'writing'
  | 'custom'

export interface PurposeOption {
  id: Purpose
  label: string
  description: string
  icon: FunctionalComponent
  sections: SectionType[]
}

export const PURPOSE_OPTIONS: PurposeOption[] = [
  {
    id: 'artist',
    label: 'Artist',
    description: 'Share your visual art, music or creative practice',
    icon: MusicalNoteIcon,
    sections: ['header', 'content_media', 'collection', 'store', 'campaign', 'footer'],
  },
  {
    id: 'product',
    label: 'Product',
    description: 'Sell products or digital goods',
    icon: ShoppingBagIcon,
    sections: ['header', 'content_media', 'store', 'campaign', 'footer'],
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Promote your company or service',
    icon: BuildingOfficeIcon,
    sections: ['header', 'content_media', 'list', 'campaign', 'footer'],
  },
  {
    id: 'creator',
    label: 'Creator',
    description: 'Centralise your content and links',
    icon: DevicePhoneMobileIcon,
    sections: ['header', 'content_media', 'collection', 'store', 'list', 'footer'],
  },
  {
    id: 'event',
    label: 'Event',
    description: 'Promote a conference, concert or meetup',
    icon: TicketIcon,
    sections: ['header', 'content_media', 'collection', 'store', 'campaign', 'footer'],
  },
  {
    id: 'writing',
    label: 'Writing',
    description: 'Share articles, essays or newsletters',
    icon: PencilIcon,
    sections: ['header', 'list', 'collection', 'footer'],
  },
]

// ─── Seed content types ───

interface CollectionSeed {
  title: string
  description: string
  itemTitles: string[]
}

interface StoreSeed {
  title: string
  itemSeeds: { title: string; price: number }[]
}

interface ListSeed {
  items: { title: string; url: string }[]
}

interface PurposeSeeds {
  collection: CollectionSeed[]
  store: StoreSeed[]
  monetize: CollectionSeed[]
  list: ListSeed[]
}

// ─── Seed data per purpose ───
// Multiple entries per section type = cycling variants when the same type is added again.

const SEEDS: Record<Purpose, Partial<PurposeSeeds>> = {
  artist: {
    collection: [
      { title: 'Albums', description: 'Discography', itemTitles: ['First Light', 'Midnight Sessions', 'The Blue EP'] },
      { title: 'Events', description: 'Upcoming shows', itemTitles: ['Summer Tour 2026', 'Album Release Show', 'Festival Set'] },
      { title: 'Photos', description: 'Gallery', itemTitles: ['Live at the Venue', 'Studio Shots', 'Behind the Scenes'] },
    ],
    store: [
      { title: 'Merch', itemSeeds: [{ title: 'Tote Bag', price: 25 }, { title: 'Hoodie', price: 65 }, { title: 'Poster', price: 18 }] },
      { title: 'Digital Downloads', itemSeeds: [{ title: 'Album Download', price: 12 }, { title: 'Sample Pack', price: 29 }] },
    ],
    list: [
      { items: [{ title: 'Spotify', url: '#' }, { title: 'Apple Music', url: '#' }, { title: 'YouTube', url: '#' }, { title: 'Instagram', url: '#' }, { title: 'Bandcamp', url: '#' }] },
    ],
  },

  product: {
    store: [
      { title: 'Products', itemSeeds: [{ title: 'Starter Kit', price: 39 }, { title: 'Pro Bundle', price: 89 }, { title: 'Premium Plan', price: 149 }] },
      { title: 'Digital Goods', itemSeeds: [{ title: 'Template Pack', price: 29 }, { title: 'Design Kit', price: 49 }] },
    ],
    collection: [
      { title: 'Features', description: 'What makes it great', itemTitles: ['Speed', 'Simplicity', 'Power'] },
      { title: 'Testimonials', description: 'What people say', itemTitles: ['Happy Customer', 'Case Study', 'Press Quote'] },
    ],
    list: [
      { items: [{ title: 'Documentation', url: '#' }, { title: 'GitHub', url: '#' }, { title: 'Twitter', url: '#' }] },
    ],
  },

  business: {
    collection: [
      { title: 'Services', description: 'What we offer', itemTitles: ['Consulting', 'Strategy', 'Execution', 'Support'] },
      { title: 'Team', description: 'Who we are', itemTitles: ['Founder', 'Lead Designer', 'Developer'] },
      { title: 'Work', description: 'Selected projects', itemTitles: ['Client A', 'Client B', 'Client C'] },
    ],
    list: [
      { items: [{ title: 'LinkedIn', url: '#' }, { title: 'Twitter', url: '#' }, { title: 'Contact', url: '#' }] },
    ],
  },

  creator: {
    collection: [
      { title: 'Videos', description: 'Latest content', itemTitles: ['Episode 1', 'Episode 2', 'Episode 3', 'Episode 4'] },
      { title: 'Articles', description: 'Writing', itemTitles: ['Post Title', 'Post Title', 'Post Title'] },
      { title: 'Courses', description: 'Learn from me', itemTitles: ['Intro Course', 'Advanced Workshop', 'Masterclass'] },
    ],
    store: [
      { title: 'Shop', itemSeeds: [{ title: 'Course Bundle', price: 99 }, { title: 'Template Pack', price: 29 }, { title: 'Coaching Call', price: 199 }] },
    ],
    list: [
      { items: [{ title: 'YouTube', url: '#' }, { title: 'Twitter', url: '#' }, { title: 'Instagram', url: '#' }, { title: 'TikTok', url: '#' }, { title: 'Newsletter', url: '#' }] },
    ],
  },

  event: {
    collection: [
      { title: 'Schedule', description: "What's on", itemTitles: ['Opening Keynote', 'Workshop', 'Panel Discussion', 'Closing Night'] },
      { title: 'Speakers', description: 'Featured guests', itemTitles: ['Speaker 1', 'Speaker 2', 'Speaker 3'] },
      { title: 'Partners', description: "Who's involved", itemTitles: ['Sponsor A', 'Sponsor B', 'Media Partner'] },
    ],
    store: [
      { title: 'Tickets', itemSeeds: [{ title: 'Early Bird', price: 49 }, { title: 'Standard', price: 89 }, { title: 'VIP', price: 249 }] },
    ],
    list: [
      { items: [{ title: 'Twitter', url: '#' }, { title: 'Instagram', url: '#' }, { title: 'Facebook Event', url: '#' }] },
    ],
  },

  writing: {
    collection: [
      { title: 'Articles', description: 'Long-form writing', itemTitles: ['Essay Title', 'Essay Title', 'Essay Title', 'Essay Title'] },
      { title: 'Essays', description: 'Selected pieces', itemTitles: ['Deep Dive', 'Op-Ed', 'Reflection'] },
      { title: 'Projects', description: 'Longer work', itemTitles: ['Book in Progress', 'Newsletter Archive'] },
    ],
    list: [
      { items: [{ title: 'Substack', url: '#' }, { title: 'Twitter', url: '#' }, { title: 'Medium', url: '#' }, { title: 'LinkedIn', url: '#' }] },
    ],
  },

  custom: {
    collection: [
      { title: 'Collection', description: '', itemTitles: ['Item', 'Item', 'Item'] },
    ],
    store: [
      { title: 'Store', itemSeeds: [{ title: 'Product', price: 29 }, { title: 'Product', price: 49 }] },
    ],
    list: [
      { items: [{ title: 'Link', url: '#' }, { title: 'Link', url: '#' }, { title: 'Link', url: '#' }] },
    ],
  },
}

const FALLBACK = SEEDS.custom as PurposeSeeds

function makePositions(count: number): string[] {
  const result: string[] = []
  let last: string | null = null
  for (let i = 0; i < count; i++) {
    last = generatePositionAfter(last)
    result.push(last)
  }
  return result
}

/**
 * Build initial seeded content for a new section based on the land's purpose.
 *
 * `existingCount` = number of sections of the same type already on the land.
 * This cycles through variants so repeated adds of the same type get different content.
 *
 * Returns a content object ready to be set on the section. Callers must patch
 * `section_id` / `collection_id` / `store_id` after the section id is known.
 */
export function buildSectionContent(
  purpose: string | undefined,
  type: SectionType,
  existingCount: number,
): Record<string, unknown> {
  const p = (purpose as Purpose | undefined) ?? 'custom'
  const seeds = SEEDS[p] ?? FALLBACK

  if (type === 'collection' || type === 'monetize') {
    const variants = seeds.collection ?? FALLBACK.collection
    const seed = variants[existingCount % variants.length]!
    const collectionId = crypto.randomUUID()
    const positions = makePositions(seed.itemTitles.length)
    const col: Collection = {
      id: collectionId,
      section_id: '',
      title: seed.title,
      description: seed.description,
      ...(type === 'monetize' ? { price: 9 } : {}),
      position: generatePositionAfter(null),
      items: seed.itemTitles.map((title, i) => ({
        id: crypto.randomUUID(),
        collection_id: collectionId,
        title,
        subtitle: '',
        description: '',
        media_url: '',
        content: '',
        external_url: '',
        position: positions[i]!,
        created_at: new Date().toISOString(),
      })),
    }
    return { collections: [col] }
  }

  if (type === 'store') {
    const variants = seeds.store ?? FALLBACK.store
    const seed = variants[existingCount % variants.length]!
    const storeId = crypto.randomUUID()
    const positions = makePositions(seed.itemSeeds.length)
    const store: Store = {
      id: storeId,
      section_id: '',
      title: seed.title,
      description: '',
      mode: 'products',
      membership_price: 0,
      position: generatePositionAfter(null),
      items: seed.itemSeeds.map((item, i) => ({
        id: crypto.randomUUID(),
        store_id: storeId,
        type: 'product' as const,
        title: item.title,
        description: '',
        image: '',
        price: item.price,
        variants: [],
        inventory: 0,
        product_type: 'physical' as const,
        file_url: '',
        content: '',
        position: positions[i]!,
        created_at: new Date().toISOString(),
      })),
    }
    return { stores: [store] }
  }

  if (type === 'list') {
    const variants = seeds.list ?? FALLBACK.list
    const seed = variants[existingCount % variants.length]!
    const positions = makePositions(seed.items.length)
    const items: ListItem[] = seed.items.map((item, i) => ({
      id: crypto.randomUUID(),
      section_id: '',
      title: item.title,
      subtitle: '',
      url: item.url,
      description: '',
      icon: '',
      position: positions[i]!,
    }))
    return { items }
  }

  return {}
}
