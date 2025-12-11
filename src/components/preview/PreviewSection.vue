<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type {
  SectionBlock,
  SectionBlockType,
  HeaderSettings,
  FooterSettings,
  ContainerSettings,
  ContainerStyles,
  GridSettings,
  StackSettings,
  DividerSettings,
  HeadingSettings,
  TextSettings,
  ImageSettings,
  VideoSettings,
  ButtonSettings,
  IconSettings,
  VariantsSettings,
  VariantsStyles,
  FormSettings,
  FormInputSettings,
  FormTextareaSettings,
  FormSelectSettings,
  FormRadioSettings,
  FormCheckboxSettings,
  FormButtonSettings,
  CanvasSettings,
  CanvasChildPosition,
  AnimationSettings,
  BaseBlockStyles,
  IconStyles,
  StateStyles,
} from '@/types/editor'
import { STYLE_STATE_BLOCK_TYPES } from '@/types/editor'
import {
  animationInitialStates,
  animationFinalStates,
  getAnimationKeyframeName,
  getAnimationCSSValue,
} from '@/lib/animation-utils'
import { getResponsiveStyles } from '@/lib/style-utils'

// SectionBlockType is used for addBlock calls
import { socialPlatformIcons, sectionBlockLabels, sectionBlockIcons, canHaveChildren, createPresetBlock, presetTypes, presetLabels, presetIcons, blocksByCategory, maskShapeClipPaths, type PresetType } from '@/lib/editor-utils'
import type { MaskShape } from '@/types/editor'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import ContextMenuItem from '@/components/ui/ContextMenuItem.vue'
import ContextMenuDivider from '@/components/ui/ContextMenuDivider.vue'
import BlockPicker from '@/components/builder/BlockPicker.vue'
import InlineFormatToolbar from '@/components/preview/InlineFormatToolbar.vue'
import Icon from '@/components/ui/Icon.vue'
import Button from '@/components/ui/Button.vue'
import Dropdown from '@/components/ui/Dropdown.vue'
import DropdownItem from '@/components/ui/DropdownItem.vue'

const props = defineProps<{
  block: SectionBlock
  index: number
  total: number
}>()

const editorStore = useEditorStore()

const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const editableRef = ref<HTMLElement | null>(null)

// Check if this specific block is hovered (not parents)
const isHovered = computed(() => editorStore.hoveredBlockId === props.block.id)

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
const isAnimating = ref(false)
const hasAnimatedOnLoad = ref(false)

// Get animation settings for this block
const blockAnimation = computed((): AnimationSettings | undefined => {
  const styles = props.block.styles as BaseBlockStyles
  return styles?.animation
})

// Check if this block supports animation (exclude header/footer)
const supportsAnimation = computed(() => {
  return props.block.type !== 'header' && props.block.type !== 'footer'
})

// Check if animation preview is active for this block
const isPreviewingAnimation = computed(() => {
  return editorStore.isAnimationPreviewing(props.block.id)
})

// Watch for animation preview trigger from inspector
watch(isPreviewingAnimation, (isPreviewing) => {
  if (isPreviewing && blockAnimation.value?.enabled) {
    playAnimation()
  }
})

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

// Compute animation inline styles
const animationStyles = computed(() => {
  if (!supportsAnimation.value || !blockAnimation.value?.enabled) {
    return {}
  }

  const settings = blockAnimation.value
  const styles: Record<string, string> = {}

  // For hover trigger, we use CSS transitions instead of animations
  if (settings.trigger === 'hover') {
    styles.transition = `all ${settings.duration}ms ${settings.easing}`
    return styles
  }

  // For page-load and in-view triggers, apply initial state and animation
  if (isAnimating.value) {
    // Apply the CSS animation
    styles.animation = getAnimationCSSValue(settings)
  } else {
    // Apply initial state (before animation plays)
    const initialState = animationInitialStates[settings.preset]
    if (initialState) {
      // Parse the initial state CSS and apply
      const rules = initialState.split(';').filter(r => r.trim())
      rules.forEach(rule => {
        const [prop, val] = rule.split(':').map(s => s.trim())
        if (prop && val) {
          // Convert CSS property to camelCase
          const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
          styles[camelProp] = val
        }
      })
    }
  }

  return styles
})

// Hover animation styles (applied on hover)
const hoverAnimationStyles = computed(() => {
  if (!supportsAnimation.value || !blockAnimation.value?.enabled) {
    return {}
  }

  const settings = blockAnimation.value
  if (settings.trigger !== 'hover') return {}

  const styles: Record<string, string> = {}
  const finalState = animationFinalStates[settings.preset]

  if (finalState) {
    const rules = finalState.split(';').filter(r => r.trim())
    rules.forEach(rule => {
      const [prop, val] = rule.split(':').map(s => s.trim())
      if (prop && val) {
        const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        styles[camelProp] = val
      }
    })
  }

  return styles
})

// Mouse enter/leave handlers with hover animation support
function handleMouseEnter(event: MouseEvent) {
  event.stopPropagation() // Prevent parent blocks from also getting hovered
  editorStore.hoverBlock(props.block.id)
  updateLabelPosition()

  // Apply hover animation styles
  if (blockAnimation.value?.trigger === 'hover' && sectionRef.value) {
    Object.assign(sectionRef.value.style, hoverAnimationStyles.value)
  }
}

function handleMouseLeave(event: MouseEvent) {
  // Only clear hover if we're leaving to outside any block
  const relatedTarget = event.relatedTarget as HTMLElement | null
  const isLeavingToAnotherBlock = relatedTarget?.closest('[data-preview-block]')

  if (!isLeavingToAnotherBlock) {
    editorStore.hoverBlock(null)
  }

  // Remove hover animation styles (if reverseOnHoverOut is enabled)
  if (blockAnimation.value?.trigger === 'hover' && blockAnimation.value?.reverseOnHoverOut !== false && sectionRef.value) {
    Object.keys(hoverAnimationStyles.value).forEach(key => {
      sectionRef.value!.style[key as any] = ''
    })
  }
}

// Context menu handler
function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  editorStore.selectBlock(props.block.id)
  contextMenuRef.value?.open(event)
}

// Context menu actions
function handleEditStyle() {
  editorStore.selectBlock(props.block.id)
  // Inspector is shown when block is selected, ensure it's visible
  if (editorStore.isInspectorCollapsed) {
    editorStore.toggleInspector()
  }
}

function handleCopyStyle() {
  editorStore.copyBlockStyles(props.block.id)
}

function handlePasteStyle() {
  editorStore.pasteBlockStyles(props.block.id)
}

function handleCut() {
  editorStore.cutBlock(props.block.id)
}

function handleCopy() {
  editorStore.copyBlock(props.block.id)
}

function handlePaste() {
  // Paste into this block if it's a layout block, otherwise paste at root
  if (canHaveChildren(props.block.type)) {
    editorStore.pasteBlock(props.block.id)
  } else {
    editorStore.pasteBlock()
  }
}

// Block picker for empty layout blocks
const isBlockPickerOpen = ref(false)

function openBlockPicker() {
  isBlockPickerOpen.value = true
}

// ============================================
// SLIDER STATE & HANDLERS
// ============================================
const sliderRefs = new Map<string, HTMLElement | null>()
const sliderCurrentIndex = ref(new Map<string, number>())
const sliderAutoplayIntervals = new Map<string, ReturnType<typeof setInterval>>()
const sliderIsPaused = ref(new Map<string, boolean>())

function handleSliderPrev(blockId: string) {
  const container = sliderRefs.get(blockId)
  if (!container) return

  const block = props.block.type === 'grid' ? props.block : null
  if (!block) return

  const settings = block.settings as GridSettings
  const slidesPerView = settings.slidesPerView || 1
  const gap = parseFloat(settings.gap || '16')
  const slideWidth = (container.scrollWidth - (block.children?.length || 1 - 1) * gap) / (block.children?.length || 1)

  const currentIdx = sliderCurrentIndex.value.get(blockId) || 0
  const newIdx = settings.loop
    ? (currentIdx - 1 + (block.children?.length || 1) - slidesPerView + 1) % ((block.children?.length || 1) - slidesPerView + 1)
    : Math.max(0, currentIdx - 1)

  sliderCurrentIndex.value.set(blockId, newIdx)
  container.scrollTo({ left: newIdx * (slideWidth + gap), behavior: 'smooth' })
}

function handleSliderNext(blockId: string) {
  const container = sliderRefs.get(blockId)
  if (!container) return

  const block = props.block.type === 'grid' ? props.block : null
  if (!block) return

  const settings = block.settings as GridSettings
  const slidesPerView = settings.slidesPerView || 1
  const gap = parseFloat(settings.gap || '16')
  const slideWidth = (container.scrollWidth - (block.children?.length || 1 - 1) * gap) / (block.children?.length || 1)
  const maxIdx = (block.children?.length || 1) - slidesPerView

  const currentIdx = sliderCurrentIndex.value.get(blockId) || 0
  const newIdx = settings.loop
    ? (currentIdx + 1) % (maxIdx + 1)
    : Math.min(maxIdx, currentIdx + 1)

  sliderCurrentIndex.value.set(blockId, newIdx)
  container.scrollTo({ left: newIdx * (slideWidth + gap), behavior: 'smooth' })
}

function handleSliderGoTo(blockId: string, index: number) {
  const container = sliderRefs.get(blockId)
  if (!container) return

  const block = props.block.type === 'grid' ? props.block : null
  if (!block) return

  const settings = block.settings as GridSettings
  const gap = parseFloat(settings.gap || '16')
  const slideWidth = (container.scrollWidth - (block.children?.length || 1 - 1) * gap) / (block.children?.length || 1)

  sliderCurrentIndex.value.set(blockId, index)
  container.scrollTo({ left: index * (slideWidth + gap), behavior: 'smooth' })
}

function startSliderAutoplay(blockId: string) {
  const block = props.block.type === 'grid' ? props.block : null
  if (!block) return

  const settings = block.settings as GridSettings
  if (!settings.autoplay) return

  // Clear existing interval
  const existingInterval = sliderAutoplayIntervals.get(blockId)
  if (existingInterval) clearInterval(existingInterval)

  const interval = setInterval(() => {
    if (!sliderIsPaused.value.get(blockId)) {
      handleSliderNext(blockId)
    }
  }, settings.autoplayInterval || 5000)

  sliderAutoplayIntervals.set(blockId, interval)
}

function stopSliderAutoplay(blockId: string) {
  const interval = sliderAutoplayIntervals.get(blockId)
  if (interval) {
    clearInterval(interval)
    sliderAutoplayIntervals.delete(blockId)
  }
}

function handleSliderMouseEnter(blockId: string) {
  sliderIsPaused.value.set(blockId, true)
}

function handleSliderMouseLeave(blockId: string) {
  sliderIsPaused.value.set(blockId, false)
}

function getSliderCurrentIndex(blockId: string): number {
  return sliderCurrentIndex.value.get(blockId) || 0
}

function handleBlockPickerSelectBlock(type: SectionBlockType) {
  const block = editorStore.addBlock(type, undefined, props.block.id)
  if (block) {
    editorStore.selectBlock(block.id)
  }
}

function handleBlockPickerSelectPreset(type: PresetType) {
  const block = createPresetBlock(type)
  const inserted = editorStore.addPresetBlock(block, undefined, props.block.id)
  if (inserted) {
    editorStore.selectBlock(inserted.id)
  }
}

// Quick add layout blocks (for container empty state)
function handleAddLayoutBlock(type: 'stack' | 'grid' | 'canvas') {
  const block = editorStore.addBlock(type, undefined, props.block.id)
  if (block) {
    editorStore.selectBlock(block.id)
  }
}

// Add list/collection preset (Grid with Stack children)
function handleAddListCollection() {
  const block = createPresetBlock('preset-card-list')
  const inserted = editorStore.addPresetBlock(block, undefined, props.block.id)
  if (inserted) {
    editorStore.selectBlock(inserted.id)
  }
}

// Add content block inside layout block
function handleAddContentBlock(type: SectionBlockType) {
  const block = editorStore.addBlock(type, undefined, props.block.id)
  if (block) {
    editorStore.selectBlock(block.id)
  }
}

// Add preset inside layout block
function handleAddPresetInside(type: PresetType) {
  const block = createPresetBlock(type)
  const inserted = editorStore.addPresetBlock(block, undefined, props.block.id)
  if (inserted) {
    editorStore.selectBlock(inserted.id)
  }
}

const isSelected = computed(() =>
  editorStore.selectedBlockId === props.block.id &&
  !editorStore.selectedItemId
)

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

// Check if this is a protected block (header/footer)
const isProtectedBlock = computed(() => props.block.type === 'header' || props.block.type === 'footer')

// Check if block can have children
const isLayoutBlock = computed(() => canHaveChildren(props.block.type))

// Check if this block is inside a List/Collection (Grid > Stack pattern)
const isInsideListCollection = computed(() => editorStore.isInsideListCollection(props.block.id))

// Check if this block IS a list item (Stack directly inside Grid) - these can be dragged for reordering
const isListItem = computed(() => {
  if (props.block.type !== 'stack') return false
  const parent = editorStore.findParentBlock(props.block.id)
  return parent?.type === 'grid'
})

// Check if this block is INSIDE a list item (child of Stack inside Grid) - these cannot be dragged
const isBlockInsideListItem = computed(() => {
  const parent = editorStore.findParentBlock(props.block.id)
  if (!parent || parent.type !== 'stack') return false
  const grandparent = editorStore.findParentBlock(parent.id)
  return grandparent?.type === 'grid'
})

// Check if this block is inside a Canvas parent
const isInsideCanvas = computed(() => {
  const parent = editorStore.findParentBlock(props.block.id)
  return parent?.type === 'canvas'
})

// Check if block is hidden
const isBlockHidden = computed(() => {
  const settings = props.block.settings as Record<string, unknown>
  return !!settings.isHidden
})

// Check if header/footer is hidden (should completely hide in preview)
const isHeaderFooterHidden = computed(() => {
  if (props.block.type === 'header') {
    return !!(props.block.settings as HeaderSettings)?.isHidden
  }
  if (props.block.type === 'footer') {
    return !!(props.block.settings as FooterSettings)?.isHidden
  }
  return false
})

// Type guards for settings
const headerSettings = computed(() => props.block.type === 'header' ? props.block.settings as HeaderSettings : null)
const footerSettings = computed(() => props.block.type === 'footer' ? props.block.settings as FooterSettings : null)
const containerSettings = computed(() => props.block.type === 'container' ? props.block.settings as ContainerSettings : null)
const gridSettings = computed(() => props.block.type === 'grid' ? props.block.settings as GridSettings : null)

// Start slider autoplay when autoplay setting changes
// Note: Using a watcher here to react to autoplay setting changes
watch(
  () => gridSettings.value?.autoplay,
  (autoplay) => {
    if (props.block.type !== 'grid' || !gridSettings.value?.isSlider) return
    if (autoplay) {
      startSliderAutoplay(props.block.id)
    } else {
      stopSliderAutoplay(props.block.id)
    }
  },
  { immediate: true }
)

const stackSettings = computed(() => props.block.type === 'stack' ? props.block.settings as StackSettings : null)
const dividerSettings = computed(() => props.block.type === 'divider' ? props.block.settings as DividerSettings : null)
const headingSettings = computed(() => props.block.type === 'heading' ? props.block.settings as HeadingSettings : null)
const textSettings = computed(() => props.block.type === 'text' ? props.block.settings as TextSettings : null)
const imageSettings = computed(() => props.block.type === 'image' ? props.block.settings as ImageSettings : null)
const videoSettings = computed(() => props.block.type === 'video' ? props.block.settings as VideoSettings : null)
const buttonSettings = computed(() => props.block.type === 'button' ? props.block.settings as ButtonSettings : null)
const iconSettings = computed(() => props.block.type === 'icon' ? props.block.settings as IconSettings : null)
const iconStyles = computed(() => props.block.type === 'icon' ? props.block.styles as IconStyles : null)
const variantsSettings = computed(() => props.block.type === 'variants' ? props.block.settings as VariantsSettings : null)
const variantsStyles = computed(() => props.block.type === 'variants' ? props.block.styles as VariantsStyles : null)
const formSettings = computed(() => props.block.type === 'form' ? props.block.settings as FormSettings : null)
// Form field block settings
const formInputSettings = computed(() => props.block.type === 'form-input' ? props.block.settings as FormInputSettings : null)
const formTextareaSettings = computed(() => props.block.type === 'form-textarea' ? props.block.settings as FormTextareaSettings : null)
const formSelectSettings = computed(() => props.block.type === 'form-select' ? props.block.settings as FormSelectSettings : null)
const formRadioSettings = computed(() => props.block.type === 'form-radio' ? props.block.settings as FormRadioSettings : null)
const formCheckboxSettings = computed(() => props.block.type === 'form-checkbox' ? props.block.settings as FormCheckboxSettings : null)
const formButtonSettings = computed(() => props.block.type === 'form-button' ? props.block.settings as FormButtonSettings : null)
// Canvas block settings
const canvasSettings = computed(() => props.block.type === 'canvas' ? props.block.settings as CanvasSettings : null)

// Helper to get canvas child position for template (viewport-aware with cascade)
function getCanvasChildPos(childId: string): CanvasChildPosition {
  if (!canvasSettings.value) return { x: 10, y: 10 }
  const positions = canvasSettings.value.childPositions
  const viewport = editorStore.viewport
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

// ============================================
// TRANSLATION-AWARE CONTENT GETTERS
// ============================================
// These return translated content when viewing a translation, otherwise return default content
// We access reactive state directly to ensure proper reactivity

// Helper to get translation for current block
function getBlockTranslation(field: string): string | undefined {
  const lang = editorStore.currentLanguage
  if (!lang) return undefined
  const langTranslations = editorStore.translations.languages[lang]
  if (!langTranslations) return undefined
  const blockTranslation = langTranslations.blocks[props.block.id]
  if (!blockTranslation) return undefined
  return (blockTranslation as Record<string, unknown>)[field] as string | undefined
}

const displayHeadingContent = computed(() => {
  if (!headingSettings.value) return ''
  // Access reactive state directly for proper tracking
  const lang = editorStore.currentLanguage
  if (lang) {
    const langTranslations = editorStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.content
    if (translated !== undefined) return translated
  }
  return headingSettings.value.content
})

const displayTextContent = computed(() => {
  if (!textSettings.value) return ''
  const lang = editorStore.currentLanguage
  if (lang) {
    const langTranslations = editorStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.content
    if (translated !== undefined) return translated
  }
  return textSettings.value.content
})

const displayButtonLabel = computed(() => {
  if (!buttonSettings.value) return ''
  const lang = editorStore.currentLanguage
  if (lang) {
    const langTranslations = editorStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.label
    if (translated !== undefined) return translated
  }
  return buttonSettings.value.label
})

const displayImageAlt = computed(() => {
  if (!imageSettings.value) return ''
  const lang = editorStore.currentLanguage
  if (lang) {
    const langTranslations = editorStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.alt
    if (translated !== undefined) return translated
  }
  return imageSettings.value.alt
})

const displayImageCaption = computed(() => {
  if (!imageSettings.value) return ''
  const lang = editorStore.currentLanguage
  if (lang) {
    const langTranslations = editorStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.caption
    if (translated !== undefined) return translated
  }
  return imageSettings.value.caption
})

// Header translations
const displayHeaderCtaLabel = computed(() => {
  if (!headerSettings.value?.ctaButton) return ''
  const lang = editorStore.currentLanguage
  if (lang) {
    const langTranslations = editorStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.ctaButtonLabel
    if (translated !== undefined) return translated
  }
  return headerSettings.value.ctaButton.label
})

function getDisplayNavLinkLabel(linkId: string): string {
  if (!headerSettings.value) return ''
  const link = headerSettings.value.navLinks.find(l => l.id === linkId)
  if (!link) return ''
  const lang = editorStore.currentLanguage
  if (lang) {
    const langTranslations = editorStore.translations.languages[lang]
    const navLinks = langTranslations?.blocks[props.block.id]?.navLinks
    const translatedLink = navLinks?.find(l => l.id === linkId)
    if (translatedLink?.label !== undefined) return translatedLink.label
  }
  return link.label
}

// Footer translations
const displayFooterCopyright = computed(() => {
  if (!footerSettings.value) return ''
  const lang = editorStore.currentLanguage
  if (lang) {
    const langTranslations = editorStore.translations.languages[lang]
    const translated = langTranslations?.blocks[props.block.id]?.copyrightText
    if (translated !== undefined) return translated
  }
  return footerSettings.value.copyrightText
})

function getDisplayFooterLinkLabel(linkId: string): string {
  if (!footerSettings.value) return ''
  const link = footerSettings.value.links.find(l => l.id === linkId)
  if (!link) return ''
  const lang = editorStore.currentLanguage
  if (lang) {
    const langTranslations = editorStore.translations.languages[lang]
    const footerLinks = langTranslations?.blocks[props.block.id]?.footerLinks
    const translatedLink = footerLinks?.find(l => l.id === linkId)
    if (translatedLink?.label !== undefined) return translatedLink.label
  }
  return link.label
}

// Form translations - note: form now uses child blocks for fields, submit button is a form-button block

// Event handlers
function handleClick(event: MouseEvent) {
  event.stopPropagation()
  editorStore.selectBlock(props.block.id)
}

function handleDuplicate() {
  editorStore.duplicateBlock(props.block.id)
}

function handleDelete() {
  editorStore.deleteBlock(props.block.id)
}

// Z-index handlers for Canvas children
function handleBringToFront() {
  if (!isInsideCanvas.value) return
  const parent = editorStore.findParentBlock(props.block.id)
  if (!parent || parent.type !== 'canvas') return

  const settings = parent.settings as CanvasSettings
  const viewport = editorStore.viewport
  const viewportKey = viewport === 'desktop' ? 'desktop' : viewport === 'tablet' ? 'tablet' : 'mobile'

  // Find the max zIndex among all children
  const positions = settings.childPositions[viewportKey] || settings.childPositions.desktop || {}
  let maxZ = 0
  for (const pos of Object.values(positions)) {
    if (pos.zIndex !== undefined && pos.zIndex > maxZ) maxZ = pos.zIndex
  }

  // Set this child's zIndex to max + 1
  const currentPos = positions[props.block.id] || { x: 10, y: 10 }
  editorStore.updateCanvasChildPosition(parent.id, props.block.id, {
    ...currentPos,
    zIndex: maxZ + 1,
  })
}

function handleSendToBack() {
  if (!isInsideCanvas.value) return
  const parent = editorStore.findParentBlock(props.block.id)
  if (!parent || parent.type !== 'canvas') return

  const settings = parent.settings as CanvasSettings
  const viewport = editorStore.viewport
  const viewportKey = viewport === 'desktop' ? 'desktop' : viewport === 'tablet' ? 'tablet' : 'mobile'

  // Find the min zIndex among all children
  const positions = settings.childPositions[viewportKey] || settings.childPositions.desktop || {}
  let minZ = 0
  for (const pos of Object.values(positions)) {
    if (pos.zIndex !== undefined && pos.zIndex < minZ) minZ = pos.zIndex
  }

  // Set this child's zIndex to min - 1
  const currentPos = positions[props.block.id] || { x: 10, y: 10 }
  editorStore.updateCanvasChildPosition(parent.id, props.block.id, {
    ...currentPos,
    zIndex: minZ - 1,
  })
}

// Inline editing handlers
// These update translations when in translation mode, otherwise update source content
function handleHeadingEdit(event: FocusEvent) {
  const target = event.target as HTMLElement
  // Use innerHTML to preserve line breaks (converted to <br>)
  const newContent = target.innerHTML.trim()
  if (editorStore.isEditingTranslation) {
    // Update translation
    editorStore.updateBlockTranslation(props.block.id, 'content', newContent)
  } else if (newContent !== headingSettings.value?.content) {
    // Update source content
    editorStore.updateBlockSettings(props.block.id, { content: newContent })
  }
}

function handleTextEdit(event: FocusEvent) {
  const target = event.target as HTMLElement
  const newContent = target.innerHTML.trim()
  if (editorStore.isEditingTranslation) {
    // Update translation
    editorStore.updateBlockTranslation(props.block.id, 'content', newContent)
  } else if (newContent !== textSettings.value?.content) {
    // Update source content
    editorStore.updateBlockSettings(props.block.id, { content: newContent })
  }
}

function handleButtonEdit(event: FocusEvent) {
  const target = event.target as HTMLElement
  const newLabel = target.innerText.trim()
  if (editorStore.isEditingTranslation) {
    // Update translation
    editorStore.updateBlockTranslation(props.block.id, 'label', newLabel)
  } else if (newLabel !== buttonSettings.value?.label) {
    // Update source content
    editorStore.updateBlockSettings(props.block.id, { label: newLabel })
  }
}

// Handle Escape key - save content and blur (don't revert)
function handleEscapeKey(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  target.blur()
}

// Handle inline formatting - update block content after format applied
function handleInlineFormat(_command: string) {
  // After applying format, save the new HTML content
  if (editableRef.value) {
    const newContent = editableRef.value.innerHTML.trim()
    if (props.block.type === 'heading') {
      if (editorStore.isEditingTranslation) {
        editorStore.updateBlockTranslation(props.block.id, 'content', newContent)
      } else {
        editorStore.updateBlockSettings(props.block.id, { content: newContent })
      }
    } else if (props.block.type === 'text') {
      if (editorStore.isEditingTranslation) {
        editorStore.updateBlockTranslation(props.block.id, 'content', newContent)
      } else {
        editorStore.updateBlockSettings(props.block.id, { content: newContent })
      }
    }
  }
}

// Handle paste - strip HTML and paste as plain text
function handlePasteClean(event: ClipboardEvent) {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') || ''
  // Insert plain text at cursor position
  document.execCommand('insertText', false, text)
}

// Drag & drop for layout blocks
const isDropTarget = ref(false)
const childDropIndex = ref<number | null>(null) // Index where child will be dropped

// Check if this block can be dragged
// - Protected blocks (header/footer) cannot be dragged
// - List items (Stack in Grid) CAN be dragged for reordering
// - Blocks inside list items CANNOT be dragged
// - Blocks inside Canvas use mouse drag for positioning, not HTML5 drag
const canDragBlock = computed(() => {
  if (isProtectedBlock.value) return false
  if (isInsideCanvas.value) return false
  // List items can be dragged for reordering
  if (isListItem.value) return true
  // Blocks inside list items cannot be dragged
  if (isBlockInsideListItem.value) return false
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
  const viewport = editorStore.viewport
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
  const parent = editorStore.findParentBlock(props.block.id)
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

  const parent = editorStore.findParentBlock(props.block.id)
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
  const viewport = editorStore.viewport
  const currentPositions = parentSettings.childPositions || { desktop: {} }
  const viewportPositions = currentPositions[viewport] || {}
  const currentPos = viewportPositions[props.block.id] || getResponsiveChildPosition(parentSettings, props.block.id)

  editorStore.updateBlockSettings(parent.id, {
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

// Drag handlers for moving this block (HTML5 drag for reordering)
function handleBlockDragStart(event: DragEvent) {
  if (!canDragBlock.value) return

  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/x-block-move', props.block.id)
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleBlockDragEnd() {
  // Reset any drag state if needed
}

// Grid column resize state
const isResizingColumn = ref(false)
const resizeColumnIndex = ref<number | null>(null)
const resizeStartX = ref(0)
const resizeStartWidths = ref<number[]>([])

// Compute grid template columns with custom widths support
const gridTemplateColumns = computed(() => {
  if (!gridSettings.value) return 'repeat(2, minmax(0, 1fr))'
  const columns = gridSettings.value.columns || 2
  const customWidths = gridSettings.value.columnWidths

  if (customWidths && customWidths.length === columns) {
    return customWidths.map(w => `${w}fr`).join(' ')
  }
  return `repeat(${columns}, minmax(0, 1fr))`
})

// Get grid item styles for a child block
function getGridItemStyles(child: SectionBlock): Record<string, string> {
  const settings = child.settings as Record<string, unknown>
  const styles: Record<string, string> = {}

  // Column span
  const colSpan = parseInt(String(settings.gridColumnSpan || 1), 10)
  if (!isNaN(colSpan) && colSpan > 1) {
    styles['grid-column'] = `span ${colSpan}`
  }

  // Row span
  const rowSpan = parseInt(String(settings.gridRowSpan || 1), 10)
  if (!isNaN(rowSpan) && rowSpan > 1) {
    styles['grid-row'] = `span ${rowSpan}`
  }

  return styles
}

// Grid column resize handlers
function handleColumnResizeStart(columnIndex: number, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()

  if (!gridSettings.value) return

  isResizingColumn.value = true
  resizeColumnIndex.value = columnIndex
  resizeStartX.value = event.clientX

  // Initialize widths array if not set
  const columns = gridSettings.value.columns || 2
  const currentWidths = gridSettings.value.columnWidths || Array(columns).fill(1)
  resizeStartWidths.value = [...currentWidths]

  // Add listeners
  document.addEventListener('mousemove', handleColumnResizeMove)
  document.addEventListener('mouseup', handleColumnResizeEnd)
}

function handleColumnResizeMove(event: MouseEvent) {
  if (!isResizingColumn.value || resizeColumnIndex.value === null || !gridSettings.value) return

  const deltaX = event.clientX - resizeStartX.value
  const gridElement = document.querySelector(`[data-block-id="${props.block.id}"]`) as HTMLElement
  if (!gridElement) return

  const gridWidth = gridElement.offsetWidth
  const totalFr = resizeStartWidths.value.reduce((a, b) => a + b, 0)
  const frToPixels = gridWidth / totalFr
  const deltaFr = deltaX / frToPixels

  const newWidths = [...resizeStartWidths.value]
  const colIndex = resizeColumnIndex.value

  // Get current widths at the indices
  const leftWidth = newWidths[colIndex]
  const rightWidth = newWidths[colIndex + 1]

  // Ensure we have valid widths at the indices
  if (leftWidth === undefined || rightWidth === undefined) return

  // Adjust the column to the left of the handle
  const newLeftWidth = Math.max(0.5, leftWidth + deltaFr)
  // Adjust the column to the right of the handle
  const newRightWidth = Math.max(0.5, rightWidth - deltaFr)

  newWidths[colIndex] = Math.round(newLeftWidth * 10) / 10
  newWidths[colIndex + 1] = Math.round(newRightWidth * 10) / 10

  // Update the grid settings
  editorStore.updateBlockSettings(props.block.id, { columnWidths: newWidths })
}

function handleColumnResizeEnd() {
  isResizingColumn.value = false
  resizeColumnIndex.value = null
  document.removeEventListener('mousemove', handleColumnResizeMove)
  document.removeEventListener('mouseup', handleColumnResizeEnd)
}

// Calculate position of column resize handle as percentage
function getColumnResizeHandlePosition(columnIndex: number): string {
  if (!gridSettings.value) return '50%'

  const columns = gridSettings.value.columns || 2
  const customWidths = gridSettings.value.columnWidths || Array(columns).fill(1)
  const totalFr = customWidths.reduce((a, b) => a + b, 0)

  // Sum of widths up to and including this column
  let sumFr = 0
  for (let i = 0; i <= columnIndex; i++) {
    sumFr += customWidths[i] || 1
  }

  // Account for gaps: each column has gap after it except the last
  const gap = parseFloat(gridSettings.value.gap || '16')
  const gapCount = columnIndex + 1 // number of gaps before this handle

  // Position = (sum of fr values / total fr) * 100%
  // We need to add half a gap to position the handle in the middle of the gap
  const percentPosition = (sumFr / totalFr) * 100

  return `calc(${percentPosition}% + ${gapCount * gap - gap / 2}px)`
}

// Check if drag event contains valid block or preset type (for adding new blocks)
function isValidNewBlockDragType(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('application/x-section-type') ||
         event.dataTransfer?.types.includes('application/x-preset-type') || false
}

// Check if drag event contains block move data
function isBlockMoveDragType(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('application/x-block-move') || false
}

// Check if any valid drag type (new block or block move)
function isValidDragType(event: DragEvent): boolean {
  return isValidNewBlockDragType(event) || isBlockMoveDragType(event)
}

function handleDragEnter(event: DragEvent) {
  if (!isLayoutBlock.value) return
  // List items (Stack inside Grid) cannot be drop targets - they can only be reordered
  if (isListItem.value) return
  if (isValidDragType(event)) {
    event.preventDefault()
    event.stopPropagation()
    isDropTarget.value = true
  }
}

function handleDragOver(event: DragEvent) {
  if (!isLayoutBlock.value) return
  // List items (Stack inside Grid) cannot be drop targets - they can only be reordered
  if (isListItem.value) return
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
  if (!isLayoutBlock.value) return
  // List items (Stack inside Grid) cannot be drop targets - they can only be reordered
  if (isListItem.value) return
  event.preventDefault()
  event.stopPropagation()
  isDropTarget.value = false
  const dropIndex = childDropIndex.value
  childDropIndex.value = null

  // Check for block move first
  const blockIdToMove = event.dataTransfer?.getData('application/x-block-move')
  if (blockIdToMove) {
    // Don't allow dropping a block into itself or its children
    if (blockIdToMove === props.block.id) return

    // Check if reordering within same parent
    const blockParent = editorStore.findParentBlock(blockIdToMove)
    const isSameParent = blockParent?.id === props.block.id

    // Check if this is a List/Collection Grid (Grid with Stack children)
    const isListCollectionGrid = props.block.type === 'grid' &&
      props.block.children?.some(c => c.type === 'stack')

    if (isSameParent && dropIndex !== null) {
      // Reordering within this container
      const currentIndex = props.block.children?.findIndex(c => c.id === blockIdToMove) ?? -1
      if (currentIndex !== -1 && currentIndex !== dropIndex) {
        const targetIndex = currentIndex < dropIndex ? dropIndex - 1 : dropIndex
        editorStore.reorderBlocks(currentIndex, targetIndex, props.block.id)
      }
    } else if (!isListCollectionGrid) {
      // Only allow moving blocks INTO this parent if it's NOT a List/Collection Grid
      editorStore.moveBlockToParent(blockIdToMove, props.block.id, dropIndex ?? undefined)
    } else {
      // List/Collection Grids only allow reordering their own items, not moves from outside
      return
    }
    editorStore.selectBlock(blockIdToMove)
    return
  }

  // Check if this is a List/Collection Grid - these don't accept new blocks
  const isListCollectionGrid = props.block.type === 'grid' &&
    props.block.children?.some(c => c.type === 'stack')
  if (isListCollectionGrid) return

  // Check for preset type
  const presetType = event.dataTransfer?.getData('application/x-preset-type') as PresetType
  if (presetType && presetTypes.includes(presetType)) {
    const block = createPresetBlock(presetType)
    const inserted = editorStore.addPresetBlock(block, dropIndex ?? undefined, props.block.id)
    if (inserted) {
      editorStore.selectBlock(inserted.id)
    }
    return
  }

  // Otherwise check for section type
  const sectionType = event.dataTransfer?.getData('application/x-section-type')
  if (sectionType) {
    const block = editorStore.addBlock(sectionType as SectionBlockType, dropIndex ?? undefined, props.block.id)
    if (block) {
      editorStore.selectBlock(block.id)
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

// Helper functions
function getHeightStyle(height?: string): string | undefined {
  if (!height || height === 'auto' || height === '0') return undefined
  // Handle legacy string values
  if (height === 'full') return '100vh'
  if (height === 'half') return '50vh'
  // Handle numeric percentage values from slider
  const num = parseFloat(height)
  if (!isNaN(num) && num > 0) return `${num}vh`
  return undefined
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
function pxToEm(value: string | number): string {
  const px = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(px) || px === 0) return '0'
  return `${px / 16}em`
}

// Compute CSS styles from block.styles with responsive support
const blockStyles = computed(() => {
  const rawStyles = props.block.styles as BaseBlockStyles
  if (!rawStyles) return {}

  // Get responsive styles for current viewport (cascaded)
  const styles = getResponsiveStyles(rawStyles, editorStore.viewport)
  // Also get non-responsive styles (like typography) from raw styles
  const allStyles = rawStyles as Record<string, unknown>

  const css: Record<string, string> = {}

  // Check if we're editing a state style for THIS block
  const currentState = editorStore.currentStyleState
  const isEditingStateForThisBlock = currentState !== 'none' &&
    editorStore.selectedBlockId === props.block.id &&
    STYLE_STATE_BLOCK_TYPES.includes(props.block.type)

  // Get state styles if editing a state
  const stateStylesBeingEdited = isEditingStateForThisBlock
    ? (allStyles[currentState] as StateStyles | undefined)
    : undefined

  // Padding (responsive) - use em
  if (styles.padding) {
    const p = styles.padding as { top?: string; right?: string; bottom?: string; left?: string }
    if (p.top) css.paddingTop = pxToEm(p.top)
    if (p.right) css.paddingRight = pxToEm(p.right)
    if (p.bottom) css.paddingBottom = pxToEm(p.bottom)
    if (p.left) css.paddingLeft = pxToEm(p.left)
  }

  // Margin (responsive) - use em, supports negative values
  if (styles.margin) {
    const m = styles.margin as { top?: string; right?: string; bottom?: string; left?: string }
    if (m.top) css.marginTop = pxToEm(m.top)
    if (m.right) css.marginRight = pxToEm(m.right)
    if (m.bottom) css.marginBottom = pxToEm(m.bottom)
    if (m.left) css.marginLeft = pxToEm(m.left)
  }

  // Background (responsive)
  // For blocks with state styles, use CSS custom properties so :hover/:active/:focus can override
  const supportsStates = STYLE_STATE_BLOCK_TYPES.includes(props.block.type)
  if (supportsStates) {
    // Set base background as CSS variable, state styles will override via CSS
    if (styles.backgroundColor) {
      css['--base-bg'] = styles.backgroundColor as string
    }
    // If editing a state, show that state's background directly
    if (stateStylesBeingEdited?.backgroundColor) {
      css['--base-bg'] = stateStylesBeingEdited.backgroundColor
    }
  } else if (styles.backgroundColor) {
    css.backgroundColor = styles.backgroundColor as string
  }
  if (styles.backgroundImage) {
    css.backgroundImage = `url(${styles.backgroundImage})`
    css.backgroundSize = (styles.backgroundSize as string) || 'cover'
    css.backgroundPosition = (styles.backgroundPosition as string) || 'center'
  }

  // Border (responsive) - use em for width and radius
  if (styles.border) {
    const b = styles.border as { width?: string; color?: string; radius?: string; style?: string; sides?: string }
    if (b.width && b.width !== '0') {
      const borderStyle = b.style || 'solid'
      const borderColor = b.color || 'currentColor'
      const borderValue = `${pxToEm(b.width)} ${borderStyle} ${borderColor}`

      // Parse sides - default to all sides if not specified
      const sidesStr = b.sides || 'top,right,bottom,left'
      const activeSides = new Set(sidesStr.split(',').filter(s => s))

      // Apply border to each active side
      if (activeSides.has('top')) css.borderTop = borderValue
      if (activeSides.has('right')) css.borderRight = borderValue
      if (activeSides.has('bottom')) css.borderBottom = borderValue
      if (activeSides.has('left')) css.borderLeft = borderValue
    }
    if (b.radius && b.radius !== '0') css.borderRadius = pxToEm(b.radius)
  }

  // Shadow (responsive) - use em for offsets and blur
  if (styles.shadow) {
    const s = styles.shadow as { enabled?: boolean; x?: string; y?: string; blur?: string; color?: string }
    if (s.enabled) {
      css.boxShadow = `${pxToEm(s.x || '0')} ${pxToEm(s.y || '0')} ${pxToEm(s.blur || '0')} ${s.color || 'rgba(0,0,0,0.1)'}`
    }
  }

  // Typography styles (non-responsive for now) - fontSize uses em
  if (allStyles.fontSize) {
    const size = allStyles.fontSize as string
    const pxValue = fontSizeMap[size] || `${size}px`
    // Convert px string to em
    const pxNum = parseFloat(pxValue)
    css.fontSize = pxToEm(pxNum)
  }
  // Color: For blocks with state styles, use CSS custom properties so :hover/:active/:focus can override
  if (supportsStates) {
    // Set base color as CSS variable
    if (allStyles.color) {
      css['--base-color'] = allStyles.color as string
    }
    // If editing a state, show that state's color directly
    if (stateStylesBeingEdited?.color) {
      css['--base-color'] = stateStylesBeingEdited.color
    }
  } else if (allStyles.color) {
    css.color = allStyles.color as string
  }
  if (allStyles.alignment) css.textAlign = allStyles.alignment as string
  if (allStyles.fontWeight) css.fontWeight = allStyles.fontWeight as string
  if (allStyles.fontFamily) css.fontFamily = allStyles.fontFamily as string
  if (allStyles.fontStyle) css.fontStyle = allStyles.fontStyle as string
  if (allStyles.textDecoration && allStyles.textDecoration !== 'none') css.textDecoration = allStyles.textDecoration as string
  if (allStyles.lineHeight) css.lineHeight = allStyles.lineHeight as string
  if (allStyles.letterSpacing) css.letterSpacing = pxToEm(allStyles.letterSpacing as string)

  // Border radius (direct, non-responsive for now) - use em
  if (allStyles.borderRadius) css.borderRadius = pxToEm(allStyles.borderRadius as string)

  // Flexbox properties for layout blocks (non-responsive for now)
  if (allStyles.flexDirection) css.flexDirection = allStyles.flexDirection as string
  if (allStyles.justifyContent) css.justifyContent = allStyles.justifyContent as string
  if (allStyles.alignItems) css.alignItems = allStyles.alignItems as string
  if (allStyles.flexWrap) css.flexWrap = allStyles.flexWrap as string
  if (allStyles.gap) css.gap = pxToEm(allStyles.gap as string)

  // Flex child properties (responsive)
  if (styles.flexGrow && styles.flexGrow !== '0') css.flexGrow = styles.flexGrow as string
  if (styles.flexShrink && styles.flexShrink !== '1') css.flexShrink = styles.flexShrink as string
  if (styles.flexBasis && styles.flexBasis !== 'auto') css.flexBasis = styles.flexBasis as string

  // Grid properties (non-responsive for now)
  if (allStyles.justifyItems) css.justifyItems = allStyles.justifyItems as string

  // Opacity & Blend Mode (responsive)
  if (styles.opacity !== undefined && styles.opacity !== '100') {
    css.opacity = String(Number(styles.opacity) / 100)
  }
  if (styles.mixBlendMode && styles.mixBlendMode !== 'normal') {
    css.mixBlendMode = styles.mixBlendMode as string
  }

  // Add state style CSS custom properties if this block supports them
  if (STYLE_STATE_BLOCK_TYPES.includes(props.block.type)) {
    // Access state styles from allStyles to ensure reactivity
    const hoverStyles = allStyles.hover as StateStyles | undefined
    const pressedStyles = allStyles.pressed as StateStyles | undefined
    const focusedStyles = allStyles.focused as StateStyles | undefined

    const processStateStyles = (state: 'hover' | 'pressed' | 'focused', stateStyles: StateStyles | undefined) => {
      if (!stateStyles) return

      if (stateStyles.backgroundColor) {
        css[`--${state}-bg`] = stateStyles.backgroundColor
      }
      if (stateStyles.color) {
        css[`--${state}-color`] = stateStyles.color
      }
      if (stateStyles.opacity !== undefined) {
        css[`--${state}-opacity`] = String(Number(stateStyles.opacity) / 100)
      }
      if (stateStyles.transform) {
        css[`--${state}-transform`] = stateStyles.transform
      }
      if (stateStyles.border) {
        const b = stateStyles.border
        if (b.color) css[`--${state}-border-color`] = b.color
        if (b.width) css[`--${state}-border-width`] = pxToEm(b.width)
        if (b.radius) css[`--${state}-border-radius`] = pxToEm(b.radius)
      }
      if (stateStyles.shadow?.enabled) {
        const s = stateStyles.shadow
        css[`--${state}-shadow`] = `${pxToEm(s.x || '0')} ${pxToEm(s.y || '0')} ${pxToEm(s.blur || '0')} ${s.color || 'rgba(0,0,0,0.1)'}`
      }
    }

    processStateStyles('hover', hoverStyles)
    processStateStyles('pressed', pressedStyles)
    processStateStyles('focused', focusedStyles)
  }

  return css
})

// Check if block supports state styles (heading, text, button, image, video, form inputs)
// This is used to apply the .has-state-styles class which enables CSS variable-based styling
const supportsStateStyles = computed(() => {
  return STYLE_STATE_BLOCK_TYPES.includes(props.block.type)
})

// Helper to get image-specific styles
function getImageStyles(): Record<string, string> {
  const styles = props.block.styles as Record<string, unknown>
  const settings = props.block.settings as Record<string, unknown>
  const css: Record<string, string> = {}

  // Object fit
  if (styles?.objectFit) css.objectFit = styles.objectFit as string
  else css.objectFit = 'cover'

  // Border radius - use em
  if (styles?.borderRadius && styles.borderRadius !== '0') {
    css.borderRadius = pxToEm(styles.borderRadius as string)
  }

  // Width - supports percentage or px (converted to em)
  if (styles?.width) {
    const width = styles.width as string
    if (width.endsWith('%')) {
      css.width = width
    } else {
      css.width = pxToEm(width)
    }
  }

  // Height - supports percentage or px (converted to em)
  if (styles?.height) {
    const height = styles.height as string
    if (height.endsWith('%')) {
      css.height = height
    } else {
      css.height = pxToEm(height)
    }
  }

  // Aspect ratio
  if (styles?.aspectRatio && styles.aspectRatio !== 'auto') {
    const ratio = styles.aspectRatio as string
    // Convert "16:9" format to CSS aspect-ratio value "16/9"
    css.aspectRatio = ratio.replace(':', '/')
  }

  // Apply mask shape
  const mask = styles?.mask as MaskShape | undefined
  if (mask && mask !== 'none') {
    css.clipPath = maskShapeClipPaths[mask]
  }
  return css
}

// Helper to get video-specific styles
function getVideoStyles(): Record<string, string> {
  const styles = props.block.styles as Record<string, unknown>
  const css: Record<string, string> = {}
  if (styles?.aspectRatio) {
    const ar = styles.aspectRatio as string
    css.aspectRatio = ar.replace(':', '/')
  } else {
    css.aspectRatio = '16/9'
  }
  // Border radius - use em, default to 0
  if (styles?.borderRadius && styles.borderRadius !== '0') {
    css.borderRadius = pxToEm(styles.borderRadius as string)
  }
  // Apply mask shape
  const mask = styles?.mask as MaskShape | undefined
  if (mask && mask !== 'none') {
    css.clipPath = maskShapeClipPaths[mask]
  }
  return css
}

// Helper for button alignment
function getButtonAlignment(): string | undefined {
  const styles = props.block.styles as Record<string, unknown>
  return styles?.textAlign as string | undefined
}

function getButtonClasses(variant?: string, size?: string): string[] {
  const classes = ['inline-flex', 'items-center', 'gap-2', 'font-medium', 'transition-colors']

  switch (variant) {
    case 'primary':
      classes.push('bg-primary', 'text-primary-foreground', 'hover:bg-primary/90')
      break
    case 'secondary':
      classes.push('bg-secondary', 'text-secondary-foreground', 'hover:bg-secondary/80')
      break
    case 'outline':
      classes.push('border', 'border-input', 'bg-background', 'hover:bg-accent')
      break
    case 'ghost':
      classes.push('hover:bg-accent', 'hover:text-accent-foreground')
      break
    default:
      classes.push('bg-primary', 'text-primary-foreground', 'hover:bg-primary/90')
  }

  switch (size) {
    case 'sm':
      classes.push('text-sm', 'px-4', 'py-2')
      break
    case 'lg':
      classes.push('text-lg', 'px-8', 'py-3')
      break
    default:
      classes.push('text-base', 'px-6', 'py-3')
  }

  return classes
}
</script>

<template>
  <!-- Hide completely if isHidden is true for List/Collection items or header/footer -->
  <section
    v-if="!isHeaderFooterHidden && (!isBlockHidden || !isInsideListCollection)"
    ref="sectionRef"
    class="relative w-full cursor-pointer overflow-visible"
    data-preview-block
    :style="animationStyles"
    @click="handleClick"
    @contextmenu="handleContextMenu"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Hover outline -->
    <div
      v-if="isHovered && !isSelected"
      class="absolute inset-0 border-1 border-primary/40 rounded-lg pointer-events-none z-10"
    />

    <!-- Selection outline -->
    <div
      v-if="isSelected"
      class="absolute inset-0 border-1 border-border-outline pointer-events-none z-10"
    />

    <!-- Section label -->
    <div
      v-if="isHovered || isSelected"
      :draggable="canDragBlock"
      class="absolute left-0 flex border items-center px-1.5 h-5 text-[10px] font-mono uppercase backdrop-blur-xs z-20 whitespace-nowrap pointer-events-auto"
      :class="[
        labelShowBelow ? 'top-full mt-0.5 rounded-b' : 'bottom-full mb-0.5 rounded-t',
        isSelected ? 'bg-indigo-600 border-indigo-500/10 text-blue-100' : 'bg-indigo-600/50 border-indigo-500/10 text-blue-100',
        canDragBlock || isInsideCanvas ? 'cursor-grab active:cursor-grabbing' : '',
        isCanvasDragging ? 'cursor-grabbing' : ''
      ]"
      @dragstart="handleBlockDragStart"
      @dragend="handleBlockDragEnd"
      @mousedown="isInsideCanvas ? handleCanvasDragStart($event) : undefined"
    >
      <span v-if="canDragBlock || isInsideCanvas" class="w-2 h-2 rounded-full bg-blue-100 mr-1.5"></span>
      {{ block.name }}
    </div>

    <!-- ============================================ -->
    <!-- HEADER BLOCK -->
    <!-- ============================================ -->
    <div v-if="block.type === 'header' && !headerSettings?.isHidden" class="flex" :style="{ ...blockStyles, gap: `${headerSettings?.gap || 16}px`, height: headerSettings?.height ? `${headerSettings.height}px` : undefined }">
      <!-- Render Start/Middle/End stacks as children -->
      <template v-if="block.children && block.children.length > 0">
        <PreviewSection
          v-for="(child, childIndex) in block.children"
          :key="child.id"
          :block="child"
          :index="childIndex"
          :total="block.children.length"
        />
      </template>
      <!-- Fallback: show placeholders if no children -->
      <template v-else>
        <div class="flex-1 flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Start</span>
        </div>
        <div class="flex-1 flex items-center justify-center gap-2">
          <span class="text-sm text-muted-foreground">Middle</span>
        </div>
        <div class="flex-1 flex items-center justify-end gap-2">
          <span class="text-sm text-muted-foreground">End</span>
        </div>
      </template>
    </div>

    <!-- ============================================ -->
    <!-- FOOTER BLOCK -->
    <!-- ============================================ -->
    <div v-else-if="block.type === 'footer' && !footerSettings?.isHidden" class="flex" :style="{ ...blockStyles, gap: `${footerSettings?.gap || 16}px` }">
      <!-- Render Start/Middle/End stacks as children -->
      <template v-if="block.children && block.children.length > 0">
        <PreviewSection
          v-for="(child, childIndex) in block.children"
          :key="child.id"
          :block="child"
          :index="childIndex"
          :total="block.children.length"
        />
      </template>
      <!-- Fallback: show placeholders if no children -->
      <template v-else>
        <div class="flex-1 flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Start</span>
        </div>
        <div class="flex-1 flex items-center justify-center gap-2">
          <span class="text-sm text-muted-foreground">Middle</span>
        </div>
        <div class="flex-1 flex items-center justify-end gap-2">
          <span class="text-sm text-muted-foreground">End</span>
        </div>
      </template>
    </div>

    <!-- ============================================ -->
    <!-- CONTAINER BLOCK -->
    <!-- ============================================ -->
    <div
      v-else-if="block.type === 'container'"
      class="relative flex min-h-[80px] transition-colors "
      :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
      :style="{
        ...blockStyles,
        flexDirection: (block.styles as ContainerStyles).flexDirection || 'column',
        maxWidth: containerSettings?.maxWidth ? `${containerSettings.maxWidth}px` : undefined,
        marginLeft: blockStyles.marginLeft || (containerSettings?.maxWidth ? 'auto' : undefined),
        marginRight: blockStyles.marginRight || (containerSettings?.maxWidth ? 'auto' : undefined),
        minHeight: getHeightStyle(containerSettings?.height),
        backgroundColor: containerSettings?.backgroundType && containerSettings.backgroundType !== 'color' ? undefined : blockStyles.backgroundColor,
        backgroundImage: containerSettings?.backgroundType === 'image' && containerSettings?.backgroundImage ? `url(${containerSettings.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Background Video -->
      <video
        v-if="containerSettings?.backgroundType === 'video' && containerSettings?.backgroundVideo"
        class="absolute inset-0 w-full h-full object-cover"
        :src="containerSettings.backgroundVideo"
        autoplay
        loop
        muted
        playsinline
      />
      <template v-if="block.children && block.children.length > 0">
        <template v-for="(child, childIndex) in block.children" :key="child.id">
          <!-- Drop indicator before this child -->
          <div
            v-if="childDropIndex === childIndex"
            class="absolute left-0 right-0 h-1 bg-primary rounded-full z-10 -translate-y-2"
            :style="{ top: `${childIndex * 100 / block.children.length}%` }"
          />
          <div
            class="relative z-10"
            @dragover="handleChildDragOver(childIndex, $event)"
            @dragleave="handleChildDragLeave"
          >
            <PreviewSection
              :block="child"
              :index="childIndex"
              :total="block.children.length"
            />
          </div>
        </template>
        <!-- Drop indicator after last child -->
        <div
          v-if="childDropIndex === block.children.length"
          class="h-1 bg-primary rounded-full"
        />
      </template>
      <div
        v-else
        class="relative z-10 flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground border-1 border-dashed border-border/50"
      >
        <div class="flex items-center gap-2">
          <button
            class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent/50 transition-colors"
            @click.stop="handleAddLayoutBlock('stack')"
          >
            <div class="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <Icon name="layout-stack" :size="20" class="text-muted-foreground" />
            </div>
            <span class="text-xs">Stack</span>
          </button>
          <button
            class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent/50 transition-colors"
            @click.stop="handleAddLayoutBlock('grid')"
          >
            <div class="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <Icon name="layout-grid" :size="20" class="text-muted-foreground" />
            </div>
            <span class="text-xs">Grid</span>
          </button>
          <button
            class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent/50 transition-colors"
            @click.stop="handleAddLayoutBlock('canvas')"
          >
            <div class="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <Icon name="layout-canvas" :size="20" class="text-muted-foreground" />
            </div>
            <span class="text-xs">Canvas</span>
          </button>
          <button
            class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent/50 transition-colors"
            @click.stop="handleAddListCollection"
          >
            <div class="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <Icon name="list-slider" :size="20" class="text-muted-foreground" />
            </div>
            <span class="text-xs">List</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- GRID BLOCK (Regular or Slider Mode) -->
    <!-- ============================================ -->
    <!-- SLIDER MODE -->
    <div
      v-else-if="block.type === 'grid' && gridSettings?.isSlider"
      class="relative "
      :style="{
        marginTop: blockStyles.marginTop,
        marginRight: blockStyles.marginRight,
        marginBottom: blockStyles.marginBottom,
        marginLeft: blockStyles.marginLeft,
        backgroundImage: gridSettings?.backgroundType === 'image' && gridSettings?.backgroundImage ? `url(${gridSettings.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    >
      <!-- Background Video -->
      <video
        v-if="gridSettings?.backgroundType === 'video' && gridSettings?.backgroundVideo"
        class="absolute inset-0 w-full h-full object-cover"
        :src="gridSettings.backgroundVideo"
        autoplay
        loop
        muted
        playsinline
      />
      <!-- Slider container -->
      <div
        :ref="(el) => sliderRefs.set(block.id, el as HTMLElement)"
        :data-block-id="block.id"
        class="relative z-10 flex overflow-x-auto snap-x snap-mandatory scroll-smooth min-h-[80px] transition-colors scrollbar-hide"
        :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
        :style="{
          ...blockStyles,
          marginTop: undefined,
          marginRight: undefined,
          marginBottom: undefined,
          marginLeft: undefined,
          gap: `${gridSettings?.gap || 16}px`,
          minHeight: getHeightStyle(gridSettings?.height),
          backgroundColor: gridSettings?.backgroundType && gridSettings.backgroundType !== 'color' ? undefined : blockStyles.backgroundColor
        }"
        @dragenter="handleDragEnter"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        @mouseenter="handleSliderMouseEnter(block.id)"
        @mouseleave="handleSliderMouseLeave(block.id)"
      >
        <template v-if="block.children && block.children.length > 0">
          <div
            v-for="(child, childIndex) in block.children"
            :key="child.id"
            class="relative flex-shrink-0 snap-start"
            :style="{
              width: `calc((100% - ${(gridSettings.slidesPerView || 1) - 1} * ${gridSettings?.gap || 16}px) / ${gridSettings.slidesPerView || 1})`,
            }"
            @dragover="handleChildDragOver(childIndex, $event)"
            @dragleave="handleChildDragLeave"
          >
            <!-- Drop indicator (left edge for slider) -->
            <div
              v-if="childDropIndex === childIndex"
              class="absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10"
            />
            <PreviewSection
              :block="child"
              :index="childIndex"
              :total="block.children.length"
            />
            <!-- Drop indicator after last child -->
            <div
              v-if="childDropIndex === block.children.length && childIndex === block.children.length - 1"
              class="absolute -right-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10"
            />
          </div>
        </template>
        <template v-else>
          <div
            class="flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground border-1 border-dashed border-border/50"
          >
            <Dropdown align="left" width="min-w-48" :close-on-click="true">
              <template #trigger="{ toggle }">
                <Button variant="dotted" size="sm" @click.stop="toggle">
                  <Icon name="plus" :size="12" />
                  Add content
                </Button>
              </template>
              <div class="py-1 font-sans">
                <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">Content</p>
                <DropdownItem
                  v-for="type in blocksByCategory.content"
                  :key="type"
                  :icon="sectionBlockIcons[type]"
                  @click="handleAddContentBlock(type)"
                >
                  {{ sectionBlockLabels[type] }}
                </DropdownItem>
                <div class="my-1 border-t border-border" />
                <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">List / Collection</p>
                <DropdownItem
                  v-for="type in presetTypes"
                  :key="type"
                  :icon="presetIcons[type]"
                  @click="handleAddPresetInside(type)"
                >
                  {{ presetLabels[type] }}
                </DropdownItem>
              </div>
            </Dropdown>
          </div>
        </template>
      </div>

      <!-- Slider Navigation Arrows -->
      <template v-if="gridSettings?.showArrows && block.children && block.children.length > (gridSettings.slidesPerView || 1)">
        <button
          type="button"
          class="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 hover:bg-background border border-border shadow-sm flex items-center justify-center transition-colors"
          @click="handleSliderPrev(block.id)"
        >
          <Icon name="chevron-left" class="text-lg" />
        </button>
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 hover:bg-background border border-border shadow-sm flex items-center justify-center transition-colors"
          @click="handleSliderNext(block.id)"
        >
          <Icon name="chevron-right" class="text-lg" />
        </button>
      </template>

      <!-- Slider Dots -->
      <div
        v-if="gridSettings?.showDots && block.children && block.children.length > (gridSettings.slidesPerView || 1)"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2"
      >
        <button
          v-for="(_, dotIndex) in Math.ceil((block.children.length - (gridSettings.slidesPerView || 1) + 1))"
          :key="dotIndex"
          type="button"
          class="w-2 h-2 rounded-full transition-colors"
          :class="getSliderCurrentIndex(block.id) === dotIndex ? 'bg-primary' : 'bg-primary/30 hover:bg-primary/50'"
          @click="handleSliderGoTo(block.id, dotIndex)"
        />
      </div>
    </div>

    <!-- REGULAR GRID MODE -->
    <div
      v-else-if="block.type === 'grid'"
      class="relative "
      :style="{
        marginTop: blockStyles.marginTop,
        marginRight: blockStyles.marginRight,
        marginBottom: blockStyles.marginBottom,
        marginLeft: blockStyles.marginLeft,
        backgroundImage: gridSettings?.backgroundType === 'image' && gridSettings?.backgroundImage ? `url(${gridSettings.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    >
      <!-- Background Video -->
      <video
        v-if="gridSettings?.backgroundType === 'video' && gridSettings?.backgroundVideo"
        class="absolute inset-0 w-full h-full object-cover"
        :src="gridSettings.backgroundVideo"
        autoplay
        loop
        muted
        playsinline
      />
      <!-- Grid container -->
      <div
        :data-block-id="block.id"
        class="relative z-10 grid min-h-[80px] transition-colors"
        :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
        :style="{
          ...blockStyles,
          marginTop: undefined,
          marginRight: undefined,
          marginBottom: undefined,
          marginLeft: undefined,
          gridTemplateColumns,
          'grid-auto-rows': 'minmax(80px, auto)',
          gap: `${gridSettings?.gap || 16}px`,
          minHeight: getHeightStyle(gridSettings?.height),
          backgroundColor: gridSettings?.backgroundType && gridSettings.backgroundType !== 'color' ? undefined : blockStyles.backgroundColor
        }"
        @dragenter="handleDragEnter"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <template v-if="block.children && block.children.length > 0">
          <div
            v-for="(child, childIndex) in block.children"
            :key="child.id"
            class="relative"
            :style="getGridItemStyles(child)"
            @dragover="handleChildDragOver(childIndex, $event)"
            @dragleave="handleChildDragLeave"
          >
            <!-- Drop indicator (left edge for grid) -->
            <div
              v-if="childDropIndex === childIndex"
              class="absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10"
            />
            <PreviewSection
              :block="child"
              :index="childIndex"
              :total="block.children.length"
            />
            <!-- Drop indicator after last child -->
            <div
              v-if="childDropIndex === block.children.length && childIndex === block.children.length - 1"
              class="absolute -right-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10"
            />
          </div>
        </template>
        <template v-else>
          <div
            class="flex flex-col items-center justify-center py-8 text-muted-foreground border-1 border-dashed border-border/50"
            :style="{ gridColumn: `span ${gridSettings?.columns || 2}` }"
          >
            <Dropdown align="left" width="min-w-48" :close-on-click="true">
              <template #trigger="{ toggle }">
                <Button variant="dotted" size="sm" @click.stop="toggle">
                  <Icon name="plus" :size="12" />
                  Add content
                </Button>
              </template>
              <div class="py-1 font-sans">
                <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">Content</p>
                <DropdownItem
                  v-for="type in blocksByCategory.content"
                  :key="type"
                  :icon="sectionBlockIcons[type]"
                  @click="handleAddContentBlock(type)"
                >
                  {{ sectionBlockLabels[type] }}
                </DropdownItem>
                <div class="my-1 border-t border-border" />
                <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">List / Collection</p>
                <DropdownItem
                  v-for="type in presetTypes"
                  :key="type"
                  :icon="presetIcons[type]"
                  @click="handleAddPresetInside(type)"
                >
                  {{ presetLabels[type] }}
                </DropdownItem>
              </div>
            </Dropdown>
          </div>
        </template>
      </div>

      <!-- Column resize handles (only when selected) -->
      <template v-if="isSelected && (gridSettings?.columns || 2) > 1">
        <div
          v-for="i in ((gridSettings?.columns || 2) - 1)"
          :key="`resize-${i}`"
          class="absolute top-0 bottom-0 w-4 -ml-2 cursor-col-resize z-30 group flex items-center justify-center"
          :style="{ left: getColumnResizeHandlePosition(i - 1) }"
          @mousedown="handleColumnResizeStart(i - 1, $event)"
        >
          <div class="w-1 h-8 rounded-full bg-primary/0 group-hover:bg-primary/60 transition-colors"></div>
        </div>
      </template>
    </div>

    <!-- ============================================ -->
    <!-- STACK BLOCK -->
    <!-- ============================================ -->
    <div
      v-else-if="block.type === 'stack'"
      class="relative flex min-h-[80px] transition-colors"
      :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
      :style="{
        ...blockStyles,
        flexDirection: stackSettings?.direction === 'horizontal' ? 'row' : 'column',
        gap: `${stackSettings?.gap || 16}px`,
        minHeight: getHeightStyle(stackSettings?.height),
        backgroundColor: stackSettings?.backgroundType && stackSettings.backgroundType !== 'color' ? undefined : blockStyles.backgroundColor,
        backgroundImage: stackSettings?.backgroundType === 'image' && stackSettings?.backgroundImage ? `url(${stackSettings.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Background Video -->
      <video
        v-if="stackSettings?.backgroundType === 'video' && stackSettings?.backgroundVideo"
        class="absolute inset-0 w-full h-full object-cover"
        :src="stackSettings.backgroundVideo"
        autoplay
        loop
        muted
        playsinline
      />
      <template v-if="block.children && block.children.length > 0">
        <div
          v-for="(child, childIndex) in block.children"
          :key="child.id"
          class="relative z-10"
          :class="stackSettings?.direction === 'horizontal' ? '' : 'w-full'"
          @dragover="handleChildDragOver(childIndex, $event)"
          @dragleave="handleChildDragLeave"
        >
          <!-- Drop indicator -->
          <div
            v-if="childDropIndex === childIndex"
            :class="stackSettings?.direction === 'horizontal'
              ? 'absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10'
              : 'absolute left-0 right-0 -top-2 h-1 bg-primary rounded-full z-10'"
          />
          <PreviewSection
            :block="child"
            :index="childIndex"
            :total="block.children.length"
          />
          <!-- Drop indicator after last child -->
          <div
            v-if="childDropIndex === block.children.length && childIndex === block.children.length - 1"
            :class="stackSettings?.direction === 'horizontal'
              ? 'absolute -right-2 top-0 bottom-0 w-1 bg-primary rounded-full z-10'
              : 'absolute left-0 right-0 -bottom-2 h-1 bg-primary rounded-full z-10'"
          />
        </div>
      </template>
      <div
        v-else
        class="relative z-10 flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground border-1 border-dashed border-border/50"
      >
        <Dropdown align="left" width="min-w-48" :close-on-click="true">
          <template #trigger="{ toggle }">
            <Button variant="dotted" size="sm" @click.stop="toggle">
              <Icon name="plus" :size="12" />
              Add content
            </Button>
          </template>
          <div class="py-1 font-sans">
            <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">Content</p>
            <DropdownItem
              v-for="type in blocksByCategory.content"
              :key="type"
              :icon="sectionBlockIcons[type]"
              @click="handleAddContentBlock(type)"
            >
              {{ sectionBlockLabels[type] }}
            </DropdownItem>
            <div class="my-1 border-t border-border" />
            <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">List / Collection</p>
            <DropdownItem
              v-for="type in presetTypes"
              :key="type"
              :icon="presetIcons[type]"
              @click="handleAddPresetInside(type)"
            >
              {{ presetLabels[type] }}
            </DropdownItem>
          </div>
        </Dropdown>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- DIVIDER BLOCK -->
    <!-- ============================================ -->
    <div v-else-if="block.type === 'divider'" class="flex justify-center" :style="blockStyles">
      <div
        v-if="dividerSettings?.style !== 'space'"
        class="border-t"
        :class="{ 'border-dashed': dividerSettings?.style === 'dashed', 'border-dotted': dividerSettings?.style === 'dotted' }"
        :style="{ width: `${dividerSettings?.width || 100}%`, borderColor: dividerSettings?.color || 'currentColor', borderTopWidth: `${dividerSettings?.thickness || 1}px` }"
      />
      <div v-else class="h-8" :style="{ width: `${dividerSettings?.width || 100}%` }" />
    </div>

    <!-- ============================================ -->
    <!-- HEADING BLOCK -->
    <!-- ============================================ -->
    <component
      v-else-if="block.type === 'heading'"
      :is="headingSettings?.level || 'h2'"
      :ref="(el: any) => { if (block.type === 'heading') editableRef = el }"
      class="outline-none whitespace-pre-wrap"
      :class="[
        !blockStyles.fontSize ? {
          'text-6xl': headingSettings?.level === 'h1',
          'text-5xl': headingSettings?.level === 'h2',
          'text-4xl': headingSettings?.level === 'h3',
          'text-3xl': headingSettings?.level === 'h4',
          'text-2xl': headingSettings?.level === 'h5',
          'text-xl': headingSettings?.level === 'h6',
        } : {},
        { 'has-state-styles': supportsStateStyles }
      ]"
      :style="blockStyles"
      contenteditable="true"
      @blur="handleHeadingEdit($event)"
      @keydown.escape="handleEscapeKey($event)"
      @paste="handlePasteClean($event)"
      :key="`heading-${editorStore.currentLanguage || 'default'}`"
      v-html="displayHeadingContent || 'Heading'"
    />

    <!-- ============================================ -->
    <!-- TEXT BLOCK -->
    <!-- ============================================ -->
    <div
      v-else-if="block.type === 'text'"
      :ref="(el: any) => { if (block.type === 'text') editableRef = el }"
      :key="`text-${editorStore.currentLanguage || 'default'}`"
      class="prose prose-neutral max-w-none outline-none"
      :class="{ 'has-state-styles': supportsStateStyles }"
      :style="blockStyles"
      contenteditable="true"
      @blur="handleTextEdit($event)"
      @keydown.escape="handleEscapeKey($event)"
      @paste="handlePasteClean($event)"
      v-html="displayTextContent || 'Enter your text here...'"
    ></div>

    <!-- ============================================ -->
    <!-- IMAGE BLOCK -->
    <!-- ============================================ -->
    <div v-else-if="block.type === 'image'" class="flex justify-center" :class="{ 'has-state-styles': supportsStateStyles }" :style="blockStyles">
      <img v-if="imageSettings?.src" :src="imageSettings.src" :alt="displayImageAlt || ''" class="max-w-full h-auto" :style="getImageStyles()" />
      <div v-else class="w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center">
        <Icon name="content-image" class="text-4xl text-muted-foreground" />
      </div>
    </div>

    <!-- ============================================ -->
    <!-- VIDEO BLOCK -->
    <!-- ============================================ -->
    <div v-else-if="block.type === 'video'" class="flex justify-center" :class="{ 'has-state-styles': supportsStateStyles }" :style="blockStyles">
      <video v-if="videoSettings?.src" :src="videoSettings.src" :autoplay="videoSettings.autoplay" :loop="videoSettings.loop" :muted="videoSettings.muted" :controls="videoSettings.controls" class="max-w-full" :style="getVideoStyles()"></video>
      <div v-else class="w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center">
        <Icon name="play" class="text-4xl text-muted-foreground" />
      </div>
    </div>

    <!-- ============================================ -->
    <!-- BUTTON BLOCK -->
    <!-- ============================================ -->
    <div v-else-if="block.type === 'button'" class="flex py-2" :class="{ 'justify-start': getButtonAlignment() === 'left', 'justify-center': !getButtonAlignment() || getButtonAlignment() === 'center', 'justify-end': getButtonAlignment() === 'right' }">
      <span
        :key="`button-${editorStore.currentLanguage || 'default'}`"
        :class="[...getButtonClasses(buttonSettings?.variant, buttonSettings?.size), 'outline-none focus:ring-2 focus:ring-primary/20', { 'has-state-styles': supportsStateStyles }]"
        :style="blockStyles"
        contenteditable="true"
        @blur="handleButtonEdit($event)"
        @keydown.enter.prevent="($event.target as HTMLElement).blur()"
        @keydown.escape="handleEscapeKey($event)"
        @paste="handlePasteClean($event)"
        @click.stop
      >{{ displayButtonLabel || 'Click me' }}</span>
    </div>

    <!-- ============================================ -->
    <!-- ICON BLOCK -->
    <!-- ============================================ -->
    <div v-else-if="block.type === 'icon'" class="flex justify-center" :style="blockStyles">
      <Icon :name="iconSettings?.icon || 'star-1'" :size="iconSettings?.size || '24px'" :style="{ color: iconStyles?.color || undefined }" />
    </div>

    <!-- ============================================ -->
    <!-- VARIANTS BLOCK (Shopify-style) -->
    <!-- ============================================ -->
    <div
      v-else-if="block.type === 'variants'"
      class="space-y-3"
      :style="blockStyles"
    >
      <!-- Render each option type (e.g., Color, Size) -->
      <div
        v-for="optionType in variantsSettings?.optionTypes || []"
        :key="optionType.id"
        class="space-y-2"
      >
        <div class="text-xs font-medium text-foreground/80">{{ optionType.name }}</div>
        <div class="flex flex-wrap" :style="{ gap: `${variantsStyles?.gap || '8'}px` }">
          <!-- Dropdown -->
          <template v-if="optionType.displayStyle === 'dropdown'">
            <select
              class="px-3 py-2 border border-input bg-background text-sm min-w-[120px]"
              :class="{
                'h-8 text-xs': variantsStyles?.optionSize === 'sm',
                'h-10': variantsStyles?.optionSize === 'md' || !variantsStyles?.optionSize,
                'h-12 text-base': variantsStyles?.optionSize === 'lg',
              }"
            >
              <option v-for="val in optionType.values || []" :key="val.id" :value="val.value">
                {{ val.value }}
              </option>
            </select>
          </template>

          <!-- Buttons -->
          <template v-else-if="optionType.displayStyle === 'buttons'">
            <button
              v-for="(val, idx) in optionType.values || []"
              :key="val.id"
              type="button"
              class="px-3 border transition-colors"
              :class="[
                idx === 0 ? 'border-primary bg-primary/10 text-primary' : 'border-input hover:border-primary/50',
                {
                  'py-1 text-xs': variantsStyles?.optionSize === 'sm',
                  'py-2 text-sm': variantsStyles?.optionSize === 'md' || !variantsStyles?.optionSize,
                  'py-3 text-base': variantsStyles?.optionSize === 'lg',
                },
              ]"
            >
              {{ val.value }}
            </button>
          </template>

          <!-- Swatches -->
          <template v-else-if="optionType.displayStyle === 'swatches'">
            <button
              v-for="(val, idx) in optionType.values || []"
              :key="val.id"
              type="button"
              class="rounded-full border-2 transition-colors"
              :class="[
                idx === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50',
                {
                  'w-6 h-6': variantsStyles?.optionSize === 'sm',
                  'w-8 h-8': variantsStyles?.optionSize === 'md' || !variantsStyles?.optionSize,
                  'w-10 h-10': variantsStyles?.optionSize === 'lg',
                },
              ]"
              :style="{ backgroundColor: val.colorHex || '#cccccc' }"
              :title="val.value"
            ></button>
          </template>
        </div>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- FORM BLOCK -->
    <!-- Form now renders child blocks (form-input, form-textarea, etc.) -->
    <!-- ============================================ -->
    <form v-else-if="block.type === 'form'" class="flex flex-col" :style="{ ...blockStyles, gap: formSettings?.gap ? `${formSettings.gap}px` : '16px' }" @submit.prevent>
      <PreviewSection
        v-for="(child, childIndex) in block.children || []"
        :key="child.id"
        :block="child"
        :index="childIndex"
        :total="(block.children || []).length"
      />
      <p v-if="!block.children?.length" class="text-sm text-muted-foreground text-center py-4">
        Add form fields using the sidebar
      </p>
    </form>

    <!-- ============================================ -->
    <!-- FORM FIELD BLOCKS -->
    <!-- These are rendered as children of form blocks -->
    <!-- ============================================ -->
    <!-- Form Input -->
    <div v-else-if="block.type === 'form-input'" class="flex flex-col gap-1.5">
      <label v-if="formInputSettings?.label" class="text-sm font-medium">
        {{ formInputSettings.label }}
        <span v-if="formInputSettings?.required" class="text-destructive">*</span>
      </label>
      <input
        :type="formInputSettings?.inputType || 'text'"
        :placeholder="formInputSettings?.placeholder"
        :required="formInputSettings?.required"
        class="px-4 py-2 border border-input bg-background"
        :class="{ 'has-state-styles': supportsStateStyles }"
        :style="blockStyles"
      />
    </div>

    <!-- Form Textarea -->
    <div v-else-if="block.type === 'form-textarea'" class="flex flex-col gap-1.5">
      <label v-if="formTextareaSettings?.label" class="text-sm font-medium">
        {{ formTextareaSettings.label }}
        <span v-if="formTextareaSettings?.required" class="text-destructive">*</span>
      </label>
      <textarea
        :placeholder="formTextareaSettings?.placeholder"
        :rows="formTextareaSettings?.rows || 4"
        :required="formTextareaSettings?.required"
        class="px-4 py-2 border border-input bg-background resize-none"
        :class="{ 'has-state-styles': supportsStateStyles }"
        :style="blockStyles"
      ></textarea>
    </div>

    <!-- Form Select (Dropdown) -->
    <div v-else-if="block.type === 'form-select'" class="flex flex-col gap-1.5">
      <label v-if="formSelectSettings?.label" class="text-sm font-medium">
        {{ formSelectSettings.label }}
        <span v-if="formSelectSettings?.required" class="text-destructive">*</span>
      </label>
      <select
        :required="formSelectSettings?.required"
        class="px-4 py-2 border border-input bg-background"
        :class="{ 'has-state-styles': supportsStateStyles }"
        :style="blockStyles"
      >
        <option v-if="formSelectSettings?.placeholder" value="" disabled selected>{{ formSelectSettings.placeholder }}</option>
        <option v-for="option in formSelectSettings?.options || []" :key="option.id" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- Form Radio -->
    <div v-else-if="block.type === 'form-radio'" class="flex flex-col gap-1.5" :class="{ 'has-state-styles': supportsStateStyles }" :style="blockStyles">
      <label v-if="formRadioSettings?.label" class="text-sm font-medium">
        {{ formRadioSettings.label }}
        <span v-if="formRadioSettings?.required" class="text-destructive">*</span>
      </label>
      <div :class="formRadioSettings?.layout === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2'">
        <label v-for="option in formRadioSettings?.options || []" :key="option.id" class="flex items-center gap-2 text-sm cursor-pointer">
          <input type="radio" :name="block.id" :value="option.value" :required="formRadioSettings?.required" />
          {{ option.label }}
        </label>
      </div>
    </div>

    <!-- Form Checkbox -->
    <div v-else-if="block.type === 'form-checkbox'" class="flex flex-col gap-1.5" :class="{ 'has-state-styles': supportsStateStyles }" :style="blockStyles">
      <label v-if="formCheckboxSettings?.label" class="text-sm font-medium">
        {{ formCheckboxSettings.label }}
        <span v-if="formCheckboxSettings?.required" class="text-destructive">*</span>
      </label>
      <div :class="formCheckboxSettings?.layout === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2'">
        <label v-for="option in formCheckboxSettings?.options || []" :key="option.id" class="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" :name="`${block.id}_${option.value}`" :value="option.value" />
          {{ option.label }}
        </label>
      </div>
    </div>

    <!-- Form Button -->
    <div v-else-if="block.type === 'form-button'">
      <button
        type="submit"
        :class="[
          'px-6 py-2 font-medium transition-colors',
          formButtonSettings?.size === 'sm' ? 'text-sm px-4 py-1.5' : formButtonSettings?.size === 'lg' ? 'text-lg px-8 py-3' : 'text-base',
          formButtonSettings?.variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' :
          formButtonSettings?.variant === 'outline' ? 'border border-input bg-transparent hover:bg-accent' :
          'bg-primary text-primary-foreground hover:bg-primary/90',
          formButtonSettings?.fullWidth ? 'w-full' : '',
          { 'has-state-styles': supportsStateStyles }
        ]"
        :style="blockStyles"
      >
        {{ formButtonSettings?.label || 'Submit' }}
      </button>
    </div>

    <!-- ============================================ -->
    <!-- CANVAS BLOCK -->
    <!-- ============================================ -->
    <div
      v-else-if="block.type === 'canvas'"
      :data-block-id="block.id"
      class="relative  transition-colors"
      :class="isDropTarget ? 'ring-2 ring-primary ring-dashed' : ''"
      :style="{
        ...blockStyles,
        minHeight: getHeightStyle(canvasSettings?.minHeight) || '400px',
        backgroundColor: canvasSettings?.backgroundType && canvasSettings.backgroundType !== 'color' ? undefined : blockStyles.backgroundColor,
        backgroundImage: canvasSettings?.backgroundType === 'image' && canvasSettings?.backgroundImage ? `url(${canvasSettings.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Background Video -->
      <video
        v-if="canvasSettings?.backgroundType === 'video' && canvasSettings?.backgroundVideo"
        class="absolute inset-0 w-full h-full object-cover"
        :src="canvasSettings.backgroundVideo"
        autoplay
        loop
        muted
        playsinline
      />

      <!-- Children with absolute positioning (viewport-aware) -->
      <template v-if="block.children && block.children.length > 0">
        <div
          v-for="(child, childIndex) in block.children"
          :key="child.id"
          class="absolute"
          :style="{
            left: `${getCanvasChildPos(child.id).x}%`,
            top: `${getCanvasChildPos(child.id).y}%`,
            width: getCanvasChildPos(child.id).width ? `${getCanvasChildPos(child.id).width}%` : 'auto',
            zIndex: getCanvasChildPos(child.id).zIndex || childIndex + 1,
          }"
        >
          <PreviewSection
            :block="child"
            :index="childIndex"
            :total="(block.children || []).length"
          />
        </div>
      </template>

      <!-- Empty state -->
      <div
        v-else
        class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground border-1 border-dashed border-border/50 m-4"
      >
        <Dropdown align="left" width="min-w-48" :close-on-click="true">
          <template #trigger="{ toggle }">
            <Button variant="dotted" size="sm" @click.stop="toggle">
              <Icon name="plus" :size="12" />
              Add content
            </Button>
          </template>
          <div class="py-1 font-sans">
            <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">Content</p>
            <DropdownItem
              v-for="type in blocksByCategory.content"
              :key="type"
              :icon="sectionBlockIcons[type]"
              @click="handleAddContentBlock(type)"
            >
              {{ sectionBlockLabels[type] }}
            </DropdownItem>
            <div class="my-1 border-t border-border" />
            <p class="px-3 py-1.5 text-xs font-medium text-muted-foreground">List / Collection</p>
            <DropdownItem
              v-for="type in presetTypes"
              :key="type"
              :icon="presetIcons[type]"
              @click="handleAddPresetInside(type)"
            >
              {{ presetLabels[type] }}
            </DropdownItem>
          </div>
        </Dropdown>
      </div>
    </div>

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
        :disabled="!editorStore.hasClipboardBlock"
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
        :disabled="!editorStore.hasClipboardStyles"
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
    <BlockPicker
      v-model:open="isBlockPickerOpen"
      @select-block="handleBlockPickerSelectBlock"
      @select-preset="handleBlockPickerSelectPreset"
    />

    <!-- Inline Format Toolbar for heading/text blocks -->
    <InlineFormatToolbar
      v-if="block.type === 'heading' || block.type === 'text'"
      :target-element="editableRef"
      @format="handleInlineFormat"
    />
  </section>
</template>

<style>
/* State styles - apply base and hover/active/focus styles via CSS custom properties
   Using CSS variables allows :hover/:active/:focus pseudo-classes to override inline styles
   Note: Not scoped because these styles need to apply to dynamically classed elements */
.has-state-styles {
  /* Apply base color and background from CSS variables (set in inline style) */
  background-color: var(--base-bg, transparent);
  color: var(--base-color, inherit);
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
}

.has-state-styles:hover {
  /* Hover styles override base, fallback to base if not set */
  background-color: var(--hover-bg, var(--base-bg, transparent));
  color: var(--hover-color, var(--base-color, inherit));
  border-color: var(--hover-border-color);
  box-shadow: var(--hover-shadow);
  opacity: var(--hover-opacity);
  transform: var(--hover-transform);
}

.has-state-styles:active {
  /* Pressed styles override hover, fallback to hover then base */
  background-color: var(--pressed-bg, var(--hover-bg, var(--base-bg, transparent)));
  color: var(--pressed-color, var(--hover-color, var(--base-color, inherit)));
  border-color: var(--pressed-border-color, var(--hover-border-color));
  box-shadow: var(--pressed-shadow, var(--hover-shadow));
  opacity: var(--pressed-opacity, var(--hover-opacity));
  transform: var(--pressed-transform, var(--hover-transform));
}

.has-state-styles:focus,
.has-state-styles:focus-visible {
  /* Focus styles, no cascading - just focused or base */
  background-color: var(--focused-bg, var(--base-bg, transparent));
  color: var(--focused-color, var(--base-color, inherit));
  border-color: var(--focused-border-color);
  box-shadow: var(--focused-shadow);
  opacity: var(--focused-opacity);
  transform: var(--focused-transform);
  outline: none;
}
</style>
