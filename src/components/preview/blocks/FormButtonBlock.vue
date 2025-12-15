<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, FormButtonSettings } from '@/types/editor'

/**
 * FormButtonBlock - Renders a form submit button
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as FormButtonSettings)
</script>

<template>
  <div>
    <button
      type="submit"
      :class="[
        'px-6 py-2 font-medium transition-colors',
        settings?.size === 'sm' ? 'text-sm px-4 py-1.5' : settings?.size === 'lg' ? 'text-lg px-8 py-3' : 'text-base',
        settings?.variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' :
        settings?.variant === 'outline' ? 'border border-input bg-transparent hover:bg-accent' :
        'bg-primary text-primary-foreground hover:bg-primary/90',
        settings?.fullWidth ? 'w-full' : ''
      ]"
      :style="styles"
    >
      {{ settings?.label || 'Submit' }}
    </button>
  </div>
</template>
