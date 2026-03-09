<script setup lang="ts">
import { ref } from 'vue'
import BaseColorPicker from './BaseColorPicker.vue'

const props = withDefaults(defineProps<{
  label: string
  modelValue?: string
}>(), {
  modelValue: '#000000',
})

const emit = defineEmits<{ 'update:modelValue': [color: string] }>()

const open = ref(false)

function select(color: string) {
  emit('update:modelValue', color)
  open.value = false
}
</script>

<template>
  <div class="relative flex items-center justify-between py-1.5">
    <span class="text-sm text-gray-700">{{ label }}</span>
    <button
      class="h-6 w-6 rounded-md border border-black/10 hover:scale-110 transition-transform"
      :style="{ backgroundColor: modelValue }"
      @click="open = !open"
    />
    <BaseColorPicker v-if="open" @select="select" />
    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
  </div>
</template>
