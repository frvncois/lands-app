import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProjectStore = defineStore('projects', () => {
  const name = ref('')
  const projects = ref([])
  const currentProjectId = ref(null)
  
  const currentProject = computed(() =>
    projects.value.find(p => p.id === currentProjectId.value)
  )
  
  function setCurrentProject(id) {
    currentProjectId.value = id
  }
  
  function clearCurrentProject() {
    currentProjectId.value = null
  }
  
  function create(newName, theme = null, projectType = 'music-artist') {
    if (!newName.trim()) return null
    
    const newProject = {
      id: Date.now(),
      name: newName,
      description: '',
      coverImage: '',
      location: '',
      contacts: [],
      socialLinks: [],
      projectType: projectType,
      design: {
        backgroundColor: '',
        textColor: '',
        accentColor: '',
        font: '',
        titleFont: '', // Add title font
        textFont: '',  // Add text font
        theme: theme
      },
      settings: {
        url: '',
        published: false,
        plan: 'free',
        stripeSubscriptionId: null,
        subscriptionStatus: 'active'
      },
      // Core data arrays
      links: [],
      socials: [],
      posts: [],
      releases: [],
      shows: [],
      merch: [],
      // MusicBrainz integration data
      musicbrainzData: null
    }
    
    projects.value.push(newProject)
    name.value = ''
    return newProject.id
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
  
  async function checkSubscriptionStatus(projectId) {
    try {
      const response = await fetch(`http://localhost:3000/api/stripe/subscription-status/${projectId}`)
      const data = await response.json()
      const project = projects.value.find(p => p.id === projectId)
      
      if (project) {
        if (data.isActive) {
          project.settings.plan = data.planId
          project.settings.subscriptionStatus = data.status
          project.settings.stripeSubscriptionId = data.subscriptionId
        } else {
          project.settings.plan = 'free'
          project.settings.subscriptionStatus = 'inactive'
          project.settings.stripeSubscriptionId = null
        }
      }
      
      return data
    } catch (error) {
      console.error('Error checking subscription:', error)
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        project.settings.plan = 'free'
        project.settings.subscriptionStatus = 'inactive'
      }
      return { isActive: false, planId: 'free' }
    }
  }
  
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
  
  function reset() {
    name.value = ''
    projects.value = []
    currentProjectId.value = null
  }
  
  return {
    name,
    projects,
    currentProjectId,
    currentProject,
    setCurrentProject,
    clearCurrentProject,
    create,
    getProjectsByType,
    getProjectTypeInfo,
    reset,
    checkSubscriptionStatus,
    hasFeature
  }
}, {
  persist: true
})