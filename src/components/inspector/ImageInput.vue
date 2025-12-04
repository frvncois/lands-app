<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import ProjectUpload from '@/components/modal/ProjectUpload.vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const route = useRoute()
const showUploadModal = ref(false)

const projectId = computed(() => route.params.projectId as string)

const hasImage = computed(() => !!props.modelValue)

function handleUpload() {
  showUploadModal.value = true
}

function handleUploaded(url: string) {
  emit('update:modelValue', url)
}

function handleRemove() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="space-y-2">
    <!-- Image preview -->
    <div
      v-if="hasImage"
      class="relative group rounded-md overflow-hidden border border-border"
    >
      <img
        :src="modelValue"
        alt="Uploaded image"
        class="w-full h-24 object-cover"
      />
      <!-- Overlay actions -->
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          class="w-8 h-8 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors"
          title="Replace image"
          @click="handleUpload"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          type="button"
          class="w-8 h-8 bg-destructive/90 backdrop-blur-sm border border-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive transition-colors"
          title="Remove image"
          @click="handleRemove"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Upload button (when no image) -->
    <button
      v-else
      type="button"
      class="w-full h-24 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
      @click="handleUpload"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="text-xs">{{ placeholder || 'Click to upload' }}</span>
    </button>

    <!-- Upload modal -->
    <ProjectUpload
      v-model:open="showUploadModal"
      :project-id="projectId"
      @uploaded="handleUploaded"
    />
  </div>
</template>
