// src/services/api.js
// Frontend service to call edge functions

import { supabase } from '@/services/supabase.js'

class ApiService {
  constructor() {
    this.baseUrl = `${supabase.supabaseUrl}/functions/v1`
  }

  // Get auth token for requests
  async getAuthToken() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
        return null
      }
      return session?.access_token || null
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }

  // Generic function to call edge functions
  async callEdgeFunction(functionName, options = {}) {
    const token = await this.getAuthToken()
    if (!token) {
      throw new Error('Not authenticated - no valid session token')
    }

    console.log(`🔗 Calling edge function: ${functionName} with token: ${token.substring(0, 20)}...`)

    const url = `${this.baseUrl}/${functionName}`
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    })

    // Handle different response types
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
      console.error(`❌ Edge function ${functionName} failed:`, errorData)
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
    }

    const result = await response.json()
    console.log(`✅ Edge function ${functionName} success`)
    return result
  }

  // =====================================================
  // USER DATA OPERATIONS
  // =====================================================

  // Load all user data (profile + projects + invitations)
  async getUserData() {
    console.log('🔄 Fetching user data...')
    return await this.callEdgeFunction('get-user-data')
  }

  // Update user profile
  async updateProfile(profileData) {
    console.log('🔄 Updating profile...', profileData)
    return await this.callEdgeFunction('update-user-profile', {
      method: 'PUT',
      body: profileData
    })
  }

  // =====================================================
  // PROJECT OPERATIONS
  // =====================================================

  // Create new project
  async createProject(projectData) {
    console.log('🔄 Creating project...', projectData)
    return await this.callEdgeFunction('project-operations', {
      method: 'POST',
      body: {
        name: projectData.name,
        description: projectData.description || '',
        url_slug: projectData.url_slug || ''
      }
    })
  }

  // Update existing project
  async updateProject(projectId, updates) {
    console.log('🔄 Updating project...', projectId, updates)
    
    const url = `project-operations?id=${projectId}`
    return await this.callEdgeFunction(url, {
      method: 'PUT',
      body: updates
    })
  }

  // Delete project
  async deleteProject(projectId) {
    console.log('🔄 Deleting project...', projectId)
    
    const url = `project-operations?id=${projectId}`
    return await this.callEdgeFunction(url, {
      method: 'DELETE'
    })
  }

  // =====================================================
  // ERROR HANDLING HELPERS
  // =====================================================

  // Wrapper with error handling and retry logic
  async apiCall(operation, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation()
      } catch (error) {
        console.error(`API call failed (attempt ${i + 1}/${retries}):`, error)
        
        // Don't retry on certain errors
        if (error.message.includes('Rate limit') || 
            error.message.includes('Unauthorized') ||
            error.message.includes('blocked')) {
          throw error
        }
        
        // Don't retry on last attempt
        if (i === retries - 1) {
          throw error
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
      }
    }
  }

  // Helper for handling rate limits
  async withRateLimit(operation) {
    try {
      return await operation()
    } catch (error) {
      if (error.message.includes('Rate limit')) {
        // Wait and retry once for rate limits
        console.log('⏳ Rate limited, waiting 60 seconds...')
        await new Promise(resolve => setTimeout(resolve, 60000))
        return await operation()
      }
      throw error
    }
  }
}

// Export singleton instance
export const apiService = new ApiService()

// Export individual methods for convenience
export const {
  getUserData,
  updateProfile,
  createProject,
  updateProject,
  deleteProject
} = apiService