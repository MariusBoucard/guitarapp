import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const useSongPlayerStore = defineStore('songPlayer', {
  state: () => ({
    currentSong: '',
    songLength: 0,
    // Tout ca me semble pas utilisé pour l'instant
    // TODO :  Implementer ces reglages dans le player pour que
    // ça reste lors dechangement de chanson etc...
    startTime: 0,
    endTime: 0,
    speed: 100,
    pitch: 0,
    loop: false,
    defaultPath: '/media/marius/DISK GROS/',
  }),

  getters: {
    audioPathForTraining: () => (trainingStore) => {
      if (!trainingStore || !trainingStore.currentTrainingData) {
        return []
      }

      const training = trainingStore.currentTrainingData
      if (!training.audioFiles) {
        training.audioFiles = []
      }
      return training.audioFiles
    },

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
    addAudioToTraining(trainingStore, trainingId, audioPath) {
      const training = trainingStore.trainingList.find((t) => t.id === trainingId)
      if (training) {
        if (!training.audioFiles) {
          training.audioFiles = []
        }

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

    addAudioFile(trainingStore, filePath, fileName) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      if (trainingStore.currentTrainingData) {
        this.addAudioToTraining(trainingStore, trainingStore.selectedTraining, filePath)
      } else {
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

      if (trainingStore.currentTrainingData) {
        this.removeAudioFromTraining(trainingStore, trainingStore.selectedTraining, filePath)
      } else {
        const audioFiles = userStore.currentUser.data.audioFiles || []
        const index = audioFiles.indexOf(filePath)
        if (index > -1) {
          audioFiles.splice(index, 1)
        }
      }

      userStore.saveUsersToStorage()
    },

    updateAudioPathForTraining(trainingStore) {
      // No-op: audioPath is now a getter that automatically reflects current data
    },

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

    // TODO ! C'est débile, on devrait sauver ce store dans le store du user ou qq chose, mais pas ca
    saveAudioToStorage() {
      const userStore = useUserStore()
      userStore.saveUsersToStorage()
    },

    loadFromStorage() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      // TODO : devrais marcher sans
      //      const songLength = localStorage.getItem('songLength')
      //      if (songLength) {
      //       for (let i = 0; i < parseInt(songLength); i++) {
      //         const song = localStorage.getItem(`song${i}`)
      //         if (song && !this.songPath.includes(song)) {
      //           this.songPath.push(song)
      //          this.audioPath.push(song)
      //       }
      //     }
      //  }
    },
  },
})
