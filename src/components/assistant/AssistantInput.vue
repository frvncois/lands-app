<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@/components/ui'

defineProps<{
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  submit: [value: string]
}>()

const inputValue = ref('')

function handleSubmit() {
  const value = inputValue.value.trim()
  if (!value) return

  emit('submit', value)
  inputValue.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <div class="border-t border-border p-3">
    <div class="flex items-center gap-2">
      <input
        v-model="inputValue"
        type="text"
        :placeholder="placeholder || 'Type your answer...'"
        :disabled="disabled"
        class="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        @keydown="handleKeydown"
      />
      <button
        :disabled="disabled || !inputValue.trim()"
        class="flex items-center justify-center w-9 h-9 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleSubmit"
      >
        <Icon name="arrow-right" :size="16" />
      </button>
    </div>
  </div>
</template>
