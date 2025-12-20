<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, FormCheckboxSettings, FormCheckboxStyles } from '@/types/designer'

/**
 * FormCheckboxBlock - Renders a form checkbox field
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as FormCheckboxSettings)
const checkboxStyles = computed(() => props.block.styles as FormCheckboxStyles)

// Compute label styles
const labelStyles = computed(() => ({
  fontSize: checkboxStyles.value?.fontSize || props.styles.fontSize || '14px',
  fontWeight: checkboxStyles.value?.fontWeight || props.styles.fontWeight,
  color: checkboxStyles.value?.color || props.styles.color,
}))

// Compute checkbox styles
const inputStyles = computed(() => ({
  width: checkboxStyles.value?.checkboxSize ? `${checkboxStyles.value.checkboxSize}px` : '18px',
  height: checkboxStyles.value?.checkboxSize ? `${checkboxStyles.value.checkboxSize}px` : '18px',
  accentColor: checkboxStyles.value?.checkboxColor || '#3b82f6',
}))
</script>

<template>
  <label
    class="flex items-center cursor-pointer"
    :style="{
      ...props.styles,
      gap: checkboxStyles?.gap || '8px',
    }"
  >
    <input
      type="checkbox"
      :name="settings?.name || 'checkbox'"
      :required="settings?.required"
      :checked="settings?.defaultChecked"
      class="cursor-pointer"
      :style="inputStyles"
    >
    <span :style="labelStyles">{{ settings?.label || 'Checkbox label' }}</span>
  </label>
</template>
