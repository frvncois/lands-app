import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { useToast } from '@/composables/useToast'
import { usePlan } from '@/composables/usePlan'
import { useNestedItems } from './useNestedItems'
import type { Store, StoreItem } from '@/types/store'

export function useStoreActions() {
  const landStore = useLandStore()
  const { addToast } = useToast()
  const { withinItemLimit, maxItemsPerCollection } = usePlan()
  const { updateInArray, addToNested, updateInNested, deleteFromNested, reorderInNested } = useNestedItems()
  const activeLand = computed(() => landStore.activeLand)

  function getStores(sectionId: string): Store[] {
    const s = activeLand.value?.sections.find((s) => s.id === sectionId)
    return s?.type === 'store' ? (s.content?.stores ?? []) : []
  }

  function addStoreItem(
    sectionId: string,
    storeId: string,
    data: Pick<StoreItem, 'title' | 'description' | 'image' | 'price' | 'variants' | 'inventory' | 'product_type' | 'file_url'>,
  ): StoreItem | undefined {
    const stores = getStores(sectionId)
    const store = stores.find((s) => s.id === storeId)
    if (store && !withinItemLimit(store.items.length)) { addToast(`Free plan allows up to ${maxItemsPerCollection.value} items — upgrade to add more`, 'error'); return undefined }
    const type = store?.mode === 'membership' ? 'membership' : 'product'
    const item = addToNested<Store, StoreItem>(sectionId, 'stores', stores, storeId, { ...data, type, store_id: storeId, content: '', created_at: new Date().toISOString() })
    if (item) addToast('Item added')
    return item
  }

  function updateStore(sectionId: string, storeId: string, data: Partial<Store>) {
    updateInArray(sectionId, 'stores', getStores(sectionId), storeId, data)
  }

  function updateStoreItem(sectionId: string, storeId: string, itemId: string, data: Partial<StoreItem>) {
    updateInNested(sectionId, 'stores', getStores(sectionId), storeId, itemId, data)
  }

  function deleteStoreItem(sectionId: string, storeId: string, itemId: string) {
    deleteFromNested(sectionId, 'stores', getStores(sectionId), storeId, itemId)
    addToast('Item removed')
  }

  function reorderStoreItem(sectionId: string, storeId: string, itemId: string, newPosition: string) {
    reorderInNested(sectionId, 'stores', getStores(sectionId), storeId, itemId, newPosition)
  }

  return { addStoreItem, updateStore, updateStoreItem, deleteStoreItem, reorderStoreItem }
}
