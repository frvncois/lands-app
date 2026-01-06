<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { ConfirmModal } from '@/components/ui/Modal'

const props = defineProps<{
  open: boolean
  projectId: string
  projectTitle: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  deleted: []
}>()

const router = useRouter()
const projectsStore = useProjectsStore()
const isDeleting = ref(false)

async function handleConfirm() {
  isDeleting.value = true

  try {
    const success = await projectsStore.deleteProject(props.projectId)
    if (success) {
      emit('deleted')
      emit('update:open', false)
      // Only redirect to dashboard if not already there
      if (router.currentRoute.value.name !== 'dashboard') {
        router.push({ name: 'dashboard' })
      }
    }
  } finally {
    isDeleting.value = false
  }
}

const message = `This will permanently delete '${props.projectTitle}' and all of its data including pages, analytics, integrations, and collaborator access.`
</script>

<template>
  <ConfirmModal
    :open="open"
    title="Delete Project"
    :message="message"
    confirm-text="Delete Project"
    :confirm-input="projectTitle"
    variant="danger"
    :loading="isDeleting"
    @update:open="emit('update:open', $event)"
    @confirm="handleConfirm"
  />
</template>
