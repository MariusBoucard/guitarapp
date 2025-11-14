<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h3>Guitar App</h3>
    </div>

    <!-- Presets Section -->
    <div class="sidebar-section">
      <h4>Quick Presets</h4>
      <div class="preset-buttons">
        <button class="preset-button" @click="applyPreset('practice')">🎯 Practice</button>
        <button class="preset-button" @click="applyPreset('tuning')">🎛️ Tuning</button>
        <button class="preset-button" @click="applyPreset('game')">🎮 Game</button>
        <button class="preset-button" @click="applyPreset('minimal')">📱 Minimal</button>
      </div>
    </div>

    <div class="sidebar-sections">
      <!-- Main Components Section -->
      <div class="sidebar-section">
        <h4>Main Components</h4>
        <div class="sidebar-items">
          <div
            class="sidebar-item"
            :class="{ active: appStore.mancheDisplay }"
            @click="appStore.toggleManche()"
          >
            <span>🎸 {{ $t('sidebar.manche') }}</span>
            <span class="status-indicator" v-if="appStore.mancheDisplay">●</span>
          </div>

          <div
            class="sidebar-item"
            :class="{ active: appStore.notesSelectedDisplay }"
            @click="appStore.toggleNotesSelected()"
          >
            <span>🎵 {{ $t('sidebar.selection_notes') }}</span>
            <span class="status-indicator" v-if="appStore.notesSelectedDisplay">●</span>
          </div>

          <div
            class="sidebar-item"
            :class="{ active: appStore.keyboard }"
            @click="appStore.toggleKeyboard()"
          >
            <span>⌨️ {{ $t('sidebar.clavier') }}</span>
            <span class="status-indicator" v-if="appStore.keyboard">●</span>
          </div>
        </div>
      </div>

      <!-- Tools Section -->
      <div class="sidebar-section">
        <h4>Tools</h4>
        <div class="sidebar-items">
          <div
            class="sidebar-item"
            :class="{ active: appStore.tunderDisplay }"
            @click="appStore.toggleTuner()"
          >
            <span>🎛️ {{ $t('sidebar.accordeur') }}</span>
            <span class="status-indicator" v-if="appStore.tunderDisplay">●</span>
          </div>

          <div
            class="sidebar-item"
            :class="{ active: appStore.scalesDisplay }"
            @click="appStore.toggleScales()"
          >
            <span>🎼 {{ $t('sidebar.gammes') }}</span>
            <span class="status-indicator" v-if="appStore.scalesDisplay">●</span>
          </div>

          <div
            class="sidebar-item"
            :class="{ active: appStore.chordssuggestDisplay }"
            @click="appStore.toggleChordssuggestion()"
          >
            <span>🎹 {{ $t('sidebar.suggestion_accords') }}</span>
            <span class="status-indicator" v-if="appStore.chordssuggestDisplay">●</span>
          </div>
        </div>
      </div>

      <!-- Media Section -->
      <div class="sidebar-section">
        <h4>Media</h4>
        <div class="sidebar-items">
          <div
            class="sidebar-item"
            :class="{ active: appStore.soundDisplay }"
            @click="appStore.toggleSound()"
          >
            <span>🔊 {{ $t('sidebar.lecteur_audio') }}</span>
            <span class="status-indicator" v-if="appStore.soundDisplay">●</span>
          </div>

          <div
            class="sidebar-item"
            :class="{ active: appStore.videoDisplay }"
            @click="appStore.toggleVideo()"
          >
            <span>📹 {{ $t('sidebar.lecteur_video') }}</span>
            <span class="status-indicator" v-if="appStore.videoDisplay">●</span>
          </div>

          <div
            class="sidebar-item"
            :class="{ active: appStore.videoDisplayNew }"
            @click="appStore.toggleVideoNew()"
          >
            <span>🎬 {{ $t('sidebar.lecteur_video_dossier') }}</span>
            <span class="status-indicator" v-if="appStore.videoDisplayNew">●</span>
          </div>

          <div
            class="sidebar-item"
            :class="{ active: appStore.trainingDisplay }"
            @click="appStore.toggleTraining()"
          >
            <span>🎯 {{ $t('sidebar.playlists_entrainement') }}</span>
            <span class="status-indicator" v-if="appStore.trainingDisplay">●</span>
          </div>

          <div
            class="sidebar-item"
            :class="{ active: appStore.pictureDisplay }"
            @click="appStore.togglePicture()"
          >
            <span>🖼️ {{ $t('sidebar.affichage_image') }}</span>
            <span class="status-indicator" v-if="appStore.pictureDisplay">●</span>
          </div>

          <div
            class="sidebar-item"
            :class="{ active: appStore.tabReaderDisplay }"
            @click="appStore.toggleTabReader()"
          >
            <span>🎼 {{ $t('sidebar.lecteur_tablatures') }}</span>
            <span class="status-indicator" v-if="appStore.tabReaderDisplay">●</span>
          </div>
        </div>
      </div>

      <!-- Training Section -->
      <div class="sidebar-section">
        <h4>Training</h4>
        <div class="sidebar-items">
          <div
            class="sidebar-item"
            :class="{ active: appStore.gameDisplay }"
            @click="appStore.toggleGame()"
          >
            <span>🎮 {{ $t('sidebar.jouer_jeu') }}</span>
            <span class="status-indicator" v-if="appStore.gameDisplay">●</span>
          </div>

          <div
            class="sidebar-item"
            :class="{ active: appStore.autoGammeSelect }"
            @click="appStore.toggleAutoGammeSelect()"
          >
            <span>🔄 {{ $t('sidebar.selection_gamme_automatique') }}</span>
            <span class="status-indicator" v-if="appStore.autoGammeSelect">●</span>
          </div>
        </div>
      </div>

      <!-- Settings Section -->
      <div class="sidebar-section">
        <h4>Settings</h4>
        <div class="sidebar-items">
          <div
            class="sidebar-item"
            :class="{ active: appStore.settingsView }"
            @click="appStore.toggleSettings()"
          >
            <span>⚙️ {{ $t('sidebar.parametres') }}</span>
            <span class="status-indicator" v-if="appStore.settingsView">●</span>
          </div>
          <div
            class="sidebar-item"
            :class="{ active: appStore.userManagementDisplay }"
            @click="appStore.toggleUserManagement()"
          >
            <span>👤 {{ $t('sidebar.management_utilisateurs') }}</span>
            <span class="status-indicator" v-if="appStore.userManagementDisplay">●</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { useAppStore } from '@/stores/appStore.js'

  export default {
    name: 'SidebarComponent',

    setup() {
      const appStore = useAppStore()

      // Simple preset functionality
      const applyPreset = (presetName) => {
        try {
          // First turn everything off
          const allStates = [
            'mancheDisplay',
            'notesSelectedDisplay',
            'tunderDisplay',
            'pictureDisplay',
            'soundDisplay',
            'scalesDisplay',
            'videoDisplay',
            'videoDisplayNew',
            'trainingDisplay',
            'gameDisplay',
            'chordssuggestDisplay',
            'settingsView',
            'keyboard',
          ]

          allStates.forEach((state) => {
            if (appStore[state]) {
              switch (state) {
                case 'mancheDisplay':
                  appStore.toggleManche()
                  break
                case 'notesSelectedDisplay':
                  appStore.toggleNotesSelected()
                  break
                case 'tunderDisplay':
                  appStore.toggleTuner()
                  break
                case 'pictureDisplay':
                  appStore.togglePicture()
                  break
                case 'soundDisplay':
                  appStore.toggleSound()
                  break
                case 'scalesDisplay':
                  appStore.toggleScales()
                  break
                case 'videoDisplay':
                  appStore.toggleVideo()
                  break
                case 'videoDisplayNew':
                  appStore.toggleVideoNew()
                  break
                case 'trainingDisplay':
                  appStore.toggleTraining()
                  break
                case 'gameDisplay':
                  appStore.toggleGame()
                  break
                case 'chordssuggestDisplay':
                  appStore.toggleChordssuggestion()
                  break
                case 'settingsView':
                  appStore.toggleSettings()
                  break
                case 'keyboard':
                  appStore.toggleKeyboard()
                  break
              }
            }
          })

          // Then turn on the ones for the preset
          const presets = {
            practice: ['mancheDisplay', 'notesSelectedDisplay', 'scalesDisplay'],
            tuning: ['mancheDisplay', 'tunderDisplay', 'settingsView'],
            game: ['mancheDisplay', 'gameDisplay', 'notesSelectedDisplay'],
            minimal: ['mancheDisplay'],
          }

          if (presets[presetName]) {
            presets[presetName].forEach((state) => {
              if (!appStore[state]) {
                switch (state) {
                  case 'mancheDisplay':
                    appStore.toggleManche()
                    break
                  case 'notesSelectedDisplay':
                    appStore.toggleNotesSelected()
                    break
                  case 'tunderDisplay':
                    appStore.toggleTuner()
                    break
                  case 'pictureDisplay':
                    appStore.togglePicture()
                    break
                  case 'soundDisplay':
                    appStore.toggleSound()
                    break
                  case 'scalesDisplay':
                    appStore.toggleScales()
                    break
                  case 'videoDisplay':
                    appStore.toggleVideo()
                    break
                  case 'videoDisplayNew':
                    appStore.toggleVideoNew()
                    break
                  case 'trainingDisplay':
                    appStore.toggleTraining()
                    break
                  case 'gameDisplay':
                    appStore.toggleGame()
                    break
                  case 'chordssuggestDisplay':
                    appStore.toggleChordssuggestion()
                    break
                  case 'settingsView':
                    appStore.toggleSettings()
                    break
                  case 'keyboard':
                    appStore.toggleKeyboard()
                    break
                }
              }
            })
          }
        } catch (error) {
          console.error('Error applying preset:', error)
        }
      }

      return {
        appStore,
        applyPreset,
      }
    },
  }
</script>

<style scoped>
  .sidebar {
    width: 100%;
    height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
    overflow-y: auto;
    box-shadow: 2px 0 5px var(--shadow-light);
  }

  .sidebar-header {
    padding: var(--spacing-xl) var(--spacing-lg);
    border-bottom: 1px solid var(--border-primary);
    text-align: center;
  }

  .sidebar-header h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.2rem;
    font-weight: var(--font-semibold);
  }

  .sidebar-sections {
    padding: var(--spacing-md) 0;
  }

  .sidebar-section {
    margin-bottom: var(--spacing-xl);
  }

  .sidebar-section h4 {
    margin: 0 0 var(--spacing-md) var(--spacing-lg);
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: var(--font-medium);
  }

  .preset-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: 0 var(--spacing-lg);
  }

  .preset-button {
    background: var(--btn-primary);
    border: none;
    color: var(--text-primary);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: var(--font-medium);
    transition: all var(--transition-normal);
    text-align: left;
  }

  .preset-button:hover {
    background: var(--btn-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px var(--shadow-medium);
  }

  .sidebar-items {
    display: flex;
    flex-direction: column;
  }

  .sidebar-item {
    padding: var(--spacing-md) var(--spacing-xl);
    cursor: pointer;
    transition: all var(--transition-normal);
    border-left: 3px solid transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sidebar-item:hover {
    background-color: var(--bg-hover);
    border-left-color: var(--border-accent);
  }

  .sidebar-item.active {
    background-color: var(--secondary-blue-dark);
    border-left-color: var(--border-active);
    font-weight: var(--font-medium);
  }

  .sidebar-item span {
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .status-indicator {
    color: var(--accent-green);
    font-size: 0.6rem;
  }

  /* Custom scrollbar */
  .sidebar::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar::-webkit-scrollbar-track {
    background: var(--primary-dark);
  }

  .sidebar::-webkit-scrollbar-thumb {
    background: var(--primary-medium);
    border-radius: var(--radius-sm);
  }

  .sidebar::-webkit-scrollbar-thumb:hover {
    background: var(--primary-accent);
  }
</style>
