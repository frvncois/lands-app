// WORKING SOLUTION: Replace /src/stores/account.js with this fixed version

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase.js'
import { apiService } from '@/services/api.js'
// REMOVED: import { useProjectStore } from './projects.js' - causes circular import
import { jwtDecode } from 'jwt-decode'

export const useAccountStore = defineStore('account', () => {
  // Auth state
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // User profile data
  const profile = ref({
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    marketing_emails: false,
    created_at: null,
    updated_at: null
  })

  // Loading states
  const profileLoading = ref(false)
  const dataLoading = ref(false)

  // PREVENT DOUBLE LOADING
  const isLoadingData = ref(false)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const userEmail = computed(() => user.value?.email || '')
  const fullName = computed(() => {
    if (!profile.value.first_name && !profile.value.last_name) return ''
    return `${profile.value.first_name} ${profile.value.last_name}`.trim()
  })

  // Load all user data via secure edge function
  async function loadUserData() {
    if (!isAuthenticated.value) return

    // PREVENT DOUBLE CALLS
    if (isLoadingData.value) {
      console.log('🚫 Data loading already in progress, skipping...')
      return
    }

    isLoadingData.value = true
    dataLoading.value = true
    try {
      console.log('🔄 Loading user data via secure API...')
      
      // Call edge function via API service
      const response = await apiService.getUserData()
      
      if (response.success) {
        // Update profile
        profile.value = response.data.profile
        
        console.log('📋 Profile data from API:', profile.value)
        
        // FIXED: Update projects store without circular import
        // Use dynamic import to avoid circular dependency
        const { useProjectStore } = await import('./projects.js')
        const projectsStore = useProjectStore()
        projectsStore.setProjects(response.data.projects)
        projectsStore.setInvitations(response.data.invitations)
        projectsStore.setStats(response.data.stats)
        
        console.log(`✅ User data loaded: ${response.data.stats.total_projects} projects, ${response.data.stats.pending_invitations} invitations`)
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error || 'Failed to load user data')
      }
    } catch (err) {
      console.error('Failed to load user data:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      dataLoading.value = false
      isLoadingData.value = false
    }
  }

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
        session.value = currentSession
        user.value = currentSession.user
        
        console.log('✅ Session restored:', currentSession.user.email)
        
        // Load all user data via secure API
        await loadUserData()
        
      } else {
        console.log('❌ No active session found')
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log('🔄 Auth state changed:', event, newSession?.user?.email || 'no user')
        
        if (event === 'SIGNED_OUT') {
          // Clear all data
          user.value = null
          session.value = null
          profile.value = {
            id: null,
            first_name: '',
            last_name: '',
            email: '',
            marketing_emails: false,
            created_at: null,
            updated_at: null
          }
          
          // FIXED: Clear projects store without circular import
          try {
            const { useProjectStore } = await import('./projects.js')
            const projectsStore = useProjectStore()
            projectsStore.clearAll()
          } catch (importError) {
            console.warn('Could not clear projects store:', importError)
          }
          
        } else if (event === 'SIGNED_IN') {
          session.value = newSession
          user.value = newSession?.user || null
          
          // Load data if user signed in and not already loading
          if (newSession?.user && !isLoadingData.value) {
            console.log('🔄 SIGNED_IN event - loading user data from auth listener')
            await loadUserData()
          }
        } else if (event === 'TOKEN_REFRESHED') {
          session.value = newSession
          user.value = newSession?.user || null
          console.log('🔄 Token refreshed, no data reload needed')
        }
      })
    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = err.message
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

    console.log('✅ Sign up successful')
    
    // FIXED: Do NOT set session/user state for unverified users
    // This prevents auto-authentication and unwanted navigation
    if (data.session && data.user?.email_confirmed_at) {
      // Only set session if email is already confirmed (rare case)
      session.value = data.session
      user.value = data.user
      return { success: true, needsVerification: false }
    } else {
      // Email verification required - don't set session/user
      console.log('📧 Email verification required - not setting session')
      return { success: true, needsVerification: true }
    }
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
      
      console.log('✅ Sign in successful')
      
      return { success: true }
    } catch (err) {
      console.error('Sign in error:', err)
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

  // ADDED: Validate session function for router guard
  async function validateSession() {
    if (!isAuthenticated.value) return false

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.access_token) {
        console.log('❌ No valid session found')
        await signOut()
        return false
      }

      // Decode and check JWT expiration
      const decoded = jwtDecode(session.access_token)
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = decoded.exp - now

      console.log('🔍 JWT expires in:', timeUntilExpiry, 'seconds')

      // If token expires in less than 5 minutes, refresh it
      if (timeUntilExpiry < 300) {
        console.log('🔄 Token expiring soon, refreshing...')
        
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !refreshed.session) {
          console.error('❌ Session refresh failed:', refreshError)
          await signOut()
          return false
        }
        
        session.value = refreshed.session
        user.value = refreshed.session.user
        console.log('✅ Session refreshed successfully')
      }

      return true
    } catch (error) {
      console.error('❌ JWT validation failed:', error)
      await signOut()
      return false
    }
  }

  // Update user profile via secure edge function
  async function updateProfile(updates) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }

    profileLoading.value = true
    try {
      console.log('🔄 Updating profile via secure API...', updates)
      
      const response = await apiService.updateProfile(updates)
      
      if (response.success) {
        // Update local profile
        profile.value = { ...profile.value, ...response.data }
        console.log('✅ Profile updated successfully')
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Failed to update profile:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      profileLoading.value = false
    }
  }

  return {
    // State
    user,
    session,
    profile,
    loading,
    error,
    profileLoading,
    dataLoading,
    
    // Computed
    isAuthenticated,
    userEmail,
    fullName,
    
    // Methods
    initialize,
    loadUserData,
    validateSession, // ADDED: This was missing!
    signUp,
    signIn,
    signOut,
    updateProfile
  }
}, {
  persist: {
    paths: ['profile.first_name', 'profile.last_name']
  }
})