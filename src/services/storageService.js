/**
 * Storage Service - Handles all localStorage operations
 * This is part of the Controller layer in MVC architecture
 */
export class StorageService {
  constructor(serviceManager = null) {
    this.serviceManager = serviceManager;
    this.prefix = 'guitarapp_';
  }

  /**
   * Set item in localStorage with optional prefix
   */
  setItem(key, value, usePrefix = true) {
    try {
      const storageKey = usePrefix ? `${this.prefix}${key}` : key;
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(storageKey, serializedValue);
    } catch (error) {
      console.error(`Failed to save to localStorage: ${key}`, error);
    }
  }

  /**
   * Get item from localStorage with optional prefix
   */
  getItem(key, defaultValue = null, usePrefix = true) {
    try {
      const storageKey = usePrefix ? `${this.prefix}${key}` : key;
      const item = localStorage.getItem(storageKey);
      
      if (item === null) {
        return defaultValue;
      }
      
      // Try to parse as JSON, if it fails return as string
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.error(`Failed to read from localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key, usePrefix = true) {
    try {
      const storageKey = usePrefix ? `${this.prefix}${key}` : key;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Failed to remove from localStorage: ${key}`, error);
    }
  }

  /**
   * Check if item exists in localStorage
   */
  hasItem(key, usePrefix = true) {
    try {
      const storageKey = usePrefix ? `${this.prefix}${key}` : key;
      return localStorage.getItem(storageKey) !== null;
    } catch (error) {
      console.error(`Failed to check localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all items with our prefix
   */
  clearAll() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage', error);
    }
  }

  /**
   * Save training data
   */
  saveTrainings(trainingList) {
    this.setItem('trainings', trainingList, false); // Keep legacy key
    this.setItem('songSave', trainingList, false); // Legacy audio trainings
    this.setItem('videoSave', trainingList, false); // Legacy video trainings
  }

  /**
   * Load training data
   */
  loadTrainings() {
    return this.getItem('songSave', [], false) || 
           this.getItem('videoSave', [], false) || 
           this.getItem('trainings', [], false);
  }

  /**
   * Save display settings
   */
  saveDisplaySettings(settings) {
    Object.entries(settings).forEach(([key, value]) => {
      this.setItem(key, value, false); // Keep legacy keys
    });
  }

  /**
   * Load display settings
   */
  loadDisplaySettings() {
    const settings = {};
    const displayKeys = [
      'mancheDisplay', 'notesSelectedDisplay', 'tunerDisplay', 
      'pictureDisplay', 'soundDisplay', 'scaleDisplay', 
      'videoDisplay', 'videoDisplayNew', 'gameDisplay', 'chordssuggestDisplay'
    ];
    
    displayKeys.forEach(key => {
      const value = this.getItem(key, null, false);
      if (value !== null) {
        settings[key] = value === 'true' || value === true;
      }
    });
    
    return settings;
  }

  /**
   * Save guitar settings
   */
  saveGuitarSettings(settings) {
    if (settings.diapason !== undefined) {
      this.setItem('diap', settings.diapason, false);
    }
    
    if (settings.nbStrings !== undefined) {
      this.setItem('nbCordes', settings.nbStrings, false);
    }
    
    if (settings.tuningList) {
      settings.tuningList.forEach(tuning => {
        this.setItem(`${tuning.cordeId}tuning`, tuning.tuning, false);
      });
    }
  }

  /**
   * Load guitar settings
   */
  loadGuitarSettings() {
    const settings = {};
    
    // Load diapason
    const diapason = this.getItem('diap', null, false);
    if (diapason !== null) {
      settings.diapason = parseInt(diapason);
    }
    
    // Load number of strings
    const nbCordes = this.getItem('nbCordes', null, false);
    if (nbCordes !== null) {
      settings.nbStrings = parseInt(nbCordes);
      
      // Load tuning for each string
      settings.tuningList = [];
      for (let i = 0; i < settings.nbStrings; i++) {
        const tuning = this.getItem(`${i}tuning`, null, false);
        if (tuning !== null) {
          settings.tuningList.push({ cordeId: i, tuning });
        }
      }
    }
    
    return settings;
  }

  /**
   * Save color settings
   */
  saveColorSettings(colors) {
    this.setItem('colordict', colors, false);
  }

  /**
   * Load color settings
   */
  loadColorSettings() {
    return this.getItem('colordict', null, false);
  }

  /**
   * Save note selection settings
   */
  saveNoteSelections(noteSelections) {
    noteSelections.forEach(note => {
      this.setItem(`${note.note}Selected`, note.enabled, false);
    });
  }

  /**
   * Load note selection settings
   */
  loadNoteSelections(noteList) {
    const selections = [];
    noteList.forEach(note => {
      const selected = this.getItem(`${note}Selected`, null, false);
      if (selected !== null) {
        selections.push({
          note,
          enabled: selected === 'true' || selected === true
        });
      }
    });
    return selections;
  }

  /**
   * Save audio files (legacy support)
   */
  saveAudioFiles(audioFiles) {
    this.setItem('songLength', audioFiles.length, false);
    audioFiles.forEach((file, index) => {
      this.setItem(`song${index}`, file, false);
    });
  }

  /**
   * Load audio files (legacy support)
   */
  loadAudioFiles() {
    const files = [];
    const length = this.getItem('songLength', 0, false);
    
    for (let i = 0; i < length; i++) {
      const file = this.getItem(`song${i}`, null, false);
      if (file !== null) {
        files.push(file);
      }
    }
    
    return files;
  }

  /**
   * Save niou training list
   */
  saveNiouTrainings(trainingList) {
    this.setItem('Trainings', trainingList, false);
  }

  /**
   * Load niou training list
   */
  loadNiouTrainings() {
    return this.getItem('Trainings', [], false);
  }

  /**
   * Save scale color settings
   */
  saveScaleColors(colorSave) {
    this.setItem('oldnotescolor', colorSave, false);
  }

  /**
   * Load scale color settings
   */
  loadScaleColors() {
    return this.getItem('oldnotescolor', null, false);
  }

  /**
   * Get storage usage information
   */
  getStorageInfo() {
    let totalSize = 0;
    let itemCount = 0;
    const items = {};
    
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage.getItem(key);
          const size = new Blob([value]).size;
          totalSize += size;
          itemCount++;
          
          if (key.startsWith(this.prefix)) {
            items[key] = {
              size,
              value: value.length > 100 ? `${value.substring(0, 100)}...` : value
            };
          }
        }
      }
    } catch (error) {
      console.error('Failed to analyze storage', error);
    }
    
    return {
      totalSize,
      itemCount,
      items,
      quota: this.getStorageQuota()
    };
  }

  /**
   * Get storage quota information
   */
  getStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate();
    }
    return Promise.resolve({ quota: 'unknown', usage: 'unknown' });
  }

  /**
   * Backup all data to JSON
   */
  exportData() {
    const data = {};
    
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          data[key] = localStorage.getItem(key);
        }
      }
      
      return {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data
      };
    } catch (error) {
      console.error('Failed to export data', error);
      return null;
    }
  }

  /**
   * Restore data from JSON backup
   */
  importData(backupData) {
    try {
      if (!backupData || !backupData.data) {
        throw new Error('Invalid backup data format');
      }
      
      // Clear existing data
      this.clearAll();
      
      // Restore data
      Object.entries(backupData.data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import data', error);
      return false;
    }
  }
}
