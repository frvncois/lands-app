<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { SectionBlock, SectionBlockType, ButtonSettings, ButtonStyles } from '@/types/designer'
import { sectionBlockIcons } from '@/lib/designer-utils'
import Button from '@/components/ui/Button.vue'
import Dropdown from '@/components/ui/Dropdown.vue'
import DropdownItem from '@/components/ui/DropdownItem.vue'
import Icon from '@/components/ui/Icon.vue'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

/**
 * ButtonBlock - Renders a button/link that contains children (text, images, icons, stacks)
 * Works like a Stack - always uses children for content.
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
  isDropTarget?: boolean
  childDropIndex?: number | null
}>()

const emit = defineEmits<{
  labelChange: [label: string]
  dragEnter: [event: DragEvent]
  dragOver: [event: DragEvent]
  dragLeave: [event: DragEvent]
  drop: [event: DragEvent]
  childDragOver: [index: number, event: DragEvent]
  childDragLeave: []
  addBlock: [type: SectionBlockType]
}>()

const settings = computed(() => props.block.settings as ButtonSettings)
const buttonStyles = computed(() => props.block.styles as ButtonStyles)

// Check if button has children
const hasChildren = computed(() => props.block.children && props.block.children.length > 0)

// Check if horizontal layout
const isHorizontal = computed(() => buttonStyles.value?.flexDirection === 'row')

// Combined styles including flex properties
const combinedStyles = computed(() => ({
  ...props.styles,
  flexDirection: buttonStyles.value?.flexDirection || 'row',
  justifyContent: buttonStyles.value?.justifyContent || 'center',
  alignItems: buttonStyles.value?.alignItems || 'center',
  gap: buttonStyles.value?.gap || '8px',
  color: buttonStyles.value?.color || buttonStyles.value?.textColor || undefined,
}))

// Content block types that can be added to button
const buttonContentTypes = ['text', 'icon', 'image'] as SectionBlockType[]
</script>

<template>
  <a
    :href="settings?.url || '#'"
    :target="settings?.newTab ? '_blank' : undefined"
    :rel="settings?.newTab ? 'noopener noreferrer' : undefined"
    class="inline-flex cursor-pointer no-underline"
    :style="combinedStyles"
    @click.prevent.stop
    @dragenter="emit('dragEnter', $event)"
    @dragover="emit('dragOver', $event)"
    @dragleave="emit('dragLeave', $event)"
    @drop="emit('drop', $event)"
  >
    <!-- Children -->
    <template v-if="hasChildren">
      <div
        v-for="(child, childIndex) in block.children"
        :key="child.id"
        class="relative"
        @dragover="emit('childDragOver', childIndex, $event)"
        @dragleave="emit('childDragLeave')"
      >
        <PreviewSection
          :block="child"
          :index="childIndex"
          :total="block.children!.length"
        />
      </div>
    </template>

    <!-- Empty State -->
    <div
      v-else
      class="flex items-center justify-center py-2 px-4 text-muted-foreground border-1 border-dashed border-border/50 rounded"
    >
      <Dropdown align="left" width="min-w-36" :close-on-click="true">
        <template #trigger="{ toggle }">
          <Button variant="dotted" size="xs" @click.stop="toggle">
            <Icon name="plus" :size="10" />
            Add
          </Button>
        </template>
        <div class="py-1 font-sans">
          <DropdownItem
            v-for="type in buttonContentTypes"
            :key="type"
            :icon="sectionBlockIcons[type]"
            @click="emit('addBlock', type)"
          >
            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  </a>
</template>
