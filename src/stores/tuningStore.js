/**
 * Tuning Store - Guitar tuning and instrument settings
 * This is the Model layer for instrument configuration in MVC architecture
 * Per-user tuning data stored in userStore
 */
import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const useTuningStore = defineStore('tuning', {
  state: () => ({
    // Static data (non-user specific)
  }),

  getters: {
    // Get current user's tuning data from userStore
    nbfrettes() {
      const userStore = useUserStore()
      return userStore.currentUser?.data.tuning.nbfrettes || 24
    },

    diapason() {
      const userStore = useUserStore()
      return userStore.currentUser?.data.tuning.diapason || 648
    },

    nbStrings() {
      const userStore = useUserStore()
      return userStore.currentUser?.data.tuning.nbStrings || 6
    },

    tuningList() {
      const userStore = useUserStore()
      return userStore.currentUser?.data.tuning.tuningList || []
    },

    // Get tuning for specific string
    getTuningForString() {
      return (stringId) => {
        const tuning = this.tuningList.find((t) => t.cordeId === stringId)
        return tuning ? tuning.tuning : null
      }
    },

    // Get all tunings as array
    tuningsArray() {
      return this.tuningList.map((t) => t.tuning)
    },
  },

  actions: {
    // Change diapason
    changeDiapason(diap) {
      const userStore = useUserStore()
      if (userStore.currentUser) {
        userStore.currentUser.data.tuning.diapason = diap
        userStore.saveUsersToStorage()
      }
    },

    // Update tuning for a string
    updateStringTuning(stringId, tuning) {
      const userStore = useUserStore()
      if (userStore.currentUser) {
        const existingTuning = userStore.currentUser.data.tuning.tuningList.find(
          (t) => t.cordeId === stringId
        )
        if (existingTuning) {
          existingTuning.tuning = tuning
        } else {
          userStore.currentUser.data.tuning.tuningList.push({ cordeId: stringId, tuning })
        }
        userStore.saveUsersToStorage()
      }
    },

    // Set number of strings and adjust tuning list
    setNumberOfStrings(nbStrings) {
      const userStore = useUserStore()
      if (userStore.currentUser) {
        userStore.currentUser.data.tuning.nbStrings = nbStrings

        const tuningList = userStore.currentUser.data.tuning.tuningList

        // Ensure tuning list matches number of strings
        if (tuningList.length > nbStrings) {
          userStore.currentUser.data.tuning.tuningList = tuningList.slice(0, nbStrings)
        } else if (tuningList.length < nbStrings) {
          // Add default tunings for additional strings
          const defaultTunings = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2', 'B1', 'F#1', 'C#1']
          for (let i = tuningList.length; i < nbStrings; i++) {
            userStore.currentUser.data.tuning.tuningList.push({
              cordeId: i,
              tuning: defaultTunings[i] || 'E2',
            })
          }
        }
        userStore.saveUsersToStorage()
      }
    },

    // Set number of frets
    setNumberOfFrets(nbFrets) {
      const userStore = useUserStore()
      if (userStore.currentUser) {
        userStore.currentUser.data.tuning.nbfrettes = nbFrets
        userStore.saveUsersToStorage()
      }
    },

    // Reset to default tuning
    resetToDefaultTuning() {
      const userStore = useUserStore()
      if (userStore.currentUser) {
        userStore.currentUser.data.tuning.tuningList = [
          { cordeId: 0, tuning: 'E4' },
          { cordeId: 1, tuning: 'B3' },
          { cordeId: 2, tuning: 'G3' },
          { cordeId: 3, tuning: 'D3' },
          { cordeId: 4, tuning: 'A2' },
          { cordeId: 5, tuning: 'E2' },
        ]
        userStore.currentUser.data.tuning.nbStrings = 6
        userStore.saveUsersToStorage()
      }
    },

    // Set complete tuning list
    setTuningList(tuningList) {
      const userStore = useUserStore()
      if (userStore.currentUser) {
        userStore.currentUser.data.tuning.tuningList = tuningList
        userStore.saveUsersToStorage()
      }
    },
  },
})
