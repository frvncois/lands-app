/**
 * Composable for handling JavaScript-based interaction triggers
 *
 * Handles: click (toggle), load (on mount), appear (intersection observer)
 */

import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import type { Interaction } from '@/types/editor'

interface UseInteractionTriggersOptions {
  /** Reactive array of interactions */
  interactions: () => Interaction[]
  /** Container element ref to scope the interactions */
  containerRef?: Ref<HTMLElement | null>
}

export function useInteractionTriggers(options: UseInteractionTriggersOptions) {
  const { interactions, containerRef } = options

  // Track active click states (for toggle behavior)
  const activeClickStates = new Map<string, boolean>()

  // Track attached event listeners for cleanup
  const clickListeners = new Map<string, { element: Element; handler: EventListener }>()

  // Track intersection observers
  const intersectionObservers = new Map<string, IntersectionObserver>()

  /**
   * Get the container element (scoped or document)
   */
  function getContainer(): HTMLElement | Document {
    return containerRef?.value || document
  }

  /**
   * Setup click interaction handlers
   */
  function setupClickInteractions() {
    const container = getContainer()
    const clickInteractions = interactions().filter(i => i.trigger === 'click')

    for (const interaction of clickInteractions) {
      const triggerElement = container.querySelector(`[data-block-id="${interaction.triggerBlockId}"]`)
      const targetElement = container.querySelector(`[data-block-id="${interaction.targetBlockId}"]`)

      if (!triggerElement || !targetElement) continue

      // Skip if already setup
      if (clickListeners.has(interaction.id)) continue

      const handler = (event: Event) => {
        event.stopPropagation()

        // Toggle the active state
        const isActive = activeClickStates.get(interaction.id) || false
        const newState = !isActive
        activeClickStates.set(interaction.id, newState)

        // Toggle the class on target
        const className = `interaction-active-${interaction.id}`
        if (newState) {
          targetElement.classList.add(className)
        } else {
          targetElement.classList.remove(className)
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
   * Setup load interaction animations
   */
  function setupLoadInteractions() {
    const container = getContainer()
    const loadInteractions = interactions().filter(i => i.trigger === 'load')

    for (const interaction of loadInteractions) {
      const targetElement = container.querySelector(`[data-block-id="${interaction.targetBlockId}"]`)
      if (!targetElement) continue

      // The CSS already has the animation, just ensure it plays
      // For load animations, the CSS @keyframes is applied directly
      // No additional JS needed as CSS handles it
    }
  }

  /**
   * Setup appear interaction observers
   */
  function setupAppearInteractions() {
    const container = getContainer()
    const appearInteractions = interactions().filter(i => i.trigger === 'appear')

    for (const interaction of appearInteractions) {
      const targetElement = container.querySelector(`[data-block-id="${interaction.targetBlockId}"]`)
      if (!targetElement) continue

      // Skip if already setup
      if (intersectionObservers.has(interaction.id)) continue

      const className = `interaction-visible-${interaction.id}`

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

      observer.observe(targetElement)
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
   * Reset appear interactions (remove visible classes)
   */
  function resetAppearInteractions() {
    const container = getContainer()
    const appearInteractions = interactions().filter(i => i.trigger === 'appear')

    for (const interaction of appearInteractions) {
      const targetElement = container.querySelector(`[data-block-id="${interaction.targetBlockId}"]`)
      if (!targetElement) continue

      const className = `interaction-visible-${interaction.id}`
      targetElement.classList.remove(className)
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
    })
  }

  /**
   * Cleanup all interaction triggers
   */
  function cleanupAll() {
    cleanupClickInteractions()
    cleanupAppearInteractions()
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
    () => JSON.stringify(interactions().map(i => ({ id: i.id, trigger: i.trigger, triggerBlockId: i.triggerBlockId, targetBlockId: i.targetBlockId }))),
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
