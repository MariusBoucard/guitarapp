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
        <button @click="showPlaylists = !showPlaylists" class="mixer-toggle-btn">
          {{ showPlaylists ? '📋 Hide Playlists' : '📋 Show Playlists' }}
        </button>
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
              <div v-for="tab in playlist.tabs" :key="tab.id" class="tab-item">
                <div class="tab-info" @click="loadTabFromPlaylist(tab)">
                  <span class="tab-name">{{ tab.name }}</span>
                  <span v-if="tab.artist" class="tab-artist">{{ tab.artist }}</span>
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
      expandedPlaylists: [],
      currentLoadedFile: null,
      currentLoadedFileName: '',
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
    }
  },
  mounted() {
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
        
        // Store current file info for playlist management
        this.currentLoadedFile = file
        this.currentLoadedFileName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
        
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
        album: ''
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
      // Set error message with file info
      this.error = `Please load the file manually: ${tab.name}${tab.path ? '\n\nPath: ' + tab.path : ''}`
      setTimeout(() => { this.error = null }, 5000)
      
      // In a full implementation with file handles, you could:
      // try {
      //   const response = await fetch(tab.path)
      //   const arrayBuffer = await response.arrayBuffer()
      //   this.alphaTabApi.load(arrayBuffer)
      // } catch (error) {
      //   this.error = `Failed to load tab: ${error.message}`
      // }
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

/* Playlists Panel */
.playlists-panel {
  background: rgba(42, 42, 42, 0.98);
  border-bottom: 1px solid var(--border-color, #444);
  max-height: 400px;
  overflow-y: auto;
  backdrop-filter: blur(5px);
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

.tab-item:hover {
  background: rgba(76, 175, 80, 0.1);
  border-color: var(--primary-color, #4CAF50);
}

.tab-info {
  flex: 1;
  cursor: pointer;
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
  color: white;
}

.delete-btn:hover {
  background: var(--danger-hover, #d32f2f);
}
</style>
