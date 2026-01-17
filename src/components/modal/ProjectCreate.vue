<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { supabase } from '@/lib/supabase'
import { Modal } from '@/components/ui/Modal'
import { Spinner, Input, FormField, Button } from '@/components/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'created': [projectId: string]
  'openWizard': [{ name: string; slug: string }]
}>()

const router = useRouter()
const projectsStore = useProjectsStore()

// Reserved slugs that cannot be used
const RESERVED_SLUGS = new Set([
  // Subdomains we use or might use
  'www', 'api', 'app', 'admin', 'dashboard', 'cdn', 'assets', 'static',
  // Auth-related
  'auth', 'login', 'logout', 'signup', 'register', 'oauth', 'callback', 'sso',
  // Account/settings
  'account', 'settings', 'profile', 'preferences', 'billing', 'subscription',
  // Support/info
  'help', 'support', 'docs', 'documentation', 'faq', 'status', 'about', 'contact',
  // Marketing
  'blog', 'news', 'pricing', 'features', 'terms', 'privacy', 'legal',
  // Technical
  'mail', 'email', 'smtp', 'ftp', 'ssh', 'git', 'test', 'dev', 'staging', 'demo',
  // Generic reserved
  'admin', 'administrator', 'root', 'system', 'null', 'undefined', 'true', 'false',
])

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
  // Reset state
  slugAvailable.value = null
  slugError.value = null

  // Minimum length check
  if (!slug || slug.length < 2) {
    slugError.value = slug ? 'Slug must be at least 2 characters' : null
    return
  }

  // Maximum length check
  if (slug.length > 63) {
    slugAvailable.value = false
    slugError.value = 'Slug must be 63 characters or less'
    return
  }

  // Format validation (lowercase letters, numbers, hyphens only)
  if (!/^[a-z0-9-]+$/.test(slug)) {
    slugAvailable.value = false
    slugError.value = 'Only lowercase letters, numbers, and hyphens allowed'
    return
  }

  // No leading/trailing hyphens
  if (slug.startsWith('-') || slug.endsWith('-')) {
    slugAvailable.value = false
    slugError.value = 'Slug cannot start or end with a hyphen'
    return
  }

  // No consecutive hyphens
  if (slug.includes('--')) {
    slugAvailable.value = false
    slugError.value = 'Slug cannot contain consecutive hyphens'
    return
  }

  // Reserved word check
  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    slugAvailable.value = false
    slugError.value = 'This slug is reserved and cannot be used'
    return
  }

  // Database availability check
  isCheckingSlug.value = true

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

// Computed slug with auto-formatting
const formattedSlug = computed({
  get: () => projectSlug.value,
  set: (value: string) => {
    // Mark as manually edited when user types
    hasManuallyEditedSlug.value = true
    // Auto-format: lowercase and replace spaces with hyphens
    projectSlug.value = value.toLowerCase().replace(/\s+/g, '-')
  }
})

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
    const project = await projectsStore.createProject(projectTitle.value, projectSlug.value)
    if (project) {
      emit('created', project.id)
      close()
      router.push({ name: 'designer', params: { projectId: project.id } })
    }
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <Modal
    :open="open"
    size="md"
    backdrop="blur"
    :persistent="isCreating"
    :closable="!isCreating"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div>
        <h2 class="text-xl font-semibold text-foreground">Create new project</h2>
        <p class="text-sm text-muted-foreground mt-0.5">Choose how you want to start</p>
      </div>
    </template>

    <!-- Form -->
    <div class="space-y-4">
      <!-- Project Title -->
      <FormField label="Project name">
        <Input
          v-model="projectTitle"
          type="text"
          placeholder="My landing page"
          :disabled="isCreating"
          @keyup.enter="createProject"
        />
      </FormField>

      <!-- Project Slug -->
      <FormField label="Project slug">
        <div class="relative">
          <Input
            v-model="formattedSlug"
            type="text"
            placeholder="my-landing-page"
            :disabled="isCreating"
            :class="[
              slugError ? 'border-destructive' : slugAvailable === true ? 'border-green-500' : ''
            ]"
            @keyup.enter="createProject"
          />
          <!-- Status indicator -->
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
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
        <p v-if="slugError" class="text-xs text-destructive mt-1">{{ slugError }}</p>
        <!-- URL Preview -->
        <p v-else class="text-xs text-muted-foreground mt-1">
          Your page will be published at <span class="font-medium text-foreground">{{ previewUrl }}</span>
        </p>
      </FormField>
    </div>

    <template #footer>
      <div class="w-full space-y-3">
        <Button
          variant="default"
          class="w-full"
          :disabled="!canCreate"
          @click="emit('openWizard', { name: projectTitle, slug: projectSlug })"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Setup wizard
        </Button>

        <Button
          variant="outline"
          class="w-full"
          :disabled="!canCreate"
          :loading="isCreating"
          @click="createProject"
        >
          <svg v-if="!isCreating" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ isCreating ? 'Creating...' : 'Start with blank template' }}
        </Button>

        <Button variant="ghost" class="w-full" :disabled="isCreating" @click="close">
          Cancel
        </Button>
      </div>
    </template>
  </Modal>
</template>
