import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { sortByPosition, generatePositionAfter } from '@/lib/utils/position'
import type { Section } from '@/types/section'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WithItems = { id: string; items: any[] }

export function useNestedItems() {
  const landStore = useLandStore()
  const editorStore = useEditorStore()
  const activeLand = computed(() => landStore.activeLand)

  function patchSection(sectionId: string, updater: (s: Section) => Section) {
    if (!activeLand.value) return
    const updated = activeLand.value.sections.map((s) => (s.id === sectionId ? updater(s) : s))
    landStore.updateLand(activeLand.value.id, { sections: updated })
    if (editorStore.activeSection?.id === sectionId) editorStore.setActiveSection(updated.find((s) => s.id === sectionId) ?? null)
    editorStore.markDirty()
  }

  function patchKey(sectionId: string, key: string, value: unknown) {
    patchSection(sectionId, (s) => ({ ...s, content: { ...(s.content ?? {}), [key]: value } }) as unknown as Section)
  }

  // ─── Flat array ops ───

  function addToArray<T extends { id: string; position: string }>(
    sectionId: string, key: string, existing: T[], data: Omit<T, 'id' | 'position'>,
  ): T {
    const sorted = sortByPosition(existing)
    const item = { ...data, id: crypto.randomUUID(), position: generatePositionAfter(sorted[sorted.length - 1]?.position ?? null) } as T
    patchKey(sectionId, key, [...existing, item])
    return item
  }

  function updateInArray<T extends { id: string }>(sectionId: string, key: string, items: T[], id: string, data: Partial<T>) {
    patchKey(sectionId, key, items.map((i) => (i.id === id ? { ...i, ...data } : i)))
  }

  function deleteFromArray<T extends { id: string }>(sectionId: string, key: string, items: T[], id: string) {
    patchKey(sectionId, key, items.filter((i) => i.id !== id))
  }

  function reorderInArray<T extends { id: string }>(sectionId: string, key: string, items: T[], id: string, newPosition: string) {
    patchKey(sectionId, key, items.map((i) => (i.id === id ? { ...i, position: newPosition } : i)))
  }

  // ─── Nested (parent.items) ops ───

  function addToNested<P extends WithItems, I extends { id: string; position: string }>(
    sectionId: string, parentKey: string, parents: P[], parentId: string, data: Omit<I, 'id' | 'position'>,
  ): I | undefined {
    let newItem: I | undefined
    patchKey(sectionId, parentKey, parents.map((p) => {
      if (p.id !== parentId) return p
      const sorted = sortByPosition(p.items as I[])
      newItem = { ...data, id: crypto.randomUUID(), position: generatePositionAfter(sorted[sorted.length - 1]?.position ?? null) } as I
      return { ...p, items: [...p.items, newItem] }
    }))
    return newItem
  }

  function updateInNested<P extends WithItems, I extends { id: string }>(
    sectionId: string, parentKey: string, parents: P[], parentId: string, itemId: string, data: Partial<I>,
  ) {
    patchKey(sectionId, parentKey, parents.map((p) =>
      p.id !== parentId ? p : { ...p, items: (p.items as I[]).map((i) => (i.id === itemId ? { ...i, ...data } : i)) }
    ))
  }

  function deleteFromNested<P extends WithItems>(
    sectionId: string, parentKey: string, parents: P[], parentId: string, itemId: string,
  ) {
    patchKey(sectionId, parentKey, parents.map((p) =>
      p.id !== parentId ? p : { ...p, items: p.items.filter((i: { id: string }) => i.id !== itemId) }
    ))
  }

  function reorderInNested<P extends WithItems>(
    sectionId: string, parentKey: string, parents: P[], parentId: string, itemId: string, newPosition: string,
  ) {
    patchKey(sectionId, parentKey, parents.map((p) =>
      p.id !== parentId ? p : { ...p, items: p.items.map((i: { id: string; position: string }) => (i.id === itemId ? { ...i, position: newPosition } : i)) }
    ))
  }

  return { addToArray, updateInArray, deleteFromArray, reorderInArray, addToNested, updateInNested, deleteFromNested, reorderInNested }
}
