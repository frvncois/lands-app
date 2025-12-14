<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Icon } from '@/components/ui'

export type SizeUnit = 'px' | 'em' | 'rem' | 'ch' | '%' | 'vh' | 'vw' | 'svh' | 'svw' | 'auto'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  allowAuto?: boolean
  defaultUnit?: SizeUnit
}>(), {
  modelValue: '',
  placeholder: '0',
  allowAuto: true,
  defaultUnit: 'px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Available units
const units: { value: SizeUnit; label: string }[] = [
  { value: 'px', label: 'px' },
  { value: '%', label: '%' },
  { value: 'vh', label: 'vh' },
  { value: 'vw', label: 'vw' },
  { value: 'svh', label: 'svh' },
  { value: 'svw', label: 'svw' },
  { value: 'em', label: 'em' },
  { value: 'rem', label: 'rem' },
  { value: 'ch', label: 'ch' },
]

// Parse value into number and unit
function parseValue(value: string): { num: string; unit: SizeUnit } {
  if (!value || value === 'auto') {
    return { num: '', unit: 'auto' }
  }

  // Match number (including decimals) followed by unit
  const match = value.match(/^(-?\d*\.?\d*)\s*(px|em|rem|ch|%|vh|vw|svh|svw)?$/i)
  if (match) {
    const num = match[1] || ''
    const unit = (match[2]?.toLowerCase() as SizeUnit) || props.defaultUnit
    return { num, unit }
  }

  return { num: value, unit: props.defaultUnit }
}

// Local state
const parsed = computed(() => parseValue(props.modelValue || ''))
const numValue = ref(parsed.value.num)
const unitValue = ref<SizeUnit>(parsed.value.unit)
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  const { num, unit } = parseValue(newVal || '')
  numValue.value = num
  // Only update unit if there's an actual value with a unit, preserve user's unit selection otherwise
  if (newVal && newVal !== 'auto' && newVal !== '') {
    unitValue.value = unit
  } else if (newVal === 'auto') {
    unitValue.value = 'auto'
  }
  // When value is empty, keep the current unit selection
})

// Emit combined value
function emitValue() {
  if (unitValue.value === 'auto') {
    emit('update:modelValue', 'auto')
  } else if (numValue.value === '' || numValue.value === undefined) {
    emit('update:modelValue', '')
  } else {
    emit('update:modelValue', `${numValue.value}${unitValue.value}`)
  }
}

function handleNumInput(event: Event) {
  const target = event.target as HTMLInputElement
  const rawValue = target.value.trim()

  // Check if user typed a unit (e.g., "10em", "50%", "100vh")
  const unitMatch = rawValue.match(/^(-?\d*\.?\d*)\s*(px|em|rem|ch|%|vh|vw|svh|svw)$/i)

  if (unitMatch && unitMatch[1] !== undefined && unitMatch[2]) {
    const num = unitMatch[1]
    const unit = unitMatch[2].toLowerCase() as SizeUnit
    numValue.value = num
    unitValue.value = unit
  } else {
    // Just extract numbers
    const value = rawValue.replace(/[^0-9.\-]/g, '')
    numValue.value = value

    // If switching from auto, use default unit
    if (unitValue.value === 'auto' && value) {
      unitValue.value = props.defaultUnit
    }
  }

  emitValue()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()

    // If currently auto, switch to default unit
    if (unitValue.value === 'auto') {
      unitValue.value = props.defaultUnit
    }

    const currentNum = parseFloat(numValue.value) || 0
    const step = event.shiftKey ? 10 : 1
    const newNum = event.key === 'ArrowUp' ? currentNum + step : currentNum - step

    numValue.value = String(newNum)
    emitValue()
  }
}

function selectUnit(unit: SizeUnit) {
  unitValue.value = unit
  isDropdownOpen.value = false

  // If selecting auto, clear the number
  if (unit === 'auto') {
    numValue.value = ''
  }

  emitValue()
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Display units including auto if allowed
const displayUnits = computed(() => {
  if (props.allowAuto) {
    return [{ value: 'auto' as SizeUnit, label: 'auto' }, ...units]
  }
  return units
})
</script>

<template>
  <div ref="dropdownRef" class="flex max-w-30">
    <!-- Number input -->
    <input
      type="text"
      inputmode="decimal"
      :value="unitValue === 'auto' ? '' : numValue"
      :placeholder="unitValue === 'auto' ? 'auto' : placeholder"
      class="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-l-lg text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
      @input="handleNumInput"
      @keydown="handleKeydown"
    />

    <!-- Unit dropdown trigger -->
    <div class="relative">
      <button
        type="button"
        class="h-full flex items-center gap-1 px-2 border border-l-0 border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded-r-lg transition-colors cursor-pointer"
        @click.stop="isDropdownOpen = !isDropdownOpen"
      >
        <span>{{ unitValue }}</span>
        <Icon
          name="chevron-down"
          :size="8"
          class="transition-transform"
          :class="{ 'rotate-180': isDropdownOpen }"
        />
      </button>

      <!-- Dropdown menu -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isDropdownOpen"
          class="absolute top-full right-0 mt-1 min-w-16 bg-sidebar-background backdrop-blur-sm p-1 border border-sidebar-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto origin-top-right"
        >
          <button
            v-for="u in displayUnits"
            :key="u.value"
            type="button"
            class="w-full flex items-center px-2.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer text-left"
            :class="[
              u.value === unitValue
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            ]"
            @click="selectUnit(u.value)"
          >
            {{ u.label }}
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>
