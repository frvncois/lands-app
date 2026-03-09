import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { useThemeStore } from '@/stores/theme'
import { useToast } from '@/composables/useToast'
import { mockState } from '@/lib/mock/provider'
import { sortByPosition, generatePositionAfter } from '@/lib/utils/position'
import { SECTION_DEFAULTS } from '@/lib/primitives/sectionDefaults'
import type { Section, SectionType, MediaItem } from '@/types/section'
import type { ListItem } from '@/types/list'
import type { Collection, CollectionItem } from '@/types/collection'
import type { Store, StoreItem, StoreVariant } from '@/types/store'
import type { LandTheme } from '@/types/theme'

export function useEditorActions() {
  const landStore = useLandStore()
  const editorStore = useEditorStore()
  const themeStore = useThemeStore()
  const { addToast } = useToast()

  const activeLand = computed(() => landStore.activeLand)

  // ─── Internal helper ───

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

  // ─── Section CRUD ───

  function addSection(type: SectionType, position: string) {
    if (!activeLand.value) return
    const defaults = SECTION_DEFAULTS[type]
    const newSection: Section = {
      id: crypto.randomUUID(),
      land_id: activeLand.value.id,
      type,
      position,
      style_variant: defaults.style_variant,
      settings_json: { ...defaults.settings_json },
      content: defaults.content ? JSON.parse(JSON.stringify(defaults.content)) : null,
      created_at: new Date().toISOString(),
    }
    landStore.updateLand(activeLand.value.id, {
      sections: [...activeLand.value.sections, newSection],
    })
    if (type === 'list') mockState.listItems[newSection.id] = []
    if (type === 'collection') {
      const defaultCol: Collection = {
        id: crypto.randomUUID(),
        section_id: newSection.id,
        title: '',
        description: '',
        position: generatePositionAfter(null),
        items: [],
      }
      mockState.collections[newSection.id] = [defaultCol]
    }
    if (type === 'store') {
      const defaultStore: Store = {
        id: crypto.randomUUID(),
        section_id: newSection.id,
        title: '',
        position: generatePositionAfter(null),
        items: [],
      }
      mockState.stores[newSection.id] = [defaultStore]
    }
    editorStore.setActiveSection(newSection)
    editorStore.markDirty()
    addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} section added`)
  }

  function deleteSection(sectionId: string) {
    if (!activeLand.value) return
    const updatedSections = activeLand.value.sections.filter((s) => s.id !== sectionId)
    landStore.updateLand(activeLand.value.id, { sections: updatedSections })
    delete mockState.listItems[sectionId]
    delete mockState.collections[sectionId]
    delete mockState.stores[sectionId]
    if (editorStore.activeSection?.id === sectionId) editorStore.setActiveSection(null)
    editorStore.markDirty()
    addToast('Section deleted')
  }

  function updateSectionContent(sectionId: string, content: Record<string, unknown>) {
    patchSection(sectionId, (s) => ({
      ...s,
      content: { ...(s.content ?? {}), ...content } as any,
    }))
  }

  function updateSectionSettings(sectionId: string, settings: Record<string, unknown>) {
    patchSection(sectionId, (s) => ({
      ...s,
      settings_json: { ...s.settings_json, ...settings } as any,
    }))
  }

  function updateSectionStyleVariant(sectionId: string, variant: string) {
    patchSection(sectionId, (s) => ({
      ...s,
      style_variant: variant,
      settings_json: { ...s.settings_json, style: variant } as any,
    }))
  }

  // ─── Media Items ───

  function addMediaItem(sectionId: string, data: Pick<MediaItem, 'media_type' | 'url' | 'caption'>) {
    if (!activeLand.value) return
    const section = activeLand.value.sections.find((s) => s.id === sectionId)
    if (!section) return
    const existing: MediaItem[] = (section.content as any)?.items ?? []
    const sorted = sortByPosition(existing)
    const newItem: MediaItem = {
      ...data,
      id: crypto.randomUUID(),
      position: generatePositionAfter(sorted[sorted.length - 1]?.position ?? null),
    }
    updateSectionContent(sectionId, { items: [...existing, newItem] })
  }

  function updateMediaItem(sectionId: string, itemId: string, data: Partial<Pick<MediaItem, 'media_type' | 'url' | 'caption'>>) {
    if (!activeLand.value) return
    const section = activeLand.value.sections.find((s) => s.id === sectionId)
    if (!section) return
    const items: MediaItem[] = (section.content as any)?.items ?? []
    updateSectionContent(sectionId, { items: items.map((i) => (i.id === itemId ? { ...i, ...data } : i)) })
  }

  function deleteMediaItem(sectionId: string, itemId: string) {
    if (!activeLand.value) return
    const section = activeLand.value.sections.find((s) => s.id === sectionId)
    if (!section) return
    const items: MediaItem[] = (section.content as any)?.items ?? []
    updateSectionContent(sectionId, { items: items.filter((i) => i.id !== itemId) })
    addToast('Media removed')
  }

  // ─── List Items ───

  function addListItem(sectionId: string, data: Pick<ListItem, 'title' | 'url' | 'description' | 'icon'>): ListItem {
    const existing = mockState.listItems[sectionId] ?? []
    const sorted = sortByPosition(existing)
    const newItem: ListItem = {
      ...data,
      id: crypto.randomUUID(),
      section_id: sectionId,
      position: generatePositionAfter(sorted[sorted.length - 1]?.position ?? null),
    }
    mockState.listItems[sectionId] = [...existing, newItem]
    editorStore.markDirty()
    addToast('Link added')
    return newItem
  }

  function updateListItem(sectionId: string, itemId: string, data: Partial<ListItem>) {
    const items = mockState.listItems[sectionId]
    if (!items) return
    mockState.listItems[sectionId] = items.map((i) => (i.id === itemId ? { ...i, ...data } : i))
    editorStore.markDirty()
  }

  function deleteListItem(sectionId: string, itemId: string) {
    const items = mockState.listItems[sectionId]
    if (!items) return
    mockState.listItems[sectionId] = items.filter((i) => i.id !== itemId)
    editorStore.markDirty()
    addToast('Link removed')
  }

  function reorderListItem(sectionId: string, itemId: string, newPosition: string) {
    const items = mockState.listItems[sectionId]
    if (!items) return
    mockState.listItems[sectionId] = items.map((i) =>
      i.id === itemId ? { ...i, position: newPosition } : i
    )
    editorStore.markDirty()
  }

  // ─── Collections ───

  function addCollection(sectionId: string) {
    const existing = mockState.collections[sectionId] ?? []
    const sorted = sortByPosition(existing)
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      section_id: sectionId,
      title: 'New Collection',
      description: '',
      position: generatePositionAfter(sorted[sorted.length - 1]?.position ?? null),
      items: [],
    }
    mockState.collections[sectionId] = [...existing, newCollection]
    editorStore.markDirty()
    addToast('Collection added')
  }

  function updateCollection(sectionId: string, collectionId: string, data: Partial<Collection>) {
    const cols = mockState.collections[sectionId]
    if (!cols) return
    mockState.collections[sectionId] = cols.map((c) => (c.id === collectionId ? { ...c, ...data } : c))
    editorStore.markDirty()
  }

  function deleteCollection(sectionId: string, collectionId: string) {
    const cols = mockState.collections[sectionId]
    if (!cols) return
    mockState.collections[sectionId] = cols.filter((c) => c.id !== collectionId)
    editorStore.markDirty()
    addToast('Collection removed')
  }

  function reorderCollection(sectionId: string, collectionId: string, newPosition: string) {
    const cols = mockState.collections[sectionId]
    if (!cols) return
    mockState.collections[sectionId] = cols.map((c) =>
      c.id === collectionId ? { ...c, position: newPosition } : c
    )
    editorStore.markDirty()
  }

  // ─── Collection Items ───

  function addCollectionItem(
    sectionId: string,
    collectionId: string,
    data: Pick<CollectionItem, 'title' | 'description' | 'media_url' | 'content' | 'external_url'>,
  ): CollectionItem | undefined {
    const cols = mockState.collections[sectionId]
    if (!cols) return
    let newItem: CollectionItem | undefined
    mockState.collections[sectionId] = cols.map((c) => {
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
    editorStore.markDirty()
    addToast('Item added')
    return newItem
  }

  function updateCollectionItem(sectionId: string, collectionId: string, itemId: string, data: Partial<CollectionItem>) {
    const cols = mockState.collections[sectionId]
    if (!cols) return
    mockState.collections[sectionId] = cols.map((c) => {
      if (c.id !== collectionId) return c
      return { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)) }
    })
    editorStore.markDirty()
  }

  function deleteCollectionItem(sectionId: string, collectionId: string, itemId: string) {
    const cols = mockState.collections[sectionId]
    if (!cols) return
    mockState.collections[sectionId] = cols.map((c) => {
      if (c.id !== collectionId) return c
      return { ...c, items: c.items.filter((i) => i.id !== itemId) }
    })
    editorStore.markDirty()
    addToast('Item removed')
  }

  function reorderCollectionItem(sectionId: string, collectionId: string, itemId: string, newPosition: string) {
    const cols = mockState.collections[sectionId]
    if (!cols) return
    mockState.collections[sectionId] = cols.map((c) => {
      if (c.id !== collectionId) return c
      return { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, position: newPosition } : i)) }
    })
    editorStore.markDirty()
  }

  // ─── Store Items ───

  function addStoreItem(
    sectionId: string,
    storeId: string,
    data: Pick<StoreItem, 'title' | 'description' | 'image' | 'price' | 'variants' | 'inventory' | 'product_type' | 'file_url'>,
  ): StoreItem | undefined {
    const stores = mockState.stores[sectionId]
    if (!stores) return
    let newItem: StoreItem | undefined
    mockState.stores[sectionId] = stores.map((s) => {
      if (s.id !== storeId) return s
      const sorted = sortByPosition(s.items)
      newItem = {
        ...data,
        id: crypto.randomUUID(),
        store_id: storeId,
        position: generatePositionAfter(sorted[sorted.length - 1]?.position ?? null),
        created_at: new Date().toISOString(),
      }
      return { ...s, items: [...s.items, newItem] }
    })
    editorStore.markDirty()
    addToast('Item added')
    return newItem
  }

  function updateStoreItem(sectionId: string, storeId: string, itemId: string, data: Partial<StoreItem>) {
    const stores = mockState.stores[sectionId]
    if (!stores) return
    mockState.stores[sectionId] = stores.map((s) => {
      if (s.id !== storeId) return s
      return { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)) }
    })
    editorStore.markDirty()
  }

  function deleteStoreItem(sectionId: string, storeId: string, itemId: string) {
    const stores = mockState.stores[sectionId]
    if (!stores) return
    mockState.stores[sectionId] = stores.map((s) => {
      if (s.id !== storeId) return s
      return { ...s, items: s.items.filter((i) => i.id !== itemId) }
    })
    editorStore.markDirty()
    addToast('Item removed')
  }

  function reorderStoreItem(sectionId: string, storeId: string, itemId: string, newPosition: string) {
    const stores = mockState.stores[sectionId]
    if (!stores) return
    mockState.stores[sectionId] = stores.map((s) => {
      if (s.id !== storeId) return s
      return { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, position: newPosition } : i)) }
    })
    editorStore.markDirty()
  }

  // ─── Land Images ───

  function updateLandImages(data: { cover_image?: string; avatar_image?: string }) {
    if (!activeLand.value) return
    landStore.updateLand(activeLand.value.id, data)
    editorStore.markDirty()
  }

  // ─── Theme ───

  function updateTheme(data: Partial<LandTheme>) {
    if (!activeLand.value) return
    const updatedTheme = { ...activeLand.value.theme, ...data }
    themeStore.setTheme(updatedTheme)
    landStore.updateLand(activeLand.value.id, { theme: updatedTheme })
    editorStore.markDirty()
  }

  // ─── Section Snapshot Restore ───

  function restoreSectionSnapshot(sectionId: string, data: {
    content: unknown
    settings_json: unknown
    style_variant: string
  }) {
    patchSection(sectionId, (s) => {
      const restoredSettings = data.settings_json as any
      return {
        ...s,
        content: data.content as any,
        style_variant: data.style_variant,
        settings_json: { ...restoredSettings, style: data.style_variant },
      }
    })
  }

  // ─── Section Reorder ───

  function reorderSection(sectionId: string, newPosition: string) {
    if (!activeLand.value) return
    const updatedSections = activeLand.value.sections.map((s) =>
      s.id === sectionId ? { ...s, position: newPosition } : s
    )
    landStore.updateLand(activeLand.value.id, { sections: updatedSections })
    editorStore.markDirty()
  }

  // ─── Land Settings ───

  function updateLandSettings(data: { handle?: string; title?: string; description?: string }) {
    if (!activeLand.value) return
    landStore.updateLand(activeLand.value.id, data)
    editorStore.markDirty()
    addToast('Settings saved')
  }

  function deleteLand() {
    if (!activeLand.value) return
    activeLand.value.sections.forEach((s) => {
      delete mockState.listItems[s.id]
      delete mockState.collections[s.id]
      delete mockState.stores[s.id]
    })
    landStore.removeLand(activeLand.value.id)
    editorStore.exitEditMode()
    addToast('Land deleted')
  }

  return {
    addSection,
    deleteSection,
    updateSectionContent,
    updateSectionSettings,
    updateSectionStyleVariant,
    addMediaItem,
    updateMediaItem,
    deleteMediaItem,
    addListItem,
    updateListItem,
    deleteListItem,
    reorderListItem,
    addCollection,
    updateCollection,
    deleteCollection,
    reorderCollection,
    addCollectionItem,
    updateCollectionItem,
    deleteCollectionItem,
    reorderCollectionItem,
    addStoreItem,
    updateStoreItem,
    deleteStoreItem,
    reorderStoreItem,
    updateLandImages,
    updateTheme,
    restoreSectionSnapshot,
    reorderSection,
    updateLandSettings,
    deleteLand,
  }
}
