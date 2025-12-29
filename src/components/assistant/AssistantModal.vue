<script setup lang="ts">
import { ref, computed, watchEffect, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssistantStore } from '@/stores/assistant'
import AssistantMessage from './AssistantMessage.vue'
import AssistantOptions from './AssistantOptions.vue'
import AssistantInput from './AssistantInput.vue'
import AssistantThemePicker from './AssistantThemePicker.vue'
import AssistantProjectList from './AssistantProjectList.vue'

const assistantStore = useAssistantStore()
const { chatMode, isAIProcessing } = storeToRefs(assistantStore)
const messagesContainer = ref<HTMLElement | null>(null)

function handleMinimize() {
  assistantStore.minimize()
}

function handleClose() {
  assistantStore.close()
}

function handleHeaderClick() {
  if (assistantStore.isMinimized) {
    assistantStore.isMinimized = false
  }
}

// Track if user has manually scrolled up
const userHasScrolled = ref(false)
const lastMessageCount = ref(0)

// Auto-scroll to bottom when new messages are added (only if user hasn't scrolled up)
watchEffect(() => {
  const messageCount = assistantStore.messages.length

  // If new message was added
  if (messageCount > lastMessageCount.value) {
    lastMessageCount.value = messageCount

    nextTick(() => {
      if (messagesContainer.value && !userHasScrolled.value) {
        messagesContainer.value.scrollTo({
          top: messagesContainer.value.scrollHeight,
          behavior: 'smooth'
        })
      }
    })
  }
})

// Detect when user scrolls up
function handleScroll() {
  if (!messagesContainer.value) return

  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 50

  userHasScrolled.value = !isAtBottom
}

// Get last message for options rendering
const lastMessage = computed(() => {
  const messages = assistantStore.messages
  return messages.length > 0 ? messages[messages.length - 1] : null
})

const shouldShowOptions = computed(() => {
  return lastMessage.value?.role === 'assistant' && lastMessage.value?.options && lastMessage.value.options.length > 0
})

const needsInput = computed(() => {
  // ALWAYS show input - simple chat interface
  return true
})

const needsThemePicker = computed(() => {
  return lastMessage.value?.component === 'theme-picker'
})

const needsProjectList = computed(() => {
  return lastMessage.value?.component === 'project-list'
})

const inputPlaceholder = computed(() => {
  if (chatMode.value === 'chat') {
    return 'Ask me to edit your page...'
  }
  return 'Ask me anything...'
})

function handleOptionSelect(optionId: string) {
  assistantStore.selectOption(optionId)
}

function handleInputSubmit(value: string) {
  if (chatMode.value === 'chat') {
    assistantStore.sendChatMessage(value)
  } else {
    assistantStore.submitInput(value)
  }
}

function handleThemeSelect(themeId: string) {
  assistantStore.selectOption(themeId)
}

function handleProjectSelect(projectId: string) {
  assistantStore.selectOption(projectId)
}

function handleGoBack() {
  assistantStore.goBack()
}

function handleStartOver() {
  assistantStore.startOver()
}

// Check if we can go back
const canGoBack = computed(() => {
  return assistantStore.currentFlow && assistantStore.flowStep > 0
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="scale-75 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-75 opacity-0"
    >
      <div
        v-if="assistantStore.isOpen"
        class="fixed bottom-4 right-4 w-96 max-h-[500px] bg-background border border-border rounded-xl shadow-2xl flex flex-col origin-bottom-right"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-border"
          :class="{ 'cursor-pointer': assistantStore.isMinimized }"
          @click="handleHeaderClick"
        >
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-medium">Assistant</h3>
            <!-- Loading spinner -->
            <div v-if="assistantStore.isProcessing" class="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <!-- New Chat button (chat mode only) -->
            <button
              v-if="chatMode === 'chat' && !assistantStore.isMinimized"
              class="text-xs text-muted-foreground hover:text-foreground transition-colors"
              @click.stop="handleStartOver"
              title="Start new chat"
            >
              New Chat
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="text-muted-foreground hover:text-foreground transition-colors"
              @click.stop="handleMinimize"
              aria-label="Minimize"
            >
              <span class="text-xl leading-none">−</span>
            </button>
            <button
              class="text-muted-foreground hover:text-foreground transition-colors"
              @click.stop="handleClose"
              aria-label="Close"
            >
              <span class="text-xl leading-none">×</span>
            </button>
          </div>
        </div>

        <!-- Content Area -->
        <div
          v-if="!assistantStore.isMinimized"
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]"
          @scroll="handleScroll"
        >
          <!-- Empty State -->
          <div v-if="assistantStore.messages.length === 0" class="flex items-center justify-center h-full text-muted-foreground text-sm">
            <p>Loading assistant...</p>
          </div>

          <!-- Messages -->
          <template v-for="message in assistantStore.messages" :key="message.id">
            <AssistantMessage :message="message" />

            <!-- Theme Picker (if message has theme-picker component) -->
            <AssistantThemePicker
              v-if="chatMode !== 'chat' && message.component === 'theme-picker' && message.id === lastMessage?.id"
              @select="handleThemeSelect"
            />

            <!-- Project List (if message has project-list component) -->
            <AssistantProjectList
              v-if="chatMode !== 'chat' && message.component === 'project-list' && message.id === lastMessage?.id"
              @select="handleProjectSelect"
            />
          </template>

          <!-- Options (if last message has options) -->
          <AssistantOptions
            v-if="chatMode !== 'chat' && shouldShowOptions && lastMessage && !assistantStore.isProcessing"
            :options="lastMessage.options!"
            @select="handleOptionSelect"
          />

          <!-- Back / Start Over buttons -->
          <div v-if="chatMode !== 'chat' && assistantStore.messages.length > 1 && !assistantStore.isProcessing" class="flex items-center gap-2 pt-2 border-t border-border mt-3 pt-3">
            <button
              v-if="canGoBack"
              class="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              @click="handleGoBack"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <button
              v-if="assistantStore.currentFlow"
              class="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
              @click="handleStartOver"
            >
              Start Over
            </button>
          </div>
        </div>

        <!-- Input Field (when needed) -->
        <AssistantInput
          v-if="!assistantStore.isMinimized && needsInput"
          :placeholder="inputPlaceholder"
          :disabled="assistantStore.isProcessing"
          @submit="handleInputSubmit"
        />
      </div>
    </Transition>
  </Teleport>
</template>
