<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/projects'

import SectionTitle from '@/components/global/SectionTitle.vue'
import NavTab from '@/components/global/NavTab.vue'

import ContentList from '@/components/content/ContentList.vue'
import IntegrationsList from '@/components/integrations/IntegrationsList.vue'
import DesignList from '@/components/design/DesignList.vue'
import SettingProject from '@/components/project/ProjectSetting.vue'

const route = useRoute()
const projectStore = useProjectStore()

onMounted(() => {
  const projectId = route.params.id
  projectStore.setCurrentProject(projectId)
  
  // Load from localStorage if exists
  loadFromLocalStorage(projectId)
})

const project = computed(() => projectStore.currentProject)
const activeTab = ref('general')

const tabItems = [
  { id: 'general', label: 'General' },
  { id: 'design', label: 'Design' },
  { id: 'settings', label: 'Settings' }
]

function handleTabChange(tabId) {
  activeTab.value = tabId
}

// Auto-save to localStorage functionality
function getLocalStorageKey(projectId) {
  return `project_draft_${projectId}`
}

function saveToLocalStorage(projectId, projectData) {
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

function loadFromLocalStorage(projectId) {
  try {
    const key = getLocalStorageKey(projectId)
    const savedData = localStorage.getItem(key)
    
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      console.log('📖 Loaded project data from localStorage:', key)
      
      // Merge saved data with current project, preserving structure
      if (project.value) {
        Object.assign(project.value, parsedData)
        console.log('✅ Project data restored from localStorage')
      }
    }
  } catch (error) {
    console.error('❌ Failed to load from localStorage:', error)
  }
}

function handleEditProject(projectId) {
  // Navigate to the project (or current logic)
  projectStore.setCurrentProject(projectId)
}

function handleCreateProject() {
  // Navigate to home or handle project creation
  router.push('/')
}

function clearLocalStorage(projectId) {
  try {
    const key = getLocalStorageKey(projectId)
    localStorage.removeItem(key)
    console.log('🗑️ Cleared localStorage for project:', key)
  } catch (error) {
    console.error('❌ Failed to clear localStorage:', error)
  }
}

// Debug logging for all data changes
function logDataChange(newProject, oldProject) {
  console.group('🔍 EDITOR DEBUG - Data Change Detected')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🆔 Project ID:', route.params.id)
  console.log('📝 Project Name:', newProject?.name)
  
  // Log basic project info
  console.log('📋 Basic Info:', {
    name: newProject?.name,
    description: newProject?.description,
    url_slug: newProject?.url_slug,
    projectType: newProject?.projectType
  })
  
  // Log design settings
  console.log('🎨 Design Settings:', {
    backgroundColor: newProject?.design?.backgroundColor,
    textColor: newProject?.design?.textColor,
    accentColor: newProject?.design?.accentColor,
    font: newProject?.design?.font,
    titleFont: newProject?.design?.titleFont,
    textFont: newProject?.design?.textFont,
    theme: newProject?.design?.theme,
    themeId: newProject?.design?.themeId
  })
  
  // Log content arrays with counts
  console.log('📄 Content Arrays:', {
    links: `${newProject?.links?.length || 0} items`,
    socials: `${newProject?.socials?.length || 0} items`,
    posts: `${newProject?.posts?.length || 0} items`,
    releases: `${newProject?.releases?.length || 0} items`,
    shows: `${newProject?.shows?.length || 0} items`,
    merch: `${newProject?.merch?.length || 0} items`
  })
  
  // Log detailed content arrays
  if (newProject?.links?.length > 0) {
    console.log('🔗 Links Data:', newProject.links)
  }
  if (newProject?.socials?.length > 0) {
    console.log('📱 Socials Data:', newProject.socials)
  }
  if (newProject?.posts?.length > 0) {
    console.log('📝 Posts Data:', newProject.posts)
  }
  if (newProject?.releases?.length > 0) {
    console.log('🎵 Releases Data:', newProject.releases)
  }
  if (newProject?.shows?.length > 0) {
    console.log('🎤 Shows Data:', newProject.shows)
  }
  if (newProject?.merch?.length > 0) {
    console.log('🛍️ Merch Data:', newProject.merch)
  }
  
  // Log other metadata
  console.log('🌍 Other Metadata:', {
    coverImage: newProject?.coverImage ? 'Has image' : 'No image',
    location: newProject?.location,
    contacts: newProject?.contacts?.length || 0,
    socialLinks: newProject?.socialLinks?.length || 0,
    musicbrainzData: newProject?.musicbrainzData ? 'Has data' : 'No data'
  })
  
  // Log settings
  console.log('⚙️ Settings:', {
    published: newProject?.settings?.published,
    plan: newProject?.settings?.plan,
    url: newProject?.settings?.url,
    subscriptionStatus: newProject?.settings?.subscriptionStatus
  })
  
  // Log complete project structure for mapping
  console.log('🗂️ Complete Project Structure:', JSON.stringify(newProject, null, 2))
  
  console.groupEnd()
}

// Watch for changes and auto-save
let saveTimeout = null

watch(
  () => project.value,
  (newProject, oldProject) => {
    if (newProject && route.params.id) {
      // Debug log all changes
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
      <IntegrationsList :project="project" />
    </li>

    <li v-if="activeTab === 'design'">
      <DesignList :project="project" />
    </li>

    <li v-if="activeTab === 'settings'">
      <SettingProject :project="project" />
    </li>
  </ul>
</template>