<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useProjectsStore } from '@/stores/projects'
import { useRoute } from 'vue-router'
import { blockItemLabels, sectionBlockLabels, sectionBlockIcons, blockItemIcons, formFieldLabels, formFieldIcons, socialPlatformLabels } from '@/lib/editor-utils'
import { getAllThemes } from '@/lib/themes'
import {
  alignmentOptions,
  orientationOptions,
  aspectRatioOptions,
  fontWeightOptions,
  fontSizeOptions,
  lineHeightOptions,
  effectOptions,
  postLayoutOptions,
  linkLayoutOptions,
  productLayoutOptions,
  columnsOptions,
  spacingOptions,
  maxWidthOptions,
  fontFamilyOptions,
} from '@/lib/editor-utils'
import type { BlockItemStyles, SectionBlockStyles, PostSectionStyles, PostItem, LinkSectionStyles, LinkItem, ProductSectionStyles, ProductItem, PageSettings, FormField, FormSectionSettings, HeaderSectionSettings, HeaderNavLink, FooterSectionSettings, FooterLink, FooterSocialLink } from '@/types/editor'
import { INTEGRATION_DEFINITIONS } from '@/types/project'

import InspectorSection from '@/components/inspector/InspectorSection.vue'
import InspectorField from '@/components/inspector/InspectorField.vue'
import SegmentedControl from '@/components/inspector/SegmentedControl.vue'
import SpacingInput from '@/components/inspector/SpacingInput.vue'
import ColorInput from '@/components/inspector/ColorInput.vue'
import SelectInput from '@/components/inspector/SelectInput.vue'
import BorderInput from '@/components/inspector/BorderInput.vue'
import TextInput from '@/components/inspector/TextInput.vue'
import ImageInput from '@/components/inspector/ImageInput.vue'
import ToggleInput from '@/components/inspector/ToggleInput.vue'

const editorStore = useEditorStore()
const projectsStore = useProjectsStore()
const route = useRoute()

// Get current project for integrations
const currentProject = computed(() => {
  const projectId = route.params.projectId as string
  return projectsStore.projects.find(p => p.id === projectId)
})

// Get connected integrations for form integration selector
const connectedIntegrations = computed(() => {
  if (!currentProject.value?.integrations) return []
  return currentProject.value.integrations
    .filter(i => i.connected)
    .map(i => ({
      value: i.id,
      label: INTEGRATION_DEFINITIONS[i.provider]?.name || i.provider,
      provider: i.provider
    }))
})

const selectedBlock = computed(() => editorStore.selectedBlock)
const selectedItem = computed(() => editorStore.selectedItem)
const selectedPostItem = computed(() => editorStore.selectedPostItem)
const selectedLinkItem = computed(() => editorStore.selectedLinkItem)
const selectedProductItem = computed(() => editorStore.selectedProductItem)
const pageSettings = computed(() => editorStore.pageSettings)

// Check if selected block is a post section
const isPostSection = computed(() => selectedBlock.value?.type === 'post')

// Check if selected block is a link section
const isLinkSection = computed(() => selectedBlock.value?.type === 'link')

// Check if selected block is a product section
const isProductSection = computed(() => selectedBlock.value?.type === 'product')

// Check if selected block is a form section
const isFormSection = computed(() => selectedBlock.value?.type === 'form')

// Check if selected block is a header section
const isHeaderSection = computed(() => selectedBlock.value?.type === 'header')

// Check if selected block is a footer section
const isFooterSection = computed(() => selectedBlock.value?.type === 'footer')

// Check if we have a post item selected
const hasSelectedPostItem = computed(() => isPostSection.value && selectedPostItem.value !== null)

// Check if we have a link item selected
const hasSelectedLinkItem = computed(() => isLinkSection.value && selectedLinkItem.value !== null)

// Check if we have a product item selected
const hasSelectedProductItem = computed(() => isProductSection.value && selectedProductItem.value !== null)

// Check if we have a form field selected
const selectedFormField = computed(() => editorStore.selectedFormField)
const hasSelectedFormField = computed(() => isFormSection.value && selectedFormField.value !== null)

// Check if we have a header nav link selected
const selectedHeaderNavLink = computed(() => editorStore.selectedHeaderNavLink)
const hasSelectedHeaderNavLink = computed(() => isHeaderSection.value && selectedHeaderNavLink.value !== null)

// Check if we have a footer link selected
const selectedFooterLink = computed(() => editorStore.selectedFooterLink)
const hasSelectedFooterLink = computed(() => isFooterSection.value && selectedFooterLink.value !== null)

// Check if we have a footer social link selected
const selectedFooterSocialLink = computed(() => editorStore.selectedFooterSocialLink)
const hasSelectedFooterSocialLink = computed(() => isFooterSection.value && selectedFooterSocialLink.value !== null)

// Check if selected item is a text-based item
const isTextItem = computed(() => {
  if (!selectedItem.value) return false
  return ['heading', 'subheading', 'text', 'button'].includes(selectedItem.value.type)
})

// Check if selected item supports size options
const hasSizeOptions = computed(() => {
  if (!selectedItem.value) return false
  return ['image', 'video'].includes(selectedItem.value.type)
})

// Get post section styles
const postStyles = computed(() => {
  if (!isPostSection.value) return null
  return selectedBlock.value?.styles as PostSectionStyles
})

// Get link section styles
const linkStyles = computed(() => {
  if (!isLinkSection.value) return null
  return selectedBlock.value?.styles as LinkSectionStyles
})

// Get product section styles
const productStyles = computed(() => {
  if (!isProductSection.value) return null
  return selectedBlock.value?.styles as ProductSectionStyles
})

// Update section block styles
function updateBlockStyle<K extends keyof SectionBlockStyles>(key: K, value: SectionBlockStyles[K]) {
  if (!selectedBlock.value) return
  editorStore.updateBlockStyles(selectedBlock.value.id, { [key]: value })
}

// Update post section styles
function updatePostSectionStyle<K extends keyof PostSectionStyles>(key: K, value: PostSectionStyles[K]) {
  if (!selectedBlock.value) return
  editorStore.updateBlockStyles(selectedBlock.value.id, { [key]: value })
}

// Update post section settings (visibility toggles)
function updatePostSectionSetting(key: string, value: boolean) {
  if (!selectedBlock.value) return
  editorStore.updatePostSectionSettings(selectedBlock.value.id, { [key]: value })
}

// Update link section styles
function updateLinkSectionStyle<K extends keyof LinkSectionStyles>(key: K, value: LinkSectionStyles[K]) {
  if (!selectedBlock.value) return
  editorStore.updateBlockStyles(selectedBlock.value.id, { [key]: value })
}

// Update link section settings (visibility toggles)
function updateLinkSectionSetting(key: string, value: boolean) {
  if (!selectedBlock.value) return
  editorStore.updateLinkSectionSettings(selectedBlock.value.id, { [key]: value })
}

// Update product section styles
function updateProductSectionStyle<K extends keyof ProductSectionStyles>(key: K, value: ProductSectionStyles[K]) {
  if (!selectedBlock.value) return
  editorStore.updateBlockStyles(selectedBlock.value.id, { [key]: value })
}

// Update product section settings (visibility toggles)
function updateProductSectionSetting(key: string, value: boolean) {
  if (!selectedBlock.value) return
  editorStore.updateProductSectionSettings(selectedBlock.value.id, { [key]: value })
}

// Update block item styles
function updateItemStyle<K extends keyof BlockItemStyles>(key: K, value: BlockItemStyles[K]) {
  if (!selectedBlock.value || !selectedItem.value) return
  editorStore.updateBlockItemStyles(selectedBlock.value.id, selectedItem.value.id, { [key]: value })
}

// Update post item fields
function updatePostItemField<K extends keyof PostItem>(key: K, value: PostItem[K]) {
  if (!selectedBlock.value || !selectedPostItem.value) return
  editorStore.updatePostItem(selectedBlock.value.id, selectedPostItem.value.id, { [key]: value })
}

// Update link item fields
function updateLinkItemField<K extends keyof LinkItem>(key: K, value: LinkItem[K]) {
  if (!selectedBlock.value || !selectedLinkItem.value) return
  editorStore.updateLinkItem(selectedBlock.value.id, selectedLinkItem.value.id, { [key]: value })
}

// Update product item fields
function updateProductItemField<K extends keyof ProductItem>(key: K, value: ProductItem[K]) {
  if (!selectedBlock.value || !selectedProductItem.value) return
  editorStore.updateProductItem(selectedBlock.value.id, selectedProductItem.value.id, { [key]: value })
}

// Update page settings
function updatePageSetting<K extends keyof PageSettings>(key: K, value: PageSettings[K]) {
  editorStore.updatePageSettings({ [key]: value })
}

// Update form section settings
function updateFormSectionSetting<K extends keyof FormSectionSettings>(key: K, value: FormSectionSettings[K]) {
  if (!selectedBlock.value) return
  editorStore.updateFormSectionSettings(selectedBlock.value.id, { [key]: value })
}

// Update form field
function updateFormFieldSetting<K extends keyof FormField>(key: K, value: FormField[K]) {
  if (!selectedBlock.value || !selectedFormField.value) return
  editorStore.updateFormField(selectedBlock.value.id, selectedFormField.value.id, { [key]: value })
}

// Update header settings
function updateHeaderSetting<K extends keyof HeaderSectionSettings>(key: K, value: HeaderSectionSettings[K]) {
  if (!selectedBlock.value) return
  editorStore.updateHeaderSettings(selectedBlock.value.id, { [key]: value })
}

// Update header nav link
function updateHeaderNavLinkField<K extends keyof HeaderNavLink>(key: K, value: HeaderNavLink[K]) {
  if (!selectedBlock.value || !selectedHeaderNavLink.value) return
  editorStore.updateHeaderNavLink(selectedBlock.value.id, selectedHeaderNavLink.value.id, { [key]: value })
}

// Update footer settings
function updateFooterSetting<K extends keyof FooterSectionSettings>(key: K, value: FooterSectionSettings[K]) {
  if (!selectedBlock.value) return
  editorStore.updateFooterSettings(selectedBlock.value.id, { [key]: value })
}

// Update footer link
function updateFooterLinkField<K extends keyof FooterLink>(key: K, value: FooterLink[K]) {
  if (!selectedBlock.value || !selectedFooterLink.value) return
  editorStore.updateFooterLink(selectedBlock.value.id, selectedFooterLink.value.id, { [key]: value })
}

// Update footer social link
function updateFooterSocialLinkField<K extends keyof FooterSocialLink>(key: K, value: FooterSocialLink[K]) {
  if (!selectedBlock.value || !selectedFooterSocialLink.value) return
  editorStore.updateFooterSocialLink(selectedBlock.value.id, selectedFooterSocialLink.value.id, { [key]: value })
}

// Layouts
const layouts = getAllThemes()
const showLayoutConfirm = ref<string | null>(null)

function handleLayoutClick(layoutId: string) {
  // If there are existing blocks, show confirmation
  if (editorStore.blocks.length > 0) {
    showLayoutConfirm.value = layoutId
  } else {
    applyLayout(layoutId)
  }
}

function applyLayout(layoutId: string) {
  editorStore.applyTheme(layoutId)
  showLayoutConfirm.value = null
}

function cancelLayoutApply() {
  showLayoutConfirm.value = null
}
</script>

<template>
  <aside
    class="flex flex-col h-full bg-sidebar-background border rounded-xl transition-all duration-200"
    :class="editorStore.isInspectorCollapsed ? 'w-10' : 'w-72'"
  >
    <!-- Collapsed state -->
    <div v-if="editorStore.isInspectorCollapsed" class="flex flex-col items-center py-2 gap-1">
      <button
        class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="Expand inspector"
        @click="editorStore.toggleInspector"
      >
        <i class="lni lni-angle-double-left text-sm"></i>
      </button>
      <div class="w-6 border-t border-border my-1"></div>
      <!-- Page icon -->
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
      <!-- Section icons -->
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
      <!-- Header -->
      <div class="flex items-center justify-between h-12 px-4 border-b border-border">
        <h2 class="text-sm font-semibold text-foreground">
          <template v-if="hasSelectedPostItem">
            Post Item
          </template>
          <template v-else-if="hasSelectedLinkItem">
            Link Item
          </template>
          <template v-else-if="hasSelectedProductItem">
            Product Item
          </template>
          <template v-else-if="hasSelectedFormField">
            Form Field
          </template>
          <template v-else-if="hasSelectedHeaderNavLink">
            Nav Link
          </template>
          <template v-else-if="hasSelectedFooterLink">
            Footer Link
          </template>
          <template v-else-if="hasSelectedFooterSocialLink">
            Social Link
          </template>
          <template v-else-if="selectedItem">
            {{ blockItemLabels[selectedItem.type] }}
          </template>
          <template v-else-if="selectedBlock">
            {{ sectionBlockLabels[selectedBlock.type] }}
          </template>
          <template v-else>
            Page
          </template>
        </h2>
        <button
          class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Collapse inspector"
          @click="editorStore.toggleInspector"
        >
          <i class="lni lni-angle-double-right text-sm"></i>
        </button>
      </div>

      <!-- Settings content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Page Settings (when nothing selected) -->
      <template v-if="!selectedBlock">
        <!-- Layouts -->
        <InspectorSection title="Layouts" icon="lni-layers-1">
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="layout in layouts"
              :key="layout.id"
              class="relative flex flex-col items-center p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors text-left"
              @click="handleLayoutClick(layout.id)"
            >
              <!-- Layout preview -->
              <div
                class="w-full h-12 rounded-md mb-2 border border-border/50"
                :style="{
                  background: layout.preview?.startsWith('linear') ? layout.preview : layout.preview || '#ffffff',
                }"
              />
              <span class="text-xs font-medium text-foreground">{{ layout.name }}</span>
              <span class="text-[10px] text-muted-foreground text-center line-clamp-1">{{ layout.description }}</span>
            </button>
          </div>

          <!-- Confirmation dialog -->
          <div
            v-if="showLayoutConfirm"
            class="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p class="text-xs text-foreground mb-2">This will replace all current sections. Continue?</p>
            <div class="flex gap-2">
              <button
                class="flex-1 px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
                @click="applyLayout(showLayoutConfirm)"
              >
                Apply
              </button>
              <button
                class="flex-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                @click="cancelLayoutApply"
              >
                Cancel
              </button>
            </div>
          </div>
        </InspectorSection>

        <!-- Spacing -->
        <InspectorSection title="Spacing" icon="lni-arrow-both-direction-horizontal-1">
          <InspectorField label="Max Width">
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
          <InspectorField label="Text Color">
            <ColorInput
              :model-value="pageSettings.textColor"
              @update:model-value="updatePageSetting('textColor', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Background -->
        <InspectorSection title="Background" icon="lni-photos">
          <InspectorField label="Color">
            <ColorInput
              :model-value="pageSettings.backgroundColor"
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

      <!-- Post Item Inspector -->
      <template v-else-if="hasSelectedPostItem && selectedPostItem">
        <!-- Content -->
        <InspectorSection title="Content" icon="lni-text-format">
          <InspectorField label="Heading">
            <TextInput
              :model-value="selectedPostItem.heading"
              placeholder="Post heading"
              @update:model-value="updatePostItemField('heading', $event)"
            />
          </InspectorField>
          <InspectorField label="Text">
            <TextInput
              :model-value="selectedPostItem.text"
              placeholder="Post description"
              multiline
              @update:model-value="updatePostItemField('text', $event)"
            />
          </InspectorField>
          <InspectorField label="Image">
            <ImageInput
              :model-value="selectedPostItem.image"
              placeholder="Upload image"
              @update:model-value="updatePostItemField('image', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Button -->
        <InspectorSection title="Button" icon="lni-pointer-1">
          <InspectorField label="Title">
            <TextInput
              :model-value="selectedPostItem.buttonTitle"
              placeholder="Button text"
              @update:model-value="updatePostItemField('buttonTitle', $event)"
            />
          </InspectorField>
          <InspectorField label="Link">
            <TextInput
              :model-value="selectedPostItem.buttonLink"
              placeholder="https://..."
              @update:model-value="updatePostItemField('buttonLink', $event)"
            />
          </InspectorField>
        </InspectorSection>
      </template>

      <!-- Link Item Inspector -->
      <template v-else-if="hasSelectedLinkItem && selectedLinkItem">
        <!-- Content -->
        <InspectorSection title="Content" icon="lni-text-format">
          <InspectorField label="Heading">
            <TextInput
              :model-value="selectedLinkItem.heading"
              placeholder="Link title"
              @update:model-value="updateLinkItemField('heading', $event)"
            />
          </InspectorField>
          <InspectorField label="URL">
            <TextInput
              :model-value="selectedLinkItem.url"
              placeholder="https://..."
              @update:model-value="updateLinkItemField('url', $event)"
            />
          </InspectorField>
          <InspectorField label="Image">
            <ImageInput
              :model-value="selectedLinkItem.image"
              placeholder="Upload image"
              @update:model-value="updateLinkItemField('image', $event)"
            />
          </InspectorField>
        </InspectorSection>
      </template>

      <!-- Product Item Inspector -->
      <template v-else-if="hasSelectedProductItem && selectedProductItem">
        <!-- Content -->
        <InspectorSection title="Content" icon="lni-text-format">
          <InspectorField label="Heading">
            <TextInput
              :model-value="selectedProductItem.heading"
              placeholder="Product name"
              @update:model-value="updateProductItemField('heading', $event)"
            />
          </InspectorField>
          <InspectorField label="Subtitle">
            <TextInput
              :model-value="selectedProductItem.subtitle"
              placeholder="Product subtitle"
              @update:model-value="updateProductItemField('subtitle', $event)"
            />
          </InspectorField>
          <InspectorField label="Text">
            <TextInput
              :model-value="selectedProductItem.text"
              placeholder="Product description"
              multiline
              @update:model-value="updateProductItemField('text', $event)"
            />
          </InspectorField>
          <InspectorField label="Price">
            <TextInput
              :model-value="selectedProductItem.price"
              placeholder="$0.00"
              @update:model-value="updateProductItemField('price', $event)"
            />
          </InspectorField>
          <InspectorField label="Image">
            <ImageInput
              :model-value="selectedProductItem.image"
              placeholder="Upload image"
              @update:model-value="updateProductItemField('image', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Button -->
        <InspectorSection title="Button" icon="lni-pointer-1">
          <InspectorField label="Title">
            <TextInput
              :model-value="selectedProductItem.buttonTitle"
              placeholder="Button text"
              @update:model-value="updateProductItemField('buttonTitle', $event)"
            />
          </InspectorField>
          <InspectorField label="Link">
            <TextInput
              :model-value="selectedProductItem.buttonLink"
              placeholder="https://..."
              @update:model-value="updateProductItemField('buttonLink', $event)"
            />
          </InspectorField>
        </InspectorSection>
      </template>

      <!-- Form Field Inspector -->
      <template v-else-if="hasSelectedFormField && selectedFormField">
        <InspectorSection title="Field Settings" icon="lni-form">
          <InspectorField label="Label">
            <TextInput
              :model-value="selectedFormField.label"
              placeholder="Field label"
              @update:model-value="updateFormFieldSetting('label', $event)"
            />
          </InspectorField>
          <InspectorField label="Placeholder">
            <TextInput
              :model-value="selectedFormField.placeholder"
              placeholder="Placeholder text"
              @update:model-value="updateFormFieldSetting('placeholder', $event)"
            />
          </InspectorField>
          <InspectorField label="Type">
            <div class="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md">
              <i :class="['lni', formFieldIcons[selectedFormField.type], 'text-muted-foreground']"></i>
              <span class="text-sm text-foreground">{{ formFieldLabels[selectedFormField.type] }}</span>
            </div>
          </InspectorField>
          <div class="px-3">
            <ToggleInput
              :model-value="selectedFormField.required"
              label="Required field"
              @update:model-value="updateFormFieldSetting('required', $event)"
            />
          </div>
        </InspectorSection>

        <!-- Options for select/radio/checkbox -->
        <InspectorSection
          v-if="['select', 'radio', 'checkbox'].includes(selectedFormField.type)"
          title="Options"
          icon="lni-list-bulleted-1"
        >
          <div class="space-y-2">
            <div
              v-for="(option, index) in selectedFormField.options || []"
              :key="index"
              class="flex items-center gap-2"
            >
              <TextInput
                :model-value="option"
                placeholder="Option value"
                class="flex-1"
                @update:model-value="
                  updateFormFieldSetting(
                    'options',
                    (selectedFormField.options || []).map((o, i) => (i === index ? $event : o))
                  )
                "
              />
              <button
                class="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                @click="
                  updateFormFieldSetting(
                    'options',
                    (selectedFormField.options || []).filter((_, i) => i !== index)
                  )
                "
              >
                <i class="lni lni-xmark text-sm"></i>
              </button>
            </div>
            <button
              class="w-full flex items-center justify-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:border-primary/50 transition-colors"
              @click="
                updateFormFieldSetting('options', [...(selectedFormField.options || []), `Option ${(selectedFormField.options?.length || 0) + 1}`])
              "
            >
              <i class="lni lni-plus text-xs"></i>
              Add option
            </button>
          </div>
        </InspectorSection>
      </template>

      <!-- Header Nav Link Inspector -->
      <template v-else-if="hasSelectedHeaderNavLink && selectedHeaderNavLink">
        <InspectorSection title="Navigation Link" icon="lni-link-1">
          <InspectorField label="Label">
            <TextInput
              :model-value="selectedHeaderNavLink.label"
              placeholder="Link text"
              @update:model-value="updateHeaderNavLinkField('label', $event)"
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
      <template v-else-if="hasSelectedFooterLink && selectedFooterLink">
        <InspectorSection title="Footer Link" icon="lni-link-1">
          <InspectorField label="Label">
            <TextInput
              :model-value="selectedFooterLink.label"
              placeholder="Link text"
              @update:model-value="updateFooterLinkField('label', $event)"
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
      <template v-else-if="hasSelectedFooterSocialLink && selectedFooterSocialLink">
        <InspectorSection title="Social Link" icon="lni-link-1">
          <InspectorField label="Platform">
            <div class="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md">
              <span class="text-sm text-foreground">{{ socialPlatformLabels[selectedFooterSocialLink.platform] || selectedFooterSocialLink.platform }}</span>
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

      <!-- Block Item Inspector -->
      <template v-else-if="selectedItem">
        <!-- Position -->
        <InspectorSection title="Position" icon="lni-arrow-all-direction">
          <InspectorField label="Align">
            <SegmentedControl
              :options="alignmentOptions"
              :model-value="selectedItem.styles.align"
              @update:model-value="updateItemStyle('align', $event as any)"
            />
          </InspectorField>
          <InspectorField label="Margin">
            <SpacingInput
              :model-value="selectedItem.styles.margin"
              @update:model-value="updateItemStyle('margin', $event)"
            />
          </InspectorField>
          <InspectorField label="Padding">
            <SpacingInput
              :model-value="selectedItem.styles.padding"
              @update:model-value="updateItemStyle('padding', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Size (for image/video) -->
        <InspectorSection v-if="hasSizeOptions" title="Size" icon="lni-expand-square-4">
          <InspectorField label="Orientation">
            <SegmentedControl
              :options="orientationOptions"
              :model-value="selectedItem.styles.orientation"
              @update:model-value="updateItemStyle('orientation', $event as any)"
            />
          </InspectorField>
          <InspectorField label="Aspect Ratio">
            <SelectInput
              :options="aspectRatioOptions"
              :model-value="selectedItem.styles.aspectRatio"
              @update:model-value="updateItemStyle('aspectRatio', $event as any)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Text (for text-based items) -->
        <InspectorSection v-if="isTextItem" title="Text" icon="lni-text-format">
          <InspectorField label="Size">
            <SelectInput
              :options="fontSizeOptions"
              :model-value="selectedItem.styles.fontSize"
              @update:model-value="updateItemStyle('fontSize', $event as any)"
            />
          </InspectorField>
          <InspectorField label="Weight">
            <SegmentedControl
              :options="fontWeightOptions"
              :model-value="selectedItem.styles.fontWeight"
              @update:model-value="updateItemStyle('fontWeight', $event as any)"
            />
          </InspectorField>
          <InspectorField label="Line Height">
            <SegmentedControl
              :options="lineHeightOptions"
              :model-value="selectedItem.styles.lineHeight"
              @update:model-value="updateItemStyle('lineHeight', $event as any)"
            />
          </InspectorField>
          <InspectorField label="Align">
            <SegmentedControl
              :options="alignmentOptions"
              :model-value="selectedItem.styles.textAlign"
              @update:model-value="updateItemStyle('textAlign', $event as any)"
            />
          </InspectorField>
          <InspectorField label="Color">
            <ColorInput
              :model-value="selectedItem.styles.textColor"
              @update:model-value="updateItemStyle('textColor', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Border -->
        <InspectorSection title="Border" icon="lni-check-square-2">
          <BorderInput
            :model-value="selectedItem.styles.border"
            @update:model-value="updateItemStyle('border', $event)"
          />
        </InspectorSection>

        <!-- Background -->
        <InspectorSection title="Background" icon="lni-photos">
          <InspectorField label="Color">
            <ColorInput
              :model-value="selectedItem.styles.backgroundColor"
              @update:model-value="updateItemStyle('backgroundColor', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Effect -->
        <InspectorSection title="Effect" icon="lni-bolt-2">
          <InspectorField label="Animation">
            <SelectInput
              :options="effectOptions"
              :model-value="selectedItem.styles.effect"
              @update:model-value="updateItemStyle('effect', $event as any)"
            />
          </InspectorField>
        </InspectorSection>
      </template>

      <!-- Section Block Inspector -->
      <template v-else-if="selectedBlock">
        <!-- Post Section Layout (only for post sections) -->
        <InspectorSection v-if="isPostSection && postStyles && selectedBlock.postSettings" title="Layout" icon="lni-layout-9">
          <InspectorField label="Display">
            <SegmentedControl
              :options="postLayoutOptions"
              :model-value="postStyles.layout"
              @update:model-value="updatePostSectionStyle('layout', $event as any)"
            />
          </InspectorField>
          <InspectorField v-if="postStyles.layout !== 'list'" label="Columns">
            <SegmentedControl
              :options="columnsOptions"
              :model-value="String(postStyles.columns || 3)"
              @update:model-value="updatePostSectionStyle('columns', Number($event))"
            />
          </InspectorField>
          <InspectorField label="Gap">
            <SelectInput
              :options="spacingOptions"
              :model-value="postStyles.gap"
              @update:model-value="updatePostSectionStyle('gap', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Post Section Visibility (only for post sections) -->
        <InspectorSection v-if="isPostSection && selectedBlock.postSettings" title="Show Elements" icon="lni-check-square-2">
          <div class="space-y-3">
            <ToggleInput
              :model-value="selectedBlock.postSettings.showImage"
              label="Image"
              @update:model-value="updatePostSectionSetting('showImage', $event)"
            />
            <ToggleInput
              :model-value="selectedBlock.postSettings.showHeading"
              label="Heading"
              @update:model-value="updatePostSectionSetting('showHeading', $event)"
            />
            <ToggleInput
              :model-value="selectedBlock.postSettings.showText"
              label="Text"
              @update:model-value="updatePostSectionSetting('showText', $event)"
            />
            <ToggleInput
              :model-value="selectedBlock.postSettings.showButton"
              label="Button"
              @update:model-value="updatePostSectionSetting('showButton', $event)"
            />
          </div>
        </InspectorSection>

        <!-- Link Section Layout (only for link sections) -->
        <InspectorSection v-if="isLinkSection && linkStyles && selectedBlock.linkSettings" title="Layout" icon="lni-layout-9">
          <InspectorField label="Display">
            <SegmentedControl
              :options="linkLayoutOptions"
              :model-value="linkStyles.layout"
              @update:model-value="updateLinkSectionStyle('layout', $event as any)"
            />
          </InspectorField>
          <InspectorField v-if="linkStyles.layout !== 'list'" label="Columns">
            <SegmentedControl
              :options="columnsOptions"
              :model-value="String(linkStyles.columns || 3)"
              @update:model-value="updateLinkSectionStyle('columns', Number($event))"
            />
          </InspectorField>
          <InspectorField label="Gap">
            <SelectInput
              :options="spacingOptions"
              :model-value="linkStyles.gap"
              @update:model-value="updateLinkSectionStyle('gap', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Link Section Visibility (only for link sections) -->
        <InspectorSection v-if="isLinkSection && selectedBlock.linkSettings" title="Show Elements" icon="lni-check-square-2">
          <div class="space-y-3">
            <ToggleInput
              :model-value="selectedBlock.linkSettings.showImage"
              label="Image"
              @update:model-value="updateLinkSectionSetting('showImage', $event)"
            />
            <ToggleInput
              :model-value="selectedBlock.linkSettings.showHeading"
              label="Heading"
              @update:model-value="updateLinkSectionSetting('showHeading', $event)"
            />
          </div>
        </InspectorSection>

        <!-- Product Section Layout (only for product sections) -->
        <InspectorSection v-if="isProductSection && productStyles && selectedBlock.productSettings" title="Layout" icon="lni-layout-9">
          <InspectorField label="Display">
            <SegmentedControl
              :options="productLayoutOptions"
              :model-value="productStyles.layout"
              @update:model-value="updateProductSectionStyle('layout', $event as any)"
            />
          </InspectorField>
          <InspectorField v-if="productStyles.layout !== 'list'" label="Columns">
            <SegmentedControl
              :options="columnsOptions"
              :model-value="String(productStyles.columns || 3)"
              @update:model-value="updateProductSectionStyle('columns', Number($event))"
            />
          </InspectorField>
          <InspectorField label="Gap">
            <SelectInput
              :options="spacingOptions"
              :model-value="productStyles.gap"
              @update:model-value="updateProductSectionStyle('gap', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Product Section Visibility (only for product sections) -->
        <InspectorSection v-if="isProductSection && selectedBlock.productSettings" title="Show Elements" icon="lni-check-square-2">
          <div class="space-y-3">
            <ToggleInput
              :model-value="selectedBlock.productSettings.showImage"
              label="Image"
              @update:model-value="updateProductSectionSetting('showImage', $event)"
            />
            <ToggleInput
              :model-value="selectedBlock.productSettings.showHeading"
              label="Heading"
              @update:model-value="updateProductSectionSetting('showHeading', $event)"
            />
            <ToggleInput
              :model-value="selectedBlock.productSettings.showSubtitle"
              label="Subtitle"
              @update:model-value="updateProductSectionSetting('showSubtitle', $event)"
            />
            <ToggleInput
              :model-value="selectedBlock.productSettings.showText"
              label="Text"
              @update:model-value="updateProductSectionSetting('showText', $event)"
            />
            <ToggleInput
              :model-value="selectedBlock.productSettings.showPrice"
              label="Price"
              @update:model-value="updateProductSectionSetting('showPrice', $event)"
            />
            <ToggleInput
              :model-value="selectedBlock.productSettings.showButton"
              label="Button"
              @update:model-value="updateProductSectionSetting('showButton', $event)"
            />
          </div>
        </InspectorSection>

        <!-- Header Section Settings -->
        <InspectorSection v-if="isHeaderSection && selectedBlock.headerSettings" title="Header Settings" icon="lni-layout-header">
          <div class="space-y-3">
            <ToggleInput
              :model-value="!selectedBlock.headerSettings.isHidden"
              label="Show header"
              @update:model-value="updateHeaderSetting('isHidden', !$event)"
            />
          </div>
        </InspectorSection>

        <InspectorSection v-if="isHeaderSection && selectedBlock.headerSettings" title="Logo" icon="lni-image">
          <InspectorField label="Image">
            <ImageInput
              :model-value="selectedBlock.headerSettings.logo"
              placeholder="Upload logo"
              @update:model-value="updateHeaderSetting('logo', $event)"
            />
          </InspectorField>
          <InspectorField label="Alt Text">
            <TextInput
              :model-value="selectedBlock.headerSettings.logoAlt"
              placeholder="Logo description"
              @update:model-value="updateHeaderSetting('logoAlt', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <InspectorSection v-if="isHeaderSection && selectedBlock.headerSettings" title="CTA Button" icon="lni-pointer-1">
          <div class="space-y-3">
            <ToggleInput
              :model-value="selectedBlock.headerSettings.ctaButton.show"
              label="Show CTA button"
              @update:model-value="updateHeaderSetting('ctaButton', { ...selectedBlock.headerSettings!.ctaButton, show: $event })"
            />
          </div>
          <template v-if="selectedBlock.headerSettings.ctaButton.show">
            <InspectorField label="Label">
              <TextInput
                :model-value="selectedBlock.headerSettings.ctaButton.label"
                placeholder="Get Started"
                @update:model-value="updateHeaderSetting('ctaButton', { ...selectedBlock.headerSettings!.ctaButton, label: $event })"
              />
            </InspectorField>
            <InspectorField label="URL">
              <TextInput
                :model-value="selectedBlock.headerSettings.ctaButton.url"
                placeholder="https://..."
                @update:model-value="updateHeaderSetting('ctaButton', { ...selectedBlock.headerSettings!.ctaButton, url: $event })"
              />
            </InspectorField>
          </template>
        </InspectorSection>

        <!-- Footer Section Settings -->
        <InspectorSection v-if="isFooterSection && selectedBlock.footerSettings" title="Footer Settings" icon="lni-layout-footer">
          <div class="space-y-3">
            <ToggleInput
              :model-value="!selectedBlock.footerSettings.isHidden"
              label="Show footer"
              @update:model-value="updateFooterSetting('isHidden', !$event)"
            />
          </div>
        </InspectorSection>

        <InspectorSection v-if="isFooterSection && selectedBlock.footerSettings" title="Copyright" icon="lni-text-format">
          <InspectorField label="Text">
            <TextInput
              :model-value="selectedBlock.footerSettings.copyrightText"
              placeholder="© 2024 Company Name"
              @update:model-value="updateFooterSetting('copyrightText', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Form Section Settings -->
        <InspectorSection v-if="isFormSection && selectedBlock.formSettings" title="Form Settings" icon="lni-form">
          <InspectorField label="Integration">
            <SelectInput
              :options="[
                { value: '', label: 'No integration' },
                ...connectedIntegrations
              ]"
              :model-value="selectedBlock.formSettings.integrationId || ''"
              @update:model-value="updateFormSectionSetting('integrationId', $event || undefined)"
            />
          </InspectorField>
          <InspectorField label="Submit Button">
            <TextInput
              :model-value="selectedBlock.formSettings.submitButtonText"
              placeholder="Submit"
              @update:model-value="updateFormSectionSetting('submitButtonText', $event)"
            />
          </InspectorField>
          <InspectorField label="Success Message">
            <TextInput
              :model-value="selectedBlock.formSettings.successMessage"
              placeholder="Thank you for your submission!"
              multiline
              @update:model-value="updateFormSectionSetting('successMessage', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Position -->
        <InspectorSection title="Position" icon="lni-arrow-all-direction">
          <InspectorField label="Align">
            <SegmentedControl
              :options="alignmentOptions"
              :model-value="selectedBlock.styles.align"
              @update:model-value="updateBlockStyle('align', $event as any)"
            />
          </InspectorField>
          <InspectorField label="Margin">
            <SpacingInput
              :model-value="selectedBlock.styles.margin"
              @update:model-value="updateBlockStyle('margin', $event)"
            />
          </InspectorField>
          <InspectorField label="Padding">
            <SpacingInput
              :model-value="selectedBlock.styles.padding"
              @update:model-value="updateBlockStyle('padding', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Border -->
        <InspectorSection title="Border" icon="lni-check-square-2">
          <BorderInput
            :model-value="selectedBlock.styles.border"
            @update:model-value="updateBlockStyle('border', $event)"
          />
        </InspectorSection>

        <!-- Background -->
        <InspectorSection title="Background" icon="lni-photos">
          <InspectorField label="Color">
            <ColorInput
              :model-value="selectedBlock.styles.backgroundColor"
              @update:model-value="updateBlockStyle('backgroundColor', $event)"
            />
          </InspectorField>
        </InspectorSection>

        <!-- Effect -->
        <InspectorSection title="Effect" icon="lni-bolt-2">
          <InspectorField label="Animation">
            <SelectInput
              :options="effectOptions"
              :model-value="selectedBlock.styles.effect"
              @update:model-value="updateBlockStyle('effect', $event as any)"
            />
          </InspectorField>
        </InspectorSection>
      </template>
    </div>
    </template>
  </aside>
</template>
