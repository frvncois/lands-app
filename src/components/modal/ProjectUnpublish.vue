<script setup lang="ts">
import { ref, watch } from 'vue'
import { Modal, Button, Alert } from '@/components/ui'

const props = defineProps<{
  open: boolean
  projectTitle: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()

const isUnpublishing = ref(false)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    isUnpublishing.value = false
  }
})

function close() {
  if (!isUnpublishing.value) {
    emit('update:open', false)
  }
}

function confirm() {
  isUnpublishing.value = true
  emit('confirm')
}
</script>

<template>
  <Modal :open="open" size="md" :closable="!isUnpublishing" @update:open="emit('update:open', $event)">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">Unpublish Project</h2>
          <p class="text-sm text-muted-foreground">Your site will go offline.</p>
        </div>
      </div>
    </template>

    <Alert variant="warning">
      <p class="text-sm text-foreground">
        Are you sure you want to unpublish <span class="font-semibold">{{ projectTitle }}</span>?
      </p>
      <ul class="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
        <li>Your site will no longer be accessible</li>
        <li>Visitors will see a "Site not available" page</li>
        <li>You can republish anytime</li>
      </ul>
    </Alert>

    <template #footer>
      <Button variant="ghost" :disabled="isUnpublishing" @click="close">
        Cancel
      </Button>
      <Button
        class="bg-amber-500 hover:bg-amber-600 text-white"
        :loading="isUnpublishing"
        @click="confirm"
      >
        {{ isUnpublishing ? 'Unpublishing...' : 'Unpublish' }}
      </Button>
    </template>
  </Modal>
</template>
