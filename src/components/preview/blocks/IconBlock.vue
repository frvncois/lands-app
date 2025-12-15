<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, IconSettings, IconStyles } from '@/types/editor'
import Icon from '@/components/ui/Icon.vue'

/**
 * IconBlock - Renders an icon from the Lineicons library
 * Supports custom size and color
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as IconSettings)
const iconStyles = computed(() => props.block.styles as IconStyles)
</script>

<template>
  <div class="flex justify-center" :style="styles">
    <Icon
      :name="settings?.icon || 'star-1'"
      :size="settings?.size || '24px'"
      :style="{ color: iconStyles?.color || undefined }"
    />
  </div>
</template>
