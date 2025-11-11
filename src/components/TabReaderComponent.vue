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
        <button @click="openFileWithPicker" class="load-btn" v-if="supportsFileSystemAccess">
          📂 Browse File
        </button>
        <button @click="openFileDialog" class="load-btn" v-else>
          📂 Load Guitar Pro File
        </button>
        <button v-if="canPlay" @click="playPause" class="play-btn" :class="{ 'playing': isPlaying }">
          {{ isPlaying ? '⏸️ Pause' : '▶️ Play' }}
        </button>
        <button v-if="canPlay" @click="stop" class="stop-btn">
          ⏹️ Stop
        </button>
        <button @click="showPlaylists = !showPlaylists" class="mixer-toggle-btn">
          {{ showPlaylists ? '📋 Hide Playlists' : '📋 Show Playlists' }}
        </button>
        <button @click="showAudioSettings = !showAudioSettings" class="mixer-toggle-btn">
          {{ showAudioSettings ? '🔊 Hide Audio' : '🔊 Audio Quality' }}
        </button>
        <div v-if="canPlay" class="speed-control">
          <span class="speed-label">Speed: {{ playbackSpeed }}%</span>
          <input 
            type="range" 
            min="30" 
            max="300" 
            v-model="playbackSpeed"
            @input="updatePlaybackSpeed"
            class="speed-slider"
          />
        </div>
      </div>
    </div>
    
    <!-- Playlists Panel -->
    <div v-if="showPlaylists" class="playlists-panel">
      <div class="playlists-header">
        <h4>Tab Playlists</h4>
        <button @click="showCreatePlaylistModal = true" class="create-playlist-btn">
          ➕ New Playlist
        </button>
      </div>
      
      <div class="playlists-container">
        <div v-if="tabPlaylists.length === 0" class="no-playlists">
          <p>No playlists yet. Create one to organize your tabs!</p>
          <p class="help-text">
            💡 Tip: Use "Browse File" button to load tabs with file access, 
            then add them to playlists for quick loading with a single click!
          </p>
        </div>
        
        <div v-for="playlist in tabPlaylists" :key="playlist.id" class="playlist-item">
          <div class="playlist-header" @click="togglePlaylist(playlist.id)">
            <span class="playlist-toggle">{{ expandedPlaylists.includes(playlist.id) ? '▼' : '▶' }}</span>
            <span class="playlist-name">{{ playlist.name }}</span>
            <span class="playlist-count">({{ playlist.tabs.length }} tabs)</span>
            <div class="playlist-actions">
              <button @click.stop="renamePlaylistPrompt(playlist)" class="action-btn" title="Rename">
                ✏️
              </button>
              <button @click.stop="deletePlaylistConfirm(playlist)" class="action-btn danger" title="Delete">
                🗑️
              </button>
            </div>
          </div>
          
          <div v-if="expandedPlaylists.includes(playlist.id)" class="playlist-content">
            <div v-if="playlist.tabs.length === 0" class="no-tabs">
              <p>No tabs in this playlist yet.</p>
              <button @click="addCurrentTabToPlaylist(playlist.id)" v-if="isLoaded" class="add-current-btn">
                ➕ Add Current Tab
              </button>
            </div>
            
            <div v-else class="tabs-list">
              <div v-for="tab in playlist.tabs" :key="tab.id" class="tab-item" :class="{ 'has-handle': tab.fileHandleId }">
                <div class="tab-info" @click="loadTabFromPlaylist(tab)">
                  <span class="tab-icon">{{ tab.fileHandleId ? '📄' : '📋' }}</span>
                  <div class="tab-details">
                    <span class="tab-name">{{ tab.name }}</span>
                    <span v-if="tab.artist" class="tab-artist">{{ tab.artist }}</span>
                    <span v-if="!tab.fileHandleId" class="tab-warning">⚠️ No file access</span>
                  </div>
                </div>
                <button @click="removeTabFromPlaylist(playlist.id, tab.id)" class="remove-tab-btn" title="Remove">
                  ✖
                </button>
              </div>
              
              <button @click="addCurrentTabToPlaylist(playlist.id)" v-if="isLoaded" class="add-current-btn">
                ➕ Add Current Tab
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Audio Settings Panel -->
    <div v-if="showAudioSettings" class="audio-settings-panel">
      <div class="settings-header">
        <h4>Audio Quality Settings</h4>
        <p class="help-text">
          💡 Better soundfonts = better sound quality! Download high-quality soundfonts and select them below.
        </p>
      </div>
      
      <div class="settings-container">
        <div class="setting-group">
          <label class="setting-label">SoundFont Selection:</label>
          <div class="soundfont-selector-row">
            <select v-model="selectedSoundFont" @change="changeSoundFont" class="soundfont-select">
              <option v-for="sf in availableSoundFonts" :key="sf.path" :value="sf.path">
                {{ sf.name }} {{ sf.recommended ? '⭐' : '' }} {{ sf.warning ? '⚠️' : '' }} - {{ sf.size }}
              </option>
            </select>
            <button @click="testSoundFont" class="test-soundfont-btn" title="Verify soundfont file">
              🔍 Test
            </button>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">
            <input type="checkbox" v-model="performanceMode" @change="togglePerformanceMode" style="margin-right: 0.5rem;">
            Performance Mode (Reduces CPU usage)
          </label>
          <p class="setting-hint">
            Disables some audio effects for better performance with large soundfonts.
          </p>
        </div>
        
        <div class="info-box">
          <h5>📥 How to Install Better SoundFonts:</h5>
          <ol>
            <li>Download a high-quality soundfont (see recommendations below)</li>
            <li>Place the .sf2 or .sf3 file in: <code>public/soundfont/</code></li>
            <li>Restart the app and select your soundfont from the dropdown</li>
          </ol>
          
          <h5>🎵 Recommended Free SoundFonts (Optimized for Performance):</h5>
          <div class="soundfont-recommendations">
            <div class="recommendation recommended">
              <strong>⭐ GeneralUser GS</strong> (30 MB) - BEST CHOICE
              <br>Great quality, low CPU usage, perfect balance
              <br><small>Download: <a href="https://schristiancollins.com/generaluser.php" target="_blank">schristiancollins.com</a></small>
            </div>
            <div class="recommendation recommended">
              <strong>⭐ MuseScore General</strong> (35 MB SF3) - EXCELLENT PERFORMANCE
              <br>Compressed format, very efficient, great sound
              <br><small>Download: <a href="https://ftp.osuosl.org/pub/musescore/soundfont/MuseScore_General/" target="_blank">MuseScore FTP</a></small>
            </div>
            <div class="recommendation">
              <strong>FluidR3 GM</strong> (142 MB) - High quality but heavy
              <br>⚠️ Warning: May cause performance issues
              <br><small>Download: <a href="https://member.keymusician.com/Member/FluidR3_GM/index.html" target="_blank">keymusician.com</a></small>
            </div>
            <div class="recommendation">
              <strong>Salamander Grand Piano</strong> (Sound samples) - Lighter alternative
              <br>For piano-focused playback, much lighter
              <br><small>Search: "Salamander Grand Piano samples"</small>
            </div>
          </div>
          
          <div class="performance-tip">
            💡 <strong>Performance Tip:</strong> Use SF3 files instead of SF2 when available. 
            SF3 is compressed and uses significantly less CPU and memory!
          </div>
          
          <div class="warning-box">
            ⚠️ <strong>Note:</strong> The current "Sonivox" soundfont is optimized for mobile devices (low quality).
            Replace it with a professional soundfont for dramatically better sound!
          </div>
        </div>
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
    
    <!-- Create Playlist Modal -->
    <div v-if="showCreatePlaylistModal" class="modal-overlay" @click="showCreatePlaylistModal = false">
      <div class="modal-content" @click.stop>
        <h4>Create New Playlist</h4>
        <input 
          v-model="newPlaylistName" 
          type="text" 
          placeholder="Enter playlist name"
          class="modal-input"
          @keyup.enter="confirmCreatePlaylist"
          @keyup.esc="showCreatePlaylistModal = false"
          ref="playlistNameInput"
        />
        <div class="modal-actions">
          <button @click="showCreatePlaylistModal = false" class="modal-btn cancel-btn">
            Cancel
          </button>
          <button @click="confirmCreatePlaylist" class="modal-btn confirm-btn">
            Create
          </button>
        </div>
      </div>
    </div>
    
    <!-- Rename Playlist Modal -->
    <div v-if="showRenamePlaylistModal" class="modal-overlay" @click="cancelRename">
      <div class="modal-content" @click.stop>
        <h4>Rename Playlist</h4>
        <input 
          v-model="newPlaylistName" 
          type="text" 
          placeholder="Enter new playlist name"
          class="modal-input"
          @keyup.enter="confirmRename"
          @keyup.esc="cancelRename"
          ref="renameInput"
        />
        <div class="modal-actions">
          <button @click="cancelRename" class="modal-btn cancel-btn">
            Cancel
          </button>
          <button @click="confirmRename" class="modal-btn confirm-btn">
            Rename
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h4>Delete Playlist</h4>
        <p>Are you sure you want to delete playlist "{{ playlistToDelete?.name }}"?</p>
        <p class="modal-note">This will not delete the tab files.</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="modal-btn cancel-btn">
            Cancel
          </button>
          <button @click="confirmDelete" class="modal-btn delete-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AlphaTabApi, Settings } from '@coderline/alphatab'
import { useTabStore } from '../stores/tabStore.js'
import { fileHandleService } from '../services/fileHandleService.js'

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
      showMixer: false,
      showPlaylists: false,
      showAudioSettings: false,
      playbackSpeed: 100,
      expandedPlaylists: [],
      selectedSoundFont: './soundfont/sonivox.sf2',
      performanceMode: false,
      availableSoundFonts: [
        { name: 'MuseScore General HQ (⭐ Best Choice)', path: './soundfont/MuseScore_General.sf3', size: '35 MB', recommended: true },
        { name: 'GeneralUser GS (Great Balance)', path: './soundfont/GeneralUser_GS.sf2', size: '30 MB', recommended: true },
        { name: 'Sonivox (Original Default)', path: './soundfont/sonivox.sf2', size: '2 MB' },
        { name: 'Sonivox (Compressed)', path: './soundfont/sonivox.sf3', size: '1 MB' },
        { name: 'FluidR3 GM (High Quality - Heavy)', path: './soundfont/FluidR3_GM.sf2', size: '142 MB', warning: 'High CPU usage' },
        { name: 'SGM-V2.01 (Pro Quality - Very Heavy)', path: './soundfont/SGM-V2.01.sf2', size: '239 MB', warning: 'Very high CPU' }
      ],
      customSoundFontFile: null,
      currentLoadedFile: null,
      currentLoadedFileName: '',
      currentFileHandle: null, // Current file handle (not persisted)
      currentFileHandleId: null, // ID of stored file handle in IndexedDB
      // Modal states
      showCreatePlaylistModal: false,
      showRenamePlaylistModal: false,
      newPlaylistName: '',
      playlistToRename: null,
      playlistToDelete: null,
      showDeleteConfirm: false
    }
  },
  computed: {
    canPlay() {
      return this.isLoaded && this.isPlayerReady
    },
    tabStore() {
      return useTabStore()
    },
    tabPlaylists() {
      return this.tabStore.tabPlaylists
    },
    supportsFileSystemAccess() {
      return 'showOpenFilePicker' in window
    }
  },
  async mounted() {
    // Load saved soundfont preference
    const savedSoundFont = localStorage.getItem('guitarapp_soundfont')
    if (savedSoundFont) {
      // Test if saved soundfont exists before using it
      try {
        const response = await fetch(savedSoundFont, { method: 'HEAD' })
        if (response.ok) {
          this.selectedSoundFont = savedSoundFont
        } else {
          console.warn('Saved soundfont not found, using default')
          // Try MuseScore as default
          this.selectedSoundFont = './soundfont/MuseScore_General.sf3'
        }
      } catch (err) {
        console.warn('Could not verify saved soundfont:', err)
        this.selectedSoundFont = './soundfont/MuseScore_General.sf3'
      }
    } else {
      // Default to MuseScore instead of Sonivox
      this.selectedSoundFont = './soundfont/MuseScore_General.sf3'
    }
    
    // Load performance mode preference
    const savedPerformanceMode = localStorage.getItem('guitarapp_performanceMode')
    if (savedPerformanceMode !== null) {
      this.performanceMode = savedPerformanceMode === 'true'
    }
    
    this.$nextTick(() => {
      this.initializeAlphaTab()
    })
    // Initialize tab store data
    this.tabStore.loadFromStorage()
  },
  watch: {
    showCreatePlaylistModal(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.$refs.playlistNameInput?.focus()
        })
      }
    }
  },
  beforeUnmount() {
    if (this.alphaTabApi) {
      this.alphaTabApi.destroy()
    }
  },
  methods: {
    updatePlaybackSpeed() {
      if (this.alphaTabApi) {
        // Convert percentage to decimal (e.g., 150% -> 1.5)
        const speedFactor = this.playbackSpeed / 100
        this.alphaTabApi.playbackSpeed = speedFactor
      }
    },

    initializeAlphaTab() {
      try {
        if (!this.$refs.alphaTab) {
          this.error = 'Failed to find AlphaTab container element'
          return
        }

        this.$refs.alphaTab.innerHTML = ''

        const settings = new Settings()
        
        settings.core.engine = 'html5' 
        settings.core.useWorkers = true 
        settings.display.scale = 1.0
        settings.display.stretchForce = 0.8
        
        settings.display.layoutMode = 'page'  
        settings.core.enableLazyLoading = true  
        
        // Player settings
        settings.player.enablePlayer = true
        settings.player.enableAudioSynthesis = true
        settings.player.soundFont = this.selectedSoundFont
        settings.player.enableCursor = true  
        settings.player.enableUserInteraction = true
        settings.player.enableElementHighlighting = true  // Highlight current element
        settings.player.scrollMode = 'continuous'  // Enable continuous scrolling
        settings.player.scrollElement = this.$refs.alphaTab  // Set scroll container for reference
        settings.display.layoutMode = 'horizontal-screen'  // Use screen-based layout
        settings.display.autoSize = true
        settings.player.scrollOffsetY = -30  // Add some padding above the current position

        // Setup better visual organization
        settings.notation.notationMode = "SongBook"  // More compact notation
        settings.staveProfile = "ScoreTab"  // Show both score and tab
        
        // Apply performance mode settings
        if (this.performanceMode) {
          settings.player.vibrato = false  // Disable vibrato for better performance
          settings.display.resources.effectFont = null  // Reduce font rendering
        }
     const isElectron = window.process?.versions?.electron
    
    if (isElectron) {
      // In Electron, use paths relative to the loaded HTML file
      // Use the .min.mjs files for production
      const baseUrl = window.location.href.replace(/[^/]*$/, '')
      settings.core.scriptFile = `${baseUrl}alphatab/alphaTab.worker.min.mjs`
      settings.core.fontDirectory = `${baseUrl}alphatab/font/`
      
      // Set the worklet for audio synthesis
      settings.player.enableAudioWorklet = true
      settings.player.scriptFile = `${baseUrl}alphatab/alphaTab.worklet.min.mjs`
    }
        // Core settings
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
      
      // Player position changed - handle auto-scrolling with AlphaTab's cursor
      this.alphaTabApi.playerPositionChanged.on((e) => {
        if (!this.$refs.alphaTab || !this.isPlaying) return
        
        const container = this.$refs.alphaTab
        
        // Find both cursor elements
        const cursorBar = container.querySelector('.at-cursor-bar')
        const cursorBeat = container.querySelector('.at-cursor-beat')
        const cursor = cursorBeat || cursorBar // Prefer beat cursor, fall back to bar cursor
        
        if (!cursor) return
        
        // Get the surface element (the container that holds all the rendered content)
        const surface = container.querySelector('.at-surface')
        if (!surface) return
        
        // Get cursor's absolute position relative to the viewport
        const cursorRect = cursor.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        
        // Calculate cursor's position relative to the container
        const cursorRelativeTop = cursorRect.top - containerRect.top
        const cursorRelativeBottom = cursorRect.bottom - containerRect.top
        
        // Define the visible area with padding
        const visibleAreaPadding = 100 // pixels of padding above and below
        const isAboveVisible = cursorRelativeTop < visibleAreaPadding
        const isBelowVisible = cursorRelativeBottom > (containerRect.height - visibleAreaPadding)
        
        if (isAboveVisible || isBelowVisible) {
          // Calculate the ideal scroll position
          let targetScrollTop
          
          if (isAboveVisible) {
            // Scroll up to show content above the cursor
            targetScrollTop = container.scrollTop - (visibleAreaPadding - cursorRelativeTop)
          } else {
            // Scroll down to show content below the cursor
            targetScrollTop = container.scrollTop + (cursorRelativeBottom - (containerRect.height - visibleAreaPadding))
          }
          
          // Ensure we don't scroll beyond the content
          const maxScroll = surface.offsetHeight - containerRect.height
          targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll))
          
          // Apply the scroll with smooth animation
          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          })
        }
      })
      
      // Error handling
      this.alphaTabApi.error.on((error) => {
        if (error.type === 'FormatError' && error.message && error.message.includes('Soundfont')) {
          this.error = `❌ Invalid SoundFont File

The selected soundfont is not valid or corrupted.

Possible causes:
• File is not actually a .sf2/.sf3 soundfont
• File was corrupted during download
• Wrong file was placed in the folder

Solutions:
1. Re-download the soundfont from official source
2. Verify the file extension is .sf2 or .sf3
3. Try a different soundfont (e.g., GeneralUser GS)
4. Switch back to Sonivox (default) which is already installed`
        } else {
          this.error = `Error: ${error.message || error}`
        }
        console.error('AlphaTab error:', error)
      })
    },    openFileDialog() {
      this.$refs.fileInput.click()
    },
    
    async openFileWithPicker() {
      try {
        // Use File System Access API
        const [fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'Guitar Pro Files',
              accept: {
                'application/x-guitar-pro': ['.gp', '.gp3', '.gp4', '.gp5', '.gpx', '.gp6', '.ptb']
              }
            }
          ],
          multiple: false
        })
        
        if (fileHandle) {
          await this.loadFileFromHandle(fileHandle)
        }
      } catch (err) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          this.error = `Failed to open file: ${err.message}`
          console.error('File picker error:', err)
        }
      }
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
        
        // Store current file info for playlist management
        this.currentLoadedFile = file
        this.currentLoadedFileName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
        this.currentFileHandle = null // File input doesn't provide handle
        
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
    
    async loadFileFromHandle(fileHandle, handleId = null) {
      try {
        this.error = null
        this.isLoaded = false
        this.isPlayerReady = false
        
        if (!this.alphaTabApi) {
          throw new Error('AlphaTab is not initialized. Please try again.')
        }
        
        // Request permission if needed
        const permission = await fileHandle.queryPermission({ mode: 'read' })
        if (permission !== 'granted') {
          const newPermission = await fileHandle.requestPermission({ mode: 'read' })
          if (newPermission !== 'granted') {
            throw new Error('File access permission denied')
          }
        }
        
        const file = await fileHandle.getFile()
        
        // Validate file type
        const validExtensions = ['.gp', '.gp3', '.gp4', '.gp5', '.gpx', '.gp6', '.ptb']
        const fileName = file.name.toLowerCase()
        const isValidFile = validExtensions.some(ext => fileName.endsWith(ext))
        
        if (!isValidFile) {
          throw new Error('Invalid file type. Please select a Guitar Pro file')
        }
        
        // Store current file info
        this.currentLoadedFile = file
        this.currentLoadedFileName = file.name.replace(/\.[^/.]+$/, '')
        this.currentFileHandle = fileHandle
        
        // Store file handle in IndexedDB if not already stored
        if (!handleId) {
          this.currentFileHandleId = await fileHandleService.storeFileHandle(fileHandle)
        } else {
          this.currentFileHandleId = handleId
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
    },
    
    // Audio settings methods
    async changeSoundFont() {
      if (!this.alphaTabApi) return
      
      try {
        // Show loading message
        this.error = 'Loading new soundfont... This may take a moment.'
        
        // Validate soundfont file
        const validation = await this.validateSoundFont(this.selectedSoundFont)
        if (!validation.valid) {
          throw new Error(validation.error)
        }
        
        // Store current state
        const currentScore = this.alphaTabApi.score
        const wasPlaying = this.isPlaying
        const currentTime = this.alphaTabApi.timePosition
        
        if (wasPlaying) {
          this.alphaTabApi.pause()
        }
        
        // Save preference first
        localStorage.setItem('guitarapp_soundfont', this.selectedSoundFont)
        
        // Destroy and reinitialize AlphaTab with new soundfont
        this.alphaTabApi.destroy()
        this.alphaTabApi = null
        
        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Reinitialize with new soundfont
        this.initializeAlphaTab()
        
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Reload the score if one was loaded
        if (currentScore && this.currentLoadedFile) {
          try {
            // Get the score data as array buffer
            let scoreData
            if (this.currentLoadedFile instanceof File) {
              scoreData = await this.currentLoadedFile.arrayBuffer()
            } else if (this.currentFileHandle) {
              // Reload from file handle
              const file = await this.currentFileHandle.getFile()
              scoreData = await file.arrayBuffer()
            }
            
            if (scoreData) {
              this.alphaTabApi.load(scoreData)
              
              // Wait for score to load with timeout
              await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                  clearInterval(checkReady)
                  resolve()
                }, 10000) // 10 second timeout
                
                const checkReady = setInterval(() => {
                  if (this.isPlayerReady) {
                    clearInterval(checkReady)
                    clearTimeout(timeout)
                    resolve()
                  }
                }, 100)
              })
              
              // Restore playback position if it was playing
              if (wasPlaying && currentTime > 0) {
                this.alphaTabApi.timePosition = currentTime
                // Optionally resume playback
                // this.alphaTabApi.play()
              }
            }
          } catch (reloadErr) {
            console.warn('Could not reload score:', reloadErr)
            this.error = '✅ SoundFont loaded! Please reload your tab file.'
            setTimeout(() => { this.error = null }, 5000)
            return
          }
        }
        
        this.error = '✅ SoundFont loaded successfully!'
        setTimeout(() => { this.error = null }, 3000)
        
      } catch (err) {
        this.error = err.message
        console.error('SoundFont loading error:', err)
        setTimeout(() => { this.error = null }, 5000)
      }
    },
    
    togglePerformanceMode() {
      // Save preference
      localStorage.setItem('guitarapp_performanceMode', this.performanceMode)
      
      // If AlphaTab is loaded, reinitialize with new settings
      if (this.alphaTabApi) {
        this.error = 'Performance mode changed. Reloading...'
        setTimeout(async () => {
          await this.changeSoundFont()
        }, 500)
      }
    },
    
    async validateSoundFont(path) {
      try {
        // Check if file exists
        const response = await fetch(path, { method: 'HEAD' })
        if (!response.ok) {
          return {
            valid: false,
            error: `SoundFont file not found at: ${path}\n\nPlease:\n1. Download the soundfont\n2. Place it in public/soundfont/\n3. Make sure the filename matches exactly`
          }
        }
        
        // Check file extension
        const extension = path.toLowerCase().split('.').pop()
        if (!['sf2', 'sf3'].includes(extension)) {
          return {
            valid: false,
            error: `Invalid file format: .${extension}\n\nOnly .sf2 and .sf3 soundfonts are supported.`
          }
        }
        
        // Check file size (basic validation)
        const contentLength = response.headers.get('content-length')
        if (contentLength) {
          const sizeMB = parseInt(contentLength) / (1024 * 1024)
          if (sizeMB < 0.1) {
            return {
              valid: false,
              error: `File is too small (${sizeMB.toFixed(2)} MB). It may be corrupted or not a valid soundfont.`
            }
          }
        }
        
        // Try to read the file header to verify it's a valid soundfont
        const headerResponse = await fetch(path, {
          headers: { 'Range': 'bytes=0-11' }
        })
        
        if (headerResponse.ok) {
          const buffer = await headerResponse.arrayBuffer()
          const view = new DataView(buffer)
          
          // Check for RIFF header (SF2 files start with "RIFF")
          const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3))
          if (riff !== 'RIFF') {
            return {
              valid: false,
              error: `Invalid soundfont format. File does not have a valid RIFF header.\n\nThe file may be:\n- Corrupted during download\n- Not actually a soundfont file\n- In an unsupported format`
            }
          }
          
          // Check for sfbk signature (SF2 files have "sfbk" at offset 8)
          const sfbk = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11))
          if (sfbk !== 'sfbk') {
            return {
              valid: false,
              error: `Invalid soundfont format. File is a RIFF file but not a soundfont.\n\nMake sure you downloaded a .sf2 or .sf3 file, not a webpage or other file type.`
            }
          }
        }
        
        return { valid: true }
        
      } catch (error) {
        return {
          valid: false,
          error: `Error validating soundfont: ${error.message}\n\nMake sure the file is accessible and not corrupted.`
        }
      }
    },
    
    // Playlist management methods
    confirmCreatePlaylist() {
      if (this.newPlaylistName && this.newPlaylistName.trim()) {
        const playlistId = this.tabStore.createPlaylist(this.newPlaylistName.trim())
        this.expandedPlaylists.push(playlistId)
        this.showCreatePlaylistModal = false
        this.newPlaylistName = ''
      }
    },
    
    togglePlaylist(playlistId) {
      const index = this.expandedPlaylists.indexOf(playlistId)
      if (index > -1) {
        this.expandedPlaylists.splice(index, 1)
      } else {
        this.expandedPlaylists.push(playlistId)
      }
    },
    
    renamePlaylistPrompt(playlist) {
      this.playlistToRename = playlist
      this.newPlaylistName = playlist.name
      this.showRenamePlaylistModal = true
      this.$nextTick(() => {
        this.$refs.renameInput?.focus()
      })
    },
    
    confirmRename() {
      if (this.newPlaylistName && this.newPlaylistName.trim() && 
          this.playlistToRename && this.newPlaylistName !== this.playlistToRename.name) {
        this.tabStore.renamePlaylist(this.playlistToRename.id, this.newPlaylistName.trim())
      }
      this.cancelRename()
    },
    
    cancelRename() {
      this.showRenamePlaylistModal = false
      this.playlistToRename = null
      this.newPlaylistName = ''
    },
    
    deletePlaylistConfirm(playlist) {
      this.playlistToDelete = playlist
      this.showDeleteConfirm = true
    },
    
    confirmDelete() {
      if (this.playlistToDelete) {
        this.tabStore.deletePlaylist(this.playlistToDelete.id)
        // Remove from expanded list
        const index = this.expandedPlaylists.indexOf(this.playlistToDelete.id)
        if (index > -1) {
          this.expandedPlaylists.splice(index, 1)
        }
      }
      this.cancelDelete()
    },
    
    cancelDelete() {
      this.showDeleteConfirm = false
      this.playlistToDelete = null
    },
    
    addCurrentTabToPlaylist(playlistId) {
      if (!this.isLoaded || !this.currentLoadedFile) {
        this.error = 'No tab is currently loaded'
        setTimeout(() => { this.error = null }, 3000)
        return
      }
      
      // Extract metadata from current tab
      const tabData = {
        name: this.currentLoadedFileName || 'Untitled Tab',
        path: this.currentLoadedFile.name || '',
        artist: '',
        album: '',
        fileHandleId: this.currentFileHandleId // Store the file handle ID from IndexedDB
      }
      
      // Try to get more info from AlphaTab if available
      if (this.alphaTabApi?.score) {
        tabData.name = this.alphaTabApi.score.title || tabData.name
        tabData.artist = this.alphaTabApi.score.artist || ''
        tabData.album = this.alphaTabApi.score.album || ''
      }
      
      this.tabStore.addTabToPlaylist(playlistId, tabData)
    },
    
    removeTabFromPlaylist(playlistId, tabId) {
      this.tabStore.removeTabFromPlaylist(playlistId, tabId)
    },
    
    async loadTabFromPlaylist(tab) {
      // If we have a file handle ID, retrieve it from IndexedDB
      if (tab.fileHandleId) {
        try {
          const fileHandle = await fileHandleService.getFileHandle(tab.fileHandleId)
          
          if (!fileHandle) {
            throw new Error('File handle not found. It may have been cleared.')
          }
          
          // Try to load the file
          await this.loadFileFromHandle(fileHandle, tab.fileHandleId)
        } catch (error) {
          this.error = `Failed to load tab: ${error.message}`
          setTimeout(() => { this.error = null }, 5000)
          console.error('Error loading tab from playlist:', error)
        }
      } else {
        // No file handle - need to ask user to select file
        this.error = `This tab doesn't have file access saved. Please use "Browse File" button and re-add it to the playlist: ${tab.name}`
        setTimeout(() => { this.error = null }, 5000)
      }
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
  padding: 10px 20px;
  overflow: auto;
  position: relative;
  scroll-behavior: smooth;
  height: calc(100vh - 200px);
  contain: paint;  /* Optimize rendering performance */
  overflow-x: hidden;
  position: relative;
  scroll-behavior: smooth;  /* Smooth scrolling for better UX */
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
  text-align: left;
  white-space: pre-line;
  line-height: 1.6;
  font-size: 0.95rem;
}

.error p {
  margin: 0;
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

/* Playlists Panel */
.playlists-panel {
  background: rgba(42, 42, 42, 0.98);
  border-bottom: 1px solid var(--border-color, #444);
  max-height: 400px;
  min-height: 200px;
  overflow-y: auto;
  backdrop-filter: blur(5px);
  flex-shrink: 0;
}

/* Audio Settings Panel */
.audio-settings-panel {
  background: rgba(42, 42, 42, 0.98);
  border-bottom: 1px solid var(--border-color, #444);
  max-height: 500px;
  overflow-y: auto;
  backdrop-filter: blur(5px);
  flex-shrink: 0;
}

.settings-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #444);
  background: rgba(26, 26, 26, 0.98);
}

.settings-header h4 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color, #4CAF50);
  font-size: 1.1rem;
}

.settings-header .help-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted, #888);
  font-style: italic;
}

.settings-container {
  padding: 1rem;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color, #fff);
  font-weight: bold;
  font-size: 0.95rem;
}

.setting-hint {
  margin: 0.5rem 0 0 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  color: var(--text-muted, #888);
  font-size: 0.85rem;
  line-height: 1.4;
}

.soundfont-select {
  width: 100%;
  padding: 0.75rem;
  background: var(--input-bg, #333);
  color: var(--text-color, #fff);
  border: 1px solid var(--border-color, #444);
  border-radius: 4px;
  font-size: 0.95rem;
  cursor: pointer;
}

.soundfont-select:focus {
  outline: none;
  border-color: var(--primary-color, #4CAF50);
}

.info-box {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid var(--primary-color, #4CAF50);
  border-radius: 6px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.info-box h5 {
  margin: 0 0 0.75rem 0;
  color: var(--primary-color, #4CAF50);
  font-size: 1rem;
}

.info-box ol {
  margin: 0 0 1.5rem 1.5rem;
  padding: 0;
  color: var(--text-color, #fff);
  line-height: 1.6;
}

.info-box li {
  margin-bottom: 0.5rem;
}

.info-box code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  color: #4CAF50;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.soundfont-recommendations {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendation {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 3px solid var(--primary-color, #4CAF50);
  color: var(--text-color, #fff);
  line-height: 1.5;
}

.recommendation strong {
  color: var(--primary-color, #4CAF50);
  font-size: 1rem;
}

.recommendation small {
  color: var(--text-muted, #888);
}

.recommendation a {
  color: #2196F3;
  text-decoration: none;
  transition: color 0.2s;
}

.recommendation a:hover {
  color: #64B5F6;
  text-decoration: underline;
}

.recommendation.recommended {
  border-left-color: #FFD700;
  background: rgba(255, 215, 0, 0.1);
}

.recommendation.recommended strong {
  color: #FFD700;
}

.performance-tip {
  margin-top: 1rem;
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid #2196F3;
  border-radius: 4px;
  padding: 1rem;
  color: #64B5F6;
  line-height: 1.5;
}

.warning-box {
  margin-top: 1.5rem;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid #ff9800;
  border-radius: 4px;
  padding: 1rem;
  color: #ff9800;
  line-height: 1.5;
}

.playlists-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color, #444);
  background: rgba(26, 26, 26, 0.98);
}

.playlists-header h4 {
  margin: 0;
  color: var(--primary-color, #4CAF50);
  font-size: 1.1rem;
}

.create-playlist-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color, #4CAF50);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.create-playlist-btn:hover {
  background: var(--primary-hover, #45a049);
}

.playlists-container {
  padding: 1rem;
}

.no-playlists {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted, #888);
}

.no-playlists p {
  margin: 0.5rem 0;
}

.help-text {
  font-size: 0.9rem;
  color: var(--text-muted, #888);
  font-style: italic;
  max-width: 600px;
  margin: 1rem auto 0;
  line-height: 1.4;
}

.playlist-item {
  margin-bottom: 0.75rem;
  background: var(--header-bg, #2a2a2a);
  border: 1px solid var(--border-color, #444);
  border-radius: 6px;
  overflow: hidden;
}

.playlist-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.playlist-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.playlist-toggle {
  color: var(--primary-color, #4CAF50);
  font-size: 0.9rem;
  width: 20px;
}

.playlist-name {
  color: var(--text-color, #fff);
  font-weight: bold;
  flex: 1;
}

.playlist-count {
  color: var(--text-muted, #888);
  font-size: 0.9rem;
}

.playlist-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border-color, #444);
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary-color, #4CAF50);
}

.action-btn.danger:hover {
  border-color: var(--danger-color, #f44336);
}

.playlist-content {
  padding: 0.75rem;
  border-top: 1px solid var(--border-color, #444);
  background: rgba(0, 0, 0, 0.2);
}

.no-tabs {
  text-align: center;
  padding: 1rem;
  color: var(--text-muted, #888);
}

.tabs-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: var(--input-bg, #333);
  border: 1px solid var(--border-color, #444);
  border-radius: 4px;
  transition: all 0.2s;
}

.tab-item.has-handle {
  border-left: 3px solid var(--primary-color, #4CAF50);
}

.tab-item:hover {
  background: rgba(76, 175, 80, 0.1);
  border-color: var(--primary-color, #4CAF50);
}

.tab-info {
  flex: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.tab-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tab-name {
  color: var(--text-color, #fff);
  font-weight: 500;
}

.tab-artist {
  color: var(--text-muted, #888);
  font-size: 0.85rem;
}

.tab-warning {
  color: #ff9500;
  font-size: 0.75rem;
  font-style: italic;
}

.remove-tab-btn {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border-color, #444);
  border-radius: 3px;
  cursor: pointer;
  color: var(--text-muted, #888);
  transition: all 0.2s;
}

.remove-tab-btn:hover {
  background: var(--danger-color, #f44336);
  border-color: var(--danger-color, #f44336);
  color: white;
}

.add-current-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: transparent;
  border: 2px dashed var(--border-color, #444);
  border-radius: 4px;
  cursor: pointer;
  color: var(--primary-color, #4CAF50);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.add-current-btn:hover {
  background: rgba(76, 175, 80, 0.1);
  border-color: var(--primary-color, #4CAF50);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: var(--header-bg, #2a2a2a);
  border: 2px solid var(--border-color, #444);
  border-radius: 8px;
  padding: 1.5rem;
  min-width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-content h4 {
  margin: 0 0 1rem 0;
  color: var(--primary-color, #4CAF50);
  font-size: 1.2rem;
}

.modal-content p {
  margin: 0.5rem 0;
  color: var(--text-color, #fff);
}

.modal-note {
  font-size: 0.9rem;
  color: var(--text-muted, #888);
  font-style: italic;
}

.modal-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--input-bg, #333);
  border: 1px solid var(--border-color, #444);
  border-radius: 4px;
  color: var(--text-color, #fff);
  font-size: 1rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: var(--primary-color, #4CAF50);
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.cancel-btn {
  background: var(--input-bg, #333);
  color: var(--text-color, #fff);
  border: 1px solid var(--border-color, #444);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.confirm-btn {
  background: var(--primary-color, #4CAF50);
  color: white;
}

.confirm-btn:hover {
  background: var(--primary-hover, #45a049);
}

.delete-btn {
  background: var(--danger-color, #f44336);
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 15px;
}

.speed-label {
  min-width: 85px;
  color: var(--text-color, #fff);
}

.speed-slider {
  width: 150px;
  height: 5px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--primary-color, #4CAF50);
  outline: none;
  border-radius: 3px;
  cursor: pointer;
}

.speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
}

.speed-slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}


.delete-btn:hover {
  background: var(--danger-hover, #d32f2f);
}
</style>
