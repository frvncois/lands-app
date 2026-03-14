<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-3">
      <p class="text-base font-medium text-gray-900">Payment cancelled</p>
      <p class="text-sm text-gray-500">No charge was made.</p>
      <button class="text-sm text-gray-500 underline" @click="router.back()">Go back</button>
    </div>
  </div>
</template>
