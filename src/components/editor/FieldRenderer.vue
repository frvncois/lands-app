<script setup lang="ts">
/**
 * FIELD RENDERER
 *
 * Renders form fields based on field schema type.
 * Supports: text, richText, image, url, boolean, select, repeater
 *
 * NOTE: Labels are rendered by the parent component (StyleInspector).
 * This component only renders the input controls.
 */

import { computed } from 'vue'
import type { FieldSchema } from '@/types/sections'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Select from '@/components/ui/Select.vue'
import Toggle from '@/components/ui/Toggle.vue'
import Icon from '@/components/ui/Icon.vue'

/**
 * Get a nested value from an object using a dotted path
 * e.g. getNestedValue(item, 'image.src') returns item.image.src
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

/**
 * Set a nested value in an object using a dotted path
 * e.g. setNestedValue(item, 'image.src', 'url') sets item.image.src = 'url'
 * Returns a new object (immutable)
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const dotIndex = path.indexOf('.')
  if (dotIndex === -1) {
    // No dot - simple key
    return { ...obj, [path]: value }
  }

  const first = path.slice(0, dotIndex)
  const rest = path.slice(dotIndex + 1)
  const nested = (obj[first] as Record<string, unknown>) || {}
  return {
    ...obj,
    [first]: setNestedValue(nested, rest, value)
  }
}

const props = defineProps<{
  field: FieldSchema
  value: unknown
}>()

const emit = defineEmits<{
  update: [value: unknown]
}>()

// Type guards
const isTextField = computed(() => props.field.type === 'text')
const isRichTextField = computed(() => props.field.type === 'richText')
const isImageField = computed(() => props.field.type === 'image')
const isUrlField = computed(() => props.field.type === 'url')
const isBooleanField = computed(() => props.field.type === 'boolean')
const isSelectField = computed(() => props.field.type === 'select')
const isRepeaterField = computed(() => props.field.type === 'repeater')

// Cast value to string for text inputs
const stringValue = computed(() => (typeof props.value === 'string' ? props.value : ''))

// Select options formatted for Select component
const selectOptions = computed(() => {
  if (props.field.type !== 'select') return []
  return props.field.options.map(opt => ({
    value: opt.value,
    label: opt.label,
  }))
})

// Repeater helpers
const repeaterItems = computed(() => {
  if (!isRepeaterField.value) return []
  return Array.isArray(props.value) ? props.value : []
})

function addRepeaterItem() {
  if (props.field.type !== 'repeater') return

  // Build new item with proper nested structure for dotted paths
  let newItem: Record<string, unknown> = {}
  for (const subField of props.field.itemSchema) {
    newItem = setNestedValue(newItem, subField.key, '')
  }

  emit('update', [...repeaterItems.value, newItem])
}

function removeRepeaterItem(index: number) {
  const newItems = [...repeaterItems.value]
  newItems.splice(index, 1)
  emit('update', newItems)
}

function updateRepeaterItem(index: number, key: string, value: unknown) {
  const newItems = [...repeaterItems.value]
  // Use setNestedValue to properly handle dotted paths like 'image.src'
  newItems[index] = setNestedValue(newItems[index] as Record<string, unknown>, key, value)
  emit('update', newItems)
}

function getItemValue(item: unknown, key: string): string {
  const value = getNestedValue(item as Record<string, unknown>, key)
  return typeof value === 'string' ? value : ''
}
</script>

<template>
  <!-- Text Field -->
  <Input
    v-if="isTextField"
    :model-value="stringValue"
    :placeholder="field.placeholder"
    size="sm"
    variant="filled"
    @update:model-value="emit('update', $event)"
  />

  <!-- Rich Text Field -->
  <Textarea
    v-else-if="isRichTextField"
    :model-value="stringValue"
    :placeholder="field.placeholder"
    :rows="4"
    size="sm"
    variant="filled"
    resize="vertical"
    @update:model-value="emit('update', $event)"
  />

  <!-- Image Field -->
  <div v-else-if="isImageField" class="flex flex-col gap-2">
    <Input
      :model-value="stringValue"
      type="url"
      placeholder="Image URL"
      size="sm"
      variant="filled"
      @update:model-value="emit('update', $event)"
    />
    <div v-if="value" class="rounded-md overflow-hidden">
      <img :src="stringValue" alt="Preview" class="w-full h-auto max-h-36 object-cover" />
    </div>
  </div>

  <!-- URL Field -->
  <Input
    v-else-if="isUrlField"
    :model-value="stringValue"
    type="url"
    :placeholder="field.placeholder || 'https://'"
    size="sm"
    variant="filled"
    @update:model-value="emit('update', $event)"
  />

  <!-- Boolean Field -->
  <Toggle
    v-else-if="isBooleanField"
    :model-value="!!value"
    size="sm"
    @update:model-value="emit('update', $event)"
  />

  <!-- Select Field -->
  <Select
    v-else-if="isSelectField && field.type === 'select'"
    :model-value="stringValue"
    :options="selectOptions"
    size="sm"
    variant="filled"
    @update:model-value="emit('update', $event)"
  />

  <!-- Repeater Field -->
  <div v-else-if="isRepeaterField && field.type === 'repeater'" class="flex flex-col gap-2">
    <div
      v-for="(item, index) in repeaterItems"
      :key="index"
      class="flex gap-2 p-3 bg-muted rounded-md"
    >
      <div class="flex-1 flex flex-col gap-2">
        <div
          v-for="subField in field.itemSchema"
          :key="subField.key"
          class="flex flex-col gap-1"
        >
          <label class="text-xs text-muted-foreground">{{ subField.label }}</label>
          <Input
            :model-value="getItemValue(item, subField.key)"
            :placeholder="subField.placeholder"
            size="xs"
            variant="default"
            @update:model-value="updateRepeaterItem(index, subField.key, $event)"
          />
        </div>
      </div>
      <button
        class="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
        type="button"
        @click="removeRepeaterItem(index)"
      >
        <Icon name="app-delete" :size="12" />
      </button>
    </div>

    <button
      v-if="!field.maxItems || repeaterItems.length < field.maxItems"
      class="flex items-center justify-center gap-1.5 p-2.5 border border-dashed border-border rounded-md text-muted-foreground text-xs hover:border-primary hover:text-primary transition-colors"
      type="button"
      @click="addRepeaterItem"
    >
      <Icon name="circle-plus" :size="14" />
      Add {{ field.label }}
    </button>
  </div>
</template>
