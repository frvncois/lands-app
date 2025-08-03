<template>
  <li class="upload-container">
    <label v-if="label">{{ label }}</label>
    
    <!-- Upload area when no image -->
    <div 
      v-if="!hasImage && !isProcessing"
      class="upload"
      :class="{ dragging: isDragging }"
      @click="triggerFileInput"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="upload-icon">📁</div>
      <p>{{ isDragging ? 'Drop image here' : 'Click to upload image' }}</p>
    </div>
    
    <!-- Processing state -->
    <div v-if="isProcessing" class="upload processing">
      <div class="loading">Processing...</div>
    </div>
    
    <!-- Preview when image exists -->
    <div v-if="hasImage && !isProcessing" class="preview" @click="triggerFileInput">
      <img :src="modelValue" alt="Preview"/>
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
import { imageStorage } from '@/utils/imageStorage.js'

// Use defineModel for proper Vue 3 two-way binding
const modelValue = defineModel()

const props = defineProps({
  label: String,
  field: String, // field name (img, coverImage, etc.)
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  }
})

// Try to get context from parent (project ID, item info)
const projectId = inject('projectId', null)
const itemType = inject('itemType', 'unknown')
const itemId = inject('itemId', Date.now())

const fileInput = ref(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const error = ref('')
const imageId = ref(null)

const hasImage = computed(() => {
  return !!modelValue.value && modelValue.value.length > 0
})

// Watch for external image ID and load from IndexedDB
watch(() => modelValue.value, async (newValue) => {
  if (newValue && newValue.startsWith('img_')) {
    // This is an image ID, load from IndexedDB
    try {
      const imageData = await imageStorage.getImage(newValue)
      if (imageData) {
        // Update with actual base64 data for display
        modelValue.value = imageData
      }
    } catch (error) {
      console.error('❌ Failed to load image from IndexedDB:', error)
    }
  }
}, { immediate: true })

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // Basic validation
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file'
    return
  }

  if (file.size > props.maxSize) {
    error.value = `Image must be smaller than ${Math.round(props.maxSize / 1024 / 1024)}MB`
    return
  }

  error.value = ''
  isProcessing.value = true

  try {
    // Convert to base64
    const base64Data = await fileToBase64(file)
    
    // Save to IndexedDB and get image ID
    if (projectId) {
      const savedImageId = await imageStorage.saveImage(
        projectId,
        itemType,
        itemId,
        props.field || 'img',
        base64Data
      )
      
      imageId.value = savedImageId
      console.log('✅ Image saved to IndexedDB with ID:', savedImageId)
    }
    
    // Update model with base64 for immediate display
    modelValue.value = base64Data
    
  } catch (err) {
    error.value = 'Upload failed'
    console.error('❌ Upload error:', err)
  } finally {
    isProcessing.value = false
    e.target.value = ''
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function clearImage(event) {
  event.stopPropagation()
  
  // Delete from IndexedDB if we have an image ID
  if (imageId.value) {
    imageStorage.deleteImage(imageId.value)
      .then(() => console.log('🗑️ Image deleted from IndexedDB'))
      .catch(err => console.error('❌ Failed to delete image:', err))
  }
  
  modelValue.value = ''
  imageId.value = null
  error.value = ''
}

// Drag and drop handlers (same as before)
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
.upload-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.upload, .preview {
  cursor: pointer;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: var(--input-bg);
}

.upload:hover, .upload.dragging {
  border-color: var(--primary);
  background: var(--primary-light);
}

.upload.processing {
  border-style: solid;
  opacity: 0.7;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: var(--space-sm);
}

.upload p {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  text-align: center;
  margin: 0;
}

.preview {
  position: relative;
  border-style: solid;
  border-color: var(--success);
  padding: 0;
}

.preview img {
  width: 100%;
  height: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.preview button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.preview button:hover {
  background: #ff4444;
  color: white;
}

.error {
  color: var(--error);
  font-size: var(--font-sm);
  text-align: center;
}

.loading {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

label {
  font-weight: 500;
  color: var(--text);
  font-size: var(--font-sm);
}
</style>