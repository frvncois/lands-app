<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import {
  getTemplateFromPreset,
  type PresetCategory,
  type UseCasePreset
} from '@/lib/presets'
import { getTheme } from '@/lib/themes'
import type { SectionStyleProperties } from '@/types/sections'
import Button from '@/components/ui/Button.vue'
import Spinner from '@/components/ui/Spinner.vue'
import WizardStepCategory from './wizard/WizardStepCategory.vue'
import WizardStepUseCase from './wizard/WizardStepUseCase.vue'
import WizardStepTheme from './wizard/WizardStepTheme.vue'
import WizardStepStyle, { type ColorPalette, type FontPairing } from './wizard/WizardStepStyle.vue'

const props = withDefaults(defineProps<{
  open: boolean
  projectName?: string
  projectSlug?: string
}>(), {
  projectName: '',
  projectSlug: ''
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  created: [projectId: string]
}>()

const router = useRouter()
const projectsStore = useProjectsStore()

// ============================================
// WIZARD STATE
// ============================================

type WizardStep = 'category' | 'usecase' | 'theme' | 'style' | 'creating'

const currentStep = ref<WizardStep>('category')
const selectedCategory = ref<PresetCategory | null>(null)
const selectedPreset = ref<UseCasePreset | null>(null)
const selectedThemeId = ref<string>('')
const selectedPaletteId = ref<string>('modern')
const selectedFontPairingId = ref<string>('modern-clean')

// Project details
const isCreating = ref(false)

// ============================================
// COMPUTED VALUES
// ============================================

const selectedTheme = computed(() => {
  if (!selectedThemeId.value) return undefined
  return getTheme(selectedThemeId.value)
})

const selectedPalette = computed((): ColorPalette | undefined => {
  // This will be populated from WizardStepStyle
  // For now, return a basic palette based on ID
  const palettes: Record<string, ColorPalette> = {
    modern: {
      id: 'modern',
      name: 'Modern',
      description: 'Blues and grays',
      colors: { primary: '#3b82f6', accent: '#0f172a', background: '#f8fafc' }
    },
    warm: {
      id: 'warm',
      name: 'Warm',
      description: 'Oranges and earth tones',
      colors: { primary: '#f59e0b', accent: '#78350f', background: '#fef3c7' }
    },
    nature: {
      id: 'nature',
      name: 'Nature',
      description: 'Greens and natural',
      colors: { primary: '#10b981', accent: '#14532d', background: '#f0fdf4' }
    },
    midnight: {
      id: 'midnight',
      name: 'Midnight',
      description: 'Deep purples',
      colors: { primary: '#6366f1', accent: '#1e1b4b', background: '#eef2ff' }
    },
    cream: {
      id: 'cream',
      name: 'Cream',
      description: 'Soft neutrals',
      colors: { primary: '#d97706', accent: '#292524', background: '#fef7ee' }
    },
  }
  return palettes[selectedPaletteId.value]
})

const selectedFontPairing = computed((): FontPairing | undefined => {
  const pairings: Record<string, FontPairing> = {
    'modern-clean': {
      id: 'modern-clean',
      name: 'Modern & Clean',
      description: 'Satoshi',
      fonts: { heading: 'Satoshi, sans-serif', body: 'Satoshi, sans-serif' }
    },
    'classic-elegant': {
      id: 'classic-elegant',
      name: 'Classic & Elegant',
      description: 'Quilon + Public Sans',
      fonts: { heading: 'Quilon, serif', body: 'Public Sans, sans-serif' }
    },
    'bold-impact': {
      id: 'bold-impact',
      name: 'Bold & Impact',
      description: 'Clash Grotesk',
      fonts: { heading: 'Clash Grotesk, sans-serif', body: 'Author, sans-serif' }
    },
    'friendly-warm': {
      id: 'friendly-warm',
      name: 'Friendly & Warm',
      description: 'Telma',
      fonts: { heading: 'Telma, sans-serif', body: 'Familjen Grotesk, sans-serif' }
    },
    'editorial': {
      id: 'editorial',
      name: 'Editorial',
      description: 'Instrument Serif',
      fonts: { heading: 'Instrument Serif, serif', body: 'Author, sans-serif' }
    },
  }
  return pairings[selectedFontPairingId.value]
})

const canContinue = computed(() => {
  switch (currentStep.value) {
    case 'category':
      return selectedCategory.value !== null
    case 'usecase':
      return selectedPreset.value !== null
    case 'theme':
      return selectedThemeId.value !== ''
    case 'style':
      return selectedPaletteId.value !== '' && selectedFontPairingId.value !== ''
    default:
      return false
  }
})

const canGoBack = computed(() => {
  return currentStep.value !== 'category' && currentStep.value !== 'creating'
})

const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 'category': return 'What are you building?'
    case 'usecase': return selectedCategory.value?.name || 'Choose a template'
    case 'theme': return 'Choose a theme'
    case 'style': return 'Customize your style'
    case 'creating': return 'Creating your project...'
  }
})

const stepNumber = computed(() => {
  const steps: Record<WizardStep, number> = {
    category: 1,
    usecase: 2,
    theme: 3,
    style: 4,
    creating: 5,
  }
  return steps[currentStep.value]
})

const totalSteps = computed(() => {
  return 4 // category -> usecase -> theme -> style
})

// ============================================
// STEP HANDLERS
// ============================================

function selectCategory(category: PresetCategory) {
  selectedCategory.value = category
  currentStep.value = 'usecase'
}

function selectUseCase(preset: UseCasePreset) {
  selectedPreset.value = preset

  // Auto-select theme from template if available
  const template = getTemplateFromPreset(preset.id)
  if (template?.themeId) {
    selectedThemeId.value = template.themeId
  }

  currentStep.value = 'theme'
}

function selectTheme(themeId: string) {
  selectedThemeId.value = themeId
}

function selectPalette(paletteId: string) {
  selectedPaletteId.value = paletteId
}

function selectFontPairing(fontPairingId: string) {
  selectedFontPairingId.value = fontPairingId
}

function goToNextStep() {
  const stepOrder: WizardStep[] = ['category', 'usecase', 'theme', 'style']
  const currentIndex = stepOrder.indexOf(currentStep.value)

  if (currentIndex >= 0 && currentIndex < stepOrder.length - 1) {
    const nextStep = stepOrder[currentIndex + 1]
    if (nextStep) {
      currentStep.value = nextStep
    }
  } else if (currentStep.value === 'style') {
    // Create project after style step
    createProject()
  }
}

function goBack() {
  const stepOrder: WizardStep[] = ['category', 'usecase', 'theme', 'style']
  const currentIndex = stepOrder.indexOf(currentStep.value)

  if (currentIndex > 0) {
    const prevStep = stepOrder[currentIndex - 1]
    if (prevStep) {
      currentStep.value = prevStep

      // Clear selection when going back
      if (currentStep.value === 'category') {
        selectedCategory.value = null
      } else if (currentStep.value === 'usecase') {
        selectedPreset.value = null
      }
    }
  }
}

// ============================================
// PROJECT CREATION
// ============================================

async function createProject() {
  if (!canContinue.value) return

  // Validate that we have a project name and slug
  if (!props.projectName || !props.projectSlug) {
    console.error('Project name and slug are required')
    return
  }

  currentStep.value = 'creating'
  isCreating.value = true

  try {
    // Create the project using the name and slug from parent
    const project = await projectsStore.createProject(props.projectName, props.projectSlug)
    if (!project) {
      throw new Error('Failed to create project')
    }

    // If we have a preset, apply its template
    if (selectedPreset.value) {
      const template = getTemplateFromPreset(selectedPreset.value.id)
      if (template) {
        const sections = instantiateSections(template.sections)

        await projectsStore.saveProjectContent(project.id, {
          themeId: selectedThemeId.value || template.themeId,
          sections,
          meta: {
            title: props.projectName,
            description: selectedPreset.value.description,
          },
        })
      }
    }

    emit('created', project.id)
    close()
    router.push({ name: 'designer', params: { projectId: project.id } })
  } catch (e) {
    console.error('Failed to create project:', e)
    currentStep.value = 'style'
  } finally {
    isCreating.value = false
  }
}

/**
 * Convert template sections to section instances with unique IDs
 */
function instantiateSections(templateSections: Array<{ type: string; variant: string; data: Record<string, unknown>; styles?: Record<string, unknown> }>) {
  return templateSections.map(section => ({
    id: `section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: section.type,
    variant: section.variant,
    data: { ...section.data },
    fieldStyles: {},
    styles: section.styles ? ({ ...section.styles } as SectionStyleProperties) : {},
    itemStyles: {},
  }))
}

// ============================================
// MODAL CONTROL
// ============================================

function close() {
  if (!isCreating.value) {
    emit('update:open', false)
  }
}

function reset() {
  currentStep.value = 'category'
  selectedCategory.value = null
  selectedPreset.value = null
  selectedThemeId.value = ''
  selectedPaletteId.value = 'modern'
  selectedFontPairingId.value = 'modern-clean'
  isCreating.value = false
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    reset()
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[9999] bg-background"
    >
      <!-- Full-page wizard -->
      <div class="h-full flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-8 py-6 border-b border-border">
          <div class="flex items-center gap-4">
            <button
              v-if="canGoBack"
              class="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              @click="goBack"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div>
              <div class="flex items-center gap-3 mb-1">
                <h1 class="text-2xl font-semibold text-foreground">
                  {{ stepTitle }}
                </h1>
                <span class="text-sm text-muted-foreground font-medium">
                  {{ stepNumber }}/{{ totalSteps }}
                </span>
              </div>
              <div class="w-48 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary transition-all duration-300"
                  :style="{ width: `${(stepNumber / totalSteps) * 100}%` }"
                />
              </div>
            </div>
          </div>

          <button
            v-if="currentStep !== 'creating'"
            class="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            @click="close"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Step content -->
        <div class="flex-1 overflow-y-auto px-8 py-8">
          <div class="max-w-4xl mx-auto">
            <!-- Step 1: Category -->
            <WizardStepCategory
              v-if="currentStep === 'category'"
              @select="selectCategory"
            />

            <!-- Step 2: Use Case -->
            <WizardStepUseCase
              v-else-if="currentStep === 'usecase'"
              :category-id="selectedCategory?.id ?? ''"
              @select="selectUseCase"
            />

            <!-- Step 3: Theme -->
            <WizardStepTheme
              v-else-if="currentStep === 'theme'"
              :selected-theme-id="selectedThemeId"
              @select="selectTheme"
            />

            <!-- Step 4: Style (Color Palette + Font Pairing) -->
            <WizardStepStyle
              v-else-if="currentStep === 'style'"
              :selected-palette-id="selectedPaletteId"
              :selected-font-pairing-id="selectedFontPairingId"
              @select-palette="selectPalette"
              @select-font="selectFontPairing"
            />

            <!-- Step 5: Creating -->
            <div
              v-else-if="currentStep === 'creating'"
              class="flex flex-col items-center justify-center py-20"
            >
              <Spinner class="w-12 h-12 text-primary" />
              <p class="mt-6 text-lg font-medium text-foreground">
                Creating your project...
              </p>
              <p class="mt-2 text-sm text-muted-foreground">
                Setting up sections and applying your theme
              </p>
            </div>
          </div>
        </div>

        <!-- Footer with action buttons -->
        <div
          v-if="currentStep !== 'creating'"
          class="px-8 py-6 border-t border-border flex items-center justify-between"
        >
          <Button
            v-if="canGoBack"
            variant="ghost"
            @click="goBack"
          >
            Back
          </Button>
          <div v-else />

          <Button
            :disabled="!canContinue"
            @click="goToNextStep"
          >
            {{ currentStep === 'style' ? 'Create project' : 'Continue' }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
