import { supabase } from '@/lib/supabase'
import type { Land } from '@/types/land'

function normalizeLand(row: Record<string, unknown>): Land {
  return {
    ...row,
    sections: Array.isArray(row.sections) ? row.sections : [],
    theme: (row.theme && typeof row.theme === 'object') ? row.theme : {},
  } as Land
}

export const landService = {
  async getMyLands(): Promise<Land[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('lands')
      .select('*, collaborators(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []).map(normalizeLand)
  },

  async createLand(payload: { handle: string; title: string }): Promise<Land> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('lands')
      .insert({ ...payload, user_id: user.id })
      .select('*, collaborators(*)')
      .single()

    if (error) throw new Error(error.message)
    return normalizeLand(data)
  },

  async save(id: string, updates: { sections?: Land['sections']; theme?: Land['theme'] }): Promise<void> {
    const { error } = await supabase
      .from('lands')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async updateLand(id: string, updates: Partial<Pick<Land, 'handle' | 'title' | 'description' | 'avatar_image' | 'cover_image'>>): Promise<void> {
    const { error } = await supabase
      .from('lands')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async deleteLand(id: string): Promise<void> {
    const { error } = await supabase.from('lands').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
