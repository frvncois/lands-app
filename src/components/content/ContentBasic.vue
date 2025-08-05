// src/components/content/ContentBasic.vue - Updated script section

<script setup>
import { onMounted, computed, provide } from 'vue'
import InputTextarea from '@/components/input/InputTextarea.vue'
import InputNormal from '@/components/input/InputNormal.vue'
import InputUpload from '@/components/input/InputUpload.vue'
import InputLinks from '@/components/input/InputLinks.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  userStore: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['button-config', 'save-project'])

// PROVIDE project ID for child components like InputUpload
provide('projectId', props.project.id)

// DIRECT STORE ACCESS - Get the actual store project object
const storeProject = computed(() => {
  const projectId = props.project.id
  return props.userStore.projects.find(p => p.id === projectId)
})

// FIXED: Safe initialization function (separate from reactive chain)
function initializeProjectArrays() {
  if (!storeProject.value) return
  
  // Only initialize if they truly don't exist (not just empty arrays)
  let needsUpdate = false
  const updates = {}
  
  if (!storeProject.value.hasOwnProperty('contacts')) {
    updates.contacts = []
    needsUpdate = true
  }
  if (!storeProject.value.hasOwnProperty('socialLinks')) {
    updates.socialLinks = []
    needsUpdate = true
  }
  
  // Apply all updates at once to minimize reactivity triggers
  if (needsUpdate) {
    Object.assign(storeProject.value, updates)
    console.log('📄 ContentBasic: Arrays initialized safely', Object.keys(updates))
  }
}

// Create computed refs that directly reference the store project
const projectName = computed({
  get: () => storeProject.value?.name || '',
  set: (value) => {
    if (storeProject.value) {
      storeProject.value.name = value
    }
  }
})

const projectDescription = computed({
  get: () => storeProject.value?.description || '',
  set: (value) => {
    if (storeProject.value) {
      storeProject.value.description = value
    }
  }
})

const projectLocation = computed({
  get: () => storeProject.value?.location || '',
  set: (value) => {
    if (storeProject.value) {
      storeProject.value.location = value
    }
  }
})

const projectCoverImage = computed({
  get: () => storeProject.value?.cover_image || '',
  set: (value) => {
    if (storeProject.value) {
      storeProject.value.cover_image = value
    }
  }
})

// FIXED: Safe computed for arrays (no mutations, with fallbacks)
const projectContacts = computed({
  get: () => storeProject.value?.contacts || [],
  set: (value) => {
    if (storeProject.value) {
      storeProject.value.contacts = value
    }
  }
})

const projectSocialLinks = computed({
  get: () => storeProject.value?.socialLinks || [],
  set: (value) => {
    if (storeProject.value) {
      storeProject.value.socialLinks = value
    }
  }
})

function setupButtonConfig() {
  emit('button-config', {
    title: '',
    action: null
  })
}

onMounted(() => {
  // FIXED: Initialize arrays safely, only once, with minimal reactivity impact
  initializeProjectArrays()
  setupButtonConfig()
  
  console.log('📄 ContentBasic: DIRECT STORE binding ready')
  console.log('📄 ContentBasic: Store project data:', {
    name: storeProject.value?.name,
    description: storeProject.value?.description,
    location: storeProject.value?.location,
    cover_image: storeProject.value?.cover_image,
    contacts: storeProject.value?.contacts?.length || 0,
    socialLinks: storeProject.value?.socialLinks?.length || 0
  })
  console.log('📄 ContentBasic: Provided projectId:', props.project.id)
})
</script>
<template>
  <ul class="form" v-if="storeProject">
    <ul class="items">
      <InputNormal
        label="Project Title"
        details="This is the main title that will appear on your project page"
        placeholder="Enter project title"
        v-model="projectName"
      />
      
      <InputTextarea
        label="Project Description"
        details="A brief description of your project"
        placeholder="Describe your project..."
        v-model="projectDescription"
      />
      
      <InputNormal
        label="Location"
        details="Where is this project based?"
        placeholder="City, Country"
        v-model="projectLocation"
      />
      
      <InputUpload
        label="Cover Image"
        details="Main image for your project"
        placeholder="Upload cover image"
        v-model="projectCoverImage"
      />
      
      <InputLinks
        label="Contact Links"
        details="Ways for people to contact you"
        placeholder="Add contact methods"
        v-model="projectContacts"
      />
      
      <InputLinks
        label="Social Links"
        details="Your social media profiles"
        placeholder="Add social links"
        v-model="projectSocialLinks"
      />
    </ul>
  </ul>
</template>

<style scoped>
ul.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

ul.items {
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

ul.items:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.error-state {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
}
</style>