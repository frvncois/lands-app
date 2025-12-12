<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Tooltip, Icon } from '@/components/ui'
import { useEditorStore } from '@/stores/editor'

const props = defineProps<{
  targetElement: HTMLElement | null
  blockId: string
}>()

const editorStore = useEditorStore()

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

  // Generate unique span ID
  const spanId = Math.random().toString(36).substring(2, 10)

  // Create a span with a special class for styling
  const span = document.createElement('span')
  span.className = 'ld-styled-span'
  span.setAttribute('data-span-id', spanId)
  span.textContent = selectedText

  // Replace selection with span
  range.deleteContents()
  range.insertNode(span)

  // Clear selection
  selection.removeAllRanges()

  // Create span in store with default name based on text content
  const spanName = selectedText.length > 20 ? selectedText.substring(0, 20) + '...' : selectedText
  editorStore.createSpan(props.blockId, spanId, spanName || 'Span')

  emit('format', 'span', spanId)
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
      <Tooltip text="Bold" position="bottom">
        <button
          type="button"
          class="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors"
          :class="{ 'bg-secondary text-primary': selectionState.isBold }"
          @click="applyFormat('bold')"
        >
          <Icon name="bold" class="text-sm" />
        </button>
      </Tooltip>

      <!-- Italic -->
      <Tooltip text="Italic" position="bottom">
        <button
          type="button"
          class="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors"
          :class="{ 'bg-secondary text-primary': selectionState.isItalic }"
          @click="applyFormat('italic')"
        >
          <Icon name="italic" class="text-sm" />
        </button>
      </Tooltip>

      <!-- Underline -->
      <Tooltip text="Underline" position="bottom">
        <button
          type="button"
          class="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors"
          :class="{ 'bg-secondary text-primary': selectionState.isUnderline }"
          @click="applyFormat('underline')"
        >
          <Icon name="underline" class="text-sm" />
        </button>
      </Tooltip>

      <!-- Strikethrough -->
      <Tooltip text="Strikethrough" position="bottom">
        <button
          type="button"
          class="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary transition-colors"
          :class="{ 'bg-secondary text-primary': selectionState.isStrikethrough }"
          @click="applyFormat('strikeThrough')"
        >
          <Icon name="strikethrough" class="text-sm" />
        </button>
      </Tooltip>

      <!-- Divider -->
      <div class="w-px h-5 bg-border mx-1"></div>

      <!-- Span -->
      <Tooltip text="Wrap in Span" position="bottom">
        <button
          type="button"
          class="h-8 px-2 flex items-center justify-center rounded hover:bg-secondary transition-colors text-xs font-medium"
          @click="insertSpan"
        >
          <span class="opacity-60">&lt;</span>span<span class="opacity-60">&gt;</span>
        </button>
      </Tooltip>
    </div>
  </Teleport>
</template>
