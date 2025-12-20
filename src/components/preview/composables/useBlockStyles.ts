import { computed, type Ref, type ComputedRef } from 'vue'
import type { SectionBlock, BaseBlockStyles, MaskShape, AnimationSettings, ViewportSize, BlockEffects, EffectState, EffectPreset, GradientStop } from '@/types/designer'
import { getResponsiveStyles } from '@/lib/style-utils'
import { maskShapeClipPaths } from '@/lib/designer-utils'
import {
  animationInitialStyleObjects,
  animationFinalStyleObjects,
  getAnimationCSSValue,
} from '@/lib/animation-utils'
import {
  effectStateToCSS,
  interpolateEffectStates,
  getEasingCSS,
  getTransformOriginCSS,
  getPresetConfig,
} from '@/lib/effect-utils'

/**
 * Convert vh units to use --designer-vh CSS variable for accurate preview height
 * This accounts for the header height in the editor
 */
function convertVhToEditorVh(value: string): string {
  if (!value || typeof value !== 'string') return value
  // Match patterns like "100vh", "50vh", "calc(100vh - 20px)"
  return value.replace(/(\d+(?:\.\d+)?)\s*vh/gi, (_, num) => {
    return `calc(${num} * var(--designer-vh, 1vh))`
  })
}

/**
 * Apply opacity to a color value (hex, rgb, rgba, hsl, named colors)
 */
function applyColorOpacity(color: string, opacity: number): string {
  if (opacity >= 100) return color
  const alpha = opacity / 100

  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    let r: number, g: number, b: number
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16)
      g = parseInt(hex[1] + hex[1], 16)
      b = parseInt(hex[2] + hex[2], 16)
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16)
      g = parseInt(hex.slice(2, 4), 16)
      b = parseInt(hex.slice(4, 6), 16)
    } else {
      return color
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbMatch) {
    const r = rgbMatch[1]
    const g = rgbMatch[2]
    const b = rgbMatch[3]
    const existingAlpha = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
    return `rgba(${r}, ${g}, ${b}, ${existingAlpha * alpha})`
  }

  // Handle hsl/hsla
  const hslMatch = color.match(/hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*([\d.]+))?\)/)
  if (hslMatch) {
    const h = hslMatch[1]
    const s = hslMatch[2]
    const l = hslMatch[3]
    const existingAlpha = hslMatch[4] ? parseFloat(hslMatch[4]) : 1
    return `hsla(${h}, ${s}%, ${l}%, ${existingAlpha * alpha})`
  }

  // For named colors or unknown formats, wrap in rgba using CSS color-mix
  return `color-mix(in srgb, ${color} ${opacity}%, transparent)`
}

/**
 * Get the "from" state for an effect, applying preset if set
 */
function getEffectFromState(effect: { from?: EffectState; preset?: EffectPreset }): EffectState {
  if (effect.preset && effect.preset !== 'custom') {
    const presetConfig = getPresetConfig(effect.preset)
    return { ...presetConfig.from, ...effect.from }
  }
  return effect.from || {}
}

/**
 * Get the "to" state for an effect, applying preset if set
 */
function getEffectToState(effect: { to?: EffectState; preset?: EffectPreset }): EffectState {
  if (effect.preset && effect.preset !== 'custom') {
    const presetConfig = getPresetConfig(effect.preset)
    return { ...presetConfig.to, ...effect.to }
  }
  return effect.to || {}
}

// Tailwind font size to pixel mapping
const fontSizeMap: Record<string, string> = {
  'xs': '12px',
  'sm': '14px',
  'base': '16px',
  'lg': '18px',
  'xl': '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
  '6xl': '60px',
}

/**
 * Convert px value to em (based on 16px base)
 * Preserves non-px units (%, em, rem, vh, vw, etc.)
 */
export function pxToEm(value: string | number): string {
  if (typeof value === 'number') {
    if (value === 0) return '0'
    return `${value / 16}em`
  }
  // If value already has a non-px unit, return as-is
  if (/%|em|rem|vh|vw|svh|svw|ch|vmin|vmax/.test(value)) {
    return value
  }
  // Parse px value or plain number
  const px = parseFloat(value)
  if (isNaN(px) || px === 0) return '0'
  return `${px / 16}em`
}

/**
 * Helper to convert height value to CSS
 */
function getHeightStyle(height?: string): string | undefined {
  if (!height || height === 'auto' || height === '0') return undefined
  // Handle legacy string values
  if (height === 'full') return 'calc(100 * var(--designer-vh, 1vh))'
  if (height === 'half') return 'calc(50 * var(--designer-vh, 1vh))'
  // If value already has a unit (px, %, vh, vw, em, rem, etc.)
  if (/[a-z%]/i.test(height)) {
    // Convert vh units to use --designer-vh for correct preview height
    return convertVhToEditorVh(height)
  }
  // Handle plain numeric values (legacy) - assume px
  const num = parseFloat(height)
  if (!isNaN(num) && num > 0) return `${num}px`
  return undefined
}

interface UseBlockStylesOptions {
  viewport: Ref<ViewportSize> | ComputedRef<ViewportSize>
  isAnimating?: Ref<boolean>
  isHovering?: Ref<boolean>
  hasAppeared?: Ref<boolean>
  scrollProgress?: Ref<number> // 0-1 for scroll-linked animations
}

/**
 * Composable for computing block CSS styles
 * Handles base styles, animation styles, wrapper/position styles
 */
export function useBlockStyles(block: Ref<SectionBlock>, options: UseBlockStylesOptions) {
  const { viewport, isAnimating, isHovering, hasAppeared, scrollProgress } = options

  // Get animation settings for this block (legacy animation system)
  const blockAnimation = computed((): AnimationSettings | undefined => {
    const styles = block.value.styles as BaseBlockStyles
    return styles?.animation
  })

  // Get effects for this block (new effects system)
  const blockEffects = computed((): BlockEffects | undefined => {
    const styles = block.value.styles as BaseBlockStyles
    return styles?.effects
  })

  // ============================================
  // HOVER EFFECT
  // ============================================
  const hoverEffect = computed(() => blockEffects.value?.hover)

  // Base transition for hover effect (always applied when hover effect exists)
  const hoverTransitionStyle = computed((): Record<string, string> => {
    if (!hoverEffect.value?.enabled) return {}
    const { duration = 300, easing = 'ease' } = hoverEffect.value
    const easingCSS = getEasingCSS(easing)
    return {
      transition: `all ${duration}ms ${easingCSS}`,
    }
  })

  // Hover effect: styles when NOT hovering (the "from" state)
  const hoverFromStyles = computed(() => {
    if (!hoverEffect.value?.enabled) return {}
    const fromState = getEffectFromState(hoverEffect.value)
    return effectStateToCSS(fromState, { perspective: hoverEffect.value.perspective })
  })

  // Hover effect: styles when hovering (the "to" state)
  const hoverToStyles = computed(() => {
    if (!hoverEffect.value?.enabled) return {}
    const toState = getEffectToState(hoverEffect.value)
    return effectStateToCSS(toState, { perspective: hoverEffect.value.perspective })
  })

  // Combined hover styles based on current hover state
  const hoverEffectStyles = computed(() => {
    if (!hoverEffect.value?.enabled) return {}

    const base: Record<string, string> = { ...hoverTransitionStyle.value }

    // Add transform origin if set
    if (hoverEffect.value.transformOrigin) {
      base.transformOrigin = getTransformOriginCSS(hoverEffect.value.transformOrigin)
    }

    // Add will-change hint for performance
    if (hoverEffect.value.willChange) {
      base.willChange = 'transform, opacity, filter'
    }

    if (isHovering?.value) {
      return { ...base, ...hoverToStyles.value }
    } else {
      return { ...base, ...hoverFromStyles.value }
    }
  })

  // ============================================
  // APPEAR EFFECT
  // ============================================
  const appearEffect = computed(() => blockEffects.value?.appear)

  // Appear effect styles (initial or final based on hasAppeared)
  const appearEffectStyles = computed(() => {
    if (!appearEffect.value?.enabled) return {}

    const { duration = 600, delay = 0, easing = 'ease-out' } = appearEffect.value
    const easingCSS = getEasingCSS(easing)

    const base: Record<string, string> = {}

    // Add transform origin if set
    if (appearEffect.value.transformOrigin) {
      base.transformOrigin = getTransformOriginCSS(appearEffect.value.transformOrigin)
    }

    // Add will-change hint for performance
    if (appearEffect.value.willChange) {
      base.willChange = 'transform, opacity, filter'
    }

    // If hasn't appeared yet, show "from" state
    if (!hasAppeared?.value) {
      const fromState = getEffectFromState(appearEffect.value)
      return { ...base, ...effectStateToCSS(fromState, { perspective: appearEffect.value.perspective }) }
    }

    // If appeared, animate to "to" state
    const toState = getEffectToState(appearEffect.value)
    return {
      ...base,
      ...effectStateToCSS(toState, { perspective: appearEffect.value.perspective }),
      transition: `all ${duration}ms ${easingCSS} ${delay}ms`,
    }
  })

  // ============================================
  // LOOP EFFECT
  // ============================================
  const loopEffect = computed(() => blockEffects.value?.loop)

  // Loop effect styles - returns CSS for the current state (from or to)
  // The actual animation toggling is handled in PreviewSection.vue
  const loopEffectStyles = computed(() => {
    if (!loopEffect.value?.enabled) return {}

    const { duration = 1000, easing = 'ease-in-out' } = loopEffect.value
    const easingCSS = getEasingCSS(easing)

    const base: Record<string, string> = {
      transition: `all ${duration}ms ${easingCSS}`,
    }

    // Add transform origin if set
    if (loopEffect.value.transformOrigin) {
      base.transformOrigin = getTransformOriginCSS(loopEffect.value.transformOrigin)
    }

    // Add will-change hint for performance
    if (loopEffect.value.willChange) {
      base.willChange = 'transform, opacity, filter'
    }

    return base
  })

  // Loop from/to states for use in PreviewSection
  const loopFromStyles = computed(() => {
    if (!loopEffect.value?.enabled) return {}
    const fromState = getEffectFromState(loopEffect.value)
    return effectStateToCSS(fromState, { perspective: loopEffect.value.perspective })
  })

  const loopToStyles = computed(() => {
    if (!loopEffect.value?.enabled) return {}
    const toState = getEffectToState(loopEffect.value)
    return effectStateToCSS(toState, { perspective: loopEffect.value.perspective })
  })

  // ============================================
  // SCROLL EFFECT
  // ============================================
  const scrollEffect = computed(() => blockEffects.value?.scroll)

  // Scroll effect styles (interpolated based on scroll progress)
  const scrollEffectStyles = computed(() => {
    if (!scrollEffect.value?.enabled) return {}

    const progress = scrollProgress?.value ?? 0
    const from = getEffectFromState(scrollEffect.value)
    const to = getEffectToState(scrollEffect.value)

    // Interpolate between from and to states based on scroll progress
    const interpolatedState = interpolateEffectStates(from, to, progress)
    const css = effectStateToCSS(interpolatedState, { perspective: scrollEffect.value.perspective })

    // Add transform origin if set
    if (scrollEffect.value.transformOrigin) {
      css.transformOrigin = getTransformOriginCSS(scrollEffect.value.transformOrigin)
    }

    // Add will-change hint for performance
    if (scrollEffect.value.willChange) {
      css.willChange = 'transform, opacity, filter'
    }

    return css
  })

  // Compute CSS styles from block.styles with responsive support
  const baseStyles = computed(() => {
    const rawStyles = block.value.styles as BaseBlockStyles
    if (!rawStyles) return {}

    // Get responsive styles for current viewport (cascaded)
    const styles = getResponsiveStyles(rawStyles, viewport.value)
    // Also get non-responsive styles (like typography) from raw styles
    const allStyles = rawStyles as Record<string, unknown>

    const css: Record<string, string> = {}

    // Padding (responsive) - use em
    if (styles.padding) {
      const p = styles.padding as { top?: string; right?: string; bottom?: string; left?: string }
      if (p.top) css.paddingTop = pxToEm(p.top)
      if (p.right) css.paddingRight = pxToEm(p.right)
      if (p.bottom) css.paddingBottom = pxToEm(p.bottom)
      if (p.left) css.paddingLeft = pxToEm(p.left)
    }

    // Margin (responsive) - use em, supports negative values
    if (styles.margin) {
      const m = styles.margin as { top?: string; right?: string; bottom?: string; left?: string }
      if (m.top) css.marginTop = pxToEm(m.top)
      if (m.right) css.marginRight = pxToEm(m.right)
      if (m.bottom) css.marginBottom = pxToEm(m.bottom)
      if (m.left) css.marginLeft = pxToEm(m.left)
    }

    // Background (responsive)
    if (styles.backgroundColor) {
      const bgColor = styles.backgroundColor as string
      const bgOpacity = (styles.backgroundColorOpacity as number) ?? 100
      css.backgroundColor = applyColorOpacity(bgColor, bgOpacity)
    }
    if (styles.backgroundImage) {
      css.backgroundImage = `url(${styles.backgroundImage})`
      css.backgroundSize = (styles.backgroundSize as string) || 'cover'
      css.backgroundPosition = (styles.backgroundPosition as string) || 'center'
    }
    // Background gradient
    if (styles.backgroundGradient) {
      const gradient = styles.backgroundGradient as { type: 'linear' | 'radial'; angle?: number; stops: GradientStop[]; opacity?: number }
      if (gradient.stops && gradient.stops.length >= 2) {
        const globalOpacity = gradient.opacity ?? 100
        const stops = gradient.stops
          .slice()
          .sort((a, b) => a.position - b.position)
          .map(s => {
            const stopOpacity = (s.opacity ?? 100) * globalOpacity / 100
            const colorWithOpacity = applyColorOpacity(s.color, stopOpacity)
            return `${colorWithOpacity} ${s.position}%`
          })
          .join(', ')
        if (gradient.type === 'radial') {
          css.background = `radial-gradient(circle, ${stops})`
        } else {
          css.background = `linear-gradient(${gradient.angle ?? 180}deg, ${stops})`
        }
      }
    }

    // Border (responsive) - use em for width and radius
    if (styles.border) {
      const b = styles.border as { width?: string; color?: string; radius?: string; style?: string; sides?: string }
      if (b.width && b.width !== '0') {
        const borderStyle = b.style || 'solid'
        const borderColor = b.color || 'currentColor'
        const borderValue = `${pxToEm(b.width)} ${borderStyle} ${borderColor}`

        // Parse sides - default to all sides if not specified
        const sidesStr = b.sides || 'top,right,bottom,left'
        const activeSides = new Set(sidesStr.split(',').filter(s => s))

        // Apply border to each active side
        if (activeSides.has('top')) css.borderTop = borderValue
        if (activeSides.has('right')) css.borderRight = borderValue
        if (activeSides.has('bottom')) css.borderBottom = borderValue
        if (activeSides.has('left')) css.borderLeft = borderValue
      }
      if (b.radius && b.radius !== '0') {
        css.borderRadius = pxToEm(b.radius)
      }
    }

    // Shadow (responsive) - use em for offsets and blur
    if (styles.shadow) {
      const s = styles.shadow as { enabled?: boolean; x?: string; y?: string; blur?: string; spread?: string; color?: string; opacity?: number }
      if (s.enabled) {
        // Convert hex color to rgba with opacity
        const color = s.color || '#000000'
        const opacity = (s.opacity ?? 20) / 100
        let shadowColor = color
        if (color.startsWith('#')) {
          const hex = color.slice(1)
          const r = parseInt(hex.slice(0, 2), 16)
          const g = parseInt(hex.slice(2, 4), 16)
          const b = parseInt(hex.slice(4, 6), 16)
          shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`
        }
        css.boxShadow = `${pxToEm(s.x || '0')} ${pxToEm(s.y || '0')} ${pxToEm(s.blur || '0')} ${pxToEm(s.spread || '0')} ${shadowColor}`
      }
    }

    // Typography styles (non-responsive for now) - fontSize uses em
    if (allStyles.fontSize) {
      const size = allStyles.fontSize as string
      // If it's a Tailwind class (xs, sm, base, etc.), convert to px first
      // Otherwise pass directly to pxToEm which handles all units (px, em, rem, vh, etc.)
      const value = fontSizeMap[size] || size
      css.fontSize = pxToEm(value)
    }
    // Color
    if (allStyles.color) {
      css.color = allStyles.color as string
    }
    if (allStyles.alignment) css.textAlign = allStyles.alignment as string
    if (allStyles.fontWeight) css.fontWeight = allStyles.fontWeight as string
    if (allStyles.fontFamily) css.fontFamily = allStyles.fontFamily as string
    if (allStyles.fontStyle) css.fontStyle = allStyles.fontStyle as string
    if (allStyles.textDecoration && allStyles.textDecoration !== 'none') css.textDecoration = allStyles.textDecoration as string
    if (allStyles.textTransform && allStyles.textTransform !== 'none') css.textTransform = allStyles.textTransform as string
    if (allStyles.lineHeight) css.lineHeight = allStyles.lineHeight as string
    if (allStyles.letterSpacing) css.letterSpacing = pxToEm(allStyles.letterSpacing as string)

    // Border radius (direct) - supports both string and object with individual corners
    const borderRadiusValue = styles.borderRadius || allStyles.borderRadius
    if (borderRadiusValue) {
      if (typeof borderRadiusValue === 'string') {
        css.borderRadius = pxToEm(borderRadiusValue)
      } else {
        // Object with individual corners
        const br = borderRadiusValue as { topLeft?: string; topRight?: string; bottomRight?: string; bottomLeft?: string }
        const tl = br.topLeft ? pxToEm(br.topLeft) : '0'
        const tr = br.topRight ? pxToEm(br.topRight) : '0'
        const brr = br.bottomRight ? pxToEm(br.bottomRight) : '0'
        const bl = br.bottomLeft ? pxToEm(br.bottomLeft) : '0'
        css.borderRadius = `${tl} ${tr} ${brr} ${bl}`
      }
    }

    // Flexbox properties for layout blocks (non-responsive for now)
    if (allStyles.flexDirection) css.flexDirection = allStyles.flexDirection as string
    if (allStyles.justifyContent !== undefined) css.justifyContent = allStyles.justifyContent as string
    if (allStyles.alignItems !== undefined) css.alignItems = allStyles.alignItems as string
    if (allStyles.flexWrap) css.flexWrap = allStyles.flexWrap as string
    if (allStyles.gap) css.gap = pxToEm(allStyles.gap as string)

    // Flex child properties (responsive)
    if (styles.flexGrow && styles.flexGrow !== '0') css.flexGrow = styles.flexGrow as string
    if (styles.flexShrink && styles.flexShrink !== '1') css.flexShrink = styles.flexShrink as string
    if (styles.flexBasis && styles.flexBasis !== 'auto') css.flexBasis = styles.flexBasis as string

    // Grid properties (non-responsive for now)
    if (allStyles.justifyItems) css.justifyItems = allStyles.justifyItems as string

    // Opacity & Blend Mode (responsive)
    if (styles.opacity !== undefined && styles.opacity !== '100') {
      css.opacity = String(Number(styles.opacity) / 100)
    }
    if (styles.mixBlendMode && styles.mixBlendMode !== 'normal') {
      css.mixBlendMode = styles.mixBlendMode as string
    }

    // Size (responsive) - width and height
    if (styles.width) {
      css.width = getHeightStyle(styles.width as string) || 'auto'
    }
    if (styles.height) {
      const h = getHeightStyle(styles.height as string)
      if (h) {
        css.height = h
        css.minHeight = h
      }
    }
    // Size constraints (responsive) - min/max width and height
    if (styles.minWidth) {
      const minW = getHeightStyle(styles.minWidth as string)
      if (minW) css.minWidth = minW
    }
    if (styles.maxWidth) {
      const maxW = getHeightStyle(styles.maxWidth as string)
      if (maxW) css.maxWidth = maxW
    }
    if (styles.minHeight) {
      const minH = getHeightStyle(styles.minHeight as string)
      if (minH) css.minHeight = minH
    }
    if (styles.maxHeight) {
      const maxH = getHeightStyle(styles.maxHeight as string)
      if (maxH) css.maxHeight = maxH
    }

    // Overflow (responsive) - uses clip-path to also clip position:fixed children
    // clip-path: inset(0 round <radius>) respects border-radius
    if (styles.overflow === 'hidden') {
      // Get border-radius from styles (can be in border.radius, styles.borderRadius, or allStyles.borderRadius)
      const borderObj = styles.border as { radius?: string } | undefined
      const radiusSource = styles.borderRadius || borderObj?.radius || allStyles.borderRadius

      if (radiusSource) {
        if (typeof radiusSource === 'string') {
          if (radiusSource !== '0' && radiusSource !== '0px') {
            css.clipPath = `inset(0 round ${pxToEm(radiusSource)})`
          } else {
            css.clipPath = 'inset(0)'
          }
        } else {
          // Object with individual corners
          const br = radiusSource as { topLeft?: string; topRight?: string; bottomRight?: string; bottomLeft?: string }
          const tl = br.topLeft ? pxToEm(br.topLeft) : '0'
          const tr = br.topRight ? pxToEm(br.topRight) : '0'
          const brr = br.bottomRight ? pxToEm(br.bottomRight) : '0'
          const bl = br.bottomLeft ? pxToEm(br.bottomLeft) : '0'
          const hasRadius = (br.topLeft && br.topLeft !== '0') || (br.topRight && br.topRight !== '0') ||
            (br.bottomRight && br.bottomRight !== '0') || (br.bottomLeft && br.bottomLeft !== '0')
          if (hasRadius) {
            css.clipPath = `inset(0 round ${tl} ${tr} ${brr} ${bl})`
          } else {
            css.clipPath = 'inset(0)'
          }
        }
      } else {
        css.clipPath = 'inset(0)'
      }
    }

    // Transform (responsive) - rotate, scale, translate
    const transforms: string[] = []
    if (styles.rotate && styles.rotate !== '0') {
      transforms.push(`rotate(${styles.rotate}deg)`)
    }
    if (styles.scale && styles.scale !== '100') {
      // Scale is stored as percentage (100 = 1x), convert to decimal
      const scaleValue = Number(styles.scale) / 100
      transforms.push(`scale(${scaleValue})`)
    }
    if (styles.translateX && styles.translateX !== '0') {
      // Value may already include unit (e.g., "-70px" or "10%"), or be just a number
      const tx = String(styles.translateX)
      const txValue = /[a-z%]/i.test(tx) ? tx : `${tx}px`
      transforms.push(`translateX(${txValue})`)
    }
    if (styles.translateY && styles.translateY !== '0') {
      // Value may already include unit (e.g., "-70px" or "10%"), or be just a number
      const ty = String(styles.translateY)
      const tyValue = /[a-z%]/i.test(ty) ? ty : `${ty}px`
      transforms.push(`translateY(${tyValue})`)
    }
    if (transforms.length > 0) {
      css.transform = transforms.join(' ')
    }

    // Filter (responsive) - blur
    if (styles.blur && styles.blur !== '0') {
      css.filter = `blur(${styles.blur}px)`
    }

    return css
  })

  // Compute wrapper/position styles (applied to outer section for proper outline/label positioning)
  const wrapperStyles = computed(() => {
    const rawStyles = block.value.styles as BaseBlockStyles
    if (!rawStyles) return {}

    const styles = getResponsiveStyles(rawStyles, viewport.value)
    const css: Record<string, string> = {}

    // Position (responsive) - applied to wrapper so outline/label follow the element
    // Note: z-index requires a positioned element, so we must apply position when z-index is set
    const hasZIndex = styles.zIndex !== undefined && styles.zIndex !== ''
    if (styles.position && (styles.position !== 'relative' || hasZIndex)) {
      css.position = styles.position as string
    }
    if (hasZIndex) {
      css.zIndex = String(styles.zIndex)
    }
    if (styles.top !== undefined && styles.top !== '') {
      css.top = pxToEm(styles.top as string)
    }
    if (styles.right !== undefined && styles.right !== '') {
      css.right = pxToEm(styles.right as string)
    }
    if (styles.bottom !== undefined && styles.bottom !== '') {
      css.bottom = pxToEm(styles.bottom as string)
    }
    if (styles.left !== undefined && styles.left !== '') {
      css.left = pxToEm(styles.left as string)
    }

    // Flex child properties (responsive)
    if (styles.flexGrow !== undefined && styles.flexGrow !== '' && styles.flexGrow !== '0') {
      css.flexGrow = String(styles.flexGrow)
    }
    if (styles.flexShrink !== undefined && styles.flexShrink !== '') {
      css.flexShrink = String(styles.flexShrink)
    }
    if (styles.flexBasis !== undefined && styles.flexBasis !== '' && styles.flexBasis !== 'auto') {
      css.flexBasis = styles.flexBasis as string
    }

    return css
  })

  // Animation styles
  const animationStyles = computed(() => {
    if (!blockAnimation.value?.enabled) {
      return {}
    }

    const settings = blockAnimation.value

    // For hover trigger, we use CSS transitions instead of animations
    if (settings.trigger === 'hover') {
      return { transition: `all ${settings.duration}ms ${settings.easing}` }
    }

    // For page-load and in-view triggers, apply initial state and animation
    if (isAnimating?.value) {
      // Apply the CSS animation
      return { animation: getAnimationCSSValue(settings) }
    }

    // Apply initial state (before animation plays) - use pre-parsed object
    return { ...animationInitialStyleObjects[settings.preset] }
  })

  // Hover animation styles (applied on hover) - use pre-parsed object
  const hoverAnimationStyles = computed(() => {
    if (!blockAnimation.value?.enabled) {
      return {}
    }

    const settings = blockAnimation.value
    if (settings.trigger !== 'hover') return {}

    // Return pre-parsed style object directly
    return { ...animationFinalStyleObjects[settings.preset] }
  })

  // Check if this block has fixed or sticky positioning
  const isFixedOrSticky = computed(() => {
    const pos = wrapperStyles.value.position
    return pos === 'fixed' || pos === 'sticky'
  })

  // Helper to get image-specific styles
  function getImageStyles(): Record<string, string> {
    const styles = block.value.styles as Record<string, unknown>
    const css: Record<string, string> = {}

    // Object fit
    if (styles?.objectFit) css.objectFit = styles.objectFit as string
    else css.objectFit = 'cover'

    // Border radius - use em
    if (styles?.borderRadius && styles.borderRadius !== '0') {
      css.borderRadius = pxToEm(styles.borderRadius as string)
      css.overflow = 'hidden'
    }

    // Width - supports percentage, 'full', or px (converted to em)
    if (styles?.width) {
      const width = styles.width as string
      if (width === 'full') {
        css.width = '100%'
      } else if (width.endsWith('%')) {
        css.width = width
      } else {
        css.width = pxToEm(width)
      }
    }

    // Height - supports percentage, vh, or px (converted to em)
    if (styles?.height) {
      const height = styles.height as string
      if (height.endsWith('%')) {
        css.height = height
      } else if (height.includes('vh')) {
        css.height = convertVhToEditorVh(height)
      } else {
        css.height = pxToEm(height)
      }
    }

    // Aspect ratio
    if (styles?.aspectRatio && styles.aspectRatio !== 'auto') {
      const ratio = styles.aspectRatio as string
      // Convert "16:9" format to CSS aspect-ratio value "16/9"
      css.aspectRatio = ratio.replace(':', '/')
    }

    // Apply mask shape
    const mask = styles?.mask as MaskShape | undefined
    if (mask && mask !== 'none') {
      css.clipPath = maskShapeClipPaths[mask]
    }
    return css
  }

  // Helper to get video-specific styles
  function getVideoStyles(): Record<string, string> {
    const styles = block.value.styles as Record<string, unknown>
    const css: Record<string, string> = {}
    if (styles?.aspectRatio) {
      const ar = styles.aspectRatio as string
      css.aspectRatio = ar.replace(':', '/')
    } else {
      css.aspectRatio = '16/9'
    }
    // Border radius - use em, default to 0
    if (styles?.borderRadius && styles.borderRadius !== '0') {
      css.borderRadius = pxToEm(styles.borderRadius as string)
      css.overflow = 'hidden'
    }
    // Apply mask shape
    const mask = styles?.mask as MaskShape | undefined
    if (mask && mask !== 'none') {
      css.clipPath = maskShapeClipPaths[mask]
    }
    return css
  }

  return {
    // Main computed styles
    baseStyles,
    wrapperStyles,
    animationStyles,
    hoverAnimationStyles,

    // Animation (legacy)
    blockAnimation,

    // Effects (new system)
    blockEffects,
    hoverEffect,
    hoverEffectStyles,
    appearEffect,
    appearEffectStyles,
    loopEffect,
    loopEffectStyles,
    loopFromStyles,
    loopToStyles,
    scrollEffect,
    scrollEffectStyles,

    // Utilities
    isFixedOrSticky,
    getImageStyles,
    getVideoStyles,
    fontSizeMap,
    pxToEm,
  }
}
