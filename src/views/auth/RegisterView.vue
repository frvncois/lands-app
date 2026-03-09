<script setup>
import { RouterLink } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
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
          <BaseInput size="lg" label="First Name" placeholder="First name" />
          <BaseInput size="lg" label="Last Name" placeholder="Last name" />
        </div>
        <BaseInput size="lg" label="Email" placeholder="you@example.com"/>
        <BaseInput size="lg" type="password" label="Password" placeholder="password"/>
        <BaseButton variant="solid" size="lg">Sign Up</BaseButton>
      </div>
    </div>
    <div class="text-sm text-neutral-400 auth-footer">Already have an account? <RouterLink to="/auth" class="text-neutral-900 font-medium hover:underline">Sign in</RouterLink></div>
  </div>
</template>
