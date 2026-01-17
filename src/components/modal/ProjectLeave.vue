<script setup lang="ts">
import { ref, computed } from 'vue'
import { ConfirmModal } from '@/components/ui/Modal'
import type { Project } from '@/types/project'

const props = defineProps<{
  open: boolean
  project: Project | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  left: []
}>()

const isLeavingProject = ref(false)

const message = computed(() => {
  if (!props.project) return ''
  return `Are you sure you want to leave "${props.project.title}"? You will lose access to this project and will need to be invited again to rejoin.`
})

async function handleConfirm() {
  if (!props.project) return

  isLeavingProject.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('left')
    emit('update:open', false)
  } finally {
    isLeavingProject.value = false
  }
}
</script>

<template>
  <ConfirmModal
    :open="open && !!project"
    title="Leave Project"
    :message="message"
    confirm-text="Leave Project"
    variant="danger"
    :loading="isLeavingProject"
    @update:open="emit('update:open', $event)"
    @confirm="handleConfirm"
  />
</template>
