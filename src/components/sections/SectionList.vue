<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import ListMinimal from './list/ListMinimal.vue'
import ListBaseline from './list/ListBaseline.vue'
import ListStructure from './list/ListStructure.vue'
import { MOCK_LIST_ITEMS } from '@/lib/primitives/mockSectionContent'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'structure': return ListStructure
    case 'baseline': return ListBaseline
    default: return ListMinimal
  }
})

const isMock = computed(() => ((props.section.content as any)?.items ?? []).length === 0)

const displaySection = computed(() =>
  isMock.value
    ? { ...props.section, content: { ...(props.section.content as any), items: MOCK_LIST_ITEMS, title: '[ Section Title ]' } }
    : props.section
)
</script>

<template>
  <div class="relative">
    <component :is="component" :section="displaySection" />
  </div>
</template>
