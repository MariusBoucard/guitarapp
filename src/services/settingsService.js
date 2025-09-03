/**
 * Settings Service - Handles localStorage operations and settings persistence
 * This is part of the Controller layer in MVC architecture
 */
export class SettingsService {
  constructor(serviceManager = null) {
    this.serviceManager = serviceManager;
    this.prefix = 'guitarapp_';
  }

  /**
   * Save display states to localStorage
   */
  saveDisplayStates(displayStates) {
    Object.entries(displayStates).forEach(([key, value]) => {
      localStorage.setItem(key, value.toString());
    });
  }

  /**
   * Load display states from localStorage
   */
  loadDisplayStates() {
    const states = {};
    const stateKeys = [
      'mancheDisplay', 'notesSelectedDisplay', 'tunerDisplay', 'pictureDisplay',
      'soundDisplay', 'scaleDisplay', 'videoDisplay', 'videoDisplayNew',
      'gameDisplay', 'chordssuggestDisplay'
    ];

    stateKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        // Handle the tunerDisplay vs tunderDisplay naming inconsistency
        const stateKey = key === 'tunerDisplay' ? 'tunderDisplay' : key;
        const actualKey = key === 'scaleDisplay' ? 'scalesDisplay' : stateKey;
        states[actualKey] = value === 'true';
      }
    });

    return states;
  }

  /**
   * Save notes selection to localStorage
   */
  saveNotesSelection(notesList) {
    notesList.forEach(note => {
      localStorage.setItem(note.note + "Selected", note.enabled.toString());
    });
  }

  /**
   * Load notes selection from localStorage
   */
  loadNotesSelection() {
    const notes = [
      'A', 'AS', 'B', 'C', 'CS', 'D', 'DS', 'E', 'F', 'FS', 'G', 'GS'
    ];
    
    const notesSelection = {};
    notes.forEach(note => {
      const value = localStorage.getItem(note + "Selected");
      if (value !== null && value !== "null") {
        notesSelection[note] = value === 'true';
      }
    });

    return notesSelection;
  }

  /**
   * Save colors to localStorage
   */
  saveColors(colors) {
    localStorage.setItem("colordict", JSON.stringify(colors));
  }

  /**
   * Load colors from localStorage
   */
  loadColors() {
    const colorDict = localStorage.getItem("colordict");
    return colorDict && colorDict !== 'null' ? JSON.parse(colorDict) : null;
  }

  /**
   * Save color backup
   */
  saveColorBackup(colorSave) {
    localStorage.setItem("oldnotescolor", JSON.stringify(colorSave));
  }

  /**
   * Load color backup
   */
  loadColorBackup() {
    const colorBackup = localStorage.getItem("oldnotescolor");
    return colorBackup && colorBackup !== 'null' ? JSON.parse(colorBackup) : null;
  }

  /**
   * Save tuning configuration
   */
  saveTuningConfig(tuningData) {
    localStorage.setItem('diap', tuningData.diapason.toString());
    localStorage.setItem('nbCordes', tuningData.nbStrings.toString());
    
    tuningData.tuningList.forEach((tuning, index) => {
      localStorage.setItem(index + 'tuning', tuning.tuning);
    });
  }

  /**
   * Load tuning configuration
   */
  loadTuningConfig() {
    const config = {};
    
    const diap = localStorage.getItem('diap');
    if (diap !== null) {
      config.diapason = parseInt(diap);
    }
    
    const nbCordes = localStorage.getItem('nbCordes');
    if (nbCordes !== null) {
      config.nbStrings = parseInt(nbCordes);
      config.tuningList = [];
      
      for (let i = 0; i < config.nbStrings; i++) {
        const tuning = localStorage.getItem(i + 'tuning');
        if (tuning !== null) {
          config.tuningList.push({
            cordeId: i,
            tuning: tuning
          });
        }
      }
    }
    
    return config;
  }

  /**
   * Save individual diapason value
   */
  saveDiapason(diapason) {
    localStorage.setItem('diap', diapason.toString());
  }

  /**
   * Clear all settings
   */
  clearAllSettings() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(this.prefix) || this.isGuitarAppKey(key))) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Check if a key belongs to the guitar app
   */
  isGuitarAppKey(key) {
    const guitarAppKeys = [
      'mancheDisplay', 'notesSelectedDisplay', 'tunerDisplay', 'pictureDisplay',
      'soundDisplay', 'scaleDisplay', 'videoDisplay', 'videoDisplayNew',
      'gameDisplay', 'chordssuggestDisplay', 'colordict', 'oldnotescolor',
      'diap', 'nbCordes'
    ];
    
    return guitarAppKeys.includes(key) || 
           key.endsWith('Selected') || 
           key.endsWith('tuning') ||
           /^\d+tuning$/.test(key);
  }

  /**
   * Export all settings
   */
  exportSettings() {
    const settings = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && this.isGuitarAppKey(key)) {
        settings[key] = localStorage.getItem(key);
      }
    }
    
    return settings;
  }

  /**
   * Import settings
   */
  importSettings(settings) {
    Object.entries(settings).forEach(([key, value]) => {
      if (this.isGuitarAppKey(key)) {
        localStorage.setItem(key, value);
      }
    });
  }
}
