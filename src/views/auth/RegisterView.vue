<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import authService from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')

async function handleRegister() {
  authStore.setLoading(true)
  try {
    await authService.register({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
    })
    router.push('/onboarding')
  } catch (e) {
    authStore.setError((e as Error).message)
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col justify-between">
    <div class="flex flex-col gap-16">
      <div class="space-y-1 auth-heading">
        <h1 class="text-4xl">Create your account</h1>
        <h2 class="text-md text-neutral-400">Get started with Lands</h2>
      </div>
      <div class="flex flex-col gap-4 auth-form">
        <div class="flex gap-4">
          <BaseInput size="lg" label="First Name" placeholder="First name" v-model="firstName" />
          <BaseInput size="lg" label="Last Name" placeholder="Last name" v-model="lastName" />
        </div>
        <BaseInput size="lg" label="Email" placeholder="you@example.com" v-model="email" />
        <BaseInput size="lg" type="password" label="Password" placeholder="password" v-model="password" />
        <p v-if="authStore.error" class="text-sm text-red-500">{{ authStore.error }}</p>
        <BaseButton variant="solid" size="lg" :disabled="authStore.isLoading" @click="handleRegister">
          {{ authStore.isLoading ? 'Creating account…' : 'Sign Up' }}
        </BaseButton>
      </div>
    </div>
    <div class="text-sm text-neutral-400 auth-footer">
      Already have an account?
      <RouterLink to="/auth" class="text-neutral-900 font-medium hover:underline">Sign in</RouterLink>
    </div>
  </div>
</template>
