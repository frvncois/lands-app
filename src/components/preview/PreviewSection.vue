<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type {
  SectionBlock,
  SectionBlockType,
  HeaderSettings,
  FooterSettings,
  ContainerSettings,
  GridSettings,
  StackSettings,
  DividerSettings,
  HeadingSettings,
  TextSettings,
  ImageSettings,
  VideoSettings,
  ButtonSettings,
  IconSettings,
  FormSettings,
  FormInputSettings,
  FormTextareaSettings,
  FormSelectSettings,
  FormRadioSettings,
  FormCheckboxSettings,
  FormButtonSettings,
  FreeformSettings,
  FreeformChildPosition,
  AnimationSettings,
  BaseBlockStyles,
} from '@/types/editor'
import {
  animationInitialStates,
  animationFinalStates,
  getAnimationKeyframeName,
  getAnimationCSSValue,
} from '@/lib/animation-utils'
import { getResponsiveStyles } from '@/lib/style-utils'

// SectionBlockType is used for addBlock calls
import { socialPlatformIcons, sectionBlockLabels, sectionBlockIcons, canHaveChildren, createPresetBlock, presetTypes, type PresetType } from '@/lib/editor-utils'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import ContextMenuItem from '@/components/ui/ContextMenuItem.vue'
import ContextMenuDivider from '@/components/ui/ContextMenuDivider.vue'
import BlockPicker from '@/components/builder/BlockPicker.vue'

const props = defineProps<{
  block: SectionBlock
  index: number
  total: number
}>()

const editorStore = useEditorStore()

const isHovered = ref(false)
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const sectionRef = ref<HTMLElement | null>(null)

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
function handleMouseEnter() {
  isHovered.value = true

  // Apply hover animation styles
  if (blockAnimation.value?.trigger === 'hover' && sectionRef.value) {
    Object.assign(sectionRef.value.style, hoverAnimationStyles.value)
  }
}

function handleMouseLeave() {
  isHovered.value = false

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

function handleBlockPickerSelectBlock(type: SectionBlockType) {
  const block = editorStore.addBlock(type, undefined, props.block.id)
  if (block) {
    editorStore.selectBlock(block.id)
  }
}

function handleBlockPickerSelectPreset(type: PresetType) {
  const block = createPresetBlock(type)
  editorStore.addPresetBlock(block, undefined, props.block.id)
  editorStore.selectBlock(block.id)
}

const isSelected = computed(() =>
  editorStore.selectedBlockId === props.block.id &&
  !editorStore.selectedItemId
)

// Check if this is a protected block (header/footer)
const isProtectedBlock = computed(() => props.block.type === 'header' || props.block.type === 'footer')

// Check if block can have children
const isLayoutBlock = computed(() => canHaveChildren(props.block.type))

// Check if this block is inside a List/Collection (Grid > Stack pattern)
const isInsideListCollection = computed(() => editorStore.isInsideListCollection(props.block.id))

// Check if this block is inside a Freeform parent
const isInsideFreeform = computed(() => {
  const parent = editorStore.findParentBlock(props.block.id)
  return parent?.type === 'freeform'
})

// Check if block is hidden
const isBlockHidden = computed(() => {
  const settings = props.block.settings as Record<string, unknown>
  return !!settings.isHidden
})

// Type guards for settings
const headerSettings = computed(() => props.block.type === 'header' ? props.block.settings as HeaderSettings : null)
const footerSettings = computed(() => props.block.type === 'footer' ? props.block.settings as FooterSettings : null)
const containerSettings = computed(() => props.block.type === 'container' ? props.block.settings as ContainerSettings : null)
const gridSettings = computed(() => props.block.type === 'grid' ? props.block.settings as GridSettings : null)
const stackSettings = computed(() => props.block.type === 'stack' ? props.block.settings as StackSettings : null)
const dividerSettings = computed(() => props.block.type === 'divider' ? props.block.settings as DividerSettings : null)
const headingSettings = computed(() => props.block.type === 'heading' ? props.block.settings as HeadingSettings : null)
const textSettings = computed(() => props.block.type === 'text' ? props.block.settings as TextSettings : null)
const imageSettings = computed(() => props.block.type === 'image' ? props.block.settings as ImageSettings : null)
const videoSettings = computed(() => props.block.type === 'video' ? props.block.settings as VideoSettings : null)
const buttonSettings = computed(() => props.block.type === 'button' ? props.block.settings as ButtonSettings : null)
const iconSettings = computed(() => props.block.type === 'icon' ? props.block.settings as IconSettings : null)
const formSettings = computed(() => props.block.type === 'form' ? props.block.settings as FormSettings : null)
// Form field block settings
const formInputSettings = computed(() => props.block.type === 'form-input' ? props.block.settings as FormInputSettings : null)
const formTextareaSettings = computed(() => props.block.type === 'form-textarea' ? props.block.settings as FormTextareaSettings : null)
const formSelectSettings = computed(() => props.block.type === 'form-select' ? props.block.settings as FormSelectSettings : null)
const formRadioSettings = computed(() => props.block.type === 'form-radio' ? props.block.settings as FormRadioSettings : null)
const formCheckboxSettings = computed(() => props.block.type === 'form-checkbox' ? props.block.settings as FormCheckboxSettings : null)
const formButtonSettings = computed(() => props.block.type === 'form-button' ? props.block.settings as FormButtonSettings : null)
// Freeform block settings
const freeformSettings = computed(() => props.block.type === 'freeform' ? props.block.settings as FreeformSettings : null)

// Helper to get freeform child position for template (viewport-aware with cascade)
function getFreeformChildPos(childId: string): FreeformChildPosition {
  if (!freeformSettings.value) return { x: 10, y: 10 }
  const positions = freeformSettings.value.childPositions
  const viewport = editorStore.viewport
  const defaultPos: FreeformChildPosition = { x: 10, y: 10 }

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

// Inline editing handlers
// These update translations when in translation mode, otherwise update source content
function handleHeadingEdit(event: FocusEvent) {
  const target = event.target as HTMLElement
  const newContent = target.innerText.trim()
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

// Drag & drop for layout blocks
const isDropTarget = ref(false)
const childDropIndex = ref<number | null>(null) // Index where child will be dropped

// Check if this block can be dragged (not protected and not inside List/Collection)
// Blocks inside Freeform use mouse drag for positioning, not HTML5 drag
const canDragBlock = computed(() => !isProtectedBlock.value && !isInsideListCollection.value && !isInsideFreeform.value)

// ============================================
// FREEFORM POSITIONING (for children of Freeform)
// ============================================
const isFreeformDragging = ref(false)
const freeformDragStartX = ref(0)
const freeformDragStartY = ref(0)
const freeformStartPosX = ref(0)
const freeformStartPosY = ref(0)

// Helper to get child position for current viewport (cascading: mobile -> tablet -> desktop)
function getResponsiveChildPosition(settings: FreeformSettings, childId: string): FreeformChildPosition {
  const positions = settings.childPositions
  const viewport = editorStore.viewport
  const defaultPos: FreeformChildPosition = { x: 10, y: 10 }

  // Cascade: check current viewport, then fall back to larger viewports
  if (viewport === 'mobile') {
    return positions.mobile?.[childId] || positions.tablet?.[childId] || positions.desktop?.[childId] || defaultPos
  } else if (viewport === 'tablet') {
    return positions.tablet?.[childId] || positions.desktop?.[childId] || defaultPos
  }
  // Desktop
  return positions.desktop?.[childId] || defaultPos
}

function handleFreeformDragStart(event: MouseEvent) {
  if (!isInsideFreeform.value) return

  event.preventDefault()
  event.stopPropagation()

  isFreeformDragging.value = true
  freeformDragStartX.value = event.clientX
  freeformDragStartY.value = event.clientY

  // Get current position from parent's settings (viewport-aware)
  const parent = editorStore.findParentBlock(props.block.id)
  if (parent && parent.type === 'freeform') {
    const parentSettings = parent.settings as FreeformSettings
    const currentPos = getResponsiveChildPosition(parentSettings, props.block.id)
    freeformStartPosX.value = currentPos.x
    freeformStartPosY.value = currentPos.y
  }

  document.addEventListener('mousemove', handleFreeformDragMove)
  document.addEventListener('mouseup', handleFreeformDragEnd)
}

function handleFreeformDragMove(event: MouseEvent) {
  if (!isFreeformDragging.value) return

  const parent = editorStore.findParentBlock(props.block.id)
  if (!parent || parent.type !== 'freeform') return

  // Find the freeform container element to get its dimensions
  const freeformEl = document.querySelector(`[data-block-id="${parent.id}"]`) as HTMLElement
  if (!freeformEl) return

  const rect = freeformEl.getBoundingClientRect()
  const deltaX = event.clientX - freeformDragStartX.value
  const deltaY = event.clientY - freeformDragStartY.value

  // Convert pixel delta to percentage of container
  const deltaXPercent = (deltaX / rect.width) * 100
  const deltaYPercent = (deltaY / rect.height) * 100

  // Calculate new position
  const newX = Math.max(0, Math.min(95, freeformStartPosX.value + deltaXPercent))
  const newY = Math.max(0, Math.min(95, freeformStartPosY.value + deltaYPercent))

  // Update the parent's childPositions for current viewport
  const parentSettings = parent.settings as FreeformSettings
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

function handleFreeformDragEnd() {
  isFreeformDragging.value = false
  document.removeEventListener('mousemove', handleFreeformDragMove)
  document.removeEventListener('mouseup', handleFreeformDragEnd)
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

  if (settings.gridColumn) {
    styles.gridColumn = settings.gridColumn as string
  } else if (settings.gridColumnSpan && (settings.gridColumnSpan as number) > 1) {
    styles.gridColumn = `span ${settings.gridColumnSpan}`
  }

  if (settings.gridRow) {
    styles.gridRow = settings.gridRow as string
  } else if (settings.gridRowSpan && (settings.gridRowSpan as number) > 1) {
    styles.gridRow = `span ${settings.gridRowSpan}`
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
  if (isValidDragType(event)) {
    event.preventDefault()
    event.stopPropagation()
    isDropTarget.value = true
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
  if (!isLayoutBlock.value) return
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
    if (blockParent?.id === props.block.id && dropIndex !== null) {
      // Reordering within this container
      const currentIndex = props.block.children?.findIndex(c => c.id === blockIdToMove) ?? -1
      if (currentIndex !== -1 && currentIndex !== dropIndex) {
        const targetIndex = currentIndex < dropIndex ? dropIndex - 1 : dropIndex
        editorStore.reorderBlocks(currentIndex, targetIndex, props.block.id)
      }
    } else {
      // Move the block to this parent at the specified index
      editorStore.moveBlockToParent(blockIdToMove, props.block.id, dropIndex ?? undefined)
    }
    editorStore.selectBlock(blockIdToMove)
    return
  }

  // Check for preset type
  const presetType = event.dataTransfer?.getData('application/x-preset-type') as PresetType
  if (presetType && presetTypes.includes(presetType)) {
    const block = createPresetBlock(presetType)
    editorStore.addPresetBlock(block, dropIndex ?? undefined, props.block.id)
    editorStore.selectBlock(block.id)
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

// Compute CSS styles from block.styles with responsive support
const blockStyles = computed(() => {
  const rawStyles = props.block.styles as BaseBlockStyles
  if (!rawStyles) return {}

  // Get responsive styles for current viewport (cascaded)
  const styles = getResponsiveStyles(rawStyles, editorStore.viewport)
  // Also get non-responsive styles (like typography) from raw styles
  const allStyles = rawStyles as Record<string, unknown>

  const css: Record<string, string> = {}

  // Padding (responsive)
  if (styles.padding) {
    const p = styles.padding as { top?: string; right?: string; bottom?: string; left?: string }
    if (p.top) css.paddingTop = `${p.top}px`
    if (p.right) css.paddingRight = `${p.right}px`
    if (p.bottom) css.paddingBottom = `${p.bottom}px`
    if (p.left) css.paddingLeft = `${p.left}px`
  }

  // Margin (responsive)
  if (styles.margin) {
    const m = styles.margin as { top?: string; right?: string; bottom?: string; left?: string }
    if (m.top) css.marginTop = `${m.top}px`
    if (m.right) css.marginRight = `${m.right}px`
    if (m.bottom) css.marginBottom = `${m.bottom}px`
    if (m.left) css.marginLeft = `${m.left}px`
  }

  // Background (responsive)
  if (styles.backgroundColor) css.backgroundColor = styles.backgroundColor as string
  if (styles.backgroundImage) {
    css.backgroundImage = `url(${styles.backgroundImage})`
    css.backgroundSize = (styles.backgroundSize as string) || 'cover'
    css.backgroundPosition = (styles.backgroundPosition as string) || 'center'
  }

  // Border (responsive)
  if (styles.border) {
    const b = styles.border as { width?: string; color?: string; radius?: string; style?: string }
    if (b.width && b.width !== '0') {
      css.borderWidth = `${b.width}px`
      css.borderStyle = b.style || 'solid'
      css.borderColor = b.color || 'currentColor'
    }
    if (b.radius && b.radius !== '0') css.borderRadius = `${b.radius}px`
  }

  // Shadow (responsive)
  if (styles.shadow) {
    const s = styles.shadow as { enabled?: boolean; x?: string; y?: string; blur?: string; color?: string }
    if (s.enabled) {
      css.boxShadow = `${s.x || 0}px ${s.y || 0}px ${s.blur || 0}px ${s.color || 'rgba(0,0,0,0.1)'}`
    }
  }

  // Typography styles (non-responsive for now) - fontSize uses Tailwind class names, convert to pixels
  if (allStyles.fontSize) {
    const size = allStyles.fontSize as string
    css.fontSize = fontSizeMap[size] || `${size}px`
  }
  if (allStyles.color) css.color = allStyles.color as string
  if (allStyles.alignment) css.textAlign = allStyles.alignment as string
  if (allStyles.fontWeight) css.fontWeight = allStyles.fontWeight as string
  if (allStyles.lineHeight) css.lineHeight = allStyles.lineHeight as string
  if (allStyles.letterSpacing) css.letterSpacing = `${allStyles.letterSpacing}px`

  // Border radius (direct, non-responsive for now)
  if (allStyles.borderRadius) css.borderRadius = `${allStyles.borderRadius}px`

  // Flexbox properties for layout blocks (non-responsive for now)
  if (allStyles.flexDirection) css.flexDirection = allStyles.flexDirection as string
  if (allStyles.justifyContent) css.justifyContent = allStyles.justifyContent as string
  if (allStyles.alignItems) css.alignItems = allStyles.alignItems as string
  if (allStyles.flexWrap) css.flexWrap = allStyles.flexWrap as string
  if (allStyles.gap) css.gap = `${allStyles.gap}px`

  // Grid properties (non-responsive for now)
  if (allStyles.justifyItems) css.justifyItems = allStyles.justifyItems as string

  return css
})

// Helper to get image-specific styles
function getImageStyles(): Record<string, string> {
  const styles = props.block.styles as Record<string, unknown>
  const css: Record<string, string> = {}
  if (styles?.objectFit) css.objectFit = styles.objectFit as string
  else css.objectFit = 'cover'
  if (styles?.borderRadius) css.borderRadius = `${styles.borderRadius}px`
  else css.borderRadius = '8px'
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
  if (styles?.borderRadius) css.borderRadius = `${styles.borderRadius}px`
  else css.borderRadius = '8px'
  return css
}

// Helper for button alignment
function getButtonAlignment(): string | undefined {
  const styles = props.block.styles as Record<string, unknown>
  return styles?.textAlign as string | undefined
}

function getButtonClasses(variant?: string, size?: string): string[] {
  const classes = ['inline-flex', 'items-center', 'gap-2', 'rounded-md', 'font-medium', 'transition-colors']

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
  <!-- Hide completely if isHidden is true for List/Collection items -->
  <section
    v-if="!isBlockHidden || !isInsideListCollection"
    ref="sectionRef"
    class="relative w-full cursor-pointer"
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
      class="absolute inset-0 border-1 border-primary rounded-lg pointer-events-none z-10"
    />

    <!-- Section label (on hover or selected) - draggable for repositioning -->
    <div
      v-if="isHovered || isSelected"
      :draggable="canDragBlock"
      class="flex items-center absolute top-0 left-0 px-1.5 h-4 text-[10px] font-mono uppercase rounded-br rounded-tl backdrop-blur-sm z-20"
      :class="[
        isSelected ? 'bg-primary/50 text-primary-foreground' : 'bg-primary/80 text-primary-foreground',
        canDragBlock || isInsideFreeform ? 'cursor-grab active:cursor-grabbing' : '',
        isFreeformDragging ? 'cursor-grabbing' : ''
      ]"
      @dragstart="handleBlockDragStart"
      @dragend="handleBlockDragEnd"
      @mousedown="isInsideFreeform ? handleFreeformDragStart($event) : undefined"
    >
      <i v-if="canDragBlock || isInsideFreeform" class="lni lni-menu-hamburger-1 mr-1 text-[8px] opacity-70"></i>
      {{ block.name }}
    </div>

    <!-- ============================================ -->
    <!-- HEADER BLOCK -->
    <!-- ============================================ -->
    <div v-if="block.type === 'header'" :style="blockStyles">
      <div v-if="!headerSettings?.isHidden" class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <img v-if="headerSettings?.logo" :src="headerSettings.logo" :alt="headerSettings.logoAlt || 'Logo'" class="h-8 w-auto object-contain" />
          <span v-else class="text-lg font-semibold">Logo</span>
        </div>
        <nav class="flex items-center gap-6">
          <a v-for="link in headerSettings?.navLinks" :key="link.id" :href="link.url || '#'" class="text-sm font-medium hover:opacity-80 transition-opacity">{{ getDisplayNavLinkLabel(link.id) }}</a>
        </nav>
        <a v-if="headerSettings?.ctaButton?.show" :href="headerSettings.ctaButton.url || '#'" class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          {{ displayHeaderCtaLabel || 'Get Started' }}
        </a>
      </div>
      <div v-else class="py-4 text-center text-muted-foreground text-sm italic border-2 border-dashed border-border rounded-lg">
        Header is hidden
      </div>
    </div>

    <!-- ============================================ -->
    <!-- FOOTER BLOCK -->
    <!-- ============================================ -->
    <div v-else-if="block.type === 'footer'" :style="blockStyles">
      <div v-if="!footerSettings?.isHidden" class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <nav class="flex flex-wrap items-center gap-4">
            <a v-for="link in footerSettings?.links" :key="link.id" :href="link.url || '#'" class="text-sm hover:opacity-80 transition-opacity">{{ getDisplayFooterLinkLabel(link.id) }}</a>
          </nav>
          <div class="flex items-center gap-3">
            <a v-for="social in footerSettings?.socialLinks" :key="social.id" :href="social.url || '#'" class="text-muted-foreground hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">
              <i :class="['lni', socialPlatformIcons[social.platform], 'text-lg']"></i>
            </a>
          </div>
        </div>
        <p v-if="displayFooterCopyright" class="text-sm text-muted-foreground text-center">{{ displayFooterCopyright }}</p>
      </div>
      <div v-else class="py-4 text-center text-muted-foreground text-sm italic border-2 border-dashed border-border rounded-lg">
        Footer is hidden
      </div>
    </div>

    <!-- ============================================ -->
    <!-- CONTAINER BLOCK -->
    <!-- ============================================ -->
    <div
      v-else-if="block.type === 'container'"
      class="flex min-h-[80px] transition-colors"
      :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
      :style="{ ...blockStyles, maxWidth: containerSettings?.maxWidth ? `${containerSettings.maxWidth}px` : undefined, margin: '0 auto', minHeight: getHeightStyle(containerSettings?.height) }"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div v-if="block.children && block.children.length > 0" class="relative flex flex-col gap-4 w-full">
        <template v-for="(child, childIndex) in block.children" :key="child.id">
          <!-- Drop indicator before this child -->
          <div
            v-if="childDropIndex === childIndex"
            class="absolute left-0 right-0 h-1 bg-primary rounded-full z-10 -translate-y-2"
            :style="{ top: `${childIndex * 100 / block.children.length}%` }"
          />
          <div
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
      </div>
      <div
        v-else
        class="flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        @click.stop="openBlockPicker"
      >
        <i class="lni lni-add-1 text-2xl mb-2"></i>
        <span class="text-xs">Click to add block</span>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- GRID BLOCK -->
    <!-- ============================================ -->
    <div
      v-else-if="block.type === 'grid'"
      class="relative"
    >
      <!-- Grid container -->
      <div
        :data-block-id="block.id"
        class="grid min-h-[80px] transition-colors rounded-lg"
        :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
        :style="{ ...blockStyles, gridTemplateColumns, gap: `${gridSettings?.gap || 16}px`, minHeight: getHeightStyle(gridSettings?.height) }"
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
            v-for="i in (gridSettings?.columns || 2)"
            :key="i"
            class="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            @click.stop="openBlockPicker"
          >
            <i class="lni lni-add-1 text-xl mb-1"></i>
            <span class="text-xs">Add block</span>
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
      class="relative flex min-h-[80px] transition-colors rounded-lg"
      :class="isDropTarget ? 'ring-2 ring-primary ring-dashed bg-primary/5' : ''"
      :style="{ ...blockStyles, flexDirection: stackSettings?.direction === 'horizontal' ? 'row' : 'column', gap: `${stackSettings?.gap || 16}px`, minHeight: getHeightStyle(stackSettings?.height) }"
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
        class="flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        @click.stop="openBlockPicker"
      >
        <i class="lni lni-add-1 text-2xl mb-2"></i>
        <span class="text-xs">Click to add block</span>
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
      class="outline-none"
      :class="!blockStyles.fontSize ? {
        'text-6xl': headingSettings?.level === 'h1',
        'text-5xl': headingSettings?.level === 'h2',
        'text-4xl': headingSettings?.level === 'h3',
        'text-3xl': headingSettings?.level === 'h4',
        'text-2xl': headingSettings?.level === 'h5',
        'text-xl': headingSettings?.level === 'h6',
      } : {}"
      :style="blockStyles"
      contenteditable="true"
      @blur="handleHeadingEdit($event)"
      @keydown.enter.prevent="($event.target as HTMLElement).blur()"
    :key="`heading-${editorStore.currentLanguage || 'default'}`"
    >{{ displayHeadingContent || 'Heading' }}</component>

    <!-- ============================================ -->
    <!-- TEXT BLOCK -->
    <!-- ============================================ -->
    <div
      v-else-if="block.type === 'text'"
      :key="`text-${editorStore.currentLanguage || 'default'}`"
      class="prose prose-neutral max-w-none outline-none"
      :style="blockStyles"
      contenteditable="true"
      @blur="handleTextEdit($event)"
      v-html="displayTextContent || 'Enter your text here...'"
    ></div>

    <!-- ============================================ -->
    <!-- IMAGE BLOCK -->
    <!-- ============================================ -->
    <div v-else-if="block.type === 'image'" class="flex justify-center" :style="blockStyles">
      <img v-if="imageSettings?.src" :src="imageSettings.src" :alt="displayImageAlt || ''" class="max-w-full h-auto" :style="getImageStyles()" />
      <div v-else class="w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center">
        <i class="lni lni-photos text-4xl text-muted-foreground"></i>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- VIDEO BLOCK -->
    <!-- ============================================ -->
    <div v-else-if="block.type === 'video'" class="flex justify-center" :style="blockStyles">
      <video v-if="videoSettings?.src" :src="videoSettings.src" :autoplay="videoSettings.autoplay" :loop="videoSettings.loop" :muted="videoSettings.muted" :controls="videoSettings.controls" class="max-w-full" :style="getVideoStyles()"></video>
      <div v-else class="w-full h-48 bg-muted/50 rounded-lg flex items-center justify-center">
        <i class="lni lni-play text-4xl text-muted-foreground"></i>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- BUTTON BLOCK -->
    <!-- ============================================ -->
    <div v-else-if="block.type === 'button'" class="flex py-2" :class="{ 'justify-start': getButtonAlignment() === 'left', 'justify-center': !getButtonAlignment() || getButtonAlignment() === 'center', 'justify-end': getButtonAlignment() === 'right' }" :style="blockStyles">
      <span
        :key="`button-${editorStore.currentLanguage || 'default'}`"
        :class="[...getButtonClasses(buttonSettings?.variant, buttonSettings?.size), 'outline-none focus:ring-2 focus:ring-primary/20']"
        contenteditable="true"
        @blur="handleButtonEdit($event)"
        @keydown.enter.prevent="($event.target as HTMLElement).blur()"
        @click.stop
      >{{ displayButtonLabel || 'Click me' }}</span>
    </div>

    <!-- ============================================ -->
    <!-- ICON BLOCK -->
    <!-- ============================================ -->
    <div v-else-if="block.type === 'icon'" class="flex justify-center" :style="blockStyles">
      <i :class="['lni', iconSettings?.icon || 'lni-star-1']" :style="{ fontSize: `${iconSettings?.size || 24}px`, color: (block.styles as Record<string, unknown>)?.color as string || undefined }"></i>
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
    <div v-else-if="block.type === 'form-input'" class="flex flex-col gap-1.5" :style="blockStyles">
      <label v-if="formInputSettings?.label" class="text-sm font-medium">
        {{ formInputSettings.label }}
        <span v-if="formInputSettings?.required" class="text-destructive">*</span>
      </label>
      <input
        :type="formInputSettings?.inputType || 'text'"
        :placeholder="formInputSettings?.placeholder"
        :required="formInputSettings?.required"
        class="px-4 py-2 border border-input rounded-md bg-background"
      />
    </div>

    <!-- Form Textarea -->
    <div v-else-if="block.type === 'form-textarea'" class="flex flex-col gap-1.5" :style="blockStyles">
      <label v-if="formTextareaSettings?.label" class="text-sm font-medium">
        {{ formTextareaSettings.label }}
        <span v-if="formTextareaSettings?.required" class="text-destructive">*</span>
      </label>
      <textarea
        :placeholder="formTextareaSettings?.placeholder"
        :rows="formTextareaSettings?.rows || 4"
        :required="formTextareaSettings?.required"
        class="px-4 py-2 border border-input rounded-md bg-background resize-none"
      ></textarea>
    </div>

    <!-- Form Select (Dropdown) -->
    <div v-else-if="block.type === 'form-select'" class="flex flex-col gap-1.5" :style="blockStyles">
      <label v-if="formSelectSettings?.label" class="text-sm font-medium">
        {{ formSelectSettings.label }}
        <span v-if="formSelectSettings?.required" class="text-destructive">*</span>
      </label>
      <select :required="formSelectSettings?.required" class="px-4 py-2 border border-input rounded-md bg-background">
        <option v-if="formSelectSettings?.placeholder" value="" disabled selected>{{ formSelectSettings.placeholder }}</option>
        <option v-for="option in formSelectSettings?.options || []" :key="option.id" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- Form Radio -->
    <div v-else-if="block.type === 'form-radio'" class="flex flex-col gap-1.5" :style="blockStyles">
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
    <div v-else-if="block.type === 'form-checkbox'" class="flex flex-col gap-1.5" :style="blockStyles">
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
    <div v-else-if="block.type === 'form-button'" :style="blockStyles">
      <button
        type="submit"
        :class="[
          'px-6 py-2 font-medium rounded-md transition-colors',
          formButtonSettings?.size === 'sm' ? 'text-sm px-4 py-1.5' : formButtonSettings?.size === 'lg' ? 'text-lg px-8 py-3' : 'text-base',
          formButtonSettings?.variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' :
          formButtonSettings?.variant === 'outline' ? 'border border-input bg-transparent hover:bg-accent' :
          'bg-primary text-primary-foreground hover:bg-primary/90',
          formButtonSettings?.fullWidth ? 'w-full' : ''
        ]"
      >
        {{ formButtonSettings?.label || 'Submit' }}
      </button>
    </div>

    <!-- ============================================ -->
    <!-- FREEFORM BLOCK -->
    <!-- ============================================ -->
    <div
      v-else-if="block.type === 'freeform'"
      :data-block-id="block.id"
      class="relative overflow-hidden transition-colors"
      :class="isDropTarget ? 'ring-2 ring-primary ring-dashed' : ''"
      :style="{
        ...blockStyles,
        minHeight: freeformSettings?.minHeight || '600px',
        backgroundImage: freeformSettings?.backgroundType === 'image' && freeformSettings?.backgroundImage ? `url(${freeformSettings.backgroundImage})` : undefined,
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
        v-if="freeformSettings?.backgroundType === 'video' && freeformSettings?.backgroundVideo"
        class="absolute inset-0 w-full h-full object-cover"
        :src="freeformSettings.backgroundVideo"
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
            left: `${getFreeformChildPos(child.id).x}%`,
            top: `${getFreeformChildPos(child.id).y}%`,
            width: getFreeformChildPos(child.id).width ? `${getFreeformChildPos(child.id).width}%` : 'auto',
            zIndex: getFreeformChildPos(child.id).zIndex || childIndex + 1,
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
        class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg m-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        @click.stop="openBlockPicker"
      >
        <i class="lni lni-add-1 text-3xl mb-2"></i>
        <span class="text-sm">Drag elements here to position freely</span>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- FALLBACK / PLACEHOLDER -->
    <!-- ============================================ -->
    <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
      <i :class="['lni', sectionBlockIcons[block.type], 'text-3xl mb-2']"></i>
      <span class="text-sm font-medium">{{ sectionBlockLabels[block.type] }}</span>
    </div>

    <!-- Context Menu -->
    <ContextMenu ref="contextMenuRef">
      <!-- Add content option for layout blocks -->
      <template v-if="isLayoutBlock">
        <ContextMenuItem icon="lni-plus" @click="openBlockPicker">
          Add content
        </ContextMenuItem>
        <ContextMenuDivider />
      </template>
      <ContextMenuItem icon="lni-pencil-1" @click="handleEditStyle">
        Edit style
      </ContextMenuItem>
      <ContextMenuDivider />
      <ContextMenuItem icon="lni-brush-2" @click="handleCopyStyle">
        Copy style
      </ContextMenuItem>
      <ContextMenuItem
        icon="lni-brush-2"
        :disabled="!editorStore.hasClipboardStyles"
        @click="handlePasteStyle"
      >
        Paste style
      </ContextMenuItem>
      <ContextMenuDivider />
      <ContextMenuItem
        icon="lni-slice-2"
        shortcut="⌘X"
        :disabled="isProtectedBlock"
        @click="handleCut"
      >
        Cut
      </ContextMenuItem>
      <ContextMenuItem
        icon="lni-file-multiple"
        shortcut="⌘C"
        :disabled="isProtectedBlock"
        @click="handleCopy"
      >
        Copy
      </ContextMenuItem>
      <ContextMenuItem
        icon="lni-clipboard"
        shortcut="⌘V"
        :disabled="!editorStore.hasClipboardBlock"
        @click="handlePaste"
      >
        Paste
      </ContextMenuItem>
      <ContextMenuItem
        icon="lni-layers-1"
        shortcut="⌘D"
        :disabled="isProtectedBlock"
        @click="handleDuplicate"
      >
        Duplicate
      </ContextMenuItem>
      <ContextMenuItem
        icon="lni-trash-3"
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
  </section>
</template>
