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
              <div v-for="(training, index) in trainingList" :key="index" class="training-category">
                <h3 @click="toggleTraining(index)" 
                    class="training-category-header" 
                    :class="{ 'training-category-header-expanded': training.show }">
                  📁 {{ training.trainingType }} ({{ getTotalVideosInTraining(training) }} videos)
                </h3>
                <div v-show="training.show" class="training-items">
                  <div v-for="(item, subIndex) in training.trainings" :key="subIndex" class="training-item">
                    <h4 @click="toggleItem(index, subIndex)" 
                        class="training-item-header"
                        :class="{ 'training-item-header-expanded': item.show }">
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
        if (window.electronAPI && window.electronAPI.selectDirectory) {
          const selectedPath = await window.electronAPI.selectDirectory()
          
          if (selectedPath) {
            const scanResult = await window.electronAPI.scanVideoDirectory(selectedPath)
            
            if (scanResult.success && scanResult.videos.length > 0) {
              const videos = scanResult.videos
              
              const saveResult = await window.electronAPI.saveDirectoryTree(selectedPath, videos)
              if (saveResult.success) {
                console.log('Directory tree saved to:', saveResult.filePath)
              }
              
              const trainingStructure = convertVideosToTrainingStructure(videos, selectedPath)
              
              videoStore.rootDirectoryPath = selectedPath
              videoStore.directoryStructure.name = selectedPath.split(/[\\\/]/).pop()
              videoStore.directoryStructure.path = selectedPath
              videoStore.directoryStructure.lastScanned = new Date().toISOString()
              
              videoStore.setNiouTrainingList(trainingStructure)
              videoStore.saveDirectoryInfo()
              
              errorMessage.value = ''
              showAutoReloadMessage.value = false
            } else {
              errorMessage.value = scanResult.error || 'No video files found in selected directory'
            }
          }
        } else {
          errorMessage.value = 'Directory selection not available (Electron required)'
        }
      } catch (error) {
        errorMessage.value = `Failed to load training directory: ${error.message}`
      }
    }

    const convertVideosToTrainingStructure = (videos, basePath) => {
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
      
      return Array.from(trainingMap.values()).map(training => ({
        ...training,
        trainings: Array.from(training.trainings.values())
      }))
    }

    const selectSingleVideo = async () => {
      try {
        if (window.electronAPI && window.electronAPI.selectVideoFile) {
          const filePath = await window.electronAPI.selectVideoFile()
          if (filePath) {
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
        errorMessage.value = `Failed to select video: ${error.message}`
      }
    }

    const toggleTraining = (index) => {
      trainingList.value.forEach((training, i) => {
        if (i !== index) {
          training.show = false
        }
      })
      videoStore.toggleTrainingVisibility(index)
    }

    const toggleItem = (trainingIndex, itemIndex) => {
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
        const videoElement = videoPlayer.value
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
        } else if (videoData.path && videoStore.rootDirectoryPath) {
          filePath = `${videoStore.rootDirectoryPath}/${videoData.path}`.replace(/[\\\/]+/g, '/')
        } else {
          throw new Error('No valid file path available')
        }
        
        await videoService.setVideoSource(videoElement, filePath)
        
        videoStore.currentVideoName = videoData.name || 'Unknown Video'
        videoStore.speed = 100
        
        errorMessage.value = ''
        
      } catch (error) {
        errorMessage.value = `Failed to load video: ${error.message}`
      }
    }

    const handleVideoLoaded = () => {
      const video = videoPlayer.value
      if (video) {
        const duration = video.duration
        videoStore.setVideoLength(duration)
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

    const hideAutoReloadMessage = () => {
      showAutoReloadMessage.value = false
    }

    const reloadDirectory = async () => {
      try {
        showAutoReloadMessage.value = false
        
        if (videoStore.rootDirectoryPath && window.electronAPI && window.electronAPI.scanVideoDirectory) {
          const videos = await window.electronAPI.scanVideoDirectory(videoStore.rootDirectoryPath)
          if (videos && videos.length > 0) {
            const trainingStructure = convertVideosToTrainingStructure(videos, videoStore.rootDirectoryPath)
            
            videoStore.setTrainingListWithMetadata(
              trainingStructure,
              null,
              videoStore.rootDirectoryPath
            )
            
            errorMessage.value = ''
            return
          }
        }
        
        errorMessage.value = 'Could not reload directory automatically. Please select the directory again.'
        
      } catch (error) {
        errorMessage.value = `Failed to reload directory: ${error.message}`
      }
    }

    // Watchers
    watch(speed, (newSpeed) => {
      updateSpeed()
    })

    // Lifecycle
    onMounted(async () => {
      videoStore.loadFromStorage()
      
      if (window.electronAPI && window.electronAPI.loadDirectoryTree) {
        try {
          const result = await window.electronAPI.loadDirectoryTree()
          
          if (result.success) {
            videoStore.rootDirectoryPath = result.data.directoryPath
            videoStore.directoryStructure.name = result.data.directoryPath.split(/[\\\/]/).pop()
            videoStore.directoryStructure.path = result.data.directoryPath
            videoStore.directoryStructure.lastScanned = result.data.lastScanned
            
            const trainingStructure = convertVideosToTrainingStructure(
              result.data.tree, 
              result.data.directoryPath
            )
            
            videoStore.setNiouTrainingList(trainingStructure)
          }
        } catch (error) {
          console.error('Failed to load saved directory tree:', error)
        }
      }
      
      const handleLaunchVideo = (event) => {
        const videoData = event.detail
        if (videoData) {
          launchFile(videoData)
        }
      }
      
      document.addEventListener('launch-video', handleLaunchVideo)
      
      onUnmounted(() => {
        document.removeEventListener('launch-video', handleLaunchVideo)
      })
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
      hideAutoReloadMessage,
      reloadDirectory,
      convertVideosToTrainingStructure
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
</style>