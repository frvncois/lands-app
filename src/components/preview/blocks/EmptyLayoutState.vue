<script setup lang="ts">
import type { SectionBlockType } from '@/types/editor'
import { sectionBlockLabels, sectionBlockIcons, blocksByCategory } from '@/lib/editor-utils'
import Icon from '@/components/ui/Icon.vue'
import Button from '@/components/ui/Button.vue'
import Dropdown from '@/components/ui/Dropdown.vue'
import DropdownItem from '@/components/ui/DropdownItem.vue'

/**
 * EmptyLayoutState - Empty state UI for layout blocks with quick-add functionality
 * Used by container, grid, stack, canvas, form blocks
 */
defineProps<{
  blockType: SectionBlockType
  showLayoutOptions?: boolean
}>()

const emit = defineEmits<{
  addBlock: [type: SectionBlockType]
  addLayout: [type: 'stack' | 'grid' | 'canvas']
  openPicker: []
}>()

// Common content block types for quick add
const contentBlocks: SectionBlockType[] = ['heading', 'text', 'button', 'image', 'icon']
const layoutBlocks: ('stack' | 'grid' | 'canvas')[] = ['stack', 'grid', 'canvas']

// Form-specific blocks
const formBlocks: SectionBlockType[] = ['form-label', 'form-input', 'form-textarea', 'form-select', 'form-button']
</script>

<template>
  <div class="flex flex-col items-center justify-center py-8 text-center text-muted-foreground/50 min-h-[100px]">
    <!-- Layout quick add (for container) -->
    <div v-if="showLayoutOptions" class="flex gap-2 mb-3">
      <Button
        v-for="type in layoutBlocks"
        :key="type"
        variant="ghost"
        size="sm"
        class="text-xs"
        @click="$emit('addLayout', type)"
      >
        <Icon :name="sectionBlockIcons[type]" class="w-3 h-3 mr-1" />
        {{ sectionBlockLabels[type] }}
      </Button>
    </div>

    <!-- Content quick add -->
    <Dropdown v-if="blockType !== 'form'" placement="bottom">
      <template #trigger>
        <Button variant="ghost" size="sm" class="text-xs">
          <Icon name="plus" class="w-3 h-3 mr-1" />
          Add content
        </Button>
      </template>

      <DropdownItem
        v-for="type in contentBlocks"
        :key="type"
        @click="$emit('addBlock', type)"
      >
        <Icon :name="sectionBlockIcons[type]" class="w-4 h-4 mr-2" />
        {{ sectionBlockLabels[type] }}
      </DropdownItem>

      <DropdownItem @click="$emit('openPicker')">
        <Icon name="more" class="w-4 h-4 mr-2" />
        More blocks...
      </DropdownItem>
    </Dropdown>

    <!-- Form-specific quick add -->
    <Dropdown v-else placement="bottom">
      <template #trigger>
        <Button variant="ghost" size="sm" class="text-xs">
          <Icon name="plus" class="w-3 h-3 mr-1" />
          Add field
        </Button>
      </template>

      <DropdownItem
        v-for="type in formBlocks"
        :key="type"
        @click="$emit('addBlock', type)"
      >
        <Icon :name="sectionBlockIcons[type]" class="w-4 h-4 mr-2" />
        {{ sectionBlockLabels[type] }}
      </DropdownItem>
    </Dropdown>
  </div>
</template>
