<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Icon } from '@/components/ui'
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
const stateButtons: { value: StyleState; icon: string; title: string }[] = [
  { value: 'none', icon: 'app-settings', title: 'Base styles' },
  { value: 'hover', icon: 'app-hover', title: 'Hover state' },
  { value: 'pressed', icon: 'app-pressed', title: 'Pressed state' },
  { value: 'focused', icon: 'app-focused', title: 'Focused state' },
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
        <button
          v-for="btn in stateButtons"
          :key="btn.value"
          type="button"
          class="flex items-center justify-center w-7 h-7 rounded transition-colors"
          :class="[
            currentState === btn.value
              ? 'bg-background text-foreground shadow-sm'
              : stateHasStyles(btn.value)
                ? 'text-foreground hover:bg-background/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          ]"
          :title="btn.title"
          @click="handleStateChange(btn.value)"
        >
          <Icon :name="btn.icon" :size="16" />
        </button>
      </div>

      <!-- Reset button (only shown when editing a state and it has styles) -->
      <button
        v-if="currentState !== 'none' && hasCurrentStateStyles"
        type="button"
        class="flex items-center justify-center w-7 h-7 rounded transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        title="Reset state styles"
        @click="handleReset"
      >
        <Icon name="app-undo" :size="16" />
      </button>
    </div>
  </InspectorField>
</template>
