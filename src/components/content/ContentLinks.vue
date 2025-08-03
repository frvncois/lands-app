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
  userStore: {
    type: Object,
    required: true
  },
  editingIndex: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits(['button-config', 'close-modal', 'save-project'])

console.log('🔗 ContentLinks mounted, project:', props.project?.name)

// Use the CRUD composable with userStore
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
} = useContentCrud(props.userStore, 'links', props.editingIndex)

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
      action: handleCreate,
      buttonStyle: 'light'
    })
  }
  console.log('⚙️ Button config updated:', isEditing.value ? 'Save' : 'Add')
}

async function handleCreate() {
  console.log('🆕 Creating new link...')
  const newIndex = create()
  console.log('✅ New link created in user.js store at index:', newIndex)
  
  // Optional: Save to localStorage for drafts
  saveToLocalStorage()
  setupButtonConfig()
}

async function handleSave() {
  console.log('💾 Saving link...')
  if (save()) {
    console.log('✅ Link saved in user.js store')
    
    // Optional: Save to localStorage for drafts  
    saveToLocalStorage()
    setupButtonConfig()
  } else {
    console.error('❌ Failed to save link')
  }
}

function saveToLocalStorage() {
  try {
    const projectId = props.project.id
    if (!projectId) return
    
    const draftKey = `project_draft_${projectId}`
    const existingDraft = localStorage.getItem(draftKey)
    
    let draftData = {}
    if (existingDraft) {
      draftData = JSON.parse(existingDraft)
    }
    
    // Update links in draft
    draftData.links = savedLinks.value
    draftData.lastModified = new Date().toISOString()
    
    localStorage.setItem(draftKey, JSON.stringify(draftData))
    console.log('💾 Links saved to localStorage (draft)')
  } catch (error) {
    console.error('❌ Error saving to localStorage:', error)
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
    console.log(`🔼 Moved link up in user.js store from ${index + 1} to ${index}`)
    saveToLocalStorage()
  }
}

function handleMoveDown(index) {
  if (index < savedLinks.value.length - 1) {
    reorder(index, index + 1)
    console.log(`🔽 Moved link down in user.js store from ${index + 1} to ${index + 2}`)
    saveToLocalStorage()
  }
}

async function handleDelete() {
  if (confirm('Are you sure you want to delete this link?')) {
    if (remove()) {
      console.log('🗑️ Link deleted from user.js store')
      saveToLocalStorage()
      setupButtonConfig()
    }
  }
}

function handleCancel() {
  console.log('❌ Cancelled link editing')
  cancel()
  setupButtonConfig()
}

function handleClose() {
  handleCancel()
  emit('close-modal')
}

onMounted(() => {
  setupButtonConfig()
  console.log('🔗 ContentLinks component mounted')
})

onUnmounted(() => {
  console.log('🔗 ContentLinks component unmounted')
})
</script>

<template>
  <!-- Overview Mode: Show all links -->
  <ul v-if="!isEditing" class="overview">
    <ListCard
      v-for="(link, index) in savedLinks"
      :key="`link-${index}`"
      :item="link"
      :index="index"
      @edit="handleEdit"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
      @delete="handleDelete"
    />
    
    <li v-if="savedLinks.length === 0" class="empty-state">
      <p>No links added yet</p>
      <p>Click "Add Link" to get started</p>
    </li>
  </ul>

  <!-- Edit Mode: Show form -->
  <ModalContent
    v-if="isEditing"
    :item="currentLink"
    :inputs="linksInputs"
    @input="trackChanges"
    @save="handleSave"
    @cancel="handleCancel"
    @close="handleClose"
  />
</template>
