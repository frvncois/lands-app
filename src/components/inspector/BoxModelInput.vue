<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Spacing } from '@/types/editor'
import { Icon } from '@/components/ui'

const props = defineProps<{
  margin?: Spacing
  padding?: Spacing
}>()

const emit = defineEmits<{
  'update:margin': [value: Spacing]
  'update:padding': [value: Spacing]
}>()

// Lock state for syncing all sides
const paddingLocked = ref(false)
const marginLocked = ref(false)

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

function updateValue(type: 'margin' | 'padding', side: keyof Spacing, value: string, unit?: string) {
  const spacing = type === 'margin' ? props.margin : props.padding
  const locked = type === 'margin' ? marginLocked.value : paddingLocked.value
  const currentUnit = unit ?? getUnit(type, side)

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

  if (locked && formattedValue !== '') {
    // Apply to all sides
    const updated: Spacing = {
      top: formattedValue,
      right: formattedValue,
      bottom: formattedValue,
      left: formattedValue,
    }
    if (type === 'margin') {
      emit('update:margin', updated)
    } else {
      emit('update:padding', updated)
    }
  } else {
    // Apply to single side - ensure we have a valid object to spread
    const currentSpacing: Spacing = spacing || {}
    const updated: Spacing = { ...currentSpacing, [side]: formattedValue }
    if (type === 'margin') {
      emit('update:margin', updated)
    } else {
      emit('update:padding', updated)
    }
  }
}

function updateUnit(type: 'margin' | 'padding', side: keyof Spacing, newUnit: string) {
  const currentValue = getNumericValue(type, side)
  if (currentValue && currentValue !== 'auto') {
    updateValue(type, side, currentValue, newUnit)
  }
  openDropdown.value = null
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
      <span class="text-xs font-medium text-foreground">Padding</span>
      <div class="flex flex-col gap-0.5">
        <!-- Top row: Top & Left -->
        <div class="grid grid-cols-2 gap-1">
          <!-- Top -->
          <div class="flex unit-dropdown">
            <input
              type="text"
              inputmode="decimal"
              :value="getNumericValue('padding', 'top')"
              placeholder="0"
              class="flex-1 min-w-0 px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-l-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
              @input="updateValue('padding', 'top', ($event.target as HTMLInputElement).value)"
              @keydown="handleKeydown($event, 'padding', 'top')"
            />
            <div class="relative">
              <button
                type="button"
                class="h-full flex items-center gap-0.5 px-1.5 border border-l-0 border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded-r-md transition-colors cursor-pointer"
                @click.stop="toggleDropdown('padding-top')"
              >
                <span>{{ getUnit('padding', 'top') }}</span>
                <Icon name="chevron-down" :size="8" class="transition-transform" :class="{ 'rotate-180': openDropdown === 'padding-top' }" />
              </button>
              <div
                v-if="openDropdown === 'padding-top'"
                class="absolute top-full right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-14"
              >
                <button
                  v-for="unit in units"
                  :key="unit"
                  type="button"
                  class="w-full px-2 py-1 text-[10px] font-mono text-left hover:bg-accent transition-colors"
                  :class="getUnit('padding', 'top') === unit ? 'text-primary' : 'text-foreground'"
                  @click="updateUnit('padding', 'top', unit)"
                >
                  {{ unit }}
                </button>
              </div>
            </div>
          </div>
          <!-- Left -->
          <div class="flex unit-dropdown">
            <input
              type="text"
              inputmode="decimal"
              :value="getNumericValue('padding', 'left')"
              placeholder="0"
              class="flex-1 min-w-0 px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-l-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
              @input="updateValue('padding', 'left', ($event.target as HTMLInputElement).value)"
              @keydown="handleKeydown($event, 'padding', 'left')"
            />
            <div class="relative">
              <button
                type="button"
                class="h-full flex items-center gap-0.5 px-1.5 border border-l-0 border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded-r-md transition-colors cursor-pointer"
                @click.stop="toggleDropdown('padding-left')"
              >
                <span>{{ getUnit('padding', 'left') }}</span>
                <Icon name="chevron-down" :size="8" class="transition-transform" :class="{ 'rotate-180': openDropdown === 'padding-left' }" />
              </button>
              <div
                v-if="openDropdown === 'padding-left'"
                class="absolute top-full right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-14"
              >
                <button
                  v-for="unit in units"
                  :key="unit"
                  type="button"
                  class="w-full px-2 py-1 text-[10px] font-mono text-left hover:bg-accent transition-colors"
                  :class="getUnit('padding', 'left') === unit ? 'text-primary' : 'text-foreground'"
                  @click="updateUnit('padding', 'left', unit)"
                >
                  {{ unit }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Lock button row -->
        <div class="flex justify-center">
          <button
            type="button"
            class="p-0.5 rounded transition-colors"
            :class="paddingLocked
              ? 'text-primary'
              : 'text-muted-foreground/50 hover:text-muted-foreground'"
            :title="paddingLocked ? 'Unlock sides' : 'Lock all sides'"
            @click="paddingLocked = !paddingLocked"
          >
            <Icon :name="paddingLocked ? 'lock' : 'unlock'" :size="10" />
          </button>
        </div>

        <!-- Bottom row: Bottom & Right -->
        <div class="grid grid-cols-2 gap-1">
          <!-- Bottom -->
          <div class="flex unit-dropdown">
            <input
              type="text"
              inputmode="decimal"
              :value="getNumericValue('padding', 'bottom')"
              placeholder="0"
              class="flex-1 min-w-0 px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-l-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
              @input="updateValue('padding', 'bottom', ($event.target as HTMLInputElement).value)"
              @keydown="handleKeydown($event, 'padding', 'bottom')"
            />
            <div class="relative">
              <button
                type="button"
                class="h-full flex items-center gap-0.5 px-1.5 border border-l-0 border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded-r-md transition-colors cursor-pointer"
                @click.stop="toggleDropdown('padding-bottom')"
              >
                <span>{{ getUnit('padding', 'bottom') }}</span>
                <Icon name="chevron-down" :size="8" class="transition-transform" :class="{ 'rotate-180': openDropdown === 'padding-bottom' }" />
              </button>
              <div
                v-if="openDropdown === 'padding-bottom'"
                class="absolute top-full right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-14"
              >
                <button
                  v-for="unit in units"
                  :key="unit"
                  type="button"
                  class="w-full px-2 py-1 text-[10px] font-mono text-left hover:bg-accent transition-colors"
                  :class="getUnit('padding', 'bottom') === unit ? 'text-primary' : 'text-foreground'"
                  @click="updateUnit('padding', 'bottom', unit)"
                >
                  {{ unit }}
                </button>
              </div>
            </div>
          </div>
          <!-- Right -->
          <div class="flex unit-dropdown">
            <input
              type="text"
              inputmode="decimal"
              :value="getNumericValue('padding', 'right')"
              placeholder="0"
              class="flex-1 min-w-0 px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-l-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
              @input="updateValue('padding', 'right', ($event.target as HTMLInputElement).value)"
              @keydown="handleKeydown($event, 'padding', 'right')"
            />
            <div class="relative">
              <button
                type="button"
                class="h-full flex items-center gap-0.5 px-1.5 border border-l-0 border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded-r-md transition-colors cursor-pointer"
                @click.stop="toggleDropdown('padding-right')"
              >
                <span>{{ getUnit('padding', 'right') }}</span>
                <Icon name="chevron-down" :size="8" class="transition-transform" :class="{ 'rotate-180': openDropdown === 'padding-right' }" />
              </button>
              <div
                v-if="openDropdown === 'padding-right'"
                class="absolute top-full right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-14"
              >
                <button
                  v-for="unit in units"
                  :key="unit"
                  type="button"
                  class="w-full px-2 py-1 text-[10px] font-mono text-left hover:bg-accent transition-colors"
                  :class="getUnit('padding', 'right') === unit ? 'text-primary' : 'text-foreground'"
                  @click="updateUnit('padding', 'right', unit)"
                >
                  {{ unit }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Margin -->
    <div class="space-y-1">
      <span class="text-xs font-medium text-foreground">Margin</span>
      <div class="flex flex-col gap-0.5">
        <!-- Top row: Top & Left -->
        <div class="grid grid-cols-2 gap-1">
          <!-- Top -->
          <div class="flex unit-dropdown">
            <input
              type="text"
              inputmode="decimal"
              :value="getNumericValue('margin', 'top')"
              placeholder="0"
              class="flex-1 min-w-0 px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-l-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
              @input="updateValue('margin', 'top', ($event.target as HTMLInputElement).value)"
              @keydown="handleKeydown($event, 'margin', 'top')"
            />
            <div class="relative">
              <button
                type="button"
                class="h-full flex items-center gap-0.5 px-1.5 border border-l-0 border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded-r-md transition-colors cursor-pointer"
                @click.stop="toggleDropdown('margin-top')"
              >
                <span>{{ getUnit('margin', 'top') }}</span>
                <Icon name="chevron-down" :size="8" class="transition-transform" :class="{ 'rotate-180': openDropdown === 'margin-top' }" />
              </button>
              <div
                v-if="openDropdown === 'margin-top'"
                class="absolute top-full right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-14"
              >
                <button
                  v-for="unit in units"
                  :key="unit"
                  type="button"
                  class="w-full px-2 py-1 text-[10px] font-mono text-left hover:bg-accent transition-colors"
                  :class="getUnit('margin', 'top') === unit ? 'text-primary' : 'text-foreground'"
                  @click="updateUnit('margin', 'top', unit)"
                >
                  {{ unit }}
                </button>
              </div>
            </div>
          </div>
          <!-- Left -->
          <div class="flex unit-dropdown">
            <input
              type="text"
              inputmode="decimal"
              :value="getNumericValue('margin', 'left')"
              placeholder="0"
              class="flex-1 min-w-0 px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-l-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
              @input="updateValue('margin', 'left', ($event.target as HTMLInputElement).value)"
              @keydown="handleKeydown($event, 'margin', 'left')"
            />
            <div class="relative">
              <button
                type="button"
                class="h-full flex items-center gap-0.5 px-1.5 border border-l-0 border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded-r-md transition-colors cursor-pointer"
                @click.stop="toggleDropdown('margin-left')"
              >
                <span>{{ getUnit('margin', 'left') }}</span>
                <Icon name="chevron-down" :size="8" class="transition-transform" :class="{ 'rotate-180': openDropdown === 'margin-left' }" />
              </button>
              <div
                v-if="openDropdown === 'margin-left'"
                class="absolute top-full right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-14"
              >
                <button
                  v-for="unit in units"
                  :key="unit"
                  type="button"
                  class="w-full px-2 py-1 text-[10px] font-mono text-left hover:bg-accent transition-colors"
                  :class="getUnit('margin', 'left') === unit ? 'text-primary' : 'text-foreground'"
                  @click="updateUnit('margin', 'left', unit)"
                >
                  {{ unit }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Lock button row -->
        <div class="flex justify-center">
          <button
            type="button"
            class="p-0.5 rounded transition-colors"
            :class="marginLocked
              ? 'text-primary'
              : 'text-muted-foreground/50 hover:text-muted-foreground'"
            :title="marginLocked ? 'Unlock sides' : 'Lock all sides'"
            @click="marginLocked = !marginLocked"
          >
            <Icon :name="marginLocked ? 'lock' : 'unlock'" :size="10" />
          </button>
        </div>

        <!-- Bottom row: Bottom & Right -->
        <div class="grid grid-cols-2 gap-1">
          <!-- Bottom -->
          <div class="flex unit-dropdown">
            <input
              type="text"
              inputmode="decimal"
              :value="getNumericValue('margin', 'bottom')"
              placeholder="0"
              class="flex-1 min-w-0 px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-l-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
              @input="updateValue('margin', 'bottom', ($event.target as HTMLInputElement).value)"
              @keydown="handleKeydown($event, 'margin', 'bottom')"
            />
            <div class="relative">
              <button
                type="button"
                class="h-full flex items-center gap-0.5 px-1.5 border border-l-0 border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded-r-md transition-colors cursor-pointer"
                @click.stop="toggleDropdown('margin-bottom')"
              >
                <span>{{ getUnit('margin', 'bottom') }}</span>
                <Icon name="chevron-down" :size="8" class="transition-transform" :class="{ 'rotate-180': openDropdown === 'margin-bottom' }" />
              </button>
              <div
                v-if="openDropdown === 'margin-bottom'"
                class="absolute top-full right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-14"
              >
                <button
                  v-for="unit in units"
                  :key="unit"
                  type="button"
                  class="w-full px-2 py-1 text-[10px] font-mono text-left hover:bg-accent transition-colors"
                  :class="getUnit('margin', 'bottom') === unit ? 'text-primary' : 'text-foreground'"
                  @click="updateUnit('margin', 'bottom', unit)"
                >
                  {{ unit }}
                </button>
              </div>
            </div>
          </div>
          <!-- Right -->
          <div class="flex unit-dropdown">
            <input
              type="text"
              inputmode="decimal"
              :value="getNumericValue('margin', 'right')"
              placeholder="0"
              class="flex-1 min-w-0 px-2 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-l-md text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
              @input="updateValue('margin', 'right', ($event.target as HTMLInputElement).value)"
              @keydown="handleKeydown($event, 'margin', 'right')"
            />
            <div class="relative">
              <button
                type="button"
                class="h-full flex items-center gap-0.5 px-1.5 border border-l-0 border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded-r-md transition-colors cursor-pointer"
                @click.stop="toggleDropdown('margin-right')"
              >
                <span>{{ getUnit('margin', 'right') }}</span>
                <Icon name="chevron-down" :size="8" class="transition-transform" :class="{ 'rotate-180': openDropdown === 'margin-right' }" />
              </button>
              <div
                v-if="openDropdown === 'margin-right'"
                class="absolute top-full right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 py-1 min-w-14"
              >
                <button
                  v-for="unit in units"
                  :key="unit"
                  type="button"
                  class="w-full px-2 py-1 text-[10px] font-mono text-left hover:bg-accent transition-colors"
                  :class="getUnit('margin', 'right') === unit ? 'text-primary' : 'text-foreground'"
                  @click="updateUnit('margin', 'right', unit)"
                >
                  {{ unit }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
