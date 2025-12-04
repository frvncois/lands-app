<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import type { CollaboratorRole } from '@/types/project'
import { COLLABORATOR_ROLE_INFO } from '@/types/project'

const props = defineProps<{
  open: boolean
  projectId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'invited': []
}>()

const projectsStore = useProjectsStore()

const email = ref('')
const role = ref<CollaboratorRole>('editor')
const isSubmitting = ref(false)
const errorMessage = ref('')

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    email.value = ''
    role.value = 'editor'
    errorMessage.value = ''
    projectsStore.clearError()
  }
})

function close() {
  emit('update:open', false)
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!email.value.trim()) {
    errorMessage.value = 'Email is required'
    return
  }

  if (!isValidEmail(email.value.trim())) {
    errorMessage.value = 'Please enter a valid email address'
    return
  }

  isSubmitting.value = true

  try {
    const invite = await projectsStore.inviteCollaborator(
      props.projectId,
      email.value.trim().toLowerCase(),
      role.value
    )

    if (invite) {
      emit('invited')
      close()
    } else if (projectsStore.error) {
      errorMessage.value = projectsStore.error
    }
  } finally {
    isSubmitting.value = false
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
      />

      <!-- Modal -->
      <div class="relative w-full max-w-md bg-background border border-border rounded-xl shadow-lg">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 class="text-lg font-semibold text-foreground">Invite Collaborator</h2>
          <button
            class="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            @click="close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              Email address
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="colleague@example.com"
              class="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">
              Role
            </label>
            <div class="space-y-2">
              <label
                v-for="(info, roleKey) in COLLABORATOR_ROLE_INFO"
                :key="roleKey"
                class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors"
                :class="role === roleKey ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'"
              >
                <input
                  v-model="role"
                  type="radio"
                  :value="roleKey"
                  class="mt-0.5"
                  :disabled="isSubmitting"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium text-foreground">{{ info.label }}</p>
                  <p class="text-xs text-muted-foreground">{{ info.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="errorMessage" class="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {{ errorMessage }}
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
              :disabled="isSubmitting"
              @click="close"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Sending...' : 'Send Invite' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
