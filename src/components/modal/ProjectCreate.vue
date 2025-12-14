<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { supabase } from '@/lib/supabase'
import Spinner from '@/components/ui/Spinner.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'created': [projectId: string]
}>()

const router = useRouter()
const projectsStore = useProjectsStore()

// Form state
const projectTitle = ref('')
const projectSlug = ref('')
const isCreating = ref(false)

// Slug validation state
const isCheckingSlug = ref(false)
const slugAvailable = ref<boolean | null>(null)
const slugError = ref<string | null>(null)

// Debounce timer for slug checking
let slugCheckTimer: ReturnType<typeof setTimeout> | null = null

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Check if slug is available
async function checkSlugAvailability(slug: string) {
  if (!slug || slug.length < 2) {
    slugAvailable.value = null
    slugError.value = slug ? 'Slug must be at least 2 characters' : null
    return
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    slugAvailable.value = false
    slugError.value = 'Only lowercase letters, numbers, and hyphens allowed'
    return
  }

  isCheckingSlug.value = true
  slugError.value = null

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw error

    slugAvailable.value = !data
    slugError.value = data ? 'This slug is already taken' : null
  } catch (e) {
    console.error('Error checking slug:', e)
    slugError.value = 'Could not verify slug availability'
    slugAvailable.value = null
  } finally {
    isCheckingSlug.value = false
  }
}

// Debounced slug check
function debouncedSlugCheck(slug: string) {
  if (slugCheckTimer) {
    clearTimeout(slugCheckTimer)
  }
  slugCheckTimer = setTimeout(() => {
    checkSlugAvailability(slug)
  }, 300)
}

// Auto-generate slug from title (only if user hasn't manually edited slug)
const hasManuallyEditedSlug = ref(false)

watch(projectTitle, (title) => {
  if (!hasManuallyEditedSlug.value) {
    projectSlug.value = generateSlug(title)
  }
})

// Watch slug changes for validation
watch(projectSlug, (slug) => {
  slugAvailable.value = null
  slugError.value = null
  if (slug) {
    debouncedSlugCheck(slug)
  }
})

// Handle manual slug input
function onSlugInput(event: Event) {
  hasManuallyEditedSlug.value = true
  const input = event.target as HTMLInputElement
  // Auto-format: lowercase and replace spaces with hyphens
  projectSlug.value = input.value.toLowerCase().replace(/\s+/g, '-')
}

// Preview URL
const previewUrl = computed(() => {
  if (!projectSlug.value) return 'your-project.lands.app'
  return `${projectSlug.value}.lands.app`
})

// Can create project
const canCreate = computed(() => {
  return (
    projectTitle.value.trim().length > 0 &&
    projectSlug.value.length >= 2 &&
    slugAvailable.value === true &&
    !isCreating.value &&
    !isCheckingSlug.value
  )
})

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    projectTitle.value = ''
    projectSlug.value = ''
    hasManuallyEditedSlug.value = false
    slugAvailable.value = null
    slugError.value = null
    isCreating.value = false
  }
})

function close() {
  if (!isCreating.value) {
    emit('update:open', false)
  }
}

async function createProject() {
  if (!canCreate.value) return

  isCreating.value = true
  try {
    const project = await projectsStore.createProject(projectTitle.value, undefined, projectSlug.value)
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
      />

      <!-- Modal -->
      <div
        class="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-foreground">
              Create blank project
            </h2>
            <p class="text-sm text-muted-foreground mt-0.5">
              Start with an empty canvas
            </p>
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

        <!-- Form -->
        <div class="space-y-4">
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
            <label class="text-sm font-medium text-foreground">Project slug</label>
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
            <!-- Error message -->
            <p v-if="slugError" class="text-xs text-destructive">
              {{ slugError }}
            </p>
            <!-- URL Preview -->
            <p v-else class="text-xs text-muted-foreground">
              Your page will be published at <span class="font-medium text-foreground">{{ previewUrl }}</span>
            </p>
          </div>
        </div>

        <!-- Custom Domain Info -->
        <div class="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <svg class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-xs text-muted-foreground">
            Want to use your own domain? Upgrade to <span class="font-medium text-foreground">Pro</span> to connect a custom domain like <span class="font-medium">yoursite.com</span>
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
          <button
            class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            @click="close"
          >
            Cancel
          </button>
          <button
            class="h-9 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canCreate"
            @click="createProject"
          >
            {{ isCreating ? 'Creating...' : 'Create project' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
