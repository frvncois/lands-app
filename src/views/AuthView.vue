<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import SignupForm from '@/components/auth/SignupForm.vue'
import LandsLogo from '@/assets/LandsLogo.vue'

type AuthMode = 'login' | 'signup'

const mode = ref<AuthMode>('login')

function switchMode(newMode: AuthMode) {
  mode.value = newMode
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col items-center text-center">
      <LandsLogo class="w-10 h-10 mb-6" />
      <h1 class="text-3xl tracking-tight text-foreground">
        {{ mode === 'login' ? 'Welcome back' : 'Create an account' }}
      </h1>
      <p class="text-xs text-muted-foreground">
        {{ mode === 'login' ? 'Enter your credentials to sign in' : 'Enter your details to get started' }}
      </p>
    </div>

    <LoginForm v-if="mode === 'login'" @switch-mode="switchMode('signup')" />
    <SignupForm v-else @switch-mode="switchMode('login')" />

    <p class="text-xxs text-center text-muted-foreground/50 px-4">
      By continuing, you agree to our<br/>
      <a href="#" class="underline underline-offset-4 hover:text-foreground">Terms of Service</a>
      and
      <a href="#" class="underline underline-offset-4 hover:text-foreground">Privacy Policy</a>.
    </p>
  </div>
</template>
