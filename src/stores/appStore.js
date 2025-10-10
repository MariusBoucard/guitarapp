/**
 * App Store - Global application state
 * This is the Model layer for overall app state in MVC architecture
 * 
 * IMPORTANT: Display settings now come from currentUser.data.settings
 * This ensures settings persist per-user and don't get reset
 */
import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const useAppStore = defineStore('app', {
  state: () => ({
    // Session-only UI states (not saved per-user)
    settingsView: false,
    keyboard: false,
    userManagementDisplay: false,
    
    // Global UI Properties (session state)
    lefty: false,
    autoGammeSelect: false,
    isPlayingRoot: false,
    
    // Video Settings (session state)
    videoFolder: ""
  }),

  getters: {
    // Reference to userStore
    userStore() {
      return useUserStore()
    },
    
    // Display states from current user's settings
    mancheDisplay() {
      return this.userStore.currentUser?.data?.settings?.mancheDisplay ?? true
    },
    notesSelectedDisplay() {
      return this.userStore.currentUser?.data?.settings?.notesSelectedDisplay ?? true
    },
    tunerDisplay() {
      return this.userStore.currentUser?.data?.settings?.tunerDisplay ?? false
    },
    pictureDisplay() {
      return this.userStore.currentUser?.data?.settings?.pictureDisplay ?? false
    },
    soundDisplay() {
      return this.userStore.currentUser?.data?.settings?.soundDisplay ?? false
    },
    scalesDisplay() {
      return this.userStore.currentUser?.data?.settings?.scalesDisplay ?? true
    },
    videoDisplay() {
      return this.userStore.currentUser?.data?.settings?.videoDisplay ?? false
    },
    videoDisplayNew() {
      return this.userStore.currentUser?.data?.settings?.videoDisplayNew ?? true
    },
    trainingDisplay() {
      return this.userStore.currentUser?.data?.settings?.trainingDisplay ?? false
    },
    gameDisplay() {
      return this.userStore.currentUser?.data?.settings?.gameDisplay ?? false
    },
    chordssuggestDisplay() {
      return this.userStore.currentUser?.data?.settings?.chordssuggestDisplay ?? false
    },
    tabReaderDisplay() {
      return this.userStore.currentUser?.data?.settings?.tabReaderDisplay ?? false
    },
    
    // Get all display states for easy iteration
    displayStates() {
      return {
        mancheDisplay: this.mancheDisplay,
        notesSelectedDisplay: this.notesSelectedDisplay,
        tunerDisplay: this.tunerDisplay,
        pictureDisplay: this.pictureDisplay,
        soundDisplay: this.soundDisplay,
        scalesDisplay: this.scalesDisplay,
        videoDisplay: this.videoDisplay,
        videoDisplayNew: this.videoDisplayNew,
        trainingDisplay: this.trainingDisplay,
        gameDisplay: this.gameDisplay,
        chordssuggestDisplay: this.chordssuggestDisplay,
        settingsView: this.settingsView,
        keyboard: this.keyboard,
        tabReaderDisplay: this.tabReaderDisplay,
        userManagementDisplay: this.userManagementDisplay
      }
    }
  },

  actions: {
    // Toggle display states - now updates current user's settings
    toggleManche() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.mancheDisplay = !settings.mancheDisplay
        this.userStore.saveUsersToStorage()
      }
    },
    
    toggleNotesSelected() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.notesSelectedDisplay = !settings.notesSelectedDisplay
        this.userStore.saveUsersToStorage()
      }
    },
    
    toggleTuner() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.tunerDisplay = !settings.tunerDisplay
        this.userStore.saveUsersToStorage()
      }
    },
    
    togglePicture() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.pictureDisplay = !settings.pictureDisplay
        this.userStore.saveUsersToStorage()
      }
    },
    
    toggleSound() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.soundDisplay = !settings.soundDisplay
        this.userStore.saveUsersToStorage()
      }
    },
    
    toggleScales() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.scalesDisplay = !settings.scalesDisplay
        this.userStore.saveUsersToStorage()
      }
    },
    
    toggleVideo() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.videoDisplay = !settings.videoDisplay
        this.userStore.saveUsersToStorage()
      }
    },
    
    toggleVideoNew() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.videoDisplayNew = !settings.videoDisplayNew
        this.userStore.saveUsersToStorage()
      }
    },
    
    toggleTraining() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.trainingDisplay = !settings.trainingDisplay
        this.userStore.saveUsersToStorage()
      }
    },
    
    toggleGame() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.gameDisplay = !settings.gameDisplay
        this.userStore.saveUsersToStorage()
      }
    },
    
    toggleChordssuggestion() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.chordssuggestDisplay = !settings.chordssuggestDisplay
        this.userStore.saveUsersToStorage()
      }
    },
    
    toggleSettings() {
      this.settingsView = !this.settingsView
    },
    
    toggleKeyboard() {
      this.keyboard = !this.keyboard
    },
    
    toggleTabReader() {
      const settings = this.userStore.currentUser?.data?.settings
      if (settings && !this.userStore.isInitializing) {
        settings.tabReaderDisplay = !settings.tabReaderDisplay
        this.userStore.saveUsersToStorage()
      }
    },
    
    // toggleVST3Plugin removed - feature disabled
    
    toggleUserManagement() {
      this.userManagementDisplay = !this.userManagementDisplay
    },
    
    toggleAutoGammeSelect() {
      this.autoGammeSelect = !this.autoGammeSelect
    },
    
    togglePlayingRoot() {
      this.isPlayingRoot = !this.isPlayingRoot
    },
    
    // Set states
    setLefty(value) {
      this.lefty = value
    },
    
    setVideoFolder(folder) {
      this.videoFolder = folder
    },
    
    // Set display state by name
    setDisplayState(stateName, value) {
      if (stateName in this) {
        this[stateName] = value
      }
    }
  }
})
