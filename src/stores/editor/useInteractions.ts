import type { Ref } from 'vue'
import type {
  SectionBlock,
  PageSettings,
  Interaction,
  InteractionTrigger,
  InteractionEffect,
  InteractionEasing,
  InteractionStyles,
  ScrollAnimationConfig,
} from '@/types/editor'
import { generateId } from '@/lib/editor-utils'
import { deepClone } from './helpers'

export interface UseInteractionsOptions {
  pageSettings: Ref<PageSettings>
  findBlockById: (id: string) => SectionBlock | null
  onBeforeChange: () => void
  showToast: (type: 'info' | 'success' | 'error', message: string) => void
}

export function useInteractions(options: UseInteractionsOptions) {
  const { pageSettings, findBlockById, onBeforeChange, showToast } = options

  /**
   * Get all interactions
   */
  function getInteractions(): Interaction[] {
    return pageSettings.value.interactions || []
  }

  /**
   * Get interactions where a specific block is the trigger
   */
  function getInteractionsForBlock(blockId: string): Interaction[] {
    return (pageSettings.value.interactions || []).filter(
      i => i.triggerBlockId === blockId
    )
  }

  /**
   * Get interactions where a specific block is a target
   */
  function getInteractionsTargetingBlock(blockId: string): Interaction[] {
    return (pageSettings.value.interactions || []).filter(
      i => i.targetBlockIds.includes(blockId)
    )
  }

  /**
   * Get an interaction by ID
   */
  function getInteractionById(interactionId: string): Interaction | undefined {
    return (pageSettings.value.interactions || []).find(i => i.id === interactionId)
  }

  /**
   * Create a new interaction
   */
  function createInteraction(data: {
    name: string
    trigger: InteractionTrigger
    triggerBlockId: string
    targetBlockIds: string[]
    effectType?: InteractionEffect
    duration?: string
    easing?: InteractionEasing
    delay?: string
    styles?: InteractionStyles
    scrollConfig?: ScrollAnimationConfig
    fromStyles?: InteractionStyles
  }): Interaction | null {
    // Validate trigger block exists
    const triggerBlock = findBlockById(data.triggerBlockId)
    if (!triggerBlock) {
      showToast('error', 'Trigger block not found')
      return null
    }

    // Validate at least one target block exists
    const validTargetIds = data.targetBlockIds.filter(id => findBlockById(id) !== null)
    if (validTargetIds.length === 0) {
      showToast('error', 'No valid target blocks found')
      return null
    }

    const now = new Date().toISOString()
    const newInteraction: Interaction = {
      id: generateId(),
      name: data.name,
      trigger: data.trigger,
      triggerBlockId: data.triggerBlockId,
      targetBlockIds: validTargetIds,
      effectType: data.effectType || 'transition',
      duration: data.duration || '300ms',
      easing: data.easing || 'ease',
      delay: data.delay,
      styles: data.styles || {},
      scrollConfig: data.scrollConfig,
      fromStyles: data.fromStyles,
      createdAt: now,
      updatedAt: now,
    }

    onBeforeChange()

    // Add to page settings
    if (!pageSettings.value.interactions) {
      pageSettings.value.interactions = []
    }
    pageSettings.value.interactions.push(newInteraction)

    // Add reference to trigger block
    if (!triggerBlock.interactionIds) {
      triggerBlock.interactionIds = []
    }
    if (!triggerBlock.interactionIds.includes(newInteraction.id)) {
      triggerBlock.interactionIds.push(newInteraction.id)
    }

    showToast('success', 'Interaction created')
    return newInteraction
  }

  /**
   * Update an existing interaction
   */
  function updateInteraction(
    interactionId: string,
    updates: Partial<Omit<Interaction, 'id' | 'createdAt'>>
  ): boolean {
    const interaction = getInteractionById(interactionId)
    if (!interaction) {
      showToast('error', 'Interaction not found')
      return false
    }

    onBeforeChange()

    // Handle trigger block change
    if (updates.triggerBlockId && updates.triggerBlockId !== interaction.triggerBlockId) {
      // Remove from old trigger block
      const oldTriggerBlock = findBlockById(interaction.triggerBlockId)
      if (oldTriggerBlock?.interactionIds) {
        const idx = oldTriggerBlock.interactionIds.indexOf(interactionId)
        if (idx !== -1) {
          oldTriggerBlock.interactionIds.splice(idx, 1)
        }
      }

      // Add to new trigger block
      const newTriggerBlock = findBlockById(updates.triggerBlockId)
      if (newTriggerBlock) {
        if (!newTriggerBlock.interactionIds) {
          newTriggerBlock.interactionIds = []
        }
        if (!newTriggerBlock.interactionIds.includes(interactionId)) {
          newTriggerBlock.interactionIds.push(interactionId)
        }
      }
    }

    // Apply updates
    Object.assign(interaction, updates, { updatedAt: new Date().toISOString() })

    return true
  }

  /**
   * Update interaction styles
   */
  function updateInteractionStyles(
    interactionId: string,
    styles: Partial<InteractionStyles>
  ): boolean {
    const interaction = getInteractionById(interactionId)
    if (!interaction) return false

    onBeforeChange()

    interaction.styles = { ...interaction.styles, ...styles }
    interaction.updatedAt = new Date().toISOString()

    return true
  }

  /**
   * Delete an interaction
   */
  function deleteInteraction(interactionId: string): boolean {
    const interactions = pageSettings.value.interactions
    if (!interactions) return false

    const index = interactions.findIndex(i => i.id === interactionId)
    if (index === -1) return false

    const interaction = interactions[index]
    if (!interaction) return false

    onBeforeChange()

    // Remove reference from trigger block
    const triggerBlock = findBlockById(interaction.triggerBlockId)
    if (triggerBlock?.interactionIds) {
      const idx = triggerBlock.interactionIds.indexOf(interactionId)
      if (idx !== -1) {
        triggerBlock.interactionIds.splice(idx, 1)
      }
    }

    // Remove the interaction
    interactions.splice(index, 1)

    showToast('info', 'Interaction deleted')
    return true
  }

  /**
   * Duplicate an interaction
   */
  function duplicateInteraction(interactionId: string): Interaction | null {
    const interaction = getInteractionById(interactionId)
    if (!interaction) return null

    const now = new Date().toISOString()
    const newInteraction: Interaction = {
      ...deepClone(interaction),
      id: generateId(),
      name: `${interaction.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    }

    onBeforeChange()

    if (!pageSettings.value.interactions) {
      pageSettings.value.interactions = []
    }
    pageSettings.value.interactions.push(newInteraction)

    // Add reference to trigger block
    const triggerBlock = findBlockById(newInteraction.triggerBlockId)
    if (triggerBlock) {
      if (!triggerBlock.interactionIds) {
        triggerBlock.interactionIds = []
      }
      triggerBlock.interactionIds.push(newInteraction.id)
    }

    showToast('success', 'Interaction duplicated')
    return newInteraction
  }

  /**
   * Rename an interaction
   */
  function renameInteraction(interactionId: string, name: string): boolean {
    const interaction = getInteractionById(interactionId)
    if (!interaction) return false

    onBeforeChange()
    interaction.name = name
    interaction.updatedAt = new Date().toISOString()
    return true
  }

  /**
   * Check if a block has any interactions (as trigger)
   */
  function blockHasInteractions(blockId: string): boolean {
    const block = findBlockById(blockId)
    return !!(block?.interactionIds && block.interactionIds.length > 0)
  }

  /**
   * Get interaction count for a block
   */
  function getInteractionCount(blockId: string): number {
    const block = findBlockById(blockId)
    return block?.interactionIds?.length || 0
  }

  /**
   * Clean up interactions when a block is deleted
   * - Removes interactions where deleted block is the trigger
   * - Removes deleted block from targetBlockIds arrays
   * - Removes interactions that have no remaining targets
   */
  function cleanupBlockInteractions(blockId: string): void {
    const interactions = pageSettings.value.interactions
    if (!interactions) return

    // Find interactions to process
    const affectedInteractions = interactions.filter(
      i => i.triggerBlockId === blockId || i.targetBlockIds.includes(blockId)
    )

    if (affectedInteractions.length === 0) return

    onBeforeChange()

    for (const interaction of affectedInteractions) {
      // If the deleted block is the trigger, remove the whole interaction
      if (interaction.triggerBlockId === blockId) {
        const index = interactions.findIndex(i => i.id === interaction.id)
        if (index !== -1) {
          interactions.splice(index, 1)
        }
        continue
      }

      // If the deleted block is a target, remove it from targetBlockIds
      const targetIdx = interaction.targetBlockIds.indexOf(blockId)
      if (targetIdx !== -1) {
        interaction.targetBlockIds.splice(targetIdx, 1)

        // If no targets remain, remove the interaction entirely
        if (interaction.targetBlockIds.length === 0) {
          // Remove from trigger block's interactionIds
          const triggerBlock = findBlockById(interaction.triggerBlockId)
          if (triggerBlock?.interactionIds) {
            const idx = triggerBlock.interactionIds.indexOf(interaction.id)
            if (idx !== -1) {
              triggerBlock.interactionIds.splice(idx, 1)
            }
          }

          // Remove the interaction
          const index = interactions.findIndex(i => i.id === interaction.id)
          if (index !== -1) {
            interactions.splice(index, 1)
          }
        }
      }
    }
  }

  return {
    getInteractions,
    getInteractionsForBlock,
    getInteractionsTargetingBlock,
    getInteractionById,
    createInteraction,
    updateInteraction,
    updateInteractionStyles,
    deleteInteraction,
    duplicateInteraction,
    renameInteraction,
    blockHasInteractions,
    getInteractionCount,
    cleanupBlockInteractions,
  }
}
