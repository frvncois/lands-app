<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector, useFontOptions } from './composables'
import {
  getInspectorConfig,
  type FieldConfig,
  type ContentSectionConfig,
  type BackgroundSectionConfig,
  type ShadowSectionConfig,
  type ToggleGroupConfig,
  type InlineGroupConfig,
} from './inspector-config'
import type { SectionBlockType } from '@/types/editor'
import { getAllDescendants } from '@/lib/editor-utils'

import InspectorSection from './InspectorSection.vue'
import InspectorField from './InspectorField.vue'
import TextInput from './TextInput.vue'
import ImageInput from './ImageInput.vue'
import ColorInput from './ColorInput.vue'
import ToggleInput from './ToggleInput.vue'
import SliderInput from './SliderInput.vue'
import SizeInput from './SizeInput.vue'
import SelectInput from './SelectInput.vue'
import SegmentedControl from './SegmentedControl.vue'
import LinkInput from './LinkInput.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
import {
  TypographySection,
  DisplaySection,
  StylesSection,
  EffectsSection,
  DebugSection,
  PreviewSection,
} from './sections'

const {
  selectedBlock,
  effectiveBlockStyles,
  responsiveStyles,
  updateBlockSettings,
  updateBlockStyles,
  isChildOfGrid,
  parentGridColumns,
  isInFlexContainer,
  editorStore,
} = useBlockInspector()

const { fontFamilyOptions, defaultFontFamily } = useFontOptions()

// Get config for current block type
const config = computed(() => {
  if (!selectedBlock.value) return null
  return getInspectorConfig(selectedBlock.value.type as SectionBlockType)
})

// Get settings and styles with proper typing for template access
const settings = computed(() => selectedBlock.value?.settings || {})
const styles = computed(() => effectiveBlockStyles.value as Record<string, string | undefined> || {})

// Get ALL descendants (nested children) for effects targeting
const allDescendants = computed(() => getAllDescendants(selectedBlock.value))

// Find the accordion item ancestor (if any)
const accordionItemAncestor = computed(() => {
  if (!selectedBlock.value) return null

  // Check if current block is an accordion item
  if (selectedBlock.value.type === 'stack' &&
      selectedBlock.value.name?.toLowerCase().includes('accordion item')) {
    return selectedBlock.value
  }

  // Check ancestors for accordion item
  let parent = editorStore.findParentBlock(selectedBlock.value.id)
  while (parent) {
    if (parent.type === 'stack' &&
        parent.name?.toLowerCase().includes('accordion item')) {
      return parent
    }
    parent = editorStore.findParentBlock(parent.id)
  }

  return null
})

// Check if we're in an accordion context (either the item itself or a descendant)
const isInAccordionContext = computed(() => {
  return accordionItemAncestor.value !== null
})

// Get the accordion item's preview state (from editor store, not saved)
const accordionPreviewState = computed(() => {
  if (!accordionItemAncestor.value) return 'open'
  return editorStore.getAccordionPreviewState(accordionItemAncestor.value.id)
})

// Update the accordion item's preview state (editor-only, not saved)
function updateAccordionPreviewState(state: 'closed' | 'open') {
  if (!accordionItemAncestor.value) return
  editorStore.setAccordionPreviewState(accordionItemAncestor.value.id, state)
}

// Translation-aware content getter
function getTranslatableValue(key: string): string {
  if (!selectedBlock.value) return ''
  if (editorStore.isEditingTranslation && editorStore.currentLanguage) {
    const langTranslations = editorStore.translations.languages[editorStore.currentLanguage]
    const blockTranslation = langTranslations?.blocks[selectedBlock.value.id] as Record<string, unknown> | undefined
    if (blockTranslation?.[key] !== undefined) {
      return blockTranslation[key] as string
    }
  }
  return (settings.value as Record<string, unknown>)?.[key] as string ?? ''
}

// Translation-aware content setter
function updateTranslatableValue(key: string, value: string) {
  if (!selectedBlock.value) return
  if (editorStore.isEditingTranslation) {
    // Cast key to the expected type for the method
    editorStore.updateBlockTranslation(selectedBlock.value.id, key as 'content' | 'label', value)
  } else {
    updateBlockSettings({ [key]: value })
  }
}

// Get field value (settings or styles)
function getFieldValue(field: FieldConfig): unknown {
  const target = field.target === 'styles' ? styles.value : settings.value
  const obj = target as Record<string, unknown>

  // Handle nested keys like 'border.radius'
  if (field.key.includes('.')) {
    const keys = field.key.split('.')
    let value: unknown = obj
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
    }
    return value ?? field.props?.defaultValue ?? ''
  }

  return obj?.[field.key] ?? field.props?.defaultValue ?? ''
}

// Update field value
function updateFieldValue(field: FieldConfig, value: unknown) {
  // Handle translatable fields
  if (field.translatable) {
    updateTranslatableValue(field.key, value as string)
    return
  }

  // Handle nested keys like 'border.radius'
  if (field.props?.nestedKey) {
    const currentObj = (styles.value as Record<string, unknown>)?.[field.props.nestedKey] || {}
    const key = field.key.split('.').pop()!
    updateBlockStyles({ [field.props.nestedKey]: { ...currentObj as object, [key]: value } })
    return
  }

  if (field.target === 'styles') {
    updateBlockStyles({ [field.key]: value })
  } else {
    updateBlockSettings({ [field.key]: value })
  }
}

// Check if field condition is met
function checkCondition(field: FieldConfig): boolean {
  if (!field.condition) return true

  const currentValue = (settings.value as Record<string, unknown>)?.[field.condition.field]

  switch (field.condition.operator) {
    case '==':
      return currentValue === field.condition.value
    case '!=':
      return currentValue !== field.condition.value
    case 'in':
      return (field.condition.value as string[]).includes(currentValue as string)
    case 'not-in':
      return !(field.condition.value as string[]).includes(currentValue as string)
    default:
      return true
  }
}

// Type guards
function isBackgroundSection(section: ContentSectionConfig | BackgroundSectionConfig | ShadowSectionConfig): section is BackgroundSectionConfig {
  return 'type' in section && section.type === 'background'
}

function isShadowSection(section: ContentSectionConfig | BackgroundSectionConfig | ShadowSectionConfig): section is ShadowSectionConfig {
  return 'type' in section && section.type === 'shadow'
}

function isToggleGroup(field: FieldConfig | ToggleGroupConfig | InlineGroupConfig): field is ToggleGroupConfig {
  return 'type' in field && field.type === 'toggle-group'
}

function isInlineGroup(field: FieldConfig | ToggleGroupConfig | InlineGroupConfig): field is InlineGroupConfig {
  return 'type' in field && field.type === 'inline-group'
}
</script>

<template>
  <div v-if="selectedBlock && config">
    <!-- Dynamic content sections -->
    <template v-for="(section, sectionIndex) in config.content" :key="sectionIndex">
      <!-- Background Section (special) -->
      <InspectorSection
        v-if="isBackgroundSection(section)"
        :title="section.title"
        :icon="section.icon"
      >
        <InspectorField label="Type" horizontal>
          <SegmentedControl
            :options="[
              { value: 'color', label: 'Color', icon: 'style-color' },
              { value: 'image', label: 'Image', icon: 'content-image' },
              { value: 'video', label: 'Video', icon: 'content-video' },
            ]"
            :model-value="(settings as Record<string, unknown>)[section.typeKey] as string || 'color'"
            icon-only
            @update:model-value="updateBlockSettings({ [section.typeKey]: $event })"
          />
        </InspectorField>
        <InspectorField
          v-if="(settings as Record<string, unknown>)[section.typeKey] === 'color' || !(settings as Record<string, unknown>)[section.typeKey]"
          label="Color"
          horizontal
        >
          <ColorInput
            :model-value="responsiveStyles.backgroundColor"
            swatch-only
            @update:model-value="updateBlockStyles({ backgroundColor: $event })"
          />
        </InspectorField>
        <template v-else-if="(settings as Record<string, unknown>)[section.typeKey] === 'image'">
          <InspectorField label="Image">
            <ImageInput
              :model-value="(settings as Record<string, unknown>)[section.imageKey] as string || ''"
              placeholder="Upload background image"
              @update:model-value="updateBlockSettings({ [section.imageKey]: $event })"
            />
          </InspectorField>
          <InspectorField label="Opacity" horizontal>
            <SliderInput
              :model-value="(settings as Record<string, unknown>).backgroundImageOpacity as number ?? 100"
              :min="0"
              :max="100"
              :step="5"
              unit="%"
              @update:model-value="updateBlockSettings({ backgroundImageOpacity: Number($event) })"
            />
          </InspectorField>
          <InspectorField label="Blur" horizontal>
            <SliderInput
              :model-value="(settings as Record<string, unknown>).backgroundImageBlur as number ?? 0"
              :min="0"
              :max="20"
              :step="1"
              unit="px"
              @update:model-value="updateBlockSettings({ backgroundImageBlur: Number($event) })"
            />
          </InspectorField>
          <InspectorField label="Saturation" horizontal>
            <SliderInput
              :model-value="(settings as Record<string, unknown>).backgroundImageSaturation as number ?? 100"
              :min="0"
              :max="200"
              :step="5"
              unit="%"
              @update:model-value="updateBlockSettings({ backgroundImageSaturation: Number($event) })"
            />
          </InspectorField>
        </template>
        <InspectorField v-else label="Video URL">
          <TextInput
            :model-value="(settings as Record<string, unknown>)[section.videoKey] as string || ''"
            placeholder="YouTube, Vimeo, or file URL"
            @update:model-value="updateBlockSettings({ [section.videoKey]: $event })"
          />
        </InspectorField>
      </InspectorSection>

      <!-- Shadow Section (special) -->
      <InspectorSection
        v-else-if="isShadowSection(section)"
        :title="section.title"
        :icon="section.icon"
      >
        <InspectorField label="Size" horizontal>
          <div class="flex p-0.5 bg-secondary rounded-md">
            <Tooltip text="Small">
              <button
                type="button"
                class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
                :class="responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '8'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'"
                @click="updateBlockStyles({ shadow: responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '8' ? { enabled: false } : { enabled: true, x: '0', y: '2', blur: '8', color: responsiveStyles.shadow?.color || 'rgba(0,0,0,0.1)' } })"
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
                @click="updateBlockStyles({ shadow: responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '16' ? { enabled: false } : { enabled: true, x: '0', y: '4', blur: '16', color: responsiveStyles.shadow?.color || 'rgba(0,0,0,0.1)' } })"
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
                @click="updateBlockStyles({ shadow: responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '32' ? { enabled: false } : { enabled: true, x: '0', y: '8', blur: '32', color: responsiveStyles.shadow?.color || 'rgba(0,0,0,0.15)' } })"
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

      <!-- Regular content section -->
      <InspectorSection
        v-else
        :title="(section as ContentSectionConfig).title"
        :icon="(section as ContentSectionConfig).icon"
      >
        <template v-for="(field, fieldIndex) in (section as ContentSectionConfig).fields" :key="fieldIndex">
          <!-- Toggle group -->
          <div v-if="isToggleGroup(field)" class="space-y-2 px-3">
            <ToggleInput
              v-for="toggle in field.fields"
              :key="toggle.key"
              :model-value="(settings as Record<string, unknown>)[toggle.key] as boolean ?? toggle.defaultValue ?? false"
              :label="toggle.label"
              @update:model-value="updateBlockSettings({ [toggle.key]: $event })"
            />
          </div>

          <!-- Inline group - multiple fields on one line -->
          <InspectorField v-else-if="isInlineGroup(field)" :label="field.label">
            <div class="flex items-center gap-2">
              <template v-for="(inlineField, inlineIndex) in field.fields" :key="inlineIndex">
                <!-- Text input (flex-1 to take remaining space) -->
                <div v-if="inlineField.type === 'text'" class="flex-1 min-w-0">
                  <TextInput
                    :model-value="inlineField.translatable ? getTranslatableValue(inlineField.key) : getFieldValue(inlineField) as string"
                    :placeholder="inlineField.placeholder"
                    @update:model-value="updateFieldValue(inlineField, $event)"
                  />
                </div>
                <!-- Select input (constrained width) -->
                <div v-else-if="inlineField.type === 'select'" class="w-16 shrink-0">
                  <SelectInput
                    :model-value="getFieldValue(inlineField) as string"
                    :options="inlineField.props?.options || []"
                    compact
                    @update:model-value="updateFieldValue(inlineField, $event)"
                  />
                </div>
              </template>
            </div>
          </InspectorField>

          <!-- Regular field with condition check -->
          <template v-else-if="checkCondition(field as FieldConfig)">
            <!-- Toggle field (no InspectorField wrapper) -->
            <div v-if="(field as FieldConfig).type === 'toggle'" class="px-3">
              <ToggleInput
                :model-value="getFieldValue(field as FieldConfig) as boolean"
                :label="(field as FieldConfig).label"
                @update:model-value="updateFieldValue(field as FieldConfig, $event)"
              />
            </div>

            <!-- All other fields -->
            <InspectorField
              v-else
              :label="(field as FieldConfig).label"
              :horizontal="(field as FieldConfig).horizontal"
            >
              <!-- Text input -->
              <TextInput
                v-if="(field as FieldConfig).type === 'text'"
                :model-value="(field as FieldConfig).translatable ? getTranslatableValue((field as FieldConfig).key) : getFieldValue(field as FieldConfig) as string"
                :placeholder="(field as FieldConfig).placeholder"
                @update:model-value="updateFieldValue(field as FieldConfig, $event)"
              />

              <!-- Text multiline -->
              <TextInput
                v-else-if="(field as FieldConfig).type === 'text-multiline'"
                :model-value="(field as FieldConfig).translatable ? getTranslatableValue((field as FieldConfig).key) : getFieldValue(field as FieldConfig) as string"
                :placeholder="(field as FieldConfig).placeholder"
                multiline
                @update:model-value="updateFieldValue(field as FieldConfig, $event)"
              />

              <!-- Image input -->
              <ImageInput
                v-else-if="(field as FieldConfig).type === 'image'"
                :model-value="getFieldValue(field as FieldConfig) as string"
                :placeholder="(field as FieldConfig).placeholder"
                @update:model-value="updateFieldValue(field as FieldConfig, $event)"
              />

              <!-- Color input -->
              <ColorInput
                v-else-if="(field as FieldConfig).type === 'color'"
                :model-value="getFieldValue(field as FieldConfig) as string"
                :swatch-only="(field as FieldConfig).props?.swatchOnly"
                @update:model-value="updateFieldValue(field as FieldConfig, $event)"
              />

              <!-- Slider input -->
              <SliderInput
                v-else-if="(field as FieldConfig).type === 'slider'"
                :model-value="getFieldValue(field as FieldConfig) as string"
                :min="(field as FieldConfig).props?.min"
                :max="(field as FieldConfig).props?.max"
                :step="(field as FieldConfig).props?.step"
                :unit="(field as FieldConfig).props?.unit"
                @update:model-value="updateFieldValue(field as FieldConfig, $event)"
              />

              <!-- Size input -->
              <SizeInput
                v-else-if="(field as FieldConfig).type === 'size'"
                :model-value="getFieldValue(field as FieldConfig) as string"
                :placeholder="(field as FieldConfig).placeholder"
                @update:model-value="updateFieldValue(field as FieldConfig, $event)"
              />

              <!-- Select input -->
              <SelectInput
                v-else-if="(field as FieldConfig).type === 'select'"
                :model-value="getFieldValue(field as FieldConfig) as string"
                :options="(field as FieldConfig).props?.options || []"
                @update:model-value="updateFieldValue(field as FieldConfig, $event)"
              />

              <!-- Segmented control -->
              <SegmentedControl
                v-else-if="(field as FieldConfig).type === 'segmented'"
                :model-value="getFieldValue(field as FieldConfig) as string"
                :options="(field as FieldConfig).props?.options || []"
                :icon-only="(field as FieldConfig).props?.iconOnly"
                @update:model-value="updateFieldValue(field as FieldConfig, $event)"
              />

              <!-- Link input -->
              <LinkInput
                v-else-if="(field as FieldConfig).type === 'link'"
                :model-value="getFieldValue(field as FieldConfig) as string"
                :placeholder="(field as FieldConfig).placeholder"
                @update:model-value="updateFieldValue(field as FieldConfig, $event)"
              />
            </InspectorField>
          </template>
        </template>
      </InspectorSection>
    </template>

    <!-- Preview Section (for accordion items and their descendants) -->
    <PreviewSection
      v-if="isInAccordionContext"
      :preview-state="accordionPreviewState"
      @update:preview-state="updateAccordionPreviewState"
    />

    <!-- Shared sections -->
    <template v-for="section in config.sections" :key="section">
      <!-- Display Section (includes size) -->
      <DisplaySection
        v-if="section === 'display'"
        :width="responsiveStyles.width"
        :height="responsiveStyles.height"
        :direction="styles.flexDirection"
        :justify="selectedBlock?.type === 'grid' ? styles.justifyItems : styles.justifyContent"
        :align="styles.alignItems"
        :gap="styles.gap"
        :columns="(settings as Record<string, unknown>).columns as number | undefined"
        :rows="(settings as Record<string, unknown>).rows as number | undefined"
        :column-span="(settings as Record<string, unknown>).gridColumnSpan as number | undefined"
        :row-span="(settings as Record<string, unknown>).gridRowSpan as number | undefined"
        :max-columns="parentGridColumns || 12"
        :flex-mode="(settings as Record<string, unknown>).flexMode as string | undefined"
        :flex-value="(settings as Record<string, unknown>).flexValue as string | undefined"
        :hide-direction="selectedBlock?.type === 'grid'"
        :hide-layout="!['container', 'stack', 'grid', 'canvas', 'button'].includes(selectedBlock?.type || '')"
        :is-grid="selectedBlock?.type === 'grid'"
        :is-grid-child="isChildOfGrid"
        :is-flex-child="isInFlexContainer"
        :block-type="selectedBlock?.type"
        :html-tag="(settings as Record<string, unknown>).htmlTag as string | undefined"
        @update:width="updateBlockStyles({ width: $event })"
        @update:height="updateBlockStyles({ height: $event })"
        @update:direction="updateBlockStyles({ flexDirection: $event })"
        @update:justify="updateBlockStyles(selectedBlock?.type === 'grid' ? { justifyItems: $event } : { justifyContent: $event })"
        @update:align="updateBlockStyles({ alignItems: $event })"
        @update:gap="updateBlockStyles({ gap: $event })"
        @update:columns="updateBlockSettings({ columns: $event })"
        @update:rows="updateBlockSettings({ rows: $event })"
        @update:column-span="updateBlockSettings({ gridColumnSpan: $event })"
        @update:row-span="updateBlockSettings({ gridRowSpan: $event })"
        @update:flex-mode="updateBlockSettings({ flexMode: $event })"
        @update:flex-value="updateBlockSettings({ flexValue: $event })"
        @update:html-tag="updateBlockSettings({ htmlTag: $event })"
      />

      <!-- Typography Section -->
      <TypographySection
        v-else-if="section === 'typography'"
        :font-family="styles.fontFamily"
        :font-size="styles.fontSize"
        :font-weight="styles.fontWeight"
        :font-style="styles.fontStyle"
        :text-decoration="styles.textDecoration"
        :text-transform="styles.textTransform"
        :line-height="styles.lineHeight"
        :letter-spacing="styles.letterSpacing"
        :alignment="styles.alignment"
        :color="styles.color"
        :font-options="fontFamilyOptions"
        :default-font-family="defaultFontFamily"
        :default-font-size="config.typographyDefaults?.defaultFontSize || '16px'"
        :default-font-weight="config.typographyDefaults?.defaultFontWeight || 'normal'"
        @update:font-family="updateBlockStyles({ fontFamily: $event })"
        @update:font-size="updateBlockStyles({ fontSize: $event })"
        @update:font-weight="updateBlockStyles({ fontWeight: $event })"
        @update:font-style="updateBlockStyles({ fontStyle: $event })"
        @update:text-decoration="updateBlockStyles({ textDecoration: $event })"
        @update:text-transform="updateBlockStyles({ textTransform: $event })"
        @update:line-height="updateBlockStyles({ lineHeight: $event })"
        @update:letter-spacing="updateBlockStyles({ letterSpacing: $event })"
        @update:alignment="updateBlockStyles({ alignment: $event })"
        @update:color="updateBlockStyles({ color: $event })"
      />

      <!-- Styles Section -->
      <StylesSection
        v-else-if="section === 'styles'"
        :margin="responsiveStyles.margin"
        :padding="responsiveStyles.padding"
        :background-type="(settings as Record<string, unknown>).backgroundType as 'color' | 'image' | 'video' | 'gradient' | undefined"
        :background-color="responsiveStyles.backgroundColor"
        :background-image="(settings as Record<string, unknown>).backgroundImage as string | undefined"
        :background-video="(settings as Record<string, unknown>).backgroundVideo as string | undefined"
        :background-gradient="responsiveStyles.backgroundGradient"
        :background-image-opacity="(settings as Record<string, unknown>).backgroundImageOpacity as number | undefined"
        :background-image-blur="(settings as Record<string, unknown>).backgroundImageBlur as number | undefined"
        :background-image-saturation="(settings as Record<string, unknown>).backgroundImageSaturation as number | undefined"
        :background-image-overlay="(settings as Record<string, unknown>).backgroundImageOverlay as string | undefined"
        :background-image-overlay-opacity="(settings as Record<string, unknown>).backgroundImageOverlayOpacity as number | undefined"
        :shadow="responsiveStyles.shadow"
        :border-radius="responsiveStyles.borderRadius"
        :border="responsiveStyles.border"
        :overflow="responsiveStyles.overflow"
        :opacity="responsiveStyles.opacity"
        :blur="responsiveStyles.blur"
        :aspect-ratio="styles.aspectRatio as any"
        :object-fit="styles.objectFit as any"
        :mask="styles.mask as any"
        :brightness="styles.brightness as number | undefined"
        :contrast="styles.contrast as number | undefined"
        :saturation="styles.saturation as number | undefined"
        :hue="styles.hue as number | undefined"
        :grayscale="styles.grayscale as number | undefined"
        :translate-x="responsiveStyles.translateX"
        :translate-y="responsiveStyles.translateY"
        :rotate="responsiveStyles.rotate"
        :scale="responsiveStyles.scale"
        :z-index="responsiveStyles.zIndex"
        :position="responsiveStyles.position"
        :top="responsiveStyles.top"
        :right="responsiveStyles.right"
        :bottom="responsiveStyles.bottom"
        :left="responsiveStyles.left"
        :hide-background="selectedBlock?.type === 'image'"
        :show-image-options="selectedBlock?.type === 'image'"
        @update:margin="updateBlockStyles({ margin: $event })"
        @update:padding="updateBlockStyles({ padding: $event })"
        @update:background-type="updateBlockSettings({ backgroundType: $event })"
        @update:background-color="updateBlockStyles({ backgroundColor: $event })"
        @update:background-image="updateBlockSettings({ backgroundImage: $event })"
        @update:background-video="updateBlockSettings({ backgroundVideo: $event })"
        @update:background-gradient="updateBlockStyles({ backgroundGradient: $event })"
        @update:background-image-opacity="updateBlockSettings({ backgroundImageOpacity: $event })"
        @update:background-image-blur="updateBlockSettings({ backgroundImageBlur: $event })"
        @update:background-image-saturation="updateBlockSettings({ backgroundImageSaturation: $event })"
        @update:background-image-overlay="updateBlockSettings({ backgroundImageOverlay: $event })"
        @update:background-image-overlay-opacity="updateBlockSettings({ backgroundImageOverlayOpacity: $event })"
        @update:shadow="updateBlockStyles({ shadow: $event })"
        @update:border-radius="updateBlockStyles({ borderRadius: $event })"
        @update:border="updateBlockStyles({ border: $event })"
        @update:overflow="updateBlockStyles({ overflow: $event })"
        @update:opacity="updateBlockStyles({ opacity: $event })"
        @update:blur="updateBlockStyles({ blur: $event })"
        @update:aspect-ratio="updateBlockStyles({ aspectRatio: $event })"
        @update:object-fit="updateBlockStyles({ objectFit: $event })"
        @update:mask="updateBlockStyles({ mask: $event })"
        @update:brightness="updateBlockStyles({ brightness: $event })"
        @update:contrast="updateBlockStyles({ contrast: $event })"
        @update:saturation="updateBlockStyles({ saturation: $event })"
        @update:hue="updateBlockStyles({ hue: $event })"
        @update:grayscale="updateBlockStyles({ grayscale: $event })"
        @update:translate-x="updateBlockStyles({ translateX: $event })"
        @update:translate-y="updateBlockStyles({ translateY: $event })"
        @update:rotate="updateBlockStyles({ rotate: $event })"
        @update:scale="updateBlockStyles({ scale: $event })"
        @update:z-index="updateBlockStyles({ zIndex: $event })"
        @update:position="updateBlockStyles({ position: $event })"
        @update:top="updateBlockStyles({ top: $event })"
        @update:right="updateBlockStyles({ right: $event })"
        @update:bottom="updateBlockStyles({ bottom: $event })"
        @update:left="updateBlockStyles({ left: $event })"
      />

      <!-- Effects Section -->
      <EffectsSection
        v-else-if="section === 'effects'"
        :effects="(effectiveBlockStyles as Record<string, unknown>).effects as any"
        :descendants="allDescendants"
        @update:effects="updateBlockStyles({ effects: $event })"
      />
    </template>

    <!-- Debug Section (always shown at bottom) -->
    <DebugSection :block="selectedBlock" />
  </div>
</template>
