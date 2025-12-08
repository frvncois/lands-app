<script setup lang="ts">
import { ref } from 'vue'
import { Modal, FormField, Input, Button, Alert, PasswordRequirements } from '@/components/ui'

interface Props {
  open: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'changed': []
}>()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const isChangingPassword = ref(false)
const passwordRequirementsRef = ref<InstanceType<typeof PasswordRequirements> | null>(null)

function resetForm() {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordError.value = ''
}

function close() {
  emit('update:open', false)
  resetForm()
}

async function handleChangePassword() {
  if (!passwordRequirementsRef.value?.isValid) {
    passwordError.value = 'Please meet all password requirements'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match'
    return
  }

  isChangingPassword.value = true
  passwordError.value = ''

  try {
    // TODO: Implement password change API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('changed')
    close()
  } catch (error: unknown) {
    passwordError.value = error instanceof Error ? error.message : 'Failed to change password'
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<template>
  <Modal :open="open" size="md" :closable="!isChangingPassword" @update:open="close">
    <template #header>
      <h2 class="text-lg font-semibold text-foreground">Change Password</h2>
    </template>

    <form class="space-y-4" @submit.prevent="handleChangePassword">
      <FormField label="Current Password">
        <Input
          v-model="currentPassword"
          type="password"
          placeholder="Enter current password"
          :disabled="isChangingPassword"
        />
      </FormField>

      <FormField label="New Password">
        <Input
          v-model="newPassword"
          type="password"
          placeholder="Enter new password"
          :disabled="isChangingPassword"
        />
        <PasswordRequirements ref="passwordRequirementsRef" :password="newPassword" class="mt-2" />
      </FormField>

      <FormField label="Confirm New Password">
        <Input
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          :disabled="isChangingPassword"
          :error="confirmPassword.length > 0 && confirmPassword !== newPassword"
        />
        <p v-if="confirmPassword.length > 0 && confirmPassword !== newPassword" class="text-xs text-destructive mt-1">
          Passwords do not match
        </p>
      </FormField>

      <Alert v-if="passwordError" variant="error">{{ passwordError }}</Alert>
    </form>

    <template #footer>
      <Button variant="ghost" :disabled="isChangingPassword" @click="close">
        Cancel
      </Button>
      <Button
        :loading="isChangingPassword"
        :disabled="!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword"
        @click="handleChangePassword"
      >
        {{ isChangingPassword ? 'Updating...' : 'Update Password' }}
      </Button>
    </template>
  </Modal>
</template>
