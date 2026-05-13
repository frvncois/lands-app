<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import MediaMinimal from './media/MediaMinimal.vue'
import MediaBaseline from './media/MediaBaseline.vue'
import MediaStructure from './media/MediaStructure.vue'
import { MOCK_MEDIA_CONTENT } from '@/lib/primitives/mockSectionContent'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'structure': return MediaStructure
    case 'baseline': return MediaBaseline
    default: return MediaMinimal
  }
})

const isMock = computed(() => props.section.type !== 'media' || !props.section.content?.url)

const displaySection = computed((): Section =>
  isMock.value
    ? { ...props.section, content: MOCK_MEDIA_CONTENT } as unknown as Section
    : props.section
)
</script>

<template>
  <div class="relative">
    <component :is="component" :section="displaySection" />
  </div>
</template>
