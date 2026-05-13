<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import authService from '@/features/auth/services/auth.service'
import { useAuthForm } from '@/features/auth/composables/useAuthForm'
import { useOtpInput } from '@/features/auth/composables/useOtpInput'

const router = useRouter()
const { isLoading, error, setError, runAction } = useAuthForm()
const {
  digits,
  code: otpCode,
  isComplete,
  onInput: onDigitInput,
  onKeydown: onDigitKeydown,
  onPaste: onDigitPaste,
  reset: resetOtp,
  focusFirst,
  setInputRef,
} = useOtpInput({ length: 8 })

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
  if (validationError) { setError(validationError); return }
  await runAction(async () => {
    await authService.register({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
    })
    step.value = 'verify'
    focusFirst()
  })
}

// ─── Step 2: OTP verification ───
async function handleVerify() {
  if (!isComplete.value) return
  await runAction(async () => {
    await authService.verifyOtp(email.value, otpCode.value)
    router.push('/onboarding')
  })
  if (error.value) resetOtp()
}

async function resendCode() {
  await runAction(async () => {
    await authService.register({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
    })
    resetOtp()
  })
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
            <BaseInput size="lg" label="First Name" placeholder="First name" v-model="firstName" :disabled="isLoading" />
            <BaseInput size="lg" label="Last Name" placeholder="Last name" v-model="lastName" :disabled="isLoading" />
          </div>
          <BaseInput size="lg" label="Email" placeholder="you@example.com" v-model="email" :disabled="isLoading" />
          <BaseInput size="lg" type="password" label="Password" placeholder="password" v-model="password" :disabled="isLoading" />
          <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
          <BaseButton variant="solid" size="lg" :disabled="isLoading" @click="handleRegister">
            {{ isLoading ? 'Creating account…' : 'Sign Up' }}
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
              :ref="(el) => setInputRef(i, el as HTMLInputElement | null)"
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
          <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
          <BaseButton variant="solid" size="lg" :disabled="!isComplete || isLoading" @click="handleVerify">
            {{ isLoading ? 'Verifying…' : 'Verify' }}
          </BaseButton>
          <p class="text-sm text-center text-neutral-400">
            Didn't receive a code?
            <button class="text-neutral-900 font-medium hover:underline" :disabled="isLoading" @click="resendCode">
              Resend
            </button>
          </p>
        </div>
      </div>

    </Transition>

    <div class="text-neutral-400 auth-footer">
      Already have an account?
      <RouterLink to="/auth" class="text-neutral-900 font-medium hover:underline">Sign in</RouterLink>
    </div>
  </div>
</template>
