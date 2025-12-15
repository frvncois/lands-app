<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, FormTextareaSettings } from '@/types/editor'

/**
 * FormTextareaBlock - Renders a form textarea element
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as FormTextareaSettings)
</script>

<template>
  <div>
    <textarea
      :placeholder="settings?.placeholder"
      :rows="settings?.rows || 4"
      :required="settings?.required"
      class="px-4 py-2 border border-input bg-background resize-none"
      :style="styles"
    />
  </div>
</template>
