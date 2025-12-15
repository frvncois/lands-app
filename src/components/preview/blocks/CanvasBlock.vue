<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { SectionBlock, SectionBlockType, CanvasSettings, CanvasChildPosition } from '@/types/editor'
import { sectionBlockIcons, blocksByCategory } from '@/lib/editor-utils'
import { BackgroundMedia } from './index'
import Button from '@/components/ui/Button.vue'
import Dropdown from '@/components/ui/Dropdown.vue'
import DropdownItem from '@/components/ui/DropdownItem.vue'
import Icon from '@/components/ui/Icon.vue'
import { useEditorStore } from '@/stores/editor'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

/**
 * CanvasBlock - Renders children with absolute positioning
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
  isDropTarget: boolean
}>()

const emit = defineEmits<{
  (e: 'dragEnter', event: DragEvent): void
  (e: 'dragOver', event: DragEvent): void
  (e: 'dragLeave', event: DragEvent): void
  (e: 'drop', event: DragEvent): void
  (e: 'addBlock', type: SectionBlockType): void
}>()

const editorStore = useEditorStore()

const settings = computed(() => props.block.settings as CanvasSettings)

// Get position for a canvas child based on current viewport
function getCanvasChildPos(childId: string): CanvasChildPosition {
  const defaultPos: CanvasChildPosition = { x: 10, y: 10, width: undefined, zIndex: 1 }
  const viewport = editorStore.viewport
  const positions = settings.value?.childPositions
  if (!positions) return defaultPos

  // Fall back through viewports: mobile -> tablet -> desktop
  if (viewport === 'mobile') {
    return positions.mobile?.[childId] || positions.tablet?.[childId] || positions.desktop?.[childId] || defaultPos
  }
  if (viewport === 'tablet') {
    return positions.tablet?.[childId] || positions.desktop?.[childId] || defaultPos
  }
  return positions.desktop?.[childId] || defaultPos
}
</script>

<template>
  <div
    :data-block-id="block.id"
    class="relative transition-colors"
    :class="isDropTarget ? 'ring-2 ring-primary ring-dashed' : ''"
    :style="{
      ...styles,
      minHeight: styles.minHeight || '400px',
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

    <!-- Children with absolute positioning -->
    <template v-if="block.children && block.children.length > 0">
      <div
        v-for="(child, childIndex) in block.children"
        :key="child.id"
        class="absolute"
        :style="{
          left: `${getCanvasChildPos(child.id).x}%`,
          top: `${getCanvasChildPos(child.id).y}%`,
          width: getCanvasChildPos(child.id).width ? `${getCanvasChildPos(child.id).width}%` : 'auto',
          zIndex: getCanvasChildPos(child.id).zIndex || childIndex + 1,
        }"
      >
        <PreviewSection
          :block="child"
          :index="childIndex"
          :total="(block.children || []).length"
        />
      </div>
    </template>

    <!-- Empty State -->
    <div
      v-else
      class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground border-1 border-dashed border-border/50 m-4"
    >
      <Dropdown align="left" width="min-w-48" :close-on-click="true">
        <template #trigger="{ toggle }">
          <Button variant="dotted" size="sm" @click.stop="toggle">
            <Icon name="plus" :size="12" />
            Add content
          </Button>
        </template>
        <div class="py-1 font-sans">
          <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">Content</p>
          <DropdownItem
            v-for="type in (blocksByCategory.content as SectionBlockType[])"
            :key="type"
            :icon="sectionBlockIcons[type]"
            @click="emit('addBlock', type)"
          >
            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  </div>
</template>
