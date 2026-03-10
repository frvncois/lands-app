<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import LandsLogo from '@/assets/LandsLogo.vue'

const router = useRouter()
</script>

<template>
  <div class="flex flex-1 flex-col justify-between">
    <div class="flex flex-col flex-1 gap-16">
      <div class="space-y-8">
        <LandsLogo />
        <div class="space-y-1">
          <h1 class="text-4xl">Welcome to Lands</h1>
          <h2 class="text-md text-neutral-400">Let's get your first land set up.</h2>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <BaseButton variant="solid" size="lg" @click="router.push('/dashboard')">
          Get started
        </BaseButton>
      </div>
    </div>
  </div>
</template>
