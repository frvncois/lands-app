<script setup lang="ts">
import { computed } from 'vue'
import { SparklesIcon, EyeDropperIcon, LanguageIcon } from '@heroicons/vue/24/outline'
import BaseTree from '@/shared/ui/BaseTree.vue'
import BaseColorInput from '@/shared/ui/BaseColorInput.vue'
import BaseFont from '@/shared/ui/BaseFont.vue'
import ThemePresetPicker from '@/features/editor/components/panel/design/ThemePresetPicker.vue'
import ColorPalette from '@/features/editor/components/panel/design/ColorPalette.vue'
import TypographyPicker from '@/features/editor/components/panel/design/TypographyPicker.vue'
import type { TreeNode } from '@/shared/ui/BaseTree.vue'
import { useEditorPanel } from '@/features/editor/composables/useEditorPanel'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { useThemeStore } from '@/features/theme/stores/theme'
import { useEditorMutations } from '@/features/editor/composables/useEditorMutations'
import { THEME_PRESET_DEFINITIONS } from '@/features/theme/presets'

const { activeDesignPanel, openDesignPanel } = useEditorPanel()
const { isMobile } = useIsMobile()
const themeStore = useThemeStore()
const { updateTheme } = useEditorMutations()

const designNodes: TreeNode[] = [
  { id: 'theme',      label: 'Theme',          icon: SparklesIcon,    locked: true },
  { id: 'colors',     label: 'Color Palette',  icon: EyeDropperIcon,  locked: true },
  { id: 'typography', label: 'Typography',     icon: LanguageIcon,    locked: true },
]

function handleDesignSettings(node: TreeNode) {
  openDesignPanel(node.id as 'theme' | 'colors' | 'typography')
}

const presets = Object.values(THEME_PRESET_DEFINITIONS)
const activeColorSlots = computed(() => THEME_PRESET_DEFINITIONS[themeStore.theme?.theme_preset ?? 'minimal'].colorSlots)
const activePairings = computed(() => THEME_PRESET_DEFINITIONS[themeStore.theme?.theme_preset ?? 'minimal'].pairings)
</script>

<template>
  <div>
  <!-- Mobile: flat all-in-one view -->
  <div v-if="isMobile" class="flex flex-col gap-5">
    <div>
      <div class="flex items-center gap-2 mb-2">
        <SparklesIcon class="h-3.5 w-3.5 text-gray-400" />
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Theme</p>
      </div>
      <div class="flex flex-col gap-2">
        <button
          v-for="preset in presets"
          :key="preset.label"
          class="flex items-start gap-3 p-3 rounded-xl border transition-colors text-left"
          :class="themeStore.theme?.theme_preset === preset.defaults.theme_preset
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-200 hover:border-gray-300'"
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
    </div>

    <div>
      <div class="flex items-center gap-2 mb-2">
        <EyeDropperIcon class="h-3.5 w-3.5 text-gray-400" />
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Colors</p>
      </div>
      <div class="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
        <BaseColorInput
          v-for="slot in activeColorSlots"
          :key="slot.key"
          :label="slot.label"
          :modelValue="themeStore.theme?.[slot.key] ?? '#000000'"
          @update:modelValue="updateTheme({ [slot.key]: $event })"
        />
      </div>
    </div>

    <div>
      <div class="flex items-center gap-2 mb-2">
        <LanguageIcon class="h-3.5 w-3.5 text-gray-400" />
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Typography</p>
      </div>
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
    </div>
  </div>

  <!-- Desktop: design tree + sub-panels + cards -->
  <template v-else>
    <div v-if="!activeDesignPanel" class="flex flex-col gap-4 flex-1">
      <div class="flex flex-col gap-4">
        <BaseTree
          :nodes="designNodes"
          :group="{ name: 'design', pull: false, put: false }"
          @settings="handleDesignSettings"
        />
      </div>
    </div>

    <div v-else-if="activeDesignPanel === 'theme'" class="flex flex-col gap-2">
      <ThemePresetPicker />
    </div>

    <div v-else-if="activeDesignPanel === 'colors'" class="flex flex-col divide-y divide-gray-100">
      <ColorPalette />
    </div>

    <div v-else-if="activeDesignPanel === 'typography'" class="flex flex-col gap-1.5">
      <TypographyPicker />
    </div>
  </template>
  </div>
</template>
