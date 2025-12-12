<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import { justifyContentOptions, alignItemsOptions } from '@/lib/editor-utils'
import type { HeaderSettings, HeaderStyles } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
import ImageInput from '../ImageInput.vue'
import BoxModelInput from '../BoxModelInput.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SliderInput from '../SliderInput.vue'
import ColorInput from '../ColorInput.vue'
import ToggleInput from '../ToggleInput.vue'
import BorderInput from '../BorderInput.vue'
import { PositionSection } from '../sections'

const {
  selectedBlock,
  effectiveBlockStyles,
  responsiveStyles,
  updateBlockSettings,
  updateBlockStyles,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as HeaderSettings)
const styles = computed(() => effectiveBlockStyles.value as HeaderStyles)
</script>

<template>
  <div v-if="selectedBlock">
    <!-- Header Settings Section -->
    <InspectorSection title="Header Settings" icon="chevron-top">
      <div class="space-y-3 px-3">
        <ToggleInput
          :model-value="!settings.isHidden"
          label="Show header"
          @update:model-value="updateBlockSettings({ isHidden: !$event })"
        />
        <ToggleInput
          :model-value="settings.sticky ?? true"
          label="Make sticky"
          @update:model-value="updateBlockSettings({ sticky: $event })"
        />
      </div>
    </InspectorSection>

    <!-- Layout Section -->
    <InspectorSection title="Layout" icon="style-column">
      <InspectorField label="Gap" horizontal>
        <SliderInput
          :model-value="settings.gap || '16'"
          :min="0"
          :max="64"
          :step="4"
          @update:model-value="updateBlockSettings({ gap: $event })"
        />
      </InspectorField>
      <InspectorField label="Height" horizontal>
        <SliderInput
          :model-value="settings.height || '64'"
          :min="32"
          :max="200"
          :step="4"
          unit="px"
          @update:model-value="updateBlockSettings({ height: $event })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Content Position Section -->
    <InspectorSection title="Content Position" icon="style-border-top">
      <InspectorField label="Justify" horizontal>
        <SegmentedControl
          :options="justifyContentOptions"
          :model-value="styles.justifyContent || 'space-between'"
          icon-only
          @update:model-value="updateBlockStyles({ justifyContent: $event })"
        />
      </InspectorField>
      <InspectorField label="Align" horizontal>
        <SegmentedControl
          :options="alignItemsOptions"
          :model-value="styles.alignItems || 'center'"
          icon-only
          @update:model-value="updateBlockStyles({ alignItems: $event })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Spacing Section -->
    <InspectorSection title="Spacing" icon="style-column">
      <BoxModelInput
        :margin="responsiveStyles.margin"
        :padding="responsiveStyles.padding"
        @update:margin="updateBlockStyles({ margin: $event })"
        @update:padding="updateBlockStyles({ padding: $event })"
      />
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

    <!-- Border Section -->
    <InspectorSection title="Border" icon="style-border-top">
      <BorderInput
        :model-value="responsiveStyles.border"
        @update:model-value="updateBlockStyles({ border: $event })"
      />
    </InspectorSection>

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
