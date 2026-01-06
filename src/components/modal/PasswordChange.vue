<script setup lang="ts">
import { ref, watch } from 'vue'
import { FormModal } from '@/components/ui/Modal'
import { FormField, Input, Alert, PasswordRequirements } from '@/components/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  changed: []
}>()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const isChangingPassword = ref(false)
const passwordRequirementsRef = ref<InstanceType<typeof PasswordRequirements> | null>(null)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    passwordError.value = ''
  }
})

async function handleSubmit() {
  if (!passwordRequirementsRef.value?.allMet) {
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
    emit('update:open', false)
  } catch (error: unknown) {
    passwordError.value = error instanceof Error ? error.message : 'Failed to change password'
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<template>
  <FormModal
    :open="open"
    title="Change Password"
    submit-text="Update Password"
    :loading="isChangingPassword"
    @update:open="emit('update:open', $event)"
    @submit="handleSubmit"
  >
    <div class="space-y-4">
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
    </div>
  </FormModal>
</template>
