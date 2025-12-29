/**
 * AI Action Types
 *
 * Defines the actions that the AI can return to modify the page.
 */

export type AIAction =
  | { type: 'ADD_SECTION'; sectionType: string; variant?: string; position?: 'start' | 'end' | number; data?: Record<string, unknown> }
  | { type: 'UPDATE_SECTION'; sectionId: string; data?: Record<string, unknown>; styles?: Record<string, unknown>; variant?: string }
  | { type: 'DELETE_SECTION'; sectionId: string }
  | { type: 'REORDER_SECTION'; sectionId: string; position: number }
  | { type: 'UPDATE_THEME'; colors?: Record<string, string>; fonts?: Record<string, string> }
  | { type: 'SELECT_SECTION'; sectionId: string }

export interface AIResponse {
  message: string
  actions: AIAction[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
