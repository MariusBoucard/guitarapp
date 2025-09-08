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
          v-for="item in songPlayerStore.audioPath" 
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
    <p class="current-song">Song playing: {{ songPlayerStore.currentSong }}</p>
    
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
        <label>Start Time: {{ audioService.formatTime(songPlayerStore.startTime) }}</label>
        <input 
          type="range" 
          v-model="songPlayerStore.startTime" 
          :max="songPlayerStore.endTime" 
          min="0" 
          step="0.1"
        />
      </div>
      
      <div class="slider-container">
        <label>End Time: {{ audioService.formatTime(songPlayerStore.endTime) }}</label>
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
          v-model="songPlayerStore.speed"
          @input="onSpeedChange"
        />
        <p>{{ songPlayerStore.speed }}%</p>
      </div>
    </div>

    <!-- Waveform Container -->
    <div id="waveform" class="waveform-container"></div>
  </div>
</template>

<script>
import { useTrainingStore } from '../stores/trainingStore.js'
import { useSongPlayerStore } from '../stores/songPlayerStore.js'
import { serviceManager } from '../services'

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
      storageService
    }
  },
  
  mounted() {
    // Load data from storage
    this.trainingStore.loadFromStorage()
    this.songPlayerStore.loadFromStorage()
    
    // Initialize audio context
    this.audioService.initializeAudioContext()
  },
  
  methods: {
    // Training management
    selectTraining(training) {
      this.trainingStore.selectTraining(training)
      // Update audio path for the new training
      this.songPlayerStore.updateAudioPathForTraining(this.trainingStore)
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
        // Add to song player store
        this.songPlayerStore.addAudioFile(this.trainingStore, fileData.path, fileData.name)
        
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
      this.songPlayerStore.removeAudioFile(this.trainingStore, filePath)
    },
    
    async launchFile(filePath) {
      try {
        const fileName = this.audioService.extractFilename(filePath)
        this.songPlayerStore.currentSong = fileName
        
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
    
    // Event handlers
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
  width: 900px;
  min-width: 900px;
  max-width: 900px;
  margin: 20px auto;
  padding: 25px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

/* Training Section */
.training-section {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 10px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  text-align: center;
  font-weight: 500;
}

.selectedTrain {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.unselectedTrain {
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  border-color: #e0e6ed;
}

.unselectedTrain:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.horizontal-list li p {
  margin: 0;
  font-size: 0.9rem;
}

.training-section input[type="text"] {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 25px;
  font-size: 0.9rem;
  margin-bottom: 15px;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.training-section input[type="text"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.2);
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
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.training-controls button:first-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.training-controls button:last-child {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.training-controls button:last-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

/* Audio Files Section */
.audio-files-section {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.audio-files-list {
  max-height: 200px;
  overflow-y: auto;
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.audio-files-list::-webkit-scrollbar {
  width: 8px;
}

.audio-files-list::-webkit-scrollbar-track {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
}

.audio-files-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

.audio-file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
  color: #2c3e50;
  background: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
  font-weight: 500;
}

.audio-file-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.audio-file-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateX(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.button-cross {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.button-cross:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.button-cross::before {
  content: "✕";
}

.file-selection {
  margin-bottom: 10px;
}

.button-wrap {
  display: flex;
  justify-content: center;
}

.buttonbis {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.buttonbis:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Current Song */
.current-song {
  font-weight: 500;
  margin: 20px 0;
  padding: 15px 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  color: #667eea;
  text-align: center;
  font-size: 1rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
}

/* Audio Player */
audio {
  width: 100%;
  margin: 20px 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Playback Controls */
.playback-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 25px 0;
}

.button {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button:nth-child(1) {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.button:nth-child(2) {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.button:nth-child(3) {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Time Controls */
.time-controls {
  margin: 30px 0;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

.slider-container input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ecf0f1;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.slider-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.2s ease;
}

.slider-container input[type="range"]::-webkit-slider-thumb:hover {
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

.checkbox-container input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
  cursor: pointer;
}

/* Speed Control */
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

.slider input[type="range"] {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: #ecf0f1;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  transition: all 0.2s ease;
}

.slider input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

.slider p {
  margin: 0;
  font-weight: 600;
  color: #FF9800;
  font-size: 1.1rem;
  min-width: 60px;
  background: rgba(255, 152, 0, 0.1);
  padding: 8px 12px;
  border-radius: 20px;
  border: 2px solid rgba(255, 152, 0, 0.2);
}

/* Waveform */
.waveform-container {
  height: 120px;
  margin: 30px 0;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 10px;
  background: rgba(102, 126, 234, 0.05);
  backdrop-filter: blur(10px);
}

/* Responsive Design */
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

  .slider input[type="range"] {
    width: 100%;
  }
}
</style>
