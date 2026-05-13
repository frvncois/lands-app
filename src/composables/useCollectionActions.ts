import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { useToast } from '@/composables/useToast'
import { usePlan } from '@/composables/usePlan'
import { sortByPosition, generatePositionAfter } from '@/lib/utils/position'
import type { Section } from '@/types/section'
import type { Collection, CollectionItem } from '@/types/collection'

export function useCollectionActions() {
  const landStore = useLandStore()
  const editorStore = useEditorStore()
  const { addToast } = useToast()
  const { withinCollectionLimit, withinItemLimit, maxCollectionsPerSection, maxItemsPerCollection } = usePlan()

  const activeLand = computed(() => landStore.activeLand)

  function patchSection(sectionId: string, updater: (s: Section) => Section) {
    if (!activeLand.value) return
    const updatedSections = activeLand.value.sections.map((s) =>
      s.id === sectionId ? updater(s) : s
    )
    landStore.updateLand(activeLand.value.id, { sections: updatedSections })
    if (editorStore.activeSection?.id === sectionId) {
      editorStore.setActiveSection(updatedSections.find((s) => s.id === sectionId) ?? null)
    }
    editorStore.markDirty()
  }

  function updateSectionContent(sectionId: string, content: Record<string, unknown>) {
    // FIXME Phase 4: replace patchSection spreads with per-type useSectionForm mutations
    patchSection(sectionId, (s) => ({ ...s, content: { ...(s.content ?? {}), ...content } }) as unknown as Section)
  }

  function getCollections(sectionId: string): Collection[] {
    const section = activeLand.value?.sections.find((s) => s.id === sectionId)
    if (section?.type !== 'collection' && section?.type !== 'monetize') return []
    return section.content?.collections ?? []
  }

  function addCollection(sectionId: string) {
    const existing = getCollections(sectionId)
    if (!withinCollectionLimit(existing.length)) {
      addToast(`Free plan allows up to ${maxCollectionsPerSection.value} collections — upgrade to add more`, 'error')
      return
    }
    const sorted = sortByPosition(existing)
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      section_id: sectionId,
      title: 'New Collection',
      description: '',
      position: generatePositionAfter(sorted[sorted.length - 1]?.position ?? null),
      items: [],
    }
    updateSectionContent(sectionId, { collections: [...existing, newCollection] })
    addToast('Collection added')
  }

  function updateCollection(sectionId: string, collectionId: string, data: Partial<Collection>) {
    const cols = getCollections(sectionId)
    updateSectionContent(sectionId, { collections: cols.map((c) => (c.id === collectionId ? { ...c, ...data } : c)) })
  }

  function deleteCollection(sectionId: string, collectionId: string) {
    const cols = getCollections(sectionId)
    updateSectionContent(sectionId, { collections: cols.filter((c) => c.id !== collectionId) })
    addToast('Collection removed')
  }

  function reorderCollection(sectionId: string, collectionId: string, newPosition: string) {
    const cols = getCollections(sectionId)
    updateSectionContent(sectionId, { collections: cols.map((c) => (c.id === collectionId ? { ...c, position: newPosition } : c)) })
  }

  function addCollectionItem(
    sectionId: string,
    collectionId: string,
    data: Pick<CollectionItem, 'title' | 'subtitle' | 'description' | 'media_url' | 'content' | 'external_url'>,
  ): CollectionItem | undefined {
    const cols = getCollections(sectionId)
    const col = cols.find((c) => c.id === collectionId)
    if (col && !withinItemLimit(col.items.length)) {
      addToast(`Free plan allows up to ${maxItemsPerCollection.value} items per collection — upgrade to add more`, 'error')
      return undefined
    }
    let newItem: CollectionItem | undefined
    const updated = cols.map((c) => {
      if (c.id !== collectionId) return c
      const sorted = sortByPosition(c.items)
      newItem = {
        ...data,
        id: crypto.randomUUID(),
        collection_id: collectionId,
        position: generatePositionAfter(sorted[sorted.length - 1]?.position ?? null),
        created_at: new Date().toISOString(),
      }
      return { ...c, items: [...c.items, newItem] }
    })
    updateSectionContent(sectionId, { collections: updated })
    addToast('Item added')
    return newItem
  }

  function updateCollectionItem(sectionId: string, collectionId: string, itemId: string, data: Partial<CollectionItem>) {
    const cols = getCollections(sectionId)
    updateSectionContent(sectionId, {
      collections: cols.map((c) => {
        if (c.id !== collectionId) return c
        return { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)) }
      }),
    })
  }

  function deleteCollectionItem(sectionId: string, collectionId: string, itemId: string) {
    const cols = getCollections(sectionId)
    updateSectionContent(sectionId, {
      collections: cols.map((c) => {
        if (c.id !== collectionId) return c
        return { ...c, items: c.items.filter((i) => i.id !== itemId) }
      }),
    })
    addToast('Item removed')
  }

  function reorderCollectionItem(sectionId: string, collectionId: string, itemId: string, newPosition: string) {
    const cols = getCollections(sectionId)
    updateSectionContent(sectionId, {
      collections: cols.map((c) => {
        if (c.id !== collectionId) return c
        return { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, position: newPosition } : i)) }
      }),
    })
  }

  return {
    addCollection,
    updateCollection,
    deleteCollection,
    reorderCollection,
    addCollectionItem,
    updateCollectionItem,
    deleteCollectionItem,
    reorderCollectionItem,
  }
}
