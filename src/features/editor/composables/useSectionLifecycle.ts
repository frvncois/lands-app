import { computed } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import { useEditorStore } from '@/features/editor/stores/editor'
import { addToast } from '@/shared/composables/useToast'
import { usePlan } from '@/features/plan/composables/usePlan'
import { sortByPosition, generatePositionBetween } from '@/shared/lib/position'
import { SECTION_DEFAULTS } from '@/features/sections/defaults'
import { buildSectionContent } from '@/features/sections/purpose-defaults'
import { storageService, extractSectionUrls } from '@/features/integrations/services/storage.service'
import type { Section, SectionType } from '@/features/sections/types'

export function useSectionLifecycle() {
  const landStore = useLandStore()
  const editorStore = useEditorStore()
  const { withinSectionLimit, withinCollectionSectionLimit, canAddSectionType, maxSections, maxCollectionSections } = usePlan()

  const activeLand = computed(() => landStore.activeLand)

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

    // Collection-type section limit: max per type (collection / store each capped separately)
    const COLLECTION_TYPES: SectionType[] = ['post', 'releases', 'concert', 'store']
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

    // Building a section from a runtime SectionType string — TypeScript can't narrow the
    // discriminant at compile time here, so we cast via unknown. Safe: all fields match the
    // discriminated union shape for every SectionType value.
    const newSection = {
      id: crypto.randomUUID(),
      land_id: activeLand.value.id,
      type,
      position,
      style_variant: defaults.style_variant,
      settings_json: defaults.settings_json,
      content,
      created_at: new Date().toISOString(),
      visible: true,
    } as unknown as Section

    // Patch section_id into seeded content — use discriminant narrowing for clean access
    if (newSection.type === 'post' || newSection.type === 'releases' || newSection.type === 'concert') {
      const col = newSection.content?.collections?.[0]
      if (col) col.section_id = newSection.id
    }
    if (newSection.type === 'store') {
      const store = newSection.content?.stores?.[0]
      if (store) store.section_id = newSection.id
    }
    if (newSection.type === 'links') {
      newSection.content?.items?.forEach((item) => { item.section_id = newSection.id })
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
      Promise.all(urls.map((url) => storageService.remove(url))).catch((e) => {
        console.error('[storage] Failed to clean up section assets:', e)
      })
    }
    const updatedSections = activeLand.value.sections.filter((s) => s.id !== sectionId)
    landStore.updateLand(activeLand.value.id, { sections: updatedSections })
    if (editorStore.activeSection?.id === sectionId) editorStore.setActiveSection(null)
    editorStore.markDirty()
    addToast('Section deleted')
  }

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
    const position = generatePositionBetween(original.position, next?.position ?? null)
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

  return {
    addSection,
    deleteSection,
    duplicateSection,
    reorderSection,
  }
}
