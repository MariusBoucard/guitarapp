<template>
  <div style="width:100%;" data-video-component="new-refactored">
    <div class="two-columns">
      <div class="column-left">
        <div>
          <!-- Training List -->
          <div class="video-training-tree">
            <h2>Video Training Library</h2>
            <div v-if="trainingList.length === 0" class="no-videos-message">
              <p>No video library loaded. Use "Select Training Directory" below to load your video collection.</p>
            </div>
            <div v-else class="training-tree">
              <div v-for="(training, index) in trainingList" :key="index" class="training-category">
                <h3 @click="toggleTraining(index)" class="training-category-header" 
                    :class="{ expanded: training.show }">
                  📁 {{ training.trainingType }} ({{ getTotalVideosInTraining(training) }} videos)
                </h3>
                <div v-show="training.show" class="training-items">
                  <div v-for="(item, subIndex) in training.trainings" :key="subIndex" class="training-item">
                    <h4 @click="toggleItem(index, subIndex)" class="training-item-header"
                        :class="{ expanded: item.show }">
                      📂 {{ item.name }} ({{ item.videos ? item.videos.length : (item.isDirectFile ? 1 : 0) }} videos)
                    </h4>
                    <ul v-show="item.show" class="video-list">
                      <li v-if="item.isDirectFile" @click="launchFile(item)" class="video-item">
                        🎥 {{ item.name }}
                      </li>
                      <li v-else v-for="(video, videoIndex) in item.videos || []" :key="videoIndex"
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
        console.log('selectTrainingDirectory called')
        
        // Use Electron's native directory selection
        if (window.electronAPI && window.electronAPI.selectDirectory) {
          const selectedPath = await window.electronAPI.selectDirectory()
          console.log('Selected directory path:', selectedPath)
          
          if (selectedPath) {
            console.log('Scanning directory:', selectedPath)
            
            // Scan directory using Electron IPC
            const scanResult = await window.electronAPI.scanVideoDirectory(selectedPath)
            console.log('Scan result:', scanResult)
            
            if (scanResult.success && scanResult.videos.length > 0) {
              const videos = scanResult.videos
              console.log('Found videos:', videos.length)
              
              // Save directory tree to file for persistent storage
              const saveResult = await window.electronAPI.saveDirectoryTree(selectedPath, videos)
              if (saveResult.success) {
                console.log('Directory tree saved to:', saveResult.filePath)
              } else {
                console.warn('Failed to save directory tree:', saveResult.error)
              }
              
              // Convert to training structure
              const trainingStructure = convertVideosToTrainingStructure(videos, selectedPath)
              console.log('Training structure created:', trainingStructure)
              
              // Update store
              videoStore.rootDirectoryPath = selectedPath
              videoStore.directoryStructure.name = selectedPath.split(/[\\\/]/).pop()
              videoStore.directoryStructure.path = selectedPath
              videoStore.directoryStructure.lastScanned = new Date().toISOString()
              
              console.log('Setting training list in store...')
              videoStore.setNiouTrainingList(trainingStructure)
              
              // Save directory info to localStorage
              videoStore.saveDirectoryInfo()
              
              console.log('Training list loaded:', {
                trainings: trainingStructure.length,
                totalVideos: videos.length,
                path: selectedPath,
                storeList: videoStore.niouTrainingList
              })
              
              errorMessage.value = ''
              showAutoReloadMessage.value = false
            } else {
              console.error('No videos found or scan failed:', scanResult)
              errorMessage.value = scanResult.error || 'No video files found in selected directory'
            }
          } else {
            console.log('No directory selected')
          }
        } else {
          console.error('Electron API not available')
          errorMessage.value = 'Directory selection not available (Electron required)'
        }
      } catch (error) {
        console.error('Failed to select training directory:', error)
        errorMessage.value = `Failed to load training directory: ${error.message}`
      }
    }

    // Convert flat video list to hierarchical training structure
    const convertVideosToTrainingStructure = (videos, basePath) => {
      const trainingMap = new Map()
      
      videos.forEach(video => {
        // Extract training type from path (assume structure: basePath/trainingType/trainingName/video.mp4)
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
            absolutePath: video.path, // Store the full absolute path
            path: relativePath // Store relative path for display
          })
        }
      })
      
      // Convert maps to arrays
      return Array.from(trainingMap.values()).map(training => ({
        ...training,
        trainings: Array.from(training.trainings.values())
      }))
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

    const getTotalVideosInTraining = (training) => {
      if (!training.trainings) return 0
      return training.trainings.reduce((total, item) => {
        if (item.isDirectFile) {
          return total + 1
        }
        return total + (item.videos ? item.videos.length : 0)
      }, 0)
    }

    const launchFile = async (videoData) => {
      try {
        console.log('launchFile called with:', videoData)
        
        const videoElement = videoPlayer.value
        if (!videoElement) {
          throw new Error('Video player not found')
        }
        
        // Simple path resolution - use absolutePath if available, otherwise construct it
        let filePath = null
        
        if (videoData.absolutePath) {
          // Use stored absolute path (preferred method)
          filePath = videoData.absolutePath
        } else if (typeof videoData === 'string') {
          // Direct string path
          filePath = videoData
        } else if (videoData.url) {
          // URL property
          filePath = videoData.url
        } else if (videoData.path && videoStore.rootDirectoryPath) {
          // Construct from root + relative path
          filePath = `${videoStore.rootDirectoryPath}/${videoData.path}`.replace(/[\\\/]+/g, '/')
        } else {
          throw new Error('No valid file path available')
        }
        
        console.log('Loading video from path:', filePath)
        
        // Set video source using async IPC method
        await videoService.setVideoSource(videoElement, filePath)
        
        // Update store
        videoStore.currentVideoName = videoData.name || 'Unknown Video'
        videoStore.speed = 100
        
        errorMessage.value = ''
        console.log('Video loaded successfully')
        
      } catch (error) {
        console.error('Failed to launch video:', error)
        errorMessage.value = `Failed to load video: ${error.message}`
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
        
        // If we have a stored directory path, try to rescan it
        if (videoStore.rootDirectoryPath && window.electronAPI && window.electronAPI.scanVideoDirectory) {
          console.log('Rescanning stored directory:', videoStore.rootDirectoryPath)
          
          const videos = await window.electronAPI.scanVideoDirectory(videoStore.rootDirectoryPath)
          if (videos && videos.length > 0) {
            const trainingStructure = convertVideosToTrainingStructure(videos, videoStore.rootDirectoryPath)
            
            videoStore.setTrainingListWithMetadata(
              trainingStructure,
              null,
              videoStore.rootDirectoryPath
            )
            
            console.log('Successfully reloaded directory')
            errorMessage.value = ''
            return
          }
        }
        
        // If direct rescan failed, prompt user to select directory again
        errorMessage.value = 'Could not reload directory automatically. Please select the directory again.'
        
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
      // Load saved data from storage
      videoStore.loadFromStorage()
      
      // Try to load saved directory tree from file (Electron only)
      if (window.electronAPI && window.electronAPI.loadDirectoryTree) {
        try {
          console.log('Attempting to load saved directory tree...')
          const result = await window.electronAPI.loadDirectoryTree()
          
          if (result.success) {
            console.log('Found saved directory tree:', result.data.directoryPath)
            
            // Set the root directory path
            videoStore.rootDirectoryPath = result.data.directoryPath
            videoStore.directoryStructure.name = result.data.directoryPath.split(/[\\\/]/).pop()
            videoStore.directoryStructure.path = result.data.directoryPath
            videoStore.directoryStructure.lastScanned = result.data.lastScanned
            
            // Convert the saved tree to training structure
            const trainingStructure = convertVideosToTrainingStructure(
              result.data.tree, 
              result.data.directoryPath
            )
            
            videoStore.setNiouTrainingList(trainingStructure)
            
            console.log('Successfully loaded directory tree from file:', {
              trainings: trainingStructure.length,
              directory: result.data.directoryPath,
              lastScanned: result.data.lastScanned
            })
          } else {
            console.log('No saved directory tree found:', result.error)
          }
        } catch (error) {
          console.error('Failed to load saved directory tree:', error)
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
      getTotalVideosInTraining,
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
      reloadDirectory,
      convertVideosToTrainingStructure
    }
  }
}
</script>

<style scoped>
/* Main Container */
.video-component-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

/* Layout */
.two-columns {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 25px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

/* Left Column - Training List */
.column-left {
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

.column-left::-webkit-scrollbar {
  width: 6px;
}

.column-left::-webkit-scrollbar-track {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
}

.column-left::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

/* Video Training Tree Styles */
.video-training-tree {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.video-training-tree h2 {
  margin: 0 0 20px 0;
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

.no-videos-message {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
  font-style: italic;
  background: rgba(149, 165, 166, 0.1);
  border-radius: 12px;
  border: 2px dashed rgba(149, 165, 166, 0.3);
}

.training-tree {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.training-tree::-webkit-scrollbar {
  width: 6px;
}

.training-tree::-webkit-scrollbar-track {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
}

.training-tree::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.training-category {
  margin-bottom: 15px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: 2px solid rgba(102, 126, 234, 0.2);
}

.training-category:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.training-category-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  margin: 0;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.training-category-header:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.training-category-header.expanded {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border-radius: 10px 10px 0 0;
}

.training-category-header::after {
  content: '▼';
  transition: transform 0.2s ease;
  font-size: 0.8rem;
}

.training-category-header.expanded::after {
  transform: rotate(180deg);
}

.training-items {
  background: rgba(52, 73, 94, 0.05);
  padding: 0;
}

.training-item {
  border-top: 1px solid rgba(102, 126, 234, 0.2);
}

.training-item-header {
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  padding: 12px 20px;
  margin: 0;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid transparent;
}

.training-item-header:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.training-item-header.expanded {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
}

.training-item-header::after {
  content: '▶';
  transition: transform 0.2s ease;
  font-size: 0.7rem;
  color: #7f8c8d;
}

.training-item-header.expanded::after {
  transform: rotate(90deg);
  color: white;
}

.video-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: rgba(255, 255, 255, 0.3);
}

.video-item {
  padding: 12px 25px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.video-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding-left: 35px;
  box-shadow: inset 4px 0 0 #4CAF50;
}

.video-item:last-child {
  border-bottom: none;
}

/* Right Column - Video Player */
.column-right {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: calc(100vh - 40px);
}

.column-right h1 {
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

/* Video Player */
video {
  width: 100%;
  height: 400px;
  background: #000;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Allow fullscreen functionality */
video:fullscreen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

video:-webkit-full-screen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

video:-moz-full-screen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

/* Controls */
.playback-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
}

.button {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  min-width: 100px;
}

.button:nth-child(1) {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.button:nth-child(2) {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.button:nth-child(3) {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Directory Controls */
.directory-controls {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.directory-controls input[type="text"] {
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

.directory-controls input[type="text"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.2);
}

.directory-controls button {
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
  margin: 5px 0;
}

.directory-controls button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Auto-reload Message */
.auto-reload-message {
  margin: 15px 0;
  padding: 15px;
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  color: #2c3e50;
}

.auto-reload-message p {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.reload-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  padding: 8px 16px;
  font-size: 0.85rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-right: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.reload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.dismiss-btn {
  background: rgba(149, 165, 166, 0.2);
  color: #2c3e50;
  padding: 6px 12px;
  font-size: 0.8rem;
  border: 1px solid rgba(149, 165, 166, 0.3);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dismiss-btn:hover {
  background: rgba(149, 165, 166, 0.3);
}

/* Directory Info */
.directory-info {
  margin-top: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.directory-info h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.directory-info p {
  margin: 5px 0;
  color: #2c3e50;
  font-size: 0.9rem;
}

.clear-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  padding: 8px 16px;
  font-size: 0.85rem;
  margin-top: 10px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.clear-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

/* Slider Controls */
.slider-parent {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.slider-container {
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.slider-label {
  min-width: 120px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.slider-value {
  min-width: 80px;
  margin: 0;
  font-family: monospace;
  font-weight: 600;
  color: #667eea;
  text-align: center;
  background: rgba(102, 126, 234, 0.1);
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
}

input[type="range"] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #ecf0f1;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Loop Control */
.loop-checkbox {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 15px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkbox-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
  cursor: pointer;
}

/* Speed Control */
.slider {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin: 15px 0;
}

.slider h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-weight: 600;
  text-align: center;
  font-size: 1.1rem;
}

.slider input[type="range"] {
  width: 200px;
}

.slider p {
  margin: 0;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 8px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .two-columns {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .column-left {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .two-columns {
    padding: 10px;
  }
  
  .column-left,
  .column-right {
    padding: 15px;
  }
  
  .slider-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .slider-label {
    min-width: auto;
    text-align: center;
  }
}

/* Add subtle animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.video-training-tree {
  animation: fadeInUp 0.3s ease-out;
}
</style>
