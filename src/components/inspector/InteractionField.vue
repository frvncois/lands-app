<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Button, Icon, Tooltip } from '@/components/ui'
import InspectorField from './InspectorField.vue'
import type { Interaction } from '@/types/editor'

const props = defineProps<{
  blockId: string
}>()

const emit = defineEmits<{
  edit: [interactionId: string]
  create: []
}>()

const editorStore = useEditorStore()

// Get interactions where this block is the trigger
const blockInteractions = computed(() => {
  return editorStore.getInteractionsForBlock(props.blockId)
})

// Get interaction count
const interactionCount = computed(() => blockInteractions.value.length)

// Dropdown state
const isDropdownOpen = ref(false)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function handleEditInteraction(interactionId: string) {
  emit('edit', interactionId)
  closeDropdown()
}

function handleCreateInteraction() {
  emit('create')
  closeDropdown()
}

function handleDeleteInteraction(interactionId: string) {
  editorStore.deleteInteraction(interactionId)
}

function handleDuplicateInteraction(interactionId: string) {
  editorStore.duplicateInteraction(interactionId)
}

// Get trigger icon based on type
function getTriggerIcon(trigger: Interaction['trigger']): string {
  switch (trigger) {
    case 'hover': return 'app-hover'
    case 'click': return 'app-pressed'
    case 'load': return 'play'
    case 'appear': return 'eye'
    default: return 'interaction'
  }
}

// Get trigger label
function getTriggerLabel(trigger: Interaction['trigger']): string {
  switch (trigger) {
    case 'hover': return 'Hover'
    case 'click': return 'Click'
    case 'load': return 'Page load'
    case 'appear': return 'Appear'
    default: return trigger
  }
}
</script>

<template>
  <InspectorField label="Interactions">
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
            class="w-2 h-2 rounded-full shrink-0"
            :class="interactionCount > 0 ? 'bg-violet-500' : 'bg-muted-foreground/30'"
          />

          <!-- Label -->
          <span class="flex-1 truncate" :class="interactionCount > 0 ? 'text-foreground' : 'text-muted-foreground'">
            {{ interactionCount > 0 ? `${interactionCount} interaction${interactionCount > 1 ? 's' : ''}` : 'None' }}
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
            <!-- Existing interactions -->
            <div v-if="blockInteractions.length > 0" class="max-h-48 overflow-y-auto">
              <div
                v-for="interaction in blockInteractions"
                :key="interaction.id"
                class="group flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors"
              >
                <!-- Edit button (main action) -->
                <button
                  type="button"
                  class="flex-1 flex items-center gap-2 text-left"
                  @click="handleEditInteraction(interaction.id)"
                >
                  <!-- Trigger icon -->
                  <Tooltip :text="getTriggerLabel(interaction.trigger)">
                    <Icon :name="getTriggerIcon(interaction.trigger)" :size="12" class="text-violet-500 shrink-0" />
                  </Tooltip>

                  <!-- Name -->
                  <span class="flex-1 truncate">{{ interaction.name }}</span>

                  <!-- Target indicator -->
                  <Tooltip text="Target block">
                    <span class="text-[10px] text-muted-foreground">
                      {{ interaction.targetBlockId === blockId ? 'self' : 'other' }}
                    </span>
                  </Tooltip>
                </button>

                <!-- Actions (visible on hover) -->
                <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip text="Duplicate">
                    <button
                      type="button"
                      class="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      @click.stop="handleDuplicateInteraction(interaction.id)"
                    >
                      <Icon name="copy" :size="10" />
                    </button>
                  </Tooltip>
                  <Tooltip text="Delete">
                    <button
                      type="button"
                      class="p-1 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      @click.stop="handleDeleteInteraction(interaction.id)"
                    >
                      <Icon name="trash" :size="10" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="px-3 py-3 text-xs text-muted-foreground text-center">
              No interactions yet
            </div>

            <!-- Divider -->
            <div class="border-t border-border" />

            <!-- Create action -->
            <div class="p-1.5">
              <button
                type="button"
                class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-violet-500/10 transition-colors text-left text-violet-600 dark:text-violet-400"
                @click="handleCreateInteraction"
              >
                <Icon name="plus" :size="12" />
                <span>Create interaction</span>
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
    </div>
  </InspectorField>
</template>
