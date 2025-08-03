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

// Use the generic CRUD composable for 'shows'
const {
  isEditing,
  savedItems: savedShows,
  currentItem: currentShow,
  hasUnsavedChanges,
  create,
  save,
  edit,
  cancel,
  markAsChanged,
  reorder,
  fixOrdering,
  remove
} = useContentCrud(props.project, 'shows', props.editingIndex)

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
      field: 'title',
      label: 'Title',
      placeholder: 'Show title'
    },
    {
      type: 'textarea',
      field: 'details',
      label: 'Details',
      placeholder: 'Show details, venue, time, etc...'
    },
    {
      type: 'date',
      field: 'date',
      label: 'Date',
      placeholder: 'Show date'
    },
    {
      type: 'links',
      field: 'links',
      label: 'Links',
      placeholder: 'Add ticket links, venue info, etc.'
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
      title: 'Add Show',
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
    // Set show status based on settings
    if (currentShow.value) {
      if (currentShow.value.hidden) {
        currentShow.value.status = 'hidden'
      } else if (currentShow.value.requireEmail) {
        currentShow.value.status = 'exclusive'
      } else {
        currentShow.value.status = 'public'
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
    console.log(`Moved show up from position ${index + 1} to ${index}`)
  }
}

function handleMoveDown(index) {
  if (index < savedShows.value.length - 1) {
    reorder(index, index + 1)
    console.log(`Moved show down from position ${index + 1} to ${index + 2}`)
  }
}

function handleDelete() {
  if (confirm('Are you sure you want to delete this show?')) {
    const currentIndex = props.project.shows.findIndex(show => show === currentShow.value)
    if (currentIndex !== -1) {
      remove(currentIndex)
      setupButtonConfig()
      console.log('Show deleted')
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
      v-if="isEditing && currentShow"
      :item="currentShow"
      :inputs="showsInputs"
      @input="trackChanges"
      @delete="handleDelete"
    />

    <ListCard
      v-else
      :items="savedShows"
      content-type="shows"
      title-field="title"
      subtitle-field="date"
      image-field="img"
      empty-title="Untitled Show"
      :show-image="true"
      @edit="handleEdit"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
    />
</template>
