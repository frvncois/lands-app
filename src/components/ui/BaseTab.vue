<script setup lang="ts">
import type { FunctionalComponent } from 'vue'

defineProps<{
  label: string
  icon: FunctionalComponent
  active?: boolean
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    class="flex-1 flex items-center justify-center gap-2 p-5 text-sm font-medium transition-colors"
    :class="active ? 'text-gray-900 border-b-2 border-gray-900 -mb-px' : 'text-gray-400 hover:text-gray-600'"
    @click="$emit('click')"
  >
    <component :is="icon" class="h-4 w-4" />
    {{ label }}
  </button>
</template>
