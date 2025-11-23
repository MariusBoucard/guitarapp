/**
 * Game Store - Game-related state and logic
 * This is the Model layer for game functionality in MVC architecture
 */
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    score: 0,
    cheat: false,
    noteGreat: undefined,
    isPlayingRoot: false,
    noteexpected: '',
  }),

  getters: {
    isGameActive: (state) => {
      return state.isPlayingRoot
    },

    gameStats: (state) => ({
      score: state.score,
      cheat: state.cheat,
      noteGreat: state.noteGreat,
    }),
  },

  actions: {
    setScore(score) {
      this.score = score
    },

    incrementScore(points = 1) {
      this.score += points
    },

    decrementScore(points = 1) {
      this.score = Math.max(0, this.score - points)
    },

    resetScore() {
      this.score = 0
    },

    setCheat(cheat) {
      this.cheat = cheat
    },

    toggleCheat() {
      this.cheat = !this.cheat
    },

    setPlayingRoot(playing) {
      this.isPlayingRoot = playing
    },

    togglePlayingRoot() {
      this.isPlayingRoot = !this.isPlayingRoot
    },

    setNoteResult(result) {
      this.noteGreat = result
    },

    setNoteExpected(note) {
      this.noteexpected = note
    },

    resetGame() {
      this.score = 0
      this.cheat = false
      this.noteGreat = undefined
      this.isPlayingRoot = false
      this.noteexpected = ''
    },
  },
})
