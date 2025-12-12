<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import type { ContainerSettings, ContainerStyles } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SliderInput from '../SliderInput.vue'
import SegmentedControl from '../SegmentedControl.vue'
import ColorInput from '../ColorInput.vue'
import ImageInput from '../ImageInput.vue'
import TextInput from '../TextInput.vue'
import { SpacingSection, BorderSection, OpacitySection, BackgroundSection, PositionSection } from '../sections'

const {
  selectedBlock,
  effectiveBlockStyles,
  responsiveStyles,
  updateBlockSettings,
  updateBlockStyles,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as ContainerSettings)
const styles = computed(() => effectiveBlockStyles.value as ContainerStyles)

// Flexbox options based on direction
const justifyOptions = computed(() => {
  if (styles.value.flexDirection === 'row') {
    return [
      { value: 'flex-start', label: 'Left', icon: 'style-justify-start' },
      { value: 'center', label: 'Center', icon: 'style-justify-center' },
      { value: 'flex-end', label: 'Right', icon: 'style-justify-end' },
      { value: 'space-between', label: 'Between', icon: 'style-justify-between' },
    ]
  }
  return [
    { value: 'flex-start', label: 'Top', icon: 'style-align-start' },
    { value: 'center', label: 'Center', icon: 'content-divider' },
    { value: 'flex-end', label: 'Bottom', icon: 'style-align-bottom' },
    { value: 'space-between', label: 'Between', icon: 'style-align-stretch' },
  ]
})

const alignOptions = computed(() => {
  if (styles.value.flexDirection === 'row') {
    return [
      { value: 'flex-start', label: 'Top', icon: 'style-align-start' },
      { value: 'center', label: 'Center', icon: 'content-divider' },
      { value: 'flex-end', label: 'Bottom', icon: 'style-align-bottom' },
      { value: 'stretch', label: 'Stretch', icon: 'style-align-stretch' },
    ]
  }
  return [
    { value: 'flex-start', label: 'Left', icon: 'style-justify-start' },
    { value: 'center', label: 'Center', icon: 'style-justify-center' },
    { value: 'flex-end', label: 'Right', icon: 'style-justify-end' },
    { value: 'stretch', label: 'Stretch', icon: 'style-justify-between' },
  ]
})
</script>

<template>
  <div v-if="selectedBlock">
    <!-- Container Settings -->
    <InspectorSection title="Container" icon="style-column">
      <InspectorField label="Max Width" horizontal>
        <SliderInput
          :model-value="settings.maxWidth || '1200'"
          :min="400"
          :max="1600"
          :step="100"
          unit="px"
          @update:model-value="updateBlockSettings({ maxWidth: $event })"
        />
      </InspectorField>
      <InspectorField label="Min Height" horizontal>
        <SliderInput
          :model-value="settings.height || '0'"
          :min="0"
          :max="100"
          :step="25"
          unit="vh"
          @update:model-value="updateBlockSettings({ height: $event })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Content Position Section -->
    <InspectorSection title="Content Position" icon="style-border-top">
      <InspectorField label="Direction" horizontal>
        <SegmentedControl
          :options="[
            { value: 'column', label: 'Column', icon: 'style-column' },
            { value: 'row', label: 'Row', icon: 'style-row' },
          ]"
          :model-value="styles.flexDirection || 'column'"
          icon-only
          @update:model-value="updateBlockStyles({ flexDirection: $event })"
        />
      </InspectorField>
      <InspectorField label="Justify" horizontal>
        <SegmentedControl
          :options="justifyOptions"
          :model-value="styles.justifyContent || 'flex-start'"
          icon-only
          @update:model-value="updateBlockStyles({ justifyContent: $event })"
        />
      </InspectorField>
      <InspectorField label="Align" horizontal>
        <SegmentedControl
          :options="alignOptions"
          :model-value="styles.alignItems || 'stretch'"
          icon-only
          @update:model-value="updateBlockStyles({ alignItems: $event })"
        />
      </InspectorField>
      <InspectorField label="Gap" horizontal>
        <SliderInput
          :model-value="styles.gap || '16'"
          :min="0"
          :max="64"
          :step="4"
          @update:model-value="updateBlockStyles({ gap: $event })"
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
      <InspectorField
        v-if="settings.backgroundType === 'color' || !settings.backgroundType"
        label="Color"
        horizontal
      >
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
