<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import ListMinimal from './list/ListMinimal.vue'
import ListBold from './list/ListBold.vue'
import ListEditorial from './list/ListEditorial.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return ListBold
    case 'editorial': return ListEditorial
    default: return ListMinimal
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
