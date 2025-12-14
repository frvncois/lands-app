/**
 * Composable for handling JavaScript-based interaction triggers
 *
 * Handles: click (toggle), load (on mount), appear (intersection observer),
 * while-scrolling (element viewport position), page-scroll (page scroll position)
 */

import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import type { Interaction } from '@/types/editor'
import { useScrollAnimations } from '@/composables/useScrollAnimations'
import { supportsScrollDrivenAnimations } from '@/lib/interaction-utils'

interface UseInteractionTriggersOptions {
  /** Reactive array of interactions */
  interactions: () => Interaction[]
  /** Container element ref to scope the interactions */
  containerRef?: Ref<HTMLElement | null>
  /** Scroll container element ref (for nested scroll contexts like the editor) */
  scrollContainerRef?: Ref<HTMLElement | null>
}

export function useInteractionTriggers(options: UseInteractionTriggersOptions) {
  const { interactions, containerRef, scrollContainerRef } = options

  // Track active click states (for toggle behavior)
  const activeClickStates = new Map<string, boolean>()

  // Track attached event listeners for cleanup
  const clickListeners = new Map<string, { element: Element; handler: EventListener }>()

  // Track intersection observers
  const intersectionObservers = new Map<string, IntersectionObserver>()

  // Track scroll animation state
  // Force JS mode when we have a scroll container (nested scroll context like the editor)
  const scrollAnimations = useScrollAnimations({
    get scrollContainer() { return scrollContainerRef?.value ?? null },
    forceJS: !!scrollContainerRef,
  })
  let scrollRAFId: number | null = null
  let isScrollListenerActive = false

  /**
   * Get the container element (scoped or document)
   */
  function getContainer(): HTMLElement | Document {
    return containerRef?.value || document
  }

  /**
   * Setup click interaction handlers (supports multiple targets)
   */
  function setupClickInteractions() {
    const container = getContainer()
    const clickInteractions = interactions().filter(i => i.trigger === 'click')

    for (const interaction of clickInteractions) {
      const triggerElement = container.querySelector(`[data-block-id="${interaction.triggerBlockId}"]`)
      if (!triggerElement) continue

      // Get all target elements
      const targetElements = interaction.targetBlockIds
        .map(id => container.querySelector(`[data-block-id="${id}"]`))
        .filter((el): el is Element => el !== null)

      if (targetElements.length === 0) continue

      // Skip if already setup
      if (clickListeners.has(interaction.id)) continue

      const handler = (event: Event) => {
        event.stopPropagation()

        // Toggle the active state
        const isActive = activeClickStates.get(interaction.id) || false
        const newState = !isActive
        activeClickStates.set(interaction.id, newState)

        // Toggle the class on all target elements
        const className = `interaction-active-${interaction.id}`
        for (const targetElement of targetElements) {
          if (newState) {
            targetElement.classList.add(className)
          } else {
            targetElement.classList.remove(className)
          }
        }
      }

      triggerElement.addEventListener('click', handler)
      clickListeners.set(interaction.id, { element: triggerElement, handler })
    }
  }

  /**
   * Cleanup click interaction handlers
   */
  function cleanupClickInteractions() {
    for (const [id, { element, handler }] of clickListeners) {
      element.removeEventListener('click', handler)
    }
    clickListeners.clear()
    activeClickStates.clear()
  }

  /**
   * Setup load interaction animations (supports multiple targets)
   */
  function setupLoadInteractions() {
    const container = getContainer()
    const loadInteractions = interactions().filter(i => i.trigger === 'load')

    for (const interaction of loadInteractions) {
      // The CSS already has the animation for all targets, just ensure it plays
      // For load animations, the CSS @keyframes is applied directly
      // No additional JS needed as CSS handles it
      for (const targetBlockId of interaction.targetBlockIds) {
        const targetElement = container.querySelector(`[data-block-id="${targetBlockId}"]`)
        if (!targetElement) continue
        // Animation is handled by CSS
      }
    }
  }

  /**
   * Setup appear interaction observers (supports multiple targets)
   */
  function setupAppearInteractions() {
    const container = getContainer()
    const appearInteractions = interactions().filter(i => i.trigger === 'appear')

    for (const interaction of appearInteractions) {
      // Skip if already setup
      if (intersectionObservers.has(interaction.id)) continue

      const className = `interaction-visible-${interaction.id}`

      // Get all target elements
      const targetElements = interaction.targetBlockIds
        .map(id => container.querySelector(`[data-block-id="${id}"]`))
        .filter((el): el is Element => el !== null)

      if (targetElements.length === 0) continue

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add(className)
              // Once visible, we can stop observing (one-time animation)
              observer.unobserve(entry.target)
            }
          }
        },
        {
          threshold: 0.1, // Trigger when 10% visible
          rootMargin: '0px 0px -50px 0px', // Trigger slightly before fully in view
        }
      )

      // Observe all target elements
      for (const targetElement of targetElements) {
        observer.observe(targetElement)
      }
      intersectionObservers.set(interaction.id, observer)
    }
  }

  /**
   * Cleanup appear interaction observers
   */
  function cleanupAppearInteractions() {
    for (const observer of intersectionObservers.values()) {
      observer.disconnect()
    }
    intersectionObservers.clear()
  }

  /**
   * Setup scroll-based interaction animations (while-scrolling and page-scroll)
   * Uses CSS scroll-driven animations where supported, with JS fallback
   * Always uses JS when in a nested scroll container (like the editor)
   * Supports multiple targets
   */
  function setupScrollInteractions() {
    // If we have a scroll container ref, we're in the editor - always use JS
    // CSS scroll-driven animations don't work properly with nested scroll containers
    const useJS = !!scrollContainerRef || !supportsScrollDrivenAnimations()

    if (!useJS) {
      // CSS scroll-driven animations are supported and we're not in nested context
      return
    }

    const container = getContainer()
    const scrollInteractions = interactions().filter(
      i => i.trigger === 'while-scrolling' || i.trigger === 'page-scroll'
    )

    if (scrollInteractions.length === 0) return

    // Register elements with the scroll animations composable
    for (const interaction of scrollInteractions) {
      for (const targetBlockId of interaction.targetBlockIds) {
        const targetElement = container.querySelector(`[data-block-id="${targetBlockId}"]`) as HTMLElement | null
        if (!targetElement) continue

        scrollAnimations.register(interaction, targetElement)

        // Add data attribute for fallback CSS targeting
        if (interaction.trigger === 'while-scrolling') {
          targetElement.setAttribute('data-scroll-animation', interaction.id)
        } else {
          targetElement.setAttribute('data-page-scroll-animation', interaction.id)
        }
      }
    }

    // The scroll animations composable handles the requestAnimationFrame loop
  }

  /**
   * Cleanup scroll interaction animations
   */
  function cleanupScrollInteractions() {
    scrollAnimations.clear()

    // Remove data attributes
    const container = getContainer()
    const elements = container.querySelectorAll('[data-scroll-animation], [data-page-scroll-animation]')
    for (const el of elements) {
      el.removeAttribute('data-scroll-animation')
      el.removeAttribute('data-page-scroll-animation')
    }
  }

  /**
   * Reset appear interactions (remove visible classes)
   */
  function resetAppearInteractions() {
    const container = getContainer()
    const appearInteractions = interactions().filter(i => i.trigger === 'appear')

    for (const interaction of appearInteractions) {
      const className = `interaction-visible-${interaction.id}`
      for (const targetBlockId of interaction.targetBlockIds) {
        const targetElement = container.querySelector(`[data-block-id="${targetBlockId}"]`)
        if (!targetElement) continue
        targetElement.classList.remove(className)
      }
    }
  }

  /**
   * Setup all interaction triggers
   */
  function setupAll() {
    // Small delay to ensure DOM is ready
    requestAnimationFrame(() => {
      setupClickInteractions()
      setupLoadInteractions()
      setupAppearInteractions()
      setupScrollInteractions()
    })
  }

  /**
   * Cleanup all interaction triggers
   */
  function cleanupAll() {
    cleanupClickInteractions()
    cleanupAppearInteractions()
    cleanupScrollInteractions()
  }

  /**
   * Refresh all interactions (cleanup and re-setup)
   */
  function refresh() {
    cleanupAll()
    setupAll()
  }

  // Setup on mount
  onMounted(() => {
    setupAll()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    cleanupAll()
  })

  // Watch for interaction changes
  watch(
    () => JSON.stringify(interactions().map(i => ({ id: i.id, trigger: i.trigger, triggerBlockId: i.triggerBlockId, targetBlockIds: i.targetBlockIds }))),
    () => {
      refresh()
    }
  )

  return {
    setupAll,
    cleanupAll,
    refresh,
    resetAppearInteractions,
  }
}
