<script setup lang="ts">
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface Props {
  text: string
  position?: TooltipPosition
  delay?: number
}

withDefaults(defineProps<Props>(), {
  position: 'top',
  delay: 0,
})

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}
</script>

<template>
  <div class="relative group/tooltip inline-flex">
    <slot />
    <span
      :class="[
        'absolute px-2 py-1 text-xs font-medium text-popover-foreground bg-popover border border-border rounded-lg shadow-md',
        'opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50',
        positionClasses[position],
      ]"
      :style="delay > 0 ? `transition-delay: ${delay}ms` : ''"
    >
      {{ text }}
    </span>
  </div>
</template>
