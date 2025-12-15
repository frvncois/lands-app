<script setup lang="ts">
/**
 * BlockOutline - Hover/selection outline and label for blocks
 */
const props = defineProps<{
  isSelected: boolean
  isHovered: boolean
  name: string
  draggable?: boolean
  isInsideCanvas?: boolean
  isCanvasDragging?: boolean
  labelShowBelow?: boolean
}>()

const emit = defineEmits<{
  dragstart: [event: DragEvent]
  dragend: []
  mousedown: [event: MouseEvent]
}>()
</script>

<template>
  <!-- Hover outline -->
  <div
    v-if="isHovered && !isSelected"
    class="absolute inset-0 border-1 border-primary/40 pointer-events-none z-10"
  />

  <!-- Selection outline -->
  <div
    v-if="isSelected"
    class="absolute inset-0 border-1 border-border-outline pointer-events-none z-10"
  />

  <!-- Section label -->
  <div
    v-if="isHovered || isSelected"
    :draggable="draggable"
    class="absolute left-0 flex border items-center px-1.5 h-5 text-[10px] font-mono uppercase backdrop-blur-xs z-20 whitespace-nowrap pointer-events-auto"
    :class="[
      labelShowBelow ? 'top-full rounded-b' : 'bottom-full rounded-t',
      isSelected ? 'bg-indigo-600 border-indigo-500/10 text-blue-100' : 'bg-indigo-600/50 border-indigo-500/10 text-blue-100',
      draggable || isInsideCanvas ? 'cursor-grab active:cursor-grabbing' : '',
      isCanvasDragging ? 'cursor-grabbing' : ''
    ]"
    @dragstart="$emit('dragstart', $event)"
    @dragend="$emit('dragend')"
    @mousedown="isInsideCanvas ? $emit('mousedown', $event) : undefined"
  >
    <span v-if="draggable || isInsideCanvas" class="w-2 h-2 rounded-full bg-blue-100 mr-1.5"></span>
    {{ name }}
  </div>
</template>
