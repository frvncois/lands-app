<script setup>
import { onMounted, toRef } from 'vue'
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
  
  console.log('✅ ContentBasic fields initialized:', {
    hasContacts: Array.isArray(projectRef.value.contacts),
    hasSocialLinks: Array.isArray(projectRef.value.socialLinks),
    hasCoverImage: typeof projectRef.value.coverImage === 'string',
    hasLocation: typeof projectRef.value.location === 'string',
    hasName: typeof projectRef.value.name === 'string',
    hasDescription: typeof projectRef.value.description === 'string'
  })
}

// Setup button configuration
function setupButtonConfig() {
  emit('button-config', {
    title: '',
    action: null
  })
}

// Initialize on mount
onMounted(() => {
  initializeFields()
  setupButtonConfig()
})
</script>

<template>
  <ul class="form" v-if="projectRef">
    <ul class="items">
      <InputText
        label="Project Title"
        placeholder="Your project name"
        v-model="projectRef.name"
      />
      <InputUpload
        label="Cover Image"
        placeholder="Project cover image"
        v-model="projectRef.coverImage"
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