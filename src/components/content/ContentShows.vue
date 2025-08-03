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

console.log('🎤 ContentShows mounted, project:', props.project?.name)

// Import alert store
const alertStore = useAlertStore()

// DIRECT STORE ACCESS - Get the actual store project object
const storeProject = computed(() => {
  const projectId = props.project.id
  return props.userStore.projects.find(p => p.id === projectId)
})

// Get shows array directly from store - REACTIVE ACCESS
const projectShows = computed(() => {
  return storeProject.value?.shows || []
})

// Helper function to update shows in store
function updateShowsInStore(newShows) {
  if (storeProject.value) {
    storeProject.value.shows = newShows
    console.log('📝 STORE Project shows updated:', newShows.length, 'items')
  }
}

// UI state
const isEditing = ref(false)
const editingIndex = ref(-1)
const currentShow = ref(null)

// Dynamic inputs configuration for shows
const showsInputs = computed(() => {
  const baseInputs = [
    {
      type: 'upload',
      field: 'img',
      label: 'Cover',
      placeholder: 'Show cover image'
    },
    {
      type: 'text',
      field: 'venue',
      label: 'Venue',
      placeholder: 'Venue name'
    },
    {
      type: 'text',
      field: 'city',
      label: 'City',
      placeholder: 'City'
    },
    {
      type: 'text',
      field: 'state',
      label: 'State',
      placeholder: 'State/Province'
    },
    {
      type: 'text',
      field: 'country',
      label: 'Country',
      placeholder: 'Country'
    },
    {
      type: 'date',
      field: 'date',
      label: 'Date',
      placeholder: 'Show date'
    },
    {
      type: 'text',
      field: 'time',
      label: 'Time',
      placeholder: 'Show time (e.g., 20:00)'
    },
    {
      type: 'text',
      field: 'ticket_url',
      label: 'Ticket URL',
      placeholder: 'Ticket purchase link'
    },
    {
      type: 'text',
      field: 'price_range',
      label: 'Price Range',
      placeholder: 'e.g., $25-35'
    },
    {
      type: 'boolean',
      field: 'hidden',
      label: 'Hide from site',
      details: 'If enabled, this show will not be visible on your public site'
    },
    {
      type: 'boolean',
      field: 'protected',
      label: 'Protect by password',
      details: 'Require a password to view this show'
    }
  ]

  // Conditionally add password field if protected is true
  if (currentShow.value?.protected) {
    baseInputs.push({
      type: 'text',
      field: 'password',
      label: 'Password',
      placeholder: 'Enter password for this show'
    })
  }

  // Add require email field
  baseInputs.push({
    type: 'boolean',
    field: 'requireEmail',
    label: 'Require email',
    details: 'Users must provide email to access this show (sets status to exclusive)'
  })

  return baseInputs
})

// Create new show
function handleCreate() {
  const newShow = {
    id: `show_${Date.now()}`,
    venue: '',
    city: '',
    state: '',
    country: '',
    date: '',
    time: '',
    ticket_url: '',
    price_range: '',
    status: 'on_sale',
    img: '',
    hidden: false,
    protected: false,
    requireEmail: false,
    password: '',
    order: projectShows.value.length + 1,
    created_at: new Date().toISOString()
  }
  
  currentShow.value = newShow
  editingIndex.value = -1 // -1 for new items
  isEditing.value = true
  
  console.log('✨ Creating new show')
  setupButtonConfig()
}

// Edit existing show
function handleEdit(index) {
  if (projectShows.value[index]) {
    currentShow.value = { ...projectShows.value[index] } // Create copy
    editingIndex.value = index
    isEditing.value = true
    
    console.log('✏️ Editing show at index:', index)
    setupButtonConfig()
  }
}

// Save show
function handleSave() {
  if (!currentShow.value) return
  
  const currentShows = [...projectShows.value] // Get current array
  const showTitle = `${currentShow.value.venue || 'Venue'} - ${currentShow.value.city || 'City'}`
  const isNewShow = editingIndex.value === -1
  
  // Set show status based on settings
  if (currentShow.value.hidden) {
    currentShow.value.status = 'hidden'
  } else if (currentShow.value.requireEmail) {
    currentShow.value.status = 'exclusive'
  } else {
    currentShow.value.status = 'on_sale'
  }
  
  if (isNewShow) {
    // Adding new show - ensure proper timestamps
    currentShow.value.created_at = currentShow.value.created_at || new Date().toISOString()
    currentShows.push(currentShow.value)
    console.log('✅ New show added to store')
  } else {
    // Updating existing show - add updated timestamp
    currentShow.value.updated_at = new Date().toISOString()
    currentShows[editingIndex.value] = currentShow.value
    console.log('✅ Show updated in store with updated_at timestamp')
  }
  
  // Update store with new array
  updateShowsInStore(currentShows)
  
  // Reset editing state FIRST
  isEditing.value = false
  editingIndex.value = -1
  currentShow.value = null
  
  setupButtonConfig()
  
  // Show alerts AFTER state reset with delay to ensure DOM is updated
  setTimeout(() => {
    if (isNewShow) {
      alertStore.showSuccess(`Show "${showTitle}" created successfully`)
    } else {
      alertStore.showSuccess(`Show "${showTitle}" updated successfully`)
    }
  }, 100)
}

// Cancel editing
function handleCancel() {
  isEditing.value = false
  editingIndex.value = -1
  currentShow.value = null
  
  console.log('❌ Cancelled show editing')
  setupButtonConfig()
}

// Delete show (can be called from ListCard or ModalContent)
function handleDelete(index) {
  // If called from ModalContent during editing, use editingIndex
  const deleteIndex = typeof index === 'number' ? index : editingIndex.value
  
  if (deleteIndex >= 0 && projectShows.value[deleteIndex]) {
    const currentShows = [...projectShows.value]
    const deletedShow = currentShows[deleteIndex]
    const showTitle = `${deletedShow.venue || 'Venue'} - ${deletedShow.city || 'City'}`
    
    currentShows.splice(deleteIndex, 1)
    updateShowsInStore(currentShows)
    
    console.log('🗑️ Show deleted from store:', showTitle)
    
    // Show success alert
    alertStore.showSuccess(`Show "${showTitle}" deleted successfully`)
    
    // If we were editing this item, close the modal
    if (isEditing.value && editingIndex.value === deleteIndex) {
      isEditing.value = false
      editingIndex.value = -1
      currentShow.value = null
    }
    
    setupButtonConfig()
  }
}

// Move show up
function handleMoveUp(index) {
  if (index > 0) {
    const currentShows = [...projectShows.value]
    const temp = currentShows[index]
    currentShows[index] = currentShows[index - 1]
    currentShows[index - 1] = temp
    
    // Update order values
    currentShows[index].order = index + 1
    currentShows[index - 1].order = index
    
    updateShowsInStore(currentShows)
    console.log('⬆️ Show moved up')
  }
}

// Move show down
function handleMoveDown(index) {
  if (index < projectShows.value.length - 1) {
    const currentShows = [...projectShows.value]
    const temp = currentShows[index]
    currentShows[index] = currentShows[index + 1]
    currentShows[index + 1] = temp
    
    // Update order values
    currentShows[index].order = index + 1
    currentShows[index + 1].order = index + 2
    
    updateShowsInStore(currentShows)
    console.log('⬇️ Show moved down')
  }
}

// Track changes in modal
function trackChanges() {
  console.log('📝 Show data changed')
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
      title: editingIndex.value === -1 ? 'Save Show' : 'Update Show',
      action: handleSave,
      buttonStyle: 'light'
    })
  } else {
    emit('button-config', {
      title: 'Add Show',
      action: handleCreate,
      buttonStyle: 'light'
    })
  }
  
  console.log('⚙️ Button config updated:', isEditing.value ? 'Save/Update' : 'Add')
}

onMounted(() => {
  setupButtonConfig()
  console.log('🎤 ContentShows component mounted')
  console.log('📊 Current shows count:', projectShows.value.length)
})
</script>

<template>
  <!-- Overview Mode: Show all shows -->
  <ul v-if="!isEditing" class="items">
    <ListCard
      v-for="(show, index) in projectShows"
      :key="`show-${show.id || index}`"
      :item="show"
      :index="index"
      :items="projectShows"
      :contentType="'shows'"
      :titleField="'venue'"
      :subtitleField="'date'"
      :imageField="'img'"
      @edit="handleEdit"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
      @delete="handleDelete"
    />
    
    <li v-if="projectShows.length === 0" class="empty">
      <h3>No shows added yet</h3>
      <p>Click "Add Show" to get started</p>
    </li>
  </ul>

  <!-- Edit Mode: Show form -->
  <ModalContent
    v-if="isEditing"
    :item="currentShow"
    :inputs="showsInputs"
    @input="trackChanges"
    @save="handleSave"
    @delete="() => handleDelete()"
    @cancel="handleCancel"
    @close="handleClose"
  />
</template>
