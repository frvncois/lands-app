/**
 * useScrollAnimations - JS fallback for CSS scroll-driven animations
 *
 * Provides smooth scroll-based animations for browsers that don't support
 * CSS scroll-driven animations (animation-timeline: scroll()/view()).
 */

import { ref, onUnmounted, type Ref } from 'vue'
import type { Interaction, InteractionStyles } from '@/types/editor'
import { supportsScrollDrivenAnimations } from '@/lib/interaction-utils'

export interface ScrollAnimationEntry {
  interaction: Interaction
  element: HTMLElement
  lastProgress: number
}

export interface UseScrollAnimationsOptions {
  /** Optional scroll container (defaults to window/document) */
  scrollContainer?: HTMLElement | null
  /** Force JS mode even if CSS is supported (useful for nested scroll containers) */
  forceJS?: boolean
}

/**
 * Get page scroll progress (0 = top, 1 = bottom)
 * @param scrollContainer Optional scroll container element (defaults to document)
 */
export function getPageScrollProgress(scrollContainer?: HTMLElement | null): number {
  if (typeof window === 'undefined') return 0

  if (scrollContainer) {
    const scrollTop = scrollContainer.scrollTop
    const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight
    if (scrollHeight <= 0) return 0
    return Math.max(0, Math.min(1, scrollTop / scrollHeight))
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight

  if (scrollHeight <= 0) return 0
  return Math.max(0, Math.min(1, scrollTop / scrollHeight))
}

/**
 * Get element visibility progress based on viewport position
 * 0 = element just entering viewport (bottom)
 * 1 = element just leaving viewport (top)
 * @param element The target element
 * @param scrollContainer Optional scroll container element (defaults to window viewport)
 */
export function getElementVisibilityProgress(element: HTMLElement, scrollContainer?: HTMLElement | null): number {
  if (typeof window === 'undefined') return 0

  const rect = element.getBoundingClientRect()

  // Get the viewport/container dimensions
  let viewportTop = 0
  let viewportHeight = window.innerHeight

  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect()
    viewportTop = containerRect.top
    viewportHeight = containerRect.height
  }

  // Adjust rect relative to container
  const relativeTop = rect.top - viewportTop
  const relativeBottom = rect.bottom - viewportTop

  // Element is below viewport
  if (relativeTop >= viewportHeight) return 0

  // Element is above viewport
  if (relativeBottom <= 0) return 1

  // Calculate progress based on element's center position
  const elementCenter = relativeTop + rect.height / 2

  // Progress: 0 when entering (bottom), 0.5 when centered, 1 when leaving (top)
  // Map from [viewportHeight, 0] to [0, 1]
  const progress = 1 - (elementCenter / viewportHeight)

  return Math.max(0, Math.min(1, progress))
}

/**
 * Interpolate between two numeric values
 */
function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress
}

/**
 * Parse a CSS value to extract numeric part and unit
 */
function parseValue(value: string | number | undefined): { num: number; unit: string } | null {
  if (value === undefined || value === null) return null

  const str = String(value)
  const match = str.match(/^(-?[\d.]+)(.*)$/)

  if (!match || match.length < 2) return null

  const numPart = match[1]
  if (!numPart) return null

  return {
    num: parseFloat(numPart),
    unit: match[2] || '',
  }
}

/**
 * Interpolate a CSS value between from and to based on progress
 */
function interpolateValue(
  from: string | number | undefined,
  to: string | number | undefined,
  progress: number
): string | undefined {
  const fromParsed = parseValue(from)
  const toParsed = parseValue(to)

  // If only 'to' exists, fade in from default
  if (!fromParsed && toParsed) {
    return `${toParsed.num}${toParsed.unit}`
  }

  // If only 'from' exists, use it
  if (fromParsed && !toParsed) {
    return `${fromParsed.num}${fromParsed.unit}`
  }

  // If both exist, interpolate
  if (fromParsed && toParsed) {
    const interpolated = interpolate(fromParsed.num, toParsed.num, progress)
    return `${interpolated}${toParsed.unit || fromParsed.unit}`
  }

  return undefined
}

/**
 * Interpolate styles between fromStyles and toStyles based on progress
 */
function interpolateStyles(
  fromStyles: InteractionStyles | undefined,
  toStyles: InteractionStyles,
  progress: number
): Partial<CSSStyleDeclaration> {
  const result: Record<string, string> = {}
  const from = fromStyles || {}

  // Opacity (0-100 or 0-1)
  if (toStyles.opacity !== undefined || from.opacity !== undefined) {
    const fromOpacity = from.opacity !== undefined ? Number(from.opacity) : 100
    const toOpacity = toStyles.opacity !== undefined ? Number(toStyles.opacity) : 100

    // Normalize to 0-1
    const fromNorm = fromOpacity > 1 ? fromOpacity / 100 : fromOpacity
    const toNorm = toOpacity > 1 ? toOpacity / 100 : toOpacity

    result.opacity = String(interpolate(fromNorm, toNorm, progress))
  }

  // Scale
  if (toStyles.scale !== undefined || from.scale !== undefined) {
    const fromScale = from.scale !== undefined ? Number(from.scale) : 1
    const toScale = toStyles.scale !== undefined ? Number(toStyles.scale) : 1
    const scale = interpolate(fromScale, toScale, progress)

    result.transform = result.transform
      ? `${result.transform} scale(${scale})`
      : `scale(${scale})`
  }

  // Rotate
  if (toStyles.rotate !== undefined || from.rotate !== undefined) {
    const fromRotate = from.rotate !== undefined ? parseFloat(String(from.rotate)) : 0
    const toRotate = toStyles.rotate !== undefined ? parseFloat(String(toStyles.rotate)) : 0
    const rotate = interpolate(fromRotate, toRotate, progress)

    result.transform = result.transform
      ? `${result.transform} rotate(${rotate}deg)`
      : `rotate(${rotate}deg)`
  }

  // Translate X/Y
  if (
    toStyles.translateX !== undefined ||
    toStyles.translateY !== undefined ||
    from.translateX !== undefined ||
    from.translateY !== undefined
  ) {
    const fromX = from.translateX !== undefined ? parseFloat(String(from.translateX)) : 0
    const toX = toStyles.translateX !== undefined ? parseFloat(String(toStyles.translateX)) : 0
    const fromY = from.translateY !== undefined ? parseFloat(String(from.translateY)) : 0
    const toY = toStyles.translateY !== undefined ? parseFloat(String(toStyles.translateY)) : 0

    const x = interpolate(fromX, toX, progress)
    const y = interpolate(fromY, toY, progress)

    result.transform = result.transform
      ? `${result.transform} translate(${x}px, ${y}px)`
      : `translate(${x}px, ${y}px)`
  }

  // Background color (no interpolation, snap at 50%)
  if (toStyles.backgroundColor || from.backgroundColor) {
    result.backgroundColor = progress < 0.5
      ? (from.backgroundColor || toStyles.backgroundColor || '')
      : (toStyles.backgroundColor || from.backgroundColor || '')
  }

  // Text color (no interpolation, snap at 50%)
  if (toStyles.color || from.color) {
    result.color = progress < 0.5
      ? (from.color || toStyles.color || '')
      : (toStyles.color || from.color || '')
  }

  // Border
  const fromBorderWidth = from.border?.width
  const toBorderWidth = toStyles.border?.width
  if (fromBorderWidth || toBorderWidth) {
    const interpolated = interpolateValue(fromBorderWidth || '0px', toBorderWidth || '0px', progress)
    if (interpolated) result.borderWidth = interpolated
  }

  const fromRadius = from.border?.radius
  const toRadius = toStyles.border?.radius
  if (fromRadius || toRadius) {
    const interpolated = interpolateValue(fromRadius || '0px', toRadius || '0px', progress)
    if (interpolated) result.borderRadius = interpolated
  }

  // Border color (no interpolation, snap at 50%)
  if (toStyles.border?.color || from.border?.color) {
    result.borderColor = progress < 0.5
      ? (from.border?.color || toStyles.border?.color || '')
      : (toStyles.border?.color || from.border?.color || '')
  }

  // Blur (filter)
  if (toStyles.blur !== undefined || from.blur !== undefined) {
    const fromBlur = from.blur !== undefined ? parseFloat(String(from.blur)) : 0
    const toBlur = toStyles.blur !== undefined ? parseFloat(String(toStyles.blur)) : 0
    const blurValue = interpolate(fromBlur, toBlur, progress)
    result.filter = `blur(${blurValue}px)`
  }

  // Width/Height
  if (toStyles.width || from.width) {
    const interpolated = interpolateValue(from.width, toStyles.width, progress)
    if (interpolated) result.width = interpolated
  }
  if (toStyles.height || from.height) {
    const interpolated = interpolateValue(from.height, toStyles.height, progress)
    if (interpolated) result.height = interpolated
  }

  return result as Partial<CSSStyleDeclaration>
}

/**
 * Apply interpolated styles to an element
 */
function applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  for (const [key, value] of Object.entries(styles)) {
    if (value !== undefined && value !== null) {
      // Use setProperty for safe style assignment
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      element.style.setProperty(cssKey, value as string)
    }
  }
}

/**
 * Calculate progress within a custom range (startOffset to endOffset)
 */
function calculateRangedProgress(
  rawProgress: number,
  startOffset: number = 0,
  endOffset: number = 100
): number {
  const start = startOffset / 100
  const end = endOffset / 100

  if (rawProgress <= start) return 0
  if (rawProgress >= end) return 1

  return (rawProgress - start) / (end - start)
}

export function useScrollAnimations(options: UseScrollAnimationsOptions = {}) {
  // Store options reference to access scrollContainer reactively via getter
  const opts = options
  const forceJS = options.forceJS ?? false

  // Helper to get current scroll container (reactive via getter)
  const getScrollContainer = () => opts.scrollContainer ?? null

  // In editor mode (nested scroll container), always use JS
  // CSS scroll-driven animations don't work properly with nested scroll containers
  const shouldUseJS = forceJS || !supportsScrollDrivenAnimations()
  const isSupported = ref(!shouldUseJS)
  const entries: Ref<ScrollAnimationEntry[]> = ref([])
  const isRunning = ref(false)
  let rafId: number | null = null

  /**
   * Register an element for scroll animation
   */
  function register(interaction: Interaction, element: HTMLElement): void {
    // Skip if CSS is supported and not forced to JS
    if (isSupported.value && !forceJS) return

    // Check if already registered
    const existing = entries.value.find(
      e => e.interaction.id === interaction.id && e.element === element
    )
    if (existing) return

    entries.value.push({
      interaction,
      element,
      lastProgress: -1,
    })

    // Start animation loop if not running
    if (!isRunning.value) {
      startAnimationLoop()
    }
  }

  /**
   * Unregister an element from scroll animation
   */
  function unregister(interactionId: string, element?: HTMLElement): void {
    entries.value = entries.value.filter(e => {
      if (element) {
        return !(e.interaction.id === interactionId && e.element === element)
      }
      return e.interaction.id !== interactionId
    })

    // Stop animation loop if no entries
    if (entries.value.length === 0) {
      stopAnimationLoop()
    }
  }

  /**
   * Update all scroll animations
   */
  function update(): void {
    const currentScrollContainer = getScrollContainer()

    for (const entry of entries.value) {
      const { interaction, element } = entry

      // Get raw progress based on trigger type
      let rawProgress: number
      if (interaction.trigger === 'page-scroll') {
        rawProgress = getPageScrollProgress(currentScrollContainer)
      } else if (interaction.trigger === 'while-scrolling') {
        rawProgress = getElementVisibilityProgress(element, currentScrollContainer)
      } else {
        continue
      }

      // Apply range offsets
      const progress = calculateRangedProgress(
        rawProgress,
        interaction.scrollConfig?.startOffset,
        interaction.scrollConfig?.endOffset
      )

      // Skip if progress hasn't changed significantly
      if (Math.abs(progress - entry.lastProgress) < 0.001) continue
      entry.lastProgress = progress

      // Interpolate and apply styles
      const styles = interpolateStyles(
        interaction.fromStyles,
        interaction.styles,
        progress
      )
      applyStyles(element, styles)
    }
  }

  /**
   * Animation loop using requestAnimationFrame
   */
  function animationLoop(): void {
    update()
    if (isRunning.value) {
      rafId = requestAnimationFrame(animationLoop)
    }
  }

  /**
   * Start the animation loop
   */
  function startAnimationLoop(): void {
    if (isRunning.value) return
    isRunning.value = true
    rafId = requestAnimationFrame(animationLoop)
  }

  /**
   * Stop the animation loop
   */
  function stopAnimationLoop(): void {
    isRunning.value = false
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  /**
   * Clear all registered animations
   */
  function clear(): void {
    entries.value = []
    stopAnimationLoop()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    clear()
  })

  return {
    isSupported,
    entries,
    register,
    unregister,
    update,
    clear,
    getPageScrollProgress,
    getElementVisibilityProgress,
  }
}
