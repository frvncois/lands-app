<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, VariantsSettings, VariantsStyles } from '@/types/editor'

/**
 * VariantsBlock - Renders Shopify-style product variants
 * Supports dropdown, buttons, and swatch display styles
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as VariantsSettings)
const variantsStyles = computed(() => props.block.styles as VariantsStyles)
</script>

<template>
  <div class="space-y-3" :style="styles">
    <!-- Render each option type (e.g., Color, Size) -->
    <div
      v-for="optionType in settings?.optionTypes || []"
      :key="optionType.id"
      class="space-y-2"
    >
      <div class="text-xs font-medium text-foreground/80">{{ optionType.name }}</div>
      <div class="flex flex-wrap" :style="{ gap: variantsStyles?.gap ? `${variantsStyles.gap}px` : '8px' }">
        <!-- Dropdown -->
        <template v-if="optionType.displayStyle === 'dropdown'">
          <select
            class="px-3 py-2 border border-input bg-background text-sm min-w-[120px]"
            :class="{
              'h-8 text-xs': variantsStyles?.optionSize === 'sm',
              'h-10': variantsStyles?.optionSize === 'md' || !variantsStyles?.optionSize,
              'h-12 text-base': variantsStyles?.optionSize === 'lg',
            }"
          >
            <option v-for="val in optionType.values || []" :key="val.id" :value="val.value">
              {{ val.value }}
            </option>
          </select>
        </template>

        <!-- Buttons -->
        <template v-else-if="optionType.displayStyle === 'buttons'">
          <button
            v-for="(val, idx) in optionType.values || []"
            :key="val.id"
            type="button"
            class="px-3 border transition-colors"
            :class="[
              idx === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-input hover:border-primary/50',
              {
                'py-1 text-xs': variantsStyles?.optionSize === 'sm',
                'py-2 text-sm': variantsStyles?.optionSize === 'md' || !variantsStyles?.optionSize,
                'py-3 text-base': variantsStyles?.optionSize === 'lg',
              },
            ]"
          >
            {{ val.value }}
          </button>
        </template>

        <!-- Swatches -->
        <template v-else-if="optionType.displayStyle === 'swatches'">
          <button
            v-for="(val, idx) in optionType.values || []"
            :key="val.id"
            type="button"
            class="rounded-full border-2 transition-colors"
            :class="[
              idx === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50',
              {
                'w-6 h-6': variantsStyles?.optionSize === 'sm',
                'w-8 h-8': variantsStyles?.optionSize === 'md' || !variantsStyles?.optionSize,
                'w-10 h-10': variantsStyles?.optionSize === 'lg',
              },
            ]"
            :style="{ backgroundColor: val.colorHex || '#cccccc' }"
            :title="val.value"
          />
        </template>
      </div>
    </div>
  </div>
</template>
