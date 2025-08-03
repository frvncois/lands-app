<script setup>
import { onMounted, toRef, watch, ref } from 'vue'
import InputText from '@/components/input/InputText.vue'
import InputNormal from '@/components/input/InputNormal.vue'
import InputTextarea from '@/components/input/InputTextarea.vue'
import InputUpload from '@/components/input/InputUpload.vue'
import InputLinks from '@/components/input/InputLinks.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['button-config'])

// Create reactive reference to project
const projectRef = toRef(props, 'project')
const debugInfo = ref({})

// Initialize all required fields
function initializeFields() {
  if (!projectRef.value) return
  
  // Initialize contacts array if it doesn't exist
  if (!projectRef.value.contacts) {
    projectRef.value.contacts = []
  }
  
  // Initialize socialLinks array if it doesn't exist
  if (!projectRef.value.socialLinks) {
    projectRef.value.socialLinks = []
  }
  
  // Initialize coverImage if it doesn't exist
  if (!projectRef.value.coverImage) {
    projectRef.value.coverImage = ''
  }
  
  // Initialize location if it doesn't exist
  if (!projectRef.value.location) {
    projectRef.value.location = ''
  }
  
  // Initialize name if it doesn't exist
  if (!projectRef.value.name) {
    projectRef.value.name = ''
  }
  
  // Initialize description if it doesn't exist
  if (!projectRef.value.description) {
    projectRef.value.description = ''
  }
  
  // Update debug info
  debugInfo.value = {
    projectExists: !!projectRef.value,
    projectId: projectRef.value?.id,
    coverImageExists: 'coverImage' in projectRef.value,
    coverImageValue: projectRef.value.coverImage,
    coverImageType: typeof projectRef.value.coverImage,
    hasContacts: Array.isArray(projectRef.value.contacts),
    hasSocialLinks: Array.isArray(projectRef.value.socialLinks),
    hasLocation: typeof projectRef.value.location === 'string',
    hasName: typeof projectRef.value.name === 'string',
    hasDescription: typeof projectRef.value.description === 'string',
    timestamp: new Date().toISOString()
  }
  
  console.log('✅ ContentBasic fields initialized:', debugInfo.value)
}

// Watch for project changes
watch(() => projectRef.value, (newProject, oldProject) => {
  console.log('🔄 Project changed:', {
    oldId: oldProject?.id,
    newId: newProject?.id,
    oldCoverImage: oldProject?.coverImage,
    newCoverImage: newProject?.coverImage
  })
  if (newProject) {
    initializeFields()
  }
}, { deep: true, immediate: true })

// Watch specifically for coverImage changes
watch(() => projectRef.value?.coverImage, (newValue, oldValue) => {
  console.log('🖼️ Cover image changed:', {
    old: oldValue,
    new: newValue,
    type: typeof newValue
  })
}, { immediate: true })

// Setup button configuration
function setupButtonConfig() {
  emit('button-config', {
    title: '',
    action: null
  })
}

// Manual test function
function testCoverImageUpdate() {
  if (projectRef.value) {
    projectRef.value.coverImage = 'data:image/jpeg;base64,test123'
    console.log('🧪 Manual test - set coverImage to:', projectRef.value.coverImage)
    
    // Force debug update
    debugInfo.value = {
      ...debugInfo.value,
      coverImageValue: projectRef.value.coverImage,
      lastUpdate: new Date().toISOString()
    }
  }
}

// Handle coverImage updates manually to debug v-model issues
function handleCoverImageUpdate(newValue) {
  console.log('🖼️ handleCoverImageUpdate called with:', newValue ? 'base64 data' : 'empty')
  if (projectRef.value) {
    projectRef.value.coverImage = newValue
    console.log('✅ Updated projectRef.coverImage to:', projectRef.value.coverImage ? 'has value' : 'empty')
    
    // Force reactivity update
    debugInfo.value = {
      ...debugInfo.value,
      coverImageValue: projectRef.value.coverImage,
      lastUpdate: new Date().toISOString()
    }
  }
}

// Initialize on mount
onMounted(() => {
  console.log('🚀 ContentBasic mounted')
  initializeFields()
  setupButtonConfig()
})
</script>

<template>
  <ul class="form" v-if="projectRef">
    <!-- Debug Panel -->
    <div class="debug-panel" style="background: #f0f0f0; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; font-family: monospace; font-size: 12px;">
      <h4>Debug Info:</h4>
      <pre>{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      <button @click="testCoverImageUpdate" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem;">Test Manual Update</button>
    </div>
    
    <ul class="items">
      <InputText
        label="Project Title"
        placeholder="Your project name"
        v-model="projectRef.name"
      />
      <InputUpload
        label="Cover Image"
        :modelValue="projectRef.coverImage"
        @update:modelValue="handleCoverImageUpdate"
      />
    </ul>
    
    <ul class="items">
      <InputTextarea
        label="Introduction"
        placeholder="Describe your project..."
        v-model="projectRef.description"
      />
      <InputNormal
        label="Location"
        placeholder="City, Country or Studio location"
        v-model="projectRef.location"
      />
    </ul>
    
    <ul class="items">
      <InputLinks
        label="Contacts"
        titlePlaceholder="Contact title"
        urlPlaceholder="website, email or tel"
        v-model="projectRef.contacts"
      />
    </ul>
    
    <ul class="items">
      <InputLinks
        label="Social Links"
        titlePlaceholder="Platform name"
        urlPlaceholder="Profile URL or handle"
        v-model="projectRef.socialLinks"
      />
    </ul>
  </ul>
  
  <!-- Error state -->
  <div v-else class="error-state">
    <p>⚠️ Project data not available</p>
  </div>
</template>

<style scoped>
ul.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

ul.items {
  padding-bottom: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.error-state {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}
</style>