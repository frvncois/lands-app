/**
 * Interaction CSS utilities
 *
 * Generates CSS for the interaction system - transitions and animations
 * triggered by hover, click, load, or appear events.
 */

import type { Interaction, InteractionStyles, InteractionEasing } from '@/types/editor'

/**
 * Convert InteractionEasing to CSS easing function
 */
function easingToCSS(easing: InteractionEasing): string {
  switch (easing) {
    case 'linear':
      return 'linear'
    case 'ease':
      return 'ease'
    case 'ease-in':
      return 'ease-in'
    case 'ease-out':
      return 'ease-out'
    case 'ease-in-out':
      return 'ease-in-out'
    case 'spring':
      // Spring approximation using cubic-bezier
      return 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    default:
      return 'ease'
  }
}

/**
 * Convert InteractionStyles to CSS properties string
 */
function stylesToCSS(styles: InteractionStyles): string {
  const cssProperties: string[] = []

  // Background
  if (styles.backgroundColor) {
    cssProperties.push(`background-color: ${styles.backgroundColor}`)
  }

  // Border
  if (styles.border) {
    if (styles.border.width) {
      cssProperties.push(`border-width: ${styles.border.width}`)
    }
    if (styles.border.color) {
      cssProperties.push(`border-color: ${styles.border.color}`)
    }
    if (styles.border.radius) {
      cssProperties.push(`border-radius: ${styles.border.radius}`)
    }
    if (styles.border.style) {
      cssProperties.push(`border-style: ${styles.border.style}`)
    }
  }

  // Opacity - convert from 0-100 to 0-1 if needed
  if (styles.opacity !== undefined) {
    const opacity = Number(styles.opacity)
    // If value > 1, assume it's in 0-100 scale
    const normalizedOpacity = opacity > 1 ? opacity / 100 : opacity
    cssProperties.push(`opacity: ${normalizedOpacity}`)
  }

  // Shadow
  if (styles.shadow?.enabled) {
    const x = styles.shadow.x || '0px'
    const y = styles.shadow.y || '4px'
    const blur = styles.shadow.blur || '8px'
    const color = styles.shadow.color || 'rgba(0, 0, 0, 0.1)'
    cssProperties.push(`box-shadow: ${x} ${y} ${blur} ${color}`)
  } else if (styles.shadow && styles.shadow.enabled === false) {
    cssProperties.push('box-shadow: none')
  }

  // Transform - build composite transform
  const transforms: string[] = []
  if (styles.scale) {
    transforms.push(`scale(${styles.scale})`)
  }
  if (styles.rotate) {
    // Add 'deg' if not present
    const rotate = String(styles.rotate)
    const rotateValue = rotate.includes('deg') ? rotate : `${rotate}deg`
    transforms.push(`rotate(${rotateValue})`)
  }
  if (styles.translateX || styles.translateY) {
    // Add 'px' if no unit present
    const x = styles.translateX ? (String(styles.translateX).match(/[a-z%]+$/i) ? styles.translateX : `${styles.translateX}px`) : '0'
    const y = styles.translateY ? (String(styles.translateY).match(/[a-z%]+$/i) ? styles.translateY : `${styles.translateY}px`) : '0'
    transforms.push(`translate(${x}, ${y})`)
  }
  if (styles.transform) {
    transforms.push(styles.transform)
  }
  if (transforms.length > 0) {
    cssProperties.push(`transform: ${transforms.join(' ')}`)
  }

  // Padding
  if (styles.padding) {
    if (styles.padding.top) cssProperties.push(`padding-top: ${styles.padding.top}`)
    if (styles.padding.right) cssProperties.push(`padding-right: ${styles.padding.right}`)
    if (styles.padding.bottom) cssProperties.push(`padding-bottom: ${styles.padding.bottom}`)
    if (styles.padding.left) cssProperties.push(`padding-left: ${styles.padding.left}`)
  }

  // Margin
  if (styles.margin) {
    if (styles.margin.top) cssProperties.push(`margin-top: ${styles.margin.top}`)
    if (styles.margin.right) cssProperties.push(`margin-right: ${styles.margin.right}`)
    if (styles.margin.bottom) cssProperties.push(`margin-bottom: ${styles.margin.bottom}`)
    if (styles.margin.left) cssProperties.push(`margin-left: ${styles.margin.left}`)
  }

  // Typography
  if (styles.color) {
    cssProperties.push(`color: ${styles.color}`)
  }
  if (styles.fontSize) {
    cssProperties.push(`font-size: ${styles.fontSize}`)
  }

  // Dimensions
  if (styles.width) {
    cssProperties.push(`width: ${styles.width}`)
  }
  if (styles.height) {
    cssProperties.push(`height: ${styles.height}`)
  }

  return cssProperties.join('; ')
}

/**
 * Get the CSS properties that will be transitioned
 */
function getTransitionProperties(styles: InteractionStyles): string[] {
  const properties: string[] = []

  if (styles.backgroundColor) properties.push('background-color')
  if (styles.border) {
    properties.push('border-width', 'border-color', 'border-radius')
  }
  if (styles.opacity !== undefined) properties.push('opacity')
  if (styles.shadow) properties.push('box-shadow')
  if (styles.scale || styles.rotate || styles.translateX || styles.translateY || styles.transform) {
    properties.push('transform')
  }
  if (styles.padding) properties.push('padding')
  if (styles.margin) properties.push('margin')
  if (styles.color) properties.push('color')
  if (styles.fontSize) properties.push('font-size')
  if (styles.width) properties.push('width')
  if (styles.height) properties.push('height')

  // If no specific properties, use 'all'
  return properties.length > 0 ? properties : ['all']
}

/**
 * Generate CSS for a single hover interaction
 */
function generateHoverCSS(interaction: Interaction): string {
  const triggerSelector = `[data-block-id="${interaction.triggerBlockId}"]`
  const targetSelector = `[data-block-id="${interaction.targetBlockId}"]`
  const isSelfTarget = interaction.triggerBlockId === interaction.targetBlockId

  const duration = interaction.duration.includes('ms') || interaction.duration.includes('s')
    ? interaction.duration
    : `${interaction.duration}ms`
  const easing = easingToCSS(interaction.easing)
  const delay = interaction.delay
    ? (interaction.delay.includes('ms') || interaction.delay.includes('s')
      ? interaction.delay
      : `${interaction.delay}ms`)
    : '0ms'

  const transitionProps = getTransitionProperties(interaction.styles)
  const transitionValue = transitionProps.map(prop =>
    `${prop} ${duration} ${easing} ${delay}`
  ).join(', ')

  const styleCSS = stylesToCSS(interaction.styles)

  let css = ''

  // Add transition to target element
  css += `${targetSelector} {
  transition: ${transitionValue};
}\n`

  if (isSelfTarget) {
    // Simple case: hover on self
    css += `${triggerSelector}:hover {
  ${styleCSS};
}\n`
  } else {
    // Cross-block: trigger affects another block
    // Handle various DOM relationships

    // Case 1: Target is a descendant of trigger
    css += `${triggerSelector}:hover ${targetSelector} {
  ${styleCSS};
}\n`

    // Case 2: Target is a sibling (general sibling combinator)
    css += `${triggerSelector}:hover ~ ${targetSelector} {
  ${styleCSS};
}\n`

    // Case 3: Use a parent container with has() for more complex cases
    // This allows targeting any block when hovering over any other block
    css += `.lands-preview:has(${triggerSelector}:hover) ${targetSelector} {
  ${styleCSS};
}\n`
  }

  return css
}

/**
 * Generate CSS for a click interaction (uses active state + JS toggle class)
 */
function generateClickCSS(interaction: Interaction): string {
  const targetSelector = `[data-block-id="${interaction.targetBlockId}"]`

  const duration = interaction.duration.includes('ms') || interaction.duration.includes('s')
    ? interaction.duration
    : `${interaction.duration}ms`
  const easing = easingToCSS(interaction.easing)
  const delay = interaction.delay
    ? (interaction.delay.includes('ms') || interaction.delay.includes('s')
      ? interaction.delay
      : `${interaction.delay}ms`)
    : '0ms'

  const transitionProps = getTransitionProperties(interaction.styles)
  const transitionValue = transitionProps.map(prop =>
    `${prop} ${duration} ${easing} ${delay}`
  ).join(', ')

  const styleCSS = stylesToCSS(interaction.styles)

  // For click interactions, we use a class that's toggled via JavaScript
  // The class format is: interaction-active-{interactionId}
  return `${targetSelector} {
  transition: ${transitionValue};
}
${targetSelector}.interaction-active-${interaction.id} {
  ${styleCSS};
}\n`
}

/**
 * Generate CSS for a load animation
 */
function generateLoadCSS(interaction: Interaction): string {
  const targetSelector = `[data-block-id="${interaction.targetBlockId}"]`

  const duration = interaction.duration.includes('ms') || interaction.duration.includes('s')
    ? interaction.duration
    : `${interaction.duration}ms`
  const easing = easingToCSS(interaction.easing)
  const delay = interaction.delay
    ? (interaction.delay.includes('ms') || interaction.delay.includes('s')
      ? interaction.delay
      : `${interaction.delay}ms`)
    : '0ms'

  const styleCSS = stylesToCSS(interaction.styles)
  const animationName = `interaction-load-${interaction.id}`

  return `@keyframes ${animationName} {
  from {
    /* Initial state - opposite of target styles */
  }
  to {
    ${styleCSS};
  }
}
${targetSelector} {
  animation: ${animationName} ${duration} ${easing} ${delay} forwards;
}\n`
}

/**
 * Generate CSS for an appear animation (triggered by intersection observer)
 */
function generateAppearCSS(interaction: Interaction): string {
  const targetSelector = `[data-block-id="${interaction.targetBlockId}"]`

  const duration = interaction.duration.includes('ms') || interaction.duration.includes('s')
    ? interaction.duration
    : `${interaction.duration}ms`
  const easing = easingToCSS(interaction.easing)
  const delay = interaction.delay
    ? (interaction.delay.includes('ms') || interaction.delay.includes('s')
      ? interaction.delay
      : `${interaction.delay}ms`)
    : '0ms'

  const transitionProps = getTransitionProperties(interaction.styles)
  const transitionValue = transitionProps.map(prop =>
    `${prop} ${duration} ${easing} ${delay}`
  ).join(', ')

  const styleCSS = stylesToCSS(interaction.styles)

  // Appear uses a class that's added via IntersectionObserver
  return `${targetSelector} {
  transition: ${transitionValue};
}
${targetSelector}.interaction-visible-${interaction.id} {
  ${styleCSS};
}\n`
}

/**
 * Generate CSS for all interactions on a page
 */
export function generateInteractionCSS(interactions: Interaction[]): string {
  if (!interactions || interactions.length === 0) {
    return ''
  }

  const cssBlocks: string[] = []

  for (const interaction of interactions) {
    // Skip interactions with no styles
    if (!interaction.styles || Object.keys(interaction.styles).length === 0) {
      continue
    }

    switch (interaction.trigger) {
      case 'hover':
        cssBlocks.push(generateHoverCSS(interaction))
        break
      case 'click':
        cssBlocks.push(generateClickCSS(interaction))
        break
      case 'load':
        cssBlocks.push(generateLoadCSS(interaction))
        break
      case 'appear':
        cssBlocks.push(generateAppearCSS(interaction))
        break
    }
  }

  return cssBlocks.join('\n')
}

/**
 * Get interactions that require JavaScript handling
 */
export function getJSInteractions(interactions: Interaction[]): {
  click: Interaction[]
  appear: Interaction[]
} {
  return {
    click: interactions.filter(i => i.trigger === 'click'),
    appear: interactions.filter(i => i.trigger === 'appear'),
  }
}

/**
 * Helper to check if an interaction has any meaningful styles
 */
export function hasInteractionStyles(styles: InteractionStyles): boolean {
  return Object.keys(styles).length > 0
}
