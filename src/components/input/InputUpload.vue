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