/**
 * Game Store - Game-related state and logic
 * This is the Model layer for game functionality in MVC architecture
 */
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    // Game state
    score: 0,
    cheat: false,
    noteGreat: undefined,
    isPlayingRoot: false,
    noteexpected: ""
  }),

  getters: {
    // Check if game is active
    isGameActive: (state) => {
      return state.isPlayingRoot;
    },
    
    // Get current game stats
    gameStats: (state) => ({
      score: state.score,
      cheat: state.cheat,
      noteGreat: state.noteGreat
    })
  },

  actions: {
    // Score management
    setScore(score) {
      this.score = score;
    },
    
    incrementScore(points = 1) {
      this.score += points;
    },
    
    decrementScore(points = 1) {
      this.score = Math.max(0, this.score - points);
    },
    
    resetScore() {
      this.score = 0;
    },
    
    // Cheat mode
    setCheat(cheat) {
      this.cheat = cheat;
    },
    
    toggleCheat() {
      this.cheat = !this.cheat;
    },
    
    // Game playing state
    setPlayingRoot(playing) {
      this.isPlayingRoot = playing;
    },
    
    togglePlayingRoot() {
      this.isPlayingRoot = !this.isPlayingRoot;
    },
    
    // Note result tracking
    setNoteResult(result) {
      this.noteGreat = result;
    },
    
    // Expected note for game
    setNoteExpected(note) {
      this.noteexpected = note;
    },
    
    // Reset game state
    resetGame() {
      this.score = 0;
      this.cheat = false;
      this.noteGreat = undefined;
      this.isPlayingRoot = false;
      this.noteexpected = "";
    }
  }
})
