<script setup lang="ts">
import { ref } from 'vue'
import type { Spacing } from '@/types/editor'

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

// Editing state
const editingField = ref<string | null>(null)
const editValue = ref('')

function getValue(type: BoxType, side: Side): number {
  const spacing = type === 'margin' ? props.margin : props.padding
  return parseInt(spacing?.[side] ?? '0', 10) || 0
}

function updateValue(type: BoxType, side: Side, value: number) {
  const spacing = type === 'margin' ? props.margin : props.padding
  const updated = { ...spacing, [side]: String(value) }
  if (type === 'margin') {
    emit('update:margin', updated)
  } else {
    emit('update:padding', updated)
  }
}

function startEdit(type: BoxType, side: Side) {
  editValue.value = String(getValue(type, side))
  editingField.value = `${type}-${side}`
}

function commitEdit(type: BoxType, side: Side) {
  updateValue(type, side, parseInt(editValue.value, 10) || 0)
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
    startVal: getValue(type, side),
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
  updateValue(type, side, Math.max(min, Math.min(200, startVal + delta)))
}

function stopDrag() {
  dragState.value = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
</script>

<template>
  <div class="select-none">
    <!-- Margin box (outer) -->
    <div class="relative border border-border rounded-lg bg-secondary p-1.5">
      <span class="absolute top-1 left-1.5 text-[8px] text-muted-foreground uppercase">Margin</span>

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
            class="w-7 h-4 text-center text-[9px] bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            @blur="commitEdit('margin', side)"
            @keydown="handleKeydown($event, 'margin', side)"
            autofocus
          />
          <button
            v-else
            class="min-w-5 px-1 py-px text-[9px] rounded transition-colors cursor-ew-resize"
            :class="[
              side === 'top' || side === 'bottom' ? 'cursor-ns-resize' : 'cursor-ew-resize',
              getValue('margin', side) !== 0 ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
            ]"
            @click="startEdit('margin', side)"
            @mousedown.prevent="startDrag($event, 'margin', side)"
          >
            {{ getValue('margin', side) }}
          </button>
        </div>
      </template>

      <!-- Padding box (inner) -->
      <div class="relative border border-border rounded bg-muted/50 mx-5 my-4 p-1">
        <span class="absolute top-0.5 left-1.5 text-[8px] text-muted-foreground uppercase">Padding</span>

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
              class="w-7 h-4 text-center text-[9px] bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              @blur="commitEdit('padding', side)"
              @keydown="handleKeydown($event, 'padding', side)"
              autofocus
            />
            <button
              v-else
              class="min-w-5 px-1 py-px text-[9px] rounded transition-colors"
              :class="[
                side === 'top' || side === 'bottom' ? 'cursor-ns-resize' : 'cursor-ew-resize',
                getValue('padding', side) !== 0 ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
              ]"
              @click="startEdit('padding', side)"
              @mousedown.prevent="startDrag($event, 'padding', side)"
            >
              {{ getValue('padding', side) }}
            </button>
          </div>
        </template>

        <!-- Content box (center) -->
        <div class="h-6 mx-5 my-3 border border-dashed border-border rounded flex items-center justify-center">
          <span class="text-[8px] text-muted-foreground">Content</span>
        </div>
      </div>
    </div>
  </div>
</template>
