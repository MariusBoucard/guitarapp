import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const useTrainingStore = defineStore('training', {
  state: () => ({
    // UI State only (not user-specific data)
    selectedTraining: 0,
    currentTrainingName: '',
    currentVideo: '',
  }),

  getters: {
    // Reference userStore data directly
    trainingList() {
      const userStore = useUserStore()
      if (!userStore.currentUser?.data?.trainings) {
        // Initialize if needed
        if (userStore.currentUser) {
          userStore.currentUser.data.trainings = []
        }
        return []
      }
      return userStore.currentUser.data.trainings
    },

    videoPath() {
      const userStore = useUserStore()
      return userStore.currentUser?.data?.videoFiles || []
    },

    niouTrainingList() {
      const userStore = useUserStore()
      if (!userStore.currentUser?.data?.niouTrainingList) {
        if (userStore.currentUser && !userStore.currentUser.data.niouTrainingList) {
          userStore.currentUser.data.niouTrainingList = []
        }
        return []
      }
      return userStore.currentUser.data.niouTrainingList
    },

    currentTrainingData: (state) => {
      const userStore = useUserStore()
      const trainings = userStore.currentUser?.data?.trainings || []
      return trainings.find((training) => training.id === state.selectedTraining)
    },

    currentTrainingVideos() {
      return this.currentTrainingData?.list || []
    },

    currentTrainingAudioFiles() {
      return this.currentTrainingData?.audioFiles || []
    },
  },

  actions: {
    // Training management - modify userStore data directly
    addTraining(name) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const trainings = userStore.currentUser.data.trainings
      trainings.push({
        id: trainings.length,
        name: name || this.currentTrainingName,
        list: [], // videos for this training
        audioFiles: [], // audio files for this training
      })
      this.reindexTrainings()
      userStore.saveUsersToStorage()
    },

    removeTraining(index = this.selectedTraining) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      userStore.currentUser.data.trainings.splice(index, 1)
      this.reindexTrainings()
      userStore.saveUsersToStorage()
    },

    setSelectedTraining(trainingId) {
      this.selectedTraining = trainingId
    },

    selectTraining(training) {
      this.selectedTraining = training.id
    },

    // Video management for trainings - modify userStore data directly
    addVideoToTraining(trainingId, videoData) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const training = userStore.currentUser.data.trainings.find((t) => t.id === trainingId)
      if (training) {
        // Check if video already exists (by identifier)
        const identifier =
          typeof videoData === 'string' ? videoData : this.getVideoIdentifier(videoData)
        const exists = training.list.some((item) => {
          const existingIdentifier = typeof item === 'string' ? item : this.getVideoIdentifier(item)
          return existingIdentifier === identifier
        })

        if (!exists) {
          training.list.push(videoData)
          userStore.saveUsersToStorage()
        }
      }
    },

    removeVideoFromTraining(trainingId, videoData) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const training = userStore.currentUser.data.trainings.find((t) => t.id === trainingId)
      if (training) {
        const identifier =
          typeof videoData === 'string' ? videoData : this.getVideoIdentifier(videoData)
        const index = training.list.findIndex((item) => {
          const existingIdentifier = typeof item === 'string' ? item : this.getVideoIdentifier(item)
          return existingIdentifier === identifier
        })

        if (index > -1) {
          training.list.splice(index, 1)
          userStore.saveUsersToStorage()
        }
      }
    },

    // Helper method to get video identifier
    getVideoIdentifier(videoData) {
      if (typeof videoData === 'string') return videoData
      // For videos with absolutePath, use the relative path as identifier
      if (videoData.absolutePath && videoData.path) {
        return videoData.path // Use relative path as identifier
      }
      return videoData.fileHandleId || videoData.identifier || videoData.url || videoData.path
    },

    reindexTrainings() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      userStore.currentUser.data.trainings.forEach((training, index) => {
        training.id = index
      })
    },

    // File management - modify userStore data directly
    addVideoFile(filePath) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      if (!userStore.currentUser.data.videoFiles) {
        userStore.currentUser.data.videoFiles = []
      }
      userStore.currentUser.data.videoFiles.push(filePath)
      userStore.saveUsersToStorage()
    },

    removeVideoFile(filePath) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const videoFiles = userStore.currentUser.data.videoFiles || []
      const index = videoFiles.indexOf(filePath)
      if (index > -1) {
        videoFiles.splice(index, 1)
        userStore.saveUsersToStorage()
      }
    },

    // Storage methods - now delegates to userStore
    saveTrainingsToStorage() {
      const userStore = useUserStore()
      userStore.saveUsersToStorage()
    },

    saveVideosToStorage() {
      const userStore = useUserStore()
      userStore.saveUsersToStorage()
    },

    saveNiouTrainings() {
      const userStore = useUserStore()
      userStore.saveUsersToStorage()
    },

    // Load from storage - migrate old data to userStore if needed
    loadFromStorage() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      // Migration: Load old data into current user if user data is empty
      if (
        (!userStore.currentUser.data.trainings ||
          userStore.currentUser.data.trainings.length === 0) &&
        localStorage.getItem('songSave')
      ) {
        const trainings = JSON.parse(localStorage.getItem('songSave'))
        trainings.forEach((training) => {
          if (!training.audioFiles) {
            training.audioFiles = []
          }
        })
        userStore.currentUser.data.trainings = trainings
      }

      // Migration: Load old niou trainings
      if (
        (!userStore.currentUser.data.niouTrainingList ||
          userStore.currentUser.data.niouTrainingList.length === 0) &&
        localStorage.getItem('Trainings')
      ) {
        userStore.currentUser.data.niouTrainingList = JSON.parse(localStorage.getItem('Trainings'))
      }

      userStore.saveUsersToStorage()
    },

    loadTrainings() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      // Migration: Load old video trainings if current user has none
      if (
        (!userStore.currentUser.data.trainings ||
          userStore.currentUser.data.trainings.length === 0) &&
        localStorage.getItem('videoSave')
      ) {
        const trainings = JSON.parse(localStorage.getItem('videoSave'))
        trainings.forEach((training) => {
          if (!training.audioFiles) {
            training.audioFiles = []
          }
        })
        userStore.currentUser.data.trainings = trainings
        this.reindexTrainings()
        userStore.saveUsersToStorage()
      }
    },
  },
})
