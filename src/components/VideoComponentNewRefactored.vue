<template>
  <div class="video-container" data-video-component="new-refactored">
    <div class="two-columns">
      <div class="column-left">
        <div>
          <!-- Training List -->
          <div class="section-card fade-in-up">
            <h2 class="section-title">
              {{ $t('video_component_dossier.video_training_library') }}
            </h2>
            <div v-if="trainingList.length === 0" class="no-content-message">
              <p>
                {{ $t('video_component_dossier.no_video_library_loaded') }}
              </p>
            </div>
            <div v-else class="training-tree">
              <div
                v-for="(training, index) in trainingList"
                :key="`training-${index}`"
                class="training-category"
              >
                <h3
                  @click="toggleTraining(index)"
                  class="training-category-header"
                  :class="{ 'training-category-header-expanded': training.show }"
                >
                  📁 {{ training.trainingType }} ({{ getTotalVideosInTraining(training) }}
                  {{ $t('video_component_dossier.videos') }})
                </h3>
                <div v-show="training.show" class="training-items">
                  <div
                    v-for="(item, subIndex) in training.trainings"
                    :key="`item-${index}-${subIndex}`"
                    class="training-item"
                  >
                    <h4
                      @click="toggleItem(index, subIndex)"
                      class="training-item-header"
                      :class="{ 'training-item-header-expanded': item.show }"
                    >
                      📂 {{ item.name }} ({{
                        item.videos ? item.videos.length : item.isDirectFile ? 1 : 0
                      }}
                      {{ $t('video_component_dossier.videos') }})
                    </h4>
                    <ul v-show="item.show" class="video-list">
                      <li v-if="item.isDirectFile" @click="launchFile(item)" class="video-item">
                        🎥 {{ item.name }}
                      </li>
                      <li
                        v-else
                        v-for="(video, videoIndex) in item.videos || []"
                        :key="`video-${index}-${subIndex}-${videoIndex}`"
                        @click="launchFile(video)"
                        class="video-item"
                      >
                        🎥 {{ video.name }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="section-card">
            <input
              v-model="defaultPath"
              type="text"
              :placeholder="$t('video_component_dossier.enter_base_path')"
              class="form-input"
            />
            <div class="btn-group btn-group-vertical">
              <button @click="selectTrainingDirectory" class="btn btn-primary">
                {{ $t('video_component_dossier.select_training_directory') }}
              </button>
              <button @click="selectSingleVideo" class="btn btn-primary">
                {{ $t('video_component_dossier.select_single_video') }}
              </button>
            </div>

            <!-- Auto-reload status -->
            <div v-if="showAutoReloadMessage" class="auto-reload-message">
              <p>
                📁 {{ $t('video_component_dossier.found_previous_directory') }}
                <strong>{{ directoryInfo.name }}</strong>
              </p>
              <p>{{ $t('video_component_dossier.need_directory_permission') }}</p>
              <div class="btn-group gap-small">
                <button @click="reloadDirectory" class="btn btn-success btn-small">
                  📂 {{ $t('video_component_dossier.reload_directory') }}
                </button>
                <button @click="hideAutoReloadMessage" class="btn btn-secondary btn-small">
                  {{ $t('video_component_dossier.dismiss') }}
                </button>
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
        <VideoReaderComponent
          :video-source="currentVideoSource"
          @video-loaded="handleVideoLoaded"
          @video-error="handleVideoError"
          ref="videoPlayer"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import '../assets/css/global.css'
  import { useVideoStore } from '@/stores/videoStore'
  import { serviceManager } from '@/services'
  import VideoReaderComponent from './VideoReaderComponent.vue'

  export default {
    name: 'VideoComponentNewRefactored',

    components: {
      VideoReaderComponent,
    },

    setup() {
      const videoStore = useVideoStore()
      const videoService = serviceManager.video

      return {
        videoStore,
        videoService,
      }
    },

    data() {
      return {
        errorMessage: '',
        showAutoReloadMessage: false,
        currentVideoSource: null,
      }
    },

    computed: {
      trainingList() {
        return this.videoStore.niouTrainingList
      },

      defaultPath: {
        get() {
          return this.videoStore.defaultPath
        },
        set(value) {
          this.videoStore.defaultPath = value
        },
      },

      directoryInfo() {
        return this.videoStore.directoryInfo
      },
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
                // Video est juste une liste... erreur nommage ici
                const saveResult = await window.electronAPI.saveDirectoryTree(selectedPath, videos)
                if (saveResult.success) {
                  console.log('Directory tree saved to:', saveResult.filePath)
                }

                const trainingStructure = this.convertVideosToTrainingStructure(
                  videos,
                  selectedPath
                )

                this.videoStore.rootDirectoryPath = selectedPath
                this.videoStore.directoryStructure.name = selectedPath.split(/[\\\/]/).pop()
                this.videoStore.directoryStructure.path = selectedPath
                this.videoStore.directoryStructure.lastScanned = new Date().toISOString()

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

        videos.forEach((video) => {
          const relativePath = video.path.replace(basePath, '').replace(/^[\\\/]/, '')
          const pathParts = relativePath.split(/[\\\/]/)

          if (pathParts.length >= 2) {
            const trainingType = pathParts[0]
            const trainingName = pathParts[1]

            if (!trainingMap.has(trainingType)) {
              trainingMap.set(trainingType, {
                trainingType,
                trainings: new Map(),
                show: false,
              })
            }

            const training = trainingMap.get(trainingType)
            if (!training.trainings.has(trainingName)) {
              training.trainings.set(trainingName, {
                name: trainingName,
                videos: [],
                show: false,
              })
            }

            training.trainings.get(trainingName).videos.push({
              name: video.name,
              absolutePath: video.path,
              path: relativePath,
            })
          }
        })

        const result = Array.from(trainingMap.values())
          .map((training) => ({
            ...training,
            trainings: Array.from(training.trainings.values())
              .map((trainingItem) => ({
                ...trainingItem,
                videos: trainingItem.videos.sort((a, b) => 
                  a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
                ),
              }))
              .sort((a, b) => 
                a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
              ),
          }))
          .sort((a, b) => 
            a.trainingType.localeCompare(b.trainingType, undefined, { numeric: true, sensitivity: 'base' })
          )

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
                isNative: true,
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
        const trainingList = this.videoStore.niouTrainingList
        trainingList.forEach((training, i) => {
          if (i !== index) {
            training.show = false
          }
        })
        this.videoStore.toggleTrainingVisibility(index)
      },

      toggleItem(trainingIndex, itemIndex) {
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
        this.currentVideoSource = videoData
      },

      handleVideoLoaded(event) {
        this.errorMessage = ''
      },

      handleVideoError(errorMsg) {
        this.errorMessage = errorMsg
      },

      hideAutoReloadMessage() {
        this.showAutoReloadMessage = false
      },

      async reloadDirectory() {
        try {
          this.showAutoReloadMessage = false

          if (
            this.videoStore.rootDirectoryPath &&
            window.electronAPI &&
            window.electronAPI.scanVideoDirectory
          ) {
            const scanResult = await window.electronAPI.scanVideoDirectory(
              this.videoStore.rootDirectoryPath
            )
            if (scanResult.success && scanResult.videos.length > 0) {
              const trainingStructure = this.convertVideosToTrainingStructure(
                scanResult.videos,
                this.videoStore.rootDirectoryPath
              )

              this.videoStore.setNiouTrainingList(trainingStructure)

              this.errorMessage = ''
              return
            }
          }

          this.errorMessage =
            'Could not reload directory automatically. Please select the directory again.'
        } catch (error) {
          this.errorMessage = `Failed to reload directory: ${error.message}`
        }
      },
    },

    async mounted() {
      this.videoStore.loadFromStorage()

      if (window.electronAPI && window.electronAPI.loadDirectoryTree) {
        try {
          const result = await window.electronAPI.loadDirectoryTree()

          if (result.success) {
            this.videoStore.rootDirectoryPath = result.data.directoryPath
            this.videoStore.directoryStructure.name = result.data.directoryPath
              .split(/[\\\/]/)
              .pop()
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

      const handleLaunchVideo = (event) => {
        const videoData = event.detail
        if (videoData) {
          this.launchFile(videoData)
        }
      }

      document.addEventListener('launch-video', handleLaunchVideo)

      this._cleanupVideoLauncher = () => {
        document.removeEventListener('launch-video', handleLaunchVideo)
      }
    },

    beforeUnmount() {
      if (this._cleanupVideoLauncher) {
        this._cleanupVideoLauncher()
      }
    },
  }
</script>

<style scoped>
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