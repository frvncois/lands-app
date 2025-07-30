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

// Use the generic CRUD composable for 'posts'
const {
  isEditing,
  savedItems: savedPosts,
  currentItem: currentPost,
  hasUnsavedChanges,
  create,
  save,
  edit,
  cancel,
  markAsChanged,
  reorder,
  fixOrdering,
  remove
} = useContentCrud(props.project, 'posts', props.editingIndex)

// Dynamic inputs configuration for posts
const postsInputs = computed(() => {
  const baseInputs = [
    {
      type: 'upload',
      field: 'img',
      label: 'Cover',
      placeholder: 'Cover image'
    },
    {
      type: 'textarea',
      field: 'content',
      label: 'Content',
      placeholder: 'Write your post content...'
    },
    {
      type: 'links',
      field: 'links',
      label: 'Links',
      placeholder: 'Add related links'
    },
    {
      type: 'boolean',
      field: 'hidden',
      label: 'Hide from site',
      details: 'If enabled, this post will not be visible on your public site'
    },
    {
      type: 'boolean',
      field: 'protected',
      label: 'Protect by password',
      details: 'Require a password to view this post'
    }
  ]

  // Conditionally add password field if protected is true
  if (currentPost.value?.protected) {
    baseInputs.push({
      type: 'text',
      field: 'password',
      label: 'Password',
      placeholder: 'Enter password for this post'
    })
  }

  // Add require email field
  baseInputs.push({
    type: 'boolean',
    field: 'requireEmail',
    label: 'Require email',
    details: 'Users must provide email to access this post (sets status to exclusive)'
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
      title: 'Add Post',
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
    // Set post status based on settings
    if (currentPost.value) {
      if (currentPost.value.hidden) {
        currentPost.value.status = 'hidden'
      } else if (currentPost.value.requireEmail) {
        currentPost.value.status = 'exclusive'
      } else {
        currentPost.value.status = 'public'
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
    console.log(`Moved post up from position ${index + 1} to ${index}`)
  }
}

function handleMoveDown(index) {
  if (index < savedPosts.value.length - 1) {
    reorder(index, index + 1)
    console.log(`Moved post down from position ${index + 1} to ${index + 2}`)
  }
}

function handleDelete() {
  if (confirm('Are you sure you want to delete this post?')) {
    const currentIndex = props.project.posts.findIndex(post => post === currentPost.value)
    if (currentIndex !== -1) {
      remove(currentIndex)
      setupButtonConfig()
      console.log('Post deleted')
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
  <ul class="form">
    <!-- Edit Mode - Using Reusable ModalContent -->
    <ModalContent
      v-if="isEditing && currentPost"
      :item="currentPost"
      :inputs="postsInputs"
      @input="trackChanges"
      @delete="handleDelete"
    />
    
    <!-- List Mode - Using Reusable ListCard -->
    <ListCard
      v-else
      :items="savedPosts"
      content-type="posts"
      title-field="title"
      subtitle-field="content"
      image-field="img"
      empty-title="Untitled Post"
      :show-image="true"
      @edit="handleEdit"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
    />
  </ul>
</template>

<style scoped>
ul.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
</style>