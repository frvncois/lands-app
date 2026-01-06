<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useModal } from './useModal'
import { Z_INDEX, MODAL_TRANSITIONS } from './modal.constants'
import type { FloatingPanelProps } from './modal.types'

const props = withDefaults(defineProps<FloatingPanelProps>(), {
  position: 'bottom-right',
  width: '380px',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const openRef = toRef(props, 'open')

const { close } = useModal(openRef, {
  lockScroll: false,
  onClose: () => {
    emit('update:open', false)
    emit('close')
  },
})

const positionClasses = computed(() => {
  switch (props.position) {
    case 'bottom-left':
      return 'bottom-6 left-6'
    case 'bottom-right':
    default:
      return 'bottom-6 right-6'
  }
})

defineExpose({ close })
</script>

<template>
  <Teleport to="body">
    <Transition v-bind="MODAL_TRANSITIONS.floating">
      <div
        v-if="open"
        class="fixed bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        :class="positionClasses"
        :style="{ width, maxHeight: 'calc(100vh - 100px)', zIndex: Z_INDEX.modal }"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </Teleport>
</template>
