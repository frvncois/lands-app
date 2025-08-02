<script setup>
import { computed, ref } from 'vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import { useProjectStore } from '@/stores/projects'
import { themes } from '@/components/theme/ThemeList.js'

const projectStore = useProjectStore()
const isSaving = ref(false)
const isPublishing = ref(false)

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
        <div>
          <ButtonMain
            label="mobile"
            buttonStyle="light"
          />
          <ButtonMain
            label="desktop"
            buttonStyle="light"
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
      
      <li class="display" v-if="selectedThemeComponent">
        <component 
          :is="selectedThemeComponent" 
          :project="projectStore.currentProject"
          :preview="true"
        />
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
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.save-publish {
  display: flex;
  gap: var(--space-sm);
}

.display {
  flex: 1;
  overflow: auto;
  background: white;
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