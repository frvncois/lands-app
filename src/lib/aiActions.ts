import { useEditorStore } from '@/stores/editor'
import { generateId, getDefaultSettings, getDefaultStyles, canHaveChildren } from '@/lib/editor-utils'
import type { SectionBlock, SectionBlockType } from '@/types/editor'

// Types
export interface CreateSectionAction {
  type: 'create_section'
  section: {
    name: string
    container: { settings: Record<string, unknown>; styles: Record<string, unknown> }
    children: Array<{
      type: SectionBlockType
      name: string
      settings: Record<string, unknown>
      styles: Record<string, unknown>
      children?: Array<{ type: SectionBlockType; name: string; settings: Record<string, unknown>; styles: Record<string, unknown> }>
    }>
  }
}

export interface UpdateBlockAction {
  type: 'update_block'
  blockId: string
  settings?: Record<string, unknown>
  styles?: Record<string, unknown>
}

export interface UpdatePageSettingsAction {
  type: 'update_page_settings'
  settings: Record<string, unknown>
}

export interface AddAnimationAction {
  type: 'add_animation'
  blockId: string
  animation: { type: string; duration: number; delay: number; easing: string }
}

export interface TranslateBlockAction {
  type: 'translate_block'
  blockId: string
  language: string
  translations: Record<string, string>
}

export interface SeoSuggestionAction {
  type: 'seo_suggestion'
  suggestions: Array<{ issue: string; fix: string; priority: 'high' | 'medium' | 'low' }>
}

export interface AddChildrenAction {
  type: 'add_children'
  blockId: string // Parent container ID, or "selected" for selected block
  children: Array<{
    type: SectionBlockType
    name: string
    settings: Record<string, unknown>
    styles: Record<string, unknown>
    children?: Array<{
      type: SectionBlockType
      name: string
      settings: Record<string, unknown>
      styles: Record<string, unknown>
      children?: Array<{ type: SectionBlockType; name: string; settings: Record<string, unknown>; styles: Record<string, unknown> }>
    }>
  }>
}

export interface DuplicateBlockAction {
  type: 'duplicate_block'
  blockId: string // Block to duplicate, or "selected"
  count: number // How many copies to make
  updateSettings?: Array<Record<string, unknown>> // Settings to apply to each copy's root
  childUpdates?: Array<Array<{ path: number[]; settings: Record<string, unknown> }>> // Updates for nested children per copy
}

export type AIAction =
  | CreateSectionAction
  | UpdateBlockAction
  | UpdatePageSettingsAction
  | AddAnimationAction
  | TranslateBlockAction
  | SeoSuggestionAction
  | AddChildrenAction
  | DuplicateBlockAction

export interface ActionResult {
  success: boolean
  message: string
  blockId?: string
}

export function executeAction(action: AIAction): ActionResult {
  const editorStore = useEditorStore()

  try {
    switch (action.type) {
      case 'create_section':
        return executeCreateSection(action, editorStore)
      case 'update_block':
        return executeUpdateBlock(action, editorStore)
      case 'update_page_settings':
        editorStore.updatePageSettings(action.settings)
        return { success: true, message: 'Updated page settings' }
      case 'add_animation':
        return executeAddAnimation(action, editorStore)
      case 'translate_block':
        return executeTranslateBlock(action, editorStore)
      case 'seo_suggestion':
        return { success: true, message: 'SEO suggestions provided' }
      case 'add_children':
        return executeAddChildren(action, editorStore)
      case 'duplicate_block':
        return executeDuplicateBlock(action, editorStore)
      default:
        return { success: false, message: 'Unknown action type' }
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed' }
  }
}

export function executeActions(actions: AIAction[]): ActionResult[] {
  return actions.map(executeAction)
}

function executeCreateSection(action: CreateSectionAction, editorStore: ReturnType<typeof useEditorStore>): ActionResult {
  const { section } = action

  const containerBlock: SectionBlock = {
    id: generateId(),
    type: 'container',
    name: section.name || 'AI Section',
    settings: { direction: 'vertical', align: 'center', justify: 'flex-start', gap: '24', ...section.container.settings } as SectionBlock['settings'],
    styles: { padding: { top: '64', bottom: '64', left: '24', right: '24' }, ...section.container.styles } as SectionBlock['styles'],
    children: section.children?.map(buildBlockFromAI) || [],
  }

  editorStore.addPresetBlock(containerBlock)
  return { success: true, message: `Created "${section.name}"`, blockId: containerBlock.id }
}

function buildBlockFromAI(blockDef: { type: SectionBlockType; name: string; settings: Record<string, unknown>; styles: Record<string, unknown>; children?: Array<{ type: SectionBlockType; name: string; settings: Record<string, unknown>; styles: Record<string, unknown> }> }): SectionBlock {
  // Get defaults for this block type
  const defaultSettings = getDefaultSettings(blockDef.type)
  const defaultStyles = getDefaultStyles(blockDef.type)

  // Deep merge AI values with defaults (AI values override defaults)
  const mergedSettings = deepMerge(defaultSettings as Record<string, unknown>, blockDef.settings || {})
  const mergedStyles = deepMerge(defaultStyles as Record<string, unknown>, blockDef.styles || {})

  const block: SectionBlock = {
    id: generateId(),
    type: blockDef.type,
    name: blockDef.name || blockDef.type,
    settings: mergedSettings as SectionBlock['settings'],
    styles: mergedStyles as SectionBlock['styles'],
    children: canHaveChildren(blockDef.type) ? [] : undefined,
  }

  if (blockDef.children?.length) {
    block.children = blockDef.children.map(buildBlockFromAI)
  }

  return block
}

/**
 * Deep merge two objects - source values override target
 */
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target }

  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (sourceValue !== null && sourceValue !== undefined) {
      if (
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue) &&
        targetValue !== null
      ) {
        // Recursively merge nested objects
        result[key] = deepMerge(targetValue as Record<string, unknown>, sourceValue as Record<string, unknown>)
      } else {
        // Override with source value
        result[key] = sourceValue
      }
    }
  }

  return result
}

function executeUpdateBlock(action: UpdateBlockAction, editorStore: ReturnType<typeof useEditorStore>): ActionResult {
  const targetId = action.blockId === 'selected' ? editorStore.selectedBlockId : action.blockId
  if (!targetId) return { success: false, message: 'No block selected' }

  const block = editorStore.findBlockById(targetId)
  if (!block) return { success: false, message: 'Block not found' }

  editorStore.selectBlock(targetId)
  if (action.settings) editorStore.updateBlockSettings(targetId, action.settings)
  if (action.styles) editorStore.updateBlockStyles(targetId, action.styles)

  return { success: true, message: `Updated "${block.name}"`, blockId: targetId }
}

function executeAddAnimation(action: AddAnimationAction, editorStore: ReturnType<typeof useEditorStore>): ActionResult {
  const targetId = action.blockId === 'selected' ? editorStore.selectedBlockId : action.blockId
  if (!targetId) return { success: false, message: 'No block selected' }

  const block = editorStore.findBlockById(targetId)
  if (!block) return { success: false, message: 'Block not found' }

  editorStore.selectBlock(targetId)
  editorStore.updateBlockStyles(targetId, {
    animation: { type: action.animation.type, duration: action.animation.duration, delay: action.animation.delay, easing: action.animation.easing, trigger: 'onLoad' }
  })
  editorStore.triggerAnimationPreview(targetId)

  return { success: true, message: `Added ${action.animation.type} animation`, blockId: targetId }
}

function executeTranslateBlock(action: TranslateBlockAction, editorStore: ReturnType<typeof useEditorStore>): ActionResult {
  const targetId = action.blockId === 'selected' ? editorStore.selectedBlockId : action.blockId
  if (!targetId) return { success: false, message: 'No block selected' }

  // Save current language and switch to target language
  const previousLanguage = editorStore.currentLanguage
  editorStore.setCurrentLanguage(action.language as import('@/types/editor').LanguageCode)

  // Apply translations
  for (const [field, value] of Object.entries(action.translations)) {
    editorStore.updateBlockTranslation(targetId, field as 'content' | 'label' | 'alt' | 'placeholder', value)
  }

  // Restore previous language
  editorStore.setCurrentLanguage(previousLanguage)

  return { success: true, message: `Translated to ${action.language}`, blockId: targetId }
}

function executeAddChildren(action: AddChildrenAction, editorStore: ReturnType<typeof useEditorStore>): ActionResult {
  console.log('[AI Actions] executeAddChildren called with:', { blockId: action.blockId, childrenCount: action.children?.length })

  const targetId = action.blockId === 'selected' ? editorStore.selectedBlockId : action.blockId
  console.log('[AI Actions] Target ID resolved to:', targetId)

  if (!targetId) return { success: false, message: 'No block selected' }

  const parentBlock = editorStore.findBlockById(targetId)
  console.log('[AI Actions] Parent block found:', parentBlock?.type, parentBlock?.name)

  if (!parentBlock) return { success: false, message: 'Parent block not found' }

  // Check if parent can have children
  if (!['container', 'stack', 'grid', 'canvas'].includes(parentBlock.type)) {
    return { success: false, message: 'Block cannot have children' }
  }

  // Build and add each child
  const newChildren = action.children.map(buildBlockFromAI)
  console.log('[AI Actions] Built children:', newChildren.map(c => ({ id: c.id, type: c.type, name: c.name })))

  for (const child of newChildren) {
    console.log('[AI Actions] Adding child to parent:', child.id, '->', targetId)
    editorStore.addPresetBlock(child, undefined, targetId)
  }

  return { success: true, message: `Added ${newChildren.length} item${newChildren.length > 1 ? 's' : ''}`, blockId: targetId }
}

function executeDuplicateBlock(action: DuplicateBlockAction, editorStore: ReturnType<typeof useEditorStore>): ActionResult {
  const targetId = action.blockId === 'selected' ? editorStore.selectedBlockId : action.blockId
  if (!targetId) return { success: false, message: 'No block selected' }

  const block = editorStore.findBlockById(targetId)
  if (!block) return { success: false, message: 'Block not found' }

  const count = Math.min(action.count || 1, 10) // Limit to 10 copies
  const createdIds: string[] = []

  for (let i = 0; i < count; i++) {
    // Duplicate the block - returns the new block, not ID
    const newBlock = editorStore.duplicateBlock(targetId)
    if (newBlock) {
      createdIds.push(newBlock.id)

      // Apply custom settings to root if provided
      const settings = action.updateSettings?.[i]
      if (settings) {
        editorStore.updateBlockSettings(newBlock.id, settings)
      }

      // Apply nested child updates if provided
      const childUpdatesForCopy = action.childUpdates?.[i]
      if (childUpdatesForCopy) {
        for (const update of childUpdatesForCopy) {
          const childBlock = getBlockByPath(newBlock, update.path)
          if (childBlock) {
            editorStore.updateBlockSettings(childBlock.id, update.settings)
          }
        }
      }
    }
  }

  return {
    success: createdIds.length > 0,
    message: `Created ${createdIds.length} cop${createdIds.length === 1 ? 'y' : 'ies'}`,
    blockId: createdIds[0]
  }
}

/**
 * Get a nested block by path (array of child indices)
 * e.g., [0, 1] means first child's second child
 */
function getBlockByPath(block: SectionBlock, path: number[]): SectionBlock | null {
  let current: SectionBlock = block
  for (const index of path) {
    if (!current.children || !current.children[index]) {
      return null
    }
    current = current.children[index]
  }
  return current
}

export function describeAction(action: AIAction): string {
  switch (action.type) {
    case 'create_section': return `Create "${action.section.name}"`
    case 'update_block': return 'Update block'
    case 'update_page_settings': return 'Update page settings'
    case 'add_animation': return `Add ${action.animation.type} animation`
    case 'translate_block': return `Translate to ${action.language}`
    case 'seo_suggestion': return `${action.suggestions.length} SEO suggestions`
    case 'add_children': return `Add ${action.children.length} item${action.children.length > 1 ? 's' : ''}`
    case 'duplicate_block': return `Duplicate ${action.count} time${action.count > 1 ? 's' : ''}`
    default: return 'Unknown action'
  }
}

export function isDisplayOnlyAction(action: AIAction): boolean {
  return action.type === 'seo_suggestion'
}

export function getActionIcon(action: AIAction): string {
  const icons: Record<string, string> = {
    create_section: 'plus',
    update_block: 'edit',
    update_page_settings: 'app-settings',
    add_animation: 'sparkles',
    translate_block: 'globe-1',
    seo_suggestion: 'search-1',
    add_children: 'list',
    duplicate_block: 'copy',
  }
  return icons[action.type] || 'circle'
}

export function getActionColor(action: AIAction): string {
  const colors: Record<string, string> = {
    create_section: 'text-green-600',
    update_block: 'text-blue-600',
    update_page_settings: 'text-purple-600',
    add_animation: 'text-amber-600',
    translate_block: 'text-cyan-600',
    seo_suggestion: 'text-orange-600',
    add_children: 'text-teal-600',
    duplicate_block: 'text-indigo-600',
  }
  return colors[action.type] || 'text-gray-600'
}
