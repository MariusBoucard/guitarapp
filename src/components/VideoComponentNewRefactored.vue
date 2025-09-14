<template>
  <div class="video-container" data-video-component="new-refactored">
    <div class="two-columns">
      <div class="column-left">
        <div>
          <!-- Training List -->
          <div class="section-card fade-in-up">
            <h2 class="section-title">Video Training Library</h2>
            <div v-if="trainingList.length === 0" class="no-content-message">
              <p>No video library loaded. Use "Select Training Directory" below to load your video collection.</p>
            </div>
            <div v-else class="training-tree">
              <div v-for="(training, index) in trainingList" :key="`training-${index}`" class="training-category">
                <h3 @click="toggleTraining(index)" 
                    class="training-category-header" 
                    :class="{ 'training-category-header-expanded': training.show }">
                  📁 {{ training.trainingType }} ({{ getTotalVideosInTraining(training) }} videos)
                </h3>
                <div v-show="training.show" class="training-items">
                  <div v-for="(item, subIndex) in training.trainings" :key="`item-${index}-${subIndex}`" class="training-item">
                    <h4 @click="toggleItem(index, subIndex)" 
                        class="training-item-header"
                        :class="{ 'training-item-header-expanded': item.show }">
                      📂 {{ item.name }} ({{ item.videos ? item.videos.length : (item.isDirectFile ? 1 : 0) }} videos)
                    </h4>
                    <ul v-show="item.show" class="video-list">
                      <li v-if="item.isDirectFile" @click="launchFile(item)" class="video-item">
                        🎥 {{ item.name }}
                      </li>
                      <li v-else v-for="(video, videoIndex) in item.videos || []" :key="`video-${index}-${subIndex}-${videoIndex}`"
                          @click="launchFile(video)" class="video-item">
                        🎥 {{ video.name }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Directory Selection -->
          <div class="section-card">
            <input v-model="defaultPath" type="text" placeholder="Enter base path" class="form-input" />
            <div class="btn-group btn-group-vertical">
              <button @click="selectTrainingDirectory" class="btn btn-primary">Select Training Directory</button>
              <button @click="selectSingleVideo" class="btn btn-primary">Select Single Video</button>
            </div>
            
            <!-- Auto-reload status -->
            <div v-if="showAutoReloadMessage" class="auto-reload-message">
              <p>📁 Found previous directory: <strong>{{ directoryInfo.name }}</strong></p>
              <p>To access your videos again, we need directory permission.</p>
              <div class="btn-group gap-small">
                <button @click="reloadDirectory" class="btn btn-success btn-small">📂 Reload Directory</button>
                <button @click="hideAutoReloadMessage" class="btn btn-secondary btn-small">Dismiss</button>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="error-message">
              <p>{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="column-right">
        <h1 class="section-title">{{ currentVideoName }}</h1>

        <!-- Video Player -->
        <video 
          class="video-player" 
          @timeupdate="handleTimeUpdate" 
          @loadedmetadata="handleVideoLoaded"
          ref="videoPlayer" 
          controls>
        </video>
        
        <!-- Video Controls -->
        <div class="btn-group btn-group-center">
          <button class="btn btn-success" @click="playVideo">Play</button>
          <button class="btn btn-warning" @click="pauseVideo">Pause</button>
          <button class="btn btn-danger" @click="stopVideo">Stop</button>
        </div>

        <!-- Speed Control -->
        <div class="text-center">
          <h3 class="mb-medium">Playing rate</h3>
          <div class="slider-container">
            <input 
              type="range" 
              min="10" 
              max="300" 
              v-model="speed"
              @input="updateSpeed"
              class="range-input range-input-thick">
            <p class="slider-value">{{ speed }}%</p>
          </div>
        </div>

        <!-- Time Controls -->
        <div class="slider-section">
          <div class="slider-grid">
            <div class="slider-container slider-container-vertical">
              <label for="startSlider" class="slider-label">Video Start</label>
              <input 
                id="startSlider" 
                type="range" 
                v-model="startTime" 
                :max="endTime" 
                min="0" 
                step="1"
                @change="updatePlaybackSettings"
                class="range-input">
              <p class="slider-value">{{ formatTime(startTime) }}</p>
            </div>

            <div class="slider-container slider-container-vertical">
              <label for="endSlider" class="slider-label">Video End</label>
              <input 
                id="endSlider" 
                type="range" 
                v-model="endTime" 
                :min="startTime" 
                :max="videoDuration" 
                step="1"
                @change="updatePlaybackSettings"
                class="range-input">
              <p class="slider-value">{{ formatTime(endTime) }}</p>
            </div>
          </div>
        </div>

        <!-- Loop Control -->
        <div class="checkbox-container">
          <label for="loopCheckbox" class="checkbox-label">Loop:</label>
          <input 
            id="loopCheckbox" 
            type="checkbox" 
            v-model="loop"
            @change="updatePlaybackSettings"
            class="checkbox-input">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '../assets/css/global.css'
import { useVideoStore } from '@/stores/videoStore'
import { serviceManager } from '@/services'

export default {
  name: 'VideoComponentNewRefactored',
  
  data() {
    return {
      videoStore: useVideoStore(),
      videoService: serviceManager.video,
      errorMessage: '',
      showAutoReloadMessage: false,
      trainingList: []
    }
  },

  computed: {
    currentVideoName() {
      return this.videoStore.currentVideoName
    },
    
    defaultPath: {
      get() {
        return this.videoStore.defaultPath
      },
      set(value) {
        this.videoStore.defaultPath = value
      }
    },

    startTime: {
      get() {
        return this.videoStore.startTime
      },
      set(value) {
        this.videoStore.startTime = Number(value)
      }
    },

    endTime: {
      get() {
        return this.videoStore.endTime
      },
      set(value) {
        this.videoStore.endTime = Number(value)
      }
    },

    speed: {
      get() {
        return this.videoStore.speed
      },
      set(value) {
        this.videoStore.speed = Number(value)
      }
    },

    loop: {
      get() {
        return this.videoStore.loop
      },
      set(value) {
        this.videoStore.loop = value
      }
    },

    videoDuration() {
      return this.videoStore.videoLength
    },

    directoryInfo() {
      return this.videoStore.directoryInfo
    }
  },

  watch: {
    speed(newSpeed) {
      this.updateSpeed()
    },

    // Watch for changes in the store's training list
    'videoStore.niouTrainingList': {
      handler(newList) {
        this.trainingList = [...newList] // Force reactivity
        // this.$forceUpdate() // Ensure the template updates
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    async selectTrainingDirectory() {
      try {
        if (window.electronAPI && window.electronAPI.selectDirectory) {
          const selectedPath = await window.electronAPI.selectDirectory()
          
          if (selectedPath) {
            const scanResult = await window.electronAPI.scanVideoDirectory(selectedPath)
            
            if (scanResult.success && scanResult.videos.length > 0) {
              const videos = scanResult.videos
              
              // Save the directory tree
              const saveResult = await window.electronAPI.saveDirectoryTree(selectedPath, videos)
              if (saveResult.success) {
                console.log('Directory tree saved to:', saveResult.filePath)
              }
              
              // Convert and set the training structure
              const trainingStructure = this.convertVideosToTrainingStructure(videos, selectedPath)
              
              // Update store
              this.videoStore.rootDirectoryPath = selectedPath
              this.videoStore.directoryStructure.name = selectedPath.split(/[\\\/]/).pop()
              this.videoStore.directoryStructure.path = selectedPath
              this.videoStore.directoryStructure.lastScanned = new Date().toISOString()
              
              // Update the training list in store and local data
              this.videoStore.setNiouTrainingList(trainingStructure)
              this.trainingList = [...trainingStructure] // Force local update
              
              this.videoStore.saveDirectoryInfo()
              
              this.errorMessage = ''
              this.showAutoReloadMessage = false
              
              console.log('Training list updated:', this.trainingList)
            } else {
              this.errorMessage = scanResult.error || 'No video files found in selected directory'
            }
          }
        } else {
          this.errorMessage = 'Directory selection not available (Electron required)'
        }
      } catch (error) {
        this.errorMessage = `Failed to load training directory: ${error.message}`
        console.error('Directory selection error:', error)
      }
    },

    convertVideosToTrainingStructure(videos, basePath) {
      const trainingMap = new Map()
      
      videos.forEach(video => {
        const relativePath = video.path.replace(basePath, '').replace(/^[\\\/]/, '')
        const pathParts = relativePath.split(/[\\\/]/)
        
        if (pathParts.length >= 2) {
          const trainingType = pathParts[0]
          const trainingName = pathParts[1]
          
          if (!trainingMap.has(trainingType)) {
            trainingMap.set(trainingType, {
              trainingType,
              trainings: new Map(),
              show: false
            })
          }
          
          const training = trainingMap.get(trainingType)
          if (!training.trainings.has(trainingName)) {
            training.trainings.set(trainingName, {
              name: trainingName,
              videos: [],
              show: false
            })
          }
          
          training.trainings.get(trainingName).videos.push({
            name: video.name,
            absolutePath: video.path,
            path: relativePath
          })
        }
      })
      
      const result = Array.from(trainingMap.values()).map(training => ({
        ...training,
        trainings: Array.from(training.trainings.values())
      }))
      
      console.log('Converted training structure:', result)
      return result
    },

    async selectSingleVideo() {
      try {
        if (window.electronAPI && window.electronAPI.selectVideoFile) {
          const filePath = await window.electronAPI.selectVideoFile()
          if (filePath) {
            const videoData = {
              name: this.videoService.extractFilename(filePath),
              url: filePath,
              isNative: true
            }
            await this.launchFile(videoData)
          }
        } else {
          throw new Error('Electron API not available')
        }
        this.errorMessage = ''
      } catch (error) {
        this.errorMessage = `Failed to select video: ${error.message}`
      }
    },

    toggleTraining(index) {
      // Close all other trainings
      this.trainingList.forEach((training, i) => {
        if (i !== index) {
          training.show = false
        }
      })
      // Toggle the selected training
      this.videoStore.toggleTrainingVisibility(index)
      // Update local list to reflect changes
      this.trainingList = [...this.videoStore.niouTrainingList]
    },

    toggleItem(trainingIndex, itemIndex) {
      // Close all other items in this training
      if (this.trainingList[trainingIndex]?.trainings) {
        this.trainingList[trainingIndex].trainings.forEach((item, i) => {
          if (i !== itemIndex) {
            item.show = false
          }
        })
      }
      this.videoStore.toggleItemVisibility(trainingIndex, itemIndex)
      // Update local list to reflect changes
      this.trainingList = [...this.videoStore.niouTrainingList]
    },

    getTotalVideosInTraining(training) {
      if (!training.trainings) return 0
      return training.trainings.reduce((total, item) => {
        if (item.isDirectFile) {
          return total + 1
        }
        return total + (item.videos ? item.videos.length : 0)
      }, 0)
    },

    async launchFile(videoData) {
      try {
        const videoElement = this.$refs.videoPlayer
        if (!videoElement) {
          throw new Error('Video player not found')
        }
        
        let filePath = null
        
        if (videoData.absolutePath) {
          filePath = videoData.absolutePath
        } else if (typeof videoData === 'string') {
          filePath = videoData
        } else if (videoData.url) {
          filePath = videoData.url
        } else if (videoData.path && this.videoStore.rootDirectoryPath) {
          filePath = `${this.videoStore.rootDirectoryPath}/${videoData.path}`.replace(/[\\\/]+/g, '/')
        } else {
          throw new Error('No valid file path available')
        }
        
        await this.videoService.setVideoSource(videoElement, filePath)
        
        this.videoStore.currentVideoName = videoData.name || 'Unknown Video'
        this.videoStore.speed = 100
        
        this.errorMessage = ''
        
      } catch (error) {
        this.errorMessage = `Failed to load video: ${error.message}`
      }
    },

    handleVideoLoaded() {
      const video = this.$refs.videoPlayer
      if (video) {
        const duration = video.duration
        this.videoStore.setVideoLength(duration)
      }
    },

    handleTimeUpdate() {
      const video = this.$refs.videoPlayer
      if (video) {
        const currentTime = video.currentTime
        this.videoService.handleTimeUpdate(
          video, 
          currentTime, 
          this.startTime, 
          this.endTime, 
          this.loop
        )
      }
    },

    async playVideo() {
      try {
        const video = this.$refs.videoPlayer
        if (video) {
          const playbackRate = this.speed / 100
          await this.videoService.playVideo(video, playbackRate)
        }
      } catch (error) {
        this.errorMessage = `Playback failed: ${error.message}`
      }
    },

    pauseVideo() {
      const video = this.$refs.videoPlayer
      if (video) {
        this.videoService.pauseVideo(video)
      }
    },

    stopVideo() {
      const video = this.$refs.videoPlayer
      if (video) {
        this.videoService.stopVideo(video, this.startTime)
      }
    },

    updateSpeed() {
      const video = this.$refs.videoPlayer
      if (video) {
        this.videoService.setPlaybackRate(video, this.speed)
      }
    },

    updatePlaybackSettings() {
      this.videoStore.setVideoPlaybackSettings({
        startTime: this.startTime,
        endTime: this.endTime,
        speed: this.speed,
        loop: this.loop
      })
    },

    formatTime(seconds) {
      return this.videoService.formatTime(seconds)
    },

    hideAutoReloadMessage() {
      this.showAutoReloadMessage = false
    },

    async reloadDirectory() {
      try {
        this.showAutoReloadMessage = false
        
        if (this.videoStore.rootDirectoryPath && window.electronAPI && window.electronAPI.scanVideoDirectory) {
          const scanResult = await window.electronAPI.scanVideoDirectory(this.videoStore.rootDirectoryPath)
          if (scanResult.success && scanResult.videos.length > 0) {
            const trainingStructure = this.convertVideosToTrainingStructure(scanResult.videos, this.videoStore.rootDirectoryPath)
            
            this.videoStore.setNiouTrainingList(trainingStructure)
            this.trainingList = [...trainingStructure] // Update local list
            
            this.errorMessage = ''
            return
          }
        }
        
        this.errorMessage = 'Could not reload directory automatically. Please select the directory again.'
        
      } catch (error) {
        this.errorMessage = `Failed to reload directory: ${error.message}`
      }
    }
  },

  async mounted() {
    // Load from storage
    this.videoStore.loadFromStorage()
    
    // Initialize training list from store
    this.trainingList = [...this.videoStore.niouTrainingList]
    
    // Load saved directory tree
    if (window.electronAPI && window.electronAPI.loadDirectoryTree) {
      try {
        const result = await window.electronAPI.loadDirectoryTree()
        
        if (result.success) {
          this.videoStore.rootDirectoryPath = result.data.directoryPath
          this.videoStore.directoryStructure.name = result.data.directoryPath.split(/[\\\/]/).pop()
          this.videoStore.directoryStructure.path = result.data.directoryPath
          this.videoStore.directoryStructure.lastScanned = result.data.lastScanned
          
          const trainingStructure = this.convertVideosToTrainingStructure(
            result.data.tree, 
            result.data.directoryPath
          )
          
          this.videoStore.setNiouTrainingList(trainingStructure)
          this.trainingList = [...trainingStructure] // Update local list
        }
      } catch (error) {
        console.error('Failed to load saved directory tree:', error)
      }
    }
    
    // Listen for launch video events
    const handleLaunchVideo = (event) => {
      const videoData = event.detail
      if (videoData) {
        this.launchFile(videoData)
      }
    }
    
    document.addEventListener('launch-video', handleLaunchVideo)
    
    // Store the cleanup function for unmount
    this._cleanupVideoLauncher = () => {
      document.removeEventListener('launch-video', handleLaunchVideo)
    }
  },

  beforeUnmount() {
    if (this._cleanupVideoLauncher) {
      this._cleanupVideoLauncher()
    }
  }
}
</script>

<style scoped>
/* Component-specific styles that can't be generalized */
.auto-reload-message {
  margin: 15px 0;
  padding: 15px;
  background: var(--bg-primary-light);
  border: 2px solid var(--bg-primary-border-light);
  border-radius: var(--border-radius);
  color: var(--text-primary);
}

.auto-reload-message p {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-secondary {
  background: rgba(149, 165, 166, 0.2);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
}

.btn-secondary:hover {
  background: rgba(149, 165, 166, 0.3);
  transform: translateY(-1px);
}

.error-message {
  margin: 15px 0;
  padding: 15px;
  background: rgba(231, 76, 60, 0.1);
  border: 2px solid rgba(231, 76, 60, 0.3);
  border-radius: var(--border-radius);
  color: #e74c3c;
}

.error-message p {
  margin: 0;
  font-weight: 500;
}
</style>