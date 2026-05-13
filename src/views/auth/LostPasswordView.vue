<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import authService from '@/services/auth.service'
import { useAuthForm } from '@/composables/useAuthForm'

const { isLoading, error, runAction } = useAuthForm()
const email = ref('')
const sent = ref(false)

async function handleReset() {
  await runAction(async () => {
    await authService.forgotPassword(email.value)
    sent.value = true
  })
}
</script>

<template>
  <div class="flex flex-1 flex-col justify-between">
    <div class="flex flex-col flex-1 gap-16">
      <div class="space-y-1 auth-heading">
        <h1 class="text-4xl">Reset your password</h1>
        <h2 class="text-md text-neutral-400">We'll send you a link to reset it</h2>
      </div>
      <div class="flex flex-col gap-4 auth-form">
        <template v-if="!sent">
          <BaseInput size="lg" label="Email" placeholder="you@example.com" v-model="email" />
          <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
          <BaseButton variant="solid" size="lg" :disabled="isLoading" @click="handleReset">
            {{ isLoading ? 'Sending…' : 'Send reset link' }}
          </BaseButton>
        </template>
        <p v-else class="text-sm text-neutral-600">
          Check your inbox — we sent a reset link to <strong>{{ email }}</strong>.
        </p>
      </div>
    </div>
    <RouterLink to="/auth" class="text-neutral-900 font-medium hover:underline auth-footer">← Back to login</RouterLink>
  </div>
</template>
