<script setup lang="ts">
import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import { sortByPosition } from '@/lib/utils/position'
import SectionHeader from '@/components/sections/SectionHeader.vue'
import SectionContentMedia from '@/components/sections/SectionContentMedia.vue'
import SectionList from '@/components/sections/SectionList.vue'
import SectionCollection from '@/components/sections/SectionCollection.vue'
import SectionCampaign from '@/components/sections/SectionCampaign.vue'
import SectionStore from '@/components/sections/SectionStore.vue'
import SectionMonetize from '@/components/sections/SectionMonetize.vue'
import SectionFooter from '@/components/sections/SectionFooter.vue'

const landStore = useLandStore()
const sections = computed(() => sortByPosition(landStore.activeLand?.sections ?? []))

const componentMap = {
  header: SectionHeader,
  content_media: SectionContentMedia,
  list: SectionList,
  collection: SectionCollection,
  campaign: SectionCampaign,
  store: SectionStore,
  monetize: SectionMonetize,
  footer: SectionFooter,
}
</script>

<template>
  <div class="space-y-8">
    <component
      v-for="section in sections"
      :key="section.id"
      :is="componentMap[section.type]"
      :section="section"
      class="theme-section"
      style="font-family: var(--theme-font)"
    />
    <div v-if="sections.length === 0" class="flex items-center justify-center h-64 text-sm text-gray-400">
      No sections yet. Click Edit to get started.
    </div>
  </div>
</template>
