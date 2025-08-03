<script setup>
import { onMounted, computed } from 'vue'
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

// DIRECT STORE ACCESS - Get the actual store project object
const storeProject = computed(() => {
  const projectId = props.project.id
  return props.userStore.projects.find(p => p.id === projectId)
})

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

const projectcover_image = computed({
  get: () => storeProject.value?.cover_image || '',
  set: (value) => {
    if (storeProject.value) {
      storeProject.value.cover_image = value
    }
  }
})

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

// No save button needed - just direct store binding
function setupButtonConfig() {
  emit('button-config', {
    title: '',
    action: null
  })
}

onMounted(() => {
  // Initialize arrays if they don't exist in the STORE project
  if (storeProject.value && !storeProject.value.contacts) {
    storeProject.value.contacts = []
  }
  if (storeProject.value && !storeProject.value.socialLinks) {
    storeProject.value.socialLinks = []
  }
  
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
})
</script>

<template>
  <ul class="form" v-if="storeProject">
    <ul class="items">
      <InputNormal
        label="Project Title"
        placeholder="Your project name"
        v-model="projectName"
      />
      <InputUpload
        label="Cover Image"
        v-model="projectcover_image"
      />
    </ul>
    
    <ul class="items">
      <InputTextarea
        label="Introduction"
        placeholder="Describe your project..."
        v-model="projectDescription"
      />
      <InputNormal
        label="Location"
        placeholder="City, Country or Studio location"
        v-model="projectLocation"
      />
    </ul>
    
    <ul class="items">
      <InputLinks
        label="Contacts"
        titlePlaceholder="Contact title"
        urlPlaceholder="website, email or tel"
        v-model="projectContacts"
      />
    </ul>
    
    <ul class="items">
      <InputLinks
        label="Social Links"
        titlePlaceholder="Platform name"
        urlPlaceholder="Profile URL or handle"
        v-model="projectSocialLinks"
      />
    </ul>
  </ul>
  
  <div v-else class="error-state">
    <p>Project not found in store</p>
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