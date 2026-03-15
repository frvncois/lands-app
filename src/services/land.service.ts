import { supabase } from '@/lib/supabase'
import type { Land } from '@/types/land'
import type { LandTheme } from '@/types/theme'

const LAND_DEFAULTS = { is_published: false }

const DEFAULT_THEME: LandTheme = {
  theme_preset: 'minimal',
  color_main: '#18181B',
  color_accent: '#6366F1',
  color_surface: '#F4F4F5',
  font_title: '"Inter", ui-sans-serif, system-ui, sans-serif',
  font_body:  '"Inter", ui-sans-serif, system-ui, sans-serif',
}

function normalizeLand(row: Record<string, unknown>): Land {
  return {
    ...row,
    sections: Array.isArray(row.sections) ? row.sections : [],
    ...LAND_DEFAULTS,
    theme: (row.theme && typeof row.theme === 'object' && !Array.isArray(row.theme))
      ? { ...DEFAULT_THEME, ...(row.theme as Partial<LandTheme>) }
      : { ...DEFAULT_THEME },
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

  async save(id: string, updates: { sections?: Land['sections']; theme?: Land['theme']; title?: string; handle?: string }): Promise<void> {
    const { error } = await supabase
      .from('lands')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async updateLand(id: string, updates: Partial<Pick<Land, 'handle' | 'title' | 'description' | 'avatar_image' | 'cover_image' | 'plan'>>): Promise<void> {
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
