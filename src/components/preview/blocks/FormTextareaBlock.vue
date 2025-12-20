<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, FormTextareaSettings, FormTextareaStyles } from '@/types/designer'

/**
 * FormTextareaBlock - Renders a form textarea field
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as FormTextareaSettings)
const textareaStyles = computed(() => props.block.styles as FormTextareaStyles)

// Compute textarea-specific styles
const computedStyles = computed(() => ({
  ...props.styles,
  fontSize: textareaStyles.value?.fontSize || props.styles.fontSize || '16px',
  fontWeight: textareaStyles.value?.fontWeight || props.styles.fontWeight,
  fontFamily: textareaStyles.value?.fontFamily || props.styles.fontFamily,
  color: textareaStyles.value?.color || props.styles.color,
  backgroundColor: textareaStyles.value?.backgroundColor || props.styles.backgroundColor || '#ffffff',
  resize: 'vertical',
}))
</script>

<template>
  <textarea
    :name="settings?.name || 'message'"
    :placeholder="settings?.placeholder || 'Enter your message...'"
    :required="settings?.required"
    :rows="settings?.rows || 4"
    class="w-full outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
    :style="computedStyles"
  >{{ settings?.defaultValue }}</textarea>
</template>
