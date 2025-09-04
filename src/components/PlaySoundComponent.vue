<template>
  <div class="playsound-component">
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
      
      <input v-model="trainingStore.currentTrainingName" type="text" placeholder="Training name" />
      
      <div class="training-controls">
        <button @click="addTraining()">Add</button>
        <button @click="removeTraining()">Remove</button>
      </div>
    </div>

    <!-- Audio Files List -->
    <div class="audio-files-section">
      <ol class="audio-files-list">
        <li 
          v-for="item in trainingStore.audioPath" 
          :key="item" 
          @click="launchFile(item)"
          class="audio-file-item"
        >
          {{ audioService.extractFilename(item) }}
          <button class="button-cross" @click="removeAudioFile(item)"></button>
        </li>
      </ol>
      
      <!-- File Selection -->
      <div class="file-selection">
        <div class="button-wrap">
          <button class="buttonbis" @click="selectAudioFileNative">Select Audio File</button>
        </div>
      </div>
    </div>

    <!-- Current Song Info -->
    <p class="current-song">Song playing: {{ trainingStore.currentSong }}</p>
    
    <!-- Audio Player -->
    <audio 
      ref="audioPlayer" 
      controls
      style="width: 100%;"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onAudioLoaded"
    >
      Your browser does not support the audio element.
    </audio>

    <!-- Playback Controls -->
    <div class="playback-controls">
      <button class="button" @click="play">Play</button>
      <button class="button" @click="pause">Pause</button>
      <button class="button" @click="stop">Stop</button>
    </div>

    <!-- Time Controls -->
    <div class="time-controls">
      <div class="slider-container">
        <label>Start Time: {{ audioService.formatTime(trainingStore.startTime) }}</label>
        <input 
          type="range" 
          v-model="trainingStore.startTime" 
          :max="trainingStore.endTime" 
          min="0" 
          step="0.1"
        />
      </div>
      
      <div class="slider-container">
        <label>End Time: {{ audioService.formatTime(trainingStore.endTime) }}</label>
        <input 
          type="range" 
          v-model="trainingStore.endTime" 
          :min="trainingStore.startTime" 
          :max="trainingStore.songLength" 
          step="0.1"
        />
      </div>
      
      <div class="checkbox-container">
        <label>
          <input type="checkbox" v-model="trainingStore.loop" />
          Loop
        </label>
      </div>
    </div>

    <!-- Speed Control -->
    <div class="speed-control">
      <h3>Playing Rate</h3>
      <div class="slider">
        <input 
          type="range" 
          min="10" 
          max="300" 
          v-model="trainingStore.speed"
          @input="onSpeedChange"
        />
        <p>{{ trainingStore.speed }}%</p>
      </div>
    </div>

    <!-- Waveform Container -->
    <div id="waveform" class="waveform-container"></div>
  </div>
</template>

<script>
import { useTrainingStore } from '../stores/trainingStore.js'
import { serviceManager } from '../services'

export default {
  name: 'PlaySoundComponent',
  
  setup() {
    const trainingStore = useTrainingStore()
    const audioService = serviceManager.audio
    const fileService = serviceManager.file
    const storageService = serviceManager.storage
    
    return {
      trainingStore,
      audioService,
      fileService,
      storageService
    }
  },
  
  mounted() {
    // Load data from storage
    this.trainingStore.loadFromStorage()
    
    // Initialize audio context
    this.audioService.initializeAudioContext()
  },
  
  methods: {
    // Training management
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
        ? "selectedTrain" 
        : "unselectedTrain"
    },
    
    // File management
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
            isNative: true
          })
        }
      } catch (error) {
        console.error('Error selecting audio file:', error)
        // Could add user notification here
      }
    },
    
    async onFileChange(event) {
      // Removed - only native file selection is used
    },
    
    async loadAudioFile(fileData) {
      try {
        // Add to store
        this.trainingStore.addAudioFile(fileData.path, fileData.name)
        
        // Load audio metadata
        const audioData = await this.audioService.loadAudioFile(fileData.path)
        
        // Update audio player
        this.$refs.audioPlayer.src = audioData.src
        
        // Store audio reference
        this.currentAudio = audioData.audio
      } catch (error) {
        console.error('Error loading audio file:', error)
      }
    },
    
    removeAudioFile(filePath) {
      this.trainingStore.removeAudioFile(filePath)
    },
    
    async launchFile(filePath) {
      try {
        const fileName = this.audioService.extractFilename(filePath)
        this.trainingStore.currentSong = fileName
        
        // Load the audio file
        const audioData = await this.audioService.loadAudioFile(filePath)
        this.$refs.audioPlayer.src = audioData.src
        this.currentAudio = audioData.audio
      } catch (error) {
        console.error('Error launching file:', error)
      }
    },
    
    // Playback controls
    async play() {
      try {
        await this.audioService.playAudio(
          this.$refs.audioPlayer, 
          this.trainingStore.speed / 100
        )
      } catch (error) {
        console.error('Error playing audio:', error)
      }
    },
    
    pause() {
      this.audioService.pauseAudio(this.$refs.audioPlayer)
    },
    
    stop() {
      this.audioService.stopAudio(this.$refs.audioPlayer, this.trainingStore.startTime)
    },
    
    onSpeedChange() {
      this.audioService.setPlaybackRate(this.$refs.audioPlayer, this.trainingStore.speed)
    },
    
    // Event handlers
    onTimeUpdate() {
      const audio = this.$refs.audioPlayer
      if (!audio) return
      
      this.audioService.handleTimeUpdate(
        audio,
        audio.currentTime,
        this.trainingStore.startTime,
        this.trainingStore.endTime,
        this.trainingStore.loop
      )
    },
    
    onAudioLoaded() {
      const audio = this.$refs.audioPlayer
      if (audio && audio.duration) {
        this.trainingStore.setSongLength(audio.duration)
        
        // Initialize waveform if needed
        this.audioService.initWaveSurfer('waveform', audio.src)
      }
    }
  },
  
  beforeUnmount() {
    // Cleanup
    if (this.currentAudio) {
      this.audioService.cleanup()
    }
  }
}
</script>

<style scoped>
.playsound-component {
  padding: 20px;
}

.training-section {
  margin-bottom: 20px;
}

.horizontal-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin-bottom: 10px;
}

.horizontal-list li {
  margin-right: 10px;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
}

.selectedTrain {
  background-color: rgb(96, 96, 96);
  color: white;
}

.unselectedTrain {
  background-color: rgb(200, 200, 200);
}

.training-controls {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.audio-files-section {
  margin-bottom: 20px;
}

.audio-files-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}

.audio-file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.audio-file-item:hover {
  background-color: #f5f5f5;
}

.button-cross {
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.file-selection {
  margin-bottom: 10px;
}

.button-wrap {
  display: flex;
  gap: 10px;
  align-items: center;
}

.current-song {
  font-weight: 300;
  margin: 10px 0;
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

.buttonbis {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.buttonbis:hover {
  background: #1e7e34;
}

.time-controls {
  margin: 20px 0;
}

.slider-container {
  margin: 10px 0;
}

.slider-container label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.slider-container input[type="range"] {
  width: 100%;
}

.checkbox-container {
  margin: 10px 0;
}

.speed-control {
  text-align: center;
  margin: 20px 0;
}

.slider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.slider input[type="range"] {
  flex: 1;
  max-width: 300px;
}

.waveform-container {
  height: 100px;
  margin: 20px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
