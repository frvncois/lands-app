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
  <div class="flex p-1 bg-secondary rounded-md">
    <button
      v-for="option in options"
      :key="option.value"
      class="flex-1 px-2 py-1 text-xs font-medium rounded transition-colors"
      :class="
        modelValue === option.value
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      "
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
