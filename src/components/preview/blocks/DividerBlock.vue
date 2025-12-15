<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, DividerSettings } from '@/types/editor'

/**
 * DividerBlock - Renders a horizontal divider/separator
 * Supports solid, dashed, dotted, and space styles
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as DividerSettings)

const dividerStyle = computed(() => ({
  width: `${settings.value?.width || 100}%`,
  borderColor: settings.value?.color || 'currentColor',
  borderTopWidth: `${settings.value?.thickness || 1}px`,
}))
</script>

<template>
  <div class="flex justify-center" :style="styles">
    <!-- Visible divider line -->
    <div
      v-if="settings?.style !== 'space'"
      class="border-t"
      :class="{
        'border-dashed': settings?.style === 'dashed',
        'border-dotted': settings?.style === 'dotted',
      }"
      :style="dividerStyle"
    />
    <!-- Invisible spacer -->
    <div
      v-else
      class="h-8"
      :style="{ width: `${settings?.width || 100}%` }"
    />
  </div>
</template>
