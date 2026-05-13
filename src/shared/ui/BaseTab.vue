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
    class="relative flex-1 flex items-center justify-center gap-2 h-16 text-sm font-medium transition-colors"
    :class="active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'"
    @click="$emit('click')"
  >
    <component :is="icon" class="h-4 w-4" />
    {{ label }}
    <span v-if="active" class="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-gray-900" />
  </button>
</template>
