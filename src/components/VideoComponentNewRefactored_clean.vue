<template>
  <div style="width:100%;height : 100%" data-video-component="new-refactored">
    <div class="two-columns">
      <div class="column-left">
        <div>
          <!-- Training List -->
           <div v-show="appStore.videoDisplayNew" class="video-training-tree">
              <h2>Video Training Library</h2>
              <div v-if="videoTreeList.length === 0" class="no-videos-message">
                <p>No video library loaded. Use "Select Training Directory" in the video component above.</p>
              </div>
              <div v-else class="training-tree">
                <div v-for="(training, index) in videoTreeList" :key="index" class="training-category">
                  <h3 @click="toggleTrainingCategory(index)" class="training-category-header" 
                      :class="{ expanded: training.show }">
                    📁 {{ training.trainingType }} ({{ getTotalVideosInTraining(training) }} videos)
                  </h3>
                  <div v-show="training.show" class="training-items">
                    <div v-for="(item, subIndex) in training.trainings" :key="subIndex" class="training-item">
                      <h4 @click="toggleTrainingItem(index, subIndex)" class="training-item-header"
                          :class="{ expanded: item.show }">
                        📂 {{ item.name }} ({{ item.videos ? item.videos.length : 0 }} videos)
                      </h4>
                      <ul v-show="item.show" class="video-list">
                        <li v-for="(video, videoIndex) in item.videos || []" :key="videoIndex"
                            @click="playVideoFromTree(video)" class="video-item">
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
              const directoryTree = {
                name: selectedPath.split('\\').pop() || selectedPath.split('/').pop() || 'Root',
                path: selectedPath,
                videos: videos,
                totalVideos: videos.length,
                lastScanned: new Date().toISOString()
              }
              
              // Convert videos to training structure
              const trainingStructure = convertVideosToTrainingStructure(videos)
              console.log('Training structure:', trainingStructure)
              
              // Store directory info and training list
              videoStore.setDirectoryInfo({
                name: directoryTree.name,
                path: directoryTree.path,
                totalTrainings: trainingStructure.length,
                totalVideos: directoryTree.totalVideos,
                lastScanned: directoryTree.lastScanned
              })
              
              console.log('Setting training list in store...')
              videoStore.setNiouTrainingList(trainingStructure)
              
              // Save to file for persistence
              if (window.electronAPI && window.electronAPI.saveDirectoryTree) {
                await window.electronAPI.saveDirectoryTree(directoryTree)
                console.log('Training list loaded:', {
                  directoryName: directoryTree.name,
                  totalTrainings: trainingStructure.length,
                  totalVideos: directoryTree.totalVideos,
                  storeList: videoStore.niouTrainingList
                })
              }
              
              hideAutoReloadMessage()
            } else {
              console.error('No videos found or scan failed:', scanResult)
              errorMessage.value = 'No videos found in the selected directory.'
            }
          }
        } else {
          console.error('Electron API not available')
          errorMessage.value = 'Directory selection not available (Electron required)'
        }
      } catch (error) {
        console.error('Error selecting directory:', error)
        errorMessage.value = 'Error selecting directory: ' + error.message
      }
    }

    const selectSingleVideo = async () => {
      try {
        if (window.electronAPI && window.electronAPI.selectFile) {
          const filePath = await window.electronAPI.selectFile(['mp4', 'avi', 'mov', 'mkv'])
          if (filePath) {
            await launchFile({ path: filePath, name: filePath.split(/[/\\]/).pop() })
          }
        } else {
          errorMessage.value = 'File selection not available (Electron required)'
        }
      } catch (error) {
        console.error('Error selecting file:', error)
        errorMessage.value = 'Error selecting file: ' + error.message
      }
    }

    const convertVideosToTrainingStructure = (videos) => {
      const trainingMap = new Map()
      
      videos.forEach(video => {
        const pathParts = video.relativePath.split(/[/\\]/)
        const trainingType = pathParts[0] || 'General'
        
        if (!trainingMap.has(trainingType)) {
          trainingMap.set(trainingType, {
            trainingType,
            show: false,
            trainings: new Map()
          })
        }
        
        const trainingGroup = trainingMap.get(trainingType)
        
        if (pathParts.length === 1) {
          // Direct file in training type folder
          const fileName = pathParts[0].replace(/\.(mp4|avi|mov|mkv)$/i, '')
          trainingGroup.trainings.set(fileName, {
            name: fileName,
            show: false,
            isDirectFile: true,
            path: video.fullPath,
            relativePath: video.relativePath
          })
        } else {
          // File in subfolder
          const subTraining = pathParts[1] || 'General'
          const subTrainingKey = pathParts.slice(1, -1).join('/')
          
          if (!trainingGroup.trainings.has(subTrainingKey)) {
            trainingGroup.trainings.set(subTrainingKey, {
              name: subTraining,
              show: false,
              isDirectFile: false,
              videos: []
            })
          }
          
          trainingGroup.trainings.get(subTrainingKey).videos.push({
            name: video.name,
            path: video.fullPath,
            relativePath: video.relativePath
          })
        }
      })
      
      // Convert maps to arrays
      const result = Array.from(trainingMap.values()).map(training => ({
        ...training,
        trainings: Array.from(training.trainings.values())
      }))
      
      console.log('Converted training structure:', result)
      return result
    }

    const reloadDirectory = async () => {
      try {
        if (window.electronAPI && window.electronAPI.loadDirectoryTree) {
          const savedTree = await window.electronAPI.loadDirectoryTree()
          
          if (savedTree && savedTree.path) {
            console.log('Reloading saved directory:', savedTree.path)
            
            // Request permission for the saved path
            if (window.electronAPI.selectDirectory) {
              const selectedPath = await window.electronAPI.selectDirectory(savedTree.path)
              
              if (selectedPath && selectedPath === savedTree.path) {
                const trainingStructure = convertVideosToTrainingStructure(savedTree.videos || [])
                
                videoStore.setDirectoryInfo({
                  name: savedTree.name,
                  path: savedTree.path,
                  totalTrainings: trainingStructure.length,
                  totalVideos: savedTree.totalVideos || 0,
                  lastScanned: savedTree.lastScanned
                })
                
                videoStore.setNiouTrainingList(trainingStructure)
                hideAutoReloadMessage()
              }
            }
          }
        }
      } catch (error) {
        console.error('Error reloading directory:', error)
        errorMessage.value = 'Error reloading directory: ' + error.message
      }
    }

    const launchFile = async (videoItem) => {
      try {
        console.log('Launching video:', videoItem)
        
        if (videoItem && videoItem.path) {
          const videoElement = videoPlayer.value
          if (videoElement) {
            videoElement.src = `file://${videoItem.path}`
            videoStore.setCurrentVideoName(videoItem.name || 'Unknown Video')
            
            // Load the video to get duration
            videoElement.addEventListener('loadedmetadata', () => {
              videoStore.setVideoLength(videoElement.duration)
              if (videoStore.endTime === 0) {
                videoStore.setEndTime(videoElement.duration)
              }
            }, { once: true })
            
            await videoElement.load()
          }
        }
      } catch (error) {
        console.error('Error launching video:', error)
        errorMessage.value = 'Error loading video: ' + error.message
      }
    }

    const toggleTraining = (index) => {
      trainingList.value.forEach((training, i) => {
        if (i === index) {
          training.show = !training.show
        } else {
          training.show = false
        }
      })
    }

    const toggleItem = (trainingIndex, itemIndex) => {
      if (trainingList.value[trainingIndex]?.trainings) {
        trainingList.value[trainingIndex].trainings.forEach((item, i) => {
          if (i === itemIndex) {
            item.show = !item.show
          } else {
            item.show = false
          }
        })
      }
    }

    const handleVideoLoaded = () => {
      const video = videoPlayer.value
      if (video) {
        videoStore.setVideoLength(video.duration)
        if (videoStore.endTime === 0) {
          videoStore.setEndTime(video.duration)
        }
      }
    }

    const handleTimeUpdate = () => {
      const video = videoPlayer.value
      if (video && videoStore.loop) {
        if (video.currentTime >= videoStore.endTime) {
          video.currentTime = videoStore.startTime
        }
        if (video.currentTime < videoStore.startTime) {
          video.currentTime = videoStore.startTime
        }
      }
    }

    const playVideo = () => {
      const video = videoPlayer.value
      if (video) {
        video.currentTime = videoStore.startTime
        video.play()
      }
    }

    const pauseVideo = () => {
      const video = videoPlayer.value
      if (video) {
        video.pause()
      }
    }

    const stopVideo = () => {
      const video = videoPlayer.value
      if (video) {
        video.pause()
        video.currentTime = videoStore.startTime
      }
    }

    const updateSpeed = () => {
      const video = videoPlayer.value
      if (video) {
        video.playbackRate = videoStore.speed / 100
      }
    }

    const updatePlaybackSettings = () => {
      updateSpeed()
    }

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }

    const clearDirectory = () => {
      videoStore.clearDirectoryInfo()
      videoStore.setNiouTrainingList([])
      
      if (window.electronAPI && window.electronAPI.clearDirectoryTree) {
        window.electronAPI.clearDirectoryTree()
      }
    }

    const hideAutoReloadMessage = () => {
      showAutoReloadMessage.value = false
    }

    // Lifecycle
    onMounted(async () => {
      // Check for saved directory on mount
      try {
        if (window.electronAPI && window.electronAPI.loadDirectoryTree) {
          const savedTree = await window.electronAPI.loadDirectoryTree()
          
          if (savedTree && savedTree.path && !videoStore.directoryInfo.name) {
            showAutoReloadMessage.value = true
          }
        }
      } catch (error) {
        console.error('Error checking for saved directory:', error)
      }
    })

    return {
      // Reactive references
      videoPlayer,
      errorMessage,
      showAutoReloadMessage,
      
      // Computed properties
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
      reloadDirectory,
      convertVideosToTrainingStructure
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

/* Video Training Tree Styles */
.video-training-tree {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin: var(--spacing-lg) 0;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px var(--shadow-medium);
  color: var(--text-primary);
}

.video-training-tree h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--border-accent);
  text-align: center;
}

.no-videos-message {
  text-align: center;
  padding: var(--spacing-xxl);
  color: var(--text-secondary);
  font-style: italic;
  background: rgba(52, 73, 94, 0.3);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-primary);
}

.training-tree {
  max-height: 500px;
  overflow-y: auto;
  padding-right: var(--spacing-sm);
}

.training-category {
  margin-bottom: var(--spacing-lg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: rgba(44, 62, 80, 0.8);
  box-shadow: 0 4px 12px var(--shadow-light);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-primary);
}

.training-category:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.training-category-header {
  background: var(--btn-primary);
  color: var(--text-primary);
  padding: var(--spacing-lg);
  margin: 0;
  cursor: pointer;
  user-select: none;
  font-weight: var(--font-semibold);
  font-size: 1.1rem;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.training-category-header:hover {
  background: var(--btn-primary-hover);
}

.training-category-header.expanded {
  background: var(--secondary-blue-dark);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.training-category-header::after {
  content: '▼';
  transition: transform var(--transition-normal);
  font-size: 0.8rem;
}

.training-category-header.expanded::after {
  transform: rotate(180deg);
}

.training-items {
  background: rgba(52, 73, 94, 0.4);
  padding: 0;
}

.training-item {
  border-top: 1px solid var(--border-primary);
}

.training-item-header {
  background: rgba(58, 79, 99, 0.8);
  color: var(--text-primary);
  padding: var(--spacing-md) var(--spacing-lg);
  margin: 0;
  cursor: pointer;
  user-select: none;
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.training-item-header:hover {
  background: var(--bg-hover);
  color: var(--secondary-blue);
}

.training-item-header::after {
  content: '▶';
  transition: transform var(--transition-normal);
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.training-item-header.expanded::after {
  transform: rotate(90deg);
  color: var(--accent-green);
}

.video-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: rgba(44, 62, 80, 0.6);
}

.video-item {
  padding: var(--spacing-md) var(--spacing-xl);
  border-bottom: 1px solid rgba(52, 73, 94, 0.5);
  cursor: pointer;
  transition: all var(--transition-normal);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.video-item:hover {
  background: var(--secondary-blue);
  color: var(--text-primary);
  padding-left: calc(var(--spacing-xl) + var(--spacing-sm));
  box-shadow: inset 4px 0 0 var(--accent-green);
}

.video-item:last-child {
  border-bottom: none;
}

/* Custom Scrollbar */
.training-tree::-webkit-scrollbar {
  width: 8px;
}

.training-tree::-webkit-scrollbar-track {
  background: var(--primary-dark);
  border-radius: var(--radius-sm);
}

.training-tree::-webkit-scrollbar-thumb {
  background: var(--primary-medium);
  border-radius: var(--radius-sm);
  transition: background var(--transition-normal);
}

.training-tree::-webkit-scrollbar-thumb:hover {
  background: var(--primary-accent);
}

/* Component containers styling */
.guitar-training-container > * {
  transition: opacity var(--transition-normal);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .row {
    flex-direction: column;
  }
  
  .columnd {
    min-width: auto;
    width: 100%;
    float: none;
  }
  
  .column {
    width: 100%;
    float: none;
  }
  
  .columnhalf {
    width: 100%;
    float: none;
  }
}

@media (max-width: 768px) {
  .guitar-training-container {
    padding: var(--spacing-md);
  }
  
  .video-training-tree {
    padding: var(--spacing-lg);
  }
  
  .columnhalf {
    margin-bottom: var(--spacing-lg);
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
  animation: fadeInUp var(--transition-slow) ease-out;
}
</style>
