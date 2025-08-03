// src/composables/useContentCrud.js - UPDATED FOR USER STORE
import { ref, computed } from 'vue'

export function useContentCrud(userStore, contentType, editingIndex = null) {
  const currentIndex = ref(editingIndex)
  const hasUnsavedChanges = ref(false)
  
  const isEditing = computed(() => currentIndex.value !== null)
  
  // Get data from USER STORE currentProject
  const savedItems = computed(() => {
    const currentProject = userStore.currentProject
    if (!currentProject) return []
    
    // Initialize array if it doesn't exist
    if (!currentProject[contentType]) {
      currentProject[contentType] = []
    }
    
    return currentProject[contentType]
      .filter(item => item.saved !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  })
  
  const currentItem = computed(() => {
    const currentProject = userStore.currentProject
    if (currentIndex.value === null || !currentProject || !currentProject[contentType]) {
      return null
    }
    return currentProject[contentType][currentIndex.value]
  })
  
  // Templates for different content types
  function getItemTemplate(contentType) {
    const templates = {
      links: {
        name: '',
        url: '',
        img: ''
      },
      posts: {
        title: '',
        content: '',
        img: '',
        links: [],
        hidden: false,
        protected: false,
        password: '',
        requireEmail: false,
        status: 'public'
      },
      releases: {
        title: '',
        img: '',
        releaseDate: '',
        label: '',
        details: '',
        tracks: [],
        links: []
      },
      shows: {
        title: '',
        details: '',
        img: '',
        date: '',
        links: []
      },
      merch: {
        title: '',
        details: '',
        img: '',
        links: []
      }
    }
    return templates[contentType] || {}
  }
  
  function create() {
    const currentProject = userStore.currentProject
    if (!currentProject) {
      console.error('❌ No current project in store')
      return -1
    }
    
    // Initialize array if needed
    if (!currentProject[contentType]) {
      currentProject[contentType] = []
    }
    
    // Get next order value
    const maxOrder = currentProject[contentType].length > 0 
      ? Math.max(...currentProject[contentType].map(item => item.order || 0))
      : 0
    
    const newItem = {
      ...getItemTemplate(contentType),
      order: maxOrder + 1,
      saved: false,
      createdAt: null,
      updatedAt: null
    }
    
    // Add to store
    currentProject[contentType].push(newItem)
    currentIndex.value = currentProject[contentType].length - 1
    hasUnsavedChanges.value = true
    
    console.log(`🆕 Created new ${contentType} item:`, newItem)
    console.log(`📊 Store now has ${currentProject[contentType].length} ${contentType} items`)
    
    return currentIndex.value
  }
  
  function save() {
    if (currentIndex.value === null) return false
    
    const currentProject = userStore.currentProject
    if (!currentProject || !currentProject[contentType] || !currentProject[contentType][currentIndex.value]) {
      console.error('❌ Cannot save: item not found')
      return false
    }
    
    const item = currentProject[contentType][currentIndex.value]
    const timestamp = new Date().toISOString()
    
    // Set timestamps
    if (!item.createdAt) {
      item.createdAt = timestamp
    }
    item.updatedAt = timestamp
    item.saved = true
    
    hasUnsavedChanges.value = false
    currentIndex.value = null // Return to list view
    
    console.log(`💾 Saved ${contentType} item:`, item)
    return true
  }
  
  function edit(index) {
    const savedItemsArray = savedItems.value
    if (index >= 0 && index < savedItemsArray.length) {
      // Find the actual index in the store array
      const currentProject = userStore.currentProject
      const actualIndex = currentProject[contentType].findIndex(item => item === savedItemsArray[index])
      if (actualIndex !== -1) {
        currentIndex.value = actualIndex
        hasUnsavedChanges.value = false
        console.log(`✏️ Editing ${contentType} item at index ${actualIndex}`)
      }
    }
  }
  
  function cancel() {
    const currentProject = userStore.currentProject
    if (!currentProject) return
    
    if (hasUnsavedChanges.value && currentIndex.value !== null) {
      // Remove unsaved items
      currentProject[contentType] = currentProject[contentType].filter(item => item.saved !== false)
      console.log(`🚫 Cancelled editing, removed unsaved ${contentType} items`)
    }
    
    currentIndex.value = null
    hasUnsavedChanges.value = false
  }
  
  function remove(index) {
    const savedItemsArray = savedItems.value
    if (index < 0 || index >= savedItemsArray.length) return false
    
    const currentProject = userStore.currentProject
    const actualIndex = currentProject[contentType].findIndex(item => item === savedItemsArray[index])
    
    if (actualIndex !== -1) {
      currentProject[contentType].splice(actualIndex, 1)
      
      if (currentIndex.value === actualIndex) {
        currentIndex.value = null
        hasUnsavedChanges.value = false
      }
      
      console.log(`🗑️ Removed ${contentType} item at index ${index}`)
      return true
    }
    
    return false
  }
  
  function markAsChanged() {
    if (isEditing.value) {
      hasUnsavedChanges.value = true
      
      // FORCE REACTIVITY: Trigger Vue's reactivity system
      const currentProject = userStore.currentProject
      if (currentProject && currentProject[contentType]) {
        // Create new array reference to trigger watchers
        currentProject[contentType] = [...currentProject[contentType]]
      }
      
      console.log(`📝 Marked ${contentType} item as changed and forced reactivity`)
    }
  }
  
  function reorder(oldIndex, newIndex) {
    const savedItemsArray = savedItems.value
    if (oldIndex < 0 || oldIndex >= savedItemsArray.length || 
        newIndex < 0 || newIndex >= savedItemsArray.length) {
      return false
    }
    
    // Reorder items
    const [movedItem] = savedItemsArray.splice(oldIndex, 1)
    savedItemsArray.splice(newIndex, 0, movedItem)
    
    // Update order values
    savedItemsArray.forEach((item, index) => {
      item.order = index + 1
      item.updatedAt = new Date().toISOString()
    })
    
    console.log(`🔄 Reordered ${contentType} item from ${oldIndex} to ${newIndex}`)
    return true
  }
  
  function fixOrdering() {
    const savedItemsArray = savedItems.value
    savedItemsArray.forEach((item, index) => {
      item.order = index + 1
    })
  }
  
  return {
    // State
    currentIndex,
    hasUnsavedChanges,
    isEditing,
    savedItems,
    currentItem,
    
    // Actions
    create,
    save,
    edit,
    cancel,
    remove,
    markAsChanged,
    reorder,
    fixOrdering
  }
}