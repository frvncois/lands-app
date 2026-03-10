<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import CollectionMinimal from './collection/CollectionMinimal.vue'
import CollectionBold from './collection/CollectionBold.vue'
import CollectionEditorial from './collection/CollectionEditorial.vue'
import { MOCK_COLLECTIONS } from '@/lib/primitives/mockSectionContent'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return CollectionBold
    case 'editorial': return CollectionEditorial
    default: return CollectionMinimal
  }
})

const isMock = computed(() => ((props.section.content as any)?.collections ?? []).length === 0)

const displaySection = computed(() =>
  isMock.value
    ? { ...props.section, content: { ...(props.section.content as any), collections: MOCK_COLLECTIONS } }
    : props.section
)
</script>

<template>
  <div class="relative">
    <component :is="component" :section="displaySection" />
  </div>
</template>
