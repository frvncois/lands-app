<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projects'
import ProjectType from '@/components/project/ProjectType.vue'
import ProjectBand from '@/components/project/ProjectBand.vue'
import ProjectThemes from '@/components/project/ProjectThemes.vue'
import ButtonMain from '../button/ButtonMain.vue'

const router = useRouter()
const projectStore = useProjectStore()
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

// Computed properties for navigation
const canGoBack = computed(() => currentStep.value > 1)
const canGoForward = computed(() => {
  if (currentStep.value === 1) return selectedProjectType.value !== null
  if (currentStep.value === 2) return projectData.value.name?.trim().length > 0
  return false
})

const currentStepName = computed(() => {
  const step = steps.find(s => s.id === currentStep.value)
  return step ? step.name : 'Unknown Step'
})

function handleProjectTypeSelected(projectType) {
  selectedProjectType.value = projectType
  projectData.value.selectedType = projectType
  projectData.value.type = projectType.id
  console.log('🎯 Project type selected:', projectType.name)
  currentStep.value = 2
}

function handleProjectDataUpdated(data) {
  projectData.value = { ...projectData.value, ...data }
  if (currentStep.value === 2 && data.name?.trim().length > 0) {
    // Data updated
  }
}

function handleContinueToThemes(data) {
  console.log('📋 Continue to themes with data:', data)
  // Just update our local project data - don't create project yet
  projectData.value = { ...projectData.value, ...data }
  if (currentStep.value === 2) {
    currentStep.value = 3
  }
}
async function handleCreateProject(data) {
  console.log('🚀 Creating NEW project with data:', data)
  
  isCreating.value = true
  createError.value = null
  
  try {
    // FIXED: Await the async project creation
    const result = await projectStore.create(data.name, data.design?.theme, data.type)
    
    if (result.success) {
      const projectId = result.data.id
      console.log('✅ Project created with ID:', projectId)
      
      // Apply fetched data if available
      if (projectId && data.fetchedData) {
        const project = projectStore.projects.find(p => p.id === projectId)
        if (project) {
          console.log('🔧 Applying fetched data to new project:', project.name)
          project.description = data.fetchedData.description || project.description
          
          if (data.fetchedData.releases?.length > 0) {
            project.releases.push(...data.fetchedData.releases)
            console.log('📀 Added releases:', data.fetchedData.releases.length)
          }
          
          if (data.fetchedData.socials?.length > 0) {
            project.socials.push(...data.fetchedData.socials)
            console.log('🔗 Added socials:', data.fetchedData.socials.length)
          }
          
          project.musicbrainzData = data.fetchedData.musicbrainzData
          console.log('✅ Project created with external data')
        }
      }
      
      // FIXED: Emit success but DON'T navigate automatically
      // Let the parent component handle navigation
      emit('project-created', { projectId, project: result.data })
      
      // FIXED: Don't navigate here - let SectionTitle handle it
      console.log('✅ Project creation completed, modal will close')
      
    } else {
      // Handle creation failure
      createError.value = result.error || 'Failed to create project'
      console.error('❌ Project creation failed:', createError.value)
    }
  } catch (error) {
    createError.value = error.message || 'An unexpected error occurred'
    console.error('❌ Project creation error:', error)
  } finally {
    isCreating.value = false
  }
}



function goBack() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function goForward() {
  if (currentStep.value === 2 && canGoForward.value) {
    handleContinueToThemes(projectData.value)
  }
}

function handleCancel() {
  emit('cancel')
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
          @project-type-selected="handleProjectTypeSelected"
          @project-data-updated="handleProjectDataUpdated"
          @continue-to-themes="handleContinueToThemes"
          @create-project="handleCreateProject"
        />
        <ul>
          <li class="actions">
              <ButtonMain class="dark" label="Cancel" :disabled="isCreating" @click="emit('goBack')" />
              <ButtonMain class="light" label="Next →" :disabled="isCreating" @click="emit('goForward')" />
          </li>
        </ul>

      <!-- Navigation Footer -->

      <!-- Loading State -->
      <div v-if="isCreating" class="creating-overlay">
        <p>Creating your project...</p>
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
</style>