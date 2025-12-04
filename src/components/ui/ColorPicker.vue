<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editor'

const props = defineProps<{
  modelValue: string | undefined
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorStore = useEditorStore()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const localValue = ref(props.modelValue ?? '')
const popoverPosition = ref({ top: 0, left: 0, placement: 'bottom' as 'top' | 'bottom' })

// Preset color palette (Tailwind-inspired)
const presetColors = [
  // Grays
  '#000000', '#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8', '#f4f4f5', '#ffffff',
  // Colors
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  // Lighter variants
  '#fca5a5', '#fdba74', '#fde047', '#86efac', '#5eead4', '#93c5fd', '#c4b5fd', '#f9a8d4',
]

// Recent colors - stored per project
const MAX_RECENT_COLORS = 8
const recentColors = ref<string[]>([])

// Load recent colors from localStorage on mount
onMounted(() => {
  loadRecentColors()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function loadRecentColors() {
  const projectId = editorStore.currentProjectId
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
  const projectId = editorStore.currentProjectId
  if (!projectId || !color) return

  // Normalize color to uppercase hex
  const normalizedColor = color.toUpperCase()

  // Remove if already exists
  const filtered = recentColors.value.filter(c => c.toUpperCase() !== normalizedColor)

  // Add to beginning
  recentColors.value = [normalizedColor, ...filtered].slice(0, MAX_RECENT_COLORS)

  // Save to localStorage
  localStorage.setItem(`recentColors_${projectId}`, JSON.stringify(recentColors.value))
}

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal ?? ''
})

const displayColor = computed(() => {
  return localValue.value || '#000000'
})

const hasValue = computed(() => {
  return !!localValue.value && localValue.value !== ''
})

function handleClickOutside(event: MouseEvent) {
  if (!isOpen.value) return

  const target = event.target as Node
  if (
    triggerRef.value?.contains(target) ||
    popoverRef.value?.contains(target)
  ) {
    return
  }

  isOpen.value = false
}

function calculatePosition() {
  if (!triggerRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popoverHeight = 320 // Approximate height of popover
  const popoverWidth = 256 // w-64 = 16rem = 256px
  const gap = 4
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  // Check if there's enough space below
  const spaceBelow = viewportHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top

  let top: number
  let placement: 'top' | 'bottom'

  if (spaceBelow >= popoverHeight + gap || spaceBelow >= spaceAbove) {
    // Position below
    top = triggerRect.bottom + gap
    placement = 'bottom'
  } else {
    // Position above
    top = triggerRect.top - popoverHeight - gap
    placement = 'top'
  }

  // Calculate left position, ensuring it doesn't go off-screen
  let left = triggerRect.left
  if (left + popoverWidth > viewportWidth - 8) {
    left = viewportWidth - popoverWidth - 8
  }
  if (left < 8) {
    left = 8
  }

  popoverPosition.value = { top, left, placement }
}

function togglePopover() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      calculatePosition()
    })
  }
}

function selectColor(color: string) {
  localValue.value = color
  emit('update:modelValue', color)
  saveRecentColor(color)
  isOpen.value = false
}

function handleColorInput(event: Event) {
  const input = event.target as HTMLInputElement
  localValue.value = input.value
  emit('update:modelValue', input.value)
}

function handleColorInputComplete() {
  if (localValue.value) {
    saveRecentColor(localValue.value)
  }
}

function handleHexInput(event: Event) {
  const input = event.target as HTMLInputElement
  let value = input.value

  // Auto-add # if missing
  if (value && !value.startsWith('#')) {
    value = '#' + value
  }

  localValue.value = value
}

function handleHexBlur() {
  // Validate and emit on blur
  if (localValue.value && /^#[0-9A-Fa-f]{6}$/.test(localValue.value)) {
    emit('update:modelValue', localValue.value)
    saveRecentColor(localValue.value)
  }
}

function handleHexKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleHexBlur()
    isOpen.value = false
  }
}

function clearColor() {
  localValue.value = ''
  emit('update:modelValue', '')
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Trigger Button -->
    <button
      ref="triggerRef"
      type="button"
      class="flex items-center gap-2 w-full h-9 px-2 bg-secondary border border-border rounded-md hover:bg-secondary/80 transition-colors"
      @click="togglePopover"
    >
      <!-- Color preview swatch -->
      <div
        class="w-6 h-6 rounded border border-border shrink-0"
        :style="{ backgroundColor: hasValue ? displayColor : 'transparent' }"
      >
        <!-- Checkerboard pattern for transparent -->
        <div
          v-if="!hasValue"
          class="w-full h-full rounded"
          style="background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px;"
        />
      </div>

      <!-- Value display -->
      <span class="flex-1 text-left text-sm truncate" :class="hasValue ? 'text-foreground' : 'text-muted-foreground'">
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
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Dropdown arrow -->
      <svg class="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Popover -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="popoverRef"
        class="fixed z-50 w-64 bg-card border border-border rounded-lg shadow-xl p-3 space-y-3"
        :style="{
          top: `${popoverPosition.top}px`,
          left: `${popoverPosition.left}px`,
        }"
      >
        <!-- Native color picker + hex input -->
        <div class="flex items-center gap-2">
          <div class="relative">
            <input
              type="color"
              :value="displayColor"
              class="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent"
              @input="handleColorInput"
              @change="handleColorInputComplete"
            />
          </div>
          <div class="flex-1">
            <input
              type="text"
              :value="localValue"
              placeholder="#000000"
              class="w-full h-10 px-3 text-sm bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground font-mono uppercase"
              maxlength="7"
              @input="handleHexInput"
              @blur="handleHexBlur"
              @keydown="handleHexKeydown"
            />
          </div>
        </div>

        <!-- Recent Colors -->
        <div v-if="recentColors.length > 0">
          <p class="text-xs font-medium text-muted-foreground mb-2">Recent</p>
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
          <p class="text-xs font-medium text-muted-foreground mb-2">Presets</p>
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

        <!-- Transparent option -->
        <button
          type="button"
          class="w-full h-8 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:bg-secondary/50 transition-colors"
          @click="clearColor"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Transparent / None
        </button>
      </div>
    </Teleport>
  </div>
</template>
