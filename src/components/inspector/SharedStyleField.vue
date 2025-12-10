<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Icon } from '@/components/ui'
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

// Dropdown state
const isDropdownOpen = ref(false)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function handleSelectStyle(styleId: string) {
  editorStore.applySharedStyle(props.blockId, styleId)
  closeDropdown()
}

function handleDetach() {
  editorStore.detachSharedStyle(props.blockId)
}

function handleCreate() {
  emit('openCreateModal')
}

function handleRemoveStyle() {
  editorStore.detachSharedStyle(props.blockId)
  closeDropdown()
}
</script>

<template>
  <InspectorField label="Shared Style">
    <div class="flex items-center gap-1.5">
      <!-- Dropdown -->
      <div class="relative flex-1">
        <!-- Dropdown trigger -->
        <button
          type="button"
          class="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors text-left"
          @click="toggleDropdown"
        >
          <!-- Status indicator -->
          <span
            v-if="currentSharedStyle"
            class="w-2 h-2 rounded-full bg-primary shrink-0"
            title="Synced"
          />
          <span
            v-else
            class="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0"
          />

          <!-- Label -->
          <span class="flex-1 truncate" :class="currentSharedStyle ? 'text-foreground' : 'text-muted-foreground'">
            {{ currentSharedStyle?.name || 'None' }}
          </span>

          <Icon name="chevron-down" :size="10" class="text-muted-foreground shrink-0" />
        </button>

        <!-- Dropdown menu -->
        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isDropdownOpen"
            class="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
          >
            <!-- Available styles -->
            <div v-if="availableStyles.length > 0" class="max-h-40 overflow-y-auto">
              <button
                v-for="style in availableStyles"
                :key="style.id"
                type="button"
                class="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left"
                :class="currentSharedStyle?.id === style.id ? 'bg-muted/30' : ''"
                @click="handleSelectStyle(style.id)"
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
            <div v-else class="px-3 py-2 text-xs text-muted-foreground">
              No shared styles for this block type
            </div>

            <!-- Divider -->
            <div class="border-t border-border" />

            <!-- Actions -->
            <div class="p-1.5">
              <!-- Remove current style -->
              <button
                v-if="currentSharedStyle"
                type="button"
                class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-muted/50 transition-colors text-left text-muted-foreground"
                @click="handleRemoveStyle"
              >
                <Icon name="xmark" :size="12" />
                <span>Remove style</span>
              </button>

              <!-- Create new style -->
              <button
                type="button"
                class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-muted/50 transition-colors text-left"
                @click="handleCreate"
              >
                <Icon name="plus" :size="12" />
                <span>Create from current</span>
              </button>
            </div>
          </div>
        </Transition>

        <!-- Click outside to close -->
        <div
          v-if="isDropdownOpen"
          class="fixed inset-0 z-40"
          @click="closeDropdown"
        />
      </div>

      <!-- Detach/Unlink button -->
      <button
        v-if="currentSharedStyle"
        type="button"
        class="p-1.5 rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground shrink-0"
        title="Detach from shared style"
        @click="handleDetach"
      >
        <Icon name="app-unlink" :size="14" />
      </button>
    </div>
  </InspectorField>
</template>
