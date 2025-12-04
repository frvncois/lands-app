<script setup lang="ts">
defineProps<{
  options: readonly { value: string; label: string }[]
  modelValue: string | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <select
    class="w-full px-2 py-1.5 text-sm bg-secondary border border-border rounded-md text-foreground"
    :value="modelValue"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>
