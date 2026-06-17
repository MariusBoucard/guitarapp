/**
 * Notes Store - Musical notes, scales, and colors
 *
 * Data is synced from UserDataService into Pinia state for reactivity.
 * Handles note playing tracking (session-only).
 */
import { defineStore } from 'pinia'
import { userDataService } from '@/services/userDataService.js'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notePlayed: '',
    noteexpected: '',

    // Synced from UserDataService (reactive copies)
    _noteSlectedList: JSON.parse(JSON.stringify(userDataService.getNoteSelectionList())),
    _colors: JSON.parse(JSON.stringify(userDataService.getColors())),
    _gammeSelected: userDataService.getGammeSelected(),

    nbnotes: [
      { id: 0, note: 'A' },
      { id: 1, note: 'AS' },
      { id: 2, note: 'B' },
      { id: 3, note: 'C' },
      { id: 4, note: 'CS' },
      { id: 5, note: 'D' },
      { id: 6, note: 'DS' },
      { id: 7, note: 'E' },
      { id: 8, note: 'F' },
      { id: 9, note: 'FS' },
      { id: 10, note: 'G' },
      { id: 11, note: 'GS' },
    ],

    nbnotesc: [
      { id: 0, note: 'C' },
      { id: 1, note: 'CS' },
      { id: 2, note: 'D' },
      { id: 3, note: 'DS' },
      { id: 4, note: 'E' },
      { id: 5, note: 'F' },
      { id: 6, note: 'FS' },
      { id: 7, note: 'G' },
      { id: 8, note: 'GS' },
      { id: 9, note: 'A' },
      { id: 10, note: 'AS' },
      { id: 11, note: 'B' },
    ],

    notesPlayedList: [],
    notesPlayedDict: [
      { note: 'A', nb: 0 },
      { note: 'AS', nb: 0 },
      { note: 'B', nb: 0 },
      { note: 'C', nb: 0 },
      { note: 'CS', nb: 0 },
      { note: 'D', nb: 0 },
      { note: 'DS', nb: 0 },
      { note: 'E', nb: 0 },
      { note: 'F', nb: 0 },
      { note: 'FS', nb: 0 },
      { note: 'G', nb: 0 },
      { note: 'GS', nb: 0 },
    ],

    allNotes: [],
    allNotesC: [],
  }),

  getters: {
    noteSlectedList: (state) => state._noteSlectedList,
    colors: (state) => state._colors,
    gammeSelected: (state) => state._gammeSelected,

    getNoteName: (state) => (note) => {
      const names = ['A', 'AS', 'B', 'C', 'CS', 'D', 'DS', 'E', 'F', 'FS', 'G', 'GS']
      const note12 = note >= 0 ? note % 12 : (note % 12) + 12
      const i = Math.floor((note12 + 0.5) % 12)
      return names[i]
    },

    enabledNotes() {
      return this.noteSlectedList.filter((n) => n.enabled)
    },

    getNoteColor() {
      return (noteName) => {
        const colorObj = this.colors.find((c) => c.note === noteName)
        return colorObj ? colorObj.color : 'black'
      }
    },
  },

  actions: {
    changeNoteSelection(noteData) {
      const note = this._noteSlectedList.find((n) => n.note === noteData.note)
      if (note) note.enabled = noteData.enabled
      userDataService.updateNoteSelection(noteData.note, noteData.enabled)
    },

    updateAllNotes(notesArray) {
      this._noteSlectedList = JSON.parse(JSON.stringify(notesArray))
      userDataService.updateAllNoteSelections(notesArray)
    },

    changeColor(colors) {
      this._colors = JSON.parse(JSON.stringify(colors))
      userDataService.setColors(colors)
    },

    setScale(scale) {
      this._gammeSelected = scale
      userDataService.setGammeSelected(scale)
    },

    unselectGamme() {
      this._gammeSelected = ''
      userDataService.setGammeSelected('')
    },

    changeNote(noteData) {
      if (this.getNoteName(noteData.note) !== undefined) {
        this.notePlayed = this.getNoteName(noteData.note) + noteData.octave
      }
    },

    addPlayedNote(note) {
      if (this.notesPlayedList.length > 100) {
        const removedNote = this.notesPlayedList.shift()
        const dictEntry = this.notesPlayedDict.find((n) => n.note === removedNote)
        if (dictEntry) dictEntry.nb--
      }
      this.notesPlayedList.push(note)
      const dictEntry = this.notesPlayedDict.find((n) => n.note === note)
      if (dictEntry) dictEntry.nb++
      this.selectGamme()
    },

    selectGamme() {
      const sortedDict = [...this.notesPlayedDict].sort((a, b) => a.nb - b.nb)
      const topNotes = sortedDict.slice(-7)
      const bottomNotes = sortedDict.slice(0, -7)

      bottomNotes.forEach((dictNote) => {
        const selectedNote = this._noteSlectedList.find((n) => n.note === dictNote.note)
        if (selectedNote) selectedNote.enabled = false
      })
      topNotes.forEach((dictNote) => {
        const selectedNote = this._noteSlectedList.find((n) => n.note === dictNote.note)
        if (selectedNote) selectedNote.enabled = dictNote.nb > 2
      })
      userDataService.updateAllNoteSelections(this._noteSlectedList)
    },

    reinitNotesPlayed() {
      this.notesPlayedList = []
      this.notesPlayedDict.forEach((n) => (n.nb = 0))
    },

    setNoteExpected(note) {
      this.noteexpected = note
    },

    generateAllNotes() {
      const allNotes = []
      const allNotesC = []
      for (let i = 0; i < 9; i++) {
        this.nbnotes.forEach((note) => {
          allNotes.push({ id: i * 12 + note.id, note: note.note + i })
        })
        this.nbnotesc.forEach((note) => {
          allNotesC.push({ id: i * 12 + note.id, note: note.note + i })
        })
      }
      this.allNotes = allNotes
      this.allNotesC = allNotesC
    },

    syncFromUserData() {
      this._noteSlectedList = JSON.parse(JSON.stringify(userDataService.getNoteSelectionList()))
      this._colors = JSON.parse(JSON.stringify(userDataService.getColors()))
      this._gammeSelected = userDataService.getGammeSelected()
    },
  },
})
