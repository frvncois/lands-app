<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Button, Icon } from '@/components/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const message = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// Dummy conversation
const messages = ref([
  {
    id: 1,
    type: 'system',
    content: 'Hi there! How can we help you today?',
    time: '2 min ago',
  },
])

function close() {
  emit('update:open', false)
}

function sendMessage() {
  if (!message.value.trim()) return

  messages.value.push({
    id: messages.value.length + 1,
    type: 'user',
    content: message.value,
    time: 'Just now',
  })

  message.value = ''

  // Scroll to bottom
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })

  // Simulate response after delay
  setTimeout(() => {
    messages.value.push({
      id: messages.value.length + 1,
      type: 'system',
      content: "Thanks for reaching out! Our team will get back to you shortly. In the meantime, feel free to check out our documentation for quick answers.",
      time: 'Just now',
    })
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }, 1500)
}

// Reset messages when opened
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    messages.value = [
      {
        id: 1,
        type: 'system',
        content: 'Hi there! How can we help you today?',
        time: 'Just now',
      },
    ]
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="open"
        class="fixed bottom-6 right-6 z-[9999] w-[380px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style="max-height: calc(100vh - 100px);"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Icon name="lni-comment-1-text" class="text-sm text-primary-foreground" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-foreground">Lands Support</h3>
              <p class="text-xs text-muted-foreground">We typically reply in a few hours</p>
            </div>
          </div>
          <button
            class="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            @click="close"
          >
            <Icon name="lni-xmark" class="text-sm" />
          </button>
        </div>

        <!-- Messages -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-4"
          style="min-height: 300px; max-height: 400px;"
        >
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex"
            :class="msg.type === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm"
              :class="msg.type === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'"
            >
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-border bg-muted/30">
          <div class="flex items-center gap-2">
            <input
              v-model="message"
              type="text"
              class="flex-1 h-10 px-4 bg-background border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              placeholder="Type a message..."
              @keyup.enter="sendMessage"
            />
            <Button
              size="icon"
              class="rounded-full shrink-0"
              :disabled="!message.trim()"
              @click="sendMessage"
            >
              <Icon name="lni-arrow-right" class="text-sm" />
            </Button>
          </div>
          <p class="text-[10px] text-muted-foreground text-center mt-2">
            Powered by Lands
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
