<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { SectionBlock, ContainerSettings, ContainerStyles } from '@/types/editor'
import { BackgroundMedia } from './index'
import Icon from '@/components/ui/Icon.vue'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

/**
 * ContainerBlock - Renders a flex container with children
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
  isDropTarget: boolean
  childDropIndex: number | null
}>()

const emit = defineEmits<{
  dragEnter: [event: DragEvent]
  dragOver: [event: DragEvent]
  dragLeave: [event: DragEvent]
  drop: [event: DragEvent]
  childDragOver: [index: number, event: DragEvent]
  childDragLeave: []
  addLayoutBlock: [type: 'stack' | 'grid' | 'canvas']
}>()

const settings = computed(() => props.block.settings as ContainerSettings)
const containerStyles = computed(() => props.block.styles as ContainerStyles)
</script>

<template>
  <div
    class="relative flex transition-colors"
    :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
    :style="{
      ...styles,
      flexDirection: containerStyles?.flexDirection || 'column',
      justifyContent: containerStyles?.justifyContent || 'flex-start',
      alignItems: containerStyles?.alignItems || 'stretch',
      backgroundColor: settings?.backgroundType && settings.backgroundType !== 'color' ? undefined : styles.backgroundColor,
    }"
    @dragenter="emit('dragEnter', $event)"
    @dragover="emit('dragOver', $event)"
    @dragleave="emit('dragLeave', $event)"
    @drop="emit('drop', $event)"
  >
    <!-- Background Media -->
    <BackgroundMedia
      :type="settings?.backgroundType"
      :image="settings?.backgroundImage"
      :video="settings?.backgroundVideo"
      :image-opacity="settings?.backgroundImageOpacity"
      :image-blur="settings?.backgroundImageBlur"
      :image-saturation="settings?.backgroundImageSaturation"
    />

    <!-- Children -->
    <template v-if="block.children && block.children.length > 0">
      <template v-for="(child, childIndex) in block.children" :key="child.id">
        <!-- Drop indicator before this child -->
        <div
          v-if="childDropIndex === childIndex"
          class="absolute left-0 right-0 h-1 bg-primary rounded-full z-10 -translate-y-2"
          :style="{ top: `${childIndex * 100 / block.children.length}%` }"
        />
        <div
          class="relative z-10"
          @dragover="emit('childDragOver', childIndex, $event)"
          @dragleave="emit('childDragLeave')"
        >
          <PreviewSection
            :block="child"
            :index="childIndex"
            :total="block.children.length"
          />
        </div>
      </template>
      <!-- Drop indicator after last child -->
      <div
        v-if="childDropIndex === block.children.length"
        class="h-1 bg-primary rounded-full"
      />
    </template>

    <!-- Empty State with Layout Options -->
    <div
      v-else
      class="relative z-30 flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground border-1 border-dashed border-border/50"
    >
      <div class="flex items-center gap-2">
        <button
          class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent/50 transition-colors"
          @click.stop="emit('addLayoutBlock', 'stack')"
        >
          <div class="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
            <Icon name="layout-stack" :size="20" class="text-muted-foreground" />
          </div>
          <span class="text-xs">Stack</span>
        </button>
        <button
          class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent/50 transition-colors"
          @click.stop="emit('addLayoutBlock', 'grid')"
        >
          <div class="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
            <Icon name="layout-grid" :size="20" class="text-muted-foreground" />
          </div>
          <span class="text-xs">Grid</span>
        </button>
        <button
          class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent/50 transition-colors"
          @click.stop="emit('addLayoutBlock', 'canvas')"
        >
          <div class="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
            <Icon name="layout-canvas" :size="20" class="text-muted-foreground" />
          </div>
          <span class="text-xs">Canvas</span>
        </button>
      </div>
    </div>
  </div>
</template>
