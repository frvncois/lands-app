<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast'
import Toast from './Toast.vue'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)

function handleDismiss(id: string) {
  toastStore.removeToast(id)
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 pointer-events-none max-h-screen overflow-hidden"
      aria-live="polite"
    >
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-2"
      >
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
          @dismiss="handleDismiss"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
