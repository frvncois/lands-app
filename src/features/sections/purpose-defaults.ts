import {
  MusicalNoteIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon,
  DevicePhoneMobileIcon,
  TicketIcon,
  PencilIcon,
} from '@heroicons/vue/24/outline'
import type { FunctionalComponent } from 'vue'
import { generatePositionAfter } from '@/shared/lib/position'
import type { SectionType } from '@/features/sections/types'
import type { Collection } from '@/features/sections/types/collection'
import type { Store } from '@/features/sections/types/store'
import type { ListItem } from '@/features/sections/types/links'

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
    sections: ['header', 'about', 'content_media', 'releases', 'videos', 'concert', 'store', 'campaign', 'footer'],
  },
  {
    id: 'product',
    label: 'Product',
    description: 'Sell products or digital goods',
    icon: ShoppingBagIcon,
    sections: ['header', 'about', 'content_media', 'post', 'store', 'campaign', 'footer'],
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Promote your company or service',
    icon: BuildingOfficeIcon,
    sections: ['header', 'about', 'content_media', 'links', 'campaign', 'footer'],
  },
  {
    id: 'creator',
    label: 'Creator',
    description: 'Centralise your content and links',
    icon: DevicePhoneMobileIcon,
    sections: ['header', 'about', 'content_media', 'post', 'videos', 'releases', 'store', 'links', 'footer'],
  },
  {
    id: 'event',
    label: 'Event',
    description: 'Promote a conference, concert or meetup',
    icon: TicketIcon,
    sections: ['header', 'about', 'content_media', 'concert', 'store', 'campaign', 'footer'],
  },
  {
    id: 'writing',
    label: 'Writing',
    description: 'Share articles, essays or newsletters',
    icon: PencilIcon,
    sections: ['header', 'about', 'links', 'post', 'footer'],
  },
]

// ─── Seed content types ───

interface AboutSeed {
  title: string
  subtitle: string
  body: string
}

interface CollectionSeed {
  title: string
  description: string
  itemTitles: string[]
}

interface StoreSeed {
  title: string
  itemSeeds: { title: string; price: number }[]
}

interface LinksSeed {
  items: { title: string; url: string }[]
}

interface PurposeSeeds {
  about: AboutSeed[]
  post: CollectionSeed[]
  releases: CollectionSeed[]
  concert: CollectionSeed[]
  videos: CollectionSeed[]
  store: StoreSeed[]
  links: LinksSeed[]
}

// ─── Seed data per purpose ───
// Multiple entries per section type = cycling variants when the same type is added again.

const SEEDS: Record<Purpose, Partial<PurposeSeeds>> = {
  artist: {
    about: [
      { title: 'About Me', subtitle: 'Artist', body: 'A few lines about your creative journey, influences and the story behind your work.' },
    ],
    releases: [
      { title: 'Discography', description: 'My albums and EPs', itemTitles: ['First Light', 'Midnight Sessions', 'The Blue EP'] },
    ],
    videos: [
      { title: 'Videos', description: 'Live sessions, music videos and performances', itemTitles: ['Music Video', 'Live Session', 'Behind the Scenes'] },
    ],
    concert: [
      { title: 'Tour Dates', description: 'Upcoming shows', itemTitles: ['Summer Tour 2026', 'Album Release Show', 'Festival Set'] },
    ],
    store: [
      { title: 'Merch', itemSeeds: [{ title: 'Tote Bag', price: 25 }, { title: 'Hoodie', price: 65 }, { title: 'Poster', price: 18 }] },
      { title: 'Digital Downloads', itemSeeds: [{ title: 'Album Download', price: 12 }, { title: 'Sample Pack', price: 29 }] },
    ],
    links: [
      { items: [{ title: 'Spotify', url: '#' }, { title: 'Apple Music', url: '#' }, { title: 'YouTube', url: '#' }, { title: 'Instagram', url: '#' }, { title: 'Bandcamp', url: '#' }] },
    ],
  },

  product: {
    about: [
      { title: 'About the Product', subtitle: 'Built for makers', body: 'The problem we solve and why we built it.' },
    ],
    post: [
      { title: 'Features', description: 'What makes it great', itemTitles: ['Speed', 'Simplicity', 'Power'] },
      { title: 'Testimonials', description: 'What people say', itemTitles: ['Happy Customer', 'Case Study', 'Press Quote'] },
    ],
    store: [
      { title: 'Products', itemSeeds: [{ title: 'Starter Kit', price: 39 }, { title: 'Pro Bundle', price: 89 }, { title: 'Premium Plan', price: 149 }] },
      { title: 'Digital Goods', itemSeeds: [{ title: 'Template Pack', price: 29 }, { title: 'Design Kit', price: 49 }] },
    ],
    links: [
      { items: [{ title: 'Documentation', url: '#' }, { title: 'GitHub', url: '#' }, { title: 'Twitter', url: '#' }] },
    ],
  },

  business: {
    about: [
      { title: 'About Us', subtitle: 'Our story', body: 'What we do, why we do it and the team behind the work.' },
    ],
    post: [
      { title: 'Services', description: 'What we offer', itemTitles: ['Consulting', 'Strategy', 'Execution', 'Support'] },
      { title: 'Team', description: 'Who we are', itemTitles: ['Founder', 'Lead Designer', 'Developer'] },
      { title: 'Work', description: 'Selected projects', itemTitles: ['Client A', 'Client B', 'Client C'] },
    ],
    links: [
      { items: [{ title: 'LinkedIn', url: '#' }, { title: 'Twitter', url: '#' }, { title: 'Contact', url: '#' }] },
    ],
  },

  creator: {
    about: [
      { title: 'About Me', subtitle: 'Creator', body: 'Who you are, what you make and why people should follow along.' },
    ],
    post: [
      { title: 'Articles', description: 'Writing', itemTitles: ['Post Title', 'Post Title', 'Post Title'] },
      { title: 'Courses', description: 'Learn from me', itemTitles: ['Intro Course', 'Advanced Workshop', 'Masterclass'] },
    ],
    videos: [
      { title: 'Videos', description: 'Latest content', itemTitles: ['Episode 1', 'Episode 2', 'Episode 3', 'Episode 4'] },
    ],
    releases: [
      { title: 'Albums', description: 'Music releases', itemTitles: ['First Album', 'EP', 'Single'] },
    ],
    store: [
      { title: 'Shop', itemSeeds: [{ title: 'Course Bundle', price: 99 }, { title: 'Template Pack', price: 29 }, { title: 'Coaching Call', price: 199 }] },
    ],
    links: [
      { items: [{ title: 'YouTube', url: '#' }, { title: 'Twitter', url: '#' }, { title: 'Instagram', url: '#' }, { title: 'TikTok', url: '#' }, { title: 'Newsletter', url: '#' }] },
    ],
  },

  event: {
    about: [
      { title: 'About the Event', subtitle: 'What to expect', body: 'A brief description of the event, its goals and what attendees can look forward to.' },
    ],
    concert: [
      { title: 'Schedule', description: "What's on", itemTitles: ['Opening Keynote', 'Workshop', 'Panel Discussion', 'Closing Night'] },
      { title: 'Speakers', description: 'Featured guests', itemTitles: ['Speaker 1', 'Speaker 2', 'Speaker 3'] },
      { title: 'Partners', description: "Who's involved", itemTitles: ['Sponsor A', 'Sponsor B', 'Media Partner'] },
    ],
    store: [
      { title: 'Tickets', itemSeeds: [{ title: 'Early Bird', price: 49 }, { title: 'Standard', price: 89 }, { title: 'VIP', price: 249 }] },
    ],
    links: [
      { items: [{ title: 'Twitter', url: '#' }, { title: 'Instagram', url: '#' }, { title: 'Facebook Event', url: '#' }] },
    ],
  },

  writing: {
    about: [
      { title: 'About the Author', subtitle: 'Writer', body: 'Who you are and what you write about.' },
    ],
    post: [
      { title: 'Articles', description: 'Long-form writing', itemTitles: ['Essay Title', 'Essay Title', 'Essay Title', 'Essay Title'] },
      { title: 'Essays', description: 'Selected pieces', itemTitles: ['Deep Dive', 'Op-Ed', 'Reflection'] },
      { title: 'Projects', description: 'Longer work', itemTitles: ['Book in Progress', 'Newsletter Archive'] },
    ],
    links: [
      { items: [{ title: 'Substack', url: '#' }, { title: 'Twitter', url: '#' }, { title: 'Medium', url: '#' }, { title: 'LinkedIn', url: '#' }] },
    ],
  },

  custom: {
    about: [
      { title: 'About', subtitle: '', body: 'Tell your story here.' },
    ],
    post: [
      { title: 'Collection', description: '', itemTitles: ['Item', 'Item', 'Item'] },
    ],
    releases: [
      { title: 'Releases', description: '', itemTitles: ['Item', 'Item', 'Item'] },
    ],
    concert: [
      { title: 'Events', description: '', itemTitles: ['Item', 'Item', 'Item'] },
    ],
    videos: [
      { title: 'Videos', description: '', itemTitles: ['Video', 'Video', 'Video'] },
    ],
    store: [
      { title: 'Store', itemSeeds: [{ title: 'Product', price: 29 }, { title: 'Product', price: 49 }] },
    ],
    links: [
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

  if (type === 'about') {
    const variants = seeds.about ?? FALLBACK.about
    const seed = variants[existingCount % variants.length]!
    return {
      media_type: 'image',
      media_url: '',
      title: seed.title,
      subtitle: seed.subtitle,
      body: seed.body,
      buttons: [],
    }
  }

  if (type === 'post' || type === 'releases' || type === 'concert' || type === 'videos') {
    const variants = (seeds[type as 'post' | 'releases' | 'concert' | 'videos']) ?? (FALLBACK[type as 'post' | 'releases' | 'concert' | 'videos'])
    const seed = variants[existingCount % variants.length]!
    const collectionId = crypto.randomUUID()
    const positions = makePositions(seed.itemTitles.length)
    const col: Collection = {
      id: collectionId,
      section_id: '',
      title: seed.title,
      description: seed.description,
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

  if (type === 'links') {
    const variants = seeds.links ?? FALLBACK.links
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
