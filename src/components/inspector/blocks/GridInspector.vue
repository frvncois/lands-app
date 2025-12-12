<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import { justifyItemsOptions, alignItemsOptions } from '@/lib/editor-utils'
import type { GridSettings, GridStyles } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
import ImageInput from '../ImageInput.vue'
import SegmentedControl from '../SegmentedControl.vue'
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

const settings = computed(() => selectedBlock.value?.settings as GridSettings)
const styles = computed(() => effectiveBlockStyles.value as GridStyles)
</script>

<template>
  <div v-if="selectedBlock">
    <!-- Slider Mode Settings -->
    <template v-if="settings.isSlider">
      <InspectorSection title="Slider" icon="list-slider">
        <InspectorField label="Slides Per View" horizontal>
          <SliderInput
            :model-value="String(settings.slidesPerView || 1)"
            :min="1"
            :max="4"
            :step="1"
            unit=""
            @update:model-value="updateBlockSettings({ slidesPerView: Number($event) })"
          />
        </InspectorField>
        <InspectorField label="Gap" horizontal>
          <SliderInput
            :model-value="settings.gap || '16'"
            :min="0"
            :max="48"
            :step="4"
            @update:model-value="updateBlockSettings({ gap: $event })"
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

      <InspectorSection title="Navigation" icon="chevron-left">
        <InspectorField label="Show Arrows" horizontal>
          <ToggleInput
            :model-value="settings.showArrows ?? true"
            @update:model-value="updateBlockSettings({ showArrows: $event })"
          />
        </InspectorField>
        <InspectorField label="Show Dots" horizontal>
          <ToggleInput
            :model-value="settings.showDots ?? true"
            @update:model-value="updateBlockSettings({ showDots: $event })"
          />
        </InspectorField>
        <InspectorField label="Loop" horizontal>
          <ToggleInput
            :model-value="settings.loop ?? false"
            @update:model-value="updateBlockSettings({ loop: $event })"
          />
        </InspectorField>
      </InspectorSection>

      <InspectorSection title="Autoplay" icon="play">
        <InspectorField label="Enable Autoplay" horizontal>
          <ToggleInput
            :model-value="settings.autoplay ?? false"
            @update:model-value="updateBlockSettings({ autoplay: $event })"
          />
        </InspectorField>
        <InspectorField v-if="settings.autoplay" label="Interval (ms)" horizontal>
          <SliderInput
            :model-value="String(settings.autoplayInterval || 5000)"
            :min="2000"
            :max="10000"
            :step="500"
            unit=""
            @update:model-value="updateBlockSettings({ autoplayInterval: Number($event) })"
          />
        </InspectorField>
      </InspectorSection>
    </template>

    <!-- Regular Grid Settings -->
    <template v-else>
      <InspectorSection title="Grid" icon="layout-grid">
        <InspectorField label="Columns" horizontal>
          <SliderInput
            :model-value="String(settings.columns || 2)"
            :min="1"
            :max="12"
            :step="1"
            unit=""
            @update:model-value="updateBlockSettings({ columns: Number($event), columnWidths: undefined })"
          />
        </InspectorField>
        <!-- Column widths display -->
        <div v-if="settings.columnWidths" class="px-3 py-2 text-xs text-muted-foreground">
          <div class="flex items-center justify-between mb-1">
            <span>Column widths:</span>
            <button
              class="text-[10px] text-primary hover:underline"
              @click="updateBlockSettings({ columnWidths: undefined })"
            >Reset</button>
          </div>
          <div class="flex gap-1">
            <span
              v-for="(w, i) in settings.columnWidths"
              :key="i"
              class="px-1.5 py-0.5 bg-secondary rounded text-[10px]"
            >{{ w }}fr</span>
          </div>
        </div>
        <InspectorField label="Gap" horizontal>
          <SliderInput
            :model-value="settings.gap || '16'"
            :min="0"
            :max="48"
            :step="4"
            @update:model-value="updateBlockSettings({ gap: $event })"
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
    </template>

    <!-- Content Position Section -->
    <InspectorSection title="Content Position" icon="style-border-top">
      <InspectorField label="Justify" horizontal>
        <SegmentedControl
          :options="justifyItemsOptions"
          :model-value="styles.justifyItems || 'stretch'"
          icon-only
          @update:model-value="updateBlockStyles({ justifyItems: $event })"
        />
      </InspectorField>
      <InspectorField label="Align" horizontal>
        <SegmentedControl
          :options="alignItemsOptions"
          :model-value="styles.alignItems || 'stretch'"
          icon-only
          @update:model-value="updateBlockStyles({ alignItems: $event })"
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
