<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import { buttonSizeOptions } from '@/lib/editor-utils'
import type { FormButtonSettings, FormButtonStyles } from '@/types/editor'

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
  updateBlockSettings,
  updateBlockStyles,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as FormButtonSettings)
const styles = computed(() => effectiveBlockStyles.value as FormButtonStyles)
</script>

<template>
  <div v-if="selectedBlock">
    <!-- Button Settings Section -->
    <InspectorSection title="Button Settings" icon="content-button">
      <InspectorField label="Label">
        <TextInput
          :model-value="settings.label"
          placeholder="Submit"
          @update:model-value="updateBlockSettings({ label: $event })"
        />
      </InspectorField>
      <InspectorField label="Size">
        <SegmentedControl
          :model-value="settings.size || 'md'"
          :options="buttonSizeOptions"
          @update:model-value="updateBlockSettings({ size: $event })"
        />
      </InspectorField>
      <div class="px-3">
        <ToggleInput
          :model-value="settings.fullWidth ?? false"
          label="Full width"
          @update:model-value="updateBlockSettings({ fullWidth: $event })"
        />
      </div>
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
          :model-value="styles.textColor"
          swatch-only
          @update:model-value="updateBlockStyles({ textColor: $event })"
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
