<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import { Icon, Popover } from '@/components/ui'
import InspectorField from './InspectorField.vue'
import type { SectionBlockType, SharedStyle } from '@/types/designer'

const props = defineProps<{
  blockId: string
  blockType: SectionBlockType
}>()

const emit = defineEmits<{
  openCreateModal: []
}>()

const designerStore = useDesignerStore()

// Get current block
const block = computed(() => designerStore.findBlockById(props.blockId))

// Get current shared style
const currentSharedStyle = computed<SharedStyle | undefined>(() => {
  if (!block.value?.sharedStyleId) return undefined
  return designerStore.getSharedStyleById(block.value.sharedStyleId)
})

// Get available styles for this block type
const availableStyles = computed(() => {
  return designerStore.getSharedStylesForType(props.blockType)
})

function handleSelectStyle(styleId: string, close: () => void) {
  designerStore.applySharedStyle(props.blockId, styleId)
  close()
}

function handleDetach(close: () => void) {
  designerStore.detachSharedStyle(props.blockId)
  close()
}

function handleCreate(close: () => void) {
  emit('openCreateModal')
  close()
}

function handleDeleteStyle(styleId: string, event: Event) {
  event.stopPropagation()
  designerStore.deleteSharedStyle(styleId)
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
          <div
            v-for="style in availableStyles"
            :key="style.id"
            class="group relative flex items-center"
          >
            <button
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
            <!-- Delete button on hover -->
            <button
              type="button"
              class="absolute right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
              title="Delete shared style"
              @click="handleDeleteStyle(style.id, $event)"
            >
              <Icon name="trash-can" :size="12" />
            </button>
          </div>
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
