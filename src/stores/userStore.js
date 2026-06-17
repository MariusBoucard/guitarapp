/**
 * User Store - Thin profile manager
 *
 * Syncs user data into Pinia state for reactivity.
 * Delegates mutations to UserDataService.
 */
import { defineStore } from 'pinia'
import { userDataService } from '@/services/userDataService.js'
import { useSettingsStore } from './settingsStore.js'
import { useAppStore } from './appStore.js'
import { useTuningStore } from './tuningStore.js'
import { useNotesStore } from './notesStore.js'
import { useVideoStore } from './videoStore.js'
import { useTrainingStore } from './trainingStore.js'
import { useSongPlayerStore } from './songPlayerStore.js'
import { useTabStore } from './tabStore.js'
import { usePictureStore } from './pictureStore.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    isInitializing: true,
    currentUserId: userDataService.currentUserId,
    currentUserName: '',
    lastExportDate: null,
    lastImportDate: null,
    _currentUser: JSON.parse(JSON.stringify(userDataService.currentUser)),
    _users: JSON.parse(JSON.stringify(userDataService.usersList)),
  }),

  getters: {
    currentUser: (state) => state._currentUser,
    users: (state) => state._users,
    userNames: (state) => state._users.map((u) => ({ id: u.id, name: u.name })),
    totalUsers: (state) => state._users.length,
    currentUserData: (state) => state._currentUser?.data || null,
    getUserById: (state) => (userId) => state._users.find((u) => u.id === userId),
    userExists: (state) => (userId) => state._users.some((u) => u.id === userId),
  },

  actions: {
    _syncFromUserData() {
      this._currentUser = JSON.parse(JSON.stringify(userDataService.currentUser))
      this._users = JSON.parse(JSON.stringify(userDataService.usersList))
      this.currentUserId = userDataService.currentUserId
      const user = userDataService.currentUser
      if (user) {
        this.currentUserName = user.name
      }
    },

    initialize() {
      this.isInitializing = true
      this._syncFromUserData()
      userDataService.updateLastActive()
      userDataService.save()
      this.isInitializing = false
    },

    createUser(userName, email = '', avatar = '') {
      const userId = userDataService.createUser(userName, email, avatar)
      this._syncFromUserData()
      return userId
    },

    deleteUser(userId) {
      userDataService.deleteUser(userId)
      this._syncFromUserData()
      this._syncAllDomainStores()
    },

    switchUser(userId) {
      userDataService.switchUser(userId)
      this._syncFromUserData()
      this._syncAllDomainStores()
    },

    _syncAllDomainStores() {
      try {
        useSettingsStore().syncFromUserData()
        useAppStore().syncFromUserData()
        useTuningStore().syncFromUserData()
        useNotesStore().syncFromUserData()
        useVideoStore().syncFromUserData()
        useTrainingStore().syncFromUserData()
        useSongPlayerStore().syncFromUserData()
        useTabStore().syncFromUserData()
        usePictureStore().syncFromUserData()
      } catch (e) {}
    },

    updateUserProfile(userId, updates) {
      userDataService.updateUserProfile(userId, updates)
      this._syncFromUserData()
    },

    updateLastActive() {
      userDataService.updateLastActive()
      userDataService.save()
    },

    captureCurrentStoreStates() {
      userDataService.save()
    },

    restoreUserStoreStates() {
      userDataService.save()
    },

    exportUser(userId) {
      this.lastExportDate = new Date().toISOString()
      return userDataService.exportUser(userId)
    },

    importUser(importData, overwriteExisting = false) {
      userDataService.importUser(importData, overwriteExisting)
      this.lastImportDate = new Date().toISOString()
      this._syncFromUserData()
    },

    exportAllUsers() {
      this.lastExportDate = new Date().toISOString()
      return userDataService.exportAllUsers()
    },

    saveUsersToStorage() {
      if (this.isInitializing) return false
      userDataService.save()
      return true
    },

    loadUsersFromStorage() {
      this._syncFromUserData()
    },

    resetAllUsers() {
      userDataService.resetAllUsers()
      this._syncFromUserData()
    },
  },
})
