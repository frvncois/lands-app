<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import authService from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// ─── Step 1: Registration form ───
const step = ref<'register' | 'verify'>('register')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')

function validateForm(): string | null {
  if (!firstName.value.trim() || !lastName.value.trim()) return 'Please enter your full name.'
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(email.value.trim())) return 'Please enter a valid email address.'
  if (password.value.length < 8) return 'Password must be at least 8 characters.'
  return null
}

async function handleRegister() {
  const validationError = validateForm()
  if (validationError) { authStore.setError(validationError); return }
  authStore.setLoading(true)
  authStore.clearError()
  try {
    await authService.register({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
    })
    step.value = 'verify'
    await nextTick()
    digitRefs.value[0]?.focus()
  } catch (e) {
    authStore.setError((e as Error).message)
  } finally {
    authStore.setLoading(false)
  }
}

// ─── Step 2: OTP verification ───
const DIGITS = 8
const digits = ref<string[]>(Array(DIGITS).fill(''))
const digitRefs = ref<HTMLInputElement[]>([])

const otpCode = computed(() => digits.value.join(''))
const isComplete = computed(() => otpCode.value.length === DIGITS && digits.value.every(d => d !== ''))

function onDigitInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement
  const val = input.value.replace(/\D/g, '').slice(-1)
  digits.value[index] = val
  if (val && index < DIGITS - 1) {
    digitRefs.value[index + 1]?.focus()
  }
}

function onDigitKeydown(index: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !digits.value[index] && index > 0) {
    digitRefs.value[index - 1]?.focus()
  }
}

function onDigitPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') ?? ''
  const nums = text.replace(/\D/g, '').slice(0, DIGITS).split('')
  nums.forEach((d, i) => { digits.value[i] = d })
  const nextEmpty = nums.length < DIGITS ? nums.length : DIGITS - 1
  nextTick(() => digitRefs.value[nextEmpty]?.focus())
  e.preventDefault()
}

async function handleVerify() {
  if (!isComplete.value) return
  authStore.setLoading(true)
  authStore.clearError()
  try {
    await authService.verifyOtp(email.value, otpCode.value)
    router.push('/onboarding')
  } catch (e) {
    authStore.setError((e as Error).message)
    digits.value = Array(DIGITS).fill('')
    nextTick(() => digitRefs.value[0]?.focus())
  } finally {
    authStore.setLoading(false)
  }
}

async function resendCode() {
  authStore.setLoading(true)
  authStore.clearError()
  try {
    await authService.register({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
    })
    digits.value = Array(DIGITS).fill('')
    nextTick(() => digitRefs.value[0]?.focus())
  } catch (e) {
    authStore.setError((e as Error).message)
  } finally {
    authStore.setLoading(false)
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col justify-between">

    <Transition name="modal-forward" mode="out-in">

      <!-- ── Step 1: Register ── -->
      <div v-if="step === 'register'" key="register" class="flex flex-col gap-16">
        <div class="space-y-1 auth-heading">
          <h1 class="text-4xl">Create your account</h1>
          <h2 class="text-md text-neutral-400">Get started with Lands</h2>
        </div>
        <div class="flex flex-col gap-4 auth-form">
          <div class="flex gap-4">
            <BaseInput size="lg" label="First Name" placeholder="First name" v-model="firstName" :disabled="authStore.isLoading" />
            <BaseInput size="lg" label="Last Name" placeholder="Last name" v-model="lastName" :disabled="authStore.isLoading" />
          </div>
          <BaseInput size="lg" label="Email" placeholder="you@example.com" v-model="email" :disabled="authStore.isLoading" />
          <BaseInput size="lg" type="password" label="Password" placeholder="password" v-model="password" :disabled="authStore.isLoading" />
          <p v-if="authStore.error" class="text-sm text-red-500">{{ authStore.error }}</p>
          <BaseButton variant="solid" size="lg" :disabled="authStore.isLoading" @click="handleRegister">
            {{ authStore.isLoading ? 'Creating account…' : 'Sign Up' }}
          </BaseButton>
        </div>
      </div>

      <!-- ── Step 2: Verify OTP ── -->
      <div v-else key="verify" class="flex flex-col gap-16">
        <div class="space-y-1 auth-heading">
          <h1 class="text-4xl">Check your email</h1>
          <h2 class="text-md text-neutral-400">
            We sent a 8-digit code to <span class="text-neutral-900 font-medium">{{ email }}</span>
          </h2>
        </div>
        <div class="flex flex-col gap-6 auth-form">
          <div class="flex gap-3 justify-between">
            <input
              v-for="(_, i) in digits"
              :key="i"
              :ref="el => { if (el) digitRefs[i] = el as HTMLInputElement }"
              type="text"
              inputmode="numeric"
              maxlength="1"
              :value="digits[i]"
              class="w-full aspect-square text-center text-2xl font-semibold text-gray-900 border border-gray-200 rounded-2xl bg-white transition-colors focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-black/[0.06] caret-transparent"
              @input="onDigitInput(i, $event)"
              @keydown="onDigitKeydown(i, $event)"
              @paste="onDigitPaste"
            />
          </div>
          <p v-if="authStore.error" class="text-sm text-red-500">{{ authStore.error }}</p>
          <BaseButton variant="solid" size="lg" :disabled="!isComplete || authStore.isLoading" @click="handleVerify">
            {{ authStore.isLoading ? 'Verifying…' : 'Verify' }}
          </BaseButton>
          <p class="text-sm text-center text-neutral-400">
            Didn't receive a code?
            <button class="text-neutral-900 font-medium hover:underline" :disabled="authStore.isLoading" @click="resendCode">
              Resend
            </button>
          </p>
        </div>
      </div>

    </Transition>

    <div class="text-sm text-neutral-400 auth-footer">
      Already have an account?
      <RouterLink to="/auth" class="text-neutral-900 font-medium hover:underline">Sign in</RouterLink>
    </div>
  </div>
</template>
