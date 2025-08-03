<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import ListCard from '@/components/global/ListCard.vue'
import ModalContent from '@/components/global/ModalContent.vue'
import { useContentCrud } from '@/composables/useContentCrud.js'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  editingIndex: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits(['button-config', 'close-modal'])

// Use the generic CRUD composable for 'merch'
const {
  isEditing,
  savedItems: savedMerch,
  currentItem: currentMerch,
  hasUnsavedChanges,
  create,
  save,
  edit,
  cancel,
  markAsChanged,
  reorder,
  fixOrdering,
  remove
} = useContentCrud(props.project, 'merch', props.editingIndex)

// Dynamic inputs configuration for merch
const merchInputs = computed(() => {
  const baseInputs = [
    {
      type: 'upload',
      field: 'img',
      label: 'Cover',
      placeholder: 'Merch cover image'
    },
    {
      type: 'text',
      field: 'title',
      label: 'Title',
      placeholder: 'Product name'
    },
    {
      type: 'textarea',
      field: 'details',
      label: 'Details',
      placeholder: 'Product description, sizes, materials, etc...'
    },
    {
      type: 'links',
      field: 'links',
      label: 'Links',
      placeholder: 'Add purchase links, store info, etc.'
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

// Button configuration management
function setupButtonConfig() {
  if (isEditing.value || hasUnsavedChanges.value) {
    emit('button-config', {
      title: 'Save',
      action: handleSave,
      buttonStyle: 'light'
    })
  } else {
    emit('button-config', {
      title: 'Add Merch',
      action: handleCreate
    })
  }
}

function handleCreate() {
  create()
  setupButtonConfig()
}

function handleSave() {
  if (save()) {
    // Set merch status based on settings
    if (currentMerch.value) {
      if (currentMerch.value.hidden) {
        currentMerch.value.status = 'hidden'
      } else if (currentMerch.value.requireEmail) {
        currentMerch.value.status = 'exclusive'
      } else {
        currentMerch.value.status = 'public'
      }
    }
    setupButtonConfig()
  }
}

function handleEdit(index) {
  edit(index)
  setupButtonConfig()
}

function handleCancel() {
  cancel()
  setupButtonConfig()
}

function trackChanges() {
  markAsChanged()
  setupButtonConfig()
}

function handleMoveUp(index) {
  if (index > 0) {
    reorder(index, index - 1)
    console.log(`Moved merch up from position ${index + 1} to ${index}`)
  }
}

function handleMoveDown(index) {
  if (index < savedMerch.value.length - 1) {
    reorder(index, index + 1)
    console.log(`Moved merch down from position ${index + 1} to ${index + 2}`)
  }
}

function handleDelete() {
  if (confirm('Are you sure you want to delete this merch?')) {
    const currentIndex = props.project.merch.findIndex(merch => merch === currentMerch.value)
    if (currentIndex !== -1) {
      remove(currentIndex)
      setupButtonConfig()
      console.log('Merch deleted')
    }
  }
}

// Lifecycle
onMounted(() => {
  // Fix any ordering issues on mount
  fixOrdering()
  setupButtonConfig()
})

onUnmounted(() => {
  if (hasUnsavedChanges.value) {
    cancel() // Cleanup on unmount
  }
})
</script>

<template>
    <ModalContent
      v-if="isEditing && currentMerch"
      :item="currentMerch"
      :inputs="merchInputs"
      @input="trackChanges"
      @delete="handleDelete"
    />
    
    <ListCard
      v-else
      :items="savedMerch"
      content-type="merch"
      title-field="title"
      subtitle-field="details"
      image-field="img"
      empty-title="Untitled Merch"
      :show-image="true"
      @edit="handleEdit"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
    />
</template>
