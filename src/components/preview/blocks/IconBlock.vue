<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlock, IconSettings, IconStyles } from '@/types/designer'
import { icons } from '@/lib/lucide-icons'

/**
 * IconBlock - Renders an icon from the Lucide icon library
 * Supports custom size and color via styles
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const settings = computed(() => props.block.settings as IconSettings)
const iconStyles = computed(() => props.block.styles as IconStyles)

// Get the Lucide icon component by name
const LucideIcon = computed(() => {
  const iconName = settings.value?.icon
  if (!iconName) return null
  return icons[iconName] || null
})

// Compute icon size
const iconSize = computed(() => {
  const size = settings.value?.size || '24'
  // Ensure it has px unit
  return size.toString().includes('px') ? size : `${size}px`
})
</script>

<template>
  <div class="flex justify-center items-center" :style="styles">
    <component
      v-if="LucideIcon"
      :is="LucideIcon"
      :style="{
        color: iconStyles?.color || 'currentColor',
        width: iconSize,
        height: iconSize,
        flexShrink: 0,
      }"
    />
    <!-- Fallback for missing/invalid icon -->
    <div
      v-else
      class="flex items-center justify-center bg-muted/50 rounded text-muted-foreground"
      :style="{
        width: iconSize,
        height: iconSize,
      }"
    >
      <span class="text-xs">?</span>
    </div>
  </div>
</template>
