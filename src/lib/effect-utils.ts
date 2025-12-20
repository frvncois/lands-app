/**
 * Effect Utilities
 *
 * Contains easing cubic-bezier values, effect presets, and helper functions
 * for the advanced effects system.
 */

import type { EffectEasing, EffectPreset, EffectState, EffectKeyframe, TransformOrigin, StaggerConfig } from '@/types/designer'

// ============================================
// EASING CUBIC-BEZIER VALUES
// ============================================

export const easingValues: Record<EffectEasing, string> = {
  // Standard
  'linear': 'linear',
  'ease': 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  // Quad
  'ease-in-quad': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  'ease-out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'ease-in-out-quad': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  // Cubic
  'ease-in-cubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  'ease-out-cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  'ease-in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  // Quart
  'ease-in-quart': 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  'ease-out-quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  'ease-in-out-quart': 'cubic-bezier(0.77, 0, 0.175, 1)',
  // Expo
  'ease-in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
  'ease-in-out-expo': 'cubic-bezier(1, 0, 0, 1)',
  // Back (overshoot)
  'ease-in-back': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'ease-in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  // Elastic & Bounce (approximations - true elastic/bounce requires keyframes)
  'ease-out-elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'ease-out-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
}

// Easing options for select inputs
export const easingOptions: { value: EffectEasing; label: string; group?: string }[] = [
  // Standard
  { value: 'linear', label: 'Linear', group: 'Standard' },
  { value: 'ease', label: 'Ease', group: 'Standard' },
  { value: 'ease-in', label: 'Ease In', group: 'Standard' },
  { value: 'ease-out', label: 'Ease Out', group: 'Standard' },
  { value: 'ease-in-out', label: 'Ease In Out', group: 'Standard' },
  // Expressive
  { value: 'ease-out-quad', label: 'Quad Out', group: 'Smooth' },
  { value: 'ease-out-cubic', label: 'Cubic Out', group: 'Smooth' },
  { value: 'ease-out-quart', label: 'Quart Out', group: 'Smooth' },
  { value: 'ease-out-expo', label: 'Expo Out', group: 'Smooth' },
  // Back (overshoot)
  { value: 'ease-out-back', label: 'Back Out', group: 'Expressive' },
  { value: 'ease-in-back', label: 'Back In', group: 'Expressive' },
  { value: 'ease-in-out-back', label: 'Back In Out', group: 'Expressive' },
  // Elastic & Bounce
  { value: 'ease-out-elastic', label: 'Elastic Out', group: 'Expressive' },
  { value: 'ease-out-bounce', label: 'Bounce Out', group: 'Expressive' },
]

// ============================================
// TRANSFORM ORIGIN VALUES
// ============================================

export const transformOriginValues: Record<TransformOrigin, string> = {
  'center': 'center center',
  'top': 'center top',
  'top-right': 'right top',
  'right': 'right center',
  'bottom-right': 'right bottom',
  'bottom': 'center bottom',
  'bottom-left': 'left bottom',
  'left': 'left center',
  'top-left': 'left top',
}

export const transformOriginOptions: { value: TransformOrigin; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'right', label: 'Right' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'left', label: 'Left' },
  { value: 'top-left', label: 'Top Left' },
]

// ============================================
// EFFECT PRESETS
// ============================================

interface PresetConfig {
  from: EffectState
  to: EffectState
  duration?: number
  easing?: EffectEasing
  transformOrigin?: TransformOrigin
}

export const effectPresets: Record<EffectPreset, PresetConfig> = {
  // Fade
  'fade-in': {
    from: { opacity: 0 },
    to: { opacity: 100 },
    duration: 400,
    easing: 'ease-out',
  },
  'fade-out': {
    from: { opacity: 100 },
    to: { opacity: 0 },
    duration: 400,
    easing: 'ease-out',
  },
  // Slide
  'slide-up': {
    from: { translateY: '40' },
    to: { translateY: '0' },
    duration: 500,
    easing: 'ease-out-cubic',
  },
  'slide-down': {
    from: { translateY: '-40' },
    to: { translateY: '0' },
    duration: 500,
    easing: 'ease-out-cubic',
  },
  'slide-left': {
    from: { translateX: '40' },
    to: { translateX: '0' },
    duration: 500,
    easing: 'ease-out-cubic',
  },
  'slide-right': {
    from: { translateX: '-40' },
    to: { translateX: '0' },
    duration: 500,
    easing: 'ease-out-cubic',
  },
  // Zoom
  'zoom-in': {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 100 },
    duration: 400,
    easing: 'ease-out-back',
    transformOrigin: 'center',
  },
  'zoom-out': {
    from: { scale: 1.2, opacity: 0 },
    to: { scale: 1, opacity: 100 },
    duration: 400,
    easing: 'ease-out',
    transformOrigin: 'center',
  },
  // Flip (3D)
  'flip-x': {
    from: { rotateX: '90', opacity: 0 },
    to: { rotateX: '0', opacity: 100 },
    duration: 600,
    easing: 'ease-out-cubic',
    transformOrigin: 'center',
  },
  'flip-y': {
    from: { rotateY: '90', opacity: 0 },
    to: { rotateY: '0', opacity: 100 },
    duration: 600,
    easing: 'ease-out-cubic',
    transformOrigin: 'center',
  },
  // Rotate
  'rotate-in': {
    from: { rotate: '-180', opacity: 0, scale: 0.5 },
    to: { rotate: '0', opacity: 100, scale: 1 },
    duration: 500,
    easing: 'ease-out-back',
    transformOrigin: 'center',
  },
  'rotate-out': {
    from: { rotate: '0', opacity: 100, scale: 1 },
    to: { rotate: '180', opacity: 0, scale: 0.5 },
    duration: 500,
    easing: 'ease-in',
    transformOrigin: 'center',
  },
  // Bounce
  'bounce-in': {
    from: { scale: 0.3, opacity: 0 },
    to: { scale: 1, opacity: 100 },
    duration: 600,
    easing: 'ease-out-bounce',
    transformOrigin: 'center',
  },
  'bounce-out': {
    from: { scale: 1, opacity: 100 },
    to: { scale: 0.3, opacity: 0 },
    duration: 600,
    easing: 'ease-in',
    transformOrigin: 'center',
  },
  // Blur
  'blur-in': {
    from: { blur: '20', opacity: 0 },
    to: { blur: '0', opacity: 100 },
    duration: 500,
    easing: 'ease-out',
  },
  'blur-out': {
    from: { blur: '0', opacity: 100 },
    to: { blur: '20', opacity: 0 },
    duration: 500,
    easing: 'ease-out',
  },
  // Scale
  'scale-up': {
    from: { scale: 0.95 },
    to: { scale: 1 },
    duration: 300,
    easing: 'ease-out',
  },
  'scale-down': {
    from: { scale: 1.05 },
    to: { scale: 1 },
    duration: 300,
    easing: 'ease-out',
  },
  // Combos
  'fade-up': {
    from: { opacity: 0, translateY: '30' },
    to: { opacity: 100, translateY: '0' },
    duration: 500,
    easing: 'ease-out-cubic',
  },
  'fade-down': {
    from: { opacity: 0, translateY: '-30' },
    to: { opacity: 100, translateY: '0' },
    duration: 500,
    easing: 'ease-out-cubic',
  },
  'fade-left': {
    from: { opacity: 0, translateX: '30' },
    to: { opacity: 100, translateX: '0' },
    duration: 500,
    easing: 'ease-out-cubic',
  },
  'fade-right': {
    from: { opacity: 0, translateX: '-30' },
    to: { opacity: 100, translateX: '0' },
    duration: 500,
    easing: 'ease-out-cubic',
  },
  'fade-zoom-in': {
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 100, scale: 1 },
    duration: 400,
    easing: 'ease-out',
  },
  'fade-zoom-out': {
    from: { opacity: 0, scale: 1.1 },
    to: { opacity: 100, scale: 1 },
    duration: 400,
    easing: 'ease-out',
  },
  // Custom (no default values)
  'custom': {
    from: {},
    to: {},
    duration: 500,
    easing: 'ease-out',
  },
}

// Preset options for select inputs
export const presetOptions: { value: EffectPreset; label: string; group: string }[] = [
  // Fade
  { value: 'fade-in', label: 'Fade In', group: 'Fade' },
  { value: 'fade-out', label: 'Fade Out', group: 'Fade' },
  // Fade + Move
  { value: 'fade-up', label: 'Fade Up', group: 'Fade + Move' },
  { value: 'fade-down', label: 'Fade Down', group: 'Fade + Move' },
  { value: 'fade-left', label: 'Fade Left', group: 'Fade + Move' },
  { value: 'fade-right', label: 'Fade Right', group: 'Fade + Move' },
  // Zoom
  { value: 'zoom-in', label: 'Zoom In', group: 'Zoom' },
  { value: 'zoom-out', label: 'Zoom Out', group: 'Zoom' },
  { value: 'fade-zoom-in', label: 'Fade Zoom In', group: 'Zoom' },
  { value: 'fade-zoom-out', label: 'Fade Zoom Out', group: 'Zoom' },
  // Slide
  { value: 'slide-up', label: 'Slide Up', group: 'Slide' },
  { value: 'slide-down', label: 'Slide Down', group: 'Slide' },
  { value: 'slide-left', label: 'Slide Left', group: 'Slide' },
  { value: 'slide-right', label: 'Slide Right', group: 'Slide' },
  // 3D
  { value: 'flip-x', label: 'Flip X', group: '3D' },
  { value: 'flip-y', label: 'Flip Y', group: '3D' },
  { value: 'rotate-in', label: 'Rotate In', group: '3D' },
  // Special
  { value: 'bounce-in', label: 'Bounce In', group: 'Special' },
  { value: 'blur-in', label: 'Blur In', group: 'Special' },
  { value: 'scale-up', label: 'Scale Up', group: 'Special' },
  { value: 'scale-down', label: 'Scale Down', group: 'Special' },
  // Custom
  { value: 'custom', label: 'Custom', group: 'Custom' },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get preset config by name
 */
export function getPresetConfig(preset: EffectPreset): PresetConfig {
  return effectPresets[preset] || effectPresets['custom']
}

/**
 * Convert EffectState to CSS styles object
 */
export function effectStateToCSS(
  state: EffectState | undefined,
  options?: { perspective?: string }
): Record<string, string> {
  if (!state) return {}

  const css: Record<string, string> = {}
  const transforms: string[] = []
  const filters: string[] = []

  // Opacity (stored as 0-100, convert to 0-1)
  if (state.opacity !== undefined) {
    css.opacity = String(state.opacity / 100)
  }

  // Scale
  if (state.scale !== undefined && state.scale !== 1) {
    transforms.push(`scale(${state.scale})`)
  }
  if (state.scaleX !== undefined && state.scaleX !== 1) {
    transforms.push(`scaleX(${state.scaleX})`)
  }
  if (state.scaleY !== undefined && state.scaleY !== 1) {
    transforms.push(`scaleY(${state.scaleY})`)
  }

  // Translate
  if (state.translateX && state.translateX !== '0') {
    const value = state.translateX.includes('px') || state.translateX.includes('%')
      ? state.translateX
      : `${state.translateX}px`
    transforms.push(`translateX(${value})`)
  }
  if (state.translateY && state.translateY !== '0') {
    const value = state.translateY.includes('px') || state.translateY.includes('%')
      ? state.translateY
      : `${state.translateY}px`
    transforms.push(`translateY(${value})`)
  }
  if (state.translateZ && state.translateZ !== '0') {
    const value = state.translateZ.includes('px') ? state.translateZ : `${state.translateZ}px`
    transforms.push(`translateZ(${value})`)
  }

  // Rotate (2D)
  if (state.rotate && state.rotate !== '0') {
    transforms.push(`rotate(${state.rotate}deg)`)
  }

  // Rotate 3D
  if (state.rotateX && state.rotateX !== '0') {
    transforms.push(`rotateX(${state.rotateX}deg)`)
  }
  if (state.rotateY && state.rotateY !== '0') {
    transforms.push(`rotateY(${state.rotateY}deg)`)
  }

  // Skew
  if (state.skewX && state.skewX !== '0') {
    transforms.push(`skewX(${state.skewX}deg)`)
  }
  if (state.skewY && state.skewY !== '0') {
    transforms.push(`skewY(${state.skewY}deg)`)
  }

  // Apply transforms
  if (transforms.length > 0) {
    // Add perspective for 3D transforms
    if (options?.perspective || state.rotateX || state.rotateY || state.translateZ) {
      css.transform = `perspective(${options?.perspective || '1000px'}) ${transforms.join(' ')}`
    } else {
      css.transform = transforms.join(' ')
    }
  }

  // Filters
  if (state.blur && state.blur !== '0') {
    filters.push(`blur(${state.blur}px)`)
  }
  if (state.brightness !== undefined && state.brightness !== 100) {
    filters.push(`brightness(${state.brightness / 100})`)
  }
  if (state.contrast !== undefined && state.contrast !== 100) {
    filters.push(`contrast(${state.contrast / 100})`)
  }
  if (state.saturate !== undefined && state.saturate !== 100) {
    filters.push(`saturate(${state.saturate / 100})`)
  }
  if (state.grayscale !== undefined && state.grayscale !== 0) {
    filters.push(`grayscale(${state.grayscale / 100})`)
  }
  if (state.hueRotate !== undefined && state.hueRotate !== 0) {
    filters.push(`hue-rotate(${state.hueRotate}deg)`)
  }

  if (filters.length > 0) {
    css.filter = filters.join(' ')
  }

  // Backdrop blur
  if (state.backdropBlur && state.backdropBlur !== '0') {
    css.backdropFilter = `blur(${state.backdropBlur}px)`
  }

  // Size
  if (state.width) {
    css.width = state.width.includes('%') || state.width.includes('px') || state.width.includes('em')
      ? state.width
      : `${state.width}px`
  }
  if (state.height) {
    css.height = state.height.includes('%') || state.height.includes('px') || state.height.includes('em')
      ? state.height
      : `${state.height}px`
  }

  // Colors
  if (state.backgroundColor) {
    css.backgroundColor = state.backgroundColor
  }
  if (state.color) {
    css.color = state.color
  }
  if (state.borderColor) {
    css.borderColor = state.borderColor
  }

  // Border
  if (state.borderWidth) {
    css.borderWidth = state.borderWidth.includes('px') ? state.borderWidth : `${state.borderWidth}px`
  }
  if (state.borderRadius) {
    css.borderRadius = state.borderRadius.includes('px') || state.borderRadius.includes('%')
      ? state.borderRadius
      : `${state.borderRadius}px`
  }

  // Spacing - Padding
  if (state.paddingTop) {
    css.paddingTop = state.paddingTop.includes('px') ? state.paddingTop : `${state.paddingTop}px`
  }
  if (state.paddingRight) {
    css.paddingRight = state.paddingRight.includes('px') ? state.paddingRight : `${state.paddingRight}px`
  }
  if (state.paddingBottom) {
    css.paddingBottom = state.paddingBottom.includes('px') ? state.paddingBottom : `${state.paddingBottom}px`
  }
  if (state.paddingLeft) {
    css.paddingLeft = state.paddingLeft.includes('px') ? state.paddingLeft : `${state.paddingLeft}px`
  }

  // Spacing - Margin
  if (state.marginTop) {
    css.marginTop = state.marginTop.includes('px') ? state.marginTop : `${state.marginTop}px`
  }
  if (state.marginRight) {
    css.marginRight = state.marginRight.includes('px') ? state.marginRight : `${state.marginRight}px`
  }
  if (state.marginBottom) {
    css.marginBottom = state.marginBottom.includes('px') ? state.marginBottom : `${state.marginBottom}px`
  }
  if (state.marginLeft) {
    css.marginLeft = state.marginLeft.includes('px') ? state.marginLeft : `${state.marginLeft}px`
  }

  // Box shadow
  if (state.shadowColor) {
    const x = state.shadowX || '0'
    const y = state.shadowY || '0'
    const blur = state.shadowBlur || '0'
    const spread = state.shadowSpread || '0'
    css.boxShadow = `${x}px ${y}px ${blur}px ${spread}px ${state.shadowColor}`
  }

  return css
}

/**
 * Interpolate between two effect states based on progress (0-1)
 */
export function interpolateEffectStates(
  from: EffectState,
  to: EffectState,
  progress: number
): EffectState {
  const result: EffectState = {}

  const lerp = (a: number, b: number) => a + (b - a) * progress
  const lerpStr = (a: string | undefined, b: string | undefined, defaultVal: number): string => {
    const fromNum = parseFloat(a || String(defaultVal))
    const toNum = parseFloat(b || String(defaultVal))
    return String(lerp(fromNum, toNum))
  }

  // Opacity
  if (from.opacity !== undefined || to.opacity !== undefined) {
    result.opacity = lerp(from.opacity ?? 100, to.opacity ?? 100)
  }

  // Scale
  if (from.scale !== undefined || to.scale !== undefined) {
    result.scale = lerp(from.scale ?? 1, to.scale ?? 1)
  }
  if (from.scaleX !== undefined || to.scaleX !== undefined) {
    result.scaleX = lerp(from.scaleX ?? 1, to.scaleX ?? 1)
  }
  if (from.scaleY !== undefined || to.scaleY !== undefined) {
    result.scaleY = lerp(from.scaleY ?? 1, to.scaleY ?? 1)
  }

  // Translate
  if (from.translateX !== undefined || to.translateX !== undefined) {
    result.translateX = lerpStr(from.translateX, to.translateX, 0)
  }
  if (from.translateY !== undefined || to.translateY !== undefined) {
    result.translateY = lerpStr(from.translateY, to.translateY, 0)
  }
  if (from.translateZ !== undefined || to.translateZ !== undefined) {
    result.translateZ = lerpStr(from.translateZ, to.translateZ, 0)
  }

  // Rotate
  if (from.rotate !== undefined || to.rotate !== undefined) {
    result.rotate = lerpStr(from.rotate, to.rotate, 0)
  }
  if (from.rotateX !== undefined || to.rotateX !== undefined) {
    result.rotateX = lerpStr(from.rotateX, to.rotateX, 0)
  }
  if (from.rotateY !== undefined || to.rotateY !== undefined) {
    result.rotateY = lerpStr(from.rotateY, to.rotateY, 0)
  }

  // Skew
  if (from.skewX !== undefined || to.skewX !== undefined) {
    result.skewX = lerpStr(from.skewX, to.skewX, 0)
  }
  if (from.skewY !== undefined || to.skewY !== undefined) {
    result.skewY = lerpStr(from.skewY, to.skewY, 0)
  }

  // Filters
  if (from.blur !== undefined || to.blur !== undefined) {
    result.blur = lerpStr(from.blur, to.blur, 0)
  }
  if (from.brightness !== undefined || to.brightness !== undefined) {
    result.brightness = lerp(from.brightness ?? 100, to.brightness ?? 100)
  }
  if (from.contrast !== undefined || to.contrast !== undefined) {
    result.contrast = lerp(from.contrast ?? 100, to.contrast ?? 100)
  }
  if (from.saturate !== undefined || to.saturate !== undefined) {
    result.saturate = lerp(from.saturate ?? 100, to.saturate ?? 100)
  }
  if (from.grayscale !== undefined || to.grayscale !== undefined) {
    result.grayscale = lerp(from.grayscale ?? 0, to.grayscale ?? 0)
  }
  if (from.hueRotate !== undefined || to.hueRotate !== undefined) {
    result.hueRotate = lerp(from.hueRotate ?? 0, to.hueRotate ?? 0)
  }

  // Backdrop blur
  if (from.backdropBlur !== undefined || to.backdropBlur !== undefined) {
    result.backdropBlur = lerpStr(from.backdropBlur, to.backdropBlur, 0)
  }

  // Size
  if (from.width !== undefined || to.width !== undefined) {
    result.width = lerpStr(from.width, to.width, 0)
  }
  if (from.height !== undefined || to.height !== undefined) {
    result.height = lerpStr(from.height, to.height, 0)
  }

  // Border
  if (from.borderWidth !== undefined || to.borderWidth !== undefined) {
    result.borderWidth = lerpStr(from.borderWidth, to.borderWidth, 0)
  }
  if (from.borderRadius !== undefined || to.borderRadius !== undefined) {
    result.borderRadius = lerpStr(from.borderRadius, to.borderRadius, 0)
  }

  // Spacing - Padding
  if (from.paddingTop !== undefined || to.paddingTop !== undefined) {
    result.paddingTop = lerpStr(from.paddingTop, to.paddingTop, 0)
  }
  if (from.paddingRight !== undefined || to.paddingRight !== undefined) {
    result.paddingRight = lerpStr(from.paddingRight, to.paddingRight, 0)
  }
  if (from.paddingBottom !== undefined || to.paddingBottom !== undefined) {
    result.paddingBottom = lerpStr(from.paddingBottom, to.paddingBottom, 0)
  }
  if (from.paddingLeft !== undefined || to.paddingLeft !== undefined) {
    result.paddingLeft = lerpStr(from.paddingLeft, to.paddingLeft, 0)
  }

  // Spacing - Margin
  if (from.marginTop !== undefined || to.marginTop !== undefined) {
    result.marginTop = lerpStr(from.marginTop, to.marginTop, 0)
  }
  if (from.marginRight !== undefined || to.marginRight !== undefined) {
    result.marginRight = lerpStr(from.marginRight, to.marginRight, 0)
  }
  if (from.marginBottom !== undefined || to.marginBottom !== undefined) {
    result.marginBottom = lerpStr(from.marginBottom, to.marginBottom, 0)
  }
  if (from.marginLeft !== undefined || to.marginLeft !== undefined) {
    result.marginLeft = lerpStr(from.marginLeft, to.marginLeft, 0)
  }

  // Colors - these don't interpolate well without color parsing, so just switch at 50%
  if (from.backgroundColor !== undefined || to.backgroundColor !== undefined) {
    result.backgroundColor = progress < 0.5 ? from.backgroundColor : to.backgroundColor
  }
  if (from.color !== undefined || to.color !== undefined) {
    result.color = progress < 0.5 ? from.color : to.color
  }
  if (from.borderColor !== undefined || to.borderColor !== undefined) {
    result.borderColor = progress < 0.5 ? from.borderColor : to.borderColor
  }

  // Shadow
  if (from.shadowX !== undefined || to.shadowX !== undefined) {
    result.shadowX = lerpStr(from.shadowX, to.shadowX, 0)
  }
  if (from.shadowY !== undefined || to.shadowY !== undefined) {
    result.shadowY = lerpStr(from.shadowY, to.shadowY, 0)
  }
  if (from.shadowBlur !== undefined || to.shadowBlur !== undefined) {
    result.shadowBlur = lerpStr(from.shadowBlur, to.shadowBlur, 0)
  }
  if (from.shadowSpread !== undefined || to.shadowSpread !== undefined) {
    result.shadowSpread = lerpStr(from.shadowSpread, to.shadowSpread, 0)
  }
  if (from.shadowColor !== undefined || to.shadowColor !== undefined) {
    result.shadowColor = progress < 0.5 ? from.shadowColor : to.shadowColor
  }

  return result
}

/**
 * Calculate stagger delay for a child element
 */
export function calculateStaggerDelay(
  index: number,
  totalChildren: number,
  config: StaggerConfig
): number {
  if (!config.enabled || !config.amount) return 0

  const amount = config.amount
  const from = config.from || 'first'

  switch (from) {
    case 'first':
      return index * amount
    case 'last':
      return (totalChildren - 1 - index) * amount
    case 'center': {
      const center = (totalChildren - 1) / 2
      return Math.abs(index - center) * amount
    }
    case 'edges': {
      const center = (totalChildren - 1) / 2
      return (center - Math.abs(index - center)) * amount
    }
    default:
      return index * amount
  }
}

/**
 * Calculate stagger delay for grid layout
 */
export function calculateGridStaggerDelay(
  index: number,
  config: StaggerConfig
): number {
  if (!config.enabled || !config.amount || !config.grid) return 0

  const { columns = 3, direction = 'row' } = config.grid
  const amount = config.amount
  const row = Math.floor(index / columns)
  const col = index % columns

  switch (direction) {
    case 'row':
      return (row * columns + col) * amount
    case 'column':
      return (col * Math.ceil(index / columns) + row) * amount
    case 'diagonal':
      return (row + col) * amount
    default:
      return index * amount
  }
}

/**
 * Generate CSS keyframes string from EffectKeyframe array
 */
export function generateKeyframesCSS(
  keyframes: EffectKeyframe[],
  animationName: string,
  perspective?: string
): string {
  const frames = keyframes
    .map(kf => {
      const styles = effectStateToCSS(kf, { perspective })
      const styleStr = Object.entries(styles)
        .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
        .join('; ')
      return `${kf.offset}% { ${styleStr} }`
    })
    .join('\n  ')

  return `@keyframes ${animationName} {\n  ${frames}\n}`
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Get CSS easing value from EffectEasing type
 */
export function getEasingCSS(easing: EffectEasing): string {
  return easingValues[easing] || 'ease'
}

/**
 * Get transform origin CSS value
 */
export function getTransformOriginCSS(origin: TransformOrigin): string {
  return transformOriginValues[origin] || 'center center'
}
