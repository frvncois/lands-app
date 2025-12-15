<script setup lang="ts">
import { computed } from 'vue'
import { useBlockInspector } from '../composables'
import { generateId } from '@/lib/editor-utils'
import type { FormCheckboxSettings, FormCheckboxStyles, FormSelectOption } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import TextInput from '../TextInput.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SizeInput from '../SizeInput.vue'
import ColorInput from '../ColorInput.vue'
import ToggleInput from '../ToggleInput.vue'
import Icon from '@/components/ui/Icon.vue'
import { DisplaySection, StylesSection } from '../sections'

const {
  selectedBlock,
  effectiveBlockStyles,
  responsiveStyles,
  updateBlockSettings,
  updateBlockStyles,
} = useBlockInspector()

const settings = computed(() => selectedBlock.value?.settings as FormCheckboxSettings)
const styles = computed(() => effectiveBlockStyles.value as FormCheckboxStyles)

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
    <!-- Checkbox Settings Section -->
    <InspectorSection title="Checkbox Settings" icon="content-form">
      <InspectorField label="Label">
        <TextInput
          :model-value="settings.label"
          placeholder="Field label"
          @update:model-value="updateBlockSettings({ label: $event })"
        />
      </InspectorField>
      <InspectorField label="Layout">
        <SegmentedControl
          :model-value="settings.layout || 'vertical'"
          :options="[{ value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' }]"
          @update:model-value="updateBlockSettings({ layout: $event })"
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

    <!-- Display Section -->
    <DisplaySection
      :width="responsiveStyles.width"
      :height="responsiveStyles.height"
      hide-layout
      @update:width="updateBlockStyles({ width: $event })"
      @update:height="updateBlockStyles({ height: $event })"
    />

    <!-- Style Section -->
    <InspectorSection title="Style" icon="style-color">
      <InspectorField label="Font Size" horizontal>
        <SizeInput
          :model-value="styles.fontSize"
          placeholder="16px"
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

    <!-- Styles Section -->
    <StylesSection
      :margin="responsiveStyles.margin"
      :padding="responsiveStyles.padding"
      :border="responsiveStyles.border"
      :overflow="responsiveStyles.overflow"
      :opacity="responsiveStyles.opacity"
      :translate-x="responsiveStyles.translateX"
      :translate-y="responsiveStyles.translateY"
      :rotate="responsiveStyles.rotate"
      :z-index="responsiveStyles.zIndex"
      :position="responsiveStyles.position"
      @update:margin="updateBlockStyles({ margin: $event })"
      @update:padding="updateBlockStyles({ padding: $event })"
      @update:border="updateBlockStyles({ border: $event })"
      @update:overflow="updateBlockStyles({ overflow: $event })"
      @update:opacity="updateBlockStyles({ opacity: $event })"
      @update:translate-x="updateBlockStyles({ translateX: $event })"
      @update:translate-y="updateBlockStyles({ translateY: $event })"
      @update:rotate="updateBlockStyles({ rotate: $event })"
      @update:z-index="updateBlockStyles({ zIndex: $event })"
      @update:position="updateBlockStyles({ position: $event })"
    />
  </div>
</template>
