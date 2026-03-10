<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { sectionPrimitives } from '@/sections/index'
import type { SectionPrimitive } from '@/sections/index'
import BaseItem from '@/components/ui/BaseItem.vue'
import draggable from 'vuedraggable'
import type { TreeNode } from '@/components/ui/BaseTree.vue'

defineEmits<{ close: [], select: [id: string] }>()

function cloneForDrop(section: SectionPrimitive): TreeNode {
  return {
    id: `__new__${section.id}`,
    label: section.label,
    icon: section.icon,
    sectionType: section.id,
  }
}
</script>

<template>
  <div class="fixed top-20 right-[21rem] w-72 z-50 bg-white shadow-xl rounded-2xl">
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 class="text-sm font-semibold text-gray-900">Add section</h2>
      <button @click="$emit('close')">
        <XMarkIcon class="h-4 w-4 text-gray-400 hover:text-gray-600" />
      </button>
    </div>
    <draggable
      :list="sectionPrimitives"
      :clone="cloneForDrop"
      item-key="id"
      :group="{ name: 'sections', pull: 'clone', put: false }"
      :sort="false"
      class="flex flex-col gap-1 p-2"
    >
      <template #item="{ element }">
        <div>
          <BaseItem
            :icon="element.icon"
            :title="element.label"
            :description="element.description"
            size="sm"
            clickable
            @click="$emit('select', element.id); $emit('close')"
          />
        </div>
      </template>
    </draggable>
  </div>
</template>
