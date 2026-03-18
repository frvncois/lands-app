<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import MonetizeMinimal from './monetize/MonetizeMinimal.vue'
import MonetizeBaseline from './monetize/MonetizeBaseline.vue'
import MonetizeStructure from './monetize/MonetizeStructure.vue'
import { MOCK_MONETIZE_COLLECTIONS } from '@/lib/primitives/mockSectionContent'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'structure': return MonetizeStructure
    case 'baseline': return MonetizeBaseline
    default: return MonetizeMinimal
  }
})

const isMock = computed(() => ((props.section.content as any)?.collections ?? []).length === 0)

const displaySection = computed(() =>
  isMock.value
    ? { ...props.section, content: { ...(props.section.content as any), collections: MOCK_MONETIZE_COLLECTIONS } }
    : props.section
)
</script>

<template>
  <div class="relative">
    <component :is="component" :section="displaySection" />
  </div>
</template>
