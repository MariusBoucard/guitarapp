<template>
  <div class="video-player-container">
    <h1 class="section-title">{{ currentVideoName }}</h1>

    <!-- Video Player -->
    <video
      class="video-player"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleVideoLoaded"
      @ended="handleVideoEnded"
      ref="videoPlayer"
      controls
    ></video>

    <!-- Video Controls -->
    <div class="btn-group btn-group-center">
      <button class="btn btn-success" @click="playVideo">
        {{ $t('video_component_dossier.play') }}
      </button>
      <button class="btn btn-warning" @click="pauseVideo">
        {{ $t('video_component_dossier.pause') }}
      </button>
      <button class="btn btn-danger" @click="stopVideo">
        {{ $t('video_component_dossier.stop') }}
      </button>
    </div>

    <!-- Speed Control -->
    <div class="text-center">
      <h3 class="mb-medium slider-label">{{ $t('video_component_dossier.playing_rate') }}</h3>
      <div class="slider-container">
        <input
          type="range"
          min="10"
          max="300"
          v-model="speed"
          @input="updateSpeed"
          class="range-input range-input-thick"
        />
        <p class="slider-value">{{ speed }}%</p>
      </div>
    </div>

    <!-- Time Controls -->
    <div class="slider-section">
      <div class="slider-grid">
        <div class="slider-container slider-container-vertical">
          <label for="startSlider" class="slider-label">
            {{ $t('video_component_dossier.video_start') }}
          </label>
          <input
            id="startSlider"
            type="range"
            v-model="startTime"
            :max="endTime"
            min="0"
            step="1"
            @change="updatePlaybackSettings"
            class="range-input"
          />
          <p class="slider-value">{{ formatTime(startTime) }}</p>
        </div>

        <div class="slider-container slider-container-vertical">
          <label for="endSlider" class="slider-label">
            {{ $t('video_component_dossier.video_end') }}
          </label>
          <input
            id="endSlider"
            type="range"
            v-model="endTime"
            :min="startTime"
            :max="videoDuration"
            step="1"
            @change="updatePlaybackSettings"
            class="range-input"
          />
          <p class="slider-value">{{ formatTime(endTime) }}</p>
        </div>
      </div>
    </div>

    <!-- Loop Control -->
    <div class="loop-settings-container">
      <div class="checkbox-group">
        <label for="enableAutoLoop" class="checkbox-label">
          {{ $t('video_component_dossier.auto_loop_short_videos') }}
        </label>
        <input
          id="enableAutoLoop"
          type="checkbox"
          v-model="enableAutoLoop"
          @change="updatePlaybackSettings"
          class="checkbox-input"
        />
      </div>

      <div class="checkbox-group">
        <label for="useAutomationSections" class="checkbox-label">
          {{ $t('video_component_dossier.use_automation_sections') }}
        </label>
        <input
          id="useAutomationSections"
          type="checkbox"
          v-model="useAutomationSections"
          @change="handleAutomationModeChange"
          class="checkbox-input"
        />
      </div>

      <div v-if="enableAutoLoop && !useAutomationSections" class="auto-loop-threshold">
        <label for="autoLoopThreshold" class="threshold-label">
          {{ $t('video_component_dossier.auto_loop_if_shorter_than') }}
        </label>
        <div class="threshold-controls">
          <input
            id="autoLoopThreshold"
            type="number"
            v-model="autoLoopThreshold"
            min="1"
            max="300"
            class="threshold-input"
            @change="updatePlaybackSettings"
          />
          <span class="threshold-unit">{{ $t('video_component_dossier.seconds') }}</span>
        </div>
      </div>

      <div class="checkbox-container">
        <label for="loopCheckbox" class="checkbox-label">
          {{ $t('video_component_dossier.manual_loop') }}
        </label>
        <input
          id="loopCheckbox"
          type="checkbox"
          v-model="loop"
          @change="updatePlaybackSettings"
          class="checkbox-input"
          :disabled="isAutoLoopActive"
        />
      </div>

      <div v-if="loop || isAutoLoopActive" class="loop-count-container">
        <label for="loopCount" class="loop-count-label">
          {{ $t('video_component_dossier.number_of_loops') }}
        </label>
        <div class="loop-count-controls">
          <input
            id="loopCount"
            type="number"
            v-model="loopCount"
            min="1"
            max="100"
            class="loop-count-input"
            @change="updatePlaybackSettings"
          />
          <span class="loop-count-info">
            {{ loopsCompleted }}/{{ loopCount }} {{ $t('video_component_dossier.loops') }}
            <span v-if="isAutoLoopActive" class="auto-loop-badge">{{
              $t('video_component_dossier.auto')
            }}</span>
          </span>
        </div>
      </div>
    </div>

    <AutomationLineComponent
      @automation-updated="handleAutomationUpdate"
      ref="automationLine"
      class="automation-section"
    />
  </div>
</template>

<script>
import '../assets/css/global.css'
import { useVideoStore } from '@/stores/videoStore'
import { serviceManager } from '@/services'
import AutomationLineComponent from './AutomationLineComponent.vue'

export default {
  name: 'VideoPlayerComponent',

  components: {
    AutomationLineComponent,
  },

  props: {
    videoSource: {
      type: Object,
      default: null,
    },
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
      loopsCompleted: 0,
      loopCount: 3,
      enableAutoLoop: true,
      useAutomationSections: false,
      autoLoopThreshold: 30,
      lastVideoLength: 0,
      automationSections: [],

      manualSpeed: 100,
      manualLoopCount: 3,
    }
  },

  computed: {
    currentVideoName() {
      return this.videoStore.currentVideoName
    },

    startTime: {
      get() {
        return this.videoStore.startTime
      },
      set(value) {
        this.videoStore.startTime = Number(value)
      },
    },

    endTime: {
      get() {
        return this.videoStore.endTime
      },
      set(value) {
        this.videoStore.endTime = Number(value)
      },
    },

    speed: {
      get() {
        return this.videoStore.speed
      },
      set(value) {
        this.videoStore.speed = Number(value)
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

    videoDuration() {
      return this.videoStore.videoLength
    },

    isAutoLoopActive() {
      return (
        this.enableAutoLoop &&
        this.lastVideoLength > 0 &&
        this.lastVideoLength <= this.autoLoopThreshold
      )
    },

    effectiveEndTime() {
      return this.endTime || this.videoDuration
    },
  },

  watch: {
    speed(newSpeed) {
      this.updateSpeed()
    },

    videoSource: {
      handler(newSource) {
        if (newSource) {
          this.loadVideo(newSource)
        }
      },
      immediate: true,
    },
  },

  methods: {
    async loadVideo(videoData) {
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
          filePath = `${this.videoStore.rootDirectoryPath}/${videoData.path}`.replace(
            /[\\\/]+/g,
            '/'
          )
        } else {
          throw new Error('No valid file path available')
        }

        await this.videoService.setVideoSource(videoElement, filePath)

        await new Promise((resolve, reject) => {
          const onLoadedMetadata = () => {
            videoElement.removeEventListener('loadedmetadata', onLoadedMetadata)
            videoElement.removeEventListener('error', onError)
            resolve()
          }

          const onError = (e) => {
            videoElement.removeEventListener('loadedmetadata', onLoadedMetadata)
            videoElement.removeEventListener('error', onError)
            reject(new Error('Failed to load video metadata'))
          }

          videoElement.addEventListener('loadedmetadata', onLoadedMetadata)
          videoElement.addEventListener('error', onError)

          if (videoElement.readyState >= 1) {
            onLoadedMetadata()
          }
        })

        this.videoStore.currentVideoName = videoData.name || 'Unknown Video'
        this.videoStore.speed = 100
        this.$emit('video-loaded', { success: true })
      } catch (error) {
        this.$emit('video-error', error.message)
      }
    },

    seekTo(timeInSeconds) {
      const videoElement = this.$refs.videoPlayer
      if (!videoElement) return

      if (videoElement.readyState >= 1) {
        videoElement.currentTime = timeInSeconds
      }
    },

    handleVideoLoaded() {
      const video = this.$refs.videoPlayer
      if (video) {
        const duration = video.duration
        this.videoStore.setVideoLength(duration)
        this.lastVideoLength = duration

        this.loopsCompleted = 0

        if (this.enableAutoLoop && duration <= this.autoLoopThreshold) {
          this.loop = true
        }
      }
    },

    handleTimeUpdate() {
      const video = this.$refs.videoPlayer
      if (!video) return

      const currentTime = video.currentTime
      const effectiveEnd = this.effectiveEndTime
      let shouldLoop = false
      let maxLoops = this.loopCount

      if (this.useAutomationSections && this.automationSections.length > 0) {
        const totalReps = this.automationSections.reduce((sum, s) => sum + s.NBReps, 0)

        if (this.loopsCompleted < totalReps) {
          let completedReps = 0
          let currentSectionIndex = -1

          for (let i = 0; i < this.automationSections.length; i++) {
            const nextRepCount = completedReps + this.automationSections[i].NBReps
            if (this.loopsCompleted < nextRepCount) {
              currentSectionIndex = i
              break
            }
            completedReps = nextRepCount
          }

          if (currentSectionIndex >= 0) {
            const section = this.automationSections[currentSectionIndex]
            shouldLoop = this.loop
            maxLoops = totalReps

            this.speed = section.PlaybackRate
            video.playbackRate = section.PlaybackRate / 100
          }
        } else {
          shouldLoop = false
          maxLoops = totalReps
          if (video.paused) {
            video.currentTime = effectiveEnd
          }
        }
      } else {
        shouldLoop = this.loop && this.loopsCompleted < this.loopCount
        maxLoops = this.loopCount
      }

      if (currentTime >= effectiveEnd - 0.3) {
        if (shouldLoop) {
          this.loopsCompleted++

          if (this.loopsCompleted >= maxLoops) {
            this.pauseVideo();
            video.currentTime = effectiveEnd
            
            return
          }

          if (this.useAutomationSections && this.automationSections.length > 0) {
            let completedReps = 0
            let nextSectionIndex = 0

            for (let i = 0; i < this.automationSections.length; i++) {
              if (completedReps + this.automationSections[i].NBReps > this.loopsCompleted) {
                nextSectionIndex = i
                break
              }
              completedReps += this.automationSections[i].NBReps
            }

            if (nextSectionIndex < this.automationSections.length) {
              const nextSection = this.automationSections[nextSectionIndex]
              this.speed = nextSection.PlaybackRate
              this.updateSpeed()
            }
          }

          video.currentTime = this.startTime || 0
          if (video.paused) {
            video.play().catch((e) => console.error('Failed to resume playback:', e))
          }
        }
      }

      this.videoService.handleTimeUpdate(
        video,
        currentTime,
        this.startTime || 0,
        effectiveEnd,
        shouldLoop
      )
    },

    handleVideoEnded(event) {
      const video = this.$refs.videoPlayer
      if (!video) return

      event.preventDefault()

      const shouldLoop = this.loop && (!this.loopCount || this.loopsCompleted < this.loopCount)
      if (shouldLoop) {
        video.currentTime = this.startTime || 0
        this.loopsCompleted++

        if (this.loopsCompleted < this.loopCount) {
          video.play().catch((e) => console.error('Failed to resume playback:', e))
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
        this.$emit('video-error', `Playback failed: ${error.message}`)
      }
    },

    pauseVideo() {
      const video = this.$refs.videoPlayer
      if (video) {
        this.videoService.pauseVideo(video)
        this.loopsCompleted = 0
      }
    },

    stopVideo() {
      const video = this.$refs.videoPlayer
      if (video) {
        this.videoService.stopVideo(video, this.startTime)
        this.loopsCompleted = 0
      }
    },

    handleAutomationUpdate(sections) {
      this.automationSections = sections

      if (this.useAutomationSections && sections.length > 0) {
        this.applyAutomationSection(sections[0])
      }
    },

    getCurrentAutomationSection() {
      return this.automationSections?.[0] || null
    },

    applyAutomationSection(section) {
      if (!section) return

      this.loop = true
      this.loopCount = section.NBReps
      this.loopsCompleted = 0
      this.speed = section.PlaybackRate
      this.updateSpeed()
    },

    handleAutomationModeChange() {
      const video = this.$refs.videoPlayer
      this.loopsCompleted = 0

      if (this.useAutomationSections) {
        this.manualSpeed = this.speed
        this.manualLoopCount = this.loopCount

        if (this.automationSections.length > 0) {
          this.applyAutomationSection(this.automationSections[0])
        }
      } else {
        const currentTime = video ? video.currentTime : 0

        this.speed = this.manualSpeed
        this.loopCount = this.manualLoopCount
        this.loop = false
        this.startTime = 0
        this.endTime = this.videoDuration

        this.updateSpeed()
        if (video) {
          video.currentTime = currentTime
        }
      }

      if (this.$refs.automationLine) {
        this.$refs.automationLine.drawAutomationLine()
      }
    },

    updateSpeed() {
      const video = this.$refs.videoPlayer
      if (video) {
        this.videoService.setPlaybackRate(video, this.speed)
      }
    },

    updatePlaybackSettings() {
      let shouldloop = this.loop
      if (this.enableAutoLoop && this.endTime - this.startTime <= this.autoLoopThreshold) {
        shouldloop = true
      }

      this.videoStore.setVideoPlaybackSettings({
        startTime: this.startTime,
        endTime: this.endTime,
        speed: this.speed,
        loop: shouldloop,
      })
    },

    formatTime(seconds) {
      return this.videoService.formatTime(seconds)
    },
  },

  mounted() {
    if (this.videoSource) {
      this.loadVideo(this.videoSource)
    }
  },
}
</script>

<style scoped>
.video-player-container {
  width: 100%;
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

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.checkbox-group:last-child {
  margin-bottom: 0;
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