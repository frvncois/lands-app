<script setup lang="ts">
import BaseModal from '@/shared/ui/BaseModal.vue'
defineEmits<{ confirm: [], cancel: [] }>()
</script>

<template>
  <BaseModal @close="$emit('cancel')">
    <h3 class="text-lg font-semibold text-gray-900 mb-1">Unsaved changes</h3>
    <p class="text-sm text-gray-500 mb-6">You have unsaved changes. If you leave, your changes will be lost.</p>
    <div class="flex justify-end gap-3">
      <button
        class="px-4 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
        @click="$emit('cancel')"
      >
        Continue editing
      </button>
      <button
        class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
        @click="$emit('confirm')"
      >
        Discard & leave
      </button>
    </div>
  </BaseModal>
</template>
