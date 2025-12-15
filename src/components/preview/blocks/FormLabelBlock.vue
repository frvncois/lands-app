<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, FormLabelSettings, FormLabelStyles } from '@/types/editor'

/**
 * FormLabelBlock - Renders a form label element
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as FormLabelSettings)
const labelStyles = computed(() => props.block.styles as FormLabelStyles)
</script>

<template>
  <span
    :class="[
      labelStyles?.fontSize ? `text-${labelStyles.fontSize}` : 'text-sm',
      labelStyles?.fontWeight === 'bold' ? 'font-bold' : labelStyles?.fontWeight === 'semibold' ? 'font-semibold' : labelStyles?.fontWeight === 'medium' ? 'font-medium' : 'font-normal',
    ]"
    :style="{
      ...styles,
      color: labelStyles?.color,
      textAlign: labelStyles?.textAlign,
    }"
  >{{ settings?.content }}</span>
</template>
