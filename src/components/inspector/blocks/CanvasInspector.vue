<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import type { CanvasSettings } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
import ImageInput from '../ImageInput.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SliderInput from '../SliderInput.vue'
import ColorInput from '../ColorInput.vue'
import { SpacingSection, BorderSection, OpacitySection, PositionSection } from '../sections'

const {
  selectedBlock,
  responsiveStyles,
  updateBlockSettings,
  updateBlockStyles,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as CanvasSettings)
</script>

<template>
  <div v-if="selectedBlock">
    <!-- Canvas Section -->
    <InspectorSection title="Canvas" icon="style-column">
      <InspectorField label="Min Height" horizontal>
        <SliderInput
          :model-value="settings.minHeight || '0'"
          :min="0"
          :max="100"
          :step="25"
          unit="vh"
          @update:model-value="updateBlockSettings({ minHeight: $event })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Background Section -->
    <InspectorSection title="Background" icon="content-image">
      <InspectorField label="Type" horizontal>
        <SegmentedControl
          :options="[
            { value: 'color', label: 'Color', icon: 'style-color' },
            { value: 'image', label: 'Image', icon: 'content-image' },
            { value: 'video', label: 'Video', icon: 'content-video' },
          ]"
          :model-value="settings.backgroundType || 'color'"
          icon-only
          @update:model-value="updateBlockSettings({ backgroundType: $event })"
        />
      </InspectorField>
      <InspectorField v-if="settings.backgroundType === 'color' || !settings.backgroundType" label="Color" horizontal>
        <ColorInput
          :model-value="responsiveStyles.backgroundColor"
          swatch-only
          @update:model-value="updateBlockStyles({ backgroundColor: $event })"
        />
      </InspectorField>
      <InspectorField v-else-if="settings.backgroundType === 'image'" label="Image">
        <ImageInput
          :model-value="settings.backgroundImage || ''"
          placeholder="Upload background image"
          @update:model-value="updateBlockSettings({ backgroundImage: $event })"
        />
      </InspectorField>
      <InspectorField v-else label="Video URL">
        <TextInput
          :model-value="settings.backgroundVideo || ''"
          placeholder="YouTube, Vimeo, or file URL"
          @update:model-value="updateBlockSettings({ backgroundVideo: $event })"
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
