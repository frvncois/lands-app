<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editor'

const props = defineProps<{
  modelValue: string | undefined
  placeholder?: string
  swatchOnly?: boolean
  inline?: boolean // Show picker UI directly without popover
  side?: 'left' | 'right' | null // Opens to the side instead of above/below
  belowParent?: boolean // Position below parent popover with matching width
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditorStore()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const gradientRef = ref<HTMLElement | null>(null)
const hueRef = ref<HTMLElement | null>(null)
const localValue = ref(props.modelValue ?? '')
const popoverPosition = ref({ top: 0, left: 0, placement: 'bottom' as 'top' | 'bottom', width: 256 })

// HSV state for gradient picker
const hue = ref(0)
const saturation = ref(100)
const brightness = ref(100)
const isDraggingGradient = ref(false)
const isDraggingHue = ref(false)

// Preset color palette
const presetColors = [
  // Grays
  '#000000', '#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8', '#f4f4f5', '#ffffff',
  // Colors
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  // Lighter variants
  '#fca5a5', '#fdba74', '#fde047', '#86efac', '#5eead4', '#93c5fd', '#c4b5fd', '#f9a8d4',
]

// Recent colors
const MAX_RECENT_COLORS = 8
const recentColors = ref<string[]>([])

// HSV to HEX conversion
function hsvToHex(h: number, s: number, v: number): string {
  s = s / 100
  v = v / 100

  const c = v * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = v - c

  let r = 0, g = 0, b = 0

  if (h >= 0 && h < 60) { r = c; g = x; b = 0 }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0 }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// HEX to HSV conversion
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  // Default to red if invalid
  if (!hex || !hex.startsWith('#') || hex.length < 7) {
    return { h: 0, s: 100, v: 100 }
  }

  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  let h = 0
  const s = max === 0 ? 0 : (d / max) * 100
  const v = max * 100

  if (d !== 0) {
    switch (max) {
      case r: h = 60 * (((g - b) / d) % 6); break
      case g: h = 60 * ((b - r) / d + 2); break
      case b: h = 60 * ((r - g) / d + 4); break
    }
  }

  if (h < 0) h += 360

  return { h, s, v }
}

// Update HSV from current hex value
function syncHsvFromHex() {
  if (localValue.value && localValue.value.startsWith('#')) {
    const hsv = hexToHsv(localValue.value)
    hue.value = hsv.h
    saturation.value = hsv.s
    brightness.value = hsv.v
  }
}

// Computed color based on current hue (for gradient background)
const hueColor = computed(() => hsvToHex(hue.value, 100, 100))

// Current color from HSV
const currentColorFromHsv = computed(() => hsvToHex(hue.value, saturation.value, brightness.value))

// Handle ESC key to close popover
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  loadRecentColors()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  // Sync HSV on mount for inline mode
  if (props.inline) {
    syncHsvFromHex()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

function loadRecentColors() {
  const projectId = editor.projectId
  if (!projectId) return

  const stored = localStorage.getItem(`recentColors_${projectId}`)
  if (stored) {
    try {
      recentColors.value = JSON.parse(stored)
    } catch {
      recentColors.value = []
    }
  }
}

function saveRecentColor(color: string) {
  const projectId = editor.projectId
  if (!projectId || !color) return

  const normalizedColor = color.toUpperCase()
  const filtered = recentColors.value.filter(c => c.toUpperCase() !== normalizedColor)
  recentColors.value = [normalizedColor, ...filtered].slice(0, MAX_RECENT_COLORS)
  localStorage.setItem(`recentColors_${projectId}`, JSON.stringify(recentColors.value))
}

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal ?? ''
  if (isOpen.value || props.inline) {
    syncHsvFromHex()
  }
})

const displayColor = computed(() => localValue.value || '#000000')
const hasValue = computed(() => !!localValue.value && localValue.value !== '')

function handleClickOutside(event: MouseEvent) {
  if (!isOpen.value) return

  const target = event.target as Node
  if (triggerRef.value?.contains(target) || popoverRef.value?.contains(target)) {
    return
  }

  // Save to recent when closing popover
  if (localValue.value) {
    saveRecentColor(localValue.value)
  }
  isOpen.value = false
}

function calculatePosition() {
  if (!triggerRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popoverHeight = 380
  let popoverWidth = 256
  const gap = 8
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  // Below parent popover positioning - position below parent with matching width
  if (props.belowParent) {
    // Find the parent popover element
    const parentPopover = triggerRef.value?.closest('.bg-popover') as HTMLElement | null
    const parentRect = parentPopover?.getBoundingClientRect()

    if (parentRect) {
      // Match parent width
      popoverWidth = parentRect.width

      let left = parentRect.left
      let top = parentRect.bottom + gap

      // Ensure it doesn't go off screen horizontally
      if (left + popoverWidth > viewportWidth - 8) {
        left = viewportWidth - popoverWidth - 8
      }
      if (left < 8) left = 8

      // Ensure it doesn't go off screen vertically
      if (top + popoverHeight > viewportHeight - 8) {
        // If no space below, position above parent
        top = parentRect.top - popoverHeight - gap
        if (top < 8) {
          // If still no space, position at top of viewport
          top = 8
        }
      }

      popoverPosition.value = { top, left, placement: 'bottom', width: popoverWidth }
      return
    }
  }

  // Side positioning (left/right of trigger) - align to parent popover
  if (props.side) {
    // Find the parent popover element
    const parentPopover = triggerRef.value?.closest('.bg-popover') as HTMLElement | null
    const parentRect = parentPopover?.getBoundingClientRect()

    let left: number
    let top: number

    if (props.side === 'left' && parentRect) {
      // Position to the left of parent popover
      left = parentRect.left - popoverWidth - gap
      top = parentRect.top
    } else if (parentRect) {
      // Position to the right of parent popover
      left = parentRect.right + gap
      top = parentRect.top
    } else {
      // Fallback to trigger-based positioning
      left = triggerRect.left - popoverWidth - gap
      top = triggerRect.top
    }

    // Ensure it doesn't go off screen
    if (left < 8) left = 8
    if (top + popoverHeight > viewportHeight - 8) {
      top = viewportHeight - popoverHeight - 8
    }
    if (top < 8) top = 8

    popoverPosition.value = { top, left, placement: 'bottom', width: popoverWidth }
    return
  }

  // Default top/bottom positioning
  const spaceBelow = viewportHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top

  let top: number
  let placement: 'top' | 'bottom'

  if (spaceBelow >= popoverHeight + gap || spaceBelow >= spaceAbove) {
    top = triggerRect.bottom + gap
    placement = 'bottom'
  } else {
    top = triggerRect.top - popoverHeight - gap
    placement = 'top'
  }

  let left = triggerRect.left
  if (left + popoverWidth > viewportWidth - 8) {
    left = viewportWidth - popoverWidth - 8
  }
  if (left < 8) {
    left = 8
  }

  popoverPosition.value = { top, left, placement, width: popoverWidth }
}

function togglePopover() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    syncHsvFromHex()
    nextTick(() => {
      calculatePosition()
    })
  }
}

function selectColor(color: string) {
  localValue.value = color
  emit('update:modelValue', color)
  saveRecentColor(color)
  syncHsvFromHex()
  // Don't close - let user continue selecting until they click outside or press ESC
}

function updateColorFromHsv() {
  const hex = hsvToHex(hue.value, saturation.value, brightness.value)
  localValue.value = hex
  emit('update:modelValue', hex)
}

// Gradient (saturation/brightness) interaction
function handleGradientMouseDown(event: MouseEvent) {
  isDraggingGradient.value = true
  updateGradientFromEvent(event)
}

function updateGradientFromEvent(event: MouseEvent) {
  if (!gradientRef.value) return

  const rect = gradientRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
  const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height))

  saturation.value = (x / rect.width) * 100
  brightness.value = 100 - (y / rect.height) * 100

  updateColorFromHsv()
}

// Hue slider interaction
function handleHueMouseDown(event: MouseEvent) {
  isDraggingHue.value = true
  updateHueFromEvent(event)
}

function updateHueFromEvent(event: MouseEvent) {
  if (!hueRef.value) return

  const rect = hueRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width))

  hue.value = (x / rect.width) * 360

  updateColorFromHsv()
}

function handleMouseMove(event: MouseEvent) {
  if (isDraggingGradient.value) {
    updateGradientFromEvent(event)
  } else if (isDraggingHue.value) {
    updateHueFromEvent(event)
  }
}

function handleMouseUp() {
  isDraggingGradient.value = false
  isDraggingHue.value = false
}

function handleHexInput(event: Event) {
  const input = event.target as HTMLInputElement
  let value = input.value

  if (value && !value.startsWith('#')) {
    value = '#' + value
  }

  localValue.value = value
}

function handleHexBlur() {
  if (localValue.value && /^#[0-9A-Fa-f]{6}$/.test(localValue.value)) {
    emit('update:modelValue', localValue.value)
    syncHsvFromHex()
  }
}

function handleHexKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleHexBlur()
  }
}

function clearColor() {
  localValue.value = ''
  emit('update:modelValue', '')
  // Don't close - let user continue selecting until they click outside or press ESC
}
</script>

<template>
  <div class="relative">
    <!-- Inline mode - display picker UI directly -->
    <div
      v-if="inline"
      class="space-y-3"
    >
      <!-- Saturation/Brightness Gradient -->
      <div
        ref="gradientRef"
        class="relative w-full h-32 rounded-lg cursor-crosshair select-none"
        :style="{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`,
        }"
        @mousedown="handleGradientMouseDown"
      >
        <!-- Picker indicator -->
        <div
          class="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
          :style="{
            left: `${saturation}%`,
            top: `${100 - brightness}%`,
            backgroundColor: currentColorFromHsv,
          }"
        />
      </div>

      <!-- Hue Slider -->
      <div
        ref="hueRef"
        class="relative w-full h-3 rounded-full cursor-pointer select-none"
        style="background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
        @mousedown="handleHueMouseDown"
      >
        <!-- Hue indicator -->
        <div
          class="absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
          :style="{
            left: `${(hue / 360) * 100}%`,
            backgroundColor: hsvToHex(hue, 100, 100),
          }"
        />
      </div>

      <!-- Recent Colors -->
      <div v-if="recentColors.length > 0">
        <p class="text-xs font-medium text-muted-foreground mb-2">
          Recent
        </p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="color in recentColors"
            :key="color"
            type="button"
            class="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
            :class="localValue.toUpperCase() === color.toUpperCase() ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''"
            :style="{ backgroundColor: color }"
            :title="color"
            @click="selectColor(color)"
          />
        </div>
      </div>

      <!-- Preset Colors -->
      <div>
        <p class="text-xs font-medium text-muted-foreground mb-2">
          Presets
        </p>
        <div class="grid grid-cols-8 gap-1.5">
          <button
            v-for="color in presetColors"
            :key="color"
            type="button"
            class="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
            :class="localValue.toUpperCase() === color.toUpperCase() ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''"
            :style="{ backgroundColor: color }"
            :title="color"
            @click="selectColor(color)"
          />
        </div>
      </div>

      <!-- HEX Input + None button -->
      <div class="flex items-center">
        <input
          type="text"
          :value="localValue"
          placeholder="#000000"
          class="flex-1 h-7 px-2 text-xs bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground font-mono uppercase"
          maxlength="7"
          @input="handleHexInput"
          @blur="handleHexBlur"
          @keydown="handleHexKeydown"
        />
        <button
          type="button"
          class="h-7 px-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:bg-secondary/50 transition-colors whitespace-nowrap"
          @click="clearColor"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          None
        </button>
      </div>
    </div>

    <!-- Swatch-only with HEX input -->
    <div
      v-else-if="swatchOnly"
      class="flex items-center"
    >
      <!-- HEX value input -->
      <input
        type="text"
        :value="hasValue ? localValue.toUpperCase() : ''"
        placeholder="transparent"
        class="w-20 h-6 px-1.5 text-xxs font-mono text-muted-foreground bg-transparent border-none focus:outline-none focus:ring-0 uppercase placeholder:normal-case"
        maxlength="7"
        @input="handleHexInput"
        @blur="handleHexBlur"
        @keydown="handleHexKeydown"
      />
      <!-- Swatch-only Trigger Button -->
      <button
        ref="triggerRef"
        type="button"
        class="relative w-5 h-5 rounded border border-border hover:ring-2 hover:ring-primary/50 transition-all shrink-0 overflow-hidden"
        :style="{ backgroundColor: hasValue ? displayColor : 'transparent' }"
        @click="togglePopover"
      >
        <!-- Diagonal line for transparent -->
        <div
          v-if="!hasValue"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div class="w-[141%] h-px bg-muted-foreground rotate-45" />
        </div>
      </button>
    </div>

    <!-- Full Trigger Button -->
    <button
      v-else
      ref="triggerRef"
      type="button"
      class="flex items-center w-full h-9 px-2 bg-secondary border border-border rounded-md hover:bg-secondary/80 transition-colors"
      @click="togglePopover"
    >
      <!-- Color preview swatch -->
      <div
        class="relative w-6 h-6 rounded border border-border shrink-0 overflow-hidden"
        :style="{ backgroundColor: hasValue ? displayColor : 'transparent' }"
      >
        <!-- Diagonal line for transparent -->
        <div
          v-if="!hasValue"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div class="w-[141%] h-px bg-muted-foreground rotate-45" />
        </div>
      </div>

      <!-- Value display -->
      <span
        class="flex-1 text-left text-sm truncate"
        :class="hasValue ? 'text-foreground' : 'text-muted-foreground'"
      >
        {{ hasValue ? localValue.toUpperCase() : placeholder || 'Select color' }}
      </span>

      <!-- Clear button -->
      <button
        v-if="hasValue"
        type="button"
        class="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
        title="Clear"
        @click.stop="clearColor"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Dropdown arrow -->
      <svg
        class="w-4 h-4 text-muted-foreground shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Popover -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="popoverRef"
        class="fixed z-[200] bg-card border border-border rounded-xl shadow-xl p-3 space-y-3 color-picker-popover"
        :style="{
          top: `${popoverPosition.top}px`,
          left: `${popoverPosition.left}px`,
          width: `${popoverPosition.width}px`,
        }"
        @click.stop
        @mousedown.stop
      >
        <!-- Saturation/Brightness Gradient -->
        <div
          ref="gradientRef"
          class="relative w-full h-40 rounded-lg cursor-crosshair select-none"
          :style="{
            background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`,
          }"
          @mousedown="handleGradientMouseDown"
        >
          <!-- Picker indicator -->
          <div
            class="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
            :style="{
              left: `${saturation}%`,
              top: `${100 - brightness}%`,
              backgroundColor: currentColorFromHsv,
            }"
          />
        </div>

        <!-- Hue Slider -->
        <div
          ref="hueRef"
          class="relative w-full h-3 rounded-full cursor-pointer select-none"
          style="background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
          @mousedown="handleHueMouseDown"
        >
          <!-- Hue indicator -->
          <div
            class="absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
            :style="{
              left: `${(hue / 360) * 100}%`,
              backgroundColor: hsvToHex(hue, 100, 100),
            }"
          />
        </div>

        <!-- Recent Colors -->
        <div v-if="recentColors.length > 0">
          <p class="text-xs font-medium text-muted-foreground mb-2">
            Recent
          </p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="color in recentColors"
              :key="color"
              type="button"
              class="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
              :class="localValue.toUpperCase() === color.toUpperCase() ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''"
              :style="{ backgroundColor: color }"
              :title="color"
              @click="selectColor(color)"
            />
          </div>
        </div>

        <!-- Preset Colors -->
        <div>
          <p class="text-xs font-medium text-muted-foreground mb-2">
            Presets
          </p>
          <div class="grid grid-cols-8 gap-1.5">
            <button
              v-for="color in presetColors"
              :key="color"
              type="button"
              class="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
              :class="localValue.toUpperCase() === color.toUpperCase() ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''"
              :style="{ backgroundColor: color }"
              :title="color"
              @click="selectColor(color)"
            />
          </div>
        </div>

        <!-- HEX Input + None button -->
        <div class="flex items-center justify-between">
          <input
            type="text"
            :value="localValue"
            placeholder="#000000"
            class="w-20 h-6 px-1.5 text-xxs font-mono text-muted-foreground bg-transparent focus:outline-none focus:ring-0 uppercase placeholder:normal-case"
            maxlength="7"
            @input="handleHexInput"
            @blur="handleHexBlur"
            @keydown="handleHexKeydown"
          />
          <button
            type="button"
            class="h-8 px-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:bg-secondary/50 transition-colors whitespace-nowrap"
            @click="clearColor"
          >
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            None
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
