import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseModalOptions {
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
  lockScroll?: boolean
  persistent?: boolean
  onClose?: () => void
  onOpen?: () => void
}

export function useModal(
  isOpen: Ref<boolean>,
  options: UseModalOptions = {}
) {
  const {
    closeOnEscape = true,
    closeOnBackdrop = true,
    lockScroll = true,
    persistent = false,
    onClose,
    onOpen,
  } = options

  const isClosing = ref(false)

  function close() {
    if (persistent || isClosing.value) return
    isClosing.value = true
    isOpen.value = false
    onClose?.()
    // Reset closing state after transition
    setTimeout(() => {
      isClosing.value = false
    }, 200)
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && closeOnEscape && isOpen.value && !persistent) {
      event.preventDefault()
      close()
    }
  }

  function handleBackdropClick() {
    if (closeOnBackdrop && !persistent) {
      close()
    }
  }

  // Scroll lock management
  watch(isOpen, (open) => {
    if (lockScroll) {
      if (open) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
        document.body.style.overflow = 'hidden'
        document.body.style.paddingRight = `${scrollbarWidth}px`
        onOpen?.()
      } else {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }
    }
  })

  // Event listeners
  onMounted(() => {
    document.addEventListener('keydown', handleEscape)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
    // Cleanup scroll lock on unmount
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  })

  return {
    close,
    handleBackdropClick,
    isClosing,
  }
}

/**
 * Helper to create a modal state with v-model support
 */
export function useModalState(initialValue = false) {
  const isOpen = ref(initialValue)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
