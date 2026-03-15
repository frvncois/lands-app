import { faker } from '@faker-js/faker'
import { generatePositions } from '@/lib/utils/position'
import type { Land } from '@/types/land'
import type { ListItem } from '@/types/list'
import type { Collection } from '@/types/collection'
import type { Store } from '@/types/store'
import type { Collaborator } from '@/types/collaborator'
import {
  createMockTheme,
  createMockHeaderSection,
  createMockListSection,
  createMockCollectionSection,
  createMockStoreSection,
  createMockFooterSection,
  createMockCollaborator,
} from './generators'

export interface MockLandData {
  land: Land
  listItems: Record<string, ListItem[]>
  collections: Record<string, Collection[]>
  stores: Record<string, Store[]>
  collaborators: Collaborator[]
}

/**
 * Build a complete mock Land with a variety of sections.
 */
export function buildMockLand(overrides?: Partial<Land>): MockLandData {
  const landId = overrides?.id || faker.string.uuid()
  const positions = generatePositions(5)

  const header = createMockHeaderSection(landId, positions[0]!)
  const { section: listSection, items: listItems } = createMockListSection(landId, positions[1]!)
  const { section: collectionSection, collections } = createMockCollectionSection(landId, positions[2]!)
  const positions2 = generatePositions(1)
  const { section: storeSection, stores } = createMockStoreSection(landId, positions2[0]!)
  const footer = createMockFooterSection(landId, positions[4]!)

  const collaborators = faker.helpers
    .multiple(() => createMockCollaborator(landId), { count: { min: 0, max: 3 } })

  const land: Land = {
    id: landId,
    user_id: overrides?.user_id || faker.string.uuid(),
    handle:
      overrides?.handle ||
      faker.internet.username().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    title: overrides?.title || faker.person.fullName(),
    description: overrides?.description || faker.person.bio(),
    avatar_image: overrides?.avatar_image ?? faker.image.avatar(),
    cover_image: overrides?.cover_image ?? faker.image.urlPicsumPhotos({ width: 1200, height: 600 }),
    sections: [header, listSection, collectionSection, storeSection, footer],
    theme: createMockTheme(landId, { theme_preset: 'minimal' }),
    plan: 'paid',
    collaborators,
    stripe_account_id: null,
    stripe_account_name: null,
    is_published: false,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  }

  return {
    land,
    listItems: { [listSection.id]: listItems },
    collections: { [collectionSection.id]: collections },
    stores: { [storeSection.id]: stores },
    collaborators,
  }
}

/**
 * Build a minimal mock Land (header + text only).
 */
export function buildMinimalMockLand(overrides?: Partial<Land>): MockLandData {
  const landId = overrides?.id || faker.string.uuid()
  const positions = generatePositions(2)

  const header = createMockHeaderSection(landId, positions[0]!)
  const footer = createMockFooterSection(landId, positions[1]!)

  const land: Land = {
    id: landId,
    user_id: overrides?.user_id || faker.string.uuid(),
    handle: overrides?.handle || 'new-project',
    title: overrides?.title || 'New Project',
    description: '',
    avatar_image: '',
    cover_image: '',
    sections: [header, footer],
    theme: createMockTheme(landId, {
      theme_preset: 'minimal',
      color_main: '#18181B',
      color_accent: '#6366F1',
      color_surface: '#F4F4F5',
    }),
    plan: 'paid',
    collaborators: [],
    stripe_account_id: null,
    stripe_account_name: null,
    is_published: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }

  return {
    land,
    listItems: {},
    collections: {},
    stores: {},
    collaborators: [],
  }
}
