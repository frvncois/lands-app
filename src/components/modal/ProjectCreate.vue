<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { USE_CASES, getLayoutsByUseCase, getBlankLayout, type UseCaseCategory, type ProjectLayout } from '@/lib/layouts'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'created': [projectId: string]
}>()

const router = useRouter()
const projectsStore = useProjectsStore()

// Multi-step state
const step = ref<'usecase' | 'layout' | 'name'>('usecase')
const selectedUseCase = ref<UseCaseCategory | null>(null)
const selectedLayout = ref<ProjectLayout | null>(null)
const projectTitle = ref('')
const isCreating = ref(false)

// Get layouts for selected use case
const availableLayouts = computed(() => {
  if (!selectedUseCase.value) return []
  return getLayoutsByUseCase(selectedUseCase.value)
})

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    step.value = 'usecase'
    selectedUseCase.value = null
    selectedLayout.value = null
    projectTitle.value = ''
  }
})

function close() {
  if (!isCreating.value) {
    emit('update:open', false)
  }
}

function selectUseCase(useCase: UseCaseCategory) {
  selectedUseCase.value = useCase
  step.value = 'layout'
}

function selectLayout(layout: ProjectLayout) {
  selectedLayout.value = layout
  step.value = 'name'
}

function goBack() {
  if (step.value === 'layout') {
    step.value = 'usecase'
    selectedUseCase.value = null
  } else if (step.value === 'name') {
    step.value = 'layout'
    selectedLayout.value = null
  }
}

function skipToBlank() {
  selectedLayout.value = getBlankLayout()
  step.value = 'name'
}

async function createProject() {
  if (!projectTitle.value.trim() || isCreating.value || !selectedLayout.value) return

  isCreating.value = true
  try {
    const project = await projectsStore.createProject(projectTitle.value, selectedLayout.value)
    if (project) {
      emit('created', project.id)
      close()
      router.push({ name: 'editor', params: { projectId: project.id } })
    }
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-md"
        @click="close"
      ></div>

      <!-- Modal -->
      <div
        class="relative bg-card border border-border rounded-4xl shadow-xl w-full p-10 space-y-10 transition-all duration-200"
        :class="step === 'usecase' ? 'max-w-3xl' : step === 'layout' ? 'max-w-4xl' : 'max-w-md'"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              v-if="step !== 'usecase'"
              class="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              @click="goBack"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 class="text-4xl text-foreground">
                {{ step === 'usecase' ? 'What are you building?' : step === 'layout' ? 'Choose a layout' : 'Name your project' }}
              </h2>
              <p class="text-sm text-muted-foreground">
                {{ step === 'usecase' ? 'Select the type of project' : step === 'layout' ? 'Pick a starting template' : 'Give your project a name' }}
              </p>
            </div>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            @click="close"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Step 1: Use Case Selection -->
        <div v-if="step === 'usecase'" class="space-y-10">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              v-for="useCase in USE_CASES"
              :key="useCase.id"
              class="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center hover:border-primary/50 hover:bg-primary/5"
              :class="selectedUseCase === useCase.id ? 'border-primary bg-primary/5' : 'border-border'"
              @click="selectUseCase(useCase.id)"
            >
              <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <i :class="useCase.icon" class="text-lg text-muted-foreground"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">{{ useCase.name }}</p>
                <p class="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{{ useCase.description }}</p>
              </div>
            </button>
          </div>

          <div>
            <button
              class="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              @click="skipToBlank"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
              </svg>
              Start with a blank page
            </button>
          </div>
        </div>

        <!-- Step 2: Layout Selection -->
        <div v-else-if="step === 'layout'" class="space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            <button
              v-for="layout in availableLayouts"
              :key="layout.id"
              class="flex flex-col rounded-lg border-2 transition-all overflow-hidden text-left hover:border-primary/50"
              :class="selectedLayout?.id === layout.id ? 'border-primary' : 'border-border'"
              @click="selectLayout(layout)"
            >
              <!-- Preview -->
              <div
                class="aspect-[4/3] w-full flex items-center justify-center"
                :style="{ backgroundColor: layout.pageSettings.backgroundColor }"
              >
                <div class="text-center p-4">
                  <p
                    class="text-xs font-medium truncate"
                    :style="{ color: layout.pageSettings.textColor }"
                  >
                    {{ layout.name }}
                  </p>
                </div>
              </div>
              <!-- Info -->
              <div class="p-3 bg-card border-t border-border">
                <p class="text-sm font-medium text-foreground">{{ layout.name }}</p>
                <p class="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{{ layout.description }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Step 3: Project Name -->
        <div v-else-if="step === 'name'" class="space-y-4">
          <!-- Selected layout preview -->
          <div v-if="selectedLayout" class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div
              class="w-12 h-9 rounded flex items-center justify-center text-[8px] font-medium"
              :style="{ backgroundColor: selectedLayout.pageSettings.backgroundColor, color: selectedLayout.pageSettings.textColor }"
            >
              {{ selectedLayout.name.substring(0, 2).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ selectedLayout.name }}</p>
              <p class="text-[10px] text-muted-foreground">{{ selectedLayout.description }}</p>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Project name</label>
            <input
              v-model="projectTitle"
              type="text"
              class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              placeholder="My awesome project"
              autofocus
              @keyup.enter="createProject"
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              @click="close"
            >
              Cancel
            </button>
            <button
              class="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!projectTitle.trim() || isCreating"
              @click="createProject"
            >
              {{ isCreating ? 'Creating...' : 'Create Project' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
