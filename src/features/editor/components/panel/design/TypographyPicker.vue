<script setup lang="ts">
import { computed } from 'vue'
import { THEME_PRESET_DEFINITIONS } from '@/features/theme/presets'
import { useThemeStore } from '@/features/theme/stores/theme'
import { useEditorMutations } from '@/features/editor/composables/useEditorMutations'
import BaseFont from '@/shared/ui/BaseFont.vue'

const themeStore = useThemeStore()
const { updateTheme } = useEditorMutations()

const activePairings = computed(() => {
  const preset = themeStore.theme?.theme_preset ?? 'minimal'
  return THEME_PRESET_DEFINITIONS[preset].pairings
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <BaseFont
      v-for="pairing in activePairings"
      :key="pairing.id"
      :label="pairing.label"
      :titleFont="pairing.titleFont"
      :bodyFont="pairing.bodyFont"
      :titleGoogleFont="pairing.titleGoogleFont"
      :bodyGoogleFont="pairing.bodyGoogleFont"
      :active="themeStore.theme?.font_title === pairing.titleFont && themeStore.theme?.font_body === pairing.bodyFont"
      @click="updateTheme({ font_title: pairing.titleFont, font_body: pairing.bodyFont })"
    />
  </div>
</template>
