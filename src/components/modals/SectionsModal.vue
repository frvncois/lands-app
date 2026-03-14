<script setup lang="ts">
import { computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import BaseItem from '@/components/ui/BaseItem.vue'
import draggable from 'vuedraggable'
import { sectionPrimitives } from '@/sections/index'
import type { SectionPrimitive } from '@/sections/index'
import type { TreeNode } from '@/components/ui/BaseTree.vue'
import { usePlan } from '@/composables/usePlan'

const { canAddSectionType } = usePlan()

defineEmits<{ close: [], select: [id: string] }>()

const addableSections = computed(() =>
  sectionPrimitives.filter((s) => s.id !== 'header' && s.id !== 'footer' && canAddSectionType(s.id))
)

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
  <div class="fixed top-16 right-80 w-72 z-50 bg-white shadow-xl rounded-2xl mr-2">
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 class="text-sm font-semibold text-gray-900">Add section</h2>
      <button @click="$emit('close')">
        <XMarkIcon class="h-4 w-4 text-gray-400 hover:text-gray-600" />
      </button>
    </div>
    <draggable
      :list="addableSections"
      :clone="cloneForDrop"
      item-key="id"
      :group="{ name: 'sections', pull: 'clone', put: false }"
      :sort="false"
      class="flex flex-col gap-2 p-4"
    >
      <template #item="{ element }">
        <div class="flex flex-col">
          <BaseItem
            :icon="element.icon"
            :title="element.label"
            :description="element.description"
            size="sm"
            grab
            @click="$emit('select', element.id); $emit('close')"
          />
        </div>
      </template>
    </draggable>
  </div>
</template>
