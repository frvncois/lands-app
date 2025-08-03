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


// Import alert store
const alertStore = useAlertStore()

// DIRECT STORE ACCESS - Get the actual store project object
const storeProject = computed(() => {
  const projectId = props.project.id
  return props.userStore.projects.find(p => p.id === projectId)
})

// Get links array directly from store - REACTIVE ACCESS
const projectLinks = computed(() => {
  return storeProject.value?.links || []
})

// Helper function to update links in store
function updateLinksInStore(newLinks) {
  if (storeProject.value) {
    storeProject.value.links = newLinks
    console.log('📝 STORE Project links updated:', newLinks.length, 'items')
  }
}

// UI state
const isEditing = ref(false)
const editingIndex = ref(-1)
const currentLink = ref(null)

// Input configuration for links
const linksInputs = computed(() => [
  {
    type: 'upload',
    field: 'img',
    label: 'Cover',
    placeholder: 'Cover image'
  },
  {
    type: 'text',
    field: 'title',
    label: 'Title',
    placeholder: 'Link Title'
  },
  {
    type: 'text',
    field: 'url',
    label: 'URL',
    placeholder: 'https://'
  }
])

// Create new link
function handleCreate() {
  const newLink = {
    id: `link_${Date.now()}`,
    title: '',
    url: '',
    description: '',
    img: '',
    order: projectLinks.value.length + 1,
    created_at: new Date().toISOString() // Use snake_case to match store format
  }
  
  currentLink.value = newLink
  editingIndex.value = -1 // -1 for new items
  isEditing.value = true
  
  console.log('✨ Creating new link')
  setupButtonConfig()
}

// Edit existing link
function handleEdit(index) {
  if (projectLinks.value[index]) {
    currentLink.value = { ...projectLinks.value[index] } // Create copy
    editingIndex.value = index
    isEditing.value = true
    
    console.log('✏️ Editing link at index:', index)
    setupButtonConfig()
  }
}

// Save link
function handleSave() {
  if (!currentLink.value) return
  
  const currentLinks = [...projectLinks.value] // Get current array
  
  if (editingIndex.value === -1) {
    // Adding new link - ensure proper timestamps
    currentLink.value.created_at = currentLink.value.created_at || new Date().toISOString()
    currentLinks.push(currentLink.value)
    console.log('✅ New link added to store')
  } else {
    // Updating existing link - add updated timestamp
    currentLink.value.updated_at = new Date().toISOString()
    currentLinks[editingIndex.value] = currentLink.value
    console.log('✅ Link updated in store')
  }
  
  // Update store with new array
  updateLinksInStore(currentLinks)
  
  // Reset editing state
  isEditing.value = false
  editingIndex.value = -1
  currentLink.value = null
  
  setupButtonConfig()
}

// Cancel editing
function handleCancel() {
  isEditing.value = false
  editingIndex.value = -1
  currentLink.value = null
  
  console.log('❌ Cancelled link editing')
  setupButtonConfig()
}

// Delete link (can be called from ListCard or ModalContent)
function handleDelete(index) {
  // If called from ModalContent during editing, use editingIndex
  const deleteIndex = typeof index === 'number' ? index : editingIndex.value
  
  if (deleteIndex >= 0 && projectLinks.value[deleteIndex]) {
    const currentLinks = [...projectLinks.value]
    const deletedLink = currentLinks[deleteIndex]
    const linkTitle = deletedLink.title || 'Untitled Link'
    
    currentLinks.splice(deleteIndex, 1)
    updateLinksInStore(currentLinks)
    
    console.log('🗑️ Link deleted from store:', linkTitle)
    
    // Show success alert
    alertStore.showSuccess(`Link "${linkTitle}" deleted successfully`)
    
    // If we were editing this item, close the modal
    if (isEditing.value && editingIndex.value === deleteIndex) {
      isEditing.value = false
      editingIndex.value = -1
      currentLink.value = null
    }
    
    setupButtonConfig()
  }
}

// Move link up
function handleMoveUp(index) {
  if (index > 0) {
    const currentLinks = [...projectLinks.value]
    const temp = currentLinks[index]
    currentLinks[index] = currentLinks[index - 1]
    currentLinks[index - 1] = temp
    
    // Update order values
    currentLinks[index].order = index + 1
    currentLinks[index - 1].order = index
    
    updateLinksInStore(currentLinks)
    console.log('⬆️ Link moved up')
  }
}

// Move link down
function handleMoveDown(index) {
  if (index < projectLinks.value.length - 1) {
    const currentLinks = [...projectLinks.value]
    const temp = currentLinks[index]
    currentLinks[index] = currentLinks[index + 1]
    currentLinks[index + 1] = temp
    
    // Update order values
    currentLinks[index].order = index + 1
    currentLinks[index + 1].order = index + 2
    
    updateLinksInStore(currentLinks)
    console.log('⬇️ Link moved down')
  }
}

// Track changes in modal
function trackChanges() {
  console.log('📝 Link data changed')
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
      title: editingIndex.value === -1 ? 'Save Link' : 'Update Link',
      action: handleSave,
      buttonStyle: 'light'
    })
  } else {
    emit('button-config', {
      title: 'Add Link',
      action: handleCreate,
      buttonStyle: 'light'
    })
  }
  
  console.log('⚙️ Button config updated:', isEditing.value ? 'Save/Update' : 'Add')
}

onMounted(() => {
  setupButtonConfig()
  console.log('🔗 ContentLinks component mounted')
  console.log('📊 Current links count:', projectLinks.value.length)
})
</script>

<template>
  <ul v-if="!isEditing" class="items">
    <ListCard
      v-for="(link, index) in projectLinks"
      :key="`link-${link.id || index}`"
      :item="link"
      :index="index"
      :items="projectLinks"
      :contentType="'links'"
      :titleField="'title'"
      :subtitleField="'url'"
      :imageField="'img'"
      @edit="handleEdit"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
      @delete="handleDelete"
    />
    
    <li v-if="projectLinks.length === 0" class="empty">
        <p>No links added yet</p>
    </li>
  </ul>

  <ModalContent
    v-if="isEditing"
    :item="currentLink"
    :inputs="linksInputs"
    @input="trackChanges"
    @save="handleSave"
    @delete="() => handleDelete()"
    @cancel="handleCancel"
    @close="handleClose"
  />

</template>