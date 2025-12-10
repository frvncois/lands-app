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
}>()

const editorStore = useEditorStore()

const styleName = ref('')
const isCreating = ref(false)

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    // Generate default name based on block type
    const blockLabel = sectionBlockLabels[props.blockType] || props.blockType
    const existingCount = editorStore.getSharedStylesForType(props.blockType).length
    styleName.value = existingCount > 0
      ? `${blockLabel} Style ${existingCount + 1}`
      : `${blockLabel} Style`
  }
})

function handleClose() {
  emit('update:open', false)
}

async function handleCreate() {
  if (!styleName.value.trim()) return

  isCreating.value = true
  try {
    editorStore.createSharedStyle(styleName.value.trim(), props.blockId)
    handleClose()
  } finally {
    isCreating.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && styleName.value.trim()) {
    handleCreate()
  }
}
</script>

<template>
  <Modal
    :open="open"
    title="Create Shared Style"
    size="sm"
    @close="handleClose"
  >
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        Create a reusable style from this {{ sectionBlockLabels[blockType]?.toLowerCase() || 'block' }}.
        You can apply it to other {{ sectionBlockLabels[blockType]?.toLowerCase() || 'block' }}s later.
      </p>

      <FormField label="Style Name">
        <Input
          v-model="styleName"
          placeholder="Enter style name"
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
          :disabled="!styleName.trim()"
          @click="handleCreate"
        >
          Create Style
        </Button>
      </div>
    </template>
  </Modal>
</template>
