<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Spinner from '@/components/ui/Spinner.vue'

const props = defineProps<{
  hasReferenceUrl?: boolean
}>()

// Progressive loading messages
const messages = [
  'Analyzing your project details...',
  'Understanding your vision...',
  'Crafting personalized content...',
  'Generating headlines and descriptions...',
  'Finalizing your sections...',
]

const messagesWithUrl = [
  'Analyzing your project details...',
  'Fetching reference website...',
  'Understanding style and content...',
  'Generating relevant sections...',
  'Personalizing content for you...',
  'Finalizing your landing page...',
]

const currentMessageIndex = ref(0)
const currentMessage = ref('')

// Update message every 2 seconds
let messageInterval: ReturnType<typeof setInterval> | null = null

function startMessageRotation() {
  const messageList = props.hasReferenceUrl ? messagesWithUrl : messages
  currentMessage.value = messageList[0] || ''
  currentMessageIndex.value = 0

  messageInterval = setInterval(() => {
    currentMessageIndex.value++
    if (currentMessageIndex.value < messageList.length) {
      currentMessage.value = messageList[currentMessageIndex.value] || ''
    } else {
      // Loop back to second-to-last message
      currentMessageIndex.value = messageList.length - 2
      currentMessage.value = messageList[currentMessageIndex.value] || ''
    }
  }, 2500)
}

onMounted(() => {
  startMessageRotation()
})

watch(() => props.hasReferenceUrl, () => {
  if (messageInterval) {
    clearInterval(messageInterval)
  }
  startMessageRotation()
})

// Cleanup on unmount
function cleanup() {
  if (messageInterval) {
    clearInterval(messageInterval)
  }
}

// Cleanup
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 px-8">
    <!-- Animated spinner -->
    <div class="relative mb-8">
      <Spinner class="w-16 h-16 text-primary" />

      <!-- Pulsing ring -->
      <div class="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
    </div>

    <!-- Main message -->
    <h3 class="text-xl font-semibold text-foreground mb-3 text-center">
      Generating your landing page
    </h3>

    <!-- Progressive message with fade transition -->
    <Transition name="fade" mode="out-in">
      <p
        :key="currentMessage"
        class="text-sm text-muted-foreground text-center max-w-md"
      >
        {{ currentMessage }}
      </p>
    </Transition>

    <!-- Progress dots -->
    <div class="flex items-center gap-2 mt-8">
      <div
        v-for="(_, index) in (hasReferenceUrl ? messagesWithUrl : messages)"
        :key="index"
        class="w-2 h-2 rounded-full transition-all duration-300"
        :class="[
          index === currentMessageIndex
            ? 'bg-primary w-6'
            : index < currentMessageIndex
              ? 'bg-primary/50'
              : 'bg-muted'
        ]"
      />
    </div>

    <!-- Info text -->
    <p class="text-xs text-muted-foreground text-center mt-8 max-w-sm">
      This usually takes 10-20 seconds. We're using AI to create content tailored to your project.
    </p>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
