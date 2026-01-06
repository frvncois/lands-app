<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ConfirmModal } from '@/components/ui/Modal'

const props = defineProps<{
  open: boolean
  projectTitle: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()

const isUnpublishing = ref(false)

const message = computed(() => {
  return `Are you sure you want to unpublish "${props.projectTitle}"?\n\n• Your site will no longer be accessible\n• Visitors will see a "Site not available" page\n• You can republish anytime`
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    isUnpublishing.value = false
  }
})

function handleConfirm() {
  isUnpublishing.value = true
  emit('confirm')
}
</script>

<template>
  <ConfirmModal
    :open="open"
    title="Unpublish Project"
    :message="message"
    confirm-text="Unpublish"
    variant="warning"
    :loading="isUnpublishing"
    @update:open="emit('update:open', $event)"
    @confirm="handleConfirm"
  />
</template>
