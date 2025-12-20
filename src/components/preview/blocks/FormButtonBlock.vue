<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SectionBlock, FormButtonSettings, FormButtonStyles } from '@/types/designer'
import { useDesignerStore } from '@/stores/designer'

/**
 * FormButtonBlock - Renders a form submit/reset button
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
}>()

const emit = defineEmits<{
  contentChange: [content: string]
}>()

const designerStore = useDesignerStore()
const editableRef = ref<HTMLElement | null>(null)

const settings = computed(() => props.block.settings as FormButtonSettings)
const buttonStyles = computed(() => props.block.styles as FormButtonStyles)

// Translation-aware label
const displayLabel = computed(() => {
  const lang = designerStore.currentLanguage
  if (lang) {
    const langTranslations = designerStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.label
    if (translated !== undefined) return translated
  }
  return settings.value?.label || 'Submit'
})

// Compute button styles
const computedStyles = computed(() => ({
  ...props.styles,
  fontSize: buttonStyles.value?.fontSize || props.styles.fontSize || '16px',
  fontWeight: buttonStyles.value?.fontWeight || props.styles.fontWeight || 'semibold',
  fontFamily: buttonStyles.value?.fontFamily || props.styles.fontFamily,
  color: buttonStyles.value?.color || props.styles.color || '#ffffff',
  backgroundColor: buttonStyles.value?.backgroundColor || props.styles.backgroundColor || '#18181b',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

// Handle content edit on blur
function handleEdit(event: FocusEvent) {
  const target = event.target as HTMLElement
  const newContent = target.textContent?.trim() || ''
  emit('contentChange', newContent)
}

// Handle Escape key - blur to save
function handleEscapeKey(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  target.blur()
}

// Expose editableRef for parent component
defineExpose({ editableRef })
</script>

<template>
  <button
    ref="editableRef"
    :type="settings?.type || 'submit'"
    class="outline-none transition-colors hover:opacity-90"
    :style="computedStyles"
    contenteditable="true"
    spellcheck="false"
    @blur="handleEdit($event)"
    @keydown.escape="handleEscapeKey($event)"
    @click.prevent
  >
    {{ displayLabel }}
  </button>
</template>
