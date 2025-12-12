<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import { alignmentOptions, fontWeightOptions } from '@/lib/editor-utils'
import type { TextSettings, TextStyles } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SelectInput from '../SelectInput.vue'
import FontSizeSlider from '../FontSizeSlider.vue'
import SliderInput from '../SliderInput.vue'
import ColorInput from '../ColorInput.vue'
import ToggleInput from '../ToggleInput.vue'
import Icon from '@/components/ui/Icon.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
import { SpacingSection, BorderSection, OpacitySection, PositionSection } from '../sections'

const {
  selectedBlock,
  effectiveBlockStyles,
  responsiveStyles,
  pageSettings,
  isListCollectionItem,
  hasOverwriteStyle,
  updateBlockSettings,
  updateBlockStyles,
  toggleOverwriteStyle,
  editorStore,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as TextSettings)
const styles = computed(() => effectiveBlockStyles.value as TextStyles)

// Translation-aware content
function getContent(): string {
  if (!selectedBlock.value) return ''
  if (editorStore.isEditingTranslation && editorStore.currentLanguage) {
    const langTranslations = editorStore.translations.languages[editorStore.currentLanguage]
    const blockTranslation = langTranslations?.blocks[selectedBlock.value.id]
    if (blockTranslation?.content !== undefined) {
      return blockTranslation.content
    }
  }
  return settings.value?.content ?? ''
}

function updateContent(value: string) {
  if (!selectedBlock.value) return
  if (editorStore.isEditingTranslation) {
    editorStore.updateBlockTranslation(selectedBlock.value.id, 'content', value)
  } else {
    updateBlockSettings({ content: value })
  }
}

// Font options
const fontFamilyOptions = computed(() => {
  const customFonts = pageSettings.value.customFonts || []
  const googleFonts = pageSettings.value.googleFonts || []

  const baseOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'system-ui', label: 'System' },
  ]

  const customOptions = customFonts.map(font => ({
    value: font.name,
    label: `${font.name} (Custom)`
  }))

  const googleOptions = googleFonts.map(font => ({
    value: font.family,
    label: font.family
  }))

  return [...baseOptions, ...googleOptions, ...customOptions]
})

function toggleFontStyle() {
  updateBlockStyles({ fontStyle: styles.value.fontStyle === 'italic' ? 'normal' : 'italic' })
}

function toggleUnderline() {
  updateBlockStyles({ textDecoration: styles.value.textDecoration === 'underline' ? 'none' : 'underline' })
}

function toggleStrikethrough() {
  updateBlockStyles({ textDecoration: styles.value.textDecoration === 'line-through' ? 'none' : 'line-through' })
}
</script>

<template>
  <div v-if="selectedBlock">
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

    <!-- Content Section -->
    <InspectorSection title="Content" icon="content-text">
      <InspectorField label="Text">
        <TextInput
          :model-value="getContent()"
          placeholder="Enter your text..."
          multiline
          @update:model-value="updateContent($event)"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Style Section -->
    <InspectorSection title="Style" icon="style-color">
      <InspectorField label="Font Family" horizontal>
        <SelectInput
          :options="fontFamilyOptions"
          :model-value="styles.fontFamily || pageSettings.fontFamily || 'Inter'"
          @update:model-value="updateBlockStyles({ fontFamily: $event })"
        />
      </InspectorField>
      <InspectorField label="Font Size" horizontal>
        <FontSizeSlider
          :model-value="styles.fontSize || 'base'"
          @update:model-value="updateBlockStyles({ fontSize: $event })"
        />
      </InspectorField>
      <InspectorField label="Font Weight" horizontal>
        <SelectInput
          :options="fontWeightOptions"
          :model-value="styles.fontWeight || 'normal'"
          @update:model-value="updateBlockStyles({ fontWeight: $event })"
        />
      </InspectorField>
      <InspectorField label="Style" horizontal>
        <div class="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
          <Tooltip text="Italic">
            <button
              type="button"
              class="flex items-center justify-center w-7 h-7 rounded transition-colors"
              :class="styles.fontStyle === 'italic'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'"
              @click="toggleFontStyle"
            >
              <Icon name="italic" class="text-sm" />
            </button>
          </Tooltip>
          <Tooltip text="Underline">
            <button
              type="button"
              class="flex items-center justify-center w-7 h-7 rounded transition-colors"
              :class="styles.textDecoration === 'underline'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'"
              @click="toggleUnderline"
            >
              <Icon name="underline" class="text-sm" />
            </button>
          </Tooltip>
          <Tooltip text="Strikethrough">
            <button
              type="button"
              class="flex items-center justify-center w-7 h-7 rounded transition-colors"
              :class="styles.textDecoration === 'line-through'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'"
              @click="toggleStrikethrough"
            >
              <Icon name="strikethrough" class="text-sm" />
            </button>
          </Tooltip>
        </div>
      </InspectorField>
      <InspectorField label="Text Color" horizontal>
        <ColorInput
          :model-value="styles.color"
          swatch-only
          @update:model-value="updateBlockStyles({ color: $event })"
        />
      </InspectorField>
      <InspectorField label="Line Height" horizontal>
        <SliderInput
          :model-value="styles.lineHeight || '1.5'"
          :min="1"
          :max="2.5"
          :step="0.1"
          @update:model-value="updateBlockStyles({ lineHeight: $event })"
        />
      </InspectorField>
      <InspectorField label="Letter Spacing" horizontal>
        <SliderInput
          :model-value="styles.letterSpacing || '0'"
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
          :model-value="styles.alignment || 'left'"
          icon-only
          @update:model-value="updateBlockStyles({ alignment: $event })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Spacing Section -->
    <SpacingSection
      :margin="responsiveStyles.margin"
      :padding="responsiveStyles.padding"
      @update:margin="updateBlockStyles({ margin: $event })"
      @update:padding="updateBlockStyles({ padding: $event })"
    />

    <!-- Border Section -->
    <BorderSection
      :model-value="responsiveStyles.border"
      @update:model-value="updateBlockStyles({ border: $event })"
    />

    <!-- Opacity Section -->
    <OpacitySection
      :opacity="responsiveStyles.opacity"
      :mix-blend-mode="responsiveStyles.mixBlendMode"
      @update:opacity="updateBlockStyles({ opacity: $event })"
      @update:mix-blend-mode="updateBlockStyles({ mixBlendMode: $event })"
    />

    <!-- Position Section -->
    <PositionSection
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
  </div>
</template>
