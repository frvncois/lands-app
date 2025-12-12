<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import type { VideoSettings, VideoStyles } from '@/types/editor'
import { maskShapes, maskShapeLabels } from '@/lib/editor-utils'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
import ImageInput from '../ImageInput.vue'
import SelectInput from '../SelectInput.vue'
import ToggleInput from '../ToggleInput.vue'
import { SpacingSection, BorderSection, OpacitySection, PositionSection } from '../sections'

const {
  selectedBlock,
  effectiveBlockStyles,
  responsiveStyles,
  updateBlockSettings,
  updateBlockStyles,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as VideoSettings)
const styles = computed(() => effectiveBlockStyles.value as VideoStyles)
</script>

<template>
  <div v-if="selectedBlock">
    <!-- Video Section -->
    <InspectorSection title="Video" icon="content-video">
      <InspectorField label="Source URL">
        <TextInput
          :model-value="settings.src"
          placeholder="YouTube, Vimeo, or file URL"
          @update:model-value="updateBlockSettings({ src: $event })"
        />
      </InspectorField>
      <InspectorField label="Thumbnail">
        <ImageInput
          :model-value="settings.thumbnail || ''"
          placeholder="Upload thumbnail"
          @update:model-value="updateBlockSettings({ thumbnail: $event })"
        />
      </InspectorField>
      <div class="space-y-2 px-3">
        <ToggleInput
          :model-value="settings.autoplay ?? false"
          label="Autoplay"
          @update:model-value="updateBlockSettings({ autoplay: $event })"
        />
        <ToggleInput
          :model-value="settings.loop ?? false"
          label="Loop"
          @update:model-value="updateBlockSettings({ loop: $event })"
        />
        <ToggleInput
          :model-value="settings.muted ?? false"
          label="Muted"
          @update:model-value="updateBlockSettings({ muted: $event })"
        />
        <ToggleInput
          :model-value="settings.controls ?? true"
          label="Show controls"
          @update:model-value="updateBlockSettings({ controls: $event })"
        />
      </div>
    </InspectorSection>

    <!-- Style Section -->
    <InspectorSection title="Style" icon="style-color">
      <InspectorField label="Aspect Ratio">
        <SelectInput
          :options="[
            { value: 'auto', label: 'Auto' },
            { value: '1:1', label: '1:1' },
            { value: '4:3', label: '4:3' },
            { value: '16:9', label: '16:9' },
          ]"
          :model-value="styles.aspectRatio || '16:9'"
          @update:model-value="updateBlockStyles({ aspectRatio: $event })"
        />
      </InspectorField>
      <InspectorField label="Mask">
        <SelectInput
          :options="maskShapes.map(shape => ({ value: shape, label: maskShapeLabels[shape] }))"
          :model-value="styles.mask || 'none'"
          @update:model-value="updateBlockStyles({ mask: $event })"
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
