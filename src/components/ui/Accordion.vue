<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  label: string
  open?: boolean
}>(), {
  open: false,
})

const emit = defineEmits<{ open: [] }>()

const isOpen = ref(props.open)

// Only close from outside — opening is handled locally by the click
watch(() => props.open, (val) => { if (!val) isOpen.value = false })
</script>

<template>
  <div class="w-full">
    <button
      class="w-full flex items-center justify-between p-4 text-sm font-medium text-gray-700 rounded-lg transition-colors"
      @click="() => { isOpen = !isOpen; if (isOpen) emit('open') }"
    >
      {{ label }}
      <ChevronRightIcon class="h-3.5 w-3.5 text-gray-400 transition-transform duration-200" :class="{ 'rotate-90': isOpen }" />
    </button>
    <div
      :style="isOpen
        ? { maxHeight: '600px', overflow: 'visible', transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), overflow 0s 0.35s' }
        : { maxHeight: '0px',   overflow: 'hidden',  transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), overflow 0s' }"
    >
      <slot />
    </div>
  </div>
</template>
