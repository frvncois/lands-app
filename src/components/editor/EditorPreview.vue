<script setup lang="ts">
import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { sortByPosition } from '@/lib/utils/position'
import type { Section } from '@/types/section'
import SectionHeader from '@/components/sections/SectionHeader.vue'
import SectionText from '@/components/sections/SectionText.vue'
import SectionMedia from '@/components/sections/SectionMedia.vue'
import SectionList from '@/components/sections/SectionList.vue'
import SectionCollection from '@/components/sections/SectionCollection.vue'
import SectionCampaign from '@/components/sections/SectionCampaign.vue'
import SectionStore from '@/components/sections/SectionStore.vue'
import SectionFooter from '@/components/sections/SectionFooter.vue'

const landStore = useLandStore()
const editorStore = useEditorStore()

const sections = computed(() => sortByPosition(landStore.activeLand?.sections ?? []))

const componentMap = {
  header: SectionHeader,
  text: SectionText,
  media: SectionMedia,
  list: SectionList,
  collection: SectionCollection,
  campaign: SectionCampaign,
  store: SectionStore,
  footer: SectionFooter,
}

function selectSection(section: Section) {
  if (editorStore.isEditMode) {
    editorStore.setActiveSection(section, true)
  }
}
</script>

<template>
  <div class="space-y-8" style="font-family: var(--theme-font)">
    <div
      v-for="section in sections"
      :key="section.id"
      class="relative group"
      :class="editorStore.isEditMode ? 'cursor-pointer' : ''"
      @click="selectSection(section)"
    >
      <component :is="componentMap[section.type]" :section="section" />

      <div
        v-if="editorStore.isEditMode"
        class="absolute inset-0 border-2 transition-colors pointer-events-none"
        :class="editorStore.activeSection?.id === section.id
          ? 'border-blue-500'
          : 'border-transparent group-hover:border-blue-300'"
      />
    </div>

    <div v-if="sections.length === 0" class="flex items-center justify-center h-64 text-sm text-gray-400">
      No sections yet. Add one from the editor panel.
    </div>
  </div>
</template>