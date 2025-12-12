<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import { buttonSizeOptions } from '@/lib/editor-utils'
import type { ButtonSettings, ButtonStyles } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
import SegmentedControl from '../SegmentedControl.vue'
import FontSizeSlider from '../FontSizeSlider.vue'
import SliderInput from '../SliderInput.vue'
import ColorInput from '../ColorInput.vue'
import ToggleInput from '../ToggleInput.vue'
import { SpacingSection, BorderSection, OpacitySection, PositionSection } from '../sections'

const {
  selectedBlock,
  effectiveBlockStyles,
  responsiveStyles,
  isListCollectionItem,
  hasOverwriteStyle,
  updateBlockSettings,
  updateBlockStyles,
  toggleOverwriteStyle,
  editorStore,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as ButtonSettings)
const styles = computed(() => effectiveBlockStyles.value as ButtonStyles)

// Translation-aware content
function getLabel(): string {
  if (!selectedBlock.value) return ''
  if (editorStore.isEditingTranslation && editorStore.currentLanguage) {
    const langTranslations = editorStore.translations.languages[editorStore.currentLanguage]
    const blockTranslation = langTranslations?.blocks[selectedBlock.value.id]
    if (blockTranslation?.label !== undefined) {
      return blockTranslation.label
    }
  }
  return settings.value?.label ?? ''
}

function updateLabel(value: string) {
  if (!selectedBlock.value) return
  if (editorStore.isEditingTranslation) {
    editorStore.updateBlockTranslation(selectedBlock.value.id, 'label', value)
  } else {
    updateBlockSettings({ label: value })
  }
}
</script>

<template>
  <div v-if="selectedBlock">
    <!-- Overwrite Style Toggle -->
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

    <!-- Button Section -->
    <InspectorSection title="Button" icon="content-button">
      <InspectorField label="Label">
        <TextInput
          :model-value="getLabel()"
          placeholder="Button text"
          @update:model-value="updateLabel($event)"
        />
      </InspectorField>
      <InspectorField label="URL">
        <TextInput
          :model-value="settings.url"
          placeholder="https://..."
          @update:model-value="updateBlockSettings({ url: $event })"
        />
      </InspectorField>
      <InspectorField label="Size" horizontal>
        <SegmentedControl
          :options="buttonSizeOptions"
          :model-value="settings.size"
          @update:model-value="updateBlockSettings({ size: $event })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Style Section -->
    <InspectorSection title="Style" icon="style-color">
      <InspectorField label="Background" horizontal>
        <ColorInput
          :model-value="styles.backgroundColor"
          swatch-only
          @update:model-value="updateBlockStyles({ backgroundColor: $event })"
        />
      </InspectorField>
      <InspectorField label="Text Color" horizontal>
        <ColorInput
          :model-value="styles.color"
          swatch-only
          @update:model-value="updateBlockStyles({ color: $event })"
        />
      </InspectorField>
      <InspectorField label="Font Size" horizontal>
        <FontSizeSlider
          :model-value="styles.fontSize || 'base'"
          @update:model-value="updateBlockStyles({ fontSize: $event })"
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
      <InspectorField label="Border Radius" horizontal>
        <SliderInput
          :model-value="styles.border?.radius || '8'"
          :min="0"
          :max="32"
          :step="1"
          unit="px"
          @update:model-value="updateBlockStyles({ border: { ...styles.border, radius: $event } })"
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
