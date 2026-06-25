/**
 * Video Store - Video training UI state
 *
 * Persistent data synced to Pinia state for reactivity.
 * Session-only state (selected video, playback settings, directory handles) kept here.
 */
import { defineStore } from 'pinia'
import { userDataService } from '@/services/userDataService.js'

export const useVideoStore = defineStore('video', {
  state: () => ({
    // Session-only state
    selectedVideo: 0,
    currentVideoName: '',
    currentVideo: '',
    videoLength: 0,
    startTime: 0,
    endTime: 0,
    speed: 100,
    loop: false,

    // Directory handles (can't be persisted)
    rootDirectory: null,
    rootDirectoryPath: '',
    currentDirectoryPath: '',
    defaultPath: 'D:/guitarCourseNew/',

    directoryStructure: {
      name: '',
      path: '',
      handle: null,
      lastScanned: null,
      totalSize: 0,
    },

    // Synced from UserDataService for reactivity
    _niouTrainingList: JSON.parse(JSON.stringify(userDataService.getNiouTrainingList())),
    _videos: JSON.parse(JSON.stringify(userDataService.getVideos())),
    _videoFiles: JSON.parse(JSON.stringify(userDataService.getVideoFiles())),
  }),

  getters: {
    videoList: (state) => state._videos,
    videoPath: (state) => state._videoFiles,
    niouTrainingList: (state) => state._niouTrainingList,

    currentVideoData: (state) => {
      return state._videos.find((v) => v.id === state.selectedVideo)
    },
    currentVideoFiles() {
      return this.currentVideoData?.list || []
    },
    formattedVideoLength: (state) => {
      const dateObj = new Date(state.videoLength * 1000)
      const minutes = dateObj.getUTCMinutes()
      const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0')
      const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10)
        .toString()
        .padStart(2, '0')
      return `${minutes}:${seconds}.${milliseconds}`
    },
    hasRootDirectory: (state) => state.rootDirectory !== null,
    effectiveBasePath: (state) => state.rootDirectoryPath || state.defaultPath,
    totalTrainingsCount() {
      return this._niouTrainingList.length
    },
    totalVideosCount() {
      return this._niouTrainingList.reduce((total, training) => {
        return (
          total +
          training.trainings.reduce((t, item) => {
            return t + (item.videos ? item.videos.length : 1)
          }, 0)
        )
      }, 0)
    },
    trainingByIndex: (state) => (index) => state._niouTrainingList[index],
    directoryInfo: (state) => ({
      name: state.directoryStructure.name,
      path: state.directoryStructure.path,
      lastScanned: state.directoryStructure.lastScanned,
      totalVideos: userDataService.getVideoMetadata()?.totalVideos || 0,
      totalTrainings: userDataService.getVideoMetadata()?.totalTrainings || 0,
    }),
  },

  actions: {
    setNiouTrainingList(trainingList) {
      this._niouTrainingList = JSON.parse(JSON.stringify(trainingList))
      userDataService.setNiouTrainingList(trainingList)
    },
    toggleTrainingVisibility(index) {
      if (this._niouTrainingList[index]) {
        this._niouTrainingList[index].show = !this._niouTrainingList[index].show
        userDataService.toggleTrainingVisibility(index)
      }
    },
    toggleItemVisibility(trainingIndex, itemIndex) {
      if (this._niouTrainingList[trainingIndex]?.trainings?.[itemIndex]) {
        this._niouTrainingList[trainingIndex].trainings[itemIndex].show =
          !this._niouTrainingList[trainingIndex].trainings[itemIndex].show
        userDataService.toggleItemVisibility(trainingIndex, itemIndex)
      }
    },
    setTrainingListWithMetadata(trainingList, directoryHandle = null, directoryPath = '') {
      this._niouTrainingList = JSON.parse(JSON.stringify(trainingList))
      userDataService.setTrainingListWithMetadata(trainingList)
      if (directoryHandle) {
        this.setRootDirectory(directoryHandle, directoryPath)
      }
    },
    clearDirectory() {
      this.rootDirectory = null
      this.rootDirectoryPath = ''
      this.currentDirectoryPath = ''
      this.directoryStructure = {
        name: '',
        path: '',
        handle: null,
        lastScanned: null,
        totalSize: 0,
      }
      this._niouTrainingList = []
      userDataService.clearNiouTrainingData()
    },
    clearStoredTrainingData() {
      localStorage.removeItem('Trainings')
      localStorage.removeItem('trainingMetadata')
      localStorage.removeItem('directoryInfo')
      this._niouTrainingList = []
      userDataService.clearNiouTrainingData()
    },

    // Session-only operations
    setVideoPlaybackSettings({ startTime, endTime, speed, loop }) {
      if (startTime !== undefined) this.startTime = startTime
      if (endTime !== undefined) this.endTime = endTime
      if (speed !== undefined) this.speed = speed
      if (loop !== undefined) this.loop = loop
    },
    setVideoLength(duration) {
      this.videoLength = duration
      this.endTime = duration
    },
    setRootDirectory(directoryHandle, directoryPath) {
      this.rootDirectory = directoryHandle
      this.rootDirectoryPath = directoryPath
      this.directoryStructure.handle = directoryHandle
      this.directoryStructure.name = directoryHandle?.name || ''
      this.directoryStructure.path = directoryPath
      this.directoryStructure.lastScanned = new Date().toISOString()
      this._saveDirectoryInfo()
    },
    setCurrentDirectory(path) {
      this.currentDirectoryPath = path
    },
    updateTrainingMetadata() {
      userDataService.updateVideoMetadata()
    },

    _saveDirectoryInfo() {
      const info = {
        name: this.directoryStructure.name,
        path: this.directoryStructure.path,
        lastScanned: this.directoryStructure.lastScanned,
        rootDirectoryPath: this.rootDirectoryPath,
        defaultPath: this.defaultPath,
      }
      localStorage.setItem('directoryInfo', JSON.stringify(info))
    },

    loadFromStorage() {
      try {
        const dirInfo = localStorage.getItem('directoryInfo')
        if (dirInfo) {
          const parsed = JSON.parse(dirInfo)
          this.directoryStructure.name = parsed.name || ''
          this.directoryStructure.path = parsed.path || ''
          this.directoryStructure.lastScanned = parsed.lastScanned
          this.rootDirectoryPath = parsed.rootDirectoryPath || ''
          this.defaultPath = parsed.defaultPath || this.defaultPath
        }
      } catch (e) {
        /* ignore */
      }
    },

    isVideoFile(filename) {
      const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v']
      const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
      return videoExtensions.includes(ext)
    },

    syncFromUserData() {
      this._niouTrainingList = JSON.parse(JSON.stringify(userDataService.getNiouTrainingList()))
      this._videos = JSON.parse(JSON.stringify(userDataService.getVideos()))
      this._videoFiles = JSON.parse(JSON.stringify(userDataService.getVideoFiles()))
    },
  },
})
