/**
 * Notes Store - Musical notes, scales, and colors state
 * This is the Model layer for musical data in MVC architecture
 * 
 * Now references current user's data from userStore for per-user note selection
 */
import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    // Current note being played (session state, not saved per user)
    notePlayed: "",
    noteexpected: "",
    
    // Notes configuration (static reference data)
    nbnotes: [
      { id: 0, note: "A" },
      { id: 1, note: "AS" },
      { id: 2, note: "B" },
      { id: 3, note: "C" },
      { id: 4, note: "CS" },
      { id: 5, note: "D" },
      { id: 6, note: "DS" },
      { id: 7, note: "E" },
      { id: 8, note: "F" },
      { id: 9, note: "FS" },
      { id: 10, note: "G" },
      { id: 11, note: "GS" },
    ],
    
    nbnotesc: [
      { id: 0, note: "C" },
      { id: 1, note: "CS" },
      { id: 2, note: "D" },
      { id: 3, note: "DS" },
      { id: 4, note: "E" },
      { id: 5, note: "F" },
      { id: 6, note: "FS" },
      { id: 7, note: "G" },
      { id: 8, note: "GS" },
      { id: 9, note: "A" },
      { id: 10, note: "AS" },
      { id: 11, note: "B" },
    ],
    
    // Default color save (for reset functionality)
    colorSave: [
      { note: "A", color: "black" },
      { note: "AS", color: "grey" },
      { note: "B", color: "white" },
      { note: "C", color: "blue" },
      { note: "CS", color: "lightblue" },
      { note: "D", color: "red" },
      { note: "DS", color: "pink" },
      { note: "E", color: "green" },
      { note: "F", color: "brown" },
      { note: "FS", color: "lightbrown" },
      { note: "G", color: "yellow" },
      { note: "GS", color: "lightyellow" },
    ],
    
    // Notes played tracking for auto-gamme selection
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
      { note: 'GS', nb: 0 }
    ],
    
    // Computed note arrays
    allNotes: [],
    allNotesC: []
  }),

  getters: {
    // Reference to userStore
    userStore() {
      return useUserStore()
    },
    
    // Per-user note selection (from userStore)
    noteSlectedList() {
      const currentUser = this.userStore.currentUser
      if (!currentUser?.data?.notes?.noteSlectedList) {
        // Return default if user data not initialized
        return [
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
        ]
      }
      return currentUser.data.notes.noteSlectedList
    },
    
    // Per-user note colors (from userStore)
    colors() {
      const currentUser = this.userStore.currentUser
      if (!currentUser?.data?.colors || currentUser.data.colors.length === 0) {
        // Return default colors if user data not initialized
        return [
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
          { note: "GS", color: "lightyellow" },
        ]
      }
      return currentUser.data.colors
    },
    
    // Per-user gamme selection (from userStore)
    gammeSelected() {
      const currentUser = this.userStore.currentUser
      return currentUser?.data?.notes?.gammeSelected || ""
    },
    
    // Get note name by index
    getNoteName: (state) => (note) => {
      const names = ["A", "AS", "B", "C", "CS", "D", "DS", "E", "F", "FS", "G", "GS"];
      const note12 = (note >= 0) ? note % 12 : note % 12 + 12;
      const i = Math.floor((note12 + 0.5) % 12);
      return names[i];
    },
    
    // Get enabled notes
    enabledNotes() {
      return this.noteSlectedList.filter(note => note.enabled);
    },
    
    // Get color for a note
    getNoteColor() {
      return (noteName) => {
        const colorObj = this.colors.find(c => c.note === noteName);
        return colorObj ? colorObj.color : 'black';
      }
    }
  },

  actions: {
    // Note selection - updates current user's data
    changeNoteSelection(noteData) {
      const currentUser = this.userStore.currentUser
      if (!currentUser?.data?.notes) return
      
      const note = currentUser.data.notes.noteSlectedList.find(n => n.note === noteData.note);
      if (note) {
        note.enabled = noteData.enabled;
      }
      currentUser.data.notes.gammeSelected = "";
      this.userStore.saveUsersToStorage();
    },

    // Update all notes at once (for scale selection) - updates current user's data
    updateAllNotes(notesArray) {
      const currentUser = this.userStore.currentUser
      if (!currentUser?.data?.notes) return
      
      currentUser.data.notes.noteSlectedList = notesArray;
      this.userStore.saveUsersToStorage();
    },
    
    // Color management - updates current user's data
    changeColor(colors) {
      const currentUser = this.userStore.currentUser
      if (!currentUser?.data) return
      
      currentUser.data.colors = colors;
      this.userStore.saveUsersToStorage();
    },
    
    // Scale/Gamme management - updates current user's data
    setScale(scale) {
      const currentUser = this.userStore.currentUser
      if (!currentUser?.data?.notes) return
      
      currentUser.data.notes.gammeSelected = scale;
      this.userStore.saveUsersToStorage();
    },
    
    unselectGamme() {
      const currentUser = this.userStore.currentUser
      if (!currentUser?.data?.notes) return
      
      currentUser.data.notes.gammeSelected = "";
      this.userStore.saveUsersToStorage();
    },
    
    // Note playing tracking
    changeNote(noteData) {
      if (this.getNoteName(noteData.note) !== undefined) {
        this.notePlayed = this.getNoteName(noteData.note) + noteData.octave;
      }
    },
    
    // Auto gamme selection logic
    addPlayedNote(note) {
      if (this.notesPlayedList.length > 100) {
        const removedNote = this.notesPlayedList.shift();
        const dictEntry = this.notesPlayedDict.find(n => n.note === removedNote);
        if (dictEntry) {
          dictEntry.nb = dictEntry.nb - 1;
        }
      }
      
      this.notesPlayedList.push(note);
      const dictEntry = this.notesPlayedDict.find(n => n.note === note);
      if (dictEntry) {
        dictEntry.nb += 1;
      }
      
      this.selectGamme();
    },
    
    selectGamme() {
      const currentUser = this.userStore.currentUser
      if (!currentUser?.data?.notes?.noteSlectedList) return
      
      const sortedDict = [...this.notesPlayedDict].sort((a, b) => a.nb - b.nb);
      const topNotes = sortedDict.slice(-7);
      const bottomNotes = sortedDict.slice(0, -7);
      
      // Disable bottom notes
      bottomNotes.forEach(dictNote => {
        const selectedNote = currentUser.data.notes.noteSlectedList.find(note => note.note === dictNote.note);
        if (selectedNote) {
          selectedNote.enabled = false;
        }
      });
      
      // Enable/disable top notes based on frequency
      topNotes.forEach(dictNote => {
        const selectedNote = currentUser.data.notes.noteSlectedList.find(note => note.note === dictNote.note);
        if (selectedNote) {
          selectedNote.enabled = dictNote.nb > 2;
        }
      });
      
      this.userStore.saveUsersToStorage();
    },
    
    // Reset functions
    reinitNotesPlayed() {
      this.notesPlayedList = [];
      this.notesPlayedDict.forEach(note => note.nb = 0);
    },
    
    // Set note expected for game
    setNoteExpected(note) {
      this.noteexpected = note;
    },
    
    // Generate all notes arrays
    generateAllNotes() {
      const allNotes = [];
      const allNotesC = [];
      
      for (let i = 0; i < 9; i++) {
        this.nbnotes.forEach(note => {
          allNotes.push({ id: (i * 12 + note.id), note: note.note + i });
        });
        
        this.nbnotesc.forEach(note => {
          allNotesC.push({ id: (i * 12 + note.id), note: note.note + i });
        });
      }
      
      this.allNotes = allNotes;
      this.allNotesC = allNotesC;
    }
  }
})
