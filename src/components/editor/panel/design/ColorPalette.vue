<script setup lang="ts">
import { computed } from 'vue'
import { THEME_PRESET_DEFINITIONS } from '@/lib/primitives/themePresets'
import { useThemeStore } from '@/stores/theme'
import { useEditorMutations } from '@/composables/useEditorMutations'
import BaseColorInput from '@/components/ui/BaseColorInput.vue'

const themeStore = useThemeStore()
const { updateTheme } = useEditorMutations()

const activeColorSlots = computed(() => {
  const preset = themeStore.theme?.theme_preset
  if (!preset) return THEME_PRESET_DEFINITIONS.minimal.colorSlots
  return THEME_PRESET_DEFINITIONS[preset].colorSlots
})
</script>

<template>
  <div class="flex flex-col divide-y divide-gray-100">
    <BaseColorInput
      v-for="slot in activeColorSlots"
      :key="slot.key"
      :label="slot.label"
      :modelValue="themeStore.theme?.[slot.key] ?? '#000000'"
      @update:modelValue="updateTheme({ [slot.key]: $event })"
    />
  </div>
</template>
