<script setup lang="ts">
import { THEME_PRESET_DEFINITIONS } from '@/lib/primitives/themePresets'
import { useThemeStore } from '@/stores/theme'
import { useEditorMutations } from '@/composables/useEditorMutations'

const themeStore = useThemeStore()
const { updateTheme } = useEditorMutations()
const presets = Object.values(THEME_PRESET_DEFINITIONS)
</script>

<template>
  <div class="flex flex-col gap-2">
    <button
      v-for="preset in presets"
      :key="preset.label"
      class="flex items-start gap-3 p-3 rounded-xl border transition-colors text-left"
      :class="themeStore.theme?.theme_preset === preset.defaults.theme_preset
        ? 'border-gray-900 bg-gray-50'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
      @click="updateTheme(preset.defaults)"
    >
      <div class="flex gap-1 pt-0.5 shrink-0">
        <span class="h-3 w-3 rounded-full border border-black/10" :style="{ background: preset.defaults.color_main }" />
        <span class="h-3 w-3 rounded-full border border-black/10" :style="{ background: preset.defaults.color_accent }" />
        <span class="h-3 w-3 rounded-full border border-black/10" :style="{ background: preset.defaults.color_surface }" />
      </div>
      <div>
        <p class="text-sm font-medium text-gray-900">{{ preset.label }}</p>
        <p class="text-xs text-gray-400">{{ preset.description }}</p>
      </div>
    </button>
  </div>
</template>
