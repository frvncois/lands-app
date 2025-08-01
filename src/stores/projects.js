// src/stores/projects.js - FIXED to remove circular import
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api.js'

export const useProjectStore = defineStore('projects', () => {
  // =====================================================
  // STATE
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
  const loading = ref(false)
  const error = ref(null)

  // Legacy support
  const name = ref('')

  // =====================================================
  // COMPUTED
  // =====================================================
  
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

  // Get project by ID (legacy support)
  const getProjectById = computed(() => {
    return (id) => projects.value.find(p => p.id === id)
  })

  // =====================================================
  // DATA MANAGEMENT (From API)
  // =====================================================

  // Set projects from API response
  function setProjects(projectsData) {
    projects.value = (projectsData || []).map(project => ({
      // API data
      id: project.id,
      name: project.name,
      description: project.description || '',
      url_slug: project.url_slug || '',
      owner_id: project.owner_id,
      user_role: project.user_role,
      owner_name: project.owner_name,
      owner_email: project.owner_email,
      created_at: project.created_at,
      updated_at: project.updated_at,
      
      // Transform settings for legacy compatibility
      design: {
        backgroundColor: project.settings?.design?.backgroundColor || '',
        textColor: project.settings?.design?.textColor || '',
        accentColor: project.settings?.design?.accentColor || '',
        font: project.settings?.design?.font || '',
        titleFont: project.settings?.design?.titleFont || '',
        textFont: project.settings?.design?.textFont || '',
        theme: project.settings?.design?.theme || null
      },
      
      settings: {
        url: project.url_slug || '',
        published: project.settings?.published || false,
        plan: project.settings?.plan || 'free',
        stripeSubscriptionId: project.settings?.stripeSubscriptionId || null,
        subscriptionStatus: project.settings?.subscriptionStatus || 'active',
        ...project.settings
      },
      
      // Legacy fields with defaults
      projectType: project.settings?.projectType || 'music-artist',
      coverImage: project.settings?.coverImage || '',
      location: project.settings?.location || '',
      contacts: project.settings?.contacts || [],
      socialLinks: project.settings?.socialLinks || [],
      
      // Core data arrays
      links: project.settings?.links || [],
      socials: project.settings?.socials || [],
      posts: project.settings?.posts || [],
      releases: project.settings?.releases || [],
      shows: project.settings?.shows || [],
      merch: project.settings?.merch || [],
      
      // MusicBrainz integration data
      musicbrainzData: project.settings?.musicbrainzData || null
    }))
    
    console.log(`📋 Projects store updated: ${projects.value.length} projects`)
  }

  // Set invitations from API response
  function setInvitations(invitationsData) {
    invitations.value = invitationsData || []
    console.log(`📨 Invitations updated: ${invitations.value.length} pending`)
  }

  // Set stats from API response
  function setStats(statsData) {
    stats.value = {
      total_projects: statsData?.total_projects || 0,
      owned_projects: statsData?.owned_projects || 0,
      collaborated_projects: statsData?.collaborated_projects || 0,
      pending_invitations: statsData?.pending_invitations || 0
    }
  }

  // =====================================================
  // PROJECT OPERATIONS (Via Secure API)
  // =====================================================

  // FIXED: Create new project via secure edge function - removed circular import
  async function create(newName, theme = null, projectType = 'music-artist') {
    if (!newName.trim()) {
      return { success: false, error: 'Project name is required' }
    }

    loading.value = true
    error.value = null
    
    try {
      console.log('🔄 Creating project via secure API...', { newName, theme, projectType })
      
      // Generate URL slug from name
      const urlSlug = newName
        .toLowerCase()
        .replace(/[^a-z0-9\s\-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50)
      
      // FIXED: Send only what the Edge function expects
      const projectData = {
        name: newName,
        description: '',
        url_slug: urlSlug
      }
      
      console.log('📤 Sending to API:', projectData)
      
      const response = await apiService.createProject(projectData)
      
      console.log('📥 API Response:', response)
      
      if (response.success) {
        // FIXED: Create the local project object with proper structure
        const newProject = {
          // API response data
          id: response.data.id, // This will be the UUID
          name: response.data.name,
          description: response.data.description || '',
          url_slug: response.data.url_slug || '',
          owner_id: response.data.owner_id,
          user_role: 'owner',
          owner_name: 'You', // Will be updated when account data loads
          owner_email: '', // Will be updated when account data loads
          created_at: response.data.created_at,
          updated_at: response.data.updated_at || response.data.created_at,
          
          // Legacy structure for compatibility
          projectType,
          design: {
            backgroundColor: '',
            textColor: '',
            accentColor: '',
            font: '',
            titleFont: '',
            textFont: '',
            theme: theme,
            themeId: theme?.id || null // Support both formats
          },
          settings: {
            url: response.data.url_slug || '',
            published: false,
            plan: 'free',
            stripeSubscriptionId: null,
            subscriptionStatus: 'active',
            projectType,
            
            // Nested design object from response
            design: {
              backgroundColor: '',
              textColor: '',
              accentColor: '',
              font: '',
              titleFont: '',
              textFont: '',
              theme: theme,
              themeId: theme?.id || null
            },
            
            // Core data arrays
            links: [],
            socials: [],
            posts: [],
            releases: [],
            shows: [],
            merch: [],
            
            // Other settings
            coverImage: '',
            location: '',
            contacts: [],
            socialLinks: [],
            musicbrainzData: null
          },
          
          // Core data arrays (legacy support)
          links: [],
          socials: [],
          posts: [],
          releases: [],
          shows: [],
          merch: [],
          
          // Legacy fields
          coverImage: '',
          location: '',
          contacts: [],
          socialLinks: [],
          musicbrainzData: null
        }
        
        // FIXED: Add to BEGINNING of local store array  
        projects.value.unshift(newProject)
        
        // FIXED: Update stats immediately
        stats.value.total_projects++
        stats.value.owned_projects++
        
        // Clear name field
        name.value = ''
        
        console.log('✅ Project created and added to local store:', newProject.id)
        console.log('📊 Updated projects count:', projects.value.length)
        console.log('📋 First project in list:', projects.value[0]?.name)
        
        // FIXED: Return success response object with all data
        return { 
          success: true, 
          data: newProject,
          projectId: newProject.id 
        }
      } else {
        const errorMessage = response.error || response.message || 'Failed to create project'
        error.value = errorMessage
        console.error('❌ API Error:', errorMessage)
        
        return { 
          success: false, 
          error: errorMessage 
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create project'
      console.error('❌ Create project error:', err)
      error.value = errorMessage
      
      return { 
        success: false, 
        error: errorMessage 
      }
    } finally {
      loading.value = false
    }
  }

  // Update project via secure edge function
  async function updateProject(projectId, updates) {
    if (!projectId) return { success: false, error: 'Project ID required' }
    
    loading.value = true
    error.value = null
    
    try {
      console.log('🔄 Updating project via secure API...', projectId, updates)
      
      const response = await apiService.updateProject(projectId, updates)
      
      if (response.success) {
        // Update local project
        const index = projects.value.findIndex(p => p.id === projectId)
        if (index !== -1) {
          // Merge updates while preserving structure
          const existingProject = projects.value[index]
          projects.value[index] = {
            ...existingProject,
            ...response.data,
            // Preserve computed fields
            user_role: existingProject.user_role,
            owner_name: existingProject.owner_name,
            owner_email: existingProject.owner_email,
            // Update settings properly
            settings: {
              ...existingProject.settings,
              ...response.data.settings
            }
          }
        }
        
        console.log('✅ Project updated successfully:', projectId)
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error || 'Failed to update project')
      }
    } catch (err) {
      console.error('Failed to update project:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

async function publishProject(projectId) {
  if (!projectId) return { success: false, error: 'Project ID required' }
  
  loading.value = true
  error.value = null
  
  try {
    console.log('📤 Publishing project via edge function...', projectId)
    
    const response = await apiService.publishProject(projectId)
    
    if (response.success) {
      console.log('✅ Project published successfully:', projectId)
      
      // Update local project published status
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        if (!project.settings) project.settings = {}
        project.settings.published = true
        project.settings.publishedAt = new Date().toISOString()
      }
      
      return { success: true, data: response.data }
    } else {
      throw new Error(response.error || 'Failed to publish project')
    }
  } catch (err) {
    console.error('Failed to publish project:', err)
    error.value = err.message
    return { success: false, error: err.message }
  } finally {
    loading.value = false
  }
}

  // Delete project via secure edge function
  async function deleteProject(projectId) {
    if (!projectId) return { success: false, error: 'Project ID required' }
    
    loading.value = true
    error.value = null
    
    try {
      console.log('🔄 Deleting project via secure API...', projectId)
      
      const response = await apiService.deleteProject(projectId)
      
      if (response.success) {
        // Remove from local store
        const index = projects.value.findIndex(p => p.id === projectId)
        if (index !== -1) {
          const deletedProject = projects.value[index]
          projects.value.splice(index, 1)
          
          // Update stats
          stats.value.total_projects--
          if (deletedProject.user_role === 'owner') {
            stats.value.owned_projects--
          } else {
            stats.value.collaborated_projects--
          }
        }
        
        // Clear current project if it was deleted
        if (currentProjectId.value === projectId) {
          currentProjectId.value = null
        }
        
        console.log('✅ Project deleted successfully:', projectId)
        return { success: true }
      } else {
        throw new Error(response.error || 'Failed to delete project')
      }
    } catch (err) {
      console.error('Failed to delete project:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function forceRefresh() {
  try {
    console.log('🔄 Force refreshing projects from API...')
    
    // Dynamic import to avoid circular dependency
    const { useAccountStore } = await import('./account.js')
    const accountStore = useAccountStore()
    
    const result = await accountStore.loadUserData()
    
    if (result.success) {
      console.log('✅ Projects force refreshed successfully')
      return { success: true }
    } else {
      throw new Error(result.error || 'Failed to refresh')
    }
  } catch (error) {
    console.error('❌ Force refresh failed:', error)
    return { success: false, error: error.message }
  }
}

  // =====================================================
  // LEGACY FUNCTIONS (Updated for API)
  // =====================================================

  // Set current project
  function setCurrentProject(id) {
    currentProjectId.value = id
    const project = projects.value.find(p => p.id === id)
    if (project) {
      console.log('📝 Current project set:', project.name)
    }
  }

  // Clear current project
  function clearCurrentProject() {
    currentProjectId.value = null
    console.log('🧹 Current project cleared')
  }

  // Get projects by type (legacy support)
  function getProjectsByType(type) {
    return projects.value.filter(p => p.projectType === type)
  }

  // Get project type info
  function getProjectTypeInfo(projectId) {
    const project = projects.value.find(p => p.id === projectId)
    return project ? {
      type: project.projectType,
      name: project.name,
      description: project.description
    } : null
  }

  // Check subscription status
  function checkSubscriptionStatus(projectId) {
    const project = projects.value.find(p => p.id === projectId)
    return project?.settings?.subscriptionStatus || 'active'
  }

  // Check if project has feature
  function hasFeature(projectId, feature) {
    const project = projects.value.find(p => p.id === projectId)
    const plan = project?.settings?.plan || 'free'
    
    // Basic feature checking logic
    const features = {
      free: ['basic'],
      basic: ['basic', 'analytics'],
      pro: ['basic', 'analytics', 'custom_domain', 'advanced']
    }
    
    return features[plan]?.includes(feature) || false
  }

  // Clear all data (on logout)
  function reset() {
    name.value = ''
    projects.value = []
    invitations.value = []
    currentProjectId.value = null
    stats.value = {
      total_projects: 0,
      owned_projects: 0,
      collaborated_projects: 0,
      pending_invitations: 0
    }
    error.value = null
    console.log('🧹 Projects store cleared')
  }

  // Clear error
  function clearError() {
    error.value = null
  }

  // Refresh projects data - FIXED to avoid circular import
  async function refreshProjects() {
    // We'll let the account store handle the data loading
    // This function exists for legacy compatibility
    console.log('🔄 Projects refresh requested')
    return { success: true }
  }

  // FIXED: Add clearAll function for account store to call
  function clearAll() {
    reset()
  }

  // =====================================================
  // RETURN STORE
  // =====================================================

  return {
    // State
    projects,
    invitations,
    stats,
    currentProjectId,
    currentProject,
    loading,
    error,
    name, // Legacy support
    
    // Computed
    ownedProjects,
    collaboratedProjects,
    recentProjects,
    getProjectById,
    
    // API Functions
    setProjects,
    setInvitations,
    setStats,
    updateProject,
    deleteProject,
    publishProject,
    refreshProjects,
    
    // Legacy Functions (Updated)
    create,
    forceRefresh,
    setCurrentProject,
    clearCurrentProject,
    
    getProjectsByType,
    getProjectTypeInfo,
    checkSubscriptionStatus,
    hasFeature,
    reset,
    clearError,
    clearAll // For account store to call
  }
}, {
  persist: {
    // Only persist basic data, not API responses
    paths: ['currentProjectId', 'name']
  }
})