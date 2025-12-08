<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  showValue?: boolean
  unit?: string
  displayLabel?: string // Custom label to show instead of value+unit
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  showValue: true,
  unit: '',
  displayLabel: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const isDragging = ref(false)
const isHovering = ref(false)
const sliderRef = ref<HTMLDivElement>()

const percentage = computed(() => {
  const range = props.max - props.min
  if (range === 0) return 0
  return ((props.modelValue - props.min) / range) * 100
})

const displayValue = computed(() => {
  if (props.displayLabel) return props.displayLabel
  return `${props.modelValue}${props.unit}`
})

const showTooltip = computed(() => isDragging.value || isHovering.value)

function updateValue(event: MouseEvent | TouchEvent) {
  if (props.disabled || !sliderRef.value) return

  const rect = sliderRef.value.getBoundingClientRect()
  const clientX = 'touches' in event ? event.touches[0]?.clientX ?? 0 : event.clientX
  const x = clientX - rect.left
  const percentage = Math.max(0, Math.min(1, x / rect.width))
  const range = props.max - props.min
  const rawValue = props.min + percentage * range
  const steppedValue = Math.round(rawValue / props.step) * props.step
  const clampedValue = Math.max(props.min, Math.min(props.max, steppedValue))

  emit('update:modelValue', clampedValue)
}

function handleMouseDown(event: MouseEvent) {
  if (props.disabled) return
  isDragging.value = true
  updateValue(event)

  const handleMouseMove = (e: MouseEvent) => updateValue(e)
  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleTouchStart(event: TouchEvent) {
  if (props.disabled) return
  isDragging.value = true
  updateValue(event)

  const handleTouchMove = (e: TouchEvent) => updateValue(e)
  const handleTouchEnd = () => {
    isDragging.value = false
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }

  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
}

function handleKeyDown(event: KeyboardEvent) {
  if (props.disabled) return

  let newValue = props.modelValue

  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      newValue = Math.max(props.min, props.modelValue - props.step)
      break
    case 'ArrowRight':
    case 'ArrowUp':
      newValue = Math.min(props.max, props.modelValue + props.step)
      break
    case 'Home':
      newValue = props.min
      break
    case 'End':
      newValue = props.max
      break
    default:
      return
  }

  event.preventDefault()
  emit('update:modelValue', newValue)
}
</script>

<template>
  <div class="flex items-center min-w-30">
    <!-- Slider track -->
    <div
      ref="sliderRef"
      class="relative flex-1 h-5 flex items-center cursor-pointer group"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
      role="slider"
      tabindex="0"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue"
      :aria-disabled="disabled"
      @mousedown="handleMouseDown"
      @touchstart.prevent="handleTouchStart"
      @keydown="handleKeyDown"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <!-- Track background -->
      <div class="absolute inset-x-0 h-1.5 rounded-full bg-secondary" />

      <!-- Track fill -->
      <div
        class="absolute left-0 h-1.5 rounded-full bg-primary transition-[width]"
        :class="isDragging ? '' : 'duration-100'"
        :style="{ width: `${percentage}%` }"
      />

      <!-- Thumb with tooltip -->
      <div
        class="absolute w-4 h-4 rounded-full bg-background border-2 border-primary shadow-sm transition-transform"
        :class="[
          isDragging ? 'scale-110' : 'group-hover:scale-105',
          isDragging ? '' : 'duration-100'
        ]"
        :style="{ left: `calc(${percentage}% - 8px)` }"
      >
        <!-- Tooltip -->
        <div
          v-if="showTooltip"
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-1.5 py-0.5 text-[10px] font-mono text-primary-foreground bg-primary rounded shadow-sm whitespace-nowrap pointer-events-none"
        >
          {{ displayValue }}
          <!-- Tooltip arrow -->
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
        </div>
      </div>
    </div>
  </div>
</template>
