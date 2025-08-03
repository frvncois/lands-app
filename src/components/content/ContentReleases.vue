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

// Use the generic CRUD composable for 'releases'
const {
  isEditing,
  savedItems: savedReleases,
  currentItem: currentRelease,
  hasUnsavedChanges,
  create,
  save,
  edit,
  cancel,
  markAsChanged,
  reorder,
  fixOrdering,
  remove
} = useContentCrud(props.project, 'releases', props.editingIndex)

// Get available merch items for the select dropdown
const merchOptions = computed(() => {
  const savedMerch = props.project.merch?.filter(item => item.saved !== false) || []
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
      field: 'releaseDate',
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
      field: 'details',
      label: 'Details',
      placeholder: 'Release description, credits, etc...'
    },
    {
      type: 'links',
      field: 'tracks',
      label: 'Tracks',
      placeholder: 'Add track titles and streaming links'
    },
    {
      type: 'links',
      field: 'links',
      label: 'Links',
      placeholder: 'Add streaming platforms, purchase links, etc.'
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
      title: 'Add Release',
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
    // Set release status based on settings
    if (currentRelease.value) {
      if (currentRelease.value.hidden) {
        currentRelease.value.status = 'hidden'
      } else if (currentRelease.value.requireEmail) {
        currentRelease.value.status = 'exclusive'
      } else {
        currentRelease.value.status = 'public'
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
    console.log(`Moved release up from position ${index + 1} to ${index}`)
  }
}

function handleMoveDown(index) {
  if (index < savedReleases.value.length - 1) {
    reorder(index, index + 1)
    console.log(`Moved release down from position ${index + 1} to ${index + 2}`)
  }
}

function handleDelete() {
  if (confirm('Are you sure you want to delete this release?')) {
    const currentIndex = props.project.releases.findIndex(release => release === currentRelease.value)
    if (currentIndex !== -1) {
      remove(currentIndex)
      setupButtonConfig()
      console.log('Release deleted')
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
      v-if="isEditing && currentRelease"
      :item="currentRelease"
      :inputs="releasesInputs"
      @input="trackChanges"
      @delete="handleDelete"
    />

    <ListCard
      v-else
      :items="savedReleases"
      content-type="releases"
      title-field="title"
      subtitle-field="label"
      image-field="img"
      empty-title="Untitled Release"
      :show-image="true"
      @edit="handleEdit"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
    />
</template>