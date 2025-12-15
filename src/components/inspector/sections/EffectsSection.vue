<script setup lang="ts">
import type { BlockEffects, HoverEffect, ScrollEffect, AppearEffect, LoopEffect, EffectState, EffectPreset, EffectEasing, TransformOrigin, StaggerConfig, ChildEffectOverride, SectionBlock } from '@/types/editor'
import { presetOptions, easingOptions, transformOriginOptions, getPresetConfig } from '@/lib/effect-utils'
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import Popover from '@/components/ui/Popover.vue'
import Icon from '@/components/ui/Icon.vue'
import SliderInput from '../SliderInput.vue'
import SizeInput from '../SizeInput.vue'
import SelectInput from '../SelectInput.vue'
import ToggleInput from '../ToggleInput.vue'
import ColorInput from '../ColorInput.vue'

const props = defineProps<{
  effects?: BlockEffects
  // Children blocks for child effect targeting
  children?: SectionBlock[]
}>()

const emit = defineEmits<{
  'update:effects': [value: BlockEffects]
}>()

// Convert options for SelectInput
const easingSelectOptions = easingOptions.map(o => ({ value: o.value, label: o.label }))
const presetSelectOptions = presetOptions.map(o => ({ value: o.value, label: o.label }))
const transformOriginSelectOptions = transformOriginOptions.map(o => ({ value: o.value, label: o.label }))

// Scroll trigger options
const scrollTriggerOptions = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
]

// Appear trigger options
const appearTriggerOptions = [
  { value: 'inView', label: 'In View' },
  { value: 'load', label: 'Page Load' },
]

// Loop start trigger options
const loopStartOptions = [
  { value: 'load', label: 'On page load' },
  { value: 'inView', label: 'When in view' },
  { value: 'hover', label: 'On hover' },
]

// Loop stop trigger options
const loopStopOptions = [
  { value: 'never', label: 'Never' },
  { value: 'outOfView', label: 'Out of view' },
  { value: 'hover', label: 'On hover out' },
]

// Scroll range relative to options
const scrollRelativeToOptions = [
  { value: 'self', label: 'Self' },
  { value: 'parent', label: 'Parent' },
  { value: 'page', label: 'Page' },
]

// Stagger from options
const staggerFromOptions = [
  { value: 'first', label: 'First' },
  { value: 'last', label: 'Last' },
  { value: 'center', label: 'Center' },
  { value: 'edges', label: 'Edges' },
]

// Effect property config type
interface PropertyConfig {
  key: string
  label: string
  type: 'slider' | 'size' | 'color'
  min?: number
  max?: number
  step?: number
  unit?: string
  default: string | number
}

// Effect property categories for "Add value" dropdown
const effectPropertyCategories: { label: string; properties: PropertyConfig[] }[] = [
  {
    label: 'Style',
    properties: [
      { key: 'opacity', label: 'Opacity', type: 'slider', min: 0, max: 100, step: 5, unit: '%', default: 100 },
      { key: 'blur', label: 'Blur', type: 'size', default: '0' },
    ],
  },
  {
    label: 'Size',
    properties: [
      { key: 'width', label: 'Width', type: 'size', default: '' },
      { key: 'height', label: 'Height', type: 'size', default: '' },
      { key: 'scale', label: 'Scale', type: 'slider', min: 0.5, max: 2, step: 0.05, default: 1 },
    ],
  },
  {
    label: 'Move',
    properties: [
      { key: 'translateX', label: 'Move X', type: 'size', default: '0' },
      { key: 'translateY', label: 'Move Y', type: 'size', default: '0' },
      { key: 'rotate', label: 'Rotate', type: 'size', default: '0' },
    ],
  },
  {
    label: 'Color',
    properties: [
      { key: 'backgroundColor', label: 'Background', type: 'color', default: '' },
      { key: 'color', label: 'Text Color', type: 'color', default: '' },
    ],
  },
  {
    label: 'Border',
    properties: [
      { key: 'borderRadius', label: 'Radius', type: 'size', default: '' },
      { key: 'borderWidth', label: 'Width', type: 'size', default: '' },
      { key: 'borderColor', label: 'Color', type: 'color', default: '' },
    ],
  },
  {
    label: 'Shadow',
    properties: [
      { key: 'shadowX', label: 'X', type: 'size', default: '0' },
      { key: 'shadowY', label: 'Y', type: 'size', default: '0' },
      { key: 'shadowBlur', label: 'Blur', type: 'size', default: '0' },
      { key: 'shadowColor', label: 'Color', type: 'color', default: '' },
    ],
  },
  {
    label: 'Spacing',
    properties: [
      { key: 'paddingTop', label: 'Padding Top', type: 'size', default: '' },
      { key: 'paddingRight', label: 'Padding Right', type: 'size', default: '' },
      { key: 'paddingBottom', label: 'Padding Bottom', type: 'size', default: '' },
      { key: 'paddingLeft', label: 'Padding Left', type: 'size', default: '' },
    ],
  },
]

// Get all property keys
const allPropertyKeys = effectPropertyCategories.flatMap(c => c.properties.map(p => p.key))

// Get property config by key
function getPropertyConfig(key: string): PropertyConfig | null {
  for (const category of effectPropertyCategories) {
    const prop = category.properties.find(p => p.key === key)
    if (prop) return prop
  }
  return null
}

// Check which properties are active (have values in from or to)
function getActiveProperties(from?: EffectState, to?: EffectState): string[] {
  const active: string[] = []
  for (const key of allPropertyKeys) {
    const fromVal = from?.[key as keyof EffectState]
    const toVal = to?.[key as keyof EffectState]
    if (fromVal !== undefined || toVal !== undefined) {
      active.push(key)
    }
  }
  return active
}

// Default effect state
const defaultFromState: EffectState = {
  opacity: 100,
  scale: 1,
  translateX: '0',
  translateY: '0',
}

const defaultToState: EffectState = {
  opacity: 100,
  scale: 1,
  translateX: '0',
  translateY: '0',
}

// Check if effect has values
function hasHoverEffect(): boolean {
  return !!props.effects?.hover?.enabled
}

function hasScrollEffect(): boolean {
  return !!props.effects?.scroll?.enabled
}

function hasAppearEffect(): boolean {
  return !!props.effects?.appear?.enabled
}

function hasLoopEffect(): boolean {
  return !!props.effects?.loop?.enabled
}

// Apply preset and get from/to states
function applyPreset(preset: EffectPreset): { from: EffectState; to: EffectState; duration?: number; easing?: EffectEasing; transformOrigin?: TransformOrigin } {
  const config = getPresetConfig(preset)
  return {
    from: { ...config.from },
    to: { ...config.to },
    duration: config.duration,
    easing: config.easing,
    transformOrigin: config.transformOrigin,
  }
}

// Initialize effect with defaults (no properties by default)
function initHover() {
  updateHover({
    type: 'hover',
    enabled: true,
    preset: 'custom',
    from: {},
    to: {},
    duration: 300,
    delay: 0,
    easing: 'ease-out',
  })
}

function initScroll() {
  updateScroll({
    type: 'scroll',
    enabled: true,
  })
}

function initAppear() {
  updateAppear({
    type: 'appear',
    enabled: true,
    trigger: 'inView',
  })
}

// Reset effects
function resetHover() {
  emit('update:effects', {
    ...props.effects,
    hover: undefined,
  })
}

function resetScroll() {
  emit('update:effects', {
    ...props.effects,
    scroll: undefined,
  })
}

function resetAppear() {
  emit('update:effects', {
    ...props.effects,
    appear: undefined,
  })
}

function initLoop() {
  updateLoop({
    type: 'loop',
    enabled: true,
    from: {},
    to: {},
    duration: 1000,
    loop: true,
    reverse: false,
    startTrigger: 'load',
    stopTrigger: 'never',
    easing: 'ease-in-out',
  })
}

function resetLoop() {
  emit('update:effects', {
    ...props.effects,
    loop: undefined,
  })
}

// Helper to update hover effect
function updateHover(updates: Partial<HoverEffect>) {
  const currentHover = props.effects?.hover || { type: 'hover' as const, enabled: true }
  emit('update:effects', {
    ...props.effects,
    hover: { ...currentHover, ...updates },
  })
}

// Helper to update scroll effect
function updateScroll(updates: Partial<ScrollEffect>) {
  const currentScroll = props.effects?.scroll || { type: 'scroll' as const, enabled: true }
  emit('update:effects', {
    ...props.effects,
    scroll: { ...currentScroll, ...updates },
  })
}

// Helper to update appear effect
function updateAppear(updates: Partial<AppearEffect>) {
  const currentAppear = props.effects?.appear || { type: 'appear' as const, enabled: true }
  emit('update:effects', {
    ...props.effects,
    appear: { ...currentAppear, ...updates },
  })
}

// Helper to update loop effect
function updateLoop(updates: Partial<LoopEffect>) {
  const currentLoop = props.effects?.loop || { type: 'loop' as const, enabled: true }
  emit('update:effects', {
    ...props.effects,
    loop: { ...currentLoop, ...updates },
  })
}

// Update stagger config helpers
function updateHoverStagger(updates: Partial<StaggerConfig>) {
  const currentStagger = props.effects?.hover?.stagger || { enabled: true, amount: 100, from: 'first' }
  updateHover({ stagger: { ...currentStagger, ...updates } })
}

function updateScrollStagger(updates: Partial<StaggerConfig>) {
  const currentStagger = props.effects?.scroll?.stagger || { enabled: true, amount: 100, from: 'first' }
  updateScroll({ stagger: { ...currentStagger, ...updates } })
}

function updateAppearStagger(updates: Partial<StaggerConfig>) {
  const currentStagger = props.effects?.appear?.stagger || { enabled: true, amount: 100, from: 'first' }
  updateAppear({ stagger: { ...currentStagger, ...updates } })
}

// ============================================
// CHILD EFFECT OVERRIDES
// ============================================

// Get child options for select
const childOptions = computed(() => {
  if (!props.children?.length) return []
  return props.children.map(child => ({
    value: child.id,
    label: child.name || child.type,
  }))
})

// Selected child for editing (per effect type) - used by Scroll/Appear, Hover uses editingHoverChildId
const selectedAppearChildId = ref<string | null>(null)
const selectedScrollChildId = ref<string | null>(null)

// Get override for a specific child
function getHoverChildOverride(childId: string): ChildEffectOverride | undefined {
  return props.effects?.hover?.childOverrides?.find(o => o.childId === childId)
}

function getAppearChildOverride(childId: string): ChildEffectOverride | undefined {
  return props.effects?.appear?.childOverrides?.find(o => o.childId === childId)
}

function getScrollChildOverride(childId: string): ChildEffectOverride | undefined {
  return props.effects?.scroll?.childOverrides?.find(o => o.childId === childId)
}

// Add or update child override
function updateHoverChildOverride(childId: string, updates: Partial<Omit<ChildEffectOverride, 'childId'>>) {
  const currentOverrides = props.effects?.hover?.childOverrides || []
  const existingIndex = currentOverrides.findIndex(o => o.childId === childId)

  let newOverrides: ChildEffectOverride[]
  if (existingIndex >= 0) {
    // Update existing - explicitly set childId to ensure it's always a string
    const existing = currentOverrides[existingIndex]
    newOverrides = [...currentOverrides]
    newOverrides[existingIndex] = { childId, ...existing, ...updates }
  } else {
    // Add new
    newOverrides = [...currentOverrides, { childId, ...updates }]
  }

  updateHover({ childOverrides: newOverrides })
}

function updateAppearChildOverride(childId: string, updates: Partial<Omit<ChildEffectOverride, 'childId'>>) {
  const currentOverrides = props.effects?.appear?.childOverrides || []
  const existingIndex = currentOverrides.findIndex(o => o.childId === childId)

  let newOverrides: ChildEffectOverride[]
  if (existingIndex >= 0) {
    const existing = currentOverrides[existingIndex]
    newOverrides = [...currentOverrides]
    newOverrides[existingIndex] = { childId, ...existing, ...updates }
  } else {
    newOverrides = [...currentOverrides, { childId, ...updates }]
  }

  updateAppear({ childOverrides: newOverrides })
}

function updateScrollChildOverride(childId: string, updates: Partial<Omit<ChildEffectOverride, 'childId'>>) {
  const currentOverrides = props.effects?.scroll?.childOverrides || []
  const existingIndex = currentOverrides.findIndex(o => o.childId === childId)

  let newOverrides: ChildEffectOverride[]
  if (existingIndex >= 0) {
    const existing = currentOverrides[existingIndex]
    newOverrides = [...currentOverrides]
    newOverrides[existingIndex] = { childId, ...existing, ...updates }
  } else {
    newOverrides = [...currentOverrides, { childId, ...updates }]
  }

  updateScroll({ childOverrides: newOverrides })
}

// Remove child override
function removeHoverChildOverride(childId: string) {
  const currentOverrides = props.effects?.hover?.childOverrides || []
  updateHover({ childOverrides: currentOverrides.filter(o => o.childId !== childId) })
  if (editingHoverChildId.value === childId) {
    editingHoverChildId.value = null
  }
}

function removeAppearChildOverride(childId: string) {
  const currentOverrides = props.effects?.appear?.childOverrides || []
  updateAppear({ childOverrides: currentOverrides.filter(o => o.childId !== childId) })
  if (selectedAppearChildId.value === childId) {
    selectedAppearChildId.value = null
  }
}

function removeScrollChildOverride(childId: string) {
  const currentOverrides = props.effects?.scroll?.childOverrides || []
  updateScroll({ childOverrides: currentOverrides.filter(o => o.childId !== childId) })
  if (selectedScrollChildId.value === childId) {
    selectedScrollChildId.value = null
  }
}

// Apply preset to child override
function applyChildPreset(preset: EffectPreset): Partial<Omit<ChildEffectOverride, 'childId'>> {
  if (preset === 'custom') {
    return { preset: 'custom' }
  }
  const config = getPresetConfig(preset)
  return {
    preset,
    from: { ...config.from },
    to: { ...config.to },
    duration: config.duration,
    easing: config.easing,
  }
}

// Get children that have overrides
const childrenWithHoverOverrides = computed(() => {
  return props.effects?.hover?.childOverrides?.map(o => o.childId) || []
})

const childrenWithAppearOverrides = computed(() => {
  return props.effects?.appear?.childOverrides?.map(o => o.childId) || []
})

const childrenWithScrollOverrides = computed(() => {
  return props.effects?.scroll?.childOverrides?.map(o => o.childId) || []
})

// Get available children (not yet added)
const availableChildrenForHover = computed(() => {
  return childOptions.value.filter(c => !childrenWithHoverOverrides.value.includes(c.value))
})

const availableChildrenForAppear = computed(() => {
  return childOptions.value.filter(c => !childrenWithAppearOverrides.value.includes(c.value))
})

const availableChildrenForScroll = computed(() => {
  return childOptions.value.filter(c => !childrenWithScrollOverrides.value.includes(c.value))
})

// Preset change handlers
function onHoverPresetChange(preset: string) {
  if (preset === 'custom') {
    updateHover({ preset: 'custom' })
    return
  }
  const { from, to, duration, easing, transformOrigin } = applyPreset(preset as EffectPreset)
  updateHover({ preset: preset as EffectPreset, from, to, duration, easing, transformOrigin })
}

function onScrollPresetChange(preset: string) {
  if (preset === 'custom') {
    updateScroll({ preset: 'custom' })
    return
  }
  const { from, to, duration, easing, transformOrigin } = applyPreset(preset as EffectPreset)
  updateScroll({ preset: preset as EffectPreset, from, to, duration, easing, transformOrigin })
}

function onAppearPresetChange(preset: string) {
  if (preset === 'custom') {
    updateAppear({ preset: 'custom' })
    return
  }
  const { from, to, duration, easing, transformOrigin } = applyPreset(preset as EffectPreset)
  updateAppear({ preset: preset as EffectPreset, from, to, duration, easing, transformOrigin })
}

// Preview helpers
function getHoverPreview(): string {
  if (!hasHoverEffect()) return 'None'
  const preset = props.effects?.hover?.preset
  if (preset && preset !== 'custom') {
    return presetOptions.find(p => p.value === preset)?.label || 'Active'
  }
  return 'Custom'
}

function getScrollPreview(): string {
  if (!hasScrollEffect()) return 'None'
  const preset = props.effects?.scroll?.preset
  if (preset && preset !== 'custom') {
    return presetOptions.find(p => p.value === preset)?.label || 'Active'
  }
  return 'Custom'
}

function getAppearPreview(): string {
  if (!hasAppearEffect()) return 'None'
  const preset = props.effects?.appear?.preset
  if (preset && preset !== 'custom') {
    return presetOptions.find(p => p.value === preset)?.label || 'Active'
  }
  return 'Custom'
}

function getLoopPreview(): string {
  if (!hasLoopEffect()) return 'None'
  return 'Active'
}

// Update effect state helpers
function updateHoverFrom(key: keyof EffectState, value: string | number) {
  const currentFrom = props.effects?.hover?.from || { ...defaultFromState }
  updateHover({ from: { ...currentFrom, [key]: value }, preset: 'custom' })
}

function updateHoverTo(key: keyof EffectState, value: string | number) {
  const currentTo = props.effects?.hover?.to || { ...defaultToState }
  updateHover({ to: { ...currentTo, [key]: value }, preset: 'custom' })
}

function updateScrollFrom(key: keyof EffectState, value: string | number) {
  const currentFrom = props.effects?.scroll?.from || { ...defaultFromState }
  updateScroll({ from: { ...currentFrom, [key]: value } })
}

function updateScrollTo(key: keyof EffectState, value: string | number) {
  const currentTo = props.effects?.scroll?.to || { ...defaultToState }
  updateScroll({ to: { ...currentTo, [key]: value } })
}

function updateAppearFrom(key: keyof EffectState, value: string | number) {
  const currentFrom = props.effects?.appear?.from || { ...defaultFromState }
  updateAppear({ from: { ...currentFrom, [key]: value } })
}

function updateAppearTo(key: keyof EffectState, value: string | number) {
  const currentTo = props.effects?.appear?.to || { ...defaultToState }
  updateAppear({ to: { ...currentTo, [key]: value } })
}

function updateLoopFrom(key: keyof EffectState, value: string | number) {
  const currentFrom = props.effects?.loop?.from || {}
  updateLoop({ from: { ...currentFrom, [key]: value } })
}

function updateLoopTo(key: keyof EffectState, value: string | number) {
  const currentTo = props.effects?.loop?.to || {}
  updateLoop({ to: { ...currentTo, [key]: value } })
}

// Add a property to both From and To states
function addHoverProperty(key: string) {
  const config = getPropertyConfig(key)
  if (!config) return
  const currentFrom = props.effects?.hover?.from || {}
  const currentTo = props.effects?.hover?.to || {}
  updateHover({
    from: { ...currentFrom, [key]: config.default },
    to: { ...currentTo, [key]: config.default },
  })
}

function addScrollProperty(key: string) {
  const config = getPropertyConfig(key)
  if (!config) return
  const currentFrom = props.effects?.scroll?.from || {}
  const currentTo = props.effects?.scroll?.to || {}
  updateScroll({
    from: { ...currentFrom, [key]: config.default },
    to: { ...currentTo, [key]: config.default },
  })
}

function addAppearProperty(key: string) {
  const config = getPropertyConfig(key)
  if (!config) return
  const currentFrom = props.effects?.appear?.from || {}
  const currentTo = props.effects?.appear?.to || {}
  updateAppear({
    from: { ...currentFrom, [key]: config.default },
    to: { ...currentTo, [key]: config.default },
  })
}

function addLoopProperty(key: string) {
  const config = getPropertyConfig(key)
  if (!config) return
  const currentFrom = props.effects?.loop?.from || {}
  const currentTo = props.effects?.loop?.to || {}
  updateLoop({
    from: { ...currentFrom, [key]: config.default },
    to: { ...currentTo, [key]: config.default },
  })
}

// Remove a property from both From and To states
function removeHoverProperty(key: string) {
  const currentFrom = { ...props.effects?.hover?.from }
  const currentTo = { ...props.effects?.hover?.to }
  delete currentFrom[key as keyof EffectState]
  delete currentTo[key as keyof EffectState]
  updateHover({ from: currentFrom, to: currentTo })
}

function removeScrollProperty(key: string) {
  const currentFrom = { ...props.effects?.scroll?.from }
  const currentTo = { ...props.effects?.scroll?.to }
  delete currentFrom[key as keyof EffectState]
  delete currentTo[key as keyof EffectState]
  updateScroll({ from: currentFrom, to: currentTo })
}

function removeAppearProperty(key: string) {
  const currentFrom = { ...props.effects?.appear?.from }
  const currentTo = { ...props.effects?.appear?.to }
  delete currentFrom[key as keyof EffectState]
  delete currentTo[key as keyof EffectState]
  updateAppear({ from: currentFrom, to: currentTo })
}

function removeLoopProperty(key: string) {
  const currentFrom = { ...props.effects?.loop?.from }
  const currentTo = { ...props.effects?.loop?.to }
  delete currentFrom[key as keyof EffectState]
  delete currentTo[key as keyof EffectState]
  updateLoop({ from: currentFrom, to: currentTo })
}

// Get active properties for each effect type
const hoverActiveProps = computed(() => getActiveProperties(props.effects?.hover?.from, props.effects?.hover?.to))
const scrollActiveProps = computed(() => getActiveProperties(props.effects?.scroll?.from, props.effects?.scroll?.to))
const appearActiveProps = computed(() => getActiveProperties(props.effects?.appear?.from, props.effects?.appear?.to))
const loopActiveProps = computed(() => getActiveProperties(props.effects?.loop?.from, props.effects?.loop?.to))

// Toggle expanded sections
const showHoverAdvanced = ref(false)
const showScrollAdvanced = ref(false)
const showAppearAdvanced = ref(false)

// Hover effect UI state
const hoverActiveTab = ref<'from' | 'to'>('from')
const hoverSettingsOpen = ref(false)
const hoverChildrenOpen = ref(false)
const editingHoverChildId = ref<string | null>(null)

// Get the child being edited for hover effect
const editingHoverChild = computed(() => {
  if (!editingHoverChildId.value || !props.children) return null
  return props.children.find(c => c.id === editingHoverChildId.value) || null
})

// Scroll effect UI state
const scrollActiveTab = ref<'from' | 'to'>('from')
const scrollSettingsOpen = ref(false)
const scrollRangeOpen = ref(false)
const scrollChildrenOpen = ref(false)
const editingScrollChildId = ref<string | null>(null)

// Get the child being edited for scroll effect
const editingScrollChild = computed(() => {
  if (!editingScrollChildId.value || !props.children) return null
  return props.children.find(c => c.id === editingScrollChildId.value) || null
})

// Appear effect UI state
const appearActiveTab = ref<'from' | 'to'>('from')
const appearSettingsOpen = ref(false)
const appearChildrenOpen = ref(false)
const editingAppearChildId = ref<string | null>(null)

// Loop effect UI state
const loopActiveTab = ref<'from' | 'to'>('from')
const loopSettingsOpen = ref(false)

// Get the child being edited for appear effect
const editingAppearChild = computed(() => {
  if (!editingAppearChildId.value || !props.children) return null
  return props.children.find(c => c.id === editingAppearChildId.value) || null
})

// Get or create child override for editing
function getOrCreateHoverChildOverride(childId: string): ChildEffectOverride {
  const existing = getHoverChildOverride(childId)
  if (existing) return existing
  // Return a default override (will be created on first edit)
  return {
    childId,
    preset: 'custom',
    from: {},
    to: {},
  }
}

// Update child override from/to state
function updateHoverChildFrom(childId: string, key: keyof EffectState, value: string | number) {
  const current = getOrCreateHoverChildOverride(childId)
  const currentFrom = current.from || {}
  updateHoverChildOverride(childId, { from: { ...currentFrom, [key]: value }, preset: 'custom' })
}

function updateHoverChildTo(childId: string, key: keyof EffectState, value: string | number) {
  const current = getOrCreateHoverChildOverride(childId)
  const currentTo = current.to || {}
  updateHoverChildOverride(childId, { to: { ...currentTo, [key]: value }, preset: 'custom' })
}

// Get or create scroll child override for editing
function getOrCreateScrollChildOverride(childId: string): ChildEffectOverride {
  const existing = getScrollChildOverride(childId)
  if (existing) return existing
  // Return a default override (will be created on first edit)
  return {
    childId,
  }
}

// Update scroll child override from/to state
function updateScrollChildFrom(childId: string, key: keyof EffectState, value: string | number) {
  const current = getOrCreateScrollChildOverride(childId)
  const currentFrom = current.from || {}
  updateScrollChildOverride(childId, { from: { ...currentFrom, [key]: value } })
}

function updateScrollChildTo(childId: string, key: keyof EffectState, value: string | number) {
  const current = getOrCreateScrollChildOverride(childId)
  const currentTo = current.to || {}
  updateScrollChildOverride(childId, { to: { ...currentTo, [key]: value } })
}

// Get or create appear child override for editing
function getOrCreateAppearChildOverride(childId: string): ChildEffectOverride {
  const existing = getAppearChildOverride(childId)
  if (existing) return existing
  return {
    childId,
  }
}

// Update appear child override from/to state
function updateAppearChildFrom(childId: string, key: keyof EffectState, value: string | number) {
  const current = getOrCreateAppearChildOverride(childId)
  const currentFrom = current.from || {}
  updateAppearChildOverride(childId, { from: { ...currentFrom, [key]: value } })
}

function updateAppearChildTo(childId: string, key: keyof EffectState, value: string | number) {
  const current = getOrCreateAppearChildOverride(childId)
  const currentTo = current.to || {}
  updateAppearChildOverride(childId, { to: { ...currentTo, [key]: value } })
}

import { ref, computed } from 'vue'
</script>

<template>
  <InspectorSection title="Effects" icon="style-animation">
    <!-- Hover -->
    <InspectorField label="Hover" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="() => { if (!hasHoverEffect()) initHover(); toggle() }"
          >
            <Icon name="cursor" :size="12" class="text-muted-foreground" />
            <span class="truncate">{{ getHoverPreview() }}</span>
          </button>
        </template>
        <template #default="{ close: closePopover }">
        <div class="p-3" @click.stop>
            <!-- ==================== EDITING CHILD VIEW ==================== -->
            <template v-if="editingHoverChildId && editingHoverChild">
              <!-- Breadcrumb Navigation -->
              <div class="flex items-center gap-1.5 mb-3 pb-2 border-b border-border">
                <button
                  type="button"
                  class="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  @click.stop.prevent="editingHoverChildId = null"
                >
                  Hover
                </button>
                <Icon name="chevron-right" :size="10" class="text-muted-foreground" />
                <span class="text-xs font-medium text-foreground">{{ editingHoverChild.name || editingHoverChild.type }}</span>
                <div class="flex-1" />
                <button
                  type="button"
                  class="text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                  @click.stop.prevent="closePopover"
                >
                  Apply
                </button>
                <button
                  type="button"
                  class="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                  @click.stop.prevent="removeHoverChildOverride(editingHoverChildId); editingHoverChildId = null"
                >
                  Remove
                </button>
              </div>

              <!-- Child Preset Selector -->
              <InspectorField label="Preset" horizontal class="mb-3">
                <SelectInput
                  :options="presetSelectOptions"
                  :model-value="getOrCreateHoverChildOverride(editingHoverChildId).preset || 'custom'"
                  @update:model-value="(v: string) => updateHoverChildOverride(editingHoverChildId!, applyChildPreset(v as EffectPreset))"
                />
              </InspectorField>

              <!-- Child From/To Tab Selector -->
              <div class="flex gap-1 p-0.5 bg-secondary/50 rounded-md mb-3">
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="hoverActiveTab === 'from' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="hoverActiveTab = 'from'"
                >
                  From
                </button>
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="hoverActiveTab === 'to' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="hoverActiveTab = 'to'"
                >
                  To
                </button>
              </div>

              <!-- Child From State -->
              <div v-if="hoverActiveTab === 'from'" class="space-y-2">
                <InspectorField label="Opacity" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateHoverChildOverride(editingHoverChildId).from?.opacity ?? 100)"
                    :min="0"
                    :max="100"
                    :step="5"
                    unit="%"
                    @update:model-value="updateHoverChildFrom(editingHoverChildId!, 'opacity', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Scale" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateHoverChildOverride(editingHoverChildId).from?.scale ?? 1)"
                    :min="0.5"
                    :max="2"
                    :step="0.05"
                    @update:model-value="updateHoverChildFrom(editingHoverChildId!, 'scale', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Move X" horizontal>
                  <SizeInput
                    :model-value="getOrCreateHoverChildOverride(editingHoverChildId).from?.translateX || '0'"
                    placeholder="0"
                    @update:model-value="updateHoverChildFrom(editingHoverChildId!, 'translateX', $event)"
                  />
                </InspectorField>
                <InspectorField label="Move Y" horizontal>
                  <SizeInput
                    :model-value="getOrCreateHoverChildOverride(editingHoverChildId).from?.translateY || '0'"
                    placeholder="0"
                    @update:model-value="updateHoverChildFrom(editingHoverChildId!, 'translateY', $event)"
                  />
                </InspectorField>
                <InspectorField label="Rotate" horizontal>
                  <SizeInput
                    :model-value="getOrCreateHoverChildOverride(editingHoverChildId).from?.rotate || '0'"
                    placeholder="0"
                    @update:model-value="updateHoverChildFrom(editingHoverChildId!, 'rotate', $event)"
                  />
                </InspectorField>
                <InspectorField label="Blur" horizontal>
                  <SizeInput
                    :model-value="getOrCreateHoverChildOverride(editingHoverChildId).from?.blur || '0'"
                    placeholder="0"
                    @update:model-value="updateHoverChildFrom(editingHoverChildId!, 'blur', $event)"
                  />
                </InspectorField>
              </div>

              <!-- Child To State -->
              <div v-else class="space-y-2">
                <InspectorField label="Opacity" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateHoverChildOverride(editingHoverChildId).to?.opacity ?? 100)"
                    :min="0"
                    :max="100"
                    :step="5"
                    unit="%"
                    @update:model-value="updateHoverChildTo(editingHoverChildId!, 'opacity', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Scale" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateHoverChildOverride(editingHoverChildId).to?.scale ?? 1)"
                    :min="0.5"
                    :max="2"
                    :step="0.05"
                    @update:model-value="updateHoverChildTo(editingHoverChildId!, 'scale', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Move X" horizontal>
                  <SizeInput
                    :model-value="getOrCreateHoverChildOverride(editingHoverChildId).to?.translateX || '0'"
                    placeholder="0"
                    @update:model-value="updateHoverChildTo(editingHoverChildId!, 'translateX', $event)"
                  />
                </InspectorField>
                <InspectorField label="Move Y" horizontal>
                  <SizeInput
                    :model-value="getOrCreateHoverChildOverride(editingHoverChildId).to?.translateY || '0'"
                    placeholder="0"
                    @update:model-value="updateHoverChildTo(editingHoverChildId!, 'translateY', $event)"
                  />
                </InspectorField>
                <InspectorField label="Rotate" horizontal>
                  <SizeInput
                    :model-value="getOrCreateHoverChildOverride(editingHoverChildId).to?.rotate || '0'"
                    placeholder="0"
                    @update:model-value="updateHoverChildTo(editingHoverChildId!, 'rotate', $event)"
                  />
                </InspectorField>
                <InspectorField label="Blur" horizontal>
                  <SizeInput
                    :model-value="getOrCreateHoverChildOverride(editingHoverChildId).to?.blur || '0'"
                    placeholder="0"
                    @update:model-value="updateHoverChildTo(editingHoverChildId!, 'blur', $event)"
                  />
                </InspectorField>
              </div>

              <!-- Child Settings Accordion -->
              <div class="mt-3 border-t border-border pt-3">
                <button
                  type="button"
                  class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                  @click.stop.prevent="hoverSettingsOpen = !hoverSettingsOpen"
                >
                  <span>Settings</span>
                  <Icon :name="hoverSettingsOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
                </button>
                <div v-if="hoverSettingsOpen" class="mt-2 space-y-2">
                  <InspectorField label="Duration" horizontal>
                    <SliderInput
                      :model-value="String(getOrCreateHoverChildOverride(editingHoverChildId).duration ?? effects!.hover!.duration ?? 300)"
                      :min="100"
                      :max="2000"
                      :step="100"
                      unit="ms"
                      @update:model-value="(v: string) => updateHoverChildOverride(editingHoverChildId!, { duration: Number(v) })"
                    />
                  </InspectorField>
                  <InspectorField label="Delay" horizontal>
                    <SliderInput
                      :model-value="String(getOrCreateHoverChildOverride(editingHoverChildId).delay ?? 0)"
                      :min="0"
                      :max="1000"
                      :step="50"
                      unit="ms"
                      @update:model-value="(v: string) => updateHoverChildOverride(editingHoverChildId!, { delay: Number(v) })"
                    />
                  </InspectorField>
                  <InspectorField label="Easing" horizontal>
                    <SelectInput
                      :options="easingSelectOptions"
                      :model-value="getOrCreateHoverChildOverride(editingHoverChildId).easing || effects!.hover!.easing || 'ease'"
                      @update:model-value="(v: string) => updateHoverChildOverride(editingHoverChildId!, { easing: v as EffectEasing })"
                    />
                  </InspectorField>
                </div>
              </div>
            </template>

            <!-- ==================== MAIN HOVER VIEW ==================== -->
            <template v-else>
              <!-- Header with Apply and Reset -->
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-medium text-foreground">Hover Effect</span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                    @click.stop.prevent="closePopover"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    class="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                    @click.stop.prevent="resetHover"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <!-- Preset Selector -->
              <InspectorField label="Preset" horizontal class="mb-3">
                <SelectInput
                  :options="presetSelectOptions"
                  :model-value="effects!.hover!.preset || 'custom'"
                  @update:model-value="onHoverPresetChange"
                />
              </InspectorField>

              <!-- From/To Tab Selector -->
              <div class="flex gap-1 p-0.5 bg-secondary/50 rounded-md mb-3">
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="hoverActiveTab === 'from' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="hoverActiveTab = 'from'"
                >
                  From
                </button>
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="hoverActiveTab === 'to' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="hoverActiveTab = 'to'"
                >
                  To
                </button>
              </div>

              <!-- From/To State (Dynamic Properties) -->
              <div class="space-y-2">
                <!-- Active Properties -->
                <template v-for="propKey in hoverActiveProps" :key="propKey">
                  <div class="flex items-center gap-1 group">
                    <InspectorField :label="getPropertyConfig(propKey)?.label || propKey" horizontal class="flex-1">
                      <!-- Slider input for opacity, scale -->
                      <SliderInput
                        v-if="getPropertyConfig(propKey)?.type === 'slider'"
                        :model-value="String(hoverActiveTab === 'from' ? (effects!.hover!.from?.[propKey as keyof EffectState] ?? getPropertyConfig(propKey)?.default) : (effects!.hover!.to?.[propKey as keyof EffectState] ?? getPropertyConfig(propKey)?.default))"
                        :min="getPropertyConfig(propKey)?.min"
                        :max="getPropertyConfig(propKey)?.max"
                        :step="getPropertyConfig(propKey)?.step"
                        :unit="getPropertyConfig(propKey)?.unit"
                        @update:model-value="hoverActiveTab === 'from' ? updateHoverFrom(propKey as keyof EffectState, Number($event)) : updateHoverTo(propKey as keyof EffectState, Number($event))"
                      />
                      <!-- Color input -->
                      <ColorInput
                        v-else-if="getPropertyConfig(propKey)?.type === 'color'"
                        :model-value="(hoverActiveTab === 'from' ? effects!.hover!.from?.[propKey as keyof EffectState] : effects!.hover!.to?.[propKey as keyof EffectState]) as string | undefined"
                        swatch-only
                        @update:model-value="hoverActiveTab === 'from' ? updateHoverFrom(propKey as keyof EffectState, $event) : updateHoverTo(propKey as keyof EffectState, $event)"
                      />
                      <!-- Size input (default) -->
                      <SizeInput
                        v-else
                        :model-value="String(hoverActiveTab === 'from' ? (effects!.hover!.from?.[propKey as keyof EffectState] || '') : (effects!.hover!.to?.[propKey as keyof EffectState] || ''))"
                        :placeholder="String(getPropertyConfig(propKey)?.default || '0')"
                        @update:model-value="hoverActiveTab === 'from' ? updateHoverFrom(propKey as keyof EffectState, $event) : updateHoverTo(propKey as keyof EffectState, $event)"
                      />
                    </InspectorField>
                    <button
                      type="button"
                      class="p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      @click.stop.prevent="removeHoverProperty(propKey)"
                    >
                      <Icon name="close" :size="10" />
                    </button>
                  </div>
                </template>

                <!-- Empty state -->
                <div v-if="!hoverActiveProps.length" class="py-3 text-center text-xs text-muted-foreground">
                  No properties added yet
                </div>

                <!-- Add Property Popover -->
                <Popover side="left" width="w-48">
                  <template #trigger="{ toggle }">
                    <button
                      type="button"
                      class="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-foreground/30 rounded-md transition-colors mt-2"
                      @click.stop.prevent="toggle"
                    >
                      <Icon name="plus" :size="10" />
                      <span>Add property</span>
                    </button>
                  </template>
                  <template #default="{ close: closeAddPopover }">
                    <div class="p-1">
                      <template v-for="category in effectPropertyCategories" :key="category.label">
                        <div class="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {{ category.label }}
                        </div>
                        <button
                          v-for="prop in category.properties"
                          :key="prop.key"
                          type="button"
                          class="w-full px-2 py-1.5 text-left text-xs hover:bg-secondary/50 rounded transition-colors flex items-center justify-between"
                          :class="{ 'opacity-50': hoverActiveProps.includes(prop.key) }"
                          :disabled="hoverActiveProps.includes(prop.key)"
                          @click.stop.prevent="() => { if (!hoverActiveProps.includes(prop.key)) { addHoverProperty(prop.key); closeAddPopover() } }"
                        >
                          <span>{{ prop.label }}</span>
                          <Icon v-if="hoverActiveProps.includes(prop.key)" name="check" :size="10" class="text-primary" />
                        </button>
                      </template>
                    </div>
                  </template>
                </Popover>
              </div>

              <!-- Settings Accordion -->
              <div class="mt-3 border-t border-border pt-3">
                <button
                  type="button"
                  class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                  @click.stop.prevent="hoverSettingsOpen = !hoverSettingsOpen"
                >
                  <span>Settings</span>
                  <Icon :name="hoverSettingsOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
                </button>
                <div v-if="hoverSettingsOpen" class="mt-2 space-y-2">
                  <InspectorField label="Duration" horizontal>
                    <SliderInput
                      :model-value="String(effects!.hover!.duration ?? 300)"
                      :min="100"
                      :max="2000"
                      :step="100"
                      unit="ms"
                      @update:model-value="updateHover({ duration: Number($event) })"
                    />
                  </InspectorField>
                  <InspectorField label="Easing" horizontal>
                    <SelectInput
                      :options="easingSelectOptions"
                      :model-value="effects!.hover!.easing || 'ease'"
                      @update:model-value="updateHover({ easing: $event as EffectEasing })"
                    />
                  </InspectorField>
                  <InspectorField label="Origin" horizontal>
                    <SelectInput
                      :options="transformOriginSelectOptions"
                      :model-value="effects!.hover!.transformOrigin || 'center'"
                      @update:model-value="updateHover({ transformOrigin: $event as TransformOrigin })"
                    />
                  </InspectorField>
                </div>
              </div>

              <!-- Children Accordion -->
              <template v-if="children?.length">
                <div class="mt-3 border-t border-border pt-3">
                  <button
                    type="button"
                    class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                    @click.stop.prevent="hoverChildrenOpen = !hoverChildrenOpen"
                  >
                    <span>Children</span>
                    <div class="flex items-center gap-1.5">
                      <span v-if="childrenWithHoverOverrides.length" class="text-[10px] text-muted-foreground">
                        {{ childrenWithHoverOverrides.length }} custom
                      </span>
                      <Icon :name="hoverChildrenOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
                    </div>
                  </button>
                  <div v-if="hoverChildrenOpen" class="mt-2 space-y-1">
                    <!-- List all children -->
                    <button
                      v-for="child in children"
                      :key="child.id"
                      type="button"
                      class="w-full flex items-center gap-2 p-2 text-left rounded-md hover:bg-secondary/50 transition-colors group"
                      @click.stop.prevent="() => { if (!getHoverChildOverride(child.id)) { updateHoverChildOverride(child.id, { preset: 'custom', from: {}, to: {} }) }; editingHoverChildId = child.id }"
                    >
                      <Icon name="shapes" :size="12" class="text-muted-foreground" />
                      <span class="flex-1 text-xs truncate">{{ child.name || child.type }}</span>
                      <span
                        v-if="getHoverChildOverride(child.id)"
                        class="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                      >
                        {{ getHoverChildOverride(child.id)?.preset || 'custom' }}
                      </span>
                      <Icon name="chevron-right" :size="10" class="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              </template>
            </template>
        </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Scroll -->
    <InspectorField label="Scroll" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="() => { if (!hasScrollEffect()) initScroll(); toggle() }"
          >
            <Icon name="arrow-down" :size="12" class="text-muted-foreground" />
            <span class="truncate">{{ getScrollPreview() }}</span>
          </button>
        </template>
        <template #default="{ close: closePopover }">
        <div class="p-3" @click.stop>
            <!-- ==================== EDITING CHILD VIEW ==================== -->
            <template v-if="editingScrollChildId && editingScrollChild">
              <!-- Breadcrumb Navigation -->
              <div class="flex items-center gap-1.5 mb-3 pb-2 border-b border-border">
                <button
                  type="button"
                  class="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  @click.stop.prevent="editingScrollChildId = null"
                >
                  Scroll
                </button>
                <Icon name="chevron-right" :size="10" class="text-muted-foreground" />
                <span class="text-xs font-medium text-foreground">{{ editingScrollChild.name || editingScrollChild.type }}</span>
                <div class="flex-1" />
                <button
                  type="button"
                  class="text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                  @click.stop.prevent="closePopover"
                >
                  Apply
                </button>
                <button
                  type="button"
                  class="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                  @click.stop.prevent="removeScrollChildOverride(editingScrollChildId); editingScrollChildId = null"
                >
                  Remove
                </button>
              </div>

              <!-- Child From/To Tab Selector -->
              <div class="flex gap-1 p-0.5 bg-secondary/50 rounded-md mb-3">
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="scrollActiveTab === 'from' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="scrollActiveTab = 'from'"
                >
                  From
                </button>
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="scrollActiveTab === 'to' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="scrollActiveTab = 'to'"
                >
                  To
                </button>
              </div>

              <!-- Child From State -->
              <div v-if="scrollActiveTab === 'from'" class="space-y-2">
                <InspectorField label="Opacity" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateScrollChildOverride(editingScrollChildId).from?.opacity ?? 100)"
                    :min="0"
                    :max="100"
                    :step="5"
                    unit="%"
                    @update:model-value="updateScrollChildFrom(editingScrollChildId!, 'opacity', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Scale" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateScrollChildOverride(editingScrollChildId).from?.scale ?? 1)"
                    :min="0.5"
                    :max="2"
                    :step="0.05"
                    @update:model-value="updateScrollChildFrom(editingScrollChildId!, 'scale', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Move X" horizontal>
                  <SizeInput
                    :model-value="getOrCreateScrollChildOverride(editingScrollChildId).from?.translateX || '0'"
                    placeholder="0"
                    @update:model-value="updateScrollChildFrom(editingScrollChildId!, 'translateX', $event)"
                  />
                </InspectorField>
                <InspectorField label="Move Y" horizontal>
                  <SizeInput
                    :model-value="getOrCreateScrollChildOverride(editingScrollChildId).from?.translateY || '0'"
                    placeholder="0"
                    @update:model-value="updateScrollChildFrom(editingScrollChildId!, 'translateY', $event)"
                  />
                </InspectorField>
                <InspectorField label="Rotate" horizontal>
                  <SizeInput
                    :model-value="getOrCreateScrollChildOverride(editingScrollChildId).from?.rotate || '0'"
                    placeholder="0"
                    @update:model-value="updateScrollChildFrom(editingScrollChildId!, 'rotate', $event)"
                  />
                </InspectorField>
                <InspectorField label="Blur" horizontal>
                  <SizeInput
                    :model-value="getOrCreateScrollChildOverride(editingScrollChildId).from?.blur || '0'"
                    placeholder="0"
                    @update:model-value="updateScrollChildFrom(editingScrollChildId!, 'blur', $event)"
                  />
                </InspectorField>
              </div>

              <!-- Child To State -->
              <div v-else class="space-y-2">
                <InspectorField label="Opacity" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateScrollChildOverride(editingScrollChildId).to?.opacity ?? 100)"
                    :min="0"
                    :max="100"
                    :step="5"
                    unit="%"
                    @update:model-value="updateScrollChildTo(editingScrollChildId!, 'opacity', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Scale" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateScrollChildOverride(editingScrollChildId).to?.scale ?? 1)"
                    :min="0.5"
                    :max="2"
                    :step="0.05"
                    @update:model-value="updateScrollChildTo(editingScrollChildId!, 'scale', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Move X" horizontal>
                  <SizeInput
                    :model-value="getOrCreateScrollChildOverride(editingScrollChildId).to?.translateX || '0'"
                    placeholder="0"
                    @update:model-value="updateScrollChildTo(editingScrollChildId!, 'translateX', $event)"
                  />
                </InspectorField>
                <InspectorField label="Move Y" horizontal>
                  <SizeInput
                    :model-value="getOrCreateScrollChildOverride(editingScrollChildId).to?.translateY || '0'"
                    placeholder="0"
                    @update:model-value="updateScrollChildTo(editingScrollChildId!, 'translateY', $event)"
                  />
                </InspectorField>
                <InspectorField label="Rotate" horizontal>
                  <SizeInput
                    :model-value="getOrCreateScrollChildOverride(editingScrollChildId).to?.rotate || '0'"
                    placeholder="0"
                    @update:model-value="updateScrollChildTo(editingScrollChildId!, 'rotate', $event)"
                  />
                </InspectorField>
                <InspectorField label="Blur" horizontal>
                  <SizeInput
                    :model-value="getOrCreateScrollChildOverride(editingScrollChildId).to?.blur || '0'"
                    placeholder="0"
                    @update:model-value="updateScrollChildTo(editingScrollChildId!, 'blur', $event)"
                  />
                </InspectorField>
              </div>

              <!-- Child Settings Accordion -->
              <div class="mt-3 border-t border-border pt-3">
                <button
                  type="button"
                  class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                  @click.stop.prevent="scrollSettingsOpen = !scrollSettingsOpen"
                >
                  <span>Settings</span>
                  <Icon :name="scrollSettingsOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
                </button>
                <div v-if="scrollSettingsOpen" class="mt-2 space-y-2">
                  <InspectorField label="Delay" horizontal>
                    <SliderInput
                      :model-value="String(getOrCreateScrollChildOverride(editingScrollChildId).delay ?? 0)"
                      :min="0"
                      :max="1000"
                      :step="50"
                      unit="ms"
                      @update:model-value="(v: string) => updateScrollChildOverride(editingScrollChildId!, { delay: Number(v) })"
                    />
                  </InspectorField>
                  <InspectorField label="Easing" horizontal>
                    <SelectInput
                      :options="easingSelectOptions"
                      :model-value="getOrCreateScrollChildOverride(editingScrollChildId).easing || effects!.scroll!.easing || 'ease-out'"
                      @update:model-value="(v: string) => updateScrollChildOverride(editingScrollChildId!, { easing: v as EffectEasing })"
                    />
                  </InspectorField>
                </div>
              </div>

              <!-- Child Scroll Range Accordion -->
              <div class="mt-3 border-t border-border pt-3">
                <button
                  type="button"
                  class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                  @click.stop.prevent="scrollRangeOpen = !scrollRangeOpen"
                >
                  <span>Scroll Range</span>
                  <div class="flex items-center gap-1.5">
                    <span v-if="getOrCreateScrollChildOverride(editingScrollChildId).scrollRange?.start !== undefined || getOrCreateScrollChildOverride(editingScrollChildId).scrollRange?.end !== undefined" class="text-[10px] text-primary">On</span>
                    <Icon :name="scrollRangeOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
                  </div>
                </button>
                <div v-if="scrollRangeOpen" class="mt-2 space-y-2">
                  <InspectorField label="Relative to" horizontal>
                    <SelectInput
                      :options="scrollRelativeToOptions"
                      :model-value="getOrCreateScrollChildOverride(editingScrollChildId).scrollRange?.relativeTo || 'self'"
                      @update:model-value="updateScrollChildOverride(editingScrollChildId!, { scrollRange: { ...getOrCreateScrollChildOverride(editingScrollChildId!).scrollRange, relativeTo: $event as any } })"
                    />
                  </InspectorField>
                  <InspectorField label="Start" horizontal>
                    <SliderInput
                      :model-value="String(getOrCreateScrollChildOverride(editingScrollChildId).scrollRange?.start ?? '')"
                      :min="0"
                      :max="100"
                      :step="5"
                      unit="%"
                      @update:model-value="updateScrollChildOverride(editingScrollChildId!, { scrollRange: { ...getOrCreateScrollChildOverride(editingScrollChildId!).scrollRange, start: Number($event) } })"
                    />
                  </InspectorField>
                  <InspectorField label="End" horizontal>
                    <SliderInput
                      :model-value="String(getOrCreateScrollChildOverride(editingScrollChildId).scrollRange?.end ?? '')"
                      :min="0"
                      :max="100"
                      :step="5"
                      unit="%"
                      @update:model-value="updateScrollChildOverride(editingScrollChildId!, { scrollRange: { ...getOrCreateScrollChildOverride(editingScrollChildId!).scrollRange, end: Number($event) } })"
                    />
                  </InspectorField>
                </div>
              </div>
            </template>

            <!-- ==================== MAIN SCROLL VIEW ==================== -->
            <template v-else>
              <!-- Header with Apply and Reset -->
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-medium text-foreground">Scroll Effect</span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                    @click.stop.prevent="closePopover"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    class="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                    @click.stop.prevent="resetScroll"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <!-- From/To Tab Selector -->
              <div class="flex gap-1 p-0.5 bg-secondary/50 rounded-md mb-3">
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="scrollActiveTab === 'from' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="scrollActiveTab = 'from'"
                >
                  From
                </button>
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="scrollActiveTab === 'to' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="scrollActiveTab = 'to'"
                >
                  To
                </button>
              </div>

              <!-- From/To State (Dynamic Properties) -->
              <div class="space-y-2">
                <!-- Active Properties -->
                <template v-for="propKey in scrollActiveProps" :key="propKey">
                  <div class="flex items-center gap-1 group">
                    <InspectorField :label="getPropertyConfig(propKey)?.label || propKey" horizontal class="flex-1">
                      <!-- Slider input for opacity, scale -->
                      <SliderInput
                        v-if="getPropertyConfig(propKey)?.type === 'slider'"
                        :model-value="String(scrollActiveTab === 'from' ? (effects!.scroll!.from?.[propKey as keyof EffectState] ?? getPropertyConfig(propKey)?.default) : (effects!.scroll!.to?.[propKey as keyof EffectState] ?? getPropertyConfig(propKey)?.default))"
                        :min="getPropertyConfig(propKey)?.min"
                        :max="getPropertyConfig(propKey)?.max"
                        :step="getPropertyConfig(propKey)?.step"
                        :unit="getPropertyConfig(propKey)?.unit"
                        @update:model-value="scrollActiveTab === 'from' ? updateScrollFrom(propKey as keyof EffectState, Number($event)) : updateScrollTo(propKey as keyof EffectState, Number($event))"
                      />
                      <!-- Color input -->
                      <ColorInput
                        v-else-if="getPropertyConfig(propKey)?.type === 'color'"
                        :model-value="(scrollActiveTab === 'from' ? effects!.scroll!.from?.[propKey as keyof EffectState] : effects!.scroll!.to?.[propKey as keyof EffectState]) as string | undefined"
                        swatch-only
                        @update:model-value="scrollActiveTab === 'from' ? updateScrollFrom(propKey as keyof EffectState, $event) : updateScrollTo(propKey as keyof EffectState, $event)"
                      />
                      <!-- Size input (default) -->
                      <SizeInput
                        v-else
                        :model-value="String(scrollActiveTab === 'from' ? (effects!.scroll!.from?.[propKey as keyof EffectState] || '') : (effects!.scroll!.to?.[propKey as keyof EffectState] || ''))"
                        :placeholder="String(getPropertyConfig(propKey)?.default || '0')"
                        @update:model-value="scrollActiveTab === 'from' ? updateScrollFrom(propKey as keyof EffectState, $event) : updateScrollTo(propKey as keyof EffectState, $event)"
                      />
                    </InspectorField>
                    <button
                      type="button"
                      class="p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      @click.stop.prevent="removeScrollProperty(propKey)"
                    >
                      <Icon name="close" :size="10" />
                    </button>
                  </div>
                </template>

                <!-- Empty state -->
                <div v-if="!scrollActiveProps.length" class="py-3 text-center text-xs text-muted-foreground">
                  No properties added yet
                </div>

                <!-- Add Property Popover -->
                <Popover side="left" width="w-48">
                  <template #trigger="{ toggle }">
                    <button
                      type="button"
                      class="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-foreground/30 rounded-md transition-colors mt-2"
                      @click.stop.prevent="toggle"
                    >
                      <Icon name="plus" :size="10" />
                      <span>Add property</span>
                    </button>
                  </template>
                  <template #default="{ close: closeAddPopover }">
                    <div class="p-1">
                      <template v-for="category in effectPropertyCategories" :key="category.label">
                        <div class="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {{ category.label }}
                        </div>
                        <button
                          v-for="prop in category.properties"
                          :key="prop.key"
                          type="button"
                          class="w-full px-2 py-1.5 text-left text-xs hover:bg-secondary/50 rounded transition-colors flex items-center justify-between"
                          :class="{ 'opacity-50': scrollActiveProps.includes(prop.key) }"
                          :disabled="scrollActiveProps.includes(prop.key)"
                          @click.stop.prevent="() => { if (!scrollActiveProps.includes(prop.key)) { addScrollProperty(prop.key); closeAddPopover() } }"
                        >
                          <span>{{ prop.label }}</span>
                          <Icon v-if="scrollActiveProps.includes(prop.key)" name="check" :size="10" class="text-primary" />
                        </button>
                      </template>
                    </div>
                  </template>
                </Popover>
              </div>

              <!-- Settings Accordion -->
              <div class="mt-3 border-t border-border pt-3">
                <button
                  type="button"
                  class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                  @click.stop.prevent="scrollSettingsOpen = !scrollSettingsOpen"
                >
                  <span>Settings</span>
                  <Icon :name="scrollSettingsOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
                </button>
                <div v-if="scrollSettingsOpen" class="mt-2 space-y-2">
                  <InspectorField label="Trigger" horizontal>
                    <SelectInput
                      :options="scrollTriggerOptions"
                      :model-value="effects!.scroll!.trigger || 'center'"
                      @update:model-value="updateScroll({ trigger: $event as any })"
                    />
                  </InspectorField>
                  <InspectorField label="Easing" horizontal>
                    <SelectInput
                      :options="easingSelectOptions"
                      :model-value="effects!.scroll!.easing || 'ease-out'"
                      @update:model-value="updateScroll({ easing: $event as EffectEasing })"
                    />
                  </InspectorField>
                  <InspectorField label="Origin" horizontal>
                    <SelectInput
                      :options="transformOriginSelectOptions"
                      :model-value="effects!.scroll!.transformOrigin || 'center'"
                      @update:model-value="updateScroll({ transformOrigin: $event as TransformOrigin })"
                    />
                  </InspectorField>
                </div>
              </div>

              <!-- Scroll Range Accordion -->
              <div class="mt-3 border-t border-border pt-3">
                <button
                  type="button"
                  class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                  @click.stop.prevent="scrollRangeOpen = !scrollRangeOpen"
                >
                  <span>Scroll Range</span>
                  <div class="flex items-center gap-1.5">
                    <span v-if="effects!.scroll!.scrollRange?.start !== undefined || effects!.scroll!.scrollRange?.end !== undefined" class="text-[10px] text-primary">On</span>
                    <Icon :name="scrollRangeOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
                  </div>
                </button>
                <div v-if="scrollRangeOpen" class="mt-2 space-y-2">
                  <InspectorField label="Relative to" horizontal>
                    <SelectInput
                      :options="scrollRelativeToOptions"
                      :model-value="effects!.scroll!.scrollRange?.relativeTo || 'self'"
                      @update:model-value="updateScroll({ scrollRange: { ...effects!.scroll!.scrollRange, relativeTo: $event as any } })"
                    />
                  </InspectorField>
                  <InspectorField label="Start" horizontal>
                    <SliderInput
                      :model-value="String(effects!.scroll!.scrollRange?.start ?? '')"
                      :min="0"
                      :max="100"
                      :step="5"
                      unit="%"
                      @update:model-value="updateScroll({ scrollRange: { ...effects!.scroll!.scrollRange, start: Number($event) } })"
                    />
                  </InspectorField>
                  <InspectorField label="End" horizontal>
                    <SliderInput
                      :model-value="String(effects!.scroll!.scrollRange?.end ?? '')"
                      :min="0"
                      :max="100"
                      :step="5"
                      unit="%"
                      @update:model-value="updateScroll({ scrollRange: { ...effects!.scroll!.scrollRange, end: Number($event) } })"
                    />
                  </InspectorField>
                </div>
              </div>

              <!-- Children Accordion -->
              <template v-if="children?.length">
                <div class="mt-3 border-t border-border pt-3">
                  <button
                    type="button"
                    class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                    @click.stop.prevent="scrollChildrenOpen = !scrollChildrenOpen"
                  >
                    <span>Children</span>
                    <div class="flex items-center gap-1.5">
                      <span v-if="childrenWithScrollOverrides.length" class="text-[10px] text-muted-foreground">
                        {{ childrenWithScrollOverrides.length }} custom
                      </span>
                      <Icon :name="scrollChildrenOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
                    </div>
                  </button>
                  <div v-if="scrollChildrenOpen" class="mt-2 space-y-1">
                    <!-- List all children -->
                    <button
                      v-for="child in children"
                      :key="child.id"
                      type="button"
                      class="w-full flex items-center gap-2 p-2 text-left rounded-md hover:bg-secondary/50 transition-colors group"
                      @click.stop.prevent="() => { if (!getScrollChildOverride(child.id)) { updateScrollChildOverride(child.id, {}) }; editingScrollChildId = child.id }"
                    >
                      <Icon name="shapes" :size="12" class="text-muted-foreground" />
                      <span class="flex-1 text-xs truncate">{{ child.name || child.type }}</span>
                      <span
                        v-if="getScrollChildOverride(child.id)"
                        class="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                      >
                        Custom
                      </span>
                      <Icon name="chevron-right" :size="10" class="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              </template>
            </template>
        </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Appear -->
    <InspectorField label="Appear" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="() => { if (!hasAppearEffect()) initAppear(); toggle() }"
          >
            <Icon name="eye" :size="12" class="text-muted-foreground" />
            <span class="truncate">{{ getAppearPreview() }}</span>
          </button>
        </template>
        <template #default="{ close: closePopover }">
        <div class="p-3" @click.stop>
            <!-- ==================== EDITING CHILD VIEW ==================== -->
            <template v-if="editingAppearChildId && editingAppearChild">
              <!-- Breadcrumb Navigation -->
              <div class="flex items-center gap-1.5 mb-3 pb-2 border-b border-border">
                <button
                  type="button"
                  class="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  @click.stop.prevent="editingAppearChildId = null"
                >
                  Appear
                </button>
                <Icon name="chevron-right" :size="10" class="text-muted-foreground" />
                <span class="text-xs font-medium text-foreground">{{ editingAppearChild.name || editingAppearChild.type }}</span>
                <div class="flex-1" />
                <button
                  type="button"
                  class="text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                  @click.stop.prevent="closePopover"
                >
                  Apply
                </button>
                <button
                  type="button"
                  class="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                  @click.stop.prevent="removeAppearChildOverride(editingAppearChildId); editingAppearChildId = null"
                >
                  Remove
                </button>
              </div>

              <!-- Child From/To Tab Selector -->
              <div class="flex gap-1 p-0.5 bg-secondary/50 rounded-md mb-3">
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="appearActiveTab === 'from' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="appearActiveTab = 'from'"
                >
                  From
                </button>
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="appearActiveTab === 'to' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="appearActiveTab = 'to'"
                >
                  To
                </button>
              </div>

              <!-- Child From State -->
              <div v-if="appearActiveTab === 'from'" class="space-y-2">
                <InspectorField label="Opacity" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateAppearChildOverride(editingAppearChildId).from?.opacity ?? '')"
                    :min="0"
                    :max="100"
                    :step="5"
                    unit="%"
                    @update:model-value="updateAppearChildFrom(editingAppearChildId!, 'opacity', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Scale" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateAppearChildOverride(editingAppearChildId).from?.scale ?? '')"
                    :min="0.5"
                    :max="2"
                    :step="0.05"
                    @update:model-value="updateAppearChildFrom(editingAppearChildId!, 'scale', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Move X" horizontal>
                  <SizeInput
                    :model-value="getOrCreateAppearChildOverride(editingAppearChildId).from?.translateX || ''"
                    placeholder="0"
                    @update:model-value="updateAppearChildFrom(editingAppearChildId!, 'translateX', $event)"
                  />
                </InspectorField>
                <InspectorField label="Move Y" horizontal>
                  <SizeInput
                    :model-value="getOrCreateAppearChildOverride(editingAppearChildId).from?.translateY || ''"
                    placeholder="0"
                    @update:model-value="updateAppearChildFrom(editingAppearChildId!, 'translateY', $event)"
                  />
                </InspectorField>
                <InspectorField label="Rotate" horizontal>
                  <SizeInput
                    :model-value="getOrCreateAppearChildOverride(editingAppearChildId).from?.rotate || ''"
                    placeholder="0"
                    @update:model-value="updateAppearChildFrom(editingAppearChildId!, 'rotate', $event)"
                  />
                </InspectorField>
                <InspectorField label="Blur" horizontal>
                  <SizeInput
                    :model-value="getOrCreateAppearChildOverride(editingAppearChildId).from?.blur || ''"
                    placeholder="0"
                    @update:model-value="updateAppearChildFrom(editingAppearChildId!, 'blur', $event)"
                  />
                </InspectorField>
              </div>

              <!-- Child To State -->
              <div v-else class="space-y-2">
                <InspectorField label="Opacity" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateAppearChildOverride(editingAppearChildId).to?.opacity ?? '')"
                    :min="0"
                    :max="100"
                    :step="5"
                    unit="%"
                    @update:model-value="updateAppearChildTo(editingAppearChildId!, 'opacity', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Scale" horizontal>
                  <SliderInput
                    :model-value="String(getOrCreateAppearChildOverride(editingAppearChildId).to?.scale ?? '')"
                    :min="0.5"
                    :max="2"
                    :step="0.05"
                    @update:model-value="updateAppearChildTo(editingAppearChildId!, 'scale', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Move X" horizontal>
                  <SizeInput
                    :model-value="getOrCreateAppearChildOverride(editingAppearChildId).to?.translateX || ''"
                    placeholder="0"
                    @update:model-value="updateAppearChildTo(editingAppearChildId!, 'translateX', $event)"
                  />
                </InspectorField>
                <InspectorField label="Move Y" horizontal>
                  <SizeInput
                    :model-value="getOrCreateAppearChildOverride(editingAppearChildId).to?.translateY || ''"
                    placeholder="0"
                    @update:model-value="updateAppearChildTo(editingAppearChildId!, 'translateY', $event)"
                  />
                </InspectorField>
                <InspectorField label="Rotate" horizontal>
                  <SizeInput
                    :model-value="getOrCreateAppearChildOverride(editingAppearChildId).to?.rotate || ''"
                    placeholder="0"
                    @update:model-value="updateAppearChildTo(editingAppearChildId!, 'rotate', $event)"
                  />
                </InspectorField>
                <InspectorField label="Blur" horizontal>
                  <SizeInput
                    :model-value="getOrCreateAppearChildOverride(editingAppearChildId).to?.blur || ''"
                    placeholder="0"
                    @update:model-value="updateAppearChildTo(editingAppearChildId!, 'blur', $event)"
                  />
                </InspectorField>
              </div>

              <!-- Child Settings Accordion -->
              <div class="mt-3 border-t border-border pt-3">
                <button
                  type="button"
                  class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                  @click.stop.prevent="appearSettingsOpen = !appearSettingsOpen"
                >
                  <span>Settings</span>
                  <Icon :name="appearSettingsOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
                </button>
                <div v-if="appearSettingsOpen" class="mt-2 space-y-2">
                  <InspectorField label="Delay" horizontal>
                    <SliderInput
                      :model-value="String(getOrCreateAppearChildOverride(editingAppearChildId).delay ?? '')"
                      :min="0"
                      :max="1000"
                      :step="50"
                      unit="ms"
                      @update:model-value="(v: string) => updateAppearChildOverride(editingAppearChildId!, { delay: Number(v) })"
                    />
                  </InspectorField>
                  <InspectorField label="Duration" horizontal>
                    <SliderInput
                      :model-value="String(getOrCreateAppearChildOverride(editingAppearChildId).duration ?? '')"
                      :min="100"
                      :max="2000"
                      :step="100"
                      unit="ms"
                      @update:model-value="(v: string) => updateAppearChildOverride(editingAppearChildId!, { duration: Number(v) })"
                    />
                  </InspectorField>
                  <InspectorField label="Easing" horizontal>
                    <SelectInput
                      :options="easingSelectOptions"
                      :model-value="getOrCreateAppearChildOverride(editingAppearChildId).easing || effects!.appear!.easing || 'ease-out'"
                      @update:model-value="(v: string) => updateAppearChildOverride(editingAppearChildId!, { easing: v as EffectEasing })"
                    />
                  </InspectorField>
                </div>
              </div>
            </template>

            <!-- ==================== MAIN APPEAR VIEW ==================== -->
            <template v-else>
              <!-- Header with Apply and Reset -->
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-medium text-foreground">Appear Effect</span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                    @click.stop.prevent="closePopover"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    class="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                    @click.stop.prevent="resetAppear"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <!-- Trigger Selector -->
              <div class="flex gap-1 p-0.5 bg-secondary/50 rounded-md mb-3">
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="effects!.appear!.trigger === 'inView' || !effects!.appear!.trigger ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="updateAppear({ trigger: 'inView' })"
                >
                  When in view
                </button>
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="effects!.appear!.trigger === 'load' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="updateAppear({ trigger: 'load' })"
                >
                  On page load
                </button>
              </div>

              <!-- From/To Tab Selector -->
              <div class="flex gap-1 p-0.5 bg-secondary/50 rounded-md mb-3">
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="appearActiveTab === 'from' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="appearActiveTab = 'from'"
                >
                  From
                </button>
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                  :class="appearActiveTab === 'to' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                  @click.stop.prevent="appearActiveTab = 'to'"
                >
                  To
                </button>
              </div>

              <!-- From/To State (Dynamic Properties) -->
              <div class="space-y-2">
                <!-- Active Properties -->
                <template v-for="propKey in appearActiveProps" :key="propKey">
                  <div class="flex items-center gap-1 group">
                    <InspectorField :label="getPropertyConfig(propKey)?.label || propKey" horizontal class="flex-1">
                      <!-- Slider input for opacity, scale -->
                      <SliderInput
                        v-if="getPropertyConfig(propKey)?.type === 'slider'"
                        :model-value="String(appearActiveTab === 'from' ? (effects!.appear!.from?.[propKey as keyof EffectState] ?? getPropertyConfig(propKey)?.default) : (effects!.appear!.to?.[propKey as keyof EffectState] ?? getPropertyConfig(propKey)?.default))"
                        :min="getPropertyConfig(propKey)?.min"
                        :max="getPropertyConfig(propKey)?.max"
                        :step="getPropertyConfig(propKey)?.step"
                        :unit="getPropertyConfig(propKey)?.unit"
                        @update:model-value="appearActiveTab === 'from' ? updateAppearFrom(propKey as keyof EffectState, Number($event)) : updateAppearTo(propKey as keyof EffectState, Number($event))"
                      />
                      <!-- Color input -->
                      <ColorInput
                        v-else-if="getPropertyConfig(propKey)?.type === 'color'"
                        :model-value="(appearActiveTab === 'from' ? effects!.appear!.from?.[propKey as keyof EffectState] : effects!.appear!.to?.[propKey as keyof EffectState]) as string | undefined"
                        swatch-only
                        @update:model-value="appearActiveTab === 'from' ? updateAppearFrom(propKey as keyof EffectState, $event) : updateAppearTo(propKey as keyof EffectState, $event)"
                      />
                      <!-- Size input (default) -->
                      <SizeInput
                        v-else
                        :model-value="String(appearActiveTab === 'from' ? (effects!.appear!.from?.[propKey as keyof EffectState] || '') : (effects!.appear!.to?.[propKey as keyof EffectState] || ''))"
                        :placeholder="String(getPropertyConfig(propKey)?.default || '0')"
                        @update:model-value="appearActiveTab === 'from' ? updateAppearFrom(propKey as keyof EffectState, $event) : updateAppearTo(propKey as keyof EffectState, $event)"
                      />
                    </InspectorField>
                    <button
                      type="button"
                      class="p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                      @click.stop.prevent="removeAppearProperty(propKey)"
                    >
                      <Icon name="close" :size="10" />
                    </button>
                  </div>
                </template>

                <!-- Empty state -->
                <div v-if="!appearActiveProps.length" class="py-3 text-center text-xs text-muted-foreground">
                  No properties added yet
                </div>

                <!-- Add Property Popover -->
                <Popover side="left" width="w-48">
                  <template #trigger="{ toggle }">
                    <button
                      type="button"
                      class="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-foreground/30 rounded-md transition-colors mt-2"
                      @click.stop.prevent="toggle"
                    >
                      <Icon name="plus" :size="10" />
                      <span>Add property</span>
                    </button>
                  </template>
                  <template #default="{ close: closeAddPopover }">
                    <div class="p-1">
                      <template v-for="category in effectPropertyCategories" :key="category.label">
                        <div class="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {{ category.label }}
                        </div>
                        <button
                          v-for="prop in category.properties"
                          :key="prop.key"
                          type="button"
                          class="w-full px-2 py-1.5 text-left text-xs hover:bg-secondary/50 rounded transition-colors flex items-center justify-between"
                          :class="{ 'opacity-50': appearActiveProps.includes(prop.key) }"
                          :disabled="appearActiveProps.includes(prop.key)"
                          @click.stop.prevent="() => { if (!appearActiveProps.includes(prop.key)) { addAppearProperty(prop.key); closeAddPopover() } }"
                        >
                          <span>{{ prop.label }}</span>
                          <Icon v-if="appearActiveProps.includes(prop.key)" name="check" :size="10" class="text-primary" />
                        </button>
                      </template>
                    </div>
                  </template>
                </Popover>
              </div>

              <!-- Settings Accordion -->
              <div class="mt-3 border-t border-border pt-3">
                <button
                  type="button"
                  class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                  @click.stop.prevent="appearSettingsOpen = !appearSettingsOpen"
                >
                  <span>Settings</span>
                  <Icon :name="appearSettingsOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
                </button>
                <div v-if="appearSettingsOpen" class="mt-2 space-y-2">
                  <InspectorField label="Duration" horizontal>
                    <SliderInput
                      :model-value="String(effects!.appear!.duration ?? '')"
                      :min="100"
                      :max="2000"
                      :step="100"
                      unit="ms"
                      @update:model-value="updateAppear({ duration: Number($event) })"
                    />
                  </InspectorField>
                  <InspectorField label="Delay" horizontal>
                    <SliderInput
                      :model-value="String(effects!.appear!.delay ?? '')"
                      :min="0"
                      :max="1000"
                      :step="50"
                      unit="ms"
                      @update:model-value="updateAppear({ delay: Number($event) })"
                    />
                  </InspectorField>
                  <InspectorField label="Easing" horizontal>
                    <SelectInput
                      :options="easingSelectOptions"
                      :model-value="effects!.appear!.easing || 'ease-out'"
                      @update:model-value="updateAppear({ easing: $event as EffectEasing })"
                    />
                  </InspectorField>
                  <InspectorField label="Origin" horizontal>
                    <SelectInput
                      :options="transformOriginSelectOptions"
                      :model-value="effects!.appear!.transformOrigin || 'center'"
                      @update:model-value="updateAppear({ transformOrigin: $event as TransformOrigin })"
                    />
                  </InspectorField>
                  <template v-if="effects!.appear!.trigger !== 'load'">
                    <InspectorField label="Threshold" horizontal>
                      <SliderInput
                        :model-value="String(effects!.appear!.threshold ?? 0.1)"
                        :min="0"
                        :max="1"
                        :step="0.1"
                        @update:model-value="updateAppear({ threshold: Number($event) })"
                      />
                    </InspectorField>
                    <ToggleInput
                      :model-value="effects!.appear!.once ?? true"
                      label="Animate only once"
                      @update:model-value="updateAppear({ once: $event })"
                    />
                  </template>
                </div>
              </div>

              <!-- Children Accordion -->
              <template v-if="children?.length">
                <div class="mt-3 border-t border-border pt-3">
                  <button
                    type="button"
                    class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                    @click.stop.prevent="appearChildrenOpen = !appearChildrenOpen"
                  >
                    <span>Children</span>
                    <div class="flex items-center gap-1.5">
                      <span v-if="childrenWithAppearOverrides.length" class="text-[10px] text-muted-foreground">
                        {{ childrenWithAppearOverrides.length }} custom
                      </span>
                      <Icon :name="appearChildrenOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
                    </div>
                  </button>
                  <div v-if="appearChildrenOpen" class="mt-2 space-y-1">
                    <!-- List all children -->
                    <button
                      v-for="child in children"
                      :key="child.id"
                      type="button"
                      class="w-full flex items-center gap-2 p-2 text-left rounded-md hover:bg-secondary/50 transition-colors group"
                      @click.stop.prevent="() => { if (!getAppearChildOverride(child.id)) { updateAppearChildOverride(child.id, {}) }; editingAppearChildId = child.id }"
                    >
                      <Icon name="shapes" :size="12" class="text-muted-foreground" />
                      <span class="flex-1 text-xs truncate">{{ child.name || child.type }}</span>
                      <span
                        v-if="getAppearChildOverride(child.id)"
                        class="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                      >
                        Custom
                      </span>
                      <Icon name="chevron-right" :size="10" class="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              </template>
            </template>
        </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Loop -->
    <InspectorField label="Loop" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="() => { if (!hasLoopEffect()) initLoop(); toggle() }"
          >
            <Icon name="reload" :size="12" class="text-muted-foreground" />
            <span class="truncate">{{ getLoopPreview() }}</span>
          </button>
        </template>
        <template #default="{ close: closePopover }">
        <div class="p-3" @click.stop>
            <!-- Header with Apply and Reset -->
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-medium text-foreground">Loop Effect</span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                  @click.stop.prevent="closePopover"
                >
                  Apply
                </button>
                <button
                  type="button"
                  class="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                  @click.stop.prevent="resetLoop"
                >
                  Reset
                </button>
              </div>
            </div>

            <!-- From/To Tab Selector -->
            <div class="flex gap-1 p-0.5 bg-secondary/50 rounded-md mb-3">
              <button
                type="button"
                class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                :class="loopActiveTab === 'from' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                @click.stop.prevent="loopActiveTab = 'from'"
              >
                From
              </button>
              <button
                type="button"
                class="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                :class="loopActiveTab === 'to' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                @click.stop.prevent="loopActiveTab = 'to'"
              >
                To
              </button>
            </div>

            <!-- From/To State (Dynamic Properties) -->
            <div class="space-y-2">
              <!-- Active Properties -->
              <template v-for="propKey in loopActiveProps" :key="propKey">
                <div class="flex items-center gap-1 group">
                  <InspectorField :label="getPropertyConfig(propKey)?.label || propKey" horizontal class="flex-1">
                    <!-- Slider input for opacity, scale -->
                    <SliderInput
                      v-if="getPropertyConfig(propKey)?.type === 'slider'"
                      :model-value="String(loopActiveTab === 'from' ? (effects!.loop!.from?.[propKey as keyof EffectState] ?? getPropertyConfig(propKey)?.default) : (effects!.loop!.to?.[propKey as keyof EffectState] ?? getPropertyConfig(propKey)?.default))"
                      :min="getPropertyConfig(propKey)?.min"
                      :max="getPropertyConfig(propKey)?.max"
                      :step="getPropertyConfig(propKey)?.step"
                      :unit="getPropertyConfig(propKey)?.unit"
                      @update:model-value="loopActiveTab === 'from' ? updateLoopFrom(propKey as keyof EffectState, Number($event)) : updateLoopTo(propKey as keyof EffectState, Number($event))"
                    />
                    <!-- Color input -->
                    <ColorInput
                      v-else-if="getPropertyConfig(propKey)?.type === 'color'"
                      :model-value="(loopActiveTab === 'from' ? effects!.loop!.from?.[propKey as keyof EffectState] : effects!.loop!.to?.[propKey as keyof EffectState]) as string | undefined"
                      swatch-only
                      @update:model-value="loopActiveTab === 'from' ? updateLoopFrom(propKey as keyof EffectState, $event) : updateLoopTo(propKey as keyof EffectState, $event)"
                    />
                    <!-- Size input (default) -->
                    <SizeInput
                      v-else
                      :model-value="String(loopActiveTab === 'from' ? (effects!.loop!.from?.[propKey as keyof EffectState] || '') : (effects!.loop!.to?.[propKey as keyof EffectState] || ''))"
                      :placeholder="String(getPropertyConfig(propKey)?.default || '0')"
                      @update:model-value="loopActiveTab === 'from' ? updateLoopFrom(propKey as keyof EffectState, $event) : updateLoopTo(propKey as keyof EffectState, $event)"
                    />
                  </InspectorField>
                  <button
                    type="button"
                    class="p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                    @click.stop.prevent="removeLoopProperty(propKey)"
                  >
                    <Icon name="close" :size="10" />
                  </button>
                </div>
              </template>

              <!-- Empty state -->
              <div v-if="!loopActiveProps.length" class="py-3 text-center text-xs text-muted-foreground">
                No properties added yet
              </div>

              <!-- Add Property Popover -->
              <Popover side="left" width="w-48">
                <template #trigger="{ toggle }">
                  <button
                    type="button"
                    class="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-foreground/30 rounded-md transition-colors mt-2"
                    @click.stop.prevent="toggle"
                  >
                    <Icon name="plus" :size="10" />
                    <span>Add property</span>
                  </button>
                </template>
                <template #default="{ close: closeAddPopover }">
                  <div class="p-1">
                    <template v-for="category in effectPropertyCategories" :key="category.label">
                      <div class="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        {{ category.label }}
                      </div>
                      <button
                        v-for="prop in category.properties"
                        :key="prop.key"
                        type="button"
                        class="w-full px-2 py-1.5 text-left text-xs hover:bg-secondary/50 rounded transition-colors flex items-center justify-between"
                        :class="{ 'opacity-50': loopActiveProps.includes(prop.key) }"
                        :disabled="loopActiveProps.includes(prop.key)"
                        @click.stop.prevent="() => { if (!loopActiveProps.includes(prop.key)) { addLoopProperty(prop.key); closeAddPopover() } }"
                      >
                        <span>{{ prop.label }}</span>
                        <Icon v-if="loopActiveProps.includes(prop.key)" name="check" :size="10" class="text-primary" />
                      </button>
                    </template>
                  </div>
                </template>
              </Popover>
            </div>

            <!-- Settings Accordion -->
            <div class="mt-3 border-t border-border pt-3">
              <button
                type="button"
                class="w-full flex items-center justify-between text-xs font-medium text-foreground"
                @click.stop.prevent="loopSettingsOpen = !loopSettingsOpen"
              >
                <span>Settings</span>
                <Icon :name="loopSettingsOpen ? 'chevron-up' : 'chevron-down'" :size="12" class="text-muted-foreground" />
              </button>
              <div v-if="loopSettingsOpen" class="mt-2 space-y-2">
                <InspectorField label="Duration" horizontal>
                  <SliderInput
                    :model-value="String(effects!.loop!.duration ?? 1000)"
                    :min="100"
                    :max="5000"
                    :step="100"
                    unit="ms"
                    @update:model-value="updateLoop({ duration: Number($event) })"
                  />
                </InspectorField>
                <InspectorField label="Loop" horizontal>
                  <ToggleInput
                    :model-value="effects!.loop!.loop ?? true"
                    @update:model-value="updateLoop({ loop: $event })"
                  />
                </InspectorField>
                <InspectorField label="Reverse" horizontal>
                  <ToggleInput
                    :model-value="effects!.loop!.reverse ?? false"
                    @update:model-value="updateLoop({ reverse: $event })"
                  />
                </InspectorField>
                <InspectorField label="Easing" horizontal>
                  <SelectInput
                    :options="easingSelectOptions"
                    :model-value="effects!.loop!.easing || 'ease-in-out'"
                    @update:model-value="updateLoop({ easing: $event as EffectEasing })"
                  />
                </InspectorField>
                <InspectorField label="Start" horizontal>
                  <SelectInput
                    :options="loopStartOptions"
                    :model-value="effects!.loop!.startTrigger || 'load'"
                    @update:model-value="updateLoop({ startTrigger: $event as 'inView' | 'hover' | 'load' })"
                  />
                </InspectorField>
                <InspectorField label="Stop" horizontal>
                  <SelectInput
                    :options="loopStopOptions"
                    :model-value="effects!.loop!.stopTrigger || 'never'"
                    @update:model-value="updateLoop({ stopTrigger: $event as 'never' | 'outOfView' | 'hover' })"
                  />
                </InspectorField>
              </div>
            </div>
        </div>
        </template>
      </Popover>
    </InspectorField>
  </InspectorSection>
</template>
