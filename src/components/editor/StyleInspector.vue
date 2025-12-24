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
import type { ColorTokens, FontTokens, RepeaterField } from '@/types/sections'
import FieldRenderer from './FieldRenderer.vue'
import ColorPicker from '@/components/ui/ColorPicker.vue'
import Icon from '@/components/ui/Icon.vue'
import Slider from '@/components/ui/Slider.vue'
import Toggle from '@/components/ui/Toggle.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Popover from '@/components/ui/Popover.vue'
import Combobox from '@/components/ui/Combobox.vue'
import type { ComboboxItem } from '@/components/ui/Combobox.vue'
import type { FieldStyleProperties, ItemStyleProperties } from '@/types/sections'
import ProjectUpload from '@/components/modal/ProjectUpload.vue'
import ProjectUnsplash from '@/components/modal/ProjectUnsplash.vue'

const editor = useEditorStore()
const themes = getAllThemes()

const currentTheme = computed(() => editor.theme)
const selectedSection = computed(() => editor.selectedSection)
const selectedDefinition = computed(() => editor.selectedSectionDefinition)
const variants = computed(() => editor.selectedSectionVariants)
const activeField = computed(() => editor.activeField)
const activeItemIndex = computed(() => editor.activeItemIndex)

// Get section data with translations applied (if editing a translated language)
const sectionData = computed(() => {
  if (!selectedSection.value) return {}
  return editor.getSectionDataForLanguage(selectedSection.value, editor.currentLanguage)
})

// Image upload modal state
const showUploadModal = ref(false)
const showUnsplashModal = ref(false)
const editingImageField = ref<string | null>(null) // For repeater item image fields

function handleImageUploaded(url: string) {
  if (!selectedSection.value) return

  // Check if we're editing a repeater item media field (nested object with src)
  if (editingMediaField.value && activeItemIndex.value !== null && activeField.value) {
    const currentMedia = (activeItemData.value?.[editingMediaField.value] as { type?: string }) || {}
    updateItemField(editingMediaField.value, { type: currentMedia.type || 'image', src: url, alt: '' })
    editingMediaField.value = null
  }
  // Check if we're editing a repeater item image field
  else if (editingImageField.value && activeItemIndex.value !== null && activeField.value) {
    updateItemField(editingImageField.value, url)
    editingImageField.value = null
  }
  // Check if we're editing a top-level media field (object with src)
  else if (isTopLevelMediaField() && activeField.value) {
    const currentType = getMediaType()
    updateField(activeField.value, { type: currentType, src: url, alt: '' })
  }
  else if (activeField.value) {
    updateField(activeField.value, url)
  }
}

function handleUnsplashSelect(url: string) {
  if (!selectedSection.value) return

  // Check if we're editing a repeater item media field (nested object with src)
  if (editingMediaField.value && activeItemIndex.value !== null && activeField.value) {
    const currentMedia = (activeItemData.value?.[editingMediaField.value] as { type?: string }) || {}
    updateItemField(editingMediaField.value, { type: currentMedia.type || 'image', src: url, alt: '' })
    editingMediaField.value = null
  }
  // Check if we're editing a repeater item image field
  else if (editingImageField.value && activeItemIndex.value !== null && activeField.value) {
    updateItemField(editingImageField.value, url)
    editingImageField.value = null
  }
  // Check if we're editing a top-level media field (object with src)
  else if (isTopLevelMediaField() && activeField.value) {
    const currentType = getMediaType()
    updateField(activeField.value, { type: currentType, src: url, alt: '' })
  }
  else if (activeField.value) {
    updateField(activeField.value, url)
  }
}

function removeImage() {
  if (!selectedSection.value || !activeField.value) return
  // For top-level media fields, clear the entire object
  if (isTopLevelMediaField()) {
    updateField(activeField.value, { type: 'image', src: '', alt: '' })
  } else {
    updateField(activeField.value, '')
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

// Helper to check if current field is a top-level media field (object with src, not string)
function isTopLevelMediaField(): boolean {
  if (!activeFieldDef.value || activeFieldDef.value.type !== 'media') return false
  if (activeItemIndex.value !== null) return false // In repeater item, handled separately
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
  if (!activeFieldDef.value || !activeField.value) return
  const currentMedia = sectionData.value[activeFieldDef.value.key] as { type?: string; src?: string; alt?: string } | undefined
  updateField(activeField.value, {
    type: newType,
    src: currentMedia?.src || '',
    alt: currentMedia?.alt || ''
  })
}

// Color palette options (subset of most important colors)
const colorOptions: { key: keyof ColorTokens; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'foreground', label: 'Text' },
  { key: 'primary', label: 'Primary' },
  { key: 'accent', label: 'Accent' },
]

// Font options
const fontOptions: { key: keyof FontTokens; label: string }[] = [
  { key: 'heading', label: 'Headings' },
  { key: 'body', label: 'Body' },
]

// Font options for Combobox with groups
const fontComboboxItems: ComboboxItem[] = [
  // Sans-serif
  { value: 'Satoshi, sans-serif', label: 'Satoshi', group: 'Sans-serif' },
  { value: 'Clash Grotesk, sans-serif', label: 'Clash Grotesk', group: 'Sans-serif' },
  { value: 'Cabinet Grotesk, sans-serif', label: 'Cabinet Grotesk', group: 'Sans-serif' },
  { value: 'Switzer, sans-serif', label: 'Switzer', group: 'Sans-serif' },
  { value: 'Supreme, sans-serif', label: 'Supreme', group: 'Sans-serif' },
  { value: 'Public Sans, sans-serif', label: 'Public Sans', group: 'Sans-serif' },
  { value: 'Familjen Grotesk, sans-serif', label: 'Familjen Grotesk', group: 'Sans-serif' },
  { value: 'Ranade, sans-serif', label: 'Ranade', group: 'Sans-serif' },
  { value: 'Geist Sans, sans-serif', label: 'Geist Sans', group: 'Sans-serif' },
  // Serif
  { value: 'Author, serif', label: 'Author', group: 'Serif' },
  { value: 'Boska, serif', label: 'Boska', group: 'Serif' },
  { value: 'Instrument Serif, serif', label: 'Instrument Serif', group: 'Serif' },
  { value: 'Rowan, serif', label: 'Rowan', group: 'Serif' },
  { value: 'Quilon, serif', label: 'Quilon', group: 'Serif' },
  { value: 'Melodrama, serif', label: 'Melodrama', group: 'Serif' },
  // Rounded
  { value: 'Telma, sans-serif', label: 'Telma', group: 'Rounded' },
  { value: 'Pramukh Rounded, sans-serif', label: 'Pramukh Rounded', group: 'Rounded' },
  { value: 'Hoover, sans-serif', label: 'Hoover', group: 'Rounded' },
  // Display
  { value: 'Sharpie, cursive', label: 'Sharpie', group: 'Display' },
  { value: 'Styro, sans-serif', label: 'Styro', group: 'Display' },
  { value: 'New Title, serif', label: 'New Title', group: 'Display' },
  { value: 'Aktura, sans-serif', label: 'Aktura', group: 'Display' },
  { value: 'Boxing, sans-serif', label: 'Boxing', group: 'Display' },
  { value: 'Kihim, sans-serif', label: 'Kihim', group: 'Display' },
  { value: 'Rosaline, serif', label: 'Rosaline', group: 'Display' },
  { value: 'Stardom, serif', label: 'Stardom', group: 'Display' },
  { value: 'Pencerio, sans-serif', label: 'Pencerio', group: 'Display' },
]

// Get font label from value
function getFontLabel(value: string): string {
  const font = fontComboboxItems.find(f => f.value === value)
  return font?.label || value.split(',')[0] || value
}

// Get the active field definition
const activeFieldDef = computed(() => {
  if (!activeField.value || !selectedDefinition.value) return null
  return selectedDefinition.value.schema.find(f => f.key === activeField.value)
})

// Get the active field value using nested path resolution
const activeFieldValue = computed(() => {
  if (!activeFieldDef.value) return ''
  return getNestedValue(sectionData.value, activeFieldDef.value.key) ?? ''
})

// Check if we're in form context (contact section form)
// Uses simple prefix check - 'form.' is unique to contact sections
const isFormContext = computed(() => {
  const field = activeField.value
  if (!field) return false
  return field.startsWith('form.')
})

// Get form fields array for form inspector
const formFields = computed(() => {
  if (!isFormContext.value) return []
  const form = getNestedValue(sectionData.value, 'form') as { fields?: unknown[] } | undefined
  return form?.fields || []
})

// Get form submit label
const formSubmitLabel = computed(() => {
  if (!isFormContext.value) return 'Send Message'
  const form = getNestedValue(sectionData.value, 'form') as { submitLabel?: string } | undefined
  return form?.submitLabel || 'Send Message'
})

// Add a new form field
function addFormField() {
  if (!selectedSection.value) return
  const currentFields = formFields.value as Record<string, unknown>[]
  const newField = { name: 'New Field', type: 'text', placeholder: '' }
  updateField('form.fields', [...currentFields, newField])
}

// Remove a form field
function removeFormField(index: number) {
  if (!selectedSection.value) return
  const currentFields = [...formFields.value] as Record<string, unknown>[]
  currentFields.splice(index, 1)
  updateField('form.fields', currentFields)
}

// Update a form field property
function updateFormField(index: number, key: string, value: unknown) {
  if (!selectedSection.value) return
  const currentFields = [...formFields.value] as Record<string, unknown>[]
  currentFields[index] = { ...currentFields[index], [key]: value }
  updateField('form.fields', currentFields)
}

// Select a specific form field
function selectFormField(index: number) {
  editor.setActiveField('form.fields')
  editor.setActiveItem(index)
}

// Move form field up
function moveFormFieldUp(index: number) {
  if (index <= 0 || !selectedSection.value) return
  const currentFields = [...formFields.value] as Record<string, unknown>[]
  const temp = currentFields[index]!
  currentFields[index] = currentFields[index - 1]!
  currentFields[index - 1] = temp
  updateField('form.fields', currentFields)
  // Keep selection on the moved item
  editor.setActiveItem(index - 1)
}

// Move form field down
function moveFormFieldDown(index: number) {
  if (index >= formFields.value.length - 1 || !selectedSection.value) return
  const currentFields = [...formFields.value] as Record<string, unknown>[]
  const temp = currentFields[index]!
  currentFields[index] = currentFields[index + 1]!
  currentFields[index + 1] = temp
  updateField('form.fields', currentFields)
  // Keep selection on the moved item
  editor.setActiveItem(index + 1)
}

// Get form input styles
const formInputStyles = computed(() => {
  if (!selectedSection.value) return {}
  return selectedSection.value.styles?.formInput || {}
})

// Get form button styles
const formButtonStyles = computed(() => {
  if (!selectedSection.value) return {}
  return selectedSection.value.styles?.formButton || {}
})

// Update form input style
function updateFormInputStyle(key: string, value: unknown) {
  if (!selectedSection.value) return
  const currentStyles = { ...formInputStyles.value, [key]: value }
  updateSectionStyle('formInput', currentStyles)
}

// Update form button style
function updateFormButtonStyle(key: string, value: unknown) {
  if (!selectedSection.value) return
  const currentStyles = { ...formButtonStyles.value, [key]: value }
  updateSectionStyle('formButton', currentStyles)
}

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
  editor.setActiveItem(index)
}

// Get item label for repeater list
function getRepeaterItemLabel(item: unknown, index: number): string {
  if (!item || typeof item !== 'object') return `Item ${index + 1}`
  const obj = item as Record<string, unknown>
  const labelFields = ['label', 'title', 'name', 'platform']
  for (const key of labelFields) {
    const value = obj[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }
  return `Item ${index + 1}`
}

// Check if we're editing a repeater item
const isEditingItem = computed(() => {
  return activeFieldDef.value?.type === 'repeater' && activeItemIndex.value !== null
})

// Get the repeater field definition
const activeRepeaterDef = computed(() => {
  if (!isEditingItem.value || !activeFieldDef.value) return null
  return activeFieldDef.value as RepeaterField
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
  if (!isEditingItem.value || !selectedSection.value || !activeField.value || activeItemIndex.value === null) return null
  const items = sectionData.value[activeField.value] as Record<string, unknown>[]
  return items?.[activeItemIndex.value] || null
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

// Get design fields for the selected section
const designFields = computed(() => {
  if (!selectedDefinition.value) return []
  return selectedDefinition.value.schema.filter(f => f.category === 'design')
})

// Get style options for the selected section (global + variant-specific)
const styleOptions = computed(() => {
  if (!selectedDefinition.value || !selectedSection.value) return []

  const options = selectedDefinition.value.styleOptions
  if (!options) return []

  const result: Array<{ key: string; label: string; type: 'select' | 'toggle'; options?: { value: string; label: string }[]; default: string | boolean }> = []

  // Add global options first
  if (options._global) {
    result.push(...options._global)
  }

  // Add variant-specific options
  const variantOptions = options[selectedSection.value.variant]
  if (variantOptions) {
    result.push(...variantOptions)
  }

  return result
})

// Get button-related fields (shown when buttonText field is active)
const buttonFields = computed(() => {
  if (!selectedDefinition.value || activeField.value !== 'buttonText') return []
  return selectedDefinition.value.schema.filter(f => f.category === 'button')
})

// Get current field styles for the active field
const activeFieldStyles = computed<FieldStyleProperties>(() => {
  if (!selectedSection.value || !activeField.value) return {}
  return selectedSection.value.fieldStyles?.[activeField.value] || {}
})

// Get current section styles
const sectionStyles = computed(() => {
  if (!selectedSection.value) return {}
  return selectedSection.value.styles || {}
})

// Get current item styles (shared across all items in repeater)
const itemStyles = computed<ItemStyleProperties>(() => {
  if (!selectedSection.value) return {}
  return selectedSection.value.itemStyles || {}
})

// Default style values
const styleDefaults = {
  fontSize: { min: 12, max: 72, default: 16 },
  lineHeight: { min: 1, max: 3, step: 0.1, default: 1.5 },
  spacingX: { min: 0, max: 64, default: 0 },
  spacingY: { min: 0, max: 64, default: 0 },
  sectionSpacingX: { min: 0, max: 120, default: 24 },
  sectionSpacingY: { min: 0, max: 200, default: 64 },
}

function updateActiveFieldStyle(styleKey: keyof FieldStyleProperties, value: unknown) {
  if (!selectedSection.value || !activeField.value) return
  editor.updateFieldStyle(selectedSection.value.id, activeField.value, styleKey, value)
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
  editor.setActiveField(null)
}

function goToSection() {
  editor.setActiveField(null)
}

function goToRepeater() {
  editor.setActiveItem(null)
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
  if (!selectedSection.value || !activeField.value || activeItemIndex.value === null) return
  editor.updateRepeaterItem(selectedSection.value.id, activeField.value, activeItemIndex.value, { [fieldKey]: value })
}

function deleteItem() {
  if (!selectedSection.value || !activeField.value || activeItemIndex.value === null) return
  editor.removeRepeaterItem(selectedSection.value.id, activeField.value, activeItemIndex.value)
}
</script>

<template>
  <div class="flex flex-col h-full select-none">
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
        <Icon name="chevron-right" :size="10" class="text-muted-foreground" />
        <button
          class="flex items-center gap-1.5 text-sm font-semibold transition-colors"
          :class="activeField ? 'text-muted-foreground hover:text-foreground' : 'text-foreground'"
          @click="goToSection"
        >
          <Icon :name="selectedDefinition.icon" :size="12" :class="activeField ? 'text-muted-foreground' : 'text-primary'" />
          {{ selectedDefinition.displayName }}
        </button>
        <!-- Form context breadcrumb (always shows "Form") -->
        <template v-if="isFormContext">
          <Icon name="chevron-right" :size="10" class="text-muted-foreground" />
          <span class="text-sm font-semibold text-foreground">Form</span>
        </template>
        <!-- Repeater breadcrumb (with or without item selected) -->
        <template v-else-if="activeFieldDef?.type === 'repeater'">
          <Icon name="chevron-right" :size="10" class="text-muted-foreground" />
          <button
            class="text-sm font-semibold transition-colors"
            :class="isEditingItem ? 'text-muted-foreground hover:text-foreground' : 'text-foreground'"
            @click="goToRepeater"
          >
            {{ activeFieldDef.label }}
          </button>
          <!-- Item breadcrumb (when editing specific item) -->
          <template v-if="isEditingItem">
            <Icon name="chevron-right" :size="10" class="text-muted-foreground" />
            <span class="text-sm font-semibold text-foreground truncate max-w-[120px]">
              {{ activeItemLabel }}
            </span>
          </template>
        </template>
        <!-- Regular field breadcrumb -->
        <template v-else-if="activeFieldDef">
          <Icon name="chevron-right" :size="10" class="text-muted-foreground" />
          <span class="text-sm font-semibold text-foreground">
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
          <div class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Content
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div v-for="field in activeItemSchema" :key="field.key">
                <label class="block text-xs text-muted-foreground mb-1.5">{{ field.label }}</label>

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
                      class="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors"
                      @click="openUploadForItemField(field.key)"
                    >
                      <Icon name="cloud-upload" :size="18" class="text-muted-foreground mb-1" />
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
                      class="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors"
                      @click="openUploadForItemMediaField(field.key)"
                    >
                      <Icon name="cloud-upload" :size="18" class="text-muted-foreground mb-1" />
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

          <!-- Item Style (shared) -->
          <div class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Style
              </span>
              <span class="text-xs text-muted-foreground ml-1">(shared)</span>
            </div>

            <!-- LogoList-specific item styles -->
            <div v-if="selectedSection?.type === 'logoList'" class="flex flex-col gap-4">
              <!-- Width -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Width</label>
                <Slider
                  :model-value="itemStyles.width ?? 120"
                  :min="40"
                  :max="240"
                  unit="px"
                  @update:model-value="updateItemStyle('width', $event)"
                />
              </div>

              <!-- Black & White -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Black & White</label>
                <Toggle
                  :model-value="itemStyles.blackAndWhite ?? false"
                  size="sm"
                  @update:model-value="updateItemStyle('blackAndWhite', $event)"
                />
              </div>

              <!-- Opacity -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Opacity</label>
                <Slider
                  :model-value="itemStyles.opacity ?? 1"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  @update:model-value="updateItemStyle('opacity', $event)"
                />
              </div>
            </div>

            <!-- Default item styles for other sections -->
            <div v-else class="flex flex-col gap-4">
              <!-- Font Size -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Font Size</label>
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
                <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing Y</label>
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
                <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing X</label>
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
                <label class="text-xs text-muted-foreground whitespace-nowrap">Background</label>
                <ColorPicker
                  :model-value="itemStyles.backgroundColor ?? currentTheme.tokens.colors.secondary"
                  swatch-only
                  @update:model-value="updateItemStyle('backgroundColor', $event)"
                />
              </div>

              <!-- Rounded -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Rounded</label>
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
              Delete {{ activeRepeaterDef.label.replace(/s$/, '') }}
            </Button>
          </div>
        </template>

        <!-- Form Inspector (Contact section form) -->
        <template v-else-if="isFormContext">
          <!-- Form Fields List -->
          <div class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Fields
              </span>
            </div>
            <div class="flex flex-col gap-2">
              <div
                v-for="(field, index) in formFields"
                :key="index"
                class="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                :class="{ 'ring-2 ring-primary': activeField === 'form.fields' && activeItemIndex === index }"
                @click="selectFormField(index)"
              >
                <!-- Reorder buttons -->
                <div class="flex flex-col gap-0.5">
                  <button
                    class="w-4 h-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    :disabled="index === 0"
                    @click.stop="moveFormFieldUp(index)"
                  >
                    <Icon name="chevron-up" :size="10" />
                  </button>
                  <button
                    class="w-4 h-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    :disabled="index === formFields.length - 1"
                    @click.stop="moveFormFieldDown(index)"
                  >
                    <Icon name="chevron-down" :size="10" />
                  </button>
                </div>
                <span class="flex-1 text-sm truncate">{{ (field as Record<string, unknown>).name || 'Untitled' }}</span>
                <span class="text-xs text-muted-foreground">{{ (field as Record<string, unknown>).type }}</span>
                <button
                  class="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  @click.stop="removeFormField(index)"
                >
                  <Icon name="app-delete" :size="12" />
                </button>
              </div>
            </div>
          </div>

          <!-- Selected Field Editor -->
          <div v-if="activeField === 'form.fields' && activeItemIndex !== null" class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Field Settings
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div>
                <label class="block text-xs text-muted-foreground mb-1.5">Name</label>
                <Input
                  :model-value="String((formFields[activeItemIndex] as Record<string, unknown>)?.name || '')"
                  type="text"
                  placeholder="Field name"
                  size="sm"
                  variant="filled"
                  @update:model-value="updateFormField(activeItemIndex, 'name', $event)"
                />
              </div>
              <div>
                <label class="block text-xs text-muted-foreground mb-1.5">Type</label>
                <div class="flex gap-1.5">
                  <button
                    v-for="type in ['text', 'email', 'textarea']"
                    :key="type"
                    class="flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors"
                    :class="[
                      (formFields[activeItemIndex] as Record<string, unknown>)?.type === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-border'
                    ]"
                    @click="updateFormField(activeItemIndex, 'type', type)"
                  >
                    {{ type }}
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-xs text-muted-foreground mb-1.5">Placeholder</label>
                <Input
                  :model-value="String((formFields[activeItemIndex] as Record<string, unknown>)?.placeholder || '')"
                  type="text"
                  placeholder="Enter placeholder..."
                  size="sm"
                  variant="filled"
                  @update:model-value="updateFormField(activeItemIndex, 'placeholder', $event)"
                />
              </div>
            </div>
          </div>

          <!-- Input Styles -->
          <div class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Input Styles
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <!-- Background Color -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Background</label>
                <ColorPicker
                  :model-value="String((formInputStyles as Record<string, unknown>).backgroundColor || currentTheme.tokens.colors.secondary)"
                  swatch-only
                  @update:model-value="updateFormInputStyle('backgroundColor', $event)"
                />
              </div>
              <!-- Text Color -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Text Color</label>
                <ColorPicker
                  :model-value="String((formInputStyles as Record<string, unknown>).color || currentTheme.tokens.colors.foreground)"
                  swatch-only
                  @update:model-value="updateFormInputStyle('color', $event)"
                />
              </div>
              <!-- Border Color -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Border Color</label>
                <ColorPicker
                  :model-value="String((formInputStyles as Record<string, unknown>).borderColor || currentTheme.tokens.colors.border)"
                  swatch-only
                  @update:model-value="updateFormInputStyle('borderColor', $event)"
                />
              </div>
              <!-- Border Radius -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Rounded</label>
                <Slider
                  :model-value="((formInputStyles as Record<string, unknown>).borderRadius as number) ?? 8"
                  :min="0"
                  :max="24"
                  unit="px"
                  @update:model-value="updateFormInputStyle('borderRadius', $event)"
                />
              </div>
              <!-- Font Size -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Font Size</label>
                <Slider
                  :model-value="((formInputStyles as Record<string, unknown>).fontSize as number) ?? 16"
                  :min="12"
                  :max="24"
                  unit="px"
                  @update:model-value="updateFormInputStyle('fontSize', $event)"
                />
              </div>
              <!-- Padding -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Padding</label>
                <Slider
                  :model-value="((formInputStyles as Record<string, unknown>).padding as number) ?? 12"
                  :min="4"
                  :max="24"
                  unit="px"
                  @update:model-value="updateFormInputStyle('padding', $event)"
                />
              </div>
            </div>
          </div>

          <!-- Submit Button Settings -->
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Submit Button
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div>
                <label class="block text-xs text-muted-foreground mb-1.5">Label</label>
                <Input
                  :model-value="formSubmitLabel"
                  type="text"
                  placeholder="Send Message"
                  size="sm"
                  variant="filled"
                  @update:model-value="updateField('form.submitLabel', $event)"
                />
              </div>
              <!-- Background Color -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Background</label>
                <ColorPicker
                  :model-value="String((formButtonStyles as Record<string, unknown>).backgroundColor || currentTheme.tokens.colors.primary)"
                  swatch-only
                  @update:model-value="updateFormButtonStyle('backgroundColor', $event)"
                />
              </div>
              <!-- Text Color -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Text Color</label>
                <ColorPicker
                  :model-value="String((formButtonStyles as Record<string, unknown>).color || currentTheme.tokens.colors.primaryForeground)"
                  swatch-only
                  @update:model-value="updateFormButtonStyle('color', $event)"
                />
              </div>
              <!-- Border Radius -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Rounded</label>
                <Slider
                  :model-value="((formButtonStyles as Record<string, unknown>).borderRadius as number) ?? 8"
                  :min="0"
                  :max="24"
                  unit="px"
                  @update:model-value="updateFormButtonStyle('borderRadius', $event)"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Repeater List View (when repeater is selected but no item is active) -->
        <template v-else-if="activeFieldDef?.type === 'repeater' && activeItemIndex === null">
          <div class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {{ activeFieldDef.label }}
              </span>
            </div>
            <div class="flex flex-col gap-2">
              <!-- Items list -->
              <div
                v-for="(item, index) in repeaterItems"
                :key="index"
                class="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                @click="selectRepeaterItem(index)"
              >
                <Icon name="grip-dots-vertical" :size="12" class="text-muted-foreground" />
                <span class="flex-1 text-sm truncate">{{ getRepeaterItemLabel(item, index) }}</span>
                <Icon name="chevron-right" :size="12" class="text-muted-foreground" />
              </div>
            </div>
          </div>

          <!-- Item Styles (shared) -->
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Style
              </span>
              <span class="text-xs text-muted-foreground ml-1">(shared)</span>
            </div>
            <div class="flex flex-col gap-4">
              <!-- Font Size -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Font Size</label>
                <Slider
                  :model-value="itemStyles.fontSize ?? 14"
                  :min="12"
                  :max="24"
                  unit="px"
                  @update:model-value="updateItemStyle('fontSize', $event)"
                />
              </div>
              <!-- Background Color -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Background</label>
                <ColorPicker
                  :model-value="itemStyles.backgroundColor ?? currentTheme.tokens.colors.secondary"
                  swatch-only
                  @update:model-value="updateItemStyle('backgroundColor', $event)"
                />
              </div>
              <!-- Rounded -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Rounded</label>
                <Slider
                  :model-value="itemStyles.borderRadius ?? 8"
                  :min="0"
                  :max="24"
                  unit="px"
                  @update:model-value="updateItemStyle('borderRadius', $event)"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Image Field Editor -->
        <template v-else-if="activeFieldDef && activeFieldDef.type === 'image'">
          <!-- Image Upload -->
          <div class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                  <Icon name="cloud-upload" :size="14" />
                  Replace
                </Button>
                <Button
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

            <!-- Upload buttons (when no image) -->
            <div v-else class="space-y-2">
              <button
                class="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors"
                @click="showUploadModal = true"
              >
                <div class="w-10 h-10 mb-2 rounded-full bg-muted flex items-center justify-center">
                  <Icon name="cloud-upload" :size="20" class="text-muted-foreground" />
                </div>
                <span class="text-sm font-medium text-foreground">Upload Image</span>
                <span class="text-xs text-muted-foreground mt-0.5">JPEG, PNG, WebP - Max 4MB</span>
              </button>
              <Button
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

          <!-- Image Styles -->
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Style
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <!-- Promo section: ONLY show rounded corners -->
              <template v-if="selectedSection?.type === 'promo'">
                <!-- Border Radius -->
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Rounded</label>
                  <Slider
                    :model-value="activeFieldStyles.borderRadius ?? 8"
                    :min="0"
                    :max="32"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('borderRadius', $event)"
                  />
                </div>
              </template>

              <!-- Other sections: show full image styles -->
              <template v-else>
                <!-- Width -->
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Width</label>
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
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing Y</label>
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
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing X</label>
                  <Slider
                    :model-value="activeFieldStyles.spacingX ?? styleDefaults.spacingX.default"
                    :min="styleDefaults.spacingX.min"
                    :max="styleDefaults.spacingX.max"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('spacingX', $event)"
                  />
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Media Field Editor (image or video with type selector) -->
        <template v-else-if="activeFieldDef && activeFieldDef.type === 'media'">
          <!-- Media Type Selector -->
          <div class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
          <div class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                  <Icon name="cloud-upload" :size="14" />
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
                class="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors"
                @click="showUploadModal = true"
              >
                <div class="w-10 h-10 mb-2 rounded-full bg-muted flex items-center justify-center">
                  <Icon name="cloud-upload" :size="20" class="text-muted-foreground" />
                </div>
                <span class="text-sm font-medium text-foreground">
                  Upload {{ getMediaType() === 'video' ? 'Video' : 'Image' }}
                </span>
                <span class="text-xs text-muted-foreground mt-0.5">
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
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Style
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <!-- Promo section: ONLY show rounded corners -->
              <template v-if="selectedSection?.type === 'promo'">
                <!-- Border Radius -->
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Rounded</label>
                  <Slider
                    :model-value="activeFieldStyles.borderRadius ?? 8"
                    :min="0"
                    :max="32"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('borderRadius', $event)"
                  />
                </div>
              </template>

              <!-- Other sections: show full media styles -->
              <template v-else>
                <!-- Spacing Y -->
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing Y</label>
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
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing X</label>
                  <Slider
                    :model-value="activeFieldStyles.spacingX ?? styleDefaults.spacingX.default"
                    :min="styleDefaults.spacingX.min"
                    :max="styleDefaults.spacingX.max"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('spacingX', $event)"
                  />
                </div>

                <!-- Border Radius -->
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Rounded</label>
                  <Slider
                    :model-value="activeFieldStyles.borderRadius ?? 8"
                    :min="0"
                    :max="32"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('borderRadius', $event)"
                  />
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Link Field Editor -->
        <template v-else-if="activeFieldDef && activeFieldDef.type === 'link'">
          <!-- Link Content -->
          <div class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Content
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div>
                <label class="block text-xs text-muted-foreground mb-1.5">Title</label>
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
                <label class="block text-xs text-muted-foreground mb-1.5">URL</label>
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
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Style
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <!-- Font Size -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Font Size</label>
                <Slider
                  :model-value="activeFieldStyles.fontSize ?? styleDefaults.fontSize.default"
                  :min="styleDefaults.fontSize.min"
                  :max="styleDefaults.fontSize.max"
                  unit="px"
                  @update:model-value="updateActiveFieldStyle('fontSize', $event)"
                />
              </div>

              <!-- Spacing Y -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing Y</label>
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
                <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing X</label>
                <Slider
                  :model-value="activeFieldStyles.spacingX ?? styleDefaults.spacingX.default"
                  :min="styleDefaults.spacingX.min"
                  :max="styleDefaults.spacingX.max"
                  unit="px"
                  @update:model-value="updateActiveFieldStyle('spacingX', $event)"
                />
              </div>

              <!-- Background Color -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Background</label>
                <ColorPicker
                  :model-value="activeFieldStyles.backgroundColor ?? currentTheme.tokens.colors.primary"
                  swatch-only
                  @update:model-value="updateActiveFieldStyle('backgroundColor', $event)"
                />
              </div>

              <!-- Color -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Color</label>
                <ColorPicker
                  :model-value="activeFieldStyles.color ?? currentTheme.tokens.colors.primaryForeground"
                  swatch-only
                  @update:model-value="updateActiveFieldStyle('color', $event)"
                />
              </div>

              <!-- Rounded -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Rounded</label>
                <Slider
                  :model-value="activeFieldStyles.borderRadius ?? 8"
                  :min="0"
                  :max="32"
                  unit="px"
                  @update:model-value="updateActiveFieldStyle('borderRadius', $event)"
                />
              </div>

              <!-- Border Width -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Border</label>
                <Slider
                  :model-value="activeFieldStyles.borderWidth ?? 0"
                  :min="0"
                  :max="8"
                  unit="px"
                  @update:model-value="updateActiveFieldStyle('borderWidth', $event)"
                />
              </div>

              <!-- Border Color (only show when borderWidth > 0) -->
              <div v-if="(activeFieldStyles.borderWidth ?? 0) > 0" class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Border Color</label>
                <ColorPicker
                  :model-value="activeFieldStyles.borderColor ?? currentTheme.tokens.colors.border"
                  swatch-only
                  @update:model-value="updateActiveFieldStyle('borderColor', $event)"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Active Field Editor (non-repeater, non-image, non-link) -->
        <template v-else-if="activeFieldDef && activeFieldDef.type !== 'repeater'">
          <!-- Field Content -->
          <div class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Content
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div>
                <label class="block text-xs text-muted-foreground mb-1.5">{{ activeFieldDef.label }}</label>
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
                  <label class="block text-xs text-muted-foreground mb-1.5">URL</label>
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
                  <label class="text-xs text-muted-foreground">Show Button</label>
                  <Toggle
                    :model-value="(sectionData.showButton as boolean) ?? true"
                    @update:model-value="updateField('showButton', $event)"
                  />
                </div>
              </template>
            </div>
          </div>

          <!-- Field Styles -->
          <div class="px-4 py-4">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Style
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <!-- Font Size -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Font Size</label>
                <Slider
                  :model-value="activeFieldStyles.fontSize ?? styleDefaults.fontSize.default"
                  :min="styleDefaults.fontSize.min"
                  :max="styleDefaults.fontSize.max"
                  unit="px"
                  @update:model-value="updateActiveFieldStyle('fontSize', $event)"
                />
              </div>

              <!-- Line Height -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Line Height</label>
                <Slider
                  :model-value="activeFieldStyles.lineHeight ?? styleDefaults.lineHeight.default"
                  :min="styleDefaults.lineHeight.min"
                  :max="styleDefaults.lineHeight.max"
                  :step="styleDefaults.lineHeight.step"
                  @update:model-value="updateActiveFieldStyle('lineHeight', $event)"
                />
              </div>

              <!-- Spacing Y -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing Y</label>
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
                <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing X</label>
                <Slider
                  :model-value="activeFieldStyles.spacingX ?? styleDefaults.spacingX.default"
                  :min="styleDefaults.spacingX.min"
                  :max="styleDefaults.spacingX.max"
                  unit="px"
                  @update:model-value="updateActiveFieldStyle('spacingX', $event)"
                />
              </div>

              <!-- Color -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Color</label>
                <ColorPicker
                  :model-value="activeFieldStyles.color ?? currentTheme.tokens.colors.foreground"
                  swatch-only
                  @update:model-value="updateActiveFieldStyle('color', $event)"
                />
              </div>

              <!-- Button-only styles -->
              <template v-if="activeField === 'buttonText'">
                <!-- Background Color -->
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Background</label>
                  <ColorPicker
                    :model-value="activeFieldStyles.backgroundColor ?? currentTheme.tokens.colors.primary"
                    swatch-only
                    @update:model-value="updateActiveFieldStyle('backgroundColor', $event)"
                  />
                </div>

                <!-- Rounded (border radius) -->
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Rounded</label>
                  <Slider
                    :model-value="activeFieldStyles.borderRadius ?? 8"
                    :min="0"
                    :max="32"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('borderRadius', $event)"
                  />
                </div>

                <!-- Border Width -->
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Border</label>
                  <Slider
                    :model-value="activeFieldStyles.borderWidth ?? 0"
                    :min="0"
                    :max="8"
                    unit="px"
                    @update:model-value="updateActiveFieldStyle('borderWidth', $event)"
                  />
                </div>

                <!-- Border Color (only show when borderWidth > 0) -->
                <div v-if="(activeFieldStyles.borderWidth ?? 0) > 0" class="flex items-center justify-between gap-3">
                  <label class="text-xs text-muted-foreground whitespace-nowrap">Border Color</label>
                  <ColorPicker
                    :model-value="activeFieldStyles.borderColor ?? currentTheme.tokens.colors.border"
                    swatch-only
                    @update:model-value="updateActiveFieldStyle('borderColor', $event)"
                  />
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Section-level controls (only shown when no field is active) -->
        <template v-else-if="!activeFieldDef">
          <!-- Variant Selector -->
          <div class="flex flex-col px-4 py-5 border-b border-border gap-3">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
          <div v-if="styleOptions.length > 0" class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Options
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div v-for="option in styleOptions" :key="option.key">
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs text-muted-foreground whitespace-nowrap">{{ option.label }}</label>
                  <!-- Select type -->
                  <div v-if="option.type === 'select' && option.options" class="flex flex-wrap gap-1.5">
                    <button
                      v-for="opt in option.options"
                      :key="opt.value"
                      class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                      :class="[
                        (sectionStyles[option.key] ?? option.default) === opt.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-border'
                      ]"
                      @click="updateSectionStyle(option.key, opt.value)"
                    >
                      {{ opt.label }}
                    </button>
                  </div>
                  <!-- Toggle type -->
                  <Toggle
                    v-else-if="option.type === 'toggle'"
                    :model-value="(sectionStyles[option.key] as boolean) ?? option.default"
                    @update:model-value="updateSectionStyle(option.key, $event)"
                  />
                </div>
              </div>

              <!-- Promo: Smart Background Opacity (only when smartBackground is enabled) -->
              <div
                v-if="selectedSection?.type === 'promo' && (sectionStyles.smartBackground as boolean)"
                class="flex items-center justify-between gap-3"
              >
                <label class="text-xs text-muted-foreground whitespace-nowrap">Opacity</label>
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
          <div class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Style
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <!-- Background Color -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Background</label>
                <ColorPicker
                  :model-value="sectionStyles.backgroundColor ?? currentTheme.tokens.colors.background"
                  swatch-only
                  @update:model-value="updateSectionStyle('backgroundColor', $event)"
                />
              </div>

              <!-- Space Between (Hero and Promo sections) -->
              <div v-if="selectedSection?.type === 'hero' || selectedSection?.type === 'promo'" class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Space Between</label>
                <Slider
                  :model-value="(sectionStyles.spaceBetween as number) ?? 32"
                  :min="0"
                  :max="96"
                  unit="px"
                  @update:model-value="updateSectionStyle('spaceBetween', $event)"
                />
              </div>

              <!-- Spacing Y -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing Y</label>
                <Slider
                  :model-value="sectionStyles.spacingY ?? styleDefaults.sectionSpacingY.default"
                  :min="styleDefaults.sectionSpacingY.min"
                  :max="styleDefaults.sectionSpacingY.max"
                  unit="px"
                  @update:model-value="updateSectionStyle('spacingY', $event)"
                />
              </div>

              <!-- Spacing X -->
              <div class="flex items-center justify-between gap-3">
                <label class="text-xs text-muted-foreground whitespace-nowrap">Spacing X</label>
                <Slider
                  :model-value="sectionStyles.spacingX ?? styleDefaults.sectionSpacingX.default"
                  :min="styleDefaults.sectionSpacingX.min"
                  :max="styleDefaults.sectionSpacingX.max"
                  unit="px"
                  @update:model-value="updateSectionStyle('spacingX', $event)"
                />
              </div>
            </div>
          </div>

          <!-- Design Options -->
          <div v-if="designFields.length > 0" class="px-4 py-4 border-b border-border">
            <div class="mb-4">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Design Options
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <div v-for="field in designFields" :key="field.key">
                <label class="block text-xs text-muted-foreground mb-1.5">{{ field.label }}</label>
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
        <div class="px-4 py-4 border-b border-border">
          <div class="mb-4">
            <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
        <div class="px-4 py-4 border-b border-border">
          <div class="mb-4">
            <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Colors
            </span>
          </div>

          <div class="flex flex-col gap-3">
            <label
              v-for="color in colorOptions"
              :key="color.key"
              class="flex justify-between gap-1.5"
            >
              <span class="text-xs text-muted-foreground">{{ color.label }}</span>
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
            <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Typography
            </span>
          </div>

          <div class="flex flex-col gap-3">
            <div
              v-for="font in fontOptions"
              :key="font.key"
              class="flex flex-col gap-1.5"
            >
              <span class="text-xs text-muted-foreground">{{ font.label }}</span>
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
