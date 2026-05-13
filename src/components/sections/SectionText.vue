<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import TextMinimal from './text/TextMinimal.vue'
import TextBaseline from './text/TextBaseline.vue'
import TextStructure from './text/TextStructure.vue'
import { MOCK_TEXT_CONTENT } from '@/lib/primitives/mockSectionContent'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'structure': return TextStructure
    case 'baseline': return TextBaseline
    default: return TextMinimal
  }
})

const isMock = computed(() => {
  if (props.section.type !== 'text') return true
  const c = props.section.content
  return !c || (!c.title?.trim() && !c.subtitle?.trim() && !c.body?.trim() && !c.buttons?.length)
})

const displaySection = computed((): Section =>
  isMock.value
    ? { ...props.section, content: MOCK_TEXT_CONTENT } as unknown as Section
    : props.section
)
</script>

<template>
  <div class="relative">
    <component :is="component" :section="displaySection" />
  </div>
</template>
