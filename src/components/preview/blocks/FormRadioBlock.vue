<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, FormRadioSettings, FormRadioStyles } from '@/types/designer'

/**
 * FormRadioBlock - Renders a form radio button field
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as FormRadioSettings)
const radioStyles = computed(() => props.block.styles as FormRadioStyles)

// Compute label styles
const labelStyles = computed(() => ({
  fontSize: radioStyles.value?.fontSize || props.styles.fontSize || '14px',
  fontWeight: radioStyles.value?.fontWeight || props.styles.fontWeight,
  color: radioStyles.value?.color || props.styles.color,
}))

// Compute radio styles
const inputStyles = computed(() => ({
  width: radioStyles.value?.radioSize ? `${radioStyles.value.radioSize}px` : '18px',
  height: radioStyles.value?.radioSize ? `${radioStyles.value.radioSize}px` : '18px',
  accentColor: radioStyles.value?.radioColor || '#3b82f6',
}))
</script>

<template>
  <label
    class="flex items-center cursor-pointer"
    :style="{
      ...props.styles,
      gap: radioStyles?.gap || '8px',
    }"
  >
    <input
      type="radio"
      :name="settings?.name || 'option'"
      :value="settings?.value || 'option'"
      :checked="settings?.defaultChecked"
      class="cursor-pointer"
      :style="inputStyles"
    >
    <span :style="labelStyles">{{ settings?.label || 'Radio option' }}</span>
  </label>
</template>
