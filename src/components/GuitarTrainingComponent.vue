<template>
  <div class="guitar-training-container">
    <!-- Sidebar Toggle Button -->
    <button 
      class="sidebar-toggle-btn" 
      @click="toggleRightColumn"
      :title="isRightColumnFolded ? 'Show sidebar' : 'Hide sidebar'"
    >
      <span class="toggle-icon">{{ isRightColumnFolded ? '◀' : '▶' }}</span>
    </button>
    
    <!-- Main Content Area -->
    <div class="main-content">
      <div class="row" :class="{ 'sidebar-folded': isRightColumnFolded }">
        <div class="column">
          <div>
            <MancheComponent 
              :lefty="appStore.lefty" 
              :noteToPlay="gameStore.noteexpected" 
              :cheat="gameStore.cheat" 
              :score="gameStore.score" 
              :showgame="appStore.gameDisplay" 
              :gamePlay="gameStore.isPlayingRoot" 
              v-show="appStore.mancheDisplay"  
              @unselectgamme="appController.unselectGamme()" 
              :allnotesc="notesStore.allNotesC" 
              :allnotes="notesStore.allNotes" 
              :notePlayed="notesStore.notePlayed" 
              :diap="parseInt(tuningStore.diapason)" 
              :nbFrettes="tuningStore.nbfrettes" 
              :colorNotes="notesStore.colors" 
              :notesSelected="notesStore.noteSlectedList" 
              :tuning="tuningStore.tuningList" 
            />
            <VideoComponent v-show="appStore.videoDisplay"></VideoComponent> 
            <TrainingComponent v-show="appStore.trainingDisplay"></TrainingComponent>
            <VideoComponentNewRefactored v-show="appStore.videoDisplayNew" ref="videoPlayer"></VideoComponentNewRefactored>
            <TabReaderComponent v-show="appStore.tabReaderDisplay"></TabReaderComponent>
            <VST3PluginComponent v-show="appStore.vst3PluginDisplay"></VST3PluginComponent>
            
            <!-- Video Training Tree Section -->
          
            <KeyboardComponent 
              v-show="appStore.keyboard"
              :selectedNotes="notesStore.noteSlectedList"
              :colorNotes="notesStore.colors"
              @note-selected="handleKeyboardNoteSelect"
              @note-removed="handleKeyboardNoteRemove"
              @clear-all="handleKeyboardClearAll"
            ></KeyboardComponent>
             <LoadPictureComponent v-show="appStore.pictureDisplay"></LoadPictureComponent>
              <NotesSelectedComponent 
                :colorNotes="notesStore.colors" 
                :listNotes="notesStore.noteSlectedList" 
                @unselectgamme="appController.unselectGamme()"
                @note-checked="appController.handleNoteSelectionChange($event)" 
                @reinitSelected="appController.reinitNotesTracking()"
                v-show="appStore.notesSelectedDisplay"
              ></NotesSelectedComponent> 
                                                    <TuningComponent  
                @lefty="appController.handleLeftyChange($event)" 
                :lefty="appStore.lefty" 
                :allNotes="notesStore.allNotes" 
                v-show="appStore.settingsView" 
                @diap="appController.handleDiapasonChange($event)" 
                :diapason="parseInt(tuningStore.diapason)" 
                :notesColor="notesStore.colors" 
                :notesnumber="notesStore.nbnotes" 
                :notesval="notesStore.allNotes" 
                :tuningList="tuningStore.tuningList" 
                :cordesNumber="parseInt(tuningStore.nbStrings)"
              ></TuningComponent> 

          </div>
          <div class="row">

            <div class="columnhalf">

            </div>
          </div>
        </div>
        <div class="columnd" v-show="!isRightColumnFolded">
            <TunerComponent 
            v-show="appStore.tunderDisplay" 
            @changenote="appController.handleNoteChange($event)" 
            :notePlayed="notesStore.notePlayed"
          ></TunerComponent>
                            <PlaySoundComponent v-show="appStore.soundDisplay"></PlaySoundComponent>

          <SuggestedChordsComponent 
            v-show="appStore.chordssuggestDisplay" 
            :nbnotes="notesStore.nbnotes" 
            :selectedNotes="notesStore.noteSlectedList" 
            :selectedGamme="notesStore.gammeSelected"
          />
        
          <NoteToPlayComponent  
            v-show="appStore.gameDisplay" 
            @noteexpected="appController.handleGameNoteExpected($event)" 
            @cheatchanged="appController.handleGameCheatChanged($event)" 
            @scorechanged="appController.handleGameScoreChanged($event)" 
            @playchanged="appController.handleGamePlayChanged()" 
            @greatNote="appController.handleGameNoteResult($event)" 
            :notesSelected="notesStore.noteSlectedList" 
            :listeNote="notesStore.nbnotes" 
            :noteTuner="notesStore.notePlayed"
          >
          </NoteToPlayComponent>
          <VideoSettingsComponent :videoFolderAll="appStore.videoFolder"></VideoSettingsComponent>
          
          <!-- Song Player State Management -->
          <div class="song-player-state-manager" v-show="appStore.soundDisplay">
            <h3>Song Player State</h3>
            <div class="state-controls">
              <div class="file-input-group">
                <input 
                  type="text" 
                  v-model="stateFileName" 
                  placeholder="Enter state file name"
                  class="state-filename-input"
                />
                <div class="button-group">
                  <button @click="saveSongPlayerState" class="save-btn">
                    💾 Save State
                  </button>
                  <button @click="loadSongPlayerState" class="load-btn">
                    📂 Load State
                  </button>
                </div>
              </div>
              
              <div class="saved-states-list">
                <h4>Saved States:</h4>
                <div class="states-container" v-if="savedStates.length > 0">
                  <div 
                    v-for="state in savedStates" 
                    :key="state.name"
                    class="saved-state-item"
                  >
                    <span class="state-name">{{ state.name }}</span>
                    <span class="state-date">{{ formatDate(state.timestamp) }}</span>
                    <div class="state-actions">
                      <button @click="loadSpecificState(state.name)" class="load-specific-btn">
                        📂
                      </button>
                      <button @click="deleteState(state.name)" class="delete-btn">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
                <p v-else class="no-states-message">No saved states found</p>
              </div>
              
              <div class="export-import-section">
                <h4>Export/Import:</h4>
                <div class="export-import-controls">
                  <button @click="exportAllStates" class="export-btn">
                    📤 Export All
                  </button>
                  <input 
                    type="file" 
                    ref="importFileInput"
                    @change="importStates"
                    accept=".json"
                    style="display: none;"
                  />
                  <button @click="$refs.importFileInput.click()" class="import-btn">
                    📥 Import
                  </button>
                </div>
              </div>
            </div>
          </div>
          <ColorComponent 
            v-show="appStore.settingsView" 
            :couleurdict="notesStore.colors"
          ></ColorComponent>
          <GammeFinderComponent 
            @colorgamme="appController.handleColorChange($event)"  
            @notes-updated="appController.handleNotesUpdate($event)"
            :colorsave="notesStore.colorSave" 
            :color="notesStore.colors" 
            :nbnotes="notesStore.nbnotes" 
            :gammeSelected="notesStore.gammeSelected" 
            @newscale="appController.handleScaleSelection($event)" 
            v-show="appStore.scalesDisplay" 
            :notesSelected="notesStore.noteSlectedList"
          ></GammeFinderComponent>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { inject, computed, ref } from 'vue'
import { useAppStore } from '@/stores/appStore.js'
import { useNotesStore } from '@/stores/notesStore.js'
import { useTuningStore } from '@/stores/tuningStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { useVideoStore } from '@/stores/videoStore.js'
import { useSongPlayerStore } from '@/stores/songPlayerStore.js'

// Components
import MancheComponent from './MancheComponent.vue'
import NotesSelectedComponent from './NotesSelectedComponent.vue'
import TuningComponent from './TuningComponent.vue'
import ColorComponent from './ColorComponent.vue'
import GammeFinderComponent from './GammeFinderComponent.vue'
import TunerComponent from './TunerComponent.vue'
import PlaySoundComponent from './PlaySoundComponent.vue'
import LoadPictureComponent from './LoadPictureComponent.vue'
import VideoComponent from './VideoComponent.vue'
import TrainingComponent from './TrainingComponent.vue'
import VideoSettingsComponent from './VideoSettingsComponent.vue'
import NoteToPlayComponent from './NoteToPlayComponent.vue'
import SuggestedChordsComponent from './SuggestedChordsComponent.vue'
import VideoComponentNewRefactored from './VideoComponentNewRefactored.vue'
import KeyboardComponent from './KeyboardComponent.vue'
import TabReaderComponent from './TabReaderComponent.vue'
import VST3PluginComponent from './VST3PluginComponent.vue'

export default {
  name: 'GuitarTrainingComponent',
  components: {
    TunerComponent,
    MancheComponent,
    NotesSelectedComponent,
    TuningComponent,
    ColorComponent,
    GammeFinderComponent,
    PlaySoundComponent,
    LoadPictureComponent,
    VideoComponent,
    TrainingComponent,
    VideoSettingsComponent,
    NoteToPlayComponent,
    VideoComponentNewRefactored,
    KeyboardComponent,
    SuggestedChordsComponent,
    TabReaderComponent,
    VST3PluginComponent
  },
  
  setup() {
    // Get injected controller from parent
    const appController = inject('appController')
    
    // Initialize stores
    const appStore = useAppStore()
    const notesStore = useNotesStore()
    const tuningStore = useTuningStore()
    const gameStore = useGameStore()
    const videoStore = useVideoStore()
    const songPlayerStore = useSongPlayerStore()
    
    // Sidebar fold/unfold state
    const isRightColumnFolded = ref(false)
    
    // Song Player State Management
    const stateFileName = ref('')
    const savedStates = ref([])
    
    // Load saved states on component mount
    const loadSavedStatesList = () => {
      const states = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('songPlayerState_')) {
          const stateName = key.replace('songPlayerState_', '')
          try {
            const stateData = JSON.parse(localStorage.getItem(key))
            states.push({
              name: stateName,
              timestamp: stateData.timestamp || Date.now()
            })
          } catch (error) {
            console.error(`Error parsing state ${stateName}:`, error)
          }
        }
      }
      savedStates.value = states.sort((a, b) => b.timestamp - a.timestamp)
    }
    
    // Save current song player state
    const saveSongPlayerState = async () => {
      if (!stateFileName.value.trim()) {
        alert('Please enter a state file name')
        return
      }
      
      try {
        const stateData = {
          // Training data with audio files
          trainingList: trainingStore.trainingList,
          selectedTraining: trainingStore.selectedTraining,
          currentTrainingName: trainingStore.currentTrainingName,
          
          // Song player state
          songPlayerState: {
            audioPath: songPlayerStore.audioPath,
            songPath: songPlayerStore.songPath,
            currentSong: songPlayerStore.currentSong,
            songLength: songPlayerStore.songLength,
            startTime: songPlayerStore.startTime,
            endTime: songPlayerStore.endTime,
            speed: songPlayerStore.speed,
            pitch: songPlayerStore.pitch,
            loop: songPlayerStore.loop,
            defaultPath: songPlayerStore.defaultPath
          },
          
          // Metadata
          timestamp: Date.now(),
          version: '1.0'
        }
        
        const stateKey = `songPlayerState_${stateFileName.value.trim()}`
        localStorage.setItem(stateKey, JSON.stringify(stateData))
        
        // Refresh the saved states list
        loadSavedStatesList()
        
        const savedName = stateFileName.value.trim()
        // Clear the input
        stateFileName.value = ''
        
        alert(`State "${savedName}" saved successfully!`)
      } catch (error) {
        console.error('Error saving state:', error)
        alert('Error saving state. Please try again.')
      }
    }
    
    // Load song player state from file input
    const loadSongPlayerState = async () => {
      if (!stateFileName.value.trim()) {
        alert('Please enter a state file name to load')
        return
      }
      
      await loadSpecificState(stateFileName.value.trim())
    }
    
    // Load a specific saved state
    const loadSpecificState = async (stateName) => {
      try {
        const stateKey = `songPlayerState_${stateName}`
        const savedData = localStorage.getItem(stateKey)
        
        if (!savedData) {
          alert(`State "${stateName}" not found`)
          return
        }
        
        const stateData = JSON.parse(savedData)
        
        // Handle different data formats (backward compatibility)
        if (stateData.version === '1.0' || stateData.trainingList) {
          // New format with training data
          if (stateData.trainingList) {
            trainingStore.trainingList = stateData.trainingList
            trainingStore.selectedTraining = stateData.selectedTraining || 0
            trainingStore.currentTrainingName = stateData.currentTrainingName || ''
            
            // Save to storage
            trainingStore.saveTrainingsToStorage()
          }
          
          // Restore song player state
          const songState = stateData.songPlayerState || stateData
          songPlayerStore.audioPath = songState.audioPath || []
          songPlayerStore.songPath = songState.songPath || []
          songPlayerStore.currentSong = songState.currentSong || ''
          songPlayerStore.songLength = songState.songLength || 0
          songPlayerStore.startTime = songState.startTime || 0
          songPlayerStore.endTime = songState.endTime || 0
          songPlayerStore.speed = songState.speed || 100
          songPlayerStore.pitch = songState.pitch || 0
          songPlayerStore.loop = songState.loop || false
          songPlayerStore.defaultPath = songState.defaultPath || '/media/marius/DISK GROS/'
          
          // Update audio path for current training
          songPlayerStore.updateAudioPathForTraining(trainingStore)
        } else {
          // Legacy format - just song player data
          songPlayerStore.audioPath = stateData.audioPath || []
          songPlayerStore.songPath = stateData.songPath || []
          songPlayerStore.currentSong = stateData.currentSong || ''
          songPlayerStore.songLength = stateData.songLength || 0
          songPlayerStore.startTime = stateData.startTime || 0
          songPlayerStore.endTime = stateData.endTime || 0
          songPlayerStore.speed = stateData.speed || 100
          songPlayerStore.pitch = stateData.pitch || 0
          songPlayerStore.loop = stateData.loop || false
          songPlayerStore.defaultPath = stateData.defaultPath || '/media/marius/DISK GROS/'
        }
        
        alert(`State "${stateName}" loaded successfully!`)
      } catch (error) {
        console.error('Error loading state:', error)
        alert('Error loading state. Please check the file format.')
      }
    }
    
    // Delete a saved state
    const deleteState = (stateName) => {
      if (confirm(`Are you sure you want to delete state "${stateName}"?`)) {
        const stateKey = `songPlayerState_${stateName}`
        localStorage.removeItem(stateKey)
        loadSavedStatesList()
        alert(`State "${stateName}" deleted successfully!`)
      }
    }
    
    // Export all states to a JSON file
    const exportAllStates = () => {
      try {
        const exportData = {
          metadata: {
            exportDate: new Date().toISOString(),
            version: '1.0',
            description: 'Guitar Training App - Song Player States Export'
          },
          states: {},
          currentTrainingData: {
            trainingList: trainingStore.trainingList,
            selectedTraining: trainingStore.selectedTraining,
            currentTrainingName: trainingStore.currentTrainingName
          }
        }
        
        // Collect all saved states
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('songPlayerState_')) {
            const stateName = key.replace('songPlayerState_', '')
            exportData.states[stateName] = JSON.parse(localStorage.getItem(key))
          }
        }
        
        const dataStr = JSON.stringify(exportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `guitar_training_states_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        URL.revokeObjectURL(url)
        
        const stateCount = Object.keys(exportData.states).length
        const trainingCount = exportData.currentTrainingData.trainingList.length
        alert(`Export successful!\n${stateCount} states and ${trainingCount} trainings exported.`)
      } catch (error) {
        console.error('Error exporting states:', error)
        alert('Error exporting states. Please try again.')
      }
    }
    
    // Import states from a JSON file
    const importStates = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result)
          
          let importCount = 0
          let trainingImported = false
          
          // Handle new format with metadata
          if (importedData.metadata && importedData.states) {
            // Import training data if available
            if (importedData.currentTrainingData && importedData.currentTrainingData.trainingList) {
              const shouldImportTrainings = confirm(
                `Import ${importedData.currentTrainingData.trainingList.length} trainings?\n` +
                'This will replace your current training data.'
              )
              
              if (shouldImportTrainings) {
                trainingStore.trainingList = importedData.currentTrainingData.trainingList
                trainingStore.selectedTraining = importedData.currentTrainingData.selectedTraining || 0
                trainingStore.currentTrainingName = importedData.currentTrainingData.currentTrainingName || ''
                trainingStore.saveTrainingsToStorage()
                trainingImported = true
              }
            }
            
            // Import states
            for (const [stateName, stateData] of Object.entries(importedData.states)) {
              const stateKey = `songPlayerState_${stateName}`
              localStorage.setItem(stateKey, JSON.stringify(stateData))
              importCount++
            }
          } else {
            // Handle legacy format (direct states object)
            for (const [stateName, stateData] of Object.entries(importedData)) {
              const stateKey = `songPlayerState_${stateName}`
              localStorage.setItem(stateKey, JSON.stringify(stateData))
              importCount++
            }
          }
          
          loadSavedStatesList()
          
          let message = `Successfully imported ${importCount} states!`
          if (trainingImported) {
            message += `\nTraining data also imported.`
          }
          alert(message)
          
        } catch (error) {
          console.error('Error importing states:', error)
          alert('Error importing states. Please check the file format.')
        }
      }
      
      reader.readAsText(file)
      // Clear the input
      event.target.value = ''
    }
    
    // Format date for display
    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }
    
    // Load saved states on component mount
    loadSavedStatesList()
    
    // Toggle sidebar visibility
    const toggleRightColumn = () => {
      isRightColumnFolded.value = !isRightColumnFolded.value
    }
    
    // Video tree computed property
    const videoTreeList = computed(() => videoStore.niouTrainingList)
    
    // Video tree methods
    const toggleTrainingCategory = (index) => {
      videoStore.toggleTrainingVisibility(index)
    }
    
    const toggleTrainingItem = (trainingIndex, itemIndex) => {
      videoStore.toggleItemVisibility(trainingIndex, itemIndex)
    }
    
    const getTotalVideosInTraining = (training) => {
      if (!training.trainings) return 0
      return training.trainings.reduce((total, item) => {
        return total + (item.videos ? item.videos.length : 0)
      }, 0)
    }
    
    const playVideoFromTree = (video) => {
      console.log('Playing video from tree:', video)
      
      // Create a custom event to communicate with VideoComponentNewRefactored
      const event = new CustomEvent('launch-video', {
        detail: {
          name: video.name,
          absolutePath: video.absolutePath,
          path: video.path
        }
      })
      
      // Dispatch the event to be caught by VideoComponentNewRefactored
      document.dispatchEvent(event)
    }
    
    // Keyboard component event handlers
    const handleKeyboardNoteSelect = (note) => {
      // Convert # notation to S notation
      const storeNote = note.replace('#', 'S')
      // Find the note in the store and enable it
      const noteObj = notesStore.noteSlectedList.find(n => n.note === storeNote)
      if (noteObj) {
        // Create a copy with enabled state
        const updatedNote = { ...noteObj, enabled: true }
        appController.handleNoteSelectionChange(updatedNote)
      }
    }

    const handleKeyboardNoteRemove = (note) => {
      // Convert # notation to S notation
      const storeNote = note.replace('#', 'S')
      // Find the note in the store and disable it
      const noteObj = notesStore.noteSlectedList.find(n => n.note === storeNote)
      if (noteObj) {
        const updatedNote = { ...noteObj, enabled: false }
        appController.handleNoteSelectionChange(updatedNote)
      }
    }

    const handleKeyboardClearAll = () => {
      // Clear all selected notes
      appController.reinitNotesTracking()
    }
    
    return {
      appStore,
      notesStore,
      tuningStore,
      gameStore,
      videoStore,
      appController,
      videoTreeList,
      toggleTrainingCategory,
      toggleTrainingItem,
      getTotalVideosInTraining,
      playVideoFromTree,
      handleKeyboardNoteSelect,
      handleKeyboardNoteRemove,
      handleKeyboardClearAll,
      isRightColumnFolded,
      toggleRightColumn,
      // Song Player State Management
      songPlayerStore,
      stateFileName,
      savedStates,
      saveSongPlayerState,
      loadSongPlayerState,
      loadSpecificState,
      deleteState,
      exportAllStates,
      importStates,
      formatDate
    }
  }
}
</script>

<style scoped>
.guitar-training-container {
  background: var(--bg-primary);
  padding: 0;
  color: var(--text-primary);
  width: 100%;
  min-height: 100vh; /* Ensure it takes at least full viewport height */
  height: auto; /* Allow it to grow with content */
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Sidebar Toggle Button */
.sidebar-toggle-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: var(--card-bg, #2c3e50);
  border: 2px solid var(--border-accent, #3498db);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.sidebar-toggle-btn:hover {
  background: var(--btn-primary-hover, #34495e);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.toggle-icon {
  color: var(--text-primary, #ffffff);
  font-size: 16px;
  font-weight: bold;
}

.main-content {
  max-width: 100%;
  margin: 0;
  width: 100%;
  padding: 0;
  flex: 1; /* Take up remaining space */
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  flex: 1; /* Allow row to expand */
  align-items: stretch; /* Make columns equal height */
}

.column {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 80%;
  transition: width 0.3s ease;
  min-height: 0; /* Allow proper flex behavior */
}

/* When sidebar is folded, expand the main column */
.row.sidebar-folded .column {
  width: 100%;
  flex: 1;
}

.columnd {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 280px;
  width: 20%;
  transition: all 0.3s ease;
  min-height: 0; /* Allow proper flex behavior */
}

.columnhalf {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  float: left;
  width: 50%;
}

h1, p, h3 {
  color: var(--text-primary);
}

/* Video Training Tree Styles */
.video-training-tree {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin: var(--spacing-lg) 0;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px var(--shadow-medium);
  color: var(--text-primary);
}

.video-training-tree h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--border-accent);
  text-align: center;
}

.no-videos-message {
  text-align: center;
  padding: var(--spacing-xxl);
  color: var(--text-secondary);
  font-style: italic;
  background: rgba(52, 73, 94, 0.3);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-primary);
}

.training-tree {
  max-height: 500px;
  overflow-y: auto;
  padding-right: var(--spacing-sm);
}

.training-category {
  margin-bottom: var(--spacing-lg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: rgba(44, 62, 80, 0.8);
  box-shadow: 0 4px 12px var(--shadow-light);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-primary);
}

.training-category:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.training-category-header {
  background: var(--btn-primary);
  color: var(--text-primary);
  padding: var(--spacing-lg);
  margin: 0;
  cursor: pointer;
  user-select: none;
  font-weight: var(--font-semibold);
  font-size: 1.1rem;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.training-category-header:hover {
  background: var(--btn-primary-hover);
}

.training-category-header.expanded {
  background: var(--secondary-blue-dark);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.training-category-header::after {
  content: '▼';
  transition: transform var(--transition-normal);
  font-size: 0.8rem;
}

.training-category-header.expanded::after {
  transform: rotate(180deg);
}

.training-items {
  background: rgba(52, 73, 94, 0.4);
  padding: 0;
}

.training-item {
  border-top: 1px solid var(--border-primary);
}

.training-item-header {
  background: rgba(58, 79, 99, 0.8);
  color: var(--text-primary);
  padding: var(--spacing-md) var(--spacing-lg);
  margin: 0;
  cursor: pointer;
  user-select: none;
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.training-item-header:hover {
  background: var(--bg-hover);
  color: var(--secondary-blue);
}

.training-item-header::after {
  content: '▶';
  transition: transform var(--transition-normal);
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.training-item-header.expanded::after {
  transform: rotate(90deg);
  color: var(--accent-green);
}

.video-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: rgba(44, 62, 80, 0.6);
}

.video-item {
  padding: var(--spacing-md) var(--spacing-xl);
  border-bottom: 1px solid rgba(52, 73, 94, 0.5);
  cursor: pointer;
  transition: all var(--transition-normal);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.video-item:hover {
  background: var(--secondary-blue);
  color: var(--text-primary);
  padding-left: calc(var(--spacing-xl) + var(--spacing-sm));
  box-shadow: inset 4px 0 0 var(--accent-green);
}

.video-item:last-child {
  border-bottom: none;
}

/* Custom Scrollbar */
.training-tree::-webkit-scrollbar {
  width: 8px;
}

.training-tree::-webkit-scrollbar-track {
  background: var(--primary-dark);
  border-radius: var(--radius-sm);
}

.training-tree::-webkit-scrollbar-thumb {
  background: var(--primary-medium);
  border-radius: var(--radius-sm);
  transition: background var(--transition-normal);
}

.training-tree::-webkit-scrollbar-thumb:hover {
  background: var(--primary-accent);
}

/* Component containers styling */
.guitar-training-container > * {
  transition: opacity var(--transition-normal);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .row {
    flex-direction: column;
  }
  
  .columnd {
    min-width: auto;
    width: 100%;
    float: none;
  }
  
  .column {
    width: 100%;
    float: none;
  }
  
  .columnhalf {
    width: 100%;
    float: none;
  }
}

@media (max-width: 768px) {
  .guitar-training-container {
    padding:0;
  }
  
  .video-training-tree {
    padding: var(--spacing-lg);
  }
  
  .columnhalf {
    margin-bottom: var(--spacing-lg);
  }
  
  /* Adjust toggle button for mobile */
  .sidebar-toggle-btn {
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
  }
  
  .toggle-icon {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .sidebar-toggle-btn {
    width: 35px;
    height: 35px;
  }
  
  .toggle-icon {
    font-size: 12px;
  }
}

/* Song Player State Management Styles */
.song-player-state-manager {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin: var(--spacing-lg) 0;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px var(--shadow-medium);
  color: var(--text-primary);
}

.song-player-state-manager h3 {
  color: var(--text-primary);
  font-size: 1.3rem;
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--border-accent);
  text-align: center;
}

.song-player-state-manager h4 {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: var(--font-medium);
  margin: var(--spacing-lg) 0 var(--spacing-md) 0;
}

.state-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.file-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.state-filename-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--input-bg, rgba(255, 255, 255, 0.1));
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all var(--transition-normal);
}

.state-filename-input:focus {
  outline: none;
  border-color: var(--border-accent);
  box-shadow: 0 0 15px rgba(52, 152, 219, 0.3);
}

.button-group {
  display: flex;
  gap: var(--spacing-md);
}

.save-btn, .load-btn, .export-btn, .import-btn {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.save-btn {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
}

.load-btn {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.load-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.saved-states-list {
  background: rgba(44, 62, 80, 0.3);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-primary);
}

.states-container {
  max-height: 200px;
  overflow-y: auto;
  padding-right: var(--spacing-sm);
}

.saved-state-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: rgba(52, 73, 94, 0.5);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
  transition: all var(--transition-normal);
}

.saved-state-item:hover {
  background: rgba(52, 73, 94, 0.7);
  transform: translateX(5px);
}

.state-name {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  flex: 1;
}

.state-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0 var(--spacing-md);
}

.state-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.load-specific-btn, .delete-btn {
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 0.8rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.load-specific-btn {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
}

.load-specific-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.delete-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.no-states-message {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-secondary);
  font-style: italic;
  background: rgba(52, 73, 94, 0.2);
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-primary);
  margin: 0;
}

.export-import-section {
  background: rgba(44, 62, 80, 0.3);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-primary);
}

.export-import-controls {
  display: flex;
  gap: var(--spacing-md);
}

.export-btn {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
}

.import-btn {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3);
}

.import-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(155, 89, 182, 0.4);
}

/* Custom Scrollbar for states container */
.states-container::-webkit-scrollbar {
  width: 6px;
}

.states-container::-webkit-scrollbar-track {
  background: var(--primary-dark);
  border-radius: var(--radius-sm);
}

.states-container::-webkit-scrollbar-thumb {
  background: var(--primary-medium);
  border-radius: var(--radius-sm);
  transition: background var(--transition-normal);
}

.states-container::-webkit-scrollbar-thumb:hover {
  background: var(--primary-accent);
}

/* Add subtle animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.video-training-tree, .song-player-state-manager {
  animation: fadeInUp var(--transition-slow) ease-out;
}
</style>
