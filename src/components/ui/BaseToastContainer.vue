<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import BaseToast from './BaseToast.vue'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <BaseToast
        v-for="toast in toasts"
        :key="toast.id"
        :toast="toast"
        @dismiss="removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>
