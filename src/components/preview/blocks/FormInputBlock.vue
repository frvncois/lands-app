<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, FormInputSettings, FormInputStyles } from '@/types/designer'

/**
 * FormInputBlock - Renders a form input field
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as FormInputSettings)
const inputStyles = computed(() => props.block.styles as FormInputStyles)

// Compute input-specific styles
const computedStyles = computed(() => ({
  ...props.styles,
  fontSize: inputStyles.value?.fontSize || props.styles.fontSize || '16px',
  fontWeight: inputStyles.value?.fontWeight || props.styles.fontWeight,
  fontFamily: inputStyles.value?.fontFamily || props.styles.fontFamily,
  color: inputStyles.value?.color || props.styles.color,
  backgroundColor: inputStyles.value?.backgroundColor || props.styles.backgroundColor || '#ffffff',
}))
</script>

<template>
  <input
    :type="settings?.type || 'text'"
    :name="settings?.name || 'input'"
    :placeholder="settings?.placeholder || 'Enter text...'"
    :required="settings?.required"
    :value="settings?.defaultValue"
    class="w-full outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
    :style="computedStyles"
  >
</template>
