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
  if (!storeProject.value.hasOwnProperty('links')) {
    storeProject.value.links = []
  }
}

// FIXED: Read-only computed for links (no mutations)
const projectLinks = computed(() => {
  return storeProject.value?.links || []
})

// Helper function to update links in store
function updateLinksInStore(newLinks) {
  if (storeProject.value) {
    storeProject.value.links = newLinks
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
    created_at: new Date().toISOString()
  }
  
  currentLink.value = newLink
  editingIndex.value = -1
  isEditing.value = true
  
  setupButtonConfig()
}

// Edit existing link
function handleEdit(index) {
  if (projectLinks.value[index]) {
    currentLink.value = { ...projectLinks.value[index] }
    editingIndex.value = index
    isEditing.value = true
    
    setupButtonConfig()
  }
}

// Save link
function handleSave() {
  if (!currentLink.value) return
  
  const currentLinks = [...projectLinks.value]
  
  if (editingIndex.value === -1) {
    currentLink.value.created_at = currentLink.value.created_at || new Date().toISOString()
    currentLinks.push(currentLink.value)
  } else {
    currentLink.value.updated_at = new Date().toISOString()
    currentLinks[editingIndex.value] = currentLink.value
  }
  
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
  
  setupButtonConfig()
}

// Delete link
function handleDelete(index) {
  const deleteIndex = typeof index === 'number' ? index : editingIndex.value
  
  if (deleteIndex >= 0 && projectLinks.value[deleteIndex]) {
    const currentLinks = [...projectLinks.value]
    const deletedLink = currentLinks[deleteIndex]
    const linkTitle = deletedLink.title || 'Untitled Link'
    
    currentLinks.splice(deleteIndex, 1)
    updateLinksInStore(currentLinks)
    
    alertStore.showSuccess(`Link "${linkTitle}" deleted successfully`)
    
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
    
    currentLinks[index].order = index + 1
    currentLinks[index - 1].order = index
    
    updateLinksInStore(currentLinks)
  }
}

// Move link down
function handleMoveDown(index) {
  if (index < projectLinks.value.length - 1) {
    const currentLinks = [...projectLinks.value]
    const temp = currentLinks[index]
    currentLinks[index] = currentLinks[index + 1]
    currentLinks[index + 1] = temp
    
    currentLinks[index].order = index + 1
    currentLinks[index + 1].order = index + 2
    
    updateLinksInStore(currentLinks)
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
}

onMounted(() => {
  // FIXED: Initialize arrays safely in onMounted
  initializeContentArrays()
  setupButtonConfig()
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