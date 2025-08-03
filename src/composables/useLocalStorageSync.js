// src/composables/useLocalStorageSync.js
import { ref, watch, nextTick } from 'vue'
import { useProjectStore } from '@/stores/projects'

export function useLocalStorageSync() {
  const projectStore = useProjectStore()
  const isDirty = ref(false)
  const lastSaved = ref(null)
  
  function getStorageKey(projectId) {
    return `project_draft_${projectId}`
  }
  
  // Save to localStorage immediately
  function saveToLocalStorage(projectId, data) {
    try {
      const key = getStorageKey(projectId)
      const payload = {
        ...data,
        lastModified: new Date().toISOString(),
        isDraft: true
      }
      
      localStorage.setItem(key, JSON.stringify(payload))
      lastSaved.value = new Date()
      
      console.log('💾 Saved to localStorage:', key)
      return true
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error)
      return false
    }
  }
  
  // Load from localStorage
  function loadFromLocalStorage(projectId) {
    try {
      const key = getStorageKey(projectId)
      const saved = localStorage.getItem(key)
      
      if (saved) {
        const data = JSON.parse(saved)
        console.log('📂 Loaded from localStorage:', key)
        return data
      }
      
      return null
    } catch (error) {
      console.error('❌ Failed to load from localStorage:', error)
      return null
    }
  }
  
  // Clear localStorage for project
  function clearLocalStorage(projectId) {
    try {
      const key = getStorageKey(projectId)
      localStorage.removeItem(key)
      isDirty.value = false
      console.log('🗑️ Cleared localStorage:', key)
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error)
    }
  }
  
  // Auto-save watcher with debouncing
  function setupAutoSave(projectId, data, delay = 1000) {
    let timeout = null
    
    const stopWatcher = watch(
      () => data,
      (newData) => {
        if (!newData || !projectId) return
        
        isDirty.value = true
        
        // Debounce saves
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          saveToLocalStorage(projectId, newData)
        }, delay)
      },
      { deep: true, immediate: false }
    )
    
    return stopWatcher
  }
  
  // Sync to database (only when user clicks save)
  async function syncToDatabase(projectId) {
    try {
      const localData = loadFromLocalStorage(projectId)
      if (!localData) {
        throw new Error('No local data to sync')
      }
      
      console.log('🔄 Syncing to database...', projectId)
      
      // Remove draft metadata before syncing
      const { lastModified, isDraft, ...projectData } = localData
      
      const result = await projectStore.updateProject(projectId, projectData)
      
      if (result.success) {
        // Clear localStorage after successful sync
        clearLocalStorage(projectId)
        console.log('✅ Synced to database successfully')
        return { success: true }
      } else {
        throw new Error(result.error || 'Sync failed')
      }
    } catch (error) {
      console.error('❌ Database sync failed:', error)
      return { success: false, error: error.message }
    }
  }
  
  return {
    isDirty,
    lastSaved,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    setupAutoSave,
    syncToDatabase
  }
}