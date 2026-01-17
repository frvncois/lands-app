/**
 * EDITOR STORE
 *
 * Clean-slate editor state management.
 * Handles sections, not blocks.
 * Generates UI from registry, not hardcoded.
 */

import { defineStore } from 'pinia'
import { ref, computed, shallowRef, watch, nextTick } from 'vue'
import type {
  SectionInstance,
  Theme,
  ColorTokens,
  FontTokens,
  ActiveNode,
  FieldSchema,
  RepeaterField,
} from '@/types/sections'
import type { PageContent, PageMeta, TranslationSettings, TranslationsMap } from '@/types/project'
import {
  getSectionDefinition,
  createSectionInstance,
} from '@/lib/section-registry'
import {
  getTheme,
  getDefaultTheme,
  applyTheme,
  getSectionPreset,
} from '@/lib/themes'

// ============================================
// TYPES
// ============================================

export type EditorMode = 'edit' | 'style'
export type PreviewMode = 'desktop' | 'mobile'

/** Custom theme overrides */
export interface ThemeOverrides {
  colors?: Partial<ColorTokens>
  fonts?: Partial<FontTokens>
}

// ============================================
// STORE
// ============================================

export const useEditorStore = defineStore('editor', () => {
  const REMOVED_SECTION_TYPES = new Set(['contact', ['sub', 'scribe'].join('')])

  // ============================================
  // STATE
  // ============================================

  /** Current editor mode */
  const mode = ref<EditorMode>('edit')

  /** Current preview mode (desktop/mobile) */
  const previewMode = ref<PreviewMode>('desktop')

  /** Current project ID */
  const projectId = ref<string | null>(null)

  /** Current base theme */
  const baseTheme = shallowRef<Theme>(getDefaultTheme())

  /** Custom theme overrides */
  const themeOverrides = ref<ThemeOverrides>({})

  /** Computed theme with overrides applied */
  const theme = computed<Theme>(() => {
    const base = baseTheme.value
    const overrides = themeOverrides.value

    return {
      ...base,
      tokens: {
        ...base.tokens,
        colors: {
          ...base.tokens.colors,
          ...overrides.colors,
        },
        fonts: {
          ...base.tokens.fonts,
          ...overrides.fonts,
        },
      },
    }
  })

  /** Page sections */
  const sections = ref<SectionInstance[]>([])

  /** Page metadata */
  const meta = ref<PageMeta>({
    title: '',
    description: '',
  })

  /** Canonical selection node */
  const activeNode = ref<ActiveNode | null>(null)

  /** Hidden fields per section (sectionId -> Set of fieldKeys) */
  const hiddenFields = ref<Record<string, Set<string>>>({})

  /** Undo/redo history */
  const history = ref<SectionInstance[][]>([])
  const historyIndex = ref(-1)
  const maxHistorySize = 50

  /** Dirty state */
  const isDirty = ref(false)

  /** Loading state */
  const isLoading = ref(false)

  /** Translation settings */
  const translationSettings = ref<TranslationSettings | null>(null)

  /** Translations map */
  const translations = ref<TranslationsMap>({})

  /** Current editing language (null = default language) */
  const currentLanguage = ref<string | null>(null)

  // ============================================
  // SELECTION DERIVATIONS
  // ============================================

  const selectedSectionId = computed(() => activeNode.value?.sectionId ?? null)

  const activeFieldKey = computed(() => {
    const node = activeNode.value
    if (!node) return null
    if (node.type === 'field' || node.type === 'item') {
      return node.fieldKey ?? null
    }
    return null
  })

  const activeItemId = computed(() => {
    const node = activeNode.value
    if (!node) return null
    if (node.type === 'item') {
      return node.itemId ?? null
    }
    return null
  })

  const activeFieldPath = computed(() => {
    const node = activeNode.value
    if (!node || !node.fieldKey) return null
    if (node.type === 'field') return node.fieldKey
    const section = sections.value.find(s => s.id === node.sectionId)
    if (!section) return null

    if (node.type === 'item' && node.itemId) {
      const index = findItemIndex(section, node.fieldKey, node.itemId)
      return index === -1 ? node.fieldKey : `${node.fieldKey}.${index}`
    }

    return null
  })

  const activeItemIndex = computed(() => {
    const node = activeNode.value
    if (!node) return null
    const section = node.sectionId ? sections.value.find(s => s.id === node.sectionId) : null
    if (!section) return null

    if (node.type === 'item' && node.itemId && node.fieldKey) {
      const index = findItemIndex(section, node.fieldKey, node.itemId)
      return index === -1 ? null : index
    }

    return null
  })

  // ============================================
  // GETTERS
  // ============================================

  /** Get selected section */
  const selectedSection = computed(() => {
    if (!selectedSectionId.value) return null
    return sections.value.find(s => s.id === selectedSectionId.value) || null
  })

  /** Get section definition for selected section */
  const selectedSectionDefinition = computed(() => {
    if (!selectedSection.value) return null
    return getSectionDefinition(selectedSection.value.type)
  })

  /** Get available variants for selected section */
  const selectedSectionVariants = computed(() => {
    const def = selectedSectionDefinition.value
    if (!def) return []

    // Check for theme preset restrictions
    const preset = getSectionPreset(theme.value, selectedSection.value!.type)
    if (preset?.allowedVariants) {
      return def.variants.filter(v => preset.allowedVariants!.includes(v.id))
    }

    return def.variants
  })

  /** Can undo */
  const canUndo = computed(() => historyIndex.value > 0)

  /** Can redo */
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  /** Has translations enabled */
  const hasTranslations = computed(() => !!translationSettings.value && translationSettings.value.languages.length > 0)

  /** Available languages (default + added translations) */
  const availableLanguages = computed(() => {
    if (!translationSettings.value) return []
    return [translationSettings.value.defaultLanguage, ...translationSettings.value.languages]
  })

  /** Default language code */
  const defaultLanguage = computed(() => translationSettings.value?.defaultLanguage || 'en')

  // ============================================
  // HISTORY
  // ============================================

  function pushHistory() {
    // Remove any redo states
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    // Add current state - use JSON serialization to strip all reactivity
    history.value.push(JSON.parse(JSON.stringify(sections.value)))
    historyIndex.value = history.value.length - 1

    // Limit history size
    if (history.value.length > maxHistorySize) {
      history.value.shift()
      historyIndex.value--
    }

    isDirty.value = true
  }

  function undo() {
    if (!canUndo.value) return
    historyIndex.value--
    const historyState = history.value[historyIndex.value]
    if (historyState) {
      sections.value = JSON.parse(JSON.stringify(historyState))
      isDirty.value = true
    }
  }

  function redo() {
    if (!canRedo.value) return
    historyIndex.value++
    const historyState = history.value[historyIndex.value]
    if (historyState) {
      sections.value = JSON.parse(JSON.stringify(historyState))
      isDirty.value = true
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function initializeEditor(content: PageContent, id: string) {
    projectId.value = id
    sections.value = content.sections.filter(section => !REMOVED_SECTION_TYPES.has(section.type))
    sections.value.forEach(section => ensureSectionItemIds(section))
    meta.value = content.meta

    // Load theme (watcher will apply CSS variables)
    const loadedTheme = getTheme(content.themeId)
    if (loadedTheme) {
      baseTheme.value = loadedTheme
    }
    // Load theme overrides
    themeOverrides.value = content.themeOverrides || {}

    // Load translations
    translationSettings.value = content.translation || null
    translations.value = content.translations || {}
    currentLanguage.value = null

    // Initialize history - use JSON serialization to strip all reactivity
    history.value = [JSON.parse(JSON.stringify(sections.value))]
    historyIndex.value = 0
    isDirty.value = false
    activeNode.value = null
  }

  function resetEditor() {
    mode.value = 'edit'
    projectId.value = null
    sections.value = []
    meta.value = { title: '', description: '' }
    baseTheme.value = getDefaultTheme()
    themeOverrides.value = {}
    activeNode.value = null
    history.value = []
    historyIndex.value = -1
    isDirty.value = false
    translationSettings.value = null
    translations.value = {}
    currentLanguage.value = null
  }

  // ============================================
  // MODE
  // ============================================

  function setMode(newMode: EditorMode) {
    mode.value = newMode
  }

  function setPreviewMode(newMode: PreviewMode) {
    previewMode.value = newMode
  }

  // ============================================
  // THEME
  // ============================================

  // Watch theme changes and apply CSS variables
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true, deep: true })

  function setTheme(themeId: string) {
    const newTheme = getTheme(themeId)
    if (!newTheme) return false

    baseTheme.value = newTheme
    // Clear overrides when switching themes
    themeOverrides.value = {}
    isDirty.value = true
    return true
  }

  function setColorOverride(key: keyof ColorTokens, value: string) {
    themeOverrides.value = {
      ...themeOverrides.value,
      colors: {
        ...themeOverrides.value.colors,
        [key]: value,
      },
    }
    isDirty.value = true
    // Force re-apply theme on next tick to ensure computed is updated
    nextTick(() => applyTheme(theme.value))
  }

  function setFontOverride(key: keyof FontTokens, value: string) {
    themeOverrides.value = {
      ...themeOverrides.value,
      fonts: {
        ...themeOverrides.value.fonts,
        [key]: value,
      },
    }
    isDirty.value = true
    // Force re-apply theme on next tick to ensure computed is updated
    nextTick(() => applyTheme(theme.value))
  }

  function clearOverrides() {
    themeOverrides.value = {}
    isDirty.value = true
  }

  // ============================================
  // SECTION OPERATIONS
  // ============================================

  function generateId(): string {
    return crypto.randomUUID()
  }

  function addSection(type: string, index?: number) {
    const instance = createSectionInstance(type, generateId())
    if (!instance) return null

    // Check for theme preset default variant
    const preset = getSectionPreset(theme.value, type)
    if (preset?.defaultVariant) {
      instance.variant = preset.defaultVariant
    }

    pushHistory()

    // Determine insertion index based on section type and existing sections
    let insertIndex: number

    if (type === 'header') {
      // Header always goes at index 0
      insertIndex = 0
    } else if (type === 'footer') {
      // Footer always goes at the end
      insertIndex = sections.value.length
    } else if (index !== undefined && index >= 0 && index <= sections.value.length) {
      // Use provided index, but respect header/footer positions
      const hasHeader = sections.value[0]?.type === 'header'
      const hasFooter = sections.value[sections.value.length - 1]?.type === 'footer'

      // Clamp index: after header (if exists), before footer (if exists)
      const minIndex = hasHeader ? 1 : 0
      const maxIndex = hasFooter ? sections.value.length - 1 : sections.value.length
      insertIndex = Math.max(minIndex, Math.min(index, maxIndex))
    } else {
      // No index provided - insert before footer if it exists, otherwise at end
      const hasFooter = sections.value[sections.value.length - 1]?.type === 'footer'
      insertIndex = hasFooter ? sections.value.length - 1 : sections.value.length
    }

    ensureSectionItemIds(instance)
    sections.value.splice(insertIndex, 0, instance)

    selectSection(instance.id)
    return instance
  }

  function removeSection(id: string) {
    const index = sections.value.findIndex(s => s.id === id)
    if (index === -1) return false

    pushHistory()
    const prevSection = sections.value[index - 1]
    const nextSection = sections.value[index + 1]
    sections.value.splice(index, 1)

    if (activeNode.value?.sectionId === id) {
      if (sections.value.length === 0) {
        activeNode.value = null
      } else if (prevSection) {
        selectSection(prevSection.id)
      } else if (nextSection) {
        selectSection(nextSection.id)
      } else if (sections.value[0]) {
        selectSection(sections.value[0].id)
      } else {
        activeNode.value = null
      }
    }

    return true
  }

  function duplicateSection(id: string) {
    const index = sections.value.findIndex(s => s.id === id)
    if (index === -1) return null

    const original = sections.value[index]
    if (!original) return null

    pushHistory()

    const duplicate: SectionInstance = {
      ...JSON.parse(JSON.stringify(original)),
      id: generateId(),
    }
    ensureSectionItemIds(duplicate)

    sections.value.splice(index + 1, 0, duplicate)
    selectSection(duplicate.id)
    return duplicate
  }

  function moveSection(id: string, direction: 'up' | 'down') {
    const index = sections.value.findIndex(s => s.id === id)
    if (index === -1) return false

    const section = sections.value[index]

    // Prevent moving header or footer
    if (section?.type === 'header' || section?.type === 'footer') return false

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.value.length) return false

    // Prevent moving into header position (index 0) if header exists
    if (newIndex === 0 && sections.value[0]?.type === 'header') return false

    // Prevent moving into footer position (last) if footer exists
    const lastIndex = sections.value.length - 1
    if (newIndex === lastIndex && sections.value[lastIndex]?.type === 'footer') return false

    pushHistory()

    const [movedSection] = sections.value.splice(index, 1)
    if (movedSection) {
      sections.value.splice(newIndex, 0, movedSection)
    }
    return true
  }

  function reorderSections(fromIndex: number, toIndex: number) {
    if (
      fromIndex < 0 ||
      fromIndex >= sections.value.length ||
      toIndex < 0 ||
      toIndex >= sections.value.length
    ) {
      return false
    }

    // Prevent moving header (must stay at index 0)
    const movingSection = sections.value[fromIndex]
    if (movingSection?.type === 'header') return false
    if (toIndex === 0 && sections.value[0]?.type === 'header') return false

    // Prevent moving footer (must stay last)
    const lastIndex = sections.value.length - 1
    if (movingSection?.type === 'footer') return false
    if (toIndex === lastIndex && sections.value[lastIndex]?.type === 'footer') return false

    pushHistory()

    const [section] = sections.value.splice(fromIndex, 1)
    if (section) {
      sections.value.splice(toIndex, 0, section)
    }
    return true
  }

  // ============================================
  // SECTION DATA EDITING
  // ============================================

  /**
   * Set a nested value in an object using dot notation path
   * e.g., setNestedValue(obj, 'logo.src', 'value') sets obj.logo.src = 'value'
   * Clones intermediate objects to ensure reactivity
   */
  function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.')
    if (parts.length === 0) return

    let current: Record<string, unknown> = obj

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i] as string
      if (current[part] === undefined || current[part] === null) {
        current[part] = {}
      } else {
        // Clone intermediate objects for reactivity
        current[part] = { ...(current[part] as Record<string, unknown>) }
      }
      current = current[part] as Record<string, unknown>
    }

    const lastPart = parts[parts.length - 1] as string
    current[lastPart] = value
  }

  function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.')
    let current: unknown = obj
    for (const part of parts) {
      if (!current || typeof current !== 'object') return undefined
      current = (current as Record<string, unknown>)[part]
    }
    return current
  }

  function getNestedArray(obj: Record<string, unknown>, path: string): Record<string, unknown>[] | null {
    const value = getNestedValue(obj, path)
    if (!Array.isArray(value)) return null
    return value as Record<string, unknown>[]
  }

  function findItemIndex(section: SectionInstance, fieldKey: string, itemId: string): number {
    const items = getNestedArray(section.data, fieldKey)
    if (!items) return -1
    return items.findIndex(item => item && typeof item === 'object' && (item as Record<string, unknown>).id === itemId)
  }

  function ensureSectionItemIds(section: SectionInstance) {
    const def = getSectionDefinition(section.type)
    if (!def) return

    for (const schemaField of def.schema) {
      if (schemaField.type === 'repeater') {
        ensureIdsForRepeaterField(section.data, schemaField as RepeaterField)
      }
    }
  }

  function ensureIdsForRepeaterField(data: Record<string, unknown>, field: RepeaterField) {
    const items = getNestedArray(data, field.key)
    if (!items) return

    for (const item of items) {
      if (!item || typeof item !== 'object') continue
      const record = item as Record<string, unknown>
      if (typeof record.id !== 'string') {
        record.id = generateId()
      }
      ensureNestedRepeaterIds(record, field.itemSchema)
    }
  }

  function ensureNestedRepeaterIds(target: Record<string, unknown>, schema: FieldSchema[]) {
    for (const schemaField of schema) {
      if (schemaField.type !== 'repeater') continue
      const nestedItems = getNestedArray(target, schemaField.key)
      if (!nestedItems) continue

      for (const nestedItem of nestedItems) {
        if (!nestedItem || typeof nestedItem !== 'object') continue
        const record = nestedItem as Record<string, unknown>
        if (typeof record.id !== 'string') {
          record.id = generateId()
        }
        ensureNestedRepeaterIds(record, (schemaField as RepeaterField).itemSchema)
      }
    }
  }

  function updateSectionData(id: string, data: Record<string, unknown>) {
    const section = sections.value.find(s => s.id === id)
    if (!section) return false

    pushHistory()

    // Handle nested paths (e.g., 'logo.src' -> data.logo.src)
    const newData = { ...section.data }
    for (const [key, value] of Object.entries(data)) {
      if (key.includes('.')) {
        setNestedValue(newData, key, value)
      } else {
        ;(newData as Record<string, unknown>)[key] = value
      }
    }
    section.data = newData
    ensureSectionItemIds(section)
    return true
  }

  function updateSectionVariant(id: string, variant: string) {
    const section = sections.value.find(s => s.id === id)
    if (!section) return false

    // Validate variant exists
    const def = getSectionDefinition(section.type)
    if (!def || !def.variants.some(v => v.id === variant)) return false

    // Check theme restrictions
    const preset = getSectionPreset(theme.value, section.type)
    if (preset?.allowedVariants && !preset.allowedVariants.includes(variant)) {
      return false
    }

    pushHistory()
    section.variant = variant
    return true
  }

  function updateFieldStyle(id: string, fieldKey: string, styleKey: string, value: unknown) {
    const section = sections.value.find(s => s.id === id)
    if (!section) return false

    pushHistory()

    // Initialize fieldStyles if it doesn't exist
    if (!section.fieldStyles) {
      section.fieldStyles = {}
    }

    // Initialize field entry if it doesn't exist
    if (!section.fieldStyles[fieldKey]) {
      section.fieldStyles[fieldKey] = {}
    }

    // Update the specific style property
    ;(section.fieldStyles[fieldKey] as Record<string, unknown>)[styleKey] = value

    return true
  }

  function updateSectionStyle(id: string, styleKey: string, value: unknown) {
    const section = sections.value.find(s => s.id === id)
    if (!section) {
      return false
    }

    pushHistory()

    // Initialize styles if it doesn't exist
    if (!section.styles) {
      section.styles = {}
    }

    // Update the specific style property
    ;(section.styles as Record<string, unknown>)[styleKey] = value

    return true
  }

  // ============================================
  // REPEATER ITEM OPERATIONS
  // ============================================

  function addRepeaterItem(sectionId: string, fieldKey: string) {
    const section = sections.value.find(s => s.id === sectionId)
    if (!section) return false

    const def = getSectionDefinition(section.type)
    if (!def) return false

    // Find the repeater field schema
    const repeaterField = def.schema.find(f => f.key === fieldKey && f.type === 'repeater')
    if (!repeaterField || repeaterField.type !== 'repeater') return false

    // Get current items array
    const items = section.data[fieldKey] as unknown[]
    if (!Array.isArray(items)) return false

    // Check max items limit
    if (repeaterField.maxItems && items.length >= repeaterField.maxItems) return false

    pushHistory()

    // Create new item: use itemDefault if available, otherwise generate from schema
    let newItem: Record<string, unknown>
    if (repeaterField.itemDefault) {
      newItem = { ...repeaterField.itemDefault }
    } else {
      newItem = {}
      for (const field of repeaterField.itemSchema) {
        if (field.type === 'boolean') {
          newItem[field.key] = field.defaultValue ?? false
        } else {
          newItem[field.key] = ''
        }
      }
    }

    newItem.id = generateId()
    ensureNestedRepeaterIds(newItem, repeaterField.itemSchema)
    items.push(newItem)
    return true
  }

  function removeRepeaterItem(sectionId: string, fieldKey: string, itemId: string) {
    const section = sections.value.find(s => s.id === sectionId)
    if (!section) return false

    const def = getSectionDefinition(section.type)
    if (!def) return false

    // Find the repeater field schema
    const repeaterField = def.schema.find(f => f.key === fieldKey && f.type === 'repeater')
    if (!repeaterField || repeaterField.type !== 'repeater') return false

    // Get current items array
    const items = getNestedArray(section.data, fieldKey)
    if (!items) return false

    // Check min items limit
    if (repeaterField.minItems && items.length <= repeaterField.minItems) return false

    // Check valid index
    const index = items.findIndex(item => item && typeof item === 'object' && (item as Record<string, unknown>).id === itemId)
    if (index === -1) return false

    pushHistory()
    items.splice(index, 1)

    if (
      activeNode.value?.type === 'item' &&
      activeNode.value.sectionId === sectionId &&
      activeNode.value.fieldKey === fieldKey &&
      activeNode.value.itemId === itemId
    ) {
      selectFieldNode(sectionId, fieldKey)
    }

    return true
  }

  function duplicateRepeaterItem(sectionId: string, fieldKey: string, itemId: string) {
    const section = sections.value.find(s => s.id === sectionId)
    if (!section) return false

    const def = getSectionDefinition(section.type)
    if (!def) return false

    // Find the repeater field schema
    const repeaterField = def.schema.find(f => f.key === fieldKey && f.type === 'repeater')
    if (!repeaterField || repeaterField.type !== 'repeater') return false

    // Get current items array
    const items = getNestedArray(section.data, fieldKey)
    if (!items) return false

    // Check max items limit
    if (repeaterField.maxItems && items.length >= repeaterField.maxItems) return false

    // Check valid index
    const index = items.findIndex(item => item && typeof item === 'object' && (item as Record<string, unknown>).id === itemId)
    if (index === -1) return false

    pushHistory()

    // Deep clone the item
    const duplicate = JSON.parse(JSON.stringify(items[index])) as Record<string, unknown>
    duplicate.id = generateId()
    ensureNestedRepeaterIds(duplicate, repeaterField.itemSchema)
    items.splice(index + 1, 0, duplicate)

    selectItemNode(sectionId, fieldKey, duplicate.id as string)

    return true
  }

  function updateRepeaterItem(sectionId: string, fieldKey: string, itemId: string, data: Record<string, unknown>) {
    const section = sections.value.find(s => s.id === sectionId)
    if (!section) return false

    const items = getNestedArray(section.data, fieldKey)
    if (!items) return false

    const index = items.findIndex(item => item && typeof item === 'object' && (item as Record<string, unknown>).id === itemId)
    if (index === -1) return false

    pushHistory()
    items[index] = { ...items[index], ...data }
    return true
  }

  function reorderRepeaterItem(sectionId: string, fieldKey: string, itemId: string, toIndex: number) {
    const section = sections.value.find(s => s.id === sectionId)
    if (!section) return false

    const items = getNestedArray(section.data, fieldKey)
    if (!items) return false

    const fromIndex = findItemIndex(section, fieldKey, itemId)
    if (fromIndex === -1) return false

    const clampedToIndex = Math.max(0, Math.min(toIndex, items.length - 1))
    if (fromIndex === clampedToIndex) return true

    pushHistory()
    const [item] = items.splice(fromIndex, 1)
    if (item !== undefined) {
      items.splice(clampedToIndex, 0, item)
    }

    return true
  }

  function updateItemStyle(id: string, styleKey: string, value: unknown) {
    const section = sections.value.find(s => s.id === id)
    if (!section) return false

    pushHistory()

    // Initialize itemStyles if it doesn't exist
    if (!section.itemStyles) {
      section.itemStyles = {}
    }

    // Update the specific style property
    ;(section.itemStyles as Record<string, unknown>)[styleKey] = value

    return true
  }

  // ============================================
  // SELECTION
  // ============================================

  function selectSection(id: string | null) {
    if (!id) {
      activeNode.value = null
      return
    }

    activeNode.value = {
      id,
      type: 'section',
      sectionId: id,
    }
  }

  function selectFieldNode(sectionId: string, fieldKey: string) {
    activeNode.value = {
      id: `${sectionId}:${fieldKey}`,
      type: 'field',
      sectionId,
      fieldKey,
    }
  }

  function selectItemNode(sectionId: string, fieldKey: string, itemId: string) {
    activeNode.value = {
      id: `${sectionId}:${fieldKey}:${itemId}`,
      type: 'item',
      sectionId,
      fieldKey,
      itemId,
    }
  }

  function selectNextSection() {
    if (sections.value.length === 0) return

    const currentIndex = selectedSectionId.value
      ? sections.value.findIndex(s => s.id === selectedSectionId.value)
      : -1

    const nextIndex = (currentIndex + 1) % sections.value.length
    const nextSection = sections.value[nextIndex]
    if (nextSection) {
      selectSection(nextSection.id)
    }
  }

  function selectPreviousSection() {
    if (sections.value.length === 0) return

    const currentIndex = selectedSectionId.value
      ? sections.value.findIndex(s => s.id === selectedSectionId.value)
      : 0

    const prevIndex = currentIndex <= 0 ? sections.value.length - 1 : currentIndex - 1
    const prevSection = sections.value[prevIndex]
    if (prevSection) {
      selectSection(prevSection.id)
    }
  }

  // ============================================
  // FIELD VISIBILITY
  // ============================================

  function isFieldHidden(sectionId: string, fieldKey: string): boolean {
    return hiddenFields.value[sectionId]?.has(fieldKey) ?? false
  }

  function toggleFieldVisibility(sectionId: string, fieldKey: string) {
    if (!hiddenFields.value[sectionId]) {
      hiddenFields.value[sectionId] = new Set()
    }
    if (hiddenFields.value[sectionId].has(fieldKey)) {
      hiddenFields.value[sectionId].delete(fieldKey)
    } else {
      hiddenFields.value[sectionId].add(fieldKey)
    }
  }

  // ============================================
  // META
  // ============================================

  function updateMeta(updates: Partial<PageMeta>) {
    meta.value = { ...meta.value, ...updates }
    isDirty.value = true
  }

  // ============================================
  // TRANSLATIONS
  // ============================================

  function initializeTranslations(defaultLang: string) {
    translationSettings.value = {
      defaultLanguage: defaultLang,
      languages: [],
    }
    translations.value = {}
    currentLanguage.value = null
    isDirty.value = true
  }

  function addLanguage(langCode: string) {
    if (!translationSettings.value) return false
    if (translationSettings.value.languages.includes(langCode)) return false
    if (langCode === translationSettings.value.defaultLanguage) return false

    // Add language to the list
    translationSettings.value.languages.push(langCode)

    // Initialize empty translations for all sections
    translations.value[langCode] = {}
    for (const section of sections.value) {
      // Copy translatable content from default language
      translations.value[langCode][section.id] = getTranslatableData(section)
    }

    isDirty.value = true
    return true
  }

  function removeLanguage(langCode: string) {
    if (!translationSettings.value) return false
    const index = translationSettings.value.languages.indexOf(langCode)
    if (index === -1) return false

    translationSettings.value.languages.splice(index, 1)
    delete translations.value[langCode]

    // If current language was removed, switch to default
    if (currentLanguage.value === langCode) {
      currentLanguage.value = null
    }

    isDirty.value = true
    return true
  }

  function setCurrentLanguage(langCode: string | null) {
    currentLanguage.value = langCode
  }

  function setDefaultLanguage(langCode: string) {
    if (!translationSettings.value) return false
    translationSettings.value.defaultLanguage = langCode
    isDirty.value = true
    return true
  }

  /** Get translatable fields from a section (text, richText, image fields) */
  function getTranslatableData(section: SectionInstance): Record<string, unknown> {
    const def = getSectionDefinition(section.type)
    if (!def) return {}

    const result: Record<string, unknown> = {}

    for (const field of def.schema) {
      // Include text, richText, and image fields
      if (field.type === 'text' || field.type === 'richText' || field.type === 'image' || field.type === 'media') {
        result[field.key] = section.data[field.key]
      }
      // For link fields, include the label
      if (field.type === 'link') {
        const linkData = section.data[field.key] as { label?: string; url?: string } | undefined
        if (linkData) {
          result[field.key] = { label: linkData.label, url: linkData.url }
        }
      }
      // For repeater fields, include translatable content of items
      if (field.type === 'repeater') {
        const items = section.data[field.key] as Record<string, unknown>[]
        if (Array.isArray(items)) {
          result[field.key] = items.map(item => {
            const itemResult: Record<string, unknown> = {}
            for (const itemField of field.itemSchema) {
              if (itemField.type === 'text' || itemField.type === 'richText' || itemField.type === 'image') {
                itemResult[itemField.key] = item[itemField.key]
              }
            }
            return itemResult
          })
        }
      }
    }

    return result
  }

  /** Update translation for a specific section and language */
  function updateTranslation(sectionId: string, langCode: string, data: Record<string, unknown>) {
    if (!translations.value[langCode]) {
      translations.value[langCode] = {}
    }
    translations.value[langCode][sectionId] = {
      ...translations.value[langCode][sectionId],
      ...data,
    }
    isDirty.value = true
  }

  /** Get section data with translations applied (for current language) */
  function getSectionDataForLanguage(section: SectionInstance, langCode: string | null): Record<string, unknown> {
    // If editing default language or no translations, return original data
    if (!langCode || !translationSettings.value || langCode === translationSettings.value.defaultLanguage) {
      return section.data
    }

    // Merge translated content over original data
    const translated = translations.value[langCode]?.[section.id]
    if (!translated) return section.data

    return { ...section.data, ...translated }
  }

  // ============================================
  // SERIALIZATION
  // ============================================

  function getPageContent(): PageContent {
    const content: PageContent = {
      themeId: theme.value.id,
      sections: sections.value,
      meta: meta.value,
    }

    // Include theme overrides if any
    if (Object.keys(themeOverrides.value).length > 0) {
      content.themeOverrides = themeOverrides.value
    }

    // Include translations if configured
    if (translationSettings.value) {
      content.translation = translationSettings.value
      content.translations = translations.value
    }

    return content
  }

  function markClean() {
    isDirty.value = false
  }

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    mode,
    previewMode,
    projectId,
    theme,
    themeOverrides,
    sections,
    meta,
    activeNode,
    selectedSectionId,
    activeFieldKey,
    activeFieldPath,
    activeItemIndex,
    activeItemId,
    hiddenFields,
    isDirty,
    isLoading,
    translationSettings,
    translations,
    currentLanguage,

    // Getters
    selectedSection,
    selectedSectionDefinition,
    selectedSectionVariants,
    canUndo,
    canRedo,
    hasTranslations,
    availableLanguages,
    defaultLanguage,

    // Initialization
    initializeEditor,
    resetEditor,

    // Mode
    setMode,
    setPreviewMode,

    // Theme
    setTheme,
    setColorOverride,
    setFontOverride,
    clearOverrides,

    // History
    undo,
    redo,

    // Section operations
    addSection,
    removeSection,
    duplicateSection,
    moveSection,
    reorderSections,

    // Section editing
    updateSectionData,
    updateSectionVariant,
    updateFieldStyle,
    updateSectionStyle,

    // Repeater item operations
    addRepeaterItem,
    removeRepeaterItem,
    duplicateRepeaterItem,
    updateRepeaterItem,
    reorderRepeaterItem,
    updateItemStyle,

    // Selection
    selectSection,
    selectFieldNode,
    selectItemNode,
    selectNextSection,
    selectPreviousSection,

    // Field visibility
    isFieldHidden,
    toggleFieldVisibility,

    // Meta
    updateMeta,

    // Translations
    initializeTranslations,
    addLanguage,
    removeLanguage,
    setCurrentLanguage,
    setDefaultLanguage,
    updateTranslation,
    getSectionDataForLanguage,

    // Serialization
    getPageContent,
    markClean,
  }
})
