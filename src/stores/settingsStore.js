/**
 * Settings Store - Display and application settings
 *
 * Delegates persistence to UserDataService.
 * Pure reactive wrapper for UI settings.
 */
import { defineStore } from 'pinia'
import { userDataService } from '@/services/userDataService.js'

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const settings = userDataService.getSettings()
    return {
      mancheDisplay: settings.mancheDisplay,
      notesSelectedDisplay: settings.notesSelectedDisplay,
      tunerDisplay: settings.tunerDisplay,
      pictureDisplay: settings.pictureDisplay,
      soundDisplay: settings.soundDisplay,
      scalesDisplay: settings.scalesDisplay,
      videoDisplay: settings.videoDisplay,
      videoDisplayNew: settings.videoDisplayNew,
      trainingDisplay: settings.trainingDisplay,
      gameDisplay: settings.gameDisplay,
      chordssuggestDisplay: settings.chordssuggestDisplay,
      tabReaderDisplay: settings.tabReaderDisplay,
    }
  },

  getters: {
    displayStates: (state) => ({
      mancheDisplay: state.mancheDisplay,
      notesSelectedDisplay: state.notesSelectedDisplay,
      tunerDisplay: state.tunerDisplay,
      pictureDisplay: state.pictureDisplay,
      soundDisplay: state.soundDisplay,
      scalesDisplay: state.scalesDisplay,
      videoDisplay: state.videoDisplay,
      videoDisplayNew: state.videoDisplayNew,
      trainingDisplay: state.trainingDisplay,
      gameDisplay: state.gameDisplay,
      chordssuggestDisplay: state.chordssuggestDisplay,
      tabReaderDisplay: state.tabReaderDisplay,
    }),
  },

  actions: {
    setSetting(key, value) {
      this[key] = value
      userDataService.updateSetting(key, value)
    },

    toggleSetting(key) {
      this[key] = !this[key]
      userDataService.updateSetting(key, this[key])
    },

    // Convenience methods matching old appStore API
    toggleManche() {
      this.toggleSetting('mancheDisplay')
    },
    toggleNotesSelected() {
      this.toggleSetting('notesSelectedDisplay')
    },
    toggleTuner() {
      this.toggleSetting('tunerDisplay')
    },
    togglePicture() {
      this.toggleSetting('pictureDisplay')
    },
    toggleSound() {
      this.toggleSetting('soundDisplay')
    },
    toggleScales() {
      this.toggleSetting('scalesDisplay')
    },
    toggleVideo() {
      this.toggleSetting('videoDisplay')
    },
    toggleVideoNew() {
      this.toggleSetting('videoDisplayNew')
    },
    toggleTraining() {
      this.toggleSetting('trainingDisplay')
    },
    toggleGame() {
      this.toggleSetting('gameDisplay')
    },
    toggleChordssuggestion() {
      this.toggleSetting('chordssuggestDisplay')
    },
    toggleTabReader() {
      this.toggleSetting('tabReaderDisplay')
    },

    setDisplayState(stateName, value) {
      if (stateName in this) {
        this.setSetting(stateName, value)
      }
    },

    loadFromUserData() {
      this.syncFromUserData()
    },

    syncFromUserData() {
      const settings = userDataService.getSettings()
      Object.keys(settings).forEach((key) => {
        if (key in this) {
          this[key] = settings[key]
        }
      })
    },
  },
})
