/**
 * User Service - Handles user data persistence, import/export operations
 * This is part of the Controller layer in MVC architecture
 */
export class UserService {
  constructor(serviceManager = null) {
    this.serviceManager = serviceManager
  }

  /**
   * Export user data to JSON file
   */
  async exportUserToFile(userStore, userId) {
    try {
      const exportData = userStore.exportUser(userId)
      const user = userStore.getUserById(userId)
      
      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `guitarapp_user_${this.sanitizeFilename(user.name)}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)
      
      return { success: true, filename: link.download }
    } catch (error) {
      console.error('Error exporting user:', error)
      throw new Error(`Failed to export user: ${error.message}`)
    }
  }

  /**
   * Export all users to JSON file
   */
  async exportAllUsersToFile(userStore) {
    try {
      const exportData = userStore.exportAllUsers()
      
      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `guitarapp_all_users_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)
      
      return { success: true, filename: link.download }
    } catch (error) {
      console.error('Error exporting all users:', error)
      throw new Error(`Failed to export users: ${error.message}`)
    }
  }

  /**
   * Import user data from JSON file
   */
  async importUserFromFile(userStore, overwriteExisting = false) {
    return new Promise((resolve, reject) => {
      try {
        // Create file input
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        
        input.onchange = async (event) => {
          const file = event.target.files[0]
          if (!file) {
            reject(new Error('No file selected'))
            return
          }
          
          try {
            const text = await file.text()
            const importData = JSON.parse(text)
            
            // Validate import data
            if (!this.validateImportData(importData)) {
              reject(new Error('Invalid import file format'))
              return
            }
            
            // Import the user
            userStore.importUser(importData, overwriteExisting)
            
            resolve({ 
              success: true, 
              userName: importData.user.name,
              importDate: importData.exportDate
            })
          } catch (error) {
            reject(new Error(`Failed to parse import file: ${error.message}`))
          }
        }
        
        input.onerror = () => {
          reject(new Error('Failed to read file'))
        }
        
        // Trigger file selection
        input.click()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Import multiple users from JSON file
   */
  async importAllUsersFromFile(userStore) {
    return new Promise((resolve, reject) => {
      try {
        // Create file input
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        
        input.onchange = async (event) => {
          const file = event.target.files[0]
          if (!file) {
            reject(new Error('No file selected'))
            return
          }
          
          try {
            const text = await file.text()
            const importData = JSON.parse(text)
            
            // Validate import data
            if (!this.validateBulkImportData(importData)) {
              reject(new Error('Invalid import file format'))
              return
            }
            
            // Import each user
            const imported = []
            for (const userData of importData.users) {
              try {
                userStore.importUser({ user: userData }, false)
                imported.push(userData.name)
              } catch (error) {
                console.warn(`Failed to import user ${userData.name}:`, error)
              }
            }
            
            resolve({ 
              success: true, 
              importedUsers: imported,
              totalUsers: importData.users.length,
              importDate: importData.exportDate
            })
          } catch (error) {
            reject(new Error(`Failed to parse import file: ${error.message}`))
          }
        }
        
        input.onerror = () => {
          reject(new Error('Failed to read file'))
        }
        
        // Trigger file selection
        input.click()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Validate import data structure
   */
  validateImportData(data) {
    if (!data || typeof data !== 'object') return false
    if (!data.version || !data.user) return false
    if (!data.user.name || !data.user.data) return false
    return true
  }

  /**
   * Validate bulk import data structure
   */
  validateBulkImportData(data) {
    if (!data || typeof data !== 'object') return false
    if (!data.version || !Array.isArray(data.users)) return false
    if (data.users.length === 0) return false
    
    // Check each user has required fields
    return data.users.every(user => 
      user.name && user.data
    )
  }

  /**
   * Sanitize filename for safe file downloads
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats() {
    try {
      const usersData = localStorage.getItem('guitarapp_users')
      const metaData = localStorage.getItem('guitarapp_userMeta')
      
      const usersSize = usersData ? new Blob([usersData]).size : 0
      const metaSize = metaData ? new Blob([metaData]).size : 0
      
      return {
        totalSize: usersSize + metaSize,
        usersSize,
        metaSize,
        formattedSize: this.formatBytes(usersSize + metaSize)
      }
    } catch (error) {
      console.error('Error calculating storage stats:', error)
      return {
        totalSize: 0,
        usersSize: 0,
        metaSize: 0,
        formattedSize: '0 B'
      }
    }
  }

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * Create backup of current user data
   */
  createBackup(userStore) {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        currentUserId: userStore.currentUserId,
        users: JSON.parse(JSON.stringify(userStore.users))
      }
      
      localStorage.setItem('guitarapp_backup', JSON.stringify(backup))
      return { success: true, timestamp: backup.timestamp }
    } catch (error) {
      console.error('Error creating backup:', error)
      throw new Error(`Failed to create backup: ${error.message}`)
    }
  }

  /**
   * Restore from backup
   */
  restoreFromBackup(userStore) {
    try {
      const backupData = localStorage.getItem('guitarapp_backup')
      if (!backupData) {
        throw new Error('No backup found')
      }
      
      const backup = JSON.parse(backupData)
      
      userStore.users = JSON.parse(JSON.stringify(backup.users))
      userStore.currentUserId = backup.currentUserId
      userStore.saveUsersToStorage()
      
      // Restore store states
      userStore.restoreUserStoreStates()
      
      return { 
        success: true, 
        timestamp: backup.timestamp,
        usersRestored: backup.users.length
      }
    } catch (error) {
      console.error('Error restoring backup:', error)
      throw new Error(`Failed to restore backup: ${error.message}`)
    }
  }

  /**
   * Clone/duplicate a user
   */
  cloneUser(userStore, userId, newName) {
    try {
      const sourceUser = userStore.getUserById(userId)
      if (!sourceUser) {
        throw new Error('Source user not found')
      }
      
      // Create new user
      const newUserId = userStore.createUser(
        newName || `${sourceUser.name} (Copy)`,
        sourceUser.email,
        sourceUser.avatar
      )
      
      // Copy data
      const newUser = userStore.getUserById(newUserId)
      newUser.data = JSON.parse(JSON.stringify(sourceUser.data))
      
      userStore.saveUsersToStorage()
      
      return { success: true, newUserId, newUserName: newUser.name }
    } catch (error) {
      console.error('Error cloning user:', error)
      throw new Error(`Failed to clone user: ${error.message}`)
    }
  }

  /**
   * Export tab playlists to JSON file
   */
  async exportTabPlaylistsToFile(userStore, userId) {
    try {
      const user = userStore.getUserById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      const tabData = user.data.tabs || { playlists: [], files: [], metadata: {} }
      
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        userName: user.name,
        tabs: tabData
      }
      
      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `tabs_${this.sanitizeFilename(user.name)}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      return { success: true, filename: link.download }
    } catch (error) {
      console.error('Error exporting tab playlists:', error)
      throw new Error(`Failed to export tab playlists: ${error.message}`)
    }
  }

  /**
   * Import tab playlists from JSON file
   */
  async importTabPlaylistsFromFile(userStore, userId, mergeWithExisting = true) {
    return new Promise((resolve, reject) => {
      try {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        
        input.onchange = async (event) => {
          const file = event.target.files[0]
          if (!file) {
            reject(new Error('No file selected'))
            return
          }
          
          try {
            const text = await file.text()
            const importData = JSON.parse(text)
            
            if (!this.validateTabPlaylistImport(importData)) {
              reject(new Error('Invalid tab playlist file format'))
              return
            }
            
            const user = userStore.getUserById(userId)
            if (!user) {
              reject(new Error('User not found'))
              return
            }
            
            // Initialize tabs structure if needed
            if (!user.data.tabs) {
              user.data.tabs = { playlists: [], files: [], metadata: {} }
            }
            
            if (mergeWithExisting) {
              // Merge playlists
              const existingPlaylistNames = new Set(
                user.data.tabs.playlists.map(p => p.name)
              )
              
              importData.tabs.playlists.forEach(playlist => {
                if (!existingPlaylistNames.has(playlist.name)) {
                  // Regenerate IDs to avoid conflicts
                  playlist.id = Date.now() + Math.random()
                  playlist.tabs.forEach(tab => {
                    tab.id = Date.now() + Math.random()
                  })
                  user.data.tabs.playlists.push(playlist)
                }
              })
              
              // Merge files
              const existingFiles = new Set(user.data.tabs.files)
              importData.tabs.files.forEach(file => {
                if (!existingFiles.has(file)) {
                  user.data.tabs.files.push(file)
                }
              })
            } else {
              // Replace existing
              user.data.tabs = importData.tabs
            }
            
            userStore.saveUsersToStorage()
            
            resolve({
              success: true,
              playlistsImported: importData.tabs.playlists.length,
              importDate: importData.exportDate
            })
          } catch (error) {
            reject(new Error(`Failed to parse import file: ${error.message}`))
          }
        }
        
        input.onerror = () => {
          reject(new Error('Failed to read file'))
        }
        
        input.click()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Validate tab playlist import data
   */
  validateTabPlaylistImport(data) {
    if (!data || typeof data !== 'object') return false
    if (!data.version || !data.tabs) return false
    if (!Array.isArray(data.tabs.playlists)) return false
    return true
  }
}
