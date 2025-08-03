// /utils/crud.js
import { getCurrentTimestamp } from '@/utils/time.js'

/**
 * Generic CRUD utilities for project content arrays
 * Works with any content type: links, socials, posts, releases, shows, merch
 */

export function createItem(project, contentType, itemTemplate = {}) {
  if (!project[contentType]) {
    project[contentType] = []
  }
  
  // Get the next order value (highest + 1)
  const maxOrder = project[contentType].length > 0 
    ? Math.max(...project[contentType].map(item => item.order || 0))
    : 0
  
  const newItem = {
    name: '',
    ...itemTemplate,
    order: maxOrder + 1,
    saved: false,
    createdAt: null,
    updatedAt: null
  }
  
  project[contentType].push(newItem)
  return project[contentType].length - 1 // Return new index
}

export function saveItem(project, contentType, index) {
  if (!project[contentType] || !project[contentType][index]) {
    return false
  }
  
  const timestamp = getCurrentTimestamp()
  const item = project[contentType][index]
  
  // Set createdAt if new item
  if (!item.createdAt) {
    item.createdAt = timestamp
  }
  
  // Always update updatedAt
  item.updatedAt = timestamp
  item.saved = true
  
  console.log(`${contentType} item saved:`, item)
  return true
}

export function deleteItem(project, contentType, index) {
  if (!project[contentType] || index < 0 || index >= project[contentType].length) {
    return false
  }
  
  project[contentType].splice(index, 1)
  return true
}

export function getSavedItems(project, contentType) {
  if (!project[contentType]) return []
  return project[contentType]
    .filter(item => item.saved !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
}

export function cleanupUnsavedItems(project, contentType) {
  if (!project[contentType]) return
  project[contentType] = project[contentType].filter(item => item.saved !== false)
}

export function reorderItems(project, contentType, oldIndex, newIndex) {
  const items = getSavedItems(project, contentType)
  if (oldIndex < 0 || oldIndex >= items.length || newIndex < 0 || newIndex >= items.length) {
    return false
  }
  
  // Move item from oldIndex to newIndex
  const [movedItem] = items.splice(oldIndex, 1)
  items.splice(newIndex, 0, movedItem)
  
  // Update order values after reordering
  items.forEach((item, index) => {
    item.order = index + 1
    item.updatedAt = getCurrentTimestamp() // Track when reordered
  })
  
  return true
}

export function fixOrderValues(project, contentType) {
  // Helper function to fix any gaps or duplicates in order values
  const items = getSavedItems(project, contentType)
  items.forEach((item, index) => {
    item.order = index + 1
  })
}

export function getItemTemplates() {
  return {
    links: {
      name: '',
      url: '',
      img: ''
    },
    socials: {
      name: '',
      platform: '',
      url: '',
      username: '',
      hidden: false,
      protected: false,
      password: '',
      requireEmail: false,
      status: 'public'
    },
    posts: {
      title: '',
      content: '',
      img: '',
      links: [],
      hidden: false,
      protected: false,
      password: '',
      requireEmail: false,
      status: 'public',
      published: false
    },
    releases: {
      title: '',
      img: '',
      releaseDate: '',
      label: '',
      details: '',
      tracks: [],
      links: [],
      connectedMerch: '',
      hidden: false,
      protected: false,
      password: '',
      requireEmail: false,
      status: 'public'
    },
    shows: {
      title: '',
      details: '',
      img: '',
      date: '',
      links: [],
      hidden: false,
      protected: false,
      password: '',
      requireEmail: false,
      status: 'public'
    },
    merch: {
      title: '',
      details: '',
      img: '',
      links: [],
      hidden: false,
      protected: false,
      password: '',
      requireEmail: false,
      status: 'public'
    }
  }
}