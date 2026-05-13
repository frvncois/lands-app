import { supabase } from '@/shared/lib/supabase'
import type { Land } from '@/features/lands/types'
import type { LandTheme } from '@/features/theme/types'

const LAND_DEFAULTS = { is_published: false, is_private: false, private_password: null, stripe_customer_id: null, stripe_subscription_id: null }

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
    ...LAND_DEFAULTS,
    ...row,
    sections: Array.isArray(row.sections) ? row.sections : [],
    theme: (row.theme && typeof row.theme === 'object' && !Array.isArray(row.theme))
      ? { ...DEFAULT_THEME, ...(row.theme as Partial<LandTheme>) }
      : { ...DEFAULT_THEME },
  } as Land
}

let saveController: AbortController | null = null

export const landService = {
  async getMyLands(): Promise<Land[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Owned lands
    const { data: owned, error: ownedError } = await supabase
      .from('lands')
      .select('*, collaborators(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (ownedError) throw new Error(ownedError.message)

    // Lands where user is an active collaborator (matched by email)
    if (!user.email) throw new Error('User email is missing')

    const { data: collabRows, error: collabError } = await supabase
      .from('collaborators')
      .select('lands(*, collaborators(*))')
      .eq('email', user.email)
      .eq('status', 'active')

    if (collabError) throw new Error(collabError.message)

    const collaboratedLands = (collabRows ?? [])
      .map((row) => (row as unknown as { lands: Record<string, unknown> }).lands)
      .filter(Boolean)

    // Merge — dedupe by id in case user is both owner and listed as collaborator
    const ownedIds = new Set((owned ?? []).map((l) => l.id))
    const allLands = [
      ...(owned ?? []),
      ...collaboratedLands.filter((l) => !ownedIds.has(l.id as string)),
    ]

    return allLands.map(normalizeLand)
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
    saveController?.abort()
    saveController = new AbortController()

    const { error } = await supabase
      .from('lands')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .abortSignal(saveController.signal)

    if (error) {
      if (error.name === 'AbortError') return // superseded by a newer save
      throw new Error(error.message)
    }
  },

  async updateLand(id: string, updates: Partial<Pick<Land, 'handle' | 'title' | 'description' | 'avatar_image' | 'cover_image' | 'plan' | 'is_published' | 'is_private' | 'private_password' | 'meta_title' | 'meta_description' | 'og_image'>>): Promise<void> {
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
