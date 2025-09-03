<template>
  <div style="width:100%;height : 100%" data-video-component="new-refactored">
    <div class="two-columns">
      <div class="column-left">
        <div>
          <!-- Training List -->
          <div v-for="(training, index) in trainingList" :key="index">
            <h2 @click="toggleTraining(index)" class="trainingType">{{ training.trainingType }}</h2>
            <div v-show="training.show">
              <div v-for="(item, subIndex) in training.trainings" :key="subIndex">
                <h3 @click="toggleItem(index, subIndex)" class="training">{{ item.name }}</h3>
                <ul v-show="item.show">
                  <li v-if="item.isDirectFile" @click="launchFile(item)" class="video">
                    {{ item.name }}
                  </li>
                  <li v-else v-for="(video, videoIndex) in item.videos || []" :key="videoIndex"
                    @click="launchFile(video)" class="video">
                    {{ video.name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Directory Selection -->
          <div class="directory-controls">
            <input v-model="defaultPath" type="text" placeholder="Enter base path" />
            <button @click="selectTrainingDirectory">Select Training Directory</button>
            <button @click="selectSingleVideo">Select Single Video</button>
            
            <!-- Auto-reload status -->
            <div v-if="showAutoReloadMessage" class="auto-reload-message">
              <p>📁 Found previous directory: <strong>{{ directoryInfo.name }}</strong></p>
              <p>To access your videos again, we need directory permission.</p>
              <button @click="reloadDirectory" class="reload-btn">📂 Reload Directory</button>
              <button @click="hideAutoReloadMessage" class="dismiss-btn">Dismiss</button>
            </div>
            
            <!-- Directory Info Display -->
            <div v-if="directoryInfo.name" class="directory-info">
              <h4>Current Directory: {{ directoryInfo.name }}</h4>
              <p><strong>Path:</strong> {{ directoryInfo.path || 'Root' }}</p>
              <p><strong>Total Trainings:</strong> {{ directoryInfo.totalTrainings }}</p>
              <p><strong>Total Videos:</strong> {{ directoryInfo.totalVideos }}</p>
              <p v-if="directoryInfo.lastScanned">
                <strong>Last Scanned:</strong> {{ formatDate(directoryInfo.lastScanned) }}
              </p>
              <button @click="clearDirectory" class="clear-btn">Clear Directory</button>
            </div>
          </div>
        </div>
      </div>

      <div class="column-right">
        <h1>{{ currentVideoName }}</h1>

        <!-- Video Player -->
        <video 
          style="width:100%;height : 100%" 
          @timeupdate="handleTimeUpdate" 
          @loadedmetadata="handleVideoLoaded"
          ref="videoPlayer" 
          controls>
        </video>
        
        <!-- Video Controls -->
        <div>
          <button class="button" @click="playVideo">Play</button>
          <button class="button" @click="pauseVideo">Pause</button>
          <button class="button" @click="stopVideo">Stop</button>
        </div>

        <!-- Time Controls -->
        <div class="slider-parent">
          <div class="slider-container">
            <label for="startSlider" class="slider-label">Video Start</label>
            <input 
              id="startSlider" 
              type="range" 
              v-model="startTime" 
              :max="endTime" 
              min="0" 
              step="1"
              @change="updatePlaybackSettings">
            <p class="slider-value">{{ formatTime(startTime) }}</p>
          </div>

          <div class="slider-container">
            <label for="endSlider" class="slider-label">Video End</label>
            <input 
              id="endSlider" 
              type="range" 
              v-model="endTime" 
              :min="startTime" 
              :max="videoDuration" 
              step="1"
              @change="updatePlaybackSettings">
            <p class="slider-value">{{ formatTime(endTime) }}</p>
          </div>
        </div>

        <!-- Loop Control -->
        <div class="loop-checkbox">
          <label for="loopCheckbox" class="checkbox-label">Loop:</label>
          <input 
            id="loopCheckbox" 
            type="checkbox" 
            v-model="loop"
            @change="updatePlaybackSettings">
        </div>

        <!-- Speed Control -->
        <div style="text-align: center;">
          <h3 style="display: block;float: top">Playing rate</h3>
          <div class="slider" style="margin : auto">
            <input 
              type="range" 
              min="10" 
              max="300" 
              v-model="speed"
              @input="updateSpeed">
            <p id="rangeValueVideo">{{ speed }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useVideoStore } from '@/stores/videoStore'
import { serviceManager } from '@/services'

export default {
  name: 'VideoComponentNewRefactored',
  setup() {
    // Store and Services
    const videoStore = useVideoStore()
    const videoService = serviceManager.video
    const fileService = serviceManager.file

    // Reactive references
    const videoPlayer = ref(null)
    const errorMessage = ref('')
    const showAutoReloadMessage = ref(false)

    // Computed properties from store
    const trainingList = computed(() => videoStore.niouTrainingList)
    const currentVideoName = computed(() => videoStore.currentVideoName)
    const defaultPath = computed({
      get: () => videoStore.defaultPath,
      set: (value) => videoStore.defaultPath = value
    })

    // Video playback computed properties
    const startTime = computed({
      get: () => videoStore.startTime,
      set: (value) => videoStore.startTime = Number(value)
    })

    const endTime = computed({
      get: () => videoStore.endTime,
      set: (value) => videoStore.endTime = Number(value)
    })

    const speed = computed({
      get: () => videoStore.speed,
      set: (value) => videoStore.speed = Number(value)
    })

    const loop = computed({
      get: () => videoStore.loop,
      set: (value) => videoStore.loop = value
    })

    const videoDuration = computed(() => videoStore.videoLength)
    const directoryInfo = computed(() => videoStore.directoryInfo)

    // Methods
    const selectTrainingDirectory = async () => {
      try {
        const directoryHandle = await fileService.selectDirectory()
        
        // Try to get the actual directory path (Electron specific)
        let actualDirectoryPath = defaultPath.value
        if (window.electronAPI && window.electronAPI.getDirectoryPath) {
          try {
            actualDirectoryPath = await window.electronAPI.getDirectoryPath(directoryHandle)
          } catch (error) {
            console.warn('Could not get actual directory path, using default:', error)
          }
        }
        
        const result = await fileService.readDirectoryRecursive(directoryHandle, actualDirectoryPath)
        
        // Use the enhanced store method with metadata
        videoStore.setTrainingListWithMetadata(
          result.trainings, 
          directoryHandle, 
          actualDirectoryPath
        )
        
        console.log('Training list loaded:', {
          trainings: result.trainings.length,
          totalVideos: result.metadata.totalVideos,
          path: actualDirectoryPath
        })
        
        errorMessage.value = ''
        showAutoReloadMessage.value = false // Hide the auto-reload message
      } catch (error) {
        console.error('Failed to select training directory:', error)
        errorMessage.value = `Failed to load training directory: ${error.message}`
      }
    }

    const selectSingleVideo = async () => {
      try {
        // Use ICP binding for native video file selection
        if (window.electronAPI && window.electronAPI.selectVideoFile) {
          const filePath = await window.electronAPI.selectVideoFile()
          if (filePath) {
            // For Electron-selected files, create a video object with path
            const videoData = {
              name: videoService.extractFilename(filePath),
              url: filePath,
              isNative: true
            }
            await launchFile(videoData)
          }
        } else {
          throw new Error('Electron API not available')
        }
        errorMessage.value = ''
      } catch (error) {
        console.error('Failed to select video file:', error)
        errorMessage.value = `Failed to select video: ${error.message}`
      }
    }

    const toggleTraining = (index) => {
      // Hide all other trainings
      trainingList.value.forEach((training, i) => {
        if (i !== index) {
          training.show = false
        }
      })
      
      videoStore.toggleTrainingVisibility(index)
    }

    const toggleItem = (trainingIndex, itemIndex) => {
      // Hide all other items in the same training
      if (trainingList.value[trainingIndex]?.trainings) {
        trainingList.value[trainingIndex].trainings.forEach((item, i) => {
          if (i !== itemIndex) {
            item.show = false
          }
        })
      }
      
      videoStore.toggleItemVisibility(trainingIndex, itemIndex)
    }

    const launchFile = async (videoData) => {
      try {
        console.log('launchFile called with:', videoData)
        console.log('videoData type:', typeof videoData)
        console.log('videoData has fileHandleId:', !!videoData?.fileHandleId)
        
        const videoElement = videoPlayer.value
        if (!videoElement) {
          throw new Error('Video player not found')
        }
        
        // Check if videoData has a fileHandleId (from File System Access API)
        if (videoData && videoData.fileHandleId) {
          try {
            // Try to use FileHandle ID to create blob URL
            const blobUrl = await videoService.setVideoSourceFromHandleId(videoElement, videoData.fileHandleId)
            
            // Update store with current video info
            videoStore.currentVideoName = videoData.name
            videoStore.speed = 100
            
            console.log('Loading video from FileHandle:', videoData.name)
            errorMessage.value = ''
            return // Success with FileHandle
          } catch (fileHandleError) {
            console.warn('FileHandle failed, trying fallback methods:', fileHandleError.message)
            // Continue to try other methods below
          }
        }
        
        // Fallback: Try path-based loading with multiple strategies
        let filePath
        let pathStrategies = []
        
        // Strategy 1: Direct paths
        if (typeof videoData === 'string') {
          pathStrategies.push(videoData)
        } else if (videoData && videoData.url) {
          pathStrategies.push(videoData.url)
        }
        
        // Strategy 2: Electron absolute path construction
        if (videoData && videoData.path && videoStore.rootDirectoryPath) {
          const separator = videoStore.rootDirectoryPath.includes('\\') ? '\\' : '/'
          const absolutePath = `${videoStore.rootDirectoryPath.replace(/[\\\/]+$/, '')}${separator}${videoData.path.replace(/\//g, separator)}`
          pathStrategies.push(absolutePath)
        }
        
        // Strategy 3: Try using the defaultPath as base
        if (videoData && videoData.path && defaultPath.value) {
          const separator = defaultPath.value.includes('\\') ? '\\' : '/'
          const fallbackPath = `${defaultPath.value.replace(/[\\\/]+$/, '')}${separator}${videoData.path.replace(/\//g, separator)}`
          pathStrategies.push(fallbackPath)
        }
        
        // Strategy 4: Construct from name and parent
        if (videoData && videoData.name) {
          const relativePath = videoData.parentName ? `${videoData.parentName}/${videoData.name}` : videoData.name
          
          if (videoStore.rootDirectoryPath) {
            const separator = videoStore.rootDirectoryPath.includes('\\') ? '\\' : '/'
            pathStrategies.push(`${videoStore.rootDirectoryPath.replace(/[\\\/]+$/, '')}${separator}${relativePath.replace(/\//g, separator)}`)
          }
          
          if (defaultPath.value) {
            const separator = defaultPath.value.includes('\\') ? '\\' : '/'
            pathStrategies.push(`${defaultPath.value.replace(/[\\\/]+$/, '')}${separator}${relativePath.replace(/\//g, separator)}`)
          }
        }
        
        if (pathStrategies.length === 0) {
          throw new Error('No valid file path strategies available')
        }
        
        // Try each path strategy
        console.log('Trying path strategies:', pathStrategies)
        
        for (const tryPath of pathStrategies) {
          try {
            filePath = tryPath
            console.log('Attempting to load video from path:', filePath)
            
            videoService.setVideoSource(videoElement, filePath)
            
            // Update store with current video info
            videoStore.currentVideoName = videoData.name || videoService.extractFilename(filePath)
            videoStore.speed = 100
            
            console.log('Successfully loaded video from path:', filePath)
            errorMessage.value = ''
            return // Success - exit the function
          } catch (pathError) {
            console.warn(`Failed to load video from path ${filePath}:`, pathError.message)
            // Continue to next strategy
          }
        }
        
        // If we get here, all path strategies failed
        throw new Error(`Failed to load video using any of ${pathStrategies.length} path strategies`)
      } catch (error) {
        console.error('Failed to launch video:', error)
        
        // Check if this is a FileHandle error
        if (error.message && error.message.includes('FileHandle not found')) {
          // Clear invalid video data and show helpful message
          console.log('FileHandle error detected, showing reload option')
          showAutoReloadMessage.value = true
          errorMessage.value = 'Video files need to be reloaded. Please click "📂 Reload Directory" to refresh the video list.'
        } else {
          errorMessage.value = `Failed to load video: ${error.message}`
        }
      }
    }

    const handleVideoLoaded = () => {
      const video = videoPlayer.value
      if (video) {
        const duration = video.duration
        videoStore.setVideoLength(duration)
        console.log('Video loaded, duration:', duration)
      }
    }

    const handleTimeUpdate = () => {
      const video = videoPlayer.value
      if (video) {
        const currentTime = video.currentTime
        videoService.handleTimeUpdate(
          video, 
          currentTime, 
          startTime.value, 
          endTime.value, 
          loop.value
        )
      }
    }

    const playVideo = async () => {
      try {
        const video = videoPlayer.value
        if (video) {
          const playbackRate = speed.value / 100
          await videoService.playVideo(video, playbackRate)
        }
      } catch (error) {
        console.error('Failed to play video:', error)
        errorMessage.value = `Playback failed: ${error.message}`
      }
    }

    const pauseVideo = () => {
      const video = videoPlayer.value
      if (video) {
        videoService.pauseVideo(video)
      }
    }

    const stopVideo = () => {
      const video = videoPlayer.value
      if (video) {
        videoService.stopVideo(video, startTime.value)
      }
    }

    const updateSpeed = () => {
      const video = videoPlayer.value
      if (video) {
        videoService.setPlaybackRate(video, speed.value)
      }
    }

    const updatePlaybackSettings = () => {
      videoStore.setVideoPlaybackSettings({
        startTime: startTime.value,
        endTime: endTime.value,
        speed: speed.value,
        loop: loop.value
      })
    }

    const formatTime = (seconds) => {
      return videoService.formatTime(seconds)
    }

    const formatDate = (isoString) => {
      if (!isoString) return 'Never'
      return new Date(isoString).toLocaleString()
    }

    const clearDirectory = () => {
      videoStore.clearDirectory()
      showAutoReloadMessage.value = false
      console.log('Directory cleared')
    }

    const hideAutoReloadMessage = () => {
      showAutoReloadMessage.value = false
    }

    const reloadDirectory = async () => {
      try {
        showAutoReloadMessage.value = false
        
        const reloaded = await videoStore.autoReloadDirectory(fileService)
        if (reloaded) {
          console.log('Successfully reloaded directory')
          errorMessage.value = ''
        } else {
          errorMessage.value = 'Failed to reload directory. Please try "Select Training Directory".'
        }
      } catch (error) {
        console.error('Failed to reload directory:', error)
        errorMessage.value = `Failed to reload directory: ${error.message}`
      }
    }

    // Watchers
    watch(speed, (newSpeed) => {
      updateSpeed()
    })

    // Lifecycle
    onMounted(async () => {
      // Load saved data from storage first
      videoStore.loadFromStorage()
      
      // Check if we need to refresh FileHandles
      const handlesValid = videoStore.validateFileHandles(fileService)
      if (!handlesValid) {
        console.log('FileHandles need refreshing')
      }
      
      // Check if we have stored directory info but no current videos
      if (videoStore.directoryStructure.name && videoStore.niouTrainingList.length === 0) {
        showAutoReloadMessage.value = true
        console.log('Showing auto-reload message for stored directory:', videoStore.directoryStructure.name)
        console.log('Stored root directory path:', videoStore.rootDirectoryPath)
        
        // Automatically attempt to reload directory
        console.log('Attempting automatic directory reload...')
        try {
          const reloaded = await videoStore.autoReloadDirectory(fileService)
          if (reloaded) {
            console.log('Successfully auto-reloaded directory')
            showAutoReloadMessage.value = false
          } else {
            console.log('Auto-reload failed, showing manual reload option')
          }
        } catch (error) {
          console.log('Auto-reload failed with error:', error.message)
          // Keep the auto-reload message visible for manual retry
        }
      }
      
      // Listen for video launch events from TrainingComponent
      const handleLaunchVideo = (event) => {
        const videoData = event.detail
        if (videoData) {
          console.log('Received video launch event:', videoData)
          launchFile(videoData)
        }
      }
      
      document.addEventListener('launch-video', handleLaunchVideo)
      
      // Cleanup listener on unmount
      onUnmounted(() => {
        document.removeEventListener('launch-video', handleLaunchVideo)
      })
      
      console.log('VideoComponentNewRefactored mounted')
    })

    return {
      // Refs
      videoPlayer,
      errorMessage,
      showAutoReloadMessage,
      
      // Computed
      trainingList,
      currentVideoName,
      defaultPath,
      startTime,
      endTime,
      speed,
      loop,
      videoDuration,
      directoryInfo,
      
      // Methods
      selectTrainingDirectory,
      selectSingleVideo,
      toggleTraining,
      toggleItem,
      launchFile,
      handleVideoLoaded,
      handleTimeUpdate,
      playVideo,
      pauseVideo,
      stopVideo,
      updateSpeed,
      updatePlaybackSettings,
      formatTime,
      formatDate,
      clearDirectory,
      hideAutoReloadMessage,
      reloadDirectory
    }
  }
}
</script>

<style scoped>
.trainingType {
  background-color: #f2f2f2;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 5px;
}

.trainingType:hover {
  background-color: #e0e0e0;
}

.training {
  background-color: #2268ff;
  color: white;
  padding: 10px;
  border-radius: 5px;
  width: 80%;
  cursor: pointer;
  margin-bottom: 5px;
}

.training:hover {
  background-color: #1a52cc;
}

.video {
  background-color: #f2f2f2;
  padding: 10px;
  margin-top: -10px;
  border-radius: 5px;
  width: 70%;
  cursor: pointer;
  margin-bottom: 2px;
  list-style: none;
}

.video:hover {
  background-color: #d9d9d9;
}

.two-columns {
  display: flex;
  flex-direction: row;
  height: 100vh;
}

.column-left {
  flex: 40%;
  padding: 20px;
  background-color: #33658A;
  overflow-y: auto;
}

.column-right {
  flex: 60%;
  padding: 20px;
  background-color: #F6AE2D;
  height: fit-content;
  min-height: 100vh;
}

.directory-controls {
  margin: 20px 0;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.auto-reload-message {
  margin: 15px 0;
  padding: 12px;
  background-color: rgba(34, 104, 255, 0.2);
  border: 1px solid rgba(34, 104, 255, 0.4);
  border-radius: 6px;
  color: #ffffff;
}

.auto-reload-message p {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.reload-btn {
  background-color: #2268ff;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.reload-btn:hover {
  background-color: #1a52cc;
}

.dismiss-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
}

.dismiss-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.directory-info {
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.directory-info h4 {
  margin: 0 0 10px 0;
  color: #ffffff;
  font-size: 16px;
}

.directory-info p {
  margin: 5px 0;
  color: #ffffff;
  font-size: 14px;
}

.clear-btn {
  background-color: #ff4444;
  color: white;
  padding: 5px 10px;
  font-size: 12px;
  margin-top: 10px;
}

.clear-btn:hover {
  background-color: #cc3333;
}

.slider-parent {
  margin: 20px 0;
}

.slider-container {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider-label {
  min-width: 100px;
  font-weight: bold;
}

.slider-value {
  min-width: 80px;
  margin: 0;
  font-family: monospace;
}

.loop-checkbox {
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-label {
  font-weight: bold;
}

input[type="text"] {
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  margin-right: 10px;
  width: 60%;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
  font-size: 14px;
}

button:hover {
  background-color: #3e8e41;
}

.button {
  margin-right: 10px;
}

input[type="range"] {
  flex: 1;
  margin: 0 10px;
}

input[type="checkbox"] {
  transform: scale(1.2);
}

ul {
  padding-left: 20px;
}

.slider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
}

.slider input[type="range"] {
  width: 200px;
}

.slider p {
  margin: 0;
  font-weight: bold;
  min-width: 50px;
  text-align: center;
}

/* Error message styling */
.error-message {
  color: red;
  background-color: #ffe6e6;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  border: 1px solid #ffcccc;
}
</style>
