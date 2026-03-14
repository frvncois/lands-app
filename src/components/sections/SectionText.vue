<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section, TextContent } from '@/types/section'
import TextMinimal from './text/TextMinimal.vue'
import TextBold from './text/TextBold.vue'
import TextEditorial from './text/TextEditorial.vue'
import { MOCK_TEXT_CONTENT } from '@/lib/primitives/mockSectionContent'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return TextBold
    case 'editorial': return TextEditorial
    default: return TextMinimal
  }
})

const isMock = computed(() => {
  const c = props.section.content as TextContent | null
  return !c || (!c.title?.trim() && !c.subtitle?.trim() && !c.body?.trim() && !c.buttons?.length)
})

const displaySection = computed(() =>
  isMock.value
    ? { ...props.section, content: MOCK_TEXT_CONTENT }
    : props.section
)
</script>

<template>
  <div class="relative">
    <component :is="component" :section="displaySection" />
  </div>
</template>
