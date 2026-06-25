<template>
  <div class="tab-reader">
    <!-- ─── Header ─── -->
    <header class="tab-header">
      <div class="tab-header__left">
        <h3 class="tab-title">{{ $t('tab_reader.title') }}</h3>
        <span v-if="isLoaded" class="tab-filename">{{ currentLoadedFileName }}</span>
      </div>
      <div class="tab-header__right">
        <input
          ref="fileInput"
          type="file"
          accept=".gp,.gp3,.gp4,.gp5,.gpx,.gp6,.ptb"
          @change="loadFile"
          style="display: none"
        />
        <button @click="openFileWithPicker" class="btn btn--sm" v-if="supportsFileSystemAccess">
          {{ $t('tab_reader.browse_file') }}
        </button>
        <button @click="openFileDialog" class="btn btn--sm" v-else>
          {{ $t('tab_reader.load_guitarpro') }}
        </button>
        <button @click="openTexJSON()" class="btn btn--sm">
          {{ $t('tab_reader.open_tab_json') }}
        </button>
        <button v-if="isLoaded" @click="exportGP" class="btn btn--sm btn--accent">⬇ GP</button>
        <button v-if="isLoaded" @click="exportMidi" class="btn btn--sm btn--accent">⬇ MIDI</button>
        <button @click="showPlaylists = !showPlaylists" class="btn btn--sm btn--outline">
          {{ $t('tab_reader.show_playlists') }}
        </button>
        <button @click="showAudioSettings = !showAudioSettings" class="btn btn--sm btn--outline">
          {{ $t('tab_reader.audio_quality') }}
        </button>
      </div>
    </header>

    <!-- ─── Playlists Panel (sliding) ─── -->
    <div v-if="showPlaylists" class="panels">
      <div class="playlists-panel">
        <div class="panel-header">
          <h4>{{ $t('tab_reader.tab_playlists') }}</h4>
          <button @click="showCreatePlaylistModal = true" class="btn btn--sm btn--primary">
            {{ $t('tab_reader.new_playlist') }}
          </button>
        </div>
        <div class="playlists-body">
          <div v-if="tabPlaylists.length === 0" class="empty-state">
            <p>{{ $t('tab_reader.no_playlists') }}</p>
          </div>
          <div v-for="playlist in tabPlaylists" :key="playlist.id" class="playlist-item">
            <div class="playlist-head" @click="togglePlaylist(playlist.id)">
              <span class="playlist-arrow">{{
                expandedPlaylists.includes(playlist.id) ? '▾' : '▸'
              }}</span>
              <span class="playlist-name">{{ playlist.name }}</span>
              <span class="playlist-count">({{ playlist.tabs.length }})</span>
              <button @click.stop="renamePlaylistPrompt(playlist)" class="icon-btn">✎</button>
              <button
                @click.stop="deletePlaylistConfirm(playlist)"
                class="icon-btn icon-btn--danger"
              >
                ×
              </button>
            </div>
            <div v-if="expandedPlaylists.includes(playlist.id)" class="playlist-body">
              <div v-if="playlist.tabs.length === 0" class="empty-state">
                <p>{{ $t('tab_reader.no_tabs_in_playlist') }}</p>
              </div>
              <div
                v-for="tab in playlist.tabs"
                :key="tab.id"
                class="tab-entry"
                :class="{ 'tab-entry--handle': tab.fileHandleId }"
              >
                <span class="tab-entry__name" @click="loadTabFromPlaylist(tab)">{{
                  tab.name
                }}</span>
                <span v-if="tab.artist" class="tab-entry__artist">{{ tab.artist }}</span>
                <button
                  @click="removeTabFromPlaylist(playlist.id, tab.id)"
                  class="icon-btn icon-btn--danger"
                >
                  ×
                </button>
              </div>
              <button
                v-if="isLoaded"
                @click="addCurrentTabToPlaylist(playlist.id)"
                class="btn btn--dashed"
              >
                + {{ $t('tab_reader.add_current_tab') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Audio Settings Panel ─── -->
    <div v-if="showAudioSettings" class="panels">
      <div class="audio-panel">
        <div class="panel-header">
          <h4>{{ $t('tab_reader.audio_quality_settings') }}</h4>
        </div>
        <div class="audio-body">
          <label class="field-label">{{ $t('tab_reader.soundfont_selection') }}</label>
          <select v-model="selectedSoundFont" @change="changeSoundFont" class="select-field">
            <option v-for="sf in availableSoundFonts" :key="sf.path" :value="sf.path">
              {{ sf.name }} {{ sf.recommended ? '★' : '' }} {{ sf.warning ? '⚠' : '' }} —
              {{ sf.size }}
            </option>
          </select>
          <label class="field-check">
            <input type="checkbox" v-model="performanceMode" @change="togglePerformanceMode" />
            {{ $t('tab_reader.performance_mode') }}
          </label>
        </div>
      </div>
    </div>

    <!-- ─── Main Score Area ─── -->
    <div class="tab-score">
      <div v-if="!isLoaded && !error" class="empty-state">
        <div class="empty-icon">♪</div>
        <p>{{ $t('tab_reader.no_file_loaded') }}</p>
        <button
          @click="openFileWithPicker"
          class="btn btn--primary"
          v-if="supportsFileSystemAccess"
        >
          {{ $t('tab_reader.browse_file') }}
        </button>
        <button @click="openFileDialog" class="btn btn--primary" v-else>
          {{ $t('tab_reader.load_guitarpro') }}
        </button>
      </div>
      <div ref="alphaTab" class="alphatab-render"></div>

      <!-- Fret Editor Overlay -->
      <div
        v-if="showFretEditor"
        class="fret-editor"
        :style="{ left: fretEditorX + 'px', top: fretEditorY + 'px' }"
        @click.stop
      >
        <input
          ref="fretInput"
          type="number"
          v-model="editingFret"
          min="0"
          max="24"
          class="fret-input"
          @keydown="handleFretKeydown"
          @blur="applyFretEdit"
        />
        <span class="fret-label">fret</span>
      </div>
      <div v-if="error" class="error-bar">{{ error }}</div>
    </div>

    <!-- ─── Now Playing HUD ─── -->
    <transition name="hud-fade">
      <div v-if="isPlaying && currentBeatNotes.length" class="beat-hud">
        <span
          v-for="(n, i) in currentBeatNotes"
          :key="i"
          class="beat-hud__note"
          :style="{ background: getNoteColor(n.note) }"
        >
          {{ n.string }}:{{ n.fret }}
        </span>
      </div>
    </transition>

    <!-- ─── Transport Bar (fixed bottom) ─── -->
    <footer class="transport">
      <div class="transport__left">
        <button
          @click="playPause"
          class="transport-btn transport-btn--play"
          :class="{ active: isPlaying }"
        >
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button @click="stop" class="transport-btn">⏹</button>
      </div>

      <div class="transport__center">
        <div class="transport-track" v-if="tracks.length">
          <label>{{ $t('tab_reader.track') || 'Track' }}:</label>
          <select
            v-model="selectedTrack"
            @change="changeTrack"
            class="select-field select-field--compact"
          >
            <option v-for="(track, index) in tracks" :key="index" :value="index">
              {{ track.name }}
            </option>
          </select>
        </div>

        <div class="transport-loop">
          <label>Bars:</label>
          <input
            type="number"
            v-model.number="loopStartBar"
            min="1"
            class="num-input"
            @change="updateLoopRange"
          />
          <span>—</span>
          <input
            type="number"
            v-model.number="loopEndBar"
            min="1"
            class="num-input"
            @change="updateLoopRange"
          />
          <button @click="toggleLoop" class="transport-btn" :class="{ active: isLooping }">
            🔁
          </button>
        </div>

        <div class="transport-speed">
          <label>{{ playbackSpeed }}%</label>
          <input
            type="range"
            min="30"
            max="300"
            v-model="playbackSpeed"
            @input="updatePlaybackSpeed"
            class="range-field"
          />
        </div>
      </div>

      <div class="transport__right">
        <span v-if="isLoaded && totalBars" class="transport-bar-pos">
          {{ currentBarNumber || '—' }} / {{ totalBars }}
        </span>
        <button @click="showMixer = !showMixer" class="btn btn--sm btn--outline">
          {{ showMixer ? '🎚 Hide Mixer' : '🎚 Mixer' }}
        </button>
      </div>

      <!-- Inline Mixer -->
      <div v-if="showMixer" class="mixer-inline">
        <div v-for="(track, index) in tracks" :key="index" class="mixer-row">
          <input
            type="checkbox"
            :checked="!track.playbackInfo.isMute"
            @change="toggleMute(index)"
            :id="'m' + index"
          />
          <label :for="'m' + index" class="mixer-label">{{ track.name }}</label>
          <input
            type="range"
            min="0"
            max="16"
            :value="track.playbackInfo.volume"
            @input="changeVolume(index, $event.target.value)"
            class="range-field range-field--sm"
          />
          <input
            type="range"
            min="-64"
            max="63"
            :value="track.playbackInfo.balance"
            @input="changePanning(index, $event.target.value)"
            class="range-field range-field--sm"
          />
          <button
            @click="toggleSolo(index)"
            class="transport-btn transport-btn--solo"
            :class="{ active: track.playbackInfo.isSolo }"
          >
            S
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
  import { Settings, AlphaTabApi, exporter } from '@coderline/alphatab'
  import { useTabStore } from '../stores/tabStore.js'
  import { jsonToAlphaTex } from '../services/jsonToAlphaTexService.js'
  import jsondata from '../services/jsontoparseTab.json' with { type: 'json' }
  import { fileHandleService } from '../services/fileHandleService.js'

  export default {
    name: 'TabReaderComponent',
    data() {
      return {
        alphaTabApi: null,
        isLoaded: false,
        isPlaying: false,
        json: jsondata,
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
          {
            name: 'MuseScore General HQ',
            path: './soundfont/MuseScore_General.sf3',
            size: '35 MB',
            recommended: true,
          },
          {
            name: 'GeneralUser GS',
            path: './soundfont/GeneralUser_GS.sf2',
            size: '30 MB',
            recommended: true,
          },
          { name: 'Sonivox', path: './soundfont/sonivox.sf2', size: '2 MB' },
        ],
        currentLoadedFile: null,
        currentLoadedFileName: '',
        currentFileHandle: null,
        currentFileHandleId: null,
        showCreatePlaylistModal: false,
        showRenamePlaylistModal: false,
        newPlaylistName: '',
        playlistToRename: null,
        playlistToDelete: null,
        showDeleteConfirm: false,
        isLooping: false,
        loopStartBar: 1,
        loopEndBar: 4,
        currentBeatNotes: [],
        currentBarNumber: 0,
        totalBars: 0,
        // Note editing
        editingNote: null,
        editingFret: '',
        showFretEditor: false,
        fretEditorX: 0,
        fretEditorY: 0,
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
      },
    },
    async mounted() {
      const saved = localStorage.getItem('guitarapp_soundfont')
      if (saved) {
        try {
          const r = await fetch(saved, { method: 'HEAD' })
          if (r.ok) this.selectedSoundFont = saved
          else this.selectedSoundFont = './soundfont/MuseScore_General.sf3'
        } catch {
          this.selectedSoundFont = './soundfont/MuseScore_General.sf3'
        }
      } else {
        this.selectedSoundFont = './soundfont/MuseScore_General.sf3'
      }
      const pm = localStorage.getItem('guitarapp_performanceMode')
      if (pm !== null) this.performanceMode = pm === 'true'

      this.$nextTick(() => this.initializeAlphaTab())
      this.tabStore.loadFromStorage()

      // Close fret editor when clicking outside
      document.addEventListener('mousedown', this.handleOutsideClick)
    },
    beforeUnmount() {
      document.removeEventListener('mousedown', this.handleOutsideClick)
      if (this.alphaTabApi) this.alphaTabApi.destroy()
    },
    methods: {
      // ── AlphaTab Init ───────────────────────────────────────
      initializeAlphaTab() {
        try {
          if (!this.$refs.alphaTab) return
          this.$refs.alphaTab.innerHTML = ''

          const s = new Settings()
          s.core.engine = 'html5'
          s.core.useWorkers = true
          s.core.enableLazyLoading = true
          s.core.includeNoteBounds = true

          s.display.layoutMode = 'page'
          s.display.stretchForce = 1.0
          s.display.autoSize = true
          s.display.scale = 1.0

          s.notation.notationMode = 'SongBook'
          s.staveProfile = 'ScoreTab'

          s.player.enablePlayer = true
          s.player.enableAudioSynthesis = true
          s.player.soundFont = this.selectedSoundFont
          s.player.enableCursor = true
          s.player.enableAnimatedBeatCursor = true
          s.player.enableElementHighlighting = true
          s.player.enableUserInteraction = true
          s.player.scrollMode = 'continuous'
          s.player.scrollElement = this.$refs.alphaTab?.parentElement || this.$refs.alphaTab
          s.player.scrollOffsetY = -40
          s.player.scrollSpeed = 200

          if (this.performanceMode) {
            s.player.vibrato = false
          }

          const isElectron = window.process?.versions?.electron
          if (isElectron) {
            const base = window.location.href.replace(/[^/]*$/, '')
            s.core.scriptFile = `${base}alphatab/alphaTab.min.js`
            s.core.fontDirectory = `${base}alphatab/font/`
            s.player.enableAudioWorklet = true
            s.player.scriptFile = `${base}alphatab/alphaTab.worklet.min.mjs`
          }
          s.core.fontDirectory = './font/'

          this.alphaTabApi = new AlphaTabApi(this.$refs.alphaTab, s)
          this.setupEventListeners()
        } catch (err) {
          this.error = `Failed to initialize AlphaTab: ${err.message}`
        }
      },

      // ── Events ──────────────────────────────────────────────
      setupEventListeners() {
        if (!this.alphaTabApi) return

        this.alphaTabApi.scoreLoaded.on((score) => {
          this.isLoaded = true
          this.tracks = score.tracks || []
          this.selectedTrack = 0
          this.score = score
          this.error = null
          this.currentBeatNotes = []
          this.currentBarNumber = 0
          this.totalBars = score.masterBars?.length || 0
          this._buildNoteBoundsMap()
        })

        this.alphaTabApi.playerReady.on(() => {
          this.isPlayerReady = true
        })
        this.alphaTabApi.playerStateChanged.on((e) => {
          this.isPlaying = e.state === 1
        })
        this.alphaTabApi.playerFinished.on(() => {
          this.isPlaying = false
          this.currentBeatNotes = []
        })

        // Beat change — extract note info for HUD
        this.alphaTabApi.playedBeatChanged.on((beat) => {
          if (!beat || !beat.notes) {
            this.currentBeatNotes = []
            return
          }
          this.currentBeatNotes = beat.notes.map((n) => ({
            string: n.string,
            fret: n.fret,
            note: n.name || '',
          }))
        })

        // Click-to-seek — user clicks any beat to jump playback there
        this.alphaTabApi.beatMouseDown.on((beat) => {
          if (!this.alphaTabApi || !beat) return
          // Only seek if we're NOT clicking on a note (note click = edit mode)
          if (!this.editingNote) {
            this.alphaTabApi.tickPosition = beat.start
          }
        })

        // Note click — edit fret (use prebuilt bounds map for instant positioning)
        this.alphaTabApi.noteMouseDown.on((note) => {
          if (!note || !this.alphaTabApi) return
          this.openFretEditor(note)
        })

        // Fallback: double-click on score area — find note by proximity to mouse
        this.$nextTick(() => {
          const scoreEl = this.$refs.alphaTab?.closest('.tab-score')
          if (scoreEl) {
            scoreEl.addEventListener('dblclick', (e) => {
              if (this.showFretEditor) return
              this.selectNoteAtPosition(e)
            })
          }
        })

        // Auto-scroll — use the .tab-score wrapper as scroll container
        this.alphaTabApi.playerPositionChanged.on((e) => {
          if (!this.$refs.alphaTab || !this.isPlaying) return

          // Update current bar number
          if (this.score && this.score.masterBars.length) {
            const tick = e.currentTick || 0
            for (let i = this.score.masterBars.length - 1; i >= 0; i--) {
              if (tick >= this.score.masterBars[i].start) {
                this.currentBarNumber = i + 1
                break
              }
            }
          }

          const scoreEl = this.$refs.alphaTab.closest('.tab-score')
          if (!scoreEl) return
          const cursor =
            scoreEl.querySelector('.at-cursor-bar') || scoreEl.querySelector('.at-cursor-beat')
          if (!cursor) return
          const cRect = scoreEl.getBoundingClientRect()
          const y = cursor.getBoundingClientRect().top - cRect.top + scoreEl.scrollTop
          const pad = 60
          const target = y - cRect.height / 2
          if (Math.abs(scoreEl.scrollTop - target) > pad) {
            scoreEl.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
          }
        })

        this.alphaTabApi.error.on((err) => {
          this.error =
            err.type === 'FormatError' && String(err.message).includes('Soundfont')
              ? 'Invalid SoundFont. Try MuseScore_General.sf3'
              : `Error: ${err.message || err}`
        })
      },

      // ── Transport ───────────────────────────────────────────
      playPause() {
        if (!this.alphaTabApi?.isReadyForPlayback) return
        this.isPlaying ? this.alphaTabApi.pause() : this.alphaTabApi.play()
      },
      stop() {
        if (!this.alphaTabApi?.isReadyForPlayback) return
        this.alphaTabApi.stop()
        this.currentBeatNotes = []
      },
      updatePlaybackSpeed() {
        if (this.alphaTabApi) this.alphaTabApi.playbackSpeed = this.playbackSpeed / 100
      },
      changeTrack() {
        if (!this.alphaTabApi || this.selectedTrack >= this.tracks.length) return
        this.alphaTabApi.renderTracks([this.tracks[this.selectedTrack]])
        this.alphaTabApi.renderFinished.on(
          () => {
            this._buildNoteBoundsMap()
          },
          { once: true }
        )
      },
      changeVolume(i, v) {
        if (!this.alphaTabApi || !this.tracks[i]) return
        const vol = parseInt(v)
        this.alphaTabApi.changeTrackVolume([this.tracks[i]], vol)
        this.tracks[i].playbackInfo.volume = vol
        this.$forceUpdate()
      },
      changePanning(i, b) {
        if (!this.alphaTabApi || !this.tracks[i]) return
        const bal = parseInt(b)
        this.alphaTabApi.changeTrackBalance([this.tracks[i]], bal)
        this.tracks[i].playbackInfo.balance = bal
        this.$forceUpdate()
      },
      toggleMute(i) {
        if (!this.alphaTabApi || !this.tracks[i]) return
        const m = !this.tracks[i].playbackInfo.isMute
        this.alphaTabApi.changeTrackMute([this.tracks[i]], m)
        this.tracks[i].playbackInfo.isMute = m
        this.$forceUpdate()
      },
      toggleSolo(i) {
        if (!this.alphaTabApi || !this.tracks[i]) return
        const s = !this.tracks[i].playbackInfo.isSolo
        this.alphaTabApi.changeTrackSolo([this.tracks[i]], s)
        this.tracks[i].playbackInfo.isSolo = s
        this.$forceUpdate()
      },

      // ── Loop ────────────────────────────────────────────────
      toggleLoop() {
        if (!this.alphaTabApi) return
        this.isLooping = !this.isLooping
        this.alphaTabApi.player.isLooping = this.isLooping
        this.updateLoopRange()
      },
      updateLoopRange() {
        if (!this.alphaTabApi || !this.score) return
        const s = Math.max(0, this.loopStartBar - 1)
        const e = Math.max(s, this.loopEndBar - 1)
        if (e >= this.score.masterBars.length) return
        if (this.isLooping) {
          const startTick = this.score.masterBars[s].start
          const endTick =
            e + 1 < this.score.masterBars.length
              ? this.score.masterBars[e + 1].start
              : this.score.duration
          this.alphaTabApi.player.playbackRange = { startTick, endTick }
        } else {
          this.alphaTabApi.playbackRange = null
        }
      },

      // ── File Load ───────────────────────────────────────────
      openFileDialog() {
        this.$refs.fileInput.click()
      },
      async openFileWithPicker() {
        try {
          const [h] = await window.showOpenFilePicker({
            types: [
              {
                description: 'Guitar Pro',
                accept: {
                  'application/x-guitar-pro': [
                    '.gp',
                    '.gp3',
                    '.gp4',
                    '.gp5',
                    '.gpx',
                    '.gp6',
                    '.ptb',
                  ],
                },
              },
            ],
            multiple: false,
          })
          if (h) await this.loadFileFromHandle(h)
        } catch (err) {
          if (err.name !== 'AbortError') this.error = `Failed: ${err.message}`
        }
      },
      async openTexJSON() {
        try {
          const [h] = await window.showOpenFilePicker({
            types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
            multiple: false,
          })
          if (!h) return
          const file = await h.getFile()
          const text = await file.text()
          let songJson
          try {
            songJson = JSON.parse(text)
          } catch {
            this.error = 'Invalid JSON'
            return
          }
          const tex = jsonToAlphaTex(songJson)
          this.alphaTabApi.tex(tex)
          this.currentLoadedFile = file
          this.currentLoadedFileName = file.name
          this.isLoaded = true
          this.currentFileHandleId = await fileHandleService.storeFileHandle(h)
          this.tabStore.addTabToPlaylist('recent', {
            name: songJson.name || file.name,
            path: file.name,
            artist: songJson.artist || '',
            album: songJson.album || '',
            fileHandleId: this.currentFileHandleId,
            fileType: 'json',
          })
        } catch (err) {
          if (err.name !== 'AbortError') this.error = `Failed: ${err.message}`
        }
      },
      async loadFile(event) {
        const file = event.target.files[0]
        if (!file) return
        this.error = null
        this.isLoaded = false
        this.isPlayerReady = false
        if (!this.alphaTabApi) {
          this.error = 'AlphaTab not initialized'
          return
        }
        const valid = ['.gp', '.gp3', '.gp4', '.gp5', '.gpx', '.gp6', '.ptb']
        if (!valid.some((e) => file.name.toLowerCase().endsWith(e))) {
          this.error = 'Invalid file type'
          return
        }
        this.currentLoadedFile = file
        this.currentLoadedFileName = file.name.replace(/\.[^/.]+$/, '')
        this.currentFileHandle = null
        const buf = await this.fileToArrayBuffer(file)
        if (!this.alphaTabApi.load(buf)) this.error = 'Failed to load file'
      },
      async loadFileFromHandle(fileHandle, handleId = null) {
        this.error = null
        this.isLoaded = false
        this.isPlayerReady = false
        if (!this.alphaTabApi) {
          this.error = 'AlphaTab not initialized'
          return
        }
        const p = await fileHandle.queryPermission({ mode: 'read' })
        if (p !== 'granted') {
          const np = await fileHandle.requestPermission({ mode: 'read' })
          if (np !== 'granted') {
            this.error = 'Permission denied'
            return
          }
        }
        const file = await fileHandle.getFile()
        const valid = ['.gp', '.gp3', '.gp4', '.gp5', '.gpx', '.gp6', '.ptb']
        if (!valid.some((e) => file.name.toLowerCase().endsWith(e))) {
          this.error = 'Invalid file type'
          return
        }
        this.currentLoadedFile = file
        this.currentLoadedFileName = file.name.replace(/\.[^/.]+$/, '')
        this.currentFileHandle = fileHandle
        this.currentFileHandleId = handleId || (await fileHandleService.storeFileHandle(fileHandle))
        const buf = await this.fileToArrayBuffer(file)
        if (!this.alphaTabApi.load(buf)) this.error = 'Failed to load file'
      },
      fileToArrayBuffer(file) {
        return new Promise((r, e) => {
          const rd = new FileReader()
          rd.onload = (ev) => r(ev.target.result)
          rd.onerror = e
          rd.readAsArrayBuffer(file)
        })
      },

      // ── SoundFont ───────────────────────────────────────────
      async changeSoundFont() {
        if (!this.alphaTabApi) return
        try {
          this.error = 'Loading soundfont...'
          const cur = this.alphaTabApi.score
          const wasPlaying = this.isPlaying
          const time = this.alphaTabApi.timePosition
          if (wasPlaying) this.alphaTabApi.pause()
          localStorage.setItem('guitarapp_soundfont', this.selectedSoundFont)
          this.alphaTabApi.destroy()
          this.alphaTabApi = null
          await new Promise((r) => setTimeout(r, 100))
          this.initializeAlphaTab()
          await new Promise((r) => setTimeout(r, 500))
          if (cur && this.currentLoadedFile) {
            try {
              let data
              if (this.currentLoadedFile instanceof File)
                data = await this.currentLoadedFile.arrayBuffer()
              else if (this.currentFileHandle) {
                const f = await this.currentFileHandle.getFile()
                data = await f.arrayBuffer()
              }
              if (data) {
                this.alphaTabApi.load(data)
                this.alphaTabApi.renderFinished.on(
                  () => {
                    this._buildNoteBoundsMap()
                  },
                  { once: true }
                )
                await new Promise((r) => {
                  const t = setTimeout(() => {
                    clearInterval(i)
                    r()
                  }, 10000)
                  const i = setInterval(() => {
                    if (this.isPlayerReady) {
                      clearInterval(i)
                      clearTimeout(t)
                      r()
                    }
                  }, 100)
                })
                if (wasPlaying && time > 0) this.alphaTabApi.timePosition = time
              }
            } catch {
              this.error = 'SoundFont loaded! Please reload tab.'
              setTimeout(() => {
                this.error = null
              }, 5000)
              return
            }
          }
          this.error = ''
          setTimeout(() => {
            this.error = null
          }, 3000)
        } catch (err) {
          this.error = err.message
          setTimeout(() => {
            this.error = null
          }, 5000)
        }
      },
      togglePerformanceMode() {
        localStorage.setItem('guitarapp_performanceMode', this.performanceMode)
        if (this.alphaTabApi) {
          this.error = 'Reloading...'
          setTimeout(() => this.changeSoundFont(), 500)
        }
      },

      // ── Playlists ───────────────────────────────────────────
      togglePlaylist(id) {
        const i = this.expandedPlaylists.indexOf(id)
        i > -1 ? this.expandedPlaylists.splice(i, 1) : this.expandedPlaylists.push(id)
      },
      confirmCreatePlaylist() {
        if (this.newPlaylistName?.trim()) {
          const id = this.tabStore.createPlaylist(this.newPlaylistName.trim())
          this.expandedPlaylists.push(id)
          this.showCreatePlaylistModal = false
          this.newPlaylistName = ''
        }
      },
      renamePlaylistPrompt(p) {
        this.playlistToRename = p
        this.newPlaylistName = p.name
        this.showRenamePlaylistModal = true
      },
      confirmRename() {
        if (
          this.newPlaylistName?.trim() &&
          this.playlistToRename &&
          this.newPlaylistName !== this.playlistToRename.name
        )
          this.tabStore.renamePlaylist(this.playlistToRename.id, this.newPlaylistName.trim())
        this.showRenamePlaylistModal = false
        this.playlistToRename = null
        this.newPlaylistName = ''
      },
      deletePlaylistConfirm(p) {
        this.playlistToDelete = p
        this.showDeleteConfirm = true
      },
      confirmDelete() {
        if (this.playlistToDelete) {
          this.tabStore.deletePlaylist(this.playlistToDelete.id)
          const i = this.expandedPlaylists.indexOf(this.playlistToDelete.id)
          if (i > -1) this.expandedPlaylists.splice(i, 1)
        }
        this.showDeleteConfirm = false
        this.playlistToDelete = null
      },
      addCurrentTabToPlaylist(pid) {
        if (!this.isLoaded || !this.currentLoadedFile) {
          this.error = 'No tab loaded'
          setTimeout(() => {
            this.error = null
          }, 3000)
          return
        }
        const d = {
          name: this.currentLoadedFileName,
          path: this.currentLoadedFile.name,
          artist: '',
          album: '',
          fileHandleId: this.currentFileHandleId,
          fileType: this.currentLoadedFile.name?.endsWith('.json') ? 'json' : 'gp',
        }
        if (this.alphaTabApi?.score) {
          d.name = this.alphaTabApi.score.title || d.name
          d.artist = this.alphaTabApi.score.artist || ''
          d.album = this.alphaTabApi.score.album || ''
        }
        this.tabStore.addTabToPlaylist(pid, d)
      },
      removeTabFromPlaylist(pid, tid) {
        this.tabStore.removeTabFromPlaylist(pid, tid)
      },
      async loadTabFromPlaylist(tab) {
        if (!tab.fileHandleId) {
          this.error = 'No file access. Re-add via Browse.'
          setTimeout(() => {
            this.error = null
          }, 5000)
          return
        }
        try {
          const fh = await fileHandleService.getFileHandle(tab.fileHandleId)
          if (!fh) throw new Error('Handle not found')
          const p = await fh.queryPermission({ mode: 'read' })
          if (p !== 'granted') {
            const np = await fh.requestPermission({ mode: 'read' })
            if (np !== 'granted') throw new Error('Denied')
          }
          const file = await fh.getFile()
          if (tab.fileType === 'json' || file.name.endsWith('.json')) {
            const text = await file.text()
            const j = JSON.parse(text)
            const tex = jsonToAlphaTex(j)
            this.alphaTabApi.tex(tex)
            this.currentLoadedFile = file
            this.currentLoadedFileName = file.name
            this.isLoaded = true
          } else {
            await this.loadFileFromHandle(fh, tab.fileHandleId)
          }
        } catch (err) {
          this.error = `Failed: ${err.message}`
          setTimeout(() => {
            this.error = null
          }, 5000)
        }
      },

      // ── Note Colors ─────────────────────────────────────────
      getNoteColor(noteName) {
        const colors = {
          C: '#3b82f6',
          CS: '#60a5fa',
          D: '#ef4444',
          DS: '#f87171',
          E: '#22c55e',
          F: '#92400e',
          FS: '#b45309',
          G: '#eab308',
          GS: '#facc15',
          A: '#111827',
          AS: '#6b7280',
          B: '#f5f5f4',
        }
        return colors[noteName] || '#8b5cf6'
      },

      // ── Note Editing ──────────────────────────────────────
      _buildNoteBoundsMap() {
        // Build a flat Map<Note, {x,y,w,h}> for O(1) lookup
        this._noteBoundsMap = new Map()
        const lookup = this.alphaTabApi?.boundsLookup
        if (!lookup?.staffSystems) return
        for (const sys of lookup.staffSystems) {
          for (const mb of sys.bars || []) {
            for (const bar of mb.bars || []) {
              for (const beat of bar.beats || []) {
                for (const nb of beat.notes || []) {
                  if (nb.note && nb.noteHeadBounds) {
                    this._noteBoundsMap.set(nb.note, nb.noteHeadBounds)
                  }
                }
              }
            }
          }
        }
        console.log('📝 Built note bounds map:', this._noteBoundsMap.size, 'notes')
      },

      openFretEditor(note, mouseX, mouseY) {
        if (!note || !this.alphaTabApi) return

        this.editingNote = note
        this.editingFret = String(note.fret)

        const scoreEl = this.$refs.alphaTab?.closest('.tab-score')
        if (scoreEl) {
          const sRect = scoreEl.getBoundingClientRect()

          if (mouseX !== undefined && mouseY !== undefined) {
            // From double-click — use mouse coords directly
            this.fretEditorX = mouseX - sRect.left + scoreEl.scrollLeft
            this.fretEditorY = mouseY - sRect.top + scoreEl.scrollTop - 10
          } else {
            // From noteMouseDown — use prebuilt bounds map (instant lookup)
            const b = this._noteBoundsMap?.get(note)
            if (b) {
              this.fretEditorX = b.x + b.w / 2 - sRect.left + scoreEl.scrollLeft
              this.fretEditorY = b.y - sRect.top + scoreEl.scrollTop - 5
            } else {
              this.fretEditorX = scoreEl.clientWidth / 2
              this.fretEditorY = 100
            }
          }
        }

        this.showFretEditor = true
        this.$nextTick(() => {
          const inp = this.$refs.fretInput
          if (inp) {
            inp.focus()
            inp.select()
          }
        })
      },

      applyFretEdit() {
        if (!this.editingNote || !this.alphaTabApi) return
        const val = parseInt(this.editingFret, 10)
        if (isNaN(val) || val < 0 || val > 24) {
          this.cancelFretEdit()
          return
        }

        // Modify the note in the score data model
        this.editingNote.fret = val

        // Recalculate pitch based on new fret
        const staff = this.editingNote.beat?.voice?.bar?.staff
        if (staff && staff.stringTuning) {
          const tuning = staff.stringTuning
          const noteIndex = this.editingNote.string - 1
          if (noteIndex >= 0 && noteIndex < tuning.length) {
            this.editingNote.tone = tuning[noteIndex] + val
            this.editingNote.octave = Math.floor(this.editingNote.tone / 12) - 1
          }
        }

        // Re-render the score to show the change
        const score = this.alphaTabApi.score
        const trackIdx = this.selectedTrack
        this.alphaTabApi.renderScore(score, [trackIdx])

        // Rebuild bounds map after render (note positions changed)
        this.alphaTabApi.renderFinished.on(
          () => {
            this._buildNoteBoundsMap()
          },
          { once: true }
        )

        // Reload MIDI so playback reflects the change
        this.alphaTabApi.loadMidiForScore(score)

        this.cancelFretEdit()
      },

      cancelFretEdit() {
        this.showFretEditor = false
        this.editingNote = null
        this.editingFret = ''
      },

      handleFretKeydown(e) {
        if (e.key === 'Enter') {
          this.applyFretEdit()
        } else if (e.key === 'Escape') {
          this.cancelFretEdit()
        }
      },

      handleOutsideClick(e) {
        if (
          this.showFretEditor &&
          this.$refs.fretInput &&
          !this.$refs.fretInput.contains(e.target)
        ) {
          this.applyFretEdit()
        }
      },

      // ── Export / Import ─────────────────────────────────────
      exportGP() {
        if (!this.alphaTabApi?.score) return
        try {
          const exp = new exporter.Gp7Exporter()
          const data = exp.export(this.alphaTabApi.score, this.alphaTabApi.settings)
          const blob = new Blob([data], { type: 'application/gp' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = (this.alphaTabApi.score.title || this.currentLoadedFileName || 'tab') + '.gp'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        } catch (err) {
          this.error = `Export failed: ${err.message}`
          console.error('GP export error:', err)
        }
      },

      exportMidi() {
        if (!this.alphaTabApi?.score) return
        try {
          this.alphaTabApi.downloadMidi()
        } catch (err) {
          this.error = `MIDI export failed: ${err.message}`
          console.error('MIDI export error:', err)
        }
      },

      selectNoteAtPosition(e) {
        if (!this._noteBoundsMap || this._noteBoundsMap.size === 0) return
        const scoreEl = this.$refs.alphaTab?.closest('.tab-score')
        if (!scoreEl) return
        const sRect = scoreEl.getBoundingClientRect()
        const clickX = e.clientX - sRect.left + scoreEl.scrollLeft
        const clickY = e.clientY - sRect.top + scoreEl.scrollTop

        let closest = null
        let closestDist = Infinity
        for (const [note, b] of this._noteBoundsMap) {
          const cx = b.x + b.w / 2
          const cy = b.y + b.h / 2
          const dist = Math.sqrt((clickX - cx) ** 2 + (clickY - cy) ** 2)
          if (dist < closestDist && dist < 30) {
            closestDist = dist
            closest = note
          }
        }
        if (closest) {
          this.openFretEditor(closest, e.clientX, e.clientY)
        }
      },
    },
  }
</script>

<style scoped>
  .tab-reader {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    background: #0f172a;
    color: #e2e8f0;
    font-family: 'Inter', system-ui, sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* ── Header ─── */
  .tab-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: #1e293b;
    border-bottom: 1px solid #334155;
    flex-shrink: 0;
    min-height: 44px;
  }
  .tab-header__left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }
  .tab-header__right {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }
  .tab-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #f1f5f9;
  }
  .tab-filename {
    font-size: 0.8rem;
    color: #94a3b8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }

  /* ── Buttons ─── */
  .btn {
    padding: 0.35rem 0.75rem;
    border: none;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    background: #334155;
    color: #e2e8f0;
  }
  .btn:hover {
    background: #475569;
  }
  .btn--sm {
    padding: 0.25rem 0.6rem;
    font-size: 0.72rem;
  }
  .btn--primary {
    background: #3b82f6;
    color: #fff;
  }
  .btn--primary:hover {
    background: #2563eb;
  }
  .btn--outline {
    background: transparent;
    border: 1px solid #475569;
    color: #94a3b8;
  }
  .btn--outline:hover {
    border-color: #64748b;
    color: #e2e8f0;
  }
  .btn--accent {
    background: #8b5cf6;
    color: #fff;
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
  }
  .btn--accent:hover {
    background: #7c3aed;
  }
  .btn--dashed {
    width: 100%;
    background: transparent;
    border: 1px dashed #475569;
    color: #64748b;
    margin-top: 0.375rem;
  }
  .btn--dashed:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
  .icon-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.15rem 0.35rem;
    font-size: 0.85rem;
    border-radius: 4px;
  }
  .icon-btn:hover {
    color: #e2e8f0;
    background: #334155;
  }
  .icon-btn--danger:hover {
    color: #ef4444;
  }

  /* ── Panels ─── */
  .panels {
    flex-shrink: 0;
    border-bottom: 1px solid #334155;
  }
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: #1e293b;
  }
  .panel-header h4 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: #94a3b8;
  }
  .playlists-panel,
  .audio-panel {
    max-height: 300px;
    display: flex;
    flex-direction: column;
  }
  .playlists-body,
  .audio-body {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 1rem;
  }
  .empty-state {
    text-align: center;
    padding: 1.5rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .playlist-item {
    margin-bottom: 0.375rem;
    border: 1px solid #334155;
    border-radius: 6px;
    overflow: hidden;
  }
  .playlist-head {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4rem 0.6rem;
    cursor: pointer;
    background: #1e293b;
  }
  .playlist-head:hover {
    background: #263348;
  }
  .playlist-arrow {
    color: #3b82f6;
    font-size: 0.7rem;
    width: 14px;
  }
  .playlist-name {
    font-weight: 600;
    flex: 1;
    font-size: 0.85rem;
  }
  .playlist-count {
    color: #64748b;
    font-size: 0.75rem;
  }
  .playlist-body {
    padding: 0.375rem 0.6rem;
    background: #0f172a;
  }
  .tab-entry {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.4rem;
    border-radius: 4px;
    font-size: 0.82rem;
  }
  .tab-entry:hover {
    background: #1e293b;
  }
  .tab-entry--handle {
    border-left: 2px solid #3b82f6;
    padding-left: 0.5rem;
  }
  .tab-entry__name {
    flex: 1;
    cursor: pointer;
  }
  .tab-entry__name:hover {
    color: #3b82f6;
  }
  .tab-entry__artist {
    color: #64748b;
    font-size: 0.75rem;
  }

  .field-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 500;
    color: #94a3b8;
    margin: 0.5rem 0 0.25rem;
  }
  .field-check {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    color: #94a3b8;
    margin-top: 0.5rem;
    cursor: pointer;
  }
  .select-field {
    width: 100%;
    padding: 0.4rem 0.6rem;
    background: #1e293b;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 6px;
    font-size: 0.82rem;
  }
  .select-field--compact {
    width: auto;
    min-width: 140px;
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
  }

  /* ── Score Area ─── */
  .tab-score {
    flex: 1;
    overflow: auto;
    background: #ffffff;
    position: relative;
    min-height: 0;
  }
  .tab-score .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: #0f172a;
    color: #64748b;
  }
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }
  .alphatab-render {
    width: 100%;
    min-height: 100%;
  }

  /* AlphaTab cursor & highlight styling */
  .tab-score :deep(.at-cursor-bar) {
    background: rgba(59, 130, 246, 0.4) !important;
    width: 3px !important;
  }
  .tab-score :deep(.at-cursor-beat) {
    background: rgba(59, 130, 246, 0.15) !important;
  }
  .tab-score :deep(.at-highlight) {
    background: rgba(250, 204, 21, 0.35) !important;
  }

  .error-bar {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    right: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #991b1b;
    color: #fecaca;
    border-radius: 6px;
    font-size: 0.82rem;
    z-index: 50;
    white-space: pre-line;
  }

  /* ── Fret Editor ─── */
  .fret-editor {
    position: absolute;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transform: translate(-50%, -120%);
    background: #1e293b;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 0.25rem 0.4rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }
  .fret-input {
    width: 48px;
    padding: 0.2rem 0.3rem;
    background: #0f172a;
    border: 1px solid #475569;
    color: #f1f5f9;
    border-radius: 4px;
    font-size: 0.95rem;
    font-weight: 700;
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
    -moz-appearance: textfield;
  }
  .fret-input::-webkit-outer-spin-button,
  .fret-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .fret-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
  .fret-label {
    font-size: 0.65rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ── Beat HUD ─── */
  .beat-hud {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(8px);
    border-radius: 999px;
    border: 1px solid #334155;
    z-index: 200;
  }
  .beat-hud__note {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #fff;
    font-family: 'JetBrains Mono', monospace;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  .hud-fade-enter-active,
  .hud-fade-leave-active {
    transition:
      opacity 0.15s,
      transform 0.15s;
  }
  .hud-fade-enter-from,
  .hud-fade-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(6px);
  }

  /* ── Transport Bar ─── */
  .transport {
    flex-shrink: 0;
    background: #1e293b;
    border-top: 1px solid #334155;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
    flex-wrap: wrap;
  }
  .transport__left,
  .transport__center,
  .transport__right {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
  .transport__center {
    flex: 1;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }
  .transport__right {
    gap: 0.75rem;
  }

  .transport-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #475569;
    background: #0f172a;
    color: #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.15s;
  }
  .transport-btn:hover {
    background: #334155;
  }
  .transport-btn.active {
    background: #3b82f6;
    border-color: #3b82f6;
  }
  .transport-btn--play {
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
  }
  .transport-btn--solo {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
    font-weight: 700;
    border-radius: 4px;
  }
  .transport-btn--solo.active {
    background: #eab308;
    border-color: #eab308;
    color: #000;
  }

  .transport-bar-pos {
    font-size: 0.78rem;
    font-weight: 600;
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
    padding: 0.2rem 0.5rem;
    background: #0f172a;
    border-radius: 4px;
    border: 1px solid #334155;
    white-space: nowrap;
  }

  .transport-track,
  .transport-loop,
  .transport-speed {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.78rem;
    color: #94a3b8;
  }
  .transport-track label,
  .transport-loop label,
  .transport-speed label {
    font-weight: 500;
    white-space: nowrap;
  }
  .num-input {
    width: 44px;
    padding: 0.2rem 0.3rem;
    background: #0f172a;
    border: 1px solid #334155;
    color: #e2e8f0;
    border-radius: 4px;
    font-size: 0.75rem;
    text-align: center;
  }
  .num-input:focus {
    outline: none;
    border-color: #3b82f6;
  }
  .range-field {
    width: 120px;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: #475569;
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }
  .range-field::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    background: #3b82f6;
    border-radius: 50%;
    cursor: pointer;
  }
  .range-field::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #3b82f6;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
  .range-field--sm {
    width: 60px;
  }

  /* ── Mixer ─── */
  .mixer-inline {
    width: 100%;
    padding: 0.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border-top: 1px solid #334155;
  }
  .mixer-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
  }
  .mixer-row input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #3b82f6;
  }
  .mixer-label {
    min-width: 100px;
    color: #94a3b8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Scrollbar ─── */
  .tab-score::-webkit-scrollbar,
  .playlists-body::-webkit-scrollbar,
  .audio-body::-webkit-scrollbar {
    width: 6px;
  }
  .tab-score::-webkit-scrollbar-track,
  .playlists-body::-webkit-scrollbar-track,
  .audio-body::-webkit-scrollbar-track {
    background: transparent;
  }
  .tab-score::-webkit-scrollbar-thumb,
  .playlists-body::-webkit-scrollbar-thumb,
  .audio-body::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    .tab-header {
      flex-direction: column;
      gap: 0.375rem;
      padding: 0.375rem 0.5rem;
    }
    .tab-header__right {
      flex-wrap: wrap;
      justify-content: center;
    }
    .transport {
      flex-direction: column;
      align-items: stretch;
    }
    .transport__left,
    .transport__center,
    .transport__right {
      justify-content: center;
    }
    .transport__center {
      flex-direction: column;
    }
  }
</style>
