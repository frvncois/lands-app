<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useModal } from './useModal'
import { MODAL_SIZES, Z_INDEX, BACKDROP_CLASSES, MODAL_TRANSITIONS } from './modal.constants'
import type { ModalProps } from './modal.types'

const props = withDefaults(defineProps<ModalProps>(), {
  size: 'md',
  variant: 'default',
  position: 'center',
  backdrop: 'default',
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  persistent: false,
  scrollBehavior: 'inside',
  title: undefined,
  description: undefined,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const openRef = toRef(props, 'open')

const { close, handleBackdropClick } = useModal(openRef, {
  closeOnEscape: props.closeOnEscape,
  closeOnBackdrop: props.closeOnBackdrop,
  persistent: props.persistent,
  onClose: () => {
    emit('update:open', false)
    emit('close')
  },
})

const sizeClass = computed(() => MODAL_SIZES[props.size] || MODAL_SIZES.md)
const backdropClass = computed(() => BACKDROP_CLASSES[props.backdrop] || BACKDROP_CLASSES.default)

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top':
      return 'items-start pt-[10vh]'
    case 'bottom-right':
      return 'items-end justify-end p-6'
    case 'bottom-left':
      return 'items-end justify-start p-6'
    default:
      return 'items-center justify-center'
  }
})

const modalClasses = computed(() => {
  const base = 'relative bg-card border border-border shadow-xl w-full'
  const radius = props.variant === 'fullscreen' ? '' : 'rounded-lg'
  const scroll = props.scrollBehavior === 'inside' ? 'max-h-[90vh] flex flex-col' : ''

  return [base, radius, sizeClass.value, scroll].filter(Boolean).join(' ')
})
</script>

<template>
  <Teleport to="body">
    <Transition v-bind="MODAL_TRANSITIONS.backdrop">
      <div
        v-if="open"
        class="fixed inset-0 flex p-4"
        :class="positionClasses"
        :style="{ zIndex: Z_INDEX.modal }"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
        :aria-describedby="description ? 'modal-description' : undefined"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0"
          :class="backdropClass"
          :style="{ zIndex: Z_INDEX.modalBackdrop }"
          @click="handleBackdropClick"
        />

        <!-- Modal -->
        <Transition v-bind="MODAL_TRANSITIONS.modal">
          <div
            v-if="open"
            :class="modalClasses"
            :style="{ zIndex: Z_INDEX.modal }"
          >
            <!-- Close button -->
            <button
              v-if="closable && !persistent"
              type="button"
              class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors z-10"
              aria-label="Close modal"
              @click="close"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <!-- Header -->
            <div
              v-if="$slots.header || title"
              class="px-6 pt-6 pb-0 shrink-0"
            >
              <slot name="header">
                <div v-if="title">
                  <h2
                    id="modal-title"
                    class="text-lg font-semibold text-foreground pr-8"
                  >
                    {{ title }}
                  </h2>
                  <p
                    v-if="description"
                    id="modal-description"
                    class="text-sm text-muted-foreground mt-1"
                  >
                    {{ description }}
                  </p>
                </div>
              </slot>
            </div>

            <!-- Content -->
            <div
              class="p-6"
              :class="{ 'flex-1 overflow-y-auto': scrollBehavior === 'inside' }"
            >
              <slot />
            </div>

            <!-- Footer -->
            <div
              v-if="$slots.footer"
              class="px-6 pb-6 pt-0 flex items-center justify-end gap-3 shrink-0"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
