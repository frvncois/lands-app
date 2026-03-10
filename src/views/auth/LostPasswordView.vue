<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import authService from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const email = ref('')
const sent = ref(false)

async function handleReset() {
  authStore.setLoading(true)
  try {
    await authService.forgotPassword(email.value)
    sent.value = true
    authStore.setLoading(false)
  } catch (e) {
    authStore.setError((e as Error).message)
  }
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
          <p v-if="authStore.error" class="text-sm text-red-500">{{ authStore.error }}</p>
          <BaseButton variant="solid" size="lg" :disabled="authStore.isLoading" @click="handleReset">
            {{ authStore.isLoading ? 'Sending…' : 'Send reset link' }}
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
