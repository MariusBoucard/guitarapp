/**
 * File Handle Service - Manages persistent storage of File System Access API handles
 * Uses IndexedDB to store file handles which can't be serialized to localStorage
 */
export class FileHandleService {
  constructor() {
    this.dbName = 'guitarapp_filehandles'
    this.storeName = 'handles'
    this.dbVersion = 1
    this.db = null
  }

  /**
   * Initialize IndexedDB
   */
  async initDB() {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' })
        }
      }
    })
  }

  /**
   * Store a file handle with a unique ID
   */
  async storeFileHandle(fileHandle) {
    if (!fileHandle) return null

    await this.initDB()

    const id = `handle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      const data = {
        id,
        handle: fileHandle,
        timestamp: Date.now()
      }
      
      const request = store.put(data)
      
      request.onsuccess = () => {
        console.log('Stored file handle:', id)
        resolve(id)
      }
      
      request.onerror = () => {
        console.error('Error storing file handle:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Retrieve a file handle by ID
   */
  async getFileHandle(id) {
    if (!id) return null

    await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)
      
      request.onsuccess = () => {
        if (request.result) {
          console.log('Retrieved file handle:', id)
          resolve(request.result.handle)
        } else {
          console.warn('File handle not found:', id)
          resolve(null)
        }
      }
      
      request.onerror = () => {
        console.error('Error retrieving file handle:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Delete a file handle by ID
   */
  async deleteFileHandle(id) {
    if (!id) return

    await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)
      
      request.onsuccess = () => {
        console.log('Deleted file handle:', id)
        resolve()
      }
      
      request.onerror = () => {
        console.error('Error deleting file handle:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Get all stored file handle IDs
   */
  async getAllHandleIds() {
    await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAllKeys()
      
      request.onsuccess = () => {
        resolve(request.result)
      }
      
      request.onerror = () => {
        console.error('Error getting all handle IDs:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Clear all stored file handles
   */
  async clearAllHandles() {
    await this.initDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()
      
      request.onsuccess = () => {
        console.log('Cleared all file handles')
        resolve()
      }
      
      request.onerror = () => {
        console.error('Error clearing file handles:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Verify if a file handle still has permission
   */
  async verifyHandlePermission(fileHandle, mode = 'read') {
    try {
      const permission = await fileHandle.queryPermission({ mode })
      return permission === 'granted'
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  /**
   * Request permission for a file handle
   */
  async requestHandlePermission(fileHandle, mode = 'read') {
    try {
      const permission = await fileHandle.requestPermission({ mode })
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting permission:', error)
      return false
    }
  }
}

// Export singleton instance
export const fileHandleService = new FileHandleService()
