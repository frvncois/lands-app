<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import type { ImageSettings, ImageStyles } from '@/types/editor'
import { maskShapes, maskShapeLabels } from '@/lib/editor-utils'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
import ImageInput from '../ImageInput.vue'
import SelectInput from '../SelectInput.vue'
import SliderInput from '../SliderInput.vue'
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
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as ImageSettings)
const styles = computed(() => effectiveBlockStyles.value as ImageStyles)
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

    <!-- Image Section -->
    <InspectorSection title="Image" icon="content-image">
      <InspectorField label="Source">
        <ImageInput
          :model-value="settings.src"
          placeholder="Upload image"
          @update:model-value="updateBlockSettings({ src: $event })"
        />
      </InspectorField>
      <InspectorField label="Alt Text">
        <TextInput
          :model-value="settings.alt"
          placeholder="Image description"
          @update:model-value="updateBlockSettings({ alt: $event })"
        />
      </InspectorField>
      <InspectorField label="Link URL">
        <TextInput
          :model-value="settings.linkUrl"
          placeholder="https://..."
          @update:model-value="updateBlockSettings({ linkUrl: $event })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Size Section -->
    <InspectorSection title="Size" icon="style-column">
      <InspectorField label="Width" horizontal>
        <SliderInput
          :model-value="parseInt(styles.width || '100')"
          :min="0"
          :max="100"
          :step="5"
          unit="%"
          @update:model-value="updateBlockStyles({ width: $event + '%' })"
        />
      </InspectorField>
      <InspectorField label="Height" horizontal>
        <SliderInput
          :model-value="parseInt(styles.height || '100')"
          :min="0"
          :max="100"
          :step="5"
          unit="%"
          @update:model-value="updateBlockStyles({ height: $event + '%' })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Style Section -->
    <InspectorSection title="Style" icon="style-color">
      <InspectorField label="Aspect Ratio">
        <SelectInput
          :options="[
            { value: 'auto', label: 'Auto' },
            { value: '1:1', label: '1:1 (Square)' },
            { value: '4:3', label: '4:3' },
            { value: '3:4', label: '3:4' },
            { value: '16:9', label: '16:9 (Widescreen)' },
            { value: '9:16', label: '9:16 (Portrait)' },
            { value: '3:2', label: '3:2' },
            { value: '2:3', label: '2:3' },
          ]"
          :model-value="styles.aspectRatio || 'auto'"
          @update:model-value="updateBlockStyles({ aspectRatio: $event })"
        />
      </InspectorField>
      <InspectorField label="Object Fit">
        <SelectInput
          :options="[
            { value: 'cover', label: 'Cover' },
            { value: 'contain', label: 'Contain' },
            { value: 'fill', label: 'Fill' },
            { value: 'none', label: 'None' },
            { value: 'scale-down', label: 'Scale Down' },
          ]"
          :model-value="styles.objectFit || 'cover'"
          @update:model-value="updateBlockStyles({ objectFit: $event })"
        />
      </InspectorField>
      <InspectorField label="Mask">
        <SelectInput
          :options="maskShapes.map(shape => ({ value: shape, label: maskShapeLabels[shape] }))"
          :model-value="styles.mask || 'none'"
          @update:model-value="updateBlockStyles({ mask: $event })"
        />
      </InspectorField>
      <InspectorField label="Border Radius" horizontal>
        <SliderInput
          :model-value="styles.borderRadius || '0'"
          :min="0"
          :max="48"
          :step="4"
          @update:model-value="updateBlockStyles({ borderRadius: $event })"
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
