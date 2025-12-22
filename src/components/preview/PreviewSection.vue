<script setup lang="ts">
import { ref, computed, watch, onUnmounted, toRef, provide, inject } from 'vue'
import type { ComputedRef } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import { useAIAssistant } from '@/composables/useAIAssistant'
import type {
  SectionBlock,
  SectionBlockType,
  GridSettings,
  StackSettings,
  CanvasSettings,
  CanvasChildPosition,
  ViewportSize,
  ChildEffectOverride,
} from '@/types/designer'
import {
  calculateStaggerDelay,
  calculateGridStaggerDelay,
  effectStateToCSS,
  interpolateEffectStates,
  getEasingCSS,
  getPresetConfig,
} from '@/lib/effect-utils'

// Import shared injection keys
import {
  STAGGER_CONTEXT_KEY,
  CHILD_EFFECTS_CONTEXT_KEY,
  READONLY_MODE_KEY,
  CONTENT_PREVIEW_MODE_KEY,
  type StaggerContext,
  type ChildEffectsContext,
} from './injection-keys'

// Composables
import { useBlockSettings } from './composables/useBlockSettings'
import { useBlockStyles } from './composables/useBlockStyles'

import { sectionBlockLabels, sectionBlockIcons, canHaveChildren } from '@/lib/designer-utils'
import { isListContainer } from '@/lib/list-presets'
import type { ListPresetType } from '@/lib/list-presets'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import ContextMenuItem from '@/components/ui/ContextMenuItem.vue'
import ContextMenuDivider from '@/components/ui/ContextMenuDivider.vue'
import SidebarBlockPicker from '@/components/builder/SidebarBlockPicker.vue'
import InlineFormatToolbar from '@/components/preview/InlineFormatToolbar.vue'
import Icon from '@/components/ui/Icon.vue'

// Block components
import {
  IconBlock,
  HeadingBlock,
  TextBlock,
  ButtonBlock,
  ImageBlock,
  VideoBlock,
  VariantsBlock,
  ContainerBlock,
  StackBlock,
  GridBlock,
  SliderBlock,
  CanvasBlock,
  FormBlock,
  FormInputBlock,
  FormTextareaBlock,
  FormCheckboxBlock,
  FormRadioBlock,
  FormButtonBlock,
  FormLabelBlock,
} from './blocks'


const props = defineProps<{
  block: SectionBlock
  index: number
  total: number
}>()

const designerStore = useDesignerStore()
const { isOpen: isAIOpen } = useAIAssistant()

// Check if we're in readonly mode (content preview)
const isReadonlyMode = inject(READONLY_MODE_KEY, false)
// Check if we're in content preview mode (show hover for content blocks)
const isContentPreviewMode = inject(CONTENT_PREVIEW_MODE_KEY, false)

// Content block types that should show hover in content preview mode
const contentBlockTypes: SectionBlockType[] = ['heading', 'text', 'image', 'video', 'button', 'icon']
const isContentBlock = computed(() => contentBlockTypes.includes(props.block.type))

// Initialize composables with block ref
const blockRef = toRef(props, 'block')
const viewportRef = computed(() => designerStore.viewport as ViewportSize)
const isAnimating = ref(false)

// Effect state tracking
const isEffectHovering = ref(false)
const hasAppeared = ref(false)
const scrollProgress = ref(0)
const isLooping = ref(false)
const loopAtTo = ref(false) // Toggle between from/to states for loop
let loopIntervalId: ReturnType<typeof setInterval> | null = null

// Block settings composable - provides typed access to settings
const {
  headingSettings,
  textSettings,
  buttonSettings,
  isBlockHidden,
} = useBlockSettings(blockRef)

// Block styles composable - provides computed CSS styles
const {
  baseStyles: blockStyles,
  wrapperStyles,
  animationStyles,
  hoverAnimationStyles,
  blockAnimation,
  isFixedOrSticky,
  // New effects
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
} = useBlockStyles(blockRef, {
  viewport: viewportRef,
  isAnimating,
  isHovering: isEffectHovering,
  hasAppeared,
  scrollProgress,
})

// ============================================
// STAGGER CONTEXT
// ============================================

// Inject parent's stagger context if available
const parentStaggerContext = inject<StaggerContext | null>(STAGGER_CONTEXT_KEY, null)

// Calculate stagger delay for this child (if parent has stagger enabled)
const staggerDelay = computed(() => {
  if (!parentStaggerContext) return 0

  const { config, totalChildren } = parentStaggerContext

  // Use grid stagger if grid config is present
  if (config.grid) {
    return calculateGridStaggerDelay(props.index, config)
  }

  return calculateStaggerDelay(props.index, totalChildren, config)
})

// Provide stagger context to children if this block has applyToChildren enabled
const provideStaggerContext = computed(() => {
  // Check all effect types for applyToChildren + stagger
  const effects = [
    { effect: appearEffect.value, type: 'appear' as const },
    { effect: hoverEffect.value, type: 'hover' as const },
    { effect: scrollEffect.value, type: 'scroll' as const },
  ]

  for (const { effect, type } of effects) {
    if (effect?.enabled && effect?.applyToChildren && effect?.stagger?.enabled) {
      return {
        config: effect.stagger,
        totalChildren: props.block.children?.length || 0,
        effectType: type,
      }
    }
  }

  return null
})

// Provide stagger context to children
provide(STAGGER_CONTEXT_KEY, provideStaggerContext.value)

// Watch for changes and re-provide
watch(provideStaggerContext, (ctx) => {
  provide(STAGGER_CONTEXT_KEY, ctx)
})

// ============================================
// CHILD EFFECTS CONTEXT
// ============================================

// Inject parent's child effects context if available (it's a computed ref)
const parentChildEffectsContextRef = inject<ComputedRef<ChildEffectsContext | null> | null>(CHILD_EFFECTS_CONTEXT_KEY, null)

// Unwrap the computed ref for easier access
const parentChildEffectsContext = computed(() => parentChildEffectsContextRef?.value ?? null)

// Check if this block has an override from parent
const childHoverOverride = computed(() => {
  const ctx = parentChildEffectsContext.value
  if (!ctx?.hoverOverrides) return null
  return ctx.hoverOverrides.find(o => o.childId === props.block.id) || null
})

const childAppearOverride = computed(() => {
  const ctx = parentChildEffectsContext.value
  if (!ctx?.appearOverrides) return null
  return ctx.appearOverrides.find(o => o.childId === props.block.id) || null
})

const childScrollOverride = computed(() => {
  const ctx = parentChildEffectsContext.value
  if (!ctx?.scrollOverrides) return null
  return ctx.scrollOverrides.find(o => o.childId === props.block.id) || null
})

// Provide child effects context to our children if we have effects with childOverrides
// If we don't have our own overrides, forward the parent's context so deeply nested children can still access it
const provideChildEffectsContext = computed((): ChildEffectsContext | null => {
  const hasHoverOverrides = hoverEffect.value?.enabled && hoverEffect.value?.childOverrides?.length
  const hasAppearOverrides = appearEffect.value?.enabled && appearEffect.value?.childOverrides?.length
  const hasScrollOverrides = scrollEffect.value?.enabled && scrollEffect.value?.childOverrides?.length

  if (!hasHoverOverrides && !hasAppearOverrides && !hasScrollOverrides) {
    // No own overrides - forward parent's context so deeply nested children can access it
    return parentChildEffectsContext.value
  }

  return {
    isParentHovering: isEffectHovering,
    hasParentAppeared: hasAppeared,
    parentScrollProgress: scrollProgress,
    hoverOverrides: hoverEffect.value?.childOverrides,
    appearOverrides: appearEffect.value?.childOverrides,
    scrollOverrides: scrollEffect.value?.childOverrides,
    parentHoverEffect: hoverEffect.value,
    parentAppearEffect: appearEffect.value,
    parentScrollEffect: scrollEffect.value,
  }
})

// Provide child effects context as computed ref so children can react to changes
provide(CHILD_EFFECTS_CONTEXT_KEY, provideChildEffectsContext)

// ============================================
// CHILD-SPECIFIC EFFECT STYLES
// ============================================

// Get from/to states for child override (handles preset)
function getChildOverrideStates(override: ChildEffectOverride) {
  if (override.preset && override.preset !== 'custom') {
    const presetConfig = getPresetConfig(override.preset)
    return {
      from: { ...presetConfig.from, ...override.from },
      to: { ...presetConfig.to, ...override.to },
    }
  }
  return {
    from: override.from || {},
    to: override.to || {},
  }
}

// Child-specific hover effect styles
const childHoverEffectStyles = computed(() => {
  const ctx = parentChildEffectsContext.value
  if (!childHoverOverride.value || !ctx) return {}

  const override = childHoverOverride.value
  const parentEffect = ctx.parentHoverEffect
  const isHovering = ctx.isParentHovering.value

  const duration = override.duration ?? parentEffect?.duration ?? 300
  const easing = override.easing ?? parentEffect?.easing ?? 'ease-out'
  const easingCSS = getEasingCSS(easing)
  const { from, to } = getChildOverrideStates(override)

  const base: Record<string, string> = {
    transition: `all ${duration}ms ${easingCSS}`,
  }

  if (override.delay) {
    base.transitionDelay = `${override.delay}ms`
  }

  if (isHovering) {
    return { ...base, ...effectStateToCSS(to) }
  } else {
    return { ...base, ...effectStateToCSS(from) }
  }
})

// Child-specific appear effect styles
const childAppearEffectStyles = computed(() => {
  const ctx = parentChildEffectsContext.value
  if (!childAppearOverride.value || !ctx) return {}

  const override = childAppearOverride.value
  const parentEffect = ctx.parentAppearEffect
  const hasAppearedVal = ctx.hasParentAppeared.value

  const duration = override.duration ?? parentEffect?.duration ?? 600
  const delay = override.delay ?? parentEffect?.delay ?? 0
  const easing = override.easing ?? parentEffect?.easing ?? 'ease-out'
  const easingCSS = getEasingCSS(easing)
  const { from, to } = getChildOverrideStates(override)

  if (!hasAppearedVal) {
    return effectStateToCSS(from)
  }

  return {
    ...effectStateToCSS(to),
    transition: `all ${duration}ms ${easingCSS} ${delay}ms`,
  }
})

// Child-specific scroll effect styles
const childScrollEffectStyles = computed(() => {
  const ctx = parentChildEffectsContext.value
  if (!childScrollOverride.value || !ctx) return {}

  const override = childScrollOverride.value
  let progress = ctx.parentScrollProgress.value

  // Apply child's own scrollRange if defined
  if (override.scrollRange) {
    const startPercent = override.scrollRange.start ?? 0
    const endPercent = override.scrollRange.end ?? 100
    const rangeStart = startPercent / 100
    const rangeEnd = endPercent / 100
    const rangeSize = rangeEnd - rangeStart

    if (rangeSize > 0) {
      if (progress <= rangeStart) {
        progress = 0
      } else if (progress >= rangeEnd) {
        progress = 1
      } else {
        progress = (progress - rangeStart) / rangeSize
      }
    }
  }

  const { from, to } = getChildOverrideStates(override)
  const interpolatedState = interpolateEffectStates(from, to, progress)
  return effectStateToCSS(interpolatedState)
})

// Combined effect styles with stagger delay and child overrides applied
const combinedEffectStyles = computed(() => {
  // Check if we have child-specific overrides from parent
  const hasChildOverrides = childHoverOverride.value || childAppearOverride.value || childScrollOverride.value

  let styles: Record<string, string> = {}

  if (hasChildOverrides) {
    // Use child-specific effect styles
    styles = {
      ...childHoverEffectStyles.value,
      ...childAppearEffectStyles.value,
      ...childScrollEffectStyles.value,
    }
  } else {
    // Use this block's own effect styles
    styles = {
      ...hoverEffectStyles.value,
      ...appearEffectStyles.value,
      ...scrollEffectStyles.value,
    }

    // Add loop effect styles if looping
    if (loopEffect.value?.enabled && isLooping.value) {
      const loopStateStyles = loopAtTo.value ? loopToStyles.value : loopFromStyles.value
      styles = {
        ...styles,
        ...loopEffectStyles.value,
        ...loopStateStyles,
      }
    }
  }

  // Apply stagger delay if we're a child with stagger context
  if (staggerDelay.value > 0 && parentStaggerContext) {
    const { effectType } = parentStaggerContext

    // Add stagger delay to the transition
    if (effectType === 'appear' || effectType === 'hover') {
      // Parse existing transition and add delay
      const existingTransition = styles.transition || ''
      if (existingTransition) {
        // Add stagger delay to the transition delay
        const parts = existingTransition.split(' ')
        // Insert delay after duration (format: property duration easing delay)
        if (parts.length >= 3) {
          styles.transitionDelay = `${staggerDelay.value}ms`
        }
      } else {
        styles.transitionDelay = `${staggerDelay.value}ms`
      }
    }
  }

  return styles
})

// Note: Composables (useCanvasDrag, useGridResize) are available
// but not yet wired to the layout blocks which still use inline implementations

const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const editableRef = ref<HTMLElement | null>(null)

// Check if this specific block is hovered (not parents)
// In content preview mode, only show hover for content blocks
const isHovered = computed(() => {
  const isBlockHovered = designerStore.hoveredBlockId === props.block.id
  if (!isReadonlyMode) return isBlockHovered
  if (isContentPreviewMode && isContentBlock.value) return isBlockHovered
  return false
})

// Track if label should show below (when near top of viewport)
const labelShowBelow = ref(false)

function updateLabelPosition() {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()

  // Find the scroll container (preview area)
  const scrollContainer = sectionRef.value.closest('.overflow-auto')
  const containerRect = scrollContainer?.getBoundingClientRect()
  const containerTop = containerRect?.top ?? 0

  // Check if there's enough space above for the label (24px for label + margin)
  const spaceAbove = rect.top - containerTop
  labelShowBelow.value = spaceAbove < 28
}

// ============================================
// ANIMATION STATE
// ============================================

// Check if animation preview is active for this block
const isPreviewingAnimation = computed(() => {
  return designerStore.isAnimationPreviewing(props.block.id)
})

// Watch for animation preview trigger from inspector
watch(isPreviewingAnimation, (isPreviewing) => {
  if (isPreviewing && blockAnimation.value?.enabled) {
    playAnimation()
  }
})

// ============================================
// Play animation
function playAnimation() {
  if (!blockAnimation.value?.enabled) return

  // Reset animation state
  isAnimating.value = false

  // Force reflow to restart animation
  requestAnimationFrame(() => {
    isAnimating.value = true
  })
}

// Mouse enter/leave handlers with hover animation support
function handleMouseEnter(event: MouseEvent) {
  event.stopPropagation() // Prevent parent blocks from also getting hovered

  // Update hover state in designer store
  // In content preview mode, track hover for all blocks (outline visibility is filtered in isHovered computed)
  const shouldUpdateHover = !isReadonlyMode || isContentPreviewMode
  if (shouldUpdateHover) {
    designerStore.hoverBlock(props.block.id)
    updateLabelPosition()
  }

  // Track hover state for effects (still works in readonly mode for animations)
  isEffectHovering.value = true

  // Apply hover animation styles (legacy system)
  if (blockAnimation.value?.trigger === 'hover' && sectionRef.value) {
    Object.assign(sectionRef.value.style, hoverAnimationStyles.value)
  }

  // Handle loop effect hover trigger
  if (loopEffect.value?.enabled) {
    if (loopEffect.value.startTrigger === 'hover') {
      startLoopAnimation()
    } else if (loopEffect.value.stopTrigger === 'hover') {
      stopLoopAnimation()
    }
  }
}

function handleMouseLeave(event: MouseEvent) {
  // Only clear hover if we're leaving to outside any block
  const relatedTarget = event.relatedTarget as HTMLElement | null
  const isLeavingToAnotherBlock = relatedTarget?.closest('[data-preview-block]')

  // Update hover state in designer store
  // In content preview mode, track hover for all blocks (outline visibility is filtered in isHovered computed)
  const shouldUpdateHover = !isReadonlyMode || isContentPreviewMode
  if (shouldUpdateHover && !isLeavingToAnotherBlock) {
    designerStore.hoverBlock(null)
  }

  // Track hover state for effects
  isEffectHovering.value = false

  // Remove hover animation styles (legacy system - if reverseOnHoverOut is enabled)
  if (blockAnimation.value?.trigger === 'hover' && blockAnimation.value?.reverseOnHoverOut !== false && sectionRef.value) {
    Object.keys(hoverAnimationStyles.value).forEach(key => {
      sectionRef.value!.style[key as any] = ''
    })
  }

  // Handle loop effect hover out
  if (loopEffect.value?.enabled) {
    if (loopEffect.value.startTrigger === 'hover') {
      // Stop when mouse leaves if started on hover
      stopLoopAnimation()
    }
  }
}

// Context menu handler
function handleContextMenu(event: MouseEvent) {
  // In readonly mode, don't show context menu
  if (isReadonlyMode) return

  event.preventDefault()
  event.stopPropagation()
  designerStore.selectBlock(props.block.id)
  contextMenuRef.value?.open(event)
}

// Context menu actions
function handleEditStyle() {
  designerStore.selectBlock(props.block.id)
  // Inspector is shown when block is selected, ensure it's visible
  if (designerStore.isInspectorCollapsed) {
    designerStore.toggleInspector()
  }
}

function handleCopyStyle() {
  designerStore.copyBlockStyles(props.block.id)
}

function handlePasteStyle() {
  designerStore.pasteBlockStyles(props.block.id)
}

function handleCut() {
  designerStore.cutBlock(props.block.id)
}

function handleCopy() {
  designerStore.copyBlock(props.block.id)
}

function handlePaste() {
  // Paste into this block if it's a layout block, otherwise paste at root
  if (canHaveChildren(props.block.type)) {
    designerStore.pasteBlock(props.block.id)
  } else {
    designerStore.pasteBlock()
  }
}

// Block picker for empty layout blocks
const isBlockPickerOpen = ref(false)

function openBlockPicker() {
  isBlockPickerOpen.value = true
}

function handleBlockPickerSelectBlock(type: string) {
  const block = designerStore.addBlock(type as SectionBlockType, undefined, props.block.id)
  if (block) {
    designerStore.selectBlock(block.id)
  }
}

function handleBlockPickerSelectListPreset(type: ListPresetType) {
  const block = designerStore.addListPreset(type, undefined, props.block.id)
  if (block) {
    designerStore.selectBlock(block.id)
  }
}

// Add item to list container
function handleAddListItem() {
  const newItem = designerStore.addListItem(props.block.id)
  if (newItem) {
    designerStore.selectBlock(newItem.id)
  }
}

// Add content block inside layout block
function handleAddContentBlock(type: SectionBlockType) {
  const block = designerStore.addBlock(type, undefined, props.block.id)
  if (block) {
    designerStore.selectBlock(block.id)
  }
}

// Disabled in readonly mode
const isSelected = computed(() =>
  !isReadonlyMode &&
  designerStore.selectedBlockId === props.block.id &&
  !designerStore.selectedItemId
)

// Show AI glow when block is selected and AI assistant is open
const showAIGlow = computed(() => isSelected.value && isAIOpen.value)

// Track scroll container for cleanup
let scrollContainerRef: Element | null = null

// Update label position when block becomes selected or hovered
watch([isSelected, isHovered], ([selected, hovered], [prevSelected, prevHovered]) => {
  const wasActive = prevSelected || prevHovered
  const isActive = selected || hovered

  if (isActive && !wasActive) {
    // Becoming active - add scroll listener
    updateLabelPosition()
    scrollContainerRef = sectionRef.value?.closest('.overflow-auto') ?? null
    scrollContainerRef?.addEventListener('scroll', updateLabelPosition)
  } else if (!isActive && wasActive) {
    // Becoming inactive - remove scroll listener
    scrollContainerRef?.removeEventListener('scroll', updateLabelPosition)
    scrollContainerRef = null
  } else if (isActive) {
    // Still active - just update position
    updateLabelPosition()
  }
})

// Clean up scroll listener on unmount
onUnmounted(() => {
  scrollContainerRef?.removeEventListener('scroll', updateLabelPosition)
})

// When block becomes unselected, blur contenteditable and clear text selection
watch(isSelected, (selected, wasSelected) => {
  if (!selected && wasSelected && ['heading', 'text'].includes(props.block.type)) {
    // Blur contenteditable
    const editable = sectionRef.value?.querySelector('[contenteditable="true"]') as HTMLElement
    if (editable && document.activeElement === editable) {
      editable.blur()
    }
    // Clear text selection
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  }
})

// ============================================
// EFFECTS: IntersectionObserver & Scroll
// ============================================
let appearObserver: IntersectionObserver | null = null
let effectScrollContainer: Element | null = null

// Set up IntersectionObserver for appear effects
function setupAppearObserver() {
  if (!appearEffect.value?.enabled || !sectionRef.value) return

  // For 'load' trigger, trigger immediately
  if (appearEffect.value.trigger === 'load') {
    requestAnimationFrame(() => {
      hasAppeared.value = true
    })
    return
  }

  // For 'inView' trigger, use IntersectionObserver
  appearObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          hasAppeared.value = true
          // If once is true, disconnect after triggering
          if (appearEffect.value?.once !== false) {
            appearObserver?.disconnect()
          }
        } else if (appearEffect.value?.once === false) {
          // Reset if once is false
          hasAppeared.value = false
        }
      })
    },
    {
      threshold: 0.1,
      root: sectionRef.value?.closest('.overflow-auto') ?? null,
    }
  )

  appearObserver.observe(sectionRef.value)
}

// Set up scroll listener for scroll effects
function setupScrollEffect() {
  if (!scrollEffect.value?.enabled || !sectionRef.value) return

  effectScrollContainer = sectionRef.value.closest('.overflow-auto')
  if (!effectScrollContainer) return

  effectScrollContainer.addEventListener('scroll', handleEffectScroll)
  // Initial calculation
  handleEffectScroll()
}

function handleEffectScroll() {
  if (!sectionRef.value || !effectScrollContainer) return

  const containerRect = effectScrollContainer.getBoundingClientRect()
  const blockRect = sectionRef.value.getBoundingClientRect()

  // Get user-configured scroll range settings
  const scrollRangeConfig = scrollEffect.value?.scrollRange
  const relativeTo = scrollRangeConfig?.relativeTo || 'self'
  const startPercent = scrollRangeConfig?.start ?? 0
  const endPercent = scrollRangeConfig?.end ?? 100

  // Calculate raw scroll progress based on relativeTo setting
  let rawProgress = 0

  if (relativeTo === 'page') {
    // Progress based on page/container scroll position
    const scrollTop = effectScrollContainer.scrollTop
    const scrollHeight = effectScrollContainer.scrollHeight - effectScrollContainer.clientHeight
    if (scrollHeight > 0) {
      rawProgress = scrollTop / scrollHeight
    }
  } else if (relativeTo === 'parent') {
    // Progress based on parent element's position in scroll container
    const parent = sectionRef.value.parentElement
    if (parent) {
      const parentRect = parent.getBoundingClientRect()
      const viewportHeight = containerRect.height
      // Calculate parent's position relative to the scroll container (not browser viewport)
      const relativeParentTop = parentRect.top - containerRect.top
      // When parent top is at container bottom: progress = 0
      // When parent bottom is at container top: progress = 1
      const totalTravel = viewportHeight + parentRect.height
      const currentPosition = viewportHeight - relativeParentTop
      rawProgress = Math.max(0, Math.min(1, currentPosition / totalTravel))
    }
  } else {
    // Default: 'self' - progress based on block's position in scroll container
    const viewportHeight = containerRect.height
    // Calculate block's position relative to the scroll container (not browser viewport)
    const relativeBlockTop = blockRect.top - containerRect.top
    // When block top is at container bottom: progress = 0
    // When block bottom is at container top: progress = 1
    const totalTravel = viewportHeight + blockRect.height
    const currentPosition = viewportHeight - relativeBlockTop
    rawProgress = Math.max(0, Math.min(1, currentPosition / totalTravel))
  }

  // Map the raw progress to the user-defined start/end range
  // If progress is before start%, output 0. If after end%, output 1.
  // In between, interpolate linearly.
  const rangeStart = startPercent / 100
  const rangeEnd = endPercent / 100
  const rangeSize = rangeEnd - rangeStart

  if (rangeSize <= 0) {
    // Invalid range, just use raw progress
    scrollProgress.value = rawProgress
  } else if (rawProgress <= rangeStart) {
    scrollProgress.value = 0
  } else if (rawProgress >= rangeEnd) {
    scrollProgress.value = 1
  } else {
    // Interpolate within the range
    scrollProgress.value = (rawProgress - rangeStart) / rangeSize
  }
}

// ============================================
// LOOP EFFECT
// ============================================
let loopObserver: IntersectionObserver | null = null

function startLoopAnimation() {
  if (!loopEffect.value?.enabled || isLooping.value) return

  const duration = loopEffect.value.duration || 1000
  const reverse = loopEffect.value.reverse ?? false

  isLooping.value = true
  loopAtTo.value = false

  // Start the loop interval
  loopIntervalId = setInterval(() => {
    if (reverse) {
      // Ping-pong: toggle between from and to
      loopAtTo.value = !loopAtTo.value
    } else {
      // Normal loop: go to "to" state, then reset to "from"
      if (loopAtTo.value) {
        loopAtTo.value = false
      } else {
        loopAtTo.value = true
      }
    }
  }, duration)

  // Initial state - start at "to"
  requestAnimationFrame(() => {
    loopAtTo.value = true
  })
}

function stopLoopAnimation() {
  if (loopIntervalId) {
    clearInterval(loopIntervalId)
    loopIntervalId = null
  }
  isLooping.value = false
  loopAtTo.value = false
}

function setupLoopEffect() {
  if (!loopEffect.value?.enabled || !sectionRef.value) return

  const startTrigger = loopEffect.value.startTrigger || 'load'
  const stopTrigger = loopEffect.value.stopTrigger || 'never'

  // Handle start trigger
  if (startTrigger === 'load') {
    // Start immediately on page load
    requestAnimationFrame(() => {
      startLoopAnimation()
    })
  } else if (startTrigger === 'inView') {
    // Start when in view
    loopObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startLoopAnimation()
          } else if (stopTrigger === 'outOfView') {
            stopLoopAnimation()
          }
        })
      },
      {
        threshold: 0.1,
        root: sectionRef.value?.closest('.overflow-auto') ?? null,
      }
    )
    loopObserver.observe(sectionRef.value)
  }
  // For 'hover' start trigger, it's handled by mouse events on the element
}

// Watch for effect changes and set up observers
watch(
  [appearEffect, scrollEffect, loopEffect],
  () => {
    // Clean up existing observers
    appearObserver?.disconnect()
    effectScrollContainer?.removeEventListener('scroll', handleEffectScroll)
    loopObserver?.disconnect()
    stopLoopAnimation()

    // Reset state
    hasAppeared.value = false
    scrollProgress.value = 0

    // Set up new observers
    if (sectionRef.value) {
      setupAppearObserver()
      setupScrollEffect()
      setupLoopEffect()
    }
  },
  { immediate: false }
)

// Watch for appear preview trigger from inspector
watch(
  () => designerStore.previewAppearBlockId,
  (blockId) => {
    if (blockId === props.block.id && appearEffect.value?.enabled) {
      // Reset and re-trigger the appear animation
      hasAppeared.value = false
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          hasAppeared.value = true
        })
      })
    }
  }
)

// Set up observers when mounted
watch(
  sectionRef,
  (el) => {
    if (el) {
      setupAppearObserver()
      setupScrollEffect()
      setupLoopEffect()
    }
  },
  { immediate: true }
)

// Clean up observers on unmount
onUnmounted(() => {
  appearObserver?.disconnect()
  effectScrollContainer?.removeEventListener('scroll', handleEffectScroll)
  loopObserver?.disconnect()
  stopLoopAnimation()
})

// Check if this is a protected block (none currently)
const isProtectedBlock = computed(() => false)

// Check if block can have children
const isLayoutBlock = computed(() => canHaveChildren(props.block.type))

// Check if this block is a list container (children have shared styles)
const isListContainerBlock = computed(() => isListContainer(props.block))

// Check if this block IS a list item (Stack directly inside Grid) - these can be dragged for reordering
const isListItem = computed(() => {
  if (props.block.type !== 'stack') return false
  const parent = designerStore.findParentBlock(props.block.id)
  return parent?.type === 'grid'
})

// Check if this block is INSIDE a list item (child of Stack inside Grid) - these cannot be dragged
const isBlockInsideListItem = computed(() => {
  const parent = designerStore.findParentBlock(props.block.id)
  if (!parent || parent.type !== 'stack') return false
  const grandparent = designerStore.findParentBlock(parent.id)
  return grandparent?.type === 'grid'
})

// Check if this block is inside a Canvas parent
const isInsideCanvas = computed(() => {
  const parent = designerStore.findParentBlock(props.block.id)
  return parent?.type === 'canvas'
})

// Translation-aware content getters moved to extracted block components
// (HeadingBlock, TextBlock, ButtonBlock, ImageBlock)

// Event handlers
function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement

  // Check if click is on or inside a contenteditable element
  const contentEditableEl = target.getAttribute('contenteditable') === 'true'
    ? target
    : target.closest('[contenteditable="true"]') as HTMLElement | null

  // In content preview mode, allow contenteditable focus for inline editing
  if (isContentPreviewMode && contentEditableEl) {
    // Find which block owns this contenteditable
    const ownerBlock = contentEditableEl.closest('[data-preview-block]')
    const ownerBlockId = ownerBlock?.getAttribute('data-block-id')

    // Only handle if this contenteditable belongs to THIS block
    if (ownerBlockId === props.block.id) {
      event.stopPropagation()
      // Select the block to show selection outline
      designerStore.selectBlock(props.block.id)
      // Focus the contenteditable element for editing
      contentEditableEl.focus()
      return
    }
    // Contenteditable belongs to a child block - let it bubble
    return
  }

  // In content preview mode, clicking on content blocks should select them (for outline)
  if (isContentPreviewMode && isContentBlock.value) {
    event.stopPropagation()
    designerStore.selectBlock(props.block.id)
    return
  }

  // In readonly mode, don't handle clicks (no selection)
  if (isReadonlyMode) return

  if (contentEditableEl) {
    // Find which block owns this contenteditable
    const ownerBlock = contentEditableEl.closest('[data-preview-block]')
    const ownerBlockId = ownerBlock?.getAttribute('data-block-id')

    // Only handle if this contenteditable belongs to THIS block
    if (ownerBlockId === props.block.id) {
      // For contenteditable clicks in our own block:
      // - Select the block if not already selected (for inspector)
      // - But don't interfere with native text selection behavior
      event.stopPropagation() // Stop here so parent blocks don't try to handle
      if (designerStore.selectedBlockId !== props.block.id) {
        // Delay selection to allow native focus to settle first
        requestAnimationFrame(() => {
          designerStore.selectBlock(props.block.id)
        })
      }
      // Return without calling selectBlock synchronously - let native behavior work
      return
    }
    // Contenteditable belongs to a child block - let it bubble, don't interfere
    return
  }

  event.stopPropagation()
  designerStore.selectBlock(props.block.id)
}

// Double-click to focus contenteditable for text editing
function handleDoubleClick(event: MouseEvent) {
  const target = event.target as HTMLElement

  // Check if double-click is directly on a contenteditable element
  const isOnContentEditable = target.getAttribute('contenteditable') === 'true' ||
                              target.closest('[contenteditable="true"]') !== null

  // In content preview mode, allow double-click to select word in contenteditable
  if (isContentPreviewMode) {
    if (isOnContentEditable) {
      event.stopPropagation()
      // Let native behavior select the word
      return
    }
    // If double-clicking on the wrapper in content preview, focus the contenteditable
    if (['heading', 'text'].includes(props.block.type) && sectionRef.value) {
      event.preventDefault()
      event.stopPropagation()
      const editable = sectionRef.value.querySelector('[contenteditable="true"]') as HTMLElement
      if (editable) {
        editable.focus()
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          const range = document.caretRangeFromPoint(event.clientX, event.clientY)
          if (range) {
            selection.addRange(range)
          }
        }
      }
    }
    return
  }

  // In readonly mode, don't handle double-clicks (no editing)
  if (isReadonlyMode) return

  // If double-clicking directly on contenteditable, let native behavior handle it
  // (native behavior = select word)
  if (isOnContentEditable) {
    event.stopPropagation()
    return
  }

  // If double-clicking on the wrapper (not the contenteditable itself),
  // focus the contenteditable and place cursor
  if (['heading', 'text'].includes(props.block.type) && sectionRef.value) {
    event.preventDefault()
    event.stopPropagation()
    const editable = sectionRef.value.querySelector('[contenteditable="true"]') as HTMLElement
    if (editable) {
      editable.focus()
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        const range = document.caretRangeFromPoint(event.clientX, event.clientY)
        if (range) {
          selection.addRange(range)
        }
      }
    }
  }
}

function handleDuplicate() {
  designerStore.duplicateBlock(props.block.id)
}

function handleWrapInStack() {
  designerStore.wrapBlockInStack(props.block.id)
}

function handleWrapInLink() {
  designerStore.wrapBlockInButton(props.block.id)
}

// Check if block is Stack, Button, or Grid for conversion
const isStack = computed(() => props.block.type === 'stack')
const isButton = computed(() => props.block.type === 'button')
const isGrid = computed(() => props.block.type === 'grid')
const isText = computed(() => props.block.type === 'text')
const isHeading = computed(() => props.block.type === 'heading')

// Check if block can be wrapped in a link (text, heading, image)
const canWrapInLink = computed(() => {
  return ['text', 'heading', 'image'].includes(props.block.type)
})

function handleConvertToButton() {
  designerStore.convertBlockType(props.block.id, 'button')
}

function handleConvertToStack() {
  designerStore.convertBlockType(props.block.id, 'stack')
}

function handleConvertToGrid() {
  designerStore.convertBlockType(props.block.id, 'grid')
}

function handleConvertToHeading() {
  designerStore.convertBlockType(props.block.id, 'heading')
}

function handleConvertToText() {
  designerStore.convertBlockType(props.block.id, 'text')
}

function handleCreateComponent() {
  designerStore.createComponent(props.block.id)
}

function handleDelete() {
  designerStore.deleteBlock(props.block.id)
}

// Z-index handlers for Canvas children
function handleBringToFront() {
  if (!isInsideCanvas.value) return
  const parent = designerStore.findParentBlock(props.block.id)
  if (!parent || parent.type !== 'canvas') return

  const settings = parent.settings as CanvasSettings
  const viewport = designerStore.viewport
  const viewportKey = viewport === 'desktop' ? 'desktop' : viewport === 'tablet' ? 'tablet' : 'mobile'

  // Find the max zIndex among all children
  const positions = settings.childPositions[viewportKey] || settings.childPositions.desktop || {}
  let maxZ = 0
  for (const pos of Object.values(positions)) {
    if (pos.zIndex !== undefined && pos.zIndex > maxZ) maxZ = pos.zIndex
  }

  // Set this child's zIndex to max + 1
  const currentPos = positions[props.block.id] || { x: 10, y: 10 }
  designerStore.updateCanvasChildPosition(parent.id, props.block.id, {
    ...currentPos,
    zIndex: maxZ + 1,
  })
}

function handleSendToBack() {
  if (!isInsideCanvas.value) return
  const parent = designerStore.findParentBlock(props.block.id)
  if (!parent || parent.type !== 'canvas') return

  const settings = parent.settings as CanvasSettings
  const viewport = designerStore.viewport
  const viewportKey = viewport === 'desktop' ? 'desktop' : viewport === 'tablet' ? 'tablet' : 'mobile'

  // Find the min zIndex among all children
  const positions = settings.childPositions[viewportKey] || settings.childPositions.desktop || {}
  let minZ = 0
  for (const pos of Object.values(positions)) {
    if (pos.zIndex !== undefined && pos.zIndex < minZ) minZ = pos.zIndex
  }

  // Set this child's zIndex to min - 1
  const currentPos = positions[props.block.id] || { x: 10, y: 10 }
  designerStore.updateCanvasChildPosition(parent.id, props.block.id, {
    ...currentPos,
    zIndex: minZ - 1,
  })
}

// Content change handlers for extracted block components
function handleHeadingContentChange(newContent: string) {
  if (designerStore.isEditingTranslation) {
    designerStore.updateBlockTranslation(props.block.id, 'content', newContent)
  } else if (newContent !== headingSettings.value?.content) {
    designerStore.updateBlockSettings(props.block.id, { content: newContent })
  }
}

function handleTextContentChange(newContent: string) {
  if (designerStore.isEditingTranslation) {
    designerStore.updateBlockTranslation(props.block.id, 'content', newContent)
  } else if (newContent !== textSettings.value?.content) {
    designerStore.updateBlockSettings(props.block.id, { content: newContent })
  }
}

function handleButtonLabelChange(newLabel: string) {
  if (designerStore.isEditingTranslation) {
    designerStore.updateBlockTranslation(props.block.id, 'label', newLabel)
  } else if (newLabel !== buttonSettings.value?.label) {
    designerStore.updateBlockSettings(props.block.id, { label: newLabel })
  }
}

// Handle inline formatting - update block content after format applied
function handleInlineFormat(_command: string) {
  // After applying format, save the new HTML content
  if (editableRef.value) {
    const newContent = editableRef.value.innerHTML.trim()
    if (props.block.type === 'heading') {
      if (designerStore.isEditingTranslation) {
        designerStore.updateBlockTranslation(props.block.id, 'content', newContent)
      } else {
        designerStore.updateBlockSettings(props.block.id, { content: newContent })
      }
    } else if (props.block.type === 'text') {
      if (designerStore.isEditingTranslation) {
        designerStore.updateBlockTranslation(props.block.id, 'content', newContent)
      } else {
        designerStore.updateBlockSettings(props.block.id, { content: newContent })
      }
    }
  }
}

// Drag & drop for layout blocks
const isDropTarget = ref(false)
const childDropIndex = ref<number | null>(null) // Index where child will be dropped

// Check if this block can be dragged from the content area
// - Protected blocks (header/footer) cannot be dragged
// - Blocks inside Canvas use mouse drag for positioning, not HTML5 drag
// - Text content blocks (heading, text) need text selection, so disable drag on content
const canDragBlock = computed(() => {
  if (isReadonlyMode) return false
  if (isProtectedBlock.value) return false
  if (isInsideCanvas.value) return false
  // Disable drag on text content blocks to allow text selection
  // Users can still drag from the label
  if (['heading', 'text'].includes(props.block.type)) return false
  return true
})

// Cursor class based on mode and block type
const cursorClass = computed(() => {
  // In content preview mode, use appropriate cursor for content editing
  if (isContentPreviewMode) {
    // Text/heading blocks should show text cursor to indicate editability
    if (['heading', 'text'].includes(props.block.type)) {
      return 'cursor-text'
    }
    // Other blocks use default cursor
    return 'cursor-default'
  }
  // In designer mode, use grab/pointer based on draggability
  return canDragBlock.value ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
})

// Check if this block's label can be dragged (for reordering)
// Label is always draggable except for protected blocks
const canDragLabel = computed(() => {
  if (isReadonlyMode) return false
  if (isProtectedBlock.value) return false
  return true
})

// ============================================
// CANVAS POSITIONING (for children of Canvas)
// ============================================
const isCanvasDragging = ref(false)
const canvasDragStartX = ref(0)
const canvasDragStartY = ref(0)
const canvasStartPosX = ref(0)
const canvasStartPosY = ref(0)

// Helper to get child position for current viewport (cascading: mobile -> tablet -> desktop)
function getResponsiveChildPosition(settings: CanvasSettings, childId: string): CanvasChildPosition {
  const positions = settings.childPositions
  const viewport = designerStore.viewport
  const defaultPos: CanvasChildPosition = { x: 10, y: 10 }

  // Cascade: check current viewport, then fall back to larger viewports
  if (viewport === 'mobile') {
    return positions.mobile?.[childId] || positions.tablet?.[childId] || positions.desktop?.[childId] || defaultPos
  } else if (viewport === 'tablet') {
    return positions.tablet?.[childId] || positions.desktop?.[childId] || defaultPos
  }
  // Desktop
  return positions.desktop?.[childId] || defaultPos
}

function handleCanvasDragStart(event: MouseEvent) {
  if (!isInsideCanvas.value) return

  event.preventDefault()
  event.stopPropagation()

  isCanvasDragging.value = true
  canvasDragStartX.value = event.clientX
  canvasDragStartY.value = event.clientY

  // Get current position from parent's settings (viewport-aware)
  const parent = designerStore.findParentBlock(props.block.id)
  if (parent && parent.type === 'canvas') {
    const parentSettings = parent.settings as CanvasSettings
    const currentPos = getResponsiveChildPosition(parentSettings, props.block.id)
    canvasStartPosX.value = currentPos.x
    canvasStartPosY.value = currentPos.y
  }

  document.addEventListener('mousemove', handleCanvasDragMove)
  document.addEventListener('mouseup', handleCanvasDragEnd)
}

function handleCanvasDragMove(event: MouseEvent) {
  if (!isCanvasDragging.value) return

  const parent = designerStore.findParentBlock(props.block.id)
  if (!parent || parent.type !== 'canvas') return

  // Find the canvas container element to get its dimensions
  const canvasEl = document.querySelector(`[data-block-id="${parent.id}"]`) as HTMLElement
  if (!canvasEl) return

  const rect = canvasEl.getBoundingClientRect()
  const deltaX = event.clientX - canvasDragStartX.value
  const deltaY = event.clientY - canvasDragStartY.value

  // Convert pixel delta to percentage of container
  const deltaXPercent = (deltaX / rect.width) * 100
  const deltaYPercent = (deltaY / rect.height) * 100

  // Calculate new position
  const newX = Math.max(0, Math.min(95, canvasStartPosX.value + deltaXPercent))
  const newY = Math.max(0, Math.min(95, canvasStartPosY.value + deltaYPercent))

  // Update the parent's childPositions for current viewport
  const parentSettings = parent.settings as CanvasSettings
  const viewport = designerStore.viewport
  const currentPositions = parentSettings.childPositions || { desktop: {} }
  const viewportPositions = currentPositions[viewport] || {}
  const currentPos = viewportPositions[props.block.id] || getResponsiveChildPosition(parentSettings, props.block.id)

  designerStore.updateBlockSettings(parent.id, {
    childPositions: {
      ...currentPositions,
      [viewport]: {
        ...viewportPositions,
        [props.block.id]: {
          ...currentPos,
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        }
      }
    }
  })
}

function handleCanvasDragEnd() {
  isCanvasDragging.value = false
  document.removeEventListener('mousemove', handleCanvasDragMove)
  document.removeEventListener('mouseup', handleCanvasDragEnd)
}

// Track mousedown target to check in dragstart (for nested contenteditable detection)
// When mousedown occurs on a contenteditable inside a draggable ancestor,
// the dragstart event's target is the draggable ancestor, not the contenteditable.
// So we track where the mousedown actually started.
let lastMouseDownTarget: HTMLElement | null = null
let disabledDraggableElements: HTMLElement[] = []

function handleMouseDown(event: MouseEvent) {
  const target = event.target as HTMLElement
  lastMouseDownTarget = target

  // Check if mousedown is on a contenteditable element
  const contentEditableEl = target.getAttribute('contenteditable') === 'true'
    ? target
    : target.closest('[contenteditable="true"]') as HTMLElement | null

  if (contentEditableEl) {
    // Find which block owns this contenteditable
    const ownerBlock = contentEditableEl.closest('[data-preview-block]')
    const ownerBlockId = ownerBlock?.getAttribute('data-block-id')

    // If this contenteditable belongs to THIS block
    if (ownerBlockId === props.block.id) {
      event.stopPropagation()

      // Temporarily disable draggable on ALL parent draggable elements
      // This prevents the browser from entering drag mode at all
      let parent = contentEditableEl.parentElement
      while (parent) {
        if (parent.getAttribute('draggable') === 'true') {
          parent.setAttribute('draggable', 'false')
          disabledDraggableElements.push(parent)
        }
        parent = parent.parentElement
      }

      // Restore draggable on mouseup
      const restoreDraggable = () => {
        disabledDraggableElements.forEach(el => {
          el.setAttribute('draggable', 'true')
        })
        disabledDraggableElements = []
        document.removeEventListener('mouseup', restoreDraggable)
      }
      document.addEventListener('mouseup', restoreDraggable)
    }
  }
}

// Drag handlers for moving this block (HTML5 drag for reordering)
function handleBlockDragStart(event: DragEvent) {
  const target = event.target as HTMLElement

  // Don't start drag if mousedown originated from a contenteditable element (allow text selection)
  // We check lastMouseDownTarget because event.target in dragstart is the draggable ancestor, not where mouse started
  if (lastMouseDownTarget?.getAttribute('contenteditable') === 'true' || lastMouseDownTarget?.closest('[contenteditable="true"]')) {
    event.preventDefault()
    lastMouseDownTarget = null
    return
  }

  // Check if dragging from label (has data-block-label attribute)
  const isFromLabel = target.hasAttribute('data-block-label') || target.closest('[data-block-label]') !== null

  // Allow drag from label (canDragLabel) or from content area (canDragBlock)
  if (isFromLabel) {
    if (!canDragLabel.value) return
  } else {
    if (!canDragBlock.value) return
  }

  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/x-block-move', props.block.id)
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleBlockDragEnd() {
  // Reset any drag state if needed
}

// Check if drag event contains valid block type (for adding new blocks)
function isValidNewBlockDragType(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('application/x-section-type') || false
}

// Check if drag event contains list preset type
function isListPresetDragType(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('application/x-list-preset-type') || false
}

// Check if drag event contains block move data
function isBlockMoveDragType(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('application/x-block-move') || false
}

// Check if any valid drag type (new block, list preset, or block move)
function isValidDragType(event: DragEvent): boolean {
  return isValidNewBlockDragType(event) || isListPresetDragType(event) || isBlockMoveDragType(event)
}

function handleDragEnter(event: DragEvent) {
  console.log('[DragEnter]', props.block.type, props.block.id, 'isLayout:', isLayoutBlock.value, 'validType:', isValidDragType(event))
  if (!isLayoutBlock.value) return
  if (isValidDragType(event)) {
    event.preventDefault()
    event.stopPropagation()
    isDropTarget.value = true
    console.log('[DragEnter] Drop target set for:', props.block.type, props.block.id)
  }
}

function handleDragOver(event: DragEvent) {
  if (!isLayoutBlock.value) return
  if (isValidDragType(event)) {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = isBlockMoveDragType(event) ? 'move' : 'copy'
    }
  }
}

function handleDragLeave(event: DragEvent) {
  const relatedTarget = event.relatedTarget as HTMLElement | null
  const currentTarget = event.currentTarget as HTMLElement
  if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
    isDropTarget.value = false
    childDropIndex.value = null
  }
}

function handleDrop(event: DragEvent) {
  console.log('[Drop]', props.block.type, props.block.id, 'isLayout:', isLayoutBlock.value)
  if (!isLayoutBlock.value) return
  event.preventDefault()
  event.stopPropagation()
  isDropTarget.value = false
  const dropIndex = childDropIndex.value
  childDropIndex.value = null

  // Check for block move first
  const blockIdToMove = event.dataTransfer?.getData('application/x-block-move')
  console.log('[Drop] blockIdToMove:', blockIdToMove, 'dropIndex:', dropIndex)
  if (blockIdToMove) {
    // Don't allow dropping a block into itself or its children
    if (blockIdToMove === props.block.id) return

    // Check if reordering within same parent
    const blockParent = designerStore.findParentBlock(blockIdToMove)
    const isSameParent = blockParent?.id === props.block.id

    if (isSameParent && dropIndex !== null) {
      // Reordering within this container
      const currentIndex = props.block.children?.findIndex(c => c.id === blockIdToMove) ?? -1
      if (currentIndex !== -1 && currentIndex !== dropIndex) {
        const targetIndex = currentIndex < dropIndex ? dropIndex - 1 : dropIndex
        designerStore.reorderBlocks(currentIndex, targetIndex, props.block.id)
      }
    } else {
      // Move block to this parent
      designerStore.moveBlockToParent(blockIdToMove, props.block.id, dropIndex ?? undefined)
    }
    designerStore.selectBlock(blockIdToMove)
    return
  }

  // Check for list preset type
  const listPresetType = event.dataTransfer?.getData('application/x-list-preset-type') as ListPresetType
  if (listPresetType) {
    const block = designerStore.addListPreset(listPresetType, dropIndex ?? undefined, props.block.id)
    if (block) {
      designerStore.selectBlock(block.id)
    }
    return
  }

  // Check for section type
  const sectionType = event.dataTransfer?.getData('application/x-section-type')
  if (sectionType) {
    const block = designerStore.addBlock(sectionType as SectionBlockType, dropIndex ?? undefined, props.block.id)
    if (block) {
      designerStore.selectBlock(block.id)
    }
  }
}

// Handle drag over a specific child position to show drop indicator
function handleChildDragOver(childIndex: number, event: DragEvent) {
  if (!isLayoutBlock.value) return
  if (!isValidDragType(event)) return

  event.preventDefault()
  event.stopPropagation()

  // Determine if we're in the top or bottom half of the child
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const isVertical = props.block.type !== 'grid' && (props.block.type !== 'stack' || (props.block.settings as StackSettings)?.direction !== 'horizontal')

  if (isVertical) {
    const midY = rect.top + rect.height / 2
    childDropIndex.value = event.clientY < midY ? childIndex : childIndex + 1
  } else {
    const midX = rect.left + rect.width / 2
    childDropIndex.value = event.clientX < midX ? childIndex : childIndex + 1
  }

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = isBlockMoveDragType(event) ? 'move' : 'copy'
  }
}

function handleChildDragLeave() {
  // Don't reset immediately - let the parent container handle it
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

// Helper to convert px value to em (based on 16px base)
// Preserves non-px units (%, em, rem, vh, vw, etc.)
function pxToEm(value: string | number): string {
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

// Handle wheel events on fixed/sticky elements to propagate scroll to parent container
function handleWheel(event: WheelEvent) {
  if (!isFixedOrSticky.value) return

  // Find the scroll container and manually scroll it
  const scrollContainer = sectionRef.value?.closest('.overflow-auto')
  if (scrollContainer) {
    scrollContainer.scrollTop += event.deltaY
    scrollContainer.scrollLeft += event.deltaX
  }
}

// ============================================
// SPAN STYLES & INTERACTION
// ============================================

// Get spans from text/heading block settings
const blockSpans = computed(() => {
  if (props.block.type !== 'text' && props.block.type !== 'heading') return {}
  const settings = props.block.settings as { spans?: Record<string, { id: string; name: string; styles: Record<string, unknown> }> }
  return settings.spans || {}
})

// Generate CSS for all spans in this block
const spanStylesCSS = computed(() => {
  const spans = blockSpans.value
  if (Object.keys(spans).length === 0) return ''

  let css = ''
  for (const [spanId, span] of Object.entries(spans)) {
    const styles = span.styles
    const selector = `[data-block-id="${props.block.id}"] .ld-styled-span[data-span-id="${spanId}"]`
    let styleStr = ''

    if (styles.color) styleStr += `color: ${styles.color};`
    if (styles.backgroundColor) styleStr += `background-color: ${styles.backgroundColor};`
    if (styles.fontWeight) styleStr += `font-weight: ${styles.fontWeight};`
    if (styles.fontStyle) styleStr += `font-style: ${styles.fontStyle};`
    if (styles.textDecoration && styles.textDecoration !== 'none') styleStr += `text-decoration: ${styles.textDecoration};`
    if (styles.fontSize) {
      const value = fontSizeMap[styles.fontSize as string] || styles.fontSize as string
      styleStr += `font-size: ${pxToEm(value)};`
    }
    if (styles.fontFamily) styleStr += `font-family: ${styles.fontFamily};`
    if (styles.letterSpacing) styleStr += `letter-spacing: ${pxToEm(styles.letterSpacing as string)};`
    if (styles.padding) styleStr += `padding: ${styles.padding};`
    if (styles.borderRadius) {
      styleStr += `border-radius: ${pxToEm(styles.borderRadius as string)}; overflow: hidden;`
    }
    if (styles.border) {
      const b = styles.border as { width?: string; color?: string; style?: string }
      if (b.width) styleStr += `border: ${pxToEm(b.width)} ${b.style || 'solid'} ${b.color || 'currentColor'};`
    }
    if (styles.opacity && styles.opacity !== '100') styleStr += `opacity: ${parseFloat(styles.opacity as string) / 100};`
    if (styles.mixBlendMode && styles.mixBlendMode !== 'normal') styleStr += `mix-blend-mode: ${styles.mixBlendMode};`

    if (styleStr) {
      css += `${selector} { ${styleStr} }\n`
    }
  }

  // Add hover/selection outline styles for spans
  const selectedId = designerStore.selectedSpanId
  const hoveredId = designerStore.hoveredSpanId

  if (selectedId && spans[selectedId]) {
    css += `[data-block-id="${props.block.id}"] .ld-styled-span[data-span-id="${selectedId}"] { outline: 2px solid var(--color-primary); outline-offset: 2px; }\n`
  }
  if (hoveredId && spans[hoveredId] && hoveredId !== selectedId) {
    css += `[data-block-id="${props.block.id}"] .ld-styled-span[data-span-id="${hoveredId}"] { outline: 1px solid var(--color-primary); outline-offset: 1px; opacity: 0.8; }\n`
  }

  return css
})

// Handle span click (select span)
function handleSpanClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.classList.contains('ld-styled-span')) {
    const spanId = target.getAttribute('data-span-id')
    if (spanId) {
      event.stopPropagation()
      designerStore.selectSpan(spanId)
    }
  }
}

// Handle span hover
function handleSpanMouseOver(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.classList.contains('ld-styled-span')) {
    const spanId = target.getAttribute('data-span-id')
    if (spanId) {
      designerStore.hoverSpan(spanId)
    }
  }
}

function handleSpanMouseOut(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.classList.contains('ld-styled-span')) {
    designerStore.hoverSpan(null)
  }
}

</script>

<template>
  <section
    v-if="!isBlockHidden"
    ref="sectionRef"
    class="w-full flex flex-col min-h-0"
    :class="[
      { 'flex-1': !blockStyles.height && blockStyles.height !== '100%' },
      { 'h-full': blockStyles.height === '100%' },
      { 'overflow-hidden': blockStyles.height && blockStyles.height !== '100%' },
      { 'overflow-visible': !blockStyles.height },
      { 'relative': !wrapperStyles.position },
      cursorClass
    ]"
    :draggable="canDragBlock"
    data-preview-block
    :data-block-id="block.id"
    :style="{ ...animationStyles, ...wrapperStyles, ...combinedEffectStyles }"
    @click="handleClick"
    @dblclick="handleDoubleClick"
    @contextmenu="handleContextMenu"
    @mousedown="handleMouseDown"
    @dragstart="handleBlockDragStart"
    @dragend="handleBlockDragEnd"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @wheel="handleWheel"
  >
    <!-- ============================================ -->
    <!-- CONTAINER BLOCK -->
    <!-- ============================================ -->
    <ContainerBlock
      v-if="block.type === 'container'"
      :block="block"
      :styles="blockStyles"
      :is-drop-target="isDropTarget"
      :child-drop-index="childDropIndex"
      @drag-enter="handleDragEnter"
      @drag-over="handleDragOver"
      @drag-leave="handleDragLeave"
      @drop="handleDrop"
      @child-drag-over="handleChildDragOver"
      @child-drag-leave="handleChildDragLeave"
      @add-block="handleAddContentBlock"
      @add-list-preset="handleBlockPickerSelectListPreset"
    />

    <!-- ============================================ -->
    <!-- GRID BLOCK -->
    <!-- ============================================ -->
    <GridBlock
      v-else-if="block.type === 'grid'"
      :block="block"
      :styles="blockStyles"
      :is-drop-target="isDropTarget"
      :child-drop-index="childDropIndex"
      :is-selected="isSelected"
      @drag-enter="handleDragEnter"
      @drag-over="handleDragOver"
      @drag-leave="handleDragLeave"
      @drop="handleDrop"
      @child-drag-over="handleChildDragOver"
      @child-drag-leave="handleChildDragLeave"
      @add-block="handleAddContentBlock"
      @add-list-preset="handleBlockPickerSelectListPreset"
    />

    <!-- ============================================ -->
    <!-- STACK BLOCK -->
    <!-- ============================================ -->
    <StackBlock
      v-else-if="block.type === 'stack'"
      :block="block"
      :styles="blockStyles"
      :is-drop-target="isDropTarget"
      :child-drop-index="childDropIndex"
      @drag-enter="handleDragEnter"
      @drag-over="handleDragOver"
      @drag-leave="handleDragLeave"
      @drop="handleDrop"
      @child-drag-over="handleChildDragOver"
      @child-drag-leave="handleChildDragLeave"
      @add-block="handleAddContentBlock"
      @add-list-preset="handleBlockPickerSelectListPreset"
    />

    <!-- ============================================ -->
    <!-- SLIDER BLOCK -->
    <!-- ============================================ -->
    <SliderBlock
      v-else-if="block.type === 'slider'"
      :block="block"
      :styles="blockStyles"
      :is-drop-target="isDropTarget"
      :child-drop-index="childDropIndex"
      :is-selected="isSelected"
      @drag-enter="handleDragEnter"
      @drag-over="handleDragOver"
      @drag-leave="handleDragLeave"
      @drop="handleDrop"
      @child-drag-over="handleChildDragOver"
      @child-drag-leave="handleChildDragLeave"
      @add-block="handleAddContentBlock"
      @add-list-preset="handleBlockPickerSelectListPreset"
    />

    <!-- ============================================ -->
    <!-- HEADING BLOCK -->
    <!-- ============================================ -->
    <HeadingBlock
      v-else-if="block.type === 'heading'"
      :ref="(el: any) => { if (el?.editableRef) editableRef = el.editableRef }"
      :block="block"
      :styles="blockStyles"
      @content-change="handleHeadingContentChange"
      @span-click="handleSpanClick"
      @span-mouse-over="handleSpanMouseOver"
      @span-mouse-out="handleSpanMouseOut"
    />

    <!-- ============================================ -->
    <!-- TEXT BLOCK -->
    <!-- ============================================ -->
    <TextBlock
      v-else-if="block.type === 'text'"
      :ref="(el: any) => { if (el?.editableRef) editableRef = el.editableRef }"
      :block="block"
      :styles="blockStyles"
      @content-change="handleTextContentChange"
      @span-click="handleSpanClick"
      @span-mouse-over="handleSpanMouseOver"
      @span-mouse-out="handleSpanMouseOut"
    />

    <!-- ============================================ -->
    <!-- IMAGE BLOCK -->
    <!-- ============================================ -->
    <ImageBlock
      v-else-if="block.type === 'image'"
      :block="block"
      :styles="blockStyles"
    />

    <!-- ============================================ -->
    <!-- VIDEO BLOCK -->
    <!-- ============================================ -->
    <VideoBlock
      v-else-if="block.type === 'video'"
      :block="block"
      :styles="blockStyles"
    />

    <!-- ============================================ -->
    <!-- BUTTON BLOCK -->
    <!-- ============================================ -->
    <ButtonBlock
      v-else-if="block.type === 'button'"
      :block="block"
      :styles="blockStyles"
      :is-drop-target="isDropTarget"
      :child-drop-index="childDropIndex"
      @label-change="handleButtonLabelChange"
      @drag-enter="handleDragEnter"
      @drag-over="handleDragOver"
      @drag-leave="handleDragLeave"
      @drop="handleDrop"
      @child-drag-over="handleChildDragOver"
      @child-drag-leave="handleChildDragLeave"
      @add-block="handleAddContentBlock"
    />

    <!-- ============================================ -->
    <!-- ICON BLOCK -->
    <!-- ============================================ -->
    <IconBlock
      v-else-if="block.type === 'icon'"
      :block="block"
      :styles="blockStyles"
    />

    <!-- ============================================ -->
    <!-- VARIANTS BLOCK -->
    <!-- ============================================ -->
    <VariantsBlock
      v-else-if="block.type === 'variants'"
      :block="block"
      :styles="blockStyles"
    />

    <!-- ============================================ -->
    <!-- CANVAS BLOCK -->
    <!-- ============================================ -->
    <CanvasBlock
      v-else-if="block.type === 'canvas'"
      :block="block"
      :styles="blockStyles"
      :is-drop-target="isDropTarget"
      @drag-enter="handleDragEnter"
      @drag-over="handleDragOver"
      @drag-leave="handleDragLeave"
      @drop="handleDrop"
      @add-block="handleAddContentBlock"
      @add-list-preset="handleBlockPickerSelectListPreset"
    />

    <!-- ============================================ -->
    <!-- FORM BLOCK -->
    <!-- ============================================ -->
    <FormBlock
      v-else-if="block.type === 'form'"
      :block="block"
      :styles="blockStyles"
      :is-drop-target="isDropTarget"
      :child-drop-index="childDropIndex"
      @drag-enter="handleDragEnter"
      @drag-over="handleDragOver"
      @drag-leave="handleDragLeave"
      @drop="handleDrop"
      @child-drag-over="handleChildDragOver"
      @child-drag-leave="handleChildDragLeave"
      @add-block="handleAddContentBlock"
    />

    <!-- ============================================ -->
    <!-- FORM INPUT BLOCK -->
    <!-- ============================================ -->
    <FormInputBlock
      v-else-if="block.type === 'form-input'"
      :block="block"
      :styles="blockStyles"
    />

    <!-- ============================================ -->
    <!-- FORM TEXTAREA BLOCK -->
    <!-- ============================================ -->
    <FormTextareaBlock
      v-else-if="block.type === 'form-textarea'"
      :block="block"
      :styles="blockStyles"
    />

    <!-- ============================================ -->
    <!-- FORM CHECKBOX BLOCK -->
    <!-- ============================================ -->
    <FormCheckboxBlock
      v-else-if="block.type === 'form-checkbox'"
      :block="block"
      :styles="blockStyles"
    />

    <!-- ============================================ -->
    <!-- FORM RADIO BLOCK -->
    <!-- ============================================ -->
    <FormRadioBlock
      v-else-if="block.type === 'form-radio'"
      :block="block"
      :styles="blockStyles"
    />

    <!-- ============================================ -->
    <!-- FORM BUTTON BLOCK -->
    <!-- ============================================ -->
    <FormButtonBlock
      v-else-if="block.type === 'form-button'"
      :ref="(el: any) => { if (el?.editableRef) editableRef = el.editableRef }"
      :block="block"
      :styles="blockStyles"
      @content-change="(content: string) => designerStore.updateBlockSettings(block.id, { label: content })"
    />

    <!-- ============================================ -->
    <!-- FORM LABEL BLOCK -->
    <!-- ============================================ -->
    <FormLabelBlock
      v-else-if="block.type === 'form-label'"
      :ref="(el: any) => { if (el?.editableRef) editableRef = el.editableRef }"
      :block="block"
      :styles="blockStyles"
      @content-change="(content: string) => designerStore.updateBlockSettings(block.id, { content: content })"
    />

    <!-- ============================================ -->
    <!-- FALLBACK / PLACEHOLDER -->
    <!-- ============================================ -->
    <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground border-1 border-dashed border-border/50">
      <Icon :name="sectionBlockIcons[block.type]" :size="30" class="mb-2" />
      <span class="text-sm font-medium">{{ sectionBlockLabels[block.type] }}</span>
    </div>

    <!-- Context Menu -->
    <ContextMenu ref="contextMenuRef">
      <!-- Add content option for layout blocks -->
      <template v-if="isLayoutBlock">
        <ContextMenuItem icon="plus" @click="openBlockPicker">
          Add content
        </ContextMenuItem>
        <!-- Add item option for list containers -->
        <ContextMenuItem v-if="isListContainerBlock" icon="plus" @click="handleAddListItem">
          Add item
        </ContextMenuItem>
        <ContextMenuDivider />
      </template>
      <!-- Z-index options for Canvas children -->
      <template v-if="isInsideCanvas">
        <ContextMenuItem icon="lni-arrow-upward" @click="handleBringToFront">
          Bring to front
        </ContextMenuItem>
        <ContextMenuItem icon="lni-arrow-downward" @click="handleSendToBack">
          Send to back
        </ContextMenuItem>
        <ContextMenuDivider />
      </template>
      <ContextMenuItem
        icon="app-cut"
        shortcut="⌘X"
        :disabled="isProtectedBlock"
        @click="handleCut"
      >
        Cut
      </ContextMenuItem>
      <ContextMenuItem
        icon="app-duplicate"
        shortcut="⌘C"
        :disabled="isProtectedBlock"
        @click="handleCopy"
      >
        Copy
      </ContextMenuItem>
      <ContextMenuItem
        icon="app-paste"
        shortcut="⌘V"
        :disabled="!designerStore.hasClipboardBlock"
        @click="handlePaste"
      >
        Paste
      </ContextMenuItem>
      <ContextMenuDivider />
      <ContextMenuItem icon="app-editor" @click="handleEditStyle">
        Edit style
      </ContextMenuItem>
      <ContextMenuItem icon="app-copy-style" @click="handleCopyStyle">
        Copy style
      </ContextMenuItem>
      <ContextMenuItem
        icon="app-paste-style"
        :disabled="!designerStore.hasClipboardStyles"
        @click="handlePasteStyle"
      >
        Paste style
      </ContextMenuItem>
      <ContextMenuDivider />
      <ContextMenuItem
        icon="app-duplicate"
        shortcut="⌘D"
        :disabled="isProtectedBlock"
        @click="handleDuplicate"
      >
        Duplicate
      </ContextMenuItem>
      <ContextMenuItem
        icon="style-row"
        @click="handleWrapInStack"
      >
        Wrap in stack
      </ContextMenuItem>
      <ContextMenuItem
        v-if="canWrapInLink"
        icon="link-1"
        @click="handleWrapInLink"
      >
        Wrap in a link
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isStack"
        icon="link-1"
        @click="handleConvertToButton"
      >
        Convert to link
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isStack"
        icon="grid-4"
        @click="handleConvertToGrid"
      >
        Convert to grid
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isButton || isGrid"
        icon="style-row"
        @click="handleConvertToStack"
      >
        Convert to stack
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isText"
        icon="text-style-heading-2"
        @click="handleConvertToHeading"
      >
        Convert to heading
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isHeading"
        icon="text-style-paragraph"
        @click="handleConvertToText"
      >
        Convert to text
      </ContextMenuItem>
      <ContextMenuItem
        icon="package"
        @click="handleCreateComponent"
      >
        Create component
      </ContextMenuItem>
      <ContextMenuDivider />
      <ContextMenuItem
        icon="app-delete"
        shortcut="⌫"
        destructive
        :disabled="isProtectedBlock"
        @click="handleDelete"
      >
        Delete
      </ContextMenuItem>
    </ContextMenu>

    <!-- Block Picker for empty layout blocks -->
    <SidebarBlockPicker
      v-model:open="isBlockPickerOpen"
      hide-trigger
      @select="handleBlockPickerSelectBlock"
      @select-list-preset="handleBlockPickerSelectListPreset"
    />

    <!-- Inline Format Toolbar for heading/text blocks -->
    <InlineFormatToolbar
      v-if="block.type === 'heading' || block.type === 'text'"
      :target-element="editableRef"
      :block-id="block.id"
      @format="handleInlineFormat"
    />

    <!-- Inject span styles for this block -->
    <component v-if="spanStylesCSS" :is="'style'" v-html="spanStylesCSS" />

  </section>
</template>

