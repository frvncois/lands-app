import { computed } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import { addToast } from '@/shared/composables/useToast'
import { useNestedItems } from './useNestedItems'
import type { ListItem } from '@/features/sections/types/list'

export function useListActions() {
  const landStore = useLandStore()
  const { addToArray, updateInArray, deleteFromArray, reorderInArray } = useNestedItems()
  const activeLand = computed(() => landStore.activeLand)

  function getItems(sectionId: string): ListItem[] {
    const s = activeLand.value?.sections.find((s) => s.id === sectionId)
    return s?.type === 'list' ? (s.content?.items ?? []) : []
  }

  function addListItem(sectionId: string, data: Pick<ListItem, 'title' | 'subtitle' | 'url' | 'description' | 'icon'>): ListItem {
    const item = addToArray<ListItem>(sectionId, 'items', getItems(sectionId), { ...data, section_id: sectionId })
    addToast('Link added')
    return item
  }

  function updateListItem(sectionId: string, itemId: string, data: Partial<ListItem>) {
    updateInArray(sectionId, 'items', getItems(sectionId), itemId, data)
  }

  function deleteListItem(sectionId: string, itemId: string) {
    deleteFromArray(sectionId, 'items', getItems(sectionId), itemId)
    addToast('Link removed')
  }

  function reorderListItem(sectionId: string, itemId: string, newPosition: string) {
    reorderInArray(sectionId, 'items', getItems(sectionId), itemId, newPosition)
  }

  return { addListItem, updateListItem, deleteListItem, reorderListItem }
}
