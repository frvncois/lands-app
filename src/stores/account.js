import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase.js'

export const useAccountStore = defineStore('account', () => {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => !!session.value)
  const userEmail = computed(() => user.value?.email || '')
  const userMetadata = computed(() => user.value?.user_metadata || {})

  // Initialize auth state
  async function initialize() {
    loading.value = true
    try {
      // Get the current session from Supabase
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session retrieval error:', error)
        throw error
      }

      if (currentSession) {
        // Security: Check if token is close to expiring
        const tokenExpiry = new Date(currentSession.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = tokenExpiry.getTime() - now.getTime()
        
        // If token expires in less than 5 minutes, refresh it
        if (timeUntilExpiry < 5 * 60 * 1000) {
          console.log('🔄 Token close to expiry, refreshing...')
          const { data: refreshedSession } = await supabase.auth.refreshSession()
          if (refreshedSession.session) {
            session.value = refreshedSession.session
            user.value = refreshedSession.session.user
          }
        } else {
          session.value = currentSession
          user.value = currentSession.user
        }
        
        console.log('✅ Session restored:', currentSession.user.email)
      } else {
        console.log('❌ No active session found')
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, newSession) => {
        console.log('🔄 Auth state changed:', event, newSession?.user?.email || 'no user')
        
        // Security: Clear sensitive data on sign out
        if (event === 'SIGNED_OUT') {
          user.value = null
          session.value = null
          // Clear any cached data
          localStorage.removeItem('recent-projects')
          sessionStorage.clear()
        } else {
          session.value = newSession
          user.value = newSession?.user || null
        }
      })
    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = err.message
      // Reset auth state on error
      user.value = null
      session.value = null
    } finally {
      loading.value = false
    }
  }

  // Sign up
  async function signUp(email, password, metadata = {}) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            first_name: metadata.firstName || '',
            last_name: metadata.lastName || '',
            marketing_emails: metadata.marketing || false
          }
        }
      })

      if (signUpError) throw signUpError

      // User will need to verify email
      return { success: true, needsVerification: !data.session }
    } catch (err) {
      console.error('Sign up error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Sign in
  async function signIn(email, password) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (signInError) throw signInError

      session.value = data.session
      user.value = data.user
      
      return { success: true }
    } catch (err) {
      console.error('Sign in error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Reset password
  async function resetPassword(email) {
    loading.value = true
    error.value = null
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/change-password`
      })

      if (resetError) throw resetError

      return { success: true }
    } catch (err) {
      console.error('Password reset error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Update password
  async function updatePassword(newPassword) {
    loading.value = true
    error.value = null
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      return { success: true }
    } catch (err) {
      console.error('Password update error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  async function signOut() {
    loading.value = true
    error.value = null
    
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) throw signOutError

      user.value = null
      session.value = null
      
      return { success: true }
    } catch (err) {
      console.error('Sign out error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Clear errors
  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    session,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    userEmail,
    userMetadata,
    
    // Actions
    initialize,
    signUp,
    signIn,
    resetPassword,
    updatePassword,
    signOut,
    clearError
  }
})