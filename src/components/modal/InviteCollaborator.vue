<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import type { CollaboratorRole } from '@/types/project'
import { COLLABORATOR_ROLE_INFO } from '@/types/project'
import { Modal, Button, Input, FormField, Alert } from '@/components/ui'

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
  <Modal :open="open" size="md" @update:open="emit('update:open', $event)">
    <template #header>
      <h2 class="text-lg font-semibold text-foreground">Invite Collaborator</h2>
    </template>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Email -->
      <FormField label="Email address">
        <Input
          v-model="email"
          type="email"
          placeholder="colleague@example.com"
          :disabled="isSubmitting"
        />
      </FormField>

      <!-- Role -->
      <FormField label="Role">
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
      </FormField>

      <!-- Error message -->
      <Alert v-if="errorMessage" variant="error">
        {{ errorMessage }}
      </Alert>
    </form>

    <template #footer>
      <Button variant="ghost" :disabled="isSubmitting" @click="close">
        Cancel
      </Button>
      <Button :loading="isSubmitting" @click="handleSubmit">
        {{ isSubmitting ? 'Sending...' : 'Send Invite' }}
      </Button>
    </template>
  </Modal>
</template>
