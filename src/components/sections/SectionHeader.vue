<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import HeaderMinimal from './header/HeaderMinimal.vue'
import HeaderBaseline from './header/HeaderBaseline.vue'
import HeaderStructure from './header/HeaderStructure.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'structure': return HeaderStructure
    case 'baseline': return HeaderBaseline
    default: return HeaderMinimal
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
