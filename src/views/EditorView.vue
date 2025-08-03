<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionTitle from '@/components/global/SectionTitle.vue'
import NavTab from '@/components/global/NavTab.vue'
import ContentList from '@/components/content/ContentList.vue'
import DesignList from '@/components/design/DesignList.vue'
import ProjectSetting from '@/components/project/ProjectSetting.vue'

const props = defineProps({
  userStore: {
    type: Object,
    required: true
  }
})

const route = useRoute()
const router = useRouter()

// Use the reactive data from the store passed as prop
const project = computed(() => props.userStore.currentProject)
const activeTab = ref('general')

const tabItems = [
  { id: 'general', label: 'General' },
  { id: 'design', label: 'Design' },
  { id: 'settings', label: 'Settings' }
]

// Local state for auto-save functionality
let saveTimeout = null
const hasUnsavedChanges = ref(false)

onMounted(async () => {
  const projectId = route.params.id
  
  // Set current project in store
  props.userStore.setCurrentProject(projectId)
  
  // Load localStorage draft for auto-save functionality
  await loadFromLocalStorage(projectId)
})

function handleTabChange(tabId) {
  activeTab.value = tabId
}

function handleEditProject(projectId) {
  router.push({ name: 'project', params: { id: projectId } })
}

function handleCreateProject() {
  router.push({ name: 'projects' })
}

// Auto-save functionality (localStorage for drafts)
async function loadFromLocalStorage(projectId) {
  try {
    const draftKey = `project_draft_${projectId}`
    const savedDraft = localStorage.getItem(draftKey)
    
    if (savedDraft) {
      console.log('📄 Draft found for project:', projectId)
      // Could restore draft data here if needed
      hasUnsavedChanges.value = true
    }
  } catch (error) {
    console.error('❌ Failed to load draft:', error)
  }
}

function saveToLocalStorage(projectId, data) {
  try {
    const draftKey = `project_draft_${projectId}`
    localStorage.setItem(draftKey, JSON.stringify(data))
    hasUnsavedChanges.value = true
    console.log('💾 Draft saved to localStorage')
  } catch (error) {
    console.error('❌ Failed to save draft:', error)
  }
}

function clearLocalStorage(projectId) {
  try {
    const draftKey = `project_draft_${projectId}`
    localStorage.removeItem(draftKey)
    hasUnsavedChanges.value = false
    console.log('🧹 Draft cleared from localStorage')
  } catch (error) {
    console.error('❌ Failed to clear draft:', error)
  }
}

// Auto-save with debouncing
function scheduleAutoSave(projectId, data) {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  
  saveTimeout = setTimeout(() => {
    saveToLocalStorage(projectId, data)
  }, 1000) // Save after 1 second of inactivity
}

// Save project data to the store
async function saveProject() {
  if (!project.value) return
  
  try {
    const result = await props.userStore.updateProject(project.value.id, project.value)
    if (result.success) {
      console.log('✅ Project saved to server')
      clearLocalStorage(project.value.id)
    } else {
      console.error('❌ Failed to save project:', result.error)
    }
  } catch (error) {
    console.error('❌ Error saving project:', error)
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  props.userStore.clearCurrentProject()
})
</script>

<template>
  <ul class="content" v-if="project">
    <li>
      <SectionTitle 
        title="Edit Project"
        :showDropdown="true"
        :projects="userStore.projects"
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
      <ContentList 
        :project="project" 
        :user-store="userStore" 
      />
    </li>

    <li v-if="activeTab === 'design'">
      <DesignList 
        :project="project" 
        :user-store="userStore" 
      />
    </li>

    <li v-if="activeTab === 'settings'">
      <ProjectSetting 
        :project="project" 
        :user-store="userStore" 
      />
    </li>
  </ul>

  <div v-else class="loading-state">
    <p>Loading project...</p>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--details);
  font-family: 'mono';
  text-transform: uppercase;
  font-size: var(--font-sm);
}
</style>