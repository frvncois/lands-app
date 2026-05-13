import { reactive } from 'vue'
import type { User } from '@/features/auth/types/user'
import type { Land } from '@/features/lands/types'
import type { ListItem } from '@/features/sections/types/list'
import type { Collection } from '@/features/sections/types/collection'
import type { Store } from '@/features/sections/types/store'
import { createMockUser } from './generators'
import { buildMockLand, buildMinimalMockLand } from './landBuilder'

interface MockState {
  user: User
  lands: Land[]
  listItems: Record<string, ListItem[]>
  collections: Record<string, Collection[]>
  stores: Record<string, Store[]>
}

function createMockState(): MockState {
  const user = createMockUser({
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@lands.app',
  })

  const fullLand = buildMockLand({
    user_id: user.id,
    handle: 'janedoe',
    title: 'Jane Doe',
    description: 'Designer, developer, and occasional photographer.',
  })

  const minimalLand = buildMinimalMockLand({
    user_id: user.id,
    handle: 'side-project',
    title: 'Side Project',
  })

  return {
    user,
    lands: [fullLand.land, minimalLand.land],
    listItems: {
      ...fullLand.listItems,
      ...minimalLand.listItems,
    },
    collections: {
      ...fullLand.collections,
      ...minimalLand.collections,
    },
    stores: {
      ...fullLand.stores,
      ...minimalLand.stores,
    },
  }
}

export const mockState = reactive(createMockState())

/** Reset mock state (useful for testing). */
export function resetMockState() {
  const fresh = createMockState()
  Object.assign(mockState, fresh)
}

/** Get list items for a specific section. */
export function getMockListItems(sectionId: string): ListItem[] {
  return mockState.listItems[sectionId] || []
}

/** Get collections for a specific section. */
export function getMockCollections(sectionId: string): Collection[] {
  return mockState.collections[sectionId] || []
}

/** Get stores for a specific section. */
export function getMockStores(sectionId: string): Store[] {
  return mockState.stores[sectionId] || []
}

/** Find a land by handle. */
export function getMockLandByHandle(handle: string): Land | null {
  return mockState.lands.find((l) => l.handle === handle) ?? null
}
