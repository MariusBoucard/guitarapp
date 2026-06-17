/**
 * App Store - Display visibility + pure UI state
 *
 * Owns all display booleans in Pinia state.
 * Persists via userDataService.
 */
import { defineStore } from 'pinia'
import { userDataService } from '@/services/userDataService.js'

/** Default display values */
const D = {
  mancheDisplay: true,
  notesSelectedDisplay: true,
  tunderDisplay: false,
  pictureDisplay: false,
  soundDisplay: false,
  scalesDisplay: true,
  videoDisplay: false,
  videoDisplayNew: true,
  trainingDisplay: false,
  gameDisplay: false,
  chordssuggestDisplay: false,
  tabReaderDisplay: false,
}

export const useAppStore = defineStore('app', {
  state: () => {
    const s = userDataService.currentUser?.data?.settings || {}
    return {
      // Display booleans — the single source of truth for what's visible
      mancheDisplay: s.mancheDisplay ?? D.mancheDisplay,
      notesSelectedDisplay: s.notesSelectedDisplay ?? D.notesSelectedDisplay,
      tunderDisplay: s.tunerDisplay ?? s.tunderDisplay ?? D.tunderDisplay,
      pictureDisplay: s.pictureDisplay ?? D.pictureDisplay,
      soundDisplay: s.soundDisplay ?? D.soundDisplay,
      scalesDisplay: s.scalesDisplay ?? D.scalesDisplay,
      videoDisplay: s.videoDisplay ?? D.videoDisplay,
      videoDisplayNew: s.videoDisplayNew ?? D.videoDisplayNew,
      trainingDisplay: s.trainingDisplay ?? D.trainingDisplay,
      gameDisplay: s.gameDisplay ?? D.gameDisplay,
      chordssuggestDisplay: s.chordssuggestDisplay ?? D.chordssuggestDisplay,
      tabReaderDisplay: s.tabReaderDisplay ?? D.tabReaderDisplay,

      // Transient UI state (not persisted)
      settingsView: false,
      keyboard: false,
      userManagementDisplay: false,
      lefty: false,
      autoGammeSelect: false,
      isPlayingRoot: false,
      videoFolder: '',
    }
  },

  getters: {
    // Alias for the typo name used everywhere
    tunerDisplay: (state) => state.tunderDisplay,

    displayStates: (state) => ({
      mancheDisplay: state.mancheDisplay,
      notesSelectedDisplay: state.notesSelectedDisplay,
      tunderDisplay: state.tunderDisplay,
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
    /** Toggle a display boolean and persist */
    _toggleDisplay(key) {
      this[key] = !this[key]
      userDataService.updateSetting(key, this[key])
    },

    toggleManche()           { this._toggleDisplay('mancheDisplay') },
    toggleNotesSelected()    { this._toggleDisplay('notesSelectedDisplay') },
    toggleTuner()            { this._toggleDisplay('tunderDisplay') },
    togglePicture()          { this._toggleDisplay('pictureDisplay') },
    toggleSound()            { this._toggleDisplay('soundDisplay') },
    toggleScales()           { this._toggleDisplay('scalesDisplay') },
    toggleVideo()            { this._toggleDisplay('videoDisplay') },
    toggleVideoNew()         { this._toggleDisplay('videoDisplayNew') },
    toggleTraining()         { this._toggleDisplay('trainingDisplay') },
    toggleGame()             { this._toggleDisplay('gameDisplay') },
    toggleChordssuggestion() { this._toggleDisplay('chordssuggestDisplay') },
    toggleTabReader()        { this._toggleDisplay('tabReaderDisplay') },

    // Transient toggles
    toggleSettings()        { this.settingsView = !this.settingsView },
    toggleKeyboard()        { this.keyboard = !this.keyboard },
    toggleUserManagement()  { this.userManagementDisplay = !this.userManagementDisplay },
    toggleAutoGammeSelect() { this.autoGammeSelect = !this.autoGammeSelect },
    togglePlayingRoot()     { this.isPlayingRoot = !this.isPlayingRoot },

    setLefty(value)   { this.lefty = value },
    setVideoFolder(f) { this.videoFolder = f },

    setDisplayState(key, value) {
      if (key in this && typeof this[key] === 'boolean') {
        this[key] = value
        userDataService.updateSetting(key, value)
      }
    },

    /** Re-sync all display booleans from userDataService (e.g. after user switch) */
    syncFromUserData() {
      const s = userDataService.currentUser?.data?.settings || {}
      this.mancheDisplay = s.mancheDisplay ?? D.mancheDisplay
      this.notesSelectedDisplay = s.notesSelectedDisplay ?? D.notesSelectedDisplay
      this.tunderDisplay = s.tunerDisplay ?? s.tunderDisplay ?? D.tunderDisplay
      this.pictureDisplay = s.pictureDisplay ?? D.pictureDisplay
      this.soundDisplay = s.soundDisplay ?? D.soundDisplay
      this.scalesDisplay = s.scalesDisplay ?? D.scalesDisplay
      this.videoDisplay = s.videoDisplay ?? D.videoDisplay
      this.videoDisplayNew = s.videoDisplayNew ?? D.videoDisplayNew
      this.trainingDisplay = s.trainingDisplay ?? D.trainingDisplay
      this.gameDisplay = s.gameDisplay ?? D.gameDisplay
      this.chordssuggestDisplay = s.chordssuggestDisplay ?? D.chordssuggestDisplay
      this.tabReaderDisplay = s.tabReaderDisplay ?? D.tabReaderDisplay
    },
  },
})
