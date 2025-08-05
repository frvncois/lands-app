// User.js store - Back to real API calls, no dummy data
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
  // DATA LOADING (RESTORED TO API CALLS)
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
        invitations.value = response.data.invitations
        stats.value = response.data.stats
        
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
          session.value = newSession
          user.value = newSession?.user || null
          
          if (newSession?.user && !isLoadingData.value) {
            await loadUserData()
          }
          break
          
        case 'TOKEN_REFRESHED':
          session.value = newSession
          user.value = newSession?.user || null
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
        await loadUserData()
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
      await loadUserData()
      
      return { success: true }
    } catch (err) {
      console.error('❌ Sign in error:', err)
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
  // PROFILE METHODS (RESTORED TO API CALLS)
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
  // PROJECT METHODS (RESTORED TO API CALLS)
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


// =====================================================
// COLLABORATOR METHODS (NEW)
// =====================================================

  // Check if user exists by email
  async function checkUserExists(email) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
    
    try {
      console.log('🔄 Checking if user exists:', email)
      const response = await apiService.callEdgeFunction('check-user-exists', {
        method: 'POST',
        body: { email: email.toLowerCase().trim() }
      })
      
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
      
      const response = await apiService.callEdgeFunction('invite-collaborator', {
        method: 'POST',
        body: { 
          email: email.toLowerCase().trim(),
          name: name.trim(),
          project_ids: projectIds
        }
      })
      
      if (response.success) {
        console.log('✅ Collaborator invited successfully')
        
        // Reload user data to get updated invitations
        await loadUserData()
        
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
      
      const response = await apiService.callEdgeFunction('update-collaborator-invitation', {
        method: 'PUT',
        body: { 
          invitation_id: invitationId,
          email: email.toLowerCase().trim(),
          name: name.trim(),
          project_ids: projectIds
        }
      })
      
      if (response.success) {
        console.log('✅ Collaborator invitation updated successfully')
        
        // Reload user data to get updated invitations
        await loadUserData()
        
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
      
      const response = await apiService.callEdgeFunction('remove-collaborator-invitation', {
        method: 'DELETE',
        body: { invitation_id: invitationId }
      })
      
      if (response.success) {
        console.log('✅ Collaborator invitation removed successfully')
        
        // Reload user data to get updated invitations
        await loadUserData()
        
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

  // Helper function to get projects by collaborator (for UI compatibility)
  function getProjectsByCollaborator(accountId) {
    // Find invitations for this collaborator and return project IDs
    const collaboratorInvitations = invitations.value.filter(inv => inv.accountId === accountId)
    return collaboratorInvitations.flatMap(inv => inv.project_ids || [])
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
    
    // Profile methods
    updateProfile,
    
    // Project methods
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    clearCurrentProject,
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