<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import { alignmentOptions, fontWeightOptions } from '@/lib/designer-utils'
import type { SpanStyles, BorderStyle } from '@/types/designer'

import InspectorSection from './InspectorSection.vue'
import InspectorField from './InspectorField.vue'
import TextInput from './TextInput.vue'
import SegmentedControl from './SegmentedControl.vue'
import SelectInput from './SelectInput.vue'
import SizeInput from './SizeInput.vue'
import SliderInput from './SliderInput.vue'
import ColorInput from './ColorInput.vue'
import Icon from '@/components/ui/Icon.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
import { SpacingSection, BorderSection, OpacitySection } from './sections'
import SharedStyleField from './SharedStyleField.vue'
import { useFontOptions } from './composables'

const props = defineProps<{
  blockId: string
  spanId: string
}>()

const emit = defineEmits<{
  close: []
}>()

const designerStore = useDesignerStore()
const { fontFamilyOptions } = useFontOptions({ includeInherit: true })

// Get the parent block
const parentBlock = computed(() => {
  return designerStore.findBlockById(props.blockId)
})

// Get the span data
const span = computed(() => {
  return designerStore.getSpanById(props.blockId, props.spanId)
})

const spanStyles = computed(() => {
  return (span.value?.styles || {}) as SpanStyles
})

// Update span name
function updateName(name: string) {
  designerStore.updateSpanName(props.blockId, props.spanId, name)
}

// Update span styles
function updateStyles(styles: Partial<SpanStyles>) {
  designerStore.updateSpanStyles(props.blockId, props.spanId, styles)
}

// Style toggle functions
function toggleFontStyle() {
  updateStyles({ fontStyle: spanStyles.value.fontStyle === 'italic' ? 'normal' : 'italic' })
}

function toggleUnderline() {
  updateStyles({ textDecoration: spanStyles.value.textDecoration === 'underline' ? 'none' : 'underline' })
}

function toggleStrikethrough() {
  updateStyles({ textDecoration: spanStyles.value.textDecoration === 'line-through' ? 'none' : 'line-through' })
}

// Delete span
function deleteSpan() {
  // Find the span element in the DOM and unwrap it
  const spanElement = document.querySelector(`[data-span-id="${props.spanId}"]`)
  if (spanElement) {
    const parent = spanElement.parentNode
    if (parent) {
      // Replace span with its text content
      const textNode = document.createTextNode(spanElement.textContent || '')
      parent.replaceChild(textNode, spanElement)
    }
  }

  // Delete from store
  designerStore.deleteSpan(props.blockId, props.spanId)
  emit('close')
}

// Close inspector
function handleClose() {
  designerStore.selectSpan(null)
  emit('close')
}
</script>

<template>
  <div v-if="span">
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 py-3 border-b border-sidebar-border">
      <div class="flex items-center gap-2 flex-1">
        <Icon name="style-code" :size="14" class="text-violet-500" />
        <span class="text-sm font-medium">Span</span>
      </div>
      <button
        type="button"
        class="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
        title="Delete span"
        @click="deleteSpan"
      >
        <Icon name="trash-3" :size="14" />
      </button>
    </div>

    <!-- Content Section -->
    <InspectorSection title="Content" icon="content-text">
      <SharedStyleField
        v-if="parentBlock"
        :block-id="blockId"
        :block-type="parentBlock.type"
      />
      <InspectorField label="Name">
        <TextInput
          :model-value="span.name"
          placeholder="Span name"
          @update:model-value="updateName"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Style Section -->
    <InspectorSection title="Style" icon="style-color">
      <InspectorField label="Font Family" horizontal>
        <SelectInput
          :options="fontFamilyOptions"
          :model-value="spanStyles.fontFamily || ''"
          @update:model-value="updateStyles({ fontFamily: $event })"
        />
      </InspectorField>
      <InspectorField label="Font Size" horizontal>
        <SizeInput
          :model-value="spanStyles.fontSize || ''"
          placeholder="inherit"
          @update:model-value="updateStyles({ fontSize: $event as SpanStyles['fontSize'] })"
        />
      </InspectorField>
      <InspectorField label="Font Weight" horizontal>
        <SelectInput
          :options="[{ value: '', label: 'Inherit' }, ...fontWeightOptions]"
          :model-value="spanStyles.fontWeight || ''"
          @update:model-value="updateStyles({ fontWeight: ($event || undefined) as SpanStyles['fontWeight'] })"
        />
      </InspectorField>
      <InspectorField label="Style" horizontal>
        <div class="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
          <Tooltip text="Italic">
            <button
              type="button"
              class="flex items-center justify-center w-7 h-7 rounded transition-colors"
              :class="spanStyles.fontStyle === 'italic'
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
              :class="spanStyles.textDecoration === 'underline'
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
              :class="spanStyles.textDecoration === 'line-through'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'"
              @click="toggleStrikethrough"
            >
              <Icon name="strikethrough" class="text-sm" />
            </button>
          </Tooltip>
        </div>
      </InspectorField>
      <InspectorField label="Text Color" horizontal>
        <ColorInput
          :model-value="spanStyles.color || ''"
          swatch-only
          @update:model-value="updateStyles({ color: $event })"
        />
      </InspectorField>
      <InspectorField label="Letter Spacing" horizontal>
        <SliderInput
          :model-value="spanStyles.letterSpacing || '0'"
          :min="-2"
          :max="8"
          :step="0.5"
          unit="px"
          @update:model-value="updateStyles({ letterSpacing: $event })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Background Section -->
    <InspectorSection title="Background" icon="style-color">
      <InspectorField label="Color" horizontal>
        <ColorInput
          :model-value="spanStyles.backgroundColor || ''"
          swatch-only
          @update:model-value="updateStyles({ backgroundColor: $event })"
        />
      </InspectorField>
      <InspectorField label="Padding" horizontal>
        <SliderInput
          :model-value="spanStyles.padding || '0'"
          :min="0"
          :max="24"
          :step="2"
          unit="px"
          @update:model-value="updateStyles({ padding: `${$event}px` })"
        />
      </InspectorField>
      <InspectorField label="Radius" horizontal>
        <SliderInput
          :model-value="spanStyles.borderRadius || '0'"
          :min="0"
          :max="24"
          :step="2"
          unit="px"
          @update:model-value="updateStyles({ borderRadius: $event })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Border Section -->
    <BorderSection
      :model-value="spanStyles.border || {}"
      @update:model-value="updateStyles({ border: $event as BorderStyle })"
    />

    <!-- Opacity Section -->
    <OpacitySection
      :opacity="spanStyles.opacity || '100'"
      :mix-blend-mode="spanStyles.mixBlendMode || 'normal'"
      @update:opacity="updateStyles({ opacity: $event })"
      @update:mix-blend-mode="updateStyles({ mixBlendMode: $event })"
    />
  </div>
</template>
