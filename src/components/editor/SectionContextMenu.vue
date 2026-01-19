<script setup lang="ts">
/**
 * Section Context Menu
 *
 * Right-click menu for sections on canvas and sidebar.
 * Shows different options based on context (section vs content).
 */

import { ref, computed } from 'vue'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import { useSectionContextMenu } from '@/composables/useSectionContextMenu'
import type { SectionInstance } from '@/types/sections'

interface Props {
  section: SectionInstance
  fieldKey?: string  // If provided, this is a content-level menu
  location: 'canvas' | 'sidebar'
}

const props = defineProps<Props>()

const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)

const {
  hasRepeatableItems,
  getRepeatableInfo,
  editSection,
  editContent,
  addItem,
  duplicateSection,
  deleteSection,
  hideContent,
} = useSectionContextMenu()

// Determine if this is a content-level or section-level menu
const isContentMenu = computed(() => !!props.fieldKey)

// Get repeater info for Add Item option
const repeatableInfo = computed(() => getRepeatableInfo(props.section))

// Expose open method to parent
function open(event: MouseEvent) {
  contextMenuRef.value?.open(event)
}

defineExpose({ open })

// Action handlers
function handleEdit() {
  if (isContentMenu.value && props.fieldKey) {
    editContent(props.section.id, props.fieldKey)
  } else {
    editSection(props.section.id)
  }
}

function handleAddItem() {
  if (repeatableInfo.value) {
    addItem(props.section.id, repeatableInfo.value.key)
  }
}

function handleDuplicate() {
  duplicateSection(props.section.id)
}

function handleDelete() {
  deleteSection(props.section.id)
}

function handleHide() {
  if (props.fieldKey) {
    hideContent(props.section.id, props.fieldKey)
  }
}
</script>

<template>
  <ContextMenu ref="contextMenuRef">
    <!-- Content-level menu -->
    <template v-if="isContentMenu">
      <ContextMenu.Item
        icon="app-editor"
        @click="handleEdit"
      >
        Edit content
      </ContextMenu.Item>
      <ContextMenu.Item
        icon="app-hide"
        @click="handleHide"
      >
        Hide
      </ContextMenu.Item>
    </template>

    <!-- Section-level menu -->
    <template v-else>
      <ContextMenu.Item
        icon="app-editor"
        @click="handleEdit"
      >
        Edit section
      </ContextMenu.Item>
      <ContextMenu.Item
        v-if="repeatableInfo"
        icon="plus"
        @click="handleAddItem"
      >
        Add {{ repeatableInfo.label }}
      </ContextMenu.Item>
      <ContextMenu.Divider />
      <ContextMenu.Item
        icon="app-duplicate"
        @click="handleDuplicate"
      >
        Duplicate section
      </ContextMenu.Item>
      <ContextMenu.Item
        icon="app-delete"
        destructive
        @click="handleDelete"
      >
        Delete section
      </ContextMenu.Item>
    </template>
  </ContextMenu>
</template>
