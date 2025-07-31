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

  // Create new project via secure edge function
  async function create(newName, theme = null, projectType = 'music-artist') {
    if (!newName.trim()) return null

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
      
      const projectData = {
        name: newName,
        description: '',
        url_slug: urlSlug,
        settings: {
          projectType,
          design: {
            backgroundColor: '',
            textColor: '',
            accentColor: '',
            font: '',
            titleFont: '',
            textFont: '',
            theme
          },
          plan: 'free',
          published: false,
          stripeSubscriptionId: null,
          subscriptionStatus: 'active',
          
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
        }
      }
      
      const response = await apiService.createProject(projectData)
      
      if (response.success) {
        // Add new project to local store with legacy structure
        const newProject = {
          // API data
          id: response.data.id,
          name: response.data.name,
          description: response.data.description || '',
          url_slug: response.data.url_slug || '',
          owner_id: response.data.owner_id,
          user_role: 'owner',
          owner_name: useAccountStore().fullName || 'You',
          owner_email: useAccountStore().userEmail || '',
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
          
          // Legacy structure
          projectType,
          design: projectData.settings.design,
          settings: {
            url: response.data.url_slug || '',
            published: false,
            plan: 'free',
            stripeSubscriptionId: null,
            subscriptionStatus: 'active'
          },
          
          // Core data
          coverImage: '',
          location: '',
          contacts: [],
          socialLinks: [],
          links: [],
          socials: [],
          posts: [],
          releases: [],
          shows: [],
          merch: [],
          musicbrainzData: null
        }
        
        projects.value.unshift(newProject)
        
        // Update stats
        stats.value.total_projects++
        stats.value.owned_projects++
        
        // Clear name field
        name.value = ''
        
        console.log('✅ Project created successfully:', newProject.id)
        return newProject.id
      } else {
        throw new Error(response.error || 'Failed to create project')
      }
    } catch (err) {
      console.error('Failed to create project:', err)
      error.value = err.message
      return null
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

  // =====================================================
  // LEGACY FUNCTIONS (Updated for API)
  // =====================================================

  // Set current project
  function setCurrentProject(id) {
    currentProjectId.value = id
    const project = projects.value.find(p => p.id === id)
    if (project) {
      console.log('📝 Current project set:', project.name)
    } else {
      console.warn('⚠️ Project not found:', id)
    }
  }
  
  function clearCurrentProject() {
    currentProjectId.value = null
  }

  // Get projects by type
  function getProjectsByType(type) {
    return projects.value.filter(p => p.projectType === type)
  }
  
  // Get project type display info
  function getProjectTypeInfo(type) {
    const types = {
      'music-artist': { name: 'Music Artist', icon: '🎤', color: '#1976d2' },
      'label': { name: 'Label', icon: '🏷️', color: '#388e3c' },
      'promoter': { name: 'Promoter', icon: '📢', color: '#f57c00' },
      'venue': { name: 'Venue', icon: '🏛️', color: '#7b1fa2' },
      'festival': { name: 'Festival', icon: '🎪', color: '#d32f2f' }
    }
    
    return types[type] || { name: 'Project', icon: '📁', color: '#757575' }
  }

  // Check subscription status (updated for secure API)
  async function checkSubscriptionStatus(projectId) {
    try {
      // This would need to be implemented as an edge function too
      // For now, return project settings
      const project = projects.value.find(p => p.id === projectId)
      if (!project) return { isActive: false, planId: 'free' }
      
      return {
        isActive: project.settings.subscriptionStatus === 'active',
        planId: project.settings.plan,
        status: project.settings.subscriptionStatus,
        subscriptionId: project.settings.stripeSubscriptionId
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
      return { isActive: false, planId: 'free' }
    }
  }
  
  // Check if project has feature
  function hasFeature(projectId, feature) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return false
    
    const planId = project.settings.plan
    const features = {
      free: {
        analytics: false,
        customDomain: false,
        teamCollaboration: false,
        apiAccess: false
      },
      basic: {
        analytics: true,
        customDomain: true,
        teamCollaboration: false,
        apiAccess: false
      },
      pro: {
        analytics: true,
        customDomain: true,
        teamCollaboration: true,
        apiAccess: true
      }
    }
    
    return features[planId]?.[feature] || false
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

  // Refresh projects data
  async function refreshProjects() {
    const accountStore = useAccountStore()
    return await accountStore.loadUserData()
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
    refreshProjects,
    
    // Legacy Functions (Updated)
    create,
    setCurrentProject,
    clearCurrentProject,
    getProjectsByType,
    getProjectTypeInfo,
    checkSubscriptionStatus,
    hasFeature,
    reset,
    clearError
  }
}, {
  persist: {
    // Only persist basic data, not API responses
    paths: ['currentProjectId', 'name']
  }
})