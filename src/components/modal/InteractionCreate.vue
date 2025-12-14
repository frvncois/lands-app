<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Modal, Button, Input, FormField } from '@/components/ui'
import { sectionBlockLabels } from '@/lib/editor-utils'
import type { SectionBlockType } from '@/types/editor'

const props = defineProps<{
  open: boolean
  blockId: string
  blockType: SectionBlockType
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'created': [interactionId: string]
}>()

const editorStore = useEditorStore()

const interactionName = ref('')
const isCreating = ref(false)

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    // Generate default name based on block type
    const blockLabel = sectionBlockLabels[props.blockType] || props.blockType
    const existingCount = editorStore.getInteractionsForBlock(props.blockId).length
    interactionName.value = existingCount > 0
      ? `${blockLabel} Interaction ${existingCount + 1}`
      : `${blockLabel} Interaction`
  }
})

function handleClose() {
  emit('update:open', false)
}

async function handleCreate() {
  if (!interactionName.value.trim()) return

  isCreating.value = true
  try {
    const interaction = editorStore.createInteraction({
      name: interactionName.value.trim(),
      trigger: 'hover',
      triggerBlockId: props.blockId,
      targetBlockIds: [props.blockId],
      effectType: 'transition',
      duration: '300ms',
      easing: 'ease',
      styles: {},
    })
    if (interaction) {
      emit('created', interaction.id)
    }
    handleClose()
  } finally {
    isCreating.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && interactionName.value.trim()) {
    handleCreate()
  }
}
</script>

<template>
  <Modal
    :open="open"
    title="Create Interaction"
    size="sm"
    @close="handleClose"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        Create an interaction for this {{ sectionBlockLabels[blockType]?.toLowerCase() || 'block' }}.
        You can configure triggers, effects, and styles after creation.
      </p>

      <FormField label="Interaction Name">
        <Input
          v-model="interactionName"
          placeholder="Enter interaction name"
          autofocus
          @keydown="handleKeydown"
        />
      </FormField>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" @click="handleClose">
          Cancel
        </Button>
        <Button
          :loading="isCreating"
          :disabled="!interactionName.trim()"
          @click="handleCreate"
        >
          Create Interaction
        </Button>
      </div>
    </template>
  </Modal>
</template>
