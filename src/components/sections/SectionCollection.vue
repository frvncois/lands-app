<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import CollectionMinimal from './collection/CollectionMinimal.vue'
import CollectionBold from './collection/CollectionBold.vue'
import CollectionEditorial from './collection/CollectionEditorial.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return CollectionBold
    case 'editorial': return CollectionEditorial
    default: return CollectionMinimal
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
