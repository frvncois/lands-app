<script setup lang="ts">
import Modal from './Modal.vue'
import type { PickerModalProps } from './modal.types'
import Button from '@/components/ui/Button.vue'

const props = withDefaults(defineProps<PickerModalProps>(), {
  confirmText: 'Select',
  cancelText: 'Cancel',
  loading: false,
  hasSelection: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  if (!props.hasSelection || props.loading) return
  emit('confirm')
}

function handleCancel() {
  emit('update:open', false)
  emit('cancel')
}
</script>

<template>
  <Modal
    :open="open"
    size="4xl"
    scroll-behavior="inside"
    :closable="!loading"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center justify-between w-full pr-8">
        <div>
          <h2 class="text-xl font-semibold text-foreground">
            {{ title }}
          </h2>
          <p
            v-if="subtitle"
            class="text-sm text-muted-foreground mt-1"
          >
            {{ subtitle }}
          </p>
        </div>
        <slot name="header-actions" />
      </div>
    </template>

    <!-- Filters slot -->
    <div
      v-if="$slots.filters"
      class="flex items-center gap-3 pb-4 border-b border-border mb-4"
    >
      <slot name="filters" />
    </div>

    <!-- Main content -->
    <div class="min-h-[300px]">
      <slot />
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <slot name="footer-info">
          <span />
        </slot>
        <div class="flex items-center gap-3">
          <Button
            variant="ghost"
            :disabled="loading"
            @click="handleCancel"
          >
            {{ cancelText }}
          </Button>
          <Button
            :disabled="!hasSelection || loading"
            :loading="loading"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
