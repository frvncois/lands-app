<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import FooterMinimal from './footer/FooterMinimal.vue'
import FooterBaseline from './footer/FooterBaseline.vue'
import FooterStructure from './footer/FooterStructure.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'structure': return FooterStructure
    case 'baseline': return FooterBaseline
    default: return FooterMinimal
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
