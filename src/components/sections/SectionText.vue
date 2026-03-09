<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import TextMinimal from './text/TextMinimal.vue'
import TextBold from './text/TextBold.vue'
import TextEditorial from './text/TextEditorial.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  switch (themeStore.theme?.theme_preset) {
    case 'bold': return TextBold
    case 'editorial': return TextEditorial
    default: return TextMinimal
  }
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
