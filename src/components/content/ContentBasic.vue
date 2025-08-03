<script setup>
import { toRef, onMounted, watch } from 'vue'
import InputText from '@/components/input/InputText.vue'
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

// Use toRef to maintain reactivity
const projectRef = toRef(props, 'project')

// Auto-save when project data changes
let saveTimeout = null

function scheduleAutoSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  
  saveTimeout = setTimeout(async () => {
    await saveProjectData()
  }, 2000) // Save after 2 seconds of inactivity
}

async function saveProjectData() {
  if (!props.userStore || !projectRef.value) return
  
  try {
    const result = await props.userStore.updateProject(projectRef.value.id, {
      name: projectRef.value.name,
      description: projectRef.value.description,
      location: projectRef.value.location,
      coverImage: projectRef.value.coverImage,
      contacts: projectRef.value.contacts || [],
      socialLinks: projectRef.value.socialLinks || []
    })
    
    if (result.success) {
      console.log('✅ Basic info auto-saved')
      emit('save-project', result.data)
    } else {
      console.error('❌ Failed to auto-save basic info:', result.error)
    }
  } catch (error) {
    console.error('❌ Error auto-saving basic info:', error)
  }
}

// Watch for changes in project data and trigger auto-save
watch([
  () => projectRef.value?.name,
  () => projectRef.value?.description,
  () => projectRef.value?.location,
  () => projectRef.value?.coverImage,
  () => projectRef.value?.contacts,
  () => projectRef.value?.socialLinks
], () => {
  scheduleAutoSave()
}, { deep: true })

// No save button needed - auto-saves
function setupButtonConfig() {
  emit('button-config', {
    title: '',
    action: null
  })
}

onMounted(() => {
  // Initialize arrays if they don't exist
  if (!projectRef.value.contacts) {
    projectRef.value.contacts = []
  }
  if (!projectRef.value.socialLinks) {
    projectRef.value.socialLinks = []
  }
  
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