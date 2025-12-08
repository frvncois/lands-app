<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Button, Alert } from '@/components/ui'
import type { Project } from '@/types/project'

interface Props {
  open: boolean
  project: Project | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'left': []
}>()

const isLeavingProject = ref(false)

function close() {
  emit('update:open', false)
}

async function handleLeave() {
  if (!props.project) return

  isLeavingProject.value = true
  try {
    // TODO: Implement leave project API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('left')
    close()
  } finally {
    isLeavingProject.value = false
  }
}
</script>

<template>
  <Modal
    :open="open && !!project"
    size="md"
    :closable="!isLeavingProject"
    @update:open="close"
  >
    <template #header>
      <h2 class="text-lg font-semibold text-foreground">Leave Project</h2>
    </template>

    <Alert variant="warning">
      Are you sure you want to leave <span class="font-medium text-foreground">{{ project?.title }}</span>? You will lose access to this project and will need to be invited again to rejoin.
    </Alert>

    <template #footer>
      <Button variant="ghost" :disabled="isLeavingProject" @click="close">
        Cancel
      </Button>
      <Button variant="destructive" :loading="isLeavingProject" @click="handleLeave">
        {{ isLeavingProject ? 'Leaving...' : 'Leave Project' }}
      </Button>
    </template>
  </Modal>
</template>
