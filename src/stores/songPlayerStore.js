/**
 * Song Player Store - Audio playback UI state
 *
 * Syncs persistent audio files into Pinia state for reactivity.
 * Session-only playback state kept here.
 */
import { defineStore } from 'pinia'
import { userDataService } from '@/services/userDataService.js'

export const useSongPlayerStore = defineStore('songPlayer', {
  state: () => ({
    currentSong: '',
    songLength: 0,
    startTime: 0,
    endTime: 0,
    speed: 100,
    pitch: 0,
    loop: false,
    defaultPath: '/media/marius/DISK GROS/',
    _audioFiles: JSON.parse(JSON.stringify(userDataService.getAudioFiles())),
  }),

  getters: {
    audioPath: (state) => state._audioFiles,
    songPath: (state) => state._audioFiles,

    audioPathForTraining: () => (trainingStore) => {
      if (!trainingStore?.currentTrainingData) return []
      return trainingStore.currentTrainingData.audioFiles || []
    },

    formattedSongLength: (state) => {
      const dateObj = new Date(state.songLength * 1000)
      const minutes = dateObj.getUTCMinutes()
      const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0')
      const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10).toString().padStart(2, '0')
      return `${minutes}:${seconds}.${milliseconds}`
    },
  },

  actions: {
    _syncFromUserData() {
      this._audioFiles = JSON.parse(JSON.stringify(userDataService.getAudioFiles()))
    },

    addAudioToTraining(trainingStore, trainingId, audioPath) {
      userDataService.addAudioToTraining(trainingId, audioPath)
      this._syncFromUserData()
    },

    removeAudioFromTraining(trainingStore, trainingId, audioPath) {
      userDataService.removeAudioFromTraining(trainingId, audioPath)
      this._syncFromUserData()
    },

    addAudioFile(trainingStore, filePath, fileName) {
      if (trainingStore?.currentTrainingData) {
        userDataService.addAudioToTraining(trainingStore.selectedTraining, filePath)
      } else {
        userDataService.addAudioFile(filePath)
      }
      this._syncFromUserData()
      this.currentSong = fileName
    },

    removeAudioFile(trainingStore, filePath) {
      if (trainingStore?.currentTrainingData) {
        userDataService.removeAudioFromTraining(trainingStore.selectedTraining, filePath)
      } else {
        userDataService.removeAudioFile(filePath)
      }
      this._syncFromUserData()
    },

    updateAudioPathForTraining(trainingStore) {
      this._syncFromUserData()
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

    saveAudioToStorage() {
      userDataService.save()
    },

    loadFromStorage() {
      this._syncFromUserData()
    },

    syncFromUserData() {
      this._syncFromUserData()
    },
  },
})
