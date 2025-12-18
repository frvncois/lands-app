<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { Icon } from '@/components/ui'
import { useAIAssistant } from '@/composables/useAIAssistant'
import {
  getActionIcon as _getActionIcon,
  getActionColor as _getActionColor,
  isDisplayOnlyAction as _isDisplayOnlyAction,
  type AIAction,
  type SeoSuggestionAction
} from '@/lib/aiActions'

// Wrapper functions to handle readonly -> mutable cast
function getIcon(action: unknown): string {
  return _getActionIcon(action as AIAction)
}
function getColor(action: unknown): string {
  return _getActionColor(action as AIAction)
}
function isDisplayOnly(action: unknown): boolean {
  return _isDisplayOnlyAction(action as AIAction)
}
function describe(action: unknown): string {
  return describeAction(action as AIAction)
}

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const {
  messages,
  isLoading,
  error,
  usage,
  pendingActions,
  canSendMessage,
  remainingMessages,
  hasPendingActions,
  sendMessage,
  clearMessages,
  applyActions,
  applySingleAction,
  dismissActions,
  describeAction,
} = useAIAssistant()

const input = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// Quick prompts - shorter for compact UI
const quickPrompts = [
  { label: 'Hero section', prompt: 'Build me a hero section with a headline, description, and CTA button. Match my existing styles.' },
  { label: 'Testimonials', prompt: 'Create a testimonials section with 3 customer quotes in a grid layout.' },
  { label: 'SEO check', prompt: 'Analyze my page SEO and provide specific suggestions for improvement.' },
  { label: 'Add animations', prompt: 'Add subtle entrance animations to my content blocks.' },
]

function close() {
  emit('update:open', false)
}

async function handleSend() {
  if (!input.value.trim() || !canSendMessage.value) return
  const message = input.value.trim()
  input.value = ''
  await sendMessage(message)
  scrollToBottom()
}

async function handleQuickPrompt(prompt: string) {
  input.value = ''
  await sendMessage(prompt)
  scrollToBottom()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Auto-scroll when new messages arrive
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

function formatMessage(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/\n/g, '<br>')
}

function getSeoSuggestions(action: unknown): SeoSuggestionAction['suggestions'] {
  const a = action as AIAction
  if (a.type === 'seo_suggestion') {
    return (a as SeoSuggestionAction).suggestions
  }
  return []
}

function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  const colors = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-blue-600 bg-blue-50',
  }
  return colors[priority]
}
</script>

<template>
  <Teleport to="body">
    <!-- Chat Box - Bottom Right -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="open"
        class="fixed bottom-4 right-4 z-[9999] w-96 h-[32rem] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-violet-500/5 to-purple-500/5 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Icon name="app-ai" class="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-foreground">AI Assistant</h2>
              <p v-if="remainingMessages !== null" class="text-[10px] text-muted-foreground">
                {{ remainingMessages }} messages left
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-if="messages.length > 0"
              class="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title="Clear chat"
              @click="clearMessages"
            >
              <Icon name="trash-1" class="w-3.5 h-3.5" />
            </button>
            <button
              class="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              @click="close"
            >
              <Icon name="xmark" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        >
          <!-- Empty state - compact -->
          <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center px-2">
            <div class="w-12 h-12 mb-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 flex items-center justify-center">
              <Icon name="app-ai" class="w-6 h-6 text-violet-500" />
            </div>
            <p class="text-sm font-medium text-foreground mb-1">How can I help?</p>
            <p class="text-xs text-muted-foreground mb-4">Build sections, improve content, and more</p>

            <!-- Quick prompts - compact grid -->
            <div class="grid grid-cols-2 gap-1.5 w-full">
              <button
                v-for="qp in quickPrompts"
                :key="qp.label"
                class="px-2.5 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors text-left"
                @click="handleQuickPrompt(qp.prompt)"
              >
                {{ qp.label }}
              </button>
            </div>
          </div>

          <!-- Message list -->
          <template v-else>
            <div
              v-for="message in messages"
              :key="message.id"
              class="flex gap-2"
              :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <!-- Assistant avatar -->
              <div
                v-if="message.role === 'assistant'"
                class="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5"
              >
                <Icon name="app-ai" class="w-3 h-3 text-white" />
              </div>

              <!-- Message content -->
              <div
                class="max-w-[85%] rounded-xl px-3 py-2"
                :class="message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'"
              >
                <div
                  class="text-xs leading-relaxed"
                  v-html="formatMessage(message.content)"
                />

                <!-- Actions preview -->
                <div v-if="message.actions && message.actions.length > 0 && !message.actionsExecuted" class="mt-2 pt-2 border-t border-border/50">
                  <p class="text-[10px] text-muted-foreground mb-1">Actions:</p>
                  <div class="space-y-1">
                    <div
                      v-for="(action, idx) in message.actions"
                      :key="idx"
                      class="flex items-center gap-1.5 text-[10px]"
                    >
                      <Icon :name="getIcon(action)" class="w-3 h-3" :class="getColor(action)" />
                      <span>{{ describe(action) }}</span>
                    </div>
                  </div>
                </div>

                <!-- SEO suggestions -->
                <div v-if="message.actions?.some(a => a.type === 'seo_suggestion')" class="mt-2 space-y-1.5">
                  <template v-for="(action, idx) in message.actions" :key="idx">
                    <template v-if="action.type === 'seo_suggestion'">
                      <div
                        v-for="(suggestion, sIdx) in getSeoSuggestions(action)"
                        :key="sIdx"
                        class="p-2 bg-background/50 rounded-md"
                      >
                        <div class="flex items-start gap-1.5">
                          <span
                            class="px-1 py-0.5 text-[8px] font-medium rounded uppercase"
                            :class="getPriorityColor(suggestion.priority)"
                          >
                            {{ suggestion.priority }}
                          </span>
                          <div class="flex-1 min-w-0">
                            <p class="text-[10px] font-medium">{{ suggestion.issue }}</p>
                            <p class="text-[10px] text-muted-foreground">{{ suggestion.fix }}</p>
                          </div>
                        </div>
                      </div>
                    </template>
                  </template>
                </div>

                <!-- Executed badge -->
                <div v-if="message.actionsExecuted" class="mt-1.5 flex items-center gap-1 text-[10px] text-green-600">
                  <Icon name="checkmark-circle" class="w-3 h-3" />
                  <span>Applied</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Loading -->
          <div v-if="isLoading" class="flex gap-2">
            <div class="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
              <Icon name="app-ai" class="w-3 h-3 text-white" />
            </div>
            <div class="bg-muted rounded-xl rounded-bl-sm px-3 py-2">
              <div class="flex gap-1">
                <span class="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style="animation-delay: 0ms" />
                <span class="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style="animation-delay: 150ms" />
                <span class="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style="animation-delay: 300ms" />
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Actions Bar -->
        <div
          v-if="hasPendingActions"
          class="px-3 py-2 border-t border-border bg-violet-50 dark:bg-violet-950/20 shrink-0"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <Icon name="sparkles" class="w-3.5 h-3.5 text-violet-600" />
              <span class="text-xs font-medium text-violet-900 dark:text-violet-100">
                {{ pendingActions.length }} action{{ pendingActions.length > 1 ? 's' : '' }}
              </span>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                class="px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground rounded transition-colors"
                @click="dismissActions"
              >
                Dismiss
              </button>
              <button
                class="px-2 py-1 text-[10px] bg-violet-600 hover:bg-violet-700 text-white rounded transition-colors"
                @click="applyActions"
              >
                Apply
              </button>
            </div>
          </div>

          <!-- Individual actions (if multiple) -->
          <div v-if="pendingActions.length > 1" class="mt-1.5 space-y-0.5">
            <button
              v-for="(action, idx) in pendingActions"
              :key="idx"
              class="w-full flex items-center gap-1.5 px-1.5 py-1 text-[10px] text-left hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded transition-colors"
              :disabled="isDisplayOnly(action)"
              @click="!isDisplayOnly(action) && applySingleAction(action as AIAction)"
            >
              <Icon :name="getIcon(action)" class="w-3 h-3" :class="getColor(action)" />
              <span class="flex-1 truncate">{{ describe(action) }}</span>
            </button>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="px-3 py-2 border-t border-red-200 bg-red-50 shrink-0">
          <p class="text-[10px] text-red-600">{{ error }}</p>
        </div>

        <!-- Input -->
        <div class="px-3 py-3 border-t border-border shrink-0">
          <div class="flex gap-2">
            <input
              v-model="input"
              type="text"
              class="flex-1 px-3 py-2 bg-muted border-0 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              placeholder="Ask me anything..."
              :disabled="!canSendMessage"
              @keydown="handleKeydown"
            />
            <button
              class="w-8 h-8 flex items-center justify-center bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              :disabled="!canSendMessage || !input.trim()"
              @click="handleSend"
            >
              <Icon name="paper-plane-1" class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Usage warning -->
          <p v-if="usage && usage.used >= usage.limit" class="mt-1.5 text-[10px] text-amber-600">
            Daily limit reached. Upgrade for more.
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
