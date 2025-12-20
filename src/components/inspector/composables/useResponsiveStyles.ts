import { computed, type Ref, type ComputedRef } from 'vue'
import type { ViewportSize, BaseBlockStyles, CoreBlockStyles } from '@/types/designer'
import { hasViewportOverride, getInheritedValue } from '@/lib/style-utils'

/**
 * Composable for handling responsive style indicators and inheritance.
 * Shows when a style has viewport-specific overrides.
 */
export function useResponsiveStyles(
  blockStyles: ComputedRef<BaseBlockStyles | Record<string, unknown>>,
  currentViewport: ComputedRef<ViewportSize>
) {
  /**
   * Check if a specific style property has a viewport override
   */
  function hasOverride(property: keyof CoreBlockStyles): boolean {
    return hasViewportOverride(
      blockStyles.value as BaseBlockStyles,
      currentViewport.value,
      property
    )
  }

  /**
   * Get the inherited value for a property (from desktop or tablet)
   */
  function getInherited<T>(property: keyof CoreBlockStyles): T | undefined {
    return getInheritedValue(
      blockStyles.value as BaseBlockStyles,
      currentViewport.value,
      property
    ) as T | undefined
  }

  /**
   * Check if we're on a non-desktop viewport where overrides can be applied
   */
  const canHaveOverrides = computed(() => currentViewport.value !== 'desktop')

  /**
   * Get indicator class for a property based on override status
   */
  function getOverrideIndicatorClass(property: keyof CoreBlockStyles): string {
    if (!canHaveOverrides.value) return ''
    return hasOverride(property) ? 'has-override' : ''
  }

  return {
    hasOverride,
    getInherited,
    canHaveOverrides,
    getOverrideIndicatorClass,
  }
}
