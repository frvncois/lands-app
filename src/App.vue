<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import ToastContainer from '@/components/ui/ToastContainer.vue'

useTheme()
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>
