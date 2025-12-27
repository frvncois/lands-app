import type { FlowOption } from './types'

export const MAIN_MENU_OPTIONS: FlowOption[] = [
  {
    id: 'create',
    label: 'Create new project',
    icon: 'plus',
    description: 'Start a new landing page'
  },
  {
    id: 'edit',
    label: 'Edit existing project',
    icon: 'app-editor',
    description: 'Open and edit a project'
  },
  {
    id: 'learn',
    label: 'Learn how to use Lands',
    icon: 'lni-graduation',
    description: 'Get help and tutorials'
  },
  {
    id: 'billing',
    label: 'Billing & account',
    icon: 'lni-credit-cards',
    description: 'Manage your subscription'
  },
  {
    id: 'support',
    label: 'Get support',
    icon: 'lni-comment-1-text',
    description: 'Contact our team'
  }
]

export const PROJECT_CONTEXT_OPTIONS: FlowOption[] = [
  {
    id: 'help-project',
    label: 'Help with this project',
    icon: 'lni-question-circle',
    description: 'Get help with the current project'
  },
  {
    id: 'change-theme',
    label: 'Change theme',
    icon: 'lni-palette',
    description: 'Switch to a different theme'
  },
  {
    id: 'go-dashboard',
    label: 'Go to dashboard',
    icon: 'app-dashboard',
    description: 'View all your projects'
  }
]

export const THEME_OPTIONS = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean and simple design with plenty of whitespace'
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Strong, vibrant design with high contrast'
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Modern dark theme with elegant styling'
  }
]
