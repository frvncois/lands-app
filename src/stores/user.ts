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

const DEBUG_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEBUG_AUTH === 'true'

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

export const useUserStore = defineStore('user', () => {
  const toast = useToast()

  // State
  const settings = ref<UserSettings>(getDefaultUserSettings())
  const authStatus = ref<AuthStatus>('unknown')
  const isHydrating = ref(false)
  const authUser = ref<User | null>(null)

  // ============================================
  // RATE LIMITING
  // ============================================

  const AUTH_MAX_ATTEMPTS = 5
  const AUTH_LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

  const authAttempts = ref(0)
  const authLockedUntil = ref<number | null>(null)

  /**
   * Check if auth is rate limited
   */
  function isAuthRateLimited(): boolean {
    if (authLockedUntil.value && Date.now() < authLockedUntil.value) {
      return true
    }
    // Reset if lockout expired
    if (authLockedUntil.value && Date.now() >= authLockedUntil.value) {
      authLockedUntil.value = null
      authAttempts.value = 0
    }
    return false
  }

  /**
   * Get remaining lockout time in minutes
   */
  function getLockoutMinutes(): number {
    if (!authLockedUntil.value) return 0
    return Math.ceil((authLockedUntil.value - Date.now()) / 60000)
  }

  /**
   * Record an auth attempt
   */
  function recordAuthAttempt(success: boolean) {
    if (success) {
      authAttempts.value = 0
      authLockedUntil.value = null
    } else {
      authAttempts.value++
      if (authAttempts.value >= AUTH_MAX_ATTEMPTS) {
        authLockedUntil.value = Date.now() + AUTH_LOCKOUT_MS
        toast.error(
          'Too many failed attempts',
          `Please wait ${AUTH_LOCKOUT_MS / 60000} minutes before trying again.`
        )
      }
    }
  }

  // Computed (for backward compatibility)
  const isAuthenticated = computed(() => authStatus.value === 'authenticated')
  const isLoading = computed(() => isHydrating.value)

  // Getters
  const user = computed(() => settings.value.profile)
  const preferences = computed(() => settings.value.preferences)

  /**
   * Rehydrate auth state from Supabase session
   * FIRE-AND-FORGET: This NEVER blocks, NEVER throws, ALWAYS resolves
   * Called on app boot, tab visibility changes, and bfcache restoration
   */
  function rehydrateFromSupabase(): void {
    // Prevent concurrent hydration
    if (isHydrating.value) {
      if (DEBUG_AUTH) {
        console.log('[Auth Rehydrate] Already hydrating, skipping...')
      }
      return
    }

    isHydrating.value = true

    if (DEBUG_AUTH) {
      console.log('[Auth Rehydrate] Starting session rehydration...')
    }

    // Timeout protection: if hydration takes >5s, force completion
    const timeoutId = setTimeout(() => {
      console.error('[Auth Rehydrate] TIMEOUT after 5s, forcing unauthenticated state')
      authStatus.value = 'unauthenticated'
      authUser.value = null
      isHydrating.value = false
    }, 5000)

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timeoutId)

        if (error) {
          console.error('[Auth Rehydrate] Failed to get session:', error)
          authStatus.value = 'unauthenticated'
          authUser.value = null
          return
        }

        if (session?.user) {
          authStatus.value = 'authenticated'
          authUser.value = session.user

          if (DEBUG_AUTH) {
            console.log('[Auth Rehydrate] Session found:', {
              userId: session.user.id,
              expiresAt: session.expires_at,
            })
          }

          // Fetch user profile (non-blocking)
          fetchUserProfile(session.user.id).catch(err => {
            console.error('[Auth Rehydrate] Failed to fetch user profile:', err)
          })
        } else {
          if (DEBUG_AUTH) {
            console.log('[Auth Rehydrate] No session found')
          }

          authStatus.value = 'unauthenticated'
          authUser.value = null
        }
      })
      .catch(err => {
        clearTimeout(timeoutId)
        console.error('[Auth Rehydrate] Unexpected error:', err)
        authStatus.value = 'unauthenticated'
        authUser.value = null
      })
      .finally(() => {
        isHydrating.value = false
      })
  }

  /**
   * Ensure hydration has started (non-blocking)
   * FIRE-AND-FORGET: Does NOT return a promise to await
   * Safe to call multiple times - only hydrates once
   */
  function ensureHydrationStarted(): void {
    // Already resolved - no need to hydrate again
    if (authStatus.value !== 'unknown') {
      return
    }

    // Already hydrating - don't start again
    if (isHydrating.value) {
      return
    }

    // Start hydration (non-blocking)
    rehydrateFromSupabase()
  }

  /**
   * Start listening to auth state changes
   * Should be called once on app initialization
   */
  function startAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (DEBUG_AUTH) {
        console.log('[Auth State Change]', {
          event,
          userId: session?.user?.id,
          expiresAt: session?.expires_at,
          currentStatus: authStatus.value,
        })
      }

      if (event === 'INITIAL_SESSION') {
        // Handle initial session on page load
        if (session?.user) {
          authStatus.value = 'authenticated'
          authUser.value = session.user
          fetchUserProfile(session.user.id).catch(err => {
            console.error('[Auth State Change] Failed to fetch profile:', err)
          })
        } else {
          authStatus.value = 'unauthenticated'
          authUser.value = null
        }
      } else if (event === 'SIGNED_IN') {
        if (session?.user) {
          authStatus.value = 'authenticated'
          authUser.value = session.user
          fetchUserProfile(session.user.id).catch(err => {
            console.error('[Auth State Change] Failed to fetch profile:', err)
          })
        }
      } else if (event === 'SIGNED_OUT') {
        authStatus.value = 'unauthenticated'
        authUser.value = null
        settings.value = getDefaultUserSettings()
      } else if (event === 'TOKEN_REFRESHED') {
        // CRITICAL: Do not set unauthenticated if session exists
        if (session?.user) {
          authStatus.value = 'authenticated'
          authUser.value = session.user

          if (DEBUG_AUTH) {
            console.log('[Auth State Change] Token refreshed successfully')
          }
        } else {
          // Token refresh failed - no session returned
          console.error('[Auth State Change] Token refresh returned no session')
          authStatus.value = 'unauthenticated'
          authUser.value = null
          toast.error('Session expired', 'Please sign in again')
        }
      } else if (event === 'USER_UPDATED') {
        if (session?.user) {
          authUser.value = session.user
        }
      }
    })
  }

  /**
   * Initialize auth state
   * FIRE-AND-FORGET: Starts hydration but does NOT wait for it
   */
  function initAuth() {
    // Start auth listener immediately
    startAuthListener()

    // Start hydration (non-blocking)
    rehydrateFromSupabase()
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
    // Check rate limit
    if (isAuthRateLimited()) {
      const minutes = getLockoutMinutes()
      toast.error('Account locked', `Too many failed attempts. Try again in ${minutes} minutes.`)
      throw new Error('Rate limited')
    }

    isHydrating.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        recordAuthAttempt(false)
        throw error
      }

      recordAuthAttempt(true)
      authStatus.value = 'authenticated'
      authUser.value = data.user

      if (data.user) {
        await fetchUserProfile(data.user.id)
      }
      toast.success('Welcome back!')
    } catch (e) {
      console.error('Failed to sign in:', e)
      // Don't show error toast if it's a rate limit error (already shown)
      if (!(e instanceof Error && e.message === 'Rate limited')) {
        toast.error('Failed to sign in', e instanceof Error ? e.message : 'Please check your credentials')
      }
      throw e
    } finally {
      isHydrating.value = false
    }
  }

  async function signUp(email: string, password: string, name: string) {
    isHydrating.value = true
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
      isHydrating.value = false
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      authStatus.value = 'unauthenticated'
      authUser.value = null
      settings.value = getDefaultUserSettings()
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
    authStatus.value = 'unauthenticated'
    authUser.value = null
  }

  return {
    // State
    settings,
    authStatus,
    isHydrating,
    isAuthenticated,
    isLoading,
    authUser,
    // Getters
    user,
    preferences,
    // Actions
    initAuth,
    ensureHydrationStarted,
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
