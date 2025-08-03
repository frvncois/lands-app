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

console.log('🔗 ContentLinks mounted, project:', props.project?.name)

// Use the FIXED CRUD composable
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

// Button configuration
function setupButtonConfig() {
  if (isEditing.value || hasUnsavedChanges.value) {
    emit('button-config', {
      title: 'Save Link',
      action: handleSave,
      buttonStyle: 'light'
    })
  } else {
    emit('button-config', {
      title: 'Add Link',
      action: handleCreate
    })
  }
  console.log('⚙️ Button config updated:', isEditing.value ? 'Save' : 'Add')
}

function handleCreate() {
  console.log('🆕 Creating new link...')
  const newIndex = create()
  console.log('✅ New link created at index:', newIndex)
  setupButtonConfig()
}

function handleSave() {
  console.log('💾 Saving link...')
  if (save()) {
    console.log('✅ Link saved successfully')
    setupButtonConfig()
  } else {
    console.error('❌ Failed to save link')
  }
}

function handleEdit(index) {
  console.log('✏️ Editing link at index:', index)
  edit(index)
  setupButtonConfig()
}

function trackChanges() {
  console.log('📝 Link data changed')
  markAsChanged()
  setupButtonConfig()
}

function handleMoveUp(index) {
  if (index > 0) {
    reorder(index, index - 1)
    console.log(`🔼 Moved link up from ${index + 1} to ${index}`)
  }
}

function handleMoveDown(index) {
  if (index < savedLinks.value.length - 1) {
    reorder(index, index + 1)
    console.log(`🔽 Moved link down from ${index + 1} to ${index + 2}`)
  }
}

function handleDelete() {
  if (confirm('Are you sure you want to delete this link?')) {
    console.log('🗑️ Deleting current link')
    // Find the current item in the saved links and remove it
    const savedItemsArray = savedLinks.value
    const currentItemToDelete = currentLink.value
    const indexToDelete = savedItemsArray.findIndex(item => item === currentItemToDelete)
    
    if (indexToDelete !== -1) {
      remove(indexToDelete)
      setupButtonConfig()
      console.log('✅ Link deleted')
    } else {
      console.error('❌ Could not find link to delete')
    }
  }
}

// Lifecycle
onMounted(() => {
  console.log('🔗 ContentLinks mounted, fixing ordering...')
  fixOrdering()
  setupButtonConfig()
  
  // Debug current state
  console.log('📊 Current links count:', savedLinks.value.length)
  console.log('📋 Current links:', savedLinks.value)
})

onUnmounted(() => {
  if (hasUnsavedChanges.value) {
    console.log('🧹 Cleaning up unsaved changes on unmount')
    cancel()
  }
})
</script>

<template>

    <!-- MODAL for editing/creating -->
    <ModalContent
      v-if="isEditing && currentLink"
      :item="currentLink"
      :inputs="linksInputs"
      @input="trackChanges"
      @delete="handleDelete"
      @save="handleSave"
    />

    <!-- LIST for viewing -->
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