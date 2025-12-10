<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { Modal, Button, Input, FormField, Alert } from '@/components/ui'

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
  <Modal :open="open" size="md" :closable="!isDeleting" @update:open="emit('update:open', $event)">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <Icon name="trash-3" class="text-lg text-destructive" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">Delete Project</h2>
          <p class="text-sm text-muted-foreground">This action cannot be undone.</p>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <Alert variant="error">
        <p class="text-sm text-foreground">
          This will permanently delete <span class="font-semibold">{{ projectTitle }}</span> and all of its data including:
        </p>
        <ul class="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>All pages and content</li>
          <li>Analytics data</li>
          <li>Integrations and settings</li>
          <li>Collaborator access</li>
        </ul>
      </Alert>

      <FormField>
        <template #default>
          <label class="text-sm font-medium text-foreground mb-1.5 block">
            Type <span class="font-semibold text-destructive">{{ expectedConfirmation }}</span> to confirm
          </label>
          <Input
            v-model="confirmationText"
            :placeholder="expectedConfirmation"
            :error="!!error"
            @keyup.enter="deleteProject"
          />
        </template>
      </FormField>

      <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
    </div>

    <template #footer>
      <Button variant="ghost" :disabled="isDeleting" @click="close">
        Cancel
      </Button>
      <Button
        variant="destructive"
        :disabled="!isConfirmed"
        :loading="isDeleting"
        @click="deleteProject"
      >
        {{ isDeleting ? 'Deleting...' : 'Delete Project' }}
      </Button>
    </template>
  </Modal>
</template>
