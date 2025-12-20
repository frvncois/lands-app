<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import ContentBlockItem from './ContentBlockItem.vue'
import DesignSettingsPanel from './DesignSettingsPanel.vue'
import type { SectionBlock } from '@/types/designer'

const designerStore = useDesignerStore()

const activeTab = ref<'content' | 'design'>('content')

// Content block types that have editable content
const contentBlockTypes = ['heading', 'text', 'image', 'video', 'button', 'icon']

// Flatten blocks with hierarchy info for display
interface ContentItem {
  block: SectionBlock
  depth: number
  path: string[]
}

function collectContentBlocks(
  blocks: SectionBlock[],
  depth = 0,
  path: string[] = []
): ContentItem[] {
  const items: ContentItem[] = []

  for (const block of blocks) {
    const currentPath = [...path, block.name]

    // Only include blocks with editable content
    if (contentBlockTypes.includes(block.type)) {
      items.push({ block, depth, path: currentPath })
    }

    // Recurse into children
    if (block.children && block.children.length > 0) {
      items.push(...collectContentBlocks(block.children, depth + 1, currentPath))
    }
  }

  return items
}

const contentItems = computed(() => collectContentBlocks(designerStore.blocks))

// Check if there are any content blocks
const hasContentBlocks = computed(() => contentItems.value.length > 0)
</script>

<template>
  <div class="flex flex-col h-full bg-sidebar-background">
    <!-- Header with tabs -->
    <header
      class="h-12 flex items-center px-4 border-b border-sidebar-border gap-1"
    >
      <button
        class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
        :class="
          activeTab === 'content'
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="activeTab = 'content'"
      >
        Content
      </button>
      <button
        class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
        :class="
          activeTab === 'design'
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="activeTab = 'design'"
      >
        Design
      </button>
    </header>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <template v-if="activeTab === 'content'">
        <div v-if="hasContentBlocks" class="space-y-3">
          <ContentBlockItem
            v-for="item in contentItems"
            :key="item.block.id"
            :block="item.block"
            :depth="item.depth"
            :path="item.path"
          />
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center h-full text-center px-4"
        >
          <p class="text-sm text-muted-foreground">
            No content blocks found. Add some blocks in the Designer to edit
            their content here.
          </p>
        </div>
      </template>

      <template v-else>
        <DesignSettingsPanel />
      </template>
    </div>
  </div>
</template>
