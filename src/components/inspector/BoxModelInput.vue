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

type Side = 'top' | 'right' | 'bottom' | 'left'
type BoxType = 'margin' | 'padding'

const sides: Side[] = ['top', 'right', 'bottom', 'left']

// Unit selection
const selectedUnit = ref('px')
const isUnitDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const units = [
  { value: 'px', label: 'px' },
  { value: '%', label: '%' },
  { value: 'em', label: 'em' },
  { value: 'rem', label: 'rem' },
  { value: 'vh', label: 'vh' },
  { value: 'vw', label: 'vw' },
]

// Editing state
const editingField = ref<string | null>(null)
const editValue = ref('')

function parseValue(val: string | undefined): { num: number; unit: string; isAuto: boolean } {
  if (!val) return { num: 0, unit: 'px', isAuto: false }
  if (val.toLowerCase() === 'auto') return { num: 0, unit: 'auto', isAuto: true }
  const match = val.match(/^(-?\d*\.?\d*)(px|%|em|rem|vh|vw|svh|svw|ch)?$/i)
  if (match) {
    return {
      num: parseFloat(match[1] || '0') || 0,
      unit: match[2]?.toLowerCase() || 'px',
      isAuto: false
    }
  }
  return { num: parseFloat(val) || 0, unit: 'px', isAuto: false }
}

function getRawValue(type: BoxType, side: Side): string {
  const spacing = type === 'margin' ? props.margin : props.padding
  return spacing?.[side] || ''
}

function getNumericValue(type: BoxType, side: Side): number {
  const raw = getRawValue(type, side)
  return parseValue(raw).num
}

function isAutoValue(type: BoxType, side: Side): boolean {
  const raw = getRawValue(type, side)
  return parseValue(raw).isAuto
}

function getDisplayValue(type: BoxType, side: Side): string {
  const raw = getRawValue(type, side)
  if (!raw) return '0'
  const { num, unit, isAuto } = parseValue(raw)
  if (isAuto) return 'auto'
  // Show unit suffix only if not px
  return unit === 'px' ? String(num) : `${num}${unit}`
}

function updateValueRaw(type: BoxType, side: Side, value: string) {
  const spacing = type === 'margin' ? props.margin : props.padding
  const updated = { ...spacing, [side]: value }
  if (type === 'margin') {
    emit('update:margin', updated)
  } else {
    emit('update:padding', updated)
  }
}

function updateValue(type: BoxType, side: Side, value: number) {
  updateValueRaw(type, side, `${value}${selectedUnit.value}`)
}

function updateAllSides(type: BoxType, value: number) {
  const spacing = type === 'margin' ? props.margin : props.padding
  const unit = selectedUnit.value
  const updated = {
    ...spacing,
    top: `${value}${unit}`,
    right: `${value}${unit}`,
    bottom: `${value}${unit}`,
    left: `${value}${unit}`,
  }
  if (type === 'margin') {
    emit('update:margin', updated)
  } else {
    emit('update:padding', updated)
  }
}

function startEdit(type: BoxType, side: Side) {
  const raw = getRawValue(type, side)
  if (raw.toLowerCase() === 'auto') {
    editValue.value = 'auto'
  } else {
    editValue.value = String(getNumericValue(type, side))
  }
  editingField.value = `${type}-${side}`
}

function commitEdit(type: BoxType, side: Side) {
  const val = editValue.value.trim().toLowerCase()
  if (val === 'auto' && type === 'margin') {
    updateValueRaw(type, side, 'auto')
  } else {
    updateValue(type, side, parseFloat(editValue.value) || 0)
  }
  editingField.value = null
}

function handleKeydown(e: KeyboardEvent, type: BoxType, side: Side) {
  if (e.key === 'Enter') commitEdit(type, side)
  else if (e.key === 'Escape') editingField.value = null
}

// Drag to adjust
const dragState = ref<{ type: BoxType; side: Side; startVal: number; startPos: number } | null>(null)

function startDrag(e: MouseEvent, type: BoxType, side: Side) {
  if (editingField.value) return
  e.preventDefault()
  const isVertical = side === 'top' || side === 'bottom'
  dragState.value = {
    type,
    side,
    startVal: getNumericValue(type, side),
    startPos: isVertical ? e.clientY : e.clientX,
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!dragState.value) return
  const { type, side, startVal, startPos } = dragState.value
  const isVertical = side === 'top' || side === 'bottom'
  const currentPos = isVertical ? e.clientY : e.clientX
  const delta = Math.round((isVertical ? startPos - currentPos : currentPos - startPos) / 2)
  const min = type === 'margin' ? -200 : 0
  const newValue = Math.max(min, Math.min(200, startVal + delta))

  // If SHIFT is held, apply to all 4 sides
  if (e.shiftKey) {
    updateAllSides(type, newValue)
  } else {
    updateValue(type, side, newValue)
  }
}

function stopDrag() {
  dragState.value = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isUnitDropdownOpen.value = false
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
  <div class="space-y-3">
    <!-- Unit Selector Header -->
    <div ref="dropdownRef" class="relative flex items-center justify-between">
      <span class="text-xs text-sidebar-foreground/70">Unit</span>
      <button
        type="button"
        class="flex items-center gap-1 px-2 py-1 text-xs bg-sidebar-accent border border-sidebar-border rounded text-sidebar-foreground hover:bg-sidebar-accent/75 transition-colors"
        @click="isUnitDropdownOpen = !isUnitDropdownOpen"
      >
        <span class="font-medium">{{ selectedUnit }}</span>
        <Icon
          name="chevron-down"
          :size="10"
          class="text-sidebar-foreground/50 transition-transform"
          :class="{ 'rotate-180': isUnitDropdownOpen }"
        />
      </button>

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isUnitDropdownOpen"
          class="absolute top-full right-0 mt-1 bg-sidebar-background border border-sidebar-border rounded-lg shadow-lg z-50 p-1 origin-top-right min-w-20"
        >
          <button
            v-for="unit in units"
            :key="unit.value"
            type="button"
            class="w-full flex items-center px-2.5 py-1.5 text-xs rounded-md transition-colors"
            :class="[
              unit.value === selectedUnit
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            ]"
            @click="selectedUnit = unit.value; isUnitDropdownOpen = false"
          >
            {{ unit.label }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- Box Model Visual -->
    <div class="select-none">
      <!-- Margin box (outer) -->
      <div class="relative border border-sidebar-border rounded-lg bg-sidebar-accent p-1.5">
        <span class="absolute top-1 left-1.5 text-[8px] text-sidebar-foreground/50 uppercase">Margin</span>

        <!-- Margin inputs -->
        <template v-for="side in sides" :key="`margin-${side}`">
          <div
            class="absolute flex items-center justify-center"
            :class="{
              'left-1/2 -translate-x-1/2 top-0.5': side === 'top',
              'right-0.5 top-1/2 -translate-y-1/2': side === 'right',
              'left-1/2 -translate-x-1/2 bottom-0.5': side === 'bottom',
              'left-0.5 top-1/2 -translate-y-1/2': side === 'left',
            }"
          >
            <input
              v-if="editingField === `margin-${side}`"
              v-model="editValue"
              type="text"
              class="w-7 h-4 text-center text-[9px] bg-sidebar-background border border-sidebar-border rounded focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
              @blur="commitEdit('margin', side)"
              @keydown="handleKeydown($event, 'margin', side)"
              autofocus
            />
            <button
              v-else
              class="min-w-5 px-1 py-px text-[9px] rounded transition-colors"
              :class="[
                side === 'top' || side === 'bottom' ? 'cursor-ns-resize' : 'cursor-ew-resize',
                getNumericValue('margin', side) !== 0 ? 'text-sidebar-primary font-medium' : 'text-sidebar-foreground/50 hover:text-sidebar-foreground'
              ]"
              @click="startEdit('margin', side)"
              @mousedown.prevent="startDrag($event, 'margin', side)"
            >
              {{ getDisplayValue('margin', side) }}
            </button>
          </div>
        </template>

        <!-- Padding box (inner) -->
        <div class="relative border border-sidebar-border rounded bg-sidebar-background mx-5 my-4 p-1">
          <span class="absolute top-0.5 left-1.5 text-[8px] text-sidebar-foreground/50 uppercase">Padding</span>

          <!-- Padding inputs -->
          <template v-for="side in sides" :key="`padding-${side}`">
            <div
              class="absolute flex items-center justify-center"
              :class="{
                'left-1/2 -translate-x-1/2 top-0': side === 'top',
                'right-0 top-1/2 -translate-y-1/2': side === 'right',
                'left-1/2 -translate-x-1/2 bottom-0': side === 'bottom',
                'left-0 top-1/2 -translate-y-1/2': side === 'left',
              }"
            >
              <input
                v-if="editingField === `padding-${side}`"
                v-model="editValue"
                type="text"
                class="w-7 h-4 text-center text-[9px] bg-sidebar-background border border-sidebar-border rounded focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
                @blur="commitEdit('padding', side)"
                @keydown="handleKeydown($event, 'padding', side)"
                autofocus
              />
              <button
                v-else
                class="min-w-5 px-1 py-px text-[9px] rounded transition-colors"
                :class="[
                  side === 'top' || side === 'bottom' ? 'cursor-ns-resize' : 'cursor-ew-resize',
                  getNumericValue('padding', side) !== 0 ? 'text-sidebar-primary font-medium' : 'text-sidebar-foreground/50 hover:text-sidebar-foreground'
                ]"
                @click="startEdit('padding', side)"
                @mousedown.prevent="startDrag($event, 'padding', side)"
              >
                {{ getDisplayValue('padding', side) }}
              </button>
            </div>
          </template>

          <!-- Content box (center) -->
          <div class="h-6 mx-5 my-3 border border-dashed border-sidebar-border rounded flex items-center justify-center">
            <span class="text-[8px] text-sidebar-foreground/40">Content</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
