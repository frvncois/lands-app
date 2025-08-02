<script setup>
import { ref, computed, onMounted, watch, onUnmounted, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/projects'

import SectionTitle from '@/components/global/SectionTitle.vue'
import NavTab from '@/components/global/NavTab.vue'
import ContentList from '@/components/content/ContentList.vue'
import DesignList from '@/components/design/DesignList.vue'
import SettingProject from '@/components/project/ProjectSetting.vue'

const route = useRoute()
const projectStore = useProjectStore()

const project = computed(() => projectStore.currentProject)
const activeTab = ref('general')

const tabItems = [
  { id: 'general', label: 'General' },
  { id: 'design', label: 'Design' },
  { id: 'settings', label: 'Settings' }
]

onMounted(async () => {
  const projectId = route.params.id
  
  // Set current project in store
  projectStore.setCurrentProject(projectId)
  
  // Load from localStorage if exists
  await loadFromLocalStorage(projectId)
})

// Auto-save functionality
function getLocalStorageKey(projectId) {
  return `project_draft_${projectId}`
}

async function saveToLocalStorage(projectId, projectData) {
  try {
    const key = getLocalStorageKey(projectId)
    const dataToSave = {
      ...projectData,
      lastSaved: new Date().toISOString()
    }
    localStorage.setItem(key, JSON.stringify(dataToSave))
    console.log('💾 Project data saved to localStorage:', key)
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error)
  }
}

async function loadFromLocalStorage(projectId) {
  try {
    const key = getLocalStorageKey(projectId)
    const savedData = localStorage.getItem(key)
    
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      console.log('📂 Loading project data from localStorage:', key)
      
      // Merge saved data with current project data
      if (project.value && parsedData) {
        Object.assign(project.value, parsedData)
        console.log('✅ Project data loaded from localStorage')
      }
    }
  } catch (error) {
    console.error('❌ Failed to load from localStorage:', error)
  }
}

function clearLocalStorageDraft(projectId) {
  try {
    const key = getLocalStorageKey(projectId)
    localStorage.removeItem(key)
    console.log('🗑️ Cleared localStorage draft:', key)
  } catch (error) {
    console.error('❌ Failed to clear localStorage:', error)
  }
}

// Tab change handler
function handleTabChange(tabId) {
  activeTab.value = tabId
}

// Project dropdown handlers
function handleEditProject(projectId) {
  if (projectId && projectId !== route.params.id) {
    projectStore.setCurrentProject(projectId)
  }
}

function handleCreateProject() {
  // Handle project creation navigation
  console.log('🆕 Navigate to create project')
}

// Debug logging for data changes
function logDataChange(newProject, oldProject) {
  if (!newProject) return
  
  console.group('🔄 Project Data Change Detected')
  
  // Log basic info
  console.log('📋 Basic Info:', {
    id: newProject.id,
    name: newProject.name,
    description: newProject.description,
    projectType: newProject.projectType
  })
  
  // Log content arrays with counts
  console.log('📄 Content Arrays:', {
    links: `${newProject.links?.length || 0} items`,
    socials: `${newProject.socials?.length || 0} items`,
    posts: `${newProject.posts?.length || 0} items`,
    releases: `${newProject.releases?.length || 0} items`,
    shows: `${newProject.shows?.length || 0} items`,
    merch: `${newProject.merch?.length || 0} items`
  })
  
  console.groupEnd()
}

// Auto-save functionality with debouncing
let saveTimeout = null

watch(
  () => project.value,
  (newProject, oldProject) => {
    if (newProject && route.params.id) {
      // Debug log changes
      logDataChange(newProject, oldProject)
      
      // Debounce auto-save (save 2 seconds after last change)
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        saveToLocalStorage(route.params.id, newProject)
      }, 2000)
    }
  },
  { deep: true }
)

// Cleanup on unmount
onUnmounted(() => {
  clearTimeout(saveTimeout)
})
</script>

<template>
  <ul class="content" v-if="project">
    <li>
      <SectionTitle 
        title="Edit Project"
        :showDropdown="true"
        :projects="projectStore.projects"
        :currentProjectId="route.params.id"
        @edit-project="handleEditProject"
        @create-project="handleCreateProject"
      />
    </li>
    
    <li>
      <NavTab 
        :items="tabItems" 
        :activeTab="activeTab" 
        @tab-change="handleTabChange" 
      />
    </li>

    <li v-if="activeTab === 'general'">
      <ContentList :project="project" />
    </li>

    <li v-if="activeTab === 'design'">
      <DesignList :project="project" />
    </li>

    <li v-if="activeTab === 'settings'">
      <SettingProject :project="project" />
    </li>
  </ul>
</template>