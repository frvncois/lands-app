<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import { generateId } from '@/lib/editor-utils'
import type { FormSelectSettings, FormSelectStyles, FormSelectOption } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
import FontSizeSlider from '../FontSizeSlider.vue'
import ColorInput from '../ColorInput.vue'
import ToggleInput from '../ToggleInput.vue'
import Icon from '@/components/ui/Icon.vue'
import { SpacingSection, BorderSection, OpacitySection, PositionSection } from '../sections'

const {
  selectedBlock,
  effectiveBlockStyles,
  responsiveStyles,
  updateBlockSettings,
  updateBlockStyles,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as FormSelectSettings)
const styles = computed(() => effectiveBlockStyles.value as FormSelectStyles)

function updateOption(index: number, label: string) {
  const options = [...(settings.value.options || [])]
  const current = options[index]
  if (!current) return
  options[index] = { id: current.id, label, value: label.toLowerCase().replace(/\s+/g, '_') }
  updateBlockSettings({ options })
}

function removeOption(index: number) {
  const options = (settings.value.options || []).filter((_: FormSelectOption, i: number) => i !== index)
  updateBlockSettings({ options })
}

function addOption() {
  const options = [
    ...(settings.value.options || []),
    { id: generateId(), label: `Option ${(settings.value.options?.length || 0) + 1}`, value: `option_${(settings.value.options?.length || 0) + 1}` }
  ]
  updateBlockSettings({ options })
}
</script>

<template>
  <div v-if="selectedBlock">
    <!-- Dropdown Settings Section -->
    <InspectorSection title="Dropdown Settings" icon="chevron-down">
      <InspectorField label="Label">
        <TextInput
          :model-value="settings.label"
          placeholder="Field label"
          @update:model-value="updateBlockSettings({ label: $event })"
        />
      </InspectorField>
      <InspectorField label="Placeholder">
        <TextInput
          :model-value="settings.placeholder"
          placeholder="Select an option..."
          @update:model-value="updateBlockSettings({ placeholder: $event })"
        />
      </InspectorField>
      <div class="px-3">
        <ToggleInput
          :model-value="settings.required"
          label="Required field"
          @update:model-value="updateBlockSettings({ required: $event })"
        />
      </div>
    </InspectorSection>

    <!-- Options Section -->
    <InspectorSection title="Options" icon="list-link">
      <div class="space-y-2">
        <div
          v-for="(option, index) in settings.options || []"
          :key="option.id"
          class="flex items-center gap-2"
        >
          <TextInput
            :model-value="option.label"
            placeholder="Option label"
            class="flex-1"
            @update:model-value="updateOption(index, $event)"
          />
          <button
            class="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            @click="removeOption(index)"
          >
            <Icon name="xmark" class="text-sm" />
          </button>
        </div>
        <button
          class="w-full flex items-center justify-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-sidebar-border rounded-md hover:border-primary/50 transition-colors"
          @click="addOption"
        >
          <Icon name="plus" class="text-xs" />
          Add option
        </button>
      </div>
    </InspectorSection>

    <!-- Style Section -->
    <InspectorSection title="Style" icon="style-color">
      <InspectorField label="Font Size" horizontal>
        <FontSizeSlider
          :model-value="styles.fontSize || 'base'"
          @update:model-value="updateBlockStyles({ fontSize: $event })"
        />
      </InspectorField>
      <InspectorField label="Text Color" horizontal>
        <ColorInput
          :model-value="styles.color"
          swatch-only
          @update:model-value="updateBlockStyles({ color: $event })"
        />
      </InspectorField>
      <InspectorField label="Label Color" horizontal>
        <ColorInput
          :model-value="styles.labelColor"
          swatch-only
          @update:model-value="updateBlockStyles({ labelColor: $event })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Spacing Section -->
    <SpacingSection
      :margin="responsiveStyles.margin"
      :padding="responsiveStyles.padding"
      @update:margin="updateBlockStyles({ margin: $event })"
      @update:padding="updateBlockStyles({ padding: $event })"
    />

    <!-- Border Section -->
    <BorderSection
      :model-value="responsiveStyles.border"
      @update:model-value="updateBlockStyles({ border: $event })"
    />

    <!-- Opacity Section -->
    <OpacitySection
      :opacity="responsiveStyles.opacity"
      :mix-blend-mode="responsiveStyles.mixBlendMode"
      @update:opacity="updateBlockStyles({ opacity: $event })"
      @update:mix-blend-mode="updateBlockStyles({ mixBlendMode: $event })"
    />

    <!-- Position Section -->
    <PositionSection
      :position="responsiveStyles.position"
      :z-index="responsiveStyles.zIndex"
      :top="responsiveStyles.top"
      :right="responsiveStyles.right"
      :bottom="responsiveStyles.bottom"
      :left="responsiveStyles.left"
      @update:position="updateBlockStyles({ position: $event })"
      @update:z-index="updateBlockStyles({ zIndex: $event })"
      @update:top="updateBlockStyles({ top: $event })"
      @update:right="updateBlockStyles({ right: $event })"
      @update:bottom="updateBlockStyles({ bottom: $event })"
      @update:left="updateBlockStyles({ left: $event })"
    />
  </div>
</template>
