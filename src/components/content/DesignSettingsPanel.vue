<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import {
  designCategories,
  getSettingsByCategory,
  type DesignSettingField,
} from '@/lib/design-settings-config'
import type { PageSettings } from '@/types/designer'
import InspectorSection from '@/components/inspector/InspectorSection.vue'
import InspectorField from '@/components/inspector/InspectorField.vue'
import ColorInput from '@/components/inspector/ColorInput.vue'
import SelectInput from '@/components/inspector/SelectInput.vue'
import { Icon } from '@/components/ui'

const designerStore = useDesignerStore()
const pageSettings = computed(() => designerStore.pageSettings)

// Font options (same as PageInspector)
const fontFamilyOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'system-ui', label: 'System' },
]

const combinedFontOptions = computed(() => {
  const customFonts = pageSettings.value.customFonts || []
  const googleFonts = pageSettings.value.googleFonts || []

  const customOptions = customFonts.map((font) => ({
    value: font.name,
    label: `${font.name} (Custom)`,
  }))

  const googleOptions = googleFonts.map((font) => ({
    value: font.family,
    label: font.family,
  }))

  return [...fontFamilyOptions, ...googleOptions, ...customOptions]
})

function updatePageSetting<K extends keyof PageSettings>(
  key: K,
  value: PageSettings[K]
) {
  designerStore.updatePageSettings({ [key]: value })
}

function getSettingValue(field: DesignSettingField): string {
  return (
    (pageSettings.value[field.key] as string) || field.defaultValue || ''
  )
}

function updateHeadingFont(fontFamily: string) {
  // Update page setting
  updatePageSetting('headingFontFamily', fontFamily)

  // Apply to all heading blocks
  designerStore.blocks.forEach(function applyToBlock(block) {
    if (block.type === 'heading') {
      designerStore.updateBlockStyles(block.id, { fontFamily })
    }
    if (block.children) {
      block.children.forEach(applyToBlock)
    }
  })
}

function updateTextFont(fontFamily: string) {
  // Update page setting
  updatePageSetting('fontFamily', fontFamily)

  // Apply to all text blocks
  designerStore.blocks.forEach(function applyToBlock(block) {
    if (block.type === 'text') {
      designerStore.updateBlockStyles(block.id, { fontFamily })
    }
    if (block.children) {
      block.children.forEach(applyToBlock)
    }
  })
}

// Collapsed state per category
const collapsedCategories = ref<Set<string>>(new Set())

function toggleCategory(categoryId: string) {
  if (collapsedCategories.value.has(categoryId)) {
    collapsedCategories.value.delete(categoryId)
  } else {
    collapsedCategories.value.add(categoryId)
  }
}
</script>

<template>
  <div class="space-y-4">
    <template v-for="category in designCategories" :key="category.id">
      <InspectorSection
        :title="category.label"
        :icon="category.icon"
        :collapsed="collapsedCategories.has(category.id)"
        @toggle="toggleCategory(category.id)"
      >
        <div class="space-y-3">
          <template
            v-for="field in getSettingsByCategory(category.id)"
            :key="field.key"
          >
            <!-- Color fields -->
            <InspectorField
              v-if="field.type === 'color'"
              :label="field.label"
              horizontal
            >
              <ColorInput
                :model-value="getSettingValue(field)"
                swatch-only
                @update:model-value="updatePageSetting(field.key, $event)"
              />
            </InspectorField>

            <!-- Font family fields -->
            <InspectorField
              v-else-if="field.type === 'font-family'"
              :label="field.label"
              horizontal
            >
              <SelectInput
                :model-value="getSettingValue(field)"
                :options="combinedFontOptions"
                size="sm"
                @update:model-value="
                  field.key === 'headingFontFamily'
                    ? updateHeadingFont($event)
                    : updateTextFont($event)
                "
              />
            </InspectorField>
          </template>
        </div>
      </InspectorSection>
    </template>

    <!-- Info note -->
    <div class="px-3 py-2 bg-secondary/50 rounded-md">
      <p class="text-[10px] text-muted-foreground">
        Changes here update the page settings and are applied to all blocks using
        these values.
      </p>
    </div>
  </div>
</template>
