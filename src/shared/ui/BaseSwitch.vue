<script setup lang="ts">
defineProps<{
  options: { label: string; value: string }[]
  modelValue: string
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex gap-1 p-0.5 bg-gray-100 rounded-lg text-xs">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="px-3 py-1 rounded-md transition-colors"
      :class="modelValue === opt.value ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'"
      @click="$emit('update:modelValue', opt.value)"
    >{{ opt.label }}</button>
  </div>
</template>
