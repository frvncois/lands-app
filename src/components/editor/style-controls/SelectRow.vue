<script setup lang="ts">
import Select from '@/components/ui/Select.vue'

defineProps<{
  label: string
  modelValue: string | number
  options: { value: string; label: string }[]
}>()

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <div>
    <label class="block text-xs text-muted-foreground mb-1.5">{{ label }}</label>
    <Select
      :model-value="modelValue"
      :options="options"
      size="sm"
      variant="filled"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>
