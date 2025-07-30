// /composables/useContentCrud.js
import { ref, computed } from 'vue'
import { createItem, saveItem, deleteItem, getSavedItems, cleanupUnsavedItems, getItemTemplates, reorderItems, fixOrderValues } from '@/utils/crud.js'

export function useContentCrud(project, contentType, editingIndex = null) {
  const currentIndex = ref(editingIndex)
  const hasUnsavedChanges = ref(false)
  
  const isEditing = computed(() => currentIndex.value !== null)
  const savedItems = computed(() => getSavedItems(project, contentType))
  const currentItem = computed(() => 
    currentIndex.value !== null ? project[contentType]?.[currentIndex.value] : null
  )
  
  // Get the appropriate template for this content type
  const itemTemplate = getItemTemplates()[contentType] || {}
  
  function create() {
    const newIndex = createItem(project, contentType, itemTemplate)
    currentIndex.value = newIndex
    hasUnsavedChanges.value = true
    return newIndex
  }
  
  function save() {
    if (currentIndex.value === null) return false
    
    const success = saveItem(project, contentType, currentIndex.value)
    if (success) {
      hasUnsavedChanges.value = false
      currentIndex.value = null // Return to list view
    }
    return success
  }
  
  function edit(index) {
    if (index >= 0 && index < savedItems.value.length) {
      currentIndex.value = index
      hasUnsavedChanges.value = false
    }
  }
  
  function cancel() {
    if (hasUnsavedChanges.value) {
      cleanupUnsavedItems(project, contentType)
    }
    currentIndex.value = null
    hasUnsavedChanges.value = false
  }
  
  function remove(index) {
    const success = deleteItem(project, contentType, index)
    if (success && currentIndex.value === index) {
      currentIndex.value = null
      hasUnsavedChanges.value = false
    }
    return success
  }
  
  function markAsChanged() {
    if (isEditing.value) {
      hasUnsavedChanges.value = true
    }
  }
  
  function reorder(oldIndex, newIndex) {
    return reorderItems(project, contentType, oldIndex, newIndex)
  }
  
  function fixOrdering() {
    fixOrderValues(project, contentType)
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