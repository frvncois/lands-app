<script setup lang="ts">
defineProps<{
  options: readonly { value: string; label?: string; icon?: string }[]
  modelValue: string | undefined
  iconOnly?: boolean
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
      class="flex items-center justify-center transition-colors"
      :class="[
        iconOnly ? 'w-7 h-6 rounded' : 'flex-1 px-2 py-1 text-xs font-medium rounded',
        modelValue === option.value
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      ]"
      :title="option.label"
      @click="emit('update:modelValue', option.value)"
    >
      <i v-if="option.icon" :class="['lni', option.icon, iconOnly ? 'text-xs' : 'text-xs mr-1']"></i>
      <span v-if="!iconOnly && option.label">{{ option.label }}</span>
    </button>
  </div>
</template>
