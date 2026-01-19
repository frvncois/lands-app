<script setup lang="ts">
import { computed } from 'vue'
import EditableText from '../EditableText.vue'
import type { FieldStyles } from '@/types/sections'
import { getTextStyle } from '@/lib/section-styles'

const props = withDefaults(defineProps<{
  headline?: string
  subheadline?: string
  paragraph?: string
  fieldStyles?: FieldStyles
  editable?: boolean
  activeField?: string | null
  hiddenFields?: string[]
}>(), {
  editable: false,
  activeField: null,
  hiddenFields: undefined,
})

const emit = defineEmits<{
  selectField: [fieldKey: string]
  'update': [fieldKey: string, value: unknown]
}>()

const hasContent = computed(() => props.headline || props.subheadline || props.paragraph)

function getFieldStyle(fieldKey: string, defaultFont: string) {
  return getTextStyle(props.fieldStyles, fieldKey, defaultFont)
}

function handleSelect(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}
</script>

<template>
  <div
    v-if="hasContent"
    class="flex flex-col gap-[var(--spacing-sm)]"
  >
    <EditableText
      v-if="headline"
      tag="h2"
      :value="headline"
      field-key="headline"
      :editable="editable"
      :active-field="activeField"
      :hidden-fields="hiddenFields"
      class="text-[length:var(--text-3xl)] font-bold leading-tight m-0"
      :style="getFieldStyle('headline', '--font-heading')"
      @select-field="handleSelect"
      @update="handleUpdate"
    />
    <EditableText
      v-if="subheadline"
      tag="h3"
      :value="subheadline"
      field-key="subheadline"
      :editable="editable"
      :active-field="activeField"
      :hidden-fields="hiddenFields"
      class="text-[length:var(--text-lg)] text-[var(--color-muted)] m-0"
      :style="getFieldStyle('subheadline', '--font-heading')"
      @select-field="handleSelect"
      @update="handleUpdate"
    />
    <EditableText
      v-if="paragraph"
      tag="div"
      :value="paragraph"
      field-key="paragraph"
      :editable="editable"
      :active-field="activeField"
      :hidden-fields="hiddenFields"
      :html="true"
      class="text-[length:var(--text-base)] text-[var(--color-muted)] m-0"
      :style="getFieldStyle('paragraph', '--font-body')"
      @select-field="handleSelect"
      @update="handleUpdate"
    />
  </div>
</template>
