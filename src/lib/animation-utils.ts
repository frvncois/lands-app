/**
 * Animation Utilities
 *
 * Provides animation presets, CSS generation, and helpers for the animation system.
 */

import type { AnimationSettings, AnimationPreset, AnimationTrigger, AnimationEasing } from '@/types/designer'

// ============================================
// ANIMATION PRESET DEFINITIONS
// ============================================

export interface AnimationPresetInfo {
  id: AnimationPreset
  label: string
  icon: string
  category: 'fade' | 'zoom' | 'slide' | 'rotate'
}

export const animationPresets: AnimationPresetInfo[] = [
  { id: 'none', label: 'None', icon: 'lni-ban', category: 'fade' },
  { id: 'fade-in', label: 'Fade In', icon: 'lni-eye', category: 'fade' },
  { id: 'fade-up', label: 'Fade Up', icon: 'lni-arrow-up', category: 'fade' },
  { id: 'fade-down', label: 'Fade Down', icon: 'lni-arrow-down', category: 'fade' },
  { id: 'fade-left', label: 'Fade Left', icon: 'lni-arrow-left', category: 'fade' },
  { id: 'fade-right', label: 'Fade Right', icon: 'lni-arrow-right', category: 'fade' },
  { id: 'zoom-in', label: 'Zoom In', icon: 'lni-zoom-in', category: 'zoom' },
  { id: 'zoom-out', label: 'Zoom Out', icon: 'lni-zoom-out', category: 'zoom' },
  { id: 'rotate-in', label: 'Rotate In', icon: 'lni-reload', category: 'rotate' },
  { id: 'slide-up', label: 'Slide Up', icon: 'lni-shift-up', category: 'slide' },
  { id: 'slide-down', label: 'Slide Down', icon: 'lni-shift-down', category: 'slide' },
  { id: 'slide-left', label: 'Slide Left', icon: 'lni-shift-left', category: 'slide' },
  { id: 'slide-right', label: 'Slide Right', icon: 'lni-shift-right', category: 'slide' },
]

export const animationPresetOptions = animationPresets.map(p => ({
  value: p.id,
  label: p.label,
}))

// ============================================
// TRIGGER DEFINITIONS
// ============================================

export interface AnimationTriggerInfo {
  id: AnimationTrigger
  label: string
  icon: string
  description: string
}

export const animationTriggers: AnimationTriggerInfo[] = [
  { id: 'none', label: 'None', icon: 'lni-ban', description: 'Animation disabled' },
  { id: 'page-load', label: 'Page Load', icon: 'lni-enter', description: 'Plays once when page loads' },
  { id: 'in-view', label: 'Scroll Into View', icon: 'lni-eye', description: 'Plays when element enters viewport' },
  { id: 'hover', label: 'On Hover', icon: 'lni-pointer-1', description: 'Plays when mouse hovers' },
]

export const animationTriggerOptions = animationTriggers.map(t => ({
  value: t.id,
  label: t.label,
}))

// ============================================
// EASING DEFINITIONS
// ============================================

export interface AnimationEasingInfo {
  id: AnimationEasing
  label: string
}

export const animationEasings: AnimationEasingInfo[] = [
  { id: 'ease', label: 'Ease' },
  { id: 'ease-in', label: 'Ease In' },
  { id: 'ease-out', label: 'Ease Out' },
  { id: 'ease-in-out', label: 'Ease In Out' },
  { id: 'linear', label: 'Linear' },
]

export const animationEasingOptions = animationEasings.map(e => ({
  value: e.id,
  label: e.label,
}))

// ============================================
// DEFAULT ANIMATION SETTINGS
// ============================================

export function getDefaultAnimationSettings(): AnimationSettings {
  return {
    enabled: false,
    trigger: 'none',
    preset: 'fade-in',
    duration: 500,
    delay: 0,
    easing: 'ease-out',
    reverseOnHoverOut: true,
    scrollOffset: 20,
    repeatOnScroll: false,
  }
}

// ============================================
// CSS KEYFRAMES DEFINITIONS
// ============================================

// Initial state for each animation (before animation plays)
export const animationInitialStates: Record<AnimationPreset, string> = {
  'none': '',
  'fade-in': 'opacity: 0;',
  'fade-up': 'opacity: 0; transform: translateY(30px);',
  'fade-down': 'opacity: 0; transform: translateY(-30px);',
  'fade-left': 'opacity: 0; transform: translateX(30px);',
  'fade-right': 'opacity: 0; transform: translateX(-30px);',
  'zoom-in': 'opacity: 0; transform: scale(0.9);',
  'zoom-out': 'opacity: 0; transform: scale(1.1);',
  'rotate-in': 'opacity: 0; transform: rotate(-10deg) scale(0.95);',
  'slide-up': 'transform: translateY(100%);',
  'slide-down': 'transform: translateY(-100%);',
  'slide-left': 'transform: translateX(100%);',
  'slide-right': 'transform: translateX(-100%);',
}

// Final state for each animation (after animation completes)
export const animationFinalStates: Record<AnimationPreset, string> = {
  'none': '',
  'fade-in': 'opacity: 1;',
  'fade-up': 'opacity: 1; transform: translateY(0);',
  'fade-down': 'opacity: 1; transform: translateY(0);',
  'fade-left': 'opacity: 1; transform: translateX(0);',
  'fade-right': 'opacity: 1; transform: translateX(0);',
  'zoom-in': 'opacity: 1; transform: scale(1);',
  'zoom-out': 'opacity: 1; transform: scale(1);',
  'rotate-in': 'opacity: 1; transform: rotate(0) scale(1);',
  'slide-up': 'transform: translateY(0);',
  'slide-down': 'transform: translateY(0);',
  'slide-left': 'transform: translateX(0);',
  'slide-right': 'transform: translateX(0);',
}

// Pre-parsed initial states as style objects (avoids runtime string parsing)
export const animationInitialStyleObjects: Record<AnimationPreset, Record<string, string>> = {
  'none': {},
  'fade-in': { opacity: '0' },
  'fade-up': { opacity: '0', transform: 'translateY(30px)' },
  'fade-down': { opacity: '0', transform: 'translateY(-30px)' },
  'fade-left': { opacity: '0', transform: 'translateX(30px)' },
  'fade-right': { opacity: '0', transform: 'translateX(-30px)' },
  'zoom-in': { opacity: '0', transform: 'scale(0.9)' },
  'zoom-out': { opacity: '0', transform: 'scale(1.1)' },
  'rotate-in': { opacity: '0', transform: 'rotate(-10deg) scale(0.95)' },
  'slide-up': { transform: 'translateY(100%)' },
  'slide-down': { transform: 'translateY(-100%)' },
  'slide-left': { transform: 'translateX(100%)' },
  'slide-right': { transform: 'translateX(-100%)' },
}

// Pre-parsed final states as style objects (avoids runtime string parsing)
export const animationFinalStyleObjects: Record<AnimationPreset, Record<string, string>> = {
  'none': {},
  'fade-in': { opacity: '1' },
  'fade-up': { opacity: '1', transform: 'translateY(0)' },
  'fade-down': { opacity: '1', transform: 'translateY(0)' },
  'fade-left': { opacity: '1', transform: 'translateX(0)' },
  'fade-right': { opacity: '1', transform: 'translateX(0)' },
  'zoom-in': { opacity: '1', transform: 'scale(1)' },
  'zoom-out': { opacity: '1', transform: 'scale(1)' },
  'rotate-in': { opacity: '1', transform: 'rotate(0) scale(1)' },
  'slide-up': { transform: 'translateY(0)' },
  'slide-down': { transform: 'translateY(0)' },
  'slide-left': { transform: 'translateX(0)' },
  'slide-right': { transform: 'translateX(0)' },
}

// ============================================
// CSS GENERATION
// ============================================

/**
 * Generate CSS keyframe name for an animation
 */
export function getAnimationKeyframeName(preset: AnimationPreset): string {
  return `lands-anim-${preset}`
}

/**
 * Generate CSS keyframes definition for an animation preset
 */
export function generateKeyframes(preset: AnimationPreset): string {
  if (preset === 'none') return ''

  const initial = animationInitialStates[preset]
  const final = animationFinalStates[preset]
  const name = getAnimationKeyframeName(preset)

  return `
@keyframes ${name} {
  from { ${initial} }
  to { ${final} }
}
`
}

/**
 * Generate all keyframes CSS for all animation presets
 */
export function generateAllKeyframes(): string {
  return animationPresets
    .filter(p => p.id !== 'none')
    .map(p => generateKeyframes(p.id))
    .join('\n')
}

/**
 * Generate inline CSS styles for animation initial state
 */
export function getAnimationInitialStyle(settings: AnimationSettings | undefined): string {
  if (!settings?.enabled || settings.trigger === 'none' || settings.preset === 'none') {
    return ''
  }

  // For hover trigger, we don't apply initial state - the animation plays on hover
  if (settings.trigger === 'hover') {
    return ''
  }

  return animationInitialStates[settings.preset]
}

/**
 * Generate CSS animation property value
 */
export function getAnimationCSSValue(settings: AnimationSettings): string {
  if (!settings.enabled || settings.preset === 'none') return 'none'

  const name = getAnimationKeyframeName(settings.preset)
  const duration = `${settings.duration}ms`
  const delay = `${settings.delay}ms`
  const easing = settings.easing
  const fillMode = 'forwards'

  return `${name} ${duration} ${easing} ${delay} 1 ${fillMode}`
}

/**
 * Generate CSS transition property for hover animations
 */
export function getHoverTransition(settings: AnimationSettings): string {
  if (!settings.enabled || settings.trigger !== 'hover') return ''

  const duration = `${settings.duration}ms`
  const easing = settings.easing

  return `all ${duration} ${easing}`
}

/**
 * Generate CSS for hover state (the animated state)
 */
export function getHoverAnimatedStyle(settings: AnimationSettings | undefined): string {
  if (!settings?.enabled || settings.trigger !== 'hover' || settings.preset === 'none') {
    return ''
  }

  return animationFinalStates[settings.preset]
}

/**
 * Generate initial CSS for hover animation (reverse of final state)
 */
export function getHoverInitialStyle(settings: AnimationSettings | undefined): string {
  if (!settings?.enabled || settings.trigger !== 'hover' || settings.preset === 'none') {
    return ''
  }

  // For hover animations, we start in the "un-animated" state
  // and transition to the final state on hover
  // So the initial is actually the final (normal state)
  // and on hover we apply the animation effect

  // For hover, we invert the logic:
  // Initial = normal appearance
  // Hover = apply the animation effect

  // Actually for hover, let's do:
  // Initial = final state (normal)
  // On hover = we do a subtle animation

  // Let me reconsider - for hover animations like "fade-up"
  // On hover, the element should move up and fade
  // But that doesn't make sense for hover...

  // For hover, it makes more sense to:
  // - zoom-in: scale up on hover
  // - fade-up: move up slightly on hover

  // Let's return the initial state (the animated "from" state)
  // and on hover we transition to a more prominent state
  return ''
}

// ============================================
// DATA ATTRIBUTES FOR ANIMATION HANDLING
// ============================================

/**
 * Generate data attributes for animation handling in JavaScript
 */
export function getAnimationDataAttributes(settings: AnimationSettings | undefined): Record<string, string> {
  if (!settings?.enabled || settings.trigger === 'none' || settings.preset === 'none') {
    return {}
  }

  const attrs: Record<string, string> = {
    'data-animation-enabled': 'true',
    'data-animation-trigger': settings.trigger,
    'data-animation-preset': settings.preset,
    'data-animation-duration': String(settings.duration),
    'data-animation-delay': String(settings.delay),
    'data-animation-easing': settings.easing,
  }

  if (settings.trigger === 'hover' && settings.reverseOnHoverOut) {
    attrs['data-animation-reverse-hover'] = 'true'
  }

  if (settings.trigger === 'in-view') {
    attrs['data-animation-scroll-offset'] = String(settings.scrollOffset ?? 20)
    if (settings.repeatOnScroll) {
      attrs['data-animation-repeat-scroll'] = 'true'
    }
  }

  return attrs
}

// ============================================
// ANIMATION CLASSES FOR PREVIEW
// ============================================

/**
 * Get CSS class for animation in preview mode
 */
export function getAnimationClass(settings: AnimationSettings | undefined, isAnimating: boolean): string {
  if (!settings?.enabled || settings.preset === 'none') return ''

  const classes: string[] = ['lands-animated']

  if (isAnimating) {
    classes.push('lands-animating')
    classes.push(`lands-anim-${settings.preset}`)
  }

  return classes.join(' ')
}

/**
 * Check if animation should be active based on trigger
 */
export function shouldAnimateOnLoad(settings: AnimationSettings | undefined): boolean {
  return settings?.enabled === true && settings.trigger === 'page-load' && settings.preset !== 'none'
}

export function shouldAnimateOnScroll(settings: AnimationSettings | undefined): boolean {
  return settings?.enabled === true && settings.trigger === 'in-view' && settings.preset !== 'none'
}

export function shouldAnimateOnHover(settings: AnimationSettings | undefined): boolean {
  return settings?.enabled === true && settings.trigger === 'hover' && settings.preset !== 'none'
}
