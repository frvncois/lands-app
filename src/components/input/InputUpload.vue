<template>
  <li>
    <label>{{ label }}</label>
    <div class="upload" @click="triggerFileInput">
      <UploadIcon />
      <p>Add an image</p>
      <input 
        ref="fileInput"
        type="file" 
        accept="image/*" 
        @change="handleFileChange" 
      />
    </div>
    <div class="preview" v-if="displayImage">
      <img :src="displayImage" alt="Preview"/>
      <button v-if="props.modelValue" @click="clearImage" type="button">×</button>
    </div>
  </li>
</template>

<script setup>
import UploadIcon from '@/assets/icons/UploadIcon.vue'
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String
})

const emit = defineEmits(['update:modelValue'])
const previewUrl = ref('')
const fileInput = ref(null)

// Display either the existing base64 image or new preview
const displayImage = computed(() => {
  return previewUrl.value || props.modelValue
})

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  
  // Clean up previous object URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  
  // Create object URL for immediate preview
  previewUrl.value = URL.createObjectURL(file)
  
  // Convert to base64 for storage
  const reader = new FileReader()
  reader.onload = () => {
    emit('update:modelValue', reader.result)
    // Clear preview URL since we now have base64
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  emit('update:modelValue', '')
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

// Clean up object URL when component unmounts
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped>
li {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: stretch;
  position: relative;
  z-index: 1;
}

.upload {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--border);
  background-color: var(--bg);
  border-radius: var(--radius-md);
  transition: all var(--transition-smooth);
  > p {
    font-family: 'mono';
    text-transform: uppercase;
    font-size: var(--font-sm);
    color: var(--details);
  }
  > svg {
    height: 1.5em;
    width: 1.5em;
    color: var(--details);
  }
}

.upload:hover {
  background: var(--card);
  border-color: var(--focus);
}

.upload input {
  display: none;
}

.preview {
  position: absolute;
  border-radius: var(--radius-md);
  overflow: hidden;
  top: auto;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  flex-grow: 1;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--border);
  backdrop-filter: blur(1em);
}

.preview > img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

button {
  padding: var(--space-sm) var(--space-rg);
  color: var(--remove-txt);
  background: var(--remove);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: absolute;
  right: var(--space-sm);
  top: var(--space-sm);
}
</style>