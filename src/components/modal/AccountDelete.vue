<script setup lang="ts">
import { ref, watch } from 'vue'
import { Modal, FormField, Input, Button, Alert } from '@/components/ui'

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'deleted': []
}>()

const deleteConfirmText = ref('')
const isDeleting = ref(false)

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    deleteConfirmText.value = ''
  }
})

function close() {
  emit('update:open', false)
  deleteConfirmText.value = ''
}

async function handleDelete() {
  if (deleteConfirmText.value !== 'delete my account') return

  isDeleting.value = true
  try {
    // TODO: Implement account deletion API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('deleted')
    close()
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <Modal :open="open" size="md" :closable="!isDeleting" @update:open="close">
    <template #header>
      <h2 class="text-lg font-semibold text-foreground">Delete Account</h2>
    </template>

    <Alert variant="error" class="mb-4">
      This action cannot be undone. All your projects and data will be permanently deleted.
    </Alert>

    <FormField>
      <template #default>
        <label class="text-sm font-medium text-foreground mb-1.5 block">
          Type <span class="font-mono text-destructive">delete my account</span> to confirm
        </label>
        <Input
          v-model="deleteConfirmText"
          placeholder="delete my account"
          :disabled="isDeleting"
        />
      </template>
    </FormField>

    <template #footer>
      <Button variant="ghost" :disabled="isDeleting" @click="close">
        Cancel
      </Button>
      <Button
        variant="destructive"
        :loading="isDeleting"
        :disabled="deleteConfirmText !== 'delete my account'"
        @click="handleDelete"
      >
        {{ isDeleting ? 'Deleting...' : 'Delete Account' }}
      </Button>
    </template>
  </Modal>
</template>
