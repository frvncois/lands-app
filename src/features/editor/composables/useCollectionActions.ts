import { computed } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import { addToast } from '@/shared/composables/useToast'
import { usePlan } from '@/features/plan/composables/usePlan'
import { useNestedItems } from './useNestedItems'
import type { Collection, CollectionItem } from '@/features/sections/types/collection'

export function useCollectionActions() {
  const landStore = useLandStore()
  const { withinCollectionLimit, withinItemLimit, maxCollectionsPerSection, maxItemsPerCollection } = usePlan()
  const { addToArray, updateInArray, deleteFromArray, reorderInArray, addToNested, updateInNested, deleteFromNested, reorderInNested } = useNestedItems()
  const activeLand = computed(() => landStore.activeLand)

  function getCols(sectionId: string): Collection[] {
    const s = activeLand.value?.sections.find((s) => s.id === sectionId)
    return (s?.type === 'collection' || s?.type === 'monetize') ? (s.content?.collections ?? []) : []
  }

  function addCollection(sectionId: string) {
    const existing = getCols(sectionId)
    if (!withinCollectionLimit(existing.length)) { addToast(`Free plan allows up to ${maxCollectionsPerSection.value} collections — upgrade to add more`, 'error'); return }
    addToArray<Collection>(sectionId, 'collections', existing, { section_id: sectionId, title: 'New Collection', description: '', items: [] })
    addToast('Collection added')
  }

  function updateCollection(sectionId: string, colId: string, data: Partial<Collection>) {
    updateInArray(sectionId, 'collections', getCols(sectionId), colId, data)
  }

  function deleteCollection(sectionId: string, colId: string) {
    deleteFromArray(sectionId, 'collections', getCols(sectionId), colId)
    addToast('Collection removed')
  }

  function reorderCollection(sectionId: string, colId: string, newPos: string) {
    reorderInArray(sectionId, 'collections', getCols(sectionId), colId, newPos)
  }

  function addCollectionItem(sectionId: string, colId: string, data: Pick<CollectionItem, 'title' | 'subtitle' | 'description' | 'media_url' | 'content' | 'external_url'>): CollectionItem | undefined {
    const col = getCols(sectionId).find((c) => c.id === colId)
    if (col && !withinItemLimit(col.items.length)) { addToast(`Free plan allows up to ${maxItemsPerCollection.value} items per collection — upgrade to add more`, 'error'); return undefined }
    const item = addToNested<Collection, CollectionItem>(sectionId, 'collections', getCols(sectionId), colId, { ...data, collection_id: colId, created_at: new Date().toISOString() })
    if (item) addToast('Item added')
    return item
  }

  function updateCollectionItem(sectionId: string, colId: string, itemId: string, data: Partial<CollectionItem>) {
    updateInNested(sectionId, 'collections', getCols(sectionId), colId, itemId, data)
  }

  function deleteCollectionItem(sectionId: string, colId: string, itemId: string) {
    deleteFromNested(sectionId, 'collections', getCols(sectionId), colId, itemId)
    addToast('Item removed')
  }

  function reorderCollectionItem(sectionId: string, colId: string, itemId: string, newPos: string) {
    reorderInNested(sectionId, 'collections', getCols(sectionId), colId, itemId, newPos)
  }

  return { addCollection, updateCollection, deleteCollection, reorderCollection, addCollectionItem, updateCollectionItem, deleteCollectionItem, reorderCollectionItem }
}
