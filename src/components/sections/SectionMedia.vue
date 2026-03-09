<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import MediaMinimal from './media/MediaMinimal.vue'
import MediaBold from './media/MediaBold.vue'
import MediaEditorial from './media/MediaEditorial.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return MediaBold
    case 'editorial': return MediaEditorial
    default: return MediaMinimal
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
