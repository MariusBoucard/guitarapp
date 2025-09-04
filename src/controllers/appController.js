/**
 * App Controller - Handles main application logic and coordination
 * This is part of the Controller layer in MVC architecture
 */
import { useAppStore } from '@/stores/appStore.js'
import { useNotesStore } from '@/stores/notesStore.js'
import { useTuningStore } from '@/stores/tuningStore.js'
import { useGameStore } from '@/stores/gameStore.js'

export class AppController {
  constructor(serviceManager) {
    this.serviceManager = serviceManager;
    this.appStore = useAppStore();
    this.notesStore = useNotesStore();
    this.tuningStore = useTuningStore();
    this.gameStore = useGameStore();
    this.settingsService = serviceManager.settings;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      // Load settings from localStorage
      await this.loadSettings();
      
      // Generate computed note arrays
      this.notesStore.generateAllNotes();
      
      console.log('App Controller initialized');
    } catch (error) {
      console.error('Failed to initialize App Controller:', error);
    }
  }

  /**
   * Load all settings from localStorage
   */
  async loadSettings() {
    // Load display states
    const displayStates = this.settingsService.loadDisplayStates();
    Object.entries(displayStates).forEach(([key, value]) => {
      this.appStore.setDisplayState(key, value);
    });

    // Load notes selection
    const notesSelection = this.settingsService.loadNotesSelection();
    Object.entries(notesSelection).forEach(([noteName, enabled]) => {
      const note = this.notesStore.noteSlectedList.find(n => n.note === noteName);
      if (note) {
        note.enabled = enabled;
      }
    });

    // Load colors
    const colors = this.settingsService.loadColors();
    if (colors) {
      this.notesStore.changeColor(colors);
    }

    // Load color backup
    const colorBackup = this.settingsService.loadColorBackup();
    if (colorBackup) {
      this.notesStore.colorSave = colorBackup;
    }

    // Load tuning configuration
    const tuningConfig = this.settingsService.loadTuningConfig();
    if (tuningConfig.diapason) {
      this.tuningStore.changeDiapason(tuningConfig.diapason);
    }
    if (tuningConfig.nbStrings) {
      this.tuningStore.setNumberOfStrings(tuningConfig.nbStrings);
    }
    if (tuningConfig.tuningList && tuningConfig.tuningList.length > 0) {
      this.tuningStore.setTuningList(tuningConfig.tuningList);
    }
  }

  /**
   * Save all settings to localStorage
   */
  async saveSettings() {
    // Save display states
    this.settingsService.saveDisplayStates(this.appStore.displayStates);
    
    // Save notes selection
    this.settingsService.saveNotesSelection(this.notesStore.noteSlectedList);
    
    // Save colors
    this.settingsService.saveColors(this.notesStore.colors);
    this.settingsService.saveColorBackup(this.notesStore.colorSave);
    
    // Save tuning configuration
    this.settingsService.saveTuningConfig({
      diapason: this.tuningStore.diapason,
      nbStrings: this.tuningStore.nbStrings,
      tuningList: this.tuningStore.tuningList
    });
  }

  /**
   * Handle note change from tuner
   */
  handleNoteChange(noteData) {
    this.notesStore.changeNote(noteData);
    
    if (this.appStore.autoGammeSelect) {
      const noteName = this.notesStore.getNoteName(noteData.note);
      if (noteName) {
        const fullNote = noteName + noteData.octave;
        const noteWithoutOctave = fullNote.slice(0, fullNote.length - 1);
        this.notesStore.addPlayedNote(noteWithoutOctave);
      }
    }
  }

  /**
   * Handle note selection change
   */
  handleNoteSelectionChange(noteData) {
    this.notesStore.changeNoteSelection(noteData);
    // Auto-save note selection
    this.settingsService.saveNotesSelection(this.notesStore.noteSlectedList);
  }

  /**
   * Handle updating all notes at once (for scale selection)
   */
  handleNotesUpdate(notesArray) {
    this.notesStore.updateAllNotes(notesArray);
    // Auto-save note selection
    this.settingsService.saveNotesSelection(notesArray);
  }

  /**
   * Handle color change
   */
  handleColorChange(colors) {
    this.notesStore.changeColor(colors);
    // Auto-save colors
    this.settingsService.saveColors(colors);
  }

  /**
   * Handle scale selection
   */
  handleScaleSelection(scale) {
    this.notesStore.setScale(scale);
  }

  /**
   * Handle diapason change
   */
  handleDiapasonChange(diapason) {
    this.tuningStore.changeDiapason(diapason);
    // Auto-save diapason
    this.settingsService.saveDiapason(diapason);
  }

  /**
   * Handle game events
   */
  handleGameNoteExpected(note) {
    this.gameStore.setNoteExpected(note);
  }

  handleGameCheatChanged(cheat) {
    this.gameStore.setCheat(cheat);
  }

  handleGameScoreChanged(score) {
    this.gameStore.setScore(score);
  }

  handleGamePlayChanged() {
    this.gameStore.togglePlayingRoot();
    this.appStore.togglePlayingRoot();
  }

  handleGameNoteResult(result) {
    this.gameStore.setNoteResult(result);
  }

  /**
   * Handle lefty mode change
   */
  handleLeftyChange(lefty) {
    this.appStore.setLefty(lefty);
  }

  /**
   * Reinitialize notes tracking
   */
  reinitNotesTracking() {
    this.notesStore.reinitNotesPlayed();
  }

  /**
   * Unselect current gamme/scale
   */
  unselectGamme() {
    this.notesStore.unselectGamme();
  }

  /**
   * Watch for changes and auto-save
   */
  setupAutoSave() {
    // Watch display states changes
    this.appStore.$subscribe((mutation, state) => {
      if (mutation.type === 'direct') {
        // Access the getter properly by calling it on the store instance
        this.settingsService.saveDisplayStates(this.appStore.displayStates);
      }
    });

    // Watch notes changes
    this.notesStore.$subscribe((mutation, state) => {
      if (mutation.type === 'direct') {
        // Auto-save relevant changes
        if (mutation.payload && mutation.payload.includes('color')) {
          this.settingsService.saveColors(state.colors);
        }
        if (mutation.payload && mutation.payload.includes('noteSlectedList')) {
          this.settingsService.saveNotesSelection(state.noteSlectedList);
        }
      }
    });

    // Watch tuning changes
    this.tuningStore.$subscribe((mutation, state) => {
      if (mutation.type === 'direct') {
        this.settingsService.saveTuningConfig({
          diapason: state.diapason,
          nbStrings: state.nbStrings,
          tuningList: state.tuningList
        });
      }
    });
  }
}
