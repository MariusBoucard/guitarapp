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
        <span v-if="isElectron && isLoaded" class="status-text electron-warning">
          ⚠️ Audio playback disabled in desktop mode
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
      isElectron: false,
      error: null,
      tracks: [],
      selectedTrack: 0,
      currentScore: null,
      originalFetch: null
    }
  },
  computed: {
    canPlay() {
      return this.isLoaded && !this.isElectron && this.isPlayerReady && this.alphaTabApi?.isReadyForPlayback
    }
  },
  mounted() {
    console.log('TabReader component mounted')
    
    // Initialize AlphaTab with a delay to ensure DOM is ready
    this.$nextTick(() => {
      setTimeout(() => {
        this.initializeAlphaTab()
      }, 200)
    })
  },
  beforeUnmount() {
    // Restore original fetch function
    if (this.originalFetch) {
      window.fetch = this.originalFetch
    }
    
    if (this.alphaTabApi) {
      this.alphaTabApi.destroy()
    }
  },
  methods: {
    initializeAlphaTab() {
      try {
        // Ensure the alphaTab element exists
        if (!this.$refs.alphaTab) {
          console.error('AlphaTab container element not found')
          this.error = 'Failed to find AlphaTab container element'
          return
        }

        console.log('AlphaTab container element found:', this.$refs.alphaTab)

        // Clear any previous content
        this.$refs.alphaTab.innerHTML = ''

        // Check if running in Electron
        const isElectron = typeof window !== 'undefined' && window.process && window.process.type
        this.isElectron = isElectron
        
        console.log('Environment detected:', isElectron ? 'Electron' : 'Web')

        const settings = new Settings()
        
        // Basic settings following the documentation
        settings.core.engine = 'svg'  // Use SVG for better compatibility
        settings.display.scale = 0.8
        
        if (isElectron) {
          console.log('Configuring for Electron environment')
          // Electron-specific settings
          settings.core.useWorkers = false  // Disable workers in Electron
          settings.player.enablePlayer = false  // Disable player in Electron
          settings.player.playerMode = 0
          
          // Set font directory to the location where Vite plugin copies fonts
          settings.core.fontDirectory = './font/'
        } else {
          console.log('Configuring for web environment')
          // Web settings
          settings.player.enablePlayer = true
          settings.player.playerMode = 1
          settings.player.soundFont = './soundfont/sonivox.sf2'
          
          // Use default font directory (Vite plugin handles this)
          settings.core.fontDirectory = './font/'
        }

        // Initialize AlphaTab
        console.log('Creating AlphaTab instance...')
        console.log('Settings:', {
          engine: settings.core.engine,
          useWorkers: settings.core.useWorkers,
          fontDirectory: settings.core.fontDirectory,
          scale: settings.display.scale,
          enablePlayer: settings.player.enablePlayer
        })
        
        this.alphaTabApi = new AlphaTabApi(this.$refs.alphaTab, settings)
        
        // Setup event listeners
        this.setupEventListeners()
        
        console.log('AlphaTab initialized successfully')
        
      } catch (err) {
        this.error = `Failed to initialize AlphaTab: ${err.message}`
        console.error('AlphaTab initialization error:', err)
      }
    },
    
    setupEventListeners() {
      if (!this.alphaTabApi) {
        console.error('Cannot setup event listeners: AlphaTab API is null')
        return
      }

      // Score loaded event
      this.alphaTabApi.scoreLoaded.on((score) => {
        this.isLoaded = true
        this.tracks = score.tracks || []
        this.selectedTrack = 0
        this.currentScore = score
        this.error = null
        console.log('Score loaded:', score.title, 'by', score.artist)
        console.log('Available tracks:', this.tracks.length)
      })
      
      // Render started event
      this.alphaTabApi.renderStarted.on(() => {
        console.log('AlphaTab rendering started')
      })
      
      // Render finished event
      this.alphaTabApi.renderFinished.on(() => {
        console.log('AlphaTab rendering finished successfully')
        
        // Debug: Check what was rendered
        const container = this.$refs.alphaTab
        if (container) {
          const canvases = container.querySelectorAll('canvas')
          const svgs = container.querySelectorAll('svg')
          const divs = container.querySelectorAll('div')
          const surfaces = container.querySelectorAll('.at-surface')
          console.log(`Rendered elements - Canvases: ${canvases.length}, SVGs: ${svgs.length}, Divs: ${divs.length}`)
          console.log('Container content length:', container.innerHTML.length)
          console.log('Container children:', container.children.length)
          
          // Log first few children for debugging
          for (let i = 0; i < Math.min(3, container.children.length); i++) {
            const child = container.children[i]
            console.log(`Child ${i}:`, child.tagName, child.className, `${child.offsetWidth}x${child.offsetHeight}`)
          }
          
          // Force height on surface elements
          surfaces.forEach((surface, index) => {
            if (surface.offsetHeight === 0) {
              console.log(`Fixing surface ${index} height`)
              surface.style.minHeight = '400px'
              surface.style.height = 'auto'
              surface.style.display = 'block'
              surface.style.overflow = 'visible'
            }
          })
          
          // Force visibility for canvas elements
          canvases.forEach((canvas, index) => {
            canvas.style.display = 'block'
            canvas.style.background = 'white'
            canvas.style.maxWidth = '100%'
            console.log(`Canvas ${index} dimensions:`, `${canvas.width}x${canvas.height}`, 'style:', `${canvas.offsetWidth}x${canvas.offsetHeight}`)
          })
          
          // Also handle SVG elements
          svgs.forEach((svg, index) => {
            svg.style.display = 'block'
            svg.style.background = 'white'
            svg.style.maxWidth = '100%'
            console.log(`SVG ${index} dimensions:`, svg.getAttribute('width'), 'x', svg.getAttribute('height'))
          })
          
          // Try to force a re-layout
          setTimeout(() => {
            if (this.alphaTabApi && surfaces.length > 0) {
              console.log('Attempting to trigger re-render...')
              this.alphaTabApi.render()
            }
          }, 100)
        }
      })
      
      // Player state changed
      this.alphaTabApi.playerStateChanged.on((e) => {
        this.isPlaying = e.state === 1 
      })
      
      // Player ready event
      this.alphaTabApi.playerReady.on(() => {
        this.isPlayerReady = true
        console.log('Player ready for playback')
      })
      
      // Error handling
      this.alphaTabApi.error.on((error) => {
        console.error('AlphaTab error:', error)
        this.error = `AlphaTab error: ${error.message || error}`
      })
      
      console.log('Event listeners setup complete')
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
      
      console.log('Changing to track:', this.selectedTrack, this.tracks[this.selectedTrack]?.name)
      
      try {
        // Render only the selected track using proper API
        this.alphaTabApi.renderTracks([this.tracks[this.selectedTrack]])
        console.log('Track change render initiated')
      } catch (error) {
        console.error('Error changing track:', error)
        this.error = `Failed to change track: ${error.message}`
      }
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

.electron-warning {
  color: #ff9500 !important;
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
  margin: 10px;
  overflow: auto;
}

/* Ensure both canvas and SVG elements are visible */
.alphatab-container canvas,
.alphatab-container svg {
  display: block !important;
  max-width: 100%;
  background: white;
}

/* Force visibility of any AlphaTab elements */
:deep(.alphaTab) {
  background: white !important;
  min-height: 400px !important;
}

:deep(.alphaTab canvas),
:deep(.alphaTab svg) {
  display: block !important;
  background: white !important;
}

/* Add basic styling for music notation elements */
:deep(.at-surface) {
  background: white !important;
  font-family: Arial, Helvetica, sans-serif !important;
  min-height: 400px !important;
  height: auto !important;
  display: block !important;
  overflow: visible !important;
  width: 100% !important;
}

/* Force visibility of any rendered content inside surface */
:deep(.at-surface *) {
  font-family: Arial, Helvetica, sans-serif !important;
  display: block !important;
}

/* Style for music symbols - fallback to basic glyphs */
:deep(.at) {
  font-family: Arial, Helvetica, sans-serif !important;
  font-size: 34px !important;
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
  font-family: Arial, Helvetica, sans-serif !important;
}

:deep(.at-surface) {
  background: white !important;
}

/* Force system fonts for all AlphaTab text elements */
:deep(.at-surface *) {
  font-family: Arial, Helvetica, sans-serif !important;
}

/* Ensure tablature numbers are visible */
:deep(.at-surface text) {
  font-family: Arial, Helvetica, sans-serif !important;
  fill: #000 !important;
}

/* Override any font loading styles */
:deep(.at-font-face) {
  display: none !important;
}

:deep(.at-viewport) {
  background: white !important;
}
</style>
