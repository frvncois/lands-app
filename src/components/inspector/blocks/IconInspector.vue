<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import type { IconSettings, IconStyles } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
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
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as IconSettings)
const styles = computed(() => effectiveBlockStyles.value as IconStyles)
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

    <!-- Icon Section -->
    <InspectorSection title="Icon" icon="content-icon">
      <InspectorField label="Icon Name">
        <TextInput
          :model-value="settings.icon"
          placeholder="content-icon"
          @update:model-value="updateBlockSettings({ icon: $event })"
        />
      </InspectorField>
      <InspectorField label="Size" horizontal>
        <SliderInput
          :model-value="settings.size || '24'"
          :min="12"
          :max="96"
          :step="4"
          unit="px"
          @update:model-value="updateBlockSettings({ size: $event })"
        />
      </InspectorField>
      <InspectorField label="Link URL">
        <TextInput
          :model-value="settings.linkUrl"
          placeholder="https://..."
          @update:model-value="updateBlockSettings({ linkUrl: $event })"
        />
      </InspectorField>
      <div class="px-3">
        <ToggleInput
          :model-value="settings.linkNewTab ?? false"
          label="Open in new tab"
          @update:model-value="updateBlockSettings({ linkNewTab: $event })"
        />
      </div>
    </InspectorSection>

    <!-- Style Section -->
    <InspectorSection title="Style" icon="style-color">
      <InspectorField label="Color" horizontal>
        <ColorInput
          :model-value="styles.color"
          swatch-only
          @update:model-value="updateBlockStyles({ color: $event })"
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
