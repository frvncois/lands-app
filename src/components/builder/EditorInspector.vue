<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
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
import StateField from '@/components/inspector/StateField.vue'
import ProjectFont from '@/components/modal/ProjectFont.vue'
import ProductVariants from '@/components/modal/ProductVariants.vue'
import SharedStyleCreate from '@/components/modal/SharedStyleCreate.vue'
import Icon from '@/components/ui/Icon.vue'
import Tooltip from '@/components/ui/Tooltip.vue'

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
const pageSettings = computed(() => editorStore.pageSettings)
const currentViewport = computed(() => editorStore.viewport)

// SEO settings from project store
const seoSettings = computed(() => projectStore.settings.seo)

// Get responsive styles for the current viewport (merged/cascaded)
const responsiveStyles = computed((): CoreBlockStyles => {
  if (!selectedBlock.value) return {}
  return getResponsiveStyles(selectedBlock.value.styles as BaseBlockStyles, currentViewport.value)
})

// Get the current style state from the editor store
const currentStyleState = computed(() => editorStore.currentStyleState)

// Get effective styles for the current state (base styles + state overrides merged)
// When editing a state (hover/pressed/focused), show that state's values
// When editing 'none', show base styles
const effectiveBlockStyles = computed(() => {
  if (!selectedBlock.value) return {}
  const baseStyles = selectedBlock.value.styles as Record<string, unknown>

  // If editing base styles ('none'), return base styles directly
  if (currentStyleState.value === 'none') {
    return baseStyles
  }

  // If editing a state, merge base styles with state overrides
  // State values take precedence over base values
  const stateStyles = baseStyles[currentStyleState.value] as Record<string, unknown> | undefined
  if (!stateStyles) {
    // No state overrides yet, return base styles
    return baseStyles
  }

  // Merge: state styles override base styles
  return { ...baseStyles, ...stateStyles }
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

// Prebuilt list/collection names - ONLY these get "Overwrite Style" option
const PREBUILT_LIST_NAMES = [
  'Link List',
  'Product List',
  'Card List',
  'Feature List',
  'Social List',
  'Testimonials',
  'Menus List',
  'FAQ List',
  'Gallery',
]

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

  return path
})

// Handle breadcrumb click navigation
function handleBreadcrumbClick(item: BreadcrumbItem) {
  if (item.id === null) {
    // Click on Page - deselect everything
    editorStore.selectBlock(null)
  } else if (item.id.startsWith('item:')) {
    // Item is already selected, do nothing
  } else {
    // Select the block
    editorStore.selectBlock(item.id)
  }
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
        <!-- Breadcrumb navigation -->
        <nav class="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
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
            <!-- Current item: icon + label -->
            <div
              v-else
              class="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold text-foreground bg-accent shrink-0"
            >
              <Icon v-if="item.icon" :name="item.icon" :size="10" />
              <span class="truncate max-w-32">{{ item.label }}</span>
            </div>
          </template>
        </nav>
      </div>

      <!-- Settings content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Page Settings (when nothing selected) -->
        <template v-if="!selectedBlock">
          <!-- Layout Styles -->
          <InspectorSection v-if="hasLayoutStyles" title="Layout Style" icon="layout-stack">
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="layout in layoutStyles"
                :key="layout.id"
                class="relative flex items-center gap-3 p-2 rounded-lg border transition-colors text-left"
                :class="currentLayoutId === layout.id
                  ? 'border-primary bg-primary/5'
                  : 'border-sidebar-border hover:border-primary/50 hover:bg-accent/50'"
                @click="handleLayoutStyleClick(layout.id)"
              >
                <div
                  class="w-10 h-10 shrink-0 rounded-md border border-sidebar-border/50"
                  :style="{ backgroundColor: layout.pageSettings.backgroundColor }"
                />
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-medium text-foreground block truncate">{{ layout.name }}</span>
                  <span class="text-[10px] text-muted-foreground block truncate">{{ layout.description }}</span>
                </div>
                <div v-if="currentLayoutId === layout.id" class="w-2 h-2 rounded-full bg-primary shrink-0"></div>
              </button>
            </div>
          </InspectorSection>

          <!-- SEO Settings -->
          <InspectorSection title="SEO" icon="app-seo">
            <InspectorField label="Meta Title">
              <TextInput
                :model-value="seoSettings.metaTitle || ''"
                placeholder="Page title for search engines"
                @update:model-value="projectStore.updateSEO({ metaTitle: $event })"
              />
            </InspectorField>
            <InspectorField label="Meta Description">
              <textarea
                :value="seoSettings.metaDescription || ''"
                placeholder="Brief description for search results..."
                rows="2"
                class="w-full px-3 py-2 text-xs bg-secondary border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                @input="projectStore.updateSEO({ metaDescription: ($event.target as HTMLTextAreaElement).value })"
              />
            </InspectorField>
            <InspectorField label="Keywords">
              <TextInput
                :model-value="seoSettings.keywords || ''"
                placeholder="keyword1, keyword2, keyword3"
                @update:model-value="projectStore.updateSEO({ keywords: $event })"
              />
            </InspectorField>
            <InspectorField label="OG Image">
              <ImageInput
                :model-value="seoSettings.ogImage || ''"
                placeholder="Social share image URL"
                @update:model-value="projectStore.updateSEO({ ogImage: $event })"
              />
            </InspectorField>
            <InspectorField label="Favicon">
              <ImageInput
                :model-value="seoSettings.favicon || ''"
                placeholder="Favicon URL"
                @update:model-value="projectStore.updateSEO({ favicon: $event })"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Typography -->
          <InspectorSection title="Typography" icon="content-heading">
            <InspectorField label="Base Size" horizontal>
              <SliderInput
                :model-value="pageSettings.baseFontSize || '16'"
                :min="12"
                :max="24"
                :step="1"
                unit="px"
                @update:model-value="updatePageSetting('baseFontSize', $event)"
              />
            </InspectorField>
            <InspectorField label="Font Family" horizontal>
              <SelectInput
                :options="combinedFontOptions"
                :model-value="pageSettings.fontFamily || 'Inter'"
                @update:model-value="updatePageSetting('fontFamily', $event)"
              />
            </InspectorField>
            <!-- Google Fonts (available for all plans) -->
            <InspectorField label="Google Fonts">
              <div class="space-y-2">
                <div
                  v-for="font in pageSettings.googleFonts || []"
                  :key="font.family"
                  class="flex items-center gap-2 p-2 bg-secondary rounded-md"
                >
                  <span class="flex-1 text-xs text-foreground truncate">{{ font.family }}</span>
                  <span class="text-[10px] text-muted-foreground capitalize">{{ font.category }}</span>
                  <button
                    type="button"
                    class="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    @click="removeGoogleFont(font.family)"
                  >
                    <Icon name="xmark" class="text-xs" />
                  </button>
                </div>
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 w-full py-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:bg-secondary/50 transition-colors"
                  @click="showGoogleFontsModal = true"
                >
                  <Icon name="google" class="text-xs" />
                  Browse Google Fonts
                </button>
              </div>
            </InspectorField>
            <!-- Custom Font Upload (Pro only) -->
            <template v-if="canUseCustomFonts">
              <InspectorField label="Custom Fonts">
                <div class="space-y-2">
                  <div
                    v-for="font in pageSettings.customFonts || []"
                    :key="font.id"
                    class="flex items-center gap-2 p-2 bg-secondary rounded-md"
                  >
                    <span class="flex-1 text-xs text-foreground truncate">{{ font.name }}</span>
                    <button
                      type="button"
                      class="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      @click="removeCustomFont(font.id)"
                    >
                      <Icon name="xmark" class="text-xs" />
                    </button>
                  </div>
                  <button
                    type="button"
                    class="flex items-center justify-center gap-2 w-full py-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:bg-secondary/50 transition-colors"
                    @click="triggerFontUpload"
                  >
                    <Icon name="upload" class="text-xs" />
                    Upload Font
                  </button>
                  <input
                    ref="fontInputRef"
                    type="file"
                    accept=".woff,.woff2,.ttf,.otf"
                    class="hidden"
                    @change="handleFontUpload"
                  />
                </div>
              </InspectorField>
            </template>
            <!-- Pro upgrade prompt for custom font uploads -->
            <div v-else class="p-3 bg-muted/50 rounded-lg">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="crown" class="text-amber-500 text-sm" />
                <span class="text-xs font-medium text-foreground">Custom Fonts</span>
                <span class="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-full font-medium">Pro</span>
              </div>
              <p class="text-[11px] text-muted-foreground mb-2">
                Upload your own custom fonts with Pro.
              </p>
              <RouterLink
                :to="{ name: 'settings', params: { projectId } }"
                class="text-[11px] text-primary hover:underline"
              >
                Upgrade to Pro
              </RouterLink>
            </div>
            <InspectorField label="Text Color" horizontal>
              <ColorInput
                :model-value="pageSettings.textColor"
                swatch-only
                @update:model-value="updatePageSetting('textColor', $event)"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Background -->
          <InspectorSection title="Background" icon="style-color">
            <InspectorField label="Color" horizontal>
              <ColorInput
                :model-value="pageSettings.backgroundColor"
                swatch-only
                @update:model-value="updatePageSetting('backgroundColor', $event)"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Custom Code (Pro only) -->
          <template v-if="canUseCustomCode">
            <InspectorSection title="Custom CSS" icon="app-settings">
              <InspectorField label="Styles">
                <textarea
                  :value="pageSettings.customCSS || ''"
                  placeholder="/* Add your custom CSS here */&#10;.my-class {&#10;  color: red;&#10;}"
                  rows="6"
                  class="w-full px-3 py-2 text-xs font-mono bg-secondary border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  @input="updatePageSetting('customCSS', ($event.target as HTMLTextAreaElement).value)"
                />
              </InspectorField>
              <p class="px-3 text-[10px] text-muted-foreground">
                Custom styles will be injected into the page &lt;head&gt;.
              </p>
            </InspectorSection>

            <InspectorSection title="Custom Scripts" icon="app-settings">
              <InspectorField label="Header Script">
                <textarea
                  :value="pageSettings.customHeaderScript || ''"
                  placeholder="<!-- Scripts added to <head> -->&#10;<script>&#10;  // Your code here&#10;</script>"
                  rows="5"
                  class="w-full px-3 py-2 text-xs font-mono bg-secondary border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  @input="updatePageSetting('customHeaderScript', ($event.target as HTMLTextAreaElement).value)"
                />
              </InspectorField>
              <InspectorField label="Footer Script">
                <textarea
                  :value="pageSettings.customFooterScript || ''"
                  placeholder="<!-- Scripts added before </body> -->&#10;<script>&#10;  // Your code here&#10;</script>"
                  rows="5"
                  class="w-full px-3 py-2 text-xs font-mono bg-secondary border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  @input="updatePageSetting('customFooterScript', ($event.target as HTMLTextAreaElement).value)"
                />
              </InspectorField>
              <p class="px-3 text-[10px] text-muted-foreground">
                Add tracking codes, analytics, or custom JavaScript.
              </p>
            </InspectorSection>
          </template>
          <!-- Pro upgrade prompt for custom code -->
          <div v-else class="mx-3 mb-3 p-3 bg-muted/50 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <Icon name="code-1" class="text-amber-500 text-sm" />
              <span class="text-xs font-medium text-foreground">Custom Code</span>
              <span class="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-full font-medium">Pro</span>
            </div>
            <p class="text-[11px] text-muted-foreground mb-2">
              Add custom CSS and JavaScript to your page with Pro.
            </p>
            <RouterLink
              :to="{ name: 'settings', params: { projectId } }"
              class="text-[11px] text-primary hover:underline"
            >
              Upgrade to Pro
            </RouterLink>
          </div>
        </template>

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

        <!-- Form Field Block Inspectors -->
        <!-- Form Input -->
        <template v-else-if="selectedBlock?.type === 'form-input'">
          <InspectorSection title="Input Settings" icon="content-form">
            <InspectorField label="Label">
              <TextInput
                :model-value="(selectedBlock.settings as FormInputSettings).label"
                placeholder="Field label"
                @update:model-value="updateBlockSettings({ label: $event })"
              />
            </InspectorField>
            <InspectorField label="Input Type">
              <SelectInput
                :model-value="(selectedBlock.settings as FormInputSettings).inputType"
                :options="formInputTypeOptions"
                @update:model-value="updateBlockSettings({ inputType: $event })"
              />
            </InspectorField>
            <InspectorField label="Placeholder">
              <TextInput
                :model-value="(selectedBlock.settings as FormInputSettings).placeholder"
                placeholder="Placeholder text"
                @update:model-value="updateBlockSettings({ placeholder: $event })"
              />
            </InspectorField>
            <div class="px-3">
              <ToggleInput
                :model-value="(selectedBlock.settings as FormInputSettings).required"
                label="Required field"
                @update:model-value="updateBlockSettings({ required: $event })"
              />
            </div>
          </InspectorSection>
          <InspectorSection title="Style" icon="style-color">
            <InspectorField label="Font Size" horizontal>
              <FontSizeSlider
                :model-value="(selectedBlock.styles as FormInputStyles).fontSize || 'base'"
                @update:model-value="updateBlockStyles({ fontSize: $event })"
              />
            </InspectorField>
            <InspectorField label="Text Color" horizontal>
              <ColorInput
                :model-value="(effectiveBlockStyles as FormInputStyles).color"
                swatch-only
                @update:model-value="updateBlockStyles({ color: $event })"
              />
            </InspectorField>
            <InspectorField label="Label Color" horizontal>
              <ColorInput
                :model-value="(selectedBlock.styles as FormInputStyles).labelColor"
                swatch-only
                @update:model-value="updateBlockStyles({ labelColor: $event })"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Form Textarea -->
        <template v-else-if="selectedBlock?.type === 'form-textarea'">
          <InspectorSection title="Textarea Settings" icon="content-text">
            <InspectorField label="Label">
              <TextInput
                :model-value="(selectedBlock.settings as FormTextareaSettings).label"
                placeholder="Field label"
                @update:model-value="updateBlockSettings({ label: $event })"
              />
            </InspectorField>
            <InspectorField label="Placeholder">
              <TextInput
                :model-value="(selectedBlock.settings as FormTextareaSettings).placeholder"
                placeholder="Placeholder text"
                @update:model-value="updateBlockSettings({ placeholder: $event })"
              />
            </InspectorField>
            <InspectorField label="Rows">
              <SliderInput
                :model-value="(selectedBlock.settings as FormTextareaSettings).rows || 4"
                :min="2"
                :max="10"
                @update:model-value="updateBlockSettings({ rows: $event })"
              />
            </InspectorField>
            <div class="px-3">
              <ToggleInput
                :model-value="(selectedBlock.settings as FormTextareaSettings).required"
                label="Required field"
                @update:model-value="updateBlockSettings({ required: $event })"
              />
            </div>
          </InspectorSection>
          <InspectorSection title="Style" icon="style-color">
            <InspectorField label="Font Size" horizontal>
              <FontSizeSlider
                :model-value="(selectedBlock.styles as FormTextareaStyles).fontSize || 'base'"
                @update:model-value="updateBlockStyles({ fontSize: $event })"
              />
            </InspectorField>
            <InspectorField label="Text Color" horizontal>
              <ColorInput
                :model-value="(effectiveBlockStyles as FormTextareaStyles).color"
                swatch-only
                @update:model-value="updateBlockStyles({ color: $event })"
              />
            </InspectorField>
            <InspectorField label="Label Color" horizontal>
              <ColorInput
                :model-value="(selectedBlock.styles as FormTextareaStyles).labelColor"
                swatch-only
                @update:model-value="updateBlockStyles({ labelColor: $event })"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Form Select (Dropdown) -->
        <template v-else-if="selectedBlock?.type === 'form-select'">
          <InspectorSection title="Dropdown Settings" icon="chevron-down">
            <InspectorField label="Label">
              <TextInput
                :model-value="(selectedBlock.settings as FormSelectSettings).label"
                placeholder="Field label"
                @update:model-value="updateBlockSettings({ label: $event })"
              />
            </InspectorField>
            <InspectorField label="Placeholder">
              <TextInput
                :model-value="(selectedBlock.settings as FormSelectSettings).placeholder"
                placeholder="Select an option..."
                @update:model-value="updateBlockSettings({ placeholder: $event })"
              />
            </InspectorField>
            <div class="px-3">
              <ToggleInput
                :model-value="(selectedBlock.settings as FormSelectSettings).required"
                label="Required field"
                @update:model-value="updateBlockSettings({ required: $event })"
              />
            </div>
          </InspectorSection>
          <InspectorSection title="Options" icon="list-link">
            <div class="space-y-2">
              <div
                v-for="(option, index) in (selectedBlock.settings as FormSelectSettings).options || []"
                :key="option.id"
                class="flex items-center gap-2"
              >
                <TextInput
                  :model-value="option.label"
                  placeholder="Option label"
                  class="flex-1"
                  @update:model-value="updateBlockSettings({
                    options: ((selectedBlock.settings as FormSelectSettings).options || []).map((o: FormSelectOption, i: number) =>
                      i === index ? { ...o, label: $event, value: $event.toLowerCase().replace(/\s+/g, '_') } : o
                    )
                  })"
                />
                <button
                  class="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  @click="updateBlockSettings({
                    options: ((selectedBlock.settings as FormSelectSettings).options || []).filter((_: FormSelectOption, i: number) => i !== index)
                  })"
                >
                  <Icon name="xmark" class="text-sm" />
                </button>
              </div>
              <button
                class="w-full flex items-center justify-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-sidebar-border rounded-md hover:border-primary/50 transition-colors"
                @click="updateBlockSettings({
                  options: [
                    ...((selectedBlock.settings as FormSelectSettings).options || []),
                    { id: generateId(), label: `Option ${((selectedBlock.settings as FormSelectSettings).options?.length || 0) + 1}`, value: `option_${((selectedBlock.settings as FormSelectSettings).options?.length || 0) + 1}` }
                  ]
                })"
              >
                <Icon name="plus" class="text-xs" />
                Add option
              </button>
            </div>
          </InspectorSection>
          <InspectorSection title="Style" icon="style-color">
            <InspectorField label="Font Size" horizontal>
              <FontSizeSlider
                :model-value="(selectedBlock.styles as FormSelectStyles).fontSize || 'base'"
                @update:model-value="updateBlockStyles({ fontSize: $event })"
              />
            </InspectorField>
            <InspectorField label="Text Color" horizontal>
              <ColorInput
                :model-value="(effectiveBlockStyles as FormSelectStyles).color"
                swatch-only
                @update:model-value="updateBlockStyles({ color: $event })"
              />
            </InspectorField>
            <InspectorField label="Label Color" horizontal>
              <ColorInput
                :model-value="(selectedBlock.styles as FormSelectStyles).labelColor"
                swatch-only
                @update:model-value="updateBlockStyles({ labelColor: $event })"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Form Radio -->
        <template v-else-if="selectedBlock?.type === 'form-radio'">
          <InspectorSection title="Radio Settings" icon="content-form">
            <InspectorField label="Label">
              <TextInput
                :model-value="(selectedBlock.settings as FormRadioSettings).label"
                placeholder="Field label"
                @update:model-value="updateBlockSettings({ label: $event })"
              />
            </InspectorField>
            <InspectorField label="Layout">
              <SegmentedControl
                :model-value="(selectedBlock.settings as FormRadioSettings).layout || 'vertical'"
                :options="[{ value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' }]"
                @update:model-value="updateBlockSettings({ layout: $event })"
              />
            </InspectorField>
            <div class="px-3">
              <ToggleInput
                :model-value="(selectedBlock.settings as FormRadioSettings).required"
                label="Required field"
                @update:model-value="updateBlockSettings({ required: $event })"
              />
            </div>
          </InspectorSection>
          <InspectorSection title="Options" icon="list-link">
            <div class="space-y-2">
              <div
                v-for="(option, index) in (selectedBlock.settings as FormRadioSettings).options || []"
                :key="option.id"
                class="flex items-center gap-2"
              >
                <TextInput
                  :model-value="option.label"
                  placeholder="Option label"
                  class="flex-1"
                  @update:model-value="updateBlockSettings({
                    options: ((selectedBlock.settings as FormRadioSettings).options || []).map((o: FormSelectOption, i: number) =>
                      i === index ? { ...o, label: $event, value: $event.toLowerCase().replace(/\s+/g, '_') } : o
                    )
                  })"
                />
                <button
                  class="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  @click="updateBlockSettings({
                    options: ((selectedBlock.settings as FormRadioSettings).options || []).filter((_: FormSelectOption, i: number) => i !== index)
                  })"
                >
                  <Icon name="xmark" class="text-sm" />
                </button>
              </div>
              <button
                class="w-full flex items-center justify-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-sidebar-border rounded-md hover:border-primary/50 transition-colors"
                @click="updateBlockSettings({
                  options: [
                    ...((selectedBlock.settings as FormRadioSettings).options || []),
                    { id: generateId(), label: `Option ${((selectedBlock.settings as FormRadioSettings).options?.length || 0) + 1}`, value: `option_${((selectedBlock.settings as FormRadioSettings).options?.length || 0) + 1}` }
                  ]
                })"
              >
                <Icon name="plus" class="text-xs" />
                Add option
              </button>
            </div>
          </InspectorSection>
          <InspectorSection title="Style" icon="style-color">
            <InspectorField label="Font Size" horizontal>
              <FontSizeSlider
                :model-value="(selectedBlock.styles as FormRadioStyles).fontSize || 'base'"
                @update:model-value="updateBlockStyles({ fontSize: $event })"
              />
            </InspectorField>
            <InspectorField label="Text Color" horizontal>
              <ColorInput
                :model-value="(effectiveBlockStyles as FormRadioStyles).color"
                swatch-only
                @update:model-value="updateBlockStyles({ color: $event })"
              />
            </InspectorField>
            <InspectorField label="Label Color" horizontal>
              <ColorInput
                :model-value="(selectedBlock.styles as FormRadioStyles).labelColor"
                swatch-only
                @update:model-value="updateBlockStyles({ labelColor: $event })"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Form Checkbox -->
        <template v-else-if="selectedBlock?.type === 'form-checkbox'">
          <InspectorSection title="Checkbox Settings" icon="content-form">
            <InspectorField label="Label">
              <TextInput
                :model-value="(selectedBlock.settings as FormCheckboxSettings).label"
                placeholder="Field label"
                @update:model-value="updateBlockSettings({ label: $event })"
              />
            </InspectorField>
            <InspectorField label="Layout">
              <SegmentedControl
                :model-value="(selectedBlock.settings as FormCheckboxSettings).layout || 'vertical'"
                :options="[{ value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' }]"
                @update:model-value="updateBlockSettings({ layout: $event })"
              />
            </InspectorField>
            <div class="px-3">
              <ToggleInput
                :model-value="(selectedBlock.settings as FormCheckboxSettings).required"
                label="Required field"
                @update:model-value="updateBlockSettings({ required: $event })"
              />
            </div>
          </InspectorSection>
          <InspectorSection title="Options" icon="list-link">
            <div class="space-y-2">
              <div
                v-for="(option, index) in (selectedBlock.settings as FormCheckboxSettings).options || []"
                :key="option.id"
                class="flex items-center gap-2"
              >
                <TextInput
                  :model-value="option.label"
                  placeholder="Option label"
                  class="flex-1"
                  @update:model-value="updateBlockSettings({
                    options: ((selectedBlock.settings as FormCheckboxSettings).options || []).map((o: FormSelectOption, i: number) =>
                      i === index ? { ...o, label: $event, value: $event.toLowerCase().replace(/\s+/g, '_') } : o
                    )
                  })"
                />
                <button
                  class="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  @click="updateBlockSettings({
                    options: ((selectedBlock.settings as FormCheckboxSettings).options || []).filter((_: FormSelectOption, i: number) => i !== index)
                  })"
                >
                  <Icon name="xmark" class="text-sm" />
                </button>
              </div>
              <button
                class="w-full flex items-center justify-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-sidebar-border rounded-md hover:border-primary/50 transition-colors"
                @click="updateBlockSettings({
                  options: [
                    ...((selectedBlock.settings as FormCheckboxSettings).options || []),
                    { id: generateId(), label: `Option ${((selectedBlock.settings as FormCheckboxSettings).options?.length || 0) + 1}`, value: `option_${((selectedBlock.settings as FormCheckboxSettings).options?.length || 0) + 1}` }
                  ]
                })"
              >
                <Icon name="plus" class="text-xs" />
                Add option
              </button>
            </div>
          </InspectorSection>
          <InspectorSection title="Style" icon="style-color">
            <InspectorField label="Font Size" horizontal>
              <FontSizeSlider
                :model-value="(selectedBlock.styles as FormCheckboxStyles).fontSize || 'base'"
                @update:model-value="updateBlockStyles({ fontSize: $event })"
              />
            </InspectorField>
            <InspectorField label="Text Color" horizontal>
              <ColorInput
                :model-value="(effectiveBlockStyles as FormCheckboxStyles).color"
                swatch-only
                @update:model-value="updateBlockStyles({ color: $event })"
              />
            </InspectorField>
            <InspectorField label="Label Color" horizontal>
              <ColorInput
                :model-value="(selectedBlock.styles as FormCheckboxStyles).labelColor"
                swatch-only
                @update:model-value="updateBlockStyles({ labelColor: $event })"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Form Button -->
        <template v-else-if="selectedBlock?.type === 'form-button'">
          <InspectorSection title="Button Settings" icon="content-button">
            <InspectorField label="Label">
              <TextInput
                :model-value="(selectedBlock.settings as FormButtonSettings).label"
                placeholder="Submit"
                @update:model-value="updateBlockSettings({ label: $event })"
              />
            </InspectorField>
            <InspectorField label="Size">
              <SegmentedControl
                :model-value="(selectedBlock.settings as FormButtonSettings).size || 'md'"
                :options="buttonSizeOptions"
                @update:model-value="updateBlockSettings({ size: $event })"
              />
            </InspectorField>
            <div class="px-3">
              <ToggleInput
                :model-value="(selectedBlock.settings as FormButtonSettings).fullWidth ?? false"
                label="Full width"
                @update:model-value="updateBlockSettings({ fullWidth: $event })"
              />
            </div>
          </InspectorSection>
          <InspectorSection title="Style" icon="style-color">
            <InspectorField label="Background" horizontal>
              <ColorInput
                :model-value="(effectiveBlockStyles as FormButtonStyles).backgroundColor"
                swatch-only
                @update:model-value="updateBlockStyles({ backgroundColor: $event })"
              />
            </InspectorField>
            <InspectorField label="Text Color" horizontal>
              <ColorInput
                :model-value="(selectedBlock.styles as FormButtonStyles).textColor"
                swatch-only
                @update:model-value="updateBlockStyles({ textColor: $event })"
              />
            </InspectorField>
            <InspectorField label="Font Size" horizontal>
              <FontSizeSlider
                :model-value="(selectedBlock.styles as FormButtonStyles).fontSize || 'base'"
                @update:model-value="updateBlockStyles({ fontSize: $event })"
              />
            </InspectorField>
            <InspectorField label="Letter Spacing" horizontal>
              <SliderInput
                :model-value="(selectedBlock.styles as FormButtonStyles).letterSpacing || '0'"
                :min="-2"
                :max="8"
                :step="0.5"
                unit="px"
                @update:model-value="updateBlockStyles({ letterSpacing: $event })"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Header Section Inspector -->
        <template v-else-if="isHeaderSection && selectedBlock">
          <InspectorSection title="Header Settings" icon="chevron-top">
            <div class="space-y-3 px-3">
              <ToggleInput
                :model-value="!(selectedBlock.settings as HeaderSettings).isHidden"
                label="Show header"
                @update:model-value="updateBlockSettings({ isHidden: !$event })"
              />
              <ToggleInput
                :model-value="(selectedBlock.settings as HeaderSettings).sticky ?? true"
                label="Make sticky"
                @update:model-value="updateBlockSettings({ sticky: $event })"
              />
            </div>
          </InspectorSection>
          <InspectorSection title="Layout" icon="style-column">
            <InspectorField label="Gap" horizontal>
              <SliderInput
                :model-value="(selectedBlock.settings as HeaderSettings).gap || '16'"
                :min="0"
                :max="64"
                :step="4"
                @update:model-value="updateBlockSettings({ gap: $event })"
              />
            </InspectorField>
            <InspectorField label="Height" horizontal>
              <SliderInput
                :model-value="(selectedBlock.settings as HeaderSettings).height || '64'"
                :min="32"
                :max="200"
                :step="4"
                unit="px"
                @update:model-value="updateBlockSettings({ height: $event })"
              />
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Content Position" icon="style-border-top">
            <InspectorField label="Justify" horizontal>
              <SegmentedControl
                :options="justifyContentOptions"
                :model-value="(selectedBlock.styles as HeaderStyles).justifyContent || 'space-between'"
                icon-only
                @update:model-value="updateBlockStyles({ justifyContent: $event })"
              />
            </InspectorField>
            <InspectorField label="Align" horizontal>
              <SegmentedControl
                :options="alignItemsOptions"
                :model-value="(selectedBlock.styles as HeaderStyles).alignItems || 'center'"
                icon-only
                @update:model-value="updateBlockStyles({ alignItems: $event })"
              />
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Spacing" icon="style-column">
              <BoxModelInput
                :margin="responsiveStyles.margin"
                :padding="responsiveStyles.padding"
                @update:margin="updateBlockStyles({ margin: $event })"
                @update:padding="updateBlockStyles({ padding: $event })"
              />
          </InspectorSection>
          <InspectorSection title="Background" icon="content-image">
            <InspectorField label="Type" horizontal>
              <SegmentedControl
                :options="[
                  { value: 'color', label: 'Color', icon: 'style-color' },
                  { value: 'image', label: 'Image', icon: 'content-image' },
                  { value: 'video', label: 'Video', icon: 'content-video' },
                ]"
                :model-value="(selectedBlock.settings as HeaderSettings).backgroundType || 'color'"
                icon-only
                @update:model-value="updateBlockSettings({ backgroundType: $event })"
              />
            </InspectorField>
            <InspectorField v-if="(selectedBlock.settings as HeaderSettings).backgroundType === 'color' || !(selectedBlock.settings as HeaderSettings).backgroundType" label="Color" horizontal>
              <ColorInput
                :model-value="responsiveStyles.backgroundColor"
                swatch-only
                @update:model-value="updateBlockStyles({ backgroundColor: $event })"
              />
            </InspectorField>
            <InspectorField v-else-if="(selectedBlock.settings as HeaderSettings).backgroundType === 'image'" label="Image">
              <ImageInput
                :model-value="(selectedBlock.settings as HeaderSettings).backgroundImage || ''"
                placeholder="Upload background image"
                @update:model-value="updateBlockSettings({ backgroundImage: $event })"
              />
            </InspectorField>
            <InspectorField v-else label="Video URL">
              <TextInput
                :model-value="(selectedBlock.settings as HeaderSettings).backgroundVideo || ''"
                placeholder="YouTube, Vimeo, or file URL"
                @update:model-value="updateBlockSettings({ backgroundVideo: $event })"
              />
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Border" icon="style-border-top">
            <BorderInput
              :model-value="responsiveStyles.border"
              @update:model-value="updateBlockStyles({ border: $event })"
            />
          </InspectorSection>
        </template>

        <!-- Footer Section Inspector -->
        <template v-else-if="isFooterSection && selectedBlock">
          <InspectorSection title="Footer Settings" icon="chevron-bottom">
            <div class="space-y-3 px-3">
              <ToggleInput
                :model-value="!(selectedBlock.settings as FooterSettings).isHidden"
                label="Show footer"
                @update:model-value="updateBlockSettings({ isHidden: !$event })"
              />
            </div>
          </InspectorSection>
          <InspectorSection title="Layout" icon="style-column">
            <InspectorField label="Gap" horizontal>
              <SliderInput
                :model-value="(selectedBlock.settings as FooterSettings).gap || '16'"
                :min="0"
                :max="64"
                :step="4"
                @update:model-value="updateBlockSettings({ gap: $event })"
              />
            </InspectorField>
            <InspectorField label="Min Height" horizontal>
              <SliderInput
                :model-value="(selectedBlock.settings as FooterSettings).height || '0'"
                :min="0"
                :max="100"
                :step="25"
                unit="vh"
                @update:model-value="updateBlockSettings({ height: $event })"
              />
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Content Position" icon="style-border-top">
            <InspectorField label="Justify" horizontal>
              <SegmentedControl
                :options="justifyContentOptions"
                :model-value="(selectedBlock.styles as FooterStyles).justifyContent || 'space-between'"
                icon-only
                @update:model-value="updateBlockStyles({ justifyContent: $event })"
              />
            </InspectorField>
            <InspectorField label="Align" horizontal>
              <SegmentedControl
                :options="alignItemsOptions"
                :model-value="(selectedBlock.styles as FooterStyles).alignItems || 'center'"
                icon-only
                @update:model-value="updateBlockStyles({ alignItems: $event })"
              />
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Background" icon="content-image">
            <InspectorField label="Type" horizontal>
              <SegmentedControl
                :options="[
                  { value: 'color', label: 'Color', icon: 'style-color' },
                  { value: 'image', label: 'Image', icon: 'content-image' },
                  { value: 'video', label: 'Video', icon: 'content-video' },
                ]"
                :model-value="(selectedBlock.settings as FooterSettings).backgroundType || 'color'"
                icon-only
                @update:model-value="updateBlockSettings({ backgroundType: $event })"
              />
            </InspectorField>
            <InspectorField v-if="(selectedBlock.settings as FooterSettings).backgroundType === 'color' || !(selectedBlock.settings as FooterSettings).backgroundType" label="Color" horizontal>
              <ColorInput
                :model-value="responsiveStyles.backgroundColor"
                swatch-only
                @update:model-value="updateBlockStyles({ backgroundColor: $event })"
              />
            </InspectorField>
            <InspectorField v-else-if="(selectedBlock.settings as FooterSettings).backgroundType === 'image'" label="Image">
              <ImageInput
                :model-value="(selectedBlock.settings as FooterSettings).backgroundImage || ''"
                placeholder="Upload background image"
                @update:model-value="updateBlockSettings({ backgroundImage: $event })"
              />
            </InspectorField>
            <InspectorField v-else label="Video URL">
              <TextInput
                :model-value="(selectedBlock.settings as FooterSettings).backgroundVideo || ''"
                placeholder="YouTube, Vimeo, or file URL"
                @update:model-value="updateBlockSettings({ backgroundVideo: $event })"
              />
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Border" icon="style-border-top">
            <BorderInput
              :model-value="responsiveStyles.border"
              @update:model-value="updateBlockStyles({ border: $event })"
            />
          </InspectorSection>
        </template>

        <!-- Form Section Inspector -->
        <template v-else-if="isFormSection && selectedBlock">
          <InspectorSection title="Form Settings" icon="content-form">
            <InspectorField label="Success Message">
              <TextInput
                :model-value="(selectedBlock.settings as FormSettings).successMessage"
                placeholder="Thank you for your submission!"
                multiline
                @update:model-value="updateBlockSettings({ successMessage: $event })"
              />
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Layout" icon="style-column">
            <InspectorField label="Gap" horizontal>
              <SliderInput
                :model-value="(selectedBlock.settings as FormSettings).gap || '16'"
                :min="0"
                :max="64"
                :step="4"
                @update:model-value="updateBlockSettings({ gap: $event })"
              />
            </InspectorField>
            <InspectorField label="Min Height" horizontal>
              <SliderInput
                :model-value="(selectedBlock.settings as FormSettings).height || '0'"
                :min="0"
                :max="100"
                :step="25"
                unit="vh"
                @update:model-value="updateBlockSettings({ height: $event })"
              />
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Content Position" icon="style-border-top">
            <InspectorField label="Direction" horizontal>
              <SegmentedControl
                :options="[
                  { value: 'column', label: 'Column', icon: 'style-column' },
                  { value: 'row', label: 'Row', icon: 'style-row' },
                ]"
                :model-value="(selectedBlock.styles as FormStyles).flexDirection || 'column'"
                icon-only
                @update:model-value="updateBlockStyles({ flexDirection: $event })"
              />
            </InspectorField>
            <InspectorField label="Justify" horizontal>
              <SegmentedControl
                :options="justifyContentOptions"
                :model-value="(selectedBlock.styles as FormStyles).justifyContent || 'flex-start'"
                icon-only
                @update:model-value="updateBlockStyles({ justifyContent: $event })"
              />
            </InspectorField>
            <InspectorField label="Align" horizontal>
              <SegmentedControl
                :options="alignItemsOptions"
                :model-value="(selectedBlock.styles as FormStyles).alignItems || 'stretch'"
                icon-only
                @update:model-value="updateBlockStyles({ alignItems: $event })"
              />
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Background" icon="content-image">
            <InspectorField label="Type" horizontal>
              <SegmentedControl
                :options="[
                  { value: 'color', label: 'Color', icon: 'style-color' },
                  { value: 'image', label: 'Image', icon: 'content-image' },
                  { value: 'video', label: 'Video', icon: 'content-video' },
                ]"
                :model-value="(selectedBlock.settings as FormSettings).backgroundType || 'color'"
                icon-only
                @update:model-value="updateBlockSettings({ backgroundType: $event })"
              />
            </InspectorField>
            <InspectorField v-if="(selectedBlock.settings as FormSettings).backgroundType === 'color' || !(selectedBlock.settings as FormSettings).backgroundType" label="Color" horizontal>
              <ColorInput
                :model-value="responsiveStyles.backgroundColor"
                swatch-only
                @update:model-value="updateBlockStyles({ backgroundColor: $event })"
              />
            </InspectorField>
            <InspectorField v-else-if="(selectedBlock.settings as FormSettings).backgroundType === 'image'" label="Image">
              <ImageInput
                :model-value="(selectedBlock.settings as FormSettings).backgroundImage || ''"
                placeholder="Upload background image"
                @update:model-value="updateBlockSettings({ backgroundImage: $event })"
              />
            </InspectorField>
            <InspectorField v-else label="Video URL">
              <TextInput
                :model-value="(selectedBlock.settings as FormSettings).backgroundVideo || ''"
                placeholder="YouTube, Vimeo, or file URL"
                @update:model-value="updateBlockSettings({ backgroundVideo: $event })"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Canvas Section Inspector -->
        <template v-else-if="isCanvasSection && selectedBlock">
          <InspectorSection title="Canvas" icon="style-column">
            <InspectorField label="Min Height" horizontal>
              <SliderInput
                :model-value="(selectedBlock.settings as CanvasSettings).minHeight || '0'"
                :min="0"
                :max="100"
                :step="25"
                unit="vh"
                @update:model-value="updateBlockSettings({ minHeight: $event })"
              />
            </InspectorField>
          </InspectorSection>
          <InspectorSection title="Background" icon="content-image">
            <InspectorField label="Type" horizontal>
              <SegmentedControl
                :options="[
                  { value: 'color', label: 'Color', icon: 'style-color' },
                  { value: 'image', label: 'Image', icon: 'content-image' },
                  { value: 'video', label: 'Video', icon: 'content-video' },
                ]"
                :model-value="(selectedBlock.settings as CanvasSettings).backgroundType || 'color'"
                icon-only
                @update:model-value="updateBlockSettings({ backgroundType: $event })"
              />
            </InspectorField>
            <InspectorField v-if="(selectedBlock.settings as CanvasSettings).backgroundType === 'color' || !(selectedBlock.settings as CanvasSettings).backgroundType" label="Color" horizontal>
              <ColorInput
                :model-value="responsiveStyles.backgroundColor"
                swatch-only
                @update:model-value="updateBlockStyles({ backgroundColor: $event })"
              />
            </InspectorField>
            <InspectorField v-else-if="(selectedBlock.settings as CanvasSettings).backgroundType === 'image'" label="Image">
              <ImageInput
                :model-value="(selectedBlock.settings as CanvasSettings).backgroundImage || ''"
                placeholder="Upload background image"
                @update:model-value="updateBlockSettings({ backgroundImage: $event })"
              />
            </InspectorField>
            <InspectorField v-else label="Video URL">
              <TextInput
                :model-value="(selectedBlock.settings as CanvasSettings).backgroundVideo || ''"
                placeholder="YouTube, Vimeo, or file URL"
                @update:model-value="updateBlockSettings({ backgroundVideo: $event })"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Generic Block Inspector -->
        <template v-else-if="selectedBlock">
          <!-- Shared Style (for all blocks except header/footer) -->
          <div
            v-if="selectedBlock.type !== 'header' && selectedBlock.type !== 'footer'"
            class="px-4 py-3 border-b border-sidebar-border"
          >
            <SharedStyleField
              :block-id="selectedBlock.id"
              :block-type="selectedBlock.type"
              @open-create-modal="showSharedStyleModal = true"
            />
          </div>

          <!-- State (for interactive blocks: text, heading, button, image, video, form inputs) -->
          <div
            v-if="editorStore.supportsStyleStates(selectedBlock.type)"
            class="px-4 py-3 border-b border-sidebar-border"
          >
            <StateField :block-id="selectedBlock.id" />
          </div>

          <!-- Heading Settings -->
          <template v-if="selectedBlock.type === 'heading'">
            <!-- Overwrite Style Toggle (only for blocks inside List/Collection) -->
            <div v-if="isListCollectionItem" class="px-4 py-3 border-b border-sidebar-border">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-xs font-medium text-foreground">Overwrite style</p>
                  <p class="text-[10px] text-muted-foreground">Apply unique styles to this item only</p>
                </div>
                <ToggleInput
                  :model-value="hasOverwriteStyle"
                  @update:model-value="toggleOverwriteStyle"
                />
              </div>
            </div>
            <InspectorSection title="Content" icon="content-heading">
              <InspectorField label="Text">
                <TextInput
                  :model-value="getTranslatableContent('content')"
                  placeholder="Heading text"
                  @update:model-value="updateTranslatableContent('content', $event)"
                />
              </InspectorField>
              <InspectorField label="Level" horizontal>
                <SegmentedControl
                  :options="headingLevelOptions"
                  :model-value="(selectedBlock.settings as HeadingSettings).level"
                  @update:model-value="updateBlockSettings({ level: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Style" icon="style-color">
              <InspectorField label="Font Family" horizontal>
                <SelectInput
                  :options="combinedFontOptions"
                  :model-value="(selectedBlock.styles as HeadingStyles).fontFamily || pageSettings.fontFamily || 'Inter'"
                  @update:model-value="updateBlockStyles({ fontFamily: $event })"
                />
              </InspectorField>
              <InspectorField label="Font Size" horizontal>
                <FontSizeSlider
                  :model-value="(selectedBlock.styles as HeadingStyles).fontSize || 'xl'"
                  @update:model-value="updateBlockStyles({ fontSize: $event })"
                />
              </InspectorField>
              <InspectorField label="Font Weight" horizontal>
                <SelectInput
                  :options="fontWeightOptions"
                  :model-value="(selectedBlock.styles as HeadingStyles).fontWeight || 'bold'"
                  @update:model-value="updateBlockStyles({ fontWeight: $event })"
                />
              </InspectorField>
              <InspectorField label="Style" horizontal>
                <div class="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                  <Tooltip text="Italic">
                    <button
                      type="button"
                      class="flex items-center justify-center w-7 h-7 rounded transition-colors"
                      :class="(selectedBlock.styles as HeadingStyles).fontStyle === 'italic'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'"
                      @click="updateBlockStyles({ fontStyle: (selectedBlock.styles as HeadingStyles).fontStyle === 'italic' ? 'normal' : 'italic' })"
                    >
                      <Icon name="italic" class="text-sm" />
                    </button>
                  </Tooltip>
                  <Tooltip text="Underline">
                    <button
                      type="button"
                      class="flex items-center justify-center w-7 h-7 rounded transition-colors"
                      :class="(selectedBlock.styles as HeadingStyles).textDecoration === 'underline'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'"
                      @click="updateBlockStyles({ textDecoration: (selectedBlock.styles as HeadingStyles).textDecoration === 'underline' ? 'none' : 'underline' })"
                    >
                      <Icon name="underline" class="text-sm" />
                    </button>
                  </Tooltip>
                  <Tooltip text="Strikethrough">
                    <button
                      type="button"
                      class="flex items-center justify-center w-7 h-7 rounded transition-colors"
                      :class="(selectedBlock.styles as HeadingStyles).textDecoration === 'line-through'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'"
                      @click="updateBlockStyles({ textDecoration: (selectedBlock.styles as HeadingStyles).textDecoration === 'line-through' ? 'none' : 'line-through' })"
                    >
                      <Icon name="strikethrough" class="text-sm" />
                    </button>
                  </Tooltip>
                </div>
              </InspectorField>
              <InspectorField label="Line Height" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.styles as HeadingStyles).lineHeight || '1.5'"
                  :min="1"
                  :max="2.5"
                  :step="0.1"
                  @update:model-value="updateBlockStyles({ lineHeight: $event })"
                />
              </InspectorField>
              <InspectorField label="Letter Spacing" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.styles as HeadingStyles).letterSpacing || '0'"
                  :min="-2"
                  :max="8"
                  :step="0.5"
                  unit="px"
                  @update:model-value="updateBlockStyles({ letterSpacing: $event })"
                />
              </InspectorField>
              <InspectorField label="Alignment" horizontal>
                <SegmentedControl
                  :options="alignmentOptions"
                  :model-value="(selectedBlock.styles as HeadingStyles).alignment || 'left'"
                  icon-only
                  @update:model-value="updateBlockStyles({ alignment: $event })"
                />
              </InspectorField>
              <InspectorField label="Color" horizontal>
                <ColorInput
                  :model-value="(effectiveBlockStyles as HeadingStyles).color"
                  swatch-only
                  @update:model-value="updateBlockStyles({ color: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Text Settings -->
          <template v-else-if="selectedBlock.type === 'text'">
            <!-- Overwrite Style Toggle (only for blocks inside List/Collection) -->
            <div v-if="isListCollectionItem" class="px-4 py-3 border-b border-sidebar-border">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-xs font-medium text-foreground">Overwrite style</p>
                  <p class="text-[10px] text-muted-foreground">Apply unique styles to this item only</p>
                </div>
                <ToggleInput
                  :model-value="hasOverwriteStyle"
                  @update:model-value="toggleOverwriteStyle"
                />
              </div>
            </div>
            <InspectorSection title="Content" icon="content-text">
              <InspectorField label="Text">
                <TextInput
                  :model-value="getTranslatableContent('content')"
                  placeholder="Enter your text..."
                  multiline
                  @update:model-value="updateTranslatableContent('content', $event)"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Style" icon="style-color">
              <InspectorField label="Font Family" horizontal>
                <SelectInput
                  :options="combinedFontOptions"
                  :model-value="(selectedBlock.styles as TextStyles).fontFamily || pageSettings.fontFamily || 'Inter'"
                  @update:model-value="updateBlockStyles({ fontFamily: $event })"
                />
              </InspectorField>
              <InspectorField label="Font Size" horizontal>
                <FontSizeSlider
                  :model-value="(selectedBlock.styles as TextStyles).fontSize || 'base'"
                  @update:model-value="updateBlockStyles({ fontSize: $event })"
                />
              </InspectorField>
              <InspectorField label="Font Weight" horizontal>
                <SelectInput
                  :options="fontWeightOptions"
                  :model-value="(selectedBlock.styles as TextStyles).fontWeight || 'normal'"
                  @update:model-value="updateBlockStyles({ fontWeight: $event })"
                />
              </InspectorField>
              <InspectorField label="Style" horizontal>
                <div class="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                  <Tooltip text="Italic">
                    <button
                      type="button"
                      class="flex items-center justify-center w-7 h-7 rounded transition-colors"
                      :class="(selectedBlock.styles as TextStyles).fontStyle === 'italic'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'"
                      @click="updateBlockStyles({ fontStyle: (selectedBlock.styles as TextStyles).fontStyle === 'italic' ? 'normal' : 'italic' })"
                    >
                      <Icon name="italic" class="text-sm" />
                    </button>
                  </Tooltip>
                  <Tooltip text="Underline">
                    <button
                      type="button"
                      class="flex items-center justify-center w-7 h-7 rounded transition-colors"
                      :class="(selectedBlock.styles as TextStyles).textDecoration === 'underline'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'"
                      @click="updateBlockStyles({ textDecoration: (selectedBlock.styles as TextStyles).textDecoration === 'underline' ? 'none' : 'underline' })"
                    >
                      <Icon name="underline" class="text-sm" />
                    </button>
                  </Tooltip>
                  <Tooltip text="Strikethrough">
                    <button
                      type="button"
                      class="flex items-center justify-center w-7 h-7 rounded transition-colors"
                      :class="(selectedBlock.styles as TextStyles).textDecoration === 'line-through'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'"
                      @click="updateBlockStyles({ textDecoration: (selectedBlock.styles as TextStyles).textDecoration === 'line-through' ? 'none' : 'line-through' })"
                    >
                      <Icon name="strikethrough" class="text-sm" />
                    </button>
                  </Tooltip>
                </div>
              </InspectorField>
              <InspectorField label="Text Color" horizontal>
                <ColorInput
                  :model-value="(effectiveBlockStyles as TextStyles).color"
                  swatch-only
                  @update:model-value="updateBlockStyles({ color: $event })"
                />
              </InspectorField>
              <InspectorField label="Line Height" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.styles as TextStyles).lineHeight || '1.5'"
                  :min="1"
                  :max="2.5"
                  :step="0.1"
                  @update:model-value="updateBlockStyles({ lineHeight: $event })"
                />
              </InspectorField>
              <InspectorField label="Letter Spacing" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.styles as TextStyles).letterSpacing || '0'"
                  :min="-2"
                  :max="8"
                  :step="0.5"
                  unit="px"
                  @update:model-value="updateBlockStyles({ letterSpacing: $event })"
                />
              </InspectorField>
              <InspectorField label="Alignment" horizontal>
                <SegmentedControl
                  :options="alignmentOptions"
                  :model-value="(selectedBlock.styles as TextStyles).alignment || 'left'"
                  icon-only
                  @update:model-value="updateBlockStyles({ alignment: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Image Settings -->
          <template v-else-if="selectedBlock.type === 'image'">
            <!-- Overwrite Style Toggle (only for blocks inside List/Collection) -->
            <div v-if="isListCollectionItem" class="px-4 py-3 border-b border-sidebar-border">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-xs font-medium text-foreground">Overwrite style</p>
                  <p class="text-[10px] text-muted-foreground">Apply unique styles to this item only</p>
                </div>
                <ToggleInput
                  :model-value="hasOverwriteStyle"
                  @update:model-value="toggleOverwriteStyle"
                />
              </div>
            </div>
            <InspectorSection title="Image" icon="content-image">
              <InspectorField label="Source">
                <ImageInput
                  :model-value="(selectedBlock.settings as ImageSettings).src"
                  placeholder="Upload image"
                  @update:model-value="updateBlockSettings({ src: $event })"
                />
              </InspectorField>
              <InspectorField label="Alt Text">
                <TextInput
                  :model-value="(selectedBlock.settings as ImageSettings).alt"
                  placeholder="Image description"
                  @update:model-value="updateBlockSettings({ alt: $event })"
                />
              </InspectorField>
              <InspectorField label="Link URL">
                <TextInput
                  :model-value="(selectedBlock.settings as ImageSettings).linkUrl"
                  placeholder="https://..."
                  @update:model-value="updateBlockSettings({ linkUrl: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Size" icon="style-column">
              <InspectorField label="Width" horizontal>
                <SliderInput
                  :model-value="parseInt((selectedBlock.styles as ImageStyles).width || '100')"
                  :min="0"
                  :max="100"
                  :step="5"
                  unit="%"
                  @update:model-value="updateBlockStyles({ width: $event + '%' })"
                />
              </InspectorField>
              <InspectorField label="Height" horizontal>
                <SliderInput
                  :model-value="parseInt((selectedBlock.styles as ImageStyles).height || '100')"
                  :min="0"
                  :max="100"
                  :step="5"
                  unit="%"
                  @update:model-value="updateBlockStyles({ height: $event + '%' })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Style" icon="style-color">
              <InspectorField label="Aspect Ratio">
                <SelectInput
                  :options="[
                    { value: 'auto', label: 'Auto' },
                    { value: '1:1', label: '1:1 (Square)' },
                    { value: '4:3', label: '4:3' },
                    { value: '3:4', label: '3:4' },
                    { value: '16:9', label: '16:9 (Widescreen)' },
                    { value: '9:16', label: '9:16 (Portrait)' },
                    { value: '3:2', label: '3:2' },
                    { value: '2:3', label: '2:3' },
                  ]"
                  :model-value="(selectedBlock.styles as ImageStyles).aspectRatio || 'auto'"
                  @update:model-value="updateBlockStyles({ aspectRatio: $event })"
                />
              </InspectorField>
              <InspectorField label="Object Fit">
                <SelectInput
                  :options="[
                    { value: 'cover', label: 'Cover' },
                    { value: 'contain', label: 'Contain' },
                    { value: 'fill', label: 'Fill' },
                    { value: 'none', label: 'None' },
                    { value: 'scale-down', label: 'Scale Down' },
                  ]"
                  :model-value="(selectedBlock.styles as ImageStyles).objectFit || 'cover'"
                  @update:model-value="updateBlockStyles({ objectFit: $event })"
                />
              </InspectorField>
              <InspectorField label="Mask">
                <SelectInput
                  :options="maskShapes.map(shape => ({ value: shape, label: maskShapeLabels[shape] }))"
                  :model-value="(selectedBlock.styles as ImageStyles).mask || 'none'"
                  @update:model-value="updateBlockStyles({ mask: $event })"
                />
              </InspectorField>
              <InspectorField label="Border Radius" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.styles as ImageStyles).borderRadius || '0'"
                  :min="0"
                  :max="48"
                  :step="4"
                  @update:model-value="updateBlockStyles({ borderRadius: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Video Settings -->
          <template v-else-if="selectedBlock.type === 'video'">
            <InspectorSection title="Video" icon="content-video">
              <InspectorField label="Source URL">
                <TextInput
                  :model-value="(selectedBlock.settings as VideoSettings).src"
                  placeholder="YouTube, Vimeo, or file URL"
                  @update:model-value="updateBlockSettings({ src: $event })"
                />
              </InspectorField>
              <InspectorField label="Thumbnail">
                <ImageInput
                  :model-value="(selectedBlock.settings as VideoSettings).thumbnail || ''"
                  placeholder="Upload thumbnail"
                  @update:model-value="updateBlockSettings({ thumbnail: $event })"
                />
              </InspectorField>
              <div class="space-y-2 px-3">
                <ToggleInput
                  :model-value="(selectedBlock.settings as VideoSettings).autoplay ?? false"
                  label="Autoplay"
                  @update:model-value="updateBlockSettings({ autoplay: $event })"
                />
                <ToggleInput
                  :model-value="(selectedBlock.settings as VideoSettings).loop ?? false"
                  label="Loop"
                  @update:model-value="updateBlockSettings({ loop: $event })"
                />
                <ToggleInput
                  :model-value="(selectedBlock.settings as VideoSettings).muted ?? false"
                  label="Muted"
                  @update:model-value="updateBlockSettings({ muted: $event })"
                />
                <ToggleInput
                  :model-value="(selectedBlock.settings as VideoSettings).controls ?? true"
                  label="Show controls"
                  @update:model-value="updateBlockSettings({ controls: $event })"
                />
              </div>
            </InspectorSection>
            <InspectorSection title="Style" icon="style-color">
              <InspectorField label="Aspect Ratio">
                <SelectInput
                  :options="[
                    { value: 'auto', label: 'Auto' },
                    { value: '1:1', label: '1:1' },
                    { value: '4:3', label: '4:3' },
                    { value: '16:9', label: '16:9' },
                  ]"
                  :model-value="(selectedBlock.styles as VideoStyles).aspectRatio || '16:9'"
                  @update:model-value="updateBlockStyles({ aspectRatio: $event })"
                />
              </InspectorField>
              <InspectorField label="Mask">
                <SelectInput
                  :options="maskShapes.map(shape => ({ value: shape, label: maskShapeLabels[shape] }))"
                  :model-value="(selectedBlock.styles as VideoStyles).mask || 'none'"
                  @update:model-value="updateBlockStyles({ mask: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Button Settings -->
          <template v-else-if="selectedBlock.type === 'button'">
            <!-- Overwrite Style Toggle (only for blocks inside List/Collection) -->
            <div v-if="isListCollectionItem" class="px-4 py-3 border-b border-sidebar-border">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-xs font-medium text-foreground">Overwrite style</p>
                  <p class="text-[10px] text-muted-foreground">Apply unique styles to this item only</p>
                </div>
                <ToggleInput
                  :model-value="hasOverwriteStyle"
                  @update:model-value="toggleOverwriteStyle"
                />
              </div>
            </div>
            <InspectorSection title="Button" icon="content-button">
              <InspectorField label="Label">
                <TextInput
                  :model-value="getTranslatableContent('label')"
                  placeholder="Button text"
                  @update:model-value="updateTranslatableContent('label', $event)"
                />
              </InspectorField>
              <InspectorField label="URL">
                <TextInput
                  :model-value="(selectedBlock.settings as ButtonSettings).url"
                  placeholder="https://..."
                  @update:model-value="updateBlockSettings({ url: $event })"
                />
              </InspectorField>
              <InspectorField label="Size" horizontal>
                <SegmentedControl
                  :options="buttonSizeOptions"
                  :model-value="(selectedBlock.settings as ButtonSettings).size"
                  @update:model-value="updateBlockSettings({ size: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Style" icon="style-color">
              <InspectorField label="Background" horizontal>
                <ColorInput
                  :model-value="(effectiveBlockStyles as ButtonStyles).backgroundColor"
                  swatch-only
                  @update:model-value="updateBlockStyles({ backgroundColor: $event })"
                />
              </InspectorField>
              <InspectorField label="Text Color" horizontal>
                <ColorInput
                  :model-value="(effectiveBlockStyles as ButtonStyles).color"
                  swatch-only
                  @update:model-value="updateBlockStyles({ color: $event })"
                />
              </InspectorField>
              <InspectorField label="Font Size" horizontal>
                <FontSizeSlider
                  :model-value="(selectedBlock.styles as ButtonStyles).fontSize || 'base'"
                  @update:model-value="updateBlockStyles({ fontSize: $event })"
                />
              </InspectorField>
              <InspectorField label="Letter Spacing" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.styles as ButtonStyles).letterSpacing || '0'"
                  :min="-2"
                  :max="8"
                  :step="0.5"
                  unit="px"
                  @update:model-value="updateBlockStyles({ letterSpacing: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Divider Settings -->
          <template v-else-if="selectedBlock.type === 'divider'">
            <InspectorSection title="Divider" icon="content-divider">
              <InspectorField label="Style" horizontal>
                <SegmentedControl
                  :options="[
                    { value: 'line', label: 'Line', icon: 'content-divider' },
                    { value: 'dashed', label: 'Dashed', icon: 'content-divider' },
                    { value: 'dotted', label: 'Dotted', icon: 'content-divider' },
                    { value: 'space', label: 'Space', icon: 'style-row' },
                  ]"
                  :model-value="(selectedBlock.settings as DividerSettings).style || 'line'"
                  icon-only
                  @update:model-value="updateBlockSettings({ style: $event })"
                />
              </InspectorField>
              <InspectorField v-if="(selectedBlock.settings as DividerSettings).style !== 'space'" label="Thickness" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.settings as DividerSettings).thickness || '1'"
                  :min="1"
                  :max="8"
                  :step="1"
                  @update:model-value="updateBlockSettings({ thickness: $event })"
                />
              </InspectorField>
              <InspectorField label="Width" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.settings as DividerSettings).width || '100'"
                  :min="10"
                  :max="100"
                  :step="5"
                  unit="%"
                  @update:model-value="updateBlockSettings({ width: $event })"
                />
              </InspectorField>
              <InspectorField v-if="(selectedBlock.settings as DividerSettings).style !== 'space'" label="Color" horizontal>
                <ColorInput
                  :model-value="(selectedBlock.settings as DividerSettings).color"
                  swatch-only
                  @update:model-value="updateBlockSettings({ color: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Icon Settings -->
          <template v-else-if="selectedBlock.type === 'icon'">
            <!-- Overwrite Style Toggle (only for blocks inside List/Collection) -->
            <div v-if="isListCollectionItem" class="px-4 py-3 border-b border-sidebar-border">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-xs font-medium text-foreground">Overwrite style</p>
                  <p class="text-[10px] text-muted-foreground">Apply unique styles to this item only</p>
                </div>
                <ToggleInput
                  :model-value="hasOverwriteStyle"
                  @update:model-value="toggleOverwriteStyle"
                />
              </div>
            </div>
            <InspectorSection title="Icon" icon="content-icon">
              <InspectorField label="Icon Name">
                <TextInput
                  :model-value="(selectedBlock.settings as IconSettings).icon"
                  placeholder="content-icon"
                  @update:model-value="updateBlockSettings({ icon: $event })"
                />
              </InspectorField>
              <InspectorField label="Size" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.settings as IconSettings).size || '24'"
                  :min="12"
                  :max="96"
                  :step="4"
                  unit="px"
                  @update:model-value="updateBlockSettings({ size: $event })"
                />
              </InspectorField>
              <InspectorField label="Link URL">
                <TextInput
                  :model-value="(selectedBlock.settings as IconSettings).linkUrl"
                  placeholder="https://..."
                  @update:model-value="updateBlockSettings({ linkUrl: $event })"
                />
              </InspectorField>
              <div class="px-3">
                <ToggleInput
                  :model-value="(selectedBlock.settings as IconSettings).linkNewTab ?? false"
                  label="Open in new tab"
                  @update:model-value="updateBlockSettings({ linkNewTab: $event })"
                />
              </div>
            </InspectorSection>
            <InspectorSection title="Style" icon="style-color">
              <InspectorField label="Color" horizontal>
                <ColorInput
                  :model-value="(selectedBlock.styles as IconStyles).color"
                  swatch-only
                  @update:model-value="updateBlockStyles({ color: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Variants Settings -->
          <template v-else-if="selectedBlock?.type === 'variants'">
            <InspectorSection title="Product Variants" icon="layout-container">
              <!-- Summary -->
              <div class="space-y-3">
                <div class="text-xs text-muted-foreground">
                  <span class="font-medium text-foreground">{{ (selectedBlock.settings as VariantsSettings).optionTypes?.length || 0 }}</span> option types,
                  <span class="font-medium text-foreground">{{ (selectedBlock.settings as VariantsSettings).variants?.length || 0 }}</span> variants
                </div>

                <!-- Quick preview of options -->
                <div v-if="(selectedBlock.settings as VariantsSettings).optionTypes?.length" class="space-y-2">
                  <div
                    v-for="optType in (selectedBlock.settings as VariantsSettings).optionTypes"
                    :key="optType.id"
                    class="flex items-center gap-2 text-xs"
                  >
                    <span class="font-medium">{{ optType.name }}:</span>
                    <span class="text-muted-foreground">{{ optType.values.map((v: VariantOptionValue) => v.value).join(', ') }}</span>
                  </div>
                </div>

                <!-- Manage button -->
                <button
                  class="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  @click="showVariantsModal = true"
                >
                  <Icon name="pencil-1" />
                  Manage Variants
                </button>
              </div>
            </InspectorSection>

            <!-- Style -->
            <InspectorSection title="Style" icon="style-color">
              <InspectorField label="Option Size" horizontal>
                <SegmentedControl
                  :options="[
                    { value: 'sm', label: 'S' },
                    { value: 'md', label: 'M' },
                    { value: 'lg', label: 'L' },
                  ]"
                  :model-value="(selectedBlock.styles as VariantsStyles).optionSize || 'md'"
                  @update:model-value="updateBlockStyles({ optionSize: $event })"
                />
              </InspectorField>
              <InspectorField label="Gap" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.styles as VariantsStyles).gap || '8'"
                  :min="0"
                  :max="24"
                  :step="4"
                  unit="px"
                  @update:model-value="updateBlockStyles({ gap: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Container Settings -->
          <template v-else-if="selectedBlock.type === 'container'">
            <InspectorSection title="Container" icon="style-column">
              <InspectorField label="Max Width" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.settings as ContainerSettings).maxWidth || '1200'"
                  :min="400"
                  :max="1600"
                  :step="100"
                  unit="px"
                  @update:model-value="updateBlockSettings({ maxWidth: $event })"
                />
              </InspectorField>
              <InspectorField label="Min Height" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.settings as ContainerSettings).height || '0'"
                  :min="0"
                  :max="100"
                  :step="25"
                  unit="vh"
                  @update:model-value="updateBlockSettings({ height: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Content Position" icon="style-border-top">
              <InspectorField label="Direction" horizontal>
                <SegmentedControl
                  :options="[
                    { value: 'column', label: 'Column', icon: 'style-column' },
                    { value: 'row', label: 'Row', icon: 'style-row' },
                  ]"
                  :model-value="(selectedBlock.styles as ContainerStyles).flexDirection || 'column'"
                  icon-only
                  @update:model-value="updateBlockStyles({ flexDirection: $event })"
                />
              </InspectorField>
              <InspectorField label="Justify" horizontal>
                <SegmentedControl
                  :options="(selectedBlock.styles as ContainerStyles).flexDirection === 'row' ? [
                    { value: 'flex-start', label: 'Left', icon: 'style-justify-start' },
                    { value: 'center', label: 'Center', icon: 'style-justify-center' },
                    { value: 'flex-end', label: 'Right', icon: 'style-justify-end' },
                    { value: 'space-between', label: 'Between', icon: 'style-justify-between' },
                  ] : [
                    { value: 'flex-start', label: 'Top', icon: 'style-align-start' },
                    { value: 'center', label: 'Center', icon: 'content-divider' },
                    { value: 'flex-end', label: 'Bottom', icon: 'style-align-bottom' },
                    { value: 'space-between', label: 'Between', icon: 'style-align-stretch' },
                  ]"
                  :model-value="(selectedBlock.styles as ContainerStyles).justifyContent || 'flex-start'"
                  icon-only
                  @update:model-value="updateBlockStyles({ justifyContent: $event })"
                />
              </InspectorField>
              <InspectorField label="Align" horizontal>
                <SegmentedControl
                  :options="(selectedBlock.styles as ContainerStyles).flexDirection === 'row' ? [
                    { value: 'flex-start', label: 'Top', icon: 'style-align-start' },
                    { value: 'center', label: 'Center', icon: 'content-divider' },
                    { value: 'flex-end', label: 'Bottom', icon: 'style-align-bottom' },
                    { value: 'stretch', label: 'Stretch', icon: 'style-align-stretch' },
                  ] : [
                    { value: 'flex-start', label: 'Left', icon: 'style-justify-start' },
                    { value: 'center', label: 'Center', icon: 'style-justify-center' },
                    { value: 'flex-end', label: 'Right', icon: 'style-justify-end' },
                    { value: 'stretch', label: 'Stretch', icon: 'style-justify-between' },
                  ]"
                  :model-value="(selectedBlock.styles as ContainerStyles).alignItems || 'stretch'"
                  icon-only
                  @update:model-value="updateBlockStyles({ alignItems: $event })"
                />
              </InspectorField>
              <InspectorField label="Gap" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.styles as ContainerStyles).gap || '16'"
                  :min="0"
                  :max="64"
                  :step="4"
                  @update:model-value="updateBlockStyles({ gap: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Background" icon="content-image">
              <InspectorField label="Type" horizontal>
                <SegmentedControl
                  :options="[
                    { value: 'color', label: 'Color', icon: 'style-color' },
                    { value: 'image', label: 'Image', icon: 'content-image' },
                    { value: 'video', label: 'Video', icon: 'content-video' },
                  ]"
                  :model-value="(selectedBlock.settings as ContainerSettings).backgroundType || 'color'"
                  icon-only
                  @update:model-value="updateBlockSettings({ backgroundType: $event })"
                />
              </InspectorField>
              <InspectorField v-if="(selectedBlock.settings as ContainerSettings).backgroundType === 'color' || !(selectedBlock.settings as ContainerSettings).backgroundType" label="Color" horizontal>
                <ColorInput
                  :model-value="responsiveStyles.backgroundColor"
                  swatch-only
                  @update:model-value="updateBlockStyles({ backgroundColor: $event })"
                />
              </InspectorField>
              <InspectorField v-else-if="(selectedBlock.settings as ContainerSettings).backgroundType === 'image'" label="Image">
                <ImageInput
                  :model-value="(selectedBlock.settings as ContainerSettings).backgroundImage || ''"
                  placeholder="Upload background image"
                  @update:model-value="updateBlockSettings({ backgroundImage: $event })"
                />
              </InspectorField>
              <InspectorField v-else label="Video URL">
                <TextInput
                  :model-value="(selectedBlock.settings as ContainerSettings).backgroundVideo || ''"
                  placeholder="YouTube, Vimeo, or file URL"
                  @update:model-value="updateBlockSettings({ backgroundVideo: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Grid Settings -->
          <template v-else-if="selectedBlock.type === 'grid'">
            <!-- Slider Mode Settings (when isSlider is true) -->
            <template v-if="(selectedBlock.settings as GridSettings).isSlider">
              <InspectorSection title="Slider" icon="list-slider">
                <InspectorField label="Slides Per View" horizontal>
                  <SliderInput
                    :model-value="String((selectedBlock.settings as GridSettings).slidesPerView || 1)"
                    :min="1"
                    :max="4"
                    :step="1"
                    unit=""
                    @update:model-value="updateBlockSettings({ slidesPerView: Number($event) })"
                  />
                </InspectorField>
                <InspectorField label="Gap" horizontal>
                  <SliderInput
                    :model-value="(selectedBlock.settings as GridSettings).gap || '16'"
                    :min="0"
                    :max="48"
                    :step="4"
                    @update:model-value="updateBlockSettings({ gap: $event })"
                  />
                </InspectorField>
                <InspectorField label="Min Height" horizontal>
                  <SliderInput
                    :model-value="(selectedBlock.settings as GridSettings).height || '0'"
                    :min="0"
                    :max="100"
                    :step="25"
                    unit="vh"
                    @update:model-value="updateBlockSettings({ height: $event })"
                  />
                </InspectorField>
              </InspectorSection>
              <InspectorSection title="Navigation" icon="chevron-left">
                <InspectorField label="Show Arrows" horizontal>
                  <ToggleInput
                    :model-value="(selectedBlock.settings as GridSettings).showArrows ?? true"
                    @update:model-value="updateBlockSettings({ showArrows: $event })"
                  />
                </InspectorField>
                <InspectorField label="Show Dots" horizontal>
                  <ToggleInput
                    :model-value="(selectedBlock.settings as GridSettings).showDots ?? true"
                    @update:model-value="updateBlockSettings({ showDots: $event })"
                  />
                </InspectorField>
                <InspectorField label="Loop" horizontal>
                  <ToggleInput
                    :model-value="(selectedBlock.settings as GridSettings).loop ?? false"
                    @update:model-value="updateBlockSettings({ loop: $event })"
                  />
                </InspectorField>
              </InspectorSection>
              <InspectorSection title="Autoplay" icon="play">
                <InspectorField label="Enable Autoplay" horizontal>
                  <ToggleInput
                    :model-value="(selectedBlock.settings as GridSettings).autoplay ?? false"
                    @update:model-value="updateBlockSettings({ autoplay: $event })"
                  />
                </InspectorField>
                <InspectorField v-if="(selectedBlock.settings as GridSettings).autoplay" label="Interval (ms)" horizontal>
                  <SliderInput
                    :model-value="String((selectedBlock.settings as GridSettings).autoplayInterval || 5000)"
                    :min="2000"
                    :max="10000"
                    :step="500"
                    unit=""
                    @update:model-value="updateBlockSettings({ autoplayInterval: Number($event) })"
                  />
                </InspectorField>
              </InspectorSection>
            </template>
            <!-- Regular Grid Settings (when not in slider mode) -->
            <template v-else>
              <InspectorSection title="Grid" icon="layout-grid">
                <InspectorField label="Columns" horizontal>
                  <SliderInput
                    :model-value="String((selectedBlock.settings as GridSettings).columns || 2)"
                    :min="1"
                    :max="12"
                    :step="1"
                    unit=""
                    @update:model-value="updateBlockSettings({ columns: Number($event), columnWidths: undefined })"
                  />
                </InspectorField>
                <!-- Column widths display -->
                <div v-if="(selectedBlock.settings as GridSettings).columnWidths" class="px-3 py-2 text-xs text-muted-foreground">
                  <div class="flex items-center justify-between mb-1">
                    <span>Column widths:</span>
                    <button
                      class="text-[10px] text-primary hover:underline"
                      @click="updateBlockSettings({ columnWidths: undefined })"
                    >Reset</button>
                  </div>
                  <div class="flex gap-1">
                    <span
                      v-for="(w, i) in (selectedBlock.settings as GridSettings).columnWidths"
                      :key="i"
                      class="px-1.5 py-0.5 bg-secondary rounded text-[10px]"
                    >{{ w }}fr</span>
                  </div>
                </div>
                <InspectorField label="Gap" horizontal>
                  <SliderInput
                    :model-value="(selectedBlock.settings as GridSettings).gap || '16'"
                    :min="0"
                    :max="48"
                    :step="4"
                    @update:model-value="updateBlockSettings({ gap: $event })"
                  />
                </InspectorField>
                <InspectorField label="Min Height" horizontal>
                  <SliderInput
                    :model-value="(selectedBlock.settings as GridSettings).height || '0'"
                    :min="0"
                    :max="100"
                    :step="25"
                    unit="vh"
                    @update:model-value="updateBlockSettings({ height: $event })"
                  />
                </InspectorField>
              </InspectorSection>
            </template>
            <InspectorSection title="Content Position" icon="style-border-top">
              <InspectorField label="Justify" horizontal>
                <SegmentedControl
                  :options="justifyItemsOptions"
                  :model-value="(selectedBlock.styles as GridStyles).justifyItems || 'stretch'"
                  icon-only
                  @update:model-value="updateBlockStyles({ justifyItems: $event })"
                />
              </InspectorField>
              <InspectorField label="Align" horizontal>
                <SegmentedControl
                  :options="alignItemsOptions"
                  :model-value="(selectedBlock.styles as GridStyles).alignItems || 'stretch'"
                  icon-only
                  @update:model-value="updateBlockStyles({ alignItems: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Background" icon="content-image">
              <InspectorField label="Type" horizontal>
                <SegmentedControl
                  :options="[
                    { value: 'color', label: 'Color', icon: 'style-color' },
                    { value: 'image', label: 'Image', icon: 'content-image' },
                    { value: 'video', label: 'Video', icon: 'content-video' },
                  ]"
                  :model-value="(selectedBlock.settings as GridSettings).backgroundType || 'color'"
                  icon-only
                  @update:model-value="updateBlockSettings({ backgroundType: $event })"
                />
              </InspectorField>
              <InspectorField v-if="(selectedBlock.settings as GridSettings).backgroundType === 'color' || !(selectedBlock.settings as GridSettings).backgroundType" label="Color" horizontal>
                <ColorInput
                  :model-value="responsiveStyles.backgroundColor"
                  swatch-only
                  @update:model-value="updateBlockStyles({ backgroundColor: $event })"
                />
              </InspectorField>
              <InspectorField v-else-if="(selectedBlock.settings as GridSettings).backgroundType === 'image'" label="Image">
                <ImageInput
                  :model-value="(selectedBlock.settings as GridSettings).backgroundImage || ''"
                  placeholder="Upload background image"
                  @update:model-value="updateBlockSettings({ backgroundImage: $event })"
                />
              </InspectorField>
              <InspectorField v-else label="Video URL">
                <TextInput
                  :model-value="(selectedBlock.settings as GridSettings).backgroundVideo || ''"
                  placeholder="YouTube, Vimeo, or file URL"
                  @update:model-value="updateBlockSettings({ backgroundVideo: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Stack Settings -->
          <template v-else-if="selectedBlock.type === 'stack'">
            <!-- Overwrite Style Toggle (only for blocks inside List/Collection) -->
            <div v-if="isListCollectionItem" class="px-4 py-3 border-b border-sidebar-border">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-xs font-medium text-foreground">Overwrite style</p>
                  <p class="text-[10px] text-muted-foreground">Apply unique styles to this item only</p>
                </div>
                <ToggleInput
                  :model-value="hasOverwriteStyle"
                  @update:model-value="toggleOverwriteStyle"
                />
              </div>
            </div>
            <InspectorSection title="Stack" icon="layout-stack">
              <InspectorField label="Direction" horizontal>
                <SegmentedControl
                  :options="[
                    { value: 'vertical', label: 'Vertical', icon: 'style-column' },
                    { value: 'horizontal', label: 'Horizontal', icon: 'style-row' },
                  ]"
                  :model-value="(selectedBlock.settings as StackSettings).direction || 'vertical'"
                  icon-only
                  @update:model-value="updateBlockSettings({ direction: $event })"
                />
              </InspectorField>
              <InspectorField label="Gap" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.settings as StackSettings).gap || '16'"
                  :min="0"
                  :max="64"
                  :step="4"
                  @update:model-value="updateBlockSettings({ gap: $event })"
                />
              </InspectorField>
              <InspectorField label="Min Height" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.settings as StackSettings).height || '0'"
                  :min="0"
                  :max="100"
                  :step="25"
                  unit="vh"
                  @update:model-value="updateBlockSettings({ height: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Content Position" icon="style-border-top">
              <InspectorField label="Justify" horizontal>
                <SegmentedControl
                  :options="justifyContentOptions"
                  :model-value="(selectedBlock.styles as StackStyles).justifyContent || 'flex-start'"
                  icon-only
                  @update:model-value="updateBlockStyles({ justifyContent: $event })"
                />
              </InspectorField>
              <InspectorField label="Align" horizontal>
                <SegmentedControl
                  :options="alignItemsOptions"
                  :model-value="(selectedBlock.styles as StackStyles).alignItems || 'stretch'"
                  icon-only
                  @update:model-value="updateBlockStyles({ alignItems: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Background" icon="content-image">
              <InspectorField label="Type" horizontal>
                <SegmentedControl
                  :options="[
                    { value: 'color', label: 'Color', icon: 'style-color' },
                    { value: 'image', label: 'Image', icon: 'content-image' },
                    { value: 'video', label: 'Video', icon: 'content-video' },
                  ]"
                  :model-value="(selectedBlock.settings as StackSettings).backgroundType || 'color'"
                  icon-only
                  @update:model-value="updateBlockSettings({ backgroundType: $event })"
                />
              </InspectorField>
              <InspectorField v-if="(selectedBlock.settings as StackSettings).backgroundType === 'color' || !(selectedBlock.settings as StackSettings).backgroundType" label="Color" horizontal>
                <ColorInput
                  :model-value="responsiveStyles.backgroundColor"
                  swatch-only
                  @update:model-value="updateBlockStyles({ backgroundColor: $event })"
                />
              </InspectorField>
              <InspectorField v-else-if="(selectedBlock.settings as StackSettings).backgroundType === 'image'" label="Image">
                <ImageInput
                  :model-value="(selectedBlock.settings as StackSettings).backgroundImage || ''"
                  placeholder="Upload background image"
                  @update:model-value="updateBlockSettings({ backgroundImage: $event })"
                />
              </InspectorField>
              <InspectorField v-else label="Video URL">
                <TextInput
                  :model-value="(selectedBlock.settings as StackSettings).backgroundVideo || ''"
                  placeholder="YouTube, Vimeo, or file URL"
                  @update:model-value="updateBlockSettings({ backgroundVideo: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Shadow" icon="layout-stack">
              <InspectorField label="Size" horizontal>
                <div class="flex p-0.5 bg-secondary rounded-md">
                  <Tooltip text="None">
                    <button
                      type="button"
                      class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
                      :class="!responsiveStyles.shadow?.enabled
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'"
                      @click="updateBlockStyles({ shadow: { enabled: false } })"
                    >
                      <Icon name="ban" class="text-xs" />
                    </button>
                  </Tooltip>
                  <Tooltip text="Small">
                    <button
                      type="button"
                      class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
                      :class="responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '8'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'"
                      @click="updateBlockStyles({ shadow: { enabled: true, x: '0', y: '2', blur: '8', color: responsiveStyles.shadow?.color || 'rgba(0,0,0,0.1)' } })"
                    >
                      S
                    </button>
                  </Tooltip>
                  <Tooltip text="Medium">
                    <button
                      type="button"
                      class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
                      :class="responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '16'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'"
                      @click="updateBlockStyles({ shadow: { enabled: true, x: '0', y: '4', blur: '16', color: responsiveStyles.shadow?.color || 'rgba(0,0,0,0.1)' } })"
                    >
                      M
                    </button>
                  </Tooltip>
                  <Tooltip text="Large">
                    <button
                      type="button"
                      class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
                      :class="responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '32'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'"
                      @click="updateBlockStyles({ shadow: { enabled: true, x: '0', y: '8', blur: '32', color: responsiveStyles.shadow?.color || 'rgba(0,0,0,0.15)' } })"
                    >
                      L
                    </button>
                  </Tooltip>
                </div>
              </InspectorField>
              <InspectorField v-if="responsiveStyles.shadow?.enabled" label="Color" horizontal>
                <ColorInput
                  :model-value="responsiveStyles.shadow?.color || 'rgba(0,0,0,0.1)'"
                  swatch-only
                  @update:model-value="updateBlockStyles({ shadow: { ...responsiveStyles.shadow, color: $event } })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Generic Styles (for blocks without specific inspector) -->
          <template v-else>
            <InspectorSection title="Style" icon="style-color">
              <InspectorField label="Background" horizontal>
                <ColorInput
                  :model-value="(selectedBlock.styles as BaseBlockStyles).backgroundColor"
                  swatch-only
                  @update:model-value="updateBlockStyles({ backgroundColor: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

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

          <!-- Debug Section (shows applied styles) -->
          <InspectorSection title="Debug" icon="app-settings">
            <div class="px-3 pb-3">
              <div class="text-xxs font-mono text-muted-foreground mb-2">Block ID: {{ selectedBlock.id }}</div>
              <div class="text-xxs font-mono text-muted-foreground mb-2">Type: {{ selectedBlock.type }}</div>
              <div class="text-xxs font-mono text-muted-foreground mb-1">Styles ({{ currentViewport }}):</div>
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
</template>
