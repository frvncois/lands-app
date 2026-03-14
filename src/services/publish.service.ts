import { supabase } from '@/lib/supabase'
import type { Land } from '@/types/land'

export const publishService = {
  async publish(land: Land): Promise<{ url: string }> {
    const { data, error } = await supabase.functions.invoke('publish', {
      body: { land },
    })

    if (error) throw new Error(error.message)
    return data as { url: string }
  },
}
