<template>
  <div class="video-component">
    <div class="two-columns">
      <!-- Left Column - Training List -->
      <div class="column-left">
        <div class="training-list">
          <div v-for="(training, index) in videoStore.niouTrainingList" :key="index">
            <h2 @click="toggleTraining(index)" class="training-type">
              {{ training.trainingType }}
            </h2>
            <div v-show="training.show">
              <div v-for="(item, subIndex) in training.trainings" :key="subIndex">
                <h3 @click="toggleItem(index, subIndex)" class="training-item">
                  {{ item.name }}
                </h3>
                <ul v-show="item.show">
                  <li 
                    v-for="(video, videoIndex) in item.videos || [item]" 
                    :key="videoIndex"
                    @click="launchFile(video.url)" 
                    class="video-file"
                  >
                    {{ video.name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Directory Selection -->
          <div class="directory-controls">
            <input 
              v-model="videoStore.defaultPath" 
              type="text" 
              placeholder="Base directory path"
            />
            <button @click="createTrainingList">Load Training Directory</button>
          </div>
        </div>
      </div>

      <!-- Right Column - Video Player -->
      <div class="column-right">
        <h1>{{ videoStore.currentVideo }}</h1>

        <!-- Video Player -->
        <video 
          ref="videoPlayer"
          style="width: 100%; height: 100%"
          @timeupdate="handleTimeUpdate"
          @loadedmetadata="onVideoLoaded"
          controls
        ></video>

        <!-- Playback Controls -->
        <div class="playback-controls">
          <button class="button" @click="play">Play</button>
          <button class="button" @click="pause">Pause</button>
          <button class="button" @click="stop">Stop</button>
        </div>

        <!-- Time Controls -->
        <div class="slider-parent">
          <div class="slider-container">
            <label for="startSlider" class="slider-label">Video Start</label>
            <input 
              id="startSlider" 
              type="range" 
              v-model="videoStore.startTime" 
              :max="videoStore.endTime" 
              min="0" 
              step="1"
            />
            <p class="slider-value">{{ videoService.formatTime(videoStore.startTime) }}</p>
          </div>

          <div class="slider-container">
            <label for="endSlider" class="slider-label">Video End</label>
            <input 
              id="endSlider" 
              type="range" 
              v-model="videoStore.endTime" 
              :min="videoStore.startTime" 
              :max="videoStore.videoLength" 
              step="1"
            />
            <p class="slider-value">{{ videoService.formatTime(videoStore.endTime) }}</p>
          </div>
        </div>

        <!-- Loop Control -->
        <div class="loop-checkbox">
          <label for="loopCheckbox" class="checkbox-label">Loop:</label>
          <input id="loopCheckbox" type="checkbox" v-model="videoStore.loop" />
        </div>

        <!-- Speed Control -->
        <div class="speed-control">
          <h3>Playing Rate</h3>
          <div class="slider">
            <input 
              type="range" 
              min="10" 
              max="300" 
              v-model="videoStore.speed"
              @input="onSpeedChange"
            />
            <p>{{ videoStore.speed }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useVideoStore } from '../stores/videoStore.js'
import { serviceManager } from '../services'

export default {
  name: 'VideoComponentNew',
  
  setup() {
    const videoStore = useVideoStore()
    const videoService = serviceManager.video
    const fileService = serviceManager.file
    const storageService = serviceManager.storage
    
    return {
      videoStore,
      videoService,
      fileService,
      storageService
    }
  },
  
  mounted() {
    // Load data from storage
    this.videoStore.loadFromStorage()
    
    // Set up video player event listeners
    this.setupVideoPlayer()
  },
  
  methods: {
    // Training management
    toggleTraining(index) {
      this.videoStore.toggleTrainingVisibility(index)
    },
    
    toggleItem(trainingIndex, itemIndex) {
      this.videoStore.toggleItemVisibility(trainingIndex, itemIndex)
    },
    
    // Directory and file management
    async createTrainingList() {
      try {
        const directoryHandle = await this.fileService.selectDirectory()
        this.videoStore.directoryName = this.videoStore.defaultPath + directoryHandle.name

        const trainingList = await this.fileService.readDirectoryRecursive(
          directoryHandle, 
          this.videoStore.directoryName
        )

        this.videoStore.setNiouTrainingList(trainingList)
        console.log("Training list loaded:", trainingList)
      } catch (error) {
        console.error('Error creating training list:', error)
      }
    },
    
    // Video playback
    async launchFile(filePath) {
      try {
        const sanitizedPath = this.videoService.sanitizeFilePath(filePath)
        this.videoStore.speed = 100
        
        // Set video source
        this.videoService.setVideoSource(this.$refs.videoPlayer, sanitizedPath)
        
        // Update current video name
        this.videoStore.currentVideo = this.videoService.extractFilename(filePath)
      } catch (error) {
        console.error('Error launching video:', error)
      }
    },
    
    // Playback controls
    async play() {
      try {
        await this.videoService.playVideo(
          this.$refs.videoPlayer, 
          this.videoStore.speed / 100
        )
      } catch (error) {
        console.error('Error playing video:', error)
      }
    },
    
    pause() {
      this.videoService.pauseVideo(this.$refs.videoPlayer)
    },
    
    stop() {
      this.videoService.stopVideo(this.$refs.videoPlayer, this.videoStore.startTime)
    },
    
    onSpeedChange() {
      this.videoService.setPlaybackRate(this.$refs.videoPlayer, this.videoStore.speed)
    },
    
    // Event handlers
    setupVideoPlayer() {
      const video = this.$refs.videoPlayer
      if (video) {
        video.addEventListener('loadedmetadata', this.onVideoLoaded)
      }
    },
    
    handleTimeUpdate() {
      const video = this.$refs.videoPlayer
      if (!video) return
      
      this.videoService.handleTimeUpdate(
        video,
        video.currentTime,
        this.videoStore.startTime,
        this.videoStore.endTime,
        this.videoStore.loop
      )
    },
    
    onVideoLoaded() {
      const video = this.$refs.videoPlayer
      if (video && video.duration) {
        this.videoStore.setVideoLength(video.duration)
      }
    }
  },
  
  beforeUnmount() {
    // Cleanup video resources
    this.videoService.cleanup()
  }
}
</script>

<style scoped>
.video-component {
  width: 100%;
  height: 100%;
}

.two-columns {
  display: flex;
  height: 100%;
}

.column-left {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: 100vh;
}

.column-right {
  flex: 2;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.training-list {
  margin-bottom: 20px;
}

.training-type {
  background-color: #f2f2f2;
  padding: 10px;
  margin: 5px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.training-type:hover {
  background-color: #e0e0e0;
}

.training-item {
  background-color: #f9f9f9;
  padding: 8px;
  margin: 3px 0;
  margin-left: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.training-item:hover {
  background-color: #eeeeee;
}

.video-file {
  padding: 5px;
  margin: 2px 0;
  margin-left: 40px;
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.video-file:hover {
  background-color: #e8e8e8;
}

.directory-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 20px;
}

.directory-controls input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.directory-controls button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.directory-controls button:hover {
  background: #0056b3;
}

.playback-controls {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background: #0056b3;
}

.slider-parent {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.slider-container {
  flex: 1;
  margin: 0 10px;
}

.slider-label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.slider-container input[type="range"] {
  width: 100%;
}

.slider-value {
  text-align: center;
  margin-top: 5px;
  font-size: 14px;
}

.loop-checkbox {
  margin-bottom: 20px;
}

.checkbox-label {
  margin-right: 10px;
  font-weight: bold;
}

.speed-control {
  text-align: center;
}

.slider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: auto;
}

.slider input[type="range"] {
  flex: 1;
  max-width: 300px;
}
</style>
