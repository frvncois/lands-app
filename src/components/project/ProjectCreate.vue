<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAlertStore } from '@/stores/alert'
import ProjectType from '@/components/project/ProjectType.vue'
import ProjectBand from '@/components/project/ProjectBand.vue'
import ProjectThemes from '@/components/project/ProjectThemes.vue'
import ButtonMain from '../button/ButtonMain.vue'

const props = defineProps({
  userId: {
    type: String,
    default: null
  },
  userProfile: {
    type: Object,
    default: () => ({})
  },
  userStore: {
    type: Object,
    default: null
  }
})

const router = useRouter()

// Use userStore from props (passed from parent) or import directly
const userStore = props.userStore || useUserStore()
const alertStore = useAlertStore()
const emit = defineEmits(['project-created', 'cancel'])

const currentStep = ref(1)
const selectedProjectType = ref(null)
const projectData = ref({})
const isCreating = ref(false)
const createError = ref(null)

const steps = [
  { id: 1, name: 'Project Type', component: 'ProjectType' },
  { id: 2, name: 'Project Setup', component: 'ProjectSetup' },
  { id: 3, name: 'Layout Selection', component: 'ProjectThemes' }
]

// Navigation computed properties
const leftButtonText = computed(() => {
  if (currentStep.value === 1) return 'Cancel'
  return 'Go back'
})

const rightButtonText = computed(() => {
  if (currentStep.value === 1) return 'Set your details →'
  if (currentStep.value === 2) return 'Select a layout →'
  if (currentStep.value === 3) return 'Create project'
  return 'Next →'
})

const canGoForward = computed(() => {
  if (currentStep.value === 1) return selectedProjectType.value !== null
  if (currentStep.value === 2) return projectData.value.name?.trim().length > 0
  if (currentStep.value === 3) return true // Can create project at themes step
  return false
})

function handleProjectTypeSelected(projectType) {
  selectedProjectType.value = projectType
  projectData.value.selectedType = projectType
  projectData.value.type = projectType.id
  console.log('🎯 Project type selected:', projectType.name)
}

function handleProjectDataUpdated(data) {
  projectData.value = { ...projectData.value, ...data }
}

function handleContinueToThemes(data) {
  console.log('📋 Continue to themes with data:', data)
  projectData.value = { ...projectData.value, ...data }
}

async function handleCreateProject(data) {
  console.log('🚀 Creating NEW project with data:', data)
  
  isCreating.value = true
  createError.value = null
  
  // Show updating alert
  alertStore.showUpdating('Creating your project...')
  
  try {
    // Create project via user store
    const result = await userStore.createProject({
      name: data.name,
      description: data.description || '',
      type: data.type,
      design: data.design || {},
      url_slug: data.url_slug || ''
    })
    
    if (result.success) {
      const projectId = result.projectId || result.data?.id
      console.log('✅ Project created with ID:', projectId)
      
      // Apply fetched data if available
      if (projectId && data.fetchedData) {
        const project = userStore.projects.find(p => p.id === projectId)
        if (project) {
          console.log('🔧 Applying fetched data to new project:', project.name)
          project.description = data.fetchedData.description || project.description
          
          if (data.fetchedData.releases?.length > 0) {
            project.releases = project.releases || []
            project.releases.push(...data.fetchedData.releases)
            console.log('📀 Added releases:', data.fetchedData.releases.length)
          }
          
          if (data.fetchedData.socials?.length > 0) {
            project.socials = project.socials || []
            project.socials.push(...data.fetchedData.socials)
            console.log('🔗 Added socials:', data.fetchedData.socials.length)
          }
          
          project.musicbrainzData = data.fetchedData.musicbrainzData
          console.log('✅ Project created with external data')
        }
      }
      
      // Show success alert
      alertStore.showSuccess('Project created successfully!')
      
      // Emit project created event
      emit('project-created', { projectId, project: result.data })
      
      // Navigate to the created project
      router.push(`/projects/${projectId}`)
      
      console.log('✅ Project creation completed, navigating to project')
      
    } else {
      createError.value = result.error || 'Failed to create project'
      alertStore.showError(createError.value)
      console.error('❌ Project creation failed:', createError.value)
    }
  } catch (error) {
    createError.value = error.message || 'An unexpected error occurred'
    alertStore.showError(createError.value)
    console.error('❌ Project creation error:', error)
  } finally {
    isCreating.value = false
  }
}

function handleLeftButtonClick() {
  if (currentStep.value === 1) {
    // Cancel and close modal
    emit('cancel')
  } else {
    // Go back to previous step
    currentStep.value--
  }
}

function handleRightButtonClick() {
  if (currentStep.value === 1) {
    // Move to step 2 (Set your details)
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    // Move to step 3 (Select a layout)
    currentStep.value = 3
  } else if (currentStep.value === 3) {
    // Create project
    const finalProjectData = {
      ...projectData.value,
      design: projectData.value.design || {}
    }
    handleCreateProject(finalProjectData)
  }
}

function getCurrentStepComponent() {
  switch (currentStep.value) {
    case 1:
      return ProjectType
    case 2:
      if (selectedProjectType.value?.id === 'music-artist') {
        return ProjectBand
      }
      return ProjectBand
    case 3:
      return ProjectThemes
    default:
      return ProjectType
  }
}
</script>

<template>
  <ul class="modal">
    <li class="content">
      <component
        :is="getCurrentStepComponent()"
        :project-data="projectData"
        :user-store="userStore"
        @project-type-selected="handleProjectTypeSelected"
        @project-data-updated="handleProjectDataUpdated"
        @continue-to-themes="handleContinueToThemes"
        @create-project="handleCreateProject"
      />
      
      <ul>
        <li class="actions">
          <ButtonMain 
            class="dark" 
            :label="leftButtonText" 
            :disabled="isCreating" 
            @click="handleLeftButtonClick" 
          />
          <ButtonMain 
            class="light" 
            :label="rightButtonText" 
            :disabled="isCreating || !canGoForward" 
            @click="handleRightButtonClick" 
          />
        </li>
      </ul>

      <!-- Loading State -->
      <div v-if="isCreating" class="overlay">
      </div>
    </li>
  </ul>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
}
.header {
  padding: var(--space-lg) 0;
  border-bottom: 1px solid var(--border);
}
.form {
  padding: 0 var(--space-lg);
}
.actions {
  align-items: stretch;
  display: flex;
  justify-content: space-between;
  padding: var(--space-md);
  border-top: 1px solid var(--border);
  background: var(--nav);
  align-items: stretch;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}
</style>