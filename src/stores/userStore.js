/**
 * User Store - Manages user profiles and their associated data
 * Each user has their own instance of trainings, videos, settings, etc.
 * This is the Model layer for user management in MVC architecture
 */
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    // Current active user
    currentUserId: null,
    currentUserName: '',
    
    // List of all users
    users: [
      {
        id: 'default',
        name: 'Default User',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        avatar: '',
        email: '',
        
        // User-specific data (complete structure for proper initialization)
        data: {
          trainings: [],
          videos: [],
          niouTrainingList: [],
          videoMetadata: {
            lastUpdated: null,
            totalVideos: 0,
            totalTrainings: 0,
            averageDuration: 0
          },
          settings: {
            mancheDisplay: true,
            notesSelectedDisplay: true,
            tunerDisplay: false,
            pictureDisplay: false,
            soundDisplay: false,
            scalesDisplay: true,
            videoDisplay: false,
            videoDisplayNew: true,
            gameDisplay: false,
            chordssuggestDisplay: false
          },
          notes: {
            noteSlectedList: [],
            gammeSelected: ""
          },
          colors: [],
          tuning: {
            nbfrettes: 24,
            diapason: 648,
            nbStrings: 6,
            tuningList: []
          },
          audioFiles: [],
          videoFiles: []
        }
      }
    ],
    
    // Import/Export metadata
    lastExportDate: null,
    lastImportDate: null
  }),
  
  getters: {
    // Get current active user
    currentUser: (state) => {
      return state.users.find(user => user.id === state.currentUserId) || state.users[0]
    },
    
    // Get all user names
    userNames: (state) => {
      return state.users.map(user => ({ id: user.id, name: user.name }))
    },
    
    // Check if user exists
    userExists: (state) => (userId) => {
      return state.users.some(user => user.id === userId)
    },
    
    // Get user by ID
    getUserById: (state) => (userId) => {
      return state.users.find(user => user.id === userId)
    },
    
    // Get total users count
    totalUsers: (state) => state.users.length,
    
    // Get user data for current user
    currentUserData: (state) => {
      const user = state.users.find(user => user.id === state.currentUserId)
      return user ? user.data : null
    }
  },
  
  actions: {
    // Initialize - load users from storage and set active user
    initialize() {
      this.loadUsersFromStorage()
      
      // Set current user from storage or use default
      const savedUserId = localStorage.getItem('guitarapp_currentUserId')
      if (savedUserId && this.userExists(savedUserId)) {
        this.currentUserId = savedUserId
      } else if (this.users.length > 0) {
        this.currentUserId = this.users[0].id
        this.currentUserName = this.users[0].name
      }
      
      this.updateLastActive()
    },
    
    // Create new user
    createUser(userName, email = '', avatar = '') {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const newUser = {
        id: userId,
        name: userName,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        avatar,
        email,
        data: {
          trainings: [],
          videos: [],
          niouTrainingList: [],
          videoMetadata: {
            lastUpdated: null,
            totalVideos: 0,
            totalTrainings: 0,
            averageDuration: 0
          },
          settings: {
            mancheDisplay: true,
            notesSelectedDisplay: true,
            tunerDisplay: false,
            pictureDisplay: false,
            soundDisplay: false,
            scalesDisplay: true,
            videoDisplay: false,
            videoDisplayNew: true,
            gameDisplay: false,
            chordssuggestDisplay: false,
            diapason: 440,
            nbStrings: 6,
            tuningList: [
              { cordeId: 0, tuning: "E4" },
              { cordeId: 1, tuning: "B3" },
              { cordeId: 2, tuning: "G3" },
              { cordeId: 3, tuning: "D3" },
              { cordeId: 4, tuning: "A2" },
              { cordeId: 5, tuning: "E2" }
            ]
          },
          notes: {
            noteSlectedList: [
              { note: 'A', enabled: false },
              { note: 'AS', enabled: false },
              { note: 'B', enabled: false },
              { note: 'C', enabled: false },
              { note: 'CS', enabled: false },
              { note: 'D', enabled: false },
              { note: 'DS', enabled: false },
              { note: 'E', enabled: true },
              { note: 'F', enabled: false },
              { note: 'FS', enabled: false },
              { note: 'G', enabled: false },
              { note: 'GS', enabled: false }
            ],
            gammeSelected: ''
          },
          colors: [
            { note: "A", color: "black" },
            { note: "AS", color: "grey" },
            { note: "B", color: "white" },
            { note: "C", color: "blue" },
            { note: "CS", color: "lightblue" },
            { note: "D", color: "red" },
            { note: "DS", color: "pink" },
            { note: "E", color: "green" },
            { note: "F", color: "brown" },
            { note: "FS", color: "#b5651d" },
            { note: "G", color: "yellow" },
            { note: "GS", color: "lightyellow" }
          ],
          tuning: {
            nbfrettes: 24,
            diapason: 648,
            nbStrings: 7,
            tuningList: [
              { cordeId: 0, tuning: 'E5' },
              { cordeId: 1, tuning: 'B4' },
              { cordeId: 2, tuning: 'G4' },
              { cordeId: 3, tuning: 'D4' },
              { cordeId: 4, tuning: 'A3' },
              { cordeId: 5, tuning: 'E3' },
              { cordeId: 6, tuning: 'A2' }
            ]
          },
          audioFiles: [],
          videoFiles: []
        }
      }
      
      this.users.push(newUser)
      this.saveUsersToStorage()
      
      return userId
    },
    
    // Delete user
    deleteUser(userId) {
      if (this.users.length <= 1) {
        throw new Error('Cannot delete the last user')
      }
      
      const index = this.users.findIndex(user => user.id === userId)
      if (index === -1) {
        throw new Error('User not found')
      }
      
      this.users.splice(index, 1)
      
      // If deleted user was current, switch to first available
      if (this.currentUserId === userId) {
        this.switchUser(this.users[0].id)
      }
      
      this.saveUsersToStorage()
    },
    
    // Switch active user
    switchUser(userId) {
      if (!this.userExists(userId)) {
        throw new Error('User does not exist')
      }
      
      // Simply switch the current user - stores will automatically reflect new data
      // because they use computed properties that reference currentUser.data
      this.currentUserId = userId
      const user = this.getUserById(userId)
      this.currentUserName = user.name
      
      localStorage.setItem('guitarapp_currentUserId', userId)
      this.updateLastActive()
      this.saveUsersToStorage()
    },
    
    // Update user profile
    updateUserProfile(userId, updates) {
      const user = this.getUserById(userId)
      if (!user) {
        throw new Error('User not found')
      }
      
      if (updates.name !== undefined) user.name = updates.name
      if (updates.email !== undefined) user.email = updates.email
      if (updates.avatar !== undefined) user.avatar = updates.avatar
      
      this.saveUsersToStorage()
    },
    
    // Update last active timestamp
    updateLastActive() {
      const user = this.currentUser
      if (user) {
        user.lastActive = new Date().toISOString()
        this.saveUsersToStorage()
      }
    },
    
    // No longer needed - stores reference user data directly
    // Kept for backward compatibility with export/import
    captureCurrentStoreStates() {
      // Data is already in currentUser.data - no capture needed
      // Just save to storage
      this.saveUsersToStorage()
    },
    
    // No longer needed - stores reference user data directly
    // Kept for backward compatibility
    restoreUserStoreStates() {
      // Data is automatically reflected because stores use computed properties
      // that reference currentUser.data
      // Just ensure we save to storage
      this.saveUsersToStorage()
    },
    
    // Export user data to JSON
    exportUser(userId) {
      const user = this.getUserById(userId)
      if (!user) {
        throw new Error('User not found')
      }
      
      // Data is always up-to-date since stores reference user.data directly
      // No need to capture state
      
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
          data: user.data
        }
      }
      
      this.lastExportDate = new Date().toISOString()
      this.saveUsersToStorage()
      
      return exportData
    },
    
    // Import user data from JSON
    importUser(importData, overwriteExisting = false) {
      if (!importData || !importData.user) {
        throw new Error('Invalid import data')
      }
      
      const userData = importData.user
      
      // Check if user with same name exists
      const existingUser = this.users.find(u => u.name === userData.name)
      
      if (existingUser && !overwriteExisting) {
        // Create new user with modified name
        const newName = `${userData.name} (Imported ${new Date().toLocaleDateString()})`
        const userId = this.createUser(newName, userData.email || '', userData.avatar || '')
        const newUser = this.getUserById(userId)
        newUser.data = JSON.parse(JSON.stringify(userData.data))
      } else if (existingUser && overwriteExisting) {
        // Overwrite existing user
        existingUser.data = JSON.parse(JSON.stringify(userData.data))
        existingUser.email = userData.email || existingUser.email
        existingUser.avatar = userData.avatar || existingUser.avatar
      } else {
        // Create new user
        const userId = this.createUser(userData.name, userData.email || '', userData.avatar || '')
        const newUser = this.getUserById(userId)
        newUser.data = JSON.parse(JSON.stringify(userData.data))
      }
      
      this.lastImportDate = new Date().toISOString()
      this.saveUsersToStorage()
    },
    
    // Export all users
    exportAllUsers() {
      // Data is always up-to-date since stores reference user.data directly
      // No need to capture state
      
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        users: this.users.map(user => ({
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
          data: user.data
        }))
      }
      
      this.lastExportDate = new Date().toISOString()
      this.saveUsersToStorage()
      
      return exportData
    },
    
    // Storage methods
    saveUsersToStorage() {
      try {
        localStorage.setItem('guitarapp_users', JSON.stringify(this.users))
        localStorage.setItem('guitarapp_userMeta', JSON.stringify({
          lastExportDate: this.lastExportDate,
          lastImportDate: this.lastImportDate
        }))
      } catch (error) {
        console.error('Failed to save users to storage:', error)
      }
    },
    
    loadUsersFromStorage() {
      try {
        const usersData = localStorage.getItem('guitarapp_users')
        if (usersData) {
          this.users = JSON.parse(usersData)
        }
        
        const metaData = localStorage.getItem('guitarapp_userMeta')
        if (metaData) {
          const meta = JSON.parse(metaData)
          this.lastExportDate = meta.lastExportDate
          this.lastImportDate = meta.lastImportDate
        }
      } catch (error) {
        console.error('Failed to load users from storage:', error)
      }
    },
    
    // Clear all user data (reset to default)
    resetAllUsers() {
      this.users = [
        {
          id: 'default',
          name: 'Default User',
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          avatar: '',
          email: '',
          data: {
            trainings: [],
            videos: [],
            settings: {},
            notes: {},
            colors: [],
            tuning: {},
            audioFiles: [],
            videoFiles: []
          }
        }
      ]
      this.currentUserId = 'default'
      this.currentUserName = 'Default User'
      this.saveUsersToStorage()
    }
  }
})
