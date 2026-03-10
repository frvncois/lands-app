<script setup lang="ts">
defineEmits<{ close: [] }>()
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/50 backdrop-blur-lg">
    <div class="modal-card w-full mx-4 bg-white rounded-3xl p-6 max-w-[400px] text-center">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
        <svg class="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Your land is live!</h3>
      <p class="text-sm text-gray-500 mb-6">Your changes have been published and are now visible to everyone.</p>
      <button
        class="w-full px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors"
        @click="$emit('close')"
      >
        Back to preview
      </button>
    </div>
  </div>
</template>
