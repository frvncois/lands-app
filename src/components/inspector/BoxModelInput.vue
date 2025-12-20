<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Spacing } from '@/types/designer'
import { Icon } from '@/components/ui'

const props = defineProps<{
  margin?: Spacing
  padding?: Spacing
}>()

const emit = defineEmits<{
  'update:margin': [value: Spacing]
  'update:padding': [value: Spacing]
}>()

// Unit dropdown state
const openDropdown = ref<string | null>(null)

const units = ['px', '%', 'em', 'rem', 'vh', 'vw']

function parseValue(val: string | undefined): { num: string; unit: string } {
  if (!val) return { num: '', unit: 'px' }
  if (val.toLowerCase() === 'auto') return { num: 'auto', unit: '' }
  const match = val.match(/^(-?\d*\.?\d*)(px|%|em|rem|vh|vw)?$/i)
  if (match) {
    return {
      num: match[1] || '',
      unit: match[2]?.toLowerCase() || 'px'
    }
  }
  return { num: val, unit: 'px' }
}

function getNumericValue(type: 'margin' | 'padding', side: keyof Spacing): string {
  const spacing = type === 'margin' ? props.margin : props.padding
  const raw = spacing?.[side] || ''
  return parseValue(raw).num
}

function getUnit(type: 'margin' | 'padding', side: keyof Spacing): string {
  const spacing = type === 'margin' ? props.margin : props.padding
  const raw = spacing?.[side] || ''
  const { unit } = parseValue(raw)
  return unit || 'px'
}

function updateValue(type: 'margin' | 'padding', side: keyof Spacing, value: string) {
  const spacing = type === 'margin' ? props.margin : props.padding
  // Keep the existing unit for this side
  const currentUnit = getUnit(type, side)

  // Format the value with unit
  let formattedValue: string
  if (value === 'auto') {
    formattedValue = 'auto'
  } else if (value === '' || value === '0') {
    formattedValue = ''
  } else {
    // Only append unit if value is numeric
    const numericValue = value.replace(/[^\d.-]/g, '')
    formattedValue = numericValue ? `${numericValue}${currentUnit}` : ''
  }

  // Apply to single side
  const currentSpacing: Spacing = spacing || {}
  const updated: Spacing = { ...currentSpacing, [side]: formattedValue }
  if (type === 'margin') {
    emit('update:margin', updated)
  } else {
    emit('update:padding', updated)
  }
}

function updateUnit(type: 'margin' | 'padding', newUnit: string) {
  const spacing = type === 'margin' ? props.margin : props.padding
  const currentSpacing: Spacing = spacing || {}

  // Apply new unit to ALL sides
  const updated: Spacing = {
    top: applyUnitToValue(currentSpacing.top, newUnit),
    right: applyUnitToValue(currentSpacing.right, newUnit),
    bottom: applyUnitToValue(currentSpacing.bottom, newUnit),
    left: applyUnitToValue(currentSpacing.left, newUnit),
  }

  if (type === 'margin') {
    emit('update:margin', updated)
  } else {
    emit('update:padding', updated)
  }
  openDropdown.value = null
}

function applyUnitToValue(val: string | undefined, newUnit: string): string {
  if (!val) return ''
  if (val.toLowerCase() === 'auto') return 'auto'
  const { num } = parseValue(val)
  if (!num || num === 'auto') return val || ''
  return `${num}${newUnit}`
}

// Get the primary unit (from top, or first non-empty side)
function getPrimaryUnit(type: 'margin' | 'padding'): string {
  const spacing = type === 'margin' ? props.margin : props.padding
  if (!spacing) return 'px'

  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    const val = spacing[side]
    if (val && val !== 'auto') {
      const { unit } = parseValue(val)
      if (unit) return unit
    }
  }
  return 'px'
}

function handleKeydown(event: KeyboardEvent, type: 'margin' | 'padding', side: keyof Spacing) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    const currentValue = getNumericValue(type, side)
    const numValue = parseFloat(currentValue) || 0
    const step = event.shiftKey ? 10 : 1
    const newValue = event.key === 'ArrowUp' ? numValue + step : numValue - step
    updateValue(type, side, String(newValue))
  }
}

function toggleDropdown(key: string) {
  openDropdown.value = openDropdown.value === key ? null : key
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.unit-dropdown')) {
    openDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="space-y-4">
    <!-- Padding -->
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-foreground">Padding</span>
        <!-- Single unit selector for all sides -->
        <div class="relative unit-dropdown">
          <button
            type="button"
            class="flex items-center gap-0.5 px-1.5 py-0.5 border border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded transition-colors cursor-pointer"
            @click.stop="toggleDropdown('padding-unit')"
          >
            <span>{{ getPrimaryUnit('padding') }}</span>
            <Icon name="chevron-down" :size="8" class="transition-transform" :class="{ 'rotate-180': openDropdown === 'padding-unit' }" />
          </button>
          <div
            v-if="openDropdown === 'padding-unit'"
            class="absolute top-full right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-14"
          >
            <button
              v-for="unit in units"
              :key="unit"
              type="button"
              class="w-full px-2 py-1 text-[10px] font-mono text-left hover:bg-accent transition-colors"
              :class="getPrimaryUnit('padding') === unit ? 'text-primary' : 'text-foreground'"
              @click="updateUnit('padding', unit)"
            >
              {{ unit }}
            </button>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-1">
        <!-- Top -->
        <input
          type="text"
          inputmode="decimal"
          :value="getNumericValue('padding', 'top')"
          placeholder="T"
          class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
          @input="updateValue('padding', 'top', ($event.target as HTMLInputElement).value)"
          @keydown="handleKeydown($event, 'padding', 'top')"
        />
        <!-- Right -->
        <input
          type="text"
          inputmode="decimal"
          :value="getNumericValue('padding', 'right')"
          placeholder="R"
          class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
          @input="updateValue('padding', 'right', ($event.target as HTMLInputElement).value)"
          @keydown="handleKeydown($event, 'padding', 'right')"
        />
        <!-- Bottom -->
        <input
          type="text"
          inputmode="decimal"
          :value="getNumericValue('padding', 'bottom')"
          placeholder="B"
          class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
          @input="updateValue('padding', 'bottom', ($event.target as HTMLInputElement).value)"
          @keydown="handleKeydown($event, 'padding', 'bottom')"
        />
        <!-- Left -->
        <input
          type="text"
          inputmode="decimal"
          :value="getNumericValue('padding', 'left')"
          placeholder="L"
          class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
          @input="updateValue('padding', 'left', ($event.target as HTMLInputElement).value)"
          @keydown="handleKeydown($event, 'padding', 'left')"
        />
      </div>
    </div>

    <!-- Margin -->
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-foreground">Margin</span>
        <!-- Single unit selector for all sides -->
        <div class="relative unit-dropdown">
          <button
            type="button"
            class="flex items-center gap-0.5 px-1.5 py-0.5 border border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded transition-colors cursor-pointer"
            @click.stop="toggleDropdown('margin-unit')"
          >
            <span>{{ getPrimaryUnit('margin') }}</span>
            <Icon name="chevron-down" :size="8" class="transition-transform" :class="{ 'rotate-180': openDropdown === 'margin-unit' }" />
          </button>
          <div
            v-if="openDropdown === 'margin-unit'"
            class="absolute top-full right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-14"
          >
            <button
              v-for="unit in units"
              :key="unit"
              type="button"
              class="w-full px-2 py-1 text-[10px] font-mono text-left hover:bg-accent transition-colors"
              :class="getPrimaryUnit('margin') === unit ? 'text-primary' : 'text-foreground'"
              @click="updateUnit('margin', unit)"
            >
              {{ unit }}
            </button>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-1">
        <!-- Top -->
        <input
          type="text"
          inputmode="decimal"
          :value="getNumericValue('margin', 'top')"
          placeholder="T"
          class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
          @input="updateValue('margin', 'top', ($event.target as HTMLInputElement).value)"
          @keydown="handleKeydown($event, 'margin', 'top')"
        />
        <!-- Right -->
        <input
          type="text"
          inputmode="decimal"
          :value="getNumericValue('margin', 'right')"
          placeholder="R"
          class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
          @input="updateValue('margin', 'right', ($event.target as HTMLInputElement).value)"
          @keydown="handleKeydown($event, 'margin', 'right')"
        />
        <!-- Bottom -->
        <input
          type="text"
          inputmode="decimal"
          :value="getNumericValue('margin', 'bottom')"
          placeholder="B"
          class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
          @input="updateValue('margin', 'bottom', ($event.target as HTMLInputElement).value)"
          @keydown="handleKeydown($event, 'margin', 'bottom')"
        />
        <!-- Left -->
        <input
          type="text"
          inputmode="decimal"
          :value="getNumericValue('margin', 'left')"
          placeholder="L"
          class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
          @input="updateValue('margin', 'left', ($event.target as HTMLInputElement).value)"
          @keydown="handleKeydown($event, 'margin', 'left')"
        />
      </div>
    </div>
  </div>
</template>
