/**
 * Training Store - Training playlist UI state
 *
 * Syncs persistent data into Pinia state for reactivity.
 * Delegates mutations to UserDataService.
 */
import { defineStore } from 'pinia'
import { userDataService } from '@/services/userDataService.js'

export const useTrainingStore = defineStore('training', {
  state: () => ({
    selectedTraining: 0,
    currentTrainingName: '',
    currentVideo: '',
    _trainingList: JSON.parse(JSON.stringify(userDataService.getTrainings())),
    _videoFiles: JSON.parse(JSON.stringify(userDataService.getVideoFiles())),
  }),

  getters: {
    trainingList: (state) => state._trainingList,
    videoPath: (state) => state._videoFiles,

    currentTrainingData: (state) => {
      return state._trainingList.find((t) => t.id === state.selectedTraining)
    },
    currentTrainingVideos() {
      return this.currentTrainingData?.list || []
    },
    currentTrainingAudioFiles() {
      return this.currentTrainingData?.audioFiles || []
    },
  },

  actions: {
    _syncFromUserData() {
      this._trainingList = JSON.parse(JSON.stringify(userDataService.getTrainings()))
      this._videoFiles = JSON.parse(JSON.stringify(userDataService.getVideoFiles()))
    },

    addTraining(name) {
      userDataService.addTraining(name)
      this._syncFromUserData()
    },

    removeTraining(index = this.selectedTraining) {
      userDataService.removeTraining(index)
      this._syncFromUserData()
    },

    setSelectedTraining(trainingId) {
      this.selectedTraining = trainingId
    },

    selectTraining(training) {
      this.selectedTraining = training.id
    },

    addVideoToTraining(trainingId, videoData) {
      userDataService.addVideoToTraining(trainingId, videoData)
      this._syncFromUserData()
    },

    removeVideoFromTraining(trainingId, videoData) {
      userDataService.removeVideoFromTraining(trainingId, videoData)
      this._syncFromUserData()
    },

    addVideoFile(filePath) {
      userDataService.addVideoFile(filePath)
      this._syncFromUserData()
    },

    removeVideoFile(filePath) {
      userDataService.removeVideoFile(filePath)
      this._syncFromUserData()
    },

    saveTrainingsToStorage() {
      userDataService.save()
    },

    saveVideosToStorage() {
      userDataService.save()
    },

    saveNiouTrainings() {
      userDataService.save()
    },

    loadFromStorage() {
      this._syncFromUserData()
    },

    loadTrainings() {
      this._syncFromUserData()
    },

    syncFromUserData() {
      this._syncFromUserData()
    },
  },
})
