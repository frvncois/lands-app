<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projects'
import ProjectType from '@/components/project/ProjectType.vue'
import ProjectBand from '@/components/project/ProjectBand.vue'
import ProjectThemes from '@/components/project/ProjectThemes.vue'

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
      <div class="steps">
        <div 
          v-for="step in steps" 
          :key="step.id"
          class="step"
          :class="{ 
            active: step.id === currentStep, 
            completed: step.id < currentStep,
            disabled: step.id > currentStep
          }"
        >
          <div class="number">{{ step.id }}</div>
          <div class="title">{{ step.name }}</div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="createError" class="error-message">
        <p>❌ {{ createError }}</p>
        <button @click="createError = null">Dismiss</button>
      </div>

      <!-- Current Step Component -->
      <div class="step-content">
        <component
          :is="getCurrentStepComponent()"
          :project-data="projectData"
          @project-type-selected="handleProjectTypeSelected"
          @project-data-updated="handleProjectDataUpdated"
          @continue-to-themes="handleContinueToThemes"
          @create-project="handleCreateProject"
        />
      </div>

      <!-- Navigation Footer -->
      <div class="navigation">
        <div class="nav-left">
          <button 
            v-if="canGoBack"
            class="nav-button secondary"
            @click="goBack"
            :disabled="isCreating"
          >
            ← Back
          </button>
        </div>

        <div class="nav-right">
          <button 
            v-if="currentStep < 3 && canGoForward"
            class="nav-button primary"
            @click="goForward"
            :disabled="isCreating"
          >
            Next →
          </button>
          
          <button 
            class="nav-button secondary"
            @click="handleCancel"
            :disabled="isCreating"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isCreating" class="creating-overlay">
        <p>Creating your project...</p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.content {
  background: var(--card);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  max-width: 600px;
  width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.steps {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
  justify-content: center;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step.completed {
  opacity: 0.8;
}

.step .number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.step.active .number {
  background: var(--accent);
  color: white;
}

.step.completed .number {
  background: var(--success);
  color: white;
}

.error-message {
  background: var(--error-bg);
  border: 1px solid var(--error);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message p {
  margin: 0;
  color: var(--error);
}

.error-message button {
  background: none;
  border: none;
  color: var(--error);
  cursor: pointer;
  text-decoration: underline;
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border);
}

.nav-right {
  display: flex;
  gap: var(--space-md);
}

.nav-button {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-button.primary {
  background: var(--accent);
  color: white;
}

.nav-button.secondary {
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
}

.nav-button:hover:not(:disabled) {
  opacity: 0.8;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.creating-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
}

.creating-overlay p {
  color: white;
  font-size: var(--font-lg);
  font-weight: 500;
}
</style>