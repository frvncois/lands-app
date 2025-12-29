import type { SectionBlueprint } from '../types'

import { sharedBlueprints } from './shared'
import { musicBlueprints } from './music'
import { foodBlueprints } from './food'
import { servicesBlueprints } from './services'
import { commerceBlueprints } from './commerce'
import { eventsBlueprints } from './events'
import { personalBlueprints } from './personal'
import { businessBlueprints } from './business'
import { localBlueprints } from './local'
import { communityBlueprints } from './community'

// ============================================
// COMBINE ALL BLUEPRINTS
// ============================================

const allBlueprints: SectionBlueprint[] = [
  ...sharedBlueprints,
  ...musicBlueprints,
  ...foodBlueprints,
  ...servicesBlueprints,
  ...commerceBlueprints,
  ...eventsBlueprints,
  ...personalBlueprints,
  ...businessBlueprints,
  ...localBlueprints,
  ...communityBlueprints,
]

// ============================================
// REGISTRY
// ============================================

export const blueprintRegistry = new Map<string, SectionBlueprint>(
  allBlueprints.map(bp => [bp.id, bp])
)

export function getBlueprint(id: string): SectionBlueprint | undefined {
  return blueprintRegistry.get(id)
}

export function getAllBlueprints(): SectionBlueprint[] {
  return allBlueprints
}

export function getBlueprintsByType(type: string): SectionBlueprint[] {
  return allBlueprints.filter(bp => bp.type === type)
}
