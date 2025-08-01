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

async publishProject(projectId) {
  console.log('📤 Publishing project...', projectId)
  return await this.callEdgeFunction('publish-project', {
    method: 'POST',
    body: { projectId }
  })
}
  
  async deleteProject(projectId) {
    console.log('🔄 Deleting project...', projectId)
    console.log('🔍 Project ID type:', typeof projectId)
    console.log('🔍 Project ID length:', String(projectId).length)
    
    const functionUrl = `project-operations?id=${projectId}`
    const fullUrl = `${this.baseUrl}/${functionUrl}`
    
    console.log('🌐 Full request URL:', fullUrl)
    console.log('🔗 Base URL:', this.baseUrl)
    console.log('📋 Function URL:', functionUrl)
    
    try {
      const token = await this.getAuthToken()
      if (!token) {
        throw new Error('Not authenticated - no valid session token')
      }
      
      console.log('🔑 Auth token obtained, length:', token.length)
      console.log('⏰ Starting DELETE request at:', new Date().toISOString())
      
      // Add fetch timeout using AbortController
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('⏰ DELETE request TIMEOUT after 20 seconds')
        controller.abort()
      }, 20000)
      
      console.log('📡 Making DELETE request with headers:')
      console.log('  Authorization: Bearer ' + token.substring(0, 20) + '...')
      console.log('  Content-Type: application/json')
      console.log('  Accept: application/json')
      
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      console.log('📥 DELETE response received at:', new Date().toISOString())
      console.log('📊 Response status:', response.status)
      console.log('📊 Response statusText:', response.statusText)
      console.log('📊 Response ok:', response.ok)
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        console.log('❌ Response not ok, attempting to parse error...')
        
        let errorData
        try {
          const errorText = await response.text()
          console.log('📋 Raw error response:', errorText)
          
          try {
            errorData = JSON.parse(errorText)
            console.log('📋 Parsed error data:', errorData)
          } catch (jsonError) {
            console.log('❌ Error response is not valid JSON')
            errorData = { error: 'Request failed', message: errorText || `HTTP ${response.status}` }
          }
        } catch (textError) {
          console.log('❌ Could not read error response text')
          errorData = { error: 'Request failed', message: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        console.error('❌ Edge function delete failed:', errorData)
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
      }
      
      console.log('✅ Response ok, attempting to parse result...')
      
      let result
      try {
        const responseText = await response.text()
        console.log('📋 Raw success response:', responseText)
        
        if (responseText.trim() === '') {
          console.log('⚠️ Empty response body, assuming success')
          result = { success: true }
        } else {
          result = JSON.parse(responseText)
          console.log('📋 Parsed success result:', result)
        }
      } catch (parseError) {
        console.log('❌ Could not parse success response, assuming success:', parseError)
        result = { success: true }
      }
      
      console.log('✅ Edge function DELETE completed successfully')
      return result
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ DELETE request ABORTED due to timeout')
        throw new Error('Delete request timed out after 20 seconds')
      }
      
      console.error('❌ DELETE request failed:', error)
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
      
      throw error
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
  deleteProject,
  publishProject 
} = apiService