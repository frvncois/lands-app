<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAssistantStore } from '@/stores/assistant'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { AssistantModal } from '@/components/assistant'
import Icon from '@/components/ui/Icon.vue'

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

  <!-- Assistant Toggle (fixed bottom left) -->
  <button
    class="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
    @click="assistantStore.toggleOpen()"
  >
    <Icon name="app-ai" :size="20" />
    <span class="text-sm font-medium">Assistant</span>
  </button>

  <!-- Assistant Modal -->
  <AssistantModal />
</template>
