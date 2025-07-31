// src/stores/account.js
// Fixed version - prevents double API calls and adds user data logging

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase.js'
import { apiService } from '@/services/api.js'
import { useProjectStore } from './projects.js'

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
  const isAuthenticated = computed(() => !!session.value)
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
      
      // LOG USER DATA FROM SUPABASE AUTH
      console.log('👤 Current user from auth:', {
        id: user.value?.id,
        email: user.value?.email,
        email_confirmed_at: user.value?.email_confirmed_at,
        created_at: user.value?.created_at,
        updated_at: user.value?.updated_at
      })
      console.log('📋 User metadata:', {
        first_name: user.value?.user_metadata?.first_name,
        last_name: user.value?.user_metadata?.last_name,
        marketing_emails: user.value?.user_metadata?.marketing_emails,
        full_metadata: user.value?.user_metadata
      })
      console.log('🔧 App metadata:', user.value?.app_metadata)
      
      // Call edge function via API service
      const response = await apiService.getUserData()
      
      if (response.success) {
        // Update profile
        profile.value = response.data.profile
        
        // LOG PROFILE DATA FROM API
        console.log('📋 Profile data from API:', {
          id: profile.value.id,
          first_name: profile.value.first_name,
          last_name: profile.value.last_name,
          email: profile.value.email,
          marketing_emails: profile.value.marketing_emails,
          created_at: profile.value.created_at,
          updated_at: profile.value.updated_at
        })
        
        // Update projects store
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

  // Update user profile via secure edge function
  async function updateProfile(updates) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }

    profileLoading.value = true
    try {
      console.log('🔄 Updating profile via secure API...', updates)
      
      // Call edge function via API service
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
        // Check if token is close to expiring
        const tokenExpiry = new Date(currentSession.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = tokenExpiry.getTime() - now.getTime()
        
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
        
        // Load all user data via secure API (ONLY IN INITIALIZE)
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
          
          // Clear projects store
          const projectsStore = useProjectStore()
          projectsStore.clearAll()
          
          // Clear cached data
          localStorage.removeItem('recent-projects')
          sessionStorage.clear()
          
        } else if (event === 'SIGNED_IN') {
          session.value = newSession
          user.value = newSession?.user || null
          
          // ONLY LOAD DATA IF NOT ALREADY LOADING AND NOT FROM EXPLICIT SIGNIN
          if (newSession?.user && !isLoadingData.value) {
            console.log('🔄 SIGNED_IN event - loading user data from auth listener')
            await loadUserData()
          }
        } else if (event === 'TOKEN_REFRESHED') {
          session.value = newSession
          user.value = newSession?.user || null
          // NO DATA LOADING ON TOKEN REFRESH
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

      console.log('✅ Sign up successful, user profile will be auto-created')
      
      // If session exists (email confirmation disabled), the auth listener will handle data loading
      if (data.session) {
        session.value = data.session
        user.value = data.user
        // DON'T EXPLICITLY LOAD DATA - LET AUTH LISTENER HANDLE IT
      }

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
      
      // DON'T LOAD DATA HERE - LET AUTH LISTENER HANDLE IT
      console.log('✅ Sign in successful, auth listener will load user data')
      
      return { success: true }
    } catch (err) {
      console.error('Sign in error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Other auth methods remain the same...
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

  // Refresh user data (call when needed)
  async function refreshUserData() {
    return await loadUserData()
  }

  // Update password via Supabase Auth
  async function updatePassword(newPassword) {
    if (!isAuthenticated.value) {
      console.error('❌ Not authenticated for password update')
      return { success: false, error: 'Not authenticated' }
    }

    console.log('🔄 Account store updatePassword called')
    console.log('🔍 Session exists:', !!session.value)
    console.log('🔍 User exists:', !!user.value)
    console.log('🔍 Password length:', newPassword.length)
    
    profileLoading.value = true
    error.value = null
    
    try {
      console.log('🔄 Starting password update with race condition protection...')
      
      // Create the update promise
      const updatePromise = supabase.auth.updateUser({
        password: newPassword
      })
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Password update timed out after 15 seconds'))
        }, 15000)
      })
      
      console.log('⏱️ Starting race between update and timeout...')
      
      // Race between update and timeout
      const result = await Promise.race([updatePromise, timeoutPromise])
      
      console.log('📋 Password update completed:', result)
      
      const { data, error: updateError } = result

      if (updateError) {
        console.error('❌ Supabase returned error:', updateError)
        throw new Error(updateError.message || 'Password update failed')
      }

      if (!data) {
        console.error('❌ No data returned from password update')
        throw new Error('Password update returned no data')
      }

      console.log('✅ Password updated successfully:', {
        userEmail: data.user?.email,
        updatedAt: data.user?.updated_at
      })
      
      // Update local user data
      if (data.user) {
        user.value = data.user
      }
      
      return { success: true, data }
      
    } catch (err) {
      console.error('❌ Password update failed:', err)
      
      // Provide more specific error messages
      let errorMessage = err.message
      if (err.message.includes('timeout')) {
        errorMessage = 'Password update is taking too long. Please try again.'
      } else if (err.message.includes('weak')) {
        errorMessage = 'Password is too weak. Please use a stronger password.'
      } else if (err.message.includes('same')) {
        errorMessage = 'New password must be different from current password.'
      }
      
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      profileLoading.value = false
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
    profile,
    profileLoading,
    dataLoading,
    
    // Computed
    isAuthenticated,
    userEmail,
    fullName,
    
    // Actions
    initialize,
    signUp,
    signIn,
    signOut,
    clearError,
    loadUserData,
    updateProfile,
    updatePassword,
    refreshUserData
  }
})