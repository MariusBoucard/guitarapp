/**
 * App Controller - Handles main application logic and coordination
 *
 * Uses UserDataService for persistence, Pinia stores for UI state.
 */
import { useAppStore } from '@/stores/appStore.js'
import { useNotesStore } from '@/stores/notesStore.js'
import { useTuningStore } from '@/stores/tuningStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { useSettingsStore } from '@/stores/settingsStore.js'
import { userDataService } from '@/services/userDataService.js'

export class AppController {
  constructor(serviceManager) {
    this.serviceManager = serviceManager
    this.appStore = useAppStore()
    this.notesStore = useNotesStore()
    this.tuningStore = useTuningStore()
    this.gameStore = useGameStore()
    this.settingsStore = useSettingsStore()
  }

  async initialize() {
    try {
      // Sync tuning store from user data
      this.tuningStore.syncFromUserData()

      // Generate computed note arrays
      this.notesStore.generateAllNotes()

      console.log('App Controller initialized')
    } catch (error) {
      console.error('Failed to initialize App Controller:', error)
    }
  }

  handleNoteChange(noteData) {
    this.notesStore.changeNote(noteData)

    if (this.appStore.autoGammeSelect) {
      const noteName = this.notesStore.getNoteName(noteData.note)
      if (noteName) {
        const fullNote = noteName + noteData.octave
        const noteWithoutOctave = fullNote.slice(0, fullNote.length - 1)
        this.notesStore.addPlayedNote(noteWithoutOctave)
      }
    }
  }

  handleNoteSelectionChange(noteData) {
    this.notesStore.changeNoteSelection(noteData)
  }

  handleNotesUpdate(notesArray) {
    this.notesStore.updateAllNotes(notesArray)
  }

  handleColorChange(colors) {
    this.notesStore.changeColor(colors)
  }

  handleScaleSelection(scale) {
    this.notesStore.setScale(scale)
  }

  handleDiapasonChange(diapason) {
    this.tuningStore.changeDiapason(diapason)
  }

  handleGameNoteExpected(note) {
    this.gameStore.setNoteExpected(note)
  }

  handleGameCheatChanged(cheat) {
    this.gameStore.setCheat(cheat)
  }

  handleGameScoreChanged(score) {
    this.gameStore.setScore(score)
  }

  handleGamePlayChanged() {
    this.gameStore.togglePlayingRoot()
    this.appStore.togglePlayingRoot()
  }

  handleGameNoteResult(result) {
    this.gameStore.setNoteResult(result)
  }

  handleLeftyChange(lefty) {
    this.appStore.setLefty(lefty)
  }

  reinitNotesTracking() {
    this.notesStore.reinitNotesPlayed()
  }

  unselectGamme() {
    this.notesStore.unselectGamme()
  }
}
