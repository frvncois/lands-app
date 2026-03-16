<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import authService from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

async function handleLogin() {
  authStore.setLoading(true)
  authStore.clearError()
  try {
    await authService.login({ email: email.value, password: password.value })
    authStore.signingIn = true
    router.push('/dashboard')
  } catch (e) {
    authStore.setError((e as Error).message)
  } finally {
    authStore.setLoading(false)
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col justify-between">
    <div class="flex flex-col flex-1 gap-16">
      <div class="space-y-1 auth-heading">
        <h1 class="text-4xl">Welcome back</h1>
        <h2 class="text-md text-neutral-400">Sign in to your account</h2>
      </div>
      <div class="flex flex-col gap-4 auth-form">
        <BaseInput size="lg" label="Email" placeholder="you@example.com" v-model="email" :disabled="authStore.isLoading" />
        <BaseInput size="lg" type="password" label="Password" placeholder="password" v-model="password" :disabled="authStore.isLoading" />
        <p v-if="authStore.error" class="text-sm text-red-500">{{ authStore.error }}</p>
        <BaseButton variant="solid" size="lg" :disabled="authStore.isLoading" @click="handleLogin">
          {{ authStore.isLoading ? 'Signing in…' : 'Sign In' }}
        </BaseButton>
        <RouterLink to="/auth/reset" class="text-neutral-400 text-xs text-right hover:underline">Forgot password?</RouterLink>
      </div>
    </div>
    <div class="text-sm text-neutral-400 auth-footer">
      Don't have an account?
      <RouterLink to="/auth/register" class="text-neutral-900 font-medium hover:underline">Sign up</RouterLink>
    </div>
  </div>
</template>
