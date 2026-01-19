<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from './Modal.vue'
import { CONFIRM_VARIANTS } from './modal.constants'
import type { ConfirmModalProps } from './modal.types'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Alert from '@/components/ui/Alert.vue'
import Icon from '@/components/ui/Icon.vue'

const props = withDefaults(defineProps<ConfirmModalProps>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
  loading: false,
  confirmInput: undefined,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const inputValue = ref('')

const variantConfig = computed(() => CONFIRM_VARIANTS[props.variant] || CONFIRM_VARIANTS.danger)

const canConfirm = computed(() => {
  if (props.confirmInput) {
    return inputValue.value === props.confirmInput
  }
  return true
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    inputValue.value = ''
  }
})

function handleConfirm() {
  if (!canConfirm.value || props.loading) return
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
    size="sm"
    :closable="!loading"
    :persistent="loading"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center"
          :class="variantConfig.iconBg"
        >
          <Icon
            :name="variantConfig.icon"
            class="text-lg"
            :class="variantConfig.iconColor"
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">
            {{ title }}
          </h2>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <Alert :variant="variant === 'danger' ? 'error' : variant">
        <p class="text-sm">
          {{ message }}
        </p>
      </Alert>

      <div
        v-if="confirmInput"
        class="space-y-2"
      >
        <label class="text-sm font-medium text-foreground block">
          Type <span class="font-semibold text-destructive">{{ confirmInput }}</span> to confirm
        </label>
        <Input
          v-model="inputValue"
          :placeholder="confirmInput"
          :disabled="loading"
          @keyup.enter="handleConfirm"
        />
      </div>
    </div>

    <template #footer>
      <Button
        variant="ghost"
        :disabled="loading"
        @click="handleCancel"
      >
        {{ cancelText }}
      </Button>
      <Button
        :variant="variantConfig.buttonVariant as any"
        :loading="loading"
        :disabled="!canConfirm"
        @click="handleConfirm"
      >
        {{ loading ? 'Processing...' : confirmText }}
      </Button>
    </template>
  </Modal>
</template>
