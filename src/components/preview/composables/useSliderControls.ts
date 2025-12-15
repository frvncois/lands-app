import { ref, onUnmounted } from 'vue'
import type { SectionBlock, GridSettings } from '@/types/editor'

/**
 * Composable for managing slider/carousel state and controls
 * Used by Grid blocks in slider mode
 */
export function useSliderControls() {
  // Refs to slider containers
  const sliderRefs = new Map<string, HTMLElement | null>()

  // Current slide index per slider
  const sliderCurrentIndex = ref(new Map<string, number>())

  // Autoplay intervals per slider
  const sliderAutoplayIntervals = new Map<string, ReturnType<typeof setInterval>>()

  // Pause state per slider
  const sliderIsPaused = ref(new Map<string, boolean>())

  /**
   * Register a slider element reference
   */
  function registerSlider(blockId: string, element: HTMLElement | null) {
    if (element) {
      sliderRefs.set(blockId, element)
    } else {
      sliderRefs.delete(blockId)
    }
  }

  /**
   * Navigate to previous slide
   */
  function prev(block: SectionBlock) {
    if (block.type !== 'grid') return

    const container = sliderRefs.get(block.id)
    if (!container) return

    const settings = block.settings as GridSettings
    const slidesPerView = settings.slidesPerView || 1
    const gap = parseFloat(settings.gap || '16')
    const childCount = block.children?.length || 1
    const slideWidth = (container.scrollWidth - (childCount - 1) * gap) / childCount

    const currentIdx = sliderCurrentIndex.value.get(block.id) || 0
    const maxIdx = childCount - slidesPerView
    const newIdx = settings.loop
      ? (currentIdx - 1 + maxIdx + 1) % (maxIdx + 1)
      : Math.max(0, currentIdx - 1)

    sliderCurrentIndex.value.set(block.id, newIdx)
    container.scrollTo({ left: newIdx * (slideWidth + gap), behavior: 'smooth' })
  }

  /**
   * Navigate to next slide
   */
  function next(block: SectionBlock) {
    if (block.type !== 'grid') return

    const container = sliderRefs.get(block.id)
    if (!container) return

    const settings = block.settings as GridSettings
    const slidesPerView = settings.slidesPerView || 1
    const gap = parseFloat(settings.gap || '16')
    const childCount = block.children?.length || 1
    const slideWidth = (container.scrollWidth - (childCount - 1) * gap) / childCount
    const maxIdx = childCount - slidesPerView

    const currentIdx = sliderCurrentIndex.value.get(block.id) || 0
    const newIdx = settings.loop
      ? (currentIdx + 1) % (maxIdx + 1)
      : Math.min(maxIdx, currentIdx + 1)

    sliderCurrentIndex.value.set(block.id, newIdx)
    container.scrollTo({ left: newIdx * (slideWidth + gap), behavior: 'smooth' })
  }

  /**
   * Navigate to specific slide
   */
  function goTo(block: SectionBlock, index: number) {
    if (block.type !== 'grid') return

    const container = sliderRefs.get(block.id)
    if (!container) return

    const settings = block.settings as GridSettings
    const gap = parseFloat(settings.gap || '16')
    const childCount = block.children?.length || 1
    const slideWidth = (container.scrollWidth - (childCount - 1) * gap) / childCount

    sliderCurrentIndex.value.set(block.id, index)
    container.scrollTo({ left: index * (slideWidth + gap), behavior: 'smooth' })
  }

  /**
   * Start autoplay for a slider
   */
  function startAutoplay(block: SectionBlock) {
    if (block.type !== 'grid') return

    const settings = block.settings as GridSettings
    if (!settings.autoplay) return

    // Clear existing interval
    const existingInterval = sliderAutoplayIntervals.get(block.id)
    if (existingInterval) clearInterval(existingInterval)

    const interval = setInterval(() => {
      if (!sliderIsPaused.value.get(block.id)) {
        next(block)
      }
    }, settings.autoplayInterval || 5000)

    sliderAutoplayIntervals.set(block.id, interval)
  }

  /**
   * Stop autoplay for a slider
   */
  function stopAutoplay(blockId: string) {
    const interval = sliderAutoplayIntervals.get(blockId)
    if (interval) {
      clearInterval(interval)
      sliderAutoplayIntervals.delete(blockId)
    }
  }

  /**
   * Pause autoplay on mouse enter
   */
  function handleMouseEnter(blockId: string) {
    sliderIsPaused.value.set(blockId, true)
  }

  /**
   * Resume autoplay on mouse leave
   */
  function handleMouseLeave(blockId: string) {
    sliderIsPaused.value.set(blockId, false)
  }

  /**
   * Get current slide index for a slider
   */
  function getCurrentIndex(blockId: string): number {
    return sliderCurrentIndex.value.get(blockId) || 0
  }

  /**
   * Cleanup all autoplay intervals
   */
  function cleanup() {
    for (const interval of sliderAutoplayIntervals.values()) {
      clearInterval(interval)
    }
    sliderAutoplayIntervals.clear()
  }

  // Cleanup on unmount
  onUnmounted(cleanup)

  return {
    // State
    sliderRefs,
    sliderCurrentIndex,

    // Methods
    registerSlider,
    prev,
    next,
    goTo,
    startAutoplay,
    stopAutoplay,
    handleMouseEnter,
    handleMouseLeave,
    getCurrentIndex,
    cleanup,
  }
}
