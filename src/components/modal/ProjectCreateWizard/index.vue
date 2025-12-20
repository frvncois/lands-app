<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { Modal, Button, Icon } from '@/components/ui'
import {
  USE_CASES,
  USE_CASE_GOALS,
  HEADING_FONTS,
  BODY_FONTS,
  COLOR_PALETTES,
  LAYOUT_STYLES,
  getRecommendedSections,
  getGoalsForUseCase,
  getColorPaletteById,
  type UseCaseCategory,
} from '@/lib/layouts'

import Step1UseCase from './Step1UseCase.vue'
import Step2Description from './Step2Description.vue'
import Step3Style from './Step3Style.vue'
import Step4Sections from './Step4Sections.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'created': [projectId: string]
}>()

const router = useRouter()
const projectsStore = useProjectsStore()

// Wizard state
const currentStep = ref(1)
const totalSteps = 4
const isCreating = ref(false)

// Form data
const wizardData = reactive({
  // Step 1
  projectTitle: '',
  projectSlug: '',
  useCase: null as UseCaseCategory | null,

  // Step 2 - Now uses goalId string instead of ProjectGoal enum
  description: '',
  goalId: null as string | null, // e.g., 'creator-release', 'product-sales'

  // Step 3
  headingFont: 'Inter',
  bodyFont: 'Inter',
  colorPaletteId: 'minimal-light',

  // Step 4
  selectedSections: [] as string[],
})

// Computed
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return wizardData.projectTitle.trim().length > 0 && wizardData.useCase !== null
    case 2:
      return wizardData.goalId !== null
    case 3:
      return true // Style step has defaults
    case 4:
      return wizardData.selectedSections.length > 0
    default:
      return false
  }
})

const stepTitle = computed(() => {
  const titles = [
    'Name your project',
    'What\'s your goal?',
    'Choose your style',
    'Select sections',
  ]
  return titles[currentStep.value - 1]
})

// Reset goal when use case changes
watch(() => wizardData.useCase, () => {
  wizardData.goalId = null
  wizardData.selectedSections = []
})

// Auto-generate recommended sections when goal changes
watch([() => wizardData.useCase, () => wizardData.goalId], ([useCase, goalId]) => {
  if (useCase && goalId) {
    const { recommended } = getRecommendedSections(useCase, goalId)
    wizardData.selectedSections = recommended
  }
})

// Generate slug from title
watch(() => wizardData.projectTitle, (title) => {
  wizardData.projectSlug = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
})

// Navigation
function nextStep() {
  if (currentStep.value < totalSteps && canProceed.value) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function close() {
  if (!isCreating.value) {
    emit('update:open', false)
    resetWizard()
  }
}

function resetWizard() {
  currentStep.value = 1
  wizardData.projectTitle = ''
  wizardData.projectSlug = ''
  wizardData.useCase = null
  wizardData.description = ''
  wizardData.goalId = null
  wizardData.headingFont = 'Inter'
  wizardData.bodyFont = 'Inter'
  wizardData.colorPaletteId = 'minimal-light'
  wizardData.selectedSections = []
}

async function createProject() {
  if (!canProceed.value) return

  isCreating.value = true

  try {
    const palette = getColorPaletteById(wizardData.colorPaletteId)!
    const layoutStyle = LAYOUT_STYLES[0]! // Default for now

    const project = await projectsStore.createProjectFromWizard({
      title: wizardData.projectTitle,
      description: wizardData.description,
      useCase: wizardData.useCase!,
      sections: wizardData.selectedSections,
      layoutStyle,
      palette,
      style: {
        id: 'custom',
        name: 'Custom',
        description: '',
        fontHeading: wizardData.headingFont,
        fontBody: wizardData.bodyFont,
        borderRadius: 'md',
      },
    })

    if (project) {
      emit('created', project.id)
      close()
      router.push({ name: 'designer', params: { projectId: project.id } })
    }
  } finally {
    isCreating.value = false
  }
}

// Reset when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetWizard()
  }
})
</script>

<template>
  <Modal :open="open" size="xl" @update:open="emit('update:open', $event)">
    <template #header>
      <div class="flex items-center gap-4">
        <!-- Progress -->
        <div class="flex items-center gap-2">
          <template v-for="step in totalSteps" :key="step">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
              :class="step === currentStep
                ? 'bg-primary text-primary-foreground'
                : step < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'"
            >
              <Icon v-if="step < currentStep" name="checkmark" class="text-xs" />
              <span v-else>{{ step }}</span>
            </div>
            <div
              v-if="step < totalSteps"
              class="w-8 h-0.5 transition-colors"
              :class="step < currentStep ? 'bg-primary' : 'bg-muted'"
            />
          </template>
        </div>

        <div class="flex-1">
          <h2 class="text-lg font-semibold text-foreground">{{ stepTitle }}</h2>
          <p class="text-sm text-muted-foreground">Step {{ currentStep }} of {{ totalSteps }}</p>
        </div>
      </div>
    </template>

    <!-- Step Content -->
    <div class="min-h-[420px]">
      <Transition
        mode="out-in"
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
      >
        <Step1UseCase
          v-if="currentStep === 1"
          v-model:title="wizardData.projectTitle"
          v-model:slug="wizardData.projectSlug"
          v-model:use-case="wizardData.useCase"
        />

        <Step2Description
          v-else-if="currentStep === 2"
          v-model:description="wizardData.description"
          v-model:goal-id="wizardData.goalId"
          :use-case="wizardData.useCase!"
        />

        <Step3Style
          v-else-if="currentStep === 3"
          v-model:heading-font="wizardData.headingFont"
          v-model:body-font="wizardData.bodyFont"
          v-model:palette-id="wizardData.colorPaletteId"
        />

        <Step4Sections
          v-else-if="currentStep === 4"
          v-model:sections="wizardData.selectedSections"
          :use-case="wizardData.useCase!"
          :goal-id="wizardData.goalId!"
        />
      </Transition>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <Button
          v-if="currentStep > 1"
          variant="ghost"
          @click="prevStep"
        >
          <Icon name="arrow-left" class="text-xs" />
          Back
        </Button>
        <div v-else />

        <div class="flex items-center gap-3">
          <Button variant="ghost" @click="close">
            Cancel
          </Button>

          <Button
            v-if="currentStep < totalSteps"
            :disabled="!canProceed"
            @click="nextStep"
          >
            Continue
            <Icon name="arrow-right" class="text-xs" />
          </Button>

          <Button
            v-else
            :disabled="!canProceed"
            :loading="isCreating"
            @click="createProject"
          >
            Create Project
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
