import { ref, onMounted, onUnmounted } from 'vue'

const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  const isMobile = ref(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  )

  function onResize() {
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
  }

  onMounted(() => window.addEventListener('resize', onResize, { passive: true }))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  return { isMobile }
}
