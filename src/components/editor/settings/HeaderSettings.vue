<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import HeaderMinimalSettings from './header/HeaderMinimalSettings.vue'
import HeaderStructureSettings from './header/HeaderStructureSettings.vue'
import HeaderDefaultSettings from './header/HeaderDefaultSettings.vue'
import type { HeaderSection } from '@/types/section'

const props = defineProps<{ section: HeaderSection }>()

const themeStore = useThemeStore()
const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'structure':         return HeaderStructureSettings
    case 'minimal':
    case 'baseline':          return HeaderMinimalSettings
    default:                  return HeaderDefaultSettings
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
