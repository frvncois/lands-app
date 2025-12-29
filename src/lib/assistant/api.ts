/**
 * AI Assistant API
 *
 * Handles communication with the AI assistant edge function.
 */

import { supabase } from '@/lib/supabase'
import type { AIContext } from './context-builder'
import type { AIResponse, ChatMessage } from './action-types'

/**
 * Send a project edit message to the AI assistant
 */
export async function sendProjectEditMessage(
  message: string,
  context: AIContext,
  history: ChatMessage[]
): Promise<AIResponse> {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: {
      message,
      context,
      history,
    },
  })

  if (error) {
    throw new Error(`AI assistant error: ${error.message}`)
  }

  if (!data || !data.message) {
    throw new Error('Invalid response from AI assistant')
  }

  return {
    message: data.message,
    actions: data.actions || [],
  }
}
