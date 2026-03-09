<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { Section } from '@/types/section'
import StoreMinimal from './store/StoreMinimal.vue'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

const component = computed(() => {
  // Future: switch on theme_preset for Bold/Editorial variants
  return StoreMinimal
})
</script>

<template>
  <component :is="component" :section="section" />
</template>
