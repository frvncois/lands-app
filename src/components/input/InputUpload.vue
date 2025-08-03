<script setup>
import UploadIcon from '@/assets/icons/UploadIcon.vue'
import { ref, computed, onUnmounted, watch } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String
})

const emit = defineEmits(['update:modelValue'])

const previewUrl = ref('')
const fileInput = ref(null)
const isDragging = ref(false)
const isProcessing = ref(false)

// Display either the existing base64 image or new preview
const displayImage = computed(() => {
  return previewUrl.value || props.modelValue
})

// Debug logging
watch(() => props.modelValue, (newValue, oldValue) => {
  console.log('📸 InputUpload modelValue changed:', {
    old: oldValue ? 'has value' : 'empty',
    new: newValue ? 'has value' : 'empty',
    preview: previewUrl.value ? 'has preview' : 'no preview'
  })
}, { immediate: true })

function triggerFileInput() {
  console.log('🔍 Triggering file input...')
  if (fileInput.value) {
    fileInput.value.click()
  } else {
    console.error('❌ File input ref not found')
  }
}

function handleFileChange(e) {
  console.log('📁 File input changed:', e.target.files)
  const file = e.target.files[0]
  if (!file) {
    console.log('❌ No file selected')
    return
  }

  console.log('📄 File details:', {
    name: file.name,
    size: file.size,
    type: file.type
  })

  isProcessing.value = true

  // Clean up previous object URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  // Create object URL for immediate preview
  previewUrl.value = URL.createObjectURL(file)
  console.log('🖼️ Created preview URL:', previewUrl.value)

  // Convert to base64 for storage
  const reader = new FileReader()
  reader.onload = () => {
    console.log('✅ File converted to base64, length:', reader.result.length)
    emit('update:modelValue', reader.result)
    // Clear preview URL since we now have base64
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
    isProcessing.value = false
  }
  reader.onerror = () => {
    console.error('❌ FileReader error:', reader.error)
    isProcessing.value = false
  }
  reader.readAsDataURL(file)

  // Clear the input so the same file can be selected again
  e.target.value = ''
}

function clearImage(event) {
  console.log('🗑️ Clearing image...')
  event.stopPropagation() // Prevent triggering file input
  emit('update:modelValue', '')
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
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
    const file = files[0]
    if (file.type.startsWith('image/')) {
      // Simulate file input event
      const fakeEvent = {
        target: {
          files: [file],
          value: ''
        }
      }
      handleFileChange(fakeEvent)
    } else {
      console.warn('⚠️ File is not an image:', file.type)
    }
  }
}

// Clean up object URL when component unmounts
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <li class="upload-container">
    <label>{{ label }}</label>
    
    <!-- Upload area - only show when no image -->
    <div 
      v-if="!displayImage" 
      class="upload" 
      :class="{ 
        dragging: isDragging,
        processing: isProcessing 
      }"
      @click="triggerFileInput"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <UploadIcon />
      <p v-if="!isProcessing">{{ isDragging ? 'Drop image here' : 'Add an image' }}</p>
      <p v-else>Processing...</p>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        style="display: none;"
      />
    </div>
    
    <!-- Preview area - show when image exists -->
    <div 
      v-if="displayImage" 
      class="preview" 
      @click="triggerFileInput"
    >
      <img :src="displayImage" alt="Preview"/>
      <button @click="clearImage" type="button" title="Remove image">×</button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        style="display: none;"
      />
    </div>
    
  </li>
</template>

<style scoped>
.upload-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  position: relative;
}

.upload {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 9;
  border: 1px dashed var(--border);
  background-color: var(--bg);
  border-radius: var(--radius-md);
  transition: all var(--transition-smooth);
  padding: var(--space-lg);
  min-height: 120px;
}

.upload:hover,
.upload.dragging {
  background: var(--card);
  border-color: var(--focus);
  border-style: solid;
}

.upload.processing {
  opacity: 0.7;
  cursor: wait;
}

.upload p {
  font-family: 'mono';
  text-transform: uppercase;
  font-size: var(--font-sm);
  color: var(--details);
  margin: 0;
  text-align: center;
}

.upload svg {
  height: 2em;
  width: 2em;
  color: var(--details);
}

.preview {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all var(--transition-smooth);
  min-height: 120px;
}

.preview:hover {
  border-color: var(--focus);
  box-shadow: var(--shadow-md);
}

.preview img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  display: block;
}

.preview button {
  padding: var(--space-xs) var(--space-sm);
  color: white;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  position: absolute;
  right: var(--space-sm);
  top: var(--space-sm);
  font-size: var(--font-lg);
  line-height: 1;
  transition: all var(--transition-smooth);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview button:hover {
  background: rgba(255, 0, 0, 0.8);
  transform: scale(1.1);
}
</style>