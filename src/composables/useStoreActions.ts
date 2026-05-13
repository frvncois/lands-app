import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { useToast } from '@/composables/useToast'
import { usePlan } from '@/composables/usePlan'
import { sortByPosition, generatePositionAfter } from '@/lib/utils/position'
import type { Section } from '@/types/section'
import type { Store, StoreItem } from '@/types/store'

export function useStoreActions() {
  const landStore = useLandStore()
  const editorStore = useEditorStore()
  const { addToast } = useToast()
  const { withinItemLimit, maxItemsPerCollection } = usePlan()

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

  function getStores(sectionId: string): Store[] {
    const section = activeLand.value?.sections.find((s) => s.id === sectionId)
    if (section?.type !== 'store') return []
    return section.content?.stores ?? []
  }

  function addStoreItem(
    sectionId: string,
    storeId: string,
    data: Pick<StoreItem, 'title' | 'description' | 'image' | 'price' | 'variants' | 'inventory' | 'product_type' | 'file_url'>,
  ): StoreItem | undefined {
    const stores = getStores(sectionId)
    const store = stores.find((s) => s.id === storeId)
    if (store && !withinItemLimit(store.items.length)) {
      addToast(`Free plan allows up to ${maxItemsPerCollection.value} items — upgrade to add more`, 'error')
      return undefined
    }
    let newItem: StoreItem | undefined
    const updated = stores.map((s) => {
      if (s.id !== storeId) return s
      const sorted = sortByPosition(s.items)
      newItem = {
        ...data,
        type: s.mode === 'membership' ? 'membership' : 'product',
        id: crypto.randomUUID(),
        store_id: storeId,
        content: '',
        position: generatePositionAfter(sorted[sorted.length - 1]?.position ?? null),
        created_at: new Date().toISOString(),
      }
      return { ...s, items: [...s.items, newItem] }
    })
    updateSectionContent(sectionId, { stores: updated })
    addToast('Item added')
    return newItem
  }

  function updateStoreItem(sectionId: string, storeId: string, itemId: string, data: Partial<StoreItem>) {
    const stores = getStores(sectionId)
    updateSectionContent(sectionId, {
      stores: stores.map((s) => {
        if (s.id !== storeId) return s
        return { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)) }
      }),
    })
  }

  function deleteStoreItem(sectionId: string, storeId: string, itemId: string) {
    const stores = getStores(sectionId)
    updateSectionContent(sectionId, {
      stores: stores.map((s) => {
        if (s.id !== storeId) return s
        return { ...s, items: s.items.filter((i) => i.id !== itemId) }
      }),
    })
    addToast('Item removed')
  }

  function updateStore(sectionId: string, storeId: string, data: Partial<Store>) {
    const stores = getStores(sectionId)
    updateSectionContent(sectionId, { stores: stores.map((s) => (s.id === storeId ? { ...s, ...data } : s)) })
  }

  function reorderStoreItem(sectionId: string, storeId: string, itemId: string, newPosition: string) {
    const stores = getStores(sectionId)
    updateSectionContent(sectionId, {
      stores: stores.map((s) => {
        if (s.id !== storeId) return s
        return { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, position: newPosition } : i)) }
      }),
    })
  }

  return {
    addStoreItem,
    updateStore,
    updateStoreItem,
    deleteStoreItem,
    reorderStoreItem,
  }
}
