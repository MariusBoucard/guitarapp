<template>
  <div class="video-container">
    <div class="two-columns">
      <!-- Left Panel - Playlist Management -->
      <div class="column-left">
        <h2 class="section-title">Training Playlists</h2>
        
        <!-- Playlist Tabs -->
        <div class="section-card">
          <ul class="list-unstyled list-horizontal">
            <li v-for="training in trainingStore.trainingList" 
                @click="selectTraining(training)" 
                :class="backColor(training)" 
                :key="training.id"
                class="list-item">
              <p>{{ training.name }}</p>
            </li>
          </ul>
        </div>

        <!-- Playlist Management Controls -->
        <div class="section-card">
          <input v-model="currentName" 
                 type="text" 
                 placeholder="New playlist name" 
                 class="form-input" />
          <div class="btn-group">
            <button @click="addTraining()" class="btn btn-success">Add Playlist</button>
            <button @click="removeTraining()" class="btn btn-danger-alt">Remove Playlist</button>
          </div>
        </div>

        <!-- Current Playlist Videos -->
        <div class="section-card" style="flex: 1;">
          <h3 v-if="currentTraining" style="margin: 0 0 15px 0; color: var(--text-primary); font-weight: 600; font-size: 1.1rem; text-align: center; padding: 10px; background: var(--bg-primary-light); border-radius: 20px; border: 2px solid var(--bg-primary-border);">
            {{ currentTraining.name }} - Videos
          </h3>
          <div class="list-scrollable" style="max-height: 300px;">
            <div v-for="(item, index) in currentPlaylistVideos" 
                 :key="index" 
                 @click="playVideoInTrainingPlayer(item)"
                 class="list-item-with-action">
              <span>{{ getVideoDisplayName(item) }}</span>
              <button class="btn-icon-round btn-danger-alt" @click.stop="removeVideoFromPlaylist(item)"></button>
            </div>
          </div>
        </div>

        <!-- File Selection Controls -->
        <div class="section-card">
          <div class="btn-group btn-group-vertical">
            <button class="btn btn-primary" @click="selectSingleVideo">Add Single Video</button>
            <button class="btn btn-primary" @click="selectTrainingDirectory">Add From Directory</button>
            <button class="btn btn-primary" @click="openVideoModal">Browse Available Videos</button>
            <label class="btn btn-primary" for="uploadVideo">Upload File (Web)</label>
            <input id="uploadVideo" type="file" @change="loadVideo" accept="video/*" style="display: none;">
          </div>
        </div>

        <!-- Directory Browser (when directory is selected) -->
        <div v-if="directoryVideos.length > 0" class="section-card">
          <h3 style="margin: 0 0 15px 0; color: var(--text-primary); font-weight: 600; font-size: 1.1rem;">
            Available Videos from Directory
          </h3>
          <div class="list-scrollable" style="max-height: 200px;">
            <div v-for="video in directoryVideos" 
                 :key="video.path" 
                 class="list-item-with-action">
              <span @click="playVideoInTrainingPlayer(video)">{{ video.name }}</span>
              <button @click="addVideoToCurrentPlaylist(video)" class="btn btn-warning btn-small">Add to Playlist</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Video Player -->
      <div class="column-right">
        <h2 class="section-title">Training Video Player</h2>
        
        <!-- Video Player -->
        <div class="video-player">
          <video 
            ref="trainingVideoPlayer"
            class="video-player-full-height"
            @timeupdate="handleTimeUpdate" 
            @loadedmetadata="handleVideoLoaded"
            controls>
            Your browser does not support the video tag.
          </video>
        </div>
        
        <!-- Video Controls -->
        <div class="section-card">
          <!-- Playback Controls -->
          <div class="btn-group btn-group-center mb-medium">
            <button class="btn btn-success" @click="playVideo">▶ Play</button>
            <button class="btn btn-warning" @click="pauseVideo">⏸ Pause</button>
            <button class="btn btn-danger" @click="stopVideo">⏹ Stop</button>
          </div>

          <!-- Time Controls -->
          <div class="slider-section">
            <div class="slider-grid">
              <div class="slider-container">
                <label for="startSlider" class="slider-label">Start Time</label>
                <input 
                  id="startSlider" 
                  type="range" 
                  v-model="startTime" 
                  :max="endTime" 
                  min="0" 
                  step="1"
                  class="range-input">
                <p class="slider-value">{{ formatTime(startTime) }}</p>
              </div>

              <div class="slider-container">
                <label for="endSlider" class="slider-label">End Time</label>
                <input 
                  id="endSlider" 
                  type="range" 
                  v-model="endTime" 
                  :min="startTime" 
                  :max="videoDuration" 
                  step="1"
                  class="range-input">
                <p class="slider-value">{{ formatTime(endTime) }}</p>
              </div>
            </div>
          </div>

          <!-- Speed and Loop Controls -->
          <div class="slider-section">
            <div class="slider-container">
              <label for="speedSlider" class="slider-label">Speed: {{ speed }}%</label>
              <input 
                id="speedSlider"
                type="range" 
                min="25" 
                max="200" 
                step="5"
                v-model="speed"
                class="range-input-thick">
            </div>

            <div class="checkbox-container">
              <label class="checkbox-label">Loop</label>
              <input type="checkbox" v-model="loop" class="checkbox-input">
            </div>
          </div>

          <!-- Current Video Info -->
          <div v-if="currentVideoName" class="section-card" style="background: var(--bg-primary-light); border: 2px solid var(--bg-primary-border);">
            <h4 style="margin: 0; color: var(--primary-color); font-size: 1.1rem; font-weight: 600; text-align: center;">
              {{ currentVideoName }}
            </h4>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Selection Modal -->
    <div v-if="showVideoModal" class="modal-overlay" @click="closeVideoModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Browse Available Videos</h2>
          <button class="btn-icon-round btn-danger-alt" @click="closeVideoModal"></button>
        </div>
        
        <div class="modal-body">
          <div v-if="availableVideos.length === 0" class="no-content-message">
            <p>No videos found. First load a directory in the Video Player component.</p>
          </div>
          
          <div v-else class="video-browser">
            <!-- Search filter -->
            <input 
              v-model="videoSearchQuery" 
              type="text" 
              placeholder="Search videos..."
              class="form-input"
            />
            
            <!-- Training categories -->
            <div class="training-tree">
              <div v-for="(training, trainingIndex) in filteredAvailableVideos" 
                   :key="trainingIndex" 
                   class="training-category">
                <h3 
                  @click="toggleTrainingCategory(trainingIndex)" 
                  class="training-category-header"
                  :class="{ 'training-category-header-expanded': training.show }"
                >
                  📁 {{ training.trainingType }} ({{ getTrainingVideoCount(training) }} videos)
                </h3>
                
                <div v-show="training.show" class="training-items">
                  <div v-for="(item, itemIndex) in training.trainings" 
                       :key="itemIndex" 
                       class="training-item">
                    <h4 
                      @click="toggleTrainingItem(trainingIndex, itemIndex)"
                      class="training-item-header"
                      :class="{ 'training-item-header-expanded': item.show }"
                    >
                      📂 {{ item.name }} 
                      <span v-if="item.videos">({{ item.videos.length }} videos)</span>
                    </h4>
                    
                    <div v-show="item.show">
                      <ul class="video-list">
                        <!-- Single video (direct file) -->
                        <li v-if="item.isDirectFile" 
                            class="video-item"
                            @click="selectVideoFromModal(item)">
                          🎥 {{ item.name }}
                          <button class="btn btn-success btn-small" @click.stop="addVideoFromModal(item)">
                            Add to Playlist
                          </button>
                        </li>
                        
                        <!-- Multiple videos -->
                        <li v-else v-for="(video, videoIndex) in item.videos || []" 
                            :key="videoIndex"
                            class="video-item"
                            @click="selectVideoFromModal(video)">
                          🎥 {{ video.name }}
                          <button class="btn btn-success btn-small" @click.stop="addVideoFromModal(video)">
                            Add to Playlist
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeVideoModal" class="btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useTrainingStore } from '@/stores/trainingStore.js'
import { useVideoStore } from '@/stores/videoStore.js'
import { serviceManager } from '@/services/index.js'
import "../assets/css/global.css"
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
        ? "list-item-selected" 
        : ""
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
/* Modal Overlay and Content */
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
  background: var(--bg-main-gradient);
  border-radius: var(--border-radius-large);
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
  border-bottom: 2px solid var(--bg-primary-border);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.4rem;
}

.modal-body {
  padding: 25px;
  flex: 1;
  overflow-y: auto;
  background: var(--bg-white-semi);
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--bg-primary-light);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--primary-gradient);
  border-radius: 3px;
}

.modal-footer {
  padding: 25px;
  border-top: 2px solid var(--bg-primary-border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Video Browser */
.video-browser {
  max-height: 500px;
  overflow-y: auto;
}

/* Additional styling for video items in modal */
.video-list .video-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 25px;
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95%;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 15px;
  }
}
</style>