<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import FooterMinimalSettings from './footer/FooterMinimalSettings.vue'
import FooterDefaultSettings from './footer/FooterDefaultSettings.vue'
import type { FooterSection } from '@/types/section'

const props = defineProps<{ section: FooterSection }>()

const themeStore = useThemeStore()
const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'minimal':
    case 'baseline': return FooterMinimalSettings
    default:         return FooterDefaultSettings  // structure
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
