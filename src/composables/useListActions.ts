import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { useToast } from '@/composables/useToast'
import { sortByPosition, generatePositionAfter } from '@/lib/utils/position'
import type { Section } from '@/types/section'
import type { ListItem } from '@/types/list'

export function useListActions() {
  const landStore = useLandStore()
  const editorStore = useEditorStore()
  const { addToast } = useToast()

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
    patchSection(sectionId, (s) => ({
      ...s,
      content: { ...(s.content ?? {}), ...content } as Section['content'],
    }))
  }

  function getListItems(sectionId: string): ListItem[] {
    const section = activeLand.value?.sections.find((s) => s.id === sectionId)
    return (section?.content as { items?: ListItem[] } | null)?.items ?? []
  }

  function addListItem(sectionId: string, data: Pick<ListItem, 'title' | 'subtitle' | 'url' | 'description' | 'icon'>): ListItem {
    const existing = getListItems(sectionId)
    const sorted = sortByPosition(existing)
    const newItem: ListItem = {
      ...data,
      id: crypto.randomUUID(),
      section_id: sectionId,
      position: generatePositionAfter(sorted[sorted.length - 1]?.position ?? null),
    }
    updateSectionContent(sectionId, { items: [...existing, newItem] })
    addToast('Link added')
    return newItem
  }

  function updateListItem(sectionId: string, itemId: string, data: Partial<ListItem>) {
    const items = getListItems(sectionId)
    updateSectionContent(sectionId, { items: items.map((i) => (i.id === itemId ? { ...i, ...data } : i)) })
  }

  function deleteListItem(sectionId: string, itemId: string) {
    const items = getListItems(sectionId)
    updateSectionContent(sectionId, { items: items.filter((i) => i.id !== itemId) })
    addToast('Link removed')
  }

  function reorderListItem(sectionId: string, itemId: string, newPosition: string) {
    const items = getListItems(sectionId)
    updateSectionContent(sectionId, { items: items.map((i) => (i.id === itemId ? { ...i, position: newPosition } : i)) })
  }

  return {
    addListItem,
    updateListItem,
    deleteListItem,
    reorderListItem,
  }
}
