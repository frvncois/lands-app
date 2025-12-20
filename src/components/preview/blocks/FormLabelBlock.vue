<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SectionBlock, FormLabelSettings, FormLabelStyles } from '@/types/designer'
import { useDesignerStore } from '@/stores/designer'

/**
 * FormLabelBlock - Renders a form label
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

const settings = computed(() => props.block.settings as FormLabelSettings)
const labelStyles = computed(() => props.block.styles as FormLabelStyles)

// Translation-aware content
const displayContent = computed(() => {
  const lang = designerStore.currentLanguage
  if (lang) {
    const langTranslations = designerStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.content
    if (translated !== undefined) return translated
  }
  return settings.value?.content || 'Label'
})

// Compute label styles
const computedStyles = computed(() => ({
  ...props.styles,
  fontSize: labelStyles.value?.fontSize || props.styles.fontSize || '14px',
  fontWeight: labelStyles.value?.fontWeight || props.styles.fontWeight || 'medium',
  fontFamily: labelStyles.value?.fontFamily || props.styles.fontFamily,
  color: labelStyles.value?.color || props.styles.color || '#09090b',
  textAlign: labelStyles.value?.alignment || props.styles.textAlign,
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
  <label
    ref="editableRef"
    :for="settings?.for"
    class="outline-none cursor-text"
    :style="computedStyles"
    contenteditable="true"
    spellcheck="false"
    @blur="handleEdit($event)"
    @keydown.escape="handleEscapeKey($event)"
  >
    {{ displayContent }}
  </label>
</template>
