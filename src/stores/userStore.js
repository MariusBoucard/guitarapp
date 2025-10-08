/**
 * User Store - Manages user profiles and their associated data
 * Each user has their own instance of trainings, videos, settings, etc.
 * This is the Model layer for user management in MVC architecture
 */
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    console.log('🔴 STATE INITIALIZER: Creating initial state...')
    
    // Try to load from localStorage DURING state creation
    let initialUsers = [{
      id: 'default',
      name: 'Default User',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      avatar: '',
      email: '',
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
          tuningList: [
            { cordeId: 0, tuning: "E4" },
            { cordeId: 1, tuning: "B3" },
            { cordeId: 2, tuning: "G3" },
            { cordeId: 3, tuning: "D3" },
            { cordeId: 4, tuning: "A2" },
            { cordeId: 5, tuning: "E2" }
          ]
        },
        audioFiles: [],
        videoFiles: [],
        pictures: []
      }
    }]
    
    let initialCurrentUserId = null
    
    // Try to load from localStorage RIGHT NOW during state creation
    try {
      if (typeof localStorage !== 'undefined') {
        const savedData = localStorage.getItem('guitarapp_users')
        if (savedData) {
          console.log('🔴 STATE INITIALIZER: Found saved data in localStorage!')
          const parsed = JSON.parse(savedData)
          if (parsed.users && Array.isArray(parsed.users)) {
            initialUsers = parsed.users
            initialCurrentUserId = parsed.currentUserId
            console.log('🔴 STATE INITIALIZER: Loaded', initialUsers.length, 'users from localStorage')
            initialUsers.forEach((u, idx) => {
              console.log(`   ${idx + 1}. ${u.name} (${u.id})`)
            })
          }
        } else {
          console.log('🔴 STATE INITIALIZER: No saved data, using default user')
        }
      }
    } catch (error) {
      console.error('🔴 STATE INITIALIZER: Error loading from localStorage:', error)
    }
    
    return {
      // Initialization flag to prevent saves during load
      isInitializing: false,
      
      // Current active user
      currentUserId: initialCurrentUserId,
      currentUserName: '',
      
      // List of all users (loaded from localStorage or default)
      users: initialUsers,
      
      // Import/Export metadata
      lastExportDate: null,
      lastImportDate: null
    }
  },
  
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
      console.log('='.repeat(80))
      console.log('🚀 INITIALIZE: Starting user store initialization...')
      console.log('🚀 INITIALIZE: Current users at start:', this.users.length)
      this.users.forEach((u, idx) => {
        console.log(`   ${idx + 1}. ${u.name} (${u.id}) - trainings: ${u.data?.trainings?.length || 0}`)
      })
      console.log('='.repeat(80))
      
      this.isInitializing = true
      
      // Check if we already loaded from localStorage during state creation
      const alreadyLoadedFromStorage = this.users.length > 0 && this.users[0].id !== 'default'
      
      if (!alreadyLoadedFromStorage) {
        console.log('🔄 INITIALIZE: Loading from localStorage...')
        this.loadUsersFromStorage()
      } else {
        console.log('✅ INITIALIZE: Data already loaded from localStorage during state creation')
      }
      
      console.log('🔍 INITIALIZE: After load - users:', this.users.length, 'currentUserId:', this.currentUserId)
      this.users.forEach((u, idx) => {
        console.log(`   ${idx + 1}. ${u.name} (${u.id}) - trainings: ${u.data?.trainings?.length || 0}`)
      })
      
      // currentUserId should already be set by loadUsersFromStorage or state initializer
      // But if not, fall back to checking separate storage or defaults
      if (!this.currentUserId) {
        const savedUserId = localStorage.getItem('guitarapp_currentUserId')
        if (savedUserId && this.userExists(savedUserId)) {
          this.currentUserId = savedUserId
          console.log('🔍 INITIALIZE: Set from legacy guitarapp_currentUserId:', savedUserId)
        } else if (this.users.length > 0) {
          this.currentUserId = this.users[0].id
          this.currentUserName = this.users[0].name
          console.log('🔍 INITIALIZE: Set to first user:', this.users[0].name)
        }
      }
      
      console.log('✅ INITIALIZE: Complete - Current user:', this.currentUser?.name, 'ID:', this.currentUserId)
      
      this.isInitializing = false
      
      // NOW it's safe to update and save
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
            diapason: 440
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
            nbStrings: 6,
            tuningList: [
              { cordeId: 0, tuning: 'E4' },
              { cordeId: 1, tuning: 'B3' },
              { cordeId: 2, tuning: 'G3' },
              { cordeId: 3, tuning: 'D3' },
              { cordeId: 4, tuning: 'A2' },
              { cordeId: 5, tuning: 'E2' }
            ]
          },
          audioFiles: [],
          videoFiles: [],
          pictures: []
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
      // Don't save during initialization to prevent overwriting loaded data
      if (this.isInitializing) {
        console.log('⏸️  SAVE SKIPPED: Still initializing, will save after load complete')
        return false
      }
      
      try {
        const dataToSave = {
          users: this.users,
          currentUserId: this.currentUserId,
          lastModified: new Date().toISOString()
        }
        
        console.log('💾 SAVING TO STORAGE:', {
          usersCount: this.users.length,
          currentUserId: this.currentUserId,
          currentUserName: this.currentUser?.name,
          firstUser: this.users[0]?.name
        })
        
        const jsonString = JSON.stringify(dataToSave)
        console.log('📝 JSON to save (first 200 chars):', jsonString.substring(0, 200))
        
        localStorage.setItem('guitarapp_users', jsonString)
        localStorage.setItem('guitarapp_userMeta', JSON.stringify({
          lastExportDate: this.lastExportDate,
          lastImportDate: this.lastImportDate
        }))
        
        // CRITICAL: Verify the write was successful
        const verification = localStorage.getItem('guitarapp_users')
        if (verification) {
          const verifyParsed = JSON.parse(verification)
          console.log('✅ SAVE VERIFIED - Written to localStorage:', verifyParsed.users.length, 'users')
          console.log('✅ Current user ID saved:', verifyParsed.currentUserId)
        } else {
          console.error('❌ VERIFICATION FAILED - Nothing in localStorage!')
        }
        
        console.log('✅ SAVE COMPLETE')
        return true
      } catch (error) {
        console.error('❌ Failed to save users to storage:', error)
        throw error
      }
    },
    
    loadUsersFromStorage() {
      try {
        console.log('🔍 LOAD: Checking localStorage for guitarapp_users...')
        const usersData = localStorage.getItem('guitarapp_users')
        
        if (usersData) {
          console.log('📦 LOAD: Found data in localStorage (length:', usersData.length, 'chars)')
          console.log('📝 LOAD: First 200 chars:', usersData.substring(0, 200))
          
          const parsed = JSON.parse(usersData)
          console.log('📂 LOAD: Parsed data:', {
            hasUsers: !!parsed.users,
            isArray: Array.isArray(parsed.users || parsed),
            currentUserId: parsed.currentUserId,
            usersCount: (parsed.users || parsed).length
          })
          
          // Handle new format (with currentUserId) and old format (just array)
          if (parsed.users && Array.isArray(parsed.users)) {
            // New format
            this.users = parsed.users
            this.currentUserId = parsed.currentUserId || this.users[0]?.id
            console.log('✅ LOAD: Loaded new format:', this.users.length, 'users')
            console.log('✅ LOAD: Current user ID:', this.currentUserId)
            console.log('✅ LOAD: User names:', this.users.map(u => u.name).join(', '))
          } else if (Array.isArray(parsed)) {
            // Old format (just array of users)
            this.users = parsed
            this.currentUserId = this.users[0]?.id
            console.log('✅ LOAD: Loaded old format:', this.users.length, 'users')
          }

          // Data migration: Ensure all users have pictures array
          this.users.forEach(user => {
            if (!user.data.pictures) {
              user.data.pictures = []
              console.log('🔄 MIGRATION: Added pictures array to user:', user.name)
            }
          })
        } else {
          console.log('⚠️ LOAD: No saved users found in localStorage - using defaults')
          console.log('⚠️ LOAD: Default users:', this.users.map(u => u.name).join(', '))
        }
        
        const metaData = localStorage.getItem('guitarapp_userMeta')
        if (metaData) {
          const meta = JSON.parse(metaData)
          this.lastExportDate = meta.lastExportDate
          this.lastImportDate = meta.lastImportDate
        }
      } catch (error) {
        console.error('❌ Failed to load users from storage:', error)
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
