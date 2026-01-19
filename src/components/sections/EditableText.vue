<script setup lang="ts">
/**
 * EDITABLE TEXT
 *
 * Wrapper for text elements that enables inline editing in the canvas.
 * - Click to select field
 * - Shows focus outline when active
 * - Supports contenteditable for inline text editing
 */

defineOptions({
  inheritAttrs: false
})

import { ref, watch, nextTick, useAttrs } from 'vue'

const attrs = useAttrs()

const props = defineProps<{
  /** The text content */
  value: string
  /** Field key for identification */
  fieldKey: string
  /** Whether editing is enabled (section is selected) */
  editable?: boolean
  /** Currently active field key */
  activeField?: string | null
  /** HTML tag to render */
  tag?: string
  /** Whether content is HTML (use v-html) */
  html?: boolean
  /** Placeholder when empty */
  placeholder?: string
  /** List of hidden field keys */
  hiddenFields?: string[]
}>()

// Check if this field is hidden
const isHidden = computed(() => props.hiddenFields?.includes(props.fieldKey) ?? false)

const emit = defineEmits<{
  selectField: [fieldKey: string]
  'update': [fieldKey: string, value: string]
}>()

const elementRef = ref<HTMLElement | null>(null)
const isEditing = ref(false)

const isActive = computed(() => props.editable && props.activeField === props.fieldKey)

function handleClick(e: MouseEvent) {
  if (!props.editable) return
  e.stopPropagation()
  emit('selectField', props.fieldKey)
}

function handleDoubleClick(e: MouseEvent) {
  if (!props.editable || !isActive.value) return
  e.stopPropagation()

  // Enter contenteditable mode
  isEditing.value = true
  nextTick(() => {
    if (elementRef.value) {
      elementRef.value.focus()
      // Select all text
      const range = document.createRange()
      range.selectNodeContents(elementRef.value)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  })
}

function handleBlur() {
  if (isEditing.value && elementRef.value) {
    // For HTML content, preserve the HTML; for plain text, use innerText
    const newValue = props.html
      ? elementRef.value.innerHTML
      : elementRef.value.innerText
    if (newValue !== props.value) {
      emit('update', props.fieldKey, newValue)
    }
    isEditing.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  // For HTML content, allow Enter for line breaks
  if (e.key === 'Enter' && !e.shiftKey && !props.html) {
    e.preventDefault()
    elementRef.value?.blur()
  }
  if (e.key === 'Escape') {
    // Reset content and blur
    if (elementRef.value) {
      if (props.html) {
        elementRef.value.innerHTML = props.value || ''
      } else {
        elementRef.value.innerText = props.value || ''
      }
    }
    isEditing.value = false
    elementRef.value?.blur()
  }
}

// Watch for active field changes to exit editing mode
watch(() => props.activeField, (newVal) => {
  if (newVal !== props.fieldKey && isEditing.value) {
    isEditing.value = false
  }
})

import { computed } from 'vue'
</script>

<template>
  <!-- HTML content -->
  <component
    :is="tag || 'span'"
    v-if="html && !isHidden"
    ref="elementRef"
    v-bind="attrs"
    :class="[
      editable && 'cursor-pointer transition-all duration-150 rounded-md',
      editable && !isActive && 'hover:outline hover:outline-2 hover:outline-primary/20 hover:outline-offset-2',
      isActive && 'outline outline-1 outline-primary outline-offset-4',
      isEditing && 'outline-primary',
    ]"
    :contenteditable="isEditing"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @blur="handleBlur"
    @keydown="handleKeydown"
    v-html="value || placeholder"
  />

  <!-- Plain text content -->
  <component
    :is="tag || 'span'"
    v-else-if="!isHidden"
    ref="elementRef"
    v-bind="attrs"
    :class="[
      editable && 'cursor-pointer transition-all duration-150 rounded-md',
      editable && !isActive && 'hover:outline hover:outline-2 hover:outline-primary/20 hover:outline-offset-2',
      isActive && 'outline outline-1 outline-primary outline-offset-4',
      isEditing && 'outline-primary',
    ]"
    :contenteditable="isEditing"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @blur="handleBlur"
    @keydown="handleKeydown"
  >
    {{ value || placeholder }}
  </component>
</template>
