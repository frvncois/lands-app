<template>
  <li class="upload">
    <label v-if="label">{{ label }}</label>
    
    <div 
      v-if="!hasImage && !isProcessing"
      class="area"
      :class="{ dragging: isDragging }"
      @click="triggerFileInput"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <p>{{ isDragging ? 'Drop image here' : 'Click to upload image' }}</p>
    </div>
    
    <!-- Processing state -->
    <div v-if="isProcessing" class="processing">
      <div class="loading">Processing image...</div>
    </div>
    
    <!-- Preview when image exists -->
    <div v-if="hasImage && !isProcessing" class="preview" @click="triggerFileInput">
      <img :src="displayUrl" alt="Preview"/>
      <button @click="clearImage" type="button" title="Remove image">×</button>
    </div>
    
    <!-- Error state -->
    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileChange"
      style="display: none;"
    />
  </li>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { apiService } from '@/services/api.js'
import { supabase } from '@/services/supabase.js'
import imageCompression from 'browser-image-compression'

// Use defineModel for proper Vue 3 two-way binding
const modelValue = defineModel()

const props = defineProps({
  label: String,
  field: String, // field name (img, cover_image, etc.)
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  }
})

// Try to get context from parent (project ID, item info)
const projectId = inject('projectId', null)

// If no projectId from inject, try to get it from props or other sources
// This is a fallback - parent components should provide projectId via inject
const getProjectId = () => {
  if (projectId) return projectId
  
  // Try to get from window/global state as last resort
  // This is not ideal but needed for components that don't provide inject
  if (window.__CURRENT_PROJECT_ID__) return window.__CURRENT_PROJECT_ID__
  
  console.warn('⚠️ InputUpload: No projectId available. Parent component should provide it via inject.')
  return null
}

const fileInput = ref(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const error = ref('')
const displayUrl = ref('')

const hasImage = computed(() => {
  return !!modelValue.value && modelValue.value.length > 0
})

// Watch for changes to modelValue to update display URL
watch(() => modelValue.value, async (newValue) => {
  if (newValue && newValue.startsWith('/projects/')) {
    // This is a storage path, generate public URL directly (no edge function needed)
    try {
      const storagePath = newValue.replace('/projects/', '')
      const { data } = supabase.storage
        .from('projects')
        .getPublicUrl(storagePath)
      
      displayUrl.value = data.publicUrl
      console.log('✅ Generated public URL directly:', data.publicUrl)
    } catch (error) {
      console.error('❌ Failed to generate public URL:', error)
      displayUrl.value = newValue
    }
  } else if (newValue) {
    // Base64 or other URL
    displayUrl.value = newValue
  } else {
    displayUrl.value = ''
  }
}, { immediate: true })

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // Only accept image formats
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file only'
    return
  }

  if (file.size > props.maxSize) {
    error.value = `Image must be smaller than ${Math.round(props.maxSize / 1024 / 1024)}MB`
    return
  }

  error.value = ''
  isProcessing.value = true

  try {
    // Compress and resize image to WebP format, max 1920x1080
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 2, // Allow up to 2MB for better quality
      maxWidthOrHeight: 1920, // Max dimension 1920x1080
      useWebWorker: false, // Disable web worker to avoid CSP issues
      fileType: 'image/webp', // Convert to WebP
      initialQuality: 0.8
    })

    console.log(`✅ Image compressed: ${file.size / 1024 / 1024}MB → ${compressedFile.size / 1024 / 1024}MB`)

    // Upload via Edge function
    await uploadImageViaEdgeFunction(compressedFile)
    
  } catch (err) {
    error.value = 'Upload failed'
    console.error('❌ Upload error:', err)
  } finally {
    isProcessing.value = false
    e.target.value = ''
  }
}

async function uploadImageViaEdgeFunction(file) {
  const currentProjectId = getProjectId()
  
  if (!currentProjectId) {
    throw new Error('Project ID is required for upload. Parent component must provide projectId via inject.')
  }

  console.log('🔍 Debug - Project ID being sent:', currentProjectId)
  console.log('🔍 Debug - Project ID type:', typeof currentProjectId)

  // Convert file to base64 for transmission
  const base64Data = await fileToBase64(file)
  
  const uploadData = {
    projectId: currentProjectId,
    fieldName: props.field || 'img',
    imageData: base64Data,
    fileName: `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`
  }

  console.log('🔍 Debug - Upload data being sent:', {
    projectId: uploadData.projectId,
    fieldName: uploadData.fieldName,
    fileName: uploadData.fileName,
    imageDataLength: uploadData.imageData.length
  })
  
  // Call edge function to handle upload
  const response = await apiService.uploadImage(uploadData)

  if (!response.success) {
    throw new Error(response.error || 'Upload failed')
  }

  console.log('✅ Image uploaded to temp folder via Edge function:', response.data.path)

  // Store the temp path in modelValue for later processing
  modelValue.value = response.data.path
  
  // Generate public URL directly (no edge function needed)
  const storagePath = response.data.path.replace('/projects/', '')
  const { data: urlData } = supabase.storage
    .from('projects')
    .getPublicUrl(storagePath)
  
  displayUrl.value = urlData.publicUrl
  console.log('✅ Generated display URL directly:', urlData.publicUrl)
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

async function clearImage(event) {
  event.stopPropagation()
  
  // Delete via Edge function if it exists
  if (modelValue.value && modelValue.value.startsWith('/projects/')) {
    try {
      await apiService.deleteImage(modelValue.value)
      console.log('🗑️ Image deleted via Edge function:', modelValue.value)
    } catch (err) {
      console.error('❌ Failed to delete image:', err)
    }
  }
  
  modelValue.value = ''
  displayUrl.value = ''
  error.value = ''
}

// Drag and drop handlers
function handleDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(event) {
  event.preventDefault()
  isDragging.value = false
}

function handleDrop(event) {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    handleFileChange({ target: { files, value: '' } })
  }
}
</script>
<style scoped>
li.upload {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  > .area {
    cursor: pointer;
    border: 1px dashed var(--border);
    border-radius: var(--radius-md);
    background: var(--input);
    aspect-ratio: 16/9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-smooth);

    > p {
      font-family: 'mono';
      font-size: var(--font-sm);
      text-transform: uppercase;
      color: var(--details);
    transition: all var(--transition-smooth);
    }
    &:hover {
      border: 1px solid var(--focus);
      > p {
        color: var(--light);
      }
    }
  }
  > .preview {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    aspect-ratio: 16/9;
    position: relative;
    overflow: hidden;
    > button {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: absolute;
      z-index: 2;
      right: var(--space-rg);
      top: var(--space-rg);
      height: var(--space-md);
      width: var(--space-md);
      background: var(--remove-border);
    }
    > img {
      position: absolute;
      height: 100%;
      width: 100%;
      object-fit: cover;
      z-index: 1;
    }
  }
}
</style>