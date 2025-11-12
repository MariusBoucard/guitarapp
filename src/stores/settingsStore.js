import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // UI Display settings
    mancheDisplay: true,
    notesSelectedDisplay: true,
    tunerDisplay: true,
    pictureDisplay: true,
    soundDisplay: true,
    scalesDisplay: true,
    videoDisplay: true,
    videoDisplayNew: true,
    gameDisplay: true,
    chordssuggestDisplay: true,

    // Guitar settings
    diapason: 440,
    nbStrings: 6,
    tuningList: [
      { cordeId: 0, tuning: 'E4' },
      { cordeId: 1, tuning: 'B3' },
      { cordeId: 2, tuning: 'G3' },
      { cordeId: 3, tuning: 'D3' },
      { cordeId: 4, tuning: 'A2' },
      { cordeId: 5, tuning: 'E2' },
    ],

    // Color settings
    colors: [
      { note: 'A', color: '#FF0000' },
      { note: 'AS', color: '#FF8000' },
      { note: 'B', color: '#FFFF00' },
      { note: 'C', color: '#80FF00' },
      { note: 'CS', color: '#00FF00' },
      { note: 'D', color: '#00FF80' },
      { note: 'DS', color: '#00FFFF' },
      { note: 'E', color: '#0080FF' },
      { note: 'F', color: '#0000FF' },
      { note: 'FS', color: '#8000FF' },
      { note: 'G', color: '#FF00FF' },
      { note: 'GS', color: '#FF0080' },
    ],

    // Note selection
    noteSelectedList: [],
    colorSave: [],

    // Scale settings
    gammeSelected: '',
    colorScaleBool: false,
  }),

  getters: {
    getColorByNote: (state) => (note) => {
      const noteData = state.colors.find((color) => color.note === note)
      return noteData ? noteData.color : '#FFFFFF'
    },

    getTuningByString: (state) => (stringId) => {
      const tuning = state.tuningList.find((t) => t.cordeId === stringId)
      return tuning ? tuning.tuning : 'E4'
    },

    isNoteSelected: (state) => (note) => {
      const noteData = state.noteSelectedList.find((n) => n.note === note)
      return noteData ? noteData.enabled : false
    },
  },

  actions: {
    // Display settings
    toggleDisplay(displayType) {
      this[displayType] = !this[displayType]
      this.saveDisplaySettings()
    },

    setDisplay(displayType, value) {
      this[displayType] = value
      this.saveDisplaySettings()
    },

    // Guitar settings
    setDiapason(value) {
      this.diapason = value
      localStorage.setItem('diap', this.diapason)
    },

    addString() {
      this.tuningList.push({
        cordeId: this.nbStrings,
        tuning: 'A2',
      })
      this.nbStrings++
      this.saveTuningSettings()
    },

    removeString() {
      if (this.nbStrings > 1) {
        this.tuningList.pop()
        this.nbStrings--
        this.saveTuningSettings()
      }
    },

    updateTuning(stringId, tuning) {
      const tuningData = this.tuningList.find((t) => t.cordeId === stringId)
      if (tuningData) {
        tuningData.tuning = tuning
      }
      this.saveTuningSettings()
    },

    // Color settings
    setNoteColor(note, color) {
      const noteData = this.colors.find((c) => c.note === note)
      if (noteData) {
        noteData.color = color
      } else {
        this.colors.push({ note, color })
      }
      this.saveColorSettings()
    },

    toggleNoteSelection(note) {
      const noteData = this.noteSelectedList.find((n) => n.note === note)
      if (noteData) {
        noteData.enabled = !noteData.enabled
      } else {
        this.noteSelectedList.push({ note, enabled: true })
      }
      this.saveNoteSelectionSettings()
    },

    setNoteSelection(note, enabled) {
      const noteData = this.noteSelectedList.find((n) => n.note === note)
      if (noteData) {
        noteData.enabled = enabled
      } else {
        this.noteSelectedList.push({ note, enabled })
      }
      this.saveNoteSelectionSettings()
    },

    // Scale settings
    setScale(scaleName) {
      this.gammeSelected = scaleName
    },

    toggleScaleColors(enabled) {
      this.colorScaleBool = enabled
      if (enabled) {
        this.colorSave = [...this.colors]
        localStorage.setItem('oldnotescolor', JSON.stringify(this.colorSave))
      } else {
        // Restore original colors
        if (this.colorSave.length > 0) {
          this.colors = [...this.colorSave]
          this.saveColorSettings()
        }
      }
    },

    // Storage methods
    saveDisplaySettings() {
      localStorage.setItem('mancheDisplay', this.mancheDisplay)
      localStorage.setItem('notesSelectedDisplay', this.notesSelectedDisplay)
      localStorage.setItem('tunerDisplay', this.tunerDisplay)
      localStorage.setItem('pictureDisplay', this.pictureDisplay)
      localStorage.setItem('soundDisplay', this.soundDisplay)
      localStorage.setItem('scaleDisplay', this.scalesDisplay)
      localStorage.setItem('videoDisplay', this.videoDisplay)
      localStorage.setItem('videoDisplayNew', this.videoDisplayNew)
      localStorage.setItem('gameDisplay', this.gameDisplay)
      localStorage.setItem('chordssuggestDisplay', this.chordssuggestDisplay)
    },

    saveTuningSettings() {
      localStorage.setItem('nbCordes', this.nbStrings)
      this.tuningList.forEach((tuning) => {
        localStorage.setItem(`${tuning.cordeId}tuning`, tuning.tuning)
      })
    },

    saveColorSettings() {
      localStorage.setItem('colordict', JSON.stringify(this.colors))
    },

    saveNoteSelectionSettings() {
      this.noteSelectedList.forEach((note) => {
        localStorage.setItem(`${note.note}Selected`, note.enabled)
      })
    },

    // Load from storage
    loadFromStorage() {
      // Load display settings
      const displaySettings = [
        'mancheDisplay',
        'notesSelectedDisplay',
        'tunerDisplay',
        'pictureDisplay',
        'soundDisplay',
        'scalesDisplay',
        'videoDisplay',
        'videoDisplayNew',
        'gameDisplay',
        'chordssuggestDisplay',
      ]

      displaySettings.forEach((setting) => {
        const value = localStorage.getItem(setting)
        if (value !== null) {
          this[setting] = value === 'true'
        }
      })

      // Load diapason
      const diap = localStorage.getItem('diap')
      if (diap !== null) {
        this.diapason = parseInt(diap)
      }

      // Load tuning settings
      const nbCordes = localStorage.getItem('nbCordes')
      if (nbCordes !== null) {
        this.nbStrings = parseInt(nbCordes)
        this.tuningList = []
        for (let i = 0; i < this.nbStrings; i++) {
          const tuning = localStorage.getItem(`${i}tuning`)
          if (tuning !== null) {
            this.tuningList.push({ cordeId: i, tuning })
          }
        }
      }

      // Load colors
      const colorDict = localStorage.getItem('colordict')
      if (colorDict !== null) {
        this.colors = JSON.parse(colorDict)
      }

      // Load note selections
      this.colors.forEach((color) => {
        const selected = localStorage.getItem(`${color.note}Selected`)
        if (selected !== null) {
          const existing = this.noteSelectedList.find((n) => n.note === color.note)
          if (existing) {
            existing.enabled = selected === 'true'
          } else {
            this.noteSelectedList.push({
              note: color.note,
              enabled: selected === 'true',
            })
          }
        }
      })

      // Load saved colors
      const oldColors = localStorage.getItem('oldnotescolor')
      if (oldColors !== null) {
        this.colorSave = JSON.parse(oldColors)
      }
    },
  },
})
