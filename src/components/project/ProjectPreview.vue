<script setup>
import { computed } from 'vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import { useProjectStore } from '@/stores/projects'
import { themes } from '@/components/theme/ThemeList.js'

const projectStore = useProjectStore()

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

function publishProject() {
  if (projectStore.currentProject && !projectStore.currentProject.settings.published) {
    projectStore.currentProject.settings.published = true
  }
}
</script>

<template>
  <ul class="preview" v-if="projectStore.currentProject">
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
      <ButtonMain
        :label="projectStore.currentProject.settings.published ? 'Published' : 'Publish'"
        :buttonStyle="projectStore.currentProject.settings.published ? 'dark' : 'light'"
        @click="publishProject"
      />
    </li>
    <li>
      <div class="mobile">
        <!-- Display the selected theme with current project data -->
        <component 
          v-if="selectedThemeComponent" 
          :is="selectedThemeComponent" 
          :project="projectStore.currentProject"
          class="theme-preview"
        />
        
        <!-- Fallback if no theme is selected -->
        <div v-else class="no-theme">
          <h3>{{ projectStore.currentProject.name }}</h3>
          <p>No theme selected</p>
          <div class="theme-info">
            <strong>Theme:</strong> {{ selectedTheme?.title || 'None' }}
          </div>
          <div class="debug-info" style="font-size: 0.7rem; color: #666; margin-top: 1rem;">
            <div>Theme ID: {{ projectStore.currentProject.design?.themeId || 'None' }}</div>
            <div>Legacy Theme: {{ projectStore.currentProject.design?.theme?.id || 'None' }}</div>
          </div>
        </div>
      </div>
    </li>
  </ul>
  
  <ul class="preview" v-else>
    <li class="no-project">
      <p>No project selected</p>
    </li>
  </ul>
</template>

<style scoped>
ul.preview {
  > .actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
    
    > div {
      display: flex;
      gap: var(--space-sm);
    }
  }
}

.mobile {
  aspect-ratio: 9 / 16;
  background: var(--bg);
  border-radius: var(--radius-lg);
  width: 28vw;
  margin: var(--space-lg) auto;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-preview {
  width: 100%;
  height: 100%;
  font-size: 0.8rem; /* Scale down for mobile preview */
  overflow-y: auto;
}

.no-theme {
  padding: var(--space-lg);
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--text-secondary);
}

.no-theme h3 {
  margin: 0 0 var(--space-md) 0;
  color: var(--text-primary);
}

.theme-info {
  margin-top: var(--space-md);
  font-size: var(--font-sm);
}

.no-project {
  text-align: center;
  padding: var(--space-lg);
  color: var(--text-secondary);
}

</style>