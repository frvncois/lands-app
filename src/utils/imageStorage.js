// IndexedDB storage for images to avoid localStorage quota issues
class ImageStorage {
  constructor() {
    this.dbName = 'LandsAppImages'
    this.version = 1
    this.db = null
  }
  
  async init() {
    if (this.db) return this.db
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => {
        console.error('❌ Failed to open IndexedDB:', request.error)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        this.db = request.result
        console.log('✅ IndexedDB opened successfully')
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Create images store if it doesn't exist
        if (!db.objectStoreNames.contains('images')) {
          const imageStore = db.createObjectStore('images', { keyPath: 'id' })
          imageStore.createIndex('projectId', 'projectId', { unique: false })
          console.log('📁 Created images object store')
        }
      }
    })
  }
  
  // Save image with unique ID
  async saveImage(projectId, itemType, itemId, fieldName, base64Data) {
    try {
      await this.init()
      
      const imageId = `${projectId}_${itemType}_${itemId}_${fieldName}`
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['images'], 'readwrite')
        const store = transaction.objectStore('images')
        
        const imageData = {
          id: imageId,
          projectId,
          itemType,
          itemId,
          fieldName,
          data: base64Data,
          saved: Date.now()
        }
        
        const request = store.put(imageData)
        
        request.onsuccess = () => {
          console.log(`💾 Image saved to IndexedDB: ${imageId}`)
          resolve(imageId)
        }
        
        request.onerror = () => {
          console.error('❌ Failed to save image:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('❌ Error saving image:', error)
      throw error
    }
  }
  
  // Get image by ID
  async getImage(imageId) {
    try {
      await this.init()
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['images'], 'readonly')
        const store = transaction.objectStore('images')
        const request = store.get(imageId)
        
        request.onsuccess = () => {
          const result = request.result
          if (result) {
            console.log(`📂 Image loaded from IndexedDB: ${imageId}`)
            resolve(result.data)
          } else {
            console.log(`❌ Image not found in IndexedDB: ${imageId}`)
            resolve(null)
          }
        }
        
        request.onerror = () => {
          console.error('❌ Failed to get image:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('❌ Error getting image:', error)
      return null
    }
  }
  
  // Get all images for a project
  async getProjectImages(projectId) {
    try {
      await this.init()
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['images'], 'readonly')
        const store = transaction.objectStore('images')
        const index = store.index('projectId')
        const request = index.getAll(projectId)
        
        request.onsuccess = () => {
          console.log(`📂 Loaded ${request.result.length} images for project ${projectId}`)
          resolve(request.result)
        }
        
        request.onerror = () => {
          console.error('❌ Failed to get project images:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('❌ Error getting project images:', error)
      return []
    }
  }
  
  // Delete image
  async deleteImage(imageId) {
    try {
      await this.init()
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['images'], 'readwrite')
        const store = transaction.objectStore('images')
        const request = store.delete(imageId)
        
        request.onsuccess = () => {
          console.log(`🗑️ Image deleted from IndexedDB: ${imageId}`)
          resolve()
        }
        
        request.onerror = () => {
          console.error('❌ Failed to delete image:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('❌ Error deleting image:', error)
    }
  }
  
  // Clear all images for a project
  async clearProjectImages(projectId) {
    try {
      const images = await this.getProjectImages(projectId)
      const deletePromises = images.map(img => this.deleteImage(img.id))
      await Promise.all(deletePromises)
      console.log(`🧹 Cleared all images for project ${projectId}`)
    } catch (error) {
      console.error('❌ Error clearing project images:', error)
    }
  }
}

export const imageStorage = new ImageStorage()