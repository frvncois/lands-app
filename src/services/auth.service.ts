import { supabase } from '@/lib/supabase'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  password: string
}

const authService = {
  async login(payload: LoginPayload) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    })
    if (error) throw new Error(error.message)
    return data
  },

  async register(payload: RegisterPayload) {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          first_name: payload.first_name,
          last_name: payload.last_name,
        },
      },
    })
    if (error) throw new Error(error.message)
    return data
  },

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    if (error) throw new Error(error.message)
  },

  async resetPassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  },

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },
}

export default authService
