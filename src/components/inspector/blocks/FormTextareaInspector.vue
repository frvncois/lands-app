<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import type { FormTextareaSettings, FormTextareaStyles } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
import SliderInput from '../SliderInput.vue'
import FontSizeSlider from '../FontSizeSlider.vue'
import ColorInput from '../ColorInput.vue'
import ToggleInput from '../ToggleInput.vue'
import { SpacingSection, BorderSection, OpacitySection, PositionSection } from '../sections'

const {
  selectedBlock,
  effectiveBlockStyles,
  responsiveStyles,
  updateBlockSettings,
  updateBlockStyles,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as FormTextareaSettings)
const styles = computed(() => effectiveBlockStyles.value as FormTextareaStyles)
</script>

<template>
  <div v-if="selectedBlock">
    <!-- Textarea Settings Section -->
    <InspectorSection title="Textarea Settings" icon="content-text">
      <InspectorField label="Label">
        <TextInput
          :model-value="settings.label"
          placeholder="Field label"
          @update:model-value="updateBlockSettings({ label: $event })"
        />
      </InspectorField>
      <InspectorField label="Placeholder">
        <TextInput
          :model-value="settings.placeholder"
          placeholder="Placeholder text"
          @update:model-value="updateBlockSettings({ placeholder: $event })"
        />
      </InspectorField>
      <InspectorField label="Rows">
        <SliderInput
          :model-value="settings.rows || 4"
          :min="2"
          :max="10"
          @update:model-value="updateBlockSettings({ rows: $event })"
        />
      </InspectorField>
      <div class="px-3">
        <ToggleInput
          :model-value="settings.required"
          label="Required field"
          @update:model-value="updateBlockSettings({ required: $event })"
        />
      </div>
    </InspectorSection>

    <!-- Style Section -->
    <InspectorSection title="Style" icon="style-color">
      <InspectorField label="Font Size" horizontal>
        <FontSizeSlider
          :model-value="styles.fontSize || 'base'"
          @update:model-value="updateBlockStyles({ fontSize: $event })"
        />
      </InspectorField>
      <InspectorField label="Text Color" horizontal>
        <ColorInput
          :model-value="styles.color"
          swatch-only
          @update:model-value="updateBlockStyles({ color: $event })"
        />
      </InspectorField>
      <InspectorField label="Label Color" horizontal>
        <ColorInput
          :model-value="styles.labelColor"
          swatch-only
          @update:model-value="updateBlockStyles({ labelColor: $event })"
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
