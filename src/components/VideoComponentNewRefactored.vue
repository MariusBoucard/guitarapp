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
          @ended="handleVideoEnded"
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
          <h3 class="mb-medium slider-label">Playing rate</h3>
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
        <div class="loop-settings-container">
          <!-- Auto-loop Settings -->
          <div class="auto-loop-container">
            <label for="enableAutoLoop" class="checkbox-label">Auto-loop short videos:</label>
            <input 
              id="enableAutoLoop" 
              type="checkbox" 
              v-model="enableAutoLoop"
              @change="updatePlaybackSettings"
              class="checkbox-input">
            
            <div v-if="enableAutoLoop" class="auto-loop-threshold">
              <label for="autoLoopThreshold" class="threshold-label">Auto-loop if shorter than:</label>
              <div class="threshold-controls">
                <input 
                  id="autoLoopThreshold" 
                  type="number" 
                  v-model="autoLoopThreshold" 
                  min="1" 
                  max="300"
                  class="threshold-input"
                  @change="updatePlaybackSettings">
                <span class="threshold-unit">seconds</span>
              </div>
            </div>
          </div>

          <div class="checkbox-container">
            <label for="loopCheckbox" class="checkbox-label">Manual Loop:</label>
            <input 
              id="loopCheckbox" 
              type="checkbox" 
              v-model="loop"
              @change="updatePlaybackSettings"
              class="checkbox-input"
              :disabled="isAutoLoopActive">
          </div>
          
          <!-- Loop Count Control -->
          <div v-if="loop || isAutoLoopActive" class="loop-count-container">
            <label for="loopCount" class="loop-count-label">Number of loops:</label>
            <div class="loop-count-controls">
              <input 
                id="loopCount" 
                type="number" 
                v-model="loopCount" 
                min="1" 
                max="100"
                class="loop-count-input"
                @change="updatePlaybackSettings">
              <span class="loop-count-info">
                {{ loopsCompleted }}/{{ loopCount }} loops
                <span v-if="isAutoLoopActive" class="auto-loop-badge">Auto</span>
              </span>
            </div>
          </div>
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
  
  setup() {
    const videoStore = useVideoStore()
    const videoService = serviceManager.video
    
    return {
      videoStore,
      videoService
    }
  },
  
  data() {
    return {
      errorMessage: '',
      showAutoReloadMessage: false,
      loopsCompleted: 0,
      loopCount: 3, // Default to 3 loops
      enableAutoLoop: true, // Enable auto-loop by default
      autoLoopThreshold: 15, // Default to 15 seconds
      lastVideoLength: 0 // Track last video length for auto-loop
    }
  },

  computed: {
    // Reference store's training list directly (per-user data)
    trainingList() {
      return this.videoStore.niouTrainingList
    },
    
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
    },

    isAutoLoopActive() {
      return this.enableAutoLoop && this.lastVideoLength > 0 && this.lastVideoLength <= this.autoLoopThreshold
    },

    // Effective end time is either the user-set end time or the full video duration
    effectiveEndTime() {
      return this.endTime || this.videoDuration
    }
  },

  watch: {
    speed(newSpeed) {
      this.updateSpeed()
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
              
              // Update the training list in store (per-user data)
              this.videoStore.setNiouTrainingList(trainingStructure)
              
              this.videoStore.saveDirectoryInfo()
              
              this.errorMessage = ''
              this.showAutoReloadMessage = false
              
              console.log('Training list updated:', this.videoStore.niouTrainingList)
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
      // Close all other trainings first (directly in store data)
      const trainingList = this.videoStore.niouTrainingList
      trainingList.forEach((training, i) => {
        if (i !== index) {
          training.show = false
        }
      })
      // Toggle the selected training
      this.videoStore.toggleTrainingVisibility(index)
    },

    toggleItem(trainingIndex, itemIndex) {
      // Close all other items in this training (directly in store data)
      const trainingList = this.videoStore.niouTrainingList
      if (trainingList[trainingIndex]?.trainings) {
        trainingList[trainingIndex].trainings.forEach((item, i) => {
          if (i !== itemIndex) {
            item.show = false
          }
        })
      }
      this.videoStore.toggleItemVisibility(trainingIndex, itemIndex)
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
        this.lastVideoLength = duration
        
        // Reset loop counter
        this.loopsCompleted = 0
        
        // Set initial loop state based on video length
        if (this.enableAutoLoop && duration <= this.autoLoopThreshold) {
          this.loop = true // Enable looping for short videos
        }
      }
    },

    handleTimeUpdate() {
      const video = this.$refs.videoPlayer
      if (!video) return

      const currentTime = video.currentTime
      const shouldLoop = this.loop && (!this.loopCount || this.loopsCompleted < this.loopCount)
      const effectiveEnd = this.effectiveEndTime
      
      // Add a larger buffer (0.3 seconds) to catch the loop well before the video ends
      if (currentTime >= effectiveEnd - 0.3) {
        // Check if we're about to loop
        if (shouldLoop) {
          this.loopsCompleted++
          if (this.loopsCompleted >= this.loopCount) {
            // Stop at the end if we've reached loop count
            video.pause()
            video.currentTime = effectiveEnd
            return
          }
          
          // Prevent the native ended event by jumping back before it
          video.currentTime = this.startTime || 0
          // Ensure video keeps playing
          if (video.paused) {
            video.play().catch(e => console.error('Failed to resume playback:', e))
          }
          return
        }
      }
      
      // Handle normal time updates
      this.videoService.handleTimeUpdate(
        video, 
        currentTime, 
        this.startTime, 
        effectiveEnd,
        shouldLoop
      )
    },

    handleVideoEnded(event) {
      const video = this.$refs.videoPlayer
      if (!video) return

      // Prevent default ended behavior
      event.preventDefault()
      
      const shouldLoop = this.loop && (!this.loopCount || this.loopsCompleted < this.loopCount)
      if (shouldLoop) {
        // Reset to start and continue playing
        video.currentTime = this.startTime || 0
        this.loopsCompleted++
        
        // Only continue if we haven't reached the loop count
        if (this.loopsCompleted < this.loopCount) {
          video.play().catch(e => console.error('Failed to resume playback:', e))
        }
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
        this.loopsCompleted = 0 
        this.videoService.pauseVideo(video)
      }
    },

    stopVideo() {
      const video = this.$refs.videoPlayer
      if (video) {
        this.videoService.stopVideo(video, this.startTime)
        this.loopsCompleted = 0 // Reset loop counter when stopping
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
    // Load from storage (loads per-user data)
    this.videoStore.loadFromStorage()
    
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

/* Loop count styles */
.loop-settings-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 15px 0;
  padding: 15px;
  background: var(--bg-primary-light);
  border-radius: var(--border-radius);
}

.loop-count-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.loop-count-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.loop-count-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loop-count-input {
  width: 60px;
  padding: 5px;
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.loop-count-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
  min-width: 80px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Auto-loop styles */
.auto-loop-container {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-primary);
}

.auto-loop-threshold {
  margin-top: 10px;
  margin-left: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.threshold-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.threshold-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.threshold-input {
  width: 60px;
  padding: 5px;
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.threshold-unit {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.auto-loop-badge {
  font-size: 0.8rem;
  padding: 2px 6px;
  background: var(--bg-accent);
  color: var(--text-accent);
  border-radius: var(--border-radius);
  font-weight: 500;
}
</style>