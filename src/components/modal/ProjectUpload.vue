<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/stores/toast'

const toast = useToast()

const props = defineProps<{
  open: boolean
  projectId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'uploaded': [url: string]
}>()

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
]
const MAX_SIZE = 4 * 1024 * 1024 // 4MB

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref<string | null>(null)

const fileSize = computed(() => {
  if (!selectedFile.value) return ''
  const bytes = selectedFile.value.size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
})

// Reset state when modal opens/closes
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetState()
  }
})

function resetState() {
  selectedFile.value = null
  previewUrl.value = null
  isUploading.value = false
  uploadProgress.value = 0
  error.value = null
  isDragging.value = false
}

function close() {
  emit('update:open', false)
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function validateAndSetFile(file: File) {
  error.value = null

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    error.value = 'Invalid file type. Please upload an image (JPEG, PNG, WebP, GIF, SVG, or ICO).'
    return
  }

  // Check file size
  if (file.size > MAX_SIZE) {
    error.value = 'File is too large. Maximum size is 4MB.'
    return
  }

  selectedFile.value = file

  // Create preview URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = URL.createObjectURL(file)
}

function removeFile() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  selectedFile.value = null
  previewUrl.value = null
  error.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function uploadFile() {
  console.log('uploadFile called', { selectedFile: selectedFile.value, projectId: props.projectId })

  if (!selectedFile.value || !props.projectId) {
    console.log('Missing file or projectId', { file: !!selectedFile.value, projectId: props.projectId })
    return
  }

  isUploading.value = true
  uploadProgress.value = 0
  error.value = null

  try {
    // Generate unique filename
    const timestamp = Date.now()
    const extension = selectedFile.value.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
    const filePath = `${props.projectId}/${fileName}`

    console.log('Uploading to path:', filePath)

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, selectedFile.value, {
        cacheControl: '3600',
        upsert: false,
      })

    console.log('Upload result:', { data, error: uploadError })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path)

    console.log('Public URL:', urlData.publicUrl)

    uploadProgress.value = 100

    // Emit the uploaded URL
    emit('uploaded', urlData.publicUrl)
    toast.success('Image uploaded')
    close()
  } catch (e) {
    console.error('Upload failed:', e)
    error.value = e instanceof Error ? e.message : 'Failed to upload image. Please try again.'
    toast.error('Upload failed', error.value)
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50"
        @click="close"
      ></div>

      <!-- Modal -->
      <div class="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-lg p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-foreground">Upload Image</h2>
          <button
            class="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            @click="close"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/x-icon"
          class="hidden"
          @change="handleFileSelect"
        />

        <!-- Drop zone / Preview -->
        <div
          v-if="!selectedFile"
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
          :class="isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'"
          @click="triggerFileInput"
          @drop.prevent="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-foreground mb-1">
            Drop your image here, or <span class="text-primary">browse</span>
          </p>
          <p class="text-xs text-muted-foreground">
            JPEG, PNG, WebP, GIF, SVG, ICO - Max 4MB
          </p>
        </div>

        <!-- File preview -->
        <div v-else class="space-y-4">
          <div class="relative rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
            <img
              v-if="previewUrl && !selectedFile.type.includes('svg')"
              :src="previewUrl"
              :alt="selectedFile.name"
              class="max-w-full max-h-full object-contain"
            />
            <div v-else class="text-center p-4">
              <svg class="w-12 h-12 mx-auto text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm text-muted-foreground">{{ selectedFile.name }}</p>
            </div>
            <!-- Remove button -->
            <button
              class="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              @click="removeFile"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- File info -->
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground truncate max-w-[200px]">{{ selectedFile.name }}</span>
            <span class="text-muted-foreground">{{ fileSize }}</span>
          </div>

          <!-- Upload progress -->
          <div v-if="isUploading" class="space-y-2">
            <div class="h-2 bg-muted rounded-full overflow-hidden">
              <div
                class="h-full bg-primary transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
            <p class="text-xs text-center text-muted-foreground">Uploading...</p>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="mt-4 flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 mt-6">
          <button
            class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            :disabled="isUploading"
            @click="close"
          >
            Cancel
          </button>
          <button
            class="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!selectedFile || isUploading"
            @click="uploadFile"
          >
            {{ isUploading ? 'Uploading...' : 'Upload' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
