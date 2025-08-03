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

console.log('📝 ContentPosts mounted, project:', props.project?.name)

// Import alert store
const alertStore = useAlertStore()

// DIRECT STORE ACCESS - Get the actual store project object
const storeProject = computed(() => {
  const projectId = props.project.id
  return props.userStore.projects.find(p => p.id === projectId)
})

// Get posts array directly from store - REACTIVE ACCESS
const projectPosts = computed(() => {
  return storeProject.value?.posts || []
})

// Helper function to update posts in store
function updatePostsInStore(newPosts) {
  if (storeProject.value) {
    storeProject.value.posts = newPosts
    console.log('📝 STORE Project posts updated:', newPosts.length, 'items')
  }
}

// UI state
const isEditing = ref(false)
const editingIndex = ref(-1)
const currentPost = ref(null)

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
      type: 'text',
      field: 'title',
      label: 'Title',
      placeholder: 'Post title'
    },
    {
      type: 'textarea',
      field: 'content',
      label: 'Content',
      placeholder: 'Write your post content...'
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

// Create new post
function handleCreate() {
  const newPost = {
    id: `post_${Date.now()}`,
    title: '',
    content: '',
    img: '',
    hidden: false,
    protected: false,
    requireEmail: false,
    password: '',
    status: 'public',
    published: true,
    order: projectPosts.value.length + 1,
    created_at: new Date().toISOString()
  }
  
  currentPost.value = newPost
  editingIndex.value = -1 // -1 for new items
  isEditing.value = true
  
  console.log('✨ Creating new post')
  setupButtonConfig()
}

// Edit existing post
function handleEdit(index) {
  if (projectPosts.value[index]) {
    currentPost.value = { ...projectPosts.value[index] } // Create copy
    editingIndex.value = index
    isEditing.value = true
    
    console.log('✏️ Editing post at index:', index)
    setupButtonConfig()
  }
}

// Save post
function handleSave() {
  if (!currentPost.value) return
  
  const currentPosts = [...projectPosts.value] // Get current array
  const postTitle = currentPost.value.title || 'Untitled Post'
  const isNewPost = editingIndex.value === -1
  
  // Set post status based on settings
  if (currentPost.value.hidden) {
    currentPost.value.status = 'hidden'
  } else if (currentPost.value.requireEmail) {
    currentPost.value.status = 'exclusive'
  } else {
    currentPost.value.status = 'public'
  }
  
  if (isNewPost) {
    // Adding new post - ensure proper timestamps
    currentPost.value.created_at = currentPost.value.created_at || new Date().toISOString()
    currentPosts.push(currentPost.value)
    console.log('✅ New post added to store')
  } else {
    // Updating existing post - add updated timestamp
    currentPost.value.updated_at = new Date().toISOString()
    currentPosts[editingIndex.value] = currentPost.value
    console.log('✅ Post updated in store with updated_at timestamp')
  }
  
  // Update store with new array
  updatePostsInStore(currentPosts)
  
  // Reset editing state FIRST
  isEditing.value = false
  editingIndex.value = -1
  currentPost.value = null
  
  setupButtonConfig()
  
  // Show alerts AFTER state reset with delay to ensure DOM is updated
  setTimeout(() => {
    if (isNewPost) {
      alertStore.showSuccess(`Post "${postTitle}" created successfully`)
    } else {
      alertStore.showSuccess(`Post "${postTitle}" updated successfully`)
    }
  }, 100)
}

// Cancel editing
function handleCancel() {
  isEditing.value = false
  editingIndex.value = -1
  currentPost.value = null
  
  console.log('❌ Cancelled post editing')
  setupButtonConfig()
}

// Delete post (can be called from ListCard or ModalContent)
function handleDelete(index) {
  // If called from ModalContent during editing, use editingIndex
  const deleteIndex = typeof index === 'number' ? index : editingIndex.value
  
  if (deleteIndex >= 0 && projectPosts.value[deleteIndex]) {
    const currentPosts = [...projectPosts.value]
    const deletedPost = currentPosts[deleteIndex]
    const postTitle = deletedPost.title || 'Untitled Post'
    
    currentPosts.splice(deleteIndex, 1)
    updatePostsInStore(currentPosts)
    
    console.log('🗑️ Post deleted from store:', postTitle)
    
    // Show success alert
    alertStore.showSuccess(`Post "${postTitle}" deleted successfully`)
    
    // If we were editing this item, close the modal
    if (isEditing.value && editingIndex.value === deleteIndex) {
      isEditing.value = false
      editingIndex.value = -1
      currentPost.value = null
    }
    
    setupButtonConfig()
  }
}

// Move post up
function handleMoveUp(index) {
  if (index > 0) {
    const currentPosts = [...projectPosts.value]
    const temp = currentPosts[index]
    currentPosts[index] = currentPosts[index - 1]
    currentPosts[index - 1] = temp
    
    // Update order values
    currentPosts[index].order = index + 1
    currentPosts[index - 1].order = index
    
    updatePostsInStore(currentPosts)
    console.log('⬆️ Post moved up')
  }
}

// Move post down
function handleMoveDown(index) {
  if (index < projectPosts.value.length - 1) {
    const currentPosts = [...projectPosts.value]
    const temp = currentPosts[index]
    currentPosts[index] = currentPosts[index + 1]
    currentPosts[index + 1] = temp
    
    // Update order values
    currentPosts[index].order = index + 1
    currentPosts[index + 1].order = index + 2
    
    updatePostsInStore(currentPosts)
    console.log('⬇️ Post moved down')
  }
}

// Track changes in modal
function trackChanges() {
  console.log('📝 Post data changed')
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
      title: editingIndex.value === -1 ? 'Save Post' : 'Update Post',
      action: handleSave,
      buttonStyle: 'light'
    })
  } else {
    emit('button-config', {
      title: 'Add Post',
      action: handleCreate,
      buttonStyle: 'light'
    })
  }
  
  console.log('⚙️ Button config updated:', isEditing.value ? 'Save/Update' : 'Add')
}

onMounted(() => {
  setupButtonConfig()
  console.log('📝 ContentPosts component mounted')
  console.log('📊 Current posts count:', projectPosts.value.length)
})
</script>

<template>
  <!-- Overview Mode: Show all posts -->
  <ul v-if="!isEditing" class="items">
    <ListCard
      v-for="(post, index) in projectPosts"
      :key="`post-${post.id || index}`"
      :item="post"
      :index="index"
      :items="projectPosts"
      :contentType="'posts'"
      :titleField="'title'"
      :subtitleField="'content'"
      :imageField="'img'"
      @edit="handleEdit"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
      @delete="handleDelete"
    />
    
    <li v-if="projectPosts.length === 0" class="empty">
      <h3>No posts added yet</h3>
      <p>Click "Add Post" to get started</p>
    </li>
  </ul>

  <!-- Edit Mode: Show form -->
  <ModalContent
    v-if="isEditing"
    :item="currentPost"
    :inputs="postsInputs"
    @input="trackChanges"
    @save="handleSave"
    @delete="() => handleDelete()"
    @cancel="handleCancel"
    @close="handleClose"
  />
</template>
