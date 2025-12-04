<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { LinkItem, LinkSectionSettings } from '@/types/editor'

const props = defineProps<{
  link: LinkItem
  settings: LinkSectionSettings
  blockId: string
}>()

const editorStore = useEditorStore()

const isSelected = computed(() =>
  editorStore.selectedBlockId === props.blockId &&
  editorStore.selectedItemId === props.link.id
)

function handleClick(event: MouseEvent) {
  event.stopPropagation()
  editorStore.selectBlock(props.blockId, props.link.id)
}
</script>

<template>
  <a
    :href="link.url"
    class="relative group block bg-card rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors"
    @click.prevent="handleClick"
  >
    <!-- Selection outline -->
    <div
      v-if="isSelected"
      class="absolute -inset-1 border-2 border-primary rounded-lg pointer-events-none z-10"
    />

    <!-- Image -->
    <div v-if="settings.showImage" class="aspect-square bg-secondary">
      <img
        v-if="link.image"
        :src="link.image"
        :alt="link.heading"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-muted-foreground"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div v-if="settings.showHeading" class="p-3">
      <h3 class="font-medium text-foreground text-center truncate">
        {{ link.heading }}
      </h3>
    </div>
  </a>
</template>
