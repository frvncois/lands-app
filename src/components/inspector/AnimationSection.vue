<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AnimationSettings, AnimationPreset, AnimationTrigger, AnimationEasing } from '@/types/editor'
import {
  animationPresets,
  animationTriggerOptions,
  animationEasingOptions,
  getDefaultAnimationSettings,
} from '@/lib/animation-utils'
import InspectorField from './InspectorField.vue'
import SelectInput from './SelectInput.vue'
import SliderInput from './SliderInput.vue'
import Toggle from '@/components/ui/Toggle.vue'

interface Props {
  modelValue?: AnimationSettings
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: AnimationSettings]
  'preview': []
}>()

// Local state for preview
const isPreviewPlaying = ref(false)

// Get current settings or defaults
const settings = computed((): AnimationSettings => {
  return props.modelValue ?? getDefaultAnimationSettings()
})

// Update helper
function updateSettings(updates: Partial<AnimationSettings>) {
  emit('update:modelValue', { ...settings.value, ...updates })
}

// Toggle animation on/off
function toggleEnabled(enabled: boolean) {
  if (enabled) {
    // Enable with defaults if not previously configured
    const newSettings = props.modelValue ?? getDefaultAnimationSettings()
    emit('update:modelValue', {
      ...newSettings,
      enabled: true,
      trigger: newSettings.trigger === 'none' ? 'page-load' : newSettings.trigger,
    })
  } else {
    updateSettings({ enabled: false })
  }
}

// Handle trigger change
function handleTriggerChange(trigger: string) {
  updateSettings({ trigger: trigger as AnimationTrigger })
}

// Handle preset change
function handlePresetChange(preset: string) {
  updateSettings({ preset: preset as AnimationPreset })
}

// Handle easing change
function handleEasingChange(easing: string) {
  updateSettings({ easing: easing as AnimationEasing })
}

// Handle duration change
function handleDurationChange(value: string) {
  updateSettings({ duration: parseInt(value, 10) })
}

// Handle delay change
function handleDelayChange(value: string) {
  updateSettings({ delay: parseInt(value, 10) })
}

// Handle scroll offset change
function handleScrollOffsetChange(value: string) {
  updateSettings({ scrollOffset: parseInt(value, 10) })
}

// Preview animation
function playPreview() {
  isPreviewPlaying.value = true
  emit('preview')
  // Reset after animation completes
  setTimeout(() => {
    isPreviewPlaying.value = false
  }, settings.value.duration + settings.value.delay + 100)
}

// Preset options with categories
const presetOptions = computed(() => {
  return animationPresets
    .filter(p => p.id !== 'none')
    .map(p => ({
      value: p.id,
      label: p.label,
    }))
})
</script>

<template>
  <div class="border-b border-border">
    <!-- Header with toggle -->
    <div class="flex items-center justify-between px-4 py-3">
      <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
        <Icon name="reload" class="text-sm text-muted-foreground" />
        Animation
      </span>
      <Toggle
        :model-value="settings.enabled"
        size="sm"
        @update:model-value="toggleEnabled"
      />
    </div>

    <!-- Animation settings (shown when enabled) -->
    <div v-if="settings.enabled" class="px-4 pb-4 space-y-4">
      <!-- Trigger Selection -->
      <InspectorField label="Play On" horizontal>
        <SelectInput
          :model-value="settings.trigger"
          :options="animationTriggerOptions.filter(t => t.value !== 'none')"
          @update:model-value="handleTriggerChange"
        />
      </InspectorField>

      <!-- Preset Selection -->
      <div class="space-y-2">
        <label class="text-xs font-medium text-foreground">Animation</label>
        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="preset in animationPresets.filter(p => p.id !== 'none')"
            :key="preset.id"
            class="flex flex-col items-center gap-1 p-2 rounded-md border transition-colors text-center"
            :class="settings.preset === preset.id
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:border-primary/50 hover:bg-accent/50 text-muted-foreground'"
            @click="handlePresetChange(preset.id)"
          >
            <Icon :name="preset.icon" :size="14" />
            <span class="text-[10px] leading-tight">{{ preset.label }}</span>
          </button>
        </div>
      </div>

      <!-- Timing Section -->
      <div class="space-y-3 pt-2 border-t border-border">
        <InspectorField label="Duration" horizontal>
          <SliderInput
            :model-value="String(settings.duration)"
            :min="100"
            :max="2000"
            :step="50"
            unit="ms"
            @update:model-value="handleDurationChange"
          />
        </InspectorField>

        <InspectorField label="Delay" horizontal>
          <SliderInput
            :model-value="String(settings.delay)"
            :min="0"
            :max="2000"
            :step="50"
            unit="ms"
            @update:model-value="handleDelayChange"
          />
        </InspectorField>

        <InspectorField label="Easing" horizontal>
          <SelectInput
            :model-value="settings.easing"
            :options="animationEasingOptions"
            @update:model-value="handleEasingChange"
          />
        </InspectorField>
      </div>

      <!-- Playback Options -->
      <div class="space-y-3 pt-2 border-t border-border">
        <!-- Hover-specific options -->
        <Toggle
          v-if="settings.trigger === 'hover'"
          :model-value="settings.reverseOnHoverOut ?? true"
          label="Reverse on hover out"
          size="sm"
          @update:model-value="updateSettings({ reverseOnHoverOut: $event })"
        />

        <!-- Scroll-specific options -->
        <template v-if="settings.trigger === 'in-view'">
          <InspectorField label="Start Offset" horizontal>
            <SliderInput
              :model-value="String(settings.scrollOffset ?? 20)"
              :min="0"
              :max="100"
              :step="5"
              unit="%"
              @update:model-value="handleScrollOffsetChange"
            />
          </InspectorField>

          <Toggle
            :model-value="settings.repeatOnScroll ?? false"
            label="Repeat when re-entering"
            size="sm"
            @update:model-value="updateSettings({ repeatOnScroll: $event })"
          />
        </template>
      </div>

      <!-- Preview Button -->
      <button
        class="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors"
        :class="isPreviewPlaying
          ? 'bg-primary/20 text-primary cursor-not-allowed'
          : 'bg-secondary hover:bg-secondary/80 text-foreground'"
        :disabled="isPreviewPlaying"
        @click="playPreview"
      >
        <Icon name="play" class="text-xs" />
        {{ isPreviewPlaying ? 'Playing...' : 'Preview Animation' }}
      </button>
    </div>
  </div>
</template>
