<script setup lang="ts">
import type { Message } from '@/stores/assistant'

defineProps<{
  message: Message
}>()
</script>

<template>
  <div
    class="flex"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[85%] rounded-lg p-3"
      :class="message.role === 'user'
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-foreground'"
    >
      <!-- Typing indicator -->
      <div v-if="message.isTyping" class="flex items-center gap-1">
        <span class="typing-dot"/>
        <span class="typing-dot" style="animation-delay: 0.2s"/>
        <span class="typing-dot" style="animation-delay: 0.4s"/>
      </div>

      <!-- Message content -->
      <p v-else class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

.typing-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  animation: typing 1.4s infinite;
}
</style>
