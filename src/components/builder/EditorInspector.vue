<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useProjectsStore } from '@/stores/projects'
import { useRoute } from 'vue-router'
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
} from '@/lib/editor-utils'
import { getStylesForUseCase } from '@/lib/layouts'
import {
  getResponsiveStyles,
  setViewportStyleOverrides,
  hasViewportOverride,
  getInheritedValue,
} from '@/lib/style-utils'
import type {
  PageSettings,
  HeaderSettings,
  HeaderNavLink,
  FooterSettings,
  FooterLink,
  FooterSocialLink,
  FormSettings,
  FormInputSettings,
  FormTextareaSettings,
  FormSelectSettings,
  FormRadioSettings,
  FormCheckboxSettings,
  FormButtonSettings,
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
  ContainerSettings,
  ContainerStyles,
  GridSettings,
  GridStyles,
  StackSettings,
  StackStyles,
  ButtonStyles,
  AnimationSettings,
  FreeformSettings,
} from '@/types/editor'

import InspectorSection from '@/components/inspector/InspectorSection.vue'
import InspectorField from '@/components/inspector/InspectorField.vue'
import SegmentedControl from '@/components/inspector/SegmentedControl.vue'
import SpacingInput from '@/components/inspector/SpacingInput.vue'
import ColorInput from '@/components/inspector/ColorInput.vue'
import SelectInput from '@/components/inspector/SelectInput.vue'
import SliderInput from '@/components/inspector/SliderInput.vue'
import FontSizeSlider from '@/components/inspector/FontSizeSlider.vue'
import TextInput from '@/components/inspector/TextInput.vue'
import ImageInput from '@/components/inspector/ImageInput.vue'
import ToggleInput from '@/components/inspector/ToggleInput.vue'
import BorderInput from '@/components/inspector/BorderInput.vue'
import AnimationSection from '@/components/inspector/AnimationSection.vue'

const editorStore = useEditorStore()
const projectsStore = useProjectsStore()
const route = useRoute()

const selectedBlock = computed(() => editorStore.selectedBlock)
const selectedItemId = computed(() => editorStore.selectedItemId)
const pageSettings = computed(() => editorStore.pageSettings)
const currentViewport = computed(() => editorStore.viewport)

// Get responsive styles for the current viewport (merged/cascaded)
const responsiveStyles = computed((): CoreBlockStyles => {
  if (!selectedBlock.value) return {}
  return getResponsiveStyles(selectedBlock.value.styles as BaseBlockStyles, currentViewport.value)
})

// Check if selected block is inside a List/Collection (Grid > Stack pattern)
const isInListCollection = computed(() => {
  if (!selectedBlock.value) return false
  return editorStore.isInsideListCollection(selectedBlock.value.id)
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
  const path: BreadcrumbItem[] = [{ id: null, label: 'Page', icon: 'lni-home-2' }]

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
        path.push({ id: `item:${link.id}`, label: link.label || 'Nav Link', icon: 'lni-link-2' })
      }
    }

    // Footer link
    if (block.type === 'footer' && Array.isArray(settings.links)) {
      const link = (settings.links as FooterLink[]).find(l => l.id === selectedItemId.value)
      if (link) {
        path.push({ id: `item:${link.id}`, label: link.label || 'Footer Link', icon: 'lni-link-2' })
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
const isFreeformSection = computed(() => selectedBlock.value?.type === 'freeform')

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

const sectionGapOptions = [
  { value: '0', label: '0' },
  { value: '16px', label: '16' },
  { value: '24px', label: '24' },
  { value: '32px', label: '32' },
  { value: '48px', label: '48' },
  { value: '64px', label: '64' },
]

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
        title="Page"
        @click="editorStore.selectBlock(null)"
      >
        <i class="lni lni-home-2 text-sm"></i>
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
        :title="block.name"
        @click="editorStore.selectBlock(block.id)"
      >
        <i :class="['lni', sectionBlockIcons[block.type], 'text-sm']"></i>
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
              class="lni lni-chevron-right text-[10px] text-muted-foreground/50 shrink-0"
            ></i>
            <!-- Previous items: icon only, expands on hover -->
            <button
              v-if="index < breadcrumbPath.length - 1"
              class="flex items-center h-6 rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 ease-out shrink-0 overflow-hidden"
              :class="hoveredBreadcrumbId === (item.id ?? 'page') ? 'px-2 gap-1.5' : 'w-6 justify-center'"
              :title="item.label"
              @mouseenter="hoveredBreadcrumbId = item.id ?? 'page'"
              @mouseleave="hoveredBreadcrumbId = null"
              @click="handleBreadcrumbClick(item)"
            >
              <i v-if="item.icon" :class="['lni', item.icon, 'text-sm shrink-0']"></i>
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
              <i v-if="item.icon" :class="['lni', item.icon, 'text-[10px]']"></i>
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
          <InspectorSection v-if="hasLayoutStyles" title="Layout Style" icon="lni-layers-1">
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

          <!-- Spacing -->
          <InspectorSection title="Spacing" icon="lni-arrow-both-direction-horizontal-1">
            <InspectorField label="Max Width" horizontal>
              <SelectInput
                :options="maxWidthOptions"
                :model-value="pageSettings.maxWidth"
                @update:model-value="updatePageSetting('maxWidth', $event)"
              />
            </InspectorField>
            <InspectorField label="Padding">
              <SpacingInput
                :model-value="pageSettings.padding"
                @update:model-value="updatePageSetting('padding', $event)"
              />
            </InspectorField>
            <InspectorField label="Section Gap" horizontal>
              <SelectInput
                :options="sectionGapOptions"
                :model-value="pageSettings.sectionGap"
                @update:model-value="updatePageSetting('sectionGap', $event)"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Typography -->
          <InspectorSection title="Typography" icon="lni-text-format">
            <InspectorField label="Font Family">
              <SelectInput
                :options="fontFamilyOptions"
                :model-value="pageSettings.fontFamily"
                @update:model-value="updatePageSetting('fontFamily', $event)"
              />
            </InspectorField>
            <InspectorField label="Text Color" horizontal>
              <ColorInput
                :model-value="pageSettings.textColor"
                swatch-only
                @update:model-value="updatePageSetting('textColor', $event)"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Background -->
          <InspectorSection title="Background" icon="lni-photos">
            <InspectorField label="Color" horizontal>
              <ColorInput
                :model-value="pageSettings.backgroundColor"
                swatch-only
                @update:model-value="updatePageSetting('backgroundColor', $event)"
              />
            </InspectorField>
            <InspectorField label="Image URL">
              <TextInput
                :model-value="pageSettings.backgroundImage"
                placeholder="https://..."
                @update:model-value="updatePageSetting('backgroundImage', $event)"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Header Nav Link Inspector -->
        <template v-else-if="selectedHeaderNavLink">
          <InspectorSection title="Navigation Link" icon="lni-link-1">
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
          <InspectorSection title="Footer Link" icon="lni-link-1">
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
          <InspectorSection title="Social Link" icon="lni-link-1">
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
          <InspectorSection title="Input Settings" icon="lni-keyboard">
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
        </template>

        <!-- Form Textarea -->
        <template v-else-if="selectedBlock?.type === 'form-textarea'">
          <InspectorSection title="Textarea Settings" icon="lni-text-paragraph">
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
        </template>

        <!-- Form Select (Dropdown) -->
        <template v-else-if="selectedBlock?.type === 'form-select'">
          <InspectorSection title="Dropdown Settings" icon="lni-chevron-down-circle">
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
          <InspectorSection title="Options" icon="lni-list-bulleted-1">
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
                  <i class="lni lni-xmark text-sm"></i>
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
                <i class="lni lni-plus text-xs"></i>
                Add option
              </button>
            </div>
          </InspectorSection>
        </template>

        <!-- Form Radio -->
        <template v-else-if="selectedBlock?.type === 'form-radio'">
          <InspectorSection title="Radio Settings" icon="lni-radio-button">
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
          <InspectorSection title="Options" icon="lni-list-bulleted-1">
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
                  <i class="lni lni-xmark text-sm"></i>
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
                <i class="lni lni-plus text-xs"></i>
                Add option
              </button>
            </div>
          </InspectorSection>
        </template>

        <!-- Form Checkbox -->
        <template v-else-if="selectedBlock?.type === 'form-checkbox'">
          <InspectorSection title="Checkbox Settings" icon="lni-checkmark-square">
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
          <InspectorSection title="Options" icon="lni-list-bulleted-1">
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
                  <i class="lni lni-xmark text-sm"></i>
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
                <i class="lni lni-plus text-xs"></i>
                Add option
              </button>
            </div>
          </InspectorSection>
        </template>

        <!-- Form Button -->
        <template v-else-if="selectedBlock?.type === 'form-button'">
          <InspectorSection title="Button Settings" icon="lni-arrow-right-circle">
            <InspectorField label="Label">
              <TextInput
                :model-value="(selectedBlock.settings as FormButtonSettings).label"
                placeholder="Submit"
                @update:model-value="updateBlockSettings({ label: $event })"
              />
            </InspectorField>
            <InspectorField label="Variant">
              <SegmentedControl
                :model-value="(selectedBlock.settings as FormButtonSettings).variant || 'primary'"
                :options="buttonVariantOptions"
                @update:model-value="updateBlockSettings({ variant: $event })"
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
        </template>

        <!-- Header Section Inspector -->
        <template v-else-if="isHeaderSection && selectedBlock">
          <InspectorSection title="Header Settings" icon="lni-navigation-up">
            <div class="space-y-3 px-3">
              <ToggleInput
                :model-value="!(selectedBlock.settings as HeaderSettings).isHidden"
                label="Show header"
                @update:model-value="updateBlockSettings({ isHidden: !$event })"
              />
            </div>
          </InspectorSection>

          <InspectorSection title="Logo" icon="lni-image">
            <InspectorField label="Image">
              <ImageInput
                :model-value="(selectedBlock.settings as HeaderSettings).logo"
                placeholder="Upload logo"
                @update:model-value="updateBlockSettings({ logo: $event })"
              />
            </InspectorField>
            <InspectorField label="Alt Text">
              <TextInput
                :model-value="(selectedBlock.settings as HeaderSettings).logoAlt"
                placeholder="Logo description"
                @update:model-value="updateBlockSettings({ logoAlt: $event })"
              />
            </InspectorField>
          </InspectorSection>

          <InspectorSection title="CTA Button" icon="lni-pointer-1">
            <div class="space-y-3 px-3">
              <ToggleInput
                :model-value="(selectedBlock.settings as HeaderSettings).ctaButton.show"
                label="Show CTA button"
                @update:model-value="updateBlockSettings({ ctaButton: { ...(selectedBlock.settings as HeaderSettings).ctaButton, show: $event } })"
              />
            </div>
            <template v-if="(selectedBlock.settings as HeaderSettings).ctaButton.show">
              <InspectorField label="Label">
                <TextInput
                  :model-value="getHeaderCtaLabel()"
                  placeholder="Get Started"
                  @update:model-value="updateHeaderCtaLabel($event)"
                />
              </InspectorField>
              <InspectorField label="URL">
                <TextInput
                  :model-value="(selectedBlock.settings as HeaderSettings).ctaButton.url"
                  placeholder="https://..."
                  @update:model-value="updateBlockSettings({ ctaButton: { ...(selectedBlock.settings as HeaderSettings).ctaButton, url: $event } })"
                />
              </InspectorField>
            </template>
          </InspectorSection>
        </template>

        <!-- Footer Section Inspector -->
        <template v-else-if="isFooterSection && selectedBlock">
          <InspectorSection title="Footer Settings" icon="lni-navigation-down">
            <div class="space-y-3 px-3">
              <ToggleInput
                :model-value="!(selectedBlock.settings as FooterSettings).isHidden"
                label="Show footer"
                @update:model-value="updateBlockSettings({ isHidden: !$event })"
              />
            </div>
          </InspectorSection>

          <InspectorSection title="Copyright" icon="lni-text-format">
            <InspectorField label="Text">
              <TextInput
                :model-value="getTranslatableContent('copyrightText')"
                placeholder="© 2024 Company Name"
                @update:model-value="updateTranslatableContent('copyrightText', $event)"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Form Section Inspector -->
        <template v-else-if="isFormSection && selectedBlock">
          <InspectorSection title="Form Settings" icon="lni-clipboard-data">
            <InspectorField label="Submit Button">
              <TextInput
                :model-value="getTranslatableContent('submitLabel')"
                placeholder="Submit"
                @update:model-value="updateTranslatableContent('submitLabel', $event)"
              />
            </InspectorField>
            <InspectorField label="Success Message">
              <TextInput
                :model-value="(selectedBlock.settings as FormSettings).successMessage"
                placeholder="Thank you for your submission!"
                multiline
                @update:model-value="updateBlockSettings({ successMessage: $event })"
              />
            </InspectorField>
          </InspectorSection>
        </template>

        <!-- Freeform Section Inspector -->
        <template v-else-if="isFreeformSection && selectedBlock">
          <InspectorSection title="Background" icon="lni-photos">
            <InspectorField label="Type">
              <SegmentedControl
                :options="[
                  { value: 'color', label: 'Color' },
                  { value: 'image', label: 'Image' },
                  { value: 'video', label: 'Video' },
                ]"
                :model-value="(selectedBlock.settings as FreeformSettings).backgroundType || 'color'"
                @update:model-value="updateBlockSettings({ backgroundType: $event })"
              />
            </InspectorField>
            <InspectorField v-if="(selectedBlock.settings as FreeformSettings).backgroundType === 'color' || !(selectedBlock.settings as FreeformSettings).backgroundType" label="Color" horizontal>
              <ColorInput
                :model-value="responsiveStyles.backgroundColor"
                swatch-only
                @update:model-value="updateBlockStyles({ backgroundColor: $event })"
              />
            </InspectorField>
            <InspectorField v-else-if="(selectedBlock.settings as FreeformSettings).backgroundType === 'image'" label="Image">
              <ImageInput
                :model-value="(selectedBlock.settings as FreeformSettings).backgroundImage || ''"
                placeholder="Upload background image"
                @update:model-value="updateBlockSettings({ backgroundImage: $event })"
              />
            </InspectorField>
            <InspectorField v-else label="Video URL">
              <TextInput
                :model-value="(selectedBlock.settings as FreeformSettings).backgroundVideo || ''"
                placeholder="YouTube, Vimeo, or file URL"
                @update:model-value="updateBlockSettings({ backgroundVideo: $event })"
              />
            </InspectorField>
          </InspectorSection>

          <InspectorSection title="Size" icon="lni-frame-3">
            <InspectorField label="Min Height">
              <SelectInput
                :options="[
                  { value: '100vh', label: 'Full Screen' },
                  { value: '80vh', label: '80%' },
                  { value: '60vh', label: '60%' },
                  { value: '50vh', label: '50%' },
                  { value: '400px', label: '400px' },
                  { value: '500px', label: '500px' },
                  { value: '600px', label: '600px' },
                  { value: '800px', label: '800px' },
                ]"
                :model-value="(selectedBlock.settings as FreeformSettings).minHeight || '600px'"
                @update:model-value="updateBlockSettings({ minHeight: $event })"
              />
            </InspectorField>
          </InspectorSection>

          <InspectorSection title="Info" icon="lni-information">
            <div class="px-3 py-2 text-xs text-muted-foreground">
              <p>Drag elements from the sidebar onto this canvas to position them freely.</p>
              <p class="mt-2">Children can be repositioned by dragging them on the preview.</p>
            </div>
          </InspectorSection>
        </template>

        <!-- Generic Block Inspector -->
        <template v-else-if="selectedBlock">
          <!-- Heading Settings -->
          <template v-if="selectedBlock.type === 'heading'">
            <!-- Overwrite Style Toggle (only for blocks inside List/Collection) -->
            <div v-if="isInListCollection" class="px-4 py-3 border-b border-sidebar-border">
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
            <InspectorSection title="Content" icon="lni-text-format">
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
            <InspectorSection title="Style" icon="lni-brush-2">
              <InspectorField label="Font Size" horizontal>
                <FontSizeSlider
                  :model-value="(selectedBlock.styles as HeadingStyles).fontSize || 'xl'"
                  @update:model-value="updateBlockStyles({ fontSize: $event })"
                />
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
                  :model-value="(selectedBlock.styles as HeadingStyles).color"
                  swatch-only
                  @update:model-value="updateBlockStyles({ color: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Text Settings -->
          <template v-else-if="selectedBlock.type === 'text'">
            <!-- Overwrite Style Toggle (only for blocks inside List/Collection) -->
            <div v-if="isInListCollection" class="px-4 py-3 border-b border-sidebar-border">
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
            <InspectorSection title="Content" icon="lni-text-paragraph">
              <InspectorField label="Text">
                <TextInput
                  :model-value="getTranslatableContent('content')"
                  placeholder="Enter your text..."
                  multiline
                  @update:model-value="updateTranslatableContent('content', $event)"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Style" icon="lni-brush-2">
              <InspectorField label="Font Size" horizontal>
                <FontSizeSlider
                  :model-value="(selectedBlock.styles as TextStyles).fontSize || 'base'"
                  @update:model-value="updateBlockStyles({ fontSize: $event })"
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
            <div v-if="isInListCollection" class="px-4 py-3 border-b border-sidebar-border">
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
            <InspectorSection title="Image" icon="lni-photos">
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
            </InspectorSection>
            <InspectorSection title="Style" icon="lni-brush-2">
              <InspectorField label="Border Radius" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.styles as ImageStyles).borderRadius || '8'"
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
            <InspectorSection title="Video" icon="lni-video-alt">
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
            <InspectorSection title="Style" icon="lni-brush-2">
              <InspectorField label="Aspect Ratio">
                <SelectInput
                  :options="[
                    { value: '16:9', label: '16:9' },
                    { value: '4:3', label: '4:3' },
                    { value: '1:1', label: '1:1' },
                    { value: '9:16', label: '9:16' },
                    { value: 'auto', label: 'Auto' },
                  ]"
                  :model-value="(selectedBlock.styles as VideoStyles).aspectRatio || '16:9'"
                  @update:model-value="updateBlockStyles({ aspectRatio: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Button Settings -->
          <template v-else-if="selectedBlock.type === 'button'">
            <!-- Overwrite Style Toggle (only for blocks inside List/Collection) -->
            <div v-if="isInListCollection" class="px-4 py-3 border-b border-sidebar-border">
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
            <InspectorSection title="Button" icon="lni-power-button">
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
              <InspectorField label="Variant" horizontal>
                <SegmentedControl
                  :options="buttonVariantOptions"
                  :model-value="(selectedBlock.settings as ButtonSettings).variant"
                  @update:model-value="updateBlockSettings({ variant: $event })"
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
            <InspectorSection title="Style" icon="lni-brush-2">
              <InspectorField label="Font Size" horizontal>
                <FontSizeSlider
                  :model-value="(selectedBlock.styles as ButtonStyles).fontSize || 'base'"
                  @update:model-value="updateBlockStyles({ fontSize: $event })"
                />
              </InspectorField>
              <InspectorField label="Line Height" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.styles as ButtonStyles).lineHeight || '1.5'"
                  :min="1"
                  :max="2.5"
                  :step="0.1"
                  @update:model-value="updateBlockStyles({ lineHeight: $event })"
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
            <InspectorSection title="Divider" icon="lni-minus">
              <InspectorField label="Style">
                <SelectInput
                  :options="[
                    { value: 'line', label: 'Line' },
                    { value: 'dashed', label: 'Dashed' },
                    { value: 'dotted', label: 'Dotted' },
                    { value: 'space', label: 'Space' },
                  ]"
                  :model-value="(selectedBlock.settings as DividerSettings).style || 'line'"
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
            <div v-if="isInListCollection" class="px-4 py-3 border-b border-sidebar-border">
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
            <InspectorSection title="Icon" icon="lni-star">
              <InspectorField label="Icon Name">
                <TextInput
                  :model-value="(selectedBlock.settings as IconSettings).icon"
                  placeholder="lni-star"
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
            <InspectorSection title="Style" icon="lni-brush-2">
              <InspectorField label="Color" horizontal>
                <ColorInput
                  :model-value="(selectedBlock.styles as IconStyles).color"
                  swatch-only
                  @update:model-value="updateBlockStyles({ color: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Container Settings -->
          <template v-else-if="selectedBlock.type === 'container'">
            <InspectorSection title="Container" icon="lni-layout-26">
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
              <InspectorField label="Height" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.settings as ContainerSettings).height || '100'"
                  :min="0"
                  :max="100"
                  :step="10"
                  unit="%"
                  @update:model-value="updateBlockSettings({ height: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Content Position" icon="lni-layout-3">
              <InspectorField label="Direction" horizontal>
                <SegmentedControl
                  :options="[
                    { value: 'column', label: 'Column', icon: 'lni-arrow-downward' },
                    { value: 'row', label: 'Row', icon: 'lni-arrow-right' },
                  ]"
                  :model-value="(selectedBlock.styles as ContainerStyles).flexDirection || 'column'"
                  icon-only
                  @update:model-value="updateBlockStyles({ flexDirection: $event })"
                />
              </InspectorField>
              <InspectorField label="Justify" horizontal>
                <SegmentedControl
                  :options="(selectedBlock.styles as ContainerStyles).flexDirection === 'row' ? [
                    { value: 'flex-start', label: 'Left', icon: 'lni-shift-left' },
                    { value: 'center', label: 'Center', icon: 'lni-align-text-center' },
                    { value: 'flex-end', label: 'Right', icon: 'lni-shift-right' },
                    { value: 'space-between', label: 'Between', icon: 'lni-arrow-both-direction-horizontal-1' },
                  ] : [
                    { value: 'flex-start', label: 'Top', icon: 'lni-arrow-upward' },
                    { value: 'center', label: 'Center', icon: 'lni-minus' },
                    { value: 'flex-end', label: 'Bottom', icon: 'lni-arrow-downward' },
                    { value: 'space-between', label: 'Between', icon: 'lni-arrow-both-direction-vertical-1' },
                  ]"
                  :model-value="(selectedBlock.styles as ContainerStyles).justifyContent || 'flex-start'"
                  icon-only
                  @update:model-value="updateBlockStyles({ justifyContent: $event })"
                />
              </InspectorField>
              <InspectorField label="Align" horizontal>
                <SegmentedControl
                  :options="(selectedBlock.styles as ContainerStyles).flexDirection === 'row' ? [
                    { value: 'flex-start', label: 'Top', icon: 'lni-arrow-upward' },
                    { value: 'center', label: 'Center', icon: 'lni-minus' },
                    { value: 'flex-end', label: 'Bottom', icon: 'lni-arrow-downward' },
                    { value: 'stretch', label: 'Stretch', icon: 'lni-arrow-both-direction-vertical-1' },
                  ] : [
                    { value: 'flex-start', label: 'Left', icon: 'lni-shift-left' },
                    { value: 'center', label: 'Center', icon: 'lni-align-text-center' },
                    { value: 'flex-end', label: 'Right', icon: 'lni-shift-right' },
                    { value: 'stretch', label: 'Stretch', icon: 'lni-arrow-both-direction-horizontal-1' },
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
            <InspectorSection title="Style" icon="lni-brush-2">
              <InspectorField label="Background" horizontal>
                <ColorInput
                  :model-value="(selectedBlock.styles as BaseBlockStyles).backgroundColor"
                  swatch-only
                  @update:model-value="updateBlockStyles({ backgroundColor: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Grid Settings -->
          <template v-else-if="selectedBlock.type === 'grid'">
            <InspectorSection title="Grid" icon="lni-layout-9">
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
              <InspectorField label="Height" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.settings as GridSettings).height || '100'"
                  :min="0"
                  :max="100"
                  :step="10"
                  unit="%"
                  @update:model-value="updateBlockSettings({ height: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Content Position" icon="lni-layout-3">
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
            <InspectorSection title="Style" icon="lni-brush-2">
              <InspectorField label="Background" horizontal>
                <ColorInput
                  :model-value="(selectedBlock.styles as BaseBlockStyles).backgroundColor"
                  swatch-only
                  @update:model-value="updateBlockStyles({ backgroundColor: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Stack Settings -->
          <template v-else-if="selectedBlock.type === 'stack'">
            <!-- Overwrite Style Toggle (only for blocks inside List/Collection) -->
            <div v-if="isInListCollection" class="px-4 py-3 border-b border-sidebar-border">
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
            <InspectorSection title="Stack" icon="lni-layers-1">
              <InspectorField label="Direction" horizontal>
                <SegmentedControl
                  :options="[
                    { value: 'vertical', label: 'Vertical', icon: 'lni-arrow-downward' },
                    { value: 'horizontal', label: 'Horizontal', icon: 'lni-arrow-right' },
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
              <InspectorField label="Height" horizontal>
                <SliderInput
                  :model-value="(selectedBlock.settings as StackSettings).height || '100'"
                  :min="0"
                  :max="100"
                  :step="10"
                  unit="%"
                  @update:model-value="updateBlockSettings({ height: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Content Position" icon="lni-layout-3">
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
              <InspectorField label="Wrap" horizontal>
                <SegmentedControl
                  :options="flexWrapOptions"
                  :model-value="(selectedBlock.styles as StackStyles).flexWrap || 'nowrap'"
                  icon-only
                  @update:model-value="updateBlockStyles({ flexWrap: $event })"
                />
              </InspectorField>
            </InspectorSection>
            <InspectorSection title="Style" icon="lni-brush-2">
              <InspectorField label="Background" horizontal>
                <ColorInput
                  :model-value="(selectedBlock.styles as BaseBlockStyles).backgroundColor"
                  swatch-only
                  @update:model-value="updateBlockStyles({ backgroundColor: $event })"
                />
              </InspectorField>
            </InspectorSection>
          </template>

          <!-- Generic Styles (for blocks without specific inspector) -->
          <template v-else>
            <InspectorSection title="Style" icon="lni-brush-2">
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
          <InspectorSection v-if="isChildOfGrid" title="Grid Placement" icon="lni-grid-3">
            <InspectorField label="Column Span" horizontal>
              <SliderInput
                :model-value="String((selectedBlock.settings as Record<string, unknown>).gridColumnSpan || 1)"
                :min="1"
                :max="parentGridColumns || 4"
                :step="1"
                @update:model-value="updateBlockSettings({ gridColumnSpan: parseInt($event) })"
              />
            </InspectorField>
            <InspectorField label="Row Span" horizontal>
              <SliderInput
                :model-value="String((selectedBlock.settings as Record<string, unknown>).gridRowSpan || 1)"
                :min="1"
                :max="6"
                :step="1"
                @update:model-value="updateBlockSettings({ gridRowSpan: parseInt($event) })"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Spacing Section (common to all blocks) -->
          <InspectorSection title="Spacing" icon="lni-arrow-both-direction-horizontal-1">
            <InspectorField label="Padding Y" horizontal>
              <SliderInput
                :model-value="responsiveStyles.padding?.top || '0'"
                :min="0"
                :max="64"
                :step="4"
                @update:model-value="updateBlockStyles({ padding: { ...responsiveStyles.padding, top: $event, bottom: $event } })"
              />
            </InspectorField>
            <InspectorField label="Padding X" horizontal>
              <SliderInput
                :model-value="responsiveStyles.padding?.left || '0'"
                :min="0"
                :max="64"
                :step="4"
                @update:model-value="updateBlockStyles({ padding: { ...responsiveStyles.padding, left: $event, right: $event } })"
              />
            </InspectorField>
            <InspectorField label="Margin Y" horizontal>
              <SliderInput
                :model-value="responsiveStyles.margin?.top || '0'"
                :min="0"
                :max="64"
                :step="4"
                @update:model-value="updateBlockStyles({ margin: { ...responsiveStyles.margin, top: $event, bottom: $event } })"
              />
            </InspectorField>
            <InspectorField label="Margin X" horizontal>
              <SliderInput
                :model-value="responsiveStyles.margin?.left || '0'"
                :min="0"
                :max="64"
                :step="4"
                @update:model-value="updateBlockStyles({ margin: { ...responsiveStyles.margin, left: $event, right: $event } })"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Border Section (common to all blocks) -->
          <InspectorSection title="Border" icon="lni-frame-3">
            <BorderInput
              :model-value="responsiveStyles.border"
              @update:model-value="updateBlockStyles({ border: $event })"
            />
          </InspectorSection>

          <!-- Animation Section (common to most blocks, not header/footer) -->
          <AnimationSection
            v-if="blockSupportsAnimation"
            :model-value="blockAnimation"
            @update:model-value="updateBlockAnimation"
            @preview="handleAnimationPreview"
          />
        </template>
      </div>
    </template>
  </aside>
</template>
