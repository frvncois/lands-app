<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import SignupForm from '@/components/auth/SignupForm.vue'

type AuthMode = 'login' | 'signup'

const mode = ref<AuthMode>('login')

function switchMode(newMode: AuthMode) {
  mode.value = newMode
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="space-y-2 text-center">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        {{ mode === 'login' ? 'Welcome back' : 'Create an account' }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ mode === 'login' ? 'Enter your credentials to sign in' : 'Enter your details to get started' }}
      </p>
    </div>

    <!-- Auth Forms -->
    <LoginForm v-if="mode === 'login'" @switch-mode="switchMode('signup')" />
    <SignupForm v-else @switch-mode="switchMode('login')" />

    <!-- Terms -->
    <p class="text-xs text-center text-muted-foreground px-4">
      By continuing, you agree to our
      <a href="#" class="underline underline-offset-4 hover:text-foreground">Terms of Service</a>
      and
      <a href="#" class="underline underline-offset-4 hover:text-foreground">Privacy Policy</a>.
    </p>
  </div>
</template>
