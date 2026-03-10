<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="flex gap-4">
    <button @click="router.push('/auth')">Login</button>
    <button @click="router.push('/auth/register')">Start for free</button>
  </div>
</template>
