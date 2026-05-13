<script setup lang="ts">
withDefaults(defineProps<{
  maxWidth?: string
  padding?: string
  overlay?: 'default' | 'dark'
}>(), {
  maxWidth: 'max-w-[400px]',
  padding: 'p-6',
  overlay: 'default',
})

defineEmits<{ close: [] }>()
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg"
    :class="overlay === 'dark' ? 'bg-black/20' : 'bg-gray-200/50'"
    @click="$emit('close')"
  >
    <div
      class="modal-card w-full mx-4 bg-white rounded-3xl overflow-hidden"
      :class="[maxWidth, padding]"
      @click.stop
    >
      <slot />
    </div>
  </div>
</template>
