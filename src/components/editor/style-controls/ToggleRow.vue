<script setup lang="ts">
import Toggle from '@/components/ui/Toggle.vue'

defineProps<{
  label: string
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <label class="text-xs text-muted-foreground whitespace-nowrap">{{ label }}</label>
    <Toggle
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>
