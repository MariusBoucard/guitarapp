<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h3>Guitar App</h3>
    </div>

    <!-- Presets Section -->
    <div class="sidebar-section">
      <h4>Quick Presets</h4>
      <div class="preset-buttons">
        <button 
          class="preset-button"
          @click="applyPreset('practice')"
        >
          🎯 Practice
        </button>
        <button 
          class="preset-button"
          @click="applyPreset('tuning')"
        >
          🎛️ Tuning
        </button>
        <button 
          class="preset-button"
          @click="applyPreset('game')"
        >
          🎮 Game
        </button>
        <button 
          class="preset-button"
          @click="applyPreset('minimal')"
        >
          📱 Minimal
        </button>
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
            <span>🎸 Manche</span>
            <span class="status-indicator" v-if="appStore.mancheDisplay">●</span>
          </div>
          
          <div 
            class="sidebar-item" 
            :class="{ active: appStore.notesSelectedDisplay }"
            @click="appStore.toggleNotesSelected()"
          >
            <span>🎵 Selection notes</span>
            <span class="status-indicator" v-if="appStore.notesSelectedDisplay">●</span>
          </div>
          
          <div 
            class="sidebar-item" 
            :class="{ active: appStore.keyboard }"
            @click="appStore.toggleKeyboard()"
          >
            <span>⌨️ Keyboard</span>
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
            <span>🎛️ Tuner</span>
            <span class="status-indicator" v-if="appStore.tunderDisplay">●</span>
          </div>
          
          <div 
            class="sidebar-item" 
            :class="{ active: appStore.scalesDisplay }"
            @click="appStore.toggleScales()"
          >
            <span>🎼 Scales</span>
            <span class="status-indicator" v-if="appStore.scalesDisplay">●</span>
          </div>
          
          <div 
            class="sidebar-item" 
            :class="{ active: appStore.chordssuggestDisplay }"
            @click="appStore.toggleChordssuggestion()"
          >
            <span>🎹 Chord Suggestions</span>
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
            <span>🔊 Play Sound</span>
            <span class="status-indicator" v-if="appStore.soundDisplay">●</span>
          </div>
          
          <div 
            class="sidebar-item" 
            :class="{ active: appStore.videoDisplay }"
            @click="appStore.toggleVideo()"
          >
            <span>📹 Play Video</span>
            <span class="status-indicator" v-if="appStore.videoDisplay">●</span>
          </div>
          
          <div 
            class="sidebar-item" 
            :class="{ active: appStore.videoDisplayNew }"
            @click="appStore.toggleVideoNew()"
          >
            <span>🎬 Play Video New</span>
            <span class="status-indicator" v-if="appStore.videoDisplayNew">●</span>
          </div>
          
          <div 
            class="sidebar-item" 
            :class="{ active: appStore.pictureDisplay }"
            @click="appStore.togglePicture()"
          >
            <span>🖼️ Display Picture</span>
            <span class="status-indicator" v-if="appStore.pictureDisplay">●</span>
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
            <span>🎮 Play Game</span>
            <span class="status-indicator" v-if="appStore.gameDisplay">●</span>
          </div>
          
          <div 
            class="sidebar-item" 
            :class="{ active: appStore.autoGammeSelect }"
            @click="appStore.toggleAutoGammeSelect()"
          >
            <span>🔄 Auto Gamme Select</span>
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
            <span>⚙️ Settings</span>
            <span class="status-indicator" v-if="appStore.settingsView">●</span>
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
          'mancheDisplay', 'notesSelectedDisplay', 'tunderDisplay', 'pictureDisplay',
          'soundDisplay', 'scalesDisplay', 'videoDisplay', 'videoDisplayNew',
          'gameDisplay', 'chordssuggestDisplay', 'settingsView', 'keyboard'
        ]
        
        allStates.forEach(state => {
          if (appStore[state]) {
            switch(state) {
              case 'mancheDisplay': appStore.toggleManche(); break;
              case 'notesSelectedDisplay': appStore.toggleNotesSelected(); break;
              case 'tunderDisplay': appStore.toggleTuner(); break;
              case 'pictureDisplay': appStore.togglePicture(); break;
              case 'soundDisplay': appStore.toggleSound(); break;
              case 'scalesDisplay': appStore.toggleScales(); break;
              case 'videoDisplay': appStore.toggleVideo(); break;
              case 'videoDisplayNew': appStore.toggleVideoNew(); break;
              case 'gameDisplay': appStore.toggleGame(); break;
              case 'chordssuggestDisplay': appStore.toggleChordssuggestion(); break;
              case 'settingsView': appStore.toggleSettings(); break;
              case 'keyboard': appStore.toggleKeyboard(); break;
            }
          }
        })
        
        // Then turn on the ones for the preset
        const presets = {
          'practice': ['mancheDisplay', 'notesSelectedDisplay', 'scalesDisplay'],
          'tuning': ['mancheDisplay', 'tunderDisplay', 'settingsView'],
          'game': ['mancheDisplay', 'gameDisplay', 'notesSelectedDisplay'],
          'minimal': ['mancheDisplay']
        }
        
        if (presets[presetName]) {
          presets[presetName].forEach(state => {
            if (!appStore[state]) {
              switch(state) {
                case 'mancheDisplay': appStore.toggleManche(); break;
                case 'notesSelectedDisplay': appStore.toggleNotesSelected(); break;
                case 'tunderDisplay': appStore.toggleTuner(); break;
                case 'pictureDisplay': appStore.togglePicture(); break;
                case 'soundDisplay': appStore.toggleSound(); break;
                case 'scalesDisplay': appStore.toggleScales(); break;
                case 'videoDisplay': appStore.toggleVideo(); break;
                case 'videoDisplayNew': appStore.toggleVideoNew(); break;
                case 'gameDisplay': appStore.toggleGame(); break;
                case 'chordssuggestDisplay': appStore.toggleChordssuggestion(); break;
                case 'settingsView': appStore.toggleSettings(); break;
                case 'keyboard': appStore.toggleKeyboard(); break;
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
      applyPreset
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 20px 15px;
  border-bottom: 1px solid #34495e;
  text-align: center;
}

.sidebar-header h3 {
  margin: 0;
  color: #ecf0f1;
  font-size: 1.2rem;
  font-weight: 600;
}

.sidebar-sections {
  padding: 10px 0;
}

.sidebar-section {
  margin-bottom: 20px;
}

.sidebar-section h4 {
  margin: 0 0 10px 15px;
  color: #bdc3c7;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.preset-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 15px;
}

.preset-button {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: left;
}

.preset-button:hover {
  background: linear-gradient(135deg, #2980b9, #1f4e79);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.sidebar-items {
  display: flex;
  flex-direction: column;
}

.sidebar-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-item:hover {
  background-color: #3a4f63;
  border-left-color: #3498db;
}

.sidebar-item.active {
  background-color: #2980b9;
  border-left-color: #e74c3c;
  font-weight: 500;
}

.sidebar-item span {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  color: #2ecc71;
  font-size: 0.6rem;
}

/* Custom scrollbar */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #2c3e50;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #34495e;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #4a5f7a;
}
</style>
