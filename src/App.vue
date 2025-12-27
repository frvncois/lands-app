<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAssistantStore } from '@/stores/assistant'
import ToastContainer from '@/components/ui/ToastContainer.vue'

useTheme()

const assistantStore = useAssistantStore()

onMounted(() => {
  // Check if this is the user's first visit and auto-open assistant
  assistantStore.checkFirstVisit()
})
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>
