<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { BorderRadiusStyle } from '@/types/designer'
import { Icon } from '@/components/ui'

const props = defineProps<{
  modelValue?: string | BorderRadiusStyle
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BorderRadiusStyle]
}>()

// Lock state for syncing all corners
const locked = ref(true)

// Unit dropdown state
const openDropdown = ref<string | null>(null)

const units = ['px', '%', 'em', 'rem']

// Initialize lock state from modelValue
const initLockState = () => {
  if (!props.modelValue || typeof props.modelValue === 'string') {
    locked.value = true
  } else {
    locked.value = props.modelValue.locked !== false
  }
}

// Watch for external changes
initLockState()

function parseValue(val: string | undefined): { num: string; unit: string } {
  if (!val) return { num: '', unit: 'px' }
  const match = val.match(/^(-?\d*\.?\d*)(px|%|em|rem)?$/i)
  if (match) {
    return {
      num: match[1] || '',
      unit: match[2]?.toLowerCase() || 'px'
    }
  }
  return { num: val, unit: 'px' }
}

const cornerValues = computed(() => {
  if (!props.modelValue) {
    return { topLeft: '', topRight: '', bottomRight: '', bottomLeft: '' }
  }
  if (typeof props.modelValue === 'string') {
    return {
      topLeft: props.modelValue,
      topRight: props.modelValue,
      bottomRight: props.modelValue,
      bottomLeft: props.modelValue
    }
  }
  return {
    topLeft: props.modelValue.topLeft || '',
    topRight: props.modelValue.topRight || '',
    bottomRight: props.modelValue.bottomRight || '',
    bottomLeft: props.modelValue.bottomLeft || '',
  }
})

function getNumericValue(corner: keyof typeof cornerValues.value): string {
  const raw = cornerValues.value[corner] || ''
  return parseValue(raw).num
}

// Get the primary unit (from topLeft, or first non-empty corner)
function getPrimaryUnit(): string {
  const corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const
  for (const corner of corners) {
    const val = cornerValues.value[corner]
    if (val) {
      const { unit } = parseValue(val)
      if (unit) return unit
    }
  }
  return 'px'
}

function applyUnitToValue(val: string | undefined, newUnit: string): string {
  if (!val) return ''
  const { num } = parseValue(val)
  if (!num) return ''
  return `${num}${newUnit}`
}

function updateValue(corner: keyof typeof cornerValues.value, value: string) {
  const currentUnit = getPrimaryUnit()

  // Format the value with unit
  let formattedValue: string
  if (value === '' || value === '0') {
    formattedValue = ''
  } else {
    const numericValue = value.replace(/[^\d.-]/g, '')
    formattedValue = numericValue ? `${numericValue}${currentUnit}` : ''
  }

  if (locked.value && formattedValue !== '') {
    // Apply to all corners
    emit('update:modelValue', {
      topLeft: formattedValue,
      topRight: formattedValue,
      bottomRight: formattedValue,
      bottomLeft: formattedValue,
      locked: true,
    })
  } else {
    // Apply to single corner
    emit('update:modelValue', {
      ...cornerValues.value,
      [corner]: formattedValue,
      locked: locked.value,
    })
  }
}

function updateUnit(newUnit: string) {
  // Apply new unit to ALL corners
  const updated: BorderRadiusStyle = {
    topLeft: applyUnitToValue(cornerValues.value.topLeft, newUnit),
    topRight: applyUnitToValue(cornerValues.value.topRight, newUnit),
    bottomRight: applyUnitToValue(cornerValues.value.bottomRight, newUnit),
    bottomLeft: applyUnitToValue(cornerValues.value.bottomLeft, newUnit),
    locked: locked.value,
  }
  emit('update:modelValue', updated)
  openDropdown.value = null
}

function handleKeydown(event: KeyboardEvent, corner: keyof typeof cornerValues.value) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    const currentValue = getNumericValue(corner)
    const numValue = parseFloat(currentValue) || 0
    const step = event.shiftKey ? 10 : 1
    const newValue = event.key === 'ArrowUp' ? numValue + step : Math.max(0, numValue - step)
    updateValue(corner, String(newValue))
  }
}

function toggleLock() {
  locked.value = !locked.value
  if (locked.value) {
    // When locking, use the topLeft value for all corners
    const value = cornerValues.value.topLeft || '0'
    emit('update:modelValue', {
      topLeft: value,
      topRight: value,
      bottomRight: value,
      bottomLeft: value,
      locked: true,
    })
  } else {
    emit('update:modelValue', {
      ...cornerValues.value,
      locked: false,
    })
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
  <div class="space-y-1">
    <div class="flex items-center justify-between">
      <span class="text-xs font-medium text-foreground">Corner Radius</span>
      <!-- Single unit selector for all corners -->
      <div class="flex items-center gap-1">
        <!-- Lock button -->
        <button
          type="button"
          class="p-0.5 rounded transition-colors"
          :class="locked
            ? 'text-primary'
            : 'text-muted-foreground/50 hover:text-muted-foreground'"
          :title="locked ? 'Unlock corners' : 'Lock all corners'"
          @click="toggleLock"
        >
          <Icon :name="locked ? 'lock' : 'unlock'" :size="10" />
        </button>
        <!-- Unit dropdown -->
        <div class="relative unit-dropdown">
          <button
            type="button"
            class="flex items-center gap-0.5 px-1.5 py-0.5 border border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded transition-colors cursor-pointer"
            @click.stop="toggleDropdown('radius-unit')"
          >
            <span>{{ getPrimaryUnit() }}</span>
            <Icon name="chevron-down" :size="8" class="transition-transform" :class="{ 'rotate-180': openDropdown === 'radius-unit' }" />
          </button>
          <div
            v-if="openDropdown === 'radius-unit'"
            class="absolute top-full right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-14"
          >
            <button
              v-for="unit in units"
              :key="unit"
              type="button"
              class="w-full px-2 py-1 text-[10px] font-mono text-left hover:bg-accent transition-colors"
              :class="getPrimaryUnit() === unit ? 'text-primary' : 'text-foreground'"
              @click="updateUnit(unit)"
            >
              {{ unit }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-1">
      <!-- Top Left -->
      <input
        type="text"
        inputmode="decimal"
        :value="getNumericValue('topLeft')"
        placeholder="TL"
        class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
        @input="updateValue('topLeft', ($event.target as HTMLInputElement).value)"
        @keydown="handleKeydown($event, 'topLeft')"
      />
      <!-- Top Right -->
      <input
        type="text"
        inputmode="decimal"
        :value="getNumericValue('topRight')"
        placeholder="TR"
        class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
        @input="updateValue('topRight', ($event.target as HTMLInputElement).value)"
        @keydown="handleKeydown($event, 'topRight')"
      />
      <!-- Bottom Left -->
      <input
        type="text"
        inputmode="decimal"
        :value="getNumericValue('bottomLeft')"
        placeholder="BL"
        class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
        @input="updateValue('bottomLeft', ($event.target as HTMLInputElement).value)"
        @keydown="handleKeydown($event, 'bottomLeft')"
      />
      <!-- Bottom Right -->
      <input
        type="text"
        inputmode="decimal"
        :value="getNumericValue('bottomRight')"
        placeholder="BR"
        class="px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
        @input="updateValue('bottomRight', ($event.target as HTMLInputElement).value)"
        @keydown="handleKeydown($event, 'bottomRight')"
      />
    </div>
  </div>
</template>
