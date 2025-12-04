<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import ToastContainer from '@/components/ui/ToastContainer.vue'

// Initialize theme system
useTheme()
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>
