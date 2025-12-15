<script setup lang="ts">
import { fontWeightOptions, alignmentOptions } from '@/lib/editor-utils'
import { useFontOptions } from '../composables'
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SelectInput from '../SelectInput.vue'
import SizeInput from '../SizeInput.vue'
import SliderInput from '../SliderInput.vue'
import SegmentedControl from '../SegmentedControl.vue'
import ColorInput from '../ColorInput.vue'
import Icon from '@/components/ui/Icon.vue'
import Tooltip from '@/components/ui/Tooltip.vue'

interface Props {
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  lineHeight?: string
  letterSpacing?: string
  alignment?: string
  color?: string
  fontOptions?: Array<{ value: string; label: string }>
  defaultFontFamily?: string
  defaultFontSize?: string
  defaultFontWeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultFontFamily: 'Inter',
  defaultFontSize: '16px',
  defaultFontWeight: 'normal',
})

const emit = defineEmits<{
  'update:fontFamily': [value: string]
  'update:fontSize': [value: string]
  'update:fontWeight': [value: string]
  'update:fontStyle': [value: string]
  'update:textDecoration': [value: string]
  'update:lineHeight': [value: string]
  'update:letterSpacing': [value: string]
  'update:alignment': [value: string]
  'update:color': [value: string]
}>()

const { fontFamilyOptions: defaultFontOptions } = useFontOptions({ includeInherit: true })

function toggleFontStyle() {
  emit('update:fontStyle', props.fontStyle === 'italic' ? 'normal' : 'italic')
}

function toggleUnderline() {
  emit('update:textDecoration', props.textDecoration === 'underline' ? 'none' : 'underline')
}

function toggleStrikethrough() {
  emit('update:textDecoration', props.textDecoration === 'line-through' ? 'none' : 'line-through')
}
</script>

<template>
  <InspectorSection title="Typography" icon="style-color">
    <!-- Font Family -->
    <InspectorField label="Font Family" horizontal>
      <SelectInput
        :options="fontOptions ?? defaultFontOptions"
        :model-value="fontFamily || defaultFontFamily"
        @update:model-value="emit('update:fontFamily', $event)"
      />
    </InspectorField>

    <!-- Font Weight -->
    <InspectorField label="Font Weight" horizontal>
      <SelectInput
        :options="fontWeightOptions"
        :model-value="fontWeight || defaultFontWeight"
        @update:model-value="emit('update:fontWeight', $event)"
      />
    </InspectorField>

    <!-- Font Size -->
    <InspectorField label="Font Size" horizontal>
      <SizeInput
        :model-value="fontSize"
        :placeholder="defaultFontSize"
        @update:model-value="emit('update:fontSize', $event)"
      />
    </InspectorField>

    <!-- Line Height -->
    <InspectorField label="Line Height" horizontal>
      <SizeInput
        :model-value="lineHeight"
        placeholder="1.5"
        @update:model-value="emit('update:lineHeight', $event)"
      />
    </InspectorField>

    <!-- Letter Spacing -->
    <InspectorField label="Letter Spacing" horizontal>
      <SliderInput
        :model-value="letterSpacing || '0'"
        :min="-2"
        :max="8"
        :step="0.5"
        unit="px"
        @update:model-value="emit('update:letterSpacing', $event)"
      />
    </InspectorField>

    <!-- Alignment -->
    <InspectorField label="Alignment" horizontal>
      <SegmentedControl
        :options="alignmentOptions"
        :model-value="alignment || 'left'"
        icon-only
        @update:model-value="emit('update:alignment', $event)"
      />
    </InspectorField>

    <!-- Style (italic, underline, strikethrough) -->
    <InspectorField label="Style" horizontal>
      <div class="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
        <Tooltip text="Italic">
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded transition-colors"
            :class="fontStyle === 'italic'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'"
            @click="toggleFontStyle"
          >
            <Icon name="italic" class="text-sm" />
          </button>
        </Tooltip>
        <Tooltip text="Underline">
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded transition-colors"
            :class="textDecoration === 'underline'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'"
            @click="toggleUnderline"
          >
            <Icon name="underline" class="text-sm" />
          </button>
        </Tooltip>
        <Tooltip text="Strikethrough">
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded transition-colors"
            :class="textDecoration === 'line-through'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'"
            @click="toggleStrikethrough"
          >
            <Icon name="strikethrough" class="text-sm" />
          </button>
        </Tooltip>
      </div>
    </InspectorField>

    <!-- Color -->
    <InspectorField label="Color" horizontal>
      <ColorInput
        :model-value="color"
        swatch-only
        @update:model-value="emit('update:color', $event)"
      />
    </InspectorField>
  </InspectorSection>
</template>
