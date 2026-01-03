<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAssistantStore } from '@/stores/assistant'
import { useUserStore } from '@/stores/user'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { AssistantModal } from '@/components/assistant'
import Icon from '@/components/ui/Icon.vue'
import ConnectionStatus from '@/components/common/ConnectionStatus.vue'

useTheme()

const route = useRoute()
const assistantStore = useAssistantStore()
const userStore = useUserStore()

// Assistant is only accessible for authenticated users on /dashboard/ routes
const isAssistantAccessible = computed(() => {
  return userStore.isAuthenticated && route.path.startsWith('/dashboard/')
})

onMounted(() => {
  // Check if this is the user's first visit and auto-open assistant
  assistantStore.checkFirstVisit()
})
</script>

<template>
  <RouterView />
  <ToastContainer />
  <ConnectionStatus />

  <!-- Assistant Toggle (fixed bottom right) -->
  <button
    v-if="isAssistantAccessible && !assistantStore.isOpen"
    class="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
    @click="assistantStore.toggleOpen()"
  >
    <Icon name="app-ai" :size="20" />
    <span class="text-sm font-medium">Assistant</span>
  </button>

  <!-- Assistant Modal -->
  <AssistantModal v-if="isAssistantAccessible" />
</template>
