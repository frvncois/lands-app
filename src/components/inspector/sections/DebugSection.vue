<script setup lang="ts">
import { computed } from 'vue'
import InspectorSection from '../InspectorSection.vue'
import type { SectionBlock } from '@/types/editor'

const props = defineProps<{
  block: SectionBlock | null
}>()

// Format block data for display
const blockData = computed(() => {
  if (!props.block) return null
  return {
    id: props.block.id,
    type: props.block.type,
    name: props.block.name,
    settings: props.block.settings,
    styles: props.block.styles,
    children: props.block.children?.length ?? 0,
  }
})

// Copy to clipboard
function copyToClipboard() {
  if (blockData.value) {
    navigator.clipboard.writeText(JSON.stringify(blockData.value, null, 2))
  }
}
</script>

<template>
  <InspectorSection title="Debug" icon="code">
    <div v-if="blockData" class="space-y-2">
      <!-- Quick info -->
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">ID:</span>
        <code class="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">{{ blockData.id }}</code>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Type:</span>
        <code class="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">{{ blockData.type }}</code>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Children:</span>
        <code class="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">{{ blockData.children }}</code>
      </div>

      <!-- JSON data -->
      <div class="mt-3 pt-3 border-t border-border">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-muted-foreground">Raw Data</span>
          <button
            type="button"
            class="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            @click="copyToClipboard"
          >
            Copy
          </button>
        </div>
        <pre class="p-2 bg-muted/50 rounded-md text-[10px] font-mono text-muted-foreground overflow-auto max-h-64 whitespace-pre-wrap break-all">{{ JSON.stringify(blockData, null, 2) }}</pre>
      </div>
    </div>
    <div v-else class="text-xs text-muted-foreground">
      No block selected
    </div>
  </InspectorSection>
</template>
