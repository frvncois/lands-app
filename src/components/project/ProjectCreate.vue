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

function handleCreateProject(data) {
  console.log('🚀 Creating NEW project with data:', data)
  // ALWAYS create a new project - never check for existing ones
  const projectId = projectStore.create(data.name, data.design?.theme, data.type)
  
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
      console.log('✅ New project created with data')
    }
  }
  
  if (projectId) {
    emit('project-created')
    router.push('/')
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
          >
            ← Back
          </button>
        </div>

        <div class="nav-center">
          <button 
            class="nav-button cancel"
            @click="handleCancel"
          >
            Cancel
          </button>
        </div>

        <div class="nav-right">
          <button 
            v-if="currentStep < 3 && canGoForward"
            class="nav-button primary"
            @click="goForward"
          >
            Continue →
          </button>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
ul.modal {
  position: fixed;
  overflow: scroll;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  background-color: var(--modal);
  backdrop-filter: blur(1em);

  & li.content {
    width: 35vw;
    margin-top: var(--space-lg);
    border-radius: var(--radius-lg);
    background-color: var(--bg);
    display: flex;
    flex-direction: column;
  }
}

.steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--border);

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    flex: 1;
    position: relative;


    .number {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-sm);
      font-weight: bold;
      border: 1px solid var(--border);
      background-color: var(--bg);
      color: var(--details);
      transition: all var(--transition-smooth);
    }

    .title {
      font-size: var(--font-xs);
      font-family: 'mono';
      text-transform: uppercase;
      color: var(--details);
      text-align: center;
    }

    &.active {
      .number {
        border-color: var(--light);
        color: var(--light);
      }
      .title{
        color: var(--text-primary);
      }
    }

    &.completed {
      .step-number {
        border-color: var(--success);
        background-color: var(--success);
        color: var(--bg);
      }
      .step-name {
        color: var(--success);
      }
    }

    &.disabled {
      opacity: 0.5;
    }
  }
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.navigation {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-top: 1px solid var(--border);

  .nav-left, .nav-right {
    display: flex;
  }

  .nav-right {
    justify-content: flex-end;
  }

  .nav-center {
    display: flex;
    justify-content: center;
  }

  .nav-button {
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-size: var(--font-sm);
    font-family: 'mono';
    text-transform: uppercase;
    cursor: pointer;
    transition: all var(--transition-smooth);
    border: 1px solid var(--border);

    &.primary {
      background-color: var(--focus);
      color: var(--bg);
      border-color: var(--focus);

      &:hover {
        background-color: var(--focus-hover);
        transform: translateY(-1px);
      }
    }

    &.secondary {
      background-color: var(--card);
      color: var(--text-primary);

      &:hover {
        background-color: var(--dark-hover);
        border-color: var(--focus);
      }
    }

    &.cancel {
      background-color: transparent;
      color: var(--details);
      border-color: transparent;

      &:hover {
        color: var(--text-primary);
        background-color: var(--card);
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
      }
    }
  }
}
</style>