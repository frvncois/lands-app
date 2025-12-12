<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import type { DividerSettings } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SliderInput from '../SliderInput.vue'
import ColorInput from '../ColorInput.vue'
import { SpacingSection, OpacitySection, PositionSection } from '../sections'

const {
  selectedBlock,
  responsiveStyles,
  updateBlockSettings,
  updateBlockStyles,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as DividerSettings)
</script>

<template>
  <div v-if="selectedBlock">
    <!-- Divider Section -->
    <InspectorSection title="Divider" icon="content-divider">
      <InspectorField label="Style" horizontal>
        <SegmentedControl
          :options="[
            { value: 'line', label: 'Line', icon: 'content-divider' },
            { value: 'dashed', label: 'Dashed', icon: 'content-divider' },
            { value: 'dotted', label: 'Dotted', icon: 'content-divider' },
            { value: 'space', label: 'Space', icon: 'style-row' },
          ]"
          :model-value="settings.style || 'line'"
          icon-only
          @update:model-value="updateBlockSettings({ style: $event })"
        />
      </InspectorField>
      <InspectorField v-if="settings.style !== 'space'" label="Thickness" horizontal>
        <SliderInput
          :model-value="settings.thickness || '1'"
          :min="1"
          :max="8"
          :step="1"
          @update:model-value="updateBlockSettings({ thickness: $event })"
        />
      </InspectorField>
      <InspectorField label="Width" horizontal>
        <SliderInput
          :model-value="settings.width || '100'"
          :min="10"
          :max="100"
          :step="5"
          unit="%"
          @update:model-value="updateBlockSettings({ width: $event })"
        />
      </InspectorField>
      <InspectorField v-if="settings.style !== 'space'" label="Color" horizontal>
        <ColorInput
          :model-value="settings.color"
          swatch-only
          @update:model-value="updateBlockSettings({ color: $event })"
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
