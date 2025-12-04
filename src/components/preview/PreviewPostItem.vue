<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { PostItem, PostSectionSettings } from '@/types/editor'

const props = defineProps<{
  post: PostItem
  settings: PostSectionSettings
  blockId: string
}>()

const editorStore = useEditorStore()

const isSelected = computed(() =>
  editorStore.selectedBlockId === props.blockId &&
  editorStore.selectedItemId === props.post.id
)

function handleClick(event: MouseEvent) {
  event.stopPropagation()
  editorStore.selectBlock(props.blockId, props.post.id)
}
</script>

<template>
  <div
    class="relative group bg-card rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors"
    @click="handleClick"
  >
    <!-- Selection outline -->
    <div
      v-if="isSelected"
      class="absolute -inset-1 border-2 border-primary rounded-lg pointer-events-none z-10"
    />

    <!-- Image -->
    <div v-if="settings.showImage" class="aspect-video bg-secondary">
      <img
        v-if="post.image"
        :src="post.image"
        :alt="post.heading"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-muted-foreground"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-2">
      <!-- Heading -->
      <h3
        v-if="settings.showHeading"
        class="font-semibold text-foreground"
      >
        {{ post.heading }}
      </h3>

      <!-- Text -->
      <p
        v-if="settings.showText"
        class="text-sm text-muted-foreground line-clamp-2"
      >
        {{ post.text }}
      </p>

      <!-- Button -->
      <button
        v-if="settings.showButton"
        class="mt-2 px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        {{ post.buttonTitle }}
      </button>
    </div>
  </div>
</template>
