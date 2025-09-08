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
        <span v-if="isLoaded && !isPlayerReady" class="status-text">
          Loading player...
        </span>
        <span v-if="isElectron && isLoaded" class="status-text electron-info">
          🔇 Desktop mode - Visual playback only (no audio)
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
      originalFetch: null,
      // Manual playback properties
      playbackInterval: null,
      currentTick: 0,
      currentBeat: 0,
      tempo: 120 // Default tempo (BPM)
    }
  },
  computed: {
    canPlay() {
      // For Electron mode, just check if loaded; for web mode, check player readiness
      return this.isLoaded && (this.isElectron || (this.isPlayerReady && this.alphaTabApi?.isReadyForPlayback))
    }
  },
  mounted() {
    
    // Initialize AlphaTab with a delay to ensure DOM is ready
    this.$nextTick(() => {
      setTimeout(() => {
        this.initializeAlphaTab()
      }, 200)
    })
  },
  beforeUnmount() {
    // Clean up manual playback
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval)
    }
    
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


        // Clear any previous content
        this.$refs.alphaTab.innerHTML = ''

        // Check if running in Electron
        const isElectron = typeof window !== 'undefined' && window.process && window.process.type
        this.isElectron = isElectron
        

        const settings = new Settings()
        
        // Basic settings following the documentation
        settings.core.engine = 'svg'  // Use SVG for better compatibility
        settings.display.scale = 0.8
        
        // Player cursor settings for visual feedback
        settings.player.enableCursor = true
        settings.player.enableUserInteraction = true
        settings.player.enableElementHighlighting = true
        
        if (isElectron) {
          // Electron-specific settings - enable player for cursor but no audio
          settings.core.useWorkers = false  // Disable workers in Electron
          settings.player.enablePlayer = true  // Enable player for cursor functionality
          settings.player.playerMode = 0  // No audio synthesis
          settings.player.enableCursor = true
          settings.player.enableUserInteraction = true
          settings.player.enableElementHighlighting = true
          settings.player.scrollMode = 'continuous'
          
          // Set font directory to the location where Vite plugin copies fonts
          settings.core.fontDirectory = './font/'
        } else {
          // Web settings
          settings.player.enablePlayer = true
          settings.player.playerMode = 1 // Enable audio synthesis
          settings.player.soundFont = './soundfont/sonivox.sf2'
          settings.player.scrollMode = 'continuous' // Follow playback position
          
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
        
        // Setup event listeners with a small delay to ensure API is ready
        setTimeout(() => {
          this.setupEventListeners()
        }, 100)
        
        
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

      // Check if event listeners are available
      if (!this.alphaTabApi.scoreLoaded || typeof this.alphaTabApi.scoreLoaded.on !== 'function') {
        console.error('AlphaTab event listeners not available yet, retrying...')
        setTimeout(() => {
          this.setupEventListeners()
        }, 200)
        return
      }

      console.log('Setting up AlphaTab event listeners...')

      try {
        // Score loaded event
        if (this.alphaTabApi.scoreLoaded && this.alphaTabApi.scoreLoaded.on) {
          this.alphaTabApi.scoreLoaded.on((score) => {
            this.isLoaded = true
            this.tracks = score.tracks || []
            this.selectedTrack = 0
            this.currentScore = score
            this.error = null
            
            // Extract tempo from score if available
            if (score.masterVolume && score.masterVolume.dynamicValue) {
              this.tempo = score.masterVolume.dynamicValue || 120
            }
            
            console.log('Score loaded successfully:', {
              tracks: this.tracks.length,
              playerEnabled: this.alphaTabApi.settings?.player?.enablePlayer,
              tempo: this.tempo
            })
            
            // For Electron mode, mark player as ready since we'll handle playback manually
            if (this.isElectron) {
              this.isPlayerReady = true
              console.log('Electron mode: Player marked as ready for manual playback')
            } else {
              // Force player initialization after score load for web mode
              setTimeout(() => {
                if (this.alphaTabApi && !this.isPlayerReady) {
                  console.log('Attempting to trigger player ready state...')
                  this.alphaTabApi.renderTracks([this.tracks[0]])
                }
              }, 500)
            }
          })
        }
        
        // Render started event
        if (this.alphaTabApi.renderStarted && this.alphaTabApi.renderStarted.on) {
          this.alphaTabApi.renderStarted.on(() => {
            console.log('Render started')
          })
        }
        
        // Render finished event
        if (this.alphaTabApi.renderFinished && this.alphaTabApi.renderFinished.on) {
          this.alphaTabApi.renderFinished.on(() => {
        
            console.log('Render finished')
            
            // Debug: Check what was rendered
            const container = this.$refs.alphaTab
            if (container) {
              const canvases = container.querySelectorAll('canvas')
              const svgs = container.querySelectorAll('svg')
              const surfaces = container.querySelectorAll('.at-surface')

              // Force height on surface elements
              surfaces.forEach((surface, index) => {
                if (surface.offsetHeight === 0) {
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
              })
              
              // Also handle SVG elements
              svgs.forEach((svg, index) => {
                svg.style.display = 'block'
                svg.style.background = 'white'
                svg.style.maxWidth = '100%'
              })
              
              // Try to force a re-layout
              setTimeout(() => {
                if (this.alphaTabApi && surfaces.length > 0) {
                  this.alphaTabApi.render()
                }
              }, 100)
            }
          })
        }
        
        // Player events - set up for all modes now since player is enabled
        if (this.alphaTabApi.playerStateChanged && this.alphaTabApi.playerStateChanged.on) {
          this.alphaTabApi.playerStateChanged.on((e) => {
            console.log('Player state changed:', e.state)
            // Only update isPlaying state if not in manual mode (Electron)
            if (!this.isElectron) {
              this.isPlaying = e.state === 1 // 1 = playing, 0 = paused/stopped
            }
          })
        }
        
        if (this.alphaTabApi.playerReady && this.alphaTabApi.playerReady.on) {
          this.alphaTabApi.playerReady.on(() => {
            console.log('Player ready!')
            this.isPlayerReady = true
            
            // Additional check for playback readiness
            console.log('Player readiness check:', {
              isReadyForPlayback: this.alphaTabApi.isReadyForPlayback,
              playerMode: this.alphaTabApi.settings?.player?.playerMode,
              enablePlayer: this.alphaTabApi.settings?.player?.enablePlayer
            })
          })
        }
        
        if (this.alphaTabApi.playerPositionChanged && this.alphaTabApi.playerPositionChanged.on) {
          this.alphaTabApi.playerPositionChanged.on((e) => {
            console.log('Player position:', e.currentTick, 'Beat:', e.currentBeat?.index)
            this.$forceUpdate()
          })
        }
        
        if (this.alphaTabApi.playerFinished && this.alphaTabApi.playerFinished.on) {
          this.alphaTabApi.playerFinished.on(() => {
            console.log('Playback finished')
            if (!this.isElectron) {
              this.isPlaying = false
            }
          })
        }
        
        // Error handling
        if (this.alphaTabApi.error && this.alphaTabApi.error.on) {
          this.alphaTabApi.error.on((error) => {
            console.error('AlphaTab error:', error)
            this.error = `AlphaTab error: ${error.message || error}`
          })
        }
        
      } catch (error) {
        console.error('Error setting up event listeners:', error)
        this.error = `Failed to setup event listeners: ${error.message}`
      }
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
      console.log('playPause called, current state:', {
        alphaTabApi: !!this.alphaTabApi,
        isReadyForPlayback: this.alphaTabApi?.isReadyForPlayback,
        isPlaying: this.isPlaying,
        isPlayerReady: this.isPlayerReady,
        isElectron: this.isElectron
      })
      
      if (!this.alphaTabApi) {
        console.warn('AlphaTab API not available')
        return
      }
      
      // For Electron mode, use manual playback
      if (this.isElectron) {
        if (this.isPlaying) {
          this.pauseManualPlayback()
        } else {
          this.startManualPlayback()
        }
        return
      }
      
      // For web mode, use AlphaTab's built-in player
      if (!this.alphaTabApi.isReadyForPlayback) {
        console.warn('Player not ready for playback')
        if (this.currentScore) {
          console.log('Attempting to re-initialize player with current score')
          this.alphaTabApi.renderTracks([this.tracks[this.selectedTrack]])
        }
        return
      }
      
      try {
        if (this.isPlaying) {
          console.log('Pausing playback')
          this.alphaTabApi.pause()
        } else {
          console.log('Starting playback')
          this.alphaTabApi.play()
        }
      } catch (error) {
        console.error('Error during play/pause:', error)
        this.error = `Playback error: ${error.message}`
      }
    },
    
    startManualPlayback() {
      console.log('Starting manual playback for Electron mode')
      this.isPlaying = true
      this.currentTick = 0
      this.currentBeat = 0
      
      // Get the first track for timing calculations
      const track = this.tracks[this.selectedTrack]
      if (!track || !track.staves || track.staves.length === 0) {
        console.error('No track or staves available for playback')
        return
      }
      
      // Calculate timing based on the score's tempo
      const masterBar = this.currentScore.masterBars[0]
      const actualTempo = masterBar ? masterBar.tempo : this.tempo
      
      // Calculate interval (120 BPM = 500ms per quarter note)
      const beatInterval = (60 / actualTempo) * 250 // Faster updates for smoother cursor
      
      let currentMasterBarIndex = 0
      let currentBeatInBar = 0
      
      this.playbackInterval = setInterval(() => {
        try {
          // Move to next beat
          currentBeatInBar++
          
          // Check if we need to move to next bar
          const currentMasterBar = this.currentScore.masterBars[currentMasterBarIndex]
          if (currentMasterBar && currentBeatInBar >= currentMasterBar.timeSignatureDenominator) {
            currentBeatInBar = 0
            currentMasterBarIndex++
          }
          
          // Stop if we've reached the end
          if (currentMasterBarIndex >= this.currentScore.masterBars.length) {
            this.pauseManualPlayback()
            return
          }
          
          console.log(`Manual playback: bar ${currentMasterBarIndex}, beat ${currentBeatInBar}`)
          
          // Try to position cursor using AlphaTab's beat positioning
          if (this.alphaTabApi && this.currentScore.masterBars[currentMasterBarIndex]) {
            const masterBar = this.currentScore.masterBars[currentMasterBarIndex]
            const track = this.tracks[this.selectedTrack]
            
            if (track.staves[0] && track.staves[0].bars[currentMasterBarIndex]) {
              const bar = track.staves[0].bars[currentMasterBarIndex]
              
              // Try different positioning methods
              try {
                // Method 1: Use tickPosition if available
                if (typeof this.alphaTabApi.tickPosition === 'function') {
                  this.alphaTabApi.tickPosition(currentMasterBarIndex * 960 + currentBeatInBar * 240)
                }
                // Method 2: Use playerPositionChanged event simulation
                else if (this.alphaTabApi.renderer && this.alphaTabApi.renderer.boundsLookup) {
                  const boundsLookup = this.alphaTabApi.renderer.boundsLookup
                  const beatBounds = boundsLookup.findBeat(bar.voices[0].beats[currentBeatInBar])
                  if (beatBounds) {
                    // Simulate cursor positioning
                    this.highlightCurrentBeat(beatBounds)
                  }
                }
              } catch (e) {
                console.log('Cursor positioning method failed:', e.message)
              }
            }
          }
          
        } catch (error) {
          console.error('Error in manual playback:', error)
        }
      }, beatInterval)
    },
    
    highlightCurrentBeat(beatBounds) {
      // Manual cursor highlighting
      const container = this.$refs.alphaTab
      if (!container) return
      
      // Remove previous cursor
      const existingCursor = container.querySelector('.manual-cursor')
      if (existingCursor) {
        existingCursor.remove()
      }
      
      // Create new cursor element
      const cursor = document.createElement('div')
      cursor.className = 'manual-cursor'
      cursor.style.position = 'absolute'
      cursor.style.left = beatBounds.realBounds.x + 'px'
      cursor.style.top = beatBounds.realBounds.y + 'px'
      cursor.style.width = '3px'
      cursor.style.height = beatBounds.realBounds.h + 'px'
      cursor.style.backgroundColor = '#ff0000'
      cursor.style.opacity = '0.8'
      cursor.style.zIndex = '1000'
      cursor.style.pointerEvents = 'none'
      
      container.appendChild(cursor)
    },
    
    pauseManualPlayback() {
      console.log('Pausing manual playback')
      this.isPlaying = false
      if (this.playbackInterval) {
        clearInterval(this.playbackInterval)
        this.playbackInterval = null
      }
      
      // Remove manual cursor
      const container = this.$refs.alphaTab
      if (container) {
        const existingCursor = container.querySelector('.manual-cursor')
        if (existingCursor) {
          existingCursor.remove()
        }
      }
    },
    
    stop() {
      if (!this.alphaTabApi) {
        console.warn('AlphaTab API not available')
        return
      }
      
      // For Electron mode, stop manual playback
      if (this.isElectron) {
        console.log('Stopping manual playback')
        this.pauseManualPlayback()
        this.currentTick = 0
        this.currentBeat = 0
        return
      }
      
      // For web mode, use AlphaTab's built-in player
      try {
        console.log('Stopping playback')
        this.alphaTabApi.stop()
        this.isPlaying = false
      } catch (error) {
        console.error('Error during stop:', error)
        this.error = `Stop error: ${error.message}`
      }
    },
    
    changeTrack() {
      if (!this.alphaTabApi || !this.isLoaded || this.selectedTrack >= this.tracks.length) return
      
      
      try {
        // Render only the selected track using proper API
        this.alphaTabApi.renderTracks([this.tracks[this.selectedTrack]])
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

/* Player cursor and highlighting styles */
:deep(.at-cursor-bar) {
  background: #ff0000 !important;
  opacity: 0.8 !important;
  width: 3px !important;
  z-index: 1000 !important;
}

:deep(.at-selection) {
  background: rgba(255, 0, 0, 0.2) !important;
}

:deep(.at-cursor-beat) {
  background: rgba(255, 0, 0, 0.3) !important;
}

/* Ensure cursor elements are visible */
:deep(.at-cursor) {
  display: block !important;
  visibility: visible !important;
}

/* Manual cursor for Electron mode */
.manual-cursor {
  position: absolute !important;
  background: #ff0000 !important;
  opacity: 0.8 !important;
  width: 3px !important;
  z-index: 1000 !important;
  pointer-events: none !important;
  transition: left 0.1s ease-in-out !important;
}
</style>
