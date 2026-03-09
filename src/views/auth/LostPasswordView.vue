<script setup>
import { RouterLink } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
</script>

<template>
  <div class="flex flex-1 flex-col justify-between">
    <div class="flex flex-col flex-1 gap-16">
      <div class="space-y-1 auth-heading">
        <h1 class="text-4xl">Reset your password</h1>
        <h2 class="text-md text-neutral-400">We'll send you a link to reset it</h2>
      </div>
      <div class="flex flex-col gap-4 auth-form">
        <BaseInput size="lg" label="Email" placeholder="you@example.com"/>
        <BaseButton variant="solid" size="lg">Send reset link</BaseButton>
      </div>
    </div>
    <RouterLink to="/auth" class="text-neutral-900 font-medium hover:underline auth-footer">← Back to login</RouterLink>
  </div>
</template>
