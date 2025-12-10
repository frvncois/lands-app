<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Icon, Tooltip } from '@/components/ui'
import InspectorField from './InspectorField.vue'
import type { StyleState } from '@/types/editor'

const props = defineProps<{
  blockId: string
}>()

const editorStore = useEditorStore()

const currentState = computed(() => editorStore.currentStyleState)

const hasCurrentStateStyles = computed(() => {
  return editorStore.hasStateStyles(props.blockId)
})

// Check if each state has styles defined
const hasHoverStyles = computed(() => editorStore.hasStylesForState(props.blockId, 'hover'))
const hasPressedStyles = computed(() => editorStore.hasStylesForState(props.blockId, 'pressed'))
const hasFocusedStyles = computed(() => editorStore.hasStylesForState(props.blockId, 'focused'))

// State button config
const stateButtons: { value: StyleState; icon: string; tooltip: string }[] = [
  { value: 'none', icon: 'app-settings', tooltip: 'Base' },
  { value: 'hover', icon: 'app-hover', tooltip: 'On Hover' },
  { value: 'pressed', icon: 'app-pressed', tooltip: 'On Press' },
  { value: 'focused', icon: 'app-focused', tooltip: 'On Focus' },
]

function handleStateChange(state: StyleState) {
  editorStore.setStyleState(state)
}

function handleReset() {
  editorStore.resetStateStyles(props.blockId)
}

// Check if a state has styles
function stateHasStyles(state: StyleState): boolean {
  if (state === 'none') return false
  if (state === 'hover') return hasHoverStyles.value
  if (state === 'pressed') return hasPressedStyles.value
  if (state === 'focused') return hasFocusedStyles.value
  return false
}
</script>

<template>
  <InspectorField label="State" horizontal>
    <div class="flex items-center gap-2">
      <!-- State buttons group -->
      <div class="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
        <Tooltip v-for="btn in stateButtons" :key="btn.value" :text="btn.tooltip">
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded transition-colors"
            :class="[
              currentState === btn.value
                ? 'bg-background text-foreground shadow-sm'
                : stateHasStyles(btn.value)
                  ? 'text-foreground hover:bg-background/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            ]"
            @click="handleStateChange(btn.value)"
          >
            <Icon :name="btn.icon" :size="16" />
          </button>
        </Tooltip>
      </div>

      <!-- Reset button (only shown when editing a state and it has styles) -->
      <Tooltip v-if="currentState !== 'none' && hasCurrentStateStyles" text="Reset">
        <button
          type="button"
          class="flex items-center justify-center w-7 h-7 rounded transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          @click="handleReset"
        >
          <Icon name="app-undo" :size="16" />
        </button>
      </Tooltip>
    </div>
  </InspectorField>
</template>
