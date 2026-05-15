<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseTree from '@/shared/ui/BaseTree.vue'
import UpgradeCard from '@/features/editor/components/panel/UpgradeCard.vue'
import type { TreeNode } from '@/shared/ui/BaseTree.vue'
import { useLandStore } from '@/features/lands/stores/land'
import { useEditorStore } from '@/features/editor/stores/editor'
import { useSectionInsert } from '@/features/editor/composables/useSectionInsert'
import { useSectionTree } from '@/features/editor/composables/useSectionTree'
import { useSectionLifecycle } from '@/features/editor/composables/useSectionLifecycle'
import { useEditorMutations } from '@/features/editor/composables/useEditorMutations'
import { usePlan } from '@/features/plan/composables/usePlan'
import { sortByPosition } from '@/shared/lib/position'

const landStore = useLandStore()
const editorStore = useEditorStore()
const { insertAt, insertBeforeFooter, moveTo } = useSectionInsert()
const { nodes } = useSectionTree()
const { deleteSection } = useSectionLifecycle()
const { toggleSectionVisibility } = useEditorMutations()
const { isPaid, withinSectionLimit, maxSections } = usePlan()

const sectionCount = computed(() =>
  (landStore.activeLand?.sections ?? []).filter(s => s.type !== 'header' && s.type !== 'footer').length
)
const atMaxSections = computed(() => !withinSectionLimit(sectionCount.value))

function handleTreeSettings(node: TreeNode) {
  const section = landStore.activeLand?.sections.find(s => s.id === node.id)
  if (section) editorStore.setActiveSection(section, true)
}

function handleSectionDrop(sectionType: string, newIndex: number) {
  insertAt(sectionType as 'content_media', newIndex)
}

function handleReorder(oldIndex: number, newIndex: number) {
  const s = sortByPosition(landStore.activeLand?.sections ?? [])
  const sectionId = s[oldIndex]?.id
  if (sectionId) moveTo(sectionId, newIndex)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <BaseTree
      :nodes="nodes"
      @settings="handleTreeSettings"
      @toggle-visibility="toggleSectionVisibility($event.id)"
      @delete="deleteSection($event.id)"
      @reorder="handleReorder"
      @add="handleSectionDrop"
    />
    <BaseButton variant="outline" size="sm" :disabled="atMaxSections" @click="insertBeforeFooter('content_media')">
      {{ atMaxSections ? `Max ${maxSections + 2} sections reached` : '+ Add content block' }}
    </BaseButton>
    <Transition name="section-limit">
      <UpgradeCard v-if="atMaxSections && !isPaid" variant="compact" />
    </Transition>
  </div>
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
