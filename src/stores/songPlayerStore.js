import { defineStore } from 'pinia'

export const useSongPlayerStore = defineStore('songPlayer', {
  state: () => ({
    // Audio/Song paths
    audioPath: [],
    songPath: [],
    
    // Current playing state
    currentSong: "",
    songLength: 0,
    
    // Playback settings
    startTime: 0,
    endTime: 0,
    speed: 100,
    pitch: 0,
    loop: false,
    
    // Directory settings
    defaultPath: "/media/marius/DISK GROS/"
  }),
  
  getters: {
    formattedSongLength: (state) => {
      const dateObj = new Date(state.songLength * 1000);
      const minutes = dateObj.getUTCMinutes();
      const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0');
      const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10).toString().padStart(2, '0');
      return `${minutes}:${seconds}.${milliseconds}`;
    }
  },
  
  actions: {
    // Audio file management for trainings
    addAudioToTraining(trainingStore, trainingId, audioPath) {
      const training = trainingStore.trainingList.find(t => t.id === trainingId);
      if (training) {
        // Initialize audioFiles array if it doesn't exist (for backward compatibility)
        if (!training.audioFiles) {
          training.audioFiles = [];
        }
        
        // Check if audio file already exists
        if (!training.audioFiles.includes(audioPath)) {
          training.audioFiles.push(audioPath);
          trainingStore.saveTrainingsToStorage();
        }
      }
    },

    removeAudioFromTraining(trainingStore, trainingId, audioPath) {
      const training = trainingStore.trainingList.find(t => t.id === trainingId);
      if (training && training.audioFiles) {
        const index = training.audioFiles.indexOf(audioPath);
        if (index > -1) {
          training.audioFiles.splice(index, 1);
          trainingStore.saveTrainingsToStorage();
        }
      }
    },

    // File management
    addAudioFile(trainingStore, filePath, fileName) {
      // Add to current training if one is selected
      if (trainingStore.currentTrainingData) {
        this.addAudioToTraining(trainingStore, trainingStore.selectedTraining, filePath);
        this.audioPath = trainingStore.currentTrainingAudioFiles; // Update current view
      } else {
        // Fallback to global if no training selected
        this.audioPath.push(filePath);
      }
      
      this.songPath.push(filePath);
      this.currentSong = fileName;
      this.saveAudioToStorage();
    },

    removeAudioFile(trainingStore, filePath) {
      // Remove from current training if one is selected
      if (trainingStore.currentTrainingData) {
        this.removeAudioFromTraining(trainingStore, trainingStore.selectedTraining, filePath);
        this.audioPath = trainingStore.currentTrainingAudioFiles; // Update current view
      } else {
        // Fallback to global removal
        const index = this.audioPath.indexOf(filePath);
        if (index > -1) {
          this.audioPath.splice(index, 1);
        }
      }
      
      // Also remove from songPath
      const songIndex = this.songPath.indexOf(filePath);
      if (songIndex > -1) {
        this.songPath.splice(songIndex, 1);
      }
      
      this.saveAudioToStorage();
    },

    // Update audio path when training changes
    updateAudioPathForTraining(trainingStore) {
      if (trainingStore.currentTrainingData) {
        this.audioPath = trainingStore.currentTrainingAudioFiles;
      } else {
        this.audioPath = [];
      }
    },
    
    // Playback control
    setPlaybackSettings({ startTime, endTime, speed, pitch, loop }) {
      if (startTime !== undefined) this.startTime = startTime;
      if (endTime !== undefined) this.endTime = endTime;
      if (speed !== undefined) this.speed = speed;
      if (pitch !== undefined) this.pitch = pitch;
      if (loop !== undefined) this.loop = loop;
    },
    
    setSongLength(duration) {
      this.songLength = duration;
      this.endTime = duration;
    },
    
    // Storage methods
    saveAudioToStorage() {
      localStorage.setItem("songLength", this.songPath.length);
      this.songPath.forEach((song, index) => {
        localStorage.setItem(`song${index}`, song);
      });
    },
    
    // Load from storage
    loadFromStorage() {
      // Load individual songs (legacy support)
      const songLength = localStorage.getItem("songLength");
      if (songLength) {
        for (let i = 0; i < parseInt(songLength); i++) {
          const song = localStorage.getItem(`song${i}`);
          if (song && !this.songPath.includes(song)) {
            this.songPath.push(song);
            this.audioPath.push(song);
          }
        }
      }
    }
  }
})
