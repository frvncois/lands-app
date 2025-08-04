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
  if (!storeProject.value.hasOwnProperty('merch')) {
    storeProject.value.merch = []
  }
}

// FIXED: Read-only computed for merch (no mutations)
const projectMerch = computed(() => {
  return storeProject.value?.merch || []
})

// Helper function to update merch in store
function updateMerchInStore(newMerch) {
  if (storeProject.value) {
    storeProject.value.merch = newMerch
  }
}

// UI state
const isEditing = ref(false)
const editingIndex = ref(-1)
const currentMerch = ref(null)

// Dynamic inputs configuration for merch
const merchInputs = computed(() => {
  const baseInputs = [
    {
      type: 'upload',
      field: 'image',
      label: 'Cover',
      placeholder: 'Merch cover image'
    },
    {
      type: 'text',
      field: 'name',
      label: 'Product Name',
      placeholder: 'Product name'
    },
    {
      type: 'textarea',
      field: 'description',
      label: 'Description',
      placeholder: 'Product description, sizes, materials, etc...'
    },
    {
      type: 'text',
      field: 'price',
      label: 'Price',
      placeholder: 'e.g., 25.00'
    },
    {
      type: 'text',
      field: 'currency',
      label: 'Currency',
      placeholder: 'e.g., USD'
    },
    {
      type: 'text',
      field: 'shop_url',
      label: 'Shop URL',
      placeholder: 'Purchase link'
    },
    {
      type: 'boolean',
      field: 'in_stock',
      label: 'In Stock',
      details: 'Is this item currently available for purchase?'
    },
    {
      type: 'boolean',
      field: 'hidden',
      label: 'Hide from site',
      details: 'If enabled, this merch will not be visible on your public site'
    },
    {
      type: 'boolean',
      field: 'protected',
      label: 'Protect by password',
      details: 'Require a password to view this merch'
    }
  ]

  // Conditionally add password field if protected is true
  if (currentMerch.value?.protected) {
    baseInputs.push({
      type: 'text',
      field: 'password',
      label: 'Password',
      placeholder: 'Enter password for this merch'
    })
  }

  // Add require email field
  baseInputs.push({
    type: 'boolean',
    field: 'requireEmail',
    label: 'Require email',
    details: 'Users must provide email to access this merch (sets status to exclusive)'
  })

  return baseInputs
})

// Create new merch
function handleCreate() {
  const newMerch = {
    id: `merch_${Date.now()}`,
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    image: '',
    shop_url: '',
    in_stock: true,
    sizes: [],
    hidden: false,
    protected: false,
    requireEmail: false,
    password: '',
    status: 'public',
    order: projectMerch.value.length + 1,
    created_at: new Date().toISOString()
  }
  
  currentMerch.value = newMerch
  editingIndex.value = -1
  isEditing.value = true
  
  setupButtonConfig()
}

// Edit existing merch
function handleEdit(index) {
  if (projectMerch.value[index]) {
    currentMerch.value = { ...projectMerch.value[index] }
    editingIndex.value = index
    isEditing.value = true
    
    setupButtonConfig()
  }
}

// Save merch
function handleSave() {
  if (!currentMerch.value) return
  
  const currentMerchArray = [...projectMerch.value]
  const merchTitle = currentMerch.value.name || 'Untitled Merch'
  const isNewMerch = editingIndex.value === -1
  
  // Set merch status based on settings
  if (currentMerch.value.hidden) {
    currentMerch.value.status = 'hidden'
  } else if (currentMerch.value.requireEmail) {
    currentMerch.value.status = 'exclusive'
  } else {
    currentMerch.value.status = 'public'
  }
  
  if (isNewMerch) {
    currentMerch.value.created_at = currentMerch.value.created_at || new Date().toISOString()
    currentMerchArray.push(currentMerch.value)
  } else {
    currentMerch.value.updated_at = new Date().toISOString()
    currentMerchArray[editingIndex.value] = currentMerch.value
  }
  
  updateMerchInStore(currentMerchArray)
  
  // Reset editing state
  isEditing.value = false
  editingIndex.value = -1
  currentMerch.value = null
  
  setupButtonConfig()
  
  // Show alerts after state reset
  setTimeout(() => {
    if (isNewMerch) {
      alertStore.showSuccess(`Merch "${merchTitle}" created successfully`)
    } else {
      alertStore.showSuccess(`Merch "${merchTitle}" updated successfully`)
    }
  }, 100)
}

// Cancel editing
function handleCancel() {
  isEditing.value = false
  editingIndex.value = -1
  currentMerch.value = null
  
  setupButtonConfig()
}

// Delete merch
function handleDelete(index) {
  const deleteIndex = typeof index === 'number' ? index : editingIndex.value
  
  if (deleteIndex >= 0 && projectMerch.value[deleteIndex]) {
    const currentMerchArray = [...projectMerch.value]
    const deletedMerch = currentMerchArray[deleteIndex]
    const merchTitle = deletedMerch.name || 'Untitled Merch'
    
    currentMerchArray.splice(deleteIndex, 1)
    updateMerchInStore(currentMerchArray)
    
    alertStore.showSuccess(`Merch "${merchTitle}" deleted successfully`)
    
    if (isEditing.value && editingIndex.value === deleteIndex) {
      isEditing.value = false
      editingIndex.value = -1
      currentMerch.value = null
    }
    
    setupButtonConfig()
  }
}

// Move merch up
function handleMoveUp(index) {
  if (index > 0) {
    const currentMerchArray = [...projectMerch.value]
    const temp = currentMerchArray[index]
    currentMerchArray[index] = currentMerchArray[index - 1]
    currentMerchArray[index - 1] = temp
    
    currentMerchArray[index].order = index + 1
    currentMerchArray[index - 1].order = index
    
    updateMerchInStore(currentMerchArray)
  }
}

// Move merch down
function handleMoveDown(index) {
  if (index < projectMerch.value.length - 1) {
    const currentMerchArray = [...projectMerch.value]
    const temp = currentMerchArray[index]
    currentMerchArray[index] = currentMerchArray[index + 1]
    currentMerchArray[index + 1] = temp
    
    currentMerchArray[index].order = index + 1
    currentMerchArray[index + 1].order = index + 2
    
    updateMerchInStore(currentMerchArray)
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
      title: editingIndex.value === -1 ? 'Save Merch' : 'Update Merch',
      action: handleSave,
      buttonStyle: 'light'
    })
  } else {
    emit('button-config', {
      title: 'Add Merch',
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
  <!-- Overview Mode: Show all merch -->
  <ul v-if="!isEditing" class="items">
    <ListCard
      v-for="(merch, index) in projectMerch"
      :key="`merch-${merch.id || index}`"
      :item="merch"
      :index="index"
      :items="projectMerch"
      :contentType="'merch'"
      :titleField="'name'"
      :subtitleField="'description'"
      :imageField="'image'"
      @edit="handleEdit"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
      @delete="handleDelete"
    />
    
    <li v-if="projectMerch.length === 0" class="empty">
      <p>No merch added yet</p>
    </li>
  </ul>

  <!-- Edit Mode: Show form -->
  <ModalContent
    v-if="isEditing"
    :item="currentMerch"
    :inputs="merchInputs"
    @input="trackChanges"
    @save="handleSave"
    @delete="() => handleDelete()"
    @cancel="handleCancel"
    @close="handleClose"
  />
</template>