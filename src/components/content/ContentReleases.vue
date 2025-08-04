<script setup>
import { onMounted, computed, ref } from 'vue'
import ListCard from '@/components/global/ListCard.vue'
import ModalContent from '@/components/global/ModalContent.vue'
import { useAlertStore } from '@/stores/alert'

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

const emit = defineEmits(['button-config', 'close-modal', 'save-project'])

const alertStore = useAlertStore()

// DIRECT STORE ACCESS - Get the actual store project object
const storeProject = computed(() => {
  const projectId = props.project.id
  return props.userStore.projects.find(p => p.id === projectId)
})

// FIXED: Safe initialization function (not in computed)
function initializeContentArrays() {
  if (!storeProject.value) return
  
  // Only initialize if the property truly doesn't exist
  if (!storeProject.value.hasOwnProperty('releases')) {
    storeProject.value.releases = []
  }
}

// FIXED: Read-only computed for releases (no mutations)
const projectReleases = computed(() => {
  return storeProject.value?.releases || []
})

// Helper function to update releases in store
function updateReleasesInStore(newReleases) {
  if (storeProject.value) {
    storeProject.value.releases = newReleases
  }
}

// UI state
const isEditing = ref(false)
const editingIndex = ref(-1)
const currentRelease = ref(null)

// Get available merch items for the select dropdown
const merchOptions = computed(() => {
  const savedMerch = storeProject.value?.merch || []
  return [
    { value: '', label: 'No merch connected' },
    ...savedMerch.map(merch => ({
      value: merch.title || `Merch ${merch.order}`,
      label: merch.title || `Untitled Merch ${merch.order}`
    }))
  ]
})

// Dynamic inputs configuration for releases
const releasesInputs = computed(() => {
  const baseInputs = [
    {
      type: 'upload',
      field: 'img',
      label: 'Cover',
      placeholder: 'Album/Release cover art'
    },
    {
      type: 'text',
      field: 'title',
      label: 'Title',
      placeholder: 'Release title'
    },
    {
      type: 'date',
      field: 'release_date',
      label: 'Release date',
      placeholder: 'Release date'
    },
    {
      type: 'text',
      field: 'label',
      label: 'Label',
      placeholder: 'Record label'
    },
    {
      type: 'textarea',
      field: 'description',
      label: 'Description',
      placeholder: 'Release description, credits, etc...'
    },
    {
      type: 'select',
      field: 'connectedMerch',
      label: 'Connect with merch item',
      placeholder: 'Select a merch item',
      options: merchOptions.value
    },
    {
      type: 'boolean',
      field: 'hidden',
      label: 'Hide from site',
      details: 'If enabled, this release will not be visible on your public site'
    },
    {
      type: 'boolean',
      field: 'protected',
      label: 'Protect by password',
      details: 'Require a password to view this release'
    }
  ]

  // Conditionally add password field if protected is true
  if (currentRelease.value?.protected) {
    baseInputs.push({
      type: 'text',
      field: 'password',
      label: 'Password',
      placeholder: 'Enter password for this release'
    })
  }

  // Add require email field
  baseInputs.push({
    type: 'boolean',
    field: 'requireEmail',
    label: 'Require email',
    details: 'Users must provide email to access this release (sets status to exclusive)'
  })

  return baseInputs
})

// Create new release
function handleCreate() {
  const newRelease = {
    id: `release_${Date.now()}`,
    title: '',
    type: 'single',
    release_date: '',
    label: '',
    description: '',
    img: '',
    streaming_links: {},
    connectedMerch: '',
    hidden: false,
    protected: false,
    requireEmail: false,
    password: '',
    status: 'public',
    order: projectReleases.value.length + 1,
    created_at: new Date().toISOString()
  }
  
  currentRelease.value = newRelease
  editingIndex.value = -1
  isEditing.value = true
  
  setupButtonConfig()
}

// Edit existing release
function handleEdit(index) {
  if (projectReleases.value[index]) {
    currentRelease.value = { ...projectReleases.value[index] }
    editingIndex.value = index
    isEditing.value = true
    
    setupButtonConfig()
  }
}

// Save release
function handleSave() {
  if (!currentRelease.value) return
  
  const currentReleases = [...projectReleases.value]
  const releaseTitle = currentRelease.value.title || 'Untitled Release'
  const isNewRelease = editingIndex.value === -1
  
  // Set release status based on settings
  if (currentRelease.value.hidden) {
    currentRelease.value.status = 'hidden'
  } else if (currentRelease.value.requireEmail) {
    currentRelease.value.status = 'exclusive'
  } else {
    currentRelease.value.status = 'public'
  }
  
  if (isNewRelease) {
    currentRelease.value.created_at = currentRelease.value.created_at || new Date().toISOString()
    currentReleases.push(currentRelease.value)
  } else {
    currentRelease.value.updated_at = new Date().toISOString()
    currentReleases[editingIndex.value] = currentRelease.value
  }
  
  updateReleasesInStore(currentReleases)
  
  // Reset editing state
  isEditing.value = false
  editingIndex.value = -1
  currentRelease.value = null
  
  setupButtonConfig()
  
  // Show alerts after state reset
  setTimeout(() => {
    if (isNewRelease) {
      alertStore.showSuccess(`Release "${releaseTitle}" created successfully`)
    } else {
      alertStore.showSuccess(`Release "${releaseTitle}" updated successfully`)
    }
  }, 100)
}

// Cancel editing
function handleCancel() {
  isEditing.value = false
  editingIndex.value = -1
  currentRelease.value = null
  
  setupButtonConfig()
}

// Delete release
function handleDelete(index) {
  const deleteIndex = typeof index === 'number' ? index : editingIndex.value
  
  if (deleteIndex >= 0 && projectReleases.value[deleteIndex]) {
    const currentReleases = [...projectReleases.value]
    const deletedRelease = currentReleases[deleteIndex]
    const releaseTitle = deletedRelease.title || 'Untitled Release'
    
    currentReleases.splice(deleteIndex, 1)
    updateReleasesInStore(currentReleases)
    
    alertStore.showSuccess(`Release "${releaseTitle}" deleted successfully`)
    
    if (isEditing.value && editingIndex.value === deleteIndex) {
      isEditing.value = false
      editingIndex.value = -1
      currentRelease.value = null
    }
    
    setupButtonConfig()
  }
}

// Move release up
function handleMoveUp(index) {
  if (index > 0) {
    const currentReleases = [...projectReleases.value]
    const temp = currentReleases[index]
    currentReleases[index] = currentReleases[index - 1]
    currentReleases[index - 1] = temp
    
    currentReleases[index].order = index + 1
    currentReleases[index - 1].order = index
    
    updateReleasesInStore(currentReleases)
  }
}

// Move release down
function handleMoveDown(index) {
  if (index < projectReleases.value.length - 1) {
    const currentReleases = [...projectReleases.value]
    const temp = currentReleases[index]
    currentReleases[index] = currentReleases[index + 1]
    currentReleases[index + 1] = temp
    
    currentReleases[index].order = index + 1
    currentReleases[index + 1].order = index + 2
    
    updateReleasesInStore(currentReleases)
  }
}

// Track changes in modal
function trackChanges() {
  setupButtonConfig()
}

// Handle modal close
function handleClose() {
  handleCancel()
  emit('close-modal')
}

// Button configuration
function setupButtonConfig() {
  if (isEditing.value) {
    emit('button-config', {
      title: editingIndex.value === -1 ? 'Save Release' : 'Update Release',
      action: handleSave,
      buttonStyle: 'light'
    })
  } else {
    emit('button-config', {
      title: 'Add Release',
      action: handleCreate,
      buttonStyle: 'light'
    })
  }
}

onMounted(() => {
  // FIXED: Initialize arrays safely in onMounted
  initializeContentArrays()
  setupButtonConfig()
})
</script>

<template>
  <!-- Overview Mode: Show all releases -->
  <ul v-if="!isEditing" class="items">
    <ListCard
      v-for="(release, index) in projectReleases"
      :key="`release-${release.id || index}`"
      :item="release"
      :index="index"
      :items="projectReleases"
      :contentType="'releases'"
      :titleField="'title'"
      :subtitleField="'label'"
      :imageField="'img'"
      @edit="handleEdit"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
      @delete="handleDelete"
    />
    
    <li v-if="projectReleases.length === 0" class="empty">
      <p>No releases added yet</p>
    </li>
  </ul>

  <!-- Edit Mode: Show form -->
  <ModalContent
    v-if="isEditing"
    :item="currentRelease"
    :inputs="releasesInputs"
    @input="trackChanges"
    @save="handleSave"
    @delete="() => handleDelete()"
    @cancel="handleCancel"
    @close="handleClose"
  />
</template>