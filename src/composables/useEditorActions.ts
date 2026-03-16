import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { useThemeStore } from '@/stores/theme'
import { useToast } from '@/composables/useToast'
import { usePlan } from '@/composables/usePlan'
import { sortByPosition, generatePositionAfter, generatePositionBetween } from '@/lib/utils/position'
import { SECTION_DEFAULTS } from '@/lib/primitives/sectionDefaults'
import { buildSectionContent } from '@/lib/primitives/purposeDefaults'
import { storageService, extractSectionUrls } from '@/services/storage.service'
import { landService } from '@/services/land.service'
import type { Section, SectionType, SectionSettings } from '@/types/section'
import type { ListItem } from '@/types/list'
import type { Collection, CollectionItem } from '@/types/collection'
import type { Store, StoreItem } from '@/types/store'
import type { LandTheme } from '@/types/theme'

export function useEditorActions() {
  const landStore = useLandStore()
  const editorStore = useEditorStore()
  const themeStore = useThemeStore()
  const { addToast } = useToast()
  const { withinSectionLimit, withinCollectionSectionLimit, canAddSectionType, withinCollectionLimit, withinItemLimit, maxSections, maxCollectionSections, maxCollectionsPerSection, maxItemsPerCollection } = usePlan()

  const activeLand = computed(() => landStore.activeLand)

  // ─── Internal helpers ───

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

  function getSection(sectionId: string): Section | undefined {
    return activeLand.value?.sections.find((s) => s.id === sectionId)
  }

  // ─── Section CRUD ───

  function addSection(type: SectionType, position: string) {
    if (!activeLand.value) return
    if (type === 'header' || type === 'footer') return

    // Plan gates
    if (!canAddSectionType(type)) {
      addToast('Campaign sections require a paid plan — upgrade to unlock', 'error')
      return
    }
    const contentSections = activeLand.value.sections.filter((s) => s.type !== 'header' && s.type !== 'footer')
    if (!withinSectionLimit(contentSections.length)) {
      addToast(`Free plan allows up to ${maxSections.value} sections — upgrade to add more`, 'error')
      return
    }

    // Collection-type section limit: max per type (collection / store / monetize each capped separately)
    const COLLECTION_TYPES: SectionType[] = ['collection', 'store', 'monetize']
    if (COLLECTION_TYPES.includes(type)) {
      const existing = activeLand.value.sections.filter((s) => s.type === type).length
      if (!withinCollectionSectionLimit(existing)) {
        addToast(`Free plan allows up to ${maxCollectionSections.value} ${type} sections — upgrade to add more`, 'error')
        return
      }
    }

    const defaults = SECTION_DEFAULTS[type]
    const purpose = activeLand.value.purpose

    // Count existing sections of this type to cycle through content variants
    const existingCount = activeLand.value.sections.filter((s) => s.type === type).length

    const seeded = buildSectionContent(purpose, type, existingCount)
    const content = (Object.keys(seeded).length > 0
      ? seeded
      : (defaults.content ? structuredClone(defaults.content) : {})) as unknown as Section['content']

    const newSection: Section = {
      id: crypto.randomUUID(),
      land_id: activeLand.value.id,
      type,
      position,
      style_variant: defaults.style_variant,
      settings_json: defaults.settings_json as unknown as SectionSettings,
      content,
      created_at: new Date().toISOString(),
    }

    // Patch section_id into seeded content
    if (type === 'collection' || type === 'monetize') {
      const col = (newSection.content as unknown as { collections: Collection[] }).collections?.[0]
      if (col) col.section_id = newSection.id
    }
    if (type === 'store') {
      const store = (newSection.content as unknown as { stores: Store[] }).stores?.[0]
      if (store) store.section_id = newSection.id
    }
    if (type === 'list') {
      const items = (newSection.content as unknown as { items: { section_id: string }[] }).items
      if (items) items.forEach((item) => { item.section_id = newSection.id })
    }

    landStore.updateLand(activeLand.value.id, {
      sections: [...activeLand.value.sections, newSection],
    })
    editorStore.setActiveSection(newSection)
    editorStore.markDirty()
    addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} section added`)
  }

  function deleteSection(sectionId: string) {
    if (!activeLand.value) return
    const section = activeLand.value.sections.find((s) => s.id === sectionId)
    if (section?.type === 'header' || section?.type === 'footer') return
    if (section) {
      const urls = extractSectionUrls(section)
      Promise.all(urls.map((url) => storageService.remove(url))).catch(() => {})
    }
    const updatedSections = activeLand.value.sections.filter((s) => s.id !== sectionId)
    landStore.updateLand(activeLand.value.id, { sections: updatedSections })
    if (editorStore.activeSection?.id === sectionId) editorStore.setActiveSection(null)
    editorStore.markDirty()
    addToast('Section deleted')
  }

  function updateSectionContent(sectionId: string, content: Record<string, unknown>) {
    patchSection(sectionId, (s) => ({
      ...s,
      content: { ...(s.content ?? {}), ...content } as Section['content'],
    }))
  }

  function updateSectionSettings(sectionId: string, settings: Record<string, unknown>) {
    patchSection(sectionId, (s) => ({
      ...s,
      settings_json: { ...s.settings_json, ...settings } as SectionSettings,
    }))
  }

  function updateSectionStyleVariant(sectionId: string, variant: string) {
    patchSection(sectionId, (s) => ({ ...s, style_variant: variant }))
  }

  // ─── Content accessors ───

  function getListItems(sectionId: string): ListItem[] {
    return (getSection(sectionId)?.content as { items?: ListItem[] } | null)?.items ?? []
  }

  // ─── List Items ───

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

  // ─── Collections ───

  function getCollections(sectionId: string): Collection[] {
    return (getSection(sectionId)?.content as { collections?: Collection[] } | null)?.collections ?? []
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

  // ─── Collection Items ───

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

  // ─── Store Items ───

  function getStores(sectionId: string): Store[] {
    return (getSection(sectionId)?.content as { stores?: Store[] } | null)?.stores ?? []
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

  // ─── Land Images ───

  function updateLandImages(data: { cover_image?: string; avatar_image?: string }) {
    if (!activeLand.value) return
    landStore.updateLand(activeLand.value.id, data)
    landService.updateLand(activeLand.value.id, data).catch(() => addToast('Failed to save image'))
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
    patchSection(sectionId, (s) => ({
      ...s,
      content: data.content as Section['content'],
      style_variant: data.style_variant,
      settings_json: data.settings_json as SectionSettings,
    }))
  }

  // ─── Section Reorder ───

  function duplicateSection(sectionId: string) {
    if (!activeLand.value) return
    const sorted = sortByPosition(activeLand.value.sections)
    const idx = sorted.findIndex((s) => s.id === sectionId)
    if (idx === -1) return
    const original = sorted[idx]!
    if (original.type === 'header' || original.type === 'footer') return
    const contentSections = activeLand.value.sections.filter((s) => s.type !== 'header' && s.type !== 'footer')
    if (!withinSectionLimit(contentSections.length)) {
      addToast(`Free plan allows up to ${maxSections.value} sections — upgrade to add more`, 'error')
      return
    }
    const next = sorted[idx + 1] ?? null
    let position = generatePositionBetween(original.position, next?.position ?? null)
    // Header always first, footer always last
    const copy: Section = {
      ...JSON.parse(JSON.stringify(original)),
      id: crypto.randomUUID(),
      position,
      created_at: new Date().toISOString(),
    }
    landStore.updateLand(activeLand.value.id, {
      sections: [...activeLand.value.sections, copy],
    })
    editorStore.markDirty()
  }

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
    landService.updateLand(activeLand.value.id, data)
      .then(() => addToast('Settings saved'))
      .catch(() => addToast('Failed to save settings', 'error'))
  }

  return {
    addSection,
    deleteSection,
    updateSectionContent,
    updateSectionSettings,
    updateSectionStyleVariant,
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
    updateStore,
    updateStoreItem,
    deleteStoreItem,
    reorderStoreItem,
    updateLandImages,
    updateTheme,
    restoreSectionSnapshot,
    duplicateSection,
    reorderSection,
    updateLandSettings,
  }
}
