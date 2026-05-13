<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseTree from '@/shared/ui/BaseTree.vue'
import SectionsModal from '@/features/modals/modals/SectionsModal.vue'
import UpgradeCard from '@/features/editor/components/panel/UpgradeCard.vue'
import type { TreeNode } from '@/shared/ui/BaseTree.vue'
import { useLandStore } from '@/features/lands/stores/land'
import { useEditorStore } from '@/features/editor/stores/editor'
import { useSectionLifecycle } from '@/features/editor/composables/useSectionLifecycle'
import { useSectionInsert } from '@/features/editor/composables/useSectionInsert'
import { useSectionTree } from '@/features/editor/composables/useSectionTree'
import { usePlan } from '@/features/plan/composables/usePlan'
import { sortByPosition } from '@/shared/lib/position'
import type { SectionType } from '@/features/sections/types'

const landStore = useLandStore()
const editorStore = useEditorStore()
const { deleteSection, duplicateSection } = useSectionLifecycle()
const { insertAt, insertBeforeFooter, moveTo } = useSectionInsert()
const { nodes } = useSectionTree()
const { isPaid, withinSectionLimit, maxSections } = usePlan()

const showSections = ref(false)

const sectionCount = computed(() =>
  (landStore.activeLand?.sections ?? []).filter(s => s.type !== 'header' && s.type !== 'footer').length
)
const atMaxSections = computed(() => !withinSectionLimit(sectionCount.value))

function handleTreeSettings(node: TreeNode) {
  const section = landStore.activeLand?.sections.find(s => s.id === node.id)
  if (section) {
    showSections.value = false
    editorStore.setActiveSection(section, true)
  }
}

function handleSectionDrop(sectionType: string, newIndex: number) {
  insertAt(sectionType as SectionType, newIndex)
}

function handleReorder(oldIndex: number, newIndex: number) {
  const s = sortByPosition(landStore.activeLand?.sections ?? [])
  const sectionId = s[oldIndex]?.id
  if (sectionId) moveTo(sectionId, newIndex)
}

function handleAddSection(type: string) {
  insertBeforeFooter(type as SectionType)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <BaseTree :nodes="nodes" @settings="handleTreeSettings" @delete="deleteSection($event.id)" @duplicate="duplicateSection($event.id)" @reorder="handleReorder" @add="handleSectionDrop" />
    <BaseButton variant="outline" size="sm" :disabled="atMaxSections" @click="showSections = !showSections">
      {{ atMaxSections ? `Max ${maxSections + 2} sections reached` : '+ Add Section' }}
    </BaseButton>
    <Transition name="section-limit">
      <UpgradeCard v-if="atMaxSections && !isPaid" variant="compact" />
    </Transition>
  </div>

  <Transition name="modal-grow">
    <SectionsModal v-if="showSections" @close="showSections = false" @select="handleAddSection($event); showSections = false" />
  </Transition>
</template>

<style scoped>
.section-limit-enter-active {
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.section-limit-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.section-limit-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.section-limit-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
