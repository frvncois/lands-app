<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { FormField } from '@/types/editor'
import { formFieldLabels } from '@/lib/editor-utils'

const props = defineProps<{
  field: FormField
  blockId: string
}>()

const editorStore = useEditorStore()

const isSelected = computed(() =>
  editorStore.selectedBlockId === props.blockId &&
  editorStore.selectedItemId === props.field.id
)

function handleClick(event: MouseEvent) {
  event.stopPropagation()
  editorStore.selectBlock(props.blockId, props.field.id)
}
</script>

<template>
  <div
    class="relative"
    :class="{ 'ring-2 ring-primary ring-offset-2': isSelected }"
    @click="handleClick"
  >
    <!-- Label -->
    <label class="block text-sm font-medium text-foreground mb-1.5">
      {{ field.label }}
      <span v-if="field.required" class="text-destructive">*</span>
    </label>

    <!-- Text input -->
    <input
      v-if="field.type === 'text'"
      type="text"
      :placeholder="field.placeholder"
      :required="field.required"
      class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />

    <!-- Email input -->
    <input
      v-else-if="field.type === 'email'"
      type="email"
      :placeholder="field.placeholder"
      :required="field.required"
      class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />

    <!-- Phone input -->
    <input
      v-else-if="field.type === 'phone'"
      type="tel"
      :placeholder="field.placeholder"
      :required="field.required"
      class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />

    <!-- Number input -->
    <input
      v-else-if="field.type === 'number'"
      type="number"
      :placeholder="field.placeholder"
      :required="field.required"
      class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />

    <!-- Date input -->
    <input
      v-else-if="field.type === 'date'"
      type="date"
      :required="field.required"
      class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />

    <!-- Textarea -->
    <textarea
      v-else-if="field.type === 'textarea'"
      :placeholder="field.placeholder"
      :required="field.required"
      rows="4"
      class="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
    ></textarea>

    <!-- Select -->
    <select
      v-else-if="field.type === 'select'"
      :required="field.required"
      class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="" disabled selected>{{ field.placeholder || 'Select an option' }}</option>
      <option v-for="(option, idx) in field.options" :key="idx" :value="option">
        {{ option }}
      </option>
    </select>

    <!-- Radio buttons -->
    <div v-else-if="field.type === 'radio'" class="space-y-2">
      <label
        v-for="(option, idx) in field.options"
        :key="idx"
        class="flex items-center gap-2 cursor-pointer"
      >
        <input
          type="radio"
          :name="`radio-${field.id}`"
          :value="option"
          :required="field.required"
          class="w-4 h-4 border-border text-primary focus:ring-ring"
        />
        <span class="text-sm text-foreground">{{ option }}</span>
      </label>
    </div>

    <!-- Checkboxes -->
    <div v-else-if="field.type === 'checkbox'" class="space-y-2">
      <label
        v-for="(option, idx) in field.options"
        :key="idx"
        class="flex items-center gap-2 cursor-pointer"
      >
        <input
          type="checkbox"
          :value="option"
          class="w-4 h-4 rounded border-border text-primary focus:ring-ring"
        />
        <span class="text-sm text-foreground">{{ option }}</span>
      </label>
    </div>

    <!-- File input -->
    <input
      v-else-if="field.type === 'file'"
      type="file"
      :required="field.required"
      class="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
    />

    <!-- Fallback for unknown types -->
    <div v-else class="p-3 bg-muted rounded-md text-sm text-muted-foreground">
      {{ formFieldLabels[field.type] || field.type }} field
    </div>
  </div>
</template>
