import { defineStore } from 'pinia'
import { useUserStore } from './userStore'

export const useVideoStore = defineStore('video', {
  state: () => ({
    // UI State only (not user-specific data)
    selectedVideo: 0,
    currentVideoName: '',
    currentVideo: '',
    videoLength: 0,

    // Playback settings (could be user-specific, kept here for simplicity)
    startTime: 0,
    endTime: 0,
    speed: 100,
    loop: false,

    // Directory management (session-specific, not user data)
    rootDirectory: null, // DirectoryHandle for the root training directory
    rootDirectoryPath: '', // String path to the root directory
    currentDirectoryPath: '', // Current working directory path
    defaultPath: 'D:/guitarCourseNew/', // Default base path for directory selection

    directoryStructure: {
      name: '',
      path: '',
      handle: null,
      lastScanned: null,
      totalSize: 0,
    },
  }),

  getters: {
    // Reference userStore data directly
    videoList() {
      const userStore = useUserStore()
      if (!userStore.currentUser?.data?.videos) {
        if (userStore.currentUser) {
          userStore.currentUser.data.videos = []
        }
        return []
      }
      return userStore.currentUser.data.videos
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

    trainingMetadata() {
      const userStore = useUserStore()
      if (!userStore.currentUser?.data?.videoMetadata) {
        if (userStore.currentUser && !userStore.currentUser.data.videoMetadata) {
          userStore.currentUser.data.videoMetadata = {
            lastUpdated: null,
            totalVideos: 0,
            totalTrainings: 0,
            averageDuration: 0,
          }
        }
        return {
          lastUpdated: null,
          totalVideos: 0,
          totalTrainings: 0,
          averageDuration: 0,
        }
      }
      return userStore.currentUser.data.videoMetadata
    },

    currentVideoData: (state) => {
      const userStore = useUserStore()
      const videos = userStore.currentUser?.data?.videos || []
      return videos.find((video) => video.id === state.selectedVideo)
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

    // Directory and path getters
    hasRootDirectory: (state) => state.rootDirectory !== null,

    effectiveBasePath: (state) => state.rootDirectoryPath || state.defaultPath,

    totalTrainingsCount() {
      return this.niouTrainingList.length
    },

    totalVideosCount() {
      return this.niouTrainingList.reduce((total, training) => {
        return (
          total +
          training.trainings.reduce((trainingTotal, item) => {
            return trainingTotal + (item.videos ? item.videos.length : 1)
          }, 0)
        )
      }, 0)
    },

    trainingByIndex() {
      return (index) => this.niouTrainingList[index]
    },

    directoryInfo: (state) => ({
      name: state.directoryStructure.name,
      path: state.directoryStructure.path,
      lastScanned: state.directoryStructure.lastScanned,
      totalVideos: state.trainingMetadata?.totalVideos || 0,
      totalTrainings: state.trainingMetadata?.totalTrainings || 0,
    }),
  },

  actions: {
    // Video training management - modify userStore data directly
    addVideoTraining(name) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const videos = userStore.currentUser.data.videos
      videos.push({
        id: videos.length,
        name: name || this.currentVideoName,
        list: [],
      })
      this.reindexVideoTrainings()
      userStore.saveUsersToStorage()
    },

    removeVideoTraining(index = this.selectedVideo) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      userStore.currentUser.data.videos.splice(index, 1)
      this.reindexVideoTrainings()
      userStore.saveUsersToStorage()
    },

    selectVideoTraining(training) {
      this.selectedVideo = training.id
    },

    reindexVideoTrainings() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      userStore.currentUser.data.videos.forEach((training, index) => {
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

    // Playback control
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

    // Niou training management (directory-based) - modify userStore data directly
    setNiouTrainingList(trainingList) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      userStore.currentUser.data.niouTrainingList = trainingList
      userStore.saveUsersToStorage()
    },

    toggleTrainingVisibility(index) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const niouList = userStore.currentUser.data.niouTrainingList
      if (niouList[index]) {
        niouList[index].show = !niouList[index].show
        userStore.saveUsersToStorage()
      }
    },

    toggleItemVisibility(trainingIndex, itemIndex) {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const niouList = userStore.currentUser.data.niouTrainingList
      if (niouList[trainingIndex]?.trainings?.[itemIndex]) {
        niouList[trainingIndex].trainings[itemIndex].show =
          !niouList[trainingIndex].trainings[itemIndex].show
        userStore.saveUsersToStorage()
      }
    },

    // Directory management actions
    setRootDirectory(directoryHandle, directoryPath) {
      this.rootDirectory = directoryHandle
      this.rootDirectoryPath = directoryPath
      this.directoryStructure.handle = directoryHandle
      this.directoryStructure.name = directoryHandle?.name || ''
      this.directoryStructure.path = directoryPath
      this.directoryStructure.lastScanned = new Date().toISOString()
      this.saveDirectoryInfo()
    },

    setCurrentDirectory(path) {
      this.currentDirectoryPath = path
    },

    updateTrainingMetadata() {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const metadata = userStore.currentUser.data.videoMetadata || {}
      const niouList = userStore.currentUser.data.niouTrainingList || []

      metadata.totalTrainings = niouList.length
      metadata.totalVideos = niouList.reduce((total, training) => {
        return (
          total +
          training.trainings.reduce((trainingTotal, item) => {
            return trainingTotal + (item.videos ? item.videos.length : 1)
          }, 0)
        )
      }, 0)
      metadata.lastUpdated = new Date().toISOString()

      userStore.currentUser.data.videoMetadata = metadata
      userStore.saveUsersToStorage()
    },

    setTrainingListWithMetadata(trainingList, directoryHandle = null, directoryPath = '') {
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      userStore.currentUser.data.niouTrainingList = trainingList
      if (directoryHandle) {
        this.setRootDirectory(directoryHandle, directoryPath)
      }
      this.updateTrainingMetadata()
      userStore.saveUsersToStorage()
    },

    clearDirectory() {
      const userStore = useUserStore()

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

      if (userStore.currentUser) {
        userStore.currentUser.data.niouTrainingList = []
        userStore.currentUser.data.videoMetadata = {
          lastUpdated: null,
          totalVideos: 0,
          totalTrainings: 0,
          averageDuration: 0,
        }
        userStore.saveUsersToStorage()
      }

      this.removeDirectoryInfo()
    },

    // Clear all stored training data (useful when paths are outdated)
    clearStoredTrainingData() {
      const userStore = useUserStore()

      localStorage.removeItem('Trainings')
      localStorage.removeItem('trainingMetadata')
      localStorage.removeItem('directoryInfo')

      if (userStore.currentUser) {
        userStore.currentUser.data.niouTrainingList = []
        userStore.currentUser.data.videoMetadata = {
          lastUpdated: null,
          totalVideos: 0,
          totalTrainings: 0,
          averageDuration: 0,
        }
        userStore.saveUsersToStorage()
      }

      console.log('Cleared all stored training data - fresh scan required')
    },

    // Storage methods - now delegates to userStore
    saveDirectoryInfo() {
      const directoryInfo = {
        name: this.directoryStructure.name,
        path: this.directoryStructure.path,
        lastScanned: this.directoryStructure.lastScanned,
        rootDirectoryPath: this.rootDirectoryPath,
        defaultPath: this.defaultPath,
      }
      localStorage.setItem('directoryInfo', JSON.stringify(directoryInfo))
    },

    saveTrainingMetadata() {
      const userStore = useUserStore()
      userStore.saveUsersToStorage()
    },

    removeDirectoryInfo() {
      localStorage.removeItem('directoryInfo')
    },

    saveVideoTrainingsToStorage() {
      const userStore = useUserStore()
      userStore.saveUsersToStorage()
    },

    saveVideoToStorage() {
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

      // Migration: Load old video trainings if user has none
      if (
        (!userStore.currentUser.data.videos || userStore.currentUser.data.videos.length === 0) &&
        localStorage.getItem('videoSave')
      ) {
        userStore.currentUser.data.videos = JSON.parse(localStorage.getItem('videoSave'))
      }

      // Migration: Load old niou trainings if user has none
      if (
        (!userStore.currentUser.data.niouTrainingList ||
          userStore.currentUser.data.niouTrainingList.length === 0) &&
        localStorage.getItem('Trainings')
      ) {
        userStore.currentUser.data.niouTrainingList = JSON.parse(localStorage.getItem('Trainings'))
      }

      // Load directory info (session-specific, not user data)
      if (localStorage.getItem('directoryInfo')) {
        const directoryInfo = JSON.parse(localStorage.getItem('directoryInfo'))
        this.directoryStructure.name = directoryInfo.name || ''
        this.directoryStructure.path = directoryInfo.path || ''
        this.directoryStructure.lastScanned = directoryInfo.lastScanned
        this.rootDirectoryPath = directoryInfo.rootDirectoryPath || ''
        this.defaultPath = directoryInfo.defaultPath || this.defaultPath

        // Check if we have outdated Linux paths and clear them
        if (
          this.rootDirectoryPath.includes('/media/marius/DISK') ||
          this.rootDirectoryPath.includes('guitareCourseNew')
        ) {
          console.log('Detected outdated Linux paths, clearing stored data')
          this.clearStoredTrainingData()
          return // Exit early since we cleared the data
        }
      }

      // Migration: Load training metadata
      if (
        (!userStore.currentUser.data.videoMetadata ||
          !userStore.currentUser.data.videoMetadata.lastUpdated) &&
        localStorage.getItem('trainingMetadata')
      ) {
        userStore.currentUser.data.videoMetadata = {
          ...userStore.currentUser.data.videoMetadata,
          ...JSON.parse(localStorage.getItem('trainingMetadata')),
        }
      }

      // Check for outdated paths in training data
      const niouList = userStore.currentUser.data.niouTrainingList || []
      if (niouList.length > 0) {
        const hasOutdatedPaths = niouList.some((training) =>
          training.trainings?.some((item) =>
            item.videos?.some(
              (video) =>
                video.path?.includes('/media/marius/DISK') ||
                video.absolutePath?.includes('/media/marius/DISK')
            )
          )
        )

        if (hasOutdatedPaths) {
          console.log('Detected outdated paths in training data, clearing...')
          this.clearStoredTrainingData()
          return // Exit early since we cleared the data
        }
      }

      // Update metadata if we have training data but no metadata
      const metadata = userStore.currentUser.data.videoMetadata
      if (niouList.length > 0 && (!metadata || !metadata.lastUpdated)) {
        this.updateTrainingMetadata()
      }

      userStore.saveUsersToStorage()
    },

    // Validate and clean FileHandle references
    validateFileHandles(fileService) {
      if (!fileService) {
        return true
      }

      // Don't clear everything - just check if we need to refresh FileHandles
      if (this.niouTrainingList.length === 0) {
        return true
      }

      // Check if any video has a handleId that no longer exists
      let hasInvalidHandles = false

      for (const training of this.niouTrainingList) {
        for (const subTraining of training.trainings || []) {
          for (const video of subTraining.videos || []) {
            if (video.fileHandleId && !fileService.getFileHandle(video.fileHandleId)) {
              hasInvalidHandles = true
              break
            }
          }
          if (hasInvalidHandles) break
        }
        if (hasInvalidHandles) break
      }

      if (hasInvalidHandles) {
        console.log(
          'Invalid FileHandle references detected - will need to refresh handles on directory access'
        )
        return false
      }

      return true
    },

    // Refresh FileHandle references for existing video data
    async refreshFileHandles(fileService) {
      if (!this.rootDirectory || !fileService || this.niouTrainingList.length === 0) {
        return false
      }

      try {
        console.log('Refreshing FileHandle references for existing videos')

        // Try to get fresh directory handle
        let directoryHandle = this.rootDirectory

        // If we don't have a valid directory handle, we need user to select again
        if (!directoryHandle || !directoryHandle.values) {
          console.log('Directory handle invalid, need fresh directory access')
          return false
        }

        // Create a map of file paths to FileHandle IDs
        const pathToHandleMap = new Map()

        // Recursively collect all video files and create new FileHandle references
        await this.collectFileHandles(directoryHandle, '', pathToHandleMap, fileService)

        // Update video objects with new FileHandle IDs
        for (const training of this.niouTrainingList) {
          for (const subTraining of training.trainings || []) {
            for (const video of subTraining.videos || []) {
              if (video.path) {
                const newHandleId = pathToHandleMap.get(video.path)
                if (newHandleId) {
                  video.fileHandleId = newHandleId
                  console.log(`Updated FileHandle for ${video.name}: ${newHandleId}`)
                }
              }
            }
          }
        }

        // Save updated data
        this.saveNiouTrainings()
        return true
      } catch (error) {
        console.error('Failed to refresh FileHandles:', error)
        return false
      }
    },

    // Helper method to collect FileHandles recursively
    async collectFileHandles(directoryHandle, currentPath, pathToHandleMap, fileService) {
      try {
        for await (const entry of directoryHandle.values()) {
          const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name

          if (entry.kind === 'file' && this.isVideoFile(entry.name)) {
            const handleId = fileService.storeFileHandle(entry)
            pathToHandleMap.set(entryPath, handleId)
          } else if (entry.kind === 'directory') {
            await this.collectFileHandles(entry, entryPath, pathToHandleMap, fileService)
          }
        }
      } catch (error) {
        console.warn('Error collecting FileHandles from directory:', error)
      }
    },

    // Helper method to check if file is a video
    isVideoFile(filename) {
      const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v']
      const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
      return videoExtensions.includes(ext)
    },

    // Auto-reload directory if we have stored directory info
    async autoReloadDirectory(fileService) {
      if (!this.directoryStructure.name || !fileService) {
        return false
      }

      try {
        console.log('Attempting to auto-reload directory:', this.directoryStructure.name)

        // If we have existing video data, try to refresh FileHandles first
        if (this.niouTrainingList.length > 0) {
          console.log('Found existing video data, attempting to refresh FileHandles')
          const refreshed = await this.refreshFileHandles(fileService)
          if (refreshed) {
            console.log('Successfully refreshed FileHandles for existing videos')
            return true
          }
        }

        // Clear existing training list since we need to re-scan
        this.niouTrainingList = []

        // For Electron, try to get the last used directory
        if (window.electronAPI && window.electronAPI.getLastDirectory) {
          const lastDirectory = await window.electronAPI.getLastDirectory()
          if (lastDirectory && lastDirectory === this.rootDirectoryPath) {
            // Re-scan the directory using Electron
            const videos = await window.electronAPI.scanDirectory(this.rootDirectoryPath)
            if (videos && videos.length > 0) {
              this.niouTrainingList = this.convertElectronVideosToTrainingList(videos)
              this.updateTrainingMetadata()
              this.saveNiouTrainings()
              console.log('Auto-reloaded directory from Electron')
              return true
            }
          }
        }

        // For web File System Access API, automatically request directory access
        if (window.showDirectoryPicker) {
          console.log('Web environment: Requesting directory access for auto-reload')
          try {
            // Auto-prompt for directory access
            const directoryHandle = await fileService.selectDirectory()
            if (directoryHandle) {
              const result = await fileService.readDirectoryRecursive(
                directoryHandle,
                this.defaultPath
              )

              // Use the enhanced store method with metadata
              this.setTrainingListWithMetadata(
                result.trainings,
                directoryHandle,
                result.metadata.basePath
              )

              // Force save to ensure new data overwrites old data
              this.saveNiouTrainings()
              this.saveDirectoryInfo()
              this.saveTrainingMetadata()

              console.log('Auto-reloaded directory from web File System Access API')
              console.log('New training list length:', this.niouTrainingList.length)
              return true
            }
          } catch (error) {
            if (error.name === 'AbortError') {
              console.log('User cancelled directory selection')
            } else {
              console.error('Failed to auto-request directory access:', error)
            }
          }
        }

        return false
      } catch (error) {
        console.error('Failed to auto-reload directory:', error)
        return false
      }
    },

    // Convert Electron video list to training list format
    convertElectronVideosToTrainingList(videos) {
      const trainingMap = new Map()

      videos.forEach((video) => {
        const pathParts = video.path.split(/[\\\/]/)
        const trainingType = pathParts[pathParts.length - 3] || 'General'
        const trainingName = pathParts[pathParts.length - 2] || 'Videos'

        if (!trainingMap.has(trainingType)) {
          trainingMap.set(trainingType, {
            trainingType,
            trainings: new Map(),
            show: false,
          })
        }

        const training = trainingMap.get(trainingType)
        if (!training.trainings.has(trainingName)) {
          training.trainings.set(trainingName, {
            name: trainingName,
            videos: [],
            show: false,
          })
        }

        training.trainings.get(trainingName).videos.push({
          name: video.name,
          url: video.path,
          path: video.path,
        })
      })

      // Convert maps to arrays
      return Array.from(trainingMap.values()).map((training) => ({
        ...training,
        trainings: Array.from(training.trainings.values()),
      }))
    },
  },
})
