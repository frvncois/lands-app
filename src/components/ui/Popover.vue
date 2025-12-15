<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface Props {
  align?: 'left' | 'right' | 'center'
  position?: 'bottom' | 'top' | 'auto'
  side?: 'left' | 'right' | null // Opens to the side instead of above/below
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  position: 'auto',
  side: null,
  width: 'w-72',
})

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const popoverStyle = ref<Record<string, string>>({})
const actualPosition = ref<'top' | 'bottom'>('bottom')

function open() {
  isOpen.value = true
  nextTick(updatePosition)
}

function close() {
  isOpen.value = false
}

function toggle() {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

function updatePosition() {
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const style: Record<string, string> = {}

  // Handle side positioning (left/right of trigger)
  if (props.side) {
    // Horizontal: to the left or right
    if (props.side === 'left') {
      style.right = `${window.innerWidth - rect.left + 8}px`
    } else {
      style.left = `${rect.right + 8}px`
    }

    // Vertical: align to bottom of viewport if needed
    const popoverHeight = popoverRef.value?.offsetHeight || 300
    const wouldOverflow = rect.top + popoverHeight > window.innerHeight - 16

    if (wouldOverflow) {
      // Align to bottom of viewport
      style.bottom = '16px'
    } else {
      style.top = `${rect.top}px`
    }

    popoverStyle.value = style
    return
  }

  // Estimate popover height (use max expected height for effects popovers)
  const estimatedPopoverHeight = 500

  // Determine position - auto will check if there's space below
  let usePosition: 'top' | 'bottom' = 'bottom'

  if (props.position === 'auto') {
    const spaceBelow = window.innerHeight - rect.bottom - 8
    const spaceAbove = rect.top - 8

    // If not enough space below but more space above, flip to top
    if (spaceBelow < estimatedPopoverHeight && spaceAbove > spaceBelow) {
      usePosition = 'top'
    }
  } else {
    usePosition = props.position
  }

  actualPosition.value = usePosition

  // Vertical position
  if (usePosition === 'top') {
    style.bottom = `${window.innerHeight - rect.top + 8}px`
    style.maxHeight = `${rect.top - 16}px`
  } else {
    style.top = `${rect.bottom + 8}px`
    style.maxHeight = `${window.innerHeight - rect.bottom - 16}px`
  }

  // Horizontal position
  if (props.align === 'right') {
    style.right = `${window.innerWidth - rect.right}px`
  } else if (props.align === 'center') {
    style.left = `${rect.left + rect.width / 2}px`
    style.transform = 'translateX(-50%)'
  } else {
    style.left = `${rect.left}px`
  }

  popoverStyle.value = style
}

function handleClickOutside(event: MouseEvent) {
  // Capture target immediately before any DOM changes
  const target = event.target as Node

  // Skip if clicking inside popover - check immediately
  if (popoverRef.value?.contains(target)) {
    return
  }

  // Skip if clicking on trigger
  if (triggerRef.value?.contains(target)) {
    return
  }

  // Use a delay to handle cases where clicked element gets removed
  setTimeout(() => {
    if (isOpen.value) {
      close()
    }
  }, 0)
}

// Handle ESC key to close popover
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    close()
  }
}

// Update position on scroll/resize
function handleScrollResize() {
  if (isOpen.value) {
    updatePosition()
  }
}

// Stop click propagation inside popover to prevent accidental closes
function handlePopoverClick(event: MouseEvent) {
  event.stopPropagation()
}

onMounted(() => {
  // Use bubble phase (false) so @click.stop works on child elements
  document.addEventListener('click', handleClickOutside, false)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScrollResize, true)
  window.addEventListener('resize', handleScrollResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, false)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScrollResize, true)
  window.removeEventListener('resize', handleScrollResize)
})

defineExpose({ open, close, toggle, isOpen })
</script>

<template>
  <div ref="triggerRef" class="inline-block">
    <slot name="trigger" :toggle="toggle" :is-open="isOpen" :open="open" :close="close" />

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          ref="popoverRef"
          :class="[
            'fixed bg-popover border border-border rounded-xl shadow-xl z-[100] overflow-y-auto',
            width,
            actualPosition === 'top' ? 'origin-bottom' : 'origin-top',
          ]"
          :style="popoverStyle"
          @click.stop
          @mousedown.stop
        >
          <slot :close="close" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
