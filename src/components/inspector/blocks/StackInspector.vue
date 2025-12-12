<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import { justifyContentOptions, alignItemsOptions } from '@/lib/editor-utils'
import type { StackSettings, StackStyles } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
import ImageInput from '../ImageInput.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SliderInput from '../SliderInput.vue'
import ColorInput from '../ColorInput.vue'
import ToggleInput from '../ToggleInput.vue'
import Icon from '@/components/ui/Icon.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
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

const settings = computed(() => selectedBlock.value?.settings as StackSettings)
const styles = computed(() => effectiveBlockStyles.value as StackStyles)
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

    <!-- Stack Section -->
    <InspectorSection title="Stack" icon="layout-stack">
      <InspectorField label="Direction" horizontal>
        <SegmentedControl
          :options="[
            { value: 'vertical', label: 'Vertical', icon: 'style-column' },
            { value: 'horizontal', label: 'Horizontal', icon: 'style-row' },
          ]"
          :model-value="settings.direction || 'vertical'"
          icon-only
          @update:model-value="updateBlockSettings({ direction: $event })"
        />
      </InspectorField>
      <InspectorField label="Gap" horizontal>
        <SliderInput
          :model-value="settings.gap || '16'"
          :min="0"
          :max="64"
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

    <!-- Content Position Section -->
    <InspectorSection title="Content Position" icon="style-border-top">
      <InspectorField label="Justify" horizontal>
        <SegmentedControl
          :options="justifyContentOptions"
          :model-value="styles.justifyContent || 'flex-start'"
          icon-only
          @update:model-value="updateBlockStyles({ justifyContent: $event })"
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

    <!-- Shadow Section -->
    <InspectorSection title="Shadow" icon="layout-stack">
      <InspectorField label="Size" horizontal>
        <div class="flex p-0.5 bg-secondary rounded-md">
          <Tooltip text="Small">
            <button
              type="button"
              class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
              :class="responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '8'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'"
              @click="updateBlockStyles({ shadow: responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '8' ? { enabled: false } : { enabled: true, x: '0', y: '2', blur: '8', color: responsiveStyles.shadow?.color || 'rgba(0,0,0,0.1)' } })"
            >
              S
            </button>
          </Tooltip>
          <Tooltip text="Medium">
            <button
              type="button"
              class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
              :class="responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '16'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'"
              @click="updateBlockStyles({ shadow: responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '16' ? { enabled: false } : { enabled: true, x: '0', y: '4', blur: '16', color: responsiveStyles.shadow?.color || 'rgba(0,0,0,0.1)' } })"
            >
              M
            </button>
          </Tooltip>
          <Tooltip text="Large">
            <button
              type="button"
              class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
              :class="responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '32'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'"
              @click="updateBlockStyles({ shadow: responsiveStyles.shadow?.enabled && responsiveStyles.shadow?.blur === '32' ? { enabled: false } : { enabled: true, x: '0', y: '8', blur: '32', color: responsiveStyles.shadow?.color || 'rgba(0,0,0,0.15)' } })"
            >
              L
            </button>
          </Tooltip>
        </div>
      </InspectorField>
      <InspectorField v-if="responsiveStyles.shadow?.enabled" label="Color" horizontal>
        <ColorInput
          :model-value="responsiveStyles.shadow?.color || 'rgba(0,0,0,0.1)'"
          swatch-only
          @update:model-value="updateBlockStyles({ shadow: { ...responsiveStyles.shadow, color: $event } })"
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
