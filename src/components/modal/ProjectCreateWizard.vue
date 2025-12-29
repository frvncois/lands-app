<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import {
  getAllCategories,
  getPresetsForCategory,
  getTemplateFromPreset,
  type PresetCategory,
  type UseCasePreset
} from '@/lib/presets'
import Icon from '@/components/ui/Icon.vue'
import Button from '@/components/ui/Button.vue'
import Spinner from '@/components/ui/Spinner.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  created: [projectId: string]
}>()

const router = useRouter()
const projectsStore = useProjectsStore()

// ============================================
// WIZARD STATE
// ============================================

type WizardStep = 'category' | 'usecase' | 'details' | 'creating'

const currentStep = ref<WizardStep>('category')
const selectedCategory = ref<PresetCategory | null>(null)
const selectedPreset = ref<UseCasePreset | null>(null)

// Project details
const projectTitle = ref('')
const projectSlug = ref('')
const hasManuallyEditedSlug = ref(false)
const isCheckingSlug = ref(false)
const slugAvailable = ref<boolean | null>(null)
const slugError = ref<string | null>(null)
const isCreating = ref(false)

// Get data
const categories = computed(() => getAllCategories())
const useCases = computed(() => {
  if (!selectedCategory.value) return []
  return getPresetsForCategory(selectedCategory.value.id)
})

// Slug generation
const generatedSlug = computed(() => {
  return projectTitle.value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50)
})

const previewUrl = computed(() => {
  const slug = projectSlug.value || generatedSlug.value || 'my-project'
  return `${slug}.lands.app`
})

const canCreate = computed(() => {
  return (
    projectTitle.value.trim().length > 0 &&
    (projectSlug.value || generatedSlug.value) &&
    slugAvailable.value !== false &&
    !slugError.value &&
    !isCheckingSlug.value
  )
})

// Step navigation
const canGoBack = computed(() => {
  return currentStep.value !== 'category' && currentStep.value !== 'creating'
})

const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 'category': return 'What are you building?'
    case 'usecase': return selectedCategory.value?.name || 'Choose a template'
    case 'details': return 'Name your project'
    case 'creating': return 'Creating your project...'
  }
})

const stepDescription = computed(() => {
  switch (currentStep.value) {
    case 'category': return 'Choose a category to get started with a template'
    case 'usecase': return 'Select the type of page that best fits your needs'
    case 'details': return selectedPreset.value?.description || 'Almost there!'
    case 'creating': return 'Setting up your sections and theme...'
  }
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
  currentStep.value = 'details'
}

function goBack() {
  if (currentStep.value === 'usecase') {
    currentStep.value = 'category'
    selectedCategory.value = null
  } else if (currentStep.value === 'details') {
    currentStep.value = 'usecase'
    selectedPreset.value = null
  }
}

function startBlank() {
  selectedCategory.value = null
  selectedPreset.value = null
  currentStep.value = 'details'
}

// ============================================
// SLUG HANDLING
// ============================================

let slugCheckTimeout: ReturnType<typeof setTimeout> | null = null

watch(projectTitle, (newTitle) => {
  if (!hasManuallyEditedSlug.value) {
    projectSlug.value = newTitle
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50)
    checkSlugAvailability()
  }
})

function onSlugInput(event: Event) {
  const input = event.target as HTMLInputElement
  const rawValue = input.value

  // Sanitize: only allow lowercase, numbers, hyphens
  const sanitized = rawValue
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50)

  projectSlug.value = sanitized
  hasManuallyEditedSlug.value = true
  checkSlugAvailability()
}

function checkSlugAvailability() {
  if (slugCheckTimeout) {
    clearTimeout(slugCheckTimeout)
  }

  const slug = projectSlug.value || generatedSlug.value
  if (!slug) {
    slugAvailable.value = null
    slugError.value = null
    return
  }

  if (slug.length < 3) {
    slugError.value = 'Slug must be at least 3 characters'
    slugAvailable.value = false
    return
  }

  isCheckingSlug.value = true
  slugError.value = null

  slugCheckTimeout = setTimeout(async () => {
    try {
      const available = await projectsStore.checkSlugAvailable(slug)
      slugAvailable.value = available
      if (!available) {
        slugError.value = 'This slug is already taken'
      }
    } catch (e) {
      slugError.value = 'Failed to check availability'
      slugAvailable.value = null
    } finally {
      isCheckingSlug.value = false
    }
  }, 300)
}

// ============================================
// PROJECT CREATION
// ============================================

async function createProject() {
  if (!canCreate.value) return

  currentStep.value = 'creating'
  isCreating.value = true

  try {
    const slug = projectSlug.value || generatedSlug.value

    // Create the project
    const project = await projectsStore.createProject(projectTitle.value, slug)
    if (!project) {
      throw new Error('Failed to create project')
    }

    // If we have a preset, apply its template
    if (selectedPreset.value) {
      const template = getTemplateFromPreset(selectedPreset.value.id)
      if (template) {
        await projectsStore.saveProjectContent(project.id, {
          themeId: template.themeId,
          sections: instantiateSections(template.sections),
          meta: {
            title: projectTitle.value,
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
    currentStep.value = 'details'
  } finally {
    isCreating.value = false
  }
}

/**
 * Convert template sections to section instances with unique IDs
 */
function instantiateSections(templateSections: Array<{ type: string; variant: string; data: Record<string, unknown> }>) {
  return templateSections.map(section => ({
    id: `section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: section.type,
    variant: section.variant,
    data: { ...section.data },
    fieldStyles: {},
    styles: {},
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
  projectTitle.value = ''
  projectSlug.value = ''
  hasManuallyEditedSlug.value = false
  slugAvailable.value = null
  slugError.value = null
  isCreating.value = false
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    reset()
  }
})

// Icon mapping for presets
function getIconName(icon: string): string {
  const iconMap: Record<string, string> = {
    'music': 'content-icon',
    'guitar': 'content-icon',
    'microphone': 'content-icon',
    'vinyl': 'content-icon',
    'heart': 'content-icon',
    'headphones': 'content-icon',
    'speaker': 'content-icon',
    'dinner': 'content-icon',
    'coffee': 'content-icon',
    'beer': 'content-icon',
    'wine': 'content-icon',
    'utensils': 'content-icon',
    'chef': 'content-icon',
    'cake': 'content-icon',
    'truck': 'content-icon',
    'pen': 'content-icon',
    'briefcase': 'app-editor',
    'camera': 'content-image',
    'video': 'content-video',
    'code': 'content-icon',
    'palette': 'style-color',
    'shopping-cart': 'list-product',
    'tag': 'content-icon',
    'download': 'app-publish',
    'dollar': 'content-icon',
    'calendar': 'content-icon',
    'clock': 'content-icon',
    'users': 'app-collaborators',
    'tool': 'content-icon',
    'sun': 'content-icon',
    'frame': 'content-image',
    'shopping-bag': 'list-product',
    'user': 'app-user',
    'image': 'content-image',
    'file': 'content-icon',
    'link': 'list-link',
    'star': 'content-icon',
    'credit-card': 'list-product',
    'rocket': 'content-icon',
    'mobile': 'content-icon',
    'megaphone': 'content-icon',
    'list': 'list-link',
    'chart-up': 'app-analytics',
    'home': 'app-dashboard',
    'hammer': 'content-icon',
    'tree': 'content-icon',
    'spray': 'content-icon',
    'car': 'content-icon',
    'dumbbell': 'content-icon',
    'scissors': 'content-icon',
    'map-marker': 'content-icon',
    'hand': 'content-icon',
    'add': '+',
  }

  return iconMap[icon] || 'content-icon'
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-md"
        @click="close"
      />

      <!-- Modal -->
      <div
        class="relative bg-card border border-border rounded-2xl shadow-xl w-full overflow-hidden transition-all duration-300"
        :class="[
          currentStep === 'category' || currentStep === 'usecase'
            ? 'max-w-3xl'
            : 'max-w-md'
        ]"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-border">
          <div class="flex items-center gap-3">
            <!-- Back button -->
            <button
              v-if="canGoBack"
              class="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              @click="goBack"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div>
              <h2 class="text-xl font-semibold text-foreground">
                {{ stepTitle }}
              </h2>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ stepDescription }}
              </p>
            </div>
          </div>

          <button
            v-if="currentStep !== 'creating'"
            class="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            @click="close"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Step 1: Category Selection -->
          <div v-if="currentStep === 'category'" class="space-y-4">
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="category in categories"
                :key="category.id"
                class="flex flex-col items-start gap-2 p-4 border border-border rounded-xl hover:border-primary hover:bg-muted/50 transition-colors text-left"
                @click="selectCategory(category)"
              >
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon :name="getIconName(category.icon)" class="text-primary" :size="20" />
                </div>
                <div>
                  <div class="font-medium text-sm text-foreground">{{ category.name }}</div>
                  <div class="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {{ category.description }}
                  </div>
                </div>
              </button>
            </div>

            <!-- Blank option -->
            <div class="pt-4 border-t border-border">
              <button
                class="w-full flex items-center gap-3 p-4 border border-dashed border-border rounded-xl hover:border-primary hover:bg-muted/50 transition-colors"
                @click="startBlank"
              >
                <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Icon name="+" class="text-muted-foreground" :size="20" />
                </div>
                <div class="text-left">
                  <div class="font-medium text-sm text-foreground">Start from scratch</div>
                  <div class="text-xs text-muted-foreground">Begin with a blank canvas</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Step 2: Use Case Selection -->
          <div v-else-if="currentStep === 'usecase'" class="space-y-4">
            <div class="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              <button
                v-for="preset in useCases"
                :key="preset.id"
                class="flex flex-col items-start gap-2 p-4 border border-border rounded-xl hover:border-primary hover:bg-muted/50 transition-colors text-left"
                @click="selectUseCase(preset)"
              >
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon :name="getIconName(preset.icon)" class="text-primary" :size="16" />
                </div>
                <div>
                  <div class="font-medium text-sm text-foreground">{{ preset.name }}</div>
                  <div class="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {{ preset.description }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Step 3: Project Details -->
          <div v-else-if="currentStep === 'details'" class="space-y-4">
            <!-- Selected preset indicator -->
            <div
              v-if="selectedPreset"
              class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon :name="getIconName(selectedPreset.icon)" class="text-primary" :size="16" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-foreground">{{ selectedPreset.name }}</div>
                <div class="text-xs text-muted-foreground truncate">
                  {{ selectedCategory?.name }} template
                </div>
              </div>
              <button
                class="text-xs text-primary hover:underline shrink-0"
                @click="goBack"
              >
                Change
              </button>
            </div>

            <!-- Project Title -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Project name</label>
              <input
                v-model="projectTitle"
                type="text"
                class="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                placeholder="My landing page"
                autofocus
                @keyup.enter="createProject"
              />
            </div>

            <!-- Project Slug -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Project URL</label>
              <div class="relative">
                <input
                  :value="projectSlug"
                  type="text"
                  class="w-full h-10 px-3 pr-9 bg-background border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  :class="[
                    slugError ? 'border-destructive' : slugAvailable === true ? 'border-green-500' : 'border-border'
                  ]"
                  placeholder="my-landing-page"
                  @input="onSlugInput"
                  @keyup.enter="createProject"
                />
                <!-- Status indicator -->
                <div class="absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner v-if="isCheckingSlug" class="w-4 h-4" />
                  <svg v-else-if="slugAvailable === true" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else-if="slugAvailable === false || slugError" class="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <!-- Error or Preview -->
              <p v-if="slugError" class="text-xs text-destructive">
                {{ slugError }}
              </p>
              <p v-else class="text-xs text-muted-foreground">
                Your page will be at <span class="font-medium text-foreground">{{ previewUrl }}</span>
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" @click="close">
                Cancel
              </Button>
              <Button
                :disabled="!canCreate"
                :loading="isCreating"
                @click="createProject"
              >
                Create project
              </Button>
            </div>
          </div>

          <!-- Step 4: Creating -->
          <div v-else-if="currentStep === 'creating'" class="flex flex-col items-center justify-center py-12">
            <Spinner class="w-8 h-8 text-primary" />
            <p class="mt-4 text-sm text-muted-foreground">
              Setting up your project...
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
