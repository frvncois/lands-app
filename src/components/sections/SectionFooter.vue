<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import FooterMinimal from './footer/FooterMinimal.vue'
import FooterBold from './footer/FooterBold.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return FooterBold
    default: return FooterMinimal
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
