<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { GradientStyle, GradientStop } from '@/types/designer'
import { generateId } from '@/lib/designer-utils'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SegmentedControl from '../SegmentedControl.vue'
import ColorInput from '../ColorInput.vue'
import ImageInput from '../ImageInput.vue'
import TextInput from '../TextInput.vue'
import SliderInput from '../SliderInput.vue'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps<{
  backgroundType?: 'color' | 'image' | 'video' | 'gradient'
  backgroundColor?: string
  backgroundImage?: string
  backgroundVideo?: string
  backgroundGradient?: GradientStyle
  // Background image effects
  backgroundImageOpacity?: number
  backgroundImageBlur?: number
  backgroundImageSaturation?: number
}>()

const emit = defineEmits<{
  'update:backgroundType': [value: 'color' | 'image' | 'video' | 'gradient']
  'update:backgroundColor': [value: string]
  'update:backgroundImage': [value: string]
  'update:backgroundVideo': [value: string]
  'update:backgroundGradient': [value: GradientStyle]
  'update:backgroundImageOpacity': [value: number]
  'update:backgroundImageBlur': [value: number]
  'update:backgroundImageSaturation': [value: number]
}>()

const backgroundTypeOptions = [
  { value: 'color', label: 'Color', icon: 'style-color' },
  { value: 'gradient', label: 'Gradient', icon: 'style-gradient' },
  { value: 'image', label: 'Image', icon: 'content-image' },
  { value: 'video', label: 'Video', icon: 'content-video' },
]

// Default gradient
const defaultGradient: GradientStyle = {
  type: 'linear',
  angle: 180,
  stops: [
    { color: '#ffffff', position: 0 },
    { color: '#000000', position: 100 },
  ],
}

// Local gradient state for editing
const localGradient = ref<GradientStyle>(props.backgroundGradient || defaultGradient)

// Watch for prop changes
watch(() => props.backgroundGradient, (newVal) => {
  if (newVal) {
    localGradient.value = newVal
  }
}, { deep: true })

// Computed gradient preview CSS
const gradientPreview = computed(() => {
  const grad = localGradient.value
  const sortedStops = [...grad.stops].sort((a, b) => a.position - b.position)
  const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')

  if (grad.type === 'linear') {
    return `linear-gradient(${grad.angle || 180}deg, ${stopsStr})`
  }
  return `radial-gradient(circle, ${stopsStr})`
})

function emitGradientUpdate() {
  emit('update:backgroundGradient', { ...localGradient.value })
}

function updateGradientType(type: 'linear' | 'radial') {
  localGradient.value.type = type
  emitGradientUpdate()
}

function updateGradientAngle(angle: number | string) {
  localGradient.value.angle = typeof angle === 'string' ? parseInt(angle) : angle
  emitGradientUpdate()
}

function updateStopColor(index: number, color: string) {
  const stop = localGradient.value.stops[index]
  if (stop) {
    stop.color = color
    emitGradientUpdate()
  }
}

function updateStopPosition(index: number, position: number | string) {
  const stop = localGradient.value.stops[index]
  if (stop) {
    stop.position = typeof position === 'string' ? parseInt(position) : position
    emitGradientUpdate()
  }
}

function addStop() {
  // Find middle position between existing stops
  const stops = localGradient.value.stops
  const firstStop = stops[0]
  const lastStop = stops[stops.length - 1]
  const midPosition = stops.length > 1 && firstStop && lastStop
    ? Math.round((firstStop.position + lastStop.position) / 2)
    : 50

  localGradient.value.stops.push({
    color: '#808080',
    position: midPosition,
  })
  emitGradientUpdate()
}

function removeStop(index: number) {
  if (localGradient.value.stops.length > 2) {
    localGradient.value.stops.splice(index, 1)
    emitGradientUpdate()
  }
}
</script>

<template>
  <InspectorSection title="Background" icon="content-image">
    <InspectorField label="Type" horizontal>
      <SegmentedControl
        :options="backgroundTypeOptions"
        :model-value="backgroundType || 'color'"
        icon-only
        @update:model-value="emit('update:backgroundType', $event as 'color' | 'image' | 'video' | 'gradient')"
      />
    </InspectorField>

    <!-- Color -->
    <InspectorField
      v-if="backgroundType === 'color' || !backgroundType"
      label="Color"
      horizontal
    >
      <ColorInput
        :model-value="backgroundColor"
        swatch-only
        @update:model-value="emit('update:backgroundColor', $event)"
      />
    </InspectorField>

    <!-- Gradient -->
    <template v-else-if="backgroundType === 'gradient'">
      <!-- Gradient Preview -->
      <div class="px-3 pb-2">
        <div
          class="w-full h-8 rounded-lg border border-border"
          :style="{ background: gradientPreview }"
        />
      </div>

      <InspectorField label="Type" horizontal>
        <SegmentedControl
          :options="[
            { value: 'linear', label: 'Linear' },
            { value: 'radial', label: 'Radial' },
          ]"
          :model-value="localGradient.type"
          @update:model-value="updateGradientType($event as 'linear' | 'radial')"
        />
      </InspectorField>

      <InspectorField v-if="localGradient.type === 'linear'" label="Angle" horizontal>
        <SliderInput
          :model-value="localGradient.angle || 180"
          :min="0"
          :max="360"
          :step="1"
          unit="deg"
          @update:model-value="updateGradientAngle($event)"
        />
      </InspectorField>

      <!-- Gradient Stops -->
      <div class="px-3 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs text-muted-foreground">Color Stops</span>
          <button
            type="button"
            class="p-1 text-muted-foreground hover:text-foreground transition-colors"
            @click="addStop"
          >
            <Icon name="plus" class="text-xs" />
          </button>
        </div>

        <div
          v-for="(stop, index) in localGradient.stops"
          :key="index"
          class="flex items-center gap-2"
        >
          <ColorInput
            :model-value="stop.color"
            swatch-only
            class="shrink-0"
            @update:model-value="updateStopColor(index, $event)"
          />
          <SliderInput
            :model-value="stop.position"
            :min="0"
            :max="100"
            :step="1"
            unit="%"
            class="flex-1"
            @update:model-value="updateStopPosition(index, $event)"
          />
          <button
            v-if="localGradient.stops.length > 2"
            type="button"
            class="p-1 text-muted-foreground hover:text-destructive transition-colors"
            @click="removeStop(index)"
          >
            <Icon name="xmark" class="text-xs" />
          </button>
        </div>
      </div>
    </template>

    <!-- Image -->
    <template v-else-if="backgroundType === 'image'">
      <InspectorField label="Image">
        <ImageInput
          :model-value="backgroundImage || ''"
          placeholder="Upload background image"
          @update:model-value="emit('update:backgroundImage', $event)"
        />
      </InspectorField>

      <InspectorField label="Opacity" horizontal>
        <SliderInput
          :model-value="backgroundImageOpacity ?? 100"
          :min="0"
          :max="100"
          :step="5"
          unit="%"
          @update:model-value="emit('update:backgroundImageOpacity', Number($event))"
        />
      </InspectorField>

      <InspectorField label="Blur" horizontal>
        <SliderInput
          :model-value="backgroundImageBlur ?? 0"
          :min="0"
          :max="20"
          :step="1"
          unit="px"
          @update:model-value="emit('update:backgroundImageBlur', Number($event))"
        />
      </InspectorField>

      <InspectorField label="Saturation" horizontal>
        <SliderInput
          :model-value="backgroundImageSaturation ?? 100"
          :min="0"
          :max="200"
          :step="5"
          unit="%"
          @update:model-value="emit('update:backgroundImageSaturation', Number($event))"
        />
      </InspectorField>
    </template>

    <!-- Video -->
    <InspectorField v-else label="Video URL">
      <TextInput
        :model-value="backgroundVideo || ''"
        placeholder="YouTube, Vimeo, or file URL"
        @update:model-value="emit('update:backgroundVideo', $event)"
      />
    </InspectorField>
  </InspectorSection>
</template>
