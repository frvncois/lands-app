<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, FormInputSettings } from '@/types/editor'

/**
 * FormInputBlock - Renders a form input element
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as FormInputSettings)
</script>

<template>
  <div>
    <input
      :type="settings?.inputType || 'text'"
      :placeholder="settings?.placeholder"
      :required="settings?.required"
      class="px-4 py-2 border border-input bg-background"
      :style="styles"
    />
  </div>
</template>
