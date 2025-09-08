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
        <button v-if="canPlay" @click="playPause" class="play-btn">
          {{ isPlaying ? 'Pause' : 'Play' }}
        </button>
        <button v-if="canPlay" @click="stop" class="stop-btn">
          Stop
        </button>
        <span v-if="isLoaded && !isPlayerReady" class="status-text">
          Loading player...
        </span>
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
      return this.isLoaded && this.isPlayerReady && this.alphaTabApi?.isReadyForPlayback
    }
  },
  mounted() {
    this.initializeAlphaTab()
  },
  beforeUnmount() {
    if (this.alphaTabApi) {
      this.alphaTabApi.destroy()
    }
  },
  methods: {
    initializeAlphaTab() {
      try {
        const settings = new Settings()
        
        // Configure AlphaTab settings according to documentation
        settings.core.engine = 'html5'
        settings.display.scale = 0.8
        settings.display.stretchForce = 0.8
        
        // Player settings - proper configuration
        settings.player.playerMode = 1 // PlayerMode.EnabledAutomatic
        settings.player.enablePlayer = true
        settings.player.soundFont = 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2'
        settings.player.scrollElement = this.$refs.alphaTab
        settings.player.enableCursor = true
        settings.player.enableUserInteraction = true
        
        // Notation settings
        settings.notation.elements.scoreTitle = true
        settings.notation.elements.scoreSubTitle = true
        settings.notation.elements.scoreArtist = true
        settings.notation.elements.scoreAlbum = true
        settings.notation.elements.scoreWords = true
        settings.notation.elements.scoreMusic = true
        settings.notation.elements.scoreCopyright = true
        
        // Initialize AlphaTab
        this.alphaTabApi = new AlphaTabApi(this.$refs.alphaTab, settings)
        
        // Event listeners
        this.setupEventListeners()
        
      } catch (err) {
        this.error = `Failed to initialize AlphaTab: ${err.message}`
        console.error('AlphaTab initialization error:', err)
      }
    },
    
    setupEventListeners() {
      // Score loaded event
      this.alphaTabApi.scoreLoaded.on((score) => {
        this.isLoaded = true
        this.tracks = score.tracks || []
        this.selectedTrack = 0
        this.error = null
        console.log('Score loaded:', score.title, 'by', score.artist)
        console.log('Available tracks:', this.tracks.map(track => ({
          name: track.name,
          channel: track.channel,
          playbackInfo: track.playbackInfo
        })))
      })
      
      // Player state changed - use proper PlayerState enum values
      this.alphaTabApi.playerStateChanged.on((e) => {
        // PlayerState: Paused = 0, Playing = 1, Stopped = 2
        this.isPlaying = e.state === 1 
      })
      
      // Player ready event
      this.alphaTabApi.playerReady.on(() => {
        this.isPlayerReady = true
        console.log('Player ready for playback')
      })
      
      // SoundFont loading progress
      this.alphaTabApi.soundFontLoad.on((args) => {
        console.log(`SoundFont loading: ${args.loaded}/${args.total}`)
      })
      
      // SoundFont loaded
      this.alphaTabApi.soundFontLoaded.on(() => {
        console.log('SoundFont loaded successfully')
      })
      
      // Error handling
      this.alphaTabApi.error.on((error) => {
        this.error = `AlphaTab error: ${error}`
        console.error('AlphaTab error:', error)
      })
      
      // Render finished
      this.alphaTabApi.renderFinished.on(() => {
        console.log('Rendering finished')
      })
    },
    
    openFileDialog() {
      this.$refs.fileInput.click()
    },
    
    async loadFile(event) {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        this.error = null
        this.isLoaded = false
        this.isPlayerReady = false
        
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
      if (!this.alphaTabApi || !this.alphaTabApi.isReadyForPlayback) {
        console.warn('Player not ready for playback')
        return
      }
      
      if (this.isPlaying) {
        this.alphaTabApi.pause()
      } else {
        this.alphaTabApi.play()
      }
    },
    
    stop() {
      if (!this.alphaTabApi) return
      this.alphaTabApi.stop()
    },
    
    changeTrack() {
      if (!this.alphaTabApi || !this.isLoaded || this.selectedTrack >= this.tracks.length) return
      
      // Render only the selected track using proper API
      this.alphaTabApi.renderTracks([this.tracks[this.selectedTrack]])
    },
    
    getInstrumentName(track) {
      // Safely get instrument name with fallbacks
      try {
        if (track && track.channel && track.channel.instrument && track.channel.instrument.name) {
          return track.channel.instrument.name
        }
        if (track && track.channel && track.channel.instrument) {
          return 'Instrument'
        }
        if (track && track.playbackInfo && track.playbackInfo.program !== undefined) {
          return `Program ${track.playbackInfo.program}`
        }
        return 'Unknown Instrument'
      } catch (error) {
        console.warn('Error getting instrument name:', error)
        return 'Unknown Instrument'
      }
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

.status-text {
  color: var(--text-muted, #888);
  font-size: 12px;
  font-style: italic;
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
  margin: 10px;
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

/* AlphaTab specific styles */
:deep(.alphaTab) {
  background: white !important;
}

:deep(.at-surface) {
  background: white !important;
}

:deep(.at-viewport) {
  background: white !important;
}
</style>
