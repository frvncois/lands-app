<script setup lang="ts">
import { computed, ref, defineAsyncComponent, type Component } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { SectionBlockType } from '@/types/editor'
import { useProjectsStore } from '@/stores/projects'
import { useProjectStore } from '@/stores/project'
import { useRoute, RouterLink } from 'vue-router'
import {
  sectionBlockLabels,
  sectionBlockIcons,
  formFieldBlockLabels,
  formInputTypeOptions,
  socialPlatformLabels,
  socialPlatformIcons,
  maxWidthOptions,
  blockHeightOptions,
  alignmentOptions,
  buttonVariantOptions,
  buttonSizeOptions,
  headingLevelOptions,
  isFormFieldBlock,
  generateId,
  // Flexbox options
  justifyContentOptions,
  alignItemsOptions,
  flexDirectionOptions,
  flexWrapOptions,
  justifyItemsOptions,
  // Flex child options
  flexBasisOptions,
  // Opacity & Blend
  mixBlendModeOptions,
  // Mask shapes
  maskShapes,
  maskShapeLabels,
  // Font options
  fontWeightOptions,
} from '@/lib/editor-utils'
import { getStylesForUseCase } from '@/lib/layouts'
import { planHasFeature } from '@/types/project'
import {
  getResponsiveStyles,
  setViewportStyleOverrides,
  hasViewportOverride,
  getInheritedValue,
} from '@/lib/style-utils'
import type {
  PageSettings,
  HeaderSettings,
  HeaderStyles,
  HeaderNavLink,
  FooterSettings,
  FooterStyles,
  FooterLink,
  FooterSocialLink,
  FormSettings,
  FormStyles,
  FormInputSettings,
  FormInputStyles,
  FormTextareaSettings,
  FormTextareaStyles,
  FormSelectSettings,
  FormSelectStyles,
  FormRadioSettings,
  FormRadioStyles,
  FormCheckboxSettings,
  FormCheckboxStyles,
  FormButtonSettings,
  FormButtonStyles,
  FormSelectOption,
  HeadingSettings,
  TextSettings,
  ImageSettings,
  ButtonSettings,
  DividerSettings,
  BaseBlockStyles,
  CoreBlockStyles,
  HeadingStyles,
  TextStyles,
  ImageStyles,
  VideoSettings,
  VideoStyles,
  IconSettings,
  IconStyles,
  VariantsSettings,
  VariantsStyles,
  VariantOptionValue,
  ContainerSettings,
  ContainerStyles,
  GridSettings,
  GridStyles,
  StackSettings,
  StackStyles,
  ButtonStyles,
  AnimationSettings,
  CanvasSettings,
  GoogleFont,
} from '@/types/editor'

import InspectorSection from '@/components/inspector/InspectorSection.vue'
import InspectorField from '@/components/inspector/InspectorField.vue'
import SegmentedControl from '@/components/inspector/SegmentedControl.vue'
import BoxModelInput from '@/components/inspector/BoxModelInput.vue'
import ColorInput from '@/components/inspector/ColorInput.vue'
import SelectInput from '@/components/inspector/SelectInput.vue'
import SliderInput from '@/components/inspector/SliderInput.vue'
import FontSizeSlider from '@/components/inspector/FontSizeSlider.vue'
import TextInput from '@/components/inspector/TextInput.vue'
import ImageInput from '@/components/inspector/ImageInput.vue'
import ToggleInput from '@/components/inspector/ToggleInput.vue'
import BorderInput from '@/components/inspector/BorderInput.vue'
import AnimationSection from '@/components/inspector/AnimationSection.vue'
import SharedStyleField from '@/components/inspector/SharedStyleField.vue'
import InteractionField from '@/components/inspector/InteractionField.vue'
import EditorInteraction from '@/components/inspector/EditorInteraction.vue'
import SpanInspector from '@/components/inspector/SpanInspector.vue'
// New decomposed inspector components (Phase 2 refactoring)
import PageInspector from '@/components/inspector/PageInspector.vue'

// Lazy-loaded block inspectors
const blockInspectorMap: Partial<Record<SectionBlockType, Component>> = {
  heading: defineAsyncComponent(() => import('@/components/inspector/blocks/HeadingInspector.vue')),
  text: defineAsyncComponent(() => import('@/components/inspector/blocks/TextInspector.vue')),
  image: defineAsyncComponent(() => import('@/components/inspector/blocks/ImageInspector.vue')),
  video: defineAsyncComponent(() => import('@/components/inspector/blocks/VideoInspector.vue')),
  button: defineAsyncComponent(() => import('@/components/inspector/blocks/ButtonInspector.vue')),
  divider: defineAsyncComponent(() => import('@/components/inspector/blocks/DividerInspector.vue')),
  icon: defineAsyncComponent(() => import('@/components/inspector/blocks/IconInspector.vue')),
  variants: defineAsyncComponent(() => import('@/components/inspector/blocks/VariantsInspector.vue')),
  container: defineAsyncComponent(() => import('@/components/inspector/blocks/ContainerInspector.vue')),
  grid: defineAsyncComponent(() => import('@/components/inspector/blocks/GridInspector.vue')),
  stack: defineAsyncComponent(() => import('@/components/inspector/blocks/StackInspector.vue')),
  header: defineAsyncComponent(() => import('@/components/inspector/blocks/HeaderInspector.vue')),
  footer: defineAsyncComponent(() => import('@/components/inspector/blocks/FooterInspector.vue')),
  form: defineAsyncComponent(() => import('@/components/inspector/blocks/FormInspector.vue')),
  canvas: defineAsyncComponent(() => import('@/components/inspector/blocks/CanvasInspector.vue')),
  'form-input': defineAsyncComponent(() => import('@/components/inspector/blocks/FormInputInspector.vue')),
  'form-textarea': defineAsyncComponent(() => import('@/components/inspector/blocks/FormTextareaInspector.vue')),
  'form-select': defineAsyncComponent(() => import('@/components/inspector/blocks/FormSelectInspector.vue')),
  'form-radio': defineAsyncComponent(() => import('@/components/inspector/blocks/FormRadioInspector.vue')),
  'form-checkbox': defineAsyncComponent(() => import('@/components/inspector/blocks/FormCheckboxInspector.vue')),
  'form-button': defineAsyncComponent(() => import('@/components/inspector/blocks/FormButtonInspector.vue')),
  // freeform uses container inspector (same layout-style settings)
  freeform: defineAsyncComponent(() => import('@/components/inspector/blocks/ContainerInspector.vue')),
}

// Consolidated helpers (Phase 4)
import { PREBUILT_LIST_NAMES } from '@/stores/editor/helpers'
import ProjectFont from '@/components/modal/ProjectFont.vue'
import ProductVariants from '@/components/modal/ProductVariants.vue'
import SharedStyleCreate from '@/components/modal/SharedStyleCreate.vue'
import InteractionCreate from '@/components/modal/InteractionCreate.vue'
import Icon from '@/components/ui/Icon.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
import Button from '@/components/ui/Button.vue'

const editorStore = useEditorStore()
const projectsStore = useProjectsStore()
const projectStore = useProjectStore()
const route = useRoute()

// Project plan checks
const projectId = computed(() => route.params.projectId as string)
const currentProject = computed(() => projectsStore.getProjectById(projectId.value))
const canUseCustomFonts = computed(() => {
  if (!currentProject.value) return false
  return planHasFeature(currentProject.value.plan, 'customFonts')
})
const canUseCustomCode = computed(() => {
  if (!currentProject.value) return false
  return planHasFeature(currentProject.value.plan, 'customCode')
})

const selectedBlock = computed(() => editorStore.selectedBlock)
const selectedItemId = computed(() => editorStore.selectedItemId)
const selectedSpanId = computed(() => editorStore.selectedSpanId)
const pageSettings = computed(() => editorStore.pageSettings)

// Get the selected span data (when a span is selected)
const selectedSpan = computed(() => {
  if (!selectedSpanId.value || !selectedBlock.value) return null
  return editorStore.getSpanById(selectedBlock.value.id, selectedSpanId.value)
})

// Get the inspector component for the current block type
const CurrentBlockInspector = computed(() => {
  if (!selectedBlock.value) return null
  return blockInspectorMap[selectedBlock.value.type] || null
})
const currentViewport = computed(() => editorStore.viewport)

// SEO settings from project store
const seoSettings = computed(() => projectStore.settings.seo)

// Get responsive styles for the current viewport (merged/cascaded)
const responsiveStyles = computed((): CoreBlockStyles => {
  if (!selectedBlock.value) return {}
  return getResponsiveStyles(selectedBlock.value.styles as BaseBlockStyles, currentViewport.value)
})

// Get effective styles for the block
const effectiveBlockStyles = computed(() => {
  if (!selectedBlock.value) return {}
  return selectedBlock.value.styles as Record<string, unknown>
})

// Check if selected block is inside a List/Collection (Grid > Stack pattern)
const isInListCollection = computed(() => {
  if (!selectedBlock.value) return false
  return editorStore.isInsideListCollection(selectedBlock.value.id)
})

// Check if selected block is inside a flex container (Stack or Container)
const isInFlexContainer = computed(() => {
  if (!selectedBlock.value) return false
  const parent = editorStore.findParentBlock(selectedBlock.value.id)
  return parent?.type === 'stack' || parent?.type === 'container'
})

// PREBUILT_LIST_NAMES is imported from @/stores/editor/helpers

// Check if selected block IS a PREBUILT List/Collection item (Stack directly inside PREBUILT Grid)
// This is different from isInListCollection - this checks if the block itself is the list item
const isListCollectionItem = computed(() => {
  if (!selectedBlock.value) return false
  if (selectedBlock.value.type !== 'stack') return false
  const parent = editorStore.findParentBlock(selectedBlock.value.id)
  // ONLY return true if parent is a PREBUILT Grid
  if (!parent || parent.type !== 'grid') return false
  return PREBUILT_LIST_NAMES.includes(parent.name)
})

// Check if selected block is a direct child of a Grid
const isChildOfGrid = computed(() => {
  if (!selectedBlock.value) return false
  return editorStore.isDirectChildOfGrid(selectedBlock.value.id)
})

// Get the parent grid's column count
const parentGridColumns = computed(() => {
  if (!selectedBlock.value) return null
  return editorStore.getParentGridColumns(selectedBlock.value.id)
})

// Get overwriteStyle setting from selected block
const hasOverwriteStyle = computed(() => {
  if (!selectedBlock.value) return false
  const settings = selectedBlock.value.settings as Record<string, unknown>
  return !!settings.overwriteStyle
})

// Breadcrumb item type
interface BreadcrumbItem {
  id: string | null
  label: string
  icon?: string
}

// Build breadcrumb path from root to selected block
const breadcrumbPath = computed<BreadcrumbItem[]>(() => {
  const path: BreadcrumbItem[] = [{ id: null, label: 'Page', icon: 'app-dashboard' }]

  if (!selectedBlock.value) return path

  // Build ancestry chain
  const ancestors: BreadcrumbItem[] = []
  let currentId: string | null = selectedBlock.value.id

  while (currentId) {
    const block = editorStore.findBlockById(currentId)
    if (!block) break

    ancestors.unshift({
      id: block.id,
      label: block.name || sectionBlockLabels[block.type],
      icon: sectionBlockIcons[block.type]
    })

    const parent = editorStore.findParentBlock(currentId)
    currentId = parent?.id || null
  }

  path.push(...ancestors)

  // Add item if selected (form field, nav link, etc.)
  if (selectedItemId.value && selectedBlock.value) {
    const block = selectedBlock.value
    const settings = block.settings as Record<string, unknown>

    // Header nav link
    if (block.type === 'header' && Array.isArray(settings.navLinks)) {
      const link = (settings.navLinks as HeaderNavLink[]).find(l => l.id === selectedItemId.value)
      if (link) {
        path.push({ id: `item:${link.id}`, label: link.label || 'Nav Link', icon: 'list-link' })
      }
    }

    // Footer link
    if (block.type === 'footer' && Array.isArray(settings.links)) {
      const link = (settings.links as FooterLink[]).find(l => l.id === selectedItemId.value)
      if (link) {
        path.push({ id: `item:${link.id}`, label: link.label || 'Footer Link', icon: 'list-link' })
      }
    }

    // Footer social
    if (block.type === 'footer' && Array.isArray(settings.socialLinks)) {
      const social = (settings.socialLinks as FooterSocialLink[]).find(l => l.id === selectedItemId.value)
      if (social) {
        path.push({ id: `item:${social.id}`, label: socialPlatformLabels[social.platform], icon: socialPlatformIcons[social.platform] })
      }
    }

    // Form field blocks are now child blocks, so they're handled by the parent block traversal above
  }

  // Add span if selected
  if (selectedSpanId.value && selectedSpan.value) {
    path.push({ id: `span:${selectedSpanId.value}`, label: 'Span', icon: 'style-code' })
  }

  return path
})

// Handle breadcrumb click navigation
function handleBreadcrumbClick(item: BreadcrumbItem) {
  if (item.id === null) {
    // Click on Page - deselect everything
    editorStore.selectBlock(null)
    editorStore.selectSpan(null)
  } else if (item.id.startsWith('item:')) {
    // Item is already selected, do nothing
  } else if (item.id.startsWith('span:')) {
    // Span is already selected, do nothing
  } else {
    // Select the block (and deselect span if any)
    editorStore.selectSpan(null)
    editorStore.selectBlock(item.id)
  }
}

// Handle closing the span inspector
function handleCloseSpanInspector() {
  editorStore.selectSpan(null)
}

// Check section types
const isHeaderSection = computed(() => selectedBlock.value?.type === 'header')
const isFooterSection = computed(() => selectedBlock.value?.type === 'footer')
const isFormSection = computed(() => selectedBlock.value?.type === 'form')
const isCanvasSection = computed(() => selectedBlock.value?.type === 'canvas')

// Get selected items from blocks
const selectedHeaderNavLink = computed(() => {
  if (!isHeaderSection.value || !selectedItemId.value) return null
  const settings = selectedBlock.value?.settings as HeaderSettings
  return settings.navLinks.find(l => l.id === selectedItemId.value)
})

const selectedFooterLink = computed(() => {
  if (!isFooterSection.value || !selectedItemId.value) return null
  const settings = selectedBlock.value?.settings as FooterSettings
  return settings.links.find(l => l.id === selectedItemId.value)
})

const selectedFooterSocialLink = computed(() => {
  if (!isFooterSection.value || !selectedItemId.value) return null
  const settings = selectedBlock.value?.settings as FooterSettings
  return settings.socialLinks.find(l => l.id === selectedItemId.value)
})

// Check if selected block is a form field block
const isFormFieldSection = computed(() => {
  return selectedBlock.value ? isFormFieldBlock(selectedBlock.value.type) : false
})

// Layout styles
const currentUseCase = computed(() => pageSettings.value.useCase)
const currentLayoutId = computed(() => pageSettings.value.layoutId)

const layoutStyles = computed(() => {
  if (!currentUseCase.value) return []
  return getStylesForUseCase(currentUseCase.value)
})

const hasLayoutStyles = computed(() => layoutStyles.value.length > 0)

// Update functions
function updatePageSetting<K extends keyof PageSettings>(key: K, value: PageSettings[K]) {
  editorStore.updatePageSettings({ [key]: value })
}

function updateBlockSettings(settings: Record<string, unknown>) {
  if (!selectedBlock.value) return
  editorStore.updateBlockSettings(selectedBlock.value.id, settings)
}

function updateBlockStyles(styles: Record<string, unknown>) {
  if (!selectedBlock.value) return

  // For core styles (padding, margin, background, border, shadow), apply viewport-aware update
  const coreStyleKeys = ['padding', 'margin', 'backgroundColor', 'backgroundImage', 'backgroundPosition', 'backgroundSize', 'border', 'shadow']
  const hasCoreStyles = Object.keys(styles).some(key => coreStyleKeys.includes(key))

  if (hasCoreStyles && currentViewport.value !== 'desktop') {
    // Update only the current viewport's overrides
    const currentStyles = (selectedBlock.value.styles || {}) as BaseBlockStyles
    const updatedStyles = setViewportStyleOverrides(currentStyles, currentViewport.value, styles as Partial<CoreBlockStyles>)
    editorStore.updateBlockStyles(selectedBlock.value.id, updatedStyles as Record<string, unknown>, true) // true = replace entire styles object
  } else {
    // Desktop or non-responsive styles (like animation) - update normally
    editorStore.updateBlockStyles(selectedBlock.value.id, styles)
  }
}

// Toggle overwriteStyle directly on the block (doesn't sync with siblings)
function toggleOverwriteStyle(value: boolean) {
  if (!selectedBlock.value) return
  const block = editorStore.findBlockById(selectedBlock.value.id)
  if (block) {
    (block.settings as Record<string, unknown>).overwriteStyle = value
    editorStore.rebuildBlockIndex()
  }
}

function updateHeaderNavLinkField<K extends keyof HeaderNavLink>(key: K, value: HeaderNavLink[K]) {
  if (!selectedBlock.value || !selectedHeaderNavLink.value) return
  editorStore.updateHeaderNavLink(selectedBlock.value.id, selectedHeaderNavLink.value.id, { [key]: value })
}

function updateFooterLinkField<K extends keyof FooterLink>(key: K, value: FooterLink[K]) {
  if (!selectedBlock.value || !selectedFooterLink.value) return
  editorStore.updateFooterLink(selectedBlock.value.id, selectedFooterLink.value.id, { [key]: value })
}

function updateFooterSocialLinkField<K extends keyof FooterSocialLink>(key: K, value: FooterSocialLink[K]) {
  if (!selectedBlock.value || !selectedFooterSocialLink.value) return
  editorStore.updateFooterSocialLink(selectedBlock.value.id, selectedFooterSocialLink.value.id, { [key]: value })
}

// Form field blocks are now regular blocks, use updateBlockSettings to update them

function handleLayoutStyleClick(layoutId: string) {
  editorStore.applyLayout(layoutId)
}

// Font family options
const fontFamilyOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'system-ui', label: 'System' },
]

// Combined font options (default + custom + Google fonts)
const combinedFontOptions = computed(() => {
  const customFonts = pageSettings.value.customFonts || []
  const googleFonts = pageSettings.value.googleFonts || []

  const customOptions = customFonts.map(font => ({
    value: font.name,
    label: `${font.name} (Custom)`
  }))

  const googleOptions = googleFonts.map(font => ({
    value: font.family,
    label: font.family
  }))

  return [...fontFamilyOptions, ...googleOptions, ...customOptions]
})

// Google Fonts modal state
const showGoogleFontsModal = ref(false)

// Product Variants modal state
const showVariantsModal = ref(false)

// Shared Style create modal state
const showSharedStyleModal = ref(false)

// Interaction create modal state
const showInteractionModal = ref(false)

// Interaction editing state
const editingInteractionId = ref<string | null>(null)
const interactionEditorRef = ref<InstanceType<typeof EditorInteraction> | null>(null)

function handleEditInteraction(interactionId: string) {
  editingInteractionId.value = interactionId
}

function handleCreateInteraction() {
  // Open the modal to name the interaction
  showInteractionModal.value = true
}

function handleInteractionCreated(interactionId: string) {
  // After creation, open editor for the new interaction
  editingInteractionId.value = interactionId
}

function handleCloseInteractionEditor() {
  editingInteractionId.value = null
}

function handleSaveInteraction() {
  interactionEditorRef.value?.save()
}

// Google Fonts handlers
function handleGoogleFontsUpdate(fonts: GoogleFont[]) {
  updatePageSetting('googleFonts', fonts)
}

function removeGoogleFont(family: string) {
  const currentFonts = pageSettings.value.googleFonts || []
  updatePageSetting('googleFonts', currentFonts.filter(f => f.family !== family))
}

// Font upload ref and handlers
const fontInputRef = ref<HTMLInputElement | null>(null)

function triggerFontUpload() {
  fontInputRef.value?.click()
}

async function handleFontUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Get font name from filename (remove extension)
  const fontName = file.name.replace(/\.(woff2?|ttf|otf)$/i, '')

  // Create a URL for the font file (in production, upload to storage)
  const fontUrl = URL.createObjectURL(file)

  // Add to custom fonts
  const newFont = {
    id: generateId(),
    name: fontName,
    url: fontUrl
  }

  const currentFonts = pageSettings.value.customFonts || []
  updatePageSetting('customFonts', [...currentFonts, newFont])

  // Reset input
  input.value = ''
}

function removeCustomFont(fontId: string) {
  const currentFonts = pageSettings.value.customFonts || []
  const updatedFonts = currentFonts.filter(f => f.id !== fontId)
  updatePageSetting('customFonts', updatedFonts)

  // If the removed font was selected, reset to default
  const removedFont = currentFonts.find(f => f.id === fontId)
  if (removedFont && pageSettings.value.fontFamily === removedFont.name) {
    updatePageSetting('fontFamily', 'Inter')
  }
}

// Hovered breadcrumb item for expand animation
const hoveredBreadcrumbId = ref<string | null>(null)

// ============================================
// TRANSLATION-AWARE CONTENT HELPERS
// ============================================

// Get display value for translatable content fields
function getTranslatableContent(field: 'content' | 'label' | 'attribution' | 'source' | 'submitLabel' | 'placeholder' | 'buttonLabel' | 'copyrightText' | 'ctaButtonLabel', fallback: string = ''): string {
  if (!selectedBlock.value) return fallback

  // If editing a translation, get from translations
  if (editorStore.isEditingTranslation && editorStore.currentLanguage) {
    const langTranslations = editorStore.translations.languages[editorStore.currentLanguage]
    const blockTranslation = langTranslations?.blocks[selectedBlock.value.id]
    if (blockTranslation && (blockTranslation as Record<string, unknown>)[field] !== undefined) {
      return (blockTranslation as Record<string, unknown>)[field] as string
    }
  }

  // Otherwise return source content
  const settings = selectedBlock.value.settings as Record<string, unknown>
  return (settings[field] as string) ?? fallback
}

// Update translatable content - routes to translation or source based on mode
function updateTranslatableContent(field: 'content' | 'label' | 'attribution' | 'source' | 'submitLabel' | 'placeholder' | 'buttonLabel' | 'copyrightText' | 'ctaButtonLabel', value: string) {
  if (!selectedBlock.value) return

  if (editorStore.isEditingTranslation) {
    // Update translation
    editorStore.updateBlockTranslation(selectedBlock.value.id, field, value)
  } else {
    // Update source content
    updateBlockSettings({ [field]: value })
  }
}

// For header CTA button label
function getHeaderCtaLabel(): string {
  if (!selectedBlock.value || selectedBlock.value.type !== 'header') return ''
  const settings = selectedBlock.value.settings as HeaderSettings

  if (editorStore.isEditingTranslation && editorStore.currentLanguage) {
    const langTranslations = editorStore.translations.languages[editorStore.currentLanguage]
    const blockTranslation = langTranslations?.blocks[selectedBlock.value.id]
    if (blockTranslation?.ctaButtonLabel !== undefined) {
      return blockTranslation.ctaButtonLabel
    }
  }

  return settings.ctaButton?.label ?? ''
}

function updateHeaderCtaLabel(value: string) {
  if (!selectedBlock.value || selectedBlock.value.type !== 'header') return
  const settings = selectedBlock.value.settings as HeaderSettings

  if (editorStore.isEditingTranslation) {
    editorStore.updateBlockTranslation(selectedBlock.value.id, 'ctaButtonLabel', value)
  } else {
    updateBlockSettings({ ctaButton: { ...settings.ctaButton, label: value } })
  }
}

// For header nav link labels
function getNavLinkLabel(linkId: string): string {
  if (!selectedBlock.value || selectedBlock.value.type !== 'header') return ''
  const settings = selectedBlock.value.settings as HeaderSettings
  const link = settings.navLinks.find(l => l.id === linkId)
  if (!link) return ''

  if (editorStore.isEditingTranslation && editorStore.currentLanguage) {
    const langTranslations = editorStore.translations.languages[editorStore.currentLanguage]
    const blockTranslation = langTranslations?.blocks[selectedBlock.value.id]
    const translatedLink = blockTranslation?.navLinks?.find(l => l.id === linkId)
    if (translatedLink?.label !== undefined) {
      return translatedLink.label
    }
  }

  return link.label
}

function updateNavLinkLabel(linkId: string, value: string) {
  if (!selectedBlock.value || selectedBlock.value.type !== 'header') return

  if (editorStore.isEditingTranslation) {
    editorStore.updateTranslatedNavLinkLabel(selectedBlock.value.id, linkId, value)
  } else {
    updateHeaderNavLinkField('label', value)
  }
}

// For footer link labels
function getFooterLinkLabel(linkId: string): string {
  if (!selectedBlock.value || selectedBlock.value.type !== 'footer') return ''
  const settings = selectedBlock.value.settings as FooterSettings
  const link = settings.links.find(l => l.id === linkId)
  if (!link) return ''

  if (editorStore.isEditingTranslation && editorStore.currentLanguage) {
    const langTranslations = editorStore.translations.languages[editorStore.currentLanguage]
    const blockTranslation = langTranslations?.blocks[selectedBlock.value.id]
    const translatedLink = blockTranslation?.footerLinks?.find(l => l.id === linkId)
    if (translatedLink?.label !== undefined) {
      return translatedLink.label
    }
  }

  return link.label
}

function updateFooterLinkLabel(linkId: string, value: string) {
  if (!selectedBlock.value || selectedBlock.value.type !== 'footer') return

  if (editorStore.isEditingTranslation) {
    editorStore.updateTranslatedFooterLinkLabel(selectedBlock.value.id, linkId, value)
  } else {
    updateFooterLinkField('label', value)
  }
}

// ============================================
// ANIMATION HELPERS
// ============================================

// Get animation settings from selected block
const blockAnimation = computed(() => {
  if (!selectedBlock.value) return undefined
  return (selectedBlock.value.styles as BaseBlockStyles).animation
})

// Update animation settings
function updateBlockAnimation(animation: AnimationSettings) {
  if (!selectedBlock.value) return
  updateBlockStyles({ animation })
}

// Trigger animation preview in the editor
function handleAnimationPreview() {
  if (!selectedBlock.value) return
  editorStore.triggerAnimationPreview(selectedBlock.value.id)
}

// Check if block supports animation (exclude header/footer which are special)
const blockSupportsAnimation = computed(() => {
  if (!selectedBlock.value) return false
  const type = selectedBlock.value.type
  return type !== 'header' && type !== 'footer'
})
</script>

<template>
  <aside
    class="group/inspector relative flex flex-col h-full bg-sidebar-background transition-[width] duration-300 ease-out"
    style="overflow-x: hidden !important;"
    :class="editorStore.isInspectorCollapsed ? 'w-16' : 'w-65'"
  >
    <!-- Left border toggle handle -->
    <div
      class="absolute top-0 left-0 w-1 h-full cursor-ew-resize z-10 transition-colors hover:bg-primary/50 active:bg-primary"
      :class="editorStore.isInspectorCollapsed ? 'bg-transparent group-hover/inspector:bg-sidebar-border' : 'bg-sidebar-border group-hover/inspector:bg-sidebar-foreground/20'"
      @click="editorStore.toggleInspector"
    >
      <div class="absolute top-1/2 -translate-y-1/2 -left-1.5 w-4 h-8 flex items-center justify-center opacity-0 group-hover/inspector:opacity-100 transition-opacity pointer-events-none">
        <div class="w-1 h-6 rounded-full bg-primary/50"></div>
      </div>
    </div>

    <!-- Collapsed state -->
    <div v-if="editorStore.isInspectorCollapsed" class="flex flex-col items-center py-2 gap-1 pl-1">
      <button
        class="p-1.5 rounded-md transition-colors"
        :class="[
          !selectedBlock
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        ]"
        @click="editorStore.selectBlock(null)"
      >
        <Tooltip text="Page" position="left">
          <Icon name="home-2" class="text-sm" />
        </Tooltip>
      </button>
      <div class="w-6 border-t border-sidebar-border my-1"></div>
      <button
        v-for="block in editorStore.blocks"
        :key="block.id"
        class="p-1.5 rounded-md transition-colors"
        :class="[
          editorStore.selectedBlockId === block.id
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        ]"
        @click="editorStore.selectBlock(block.id)"
      >
        <Tooltip :text="block.name" position="left">
          <Icon :name="sectionBlockIcons[block.type]" :size="14" />
        </Tooltip>
      </button>
    </div>

    <!-- Expanded state -->
    <template v-else>
      <!-- Header with Breadcrumb -->
      <div class="flex items-center h-12 px-3 border-b border-sidebar-border gap-2 ml-1">
        <!-- Interaction Editor Breadcrumb -->
        <template v-if="editingInteractionId">
          <div class="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold bg-accent text-foreground">
            <Icon name="style-interactions" :size="10" />
            <span>Interaction</span>
          </div>
          <div class="flex-1" />
          <div class="flex items-center gap-1">
            <Button variant="ghost" size="sm" @click="handleCloseInteractionEditor">Cancel</Button>
            <Button size="sm" @click="handleSaveInteraction">Save</Button>
          </div>
        </template>

        <!-- Normal Breadcrumb navigation -->
        <nav v-else class="flex items-center gap-1 min-w-0 flex-1">
          <template v-for="(item, index) in breadcrumbPath" :key="item.id ?? 'page'">
            <!-- Separator -->
            <i
              v-if="index > 0"
              class="text-[10px] text-muted-foreground/50 shrink-0"
            ></i>
            <!-- Previous items: icon only, expands on hover -->
            <button
              v-if="index < breadcrumbPath.length - 1"
              class="flex items-center h-6 rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 ease-out shrink-0 overflow-hidden"
              :class="hoveredBreadcrumbId === (item.id ?? 'page') ? 'px-2 gap-1.5' : 'w-6 justify-center'"
              @mouseenter="hoveredBreadcrumbId = item.id ?? 'page'"
              @mouseleave="hoveredBreadcrumbId = null"
              @click="handleBreadcrumbClick(item)"
            >
              <Icon v-if="item.icon" :name="item.icon" :size="14" class="shrink-0" />
              <span
                class="text-xs font-medium truncate max-w-24 transition-all duration-200 ease-out"
                :class="hoveredBreadcrumbId === (item.id ?? 'page') ? 'opacity-100 w-auto' : 'opacity-0 w-0'"
              >{{ item.label }}</span>
            </button>
            <!-- Current item: icon + label + state dropdown if applicable -->
            <div
              v-else
              class="relative flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold shrink-0 bg-accent text-foreground"
            >
              <Icon v-if="item.icon" :name="item.icon" :size="10" />
              <span class="truncate max-w-32">{{ item.label }}</span>
            </div>
          </template>
        </nav>
      </div>

      <!-- Settings content -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden">
        <!-- Page Settings (when nothing selected) -->
        <PageInspector v-if="!selectedBlock" />

        <!-- Header Nav Link Inspector -->
        <template v-else-if="selectedHeaderNavLink">
          <InspectorSection title="Navigation Link" icon="list-link">
            <InspectorField label="Label">
              <TextInput
                :model-value="getNavLinkLabel(selectedHeaderNavLink.id)"
                placeholder="Link text"
                @update:model-value="updateNavLinkLabel(selectedHeaderNavLink.id, $event)"
              />
            </InspectorField>
            <InspectorField label="URL">
              <TextInput
                :model-value="selectedHeaderNavLink.url"
                placeholder="https://..."
                @update:model-value="updateHeaderNavLinkField('url', $event)"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Footer Link Inspector -->
        <template v-else-if="selectedFooterLink">
          <InspectorSection title="Footer Link" icon="list-link">
            <InspectorField label="Label">
              <TextInput
                :model-value="getFooterLinkLabel(selectedFooterLink.id)"
                placeholder="Link text"
                @update:model-value="updateFooterLinkLabel(selectedFooterLink.id, $event)"
              />
            </InspectorField>
            <InspectorField label="URL">
              <TextInput
                :model-value="selectedFooterLink.url"
                placeholder="https://..."
                @update:model-value="updateFooterLinkField('url', $event)"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Footer Social Link Inspector -->
        <template v-else-if="selectedFooterSocialLink">
          <InspectorSection title="Social Link" icon="list-link">
            <InspectorField label="Platform">
              <div class="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md">
                <span class="text-sm text-foreground">{{ socialPlatformLabels[selectedFooterSocialLink.platform] }}</span>
              </div>
            </InspectorField>
            <InspectorField label="URL">
              <TextInput
                :model-value="selectedFooterSocialLink.url"
                placeholder="https://..."
                @update:model-value="updateFooterSocialLinkField('url', $event)"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Span Inspector (when a span is selected) -->
        <template v-else-if="selectedSpan && selectedBlock">
          <SpanInspector
            :block-id="selectedBlock.id"
            :span-id="selectedSpanId!"
            @close="handleCloseSpanInspector"
          />
        </template>

        <!-- Block Inspector (lazy-loaded components) -->
        <template v-else-if="CurrentBlockInspector && selectedBlock">
          <!-- Interaction Editor (when editing an interaction) -->
          <EditorInteraction
            v-if="editingInteractionId"
            ref="interactionEditorRef"
            :interaction-id="editingInteractionId"
            :trigger-block-id="selectedBlock.id"
            @close="handleCloseInteractionEditor"
            @created="handleCloseInteractionEditor"
          />

          <!-- Normal Block Inspector (when not editing interaction) -->
          <template v-else>
            <!-- Content Section with Shared Style and Interaction (for ALL blocks) -->
            <InspectorSection title="Content" icon="layout-grid">
              <SharedStyleField
                :block-id="selectedBlock.id"
                :block-type="selectedBlock.type"
                @open-create-modal="showSharedStyleModal = true"
              />
              <InteractionField
                :block-id="selectedBlock.id"
                @edit="handleEditInteraction"
                @create="handleCreateInteraction"
              />
            </InspectorSection>

            <!-- Dynamic Block Inspector -->
            <Suspense>
              <component :is="CurrentBlockInspector" />
            </Suspense>
          </template>
        </template>

        <!-- Common sections for all blocks (Grid Placement, Flex Child, Animation, Dev tool) -->
        <template v-else-if="selectedBlock">
          <!-- Grid Placement Section (only for direct children of Grid) -->
          <InspectorSection v-if="isChildOfGrid" title="Grid Placement" icon="layout-grid">
            <InspectorField label="Column Span" horizontal>
              <SliderInput
                :model-value="String((selectedBlock.settings as Record<string, unknown>).gridColumnSpan || 1)"
                :min="1"
                :max="parentGridColumns || 4"
                :step="1"
                unit=""
                @update:model-value="updateBlockSettings({ gridColumnSpan: parseInt($event) })"
              />
            </InspectorField>
            <InspectorField label="Row Span" horizontal>
              <SliderInput
                :model-value="String((selectedBlock.settings as Record<string, unknown>).gridRowSpan || 1)"
                :min="1"
                :max="6"
                :step="1"
                unit=""
                @update:model-value="updateBlockSettings({ gridRowSpan: parseInt($event) })"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Flex Child Section (for blocks inside Stack/Container) -->
          <InspectorSection v-if="isInFlexContainer" title="Flex Child" icon="layout-grid">
            <InspectorField label="Grow" horizontal>
              <SliderInput
                :model-value="responsiveStyles.flexGrow || '0'"
                :min="0"
                :max="5"
                :step="1"
                unit=""
                @update:model-value="updateBlockStyles({ flexGrow: $event })"
              />
            </InspectorField>
            <InspectorField label="Shrink" horizontal>
              <SliderInput
                :model-value="responsiveStyles.flexShrink || '1'"
                :min="0"
                :max="5"
                :step="1"
                unit=""
                @update:model-value="updateBlockStyles({ flexShrink: $event })"
              />
            </InspectorField>
            <InspectorField label="Basis" horizontal>
              <SelectInput
                :model-value="responsiveStyles.flexBasis || 'auto'"
                :options="flexBasisOptions"
                @update:model-value="updateBlockStyles({ flexBasis: $event })"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Spacing Section (common to all blocks) -->
          <InspectorSection title="Spacing" icon="style-justify-between">
              <BoxModelInput
                :margin="responsiveStyles.margin"
                :padding="responsiveStyles.padding"
                @update:margin="updateBlockStyles({ margin: $event })"
                @update:padding="updateBlockStyles({ padding: $event })"
              />
          </InspectorSection>

          <!-- Border Section (common to all blocks) -->
          <InspectorSection title="Border" icon="style-border-top">
            <BorderInput
              :model-value="responsiveStyles.border"
              @update:model-value="updateBlockStyles({ border: $event })"
            />
          </InspectorSection>

          <!-- Opacity Section (common to all blocks) -->
          <InspectorSection title="Opacity" icon="app-show">
            <InspectorField label="Opacity" horizontal>
              <SliderInput
                :model-value="responsiveStyles.opacity || '100'"
                :min="0"
                :max="100"
                :step="5"
                unit="%"
                @update:model-value="updateBlockStyles({ opacity: $event })"
              />
            </InspectorField>
            <InspectorField label="Blend Mode" horizontal>
              <SelectInput
                :model-value="responsiveStyles.mixBlendMode || 'normal'"
                :options="mixBlendModeOptions"
                @update:model-value="updateBlockStyles({ mixBlendMode: $event })"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Animation Section (common to most blocks, not header/footer) -->
          <AnimationSection
            v-if="blockSupportsAnimation"
            :model-value="blockAnimation"
            @update:model-value="updateBlockAnimation"
            @preview="handleAnimationPreview"
          />

          <!-- Dev Tool Section (shows applied styles) -->
          <InspectorSection title="Dev tool" icon="code">
            <div class="px-3 pb-3">
              <pre class="text-xxs font-mono bg-secondary/50 rounded p-2 overflow-auto max-h-48 text-foreground/70">{{ JSON.stringify(responsiveStyles, null, 2) }}</pre>
            </div>
          </InspectorSection>
        </template>
      </div>
    </template>
  </aside>

  <!-- Google Fonts Modal -->
  <ProjectFont
    :open="showGoogleFontsModal"
    :selected-fonts="pageSettings.googleFonts || []"
    @update:open="showGoogleFontsModal = $event"
    @update:selected-fonts="handleGoogleFontsUpdate"
  />

  <!-- Product Variants Modal -->
  <ProductVariants
    v-if="selectedBlock?.type === 'variants'"
    :open="showVariantsModal"
    :settings="(selectedBlock.settings as VariantsSettings)"
    @update:open="showVariantsModal = $event"
    @update:settings="updateBlockSettings($event)"
  />

  <!-- Shared Style Create Modal -->
  <SharedStyleCreate
    v-if="selectedBlock"
    :open="showSharedStyleModal"
    :block-id="selectedBlock.id"
    :block-type="selectedBlock.type"
    @update:open="showSharedStyleModal = $event"
  />

  <!-- Interaction Create Modal -->
  <InteractionCreate
    v-if="selectedBlock"
    :open="showInteractionModal"
    :block-id="selectedBlock.id"
    :block-type="selectedBlock.type"
    @update:open="showInteractionModal = $event"
    @created="handleInteractionCreated"
  />
</template>
