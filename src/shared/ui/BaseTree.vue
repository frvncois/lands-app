<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronRightIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import draggable from 'vuedraggable'
import type { FunctionalComponent } from 'vue'
import BaseButton from './BaseButton.vue'

export interface TreeNode {
  id: string
  label: string
  icon?: FunctionalComponent
  imageUrl?: string
  locked?: boolean
  visible?: boolean
  sectionType?: string
  children?: TreeNode[]
}

const props = defineProps<{
  nodes: TreeNode[]
  depth?: number
  group?: string | object
}>()

const emit = defineEmits<{
  'toggle-visibility': [node: TreeNode]
  settings: [node: TreeNode]
  reorder: [oldIndex: number, newIndex: number]
  add: [sectionType: string, newIndex: number]
}>()

const collapsed = ref<Set<string>>(new Set())
const localNodes = ref<TreeNode[]>([...props.nodes])

watch(() => props.nodes, (val) => {
  localNodes.value = [...val]
}, { deep: true })

function toggle(id: string) {
  collapsed.value.has(id) ? collapsed.value.delete(id) : collapsed.value.add(id)
}

function onMove(evt: { draggedContext: { element: TreeNode; futureIndex: number }; relatedContext: { element: TreeNode } }) {
  if (evt.draggedContext.element.locked) return false
  if (evt.relatedContext?.element?.locked) return false
  if (evt.draggedContext.futureIndex === 0) return false
  return true
}

function onAdd(event: { newIndex: number }) {
  const node = localNodes.value[event.newIndex]
  if (node?.sectionType) {
    const sectionType = node.sectionType
    const newIndex = event.newIndex
    // Remove the temporary node — parent will add the real section
    localNodes.value.splice(newIndex, 1)
    // Never allow inserting before the header — clamp to position 1
    emit('add', sectionType, Math.max(1, newIndex))
  }
}

function onDragEnd(event: { oldIndex: number; newIndex: number }) {
  emit('reorder', event.oldIndex, event.newIndex)
}
</script>

<template>
  <draggable
    v-model="localNodes"
    item-key="id"
    handle=".drag-handle"
    ghost-class="opacity-40"
    tag="ul"
    class="flex flex-col gap-1"
    :group="group ?? { name: 'sections', pull: true, put: true }"
    :move="onMove"
    @add="onAdd"
    @end="onDragEnd"
  >
    <template #item="{ element: node }">
      <li class="group/node">
        <div class="flex items-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors p-1.5 gap-2">
          <!-- Icon / cover image acts as drag handle -->
          <span
            class="drag-handle shrink-0 flex items-center justify-center h-7 w-7 rounded-lg overflow-hidden"
            :class="[node.locked ? 'cursor-default' : 'cursor-grab', node.imageUrl ? '' : 'bg-gray-900 text-gray-100']"
          >
            <img v-if="node.imageUrl" :src="node.imageUrl" class="h-full w-full object-cover" />
            <component v-else-if="node.icon" :is="node.icon" class="h-3.5 w-3.5" />
          </span>

          <!-- Label -->
          <button
            class="flex-1 text-left text-sm text-gray-700 font-medium py-0.5 truncate"
            @click="node.children?.length ? toggle(node.id) : $emit('settings', node)"
          >
            {{ node.label.length > 15 ? node.label.slice(0, 15) + '…' : node.label }}
          </button>

          <!-- Action icons -->
          <div class="flex items-center gap-1 opacity-0 group-hover/node:opacity-100 transition-opacity">
            <BaseButton
              variant="icon"
              size="xs"
              :title="node.visible === false ? 'Show section' : 'Hide section'"
              :class="node.visible === false ? 'text-gray-300' : 'text-gray-500'"
              @click.stop="$emit('toggle-visibility', node)"
            >
              <EyeSlashIcon v-if="node.visible === false" class="h-3.5 w-3.5" />
              <EyeIcon v-else class="h-3.5 w-3.5" />
            </BaseButton>
            <BaseButton variant="solid" size="xs" @click.stop="$emit('settings', node)">
              Edit
            </BaseButton>
          </div>

          <ChevronRightIcon
            v-if="node.children?.length"
            class="h-3.5 w-3.5 text-gray-400 transition-transform shrink-0"
            :class="{ 'rotate-90': !collapsed.has(node.id) }"
          />
        </div>

        <BaseTree
          v-if="node.children?.length && !collapsed.has(node.id)"
          :nodes="node.children"
          :depth="(depth ?? 0) + 1"
        />
      </li>
    </template>
  </draggable>
</template>
