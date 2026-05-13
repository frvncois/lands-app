<script setup lang="ts">
import { computed } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import { sortByPosition } from '@/shared/lib/position'
import SectionRenderer from '@/features/editor/components/sections/SectionRenderer.vue'

const landStore = useLandStore()
const sections = computed(() => sortByPosition(landStore.activeLand?.sections ?? []))
</script>

<template>
  <div class="space-y-8">
    <SectionRenderer
      v-for="section in sections"
      :key="section.id"
      :section="section"
      class="theme-section"
      style="font-family: var(--theme-font)"
    />
    <div v-if="sections.length === 0" class="flex items-center justify-center h-64 text-sm text-gray-400">
      No sections yet. Click Edit to get started.
    </div>
  </div>
</template>
