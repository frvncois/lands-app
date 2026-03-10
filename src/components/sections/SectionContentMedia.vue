<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section, ContentMediaContent } from '@/types/section'
import ContentMediaMinimal from './content-media/ContentMediaMinimal.vue'
import ContentMediaBold from './content-media/ContentMediaBold.vue'
import ContentMediaEditorial from './content-media/ContentMediaEditorial.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return ContentMediaBold
    case 'editorial': return ContentMediaEditorial
    default: return ContentMediaMinimal
  }
})

const c = computed(() => props.section.content as ContentMediaContent | null)
const isMock = computed(() => !c.value?.title && !c.value?.media_url)

const displaySection = computed(() =>
  isMock.value
    ? {
        ...props.section,
        content: {
          media_type: 'image',
          media_url: '',
          title: '[ Your headline here ]',
          subtitle: '[ Subtitle ]',
          body: '[ Add a short description to support your headline and guide readers. ]',
          buttons: [{ id: 'mock-1', label: '[ Button ]', url: '#' }],
        },
      }
    : props.section
)
</script>

<template>
  <div class="relative">
    <component :is="component" :section="displaySection" />
  </div>
</template>
