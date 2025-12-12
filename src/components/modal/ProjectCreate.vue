<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import {
  USE_CASES,
  COLOR_PALETTES,
  STYLE_PRESETS,
  LAYOUT_STYLES,
  getSectionsForUseCase,
  type UseCaseCategory,
  type ColorPalette,
  type StylePreset,
  type LayoutStyle,
  type ContentSection,
} from '@/lib/layouts'

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
type Step = 'usecase' | 'layout' | 'content' | 'style' | 'name'
const step = ref<Step>('usecase')
const steps: Step[] = ['usecase', 'layout', 'content', 'style', 'name']

// Selection state
const selectedUseCase = ref<UseCaseCategory | null>(null)
const selectedLayoutStyle = ref<LayoutStyle>(LAYOUT_STYLES[0]!)
const selectedSections = ref<Set<string>>(new Set())
const selectedPalette = ref<ColorPalette>(COLOR_PALETTES[0]!)
const selectedStyle = ref<StylePreset>(STYLE_PRESETS[0]!)
const projectTitle = ref('')
const projectDescription = ref('')
const isCreating = ref(false)

// Get available sections for selected use case
const availableSections = computed(() => {
  if (!selectedUseCase.value) return { available: [], defaultSelected: [] }
  return getSectionsForUseCase(selectedUseCase.value)
})

// Current step index for progress indicator
const currentStepIndex = computed(() => steps.indexOf(step.value))

// Step titles and descriptions
const stepInfo = computed(() => {
  switch (step.value) {
    case 'usecase':
      return { title: 'What are you building?', description: 'Select the type of project' }
    case 'layout':
      return { title: 'Pick a layout style', description: 'Choose the overall look and feel' }
    case 'content':
      return { title: 'What content do you need?', description: 'Choose the sections for your page' }
    case 'style':
      return { title: 'Choose your style', description: 'Pick a color palette and typography' }
    case 'name':
      return { title: 'Name your project', description: 'Give your project a name' }
    default:
      return { title: '', description: '' }
  }
})

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    step.value = 'usecase'
    selectedUseCase.value = null
    selectedLayoutStyle.value = LAYOUT_STYLES[0]!
    selectedSections.value = new Set()
    selectedPalette.value = COLOR_PALETTES[0]!
    selectedStyle.value = STYLE_PRESETS[0]!
    projectTitle.value = ''
    projectDescription.value = ''
  }
})

// When use case changes, reset sections to defaults
watch(selectedUseCase, (useCase) => {
  if (useCase) {
    const { defaultSelected } = getSectionsForUseCase(useCase)
    selectedSections.value = new Set(defaultSelected)
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

function selectLayoutStyle(layoutStyle: LayoutStyle) {
  selectedLayoutStyle.value = layoutStyle
  step.value = 'content'
}

function toggleSection(sectionId: string) {
  if (selectedSections.value.has(sectionId)) {
    selectedSections.value.delete(sectionId)
  } else {
    selectedSections.value.add(sectionId)
  }
  // Trigger reactivity
  selectedSections.value = new Set(selectedSections.value)
}

function goToStyle() {
  step.value = 'style'
}

function goToName() {
  step.value = 'name'
}

function goBack() {
  const currentIndex = steps.indexOf(step.value)
  if (currentIndex > 0) {
    step.value = steps[currentIndex - 1]!
  }
}

async function createProject() {
  if (!projectTitle.value.trim() || isCreating.value || !selectedUseCase.value) return

  isCreating.value = true
  try {
    const project = await projectsStore.createProjectFromWizard({
      title: projectTitle.value,
      description: projectDescription.value,
      useCase: selectedUseCase.value,
      sections: Array.from(selectedSections.value),
      layoutStyle: selectedLayoutStyle.value,
      palette: selectedPalette.value,
      style: selectedStyle.value,
    })
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
        class="relative bg-card border border-border rounded-3xl shadow-xl w-full max-w-2xl p-8 space-y-8 transition-all duration-200"
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
              <h2 class="text-2xl font-semibold text-foreground">
                {{ stepInfo.title }}
              </h2>
              <p class="text-sm text-muted-foreground">
                {{ stepInfo.description }}
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

        <!-- Progress indicator -->
        <div class="flex items-center gap-2">
          <template v-for="(s, index) in steps" :key="s">
            <div
              class="h-1 flex-1 rounded-full transition-colors"
              :class="index <= currentStepIndex ? 'bg-primary' : 'bg-muted'"
            ></div>
          </template>
        </div>

        <!-- Step 1: Use Case Selection -->
        <div v-if="step === 'usecase'" class="space-y-6">
          <div class="grid grid-cols-3 md:grid-cols-4 gap-3">
            <button
              v-for="useCase in USE_CASES"
              :key="useCase.id"
              class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center hover:border-primary/50 hover:bg-primary/5"
              :class="selectedUseCase === useCase.id ? 'border-primary bg-primary/5' : 'border-border'"
              @click="selectUseCase(useCase.id)"
            >
              <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <i :class="useCase.icon" class="text-lg text-muted-foreground"></i>
              </div>
              <div>
                <p class="text-xs font-medium text-foreground">{{ useCase.name }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Step 2: Layout Style Selection -->
        <div v-else-if="step === 'layout'" class="space-y-6">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="layoutStyle in LAYOUT_STYLES"
              :key="layoutStyle.id"
              class="flex flex-col gap-3 p-4 rounded-xl border-2 transition-all text-left hover:border-primary/50 hover:bg-primary/5"
              :class="selectedLayoutStyle.id === layoutStyle.id ? 'border-primary bg-primary/5' : 'border-border'"
              @click="selectLayoutStyle(layoutStyle)"
            >
              <!-- Visual preview based on layout style properties -->
              <div class="w-full aspect-[4/3] bg-muted/50 rounded-lg overflow-hidden p-2">
                <div class="w-full h-full flex flex-col gap-1">
                  <!-- Header bar preview -->
                  <div
                    class="h-2 bg-foreground/20"
                    :class="{
                      'rounded-none': layoutStyle.borderRadius === 'none',
                      'rounded-sm': layoutStyle.borderRadius === 'sm',
                      'rounded': layoutStyle.borderRadius === 'md',
                      'rounded-md': layoutStyle.borderRadius === 'lg',
                      'rounded-lg': layoutStyle.borderRadius === 'xl' || layoutStyle.borderRadius === '2xl',
                      'rounded-full': layoutStyle.borderRadius === 'full',
                    }"
                  ></div>
                  <!-- Content blocks preview -->
                  <div class="flex-1 flex gap-1">
                    <div
                      class="flex-1 bg-foreground/10"
                      :class="{
                        'rounded-none': layoutStyle.borderRadius === 'none',
                        'rounded-sm': layoutStyle.borderRadius === 'sm',
                        'rounded': layoutStyle.borderRadius === 'md',
                        'rounded-md': layoutStyle.borderRadius === 'lg',
                        'rounded-lg': layoutStyle.borderRadius === 'xl' || layoutStyle.borderRadius === '2xl',
                        'rounded-full': layoutStyle.borderRadius === 'full',
                        'border border-foreground/20': layoutStyle.borderStyle !== 'none',
                        'border-2': layoutStyle.borderStyle === 'bold',
                        'shadow-sm': layoutStyle.shadowIntensity === 'subtle',
                        'shadow-md': layoutStyle.shadowIntensity === 'medium',
                        'shadow-lg': layoutStyle.shadowIntensity === 'dramatic',
                      }"
                    ></div>
                    <div
                      class="w-1/3 bg-foreground/15"
                      :class="{
                        'rounded-none': layoutStyle.borderRadius === 'none',
                        'rounded-sm': layoutStyle.borderRadius === 'sm',
                        'rounded': layoutStyle.borderRadius === 'md',
                        'rounded-md': layoutStyle.borderRadius === 'lg',
                        'rounded-lg': layoutStyle.borderRadius === 'xl' || layoutStyle.borderRadius === '2xl',
                        'rounded-full': layoutStyle.borderRadius === 'full',
                      }"
                    ></div>
                  </div>
                  <!-- Footer preview -->
                  <div
                    class="h-1.5 bg-foreground/10"
                    :class="{
                      'rounded-none': layoutStyle.borderRadius === 'none',
                      'rounded-sm': layoutStyle.borderRadius === 'sm',
                      'rounded': layoutStyle.borderRadius === 'md',
                      'rounded-md': layoutStyle.borderRadius === 'lg',
                      'rounded-lg': layoutStyle.borderRadius === 'xl' || layoutStyle.borderRadius === '2xl',
                      'rounded-full': layoutStyle.borderRadius === 'full',
                    }"
                  ></div>
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">{{ layoutStyle.name }}</p>
                <p class="text-[10px] text-muted-foreground">{{ layoutStyle.description }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Step 3: Content Section Selection -->
        <div v-else-if="step === 'content'" class="space-y-6">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="section in availableSections.available"
              :key="section.id"
              class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left hover:border-primary/50"
              :class="selectedSections.has(section.id) ? 'border-primary bg-primary/5' : 'border-border'"
              @click="toggleSection(section.id)"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :class="selectedSections.has(section.id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
              >
                <i :class="section.icon" class="text-sm"></i>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-foreground">{{ section.name }}</p>
                <p class="text-[10px] text-muted-foreground truncate">{{ section.description }}</p>
              </div>
            </button>
          </div>

          <div class="flex justify-end">
            <button
              class="h-10 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              @click="goToStyle"
            >
              Continue
            </button>
          </div>
        </div>

        <!-- Step 3: Style & Colors -->
        <div v-else-if="step === 'style'" class="space-y-6">
          <!-- Color Palettes -->
          <div class="space-y-3">
            <label class="text-sm font-medium text-foreground">Color Palette</label>
            <div class="grid grid-cols-5 gap-3">
              <button
                v-for="palette in COLOR_PALETTES"
                :key="palette.id"
                class="group relative aspect-square rounded-xl border-2 transition-all overflow-hidden hover:scale-105"
                :class="selectedPalette.id === palette.id ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-border'"
                @click="selectedPalette = palette"
              >
                <!-- Color preview -->
                <div class="absolute inset-0 flex flex-col">
                  <div class="flex-1" :style="{ backgroundColor: palette.colors.background }"></div>
                  <div class="h-3 flex">
                    <div class="flex-1" :style="{ backgroundColor: palette.colors.primary }"></div>
                    <div class="flex-1" :style="{ backgroundColor: palette.colors.accent }"></div>
                  </div>
                </div>
                <!-- Name tooltip -->
                <div class="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[10px] text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {{ palette.name }}
                </div>
              </button>
            </div>
          </div>

          <!-- Style Presets -->
          <div class="space-y-3">
            <label class="text-sm font-medium text-foreground">Typography Style</label>
            <div class="grid grid-cols-5 gap-3">
              <button
                v-for="style in STYLE_PRESETS"
                :key="style.id"
                class="p-3 rounded-xl border-2 transition-all text-center hover:border-primary/50"
                :class="selectedStyle.id === style.id ? 'border-primary bg-primary/5' : 'border-border'"
                @click="selectedStyle = style"
              >
                <p class="text-sm font-medium text-foreground">{{ style.name }}</p>
                <p class="text-[10px] text-muted-foreground">{{ style.description }}</p>
              </button>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              class="h-10 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              @click="goToName"
            >
              Continue
            </button>
          </div>
        </div>

        <!-- Step 4: Project Name -->
        <div v-else-if="step === 'name'" class="space-y-6">
          <!-- Summary -->
          <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              :style="{ backgroundColor: selectedPalette.colors.primary }"
            >
              <i
                :class="USE_CASES.find(u => u.id === selectedUseCase)?.icon"
                class="text-lg"
                :style="{ color: selectedPalette.colors.background }"
              ></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground">
                {{ USE_CASES.find(u => u.id === selectedUseCase)?.name }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ selectedLayoutStyle.name }} · {{ selectedSections.size }} sections · {{ selectedPalette.name }}
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Project name</label>
              <input
                v-model="projectTitle"
                type="text"
                class="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                placeholder="My awesome project"
                autofocus
                @keyup.enter="createProject"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Description <span class="text-muted-foreground font-normal">(optional)</span></label>
              <textarea
                v-model="projectDescription"
                class="w-full h-20 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background resize-none"
                placeholder="A brief description of your project"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3">
            <button
              class="h-10 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              @click="close"
            >
              Cancel
            </button>
            <button
              class="h-10 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
