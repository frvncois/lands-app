import { supabase } from '@/lib/supabase'
import type { Land } from '@/types/land'

const MAX_ATTEMPTS = 3

async function invokeWithRetry(land: Land): Promise<{ url: string }> {
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { data, error } = await supabase.functions.invoke('publish', { body: { land } })
    if (!error) return data as { url: string }
    lastError = new Error(error.message)
    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1))) // 500ms, 1s
    }
  }
  throw lastError
}

export const publishService = {
  async publish(land: Land): Promise<{ url: string }> {
    return invokeWithRetry(land)
  },
}
