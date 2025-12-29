/**
 * Style Inspector Section Detection Composable
 *
 * Centralizes all section type detection logic for StyleInspector.
 * Returns flags for different section types and variants, plus helper functions.
 */

import { computed, type ComputedRef } from 'vue'
import type { SectionInstance, RepeaterField } from '@/types/sections'
import { isAccordionType } from '@/lib/section-types'

interface SectionDetectionInput {
  selectedSection: ComputedRef<SectionInstance | null>
  activeRepeaterField: ComputedRef<RepeaterField | null>
  isEditingItem: ComputedRef<boolean>
  activeItemId: ComputedRef<string | null>
}

export interface SectionFlags {
  // Section type flags
  isCardsSection: ComputedRef<boolean>
  isProductsSection: ComputedRef<boolean>
  isAccordionSection: ComputedRef<boolean>
  isLinksSection: ComputedRef<boolean>
  isContactSection: ComputedRef<boolean>
  isCTASection: ComputedRef<boolean>

  // Variant flags
  isCardsSplitVariant: ComputedRef<boolean>
  isProductsSplitVariant: ComputedRef<boolean>
  isCTAStackedVariant: ComputedRef<boolean>

  // Repeater group selection flags
  isCardsRepeaterGroupSelected: ComputedRef<boolean>
  isProductsRepeaterGroupSelected: ComputedRef<boolean>

  // Item editing flags
  isEditingCardsItem: ComputedRef<boolean>
  isEditingProductsItem: ComputedRef<boolean>
  isEditingAccordionItem: ComputedRef<boolean>
  isEditingLinksItem: ComputedRef<boolean>
  isEditingContactFormField: ComputedRef<boolean>
  isEditingContactSocialLink: ComputedRef<boolean>

  // Combined flags
  isEditingSharedStyleItem: ComputedRef<boolean>
  isSharedStyleSection: ComputedRef<boolean>
}

/**
 * Detects section types and returns reactive flags
 */
export function useStyleInspectorSection(input: SectionDetectionInput): SectionFlags {
  const { selectedSection, activeRepeaterField, isEditingItem, activeItemId } = input

  // Section type flags
  const isCardsSection = computed(() => selectedSection.value?.type === 'cards')
  const isProductsSection = computed(() => selectedSection.value?.type === 'products')
  const isAccordionSection = computed(() => isAccordionType(selectedSection.value?.type))
  const isLinksSection = computed(() => selectedSection.value?.type === 'links')
  const isContactSection = computed(() => selectedSection.value?.type === 'contact')
  const isCTASection = computed(() => selectedSection.value?.type === 'cta')

  // Variant flags
  const isCardsSplitVariant = computed(() => isCardsSection.value && selectedSection.value?.variant === 'split')
  const isProductsSplitVariant = computed(() => isProductsSection.value && selectedSection.value?.variant === 'split')
  const isCTAStackedVariant = computed(() => isCTASection.value && selectedSection.value?.variant === 'stacked')

  // Repeater group selection flags
  const isCardsRepeaterGroupSelected = computed(() =>
    isCardsSplitVariant.value &&
    activeRepeaterField.value?.key === 'items' &&
    !isEditingItem.value
  )
  const isProductsRepeaterGroupSelected = computed(() =>
    isProductsSplitVariant.value &&
    activeRepeaterField.value?.key === 'items' &&
    !isEditingItem.value
  )

  // Item editing flags - item selection shows content only, styles are SHARED at section level
  const isEditingCardsItem = computed(() => isCardsSection.value && isEditingItem.value && !!activeItemId.value)
  const isEditingProductsItem = computed(() => isProductsSection.value && isEditingItem.value && !!activeItemId.value)
  const isEditingAccordionItem = computed(() => isAccordionSection.value && isEditingItem.value && !!activeItemId.value)
  const isEditingLinksItem = computed(() => isLinksSection.value && isEditingItem.value && !!activeItemId.value)
  const isEditingContactFormField = computed(() =>
    isContactSection.value &&
    isEditingItem.value &&
    !!activeItemId.value &&
    activeRepeaterField.value?.key === 'formFields'
  )
  const isEditingContactSocialLink = computed(() =>
    isContactSection.value &&
    isEditingItem.value &&
    !!activeItemId.value &&
    activeRepeaterField.value?.key === 'socialLinks'
  )

  // Combined check for any section using shared styles (Cards pattern)
  // When editing items in these sections, hide per-item visual controls
  const isEditingSharedStyleItem = computed(() =>
    isEditingCardsItem.value ||
    isEditingProductsItem.value ||
    isEditingAccordionItem.value ||
    isEditingLinksItem.value ||
    isEditingContactSocialLink.value
  )

  // Check if current section uses shared styles (for repeater group level controls)
  const isSharedStyleSection = computed(() =>
    isCardsSection.value ||
    isProductsSection.value ||
    isAccordionSection.value ||
    isLinksSection.value ||
    isContactSection.value
  )

  return {
    isCardsSection,
    isProductsSection,
    isAccordionSection,
    isLinksSection,
    isContactSection,
    isCTASection,
    isCardsSplitVariant,
    isProductsSplitVariant,
    isCTAStackedVariant,
    isCardsRepeaterGroupSelected,
    isProductsRepeaterGroupSelected,
    isEditingCardsItem,
    isEditingProductsItem,
    isEditingAccordionItem,
    isEditingLinksItem,
    isEditingContactFormField,
    isEditingContactSocialLink,
    isEditingSharedStyleItem,
    isSharedStyleSection,
  }
}
