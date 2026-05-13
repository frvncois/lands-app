<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  modelValue?: string
  options: { value: string; label: string }[]
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

defineEmits<{ 'update:modelValue': [value: string] }>()

const sizes = {
  sm: { label: 'text-xs', select: 'text-xs rounded-lg p-1.5' },
  md: { label: 'text-xs', select: 'text-sm rounded-xl p-2' },
  lg: { label: 'text-sm', select: 'text-base rounded-xl p-3' },
}
</script>

<template>
  <div class="flex flex-col gap-2 flex-1">
    <span class="text-gray-700 shrink-0" :class="sizes[size].label">{{ label }}</span>
    <select
      class="text-gray-900 bg-transparent border border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 outline-none transition-colors appearance-none cursor-pointer"
      :class="sizes[size].select"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>
