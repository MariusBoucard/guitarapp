import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const useTrainingStore = defineStore('training', {
  state: () => ({
    // TODO : Meilleur state a faire :
    // trainingVideoList : [] // liste des videos du training en cours a ajouter ?
    // Comment faire pour délocaliser bien la complexité de l'user store ici ?
    selectedTraining: 0,
    currentTrainingName: '',
    currentVideo: '',
  }),

  getters: {
    trainingList() {
      const userStore = useUserStore()
      if (!userStore.currentUser?.data?.trainings) {
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
    addTraining(name) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const trainings = userStore.currentUser.data.trainings
      trainings.push({
        id: trainings.length,
        name: name || this.currentTrainingName,
        list: [],
        audioFiles: [],
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

    addVideoToTraining(trainingId, videoData) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const training = userStore.currentUser.data.trainings.find((t) => t.id === trainingId)
      if (training) {
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

    addVideoPlaylistToTraining(trainingId, playlistData) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const training = userStore.currentUser.data.trainings.find((t) => t.id === trainingId)
      if (!training) {
        console.error(`Training with ID ${trainingId} not found`)
        return
      }

      
      const exists = training.list.some((item) => {
        const isPlaylistMatch = item.isPlaylist && item.name === playlistData.name
        return isPlaylistMatch
      })

      if (!exists) {
        const newPlaylist = {
          isPlaylist: true,
          name: playlistData.name,
          parentName: playlistData.parentName || '',
          videos: Array.isArray(playlistData.videos) ? playlistData.videos : [],
          createdAt: new Date().toISOString(),
        }
        training.list.push(newPlaylist)
        userStore.saveUsersToStorage()
      }
    },

    removeVideoFromTraining(trainingId, videoData) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const training = userStore.currentUser.data.trainings.find((t) => t.id === trainingId)
      if (!training) return

      
      const index = training.list.findIndex((item) => {
        if (item.isPlaylist && videoData.isPlaylist) {
          return item.name === videoData.name
        }
        if (!item.isPlaylist && !videoData.isPlaylist) {
          const existingIdentifier = typeof item === 'string' ? item : this.getVideoIdentifier(item)
          const identifier = typeof videoData === 'string' ? videoData : this.getVideoIdentifier(videoData)
          return existingIdentifier === identifier
        }
        return false
      })

      if (index > -1) {
        training.list.splice(index, 1)
        userStore.saveUsersToStorage()
      }
    },

    getVideoIdentifier(videoData) {
      if (typeof videoData === 'string') return videoData
      if (videoData.absolutePath && videoData.path) {
        return videoData.path
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

    loadFromStorage() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

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
