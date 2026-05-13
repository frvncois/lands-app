<script setup lang="ts">
import { SparklesIcon, EyeDropperIcon, LanguageIcon } from '@heroicons/vue/24/outline'
import BaseTree from '@/components/ui/BaseTree.vue'
import ThemePresetPicker from '@/components/editor/panel/design/ThemePresetPicker.vue'
import ColorPalette from '@/components/editor/panel/design/ColorPalette.vue'
import TypographyPicker from '@/components/editor/panel/design/TypographyPicker.vue'
import PublishSettingsCard from '@/components/editor/panel/PublishSettingsCard.vue'
import UpgradeCard from '@/components/editor/panel/UpgradeCard.vue'
import DangerZoneCard from '@/components/editor/panel/DangerZoneCard.vue'
import type { TreeNode } from '@/components/ui/BaseTree.vue'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { usePlan } from '@/composables/usePlan'

const { activeDesignPanel, openDesignPanel } = useEditorPanel()
const { isPaid } = usePlan()

const designNodes: TreeNode[] = [
  { id: 'theme',      label: 'Theme',          icon: SparklesIcon,    locked: true },
  { id: 'colors',     label: 'Color Palette',  icon: EyeDropperIcon,  locked: true },
  { id: 'typography', label: 'Typography',     icon: LanguageIcon,    locked: true },
]

function handleDesignSettings(node: TreeNode) {
  openDesignPanel(node.id as 'theme' | 'colors' | 'typography')
}
</script>

<template>
  <!-- Design tree + cards -->
  <div v-if="!activeDesignPanel" class="flex flex-col gap-4 flex-1">
    <div class="flex flex-col gap-4">
      <BaseTree
        :nodes="designNodes"
        :group="{ name: 'design', pull: false, put: false }"
        @settings="handleDesignSettings"
      />
    </div>
    <div class="flex flex-col flex-1 gap-2">
      <PublishSettingsCard />
      <UpgradeCard v-if="!isPaid" variant="full" />
      <DangerZoneCard />
    </div>
  </div>

  <!-- Theme sub-panel -->
  <div v-else-if="activeDesignPanel === 'theme'" class="flex flex-col gap-2">
    <ThemePresetPicker />
  </div>

  <!-- Color palette sub-panel -->
  <div v-else-if="activeDesignPanel === 'colors'" class="flex flex-col divide-y divide-gray-100">
    <ColorPalette />
  </div>

  <!-- Typography sub-panel -->
  <div v-else-if="activeDesignPanel === 'typography'" class="flex flex-col gap-1.5">
    <TypographyPicker />
  </div>
</template>
