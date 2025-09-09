/**
 * App Store - Global application state
 * This is the Model layer for overall app state in MVC architecture
 */
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // UI Display States
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
    settingsView: false,
    keyboard: false,
    tabReaderDisplay: false,
    vst3PluginDisplay: false,
    
    // Global UI Properties
    lefty: false,
    autoGammeSelect: false,
    isPlayingRoot: false,
    
    // Video Settings
    videoFolder: ""
  }),

  getters: {
    // Get all display states for easy iteration
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
      settingsView: state.settingsView,
      keyboard: state.keyboard,
      tabReaderDisplay: state.tabReaderDisplay,
      vst3PluginDisplay: state.vst3PluginDisplay
    })
  },

  actions: {
    // Toggle display states
    toggleManche() {
      this.mancheDisplay = !this.mancheDisplay
    },
    
    toggleNotesSelected() {
      this.notesSelectedDisplay = !this.notesSelectedDisplay
    },
    
    toggleTuner() {
      this.tunderDisplay = !this.tunderDisplay
    },
    
    togglePicture() {
      this.pictureDisplay = !this.pictureDisplay
    },
    
    toggleSound() {
      this.soundDisplay = !this.soundDisplay
    },
    
    toggleScales() {
      this.scalesDisplay = !this.scalesDisplay
    },
    
    toggleVideo() {
      this.videoDisplay = !this.videoDisplay
    },
    
    toggleVideoNew() {
      this.videoDisplayNew = !this.videoDisplayNew
    },
    
    toggleTraining() {
      this.trainingDisplay = !this.trainingDisplay
    },
    
    toggleGame() {
      this.gameDisplay = !this.gameDisplay
    },
    
    toggleChordssuggestion() {
      this.chordssuggestDisplay = !this.chordssuggestDisplay
    },
    
    toggleSettings() {
      this.settingsView = !this.settingsView
    },
    
    toggleKeyboard() {
      this.keyboard = !this.keyboard
    },
    
    toggleTabReader() {
      this.tabReaderDisplay = !this.tabReaderDisplay
    },
    
    toggleVST3Plugin() {
      this.vst3PluginDisplay = !this.vst3PluginDisplay
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
