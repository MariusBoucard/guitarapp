<template>
  <div class="card">
    <!-- Training List -->
    <div class="training-section">
      <ul class="horizontal-list">
        <li
          v-for="training in trainingStore.trainingList"
          @click="selectTraining(training)"
          :class="getTrainingClass(training)"
          :key="training.id"
        >
          <p>{{ training.name }}</p>
        </li>
      </ul>

      <input
        v-model="trainingStore.currentTrainingName"
        type="text"
        :placeholder="$t('audioplayer_component.training_name_placeholder')"
      />

      <div class="training-controls">
        <button @click="addTraining()">{{ $t('audioplayer_component.add') }}</button>
        <button @click="removeTraining()">{{ $t('audioplayer_component.remove') }}</button>
      </div>
    </div>

    <!-- Audio Files List -->
    <div class="audio-files-section section-card">
      <ol class="audio-files-list">
        <li
          v-for="item in currentAudioFiles"
          :key="item"
          @click="launchFile(item)"
          class="audio-file-item"
        >
          {{ audioService.extractFilename(item) }}
          <button
            class="button-cross"
            @click.stop="removeAudioFile(item)"
            :title="$t('audioplayer_component.remove_file')"
          ></button>
        </li>
      </ol>

      <!-- File Selection -->
      <div class="file-selection">
        <div class="button-wrap">
          <button class="btn btn-primary" @click="selectAudioFileNative">
            {{ $t('audioplayer_component.select_audio_file') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Current Song Info -->
    <p class="current-song">
      {{ $t('audioplayer_component.current_song') }}: {{ songPlayerStore.currentSong }}
    </p>

    <!-- Audio Player -->
    <audio
      ref="audioPlayer"
      controls
      style="width: 100%"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onAudioLoaded"
    >
      {{ $t('audioplayer_component.unsupported_browser') }}
    </audio>

    <!-- Playback Controls -->
    <div class="playback-controls">
      <button class="btn btn-success" @click="play">{{ $t('audioplayer_component.play') }}</button>
      <button class="btn btn-warning" @click="pause">
        {{ $t('audioplayer_component.pause') }}
      </button>
      <button class="btn btn-danger" @click="stop">{{ $t('audioplayer_component.stop') }}</button>
    </div>

    <!-- Speed Control -->
    <div class="speed-control section-card">
      <h3 class="slider-label">{{ $t('audioplayer_component.playback_rate') }}</h3>
      <div class="slider">
        <input
          type="range"
          min="10"
          max="300"
          v-model="songPlayerStore.speed"
          @input="onSpeedChange"
        />
        <p>{{ songPlayerStore.speed }}%</p>
      </div>
    </div>

    <div class="time-controls section-card">
      <div class="slider-container">
        <label
          >{{ $t('audioplayer_component.start_time') }}:
          {{ audioService.formatTime(songPlayerStore.startTime) }}</label
        >
        <input
          type="range"
          v-model="songPlayerStore.startTime"
          :max="songPlayerStore.endTime"
          min="0"
          step="0.1"
        />
      </div>

      <div class="slider-container">
        <label
          >{{ $t('audioplayer_component.end_time') }}:
          {{ audioService.formatTime(songPlayerStore.endTime) }}</label
        >
        <input
          type="range"
          v-model="songPlayerStore.endTime"
          :min="songPlayerStore.startTime"
          :max="songPlayerStore.songLength"
          step="0.1"
        />
      </div>

      <div class="checkbox-container">
        <label>
          <input type="checkbox" v-model="songPlayerStore.loop" />
          {{ $t('audioplayer_component.loop') }}
        </label>
      </div>
    </div>
  </div>
</template>

<script>
  import { useTrainingStore } from '../stores/trainingStore.js'
  import { useSongPlayerStore } from '../stores/songPlayerStore.js'
  import { serviceManager } from '../services/index.js'

  export default {
    name: 'PlaySoundComponent',

    setup() {
      const trainingStore = useTrainingStore()
      const songPlayerStore = useSongPlayerStore()
      const audioService = serviceManager.audio
      const fileService = serviceManager.file
      const storageService = serviceManager.storage

      return {
        trainingStore,
        songPlayerStore,
        audioService,
        fileService,
        storageService,
      }
    },

    computed: {
      // Get audio files for the currently selected training
      currentAudioFiles() {
        if (!this.trainingStore.currentTrainingData) {
          return []
        }
        return this.trainingStore.currentTrainingAudioFiles
      },
    },

    mounted() {
      this.trainingStore.loadFromStorage()
      this.songPlayerStore.loadFromStorage()

      this.audioService.initializeAudioContext()
    },

    methods: {
      selectTraining(training) {
        this.trainingStore.selectTraining(training)
      },

      addTraining() {
        this.trainingStore.addTraining()
      },

      removeTraining() {
        this.trainingStore.removeTraining()
      },

      getTrainingClass(training) {
        return training.id === this.trainingStore.selectedTraining
          ? 'selectedTrain'
          : 'unselectedTrain'
      },

      async selectAudioFileNative() {
        try {
          if (!window.electronAPI?.selectAudioFile) {
            throw new Error('Native file selection not available')
          }

          const filePath = await window.electronAPI.selectAudioFile()
          if (filePath) {
            await this.loadAudioFile({
              path: filePath,
              name: this.audioService.extractFilename(filePath),
              isNative: true,
            })
          }
        } catch (error) {
          console.error('Error selecting audio file:', error)
        }
      },

      async onFileChange(event) {},

      async loadAudioFile(fileData) {
        try {
          // Strange that we put into a training store although we are in song player? Hmm.
          this.songPlayerStore.addAudioFile(this.trainingStore, fileData.path, fileData.name)

          const audioData = await this.audioService.loadAudioFile(fileData.path)

          this.$refs.audioPlayer.src = audioData.src

          this.currentAudio = audioData.audio
        } catch (error) {
          console.error('Error loading audio file:', error)
        }
      },

      removeAudioFile(filePath) {
        this.songPlayerStore.removeAudioFile(this.trainingStore, filePath)
      },

      async launchFile(filePath) {
        try {
          const fileName = this.audioService.extractFilename(filePath)
          this.songPlayerStore.currentSong = fileName

          const audioData = await this.audioService.loadAudioFile(filePath)
          this.$refs.audioPlayer.src = audioData.src
          this.currentAudio = audioData.audio
        } catch (error) {
          console.error('Error launching file:', error)
        }
      },

      async play() {
        try {
          await this.audioService.playAudio(
            this.$refs.audioPlayer,
            this.songPlayerStore.speed / 100
          )
        } catch (error) {
          console.error('Error playing audio:', error)
        }
      },

      pause() {
        this.audioService.pauseAudio(this.$refs.audioPlayer)
      },

      stop() {
        try {
          const audio = this.$refs.audioPlayer
          if (audio) {
            audio.pause()
            audio.currentTime = this.songPlayerStore.startTime || 0
          }
        } catch (error) {
          console.error('Error stopping audio:', error)
        }
      },

      onSpeedChange() {
        const audio = this.$refs.audioPlayer
        if (audio && this.songPlayerStore.speed) {
          audio.playbackRate = this.songPlayerStore.speed / 100
        }
      },

      onTimeUpdate() {
        const audio = this.$refs.audioPlayer
        if (!audio) return

        this.audioService.handleTimeUpdate(
          audio,
          audio.currentTime,
          this.songPlayerStore.startTime,
          this.songPlayerStore.endTime,
          this.songPlayerStore.loop
        )
      },

      onAudioLoaded() {
        const audio = this.$refs.audioPlayer
        if (audio && audio.duration) {
          this.songPlayerStore.setSongLength(audio.duration)

          // J'ai du casser ca...
          this.audioService.initWaveSurfer('waveform', audio.src)
        }
      },
    },

    beforeUnmount() {
      if (this.currentAudio) {
        this.audioService.cleanup()
      }
    },
  }
</script>

<style scoped>
  .playsound-component {
    width: 100%;
    margin: 10px auto;
    padding: 15px;
    background: var(--bg-main-gradient);
    border-radius: 16px;
    box-shadow: var(--shadow-main);
    font-family: var(--font-family);
    color: var(--text-dark);
  }

  .training-section {
    margin-bottom: 10px;
  }

  .horizontal-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    list-style: none;
    padding: 0;
    margin-bottom: 20px;
  }

  .horizontal-list li {
    cursor: pointer;
    border-radius: 10px;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    text-align: center;
    font-weight: 500;
  }

  .selectedTrain {
    background: var(--primary-gradient);
    color: white;
    border-color: var(--primary-color);
    box-shadow: var(--shadow-primary);
    transform: translateY(-2px);
  }

  .unselectedTrain {
    background: rgba(255, 255, 255, 0.9);
    color: var(--text-dark) !important;
    border-color: var(--border-light);
  }

  .unselectedTrain:hover {
    background: rgba(255, 255, 255, 1);
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .horizontal-list li p {
    margin: 0;
    font-size: 0.9rem;
  }

  .training-section input[type='text'] {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--border-light);
    border-radius: 25px;
    font-size: 0.9rem;
    margin-bottom: 15px;
    background: white;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .training-section input[type='text']:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 15px var(--bg-primary-border-light);
  }

  .training-controls {
    display: flex;
    gap: 10px;
  }

  .training-controls button {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .training-controls button:first-child {
    background: var(--success-gradient);
    color: white;
    box-shadow: var(--shadow-success);
  }

  .training-controls button:first-child:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-success-hover);
  }

  .training-controls button:last-child {
    background: var(--danger-alt-gradient);
    color: white;
    box-shadow: var(--shadow-danger-alt);
  }

  .training-controls button:last-child:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-danger-alt-hover);
  }

  .audio-files-section {
    margin-bottom: 30px;
  }

  .audio-files-list {
    max-height: 200px;
    overflow-y: auto;
    border: 2px solid var(--bg-primary-border);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
  }

  .audio-file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px 15px;
    cursor: pointer;
    border-bottom: 1px solid var(--bg-primary-border);
    border-radius: 8px;
    margin-bottom: 8px;
    color: var(--text-dark);
    background: rgba(255, 255, 255, 0.7);
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .audio-file-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .audio-file-item:hover {
    background: var(--bg-primary-light);
    color: var(--primary-color);
    transform: translateX(5px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .button-cross {
    background: var(--danger-alt-gradient);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    transition: all 0.2s ease;
    box-shadow: var(--shadow-danger-alt);
  }

  .button-cross:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-danger-alt-hover);
  }

  .button-cross::before {
    content: '\2715';
  }

  .file-selection {
    margin-bottom: 10px;
  }

  .button-wrap {
    display: flex;
    justify-content: center;
  }

  .current-song {
    font-weight: 500;
    margin: 0px 0;
    padding: 15px 20px;
    background: var(--bg-primary-light);
    border-radius: 10px;
    color: var(--primary-color);
    text-align: center;
    font-size: 1rem;
    border: 2px solid var(--bg-primary-border);
  }

  audio {
    width: 100%;
    margin: 10px 0;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: var(--shadow-card);
  }

  .playback-controls {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin: 5px 0;
  }

  .time-controls {
    margin: 10px 0;
  }

  .slider-container {
    margin: 20px 0;
  }

  .slider-container label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.95rem;
  }

  .slider-container input[type='range'] {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #ecf0f1;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }

  .slider-container input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    transition: all 0.2s ease;
  }

  .slider-container input[type='range']::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .checkbox-container {
    margin: 20px 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .checkbox-container label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-weight: 500;
    color: #2c3e50;
    font-size: 0.95rem;
  }

  .speed-control {
    text-align: center;
    margin: 30px 0;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .speed-control h3 {
    margin: 0 0 20px 0;
    color: #2c3e50;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .slider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    max-width: 400px;
    margin: 0 auto;
  }

  .slider input[type='range'] {
    flex: 1;
    height: 8px;
    border-radius: 4px;
    background: #ecf0f1;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }

  .slider input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
    transition: all 0.2s ease;
  }

  .slider input[type='range']::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
  }

  .slider p {
    margin: 0;
    font-weight: 600;
    color: #ff9800;
    font-size: 1.1rem;
    min-width: 60px;
    background: rgba(255, 152, 0, 0.1);
    padding: 8px 12px;
    border-radius: 20px;
    border: 2px solid rgba(255, 152, 0, 0.2);
  }

  .waveform-container {
    height: 120px;
    margin: 30px 0;
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 10px;
    background: rgba(102, 126, 234, 0.05);
    backdrop-filter: blur(10px);
  }

  @media (max-width: 768px) {
    .playsound-component {
      width: 95%;
      min-width: unset;
      max-width: unset;
      margin: 10px auto;
      padding: 15px;
    }

    .horizontal-list {
      grid-template-columns: 1fr;
    }

    .training-controls {
      flex-direction: column;
    }

    .playback-controls {
      flex-direction: column;
      align-items: center;
    }

    .button {
      width: 100%;
      max-width: 200px;
    }

    .slider {
      flex-direction: column;
      gap: 10px;
    }

    .slider input[type='range'] {
      width: 100%;
    }
  }
</style>
