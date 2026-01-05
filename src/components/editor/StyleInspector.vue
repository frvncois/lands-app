<script setup lang="ts">
/**
 * STYLE INSPECTOR
 *
 * Right sidebar with breadcrumb navigation:
 * - [Style] -> Theme selection + color/font customization
 * - [Style] > [Section] -> Section style settings
 * - [Style] > [Section] > [Item] -> Repeater item editing
 */

import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { getAllThemes } from '@/lib/themes'
import type { ColorTokens, FontTokens, RepeaterField, StyleOption } from '@/types/sections'
import FieldRenderer from './FieldRenderer.vue'
import ColorPicker from '@/components/ui/ColorPicker.vue'
import Icon from '@/components/ui/Icon.vue'
import Slider from '@/components/ui/Slider.vue'
import Toggle from '@/components/ui/Toggle.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Popover from '@/components/ui/Popover.vue'
import Combobox from '@/components/ui/Combobox.vue'
import type { ComboboxItem } from '@/components/ui/Combobox.vue'
import type { FieldStyleProperties, ItemStyleProperties } from '@/types/sections'
import { getAccordionLabels, isAccordionSectionType } from '@/lib/accordion-labels'
import { resolveRepeaterGroupStyles } from '@/lib/section-styles'
import ProjectUpload from '@/components/modal/ProjectUpload.vue'
import ProjectUnsplash from '@/components/modal/ProjectUnsplash.vue'
import { fontComboboxItems } from '@/lib/font-options'
import { colorOptions, fontOptions } from '@/lib/style-options'
import { styleDefaults } from '@/lib/style-defaults'
import { StylePopoverGroup } from '@/components/editor/style-controls'
import { sectionStyleConfig, carouselStyleConfig, productsCarouselStyleConfig, galleryCarouselStyleConfig, heroOverlayStyleConfig, heroOverlayMediaStyleConfig, textFieldStyleConfig, buttonFieldStyleConfig, heroStackedMediaStyleConfig, mediaFieldStyleConfig, imageFieldStyleConfig, headerStyleConfig, cardsStyleConfig, productsStyleConfig, accordionStyleConfig, linksStyleConfig, contactFormFieldsStyleConfig, contactSocialLinksStyleConfig } from '@/lib/section-style-configs'
import { useStyleInspectorSection } from '@/composables/useStyleInspectorSection'
import { useStyleInspectorRepeater } from '@/composables/useStyleInspectorRepeater'

const editor = useEditorStore()
const themes = getAllThemes()

const currentTheme = computed(() => editor.theme)
const selectedSection = computed(() => editor.selectedSection)
const selectedDefinition = computed(() => editor.selectedSectionDefinition)
const variants = computed(() => editor.selectedSectionVariants)
const activeNode = computed(() => editor.activeNode)
const activeFieldKey = computed(() => editor.activeFieldKey)
const activeFieldPath = computed(() => editor.activeFieldPath)
const activeItemId = computed(() => editor.activeItemId)
const activeItemIndex = computed(() => editor.activeItemIndex)
const isEditingItem = computed(() => activeNode.value?.type === 'item')

// Get section data with translations applied (if editing a translated language)
const sectionData = computed(() => {
  if (!selectedSection.value) return {}
  return editor.getSectionDataForLanguage(selectedSection.value, editor.currentLanguage)
})

// Image upload modal state
const showUploadModal = ref(false)
const showUnsplashModal = ref(false)
const editingImageField = ref<string | null>(null) // For repeater item image fields

// Drag state for repeater items
const draggedItemIndex = ref<number | null>(null)
const dropTargetItemIndex = ref<number | null>(null)

function handleImageUploaded(url: string) {
  if (!selectedSection.value) return

  if (editingMediaField.value && isEditingItem.value && activeFieldKey.value && activeItemId.value) {
    const currentMedia = (activeItemData.value?.[editingMediaField.value] as { type?: string }) || {}
    updateItemField(editingMediaField.value, { type: currentMedia.type || 'image', src: url, alt: '' })
    editingMediaField.value = null
  } else if (editingImageField.value && isEditingItem.value && activeFieldKey.value && activeItemId.value) {
    updateItemField(editingImageField.value, url)
    editingImageField.value = null
  } else if (isTopLevelMediaField() && activeFieldKey.value) {
    const currentType = getMediaType()
    updateField(activeFieldKey.value, { type: currentType, src: url, alt: '' })
  } else if (activeFieldKey.value) {
    updateField(activeFieldKey.value, url)
  }
}

function handleUnsplashSelect(url: string) {
  if (!selectedSection.value) return

  if (editingMediaField.value && isEditingItem.value && activeFieldKey.value && activeItemId.value) {
    const currentMedia = (activeItemData.value?.[editingMediaField.value] as { type?: string }) || {}
    updateItemField(editingMediaField.value, { type: currentMedia.type || 'image', src: url, alt: '' })
    editingMediaField.value = null
  } else if (editingImageField.value && isEditingItem.value && activeFieldKey.value && activeItemId.value) {
    updateItemField(editingImageField.value, url)
    editingImageField.value = null
  } else if (isTopLevelMediaField() && activeFieldKey.value) {
    const currentType = getMediaType()
    updateField(activeFieldKey.value, { type: currentType, src: url, alt: '' })
  } else if (activeFieldKey.value) {
    updateField(activeFieldKey.value, url)
  }
}

function removeImage() {
  if (!selectedSection.value || !activeFieldKey.value) return
  if (isTopLevelMediaField()) {
    updateField(activeFieldKey.value, { type: 'image', src: '', alt: '' })
  } else {
    updateField(activeFieldKey.value, '')
  }
}

function openUploadForItemField(fieldKey: string) {
  editingImageField.value = fieldKey
  showUploadModal.value = true
}

function openUnsplashForItemField(fieldKey: string) {
  editingImageField.value = fieldKey
  showUnsplashModal.value = true
}

function removeItemImage(fieldKey: string) {
  updateItemField(fieldKey, '')
}

// Media field helpers (for nested media objects with src property)
const editingMediaField = ref<string | null>(null)

function openUploadForItemMediaField(fieldKey: string) {
  editingMediaField.value = fieldKey
  showUploadModal.value = true
}

function openUnsplashForItemMediaField(fieldKey: string) {
  editingMediaField.value = fieldKey
  showUnsplashModal.value = true
}

// Helper to get nested value by dotted path (e.g., 'media.type' -> sectionData.media?.type)
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

function getNestedItems(obj: Record<string, unknown>, path: string): Record<string, unknown>[] | null {
  const value = getNestedValue(obj, path)
  if (!Array.isArray(value)) return null
  return value as Record<string, unknown>[]
}

// Helper to check if current field is a top-level media field (object with src, not string)
function isTopLevelMediaField(): boolean {
  if (!activeFieldDef.value || activeFieldDef.value.type !== 'media') return false
  if (isEditingItem.value) return false // In repeater item, handled separately
  return true
}

// Helper to get media src from top-level media field
function getMediaSrc(): string | undefined {
  if (!activeFieldDef.value) return undefined
  const media = sectionData.value[activeFieldDef.value.key] as { src?: string } | undefined
  return media?.src
}

// Helper to get media type from top-level media field
function getMediaType(): 'image' | 'video' {
  if (!activeFieldDef.value) return 'image'
  const typeKey = (activeFieldDef.value as { typeKey?: string }).typeKey
  if (typeKey) {
    const type = getNestedValue(sectionData.value, typeKey)
    return type === 'video' ? 'video' : 'image'
  }
  return 'image'
}

// Helper to update media type for top-level media field
function setMediaType(newType: 'image' | 'video') {
  if (!activeFieldDef.value || !activeFieldKey.value) return
  const currentMedia = sectionData.value[activeFieldDef.value.key] as { type?: string; src?: string; alt?: string } | undefined
  updateField(activeFieldKey.value, {
    type: newType,
    src: currentMedia?.src || '',
    alt: currentMedia?.alt || ''
  })
}


// Get font label from value
function getFontLabel(value: string): string {
  const font = fontComboboxItems.find(f => f.value === value)
  return font?.label || value.split(',')[0] || value
}

// Get the active field definition
const activeFieldDef = computed(() => {
  if (!activeFieldKey.value || !selectedDefinition.value) return null
  return selectedDefinition.value.schema.find(f => f.key === activeFieldKey.value)
})

// Get the active field value using nested path resolution
const activeFieldValue = computed(() => {
  if (!activeFieldDef.value) return ''
  return getNestedValue(sectionData.value, activeFieldDef.value.key) ?? ''
})

// Get repeater items for list view
const repeaterItems = computed(() => {
  if (!activeFieldDef.value || activeFieldDef.value.type !== 'repeater') return []
  return (sectionData.value[activeFieldDef.value.key] as unknown[]) || []
})

// Add new repeater item (uses itemDefault from schema)
function addRepeaterItem() {
  if (!selectedSection.value || !activeFieldDef.value) return
  editor.addRepeaterItem(selectedSection.value.id, activeFieldDef.value.key)
}

// Select repeater item for editing
function selectRepeaterItem(index: number) {
  if (!selectedSection.value || !activeFieldDef.value) return
  const id = getRepeaterItemId(index)
  if (!id) return
  editor.selectItemNode(selectedSection.value.id, activeFieldDef.value.key, id)
}

// Repeater item drag and drop handlers
function onItemDragStart(e: DragEvent, index: number) {
  draggedItemIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

function onItemDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
  dropTargetItemIndex.value = index
}

function onItemDragLeave() {
  dropTargetItemIndex.value = null
}

function onItemDrop(e: DragEvent, toIndex: number) {
  e.preventDefault()
  const fromIndex = draggedItemIndex.value
  if (fromIndex !== null && fromIndex !== toIndex && selectedSection.value && activeRepeaterField.value) {
    const itemId = getRepeaterItemId(fromIndex)
    if (itemId) {
      editor.reorderRepeaterItem(selectedSection.value.id, activeRepeaterField.value.key, itemId, toIndex)
    }
  }
  draggedItemIndex.value = null
  dropTargetItemIndex.value = null
}

function onItemDragEnd() {
  draggedItemIndex.value = null
  dropTargetItemIndex.value = null
}

// Get item label for repeater list
function getRepeaterItemLabel(item: unknown, index: number): string {
  if (!item || typeof item !== 'object') return `${singularItemLabel.value} ${index + 1}`
  const obj = item as Record<string, unknown>
  const labelFields = ['headline', 'label', 'title', 'name', 'heading', 'platform']
  for (const key of labelFields) {
    const value = obj[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }
  // Fallback to first text field with value
  if (activeItemSchema.value) {
    for (const field of activeItemSchema.value) {
      if (field.type === 'text' || field.type === 'richText') {
        const value = obj[field.key]
        if (typeof value === 'string' && value.trim()) {
          return value
        }
      }
    }
  }
  return `${singularItemLabel.value} ${index + 1}`
}

function getRepeaterItemId(index: number): string | undefined {
  if (!selectedSection.value || !activeFieldDef.value) return undefined
  const items = getNestedItems(selectedSection.value.data, activeFieldDef.value.key)
  const item = items?.[index]
  const id = item && typeof item === 'object' ? (item as Record<string, unknown>).id : undefined
  return typeof id === 'string' ? id : undefined
}

// Get the repeater field definition
const activeRepeaterField = computed(() => {
  if (!activeFieldDef.value || activeFieldDef.value.type !== 'repeater') return null
  return activeFieldDef.value as RepeaterField
})

const activeRepeaterDef = computed(() => {
  if (!isEditingItem.value) return null
  return activeRepeaterField.value
})

const accordionLabels = computed(() => getAccordionLabels(selectedSection.value?.type))
const isAccordionSectionSelected = computed(() => isAccordionSectionType(selectedSection.value?.type))
const activeRepeaterGroupStyles = computed(() => {
  if (!activeRepeaterField.value) return {}
  return resolveRepeaterGroupStyles(selectedSection.value?.styles, activeRepeaterField.value.key)
})

// Get the item schema (useCase-specific or variant-specific if available)
const activeItemSchema = computed(() => {
  if (!activeRepeaterDef.value) return []
  const repeater = activeRepeaterDef.value
  const variant = selectedSection.value?.variant

  // Check for useCase-specific schema first
  if (repeater.useCaseKey && repeater.useCaseSchemas) {
    const useCase = sectionData.value[repeater.useCaseKey] as string
    if (useCase && repeater.useCaseSchemas[useCase]) {
      return repeater.useCaseSchemas[useCase]
    }
  }

  // Check for variant-specific schema
  if (variant && repeater.variantSchemas?.[variant]) {
    return repeater.variantSchemas[variant]
  }

  return repeater.itemSchema
})

// Get the current item data (with translations applied)
const activeItemData = computed(() => {
  if (!isEditingItem.value || !selectedSection.value || !activeFieldKey.value || !activeItemId.value) return null
  const baseItems = getNestedItems(selectedSection.value.data, activeFieldKey.value)
  if (!baseItems) return null
  const index = baseItems.findIndex(item => item && typeof item === 'object' && (item as Record<string, unknown>).id === activeItemId.value)
  if (index === -1) return null
  const translatedItems = getNestedItems(sectionData.value as Record<string, unknown>, activeFieldKey.value)
  return translatedItems?.[index] || null
})

// Get item display label for breadcrumb
const activeItemLabel = computed(() => {
  if (!activeItemData.value || !activeRepeaterDef.value) return 'Item'
  const labelFields = ['label', 'title', 'name']
  for (const key of labelFields) {
    const value = activeItemData.value[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }
  return `Item ${(activeItemIndex.value ?? 0) + 1}`
})

const activeRepeaterLabel = computed(() => {
  const currentRepeater = activeRepeaterDef.value || activeRepeaterField.value
  if (!currentRepeater) return ''
  if (currentRepeater.key === 'items' && isAccordionSectionSelected.value) {
    return accordionLabels.value.itemsLabel
  }
  return currentRepeater.label
})

// Get singular item label (removes trailing 's' from plural label)
const singularItemLabel = computed(() => {
  const label = activeRepeaterLabel.value
  if (!label) return 'Item'
  // Handle common plural patterns
  if (label.endsWith('ies')) return label.slice(0, -3) + 'y'
  if (label.endsWith('s')) return label.slice(0, -1)
  return label
})

const activeItemSchemaWithLabels = computed(() => {
  if (!activeItemSchema.value || activeItemSchema.value.length === 0) return activeItemSchema.value
  if (!activeRepeaterDef.value || activeRepeaterDef.value.key !== 'items' || !isAccordionSectionSelected.value) {
    return activeItemSchema.value
  }
  const overrides = accordionLabels.value.fieldLabels
  if (!overrides) return activeItemSchema.value
  return activeItemSchema.value.map(field => {
    const override = overrides[field.key]
    if (override) {
      return { ...field, label: override }
    }
    return field
  })
})

// Get design fields for the selected section
const designFields = computed(() => {
  if (!selectedDefinition.value) return []
  return selectedDefinition.value.schema.filter(f => f.category === 'design')
})

// Get style options for the selected section (global + variant-specific)
const styleOptions = computed<StyleOption[]>(() => {
  if (!selectedDefinition.value || !selectedSection.value) return []

  const options = selectedDefinition.value.styleOptions
  if (!options) return []

  const result: StyleOption[] = []

  // Add global options first
  if (options._global) {
    result.push(...options._global)
  }

  // Add variant-specific options
  const variantOptions = options[selectedSection.value.variant]
  if (variantOptions) {
    result.push(...variantOptions)
  }

  // Filter out splitLayout for Cards/Products Split variant (split always uses row layout)
  if (isCardsSplitVariant.value || isProductsSplitVariant.value) {
    return result.filter(opt => opt.key !== 'splitLayout')
  }

  // Filter out carousel options for Cards carousel variant (shown in grouped Style section instead)
  if (selectedSection.value.type === 'cards' && selectedSection.value.variant === 'carousel') {
    return result.filter(opt => !['autoplay', 'showArrows', 'slidesPerView'].includes(opt.key))
  }

  // Filter out carousel options for Products carousel variant (shown in grouped Style section instead)
  if (selectedSection.value.type === 'products' && selectedSection.value.variant === 'carousel') {
    return result.filter(opt => !['autoplay', 'showArrows', 'slidesPerView'].includes(opt.key))
  }

  // Filter out slider options for Gallery slider variant (shown in grouped Style section instead)
  if (selectedSection.value.type === 'gallery' && selectedSection.value.variant === 'slider') {
    return result.filter(opt => !['autoplay', 'showArrows', 'slidesPerView'].includes(opt.key))
  }

  // Filter out sticky option for Header (shown in grouped Style section instead)
  if (selectedSection.value.type === 'header') {
    return result.filter(opt => opt.key !== 'sticky')
  }

  return result
})

// Get button-related fields (shown when buttonText field is active)
const buttonFields = computed(() => {
  if (!selectedDefinition.value || activeFieldPath.value !== 'buttonText') return []
  return selectedDefinition.value.schema.filter(f => f.category === 'button')
})

// Get current field styles for the active field
const activeFieldStyles = computed<FieldStyleProperties>(() => {
  if (!selectedSection.value || !activeFieldPath.value) return {}
  return selectedSection.value.fieldStyles?.[activeFieldPath.value] || {}
})

// Get current section styles
const sectionStyles = computed(() => {
  if (!selectedSection.value) return {}
  return selectedSection.value.styles || {}
})

const sectionSpaceBetweenValue = computed(() => {
  const value = sectionStyles.value.spaceBetween
  return typeof value === 'number' ? value : 32
})

// Initialize section detection composable
const sectionFlags = useStyleInspectorSection({
  selectedSection,
  activeRepeaterField,
  isEditingItem,
  activeItemId,
})

// Destructure section flags
const {
  isCardsSection,
  isProductsSection,
  isAccordionSection,
  isLinksSection,
  isContactSection,
  isCTASection,
  isCardsSplitVariant,
  isProductsSplitVariant,
  isCTAStackedVariant,
  isCardsRepeaterGroupSelected,
  isProductsRepeaterGroupSelected,
  isEditingCardsItem,
  isEditingProductsItem,
  isEditingAccordionItem,
  isEditingLinksItem,
  isEditingContactFormField,
  isEditingContactSocialLink,
  isEditingSharedStyleItem,
  isSharedStyleSection,
} = sectionFlags

// Initialize repeater logic composable
const repeaterLogic = useStyleInspectorRepeater({
  sectionStyles,
  activeRepeaterField,
  updateSectionStyle,
})

// Destructure repeater logic
const {
  cardsGroupStyles,
  productsGroupStyles,
  accordionGroupStyles,
  linksGroupStyles,
  contactFormFieldsGroupStyles,
  contactSocialLinksGroupStyles,
  updateCardsGroupStyle,
  updateProductsGroupStyle,
  updateAccordionGroupStyle,
  updateLinksGroupStyle,
  updateContactFormFieldsGroupStyle,
  updateContactSocialLinksGroupStyle,
  updateSharedCardStyle,
  updateSharedProductStyle,
  updateSharedAccordionStyle,
  updateSharedLinkStyle,
  updateSharedFormInputStyle,
} = repeaterLogic

// CTA layout options for dropdown
const ctaLayoutOptions = [
  { value: 'option1', label: 'Centered' },
  { value: 'option2', label: 'Left-aligned' },
  { value: 'option3', label: 'Inline' },
]

// Helper to get CTA style values from sectionStyles
function getCTAStyle<T>(key: string, defaultValue: T): T {
  const styles = sectionStyles.value as Record<string, unknown>
  return (styles[key] as T) ?? defaultValue
}

function updateCTAStyle(key: string, value: unknown) {
  updateSectionStyle(key, value)
}

// Helper to get shared accordion style values from sectionStyles
function getSharedAccordionStyle<T>(key: string, defaultValue: T): T {
  const styles = sectionStyles.value as Record<string, unknown>
  return (styles[key] as T) ?? defaultValue
}

// Helper to get shared link style values from sectionStyles
function getSharedLinkStyle<T>(key: string, defaultValue: T): T {
  const styles = sectionStyles.value as Record<string, unknown>
  return (styles[key] as T) ?? defaultValue
}

// Shared form input styles - used for Contact section form inputs
function getSharedFormInputStyle<T>(key: string, defaultValue: T): T {
  const styles = sectionStyles.value as Record<string, unknown>
  return (styles[key] as T) ?? defaultValue
}

// Shared card styles - used at section level for ALL cards
const cardMediaAspectOptions = [
  { value: 'paysage', label: '4:3 (Paysage)' },
  { value: 'square', label: '1:1 (Square)' },
  { value: 'portrait', label: '3:4 (Portrait)' },
]

// Shared product styles - used at section level for ALL products (mirrors Cards)
const productMediaAspectOptions = [
  { value: 'square', label: '1:1 (Square)' },
  { value: 'paysage', label: '4:3 (Paysage)' },
  { value: 'portrait', label: '3:4 (Portrait)' },
]

// Helper to get shared card style values from sectionStyles
function getSharedCardStyle<T>(key: string, defaultValue: T): T {
  const styles = sectionStyles.value as Record<string, unknown>
  return (styles[key] as T) ?? defaultValue
}

// Helper to get shared product style values from sectionStyles (mirrors Cards)
function getSharedProductStyle<T>(key: string, defaultValue: T): T {
  const styles = sectionStyles.value as Record<string, unknown>
  return (styles[key] as T) ?? defaultValue
}

// Get current item styles (shared across all items in repeater)
const itemStyles = computed<ItemStyleProperties>(() => {
  if (!selectedSection.value) return {}
  return selectedSection.value.itemStyles || {}
})

const showItemFontSizeControl = computed(() => {
  const type = selectedSection.value?.type
  if (!type) return true
  return type !== 'gallery'
})

function updateActiveFieldStyle(styleKey: string, value: unknown) {
  if (!selectedSection.value || !activeFieldPath.value) return
  editor.updateFieldStyle(selectedSection.value.id, activeFieldPath.value, styleKey, value)
}

function updateSectionStyle(styleKey: string, value: unknown) {
  if (!selectedSection.value) return
  editor.updateSectionStyle(selectedSection.value.id, styleKey, value)
}

function updateItemStyle(styleKey: string, value: unknown) {
  if (!selectedSection.value) return
  editor.updateItemStyle(selectedSection.value.id, styleKey, value)
}

function goToThemes() {
  editor.selectSection(null)
}

function goToSection() {
  if (selectedSection.value) {
    editor.selectSection(selectedSection.value.id)
  }
}

function goToRepeater() {
  if (selectedSection.value && activeFieldKey.value) {
    editor.selectFieldNode(selectedSection.value.id, activeFieldKey.value)
  }
}

function selectTheme(themeId: string) {
  editor.setTheme(themeId)
}

function updateColor(key: keyof ColorTokens, value: string) {
  editor.setColorOverride(key, value)
}

function updateFont(key: keyof FontTokens, value: string) {
  editor.setFontOverride(key, value)
}

function updateVariant(variant: string) {
  if (!selectedSection.value) return
  editor.updateSectionVariant(selectedSection.value.id, variant)
}

function updateField(key: string, value: unknown) {
  if (!selectedSection.value) return
  // If editing a translation language, save to translations
  if (editor.currentLanguage && editor.translationSettings && editor.currentLanguage !== editor.translationSettings.defaultLanguage) {
    editor.updateTranslation(selectedSection.value.id, editor.currentLanguage, { [key]: value })
  } else {
    // Otherwise save to default section data
    editor.updateSectionData(selectedSection.value.id, { [key]: value })
  }
}

function updateItemField(fieldKey: string, value: unknown) {
  if (!selectedSection.value || !activeFieldKey.value || !activeItemId.value) return
  editor.updateRepeaterItem(selectedSection.value.id, activeFieldKey.value, activeItemId.value, { [fieldKey]: value })
}

function deleteItem() {
  if (!selectedSection.value || !activeFieldKey.value || !activeItemId.value) return
  editor.removeRepeaterItem(selectedSection.value.id, activeFieldKey.value, activeItemId.value)
}
</script>

<template>
  <div class="flex flex-col h-full select-none" data-tour="inspector">
    <!-- Breadcrumb Header -->
    <div class="flex items-center gap-1.5 h-14 px-4 py-3 border-b border-border">
      <button
        class="text-sm font-semibold transition-colors"
        :class="selectedSection ? 'text-muted-foreground hover:text-foreground' : 'text-foreground'"
        @click="goToThemes"
      >
        Style
      </button>
      <template v-if="selectedSection && selectedDefinition">
        <button
          class="flex items-center gap-1.5 text-xs transition-colors border py-1 px-2 rounded-md hover:bg-accent/50"
          :class="activeFieldPath ? 'text-muted-foreground hover:text-foreground' : 'text-foreground'"
          @click="goToSection"
        >
          {{ selectedDefinition.displayName }}
        </button>
        <!-- Repeater breadcrumb (with or without item selected) -->
        <template v-if="activeRepeaterField">
          <button
          class="flex items-center gap-1.5 text-xs transition-colors border py-1 px-2 rounded-md hover:bg-accent/50"
            :class="isEditingItem ? 'text-muted-foreground hover:text-foreground' : 'text-foreground'"
            @click="goToRepeater"
          >
            {{ activeRepeaterField.label }} list
          </button>
          <!-- Item breadcrumb (when editing specific item) -->
          <template v-if="isEditingItem">
            <span class="flex items-center gap-1.5 text-xs transition-colors border py-1 px-2 rounded-md hover:bg-accent/50">
              {{ activeItemLabel }}
            </span>
          </template>
        </template>
        <!-- Regular field breadcrumb -->
        <template v-else-if="activeFieldDef">
          <span class="flex items-center gap-1.5 text-xs transition-colors border py-1 px-2 rounded-md hover:bg-accent/50">
            {{ activeFieldDef.label }}
          </span>
        </template>
      </template>
    </div>

    <div class="flex-1 overflow-y-auto">
      <!-- Section Selected: Show section styles -->
      <template v-if="selectedSection && selectedDefinition">

        <!-- Repeater Item Editor -->
        <template v-if="isEditingItem && activeRepeaterDef && activeItemData">
          <!-- Item Content -->
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium tracking-wide text-foreground">
                Content
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div v-for="field in activeItemSchemaWithLabels" :key="field.key">
                <label class="block text-xs text-foreground mb-1.5">{{ field.label }}</label>

                <!-- Image field - use Upload UI -->
                <template v-if="field.type === 'image'">
                  <!-- Image Preview (when image exists) -->
                  <div v-if="activeItemData[field.key]" class="space-y-2">
                    <div class="relative rounded-lg overflow-hidden bg-muted aspect-video">
                      <img
                        :src="activeItemData[field.key] as string"
                        alt="Preview"
                        class="w-full h-full object-cover"
                      />
                      <button
                        class="absolute top-2 right-2 w-6 h-6 bg-background/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                        @click="removeItemImage(field.key)"
                      >
                        <Icon name="app-delete" :size="12" />
                      </button>
                    </div>
                    <div class="flex gap-2">
                      <Button
                        variant="secondary"
                        size="xs"
                        class="flex-1"
                        @click="openUploadForItemField(field.key)"
                      >
                        Replace
                      </Button>
                      <Button
                        variant="secondary"
                        size="xs"
                        class="flex-1"
                        @click="openUnsplashForItemField(field.key)"
                      >
                        Unsplash
                      </Button>
                    </div>
                  </div>

                  <!-- Upload buttons (when no image) -->
                  <div v-else class="space-y-2">
                    <button
                      class="flex flex-col items-center justify-center w-full p-4 border-1 border-dotted border-border bg-red-100 rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors"
                      @click="openUploadForItemField(field.key)"
                    >
                      <Icon name="app-upload" :size="18" class="text-muted-foreground mb-1" />
                      <span class="text-xs font-medium text-foreground">Upload</span>
                    </button>
                    <Button
                      variant="secondary"
                      size="xs"
                      full-width
                      @click="openUnsplashForItemField(field.key)"
                    >
                      <Icon name="photos" :size="12" />
                      Unsplash
                    </Button>
                  </div>
                </template>

                <!-- Media field (image or video) - use Upload UI -->
                <template v-else-if="field.type === 'media'">
                  <!-- Media Preview (when media exists) -->
                  <div v-if="(activeItemData[field.key] as { src?: string })?.src" class="space-y-2">
                    <div class="relative rounded-lg overflow-hidden bg-muted aspect-video">
                      <video
                        v-if="(activeItemData[field.key] as { type?: string })?.type === 'video'"
                        :src="(activeItemData[field.key] as { src: string }).src"
                        class="w-full h-full object-cover"
                        controls
                      />
                      <img
                        v-else
                        :src="(activeItemData[field.key] as { src: string }).src"
                        alt="Preview"
                        class="w-full h-full object-cover"
                      />
                      <button
                        class="absolute top-2 right-2 w-6 h-6 bg-background/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                        @click="updateItemField(field.key, { ...((activeItemData[field.key] as object) || {}), src: '' })"
                      >
                        <Icon name="app-delete" :size="12" />
                      </button>
                    </div>
                    <div class="flex gap-2">
                      <Button
                        variant="secondary"
                        size="xs"
                        class="flex-1"
                        @click="openUploadForItemMediaField(field.key)"
                      >
                        Replace
                      </Button>
                      <Button
                        v-if="(activeItemData[field.key] as { type?: string })?.type !== 'video'"
                        variant="secondary"
                        size="xs"
                        class="flex-1"
                        @click="openUnsplashForItemMediaField(field.key)"
                      >
                        Unsplash
                      </Button>
                    </div>
                  </div>

                  <!-- Upload buttons (when no media) -->
                  <div v-else class="space-y-2">
                    <button
                      class="flex flex-col items-center justify-center w-full p-4 border-1 border-dotted border-border bg-red-100 rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors"
                      @click="openUploadForItemMediaField(field.key)"
                    >
                      <Icon name="app-upload" :size="18" class="text-muted-foreground mb-1" />
                      <span class="text-xs font-medium text-foreground">Upload</span>
                    </button>
                    <Button
                      variant="secondary"
                      size="xs"
                      full-width
                      @click="openUnsplashForItemMediaField(field.key)"
                    >
                      <Icon name="photos" :size="12" />
                      Unsplash
                    </Button>
                  </div>
                </template>

                <!-- Other fields - use FieldRenderer -->
                <FieldRenderer
                  v-else
                  :field="field"
                  :value="activeItemData[field.key]"
                  @update="updateItemField(field.key, $event)"
                />
              </div>
            </div>
          </div>

          <!-- Item Style (shared) - NOT shown for shared-style sections (Cards, Products, Accordion, Links) -->
          <!-- These sections use shared section-level styles instead of per-item styles -->
          <div v-if="!isEditingSharedStyleItem" class="border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium tracking-wide text-foreground">
                Style
              </span>
              <span class="text-xs text-foreground ml-1">(shared)</span>
            </div>

            <!-- Default item styles for sections that still use per-item styling -->
            <div class="flex flex-col gap-4">
              <!-- Font Size -->
              <div v-if="showItemFontSizeControl" class="flex items-center justify-between gap-3">
                <label class="text-xs text-foreground whitespace-nowrap">Font Size</label>
                <Slider
                  :model-value="itemStyles.fontSize ?? styleDefaults.fontSize.default"
                  :min="styleDefaults.fontSize.min"
                  :max="styleDefaults.fontSize.max"
                  unit="px"
                  @update:model-value="updateItemStyle('fontSize', $event)"
                />
              </div>

              <!-- Spacing Y -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-foreground whitespace-nowrap">Spacing Y</label>
                <Slider
                  :model-value="itemStyles.spacingY ?? styleDefaults.spacingY.default"
                  :min="styleDefaults.spacingY.min"
                  :max="styleDefaults.spacingY.max"
                  unit="px"
                  @update:model-value="updateItemStyle('spacingY', $event)"
                />
              </div>

              <!-- Spacing X -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-foreground whitespace-nowrap">Spacing X</label>
                <Slider
                  :model-value="itemStyles.spacingX ?? styleDefaults.spacingX.default"
                  :min="styleDefaults.spacingX.min"
                  :max="styleDefaults.spacingX.max"
                  unit="px"
                  @update:model-value="updateItemStyle('spacingX', $event)"
                />
              </div>

              <!-- Background Color -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-foreground whitespace-nowrap">Background</label>
                <ColorPicker
                  :model-value="itemStyles.backgroundColor ?? currentTheme.tokens.colors.secondary"
                  swatch-only
                  @update:model-value="updateItemStyle('backgroundColor', $event)"
                />
              </div>

              <!-- Rounded -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-foreground whitespace-nowrap">Rounded</label>
                <Slider
                  :model-value="itemStyles.borderRadius ?? 8"
                  :min="0"
                  :max="32"
                  unit="px"
                  @update:model-value="updateItemStyle('borderRadius', $event)"
                />
              </div>
            </div>
          </div>

          <!-- Delete Item -->
          <div class="px-4 py-4">
            <Button
              variant="secondary"
              size="sm"
              full-width
              class="hover:!bg-destructive/10 hover:!text-destructive"
              @click="deleteItem"
            >
              <Icon name="app-delete" :size="14" />
              Delete {{ activeRepeaterLabel.replace(/s$/, '') }}
            </Button>
          </div>
        </template>

        <!-- Repeater Group Styles -->
        <div
          v-else-if="activeRepeaterField && !isEditingItem"
          class="border-b border-border"
        >
          <!-- FIRST: Items List with drag-and-drop -->
          <div class="px-4 py-4">
            <div class="mb-3">
              <span class="text-xs font-medium tracking-wide text-foreground">
                Content
              </span>
            </div>

            <!-- Draggable Items list -->
            <div class="flex flex-col gap-1">
              <div
                v-for="(item, index) in repeaterItems"
                :key="getRepeaterItemId(index) || index"
                :draggable="true"
                :class="[
                  'flex items-center gap-3 px-3 py-2 rounded-xl border border-border bg-muted/30 cursor-grab transition-colors',
                  draggedItemIndex === index && 'opacity-50',
                  dropTargetItemIndex === index && draggedItemIndex !== index && 'ring-2 ring-primary ring-offset-1',
                  draggedItemIndex !== null && 'cursor-grabbing'
                ]"
                @click="selectRepeaterItem(index)"
                @dragstart="onItemDragStart($event, index)"
                @dragover="onItemDragOver($event, index)"
                @dragleave="onItemDragLeave"
                @drop="onItemDrop($event, index)"
                @dragend="onItemDragEnd"
              >
                <Icon name="grip-dots-vertical" :size="12" class="text-muted-foreground shrink-0" />
                <span class="flex-1 text-sm truncate">{{ getRepeaterItemLabel(item, index) }}</span>
                <Icon name="chevron-right" :size="12" class="text-muted-foreground shrink-0" />
              </div>
            </div>

            <!-- Add Item Button (at bottom of list) -->
            <Button
              variant="ghost"
              size="sm"
              class="w-full mt-2 justify-start text-muted-foreground hover:text-foreground"
              @click="addRepeaterItem"
            >
              <Icon name="plus" :size="14" />
              Add {{ singularItemLabel }}
            </Button>
          </div>

          <!-- SECOND: Group Styles -->
          <div class="border-b border-border">
            <div class="px-4 py-4">
              <span class="text-xs font-medium tracking-wide text-foreground">
                {{ activeRepeaterLabel || 'Group Styles' }} style
              </span>
            </div>


          <!-- Cards Shared Style Controls (applies to ALL cards) -->
          <template v-if="isCardsSection && activeRepeaterField?.key === 'items' && !isEditingItem">
            <!-- Spacing Group -->
            <StylePopoverGroup
              :icon="cardsStyleConfig.spacing.icon"
              :title="cardsStyleConfig.spacing.title"
              :controls="cardsStyleConfig.spacing.controls"
              :styles="cardsGroupStyles"
              :defaults="cardsStyleConfig.spacing.defaults"
              @update="(key, value) => updateCardsGroupStyle(key, value)"
            />

            <!-- Borders Group -->
            <StylePopoverGroup
              :icon="cardsStyleConfig.borders.icon"
              :title="cardsStyleConfig.borders.title"
              :controls="cardsStyleConfig.borders.controls"
              :styles="cardsGroupStyles"
              :defaults="cardsStyleConfig.borders.defaults"
              @update="(key, value) => updateCardsGroupStyle(key, value)"
            />

            <!-- Background Group -->
            <StylePopoverGroup
              :icon="cardsStyleConfig.background.icon"
              :title="cardsStyleConfig.background.title"
              :controls="cardsStyleConfig.background.controls"
              :styles="cardsGroupStyles"
              :defaults="cardsStyleConfig.background.defaults"
              @update="(key, value) => updateCardsGroupStyle(key, value)"
            />

            <!-- Media Group -->
            <StylePopoverGroup
              :icon="cardsStyleConfig.media.icon"
              :title="cardsStyleConfig.media.title"
              :controls="cardsStyleConfig.media.controls"
              :styles="cardsGroupStyles"
              :defaults="cardsStyleConfig.media.defaults"
              @update="(key, value) => updateCardsGroupStyle(key, value)"
            />

            <!-- Headline Group -->
            <StylePopoverGroup
              :icon="cardsStyleConfig.headline.icon"
              :title="cardsStyleConfig.headline.title"
              :controls="cardsStyleConfig.headline.controls"
              :styles="cardsGroupStyles"
              :defaults="cardsStyleConfig.headline.defaults"
              @update="(key, value) => updateCardsGroupStyle(key, value)"
            />

            <!-- Subheadline Group -->
            <StylePopoverGroup
              :icon="cardsStyleConfig.subheadline.icon"
              :title="cardsStyleConfig.subheadline.title"
              :controls="cardsStyleConfig.subheadline.controls"
              :styles="cardsGroupStyles"
              :defaults="cardsStyleConfig.subheadline.defaults"
              @update="(key, value) => updateCardsGroupStyle(key, value)"
            />

            <!-- Paragraph Group -->
            <StylePopoverGroup
              :icon="cardsStyleConfig.paragraph.icon"
              :title="cardsStyleConfig.paragraph.title"
              :controls="cardsStyleConfig.paragraph.controls"
              :styles="cardsGroupStyles"
              :defaults="cardsStyleConfig.paragraph.defaults"
              @update="(key, value) => updateCardsGroupStyle(key, value)"
            />

            <!-- Button Group -->
            <StylePopoverGroup
              :icon="cardsStyleConfig.button.icon"
              :title="cardsStyleConfig.button.title"
              :controls="cardsStyleConfig.button.controls"
              :styles="cardsGroupStyles"
              :defaults="cardsStyleConfig.button.defaults"
              @update="(key, value) => updateCardsGroupStyle(key, value)"
            />
          </template>

          <!-- Products Split variant: Section Space Between only (no Content Layout - split always uses row) -->
          <div
            v-if="isProductsRepeaterGroupSelected"
            class="flex flex-col gap-4 mb-4"
          >
            <div class="flex items-center justify-between gap-3">
              <label class="text-xs text-foreground whitespace-nowrap">Section Space Between</label>
              <Slider
                :model-value="sectionSpaceBetweenValue"
                :min="0"
                :max="96"
                unit="px"
                @update:model-value="value => updateSectionStyle('spaceBetween', value)"
              />
            </div>
          </div>

          <!-- Products Shared Style Controls -->
          <template v-if="isProductsSection && activeRepeaterField?.key === 'items' && !isEditingItem">
            <StylePopoverGroup
              :icon="productsStyleConfig.spacing.icon"
              :title="productsStyleConfig.spacing.title"
              :controls="productsStyleConfig.spacing.controls"
              :styles="productsGroupStyles"
              :defaults="productsStyleConfig.spacing.defaults"
              @update="(key, value) => updateProductsGroupStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="productsStyleConfig.borders.icon"
              :title="productsStyleConfig.borders.title"
              :controls="productsStyleConfig.borders.controls"
              :styles="sectionStyles"
              :defaults="productsStyleConfig.borders.defaults"
              @update="(key, value) => updateSharedProductStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="productsStyleConfig.background.icon"
              :title="productsStyleConfig.background.title"
              :controls="productsStyleConfig.background.controls"
              :styles="sectionStyles"
              :defaults="productsStyleConfig.background.defaults"
              @update="(key, value) => updateSharedProductStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="productsStyleConfig.media.icon"
              :title="productsStyleConfig.media.title"
              :controls="productsStyleConfig.media.controls"
              :styles="sectionStyles"
              :defaults="productsStyleConfig.media.defaults"
              @update="(key, value) => updateSharedProductStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="productsStyleConfig.headline.icon"
              :title="productsStyleConfig.headline.title"
              :controls="productsStyleConfig.headline.controls"
              :styles="sectionStyles"
              :defaults="productsStyleConfig.headline.defaults"
              @update="(key, value) => updateSharedProductStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="productsStyleConfig.subheadline.icon"
              :title="productsStyleConfig.subheadline.title"
              :controls="productsStyleConfig.subheadline.controls"
              :styles="sectionStyles"
              :defaults="productsStyleConfig.subheadline.defaults"
              @update="(key, value) => updateSharedProductStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="productsStyleConfig.paragraph.icon"
              :title="productsStyleConfig.paragraph.title"
              :controls="productsStyleConfig.paragraph.controls"
              :styles="sectionStyles"
              :defaults="productsStyleConfig.paragraph.defaults"
              @update="(key, value) => updateSharedProductStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="productsStyleConfig.button.icon"
              :title="productsStyleConfig.button.title"
              :controls="productsStyleConfig.button.controls"
              :styles="sectionStyles"
              :defaults="productsStyleConfig.button.defaults"
              @update="(key, value) => updateSharedProductStyle(key, value)"
            />
          </template>

          <!-- Accordion Shared Style Controls -->
          <template v-if="isAccordionSection && activeRepeaterField?.key === 'items' && !isEditingItem">
            <StylePopoverGroup
              :icon="accordionStyleConfig.spacing.icon"
              :title="accordionStyleConfig.spacing.title"
              :controls="accordionStyleConfig.spacing.controls"
              :styles="accordionGroupStyles"
              :defaults="accordionStyleConfig.spacing.defaults"
              @update="(key, value) => updateAccordionGroupStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="accordionStyleConfig.borders.icon"
              :title="accordionStyleConfig.borders.title"
              :controls="accordionStyleConfig.borders.controls"
              :styles="sectionStyles"
              :defaults="accordionStyleConfig.borders.defaults"
              @update="(key, value) => updateSharedAccordionStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="accordionStyleConfig.background.icon"
              :title="accordionStyleConfig.background.title"
              :controls="accordionStyleConfig.background.controls"
              :styles="sectionStyles"
              :defaults="accordionStyleConfig.background.defaults"
              @update="(key, value) => updateSharedAccordionStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="accordionStyleConfig.headline.icon"
              :title="accordionStyleConfig.headline.title"
              :controls="accordionStyleConfig.headline.controls"
              :styles="sectionStyles"
              :defaults="accordionStyleConfig.headline.defaults"
              @update="(key, value) => updateSharedAccordionStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="accordionStyleConfig.paragraph.icon"
              :title="accordionStyleConfig.paragraph.title"
              :controls="accordionStyleConfig.paragraph.controls"
              :styles="sectionStyles"
              :defaults="accordionStyleConfig.paragraph.defaults"
              @update="(key, value) => updateSharedAccordionStyle(key, value)"
            />
          </template>

          <!-- Links Shared Style Controls -->
          <template v-if="isLinksSection && activeRepeaterField?.key === 'items' && !isEditingItem">
            <StylePopoverGroup
              :icon="linksStyleConfig.spacing.icon"
              :title="linksStyleConfig.spacing.title"
              :controls="linksStyleConfig.spacing.controls"
              :styles="linksGroupStyles"
              :defaults="linksStyleConfig.spacing.defaults"
              @update="(key, value) => updateLinksGroupStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="linksStyleConfig.borders.icon"
              :title="linksStyleConfig.borders.title"
              :controls="linksStyleConfig.borders.controls"
              :styles="sectionStyles"
              :defaults="linksStyleConfig.borders.defaults"
              @update="(key, value) => updateSharedLinkStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="linksStyleConfig.background.icon"
              :title="linksStyleConfig.background.title"
              :controls="linksStyleConfig.background.controls"
              :styles="sectionStyles"
              :defaults="linksStyleConfig.background.defaults"
              @update="(key, value) => updateSharedLinkStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="linksStyleConfig.headline.icon"
              :title="linksStyleConfig.headline.title"
              :controls="linksStyleConfig.headline.controls"
              :styles="sectionStyles"
              :defaults="linksStyleConfig.headline.defaults"
              @update="(key, value) => updateSharedLinkStyle(key, value)"
            />
            <StylePopoverGroup
              :icon="linksStyleConfig.paragraph.icon"
              :title="linksStyleConfig.paragraph.title"
              :controls="linksStyleConfig.paragraph.controls"
              :styles="sectionStyles"
              :defaults="linksStyleConfig.paragraph.defaults"
              @update="(key, value) => updateSharedLinkStyle(key, value)"
            />
          </template>

          <!-- Contact Form Fields Shared Style Controls (applies to ALL form inputs) -->
          <template v-if="isContactSection && activeRepeaterField?.key === 'formFields' && !isEditingItem">
            <StylePopoverGroup
              :icon="contactFormFieldsStyleConfig.spacing.icon"
              :title="contactFormFieldsStyleConfig.spacing.title"
              :controls="contactFormFieldsStyleConfig.spacing.controls"
              :styles="contactFormFieldsGroupStyles"
              :defaults="contactFormFieldsStyleConfig.spacing.defaults"
              @update="updateContactFormFieldsGroupStyle"
            />
            <StylePopoverGroup
              :icon="contactFormFieldsStyleConfig.borders.icon"
              :title="contactFormFieldsStyleConfig.borders.title"
              :controls="contactFormFieldsStyleConfig.borders.controls"
              :styles="contactFormFieldsGroupStyles"
              :defaults="contactFormFieldsStyleConfig.borders.defaults"
              @update="updateContactFormFieldsGroupStyle"
            />
            <StylePopoverGroup
              :icon="contactFormFieldsStyleConfig.background.icon"
              :title="contactFormFieldsStyleConfig.background.title"
              :controls="contactFormFieldsStyleConfig.background.controls"
              :styles="contactFormFieldsGroupStyles"
              :defaults="contactFormFieldsStyleConfig.background.defaults"
              @update="updateContactFormFieldsGroupStyle"
            />
            <StylePopoverGroup
              :icon="contactFormFieldsStyleConfig.typography.icon"
              :title="contactFormFieldsStyleConfig.typography.title"
              :controls="contactFormFieldsStyleConfig.typography.controls"
              :styles="contactFormFieldsGroupStyles"
              :defaults="contactFormFieldsStyleConfig.typography.defaults"
              @update="updateContactFormFieldsGroupStyle"
            />
          </template>

          <!-- Contact Social Links Shared Style Controls (applies to ALL social link items) -->
          <template v-if="isContactSection && activeRepeaterField?.key === 'socialLinks' && !isEditingItem">
            <StylePopoverGroup
              :icon="contactSocialLinksStyleConfig.spacing.icon"
              :title="contactSocialLinksStyleConfig.spacing.title"
              :controls="contactSocialLinksStyleConfig.spacing.controls"
              :styles="contactSocialLinksGroupStyles"
              :defaults="contactSocialLinksStyleConfig.spacing.defaults"
              @update="updateContactSocialLinksGroupStyle"
            />
            <StylePopoverGroup
              :icon="contactSocialLinksStyleConfig.borders.icon"
              :title="contactSocialLinksStyleConfig.borders.title"
              :controls="contactSocialLinksStyleConfig.borders.controls"
              :styles="contactSocialLinksGroupStyles"
              :defaults="contactSocialLinksStyleConfig.borders.defaults"
              @update="updateContactSocialLinksGroupStyle"
            />
            <StylePopoverGroup
              :icon="contactSocialLinksStyleConfig.background.icon"
              :title="contactSocialLinksStyleConfig.background.title"
              :controls="contactSocialLinksStyleConfig.background.controls"
              :styles="contactSocialLinksGroupStyles"
              :defaults="contactSocialLinksStyleConfig.background.defaults"
              @update="updateContactSocialLinksGroupStyle"
            />
            <StylePopoverGroup
              :icon="contactSocialLinksStyleConfig.label.icon"
              :title="contactSocialLinksStyleConfig.label.title"
              :controls="contactSocialLinksStyleConfig.label.controls"
              :styles="contactSocialLinksGroupStyles"
              :defaults="contactSocialLinksStyleConfig.label.defaults"
              @update="updateContactSocialLinksGroupStyle"
            />
            <StylePopoverGroup
              :icon="contactSocialLinksStyleConfig.description.icon"
              :title="contactSocialLinksStyleConfig.description.title"
              :controls="contactSocialLinksStyleConfig.description.controls"
              :styles="contactSocialLinksGroupStyles"
              :defaults="contactSocialLinksStyleConfig.description.defaults"
              @update="updateContactSocialLinksGroupStyle"
            />
          </template>

          <!-- Non-shared-style repeater group styles (not Cards/Products/Accordion/Links) -->

          </div>
        </div>

        <!-- Image Field Editor -->
        <template v-else-if="activeFieldDef && activeFieldDef.type === 'image'">
          <!-- Image Upload -->
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium tracking-wide text-foreground">
                Image
              </span>
            </div>

            <!-- Image Preview (when image exists) -->
            <div v-if="activeFieldValue" class="space-y-3">
              <div class="relative rounded-lg overflow-hidden bg-muted aspect-video">
                <img
                  :src="activeFieldValue as string"
                  alt="Preview"
                  class="w-full h-full object-contain"
                />
                <button
                  class="absolute top-2 right-2 w-7 h-7 bg-background/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  @click="removeImage"
                >
                  <Icon name="app-delete" :size="14" />
                </button>
              </div>
              <div class="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  class="flex-1"
                  @click="showUploadModal = true"
                >
                  <Icon name="app-upload" :size="14" />
                  Replace
                </Button>
              </div>
            </div>

            <!-- Upload buttons (when no image) -->
            <div v-else class="space-y-2">
              <button
                class="flex flex-col items-center justify-center w-full p-6 border-1 border-dotted border-border bg-muted rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors"
                @click="showUploadModal = true"
              >
                <div class="w-10 h-10 mb-2 rounded-full bg-input flex items-center justify-center">
                  <Icon name="app-upload" :size="20" class="text-muted-foreground" />
                </div>
                <span class="text-sm font-medium text-foreground">Upload Image</span>
                <span class="text-xs text-foreground mt-0.5">JPEG, PNG, WebP - Max 4MB</span>
              </button>
            </div>
          </div>

          <!-- Image Styles -->
            <!-- Promo section: ONLY show rounded corners -->
            <template v-if="selectedSection?.type === 'promo'">
              <div class="px-4 pb-4">
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-foreground whitespace-nowrap">Rounded</label>
                  <Slider
                    :model-value="activeFieldStyles.borderRadius ?? 8"
                    :min="0"
                    :max="32"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('borderRadius', $event)"
                  />
                </div>
              </div>
            </template>

            <!-- Header section: grouped Size and Spacing -->
            <template v-else-if="selectedSection?.type === 'header'">
              <StylePopoverGroup
                :icon="imageFieldStyleConfig.size.icon"
                :title="imageFieldStyleConfig.size.title"
                :controls="imageFieldStyleConfig.size.controls"
                :styles="activeFieldStyles"
                :defaults="imageFieldStyleConfig.size.defaults"
                @update="updateActiveFieldStyle"
              />
              <StylePopoverGroup
                :icon="imageFieldStyleConfig.spacing.icon"
                :title="imageFieldStyleConfig.spacing.title"
                :controls="imageFieldStyleConfig.spacing.controls"
                :styles="activeFieldStyles"
                :defaults="imageFieldStyleConfig.spacing.defaults"
                @update="updateActiveFieldStyle"
              />
            </template>

            <!-- Other sections: show full image styles inline -->
            <template v-else>
              <div class="px-4 pb-4 flex flex-col gap-4">
                <!-- Width -->
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-foreground whitespace-nowrap">Width</label>
                  <Slider
                    :model-value="activeFieldStyles.width ?? 120"
                    :min="24"
                    :max="300"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('width', $event)"
                  />
                </div>

                <!-- Spacing Y -->
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-foreground whitespace-nowrap">Spacing Y</label>
                  <Slider
                    :model-value="activeFieldStyles.spacingY ?? styleDefaults.spacingY.default"
                    :min="styleDefaults.spacingY.min"
                    :max="styleDefaults.spacingY.max"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('spacingY', $event)"
                  />
                </div>

                <!-- Spacing X -->
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-foreground whitespace-nowrap">Spacing X</label>
                  <Slider
                    :model-value="activeFieldStyles.spacingX ?? styleDefaults.spacingX.default"
                    :min="styleDefaults.spacingX.min"
                    :max="styleDefaults.spacingX.max"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('spacingX', $event)"
                  />
                </div>
              </div>
            </template>

        </template>

        <!-- Media Field Editor (image or video with type selector) -->
        <template v-else-if="activeFieldDef && activeFieldDef.type === 'media'">
          <!-- Media Type Selector -->
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium tracking-wide text-foreground">
                Type
              </span>
            </div>
            <div class="flex gap-1.5">
              <button
                class="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                :class="[
                  getMediaType() === 'image'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-border'
                ]"
                @click="setMediaType('image')"
              >
                Image
              </button>
              <button
                class="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                :class="[
                  getMediaType() === 'video'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-border'
                ]"
                @click="setMediaType('video')"
              >
                Video
              </button>
            </div>
          </div>

          <!-- Media Upload -->
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium tracking-wide text-foreground">
                {{ getMediaType() === 'video' ? 'Video' : 'Image' }}
              </span>
            </div>

            <!-- Media Preview (when media exists) -->
            <div v-if="getMediaSrc()" class="space-y-3">
              <div class="relative rounded-lg overflow-hidden bg-muted aspect-video">
                <!-- Video preview -->
                <video
                  v-if="getMediaType() === 'video'"
                  :src="getMediaSrc()"
                  class="w-full h-full object-cover"
                  controls
                />
                <!-- Image preview -->
                <img
                  v-else
                  :src="getMediaSrc()"
                  alt="Preview"
                  class="w-full h-full object-contain"
                />
                <button
                  class="absolute top-2 right-2 w-7 h-7 bg-background/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  @click="removeImage"
                >
                  <Icon name="app-delete" :size="14" />
                </button>
              </div>
              <div class="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  class="flex-1"
                  @click="showUploadModal = true"
                >
                  <Icon name="app-upload" :size="14" />
                  Replace
                </Button>
                <Button
                  v-if="getMediaType() !== 'video'"
                  variant="secondary"
                  size="sm"
                  class="flex-1"
                  @click="showUnsplashModal = true"
                >
                  <Icon name="photos" :size="14" />
                  Unsplash
                </Button>
              </div>
            </div>

            <!-- Upload buttons (when no media) -->
            <div v-else class="space-y-2">
              <button
                class="flex flex-col items-center justify-center w-full p-6 border-1 border-dotted border-border rounded-lg bg-red-100 hover:border-primary/50 hover:bg-muted/50 transition-colors"
                @click="showUploadModal = true"
              >
                <div class="w-10 h-10 mb-2 rounded-full bg-muted flex items-center justify-center">
                  <Icon name="app-upload" :size="20" class="text-muted-foreground" />
                </div>
                <span class="text-sm font-medium text-foreground">
                  Upload {{ getMediaType() === 'video' ? 'Video' : 'Image' }}
                </span>
                <span class="text-xs text-foreground mt-0.5">
                  {{ getMediaType() === 'video' ? 'MP4, WebM - Max 50MB' : 'JPEG, PNG, WebP - Max 4MB' }}
                </span>
              </button>
              <Button
                v-if="getMediaType() !== 'video'"
                variant="secondary"
                size="sm"
                full-width
                @click="showUnsplashModal = true"
              >
                <Icon name="photos" :size="14" />
                Browse Unsplash
              </Button>
            </div>
          </div>

          <!-- Media Styles -->
            <!-- Promo section: ONLY show rounded corners -->
            <template v-if="selectedSection?.type === 'promo'">
              <div class="px-4 py-3 border-t border-border/50">
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-foreground whitespace-nowrap">Rounded</label>
                  <Slider
                    :model-value="activeFieldStyles.borderRadius ?? 8"
                    :min="0"
                    :max="32"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('borderRadius', $event)"
                  />
                </div>
              </div>
            </template>

            <!-- Hero Split: ONLY show spacing (no rounded) -->
            <template v-else-if="selectedSection?.type === 'hero' && selectedSection?.variant === 'split'">
              <!-- Spacing Group -->
              <StylePopoverGroup
                :icon="mediaFieldStyleConfig.spacing.icon"
                :title="mediaFieldStyleConfig.spacing.title"
                :controls="mediaFieldStyleConfig.spacing.controls"
                :styles="activeFieldStyles"
                :defaults="mediaFieldStyleConfig.spacing.defaults"
                @update="(key, value) => updateActiveFieldStyle(key, value)"
              />
            </template>

            <!-- Hero Stacked: Grouped media controls (Size + Borders) -->
            <template v-else-if="selectedSection?.type === 'hero' && selectedSection?.variant === 'stacked'">
              <!-- Size Group -->
              <StylePopoverGroup
                :icon="heroStackedMediaStyleConfig.size.icon"
                :title="heroStackedMediaStyleConfig.size.title"
                :controls="heroStackedMediaStyleConfig.size.controls"
                :styles="activeFieldStyles"
                :defaults="heroStackedMediaStyleConfig.size.defaults"
                @update="(key, value) => updateActiveFieldStyle(key, value)"
              />

              <!-- Borders Group -->
              <StylePopoverGroup
                :icon="heroStackedMediaStyleConfig.borders.icon"
                :title="heroStackedMediaStyleConfig.borders.title"
                :controls="heroStackedMediaStyleConfig.borders.controls"
                :styles="activeFieldStyles"
                :defaults="heroStackedMediaStyleConfig.borders.defaults"
                @update="(key, value) => updateActiveFieldStyle(key, value)"
              />
            </template>

            <!-- Hero Overlay: Show overlay controls in grouped popover -->
            <template v-else-if="selectedSection?.type === 'hero' && selectedSection?.variant === 'overlay'">
              <StylePopoverGroup
                :icon="heroOverlayMediaStyleConfig.overlay.icon"
                :title="heroOverlayMediaStyleConfig.overlay.title"
                :controls="heroOverlayMediaStyleConfig.overlay.controls"
                :styles="sectionStyles"
                :defaults="heroOverlayMediaStyleConfig.overlay.defaults"
                @update="(key, value) => updateSectionStyle(key, value)"
              />
            </template>

            <!-- Other sections: show full media styles (grouped) -->
            <template v-else>
              <!-- Spacing Group -->
              <StylePopoverGroup
                :icon="mediaFieldStyleConfig.spacing.icon"
                :title="mediaFieldStyleConfig.spacing.title"
                :controls="mediaFieldStyleConfig.spacing.controls"
                :styles="activeFieldStyles"
                :defaults="mediaFieldStyleConfig.spacing.defaults"
                @update="(key, value) => updateActiveFieldStyle(key, value)"
              />

              <!-- Borders Group -->
              <StylePopoverGroup
                :icon="mediaFieldStyleConfig.borders.icon"
                :title="mediaFieldStyleConfig.borders.title"
                :controls="mediaFieldStyleConfig.borders.controls"
                :styles="activeFieldStyles"
                :defaults="mediaFieldStyleConfig.borders.defaults"
                @update="(key, value) => updateActiveFieldStyle(key, value)"
              />
            </template>
        </template>

        <!-- Link Field Editor -->
        <template v-else-if="activeFieldDef && activeFieldDef.type === 'link'">
          <!-- Link Content -->
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium tracking-wide text-foreground">
                Content
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div>
                <label class="block text-xs text-foreground mb-1.5">Title</label>
                <Input
                  :model-value="(sectionData[activeFieldDef.key] as { label?: string })?.label || ''"
                  type="text"
                  placeholder="Get Started"
                  size="sm"
                  variant="filled"
                  @update:model-value="updateField(activeFieldDef.key, { ...(sectionData[activeFieldDef.key] as object || {}), label: $event })"
                />
              </div>
              <div>
                <label class="block text-xs text-foreground mb-1.5">URL</label>
                <Input
                  :model-value="(sectionData[activeFieldDef.key] as { url?: string })?.url || ''"
                  type="url"
                  placeholder="https://"
                  size="sm"
                  variant="filled"
                  @update:model-value="updateField(activeFieldDef.key, { ...(sectionData[activeFieldDef.key] as object || {}), url: $event })"
                />
              </div>
            </div>
          </div>

          <!-- Link Styles -->
            <!-- Font Group -->
            <StylePopoverGroup
              :icon="textFieldStyleConfig.font.icon"
              :title="textFieldStyleConfig.font.title"
              :controls="textFieldStyleConfig.font.controls"
              :styles="activeFieldStyles"
              :defaults="textFieldStyleConfig.font.defaults"
              @update="(key, value) => updateActiveFieldStyle(key, value)"
            />

            <!-- Spacing Group -->
            <StylePopoverGroup
              :icon="textFieldStyleConfig.spacing.icon"
              :title="textFieldStyleConfig.spacing.title"
              :controls="textFieldStyleConfig.spacing.controls"
              :styles="activeFieldStyles"
              :defaults="textFieldStyleConfig.spacing.defaults"
              @update="(key, value) => updateActiveFieldStyle(key, value)"
            />

            <!-- Background Group -->
            <StylePopoverGroup
              :icon="buttonFieldStyleConfig.background.icon"
              :title="buttonFieldStyleConfig.background.title"
              :controls="buttonFieldStyleConfig.background.controls"
              :styles="activeFieldStyles"
              :defaults="buttonFieldStyleConfig.background.defaults"
              @update="(key, value) => updateActiveFieldStyle(key, value)"
            />

            <!-- Borders Group -->
            <StylePopoverGroup
              :icon="buttonFieldStyleConfig.borders.icon"
              :title="buttonFieldStyleConfig.borders.title"
              :controls="buttonFieldStyleConfig.borders.controls"
              :styles="activeFieldStyles"
              :defaults="buttonFieldStyleConfig.borders.defaults"
              @update="(key, value) => updateActiveFieldStyle(key, value)"
            />
        </template>

        <!-- Active Field Editor (non-repeater, non-image, non-link) -->
        <template v-else-if="activeFieldDef && !activeRepeaterField">
          <!-- Field Content -->
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium tracking-wide text-foreground">
                Content
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div>
                <label class="block text-xs text-foreground mb-1.5">{{ activeFieldDef.label }}</label>
                <FieldRenderer
                  :key="activeFieldDef.key"
                  :field="activeFieldDef"
                  :value="activeFieldValue"
                  @update="updateField(activeFieldDef.key, $event)"
                />
              </div>

              <!-- Button-specific settings (URL and Show toggle) -->
              <template v-if="buttonFields.length > 0">
                <div>
                  <label class="block text-xs text-foreground mb-1.5">URL</label>
                  <Input
                    :model-value="(sectionData.buttonUrl as string) || ''"
                    type="url"
                    placeholder="https://"
                    size="sm"
                    variant="filled"
                    @update:model-value="updateField('buttonUrl', $event)"
                  />
                </div>
                <div class="flex items-center justify-between">
                  <label class="text-xs text-foreground">Show Button</label>
                  <Toggle
                    :model-value="(sectionData.showButton as boolean) ?? true"
                    @update:model-value="updateField('showButton', $event)"
                  />
                </div>
              </template>
            </div>
          </div>

          <!-- Field Styles -->
          
            <!-- Font Group -->
            <StylePopoverGroup
              :icon="textFieldStyleConfig.font.icon"
              :title="textFieldStyleConfig.font.title"
              :controls="textFieldStyleConfig.font.controls"
              :styles="activeFieldStyles"
              :defaults="textFieldStyleConfig.font.defaults"
              @update="(key, value) => updateActiveFieldStyle(key, value)"
            />

            <!-- Spacing Group -->
            <StylePopoverGroup
              :icon="textFieldStyleConfig.spacing.icon"
              :title="textFieldStyleConfig.spacing.title"
              :controls="textFieldStyleConfig.spacing.controls"
              :styles="activeFieldStyles"
              :defaults="textFieldStyleConfig.spacing.defaults"
              @update="(key, value) => updateActiveFieldStyle(key, value)"
            />

            <!-- Button-only styles -->
            <template v-if="activeFieldPath === 'buttonText'">
              <!-- Background Group -->
              <StylePopoverGroup
                :icon="buttonFieldStyleConfig.background.icon"
                :title="buttonFieldStyleConfig.background.title"
                :controls="buttonFieldStyleConfig.background.controls"
                :styles="activeFieldStyles"
                :defaults="buttonFieldStyleConfig.background.defaults"
                @update="(key, value) => updateActiveFieldStyle(key, value)"
              />

              <!-- Borders Group -->
              <StylePopoverGroup
                :icon="buttonFieldStyleConfig.borders.icon"
                :title="buttonFieldStyleConfig.borders.title"
                :controls="buttonFieldStyleConfig.borders.controls"
                :styles="activeFieldStyles"
                :defaults="buttonFieldStyleConfig.borders.defaults"
                @update="(key, value) => updateActiveFieldStyle(key, value)"
              />
            </template>
        </template>

        <!-- Section-level controls (only shown when no field is active) -->
        <template v-else-if="!activeFieldDef">
          <!-- Variant Selector -->
          <div class="flex flex-col px-4 py-5 gap-3">
              <span class="text-xs font-medium tracking-wide text-foreground">
                Layout Variant
              </span>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="variant in variants"
                :key="variant.id"
                class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                :class="[
                  selectedSection.variant === variant.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-border'
                ]"
                @click="updateVariant(variant.id)"
              >
                {{ variant.label }}
              </button>
            </div>
          </div>

          <!-- Style Options (from section definition) -->
          <div v-if="styleOptions.length > 0" class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium tracking-wide text-foreground">
                Options
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div v-for="option in styleOptions" :key="option.key">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs text-foreground">{{ option.label }}</label>
                  <template v-if="option.type === 'select' && option.options">
                    <Select
                      :model-value="((sectionStyles[option.key] as string | undefined) ?? (option.default as string))"
                      :options="option.options"
                      size="sm"
                      variant="filled"
                      @update:model-value="value => updateSectionStyle(option.key, value)"
                    />
                  </template>
                  <Toggle
                    v-else-if="option.type === 'toggle'"
                    :model-value="(sectionStyles[option.key] as boolean) ?? (option.default as boolean)"
                    @update:model-value="updateSectionStyle(option.key, $event)"
                  />
                </div>
              </div>

              <!-- Promo: Smart Background Opacity (only when smartBackground is enabled) -->
              <div
                v-if="selectedSection?.type === 'promo' && (sectionStyles.smartBackground as boolean)"
                class="flex items-center justify-between gap-3"
              >
                <label class="text-xs text-foreground whitespace-nowrap">Opacity</label>
                <Slider
                  :model-value="(sectionStyles.smartBackgroundOpacity as number) ?? 0.4"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  @update:model-value="updateSectionStyle('smartBackgroundOpacity', $event)"
                />
              </div>
            </div>
          </div>

          <!-- Section Style -->
          

            <!-- General Section Spacing (if space between applies) -->
            <StylePopoverGroup
              v-if="selectedSection?.type === 'hero' || selectedSection?.type === 'promo' || selectedSection?.type === 'cards'"
              :icon="sectionStyleConfig.spacing.icon"
              :title="sectionStyleConfig.spacing.title"
              :controls="sectionStyleConfig.spacing.controls"
              :styles="sectionStyles"
              :defaults="sectionStyleConfig.spacing.defaults"
              @update="(key, value) => updateSectionStyle(key, value)"
            />

            <!-- General Section Spacing (without space between) -->
            <StylePopoverGroup
              v-else-if="!(selectedSection?.type === 'hero' && selectedSection?.variant === 'overlay')"
              :icon="sectionStyleConfig.spacing.icon"
              :title="sectionStyleConfig.spacing.title"
              :controls="sectionStyleConfig.spacing.controls.filter(c => c.key !== 'spaceBetween')"
              :styles="sectionStyles"
              :defaults="sectionStyleConfig.spacing.defaults"
              @update="(key, value) => updateSectionStyle(key, value)"
            />

            <!-- Background (hide for Hero Overlay) -->
            <StylePopoverGroup
              v-if="!(selectedSection?.type === 'hero' && selectedSection?.variant === 'overlay')"
              :icon="sectionStyleConfig.background.icon"
              :title="sectionStyleConfig.background.title"
              :controls="sectionStyleConfig.background.controls"
              :styles="sectionStyles"
              :defaults="sectionStyleConfig.background.defaults"
              @update="(key, value) => updateSectionStyle(key, value)"
            />

            <!-- Hero Overlay Height -->
            <StylePopoverGroup
              v-if="selectedSection?.type === 'hero' && selectedSection?.variant === 'overlay'"
              :icon="heroOverlayStyleConfig.height.icon"
              :title="heroOverlayStyleConfig.height.title"
              :controls="heroOverlayStyleConfig.height.controls"
              :styles="sectionStyles"
              :defaults="heroOverlayStyleConfig.height.defaults"
              @update="(key, value) => updateSectionStyle(key, value)"
            />

            <!-- Hero Overlay Position -->
            <StylePopoverGroup
              v-if="selectedSection?.type === 'hero' && selectedSection?.variant === 'overlay'"
              :icon="heroOverlayStyleConfig.position.icon"
              :title="heroOverlayStyleConfig.position.title"
              :controls="heroOverlayStyleConfig.position.controls"
              :styles="sectionStyles"
              :defaults="heroOverlayStyleConfig.position.defaults"
              @update="(key, value) => updateSectionStyle(key, value)"
            />

            <!-- Cards Carousel Slider -->
            <StylePopoverGroup
              v-if="selectedSection?.type === 'cards' && selectedSection?.variant === 'carousel'"
              :icon="carouselStyleConfig.slider.icon"
              :title="carouselStyleConfig.slider.title"
              :controls="carouselStyleConfig.slider.controls"
              :styles="sectionStyles"
              :defaults="carouselStyleConfig.slider.defaults"
              @update="(key, value) => updateSectionStyle(key, value)"
            />

            <!-- Products Carousel Slider -->
            <StylePopoverGroup
              v-if="selectedSection?.type === 'products' && selectedSection?.variant === 'carousel'"
              :icon="productsCarouselStyleConfig.slider.icon"
              :title="productsCarouselStyleConfig.slider.title"
              :controls="productsCarouselStyleConfig.slider.controls"
              :styles="sectionStyles"
              :defaults="productsCarouselStyleConfig.slider.defaults"
              @update="(key, value) => updateSectionStyle(key, value)"
            />

            <!-- Gallery Slider -->
            <StylePopoverGroup
              v-if="selectedSection?.type === 'gallery' && selectedSection?.variant === 'slider'"
              :icon="galleryCarouselStyleConfig.slider.icon"
              :title="galleryCarouselStyleConfig.slider.title"
              :controls="galleryCarouselStyleConfig.slider.controls"
              :styles="sectionStyles"
              :defaults="galleryCarouselStyleConfig.slider.defaults"
              @update="(key, value) => updateSectionStyle(key, value)"
            />

            <!-- Header Position -->
            <StylePopoverGroup
              v-if="selectedSection?.type === 'header'"
              :icon="headerStyleConfig.position.icon"
              :title="headerStyleConfig.position.title"
              :controls="headerStyleConfig.position.controls"
              :styles="sectionStyles"
              :defaults="headerStyleConfig.position.defaults"
              @update="(key, value) => updateSectionStyle(key, value)"
            />


          <!-- Design Options -->
          <div v-if="designFields.length > 0" class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium tracking-wide text-foreground">
                Design Options
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div v-for="field in designFields" :key="field.key">
                <label class="block text-xs text-foreground mb-1.5">{{ field.label }}</label>
                <FieldRenderer
                  :field="field"
                  :value="sectionData[field.key]"
                  @update="updateField(field.key, $event)"
                />
              </div>
            </div>
          </div>

        </template>
      </template>

      <!-- No Section Selected: Show themes and customization -->
      <template v-else>
        <!-- Theme Preset -->
        <div class="px-4 py-4">
          <div class="mb-4">
            <span class="text-xs font-medium tracking-wide text-foreground">
              Theme
            </span>
          </div>

          <div class="flex flex-col gap-2">
            <button
              v-for="theme in themes"
              :key="theme.id"
              class="flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-colors"
              :class="[
                currentTheme.id === theme.id
                  ? 'border-2 border-primary bg-muted'
                  : 'border-2 border-transparent hover:bg-muted'
              ]"
              @click="selectTheme(theme.id)"
            >
              <div
                class="w-10 h-7 rounded border flex items-end p-1 shrink-0"
                :style="{
                  backgroundColor: theme.tokens.colors.background,
                  borderColor: theme.tokens.colors.border
                }"
              >
                <div
                  class="w-1/2 h-1.5 rounded-sm"
                  :style="{ backgroundColor: theme.tokens.colors.primary }"
                />
              </div>
              <span class="text-sm font-medium text-foreground">{{ theme.name }}</span>
            </button>
          </div>
        </div>

        <!-- Color Palette -->
        <div class="px-4 py-4">
          <div class="mb-4">
            <span class="text-xs font-medium tracking-wide text-foreground">
              Colors
            </span>
          </div>

          <div class="flex flex-col gap-3">
            <label
              v-for="color in colorOptions"
              :key="color.key"
              class="flex justify-between gap-1.5"
            >
              <span class="text-xs text-foreground">{{ color.label }}</span>
              <ColorPicker
                :model-value="currentTheme.tokens.colors[color.key]"
                swatch-only
                @update:model-value="updateColor(color.key, $event)"
              />
            </label>
          </div>
        </div>

        <!-- Font Family -->
        <div class="px-4 py-4">
          <div class="mb-4">
            <span class="text-xs font-medium tracking-wide text-foreground">
              Typography
            </span>
          </div>

          <div class="flex flex-col gap-3">
            <div
              v-for="font in fontOptions"
              :key="font.key"
              class="flex flex-col gap-1.5"
            >
              <span class="text-xs text-foreground">{{ font.label }}</span>
              <Popover align="left" width="w-56">
                <template #trigger="{ toggle }">
                  <button
                    class="flex items-center justify-between w-full h-8 px-3 text-sm bg-secondary border border-transparent rounded-lg text-foreground transition-colors hover:bg-accent/50"
                    @click="toggle"
                  >
                    <span
                      class="truncate"
                      :style="{ fontFamily: currentTheme.tokens.fonts[font.key] }"
                    >
                      {{ getFontLabel(currentTheme.tokens.fonts[font.key] || '') }}
                    </span>
                    <Icon name="chevron-down" :size="14" class="text-muted-foreground shrink-0" />
                  </button>
                </template>
                <template #default="{ close }">
                  <Combobox
                    :items="fontComboboxItems"
                    search-placeholder="Search fonts..."
                    empty-text="No fonts found"
                    @select="(value) => { updateFont(font.key, value); close() }"
                  />
                </template>
              </Popover>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Upload Modal -->
    <ProjectUpload
      v-if="editor.projectId"
      :open="showUploadModal"
      :project-id="editor.projectId"
      @update:open="showUploadModal = $event"
      @uploaded="handleImageUploaded"
    />

    <!-- Unsplash Modal -->
    <ProjectUnsplash
      :open="showUnsplashModal"
      @update:open="showUnsplashModal = $event"
      @select="handleUnsplashSelect"
    />
  </div>
</template>
