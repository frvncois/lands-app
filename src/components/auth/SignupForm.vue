<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const emit = defineEmits<{
  switchMode: []
}>()

const userStore = useUserStore()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const success = ref(false)
const isSubmitting = ref(false)
const isOAuthLoading = ref<'google' | 'github' | null>(null)

async function handleSubmit() {
  error.value = null

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }

  isSubmitting.value = true

  try {
    await userStore.signUp(email.value, password.value, name.value)
    success.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create account'
  } finally {
    isSubmitting.value = false
  }
}

async function handleOAuth(provider: 'google' | 'github') {
  error.value = null
  isOAuthLoading.value = provider

  try {
    await userStore.signInWithOAuth(provider)
  } catch (e) {
    error.value = e instanceof Error ? e.message : `Failed to sign in with ${provider}`
    isOAuthLoading.value = null
  }
}
</script>

<template>
  <!-- Success State -->
  <div v-if="success" class="text-center space-y-4 py-4">
    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
      <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
    <div class="space-y-2">
      <h3 class="text-lg font-semibold text-foreground">Check your email</h3>
      <p class="text-sm text-muted-foreground">
        We've sent a confirmation link to<br />
        <span class="font-medium text-foreground">{{ email }}</span>
      </p>
    </div>
    <button
      type="button"
      @click="emit('switchMode')"
      class="text-sm font-medium text-primary hover:underline"
    >
      Back to sign in
    </button>
  </div>

  <!-- Signup Form -->
  <div v-else class="space-y-6">
    <!-- OAuth Buttons -->
    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        :disabled="isOAuthLoading !== null"
        class="flex items-center justify-center gap-2 h-10 px-4 border border-input bg-background rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleOAuth('google')"
      >
        <svg v-if="isOAuthLoading !== 'google'" class="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span v-if="isOAuthLoading === 'google'" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        <span>Google</span>
      </button>

      <button
        type="button"
        :disabled="isOAuthLoading !== null"
        class="flex items-center justify-center gap-2 h-10 px-4 border border-input bg-background rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleOAuth('github')"
      >
        <svg v-if="isOAuthLoading !== 'github'" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <span v-if="isOAuthLoading === 'github'" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        <span>GitHub</span>
      </button>
    </div>

    <!-- Divider -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t border-border"></span>
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
      </div>
    </div>

    <!-- Email/Password Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-2">
        <label for="name" class="text-sm font-medium leading-none text-foreground">Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          autocomplete="name"
          placeholder="Enter your name"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div class="space-y-2">
        <label for="signup-email" class="text-sm font-medium leading-none text-foreground">Email</label>
        <input
          id="signup-email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          placeholder="name@example.com"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div class="space-y-2">
        <label for="signup-password" class="text-sm font-medium leading-none text-foreground">Password</label>
        <input
          id="signup-password"
          v-model="password"
          type="password"
          required
          autocomplete="new-password"
          placeholder="At least 8 characters"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p class="text-xs text-muted-foreground">Must be at least 8 characters</p>
      </div>

      <!-- Error message -->
      <div v-if="error" class="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting || !name || !email || !password"
        class="inline-flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <span v-if="isSubmitting" class="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        {{ isSubmitting ? 'Creating account...' : 'Create account' }}
      </button>
    </form>

    <!-- Switch to login -->
    <p class="text-center text-sm text-muted-foreground">
      Already have an account?
      <button
        type="button"
        @click="emit('switchMode')"
        class="font-medium text-primary hover:underline"
      >
        Sign in
      </button>
    </p>
  </div>
</template>
