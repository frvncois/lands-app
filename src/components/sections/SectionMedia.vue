<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import MediaMinimal from './media/MediaMinimal.vue'
import MediaBold from './media/MediaBold.vue'
import MediaEditorial from './media/MediaEditorial.vue'
import { MOCK_MEDIA_CONTENT } from '@/lib/primitives/mockSectionContent'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return MediaBold
    case 'editorial': return MediaEditorial
    default: return MediaMinimal
  }
})

const isMock = computed(() => !(props.section.content as any)?.url)

const displaySection = computed(() =>
  isMock.value
    ? { ...props.section, content: MOCK_MEDIA_CONTENT }
    : props.section
)
</script>

<template>
  <div class="relative">
    <component :is="component" :section="displaySection" />
  </div>
</template>
