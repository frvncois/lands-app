<script setup lang="ts">
import Modal from './Modal.vue'
import type { FormModalProps } from './modal.types'
import Button from '@/components/ui/Button.vue'

const props = withDefaults(defineProps<FormModalProps>(), {
  submitText: 'Submit',
  cancelText: 'Cancel',
  loading: false,
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: []
  cancel: []
}>()

function handleSubmit() {
  if (props.loading || props.disabled) return
  emit('submit')
}

function handleCancel() {
  emit('update:open', false)
  emit('cancel')
}
</script>

<template>
  <Modal
    :open="open"
    :size="size"
    :title="title"
    :description="description"
    :closable="!loading"
    :persistent="loading"
    @update:open="emit('update:open', $event)"
  >
    <form @submit.prevent="handleSubmit">
      <slot />
    </form>

    <template #footer>
      <Button variant="ghost" :disabled="loading" @click="handleCancel">
        {{ cancelText }}
      </Button>
      <Button
        type="submit"
        :loading="loading"
        :disabled="disabled"
        @click="handleSubmit"
      >
        {{ loading ? 'Submitting...' : submitText }}
      </Button>
    </template>
  </Modal>
</template>
