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
          <span v-if="hasUnsavedChanges" class="unsaved-indicator">
            ● Unsaved changes
          </span>
          
          <ButtonMain
            :label="isSaving ? 'Saving...' : 'Save'"
            :buttonStyle="hasUnsavedChanges ? 'light' : 'dark'"
            :disabled="isSaving || isPublishing"
            @click="saveProject"
          />
          <ButtonMain
            :label="isPublishing ? 'Publishing...' : (userStore.currentProject.settings?.published ? 'Published' : 'Publish')"
            :buttonStyle="userStore.currentProject.settings?.published ? 'light' : 'light'"
            :disabled="isSaving || isPublishing || hasUnsavedChanges"
            @click="publishProject"
          />
        </div>
      </li>
      
      <!-- Only show if we have a selected theme -->
      <li class="display" :class="viewMode" v-if="selectedThemeComponent">
        <div class="background-preview" :style="{ backgroundColor: currentBackgroundColor }"></div>
        <div class="viewport" :style="{ aspectRatio }">
          <div class="screen">
            <component 
              :is="selectedThemeComponent"
              :project="userStore.currentProject"
            />
          </div>
        </div>
      </li>
      
      <li v-else class="no-theme">
        <p>No theme selected.</p>
        <p>Go to the Design tab and select a theme!</p>
        
        <!-- Debug info -->
        <details class="debug-info">
          <summary>Debug Info</summary>
          <pre>{{ debugInfo }}</pre>
        </details>
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

const userStore = props.userStore || useUserStore()

const isSaving = ref(false)
const isPublishing = ref(false)
const viewMode = ref('mobile')
const originalProjectData = ref(null)

// Initialize original data when project loads
watch(() => userStore.currentProject, (newProject) => {
  if (newProject) {
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

// Get the selected theme component from themes list
const selectedThemeComponent = computed(() => {
  const currentProject = userStore.currentProject
  if (!currentProject?.design?.themeId && !currentProject?.design?.theme?.id) {
    return null
  }
  
  // Get theme ID from either themeId or theme.id
  const themeId = currentProject.design.themeId || currentProject.design.theme?.id
  if (!themeId) return null
  
  // Find the theme in the themes list
  const theme = themes.find(t => t.id === themeId)
  return theme?.component || null
})

const currentBackgroundColor = computed(() => {
  return userStore.currentProject?.design?.backgroundColor || '#ffffff'
})

const aspectRatio = computed(() => {
  return viewMode.value === 'mobile' ? '9/19.5' : '16/10'
})

// Debug information
const debugInfo = computed(() => {
  const currentProject = userStore.currentProject
  if (!currentProject) return 'No project'
  
  return {
    themeId: currentProject?.design?.themeId,
    themeObject: currentProject?.design?.theme,
    hasSelectedTheme: !!selectedThemeComponent.value,
    availableThemes: themes.map(t => ({ id: t.id, title: t.title }))
  }
})

// Viewport controls
function setMobileView() {
  viewMode.value = 'mobile'
}

function setDesktopView() {
  viewMode.value = 'desktop'
}

// Save and publish functions
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
        ...currentData,
        ...parsedLocalData,
        // Preserve content arrays with proper image handling
        links: mergeContentArrays(currentData.links, parsedLocalData.links),
        socials: mergeContentArrays(currentData.socials, parsedLocalData.socials),
        contacts: mergeContentArrays(currentData.contacts, parsedLocalData.contacts),
        posts: mergeContentArrays(currentData.posts, parsedLocalData.posts),
        releases: mergeContentArrays(currentData.releases, parsedLocalData.releases),
        shows: mergeContentArrays(currentData.shows, parsedLocalData.shows),
        merch: mergeContentArrays(currentData.merch, parsedLocalData.merch)
      }
    }
    
    // Find only changed fields to optimize database calls
    const changes = getChangedFields(originalProjectData.value, currentData)
    
    console.log('🔍 Detected changes:', Object.keys(changes))
    
    if (Object.keys(changes).length === 0) {
      console.log('ℹ️ No changes detected, skipping database call')
      
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
    
    // Then publish via user store
    const result = await userStore.publishProject(userStore.currentProject.id)
    
    if (result.success) {
      console.log('✅ Project published successfully')
    } else {
      throw new Error(result.error || 'Failed to publish project')
    }
    
  } catch (error) {
    console.error('❌ Error publishing project:', error)
    alert('Failed to publish project. Please try again.')
  } finally {
    isPublishing.value = false
  }
}

// Helper function to compare objects and find changed fields
function getChangedFields(original, current) {
  const changes = {}
  
  // Compare all top-level properties
  for (const key in current) {
    if (JSON.stringify(original[key]) !== JSON.stringify(current[key])) {
      changes[key] = current[key]
    }
  }
  
  // Check for deleted properties
  for (const key in original) {
    if (!(key in current)) {
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
  color: var(--warning-txt);
  font-size: var(--font-sm);
  font-family: 'mono';
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-rg);
  border: 1px solid var(--warning-border);
  background: var(--warning);
  font-family: 'mono';
  text-transform: uppercase;
}

.display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewport {
  width: 100%;
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
  border-radius: 100%;
  filter: blur(10em);
  width: 50vw;
  margin: 10vh auto;
  opacity: 0.025;
  mix-blend-mode: screen;
}

/* Desktop Browser Frame */


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
  max-width: 24vw;
  padding: var(--space-md);
  background: var(--dark);
  position: relative;
}

/* Screen content area */
.screen {
  width: 100%;
  height: 90%;
  overflow: auto;
  background: white;
  position: relative;
  z-index: 1;
}

/* Desktop Browser Frame */
.display.desktop .screen {
  height: calc(100% - 32px);
}


.no-theme {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  gap: var(--space-md);
}

.debug-info {
  margin-top: var(--space-md);
  padding: var(--space-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
}

.debug-info pre {
  margin: 0;
  white-space: pre-wrap;
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