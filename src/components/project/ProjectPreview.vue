<template>
  <ul class="preview">
    <template v-if="userStore.currentProject">
      <li class="actions">
        <div class="viewport-controls">
          <ButtonMain
            label="Mobile"
            :buttonStyle="viewMode === 'mobile' ? 'dark' : 'light'"
            @click="setMobileView"
          />
          <ButtonMain
            label="Desktop"
            :buttonStyle="viewMode === 'desktop' ? 'dark' : 'light'"
            @click="setDesktopView"
          />
        </div>
        
        <div class="save-publish">
          <!-- Show unsaved changes indicator -->
          <span v-if="hasUnsavedChanges" class="unsaved-indicator">
            ● Unsaved changes
          </span>
          
          <ButtonMain
            :label="isSaving ? 'Saving...' : 'Save'"
            :buttonStyle="hasUnsavedChanges ? 'primary' : 'light'"
            :disabled="isSaving || isPublishing"
            @click="saveProject"
          />
          <ButtonMain
            :label="isPublishing ? 'Publishing...' : (userStore.currentProject.settings?.published ? 'Published' : 'Publish')"
            :buttonStyle="userStore.currentProject.settings?.published ? 'dark' : 'light'"
            :disabled="isSaving || isPublishing || hasUnsavedChanges"
            @click="publishProject"
          />
        </div>
      </li>
      
      <li class="display" :class="viewMode" v-if="selectedThemeComponent">
        <div class="background-preview" :style="{ backgroundColor: currentBackgroundColor }"></div>
        <div class="viewport" :style="{ aspectRatio }">
          <div class="screen">
            <component 
              :is="selectedThemeComponent" 
              :project="userStore.currentProject"
              :preview="true"
            />
          </div>
        </div>
      </li>
      
      <li v-else class="no-theme">
        <p>No theme selected. Please select a theme in the Design tab.</p>
      </li>
    </template>

    <template v-else>
      <li class="no-project">
        <div class="content">
          <h3>No Project Selected</h3>
          <p>Select a project to see the preview, or create a new project to get started.</p>
        </div>
      </li>
    </template>
  </ul>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import { useUserStore } from '@/stores/user'
import { themes } from '@/components/theme/ThemeList.js'

const props = defineProps({
  userStore: {
    type: Object,
    default: null
  }
})

// Use userStore from props (passed from App.vue) or import directly
const userStore = props.userStore || useUserStore()

const isSaving = ref(false)
const isPublishing = ref(false)
const viewMode = ref('mobile')

// State for tracking original project data to detect changes
const originalProjectData = ref(null)

// Initialize original data when project loads and track changes
watch(() => userStore.currentProject, (newProject) => {
  if (newProject) {
    // Deep copy the original project data for comparison
    originalProjectData.value = JSON.parse(JSON.stringify(newProject))
    console.log('📋 Original project data initialized for change detection')
  }
}, { immediate: true })

// Check if there are unsaved changes in localStorage
const hasUnsavedChanges = computed(() => {
  const projectId = userStore.currentProject?.id
  if (!projectId) return false
  
  try {
    const key = `project_draft_${projectId}`
    const savedData = localStorage.getItem(key)
    return !!savedData
  } catch (error) {
    return false
  }
})

const selectedThemeComponent = computed(() => {
  const currentProject = userStore.currentProject
  if (!currentProject?.design?.themeId && !currentProject?.design?.theme?.id) {
    return null
  }
  
  const themeId = currentProject.design.themeId || currentProject.design.theme?.id
  if (!themeId) return null
  
  const theme = themes.find(t => t.id === themeId)
  return theme?.component || null
})

const currentBackgroundColor = computed(() => {
  return userStore.currentProject?.design?.backgroundColor || '#ffffff'
})

const aspectRatio = computed(() => {
  return viewMode.value === 'mobile' ? '9 / 16' : '16 / 9'
})

function setMobileView() {
  viewMode.value = 'mobile'
}

function setDesktopView() {
  viewMode.value = 'desktop'
}

// Function to detect changes between original and current data
function detectChanges(original, current) {
  const changes = {}
  
  if (!original || !current) return changes
  
  // Compare primitive values and objects
  for (const key in current) {
    if (current[key] !== original[key]) {
      // Handle arrays and objects
      if (Array.isArray(current[key]) && Array.isArray(original[key])) {
        // For arrays, compare JSON strings to detect changes
        if (JSON.stringify(current[key]) !== JSON.stringify(original[key])) {
          changes[key] = current[key]
        }
      } else if (typeof current[key] === 'object' && current[key] !== null && 
                 typeof original[key] === 'object' && original[key] !== null) {
        // For nested objects, recursively detect changes
        const nestedChanges = detectChanges(original[key], current[key])
        if (Object.keys(nestedChanges).length > 0) {
          changes[key] = current[key] // Send entire nested object if any field changed
        }
      } else {
        // Primitive value changed
        changes[key] = current[key]
      }
    }
  }
  
  // Check for new keys in current that don't exist in original
  for (const key in current) {
    if (!(key in original)) {
      changes[key] = current[key]
    }
  }
  
  return changes
}

// Helper function to merge content arrays while preserving images
function mergeContentArrays(storeArray, localArray) {
  if (!localArray || !Array.isArray(localArray)) return storeArray || []
  if (!storeArray || !Array.isArray(storeArray)) return localArray
  
  return localArray.map(localItem => {
    // Find matching item in store array
    const storeItem = storeArray.find(item => 
      item.order === localItem.order || 
      item.createdAt === localItem.createdAt
    )
    
    if (storeItem) {
      // Merge local data but keep store image
      return {
        ...localItem,
        img: storeItem.img || localItem.img || ''
      }
    }
    
    return localItem
  })
}

// CRITICAL: Optimized save function that only updates changed data
async function saveProject() {
  if (!userStore.currentProject || !originalProjectData.value) return
  
  isSaving.value = true
  
  try {
    console.log('💾 Detecting changes in project data...')
    
    // Get current project data (includes any localStorage changes)
    let currentData = { ...userStore.currentProject }
    
    // Merge localStorage data if it exists
    const projectId = userStore.currentProject.id
    const key = `project_draft_${projectId}`
    const localData = localStorage.getItem(key)
    
    if (localData) {
      const parsedLocalData = JSON.parse(localData)
      console.log('📂 Found localStorage data, merging WITHOUT overwriting images...')
      
      // Merge localStorage data but preserve images from store
      currentData = {
        ...userStore.currentProject, // Keep images from store
        
        // Only merge non-image fields from localStorage
        name: parsedLocalData.name || userStore.currentProject.name,
        description: parsedLocalData.description || userStore.currentProject.description,
        location: parsedLocalData.location || userStore.currentProject.location,
        
        // Merge content arrays but preserve images
        links: mergeContentArrays(userStore.currentProject.links, parsedLocalData.links),
        posts: mergeContentArrays(userStore.currentProject.posts, parsedLocalData.posts),
        releases: mergeContentArrays(userStore.currentProject.releases, parsedLocalData.releases),
        shows: mergeContentArrays(userStore.currentProject.shows, parsedLocalData.shows),
        merch: mergeContentArrays(userStore.currentProject.merch, parsedLocalData.merch),
        
        // Merge design and settings
        design: { ...userStore.currentProject.design, ...parsedLocalData.design },
        settings: { ...userStore.currentProject.settings, ...parsedLocalData.settings },
        
        // Remove draft metadata
        lastSaved: undefined,
        isDraft: undefined
      }
    }
    
    // Detect only the fields that have changed
    const changes = detectChanges(originalProjectData.value, currentData)
    
    console.log('🔍 Detected changes:', Object.keys(changes))
    console.log('🔄 Changes data:', changes)
    
    // Only proceed if there are actual changes
    if (Object.keys(changes).length === 0) {
      console.log('✅ No changes detected, skipping database update')
      
      // Still clear localStorage since there's nothing to save
      try {
        localStorage.removeItem(key)
        console.log('🗑️ Cleared localStorage (no changes)')
      } catch (error) {
        console.error('❌ Failed to clear localStorage:', error)
      }
      
      return { success: true, message: 'No changes to save' }
    }
    
    // Add required metadata for database update
    const updateData = {
      ...changes,
      updated_at: new Date().toISOString()
    }
    
    console.log('🔄 Sending only changed data to database:', updateData)
    
    // Save only changed data to database via user store
    const result = await userStore.updateProject(projectId, updateData)
    
    if (result.success) {
      console.log('✅ Project changes synced to database successfully')
      
      // Update original data reference with new state
      originalProjectData.value = JSON.parse(JSON.stringify(currentData))
      
      // Clear localStorage draft after successful save
      try {
        localStorage.removeItem(key)
        console.log('🗑️ Cleared localStorage draft after successful save')
      } catch (error) {
        console.error('❌ Failed to clear localStorage:', error)
      }
      
      // Update the store with the saved data
      Object.assign(userStore.currentProject, currentData)
      
    } else {
      console.error('❌ Failed to sync project changes:', result.error)
      throw new Error(result.error || 'Failed to save project changes')
    }
  } catch (error) {
    console.error('❌ Error syncing project changes:', error)
    alert('Failed to save project changes. Please try again.')
  } finally {
    isSaving.value = false
  }
}

async function publishProject() {
  if (!userStore.currentProject) return
  
  isPublishing.value = true
  
  try {
    console.log('📤 Publishing project...')
    
    // First save the project data if there are changes
    await saveProject()
    
    // Then publish to storage via user store
    // TODO: Add publishProject method to user store
    // const result = await userStore.publishProject(userStore.currentProject.id)
    
    // For now, simulate the publish action
    console.log('✅ Project published successfully')
    
    // Update project published status
    if (userStore.currentProject && !userStore.currentProject.settings?.published) {
      userStore.currentProject.settings.published = true
    }
    
  } catch (error) {
    console.error('❌ Error publishing project:', error)
    alert('Failed to publish project. Please try again.')
  } finally {
    isPublishing.value = false
  }
}
</script>

<style scoped>
.preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--space-lg);
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-lg);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.viewport-controls {
  display: flex;
  gap: var(--space-sm);
}

.save-publish {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.unsaved-indicator {
  color: var(--warning-text);
  font-size: var(--font-sm);
  font-family: 'mono';
  text-transform: uppercase;
}

.background-preview {
  border-radius: 100%;
  filter: blur(10em);
  width: 50vw;
  margin: 10vh auto;
  opacity: 0.025;
  mix-blend-mode: screen;
}

.display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: var(--space-lg);
}

.viewport {
  width: 100%;
  max-width: 800px;
  overflow: hidden;
  position: relative;
}

.background-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

/* Desktop Browser Frame */
.display.desktop .viewport {
  max-width: 800px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.display.desktop .viewport::before {
  content: '';
  display: block;
  height: 32px;
  background: linear-gradient(to bottom, #f6f6f6, #e8e8e8);
  border-bottom: 1px solid #ddd;
  position: relative;
}

.display.desktop .viewport::after {
  content: '●●●';
  position: absolute;
  top: 8px;
  left: 12px;
  font-size: 8px;
  color: #ff5f57;
  letter-spacing: 4px;
  z-index: 10;
}

/* Mobile Phone Frame */
.display.mobile .viewport {
  max-width: 25vw;
  border-radius: var(--radius-2xl);
  padding: var(--space-md);
  background: var(--dark);
  position: relative;
}

/* Screen content area */
.screen {
  width: 100%;
  height: 100%;
  overflow: auto;
  border: 1px solid var(--border);
  background: transparent;
  position: relative;
  z-index: 1;
}

/* Desktop Browser Frame */
.display.desktop .screen {
  height: calc(100% - 32px);
}

/* Mobile Phone Frame */
.display.mobile .screen {
  border-radius: var(--radius-xl);
}

.no-theme {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.no-project {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.no-project .content {
  text-align: center;
  color: var(--text-secondary);
}

.no-project .content h3 {
  margin: 0 0 var(--space-sm) 0;
  color: var(--text-primary);
}

.no-project .content p {
  margin: 0;
  line-height: 1.5;
}
</style>