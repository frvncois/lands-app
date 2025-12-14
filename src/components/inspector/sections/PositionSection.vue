<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SliderInput from '../SliderInput.vue'
import SelectInput from '../SelectInput.vue'
import { Icon } from '@/components/ui'

const props = defineProps<{
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky'
  zIndex?: number | string
  top?: string
  right?: string
  bottom?: string
  left?: string
}>()

const emit = defineEmits<{
  'update:position': [value: string]
  'update:zIndex': [value: string]
  'update:top': [value: string]
  'update:right': [value: string]
  'update:bottom': [value: string]
  'update:left': [value: string]
}>()

const positionOptions = [
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'sticky', label: 'Sticky' },
]

const showOffsets = computed(() => props.position && props.position !== 'relative')

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

type Side = 'top' | 'right' | 'bottom' | 'left'
const sides: Side[] = ['top', 'right', 'bottom', 'left']

// Editing state
const editingField = ref<Side | null>(null)
const editValue = ref('')

function parseValue(val: string | undefined): { num: number; unit: string } {
  if (!val) return { num: 0, unit: 'px' }
  const match = val.match(/^(-?\d*\.?\d*)(px|%|em|rem|vh|vw|svh|svw|ch)?$/i)
  if (match) {
    return {
      num: parseFloat(match[1] || '0') || 0,
      unit: match[2]?.toLowerCase() || 'px'
    }
  }
  return { num: parseFloat(val) || 0, unit: 'px' }
}

function getRawValue(side: Side): string {
  return props[side] || ''
}

function getNumericValue(side: Side): number {
  const raw = getRawValue(side)
  return parseValue(raw).num
}

function getDisplayValue(side: Side): string {
  const raw = getRawValue(side)
  if (!raw) return 'auto'
  const { num, unit } = parseValue(raw)
  return unit === 'px' ? String(num) : `${num}${unit}`
}

function updateValue(side: Side, value: number) {
  const existingRaw = getRawValue(side)
  const existingUnit = existingRaw ? parseValue(existingRaw).unit : selectedUnit.value
  const updated = `${value}${existingUnit}`
  if (side === 'top') emit('update:top', updated)
  else if (side === 'right') emit('update:right', updated)
  else if (side === 'bottom') emit('update:bottom', updated)
  else emit('update:left', updated)
}

function startEdit(side: Side) {
  editValue.value = String(getNumericValue(side))
  editingField.value = side
}

function commitEdit(side: Side) {
  updateValue(side, parseInt(editValue.value, 10) || 0)
  editingField.value = null
}

function handleKeydown(e: KeyboardEvent, side: Side) {
  if (e.key === 'Enter') commitEdit(side)
  else if (e.key === 'Escape') editingField.value = null
}

// Drag to adjust
const dragState = ref<{ side: Side; startVal: number; startPos: number } | null>(null)

function startDrag(e: MouseEvent, side: Side) {
  if (editingField.value) return
  e.preventDefault()
  const isVertical = side === 'top' || side === 'bottom'
  dragState.value = {
    side,
    startVal: getNumericValue(side),
    startPos: isVertical ? e.clientY : e.clientX,
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!dragState.value) return
  const { side, startVal, startPos } = dragState.value
  const isVertical = side === 'top' || side === 'bottom'
  const currentPos = isVertical ? e.clientY : e.clientX
  const delta = Math.round((isVertical ? startPos - currentPos : currentPos - startPos) / 2)
  const newValue = Math.max(-1000, Math.min(1000, startVal + delta))
  updateValue(side, newValue)
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
  <InspectorSection title="Position" icon="layout-stack">
    <InspectorField label="Type" horizontal>
      <SelectInput
        :model-value="position || 'relative'"
        :options="positionOptions"
        @update:model-value="emit('update:position', $event)"
      />
    </InspectorField>

    <InspectorField label="Z-Index" horizontal>
      <SliderInput
        :model-value="zIndex?.toString() || '0'"
        :min="0"
        :max="100"
        :step="1"
        @update:model-value="emit('update:zIndex', $event)"
      />
    </InspectorField>

    <!-- Visual Offset Box (only for non-relative positions) -->
    <template v-if="showOffsets">
      <div class="px-3 pt-2 space-y-3">
        <!-- Offset box visual -->
        <div class="select-none">
          <div class="relative border border-sidebar-border rounded-lg bg-sidebar-accent p-1.5">
            <span class="absolute top-1 left-1.5 text-[8px] text-sidebar-foreground/50 uppercase">Offset</span>

            <!-- Offset inputs -->
            <template v-for="side in sides" :key="side">
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
                  v-if="editingField === side"
                  v-model="editValue"
                  type="text"
                  class="w-8 h-4 text-center text-[9px] bg-sidebar-background border border-sidebar-border rounded focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
                  @blur="commitEdit(side)"
                  @keydown="handleKeydown($event, side)"
                  autofocus
                />
                <button
                  v-else
                  class="min-w-6 px-1 py-px text-[9px] rounded transition-colors"
                  :class="[
                    side === 'top' || side === 'bottom' ? 'cursor-ns-resize' : 'cursor-ew-resize',
                    getRawValue(side) ? 'text-sidebar-primary font-medium' : 'text-sidebar-foreground/50 hover:text-sidebar-foreground'
                  ]"
                  @click="startEdit(side)"
                  @mousedown.prevent="startDrag($event, side)"
                >
                  {{ getDisplayValue(side) }}
                </button>
              </div>
            </template>

            <!-- Content box (center) -->
            <div class="h-10 mx-6 my-4 border border-dashed border-sidebar-border rounded bg-sidebar-background flex items-center justify-center">
              <span class="text-[8px] text-sidebar-foreground/40">Element</span>
            </div>
          </div>
        </div>

        <!-- Unit Selector -->
        <div ref="dropdownRef" class="relative">
          <button
            type="button"
            class="w-full flex items-center justify-between px-2.5 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/75 transition-colors"
            @click="isUnitDropdownOpen = !isUnitDropdownOpen"
          >
            <span>Unit: <span class="font-medium">{{ selectedUnit }}</span></span>
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
              class="absolute top-full left-0 right-0 mt-1 bg-sidebar-background border border-sidebar-border rounded-lg shadow-lg z-50 p-1 origin-top"
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
      </div>
    </template>
  </InspectorSection>
</template>
