<template>
  <div style="width:100%;height : 100%">
    <div class="training-container">
      <!-- Playlist Management Section -->
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
            <li v-for="item in currentPlaylistVideos" 
                :key="item" 
                @click="selectVideoForPlayback(item)"
                class="video-item">
              {{ getVideoDisplayName(item) }}
              <button class="button-remove" @click="removeVideoFromPlaylist(item)">×</button>
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
              <span @click="selectVideoForPlayback(video.path)">{{ video.name }}</span>
              <button @click="addVideoToCurrentPlaylist(video.path)" class="button-add">Add to Playlist</button>
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

export default {
  name: 'TrainingComponent',
  
  setup() {
    const trainingStore = useTrainingStore()
    const videoStore = useVideoStore()
    return { trainingStore, videoStore }
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
      expandedItems: new Set()
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
    addVideoToCurrentPlaylist(videoPath) {
      if (this.currentTraining && videoPath) {
        this.trainingStore.addVideoToTraining(this.trainingStore.selectedTraining, videoPath)
      }
    },

    removeVideoFromPlaylist(videoPath) {
      if (this.currentTraining && videoPath) {
        this.trainingStore.removeVideoFromTraining(this.trainingStore.selectedTraining, videoPath)
      }
    },

    selectVideoForPlayback(videoPath) {
      // Emit event to parent component to play video
      this.$emit('video-selected', videoPath)
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
            this.addVideoToCurrentPlaylist(filePath)
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
              this.addVideoToCurrentPlaylist(videoURL)
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

      let videoURL
      if (file.path) {
        // Electron environment
        videoURL = file.path.replace(/#/g, '%23')
      } else {
        // Web environment
        videoURL = URL.createObjectURL(file)
      }

      this.addVideoToCurrentPlaylist(videoURL)
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
      // Preview/play the video
      this.$emit('video-selected', video.url || video.path)
    },

    addVideoFromModal(video) {
      const videoPath = video.url || video.path
      if (videoPath) {
        this.addVideoToCurrentPlaylist(videoPath)
        // Optional: show feedback
        console.log(`Added "${video.name}" to playlist`)
      }
    }
  },

  mounted() {
    // Load saved playlists from store
    this.trainingStore.loadTrainings()
  }
}
</script>

<style scoped>
.training-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #2c3e50;
  color: white;
}

.playlist-section {
  width: 100%;
}

.playlist-tabs {
  margin-bottom: 20px;
}

.horizontal-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.horizontal-list li {
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.selected-training {
  background-color: #3498db;
}

.unselected-training {
  background-color: #34495e;
}

.unselected-training:hover {
  background-color: #4a6079;
}

.playlist-controls {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.playlist-controls input {
  padding: 8px 12px;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #34495e;
  color: white;
  flex: 1;
  max-width: 300px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.playlist-content {
  margin-bottom: 20px;
}

.video-list {
  list-style: decimal;
  padding-left: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.video-item {
  padding: 8px;
  margin: 5px 0;
  background-color: #34495e;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.video-item:hover {
  background-color: #4a6079;
}

.button-remove {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.button-remove:hover {
  background-color: #c0392b;
}

.file-controls {
  margin-bottom: 20px;
}

.button-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.button-file {
  background-color: #27ae60;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button-file:hover {
  background-color: #229954;
}

#uploadVideo {
  display: none;
}

.directory-browser {
  margin-top: 20px;
  padding: 20px;
  background-color: #34495e;
  border-radius: 8px;
}

.directory-videos {
  max-height: 400px;
  overflow-y: auto;
}

.directory-video-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin: 5px 0;
  background-color: #2c3e50;
  border-radius: 4px;
}

.directory-video-item span {
  cursor: pointer;
  flex: 1;
}

.directory-video-item span:hover {
  color: #3498db;
}

.button-add {
  background-color: #f39c12;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.button-add:hover {
  background-color: #e67e22;
}

button {
  background-color: #3498db;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2980b9;
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
}

.modal-content {
  background-color: #2c3e50;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  color: white;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #34495e;
}

.modal-header h2 {
  margin: 0;
  color: #3498db;
}

.modal-close {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #34495e;
  display: flex;
  justify-content: flex-end;
}

.no-videos {
  text-align: center;
  padding: 40px;
  color: #95a5a6;
}

.search-section {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #34495e;
  color: white;
  font-size: 16px;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.video-browser {
  max-height: 500px;
  overflow-y: auto;
}

.training-category {
  margin-bottom: 15px;
  border: 1px solid #34495e;
  border-radius: 6px;
  overflow: hidden;
}

.training-header {
  background-color: #34495e;
  padding: 12px 15px;
  margin: 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
}

.training-header:hover {
  background-color: #4a6079;
}

.training-header.expanded {
  background-color: #3498db;
}

.training-items {
  background-color: #2c3e50;
}

.training-item {
  border-bottom: 1px solid #34495e;
}

.training-item:last-child {
  border-bottom: none;
}

.item-header {
  background-color: #445566;
  padding: 10px 20px;
  margin: 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
  font-size: 14px;
}

.item-header:hover {
  background-color: #556677;
}

.item-header.expanded {
  background-color: #27ae60;
}

.video-list-modal {
  background-color: #1a252f;
}

.video-item-modal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 25px;
  border-bottom: 1px solid #34495e;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.video-item-modal:hover {
  background-color: #2c3e50;
}

.video-item-modal:last-child {
  border-bottom: none;
}

.video-name {
  flex: 1;
  font-size: 13px;
  color: #ecf0f1;
}

.button-select {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  transition: background-color 0.3s ease;
}

.button-select:hover {
  background-color: #229954;
}

.button-cancel {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.button-cancel:hover {
  background-color: #7f8c8d;
}
</style>
