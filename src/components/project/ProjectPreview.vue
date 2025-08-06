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
      
      <!-- Only show if we have an AI theme -->
      <li class="display" :class="viewMode" v-if="aiThemeComponent">
        <div class="background-preview" :style="{ backgroundColor: currentBackgroundColor }"></div>
        <div class="viewport" :style="{ aspectRatio }">
          <div class="screen">
          <component 
            :is="aiThemeComponent"
            :project="userStore.currentProject"
            :aiStyles="userStore.currentProject.design?.aiTheme?.code"
            />
          </div>
        </div>
      </li>
      
      <li v-else class="no-theme">
        <p>No theme generated yet.</p>
        <p>Go to the Design tab and generate a custom AI theme!</p>
        
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
import { computed, ref, watch, defineAsyncComponent } from 'vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import { useUserStore } from '@/stores/user'

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

// Create AI theme component dynamically from generated code
const aiThemeComponent = computed(() => {
  const theme = userStore.currentProject?.design?.aiTheme
  if (!theme?.code) return null

  // Extract <style scoped> block
  const styleMatch = theme.code.match(/<style scoped>([\s\S]*?)<\/style>/)
  if (!styleMatch || !styleMatch[1]) return null

  const scopedStyles = styleMatch[1]

return defineAsyncComponent(() => {
  return import('@/components/theme/ThemeMinimal.vue').then((module) => {
    return {
      ...module.default,
      props: {
        ...module.default.props,
        aiStyles: {
          type: String,
          default: scopedStyles
        }
      }
    }
  })
})
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
    hasAiTheme: !!currentProject?.design?.aiTheme,
    aiThemeTitle: currentProject?.design?.aiTheme?.title,
    hasAiThemeCode: !!currentProject?.design?.aiTheme?.code,
    codePreview: currentProject?.design?.aiTheme?.code?.substring(0, 200) + '...'
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
  isSaving.value = true
  try {
    console.log('💾 Saving project...')
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    isSaving.value = false
  }
}

async function publishProject() {
  isPublishing.value = true
  try {
    console.log('🚀 Publishing project...')
    await new Promise(resolve => setTimeout(resolve, 1000))
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
  border-radius: 100%;
  filter: blur(10em);
  width: 50vw;
  margin: 10vh auto;
  opacity: 0.025;
  mix-blend-mode: screen;
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
  background: white;
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