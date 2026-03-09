<script setup>
import { RouterLink, useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const router = useRouter()
</script>

<template>
  <div class="flex flex-1 flex-col justify-between">
    <div class="flex flex-col flex-1 gap-16">
      <div class="space-y-1 auth-heading">
        <h1 class="text-4xl">Welcome back</h1>
        <h2 class="text-md text-neutral-400">Sign in to your account</h2>
      </div>
      <div class="flex flex-col gap-4 auth-form">
        <BaseInput size="lg" label="Email" placeholder="you@example.com"/>
        <BaseInput size="lg" type="password" label="Password" placeholder="password"/>
        <BaseButton variant="solid" size="lg" @click="router.push('/dashboard')">Sign In</BaseButton>
        <RouterLink to="/auth/reset" class="text-neutral-400 text-xs text-right hover:underline">Forgot password?</RouterLink>
      </div>
    </div>
    <div class="text-sm text-neutral-400 auth-footer">Don't have an account? <RouterLink to="/auth/register" class="text-neutral-900 font-medium hover:underline">Sign up</RouterLink></div>
  </div>
</template>
