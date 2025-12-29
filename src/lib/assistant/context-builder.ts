/**
 * Context Builder
 *
 * Builds AI context from current editor state.
 */

import { useEditorStore } from '@/stores/editor'
import { getSectionDocsForAI, type SectionDocForAI } from './section-docs'

export interface AIContext {
  availableSections: SectionDocForAI[]
  currentPage: {
    sections: { id: string; type: string; variant: string; position: number }[]
    theme: { 
      id: string
      primaryColor: string
      backgroundColor: string
      fontHeading: string
      fontBody: string
    }
  }
  selectedSection?: { id: string; type: string; variant: string }
}

export function buildAIContext(): AIContext {
  const editorStore = useEditorStore()

  const context: AIContext = {
    availableSections: getSectionDocsForAI(),
    currentPage: {
      sections: editorStore.sections.map((section, index) => ({
        id: section.id,
        type: section.type,
        variant: section.variant,
        position: index,
      })),
      theme: {
        id: editorStore.theme.id,
        primaryColor: editorStore.theme.tokens.colors.primary,
        backgroundColor: editorStore.theme.tokens.colors.background,
        fontHeading: editorStore.theme.tokens.fonts.heading,
        fontBody: editorStore.theme.tokens.fonts.body,
      },
    },
  }

  if (editorStore.selectedSection) {
    context.selectedSection = {
      id: editorStore.selectedSection.id,
      type: editorStore.selectedSection.type,
      variant: editorStore.selectedSection.variant,
    }
  }

  return context
}

export function formatContextForPrompt(context: AIContext): string {
  const parts: string[] = []

  parts.push(`Current theme: ${context.currentPage.theme.id}`)
  
  if (context.currentPage.sections.length > 0) {
    const sectionsList = context.currentPage.sections
      .map(s => `  ${s.position + 1}. ${s.type} (${s.variant})`)
      .join('\n')
    parts.push(`Current sections:\n${sectionsList}`)
  } else {
    parts.push('Current sections: (empty page)')
  }

  if (context.selectedSection) {
    parts.push(`Selected section: ${context.selectedSection.type} (${context.selectedSection.variant})`)
  }

  return parts.join('\n')
}
