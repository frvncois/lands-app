import { supabase } from '@/lib/supabase'
import type { User } from '@/types/user'

export const userService = {
  async getMe(): Promise<User> {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) throw new Error(error.message)
    return data as User
  },

  async updateMe(updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User> {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authUser.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as User
  },

  async deleteAccount(): Promise<void> {
    // Requires a Supabase Edge Function or admin key — not callable from client
    throw new Error('Account deletion must be handled server-side.')
  },
}
