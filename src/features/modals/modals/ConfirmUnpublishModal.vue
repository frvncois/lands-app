<script setup lang="ts">
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'

defineEmits<{ confirm: [], cancel: [] }>()
</script>

<template>
  <BaseModal @close="$emit('cancel')">
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h3 class="text-lg font-semibold text-gray-900">Unpublish project?</h3>
        <p class="text-sm text-gray-400 leading-relaxed">
          Your project will no longer be accessible at its public URL. Visitors will see a "Not found" page. Your content is not deleted and can be republished at any time.
        </p>
      </div>
      <div class="flex justify-end gap-3">
        <BaseButton @click="$emit('cancel')">Cancel</BaseButton>
        <BaseButton variant="remove" @click="$emit('confirm')">Unpublish</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
