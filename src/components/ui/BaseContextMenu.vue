<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import BaseButton from './BaseButton.vue'
import {
  PencilSquareIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  x: number
  y: number
  locked: boolean
  canMoveUp: boolean
  canMoveDown: boolean
}>()

const emit = defineEmits<{
  edit: []
  duplicate: []
  moveUp: []
  moveDown: []
  delete: []
  close: []
}>()

const menuRef = ref<HTMLElement | null>(null)
const adjustedX = ref(props.x)
const adjustedY = ref(props.y)

onMounted(() => {
  const el = menuRef.value
  if (el) {
    const rect = el.getBoundingClientRect()
    if (props.x + rect.width > window.innerWidth) adjustedX.value = props.x - rect.width
    if (props.y + rect.height > window.innerHeight) adjustedY.value = props.y - rect.height
  }

  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

const btnClass = 'w-full !justify-start'
</script>

<template>
  <div class="fixed inset-0 z-50" @mousedown="$emit('close')" @contextmenu.prevent>
    <div
      ref="menuRef"
      class="absolute bg-white border border-gray-200 rounded-xl shadow-xl/10 p-1 flex flex-col min-w-40"
      :style="{ left: `${adjustedX}px`, top: `${adjustedY}px` }"
      @mousedown.stop
    >
      <BaseButton size="sm" :class="btnClass" @click="$emit('edit'); $emit('close')">
        <PencilSquareIcon class="h-3.5 w-3.5" /> Edit
      </BaseButton>

      <template v-if="!locked">
        <BaseButton size="sm" :class="btnClass" @click="$emit('duplicate'); $emit('close')">
          <DocumentDuplicateIcon class="h-3.5 w-3.5" /> Duplicate
        </BaseButton>
        <BaseButton size="sm" :class="btnClass" :disabled="!canMoveUp" @click="$emit('moveUp'); $emit('close')">
          <ArrowUpIcon class="h-3.5 w-3.5" /> Move up
        </BaseButton>
        <BaseButton size="sm" :class="btnClass" :disabled="!canMoveDown" @click="$emit('moveDown'); $emit('close')">
          <ArrowDownIcon class="h-3.5 w-3.5" /> Move down
        </BaseButton>

        <div class="my-1 border-t border-gray-100" />

        <BaseButton size="sm" :class="btnClass" class="!text-red-500 hover:!bg-red-50" @click="$emit('delete'); $emit('close')">
          <TrashIcon class="h-3.5 w-3.5" /> Delete
        </BaseButton>
      </template>
    </div>
  </div>
</template>
