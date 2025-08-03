<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
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

const project = computed(() => props.userStore.currentProject)
const activeTab = ref('general')

const tabItems = [
  { id: 'general', label: 'General' },
  { id: 'design', label: 'Design' },
  { id: 'settings', label: 'Settings' }
]

onMounted(async () => {
  const projectId = route.params.id
  
  // Set current project in store
  props.userStore.setCurrentProject(projectId)
  
  // EditorView is special - it needs the specific project data
  // If project not found, it means App.vue data is incomplete
  if (!project.value) {
    console.log('📊 Project not found, may need to wait for data...')
    // The project should be available from App.vue initialization
    // If not, there might be a routing issue
  }
  
  // Load localStorage draft
  await loadFromLocalStorage(projectId)
})

// ... localStorage functions stay the same ...
// (all the localStorage and auto-save functionality remains)

// Cleanup on unmount
onUnmounted(() => {
  clearTimeout(saveTimeout)
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
      <ContentList :project="project" :user-store="userStore" />
    </li>

    <li v-if="activeTab === 'design'">
      <DesignList :project="project" :user-store="userStore" />
    </li>

    <li v-if="activeTab === 'settings'">
      <ProjectSetting :project="project" :user-store="userStore" />
    </li>
  </ul>

  <div v-else class="loading-state">
    <p>Loading project...</p>
  </div>
</template>