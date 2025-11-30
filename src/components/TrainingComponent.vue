<template>
  <div class="video-container">
    <div class="two-columns">
      <!-- Left Panel - Playlist Management -->
      <div class="column-left">
        <h2 class="section-title">{{ $t('training.training_playlists') }}</h2>

        <!-- Playlist Tabs -->
        <div class="section-card">
          <ul class="list-unstyled list-horizontal">
            <li
              v-for="training in trainingStore.trainingList"
              @click="selectTraining(training)"
              :class="backColor(training)"
              :key="training.id"
              class="list-item"
            >
              <p>{{ training.name }}</p>
            </li>
          </ul>
        </div>

        <!-- Playlist Management Controls -->
        <div class="section-card">
          <input
            v-model="currentName"
            type="text"
            :placeholder="$t('training.new_playlist_name')"
            class="form-input"
          />
          <div class="btn-group">
            <button @click="addTraining()" class="btn btn-success">
              {{ $t('training.add_playlist') }}
            </button>
            <button @click="removeTraining()" class="btn btn-danger-alt">
              {{ $t('training.remove_playlist') }}
            </button>
          </div>
        </div>

        <!-- Current Playlist Videos -->
        <div class="section-card" style="flex: 1">
          <h3
            v-if="currentTraining"
            style="
              margin: 0 0 15px 0;
              color: var(--text-primary);
              font-weight: 600;
              font-size: 1.1rem;
              text-align: center;
              padding: 10px;
              background: var(--bg-primary-light);
              border-radius: 20px;
              border: 2px solid var(--bg-primary-border);
            "
          >
            {{ currentTraining.name }} - {{ $t('training.videos') }}
          </h3>
          <div class="list-scrollable" style="max-height: 300px">
            <div v-for="(item, index) in currentPlaylistVideos" :key="index">
              <!-- Playlist item (folder) -->
              <div v-if="item.isPlaylist" class="playlist-item">
                <div 
                  @click="togglePlaylistExpanded(index)"
                  class="playlist-header"
                >
                  <span class="toggle-icon">{{ expandedPlaylists.has(index) ? '▼' : '▶' }}</span>
                  <span class="playlist-name">{{ item.name }}</span>
                  <span class="video-count">({{ item.videos?.length || 0 }})</span>
                  <button
                    class="btn-icon-round btn-danger-alt"
                    @click.stop="removeVideoFromPlaylist(item)"
                    style="margin-left: auto;"
                  ></button>
                </div>
                
                <!-- Nested videos in playlist -->
                <div v-if="expandedPlaylists.has(index)" class="playlist-videos">
                  <div
                    v-for="(video, vIndex) in item.videos"
                    :key="vIndex"
                    @click="playVideoInTrainingPlayer(video)"
                    class="nested-video-item"
                  >
                    <span>{{ getVideoDisplayName(video) }}</span>
                    <button
                      class="btn-icon-round btn-danger-alt"
                      @click.stop="removeVideoFromPlaylistItem(item, vIndex)"
                    ></button>
                  </div>
                </div>
              </div>
              
              <!-- Individual video item -->
              <div v-else @click="playVideoInTrainingPlayer(item)" class="list-item-with-action">
                <span>{{ getVideoDisplayName(item) }}</span>
                <button
                  class="btn-icon-round btn-danger-alt"
                  @click.stop="removeVideoFromPlaylist(item)"
                ></button>
              </div>
            </div>
          </div>
        </div>

        <!-- File Selection Controls -->
        <div class="section-card">
          <div class="btn-group btn-group-vertical">
            <button class="btn btn-primary" @click="selectSingleVideo">
              {{ $t('training.add_single_video') }}
            </button>
            <button class="btn btn-primary" @click="selectTrainingDirectory">
              {{ $t('training.add_from_directory') }}
            </button>
            <button class="btn btn-primary" @click="openVideoModal">
              {{ $t('training.browse_available_videos') }}
            </button>
            <label class="btn btn-primary" for="uploadVideo">{{
              $t('training.upload_file_web')
            }}</label>
            <input
              id="uploadVideo"
              type="file"
              @change="loadVideo"
              accept="video/*"
              style="display: none"
            />
          </div>
        </div>

        <!-- Directory Browser (when directory is selected) -->
        <div v-if="directoryVideos.length > 0" class="section-card">
          <h3
            style="
              margin: 0 0 15px 0;
              color: var(--text-primary);
              font-weight: 600;
              font-size: 1.1rem;
            "
          >
            {{ $t('training.available_videos_directory') }}
          </h3>
          <div class="list-scrollable" style="max-height: 200px">
            <div v-for="video in directoryVideos" :key="video.path" class="list-item-with-action">
              <span @click="playVideoInTrainingPlayer(video)">{{ video.name }}</span>
              <button @click="addVideoToCurrentPlaylist(video)" class="btn btn-warning btn-small">
                {{ $t('training.add_to_playlist') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Video Player -->
      <div class="column-right">
        <h1 class="section-title">
          {{ currentVideoName || $t('training.training_video_player') }}
        </h1>

        <!-- Video Player -->
        <video
          class="video-player"
          @timeupdate="handleTimeUpdate"
          @loadedmetadata="handleVideoLoaded"
          ref="trainingVideoPlayer"
          controls
        ></video>

        <!-- Video Controls -->
        <div class="btn-group btn-group-center">
          <button class="btn btn-success" @click="playVideo">{{ $t('training.play') }}</button>
          <button class="btn btn-warning" @click="pauseVideo">{{ $t('training.pause') }}</button>
          <button class="btn btn-danger" @click="stopVideo">{{ $t('training.stop') }}</button>
        </div>

        <!-- Speed Control -->
        <div class="text-center">
          <h3 class="mb-medium slider-label">{{ $t('training.playing_rate') }}</h3>
          <div class="slider-container">
            <input
              type="range"
              min="10"
              max="300"
              v-model="speed"
              class="range-input range-input-thick"
            />
            <p class="slider-value">{{ speed }}%</p>
          </div>
        </div>

        <!-- Time Controls -->
        <div class="slider-section">
          <div class="slider-grid">
            <div class="slider-container slider-container-vertical">
              <label for="startSlider" class="slider-label">{{ $t('training.video_start') }}</label>
              <input
                id="startSlider"
                type="range"
                v-model="startTime"
                :max="endTime"
                min="0"
                step="1"
                class="range-input"
              />
              <p class="slider-value">{{ formatTime(startTime) }}</p>
            </div>

            <div class="slider-container slider-container-vertical">
              <label for="endSlider" class="slider-label">{{ $t('training.video_end') }}</label>
              <input
                id="endSlider"
                type="range"
                v-model="endTime"
                :min="startTime"
                :max="videoDuration"
                step="1"
                class="range-input"
              />
              <p class="slider-value">{{ formatTime(endTime) }}</p>
            </div>
          </div>
        </div>

        <!-- Loop Control -->
        <div class="checkbox-container">
          <label for="loopCheckbox" class="checkbox-label">{{ $t('training.loop') }}</label>
          <input id="loopCheckbox" type="checkbox" v-model="loop" class="checkbox-input" />
        </div>
      </div>
    </div>

    <!-- Video Selection Modal -->
    <div v-if="showVideoModal" class="modal-overlay" @click="closeVideoModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ $t('training.browse_available_videos') }}</h2>
          <button class="btn-icon-round btn-danger-alt" @click="closeVideoModal"></button>
        </div>

        <div class="modal-body">
          <div v-if="availableVideos.length === 0" class="no-content-message">
            <p>{{ $t('training.no_videos_found') }}</p>
          </div>

          <div v-else class="video-browser">
            <input
              v-model="videoSearchQuery"
              type="text"
              :placeholder="$t('training.search_videos')"
              class="form-input"
            />

            <div class="training-tree">
              <div
                v-for="(training, trainingIndex) in filteredAvailableVideos"
                :key="trainingIndex"
                class="training-category"
              >
                <h3
                  @click="toggleTrainingCategory(trainingIndex)"
                  class="training-category-header"
                  :class="{ 'training-category-header-expanded': training.show }"
                >
                  📁 {{ training.trainingType }} ({{ getTrainingVideoCount(training) }}
                  {{ $t('training.videos') }})
                </h3>

                <div v-show="training.show" class="training-items">
                  <div
                    v-for="(item, itemIndex) in training.trainings"
                    :key="itemIndex"
                    class="training-item"
                  >
                    <h4
                      @click="toggleTrainingItem(trainingIndex, itemIndex)"
                      class="training-item-header"
                      :class="{ 'training-item-header-expanded': item.show }"
                    >
                      📂 {{ item.name }}
                      <span v-if="item.videos"
                        >({{ item.videos.length }} {{ $t('training.videos') }})</span
                      >
                    </h4>
                    <button
                      class="btn btn-success btn-small"
                      @click.stop="addVideoPlaylistToTraining(item)"
                    >
                      {{ $t('training.add_to_playlist') }}
                    </button>

                    <div v-show="item.show">
                      <ul class="video-list">
                        <li
                          v-if="item.isDirectFile"
                          class="video-item"
                          @click="selectVideoFromModal(item)"
                        >
                          🎥 {{ item.name }}
                          <button
                            class="btn btn-success btn-small"
                            @click.stop="addVideoFromModal(item)"
                          >
                            {{ $t('training.add_to_playlist') }}
                          </button>
                        </li>

                        <li
                          v-else
                          v-for="(video, videoIndex) in item.videos || []"
                          :key="videoIndex"
                          class="video-item"
                          @click="selectVideoFromModal(video)"
                        >
                          🎥 {{ video.name }}
                          <button
                            class="btn btn-success btn-small"
                            @click.stop="addVideoFromModal(video)"
                          >
                            {{ $t('training.add_to_playlist') }}
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
          <button @click="closeVideoModal" class="btn">{{ $t('training.close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { useTrainingStore } from '@/stores/trainingStore.js'
  import { useVideoStore } from '@/stores/videoStore.js'
  import { serviceManager } from '@/services/index.js'
  import '../assets/css/global.css'
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
        // Playlist management
        currentName: '',

        // Directory browsing (temporary UI state)
        directoryVideos: [],
        directoryInfo: {
          name: '',
          path: '',
          totalTrainings: 0,
          totalVideos: 0,
          lastScanned: null,
        },

        // Modal state (UI only)
        showVideoModal: false,
        videoSearchQuery: '',
        expandedTrainings: new Set(),
        expandedItems: new Set(),

        // Video player state (component-specific, not saved per user)
        currentVideoName: '',
        videoDuration: 0,
        startTime: 0,
        endTime: 0,
        speed: 100,
        loop: false,
        isPlaying: false,

        // Blob URL cleanup
        cleanupBlobUrl: null,
        expandedPlaylists: new Set(),
      }
    },

    computed: {
      currentTraining() {
        return this.trainingStore.trainingList.find(
          (training) => training.id === this.trainingStore.selectedTraining
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
          return this.availableVideos.map((training) => ({
            ...training,
            show: this.expandedTrainings.has(training.trainingType),
            trainings: training.trainings.map((item, itemIndex) => ({
              ...item,
              show: this.expandedItems.has(`${training.trainingType}-${itemIndex}`),
            })),
          }))
        }

        const query = this.videoSearchQuery.toLowerCase()
        return this.availableVideos
          .map((training) => ({
            ...training,
            show: true,
            trainings: training.trainings
              .filter((item) => {
                const nameMatch = item.name.toLowerCase().includes(query)
                const videoMatch =
                  item.videos &&
                  item.videos.some((video) => video.name.toLowerCase().includes(query))
                return nameMatch || videoMatch
              })
              .map((item, itemIndex) => ({
                ...item,
                show: true,
              })),
          }))
          .filter((training) => training.trainings.length > 0)
      },
    },

    methods: {
      // Playlist Management
      backColor(training) {
        return training.id === this.trainingStore.selectedTraining ? 'list-item-selected' : ''
      },

      selectTraining(training) {
        this.trainingStore.setSelectedTraining(training.id)
      },

      addTraining() {
        if (this.currentName.trim()) {
          this.trainingStore.addTraining(this.currentName.trim())
          this.currentName = ''
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

          let enhancedVideoData = this.ensureAbsolutePath(videoData)
          console.log('Enhanced video data:', enhancedVideoData)

          const identifier =
            typeof enhancedVideoData === 'string'
              ? enhancedVideoData
              : this.getVideoIdentifier(enhancedVideoData)
          const exists = this.currentTraining.list.some((item) => {
            const existingIdentifier =
              typeof item === 'string' ? item : this.getVideoIdentifier(item)
            return existingIdentifier === identifier
          })

          if (!exists) {
            console.log('Adding video to store:', enhancedVideoData)
            this.trainingStore.addVideoToTraining(
              this.trainingStore.selectedTraining,
              enhancedVideoData
            )
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

      togglePlaylistExpanded(playlistIndex) {
        if (this.expandedPlaylists.has(playlistIndex)) {
          this.expandedPlaylists.delete(playlistIndex)
        } else {
          this.expandedPlaylists.add(playlistIndex)
        }
        this.$forceUpdate()
      },

      removeVideoFromPlaylistItem(playlist, videoIndex) {
        if (playlist && playlist.videos) {
          playlist.videos.splice(videoIndex, 1)
          this.trainingStore.saveTrainingsToStorage()
        }
      },

      selectVideoForPlayback(videoData) {
        this.playVideoInTrainingPlayer(videoData)
      },

      async playVideoInTrainingPlayer(videoData) {
        try {
          console.log('playVideoInTrainingPlayer called with:', videoData)
          console.log('videoData type:', typeof videoData)
          console.log('videoData properties:', Object.keys(videoData || {}))

          if (this.cleanupBlobUrl) {
            this.cleanupBlobUrl()
            this.cleanupBlobUrl = null
          }

          const videoPlayer = this.$refs.trainingVideoPlayer
          if (!videoPlayer) {
            console.error('Training video player not found')
            return
          }

          const { videoPath, videoName } = this.resolveVideoPath(videoData)
          if (!videoPath) {
            console.error('No valid video path found for training player')
            return
          }

          console.log('Final video path for loading:', videoPath)

          if (window.electronAPI?.loadVideoFile) {
            const loaded = await this.tryLoadViaIPC(videoPath, videoPlayer, videoName)
            if (loaded) return 
          }

          const finalUrl = `file://${videoPath.replace(/#/g, '%23')}`
          videoPlayer.src = finalUrl
          this.currentVideoName = videoName
          console.log('Fallback: Loading video in training player:', finalUrl)
        } catch (error) {
          console.error('Error playing video in training player:', error)
        }
      },

      // ---------------- Helper methods ----------------

      resolveVideoPath(videoData) {
        let videoPath = null
        let videoName = 'Unknown Video'

        if (typeof videoData === 'string') {
          videoPath = videoData
          videoName = videoData.split(/[\\/]/).pop() || 'Video'
          return { videoPath, videoName }
        }

        if (typeof videoData !== 'object' || !videoData) {
          return { videoPath, videoName }
        }

        if (videoData.absolutePath) {
          return { videoPath: videoData.absolutePath, videoName: videoData.name || 'Video' }
        }

        if (videoData.fileHandleId) {
          this.handleFileHandleVideo(videoData)
          return {}
        }

        const pathCandidates = [videoData.url, videoData.path, videoData.identifier]
        for (const path of pathCandidates) {
          if (!path) continue

          if (path.startsWith('/') || path.match(/^[A-Z]:/)) {
            return { videoPath: path, videoName: videoData.name || 'Video' }
          }

          if (this.videoStore?.rootDirectoryPath) {
            const combined = `${this.videoStore.rootDirectoryPath}/${path}`.replace(/[\\/]+/g, '/')
            return { videoPath: combined, videoName: videoData.name || 'Video' }
          }
        }

        return { videoPath, videoName }
      },

      async tryLoadViaIPC(videoPath, videoPlayer, videoName) {
        try {
          console.log('Loading video via IPC in training player:', videoPath)
          const result = await window.electronAPI.loadVideoFile(videoPath)

          if (!result.success) throw new Error(result.error || 'Failed to load video file')

          const binaryString = atob(result.data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i)

          const blob = new Blob([bytes], { type: result.mimeType })
          const blobUrl = URL.createObjectURL(blob)

          this.cleanupBlobUrl = () => URL.revokeObjectURL(blobUrl)

          videoPlayer.src = blobUrl
          this.currentVideoName = videoName

          console.log('Video loaded successfully in training player via IPC')
          return true
        } catch (error) {
          console.error('IPC video loading failed in training player:', error)
          return false
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

          const fileHandle = this.fileService.getFileHandle(videoData.fileHandleId)
          if (!fileHandle) {
            throw new Error(`FileHandle not found for ID: ${videoData.fileHandleId}`)
          }

          const file = await fileHandle.getFile()
          const blobUrl = URL.createObjectURL(file)

          videoPlayer.src = blobUrl
          this.currentVideoName = videoData.name || 'FileHandle Video'

          this.cleanupBlobUrl = () => URL.revokeObjectURL(blobUrl)

          console.log('FileHandle video loaded successfully:', videoData.name)
        } catch (error) {
          console.error('Error handling fileHandle video:', error)
          alert(`Error loading video: ${error.message}`)
        }
      },

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
      async selectSingleVideo() {
        try {
          if (window.electronAPI && window.electronAPI.selectVideoFile) {
            const filePath = await window.electronAPI.selectVideoFile()
            if (filePath) {
              const videoData = {
                name: filePath.split(/[\\\/]/).pop(),
                path: filePath,
                url: filePath,
                isNative: true,
              }
              this.addVideoToCurrentPlaylist(videoData)
            }
          } else {
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
                  isWeb: true,
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
            this.directoryVideos = videos.map((video) => ({
              name: video.name,
              path: video.path,
            }))

            this.directoryInfo = {
              name: directoryPath.split(/[\\\/]/).pop(),
              path: directoryPath,
              totalTrainings: 1,
              totalVideos: videos.length,
              lastScanned: new Date(),
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
              if (
                file.type.startsWith('video/') ||
                file.name.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)
              ) {
                videos.push({
                  name: file.name,
                  path: basePath + file.name,
                  file: file,
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
          lastScanned: new Date(),
        }
      },

      async loadVideo(event) {
        const file = event.target.files[0]
        if (!file) return

        let videoData
        if (file.path) {
          videoData = {
            name: file.name,
            path: file.path.replace(/#/g, '%23'),
            url: file.path.replace(/#/g, '%23'),
            isNative: true,
          }
        } else {
          videoData = {
            name: file.name,
            url: URL.createObjectURL(file),
            path: URL.createObjectURL(file),
            isWeb: true,
          }
        }

        this.addVideoToCurrentPlaylist(videoData)
      },

      clearDirectory() {
        this.directoryVideos = []
        this.directoryInfo = {
          name: '',
          path: '',
          totalTrainings: 0,
          totalVideos: 0,
          lastScanned: null,
        }
      },
      openVideoModal() {
        this.showVideoModal = true
        this.expandedTrainings.clear()
        this.expandedItems.clear()
      },

      closeVideoModal() {
        this.showVideoModal = false
        this.videoSearchQuery = ''
      },

      toggleTrainingCategory(trainingIndex) {
        const training = this.filteredAvailableVideos[trainingIndex]
        if (this.expandedTrainings.has(training.trainingType)) {
          this.expandedTrainings.delete(training.trainingType)
        } else {
          this.expandedTrainings.add(training.trainingType)
        }
        this.$forceUpdate()
      },

      toggleTrainingItem(trainingIndex, itemIndex) {
        const training = this.filteredAvailableVideos[trainingIndex]
        const key = `${training.trainingType}-${itemIndex}`
        if (this.expandedItems.has(key)) {
          this.expandedItems.delete(key)
        } else {
          this.expandedItems.add(key)
        }
        this.$forceUpdate() 
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
        this.playVideoInTrainingPlayer(video)
      },

      addVideoPlaylistToTraining(item) {
        if (!item.videos || item.videos.length === 0) return
        
        if (!this.currentTraining) {
          console.error('No current training selected')
          return
        }

        const playlistData = {
          name: item.name,
          isPlaylist: true,
          parentName: item.parentName || '',
          videos: item.videos.map(video => ({
            name: video.name,
            identifier: this.getVideoIdentifier(video),
            fileHandleId: video.fileHandleId,
            url: video.url,
            path: video.path,
            isDirectFile: video.isDirectFile,
            parentName: video.parentName,
          }))
        }
        
        console.log('Adding playlist to training:', this.currentTraining.id, playlistData)
        
        // Add to store
        this.trainingStore.addVideoPlaylistToTraining(
          this.trainingStore.selectedTraining,
          playlistData
        )
        
        console.log(`Added playlist "${item.name}" with ${item.videos.length} videos to training`)
        
        // Close the modal and refresh UI
        this.showVideoModal = false
        this.$nextTick(() => {
          console.log('After closing modal, current playlist videos:', this.currentPlaylistVideos)
        })
      },
      addVideoFromModal(video) {
        const videoIdentifier = this.getVideoIdentifier(video)
        if (videoIdentifier) {
          const videoData = {
            name: video.name,
            identifier: videoIdentifier,
            fileHandleId: video.fileHandleId,
            url: video.url,
            path: video.path,
            isDirectFile: video.isDirectFile,
            parentName: video.parentName,
          }

          this.addVideoToCurrentPlaylist(videoData)
          console.log(`Added "${video.name}" to playlist`)
        }
      },

      getVideoIdentifier(video) {
        if (video.fileHandleId) {
          return video.fileHandleId 
        }
        if (video.absolutePath && video.path) {
          return video.path 
        }
        return video.url || video.path || video.identifier
      },

      ensureAbsolutePath(videoData) {
        if (typeof videoData === 'string') {
          return {
            name: videoData.split(/[\\\/]/).pop() || 'Video',
            absolutePath: videoData,
            path: videoData,
            identifier: videoData,
          }
        }

        if (videoData && typeof videoData === 'object') {
          if (videoData.absolutePath) {
            return videoData
          }

          let absolutePath = null

          if (
            (videoData.url && videoData.url.startsWith('/')) ||
            (videoData.url && videoData.url.match(/^[A-Z]:/))
          ) {
            absolutePath = videoData.url
          } else if (
            videoData.path &&
            (videoData.path.startsWith('/') || videoData.path.match(/^[A-Z]:/))
          ) {
            absolutePath = videoData.path
          } else if (videoData.path && this.videoStore.rootDirectoryPath) {
            absolutePath = `${this.videoStore.rootDirectoryPath}/${videoData.path}`.replace(
              /[\\\/]+/g,
              '/'
            )
          } else {
            absolutePath = videoData.url || videoData.path || videoData.identifier
          }

          return {
            ...videoData,
            absolutePath: absolutePath,
            name: videoData.name || absolutePath.split(/[\\\/]/).pop() || 'Video',
          }
        }

        return videoData
      },

      getVideoDisplayName(videoItem) {
        if (typeof videoItem === 'string') {
          const pathParts = videoItem.split(/[\\\/]/)
          return pathParts[pathParts.length - 1]
        }
        // Handle playlist items
        if (videoItem.isPlaylist) {
          return `📁 ${videoItem.name} (${videoItem.videos?.length || 0} videos)`
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
      },
    },

    mounted() {
      this.trainingStore.loadTrainings()
    },

    beforeUnmount() {
      if (this.cleanupBlobUrl) {
        this.cleanupBlobUrl()
      }
    },
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

  /* Playlist styles */
  .playlist-item {
    border: 1px solid var(--bg-primary-border);
    border-radius: 4px;
    margin-bottom: 8px;
    background: var(--bg-primary-light);
    overflow: hidden;
  }

  .playlist-header {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    cursor: pointer;
    background: var(--bg-primary-light);
    transition: background-color 0.2s;
    user-select: none;
  }

  .playlist-header:hover {
    background: var(--bg-primary-border);
  }

  .toggle-icon {
    margin-right: 8px;
    font-size: 0.9rem;
  }

  .playlist-name {
    font-weight: 600;
    color: var(--text-primary);
    flex: 1;
  }

  .video-count {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-right: 10px;
  }

  .playlist-videos {
    background: var(--bg-darker);
    border-top: 1px solid var(--bg-primary-border);
    padding: 0;
  }

  .nested-video-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px 10px 35px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid var(--bg-primary-border);
  }

  .nested-video-item:hover {
    background: var(--bg-primary-light);
  }

  .nested-video-item:last-child {
    border-bottom: none;
  }
</style>
