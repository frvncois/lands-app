<script setup lang="ts">
import { computed, ref } from 'vue'
import DOMPurify from 'dompurify'
import type { SectionBlock, HeadingSettings } from '@/types/editor'
import { useEditorStore } from '@/stores/editor'

/**
 * HeadingBlock - Renders an inline-editable heading
 * Supports h1-h6 levels, translations, and rich text formatting
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const emit = defineEmits<{
  contentChange: [content: string]
  spanClick: [event: MouseEvent]
  spanMouseOver: [event: MouseEvent]
  spanMouseOut: [event: MouseEvent]
}>()

const editorStore = useEditorStore()
const editableRef = ref<HTMLElement | null>(null)

const settings = computed(() => props.block.settings as HeadingSettings)

// Sanitize HTML content to prevent XSS attacks
function sanitizeHtml(html: string | undefined): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'a', 'br', 'span', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  })
}

// Translation-aware content
const displayContent = computed(() => {
  if (!settings.value) return ''
  const lang = editorStore.currentLanguage
  if (lang) {
    const langTranslations = editorStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.content
    if (translated !== undefined) return sanitizeHtml(translated)
  }
  return sanitizeHtml(settings.value.content)
})

// Handle content edit on blur
function handleEdit(event: FocusEvent) {
  const target = event.target as HTMLElement
  const newContent = target.innerHTML.trim()
  emit('contentChange', newContent)
}

// Handle Escape key - blur to save
function handleEscapeKey(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  target.blur()
}

// Handle paste - strip HTML and paste as plain text
function handlePasteClean(event: ClipboardEvent) {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

// Expose editableRef for parent component
defineExpose({ editableRef })
</script>

<template>
  <component
    :is="settings?.level || 'h2'"
    ref="editableRef"
    class="outline-none whitespace-pre-wrap"
    :class="[
      !styles.fontSize ? {
        'text-6xl': settings?.level === 'h1',
        'text-5xl': settings?.level === 'h2',
        'text-4xl': settings?.level === 'h3',
        'text-3xl': settings?.level === 'h4',
        'text-2xl': settings?.level === 'h5',
        'text-xl': settings?.level === 'h6',
      } : {}
    ]"
    :style="styles"
    contenteditable="true"
    spellcheck="false"
    @blur="handleEdit($event)"
    @keydown.escape="handleEscapeKey($event)"
    @paste="handlePasteClean($event)"
    @click="emit('spanClick', $event)"
    @mouseover="emit('spanMouseOver', $event)"
    @mouseout="emit('spanMouseOut', $event)"
    :key="`heading-${editorStore.currentLanguage || 'default'}`"
    v-html="displayContent || 'Heading'"
  />
</template>
