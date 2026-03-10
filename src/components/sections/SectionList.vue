<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import ListMinimal from './list/ListMinimal.vue'
import ListBold from './list/ListBold.vue'
import ListEditorial from './list/ListEditorial.vue'
import { MOCK_LIST_ITEMS } from '@/lib/primitives/mockSectionContent'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return ListBold
    case 'editorial': return ListEditorial
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
