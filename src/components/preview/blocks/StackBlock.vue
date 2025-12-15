<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue'
import type { SectionBlock, SectionBlockType, StackSettings, StackStyles } from '@/types/editor'
import { sectionBlockIcons, blocksByCategory } from '@/lib/editor-utils'
import { BackgroundMedia } from './index'
import Button from '@/components/ui/Button.vue'
import Dropdown from '@/components/ui/Dropdown.vue'
import DropdownItem from '@/components/ui/DropdownItem.vue'
import Icon from '@/components/ui/Icon.vue'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

/**
 * StackBlock - Renders a flex container with vertical/horizontal stacking
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
  isDropTarget: boolean
  childDropIndex: number | null
}>()

const emit = defineEmits<{
  (e: 'dragEnter', event: DragEvent): void
  (e: 'dragOver', event: DragEvent): void
  (e: 'dragLeave', event: DragEvent): void
  (e: 'drop', event: DragEvent): void
  (e: 'childDragOver', index: number, event: DragEvent): void
  (e: 'childDragLeave'): void
  (e: 'addBlock', type: SectionBlockType): void
}>()

const settings = computed(() => props.block.settings as StackSettings)
const stackStyles = computed(() => props.block.styles as StackStyles)

const isHorizontal = computed(() => stackStyles.value?.flexDirection === 'row')
</script>

<template>
  <div
    class="relative flex transition-colors"
    :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
    :style="{
      ...styles,
      flexDirection: stackStyles?.flexDirection || 'column',
      justifyContent: stackStyles?.justifyContent || 'flex-start',
      alignItems: stackStyles?.alignItems || 'stretch',
      gap: stackStyles?.gap || '16px',
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
      <div
        v-for="(child, childIndex) in block.children"
        :key="child.id"
        class="relative z-10"
        @dragover="emit('childDragOver', childIndex, $event)"
        @dragleave="emit('childDragLeave')"
      >
        <!-- Drop indicator -->
        <div
          v-if="childDropIndex === childIndex"
          :class="isHorizontal
            ? 'absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10'
            : 'absolute left-0 right-0 -top-2 h-1 bg-primary rounded-full z-10'"
        />
        <PreviewSection
          :block="child"
          :index="childIndex"
          :total="block.children.length"
        />
        <!-- Drop indicator after last child -->
        <div
          v-if="childDropIndex === block.children.length && childIndex === block.children.length - 1"
          :class="isHorizontal
            ? 'absolute -right-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10'
            : 'absolute left-0 right-0 -bottom-2 h-1 bg-primary rounded-full z-10'"
        />
      </div>
    </template>

    <!-- Empty State -->
    <div
      v-else
      class="relative z-30 flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground border-1 border-dashed border-border/50"
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
