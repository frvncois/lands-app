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
} from './inspector-config'
import type { SectionBlockType } from '@/types/editor'

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
import Tooltip from '@/components/ui/Tooltip.vue'
import {
  SizeSection,
  SpacingSection,
  BorderSection,
  OpacitySection,
  PositionSection,
  TypographySection,
  DisplaySection,
  TransformSection,
} from './sections'

const {
  selectedBlock,
  effectiveBlockStyles,
  responsiveStyles,
  updateBlockSettings,
  updateBlockStyles,
  editorStore,
  parentGridColumns,
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

// Get style value as string (helper for template)
function getStyle(key: string): string | undefined {
  return styles.value[key]
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

function isToggleGroup(field: FieldConfig | ToggleGroupConfig): field is ToggleGroupConfig {
  return 'type' in field && field.type === 'toggle-group'
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
            </InspectorField>
          </template>
        </template>
      </InspectorSection>
    </template>

    <!-- Shared sections -->
    <template v-for="section in config.sections" :key="section">
      <!-- Size Section -->
      <SizeSection
        v-if="section === 'size'"
        :width="responsiveStyles.width"
        :height="responsiveStyles.height"
        :overflow="responsiveStyles.overflow"
        :grid-column-span="(settings as Record<string, unknown>).gridColumnSpan as number | undefined"
        :grid-row-span="(settings as Record<string, unknown>).gridRowSpan as number | undefined"
        :parent-grid-columns="parentGridColumns"
        @update:width="updateBlockStyles({ width: $event })"
        @update:height="updateBlockStyles({ height: $event })"
        @update:overflow="updateBlockStyles({ overflow: $event })"
        @update:grid-column-span="updateBlockSettings({ gridColumnSpan: $event })"
        @update:grid-row-span="updateBlockSettings({ gridRowSpan: $event })"
      />

      <!-- Typography Section -->
      <TypographySection
        v-else-if="section === 'typography'"
        :font-family="styles.fontFamily"
        :font-size="styles.fontSize"
        :font-weight="styles.fontWeight"
        :font-style="styles.fontStyle"
        :text-decoration="styles.textDecoration"
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
        @update:line-height="updateBlockStyles({ lineHeight: $event })"
        @update:letter-spacing="updateBlockStyles({ letterSpacing: $event })"
        @update:alignment="updateBlockStyles({ alignment: $event })"
        @update:color="updateBlockStyles({ color: $event })"
      />

      <!-- Display Section -->
      <DisplaySection
        v-else-if="section === 'display'"
        :direction="styles.flexDirection"
        :justify="selectedBlock?.type === 'grid' ? styles.justifyItems : styles.justifyContent"
        :align="styles.alignItems"
        :gap="styles.gap"
        :hide-direction="selectedBlock?.type === 'grid'"
        @update:direction="updateBlockStyles({ flexDirection: $event })"
        @update:justify="updateBlockStyles(selectedBlock?.type === 'grid' ? { justifyItems: $event } : { justifyContent: $event })"
        @update:align="updateBlockStyles({ alignItems: $event })"
        @update:gap="updateBlockStyles({ gap: $event })"
      />

      <!-- Spacing Section -->
      <SpacingSection
        v-else-if="section === 'spacing'"
        :margin="responsiveStyles.margin"
        :padding="responsiveStyles.padding"
        @update:margin="updateBlockStyles({ margin: $event })"
        @update:padding="updateBlockStyles({ padding: $event })"
      />

      <!-- Border Section -->
      <BorderSection
        v-else-if="section === 'border'"
        :model-value="responsiveStyles.border"
        @update:model-value="updateBlockStyles({ border: $event })"
      />

      <!-- Opacity Section -->
      <OpacitySection
        v-else-if="section === 'opacity'"
        :opacity="responsiveStyles.opacity"
        :mix-blend-mode="responsiveStyles.mixBlendMode"
        @update:opacity="updateBlockStyles({ opacity: $event })"
        @update:mix-blend-mode="updateBlockStyles({ mixBlendMode: $event })"
      />

      <!-- Transform Section -->
      <TransformSection
        v-else-if="section === 'transform'"
        :rotate="responsiveStyles.rotate"
        :scale="responsiveStyles.scale"
        :translate-x="responsiveStyles.translateX"
        :translate-y="responsiveStyles.translateY"
        :blur="responsiveStyles.blur"
        @update:rotate="updateBlockStyles({ rotate: $event })"
        @update:scale="updateBlockStyles({ scale: $event })"
        @update:translate-x="updateBlockStyles({ translateX: $event })"
        @update:translate-y="updateBlockStyles({ translateY: $event })"
        @update:blur="updateBlockStyles({ blur: $event })"
      />

      <!-- Position Section -->
      <PositionSection
        v-else-if="section === 'position'"
        :position="responsiveStyles.position"
        :z-index="responsiveStyles.zIndex"
        :top="responsiveStyles.top"
        :right="responsiveStyles.right"
        :bottom="responsiveStyles.bottom"
        :left="responsiveStyles.left"
        @update:position="updateBlockStyles({ position: $event })"
        @update:z-index="updateBlockStyles({ zIndex: $event })"
        @update:top="updateBlockStyles({ top: $event })"
        @update:right="updateBlockStyles({ right: $event })"
        @update:bottom="updateBlockStyles({ bottom: $event })"
        @update:left="updateBlockStyles({ left: $event })"
      />
    </template>
  </div>
</template>
