<script setup lang="ts">
import { computed } from 'vue'
import type { SettingsSection } from '@/types/settings'

const props = defineProps<{
  sections: SettingsSection[]
}>()

function canShow(section: SettingsSection): boolean {
  if (section.visible && !section.visible()) return false
  return true
}

const visibleSections = computed(() =>
  props.sections.filter(canShow)
)
</script>

<template>
  <div class="columns-2 gap-6">
    <component
      v-for="section in visibleSections"
      :key="section.id"
      :is="section.component"
      :category="section.id"
      class="break-inside-avoid mb-6"
    />
  </div>
</template>
