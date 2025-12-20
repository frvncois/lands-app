import { ref, computed, readonly, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useDesignerStore } from '@/stores/designer'
import { useProjectStore } from '@/stores/project'
import { useToast } from '@/stores/toast'
import { executeAction, executeActions, describeAction, type AIAction } from '@/lib/aiActions'
import { analyzeProjectContext, formatContextForAI, generateStyleInstructions } from '@/lib/aiContextAnalyzer'
import { buildAIContext, getCompactSchema, getAllExamplesForPrompt } from '@/lib/ai'
import type { SectionBlock } from '@/types/designer'

// ============================================
// TYPES
// ============================================

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: AIAction[]
  actionsExecuted?: boolean
  timestamp: Date
}

interface UsageInfo {
  used: number
  limit: number
}

// ============================================
// SINGLETON STATE (per-project)
// ============================================

const messages = ref<Message[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const isOpen = ref(false)
const usage = ref<UsageInfo | null>(null)
const pendingActions = ref<AIAction[]>([])
const currentProjectId = ref<string | null>(null)

/**
 * Reset all AI assistant state - called when project changes
 */
function resetState() {
  messages.value = []
  isLoading.value = false
  error.value = null
  isOpen.value = false
  usage.value = null
  pendingActions.value = []
}

// ============================================
// COMPOSABLE
// ============================================

export function useAIAssistant() {
  const designerStore = useDesignerStore()
  const projectStore = useProjectStore()
  const toast = useToast()
  const route = useRoute()

  // Computed
  const canSendMessage = computed(() => {
    if (isLoading.value) return false
    if (usage.value && usage.value.used >= usage.value.limit) return false
    return true
  })

  const remainingMessages = computed(() => {
    if (!usage.value) return null
    return Math.max(0, usage.value.limit - usage.value.used)
  })

  const hasPendingActions = computed(() => pendingActions.value.length > 0)

  // ============================================
  // PROJECT CHANGE DETECTION
  // ============================================

  // Watch for project changes and reset state
  watch(
    () => designerStore.currentProjectId,
    (newProjectId, oldProjectId) => {
      if (newProjectId !== oldProjectId && oldProjectId !== null) {
        console.log('[AI Assistant] Project changed, resetting state')
        resetState()
      }
      currentProjectId.value = newProjectId
    },
    { immediate: true }
  )

  // Watch for route changes - close assistant when leaving editor
  watch(
    () => route.path,
    (newPath) => {
      // Close assistant if navigating away from the editor
      if (!newPath.includes('/editor/')) {
        console.log('[AI Assistant] Left editor route, closing assistant')
        isOpen.value = false
      }
    }
  )

  // ============================================
  // CONTEXT BUILDERS
  // ============================================

  /**
   * Summarize blocks into a readable tree structure with content
   */
  function summarizeBlocks(blocks: SectionBlock[], depth = 0, maxDepth = 4): string {
    if (!Array.isArray(blocks) || blocks.length === 0 || depth > maxDepth) return ''

    const indent = '  '.repeat(depth)
    return blocks.map((block) => {
      const type = block.type
      const name = block.name !== type ? ` "${block.name}"` : ''
      const childCount = block.children?.length || 0

      // Include content preview for text blocks
      const settings = block.settings as Record<string, unknown>
      let contentPreview = ''
      if (settings.content) {
        const content = String(settings.content)
        contentPreview = ` → "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`
      } else if (settings.label) {
        contentPreview = ` → "${settings.label}"`
      } else if (settings.src) {
        contentPreview = ` → [image]`
      }

      let line = `${indent}- [${block.id.slice(0, 8)}] ${type}${name}${contentPreview}`

      if (childCount > 0 && depth < maxDepth) {
        line += `\n${summarizeBlocks(block.children!, depth + 1, maxDepth)}`
      } else if (childCount > 0) {
        line += ` (${childCount} children)`
      }

      return line
    }).join('\n')
  }

  /**
   * Get detailed info about selected block including full children tree
   */
  function getSelectedBlockInfo(): Record<string, unknown> | null {
    const block = designerStore.selectedBlock
    if (!block) return null

    // Recursively get block details including children
    function getBlockDetails(b: SectionBlock): Record<string, unknown> {
      const details: Record<string, unknown> = {
        id: b.id,
        type: b.type,
        name: b.name,
        settings: b.settings,
        styles: b.styles,
      }

      if (b.children?.length) {
        details.children = b.children.map(getBlockDetails)
      }

      return details
    }

    return getBlockDetails(block)
  }

  /**
   * Build comprehensive context for AI
   * This is the key function that makes the AI context-aware
   */
  function buildContext(message: string, includeFullAnalysis = false) {
    const context: Record<string, unknown> = {}

    // *** Intent-based context - keep minimal to avoid token limits ***
    const aiContext = buildAIContext(message)
    console.log('[AI Assistant] Detected intent:', aiContext.intent.category, 'confidence:', aiContext.intent.confidence)

    // Only include the most relevant example (compact JSON, no formatting)
    const bestExample = aiContext.intent.examples[0]
    if (bestExample) {
      context.exampleTemplate = JSON.stringify({ message: `Created ${bestExample.name}`, actions: bestExample.actions })
    }

    // Always include page settings
    const ps = designerStore.pageSettings
    context.pageSettings = {
      fontFamily: ps.fontFamily,
      backgroundColor: ps.backgroundColor,
      textColor: ps.textColor,
      primaryColor: ps.primaryColor,
      secondaryColor: ps.secondaryColor,
      accentColor: ps.accentColor,
    }

    // SEO settings from project store
    if (projectStore.settings?.seo) {
      context.seoSettings = projectStore.settings.seo
    }

    // Block structure (always include)
    if (designerStore.blocks.length > 0) {
      context.blockStructure = summarizeBlocks(designerStore.blocks)
    }

    // Selected block (detailed)
    const selectedInfo = getSelectedBlockInfo()
    if (selectedInfo) {
      context.selectedBlock = selectedInfo
    }

    // *** KEY: Analyze project patterns ***
    // This extracts branding, styles, patterns from existing content
    if (designerStore.blocks.length > 0) {
      const projectContext = analyzeProjectContext(
        designerStore.blocks,
        designerStore.pageSettings,
        projectStore.settings?.seo
      )

      // Format as readable context for AI
      context.projectAnalysis = formatContextForAI(projectContext)

      // Generate strict style instructions
      context.styleInstructions = generateStyleInstructions(projectContext)

      // Include raw data for complex analysis
      if (includeFullAnalysis) {
        context.projectContextRaw = projectContext
      }
    }

    return context
  }

  /**
   * Simplify blocks for translation context
   */
  function simplifyBlocksForTranslation(blocks: SectionBlock[]): Record<string, unknown>[] {
    const result: Record<string, unknown>[] = []

    function processBlock(block: SectionBlock) {
      const settings = block.settings as Record<string, unknown>

      // Only include blocks with translatable content
      if (settings.content || settings.label) {
        result.push({
          id: block.id,
          type: block.type,
          name: block.name,
          content: settings.content,
          label: settings.label,
        })
      }

      if (block.children?.length) {
        block.children.forEach(processBlock)
      }
    }

    blocks.forEach(processBlock)
    return result
  }

  // ============================================
  // MESSAGE HANDLING
  // ============================================

  async function sendMessage(content: string): Promise<void> {
    if (!content.trim() || isLoading.value) return

    if (usage.value && usage.value.used >= usage.value.limit) {
      error.value = `Daily limit reached (${usage.value.limit} messages). Upgrade for more!`
      return
    }

    // Determine what kind of context we need
    const lowerContent = content.toLowerCase()
    const needsFullAnalysis =
      lowerContent.includes('analyze') ||
      lowerContent.includes('seo') ||
      lowerContent.includes('review') ||
      lowerContent.includes('improve') ||
      lowerContent.includes('suggest')

    const needsTranslationContext = lowerContent.includes('translate')

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }
    messages.value.push(userMessage)

    isLoading.value = true
    error.value = null
    pendingActions.value = []

    try {
      const history = messages.value
        .slice(-9, -1)
        .filter(m => !m.actions || m.actions.length === 0)
        .map(m => ({ role: m.role, content: m.content }))

      const projectId = designerStore.currentProjectId
      const context = buildContext(content, needsFullAnalysis)

      if (needsTranslationContext && designerStore.blocks.length > 0) {
        context.translatableContent = simplifyBlocksForTranslation(designerStore.blocks)
      }

      const { data, error: fnError } = await supabase.functions.invoke('ai-assistant', {
        body: { message: content, projectId, context, history },
      })

      if (fnError) throw fnError

      if (data.error) {
        if (data.error === 'Daily limit reached') {
          usage.value = { used: data.used, limit: data.limit }
        }
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        actions: data.actions || [],
        actionsExecuted: false,
        timestamp: new Date(),
      }
      messages.value.push(assistantMessage)

      if (data.usage) {
        usage.value = data.usage
      }

      if (data.actions && data.actions.length > 0) {
        console.log('[AI Assistant] Received actions:', JSON.stringify(data.actions, null, 2))
        pendingActions.value = data.actions
      } else {
        console.log('[AI Assistant] No actions in response')
      }

    } catch (e: unknown) {
      console.error('AI error:', e)
      const errorMessage = e instanceof Error ? e.message : 'Failed to get response'
      error.value = errorMessage
      messages.value.pop()
      toast.error('AI Error', errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  function applyActions(): void {
    if (pendingActions.value.length === 0) return

    console.log('[AI Assistant] Applying actions:', JSON.stringify(pendingActions.value, null, 2))
    const results = executeActions(pendingActions.value)
    console.log('[AI Assistant] Action results:', results)
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    if (successCount > 0) {
      toast.success('Actions Applied', `${successCount} action${successCount > 1 ? 's' : ''} completed`)
    }

    if (failCount > 0) {
      toast.error('Some actions failed', results.filter(r => !r.success).map(r => r.message).join(', '))
    }

    const lastAssistantMessage = [...messages.value].reverse().find(m => m.role === 'assistant')
    if (lastAssistantMessage) {
      lastAssistantMessage.actionsExecuted = true
    }

    pendingActions.value = []
  }

  function applySingleAction(action: AIAction): void {
    const result = executeAction(action)

    if (result.success) {
      toast.success('Action Applied', result.message)
      const index = pendingActions.value.indexOf(action)
      if (index > -1) {
        pendingActions.value.splice(index, 1)
      }
    } else {
      toast.error('Action Failed', result.message)
    }
  }

  function dismissActions(): void {
    pendingActions.value = []
  }

  function clearMessages(): void {
    messages.value = []
    error.value = null
    pendingActions.value = []
  }

  // Panel controls
  function toggle(): void { isOpen.value = !isOpen.value }
  function open(): void { isOpen.value = true }
  function close(): void { isOpen.value = false }

  // Quick actions
  async function analyzeSEO(): Promise<void> {
    await sendMessage('Analyze my page SEO and provide specific suggestions for improvement.')
  }

  async function improveSelectedContent(): Promise<void> {
    if (!designerStore.selectedBlock) {
      toast.error('No block selected', 'Please select a block first')
      return
    }
    await sendMessage('Improve the content of the selected block. Keep the same tone and style as the rest of the page.')
  }

  async function translatePage(language: string): Promise<void> {
    await sendMessage(`Translate all text content on my page to ${language}. Maintain the same tone and style.`)
  }

  async function suggestDesign(): Promise<void> {
    await sendMessage('Analyze my page design and suggest specific improvements for visual appeal and conversion.')
  }

  async function buildSection(description: string): Promise<void> {
    await sendMessage(`Build me a ${description}. Match the existing style, colors, typography, and spacing of my page exactly.`)
  }

  return {
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isOpen,
    usage: readonly(usage),
    pendingActions: readonly(pendingActions),
    canSendMessage,
    remainingMessages,
    hasPendingActions,
    sendMessage,
    clearMessages,
    applyActions,
    applySingleAction,
    dismissActions,
    toggle,
    open,
    close,
    analyzeSEO,
    improveSelectedContent,
    translatePage,
    suggestDesign,
    buildSection,
    describeAction,
  }
}
