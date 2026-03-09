<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronRightIcon, Bars3Icon } from '@heroicons/vue/24/outline'
import draggable from 'vuedraggable'
import BaseButton from './BaseButton.vue'

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

const props = defineProps<{
  nodes: TreeNode[]
  depth?: number
}>()

const emit = defineEmits<{
  delete: [node: TreeNode]
  settings: [node: TreeNode]
  reorder: [oldIndex: number, newIndex: number]
}>()

const collapsed = ref<Set<string>>(new Set())
const localNodes = ref<TreeNode[]>([...props.nodes])

watch(() => props.nodes, (val) => {
  localNodes.value = [...val]
}, { deep: true })

function toggle(id: string) {
  collapsed.value.has(id) ? collapsed.value.delete(id) : collapsed.value.add(id)
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
    class="flex flex-col gap-2"
    @end="onDragEnd"
  >
    <template #item="{ element: node }">
      <li class="group/node">
        <div class="flex items-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors p-2">
          <span class="drag-handle p-2 cursor-grab text-gray-300 hover:text-gray-500">
            <Bars3Icon class="h-3.5 w-3.5" />
          </span>
          <button
            class="flex-1 flex items-center py-1.5 text-sm text-gray-700 font-medium"
            @click="node.children?.length ? toggle(node.id) : undefined"
          >
            {{ node.label }}
          </button>
          <div class="flex items-center gap-2 opacity-0 group-hover/node:opacity-100 transition-opacity">
            <BaseButton size="xs" variant="outline" @click.stop="$emit('delete', node)">Remove</BaseButton>
            <BaseButton size="xs" variant="solid" @click.stop="$emit('settings', node)">Edit</BaseButton>
          </div>
          <ChevronRightIcon
            v-if="node.children?.length"
            class="h-3.5 w-3.5 text-gray-400 transition-transform shrink-0 ml-1"
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
