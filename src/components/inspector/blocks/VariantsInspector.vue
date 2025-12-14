<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBlockInspector } from '../composables'
import type { VariantsSettings, VariantsStyles, VariantOptionValue } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SliderInput from '../SliderInput.vue'
import Icon from '@/components/ui/Icon.vue'
import ProductVariants from '@/components/modal/ProductVariants.vue'
import { SpacingSection, BorderSection, OpacitySection, PositionSection } from '../sections'

const {
  selectedBlock,
  effectiveBlockStyles,
  responsiveStyles,
  updateBlockSettings,
  updateBlockStyles,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as VariantsSettings)
const styles = computed(() => effectiveBlockStyles.value as VariantsStyles)

const showVariantsModal = ref(false)
</script>

<template>
  <div v-if="selectedBlock">
    <!-- Product Variants Section -->
    <InspectorSection title="Product Variants" icon="layout-container">
      <div class="space-y-3">
        <div class="text-xs text-muted-foreground">
          <span class="font-medium text-foreground">{{ settings.optionTypes?.length || 0 }}</span> option types,
          <span class="font-medium text-foreground">{{ settings.variants?.length || 0 }}</span> variants
        </div>

        <!-- Quick preview of options -->
        <div v-if="settings.optionTypes?.length" class="space-y-2">
          <div
            v-for="optType in settings.optionTypes"
            :key="optType.id"
            class="flex items-center gap-2 text-xs"
          >
            <span class="font-medium">{{ optType.name }}:</span>
            <span class="text-muted-foreground">{{ optType.values.map((v: VariantOptionValue) => v.value).join(', ') }}</span>
          </div>
        </div>

        <!-- Manage button -->
        <button
          class="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          @click="showVariantsModal = true"
        >
          <Icon name="pencil-1" />
          Manage Variants
        </button>
      </div>
    </InspectorSection>

    <!-- Style Section -->
    <InspectorSection title="Style" icon="style-color">
      <InspectorField label="Option Size" horizontal>
        <SegmentedControl
          :options="[
            { value: 'sm', label: 'S' },
            { value: 'md', label: 'M' },
            { value: 'lg', label: 'L' },
          ]"
          :model-value="styles.optionSize || 'md'"
          @update:model-value="updateBlockStyles({ optionSize: $event })"
        />
      </InspectorField>
      <InspectorField label="Gap" horizontal>
        <SliderInput
          :model-value="styles.gap ?? '8'"
          :min="0"
          :max="24"
          :step="4"
          unit="px"
          @update:model-value="updateBlockStyles({ gap: $event })"
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

  <!-- Product Variants Modal -->
  <ProductVariants
    :open="showVariantsModal"
    :settings="settings"
    @update:open="showVariantsModal = $event"
    @update:settings="updateBlockSettings($event)"
  />
</template>
