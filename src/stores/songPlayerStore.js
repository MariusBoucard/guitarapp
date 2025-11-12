import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const useSongPlayerStore = defineStore('songPlayer', {
  state: () => ({
    // UI State only (not user-specific data)
    currentSong: '',
    songLength: 0,

    // Playback settings
    startTime: 0,
    endTime: 0,
    speed: 100,
    pitch: 0,
    loop: false,

    // Directory settings (session-specific)
    defaultPath: '/media/marius/DISK GROS/',
  }),

  getters: {
    // Get audio files for the currently selected training
    // This should be called with trainingStore as a parameter from components
    audioPathForTraining: () => (trainingStore) => {
      if (!trainingStore || !trainingStore.currentTrainingData) {
        // No training selected - return empty array
        return []
      }

      const training = trainingStore.currentTrainingData
      if (!training.audioFiles) {
        training.audioFiles = []
      }
      return training.audioFiles
    },

    // Legacy getter for global audio files (kept for backward compatibility)
    audioPath() {
      const userStore = useUserStore()
      if (!userStore.currentUser?.data?.audioFiles) {
        if (userStore.currentUser) {
          userStore.currentUser.data.audioFiles = []
        }
        return []
      }
      return userStore.currentUser.data.audioFiles
    },

    songPath() {
      return this.audioPath
    },

    formattedSongLength: (state) => {
      const dateObj = new Date(state.songLength * 1000)
      const minutes = dateObj.getUTCMinutes()
      const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0')
      const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10)
        .toString()
        .padStart(2, '0')
      return `${minutes}:${seconds}.${milliseconds}`
    },
  },

  actions: {
    // Audio file management for trainings - modify userStore data directly
    addAudioToTraining(trainingStore, trainingId, audioPath) {
      const training = trainingStore.trainingList.find((t) => t.id === trainingId)
      if (training) {
        // Initialize audioFiles array if it doesn't exist (for backward compatibility)
        if (!training.audioFiles) {
          training.audioFiles = []
        }

        // Check if audio file already exists
        if (!training.audioFiles.includes(audioPath)) {
          training.audioFiles.push(audioPath)
          trainingStore.saveTrainingsToStorage()
        }
      }
    },

    removeAudioFromTraining(trainingStore, trainingId, audioPath) {
      const training = trainingStore.trainingList.find((t) => t.id === trainingId)
      if (training && training.audioFiles) {
        const index = training.audioFiles.indexOf(audioPath)
        if (index > -1) {
          training.audioFiles.splice(index, 1)
          trainingStore.saveTrainingsToStorage()
        }
      }
    },

    // File management - modify userStore data directly
    addAudioFile(trainingStore, filePath, fileName) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      // Add to current training if one is selected
      if (trainingStore.currentTrainingData) {
        this.addAudioToTraining(trainingStore, trainingStore.selectedTraining, filePath)
      } else {
        // Fallback to global if no training selected
        if (!userStore.currentUser.data.audioFiles) {
          userStore.currentUser.data.audioFiles = []
        }
        userStore.currentUser.data.audioFiles.push(filePath)
      }

      this.currentSong = fileName
      userStore.saveUsersToStorage()
    },

    removeAudioFile(trainingStore, filePath) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      // Remove from current training if one is selected
      if (trainingStore.currentTrainingData) {
        this.removeAudioFromTraining(trainingStore, trainingStore.selectedTraining, filePath)
      } else {
        // Fallback to global removal
        const audioFiles = userStore.currentUser.data.audioFiles || []
        const index = audioFiles.indexOf(filePath)
        if (index > -1) {
          audioFiles.splice(index, 1)
        }
      }

      userStore.saveUsersToStorage()
    },

    // Update audio path when training changes (not needed anymore - computed property handles it)
    updateAudioPathForTraining(trainingStore) {
      // No-op: audioPath is now a getter that automatically reflects current data
    },

    // Playback control
    setPlaybackSettings({ startTime, endTime, speed, pitch, loop }) {
      if (startTime !== undefined) this.startTime = startTime
      if (endTime !== undefined) this.endTime = endTime
      if (speed !== undefined) this.speed = speed
      if (pitch !== undefined) this.pitch = pitch
      if (loop !== undefined) this.loop = loop
    },

    setSongLength(duration) {
      this.songLength = duration
      this.endTime = duration
    },

    // Storage methods - now delegates to userStore
    saveAudioToStorage() {
      const userStore = useUserStore()
      userStore.saveUsersToStorage()
    },

    // Load from storage - migrate old data if needed
    loadFromStorage() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      // Migration: Load individual songs (legacy support)
      const songLength = localStorage.getItem('songLength')
      if (songLength) {
        for (let i = 0; i < parseInt(songLength); i++) {
          const song = localStorage.getItem(`song${i}`)
          if (song && !this.songPath.includes(song)) {
            this.songPath.push(song)
            this.audioPath.push(song)
          }
        }
      }
    },
  },
})
