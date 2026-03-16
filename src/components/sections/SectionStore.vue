<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import StoreMinimal from './store/StoreMinimal.vue'
import StoreStructure from './store/StoreStructure.vue'
import { MOCK_STORES } from '@/lib/primitives/mockSectionContent'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'structure': return StoreStructure
    default: return StoreMinimal
  }
})

const isMock = computed(() => ((props.section.content as any)?.stores ?? []).length === 0)

const displaySection = computed(() =>
  isMock.value
    ? { ...props.section, content: { ...(props.section.content as any), stores: MOCK_STORES } }
    : props.section
)
</script>

<template>
  <div class="relative">
    <component :is="component" :section="displaySection" />
  </div>
</template>
