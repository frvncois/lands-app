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

// Use the generic CRUD composable for 'links'
const linksInputs = computed(() => [
  {
    type: 'upload',
    field: 'img',
    label: 'Cover',
    placeholder: 'Cover image'
  },
  {
    type: 'text',
    field: 'name',
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
const {
  isEditing,
  savedItems: savedLinks,
  currentItem: currentLink,
  hasUnsavedChanges,
  create,
  save,
  edit,
  cancel,
  markAsChanged,
  reorder,
  fixOrdering,
  remove
} = useContentCrud(props.project, 'links', props.editingIndex)

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
      title: 'Add Link',
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
    setupButtonConfig()
  }
}

function handleEdit(index) {
  edit(index)
  setupButtonConfig()
}

function trackChanges() {
  markAsChanged()
  setupButtonConfig()
}

function handleMoveUp(index) {
  if (index > 0) {
    reorder(index, index - 1)
    console.log(`Moved link up from position ${index + 1} to ${index}`)
  }
}

function handleMoveDown(index) {
  if (index < savedLinks.value.length - 1) {
    reorder(index, index + 1)
    console.log(`Moved link down from position ${index + 1} to ${index + 2}`)
  }
}

function handleDelete() {
  if (confirm('Are you sure you want to delete this link?')) {
    const currentIndex = props.project.links.findIndex(link => link === currentLink.value)
    if (currentIndex !== -1) {
      remove(currentIndex)
      setupButtonConfig()
      console.log('Link deleted')
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
      v-if="isEditing && currentLink"
      :item="currentLink"
      :inputs="linksInputs"
      @input="trackChanges"
      @delete="handleDelete"
      @save="handleSave"
    />

    
    <ListCard
      v-else
      :items="savedLinks"
      content-type="links"
      title-field="name"
      subtitle-field="url"
      image-field="img"
      empty-title="Untitled Link"
      :show-image="true"
      @edit="handleEdit"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
    />
</template>
