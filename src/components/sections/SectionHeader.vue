<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import HeaderMinimal from './header/HeaderMinimal.vue'
import HeaderBold from './header/HeaderBold.vue'
import HeaderEditorial from './header/HeaderEditorial.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return HeaderBold
    case 'editorial': return HeaderEditorial
    default: return HeaderMinimal
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
