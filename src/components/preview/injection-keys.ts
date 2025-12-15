import type { ComputedRef, Ref, InjectionKey } from 'vue'
import type { ChildEffectOverride, BaseEffect, StaggerConfig } from '@/types/editor'

// Stagger context for child animations
export interface StaggerContext {
  config: StaggerConfig
  totalChildren: number
  effectType: 'hover' | 'appear' | 'scroll'
}

// Child effects context - parent passes effect overrides to children
export interface ChildEffectsContext {
  // Parent's hover state (so children can react to parent hover)
  isParentHovering: Ref<boolean>
  // Parent's appear state
  hasParentAppeared: Ref<boolean>
  // Parent's scroll progress
  parentScrollProgress: Ref<number>
  // Effect overrides for each child
  hoverOverrides?: ChildEffectOverride[]
  appearOverrides?: ChildEffectOverride[]
  scrollOverrides?: ChildEffectOverride[]
  // Parent effect config (for timing defaults)
  parentHoverEffect?: BaseEffect
  parentAppearEffect?: BaseEffect
  parentScrollEffect?: BaseEffect
}

// Shared injection keys - must be the same Symbol instance across all components
export const STAGGER_CONTEXT_KEY: InjectionKey<StaggerContext | null> = Symbol('staggerContext')
export const CHILD_EFFECTS_CONTEXT_KEY: InjectionKey<ComputedRef<ChildEffectsContext | null>> = Symbol('childEffectsContext')
