/**
 * Tuning Store - Guitar tuning and instrument settings
 * This is the Model layer for instrument configuration in MVC architecture
 */
import { defineStore } from 'pinia'

export const useTuningStore = defineStore('tuning', {
  state: () => ({
    // Guitar physical properties
    nbfrettes: 24,
    diapason: 648,
    nbStrings: 7,
    
    // Tuning configuration
    tuningList: [
      { cordeId: 0, tuning: 'E5' },
      { cordeId: 1, tuning: 'B4' },
      { cordeId: 2, tuning: 'G4' },
      { cordeId: 3, tuning: 'D4' },
      { cordeId: 4, tuning: 'A3' },
      { cordeId: 5, tuning: 'E3' },
      { cordeId: 6, tuning: 'A2' }
    ]
  }),

  getters: {
    // Get tuning for specific string
    getTuningForString: (state) => (stringId) => {
      const tuning = state.tuningList.find(t => t.cordeId === stringId);
      return tuning ? tuning.tuning : null;
    },
    
    // Get all tunings as array
    tuningsArray: (state) => {
      return state.tuningList.map(t => t.tuning);
    }
  },

  actions: {
    // Change diapason
    changeDiapason(diap) {
      this.diapason = diap;
    },
    
    // Update tuning for a string
    updateStringTuning(stringId, tuning) {
      const existingTuning = this.tuningList.find(t => t.cordeId === stringId);
      if (existingTuning) {
        existingTuning.tuning = tuning;
      } else {
        this.tuningList.push({ cordeId: stringId, tuning });
      }
    },
    
    // Set number of strings and adjust tuning list
    setNumberOfStrings(nbStrings) {
      this.nbStrings = nbStrings;
      
      // Ensure tuning list matches number of strings
      if (this.tuningList.length > nbStrings) {
        this.tuningList = this.tuningList.slice(0, nbStrings);
      } else if (this.tuningList.length < nbStrings) {
        // Add default tunings for additional strings
        const defaultTunings = ['E5', 'B4', 'G4', 'D4', 'A3', 'E3', 'A2', 'D2', 'G1'];
        for (let i = this.tuningList.length; i < nbStrings; i++) {
          this.tuningList.push({
            cordeId: i,
            tuning: defaultTunings[i] || 'E3'
          });
        }
      }
    },
    
    // Set number of frets
    setNumberOfFrets(nbFrets) {
      this.nbfrettes = nbFrets;
    },
    
    // Reset to default tuning
    resetToDefaultTuning() {
      this.tuningList = [
        { cordeId: 0, tuning: 'E5' },
        { cordeId: 1, tuning: 'B4' },
        { cordeId: 2, tuning: 'G4' },
        { cordeId: 3, tuning: 'D4' },
        { cordeId: 4, tuning: 'A3' },
        { cordeId: 5, tuning: 'E3' },
        { cordeId: 6, tuning: 'A2' }
      ];
      this.nbStrings = 7;
    },
    
    // Set complete tuning list
    setTuningList(tuningList) {
      this.tuningList = tuningList;
    }
  }
})
