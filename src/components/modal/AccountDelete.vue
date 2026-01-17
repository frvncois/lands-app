<script setup lang="ts">
import { ref, watch } from 'vue'
import { ConfirmModal } from '@/components/ui/Modal'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  deleted: []
}>()

const isDeleting = ref(false)

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    // Reset state when modal closes
    isDeleting.value = false
  }
})

async function handleConfirm() {
  isDeleting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('deleted')
    emit('update:open', false)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <ConfirmModal
    :open="open"
    title="Delete Account"
    message="This action cannot be undone. All your projects and data will be permanently deleted."
    confirm-text="Delete Account"
    confirm-input="delete my account"
    variant="danger"
    :loading="isDeleting"
    @update:open="emit('update:open', $event)"
    @confirm="handleConfirm"
  />
</template>
