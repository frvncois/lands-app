<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronRightIcon, TrashIcon, Square2StackIcon } from '@heroicons/vue/24/outline'
import draggable from 'vuedraggable'
import type { FunctionalComponent } from 'vue'
import BaseButton from './BaseButton.vue'

export interface TreeNode {
  id: string
  label: string
  icon?: FunctionalComponent
  locked?: boolean
  sectionType?: string
  children?: TreeNode[]
}

const props = defineProps<{
  nodes: TreeNode[]
  depth?: number
  group?: string | object
}>()

const emit = defineEmits<{
  delete: [node: TreeNode]
  duplicate: [node: TreeNode]
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
          <!-- Icon acts as drag handle -->
          <span
            class="drag-handle shrink-0 flex items-center justify-center h-7 w-7 rounded-lg bg-gray-900 text-gray-100"
            :class="node.locked ? 'cursor-default' : 'cursor-grab'"
          >
            <component :is="node.icon" v-if="node.icon" class="h-3.5 w-3.5" />
          </span>

          <!-- Label -->
          <button
            class="flex-1 text-left text-sm text-gray-700 font-medium py-0.5"
            @click="node.children?.length ? toggle(node.id) : $emit('settings', node)"
          >
            {{ node.label }}
          </button>

          <!-- Action icons -->
          <div class="flex items-center gap-1 opacity-0 group-hover/node:opacity-100 transition-opacity">
            <template v-if="!node.locked">
              <BaseButton variant="icon" size="xs" title="Duplicate" @click.stop="$emit('duplicate', node)">
                <Square2StackIcon class="h-3.5 w-3.5" />
              </BaseButton>
              <BaseButton variant="icon" size="xs" title="Delete" class="hover:text-red-500 hover:bg-red-50" @click.stop="$emit('delete', node)">
                <TrashIcon class="h-3.5 w-3.5" />
              </BaseButton>
            </template>
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
