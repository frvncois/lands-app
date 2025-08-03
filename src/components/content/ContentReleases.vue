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

console.log('🎵 ContentReleases mounted, project:', props.project?.name)

// Import alert store
const alertStore = useAlertStore()

// DIRECT STORE ACCESS - Get the actual store project object
const storeProject = computed(() => {
  const projectId = props.project.id
  return props.userStore.projects.find(p => p.id === projectId)
})

// Get releases array directly from store - REACTIVE ACCESS
const projectReleases = computed(() => {
  return storeProject.value?.releases || []
})

// Helper function to update releases in store
function updateReleasesInStore(newReleases) {
  if (storeProject.value) {
    storeProject.value.releases = newReleases
    console.log('📝 STORE Project releases updated:', newReleases.length, 'items')
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
  editingIndex.value = -1 // -1 for new items
  isEditing.value = true
  
  console.log('✨ Creating new release')
  setupButtonConfig()
}

// Edit existing release
function handleEdit(index) {
  if (projectReleases.value[index]) {
    currentRelease.value = { ...projectReleases.value[index] } // Create copy
    editingIndex.value = index
    isEditing.value = true
    
    console.log('✏️ Editing release at index:', index)
    setupButtonConfig()
  }
}

// Save release
function handleSave() {
  if (!currentRelease.value) return
  
  const currentReleases = [...projectReleases.value] // Get current array
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
    // Adding new release - ensure proper timestamps
    currentRelease.value.created_at = currentRelease.value.created_at || new Date().toISOString()
    currentReleases.push(currentRelease.value)
    console.log('✅ New release added to store')
  } else {
    // Updating existing release - add updated timestamp
    currentRelease.value.updated_at = new Date().toISOString()
    currentReleases[editingIndex.value] = currentRelease.value
    console.log('✅ Release updated in store with updated_at timestamp')
  }
  
  // Update store with new array
  updateReleasesInStore(currentReleases)
  
  // Reset editing state FIRST
  isEditing.value = false
  editingIndex.value = -1
  currentRelease.value = null
  
  setupButtonConfig()
  
  // Show alerts AFTER state reset with delay to ensure DOM is updated
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
  
  console.log('❌ Cancelled release editing')
  setupButtonConfig()
}

// Delete release (can be called from ListCard or ModalContent)
function handleDelete(index) {
  // If called from ModalContent during editing, use editingIndex
  const deleteIndex = typeof index === 'number' ? index : editingIndex.value
  
  if (deleteIndex >= 0 && projectReleases.value[deleteIndex]) {
    const currentReleases = [...projectReleases.value]
    const deletedRelease = currentReleases[deleteIndex]
    const releaseTitle = deletedRelease.title || 'Untitled Release'
    
    currentReleases.splice(deleteIndex, 1)
    updateReleasesInStore(currentReleases)
    
    console.log('🗑️ Release deleted from store:', releaseTitle)
    
    // Show success alert
    alertStore.showSuccess(`Release "${releaseTitle}" deleted successfully`)
    
    // If we were editing this item, close the modal
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
    
    // Update order values
    currentReleases[index].order = index + 1
    currentReleases[index - 1].order = index
    
    updateReleasesInStore(currentReleases)
    console.log('⬆️ Release moved up')
  }
}

// Move release down
function handleMoveDown(index) {
  if (index < projectReleases.value.length - 1) {
    const currentReleases = [...projectReleases.value]
    const temp = currentReleases[index]
    currentReleases[index] = currentReleases[index + 1]
    currentReleases[index + 1] = temp
    
    // Update order values
    currentReleases[index].order = index + 1
    currentReleases[index + 1].order = index + 2
    
    updateReleasesInStore(currentReleases)
    console.log('⬇️ Release moved down')
  }
}

// Track changes in modal
function trackChanges() {
  console.log('📝 Release data changed')
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
  
  console.log('⚙️ Button config updated:', isEditing.value ? 'Save/Update' : 'Add')
}

onMounted(() => {
  setupButtonConfig()
  console.log('🎵 ContentReleases component mounted')
  console.log('📊 Current releases count:', projectReleases.value.length)
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
      <h3>No releases added yet</h3>
      <p>Click "Add Release" to get started</p>
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