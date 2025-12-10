<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  targetElement: HTMLElement | null
}>()

const emit = defineEmits<{
  (e: 'format', command: string, value?: string): void
  (e: 'close'): void
}>()

const toolbarRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const position = ref({ top: 0, left: 0 })

// Current selection state
const selectionState = ref({
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
})

function updateSelectionState() {
  selectionState.value = {
    isBold: document.queryCommandState('bold'),
    isItalic: document.queryCommandState('italic'),
    isUnderline: document.queryCommandState('underline'),
    isStrikethrough: document.queryCommandState('strikeThrough'),
  }
}

function handleSelectionChange() {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || !props.targetElement) {
    isVisible.value = false
    return
  }

  // Check if selection is within our target element
  const anchorNode = selection.anchorNode
  const focusNode = selection.focusNode

  if (!anchorNode || !focusNode) {
    isVisible.value = false
    return
  }

  const isInTarget = props.targetElement.contains(anchorNode) && props.targetElement.contains(focusNode)

  if (!isInTarget) {
    isVisible.value = false
    return
  }

  // Get the selection range bounding rect
  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()

  // Position toolbar above the selection
  const toolbarHeight = 40
  const gap = 8

  position.value = {
    top: rect.top - toolbarHeight - gap + window.scrollY,
    left: rect.left + (rect.width / 2) + window.scrollX,
  }

  updateSelectionState()
  isVisible.value = true
}

function applyFormat(command: string) {
  // Restore selection if needed
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed) return

  // Apply format using execCommand
  document.execCommand(command, false)

  // Update state
  updateSelectionState()

  // Emit the format event
  emit('format', command)
}

function insertSpan() {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed) return

  const range = selection.getRangeAt(0)
  const selectedText = range.toString()

  // Create a span with a special class for styling
  const span = document.createElement('span')
  span.className = 'ld-styled-span'
  span.setAttribute('data-span-id', Math.random().toString(36).substring(2, 8))
  span.textContent = selectedText

  // Replace selection with span
  range.deleteContents()
  range.insertNode(span)

  // Clear selection
  selection.removeAllRanges()

  emit('format', 'span')
  isVisible.value = false
}

function handleMouseDown(event: MouseEvent) {
  // Prevent toolbar click from blurring the target
  event.preventDefault()
}

watch(() => props.targetElement, (newTarget) => {
  if (newTarget) {
    document.addEventListener('selectionchange', handleSelectionChange)
  } else {
    isVisible.value = false
  }
})

onMounted(() => {
  if (props.targetElement) {
    document.addEventListener('selectionchange', handleSelectionChange)
  }
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', handleSelectionChange)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="toolbarRef"
      class="fixed z-[9999] flex items-center gap-0.5 bg-popover border border-border rounded-lg shadow-lg p-1 -translate-x-1/2"
      :style="{ top: `${position.top}px`, left: `${position.left}px` }"
      @mousedown="handleMouseDown"
    >
      <!-- Bold -->
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors"
        :class="{ 'bg-secondary text-primary': selectionState.isBold }"
        title="Bold"
        @click="applyFormat('bold')"
      >
        <Icon name="bold" class="text-sm" />
      </button>

      <!-- Italic -->
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors"
        :class="{ 'bg-secondary text-primary': selectionState.isItalic }"
        title="Italic"
        @click="applyFormat('italic')"
      >
        <Icon name="italic" class="text-sm" />
      </button>

      <!-- Underline -->
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors"
        :class="{ 'bg-secondary text-primary': selectionState.isUnderline }"
        title="Underline"
        @click="applyFormat('underline')"
      >
        <Icon name="underline" class="text-sm" />
      </button>

      <!-- Strikethrough -->
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors"
        :class="{ 'bg-secondary text-primary': selectionState.isStrikethrough }"
        title="Strikethrough"
        @click="applyFormat('strikeThrough')"
      >
        <Icon name="strikethrough" class="text-sm" />
      </button>

      <!-- Divider -->
      <div class="w-px h-5 bg-border mx-1"></div>

      <!-- Span -->
      <button
        type="button"
        class="h-8 px-2 flex items-center justify-center rounded hover:bg-secondary transition-colors text-xs font-medium"
        title="Wrap in Span (for custom styling)"
        @click="insertSpan"
      >
        <span class="opacity-60">&lt;</span>span<span class="opacity-60">&gt;</span>
      </button>
    </div>
  </Teleport>
</template>
