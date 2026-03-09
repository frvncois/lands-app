<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const sizes = {
  sm: { avatar: 'h-9 w-9 text-sm', initials: 'text-xs' },
  md: { avatar: 'h-14 w-14 text-base', initials: 'text-sm' },
  lg: { avatar: 'h-20 w-20 text-lg', initials: 'text-base' },
}

const fileInput = ref<HTMLInputElement | null>(null)

function triggerUpload() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  emit('update:modelValue', url)
}

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const initials = props.alt
  ? props.alt.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  : '?'
</script>

<template>
  <div class="flex items-center gap-4">
    <div class="rounded-full overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center" :class="sizes[size].avatar">
      <img v-if="modelValue" :src="modelValue" :alt="alt" class="h-full w-full object-cover" />
      <span v-else class="font-medium text-gray-400" :class="sizes[size].initials">{{ initials }}</span>
    </div>
    <div>
      <BaseButton variant="outline" size="sm" @click="triggerUpload">Change avatar</BaseButton>
      <p class="text-xs text-gray-400 mt-1">JPG, PNG. Max 2MB.</p>
    </div>
    <input ref="fileInput" type="file" accept="image/jpeg,image/png" class="hidden" @change="onFileChange" />
  </div>
</template>
