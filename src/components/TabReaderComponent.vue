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
    
    <div v-if="isLoaded" class="bottom-panel">
      <div class="track-selector">
        <label>Select Track:</label>
        <select v-model="selectedTrack" @change="changeTrack">
          <option v-for="(track, index) in tracks" :key="index" :value="index">
            {{ track.name }} ({{ track.channel?.instrument?.name || 'Unknown Instrument' }})
          </option>
        </select>
        <button @click="showMixer = !showMixer" class="mixer-toggle-btn">
          {{ showMixer ? '🎚️ Hide Mixer' : '🎚️ Show Mixer' }}
        </button>
      </div>
      
      <div v-if="showMixer" class="mixer-panel">
        <h4>Track Mixer</h4>
        <div class="mixer-tracks">
          <div v-for="(track, index) in tracks" :key="index" class="mixer-track">
            <div class="track-header">
              <input 
                type="checkbox" 
                :checked="!track.playbackInfo.isMute"
                @change="toggleMute(index)"
                :id="'mute-' + index"
              />
              <label :for="'mute-' + index" class="track-name">
                {{ track.name }}
              </label>
            </div>
            <div class="track-controls">
              <div class="control-group">
                <label>Volume</label>
                <input 
                  type="range" 
                  min="0" 
                  max="16" 
                  :value="track.playbackInfo.volume"
                  @input="changeVolume(index, $event.target.value)"
                  class="volume-slider"
                />
                <span class="value-display">{{ track.playbackInfo.volume }}</span>
              </div>
              <div class="control-group">
                <label>Pan</label>
                <input 
                  type="range" 
                  min="-64" 
                  max="63" 
                  :value="track.playbackInfo.balance"
                  @input="changePanning(index, $event.target.value)"
                  class="pan-slider"
                />
                <span class="value-display">{{ track.playbackInfo.balance }}</span>
              </div>
              <div class="control-group solo-group">
                <button 
                  @click="toggleSolo(index)"
                  :class="{ 'active': track.playbackInfo.isSolo }"
                  class="solo-btn"
                >
                  S
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      selectedTrack: 0,
      showMixer: false
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
        settings.player.enableCursor = true  // Enable beat cursor
        settings.player.enableUserInteraction = true
        settings.player.enableElementHighlighting = true  // Highlight current element
        settings.player.scrollMode = 'continuous'  // Auto-scroll with playback
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
    },
    
    changeVolume(trackIndex, volume) {
      if (!this.alphaTabApi || !this.tracks[trackIndex]) return
      const volumeValue = parseInt(volume)
      this.alphaTabApi.changeTrackVolume([this.tracks[trackIndex]], volumeValue)
      this.tracks[trackIndex].playbackInfo.volume = volumeValue
      this.$forceUpdate()
    },
    
    changePanning(trackIndex, balance) {
      if (!this.alphaTabApi || !this.tracks[trackIndex]) return
      const balanceValue = parseInt(balance)
      this.alphaTabApi.changeTrackBalance([this.tracks[trackIndex]], balanceValue)
      this.tracks[trackIndex].playbackInfo.balance = balanceValue
      this.$forceUpdate()
    },
    
    toggleMute(trackIndex) {
      if (!this.alphaTabApi || !this.tracks[trackIndex]) return
      const track = this.tracks[trackIndex]
      const newMuteState = !track.playbackInfo.isMute
      this.alphaTabApi.changeTrackMute([track], newMuteState)
      track.playbackInfo.isMute = newMuteState
      this.$forceUpdate()
    },
    
    toggleSolo(trackIndex) {
      if (!this.alphaTabApi || !this.tracks[trackIndex]) return
      const track = this.tracks[trackIndex]
      const newSoloState = !track.playbackInfo.isSolo
      this.alphaTabApi.changeTrackSolo([track], newSoloState)
      track.playbackInfo.isSolo = newSoloState
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped>
.tab-reader-container {
  width: 100%;
  min-height: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color, #1a1a1a);
  color: var(--text-color, #ffffff);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #444;
  margin: 10px 0;
  position: relative;
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
  overflow: hidden;
  position: relative;
  min-height: 500px;
  display: flex;
  flex-direction: column;
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
  flex: 1;
  background: white;
  border-radius: 4px;
  padding: 10px;
  padding-bottom: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

/* AlphaTab's built-in cursor styling */
.alphatab-container :deep(.at-cursor-bar) {
  background: rgba(255, 0, 0, 0.3) !important;
  width: 3px !important;
}

.alphatab-container :deep(.at-cursor-beat) {
  background: rgba(255, 0, 0, 0.25) !important;
}

.alphatab-container :deep(.at-highlight) {
  background: rgba(255, 200, 0, 0.3) !important;
}

.error {
  padding: 1rem;
  background: #ff4444;
  color: white;
  margin: 1rem;
  border-radius: 4px;
  text-align: center;
}

.bottom-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(42, 42, 42, 0.98);
  border-top: 1px solid var(--border-color, #444);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.track-selector {
  padding: 1rem;
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
  flex: 1;
}

.mixer-toggle-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color, #4CAF50);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.mixer-toggle-btn:hover {
  background: var(--primary-hover, #45a049);
}

.mixer-panel {
  padding: 1rem;
  background: rgba(26, 26, 26, 0.98);
  border-top: 1px solid var(--border-color, #444);
  max-height: 350px;
  overflow-y: auto;
  backdrop-filter: blur(5px);
}

.mixer-panel h4 {
  margin: 0 0 1rem 0;
  color: var(--primary-color, #4CAF50);
  font-size: 1.1rem;
}

.mixer-tracks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.mixer-track {
  background: var(--header-bg, #2a2a2a);
  border: 1px solid var(--border-color, #444);
  border-radius: 6px;
  padding: 0.75rem;
}

.track-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color, #444);
}

.track-header input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.track-name {
  color: var(--text-color, #fff);
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  flex: 1;
}

.track-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  color: var(--text-muted, #888);
  font-size: 0.85rem;
  width: 50px;
}

.volume-slider,
.pan-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--input-bg, #333);
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb,
.pan-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-color, #4CAF50);
  cursor: pointer;
  transition: background 0.2s;
}

.volume-slider::-webkit-slider-thumb:hover,
.pan-slider::-webkit-slider-thumb:hover {
  background: var(--primary-hover, #45a049);
}

.volume-slider::-moz-range-thumb,
.pan-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-color, #4CAF50);
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.volume-slider::-moz-range-thumb:hover,
.pan-slider::-moz-range-thumb:hover {
  background: var(--primary-hover, #45a049);
}

.value-display {
  color: var(--text-color, #fff);
  font-size: 0.85rem;
  min-width: 30px;
  text-align: right;
  font-family: monospace;
}

.solo-group {
  justify-content: flex-end;
}

.solo-btn {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 2px solid var(--border-color, #444);
  background: var(--input-bg, #333);
  color: var(--text-muted, #888);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.solo-btn:hover {
  border-color: #FFC107;
  color: #FFC107;
}

.solo-btn.active {
  background: #FFC107;
  border-color: #FFC107;
  color: #000;
}
</style>
