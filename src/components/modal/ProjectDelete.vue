<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'

const props = defineProps<{
  open: boolean
  projectId: string
  projectTitle: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'deleted': []
}>()

const router = useRouter()
const projectsStore = useProjectsStore()

const confirmationText = ref('')
const isDeleting = ref(false)
const error = ref('')

const expectedConfirmation = computed(() => props.projectTitle)
const isConfirmed = computed(() => confirmationText.value === expectedConfirmation.value)

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    confirmationText.value = ''
    error.value = ''
  }
})

function close() {
  if (!isDeleting.value) {
    emit('update:open', false)
  }
}

async function deleteProject() {
  if (!isConfirmed.value || isDeleting.value) return

  isDeleting.value = true
  error.value = ''

  try {
    const success = await projectsStore.deleteProject(props.projectId)
    if (success) {
      emit('deleted')
      close()
      // Only redirect to dashboard if not already there
      if (router.currentRoute.value.name !== 'dashboard') {
        router.push({ name: 'dashboard' })
      }
    } else {
      error.value = 'Failed to delete project. Please try again.'
    }
  } catch (e) {
    error.value = 'An error occurred while deleting the project.'
  } finally {
    isDeleting.value = false
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
        class="absolute inset-0 bg-black/50"
        @click="close"
      ></div>

      <!-- Modal -->
      <div class="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <i class="lni lni-trash-3 text-lg text-destructive"></i>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-foreground">Delete Project</h2>
            <p class="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p class="text-sm text-foreground">
              This will permanently delete <span class="font-semibold">{{ projectTitle }}</span> and all of its data including:
            </p>
            <ul class="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>All pages and content</li>
              <li>Analytics data</li>
              <li>Integrations and settings</li>
              <li>Collaborator access</li>
            </ul>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">
              Type <span class="font-semibold text-destructive">{{ expectedConfirmation }}</span> to confirm
            </label>
            <input
              v-model="confirmationText"
              type="text"
              class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background"
              :placeholder="expectedConfirmation"
              autofocus
              @keyup.enter="deleteProject"
            />
          </div>

          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        </div>

        <div class="flex items-center justify-end gap-3 mt-6">
          <button
            class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            :disabled="isDeleting"
            @click="close"
          >
            Cancel
          </button>
          <button
            class="h-9 px-4 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!isConfirmed || isDeleting"
            @click="deleteProject"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Project' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
