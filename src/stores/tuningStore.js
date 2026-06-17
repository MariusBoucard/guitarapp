/**
 * Tuning Store - Guitar tuning and instrument settings
 *
 * Delegates persistence to UserDataService.
 * Pure reactive wrapper for tuning data.
 */
import { defineStore } from 'pinia'
import { userDataService } from '@/services/userDataService.js'

export const useTuningStore = defineStore('tuning', {
  state: () => ({
    // Sync initial state from UserDataService
    _diapason: userDataService.getDiapason(),
    _nbStrings: userDataService.getNbStrings(),
    _nbfrettes: userDataService.getTuning().nbfrettes,
    _tuningList: JSON.parse(JSON.stringify(userDataService.getTuningList())),
  }),

  getters: {
    nbfrettes: (state) => state._nbfrettes,
    diapason: (state) => state._diapason,
    nbStrings: (state) => state._nbStrings,
    tuningList: (state) => state._tuningList,

    getTuningForString: (state) => (stringId) => {
      const tuning = state._tuningList.find((t) => t.cordeId === stringId)
      return tuning ? tuning.tuning : null
    },

    tuningsArray: (state) => state._tuningList.map((t) => t.tuning),
  },

  actions: {
    changeDiapason(diap) {
      this._diapason = diap
      userDataService.setDiapason(diap)
    },

    updateStringTuning(stringId, tuning) {
      const existing = this._tuningList.find((t) => t.cordeId === stringId)
      if (existing) {
        existing.tuning = tuning
      } else {
        this._tuningList.push({ cordeId: stringId, tuning })
      }
      userDataService.updateStringTuning(stringId, tuning)
    },

    setNumberOfStrings(nbStrings) {
      this._nbStrings = nbStrings
      userDataService.setNbStrings(nbStrings)

      // Adjust local tuning list
      const tuningList = this._tuningList
      if (tuningList.length > nbStrings) {
        this._tuningList = tuningList.slice(0, nbStrings)
      } else if (tuningList.length < nbStrings) {
        const defaultTunings = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2', 'B1', 'F#1', 'C#1']
        for (let i = tuningList.length; i < nbStrings; i++) {
          this._tuningList.push({ cordeId: i, tuning: defaultTunings[i] || 'E2' })
        }
      }
      userDataService.setTuningList(this._tuningList)
    },

    setNumberOfFrets(nbFrets) {
      this._nbfrettes = nbFrets
      userDataService.setNumberOfFrets(nbFrets)
    },

    resetToDefaultTuning() {
      const defaultList = [
        { cordeId: 0, tuning: 'E4' },
        { cordeId: 1, tuning: 'B3' },
        { cordeId: 2, tuning: 'G3' },
        { cordeId: 3, tuning: 'D3' },
        { cordeId: 4, tuning: 'A2' },
        { cordeId: 5, tuning: 'E2' },
      ]
      this._tuningList = defaultList
      this._nbStrings = 6
      userDataService.resetTuningToDefault()
    },

    setTuningList(tuningList) {
      this._tuningList = tuningList
      this._nbStrings = tuningList.length
      userDataService.setTuningList(tuningList)
      userDataService.setNbStrings(tuningList.length)
    },

    syncFromUserData() {
      const tuning = userDataService.getTuning()
      this._diapason = tuning.diapason
      this._nbStrings = tuning.nbStrings
      this._nbfrettes = tuning.nbfrettes
      this._tuningList = JSON.parse(JSON.stringify(tuning.tuningList))
    },
  },
})
