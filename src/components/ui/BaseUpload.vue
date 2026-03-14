<script setup lang="ts">
import { ref, computed } from 'vue'
import { XMarkIcon, ArrowUpTrayIcon, PhotoIcon, DocumentIcon } from '@heroicons/vue/24/outline'
import { storageService } from '@/services/storage.service'
import { useToast } from '@/composables/useToast'

const { addToast } = useToast()

const props = withDefaults(defineProps<{
  label?: string
  modelValue?: string
  type?: 'image' | 'file'
  size?: 'sm' | 'md' | 'lg'
}>(), {
  type: 'image',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const sizes = {
  sm: { label: 'text-xs', text: 'text-xs', preview: 'h-24' },
  md: { label: 'text-xs', text: 'text-sm', preview: 'h-32' },
  lg: { label: 'text-sm', text: 'text-base', preview: 'h-40' },
}

const accept = computed(() => props.type === 'image' ? 'image/*' : '*')
const isImage = computed(() => props.type === 'image')

async function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  isUploading.value = true
  try {
    const url = await storageService.upload(file)
    emit('update:modelValue', url)
  } catch {
    addToast('Upload failed — please try again', 'error')
  } finally {
    isUploading.value = false
    if (inputRef.value) inputRef.value.value = ''
  }
}

async function remove() {
  if (props.modelValue) {
    await storageService.remove(props.modelValue)
  }
  emit('update:modelValue', '')
  if (inputRef.value) inputRef.value.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-2 flex-1">
    <span v-if="label" class="text-xs font-medium text-gray-500" :class="sizes[size].label">{{ label }}</span>

    <!-- Preview (image type with value) -->
    <div v-if="isImage && modelValue" class="relative rounded-xl overflow-hidden border border-gray-200 group" :class="sizes[size].preview">
      <img :src="modelValue" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <button
        type="button"
        class="absolute top-2 right-2 p-1 rounded-lg bg-white shadow text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        @click="remove"
      >
        <XMarkIcon class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- Drop zone / trigger (no value) -->
    <button
      v-else
      type="button"
      class="flex flex-col items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[sizes[size].preview, sizes[size].text]"
      :disabled="isUploading"
      @click="inputRef?.click()"
    >
      <component :is="isImage ? PhotoIcon : DocumentIcon" class="h-5 w-5" :class="isUploading ? 'animate-pulse' : ''" />
      <span class="text-xs">{{ isUploading ? 'Uploading…' : `Click to upload ${type}` }}</span>
    </button>

    <!-- File row (file type with value) -->
    <div v-if="!isImage && modelValue" class="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl">
      <DocumentIcon class="h-4 w-4 text-gray-400 shrink-0" />
      <span class="flex-1 text-xs text-gray-700 truncate">{{ modelValue }}</span>
      <button type="button" class="text-gray-400 hover:text-red-500 transition-colors" @click="remove">
        <XMarkIcon class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- Hidden input -->
    <input ref="inputRef" type="file" :accept="accept" class="hidden" @change="onFileChange" />

    <!-- Upload button (when image has value, allow replacing) -->
    <button
      v-if="isImage && modelValue"
      type="button"
      class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
      :disabled="isUploading"
      @click="inputRef?.click()"
    >
      <ArrowUpTrayIcon class="h-3.5 w-3.5" />
      {{ isUploading ? 'Uploading…' : 'Replace image' }}
    </button>
  </div>
</template>
