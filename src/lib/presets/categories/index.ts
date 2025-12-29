import type { PresetCategory, UseCasePreset } from '../types'

import { musicCreativeCategory, musicPresets } from './music-creative'
import { foodHospitalityCategory, foodPresets } from './food-hospitality'
import { servicesCategory, servicesPresets } from './services'
import { commerceCategory, commercePresets } from './commerce'
import { eventsCategory, eventsPresets } from './events'
import { personalCategory, personalPresets } from './personal'
import { businessCategory, businessPresets } from './business'
import { localCategory, localPresets } from './local'
import { communityCategory, communityPresets } from './community'

// ============================================
// COMBINE ALL
// ============================================

const allCategories: PresetCategory[] = [
  musicCreativeCategory,
  foodHospitalityCategory,
  servicesCategory,
  commerceCategory,
  eventsCategory,
  personalCategory,
  businessCategory,
  localCategory,
  communityCategory,
].sort((a, b) => a.order - b.order)

const allPresets: UseCasePreset[] = [
  ...Object.values(musicPresets),
  ...Object.values(foodPresets),
  ...Object.values(servicesPresets),
  ...Object.values(commercePresets),
  ...Object.values(eventsPresets),
  ...Object.values(personalPresets),
  ...Object.values(businessPresets),
  ...Object.values(localPresets),
  ...Object.values(communityPresets),
]

// ============================================
// REGISTRIES
// ============================================

export const categoryRegistry = new Map<string, PresetCategory>(
  allCategories.map(cat => [cat.id, cat])
)

export const presetRegistry = new Map<string, UseCasePreset>(
  allPresets.map(preset => [preset.id, preset])
)

// ============================================
// EXPORTS
// ============================================

export { allCategories, allPresets }
export * from './music-creative'
export * from './food-hospitality'
export * from './services'
export * from './commerce'
export * from './events'
export * from './personal'
export * from './business'
export * from './local'
export * from './community'
