import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type {
  UserSettings,
  UserProfile,
  UserPreferences,
} from '@/types/user'
import { getDefaultUserSettings } from '@/types/user'
import { useToast } from '@/stores/toast'

export const useUserStore = defineStore('user', () => {
  const toast = useToast()

  // State
  const settings = ref<UserSettings>(getDefaultUserSettings())
  const isLoading = ref(false)
  const isAuthenticated = ref(false)
  const authUser = ref<User | null>(null)

  // Getters
  const user = computed(() => settings.value.profile)
  const preferences = computed(() => settings.value.preferences)

  // Initialize auth state listener
  async function initAuth() {
    isLoading.value = true

    // Get initial session
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      authUser.value = session.user
      isAuthenticated.value = true
      await fetchUserProfile(session.user.id)
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id)

      if (event === 'INITIAL_SESSION') {
        // Handle initial session on page load
        if (session?.user) {
          authUser.value = session.user
          isAuthenticated.value = true
          await fetchUserProfile(session.user.id)
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        authUser.value = session.user
        isAuthenticated.value = true
        await fetchUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        authUser.value = null
        isAuthenticated.value = false
        settings.value = getDefaultUserSettings()
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token was refreshed, update user
        authUser.value = session.user
      }
    })

    isLoading.value = false
  }

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, avatar_url, created_at')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data) {
        settings.value.profile = {
          id: data.id,
          email: data.email,
          name: data.name || '',
          avatar: data.avatar_url || '',
          createdAt: data.created_at,
        }
      }

      // Fetch preferences (may not exist for new users)
      const { data: prefsData } = await supabase
        .from('user_preferences')
        .select('theme, email_notifications')
        .eq('user_id', userId)
        .maybeSingle()

      if (prefsData) {
        settings.value.preferences = {
          theme: prefsData.theme,
          emailNotifications: prefsData.email_notifications,
          marketingEmails: false, // Default value, not stored in DB
        }
      }
    } catch (e) {
      console.error('Failed to fetch user profile:', e)
    }
  }

  async function fetchUser() {
    if (!authUser.value) return
    await fetchUserProfile(authUser.value.id)
  }

  async function updateProfile(profile: Partial<UserProfile>) {
    if (!authUser.value) return

    // Store previous state for rollback
    const previousProfile = { ...settings.value.profile }

    // Optimistic update
    settings.value.profile = { ...settings.value.profile, ...profile }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          avatar_url: profile.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.value.id)

      if (error) throw error
      toast.success('Profile updated')
    } catch (e) {
      // Rollback on error
      settings.value.profile = previousProfile
      console.error('Failed to update profile:', e)
      toast.error('Failed to update profile')
      throw e
    }
  }

  async function updatePreferences(preferences: Partial<UserPreferences>) {
    if (!authUser.value) return

    // Store previous state for rollback
    const previousPreferences = { ...settings.value.preferences }

    // Optimistic update
    settings.value.preferences = { ...settings.value.preferences, ...preferences }

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: authUser.value.id,
          theme: settings.value.preferences.theme,
          email_notifications: settings.value.preferences.emailNotifications,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      if (error) throw error
    } catch (e) {
      // Rollback on error
      settings.value.preferences = previousPreferences
      console.error('Failed to update preferences:', e)
      toast.error('Failed to update preferences')
      throw e
    }
  }

  async function signIn(email: string, password: string) {
    isLoading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      authUser.value = data.user
      isAuthenticated.value = true

      if (data.user) {
        await fetchUserProfile(data.user.id)
      }
      toast.success('Welcome back!')
    } catch (e) {
      console.error('Failed to sign in:', e)
      toast.error('Failed to sign in', e instanceof Error ? e.message : 'Please check your credentials')
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function signUp(email: string, password: string, name: string) {
    isLoading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) throw error

      // Profile will be created via database trigger or we create it here
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          name,
        })
      }
      toast.success('Account created!', 'Please check your email to verify your account')
    } catch (e) {
      console.error('Failed to sign up:', e)
      toast.error('Failed to create account', e instanceof Error ? e.message : 'Please try again')
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      authUser.value = null
      settings.value = getDefaultUserSettings()
      isAuthenticated.value = false
      toast.success('Signed out')
    } catch (e) {
      console.error('Failed to sign out:', e)
      toast.error('Failed to sign out')
      throw e
    }
  }

  async function signInWithOAuth(provider: 'google' | 'github') {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) throw error
    } catch (e) {
      console.error('Failed to sign in with OAuth:', e)
      toast.error('Failed to sign in', e instanceof Error ? e.message : 'Please try again')
      throw e
    }
  }

  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      })

      if (error) throw error
      toast.success('Password reset email sent', 'Please check your inbox')
    } catch (e) {
      console.error('Failed to reset password:', e)
      toast.error('Failed to send reset email', e instanceof Error ? e.message : 'Please try again')
      throw e
    }
  }

  async function updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      toast.success('Password updated')
    } catch (e) {
      console.error('Failed to update password:', e)
      toast.error('Failed to update password', e instanceof Error ? e.message : 'Please try again')
      throw e
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (!authUser.value?.email) {
      throw new Error('No user logged in')
    }

    try {
      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: authUser.value.email,
        password: currentPassword,
      })

      if (verifyError) {
        throw new Error('Current password is incorrect')
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError
      toast.success('Password updated successfully')
    } catch (e) {
      console.error('Failed to change password:', e)
      toast.error('Failed to change password', e instanceof Error ? e.message : 'Please try again')
      throw e
    }
  }

  function resetSettings() {
    settings.value = getDefaultUserSettings()
    isAuthenticated.value = false
    authUser.value = null
  }

  return {
    // State
    settings,
    isLoading,
    isAuthenticated,
    authUser,
    // Getters
    user,
    preferences,
    // Actions
    initAuth,
    fetchUser,
    updateProfile,
    updatePreferences,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    changePassword,
    resetSettings,
  }
})
