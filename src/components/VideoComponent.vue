<template>
  <div class="video-container">
    <div class="two-columns">
      <div class="column-left">
        <!-- Training Section -->
        <div class="section-card">
          <ul class="list-unstyled list-horizontal">
            <li
              v-for="training in trainingComputed"
              @click="selectTrain(training)"
              :class="backColor(training)"
              :key="training.id"
              class="list-item"
            >
              <p>{{ training.name }}</p>
            </li>
          </ul>

          <input
            v-model="currentName"
            type="text"
            :placeholder="$t('video_component.placeholder_training_name')"
            class="form-input"
          />

          <div class="btn-group">
            <button @click="addTraining()" class="btn btn-success">
              {{ $t('video_component.add') }}
            </button>
            <button @click="removeTraining()" class="btn btn-danger-alt">
              {{ $t('video_component.remove') }}
            </button>
          </div>
        </div>

        <!-- Video List Section -->
        <div class="section-card">
          <ol class="list-unstyled list-scrollable">
            <li
              v-for="item in videoPathComputed"
              :key="item"
              @click="launchFile(item)"
              class="list-item-with-action"
            >
              {{ item.split('\\')[item.split('\\').length - 1] }}
              <button
                class="btn btn-danger-alt btn-icon-round btn-small"
                @click="remove(item)"
              ></button>
            </li>
          </ol>

          <div class="btn-group btn-group-vertical">
            <button class="btn btn-primary" @click="selectVideoFileNative">
              {{ $t('video_component.select_video_file') }}
            </button>
            <label class="btn btn-primary" for="uploadVideo">{{
              $t('video_component.upload_file_web')
            }}</label>
            <input id="uploadVideo" type="file" @change="loadVideo" class="hidden" />
          </div>
        </div>
      </div>

      <div class="column-right">
        <video
          @timeupdate="handleTimeUpdate"
          ref="video"
          controls
          class="video-player video-player-full-height"
        ></video>

        <div class="btn-group btn-group-center">
          <button class="btn btn-success" @click="play(speed)">
            {{ $t('video_component.play') }}
          </button>
          <button class="btn btn-warning" @click="pause">{{ $t('video_component.pause') }}</button>
          <button class="btn btn-danger" @click="stop">{{ $t('video_component.stop') }}</button>
        </div>

        <div class="slider-section">
          <div class="slider-grid">
            <div class="slider-container slider-container-vertical">
              <label for="startSlider" class="slider-label">{{
                $t('video_component.video_start')
              }}</label>
              <input
                id="startSlider"
                type="range"
                v-model="startTime"
                :max="endTime"
                min="0"
                step="1"
                class="range-input"
              />
              <p class="slider-value">{{ formatSeconds(startTime) }}</p>
            </div>

            <div class="slider-container slider-container-vertical">
              <label for="endSlider" class="slider-label">{{
                $t('video_component.video_end')
              }}</label>
              <input
                id="endSlider"
                type="range"
                v-model="endTime"
                :min="startTime"
                :max="videoDuration"
                step="1"
                class="range-input"
              />
              <p class="slider-value">{{ formatSeconds(endTime) }}</p>
            </div>
          </div>
        </div>

        <div class="checkbox-container">
          <label for="loopCheckbox" class="slider-label">{{ $t('video_component.loop') }}</label>
          <input id="loopCheckbox" type="checkbox" v-model="loop" class="checkbox-input" />
        </div>

        <div class="text-center">
          <h3 class="mb-medium slider-label">{{ $t('video_component.playing_rate') }}</h3>
          <div class="slider-container">
            <input
              type="range"
              min="10"
              max="300"
              v-model="speed"
              class="range-input range-input-thick"
            />
            <p class="slider-value" id="rangeValueVideo">{{ speed }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import '../assets/css/global.css'
  import { useVideoStore } from '../stores/videoStore.js'

  export default {
    setup() {
      const videoStore = useVideoStore()
      return {
        videoStore,
      }
    },

    data() {
      return {
        niouTrainingList: [],
        currentName: '',
        currentTime: 0,
        seekValue: 0,
        chunkSize: 10 * 1024 * 1024, // 10 MB
        file: null,
        sourceBuffer: null,
        mediaSource: null,
        chunks: [],
        currentChunkIndex: 0,
        isPlaying: false,
        playbackRate: 1.0,
      }
    },
    watch: {
      speed(newValue) {
        this.setSpeed(newValue)
      },
    },
    computed: {
      // Reference videoStore getters
      trainingComputed() {
        return this.videoStore.videoList
      },

      videoPathComputed() {
        // Get videos for the currently selected training
        const currentTraining = this.videoStore.videoList.find(
          (t) => t.id === this.videoStore.selectedVideo
        )
        return currentTraining?.list || []
      },

      selectedTraining() {
        return this.videoStore.selectedVideo
      },

      startTime: {
        get() {
          return this.videoStore.startTime
        },
        set(value) {
          this.videoStore.startTime = value
        },
      },

      endTime: {
        get() {
          return this.videoStore.endTime
        },
        set(value) {
          this.videoStore.endTime = value
        },
      },

      videoDuration: {
        get() {
          return this.videoStore.videoLength
        },
        set(value) {
          this.videoStore.setVideoLength(value)
        },
      },

      loop: {
        get() {
          return this.videoStore.loop
        },
        set(value) {
          this.videoStore.loop = value
        },
      },

      speed: {
        get() {
          return this.videoStore.speed
        },
        set(value) {
          this.videoStore.speed = value
        },
      },

      defaultPath() {
        return this.videoStore.defaultPath
      },
    },
    methods: {
      async createTrainingList() {
        this.niouTrainingList = []
        try {
          const directoryHandle = await window.showDirectoryPicker()
          this.directoryName = this.defaultPath + directoryHandle.name

          const trainingList = await this.readDirectoryRecursive(directoryHandle)

          this.niouTrainingList = trainingList
          console.log(trainingList)
        } catch (error) {
          console.error('Error reading directory:', error)
        }
      },

      async readDirectoryRecursive(directoryHandle) {
        const trainingList = []
        for await (const entry of directoryHandle.values()) {
          if (entry.kind === 'directory') {
            const trainingType = entry.name
            this.trainingdir = this.directoryName + '/' + trainingType
            const trainings = await this.readSubDirectory(entry)
            trainingList.push({ trainingType, trainings })
          }
        }
        return trainingList
      },

      toggleTraining(index) {
        this.niouTrainingList[index].show = !this.niouTrainingList[index].show
      },

      toggleItem(trainingIndex, itemIndex) {
        this.niouTrainingList[trainingIndex].trainings[itemIndex].show =
          !this.niouTrainingList[trainingIndex].trainings[itemIndex].show
      },

      async readSubDirectory(directoryHandle) {
        const trainings = []
        for await (const entry of directoryHandle.values()) {
          if (entry.kind === 'directory') {
            const name = entry.name
            let path = this.trainingdir + '/' + name
            const videos = await this.readFiles(path, entry)
            trainings.push({ name, videos, show: false })
          }
          if (entry.kind === 'file') {
            const file = entry.name
            let url = this.trainingdir + '/' + file
            trainings.push({ name: entry.name, url: url, show: false })
          }
        }
        return trainings
      },

      async readFiles(path, directoryHandle) {
        let videos = []
        for await (const entry of directoryHandle.values()) {
          if (entry.kind === 'file') {
            if (entry.name.includes('.mp4')) {
              videos.push({ name: entry.name, url: path + '/' + entry.name, show: false })
            }
          } else if (entry.kind === 'directory') {
            const name = entry.name
            const newPath = path + '/' + name
            const subVideos = await this.readFiles(newPath, entry)
            videos = videos.concat(subVideos)
          }
        }
        return videos
      },

      formatSeconds(seconds) {
        const dateObj = new Date(seconds * 1000)
        const minutes = dateObj.getUTCMinutes()
        const secondsFormatted = dateObj.getUTCSeconds().toString().padStart(2, '0')
        const milliseconds = Math.floor(dateObj.getUTCMilliseconds() / 10)
          .toString()
          .padStart(2, '0')
        return `${minutes}:${secondsFormatted}.${milliseconds}`
      },

      handleTimeUpdate() {
        const currentTime = this.$refs.video.currentTime

        if (currentTime >= this.endTime && this.loop) {
          this.$refs.video.currentTime = this.startTime
        } else if (currentTime >= this.endTime && !this.loop) {
          this.$refs.video.currentTime = this.startTime
          this.$refs.video.pause()
        } else if (currentTime < this.startTime) {
          this.$refs.video.currentTime = this.startTime
        }
      },

      backColor(item) {
        if (item.id === this.selectedTraining) {
          return 'list-item-selected'
        } else return ''
      },

      selectTrain(training) {
        this.videoStore.selectVideoTraining(training)
      },

      addTraining() {
        this.videoStore.addVideoTraining(this.currentName)
        this.currentName = '' // Clear input after adding
      },

      removeTraining() {
        if (this.videoStore.videoList.length > 0) {
          this.videoStore.removeVideoTraining(this.selectedTraining)
        }
      },

      remove(item) {
        // Remove from current training's list
        const currentTraining = this.videoStore.videoList.find(
          (t) => t.id === this.selectedTraining
        )
        if (currentTraining) {
          const index = currentTraining.list.indexOf(item)
          if (index > -1) {
            currentTraining.list.splice(index, 1)
            this.videoStore.saveVideoTrainingsToStorage()
          }
        }
      },

      async launchFile(file) {
        file = file.replace(/#/g, '%23')
        const filePath = file
        this.speed = 100

        const videoURL = `file://${filePath}`
        this.$refs.video.src = videoURL
        this.$refs.video.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(videoURL)
          this.endTime = this.$refs.video.duration
        })
      },

      async loadVideo(event) {
        const file = event.target.files[0]
        if (!file) return

        let filePath
        if (file.path) {
          filePath = file.path.replace(/#/g, '%23')
        } else {
          filePath = URL.createObjectURL(file)
        }

        // Add to current training's list
        const currentTraining = this.videoStore.videoList.find(
          (t) => t.id === this.selectedTraining
        )
        if (currentTraining) {
          currentTraining.list.push(filePath)
          this.videoStore.saveVideoTrainingsToStorage()
        }

        this.speed = 100

        const videoURL = filePath.startsWith('blob:') ? filePath : `file://${filePath}`
        this.$refs.video.src = videoURL
        this.$refs.video.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(videoURL)
          this.endTime = this.$refs.video.duration
        })
      },

      async selectVideoFileNative() {
        try {
          if (!window.electronAPI?.selectVideoFile) {
            throw new Error('Native video file selection not available')
          }

          const filePath = await window.electronAPI.selectVideoFile()
          if (filePath) {
            const sanitizedPath = filePath.replace(/#/g, '%23')

            // Add to current training's list
            const currentTraining = this.videoStore.videoList.find(
              (t) => t.id === this.selectedTraining
            )
            if (currentTraining) {
              currentTraining.list.push(sanitizedPath)
              this.videoStore.saveVideoTrainingsToStorage()
            }

            this.speed = 100

            const videoURL = `file://${sanitizedPath}`
            this.$refs.video.src = videoURL
            this.$refs.video.addEventListener('loadedmetadata', () => {
              this.endTime = this.$refs.video.duration
            })
          }
        } catch (error) {
          console.error('Error selecting video file:', error)
          alert('Native video selection failed. Please use the web file input instead.')
        }
      },

      play(playbackRate = 100) {
        this.$refs.video.playbackRate = playbackRate / 100
        this.$refs.video.play()
      },

      pause() {
        this.$refs.video.pause()
      },

      stop() {
        const { video } = this.$refs
        video.pause()
        video.currentTime = 0
      },

      setSpeed(speed) {
        this.$refs.video.playbackRate = speed / 100
      },
    },

    mounted() {
      this.$refs.video.addEventListener('loadedmetadata', () => {
        this.videoDuration = this.$refs.video.duration
      })

      // Load data from userStore via videoStore
      this.videoStore.loadFromStorage()
    },
  }
</script>

<style scoped>
  /* Component-specific styles only */
  #rangeValueVideo {
    color: var(--warning-gradient);
    background: rgba(255, 152, 0, 0.1);
    border: 2px solid rgba(255, 152, 0, 0.2);
    font-size: 1.1rem;
    border-radius: 20px;
  }
</style>
