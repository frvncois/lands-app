import { computed } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import { PLAN_DETAILS } from '@/features/plan/types'
import type { SectionType } from '@/features/sections/types'
import { SECTION_REGISTRY } from '@/features/sections/registry'

export function usePlan() {
  const landStore = useLandStore()

  const plan = computed(() => landStore.activeLand?.plan ?? 'free')
  const details = computed(() => PLAN_DETAILS[plan.value])
  const isPaid = computed(() => plan.value === 'paid')

  // ─── Feature gates ───

  const canUseCollaborators = computed(() => details.value.collaborators)
  const canUseCampaign = computed(() => details.value.campaign)
  const canUseCustomDomain = computed(() => details.value.custom_domain)

  // ─── Content limits ───

  const maxSections = computed(() => details.value.max_sections)
  const maxCollectionSections = computed(() => details.value.max_collection_sections)
  const maxCollectionsPerSection = computed(() => details.value.max_collections_per_section)
  const maxItemsPerCollection = computed(() => details.value.max_items_per_collection)

  /** Returns true if a new content section (excluding header/footer) can be added. */
  function withinSectionLimit(currentCount: number): boolean {
    const max = maxSections.value
    return max === -1 || currentCount < max
  }

  /** Returns true if another collection/store/monetize section can be added to the project. */
  function withinCollectionSectionLimit(currentCount: number): boolean {
    const max = maxCollectionSections.value
    return max === -1 || currentCount < max
  }

  /** Returns true if the section type is allowed on the current plan. */
  function canAddSectionType(type: SectionType): boolean {
    const requires = SECTION_REGISTRY[type].plan?.requires
    if (requires === 'paid') return details.value.campaign  // reuse campaign gate for all paid-only types
    return true
  }

  /** Returns true if a new collection can be added to a section. */
  function withinCollectionLimit(currentCount: number): boolean {
    const max = maxCollectionsPerSection.value
    return max === -1 || currentCount < max
  }

  /** Returns true if a new item can be added to a collection/store. */
  function withinItemLimit(currentCount: number): boolean {
    const max = maxItemsPerCollection.value
    return max === -1 || currentCount < max
  }

  return {
    plan,
    isPaid,
    canUseCollaborators,
    canUseCampaign,
    canUseCustomDomain,
    maxSections,
    maxCollectionSections,
    maxCollectionsPerSection,
    maxItemsPerCollection,
    withinSectionLimit,
    withinCollectionSectionLimit,
    canAddSectionType,
    withinCollectionLimit,
    withinItemLimit,
  }
}
