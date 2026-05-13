<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { SECTION_SETTINGS_CONFIG, resolveSettingsComponent } from '@/lib/primitives/sectionSettingsConfig'
import type { Section } from '@/types/section'

const props = defineProps<{ section: Section }>()

const themeStore = useThemeStore()
const component = computed(() => resolveSettingsComponent(SECTION_SETTINGS_CONFIG.footer!, themeStore.theme?.theme_preset ?? ''))
</script>

<template>
  <component :is="component" :section="section" />
</template>
