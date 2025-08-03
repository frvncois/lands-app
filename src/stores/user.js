// User.js store with dummy data + localStorage persistence for changes
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase } from '@/services/supabase.js'
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
  // LOCALSTORAGE PERSISTENCE HELPERS
  // =====================================================

  const STORAGE_KEYS = {
    PROJECTS: 'user_store_projects',
    PROFILE: 'user_store_profile',
    STATS: 'user_store_stats'
  }

  // Save projects to localStorage
  function saveProjectsToStorage() {
    try {
      const projectsData = JSON.stringify(projects.value)
      localStorage.setItem(STORAGE_KEYS.PROJECTS, projectsData)
    } catch (error) {
      console.error('❌ Failed to save projects to localStorage:', error)
    }
  }

  // Save profile to localStorage
  function saveProfileToStorage() {
    try {
      const profileData = JSON.stringify(profile.value)
      localStorage.setItem(STORAGE_KEYS.PROFILE, profileData)
      console.log('💾 Profile saved to localStorage')
    } catch (error) {
      console.error('❌ Failed to save profile to localStorage:', error)
    }
  }

  // Save stats to localStorage
  function saveStatsToStorage() {
    try {
      const statsData = JSON.stringify(stats.value)
      localStorage.setItem(STORAGE_KEYS.STATS, statsData)
      console.log('💾 Stats saved to localStorage')
    } catch (error) {
      console.error('❌ Failed to save stats to localStorage:', error)
    }
  }

  // Load projects from localStorage
  function loadProjectsFromStorage() {
    try {
      const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS)
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects)
        console.log('📂 Found saved projects in localStorage:', parsedProjects.length)
        return parsedProjects
      }
    } catch (error) {
      console.error('❌ Failed to load projects from localStorage:', error)
    }
    return null
  }

  // Load profile from localStorage
  function loadProfileFromStorage() {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE)
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile)
        console.log('📂 Found saved profile in localStorage')
        return parsedProfile
      }
    } catch (error) {
      console.error('❌ Failed to load profile from localStorage:', error)
    }
    return null
  }

  // Load stats from localStorage
  function loadStatsFromStorage() {
    try {
      const savedStats = localStorage.getItem(STORAGE_KEYS.STATS)
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats)
        console.log('📂 Found saved stats in localStorage')
        return parsedStats
      }
    } catch (error) {
      console.error('❌ Failed to load stats from localStorage:', error)
    }
    return null
  }

  // Clear all localStorage data
  function clearAllStorage() {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROJECTS)
      localStorage.removeItem(STORAGE_KEYS.PROFILE)
      localStorage.removeItem(STORAGE_KEYS.STATS)
      console.log('🧹 Cleared all localStorage data')
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error)
    }
  }

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
  // WATCHERS FOR AUTO-SAVE
  // =====================================================

  // Watch projects for changes and auto-save
  watch(projects, () => {
    if (projects.value.length > 0) {
      saveProjectsToStorage()
    }
  }, { deep: true })

  // Watch profile for changes and auto-save
  watch(profile, () => {
    if (profile.value.id) {
      saveProfileToStorage()
    }
  }, { deep: true })

  // Watch stats for changes and auto-save
  watch(stats, () => {
    if (stats.value.total_projects > 0) {
      saveStatsToStorage()
    }
  }, { deep: true })

  // =====================================================
  // DUMMY DATA FUNCTION (WITH PERSISTENCE CHECK)
  // =====================================================

  function loadDummyData() {
    console.log('🎭 Loading dummy data for debugging...')
    
    // Check if we have saved data first
    const savedProjects = loadProjectsFromStorage()
    const savedProfile = loadProfileFromStorage()
    const savedStats = loadStatsFromStorage()

    if (savedProjects && savedProfile && savedStats) {
      console.log('🔄 Restoring data from localStorage instead of dummy data')
      projects.value = savedProjects
      profile.value = savedProfile
      stats.value = savedStats
      return
    }

    console.log('📝 No saved data found, loading fresh dummy data')
    
    // Set dummy profile
    profile.value = {
      id: 'user_123',
      first_name: 'John',
      last_name: 'Doe',
      email: user.value?.email || 'john.doe@example.com',
      marketing_emails: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-08-01T14:22:00Z'
    }

    // Set dummy projects
    const dummyProjects = [
      {
        id: 'proj_001',
        name: 'My Music Portfolio',
        description: 'A showcase of my latest music releases and upcoming shows',
        location: 'Los Angeles, CA',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        url_slug: 'my-music-portfolio',
        owner_id: 'user_123',
        user_role: 'owner',
        owner_name: 'John Doe',
        owner_email: user.value?.email || 'john.doe@example.com',
        created_at: '2024-06-15T09:00:00Z',
        updated_at: '2024-08-02T16:45:00Z',
        settings: {
          theme: 'dark',
          animations: true,
          analytics: false
        },
        design: {
          backgroundColor: '#1a1a1a',
          primaryColor: '#ff6b6b',
          secondaryColor: '#4ecdc4',
          fontFamily: 'Inter',
          layout: 'modern'
        },
        links: [
          {
            id: 'link_001',
            title: 'Latest Album on Spotify',
            url: 'https://open.spotify.com/album/example',
            description: 'Check out my newest release',
            icon: 'spotify',
            order: 1,
            created_at: '2024-07-01T12:00:00Z'
          },
          {
            id: 'link_002',
            title: 'YouTube Music Videos',
            url: 'https://youtube.com/@johndoe',
            description: 'Watch my latest music videos',
            icon: 'youtube',
            order: 2,
            created_at: '2024-07-02T14:30:00Z'
          }
        ],
        socials: [
          {
            id: 'social_001',
            platform: 'instagram',
            username: '@johndoemusic',
            url: 'https://instagram.com/johndoemusic',
            followers: 15420,
            order: 1
          },
          {
            id: 'social_002',
            platform: 'twitter',
            username: '@johndoemusic',
            url: 'https://twitter.com/johndoemusic',
            followers: 8931,
            order: 2
          }
        ],
        contacts: [
          {
            id: 'contact_001',
            type: 'email',
            title: 'Booking',
            url: 'booking@johndoe.com',
            primary: true
          },
          {
            id: 'contact_002',
            type: 'phone',
            title: 'Management',
            url: '+1 (555) 123-4567',
            primary: false
          }
        ],
        socialLinks: [
          {
            id: 'social_link_001',
            title: 'Instagram',
            url: 'https://instagram.com/johndoemusic'
          },
          {
            id: 'social_link_002',
            title: 'Twitter',
            url: 'https://twitter.com/johndoemusic'
          }
        ],
        posts: [
          {
            id: 'post_001',
            title: 'New Single Drop Tomorrow!',
            content: 'Excited to share my latest single with you all. Stay tuned!',
            type: 'announcement',
            published: true,
            created_at: '2024-08-01T10:00:00Z',
            updated_at: '2024-08-01T10:00:00Z'
          }
        ],
        releases: [
          {
            id: 'release_001',
            title: 'Midnight Dreams',
            type: 'single',
            release_date: '2024-07-15',
            cover_image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400',
            streaming_links: {
              spotify: 'https://open.spotify.com/track/example1',
              apple_music: 'https://music.apple.com/us/album/example1',
              youtube: 'https://youtube.com/watch?v=example1'
            },
            description: 'A dreamy electronic track perfect for late night listening'
          }
        ],
        shows: [
          {
            id: 'show_001',
            venue: 'The Echoplex',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            date: '2024-08-15',
            time: '20:00',
            ticket_url: 'https://ticketmaster.com/example1',
            price_range: '$25-35',
            status: 'on_sale'
          }
        ],
        merch: [
          {
            id: 'merch_001',
            name: 'Midnight Dreams T-Shirt',
            description: 'Official tour merch - black t-shirt with album artwork',
            price: 25.00,
            currency: 'USD',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            sizes: ['S', 'M', 'L', 'XL'],
            in_stock: true,
            shop_url: 'https://johndoemusic.bandcamp.com/merch/tshirt1'
          }
        ]
      },
      {
        id: 'proj_002',
        name: 'Side Project Band',
        description: 'Collaborative project with other local musicians',
        location: 'Nashville, TN',
        coverImage: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800',
        url_slug: 'side-project-band',
        owner_id: 'user_456',
        user_role: 'collaborator',
        owner_name: 'Jane Smith',
        owner_email: 'jane.smith@example.com',
        created_at: '2024-05-20T11:15:00Z',
        updated_at: '2024-07-30T09:20:00Z',
        settings: {
          theme: 'light',
          animations: false,
          analytics: true
        },
        design: {
          backgroundColor: '#ffffff',
          primaryColor: '#2c3e50',
          secondaryColor: '#e74c3c',
          fontFamily: 'Roboto',
          layout: 'classic'
        },
        links: [],
        socials: [],
        contacts: [],
        socialLinks: [],
        posts: [],
        releases: [],
        shows: [],
        merch: []
      }
    ]

    projects.value = dummyProjects
    
    // Set dummy invitations
    invitations.value = [
      {
        id: 'inv_001',
        project_id: 'proj_003',
        project_name: 'Jazz Collective',
        inviter_name: 'Mike Johnson',
        inviter_email: 'mike@jazzgroup.com',
        role: 'collaborator',
        status: 'pending',
        created_at: '2024-08-01T13:00:00Z'
      }
    ]

    // Set dummy stats
    stats.value = {
      total_projects: 2,
      owned_projects: 1,
      collaborated_projects: 1,
      pending_invitations: 1
    }

    console.log('✅ Fresh dummy data loaded and will be auto-saved')
  }

  // =====================================================
  // DATA LOADING (MODIFIED FOR DUMMY DATA + PERSISTENCE)
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
      console.log('🔄 Loading user data (DUMMY MODE + PERSISTENCE)...')
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Load dummy data (which checks for saved data first)
      loadDummyData()
      
      return { success: true, data: { profile: profile.value, projects: projects.value, invitations: invitations.value, stats: stats.value } }
      
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
  // AUTHENTICATION (UNCHANGED)
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
          clearAllStorage() // Clear localStorage on logout
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
  // AUTH METHODS (UNCHANGED)
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
      clearAllStorage() // Clear localStorage on sign out
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
  // PROFILE METHODS (MODIFIED FOR DUMMY DATA)
  // =====================================================

  async function updateProfile(updates) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
    
    try {
      console.log('🎭 Updating profile (DUMMY MODE + PERSISTENCE):', updates)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update dummy data (will auto-save via watcher)
      Object.assign(profile.value, updates)
      
      return { success: true, data: profile.value }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // =====================================================
  // PROJECT METHODS (MODIFIED FOR DUMMY DATA + PERSISTENCE)
  // =====================================================

  async function createProject(projectData) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }

    loading.value = true
    
    try {
      console.log('🎭 Creating project (DUMMY MODE + PERSISTENCE):', projectData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newProject = {
        id: `proj_${Date.now()}`,
        name: projectData.name,
        description: projectData.description || '',
        location: '',
        coverImage: '',
        url_slug: projectData.name.toLowerCase().replace(/\s+/g, '-'),
        owner_id: user.value.id,
        user_role: 'owner',
        owner_name: fullName.value,
        owner_email: userEmail.value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        settings: {
          theme: 'dark',
          animations: true,
          analytics: false
        },
        design: {
          backgroundColor: '#1a1a1a',
          primaryColor: '#ff6b6b',
          secondaryColor: '#4ecdc4',
          fontFamily: 'Inter',
          layout: 'modern'
        },
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
      console.log('🎭 Updating project (DUMMY MODE + PERSISTENCE):', projectId, updates)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const index = projects.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        // Deep merge to preserve reactivity (will auto-save via watcher)
        const currentProject = projects.value[index]
        Object.keys(updates).forEach(key => {
          if (updates[key] !== undefined) {
            currentProject[key] = updates[key]
          }
        })
        currentProject.updated_at = new Date().toISOString()
        
        console.log('✅ Project updated in store and will auto-save:', currentProject.name)
        return { success: true, data: currentProject }
      } else {
        throw new Error('Project not found')
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  async function deleteProject(projectId) {
    if (!isAuthenticated.value) return { success: false, error: 'Not authenticated' }
    
    try {
      console.log('🎭 Deleting project (DUMMY MODE + PERSISTENCE):', projectId)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
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
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  // =====================================================
  // RESET FUNCTION FOR DEBUGGING
  // =====================================================

  function resetToFreshDummyData() {
    console.log('🔄 Resetting to fresh dummy data...')
    clearAllStorage()
    loadDummyData()
    console.log('✅ Reset complete - fresh dummy data loaded')
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
    
    // Debug methods
    resetToFreshDummyData
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