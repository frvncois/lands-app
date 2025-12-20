<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import PreviewSection from '@/components/preview/PreviewSection.vue'

const designerStore = useDesignerStore()

// Compute page background style
const pageStyle = computed(() => {
  const settings = designerStore.pageSettings
  return {
    backgroundColor: settings.backgroundColor || '#ffffff',
    backgroundImage: settings.backgroundImage
      ? `url(${settings.backgroundImage})`
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

// Max width for the preview container
const containerStyle = computed(() => ({
  maxWidth: designerStore.pageSettings.maxWidth || '1200px',
  margin: '0 auto',
}))
</script>

<template>
  <div class="flex flex-col h-full bg-background overflow-hidden">
    <!-- Header -->
    <header
      class="h-12 flex items-center px-4 border-b border-sidebar-border flex-shrink-0"
    >
      <h2 class="text-sm font-medium text-foreground">Preview</h2>
    </header>

    <!-- Preview Area -->
    <div class="flex-1 overflow-auto p-6" :style="pageStyle">
      <div
        class="bg-white rounded-lg shadow-sm overflow-hidden min-h-full"
        :style="containerStyle"
      >
        <PreviewSection
          v-for="(block, index) in designerStore.blocks"
          :key="block.id"
          :block="block"
          :index="index"
          :total="designerStore.blocks.length"
        />

        <!-- Empty state -->
        <div
          v-if="designerStore.blocks.length === 0"
          class="flex items-center justify-center h-64 text-muted-foreground text-sm"
        >
          No blocks yet. Add some in the Designer.
        </div>
      </div>
    </div>
  </div>
</template>
