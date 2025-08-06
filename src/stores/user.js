// Fixed user.js store with all issues addressed

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase.js'
import { apiService } from '@/services/api.js'
import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('user', () => {
  // =====================================================
  // AUTHENTICATION STATE
  // =====================================================
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // =====================================================
  // USER PROFILE STATE
  // =====================================================
  const profile = ref({
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    marketing_emails: false,
    created_at: null,
    updated_at: null
  })

  // =====================================================
  // PROJECTS STATE
  // =====================================================
  const projects = ref([])
  const invitations = ref([])
  const stats = ref({
    total_projects: 0,
    owned_projects: 0,
    collaborated_projects: 0,
    pending_invitations: 0
  })
  const currentProjectId = ref(null)

  // =====================================================
  // LOADING STATES
  // =====================================================
  const dataLoading = ref(false)
  const isLoadingData = ref(false)

  // =====================================================
  // COMPUTED PROPERTIES
  // =====================================================
  
  // Auth
  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const userEmail = computed(() => user.value?.email || '')
  const fullName = computed(() => {
    if (!profile.value.first_name && !profile.value.last_name) return ''
    return `${profile.value.first_name} ${profile.value.last_name}`.trim()
  })

  // Projects
  const currentProject = computed(() => 
    projects.value.find(p => p.id === currentProjectId.value)
  )

  const ownedProjects = computed(() => 
    projects.value.filter(p => p.user_role === 'owner')
  )
  
  const collaboratedProjects = computed(() => 
    projects.value.filter(p => p.user_role !== 'owner')
  )
  
  const recentProjects = computed(() => 
    projects.value
      .slice()
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5)
  )

  const getProjectById = computed(() => {
    return (id) => projects.value.find(p => p.id === id)
  })

  // =====================================================
  // DATA LOADING
  // =====================================================

  async function loadUserData() {
    if (!isAuthenticated.value) {
      console.log('❌ Cannot load user data - not authenticated')
      return { success: false, error: 'Not authenticated' }
    }

    if (isLoadingData.value) {
      console.log('🚫 Data loading already in progress')
      return { success: true, message: 'Already loading' }
    }

    isLoadingData.value = true
    dataLoading.value = true
    
    try {
      console.log('🔄 Loading user data from API...')
      
      const response = await apiService.getUserData()
      
      if (response.success) {
        // Set profile
        profile.value = response.data.profile
        
        // Map projects with complete structure
        projects.value = response.data.projects.map(project => ({
          // Basic project info
          id: project.id,
          name: project.name,
          description: project.description,
          location: project.location,
          cover_image: project.cover_image,
          url_slug: project.url_slug,
          
          // Ownership info
          owner_id: project.owner_id,
          user_role: project.user_role,
          owner_name: project.owner_name,
          owner_email: project.owner_email,
          
          // Timestamps
          created_at: project.created_at,
          updated_at: project.updated_at,
          
          // Settings
          settings: project.settings || {},
          
          // Design
          design: project.design || {},
          
          // Content arrays - ensure all exist
          links: project.links || [],
          socials: project.socials || [],
          contacts: project.contacts || [],
          socialLinks: project.socialLinks || [],
          posts: project.posts || [],
          releases: project.releases || [],
          shows: project.shows || [],
          merch: project.merch || []
        }))
        
        // Set invitations and stats
        invitations.value = response.data.invitations || []
        stats.value = response.data.stats || {
          total_projects: 0,
          owned_projects: 0,
          collaborated_projects: 0,
          pending_invitations: 0
        }
        
        console.log(`✅ API data loaded: ${profile.value.email}, ${stats.value.total_projects} projects`)
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error || 'Failed to load user data')
      }
    } catch (err) {
      console.error('❌ Failed to load user data:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      dataLoading.value = false
      isLoadingData.value = false
    }
  }

  // ✅ FIXED: Load invitations only (efficient method)
  async function loadInvitations() {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
    
    try {
      console.log('🔄 Loading invitations only...')
      
      const response = await apiService.getInvitations()
      
      if (response.success) {
        invitations.value = response.data.invitations || []
        
        // ✅ FIXED: Update all invitation-related stats
        if (response.data.stats) {
          stats.value.pending_invitations = response.data.stats.pending_invitations || 0
          // Don't overwrite other stats, just update invitation-related ones
          stats.value.accepted_invitations = response.data.stats.accepted_invitations || 0
          stats.value.declined_invitations = response.data.stats.declined_invitations || 0
          stats.value.total_invitations = response.data.stats.total_invitations || 0
        }
        
        console.log(`✅ Invitations loaded: ${invitations.value.length} invitations`)
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error || 'Failed to load invitations')
      }
    } catch (err) {
      console.error('❌ Failed to load invitations:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  async function initialize() {
    loading.value = true
    
    try {
      console.log('🚀 Initializing user store...')
      
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Session error:', error)
        throw error
      }

      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
        
        console.log('✅ Session restored:', currentSession.user.email)
        await loadUserData()
      } else {
        console.log('❌ No session found')
      }

      setupAuthListener()
      
    } catch (err) {
      console.error('❌ Init error:', err)
      error.value = err.message
      await clearAllData()
    } finally {
      loading.value = false
    }
  }

function setupAuthListener() {
  supabase.auth.onAuthStateChange(async (event, newSession) => {
    console.log('🔄 Auth changed:', event, newSession?.user?.email || 'no user')
    
    switch (event) {
      case 'SIGNED_OUT':
        await clearAllData()
        break
        
      case 'SIGNED_IN':
        // ALWAYS update session and user (security critical)
        session.value = newSession
        user.value = newSession?.user || null
        
        // Optional: Validate token integrity
        const isValidToken = await validateSession()
        if (!isValidToken) {
          console.warn('⚠️ Invalid token detected during auth validation')
          await clearAllData()
          return
        }
        
        // SMART data loading - only load if we don't have data for this user
        if (newSession?.user) {
          const currentUserEmail = newSession.user.email
          const hasCurrentUserData = profile.value.email === currentUserEmail
          
          if (!hasCurrentUserData && !isLoadingData.value) {
            console.log('🔄 New user session detected, loading user data...')
            await loadUserData()
          } else if (hasCurrentUserData) {
            console.log('✅ User data already current, auth validation complete')
          } else if (isLoadingData.value) {
            console.log('⏳ Data already loading, auth validation complete')
          }
        }
        break
        
      case 'TOKEN_REFRESHED':
        // ALWAYS update session (security critical)
        session.value = newSession
        user.value = newSession?.user || null
        console.log('🔄 Token refreshed - security validation complete')
        break
        
      case 'INITIAL_SESSION':
        // Handle initial session setup
        if (newSession) {
          session.value = newSession
          user.value = newSession?.user || null
          console.log('🔄 Initial session detected')
        }
        break
    }
  })
}

  async function clearAllData() {
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
    
    projects.value = []
    invitations.value = []
    stats.value = {
      total_projects: 0,
      owned_projects: 0,
      collaborated_projects: 0,
      pending_invitations: 0
    }
    currentProjectId.value = null
    
    console.log('🧹 All data cleared')
  }

  // =====================================================
  // AUTH METHODS
  // =====================================================

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
    
    console.log('✅ Sign in successful:', data.user.email)
    // REMOVED: await loadUserData() - auth listener will handle this
    
    return { success: true }
  } catch (err) {
    console.error('❌ Sign in error:', err)
    error.value = err.message
    return { success: false, error: err.message }
  } finally {
    loading.value = false
  }
}

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
    
    if (data.session && data.user?.email_confirmed_at) {
      session.value = data.session
      user.value = data.user
      // REMOVED: await loadUserData() - auth listener will handle this
      return { success: true, needsVerification: false }
    } else {
      return { success: true, needsVerification: true }
    }
  } catch (err) {
    console.error('❌ Sign up error:', err)
    error.value = err.message
    return { success: false, error: err.message }
  } finally {
    loading.value = false
  }
}

  async function signOut() {
    loading.value = true
    
    try {
      await supabase.auth.signOut()
      await clearAllData()
      console.log('✅ Sign out successful')
      return { success: true }
    } catch (err) {
      console.error('❌ Sign out error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function validateSession() {
    try {
      if (!session.value?.access_token) return false
      
      const decoded = jwtDecode(session.value.access_token)
      const now = Date.now() / 1000
      
      return decoded.exp > now
    } catch {
      return false
    }
  }

  // =====================================================
  // PROFILE METHODS
  // =====================================================

  async function updateProfile(updates) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
    
    try {
      const response = await apiService.updateProfile(updates)
      
      if (response.success) {
        Object.assign(profile.value, response.data)
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error || 'Failed to update profile')
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // =====================================================
  // PROJECT METHODS
  // =====================================================

  async function createProject(projectData) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }

    loading.value = true
    
    try {
      const response = await apiService.createProject(projectData)
      
      if (response.success) {
        const newProject = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
          url_slug: response.data.url_slug,
          owner_id: response.data.owner_id,
          user_role: 'owner',
          owner_name: fullName.value,
          owner_email: userEmail.value,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
          settings: response.data.settings || {},
          design: response.data.design || {},
          links: [],
          socials: [],
          contacts: [],
          socialLinks: [],
          posts: [],
          releases: [],
          shows: [],
          merch: []
        }
        
        projects.value.unshift(newProject)
        stats.value.total_projects++
        stats.value.owned_projects++
        
        return { success: true, data: newProject, projectId: newProject.id }
      } else {
        throw new Error(response.error || 'Failed to create project')
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function updateProject(projectId, updates) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
    
    try {
      const response = await apiService.updateProject(projectId, updates)
      
      if (response.success) {
        const index = projects.value.findIndex(p => p.id === projectId)
        if (index !== -1) {
          projects.value[index] = { ...projects.value[index], ...response.data }
        }
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error || 'Failed to update project')
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  async function deleteProject(projectId) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
    
    try {
      const response = await apiService.deleteProject(projectId)
      
      if (response.success) {
        const index = projects.value.findIndex(p => p.id === projectId)
        if (index !== -1) {
          const deletedProject = projects.value[index]
          projects.value.splice(index, 1)
          
          stats.value.total_projects--
          if (deletedProject.user_role === 'owner') {
            stats.value.owned_projects--
          } else {
            stats.value.collaborated_projects--
          }
        }
        
        if (currentProjectId.value === projectId) {
          currentProjectId.value = null
        }
        
        return { success: true }
      } else {
        throw new Error(response.error || 'Failed to delete project')
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  async function publishProject(projectId) {
  if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
  
  try {
    console.log('📤 Publishing project via user store...', projectId)
    
    const response = await apiService.publishProject(projectId)
    
    if (response.success) {
      // Update the published status in local projects array
      const index = projects.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        projects.value[index].settings = {
          ...projects.value[index].settings,
          published: true,
          publishedAt: response.data.publishedAt
        }
        console.log('✅ Project published status updated in store')
      }
      
      return { success: true, data: response.data }
    } else {
      throw new Error(response.error || 'Failed to publish project')
    }
  } catch (err) {
    console.error('❌ Failed to publish project:', err)
    error.value = err.message
    return { success: false, error: err.message }
  }
}

  // =====================================================
  // COLLABORATOR METHODS
  // =====================================================

  // Check if user exists by email
  async function checkUserExists(email) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
    
    try {
      console.log('🔄 Checking if user exists:', email)
      const response = await apiService.checkUserExists(email)
      
      if (response.success) {
        console.log('✅ User check complete:', response.data)
        return { 
          success: true, 
          exists: response.data.exists,
          user: response.data.user || null
        }
      } else {
        throw new Error(response.error || 'Failed to check user existence')
      }
    } catch (err) {
      console.error('❌ Failed to check user existence:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // Invite collaborator to projects
  async function inviteCollaborator({ email, name, selectedProjects }) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
    
    try {
      console.log('🔄 Inviting collaborator...', { email, name, projects: selectedProjects })
      
      // Prepare project IDs array
      const projectIds = Object.keys(selectedProjects).filter(id => selectedProjects[id])
      
      if (projectIds.length === 0) {
        throw new Error('At least one project must be selected')
      }
      
      const response = await apiService.inviteCollaborator({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        project_ids: projectIds
      })
      
      if (response.success) {
        console.log('✅ Collaborator invited successfully')
        
        // ✅ EFFICIENT: Only reload invitations, not entire user data
        await loadInvitations()
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error || 'Failed to invite collaborator')
      }
    } catch (err) {
      console.error('❌ Failed to invite collaborator:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // Update collaborator invitation
  async function updateCollaboratorInvitation(invitationId, { email, name, selectedProjects }) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
    
    try {
      console.log('🔄 Updating collaborator invitation...', { invitationId, email, name, projects: selectedProjects })
      
      // Prepare project IDs array
      const projectIds = Object.keys(selectedProjects).filter(id => selectedProjects[id])
      
      if (projectIds.length === 0) {
        throw new Error('At least one project must be selected')
      }
      
      const response = await apiService.updateCollaboratorInvitation(invitationId, {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        project_ids: projectIds
      })
      
      if (response.success) {
        console.log('✅ Collaborator invitation updated successfully')
        
        // ✅ EFFICIENT: Only reload invitations, not entire user data
        await loadInvitations()
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error || 'Failed to update collaborator invitation')
      }
    } catch (err) {
      console.error('❌ Failed to update collaborator invitation:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // Remove collaborator invitation
  async function removeCollaboratorInvitation(invitationId) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
    
    try {
      console.log('🔄 Removing collaborator invitation...', invitationId)
      
      const response = await apiService.removeCollaboratorInvitation(invitationId)
      
      if (response.success) {
        console.log('✅ Collaborator invitation removed successfully')
        
        // ✅ EFFICIENT: Only reload invitations, not entire user data
        await loadInvitations()
        
        return { success: true }
      } else {
        throw new Error(response.error || 'Failed to remove collaborator invitation')
      }
    } catch (err) {
      console.error('❌ Failed to remove collaborator invitation:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // ✅ FIXED: Helper function to get projects by collaborator 
  function getProjectsByCollaborator(accountId) {
    const invitation = invitations.value.find(inv => inv.id === accountId)
    return invitation?.project_ids || []
  }

  // =====================================================
  // PROJECT NAVIGATION
  // =====================================================

  function setCurrentProject(id) {
    currentProjectId.value = id
    const project = projects.value.find(p => p.id === id)
    if (project) {
      console.log('📝 Current project:', project.name)
    }
  }

  function clearCurrentProject() {
    currentProjectId.value = null
  }

  // =====================================================
  // RETURN STORE
  // =====================================================

  return {
    // Auth state
    user,
    session,
    loading,
    error,
    isAuthenticated,
    userEmail,
    fullName,
    
    // Profile state
    profile,
    
    // Projects state
    projects,
    invitations,
    stats,
    currentProjectId,
    currentProject,
    ownedProjects,
    collaboratedProjects,
    recentProjects,
    getProjectById,
    
    // Loading states
    dataLoading,
    
    // Auth methods
    initialize,
    signUp,
    signIn,
    signOut,
    validateSession,
    
    // Data methods
    loadUserData,
    loadInvitations, // ✅ FIXED: Added missing export
    
    // Profile methods
    updateProfile,
    
    // Project methods
    createProject,
    updateProject,
    deleteProject,
    publishProject,
    setCurrentProject,
    clearCurrentProject,
    
    // Collaborator methods
    checkUserExists,
    inviteCollaborator,
    updateCollaboratorInvitation,
    removeCollaboratorInvitation,
    getProjectsByCollaborator,
  }
}, {
  persist: {
    paths: ['currentProjectId'],
    storage: localStorage,
    beforeRestore: (context) => {
      console.log('🔄 Restoring persisted store data...')
    },
    afterRestore: (context) => {
      console.log('✅ Store data restored from localStorage')
    }
  }
})