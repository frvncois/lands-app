<script setup>
import { computed, ref } from 'vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import { useProjectStore } from '@/stores/projects'
import { themes } from '@/components/theme/ThemeList.js'

const projectStore = useProjectStore()
const isSaving = ref(false)
const isPublishing = ref(false)
const viewMode = ref('mobile') // Add viewport toggle state

// Get the selected theme component by looking up the theme ID
const selectedThemeComponent = computed(() => {
  const currentProject = projectStore.currentProject
  if (!currentProject?.design?.themeId && !currentProject?.design?.theme?.id) {
    return null
  }
  
  // Support both old format (theme object) and new format (themeId)
  const themeId = currentProject.design.themeId || currentProject.design.theme?.id
  
  if (!themeId) {
    return null
  }
  
  // Look up the theme by ID in the themes list
  const theme = themes.find(t => t.id === themeId)
  return theme?.component || null
})

// Get theme info for display
const selectedTheme = computed(() => {
  const currentProject = projectStore.currentProject
  if (!currentProject?.design?.themeId && !currentProject?.design?.theme?.id) {
    return null
  }
  
  const themeId = currentProject.design.themeId || currentProject.design.theme?.id
  return themes.find(t => t.id === themeId) || null
})

// Viewport toggle functions
function setMobileView() {
  viewMode.value = 'mobile'
}

function setDesktopView() {
  viewMode.value = 'desktop'
}

// Computed aspect ratio based on view mode
const aspectRatio = computed(() => {
  return viewMode.value === 'mobile' ? '9 / 16' : '16 / 9'
})

// Computed background color from project
const currentBackgroundColor = computed(() => {
  return projectStore.currentProject?.design?.backgroundColor || '#ffffff'
})

async function saveProject() {
  if (!projectStore.currentProject) return
  
  isSaving.value = true
  
  try {
    console.log('💾 Saving project data to database...')
    
    // Save current project data to database via project store
    const result = await projectStore.updateProject(
      projectStore.currentProject.id, 
      projectStore.currentProject
    )
    
    if (result.success) {
      console.log('✅ Project saved successfully')
      
      // Clear localStorage draft after successful save
      clearLocalStorageDraft()
    } else {
      console.error('❌ Failed to save project:', result.error)
    }
  } catch (error) {
    console.error('❌ Error saving project:', error)
  } finally {
    isSaving.value = false
  }
}

async function publishProject() {
  if (!projectStore.currentProject) return
  
  isPublishing.value = true
  
  try {
    console.log('📤 Publishing project...')
    
    // First save the project data
    await saveProject()
    
    // Then publish to storage via edge function
    const result = await projectStore.publishProject(projectStore.currentProject.id)
    
    if (result.success) {
      console.log('✅ Project published successfully')
      
      // Update project published status
      if (projectStore.currentProject && !projectStore.currentProject.settings.published) {
        projectStore.currentProject.settings.published = true
      }
    } else {
      console.error('❌ Failed to publish project:', result.error)
    }
  } catch (error) {
    console.error('❌ Error publishing project:', error)
  } finally {
    isPublishing.value = false
  }
}

function clearLocalStorageDraft() {
  if (projectStore.currentProject?.id) {
    try {
      const key = `project_draft_${projectStore.currentProject.id}`
      localStorage.removeItem(key)
      console.log('🗑️ Cleared localStorage draft for project')
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error)
    }
  }
}
</script>

<template>
  <ul class="preview">
    <!-- Show when a project is selected -->
    <template v-if="projectStore.currentProject">
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
          <ButtonMain
            :label="isSaving ? 'Saving...' : 'Save'"
            buttonStyle="light"
            :disabled="isSaving || isPublishing"
            @click="saveProject"
          />
          <ButtonMain
            :label="isPublishing ? 'Publishing...' : (projectStore.currentProject.settings.published ? 'Published' : 'Publish')"
            :buttonStyle="projectStore.currentProject.settings.published ? 'dark' : 'light'"
            :disabled="isSaving || isPublishing"
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
              :project="projectStore.currentProject"
              :preview="true"
            />
          </div>
        </div>
      </li>
      
      <li v-else class="no-theme">
        <p>No theme selected. Please select a theme in the Design tab.</p>
      </li>
    </template>

    <!-- Show when no project is selected -->
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