<template>
  <div style="width:100%;height : 100%">
    <div class="training-container">
      <div class="training-layout">
        <!-- Left Panel - Playlist Management -->
        <div class="playlist-section">
          <h2>Training Playlists</h2>
          
          <!-- Playlist Tabs -->
          <div class="playlist-tabs">
            <ul class="horizontal-list">
              <li v-for="training in trainingStore.trainingList" 
                  @click="selectTraining(training)" 
                  :class="backColor(training)" 
                  :key="training.id">
                <p>{{ training.name }}</p>
              </li>
            </ul>
          </div>

          <!-- Playlist Management Controls -->
          <div class="playlist-controls">
            <input v-model="currentName" type="text" placeholder="New playlist name" />
            <div class="button-group">
              <button @click="addTraining()">Add Playlist</button>
              <button @click="removeTraining()">Remove Playlist</button>
            </div>
          </div>

          <!-- Current Playlist Videos -->
          <div class="playlist-content">
            <h3 v-if="currentTraining">{{ currentTraining.name }} - Videos</h3>
            <ol class="video-list">
              <li v-for="(item, index) in currentPlaylistVideos" 
                  :key="index" 
                  @click="playVideoInTrainingPlayer(item)"
                  class="video-item">
                {{ getVideoDisplayName(item) }}
                <button class="button-remove" @click.stop="removeVideoFromPlaylist(item)">×</button>
              </li>
            </ol>
          </div>

          <!-- File Selection Controls -->
          <div class="file-controls">
            <div class="button-wrap">
              <button class="button-file" @click="selectSingleVideo">Add Single Video</button>
              <button class="button-file" @click="selectTrainingDirectory">Add From Directory</button>
              <button class="button-file" @click="openVideoModal">Browse Available Videos</button>
              <label class="button-file" for="uploadVideo">Upload File (Web)</label>
              <input id="uploadVideo" type="file" @change="loadVideo" accept="video/*">
            </div>
          </div>

          <!-- Directory Browser (when directory is selected) -->
          <div v-if="directoryVideos.length > 0" class="directory-browser">
            <h3>Available Videos from Directory</h3>
            <div class="directory-videos">
              <div v-for="video in directoryVideos" :key="video.path" class="directory-video-item">
                <span @click="playVideoInTrainingPlayer(video)">{{ video.name }}</span>
                <button @click="addVideoToCurrentPlaylist(video)" class="button-add">Add to Playlist</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Video Player -->
        <div class="video-player-section">
          <h2>Training Video Player</h2>
          <div class="video-container">
            <video 
              ref="trainingVideoPlayer"
              style="width:100%;height:400px" 
              @timeupdate="handleTimeUpdate" 
              @loadedmetadata="handleVideoLoaded"
              controls>
              Your browser does not support the video tag.
            </video>
          </div>
          
          <!-- Video Controls -->
          <div class="video-controls">
            <div class="playback-controls">
              <button class="control-button" @click="playVideo">▶ Play</button>
              <button class="control-button" @click="pauseVideo">⏸ Pause</button>
              <button class="control-button" @click="stopVideo">⏹ Stop</button>
            </div>

            <!-- Time Controls -->
            <div class="time-controls">
              <div class="slider-container">
                <label for="startSlider" class="slider-label">Start Time</label>
                <input 
                  id="startSlider" 
                  type="range" 
                  v-model="startTime" 
                  :max="endTime" 
                  min="0" 
                  step="1">
                <span class="time-value">{{ formatTime(startTime) }}</span>
              </div>

              <div class="slider-container">
                <label for="endSlider" class="slider-label">End Time</label>
                <input 
                  id="endSlider" 
                  type="range" 
                  v-model="endTime" 
                  :min="startTime" 
                  :max="videoDuration" 
                  step="1">
                <span class="time-value">{{ formatTime(endTime) }}</span>
              </div>
            </div>

            <!-- Speed and Loop Controls -->
            <div class="advanced-controls">
              <div class="speed-control">
                <label for="speedSlider">Speed: {{ speed }}%</label>
                <input 
                  id="speedSlider"
                  type="range" 
                  min="25" 
                  max="200" 
                  step="5"
                  v-model="speed">
              </div>

              <div class="loop-control">
                <label>
                  <input type="checkbox" v-model="loop"> Loop
                </label>
              </div>
            </div>

            <!-- Current Video Info -->
            <div v-if="currentVideoName" class="video-info">
              <h4>{{ currentVideoName }}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Selection Modal -->
    <div v-if="showVideoModal" class="modal-overlay" @click="closeVideoModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Browse Available Videos</h2>
          <button class="modal-close" @click="closeVideoModal">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="availableVideos.length === 0" class="no-videos">
            <p>No videos found. First load a directory in the Video Player component.</p>
          </div>
          
          <div v-else class="video-browser">
            <!-- Search filter -->
            <div class="search-section">
              <input 
                v-model="videoSearchQuery" 
                type="text" 
                placeholder="Search videos..."
                class="search-input"
              />
            </div>
            
            <!-- Training categories -->
            <div v-for="(training, trainingIndex) in filteredAvailableVideos" 
                 :key="trainingIndex" 
                 class="training-category">
              <h3 
                @click="toggleTrainingCategory(trainingIndex)" 
                class="training-header"
                :class="{ expanded: training.show }"
              >
                📁 {{ training.trainingType }} ({{ getTrainingVideoCount(training) }} videos)
              </h3>
              
              <div v-show="training.show" class="training-items">
                <div v-for="(item, itemIndex) in training.trainings" 
                     :key="itemIndex" 
                     class="training-item">
                  <h4 
                    @click="toggleTrainingItem(trainingIndex, itemIndex)"
                    class="item-header"
                    :class="{ expanded: item.show }"
                  >
                    📂 {{ item.name }} 
                    <span v-if="item.videos">({{ item.videos.length }} videos)</span>
                  </h4>
                  
                  <div v-show="item.show" class="video-list-modal">
                    <!-- Single video (direct file) -->
                    <div v-if="item.isDirectFile" 
                         class="video-item-modal"
                         @click="selectVideoFromModal(item)">
                      <span class="video-name">🎥 {{ item.name }}</span>
                      <button class="button-select" @click.stop="addVideoFromModal(item)">
                        Add to Playlist
                      </button>
                    </div>
                    
                    <!-- Multiple videos -->
                    <div v-else v-for="(video, videoIndex) in item.videos || []" 
                         :key="videoIndex"
                         class="video-item-modal"
                         @click="selectVideoFromModal(video)">
                      <span class="video-name">🎥 {{ video.name }}</span>
                      <button class="button-select" @click.stop="addVideoFromModal(video)">
                        Add to Playlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeVideoModal" class="button-cancel">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useTrainingStore } from '@/stores/trainingStore.js'
import { useVideoStore } from '@/stores/videoStore.js'
import { serviceManager } from '@/services/index.js'

export default {
  name: 'TrainingComponent',
  
  setup() {
    const trainingStore = useTrainingStore()
    const videoStore = useVideoStore()
    const fileService = serviceManager.file
    return { trainingStore, videoStore, fileService }
  },

  data() {
    return {
      currentName: "",
      directoryVideos: [],
      directoryInfo: {
        name: "",
        path: "",
        totalTrainings: 0,
        totalVideos: 0,
        lastScanned: null
      },
      // Modal state
      showVideoModal: false,
      videoSearchQuery: "",
      expandedTrainings: new Set(),
      expandedItems: new Set(),
      // Video player state
      currentVideoName: "",
      videoDuration: 0,
      startTime: 0,
      endTime: 0,
      speed: 100,
      loop: false,
      isPlaying: false,
      // Blob URL cleanup
      cleanupBlobUrl: null
    }
  },

  computed: {
    currentTraining() {
      return this.trainingStore.trainingList.find(
        training => training.id === this.trainingStore.selectedTraining
      )
    },

    currentPlaylistVideos() {
      return this.currentTraining?.list || []
    },

    // Available videos from VideoComponentNewRefactored
    availableVideos() {
      return this.videoStore.niouTrainingList || []
    },

    // Filtered videos based on search query
    filteredAvailableVideos() {
      if (!this.videoSearchQuery.trim()) {
        return this.availableVideos.map(training => ({
          ...training,
          show: this.expandedTrainings.has(training.trainingType),
          trainings: training.trainings.map((item, itemIndex) => ({
            ...item,
            show: this.expandedItems.has(`${training.trainingType}-${itemIndex}`)
          }))
        }))
      }

      const query = this.videoSearchQuery.toLowerCase()
      return this.availableVideos
        .map(training => ({
          ...training,
          show: true,
          trainings: training.trainings
            .filter(item => {
              const nameMatch = item.name.toLowerCase().includes(query)
              const videoMatch = item.videos && item.videos.some(video => 
                video.name.toLowerCase().includes(query)
              )
              return nameMatch || videoMatch
            })
            .map((item, itemIndex) => ({
              ...item,
              show: true
            }))
        }))
        .filter(training => training.trainings.length > 0)
    }
  },

  methods: {
    // Playlist Management
    backColor(training) {
      return training.id === this.trainingStore.selectedTraining 
        ? "selected-training" 
        : "unselected-training"
    },

    selectTraining(training) {
      this.trainingStore.setSelectedTraining(training.id)
    },

    addTraining() {
      if (this.currentName.trim()) {
        this.trainingStore.addTraining(this.currentName.trim())
        this.currentName = ""
      }
    },

    removeTraining() {
      if (this.currentTraining) {
        this.trainingStore.removeTraining(this.trainingStore.selectedTraining)
      }
    },

    // Video Management
    addVideoToCurrentPlaylist(videoData) {
      if (this.currentTraining && videoData) {
        console.log('Adding video to playlist:', videoData)
        
        // Ensure video has an absolute path
        let enhancedVideoData = this.ensureAbsolutePath(videoData)
        console.log('Enhanced video data:', enhancedVideoData)
        
        // Check if video is already in playlist (by identifier)
        const identifier = typeof enhancedVideoData === 'string' ? enhancedVideoData : this.getVideoIdentifier(enhancedVideoData)
        const exists = this.currentTraining.list.some(item => {
          const existingIdentifier = typeof item === 'string' ? item : this.getVideoIdentifier(item)
          return existingIdentifier === identifier
        })
        
        if (!exists) {
          console.log('Adding video to store:', enhancedVideoData)
          this.trainingStore.addVideoToTraining(this.trainingStore.selectedTraining, enhancedVideoData)
          console.log('Added "' + (enhancedVideoData.name || enhancedVideoData) + '" to playlist')
        } else {
          console.log('Video already in playlist')
        }
      }
    },

    removeVideoFromPlaylist(videoData) {
      if (this.currentTraining && videoData) {
        this.trainingStore.removeVideoFromTraining(this.trainingStore.selectedTraining, videoData)
      }
    },

    selectVideoForPlayback(videoData) {
      // Play video in the training component's own player
      this.playVideoInTrainingPlayer(videoData)
    },

    // Training Component Video Player Methods
    async playVideoInTrainingPlayer(videoData) {
      try {
        console.log('playVideoInTrainingPlayer called with:', videoData)
        console.log('videoData type:', typeof videoData)
        console.log('videoData properties:', Object.keys(videoData || {}))
        
        // Clean up previous blob URL
        if (this.cleanupBlobUrl) {
          this.cleanupBlobUrl()
          this.cleanupBlobUrl = null
        }

        const videoPlayer = this.$refs.trainingVideoPlayer
        if (!videoPlayer) {
          console.error('Training video player not found')
          return
        }

        let videoPath = null
        let videoName = 'Unknown Video'

        // Handle different video data formats
        if (typeof videoData === 'string') {
          videoPath = videoData
          videoName = videoData.split(/[\\\/]/).pop() || 'Video'
        } else if (videoData && typeof videoData === 'object') {
          // Handle video objects with absolute paths
          if (videoData.absolutePath) {
            videoPath = videoData.absolutePath
            videoName = videoData.name || 'Video'
          } else if (videoData.fileHandleId) {
            // For fileHandle videos, use the old method
            await this.handleFileHandleVideo(videoData)
            return
          } else {
            // Try to construct absolute path if needed
            if (videoData.url && (videoData.url.startsWith('/') || videoData.url.match(/^[A-Z]:/))) {
              videoPath = videoData.url
            } else if (videoData.path && (videoData.path.startsWith('/') || videoData.path.match(/^[A-Z]:/))) {
              videoPath = videoData.path
            } else if (videoData.path && this.videoStore.rootDirectoryPath) {
              // Construct from root + relative path
              videoPath = `${this.videoStore.rootDirectoryPath}/${videoData.path}`.replace(/[\\\/]+/g, '/')
            } else {
              videoPath = videoData.url || videoData.path || videoData.identifier
            }
            videoName = videoData.name || 'Video'
          }
        }

        console.log('Final video path for loading:', videoPath)

        if (videoPath) {
          // Use the same IPC method as VideoComponentNewRefactored for secure video loading
          if (window.electronAPI && window.electronAPI.loadVideoFile) {
            try {
              console.log('Loading video via IPC in training player:', videoPath)
              const result = await window.electronAPI.loadVideoFile(videoPath)
              
              if (result.success) {
                // Convert base64 to blob URL
                const binaryString = atob(result.data)
                const bytes = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i)
                }
                
                const blob = new Blob([bytes], { type: result.mimeType })
                const blobUrl = URL.createObjectURL(blob)
                
                // Clean up the blob URL when the video is replaced or component unmounted
                this.cleanupBlobUrl = () => URL.revokeObjectURL(blobUrl)
                
                videoPlayer.src = blobUrl
                this.currentVideoName = videoName
                console.log('Video loaded successfully in training player via IPC')
              } else {
                throw new Error(result.error || 'Failed to load video file')
              }
            } catch (error) {
              console.error('IPC video loading failed in training player:', error)
              // Fallback to file URL method
              const finalUrl = `file://${videoPath.replace(/#/g, '%23')}`
              videoPlayer.src = finalUrl
              this.currentVideoName = videoName
              console.log('Fallback: Loading video in training player:', finalUrl)
            }
          } else {
            // Fallback for web environments or when IPC is not available
            const finalUrl = `file://${videoPath.replace(/#/g, '%23')}`
            videoPlayer.src = finalUrl
            this.currentVideoName = videoName
            console.log('Loading video in training player (no IPC):', finalUrl)
          }
        }
      } catch (error) {
        console.error('Error playing video in training player:', error)
      }
    },

    async handleFileHandleVideo(videoData) {
      try {
        const videoPlayer = this.$refs.trainingVideoPlayer
        if (!videoPlayer) {
          console.error('Training video player not found')
          return
        }

        console.log('Handling FileHandle video:', videoData.fileHandleId)
        
        // Get the FileHandle from the FileService
        const fileHandle = this.fileService.getFileHandle(videoData.fileHandleId)
        if (!fileHandle) {
          throw new Error(`FileHandle not found for ID: ${videoData.fileHandleId}`)
        }

        // Get the file and create a blob URL
        const file = await fileHandle.getFile()
        const blobUrl = URL.createObjectURL(file)

        // Set the video source
        videoPlayer.src = blobUrl
        this.currentVideoName = videoData.name || 'FileHandle Video'

        // Clean up blob URL when component unmounts or new video loads
        this.cleanupBlobUrl = () => URL.revokeObjectURL(blobUrl)
        
        console.log('FileHandle video loaded successfully:', videoData.name)
      } catch (error) {
        console.error('Error handling fileHandle video:', error)
        alert(`Error loading video: ${error.message}`)
      }
    },

    // Video Player Controls
    playVideo() {
      const videoPlayer = this.$refs.trainingVideoPlayer
      if (videoPlayer) {
        videoPlayer.playbackRate = this.speed / 100
        videoPlayer.play()
        this.isPlaying = true
      }
    },

    pauseVideo() {
      const videoPlayer = this.$refs.trainingVideoPlayer
      if (videoPlayer) {
        videoPlayer.pause()
        this.isPlaying = false
      }
    },

    stopVideo() {
      const videoPlayer = this.$refs.trainingVideoPlayer
      if (videoPlayer) {
        videoPlayer.pause()
        videoPlayer.currentTime = this.startTime || 0
        this.isPlaying = false
      }
    },

    handleVideoLoaded() {
      const videoPlayer = this.$refs.trainingVideoPlayer
      if (videoPlayer) {
        this.videoDuration = videoPlayer.duration
        if (this.endTime === 0) {
          this.endTime = this.videoDuration
        }
      }
    },

    handleTimeUpdate() {
      const videoPlayer = this.$refs.trainingVideoPlayer
      if (videoPlayer) {
        const currentTime = videoPlayer.currentTime

        // Handle loop and time bounds
        if (currentTime >= this.endTime) {
          if (this.loop) {
            videoPlayer.currentTime = this.startTime
          } else {
            this.pauseVideo()
          }
        } else if (currentTime < this.startTime) {
          videoPlayer.currentTime = this.startTime
        }
      }
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00'
      const minutes = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    },

    getVideoDisplayName(videoPath) {
      if (typeof videoPath === 'string') {
        const pathParts = videoPath.split(/[\\\/]/)
        return pathParts[pathParts.length - 1]
      }
      return videoPath.name || 'Unknown Video'
    },

    // File Selection Methods (adapted from VideoComponentNewRefactored)
    async selectSingleVideo() {
      try {
        if (window.electronAPI && window.electronAPI.selectVideoFile) {
          const filePath = await window.electronAPI.selectVideoFile()
          if (filePath) {
            const videoData = {
              name: filePath.split(/[\\\/]/).pop(),
              path: filePath,
              url: filePath,
              isNative: true
            }
            this.addVideoToCurrentPlaylist(videoData)
          }
        } else {
          // Fallback for web
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'video/*'
          input.onchange = (e) => {
            const file = e.target.files[0]
            if (file) {
              const videoURL = URL.createObjectURL(file)
              const videoData = {
                name: file.name,
                url: videoURL,
                path: videoURL,
                isWeb: true
              }
              this.addVideoToCurrentPlaylist(videoData)
            }
          }
          input.click()
        }
      } catch (error) {
        console.error('Error selecting video file:', error)
      }
    },

    async selectTrainingDirectory() {
      try {
        if (window.electronAPI && window.electronAPI.selectDirectory) {
          const directoryPath = await window.electronAPI.selectDirectory()
          if (directoryPath) {
            await this.loadDirectoryVideos(directoryPath)
          }
        } else if (window.showDirectoryPicker) {
          // Web File System Access API
          const directoryHandle = await window.showDirectoryPicker()
          await this.loadDirectoryVideosFromHandle(directoryHandle)
        } else {
          console.warn('Directory selection not supported in this environment')
        }
      } catch (error) {
        console.error('Error selecting directory:', error)
      }
    },

    async loadDirectoryVideos(directoryPath) {
      try {
        if (window.electronAPI && window.electronAPI.getDirectoryVideos) {
          const videos = await window.electronAPI.getDirectoryVideos(directoryPath)
          this.directoryVideos = videos.map(video => ({
            name: video.name,
            path: video.path
          }))
          
          this.directoryInfo = {
            name: directoryPath.split(/[\\\/]/).pop(),
            path: directoryPath,
            totalTrainings: 1,
            totalVideos: videos.length,
            lastScanned: new Date()
          }
        }
      } catch (error) {
        console.error('Error loading directory videos:', error)
      }
    },

    async loadDirectoryVideosFromHandle(directoryHandle) {
      const videos = []
      
      const readDirectory = async (handle, basePath = '') => {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile()
            if (file.type.startsWith('video/') || 
                file.name.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) {
              videos.push({
                name: file.name,
                path: basePath + file.name,
                file: file
              })
            }
          } else if (entry.kind === 'directory') {
            await readDirectory(entry, basePath + entry.name + '/')
          }
        }
      }

      await readDirectory(directoryHandle)
      
      this.directoryVideos = videos
      this.directoryInfo = {
        name: directoryHandle.name,
        path: '',
        totalTrainings: 1,
        totalVideos: videos.length,
        lastScanned: new Date()
      }
    },

    async loadVideo(event) {
      const file = event.target.files[0]
      if (!file) return

      let videoData
      if (file.path) {
        // Electron environment
        videoData = {
          name: file.name,
          path: file.path.replace(/#/g, '%23'),
          url: file.path.replace(/#/g, '%23'),
          isNative: true
        }
      } else {
        // Web environment
        videoData = {
          name: file.name,
          url: URL.createObjectURL(file),
          path: URL.createObjectURL(file),
          isWeb: true
        }
      }

      this.addVideoToCurrentPlaylist(videoData)
    },

    clearDirectory() {
      this.directoryVideos = []
      this.directoryInfo = {
        name: "",
        path: "",
        totalTrainings: 0,
        totalVideos: 0,
        lastScanned: null
      }
    },

    // Modal methods
    openVideoModal() {
      this.showVideoModal = true
      // Initialize expanded state
      this.expandedTrainings.clear()
      this.expandedItems.clear()
    },

    closeVideoModal() {
      this.showVideoModal = false
      this.videoSearchQuery = ""
    },

    toggleTrainingCategory(trainingIndex) {
      const training = this.filteredAvailableVideos[trainingIndex]
      if (this.expandedTrainings.has(training.trainingType)) {
        this.expandedTrainings.delete(training.trainingType)
      } else {
        this.expandedTrainings.add(training.trainingType)
      }
      this.$forceUpdate() // Force reactivity update
    },

    toggleTrainingItem(trainingIndex, itemIndex) {
      const training = this.filteredAvailableVideos[trainingIndex]
      const key = `${training.trainingType}-${itemIndex}`
      if (this.expandedItems.has(key)) {
        this.expandedItems.delete(key)
      } else {
        this.expandedItems.add(key)
      }
      this.$forceUpdate() // Force reactivity update
    },

    getTrainingVideoCount(training) {
      return training.trainings.reduce((total, item) => {
        if (item.videos) {
          return total + item.videos.length
        } else if (item.isDirectFile || item.url) {
          return total + 1
        }
        return total
      }, 0)
    },

    selectVideoFromModal(video) {
      // Preview/play the video in the training player
      this.playVideoInTrainingPlayer(video)
    },

    addVideoFromModal(video) {
      const videoIdentifier = this.getVideoIdentifier(video)
      if (videoIdentifier) {
        // Store the complete video object for playlist management
        const videoData = {
          name: video.name,
          identifier: videoIdentifier,
          fileHandleId: video.fileHandleId,
          url: video.url,
          path: video.path,
          isDirectFile: video.isDirectFile,
          parentName: video.parentName
        }
        
        this.addVideoToCurrentPlaylist(videoData)
        console.log(`Added "${video.name}" to playlist`)
      }
    },

    getVideoIdentifier(video) {
      // Return the appropriate identifier for the video
      if (video.fileHandleId) {
        return video.fileHandleId // For videos from VideoComponentNewRefactored
      }
      // For videos with absolutePath, use the relative path as identifier
      if (video.absolutePath && video.path) {
        return video.path // Use relative path as identifier
      }
      return video.url || video.path || video.identifier
    },

    ensureAbsolutePath(videoData) {
      // If videoData is a string, treat it as a path
      if (typeof videoData === 'string') {
        return {
          name: videoData.split(/[\\\/]/).pop() || 'Video',
          absolutePath: videoData,
          path: videoData,
          identifier: videoData
        }
      }
      
      // If it's an object, ensure it has absolutePath
      if (videoData && typeof videoData === 'object') {
        // If already has absolutePath, return as-is
        if (videoData.absolutePath) {
          return videoData
        }
        
        // Try to construct absolute path
        let absolutePath = null
        
        if (videoData.url && videoData.url.startsWith('/') || videoData.url && videoData.url.match(/^[A-Z]:/)) {
          // Already looks like an absolute path
          absolutePath = videoData.url
        } else if (videoData.path && (videoData.path.startsWith('/') || videoData.path.match(/^[A-Z]:/))) {
          // Path is already absolute
          absolutePath = videoData.path
        } else if (videoData.path && this.videoStore.rootDirectoryPath) {
          // Construct from root + relative path
          absolutePath = `${this.videoStore.rootDirectoryPath}/${videoData.path}`.replace(/[\\\/]+/g, '/')
        } else {
          // Fallback to whatever path we have
          absolutePath = videoData.url || videoData.path || videoData.identifier
        }
        
        return {
          ...videoData,
          absolutePath: absolutePath,
          name: videoData.name || absolutePath.split(/[\\\/]/).pop() || 'Video'
        }
      }
      
      return videoData
    },

    getVideoDisplayName(videoItem) {
      if (typeof videoItem === 'string') {
        const pathParts = videoItem.split(/[\\\/]/)
        return pathParts[pathParts.length - 1]
      }
      return videoItem.name || videoItem.identifier || 'Unknown Video'
    },
  },

  watch: {
    speed(newSpeed) {
      const videoPlayer = this.$refs.trainingVideoPlayer
      if (videoPlayer) {
        videoPlayer.playbackRate = newSpeed / 100
      }
    }
  },

  mounted() {
    // Load saved playlists from store
    this.trainingStore.loadTrainings()
  },

  beforeUnmount() {
    // Clean up blob URLs
    if (this.cleanupBlobUrl) {
      this.cleanupBlobUrl()
    }
  }
}
</script>

<style scoped>
/* Main Container */
.training-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  box-sizing: border-box;
  color: #2c3e50;
}

/* Layout */
.training-layout {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 25px;
  height: calc(100vh - 40px);
  max-width: 1600px;
  margin: 0 auto;
}

/* Left Panel - Playlist Section */
.playlist-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.playlist-section::-webkit-scrollbar {
  width: 6px;
}

.playlist-section::-webkit-scrollbar-track {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
}

.playlist-section::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.playlist-section h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Right Panel - Video Player Section */
.video-player-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-player-section h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Playlist Tabs */
.playlist-tabs {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.horizontal-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.horizontal-list li {
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-align: center;
  font-weight: 500;
  border: 2px solid transparent;
}

.selected-training {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
  border-color: #667eea;
}

.unselected-training {
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  border-color: #e0e6ed;
}

.unselected-training:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.horizontal-list li p {
  margin: 0;
  font-size: 0.9rem;
}

/* Playlist Controls */
.playlist-controls {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.playlist-controls input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 25px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  color: #2c3e50;
}

.playlist-controls input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.2);
}

.button-group {
  display: flex;
  gap: 10px;
}

.button-group button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.button-group button:first-child {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.button-group button:first-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.button-group button:last-child {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.button-group button:last-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

/* Playlist Content */
.playlist-content {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.playlist-content h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  padding: 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  border: 2px solid rgba(102, 126, 234, 0.2);
}

.video-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-list::-webkit-scrollbar {
  width: 6px;
}

.video-list::-webkit-scrollbar-track {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
}

.video-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.video-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #2c3e50;
}

.video-item:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  transform: translateX(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.button-remove {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.button-remove:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

/* File Controls */
.file-controls {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.button-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.button-file {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  text-align: center;
  text-decoration: none;
  display: block;
}

.button-file:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

#uploadVideo {
  display: none;
}

/* Directory Browser */
.directory-browser {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.directory-browser h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
}

.directory-videos {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.directory-video-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.directory-video-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.directory-video-item span {
  cursor: pointer;
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.directory-video-item span:hover {
  color: #667eea;
}

.button-add {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}

.button-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

/* Video Player */
.video-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.video-container video {
  width: 100%;
  height: 400px;
  background: #000;
}

/* Video Controls */
.video-controls {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.playback-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.control-button {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  min-width: 100px;
}

.control-button:nth-child(1) {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.control-button:nth-child(2) {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.control-button:nth-child(3) {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.control-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Time Controls */
.time-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slider-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.slider-container input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ecf0f1;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.slider-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.2s ease;
}

.slider-container input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.time-value {
  font-weight: 600;
  color: #667eea;
  text-align: center;
  background: rgba(102, 126, 234, 0.1);
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
}

/* Advanced Controls */
.advanced-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.speed-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.speed-control label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.speed-control input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ecf0f1;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.speed-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  transition: all 0.2s ease;
}

.speed-control input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

.loop-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loop-control label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
}

.loop-control input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
  cursor: pointer;
}

/* Video Info */
.video-info {
  border-top: 2px solid rgba(102, 126, 234, 0.2);
  padding-top: 15px;
  margin-top: 15px;
}

.video-info h4 {
  margin: 0;
  color: #667eea;
  font-size: 1.1rem;
  font-weight: 600;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
  font-size: 1.4rem;
}

.modal-close {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.modal-close:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.modal-body {
  padding: 25px;
  flex: 1;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.7);
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.modal-footer {
  padding: 25px;
  border-top: 2px solid rgba(102, 126, 234, 0.2);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.search-section {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 25px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  color: #2c3e50;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.2);
}

.video-browser {
  max-height: 500px;
  overflow-y: auto;
}

.training-category {
  margin-bottom: 15px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
}

.training-header {
  background: rgba(102, 126, 234, 0.1);
  padding: 15px 20px;
  margin: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  font-weight: 600;
  color: #2c3e50;
}

.training-header:hover {
  background: rgba(102, 126, 234, 0.2);
}

.training-header.expanded {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.training-items {
  background: rgba(255, 255, 255, 0.5);
}

.training-item {
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.training-item:last-child {
  border-bottom: none;
}

.item-header {
  background: rgba(102, 126, 234, 0.05);
  padding: 12px 25px;
  margin: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c3e50;
}

.item-header:hover {
  background: rgba(102, 126, 234, 0.1);
}

.item-header.expanded {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.video-list-modal {
  background: rgba(255, 255, 255, 0.3);
}

.video-item-modal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 30px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.video-item-modal:hover {
  background: rgba(102, 126, 234, 0.1);
}

.video-item-modal:last-child {
  border-bottom: none;
}

.video-name {
  flex: 1;
  font-size: 0.85rem;
  color: #2c3e50;
  font-weight: 500;
}

.button-select {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.button-select:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.button-cancel {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(149, 165, 166, 0.3);
}

.button-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(149, 165, 166, 0.4);
}

.no-videos {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .training-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .playlist-section {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .training-container {
    padding: 10px;
  }
  
  .playlist-section,
  .video-player-section {
    padding: 15px;
  }
  
  .time-controls {
    grid-template-columns: 1fr;
  }
  
  .advanced-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .playback-controls {
    flex-direction: column;
  }
  
  .control-button {
    width: 100%;
  }
}
</style>
