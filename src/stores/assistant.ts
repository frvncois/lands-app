import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Router } from 'vue-router'
import type { FlowId } from '@/lib/assistant/types'
import { MAIN_MENU_OPTIONS, PROJECT_CONTEXT_OPTIONS } from '@/lib/assistant/flows'
import { PROJECT_CATEGORIES } from '@/lib/assistant/categories'
import { createProjectFromAssistant } from '@/lib/assistant/actions'
import { useProjectsStore } from '@/stores/projects'
import { buildAIContext } from '@/lib/assistant/context-builder'
import { sendProjectEditMessage } from '@/lib/assistant/api'
import { executeActions } from '@/lib/assistant/action-executor'
import type { ChatMessage } from '@/lib/assistant/action-types'

export interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: number
  options?: { id: string; label: string; icon?: string }[]
  component?: 'theme-picker' | 'project-list' | null
  isTyping?: boolean
}

const STORAGE_KEY = 'lands-assistant-seen'

function loadHasSeenAssistant(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  } catch (e) {
    console.error('Failed to load assistant state:', e)
    return false
  }
}

function saveHasSeenAssistant(hasSeen: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, hasSeen.toString())
  } catch (e) {
    console.error('Failed to save assistant state:', e)
  }
}

export const useAssistantStore = defineStore('assistant', () => {
  const router = useRouter()
  const projectsStore = useProjectsStore()

  // Non-persisted state
  const isOpen = ref(false)
  const isMinimized = ref(false)
  const routeContext = ref<'dashboard' | 'project' | 'account'>('dashboard')
  const currentProjectId = ref<string | null>(null)
  const flowStep = ref(0)
  const isProcessing = ref(false)
  const chatMode = ref<'flow' | 'chat'>('flow')
  const chatHistory = ref<ChatMessage[]>([])
  const isAIProcessing = ref(false)
  const prefillInput = ref('')

  // Computed
  const currentProject = computed(() => {
    if (!currentProjectId.value) return null
    return projectsStore.getProjectById(currentProjectId.value)
  })

  // Persisted state (only hasSeenAssistant)
  const hasSeenAssistant = ref<boolean>(loadHasSeenAssistant())

  // Non-persisted conversation state (always starts fresh)
  const messages = ref<Message[]>([])
  const currentFlow = ref<string | null>(null)
  const flowData = ref<Record<string, unknown>>({})

  // Watch for changes to hasSeenAssistant
  watch(hasSeenAssistant, (value) => {
    saveHasSeenAssistant(value)
  })

  // Helper to simulate typing delay
  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Helper to get random typing delay
  function getTypingDelay() {
    return 500 + Math.random() * 300 // 500-800ms
  }

  // Actions
  function open() {
    console.log('[ASSISTANT] open() called')
    isOpen.value = true
    isMinimized.value = false
    // Reset processing states when opening
    isProcessing.value = false
    isAIProcessing.value = false

    // Clear all conversation state - fresh start every time
    messages.value = []
    chatHistory.value = []
    currentFlow.value = null
    flowData.value = {}
    flowStep.value = 0

    console.log('[ASSISTANT] About to call initializeAssistant()')
    initializeAssistant()
  }

  function close() {
    isOpen.value = false
    // Reset processing states when closing
    isProcessing.value = false
    isAIProcessing.value = false
  }

  function minimize() {
    isMinimized.value = true
  }

  function toggleOpen() {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  function reset() {
    messages.value = []
    currentFlow.value = null
    flowData.value = {}
    flowStep.value = 0
    chatHistory.value = []
    isProcessing.value = false
    isAIProcessing.value = false
  }

  function startOver() {
    reset()
    initializeAssistant()
  }

  function goBack() {
    // Can't go back if at step 0 or no flow
    if (!currentFlow.value || flowStep.value <= 0) return

    // Remove last two messages (last user message and last assistant message)
    if (messages.value.length >= 2) {
      messages.value = messages.value.slice(0, -2)
    } else if (messages.value.length === 1) {
      messages.value = []
    }

    // Decrement step
    flowStep.value--

    // Re-process previous step
    processCurrentStep()
  }

  function addMessage(message: Omit<Message, 'id' | 'timestamp'>) {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const timestamp = Date.now()
    messages.value.push({
      ...message,
      id,
      timestamp
    })
  }

  function updateRouteContext(routeName: string, projectId?: string) {
    // Determine context based on route name
    if (routeName === 'dashboard') {
      routeContext.value = 'dashboard'
    } else if (routeName === 'account' || routeName === 'support') {
      routeContext.value = 'account'
    } else if (routeName === 'designer' || routeName === 'settings' || routeName === 'analytics') {
      routeContext.value = 'project'
    }

    currentProjectId.value = projectId || null
  }

  function checkFirstVisit(): boolean {
    if (!hasSeenAssistant.value) {
      hasSeenAssistant.value = true
      isOpen.value = true
      initializeAssistant()
      return true
    }
    return false
  }

  function initializeAssistant() {
    console.log('[ASSISTANT] initializeAssistant called', {
      currentProjectId: currentProjectId.value,
      routeContext: routeContext.value,
      currentProject: currentProject.value,
      messagesLength: messages.value.length
    })

    // ALWAYS use chat mode - simple chat interface
    chatMode.value = 'chat'

    // Show context-aware welcome message
    let welcomeMessage = 'Hi! I can help you create and edit your landing pages. What would you like to do?'

    if (currentProjectId.value && routeContext.value === 'project' && currentProject.value) {
      console.log('[ASSISTANT] Adding project-specific welcome')
      welcomeMessage = `Working on ${currentProject.value.title}. I can help you edit your page - just ask!`
    } else {
      console.log('[ASSISTANT] Adding generic welcome')
    }

    addMessage({
      role: 'assistant',
      content: welcomeMessage,
    })

    console.log('[ASSISTANT] After addMessage, messagesLength:', messages.value.length)

    // Fallback: if messages still empty after 100ms, add a simple message
    setTimeout(() => {
      if (messages.value.length === 0) {
        console.error('[ASSISTANT] Messages still empty after init, adding fallback')
        messages.value.push({
          id: `${Date.now()}-fallback`,
          role: 'assistant',
          content: 'Hi! How can I help you today?',
          timestamp: Date.now()
        })
      }
    }, 100)
  }

  function startFlow(flowId: FlowId) {
    currentFlow.value = flowId
    flowStep.value = 0
    flowData.value = {}
    processCurrentStep()
  }

  function selectOption(optionId: string) {
    // Find the option label from current message
    const lastMessage = messages.value[messages.value.length - 1]
    const option = lastMessage?.options?.find(opt => opt.id === optionId)
    const label = option?.label || optionId

    // Add user message
    addMessage({
      role: 'user',
      content: label
    })

    // Store selection in flowData based on current flow/step
    if (currentFlow.value === 'create') {
      if (flowStep.value === 0) {
        // Selected main menu option - start create flow
        startFlow('create')
        return
      } else if (flowStep.value === 1) {
        // Selected category
        flowData.value.categoryId = optionId
      } else if (flowStep.value === 2) {
        // Selected subcategory
        flowData.value.subcategoryId = optionId
      } else if (flowStep.value === 4) {
        // Selected theme
        flowData.value.themeId = optionId
      }
    } else if (currentFlow.value === 'edit') {
      if (flowStep.value === 1) {
        // Selected project
        flowData.value.projectId = optionId
      }
    } else if (currentFlow.value === 'learn') {
      if (flowStep.value === 1) {
        // Selected topic
        flowData.value.topic = optionId
      } else if (flowStep.value === 2) {
        // Selected follow-up action
        flowData.value.action = optionId
      }
    } else if (currentFlow.value === 'support') {
      if (flowStep.value === 1) {
        // Selected support action
        flowData.value.action = optionId
      }
    } else if (!currentFlow.value) {
      // Main menu or project context selection
      if (optionId === 'create') {
        startFlow('create')
        return
      } else if (optionId === 'edit') {
        startFlow('edit')
        return
      } else if (optionId === 'learn') {
        startFlow('learn')
        return
      } else if (optionId === 'billing') {
        startFlow('billing')
        return
      } else if (optionId === 'support') {
        startFlow('support')
        return
      } else if (optionId === 'help-project') {
        // Help with current project
        addMessage({
          role: 'assistant',
          content: 'This feature is coming soon. What would you like help with?'
        })
        isProcessing.value = false
        return
      } else if (optionId === 'change-theme') {
        // Change theme - redirect to settings
        router.push({ name: 'settings', params: { projectId: currentProjectId.value! } })
        close()
        return
      } else if (optionId === 'go-dashboard') {
        // Go to dashboard
        router.push({ name: 'dashboard' })
        close()
        return
      } else if (optionId === 'retry') {
        // Retry project creation - go back 2 steps to theme selection
        if (currentFlow.value === 'create') {
          // Remove error messages
          messages.value = messages.value.slice(0, -2)
          flowStep.value = 3 // Go back to theme selection
          processCurrentStep()
          return
        }
      } else if (optionId === 'dashboard') {
        // Go to dashboard from error
        router.push({ name: 'dashboard' })
        close()
        return
      }
    }

    // Increment step and process
    flowStep.value++
    processCurrentStep()
  }

  function submitInput(value: string) {
    // Add user message
    addMessage({
      role: 'user',
      content: value
    })

    // Store value in flowData
    if (currentFlow.value === 'create' && flowStep.value === 3) {
      flowData.value.projectName = value
    }

    // Increment step and process
    flowStep.value++
    processCurrentStep()
  }

  async function processCurrentStep() {
    isProcessing.value = true

    // Add typing indicator
    addMessage({
      role: 'assistant',
      content: '',
      isTyping: true
    })

    // Wait for typing delay
    await delay(getTypingDelay())

    // Remove typing message
    messages.value = messages.value.filter(m => !m.isTyping)

    // Process based on current flow and step
    if (currentFlow.value === 'create') {
      if (flowStep.value === 1) {
        // Show categories
        addMessage({
          role: 'assistant',
          content: 'What is the project about?',
          options: PROJECT_CATEGORIES.map(cat => ({
            id: cat.id,
            label: cat.label,
            icon: cat.icon
          }))
        })
      } else if (flowStep.value === 2) {
        // Show subcategories for selected category
        const categoryId = flowData.value.categoryId as string
        const category = PROJECT_CATEGORIES.find(c => c.id === categoryId)

        if (category) {
          addMessage({
            role: 'assistant',
            content: `Great! What type of ${category.label.toLowerCase()} project?`,
            options: category.subcategories.map(sub => ({
              id: sub.id,
              label: sub.label
            }))
          })
        }
      } else if (flowStep.value === 3) {
        // Ask for project name
        const subcategoryId = flowData.value.subcategoryId as string
        const categoryId = flowData.value.categoryId as string
        const category = PROJECT_CATEGORIES.find(c => c.id === categoryId)
        const subcategory = category?.subcategories.find(s => s.id === subcategoryId)

        if (subcategory) {
          addMessage({
            role: 'assistant',
            content: `What's the name of your ${subcategory.label.toLowerCase()}?`
          })
        }
      } else if (flowStep.value === 4) {
        // Show theme picker
        addMessage({
          role: 'assistant',
          content: 'Choose a theme for your project:',
          component: 'theme-picker'
        })
      } else if (flowStep.value === 5) {
        // Show creation message
        addMessage({
          role: 'assistant',
          content: 'Perfect! Creating your project now...'
        })

        // Create the project
        const projectId = await createProjectFromAssistant({
          categoryId: flowData.value.categoryId as string,
          subcategoryId: flowData.value.subcategoryId as string,
          projectName: flowData.value.projectName as string,
          themeId: flowData.value.themeId as string
        })

        if (projectId) {
          // Add success message
          addMessage({
            role: 'assistant',
            content: 'Done! Redirecting to your new project...'
          })

          // Wait a moment before redirect
          await delay(1000)

          // Redirect to the editor
          router.push({ name: 'designer', params: { projectId } })

          // Close assistant and reset
          close()
          reset()
        } else {
          // Add error message
          addMessage({
            role: 'assistant',
            content: 'Sorry, there was an error creating your project. Please try again or create a project manually from the dashboard.',
            options: [
              { id: 'retry', label: 'Try Again' },
              { id: 'dashboard', label: 'Go to Dashboard' }
            ]
          })
        }
      }
    } else if (currentFlow.value === 'edit') {
      if (flowStep.value === 1) {
        // Show project list
        addMessage({
          role: 'assistant',
          content: 'Which project do you want to edit?',
          component: 'project-list'
        })
      } else if (flowStep.value === 2) {
        // User selected a project - redirect to editor
        const projectId = flowData.value.projectId as string
        addMessage({
          role: 'assistant',
          content: 'Opening project...'
        })

        await delay(500)
        router.push({ name: 'designer', params: { projectId } })
        close()
      }
    } else if (currentFlow.value === 'learn') {
      if (flowStep.value === 1) {
        // Show learning topics
        addMessage({
          role: 'assistant',
          content: 'What would you like to learn about?',
          options: [
            { id: 'sections', label: 'How sections work', icon: 'lni-layout' },
            { id: 'styles', label: 'Customizing styles', icon: 'lni-palette' },
            { id: 'publishing', label: 'Publishing your site', icon: 'lni-rocket' },
            { id: 'domains', label: 'Using custom domains', icon: 'lni-link' },
            { id: 'menu', label: 'Back to menu', icon: 'arrow-left' }
          ]
        })
      } else if (flowStep.value === 2) {
        // Show info based on selection
        const topic = flowData.value.topic as string

        let content = ''
        if (topic === 'sections') {
          content = 'Sections are the building blocks of your landing page. Each section (like Hero, Cards, Footer) can be customized with different variants and content. Add sections from the left panel and configure them in the right panel.'
        } else if (topic === 'styles') {
          content = 'You can customize styles by selecting a theme, or by clicking on any section to edit its specific styles. Themes control colors, fonts, spacing, and more across your entire site.'
        } else if (topic === 'publishing') {
          content = 'Click the "Publish" button in the top-right corner to make your site live. Your site will be available at lands.app/yourslug. You can also set up a custom domain in project settings.'
        } else if (topic === 'domains') {
          content = 'Custom domains are available on Pro and Business plans. Go to Settings → Custom Domain to connect your own domain. You\'ll need to update your DNS records with your domain provider.'
        } else if (topic === 'menu') {
          // Go back to main menu
          reset()
          initializeAssistant()
          isProcessing.value = false
          return
        }

        addMessage({
          role: 'assistant',
          content,
          options: [
            { id: 'more', label: 'Learn more', icon: 'lni-graduation' },
            { id: 'menu', label: 'Back to menu', icon: 'arrow-left' }
          ]
        })
      } else if (flowStep.value === 3) {
        // Handle follow-up actions
        const action = flowData.value.action as string
        if (action === 'more') {
          // Show more topics
          flowStep.value = 0
          processCurrentStep()
          return
        } else if (action === 'menu') {
          // Go back to main menu
          reset()
          initializeAssistant()
          isProcessing.value = false
          return
        }
      }
    } else if (currentFlow.value === 'billing') {
      // Redirect to account settings
      addMessage({
        role: 'assistant',
        content: 'Taking you to account settings...'
      })

      await delay(1000)
      router.push({ name: 'account' })
      close()
    } else if (currentFlow.value === 'support') {
      if (flowStep.value === 1) {
        // Show support options
        addMessage({
          role: 'assistant',
          content: 'How can we help you?',
          options: [
            { id: 'email', label: 'Email support', icon: 'lni-envelope' },
            { id: 'bug', label: 'Report a bug', icon: 'lni-bug' },
            { id: 'menu', label: 'Back to menu', icon: 'arrow-left' }
          ]
        })
      } else if (flowStep.value === 2) {
        // Handle support action
        const action = flowData.value.action as string

        if (action === 'email') {
          addMessage({
            role: 'assistant',
            content: 'You can reach us at support@lands.app. We typically respond within 24 hours.'
          })
        } else if (action === 'bug') {
          addMessage({
            role: 'assistant',
            content: 'Please report bugs to bugs@lands.app or via our GitHub issues page. Include as much detail as possible about what happened and how to reproduce it.'
          })
        } else if (action === 'menu') {
          // Go back to main menu
          reset()
          initializeAssistant()
          isProcessing.value = false
          return
        }
      }
    }

    isProcessing.value = false
  }

  async function sendChatMessage(userMessage: string) {
    console.log('[ASSISTANT] sendChatMessage called', { userMessage, currentProjectId: currentProjectId.value })

    if (!currentProjectId.value) {
      console.error('[ASSISTANT] No currentProjectId, aborting')
      return
    }

    isAIProcessing.value = true
    isProcessing.value = true

    // Add user message to UI
    addMessage({
      role: 'user',
      content: userMessage,
    })

    try {
      // Build context
      console.log('[ASSISTANT] Building context...')
      const context = buildAIContext()
      console.log('[ASSISTANT] Context built:', context)

      // Call AI
      console.log('[ASSISTANT] Calling AI...')
      const response = await sendProjectEditMessage(userMessage, context, chatHistory.value)
      console.log('[ASSISTANT] AI response:', response)

      // Execute actions
      let executionSummary = ''
      if (response.actions.length > 0) {
        console.log('[ASSISTANT] Executing actions:', response.actions)
        const result = await executeActions(response.actions)
        console.log('[ASSISTANT] Execution result:', result)
        if (result.failed > 0) {
          executionSummary = `\n\n(${result.executed} actions succeeded, ${result.failed} failed)`
        } else if (result.executed > 0) {
          executionSummary = `\n\n(${result.executed} actions executed)`
        }
      }

      // Add assistant message to UI
      addMessage({
        role: 'assistant',
        content: response.message + executionSummary,
      })

      // Update chat history for context
      chatHistory.value.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response.message }
      )

      // Keep last 10 exchanges for context window
      if (chatHistory.value.length > 20) {
        chatHistory.value = chatHistory.value.slice(-20)
      }
    } catch (error) {
      console.error('[ASSISTANT] Error:', error)
      // Show error message
      addMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      isAIProcessing.value = false
      isProcessing.value = false
    }
  }

  function prefillMessage(message: string) {
    prefillInput.value = message
  }

  function clearPrefill() {
    const msg = prefillInput.value
    prefillInput.value = ''
    return msg
  }

  return {
    // State
    isOpen,
    isMinimized,
    messages,
    currentFlow,
    flowData,
    routeContext,
    currentProjectId,
    flowStep,
    isProcessing,
    currentProject,
    hasSeenAssistant,
    chatMode,
    isAIProcessing,
    prefillInput,

    // Actions
    open,
    close,
    minimize,
    toggleOpen,
    reset,
    startOver,
    goBack,
    addMessage,
    updateRouteContext,
    initializeAssistant,
    checkFirstVisit,
    startFlow,
    selectOption,
    submitInput,
    sendChatMessage,
    prefillMessage,
    clearPrefill,
  }
})

// Route watcher setup (call from main.ts)
export function setupAssistantRouteWatcher(router: Router) {
  const assistantStore = useAssistantStore()

  // Watch for route changes
  watch(
    () => router.currentRoute.value,
    (route) => {
      assistantStore.updateRouteContext(
        route.name as string,
        route.params.projectId as string | undefined
      )
    },
    { immediate: true }
  )
}
