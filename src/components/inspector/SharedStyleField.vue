<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Icon, Popover } from '@/components/ui'
import InspectorField from './InspectorField.vue'
import type { SectionBlockType, SharedStyle } from '@/types/editor'

const props = defineProps<{
  blockId: string
  blockType: SectionBlockType
}>()

const emit = defineEmits<{
  openCreateModal: []
}>()

const editorStore = useEditorStore()

// Get current block
const block = computed(() => editorStore.findBlockById(props.blockId))

// Get current shared style
const currentSharedStyle = computed<SharedStyle | undefined>(() => {
  if (!block.value?.sharedStyleId) return undefined
  return editorStore.getSharedStyleById(block.value.sharedStyleId)
})

// Get available styles for this block type
const availableStyles = computed(() => {
  return editorStore.getSharedStylesForType(props.blockType)
})

function handleSelectStyle(styleId: string, close: () => void) {
  editorStore.applySharedStyle(props.blockId, styleId)
  close()
}

function handleDetach(close: () => void) {
  editorStore.detachSharedStyle(props.blockId)
  close()
}

function handleCreate(close: () => void) {
  emit('openCreateModal')
  close()
}
</script>

<template>
  <InspectorField label="Shared Style" horizontal>
    <Popover align="right" width="w-56">
      <template #trigger="{ toggle }">
        <button
          class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
          @click="toggle"
        >
          <span
            class="w-2 h-2 rounded-full shrink-0"
            :class="currentSharedStyle ? 'bg-primary' : 'bg-muted-foreground/30'"
          />
          <span class="truncate max-w-24">{{ currentSharedStyle?.name || 'None' }}</span>
        </button>
      </template>

      <template #default="{ close }">
        <!-- Available styles -->
        <div v-if="availableStyles.length > 0" class="max-h-40 overflow-y-auto">
          <button
            v-for="style in availableStyles"
            :key="style.id"
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent/50 transition-colors text-left"
            :class="currentSharedStyle?.id === style.id ? 'bg-accent/30' : ''"
            @click="handleSelectStyle(style.id, close)"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="currentSharedStyle?.id === style.id ? 'bg-primary' : 'bg-muted-foreground/30'"
            />
            <span class="flex-1 truncate">{{ style.name }}</span>
            <Icon
              v-if="currentSharedStyle?.id === style.id"
              name="checkmark"
              :size="12"
              class="text-primary shrink-0"
            />
          </button>
        </div>

        <!-- Empty state -->
        <div v-else class="px-3 py-3 text-xs text-muted-foreground text-center">
          No shared styles for this block type
        </div>

        <!-- Divider -->
        <div class="border-t border-border" />

        <!-- Actions -->
        <div class="p-1">
          <!-- Detach current style -->
          <button
            v-if="currentSharedStyle"
            type="button"
            class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-accent/50 transition-colors text-left text-muted-foreground"
            @click="handleDetach(close)"
          >
            <Icon name="app-unlink" :size="12" />
            <span>Detach style</span>
          </button>

          <!-- Create new style -->
          <button
            type="button"
            class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-accent/50 transition-colors text-left"
            @click="handleCreate(close)"
          >
            <Icon name="plus" :size="12" />
            <span>Create from current</span>
          </button>
        </div>
      </template>
    </Popover>
  </InspectorField>
</template>
