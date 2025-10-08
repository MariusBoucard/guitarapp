<template>
  <div class="tab-reader-container">
    <div class="tab-reader-header">
      <h3>Tab Reader</h3>
      <div class="controls">
        <input
          ref="fileInput"
          type="file"
          accept=".gp,.gp3,.gp4,.gp5,.gpx,.gp6,.ptb"
          @change="loadFile"
          style="display: none"
        />
        <button @click="openFileDialog" class="load-btn">
          Load Guitar Pro File
        </button>
        <button v-if="canPlay" @click="playPause" class="play-btn" :class="{ 'playing': isPlaying }">
          {{ isPlaying ? '⏸️ Pause' : '▶️ Play' }}
        </button>
        <button v-if="canPlay" @click="stop" class="stop-btn">
          ⏹️ Stop
        </button>
      </div>
    </div>
    
    <div class="tab-content">
      <div v-if="!isLoaded" class="no-file">
        <p>No file loaded. Click "Load Guitar Pro File" to get started.</p>
      </div>
      
      <div ref="alphaTab" class="alphatab-container"></div>
      
      <div v-if="error" class="error">
        <p>Error: {{ error }}</p>
      </div>
    </div>
    
    <div v-if="isLoaded" class="track-selector">
      <label>Select Track:</label>
      <select v-model="selectedTrack" @change="changeTrack">
        <option v-for="(track, index) in tracks" :key="index" :value="index">
          {{ track.name }} ({{ track.channel?.instrument?.name || 'Unknown Instrument' }})
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { AlphaTabApi, Settings } from '@coderline/alphatab'

export default {
  name: 'TabReaderComponent',
  data() {
    return {
      alphaTabApi: null,
      isLoaded: false,
      isPlaying: false,
      isPlayerReady: false,
      error: null,
      tracks: [],
      selectedTrack: 0
    }
  },
  computed: {
    canPlay() {
      return this.isLoaded && this.isPlayerReady
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initializeAlphaTab()
    })
  },
  beforeUnmount() {
    if (this.alphaTabApi) {
      this.alphaTabApi.destroy()
    }
  },
  methods: {
    initializeAlphaTab() {
      try {
        if (!this.$refs.alphaTab) {
          this.error = 'Failed to find AlphaTab container element'
          return
        }

        this.$refs.alphaTab.innerHTML = ''

        const settings = new Settings()
        
        // Optimized settings for fast rendering
        settings.core.engine = 'html5'  // HTML5 Canvas is much faster than SVG
        settings.core.useWorkers = true  // Enable workers for better performance
        settings.display.scale = 1.0  // Native scale for better performance
        settings.display.stretchForce = 0.8
        
        // Player settings
        settings.player.enablePlayer = true
        settings.player.enableAudioSynthesis = true
        settings.player.soundFont = './soundfont/sonivox.sf2'
        settings.player.enableCursor = true
        settings.player.enableUserInteraction = true
        settings.player.scrollMode = 'continuous'
        settings.core.fontDirectory = './font/'
        
        this.alphaTabApi = new AlphaTabApi(this.$refs.alphaTab, settings)
        this.setupEventListeners()
        
      } catch (err) {
        this.error = `Failed to initialize AlphaTab: ${err.message}`
        console.error('AlphaTab initialization error:', err)
      }
    },
    
    setupEventListeners() {
      if (!this.alphaTabApi) return

      // Score loaded
      this.alphaTabApi.scoreLoaded.on((score) => {
        this.isLoaded = true
        this.tracks = score.tracks || []
        this.selectedTrack = 0
        this.error = null
      })
      
      // Player ready
      this.alphaTabApi.playerReady.on(() => {
        this.isPlayerReady = true
      })
      
      // Player state changes
      this.alphaTabApi.playerStateChanged.on((e) => {
        this.isPlaying = e.state === 1
      })
      
      // Player finished
      this.alphaTabApi.playerFinished.on(() => {
        this.isPlaying = false
      })
      
      // Error handling
      this.alphaTabApi.error.on((error) => {
        this.error = `Error: ${error.message || error}`
        console.error('AlphaTab error:', error)
      })
    },    openFileDialog() {
      this.$refs.fileInput.click()
    },
    
    async loadFile(event) {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        this.error = null
        this.isLoaded = false
        this.isPlayerReady = false
        
        // Check if AlphaTab API is initialized
        if (!this.alphaTabApi) {
          throw new Error('AlphaTab is not initialized. Please try again.')
        }
        
        // Validate file type
        const validExtensions = ['.gp', '.gp3', '.gp4', '.gp5', '.gpx', '.gp6', '.ptb']
        const fileName = file.name.toLowerCase()
        const isValidFile = validExtensions.some(ext => fileName.endsWith(ext))
        
        if (!isValidFile) {
          throw new Error('Invalid file type. Please select a Guitar Pro file (.gp, .gp3, .gp4, .gp5, .gpx, .gp6, .ptb)')
        }
        
        // Convert file to ArrayBuffer
        const arrayBuffer = await this.fileToArrayBuffer(file)
        
        // Load the file in AlphaTab
        const success = this.alphaTabApi.load(arrayBuffer)
        if (!success) {
          throw new Error('Failed to load the Guitar Pro file. The file might be corrupted or unsupported.')
        }
        
      } catch (err) {
        this.error = `Failed to load file: ${err.message}`
        console.error('File loading error:', err)
      }
    },
    
    fileToArrayBuffer(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      })
    },
    
    playPause() {
      if (!this.alphaTabApi || !this.alphaTabApi.isReadyForPlayback) return
      
      if (this.isPlaying) {
        this.alphaTabApi.pause()
      } else {
        this.alphaTabApi.play()
      }
    },
    
    stop() {
      if (!this.alphaTabApi || !this.alphaTabApi.isReadyForPlayback) return
      this.alphaTabApi.stop()
    },
    
    changeTrack() {
      if (!this.alphaTabApi || !this.isLoaded || this.selectedTrack >= this.tracks.length) return
      this.alphaTabApi.renderTracks([this.tracks[this.selectedTrack]])
    }
  }
}
</script>

<style scoped>
.tab-reader-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color, #1a1a1a);
  color: var(--text-color, #ffffff);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #444;
  margin: 10px 0;
}

.tab-reader-header {
  padding: 1rem;
  background: var(--header-bg, #2a2a2a);
  border-bottom: 1px solid var(--border-color, #444);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-reader-header h3 {
  margin: 0;
  color: var(--primary-color, #4CAF50);
}

.controls {
  display: flex;
  gap: 0.5rem;
}

.controls button {
  padding: 0.5rem 1rem;
  background: var(--primary-color, #4CAF50);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 12px;
}

.controls button:hover {
  background: var(--primary-hover, #45a049);
}

.controls button:disabled {
  background: #666;
  cursor: not-allowed;
}

.play-btn.playing {
  background: var(--secondary-color, #FF5722) !important;
}

.play-btn.playing:hover {
  background: var(--secondary-hover, #E64A19) !important;
}

.stop-btn {
  background: var(--danger-color, #f44336) !important;
}

.stop-btn:hover {
  background: var(--danger-hover, #d32f2f) !important;
}

.debug-btn {
  background: var(--info-color, #2196F3) !important;
  font-size: 11px !important;
}

.debug-btn:hover {
  background: var(--info-hover, #1976D2) !important;
}

.status-text {
  color: var(--text-muted, #888);
  font-size: 12px;
  font-style: italic;
}

.electron-warning {
  color: #ff9500 !important;
  font-weight: bold;
  font-style: normal;
}

.electron-info {
  color: #2196F3 !important;
  font-weight: bold;
  font-style: normal;
}

.electron-success {
  color: #4CAF50 !important;
  font-weight: bold;
  font-style: normal;
}

.success-text {
  color: #4CAF50 !important;
  font-weight: bold;
  font-style: normal;
}

.info-text {
  color: #2196F3 !important;
  font-weight: bold;
  font-style: normal;
}

.tab-content {
  flex: 1;
  overflow: auto;
  position: relative;
  min-height: 400px;
}

.no-file {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted, #888);
  text-align: center;
  padding: 20px;
}

.alphatab-container {
  width: 100%;
  min-height: 400px;
  background: white;
  border-radius: 4px;
  padding: 10px;
  overflow: auto;
}

.error {
  padding: 1rem;
  background: #ff4444;
  color: white;
  margin: 1rem;
  border-radius: 4px;
  text-align: center;
}

.track-selector {
  padding: 1rem;
  background: var(--header-bg, #2a2a2a);
  border-top: 1px solid var(--border-color, #444);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.track-selector label {
  color: var(--text-color, #fff);
  font-weight: bold;
}

.track-selector select {
  padding: 0.5rem;
  background: var(--input-bg, #333);
  color: var(--text-color, #fff);
  border: 1px solid var(--border-color, #444);
  border-radius: 4px;
  min-width: 200px;
}
</style>
