/**
 * Style Inspector Repeater Logic Composable
 *
 * Centralizes all repeater group style logic and update handlers.
 * Uses a factory pattern to generate section-specific update handlers.
 */

import { computed, type ComputedRef } from 'vue'
import type { SectionStyleProperties, RepeaterField } from '@/types/sections'
import { resolveRepeaterGroupStyles, getRepeaterStylePropertyKey } from '@/lib/section-styles'

interface RepeaterInput {
  sectionStyles: ComputedRef<SectionStyleProperties>
  activeRepeaterField: ComputedRef<RepeaterField | null>
  updateSectionStyle: (key: string, value: unknown) => void
}

// Map of style properties to their suffix for repeater group styles
const repeaterStyleSuffixMap = {
  spaceBetween: 'SpaceBetween',
  backgroundColor: 'BackgroundColor',
  borderColor: 'BorderColor',
  borderWidth: 'BorderWidth',
} as const

type RepeaterGroupStyleProperty = keyof typeof repeaterStyleSuffixMap

/**
 * Creates merged group styles (combines repeater group styles + section styles)
 */
function createGroupStyles(
  sectionStyles: ComputedRef<SectionStyleProperties>,
  activeRepeaterField: ComputedRef<RepeaterField | null>
) {
  const activeRepeaterGroupStyles = computed(() => {
    if (!activeRepeaterField.value) return {}
    return resolveRepeaterGroupStyles(sectionStyles.value, activeRepeaterField.value.key)
  })

  return computed(() => ({
    spaceBetween: activeRepeaterGroupStyles.value.spaceBetween,
    ...sectionStyles.value,
  }))
}

/**
 * Creates update handler for repeater group styles
 */
function createUpdateRepeaterGroupStyle(
  activeRepeaterField: ComputedRef<RepeaterField | null>,
  updateSectionStyle: (key: string, value: unknown) => void
) {
  return (property: RepeaterGroupStyleProperty, value: unknown) => {
    if (!activeRepeaterField.value) return
    const suffix = repeaterStyleSuffixMap[property]
    const key = getRepeaterStylePropertyKey(activeRepeaterField.value.key, suffix)
    updateSectionStyle(key, value)
  }
}

/**
 * Creates update handler for shared child styles
 */
function createUpdateSharedStyle(updateSectionStyle: (key: string, value: unknown) => void) {
  return (key: string, value: unknown) => {
    updateSectionStyle(key, value)
  }
}

/**
 * Creates update handler that routes between repeater group and shared child styles
 */
function createGroupStyleUpdateHandler(
  updateRepeaterGroupStyle: (property: RepeaterGroupStyleProperty, value: unknown) => void,
  updateSharedStyle: (key: string, value: unknown) => void
) {
  return (key: string, value: unknown) => {
    if (key === 'spaceBetween') {
      updateRepeaterGroupStyle(key, value)
    } else {
      updateSharedStyle(key, value)
    }
  }
}

/**
 * Main composable for repeater group style management
 */
export function useStyleInspectorRepeater(input: RepeaterInput) {
  const { sectionStyles, activeRepeaterField, updateSectionStyle } = input

  // Base update handlers
  const updateRepeaterGroupStyle = createUpdateRepeaterGroupStyle(activeRepeaterField, updateSectionStyle)
  const updateSharedCardStyle = createUpdateSharedStyle(updateSectionStyle)
  const updateSharedProductStyle = createUpdateSharedStyle(updateSectionStyle)
  const updateSharedAccordionStyle = createUpdateSharedStyle(updateSectionStyle)
  const updateSharedLinkStyle = createUpdateSharedStyle(updateSectionStyle)
  const updateSharedFormInputStyle = createUpdateSharedStyle(updateSectionStyle)

  // Merged group styles for each section type
  const cardsGroupStyles = createGroupStyles(sectionStyles, activeRepeaterField)
  const productsGroupStyles = createGroupStyles(sectionStyles, activeRepeaterField)
  const accordionGroupStyles = createGroupStyles(sectionStyles, activeRepeaterField)
  const linksGroupStyles = createGroupStyles(sectionStyles, activeRepeaterField)
  const contactFormFieldsGroupStyles = createGroupStyles(sectionStyles, activeRepeaterField)
  const contactSocialLinksGroupStyles = createGroupStyles(sectionStyles, activeRepeaterField)

  // Section-specific update handlers
  const updateCardsGroupStyle = createGroupStyleUpdateHandler(updateRepeaterGroupStyle, updateSharedCardStyle)
  const updateProductsGroupStyle = createGroupStyleUpdateHandler(updateRepeaterGroupStyle, updateSharedProductStyle)
  const updateAccordionGroupStyle = createGroupStyleUpdateHandler(updateRepeaterGroupStyle, updateSharedAccordionStyle)
  const updateLinksGroupStyle = createGroupStyleUpdateHandler(updateRepeaterGroupStyle, updateSharedLinkStyle)
  const updateContactFormFieldsGroupStyle = createGroupStyleUpdateHandler(updateRepeaterGroupStyle, updateSharedFormInputStyle)
  const updateContactSocialLinksGroupStyle = createGroupStyleUpdateHandler(updateRepeaterGroupStyle, updateSharedLinkStyle)

  return {
    // Group styles
    cardsGroupStyles,
    productsGroupStyles,
    accordionGroupStyles,
    linksGroupStyles,
    contactFormFieldsGroupStyles,
    contactSocialLinksGroupStyles,

    // Update handlers
    updateCardsGroupStyle,
    updateProductsGroupStyle,
    updateAccordionGroupStyle,
    updateLinksGroupStyle,
    updateContactFormFieldsGroupStyle,
    updateContactSocialLinksGroupStyle,

    // Base update handlers (for direct use if needed)
    updateSharedCardStyle,
    updateSharedProductStyle,
    updateSharedAccordionStyle,
    updateSharedLinkStyle,
    updateSharedFormInputStyle,
  }
}
