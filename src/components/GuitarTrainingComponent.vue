<template>
  <div class="guitar-training-container">
    <!-- Main Content Area -->
    <div class="main-content">
      <div class="row">
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
            
            <!-- Video Training Tree Section -->
            <div v-show="appStore.videoDisplayNew" class="video-training-tree">
              <h2>Video Training Library</h2>
              <div v-if="videoTreeList.length === 0" class="no-videos-message">
                <p>No video library loaded. Use "Select Training Directory" in the video component above.</p>
              </div>
              <div v-else class="training-tree">
                <div v-for="(training, index) in videoTreeList" :key="index" class="training-category">
                  <h3 @click="toggleTrainingCategory(index)" class="training-category-header" 
                      :class="{ expanded: training.show }">
                    📁 {{ training.trainingType }} ({{ getTotalVideosInTraining(training) }} videos)
                  </h3>
                  <div v-show="training.show" class="training-items">
                    <div v-for="(item, subIndex) in training.trainings" :key="subIndex" class="training-item">
                      <h4 @click="toggleTrainingItem(index, subIndex)" class="training-item-header"
                          :class="{ expanded: item.show }">
                        📂 {{ item.name }} ({{ item.videos ? item.videos.length : 0 }} videos)
                      </h4>
                      <ul v-show="item.show" class="video-list">
                        <li v-for="(video, videoIndex) in item.videos || []" :key="videoIndex"
                            @click="playVideoFromTree(video)" class="video-item">
                          🎥 {{ video.name }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <KeyboardComponent 
              v-show="appStore.keyboard"
              :selectedNotes="notesStore.noteSlectedList"
              :colorNotes="notesStore.colors"
              @note-selected="handleKeyboardNoteSelect"
              @note-removed="handleKeyboardNoteRemove"
              @clear-all="handleKeyboardClearAll"
            ></KeyboardComponent>
          </div>
          <div class="row">
            <div class="columnhalf"> 
              <LoadPictureComponent v-show="appStore.pictureDisplay"></LoadPictureComponent>
              <NotesSelectedComponent 
                :colorNotes="notesStore.colors" 
                :listNotes="notesStore.noteSlectedList" 
                @unselectgamme="appController.unselectGamme()"
                @note-checked="appController.handleNoteSelectionChange($event)" 
                @reinitSelected="appController.reinitNotesTracking()"
                v-show="appStore.notesSelectedDisplay"
              ></NotesSelectedComponent> 
            </div>
            <div class="columnhalf">
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
              <PlaySoundComponent v-show="appStore.soundDisplay"></PlaySoundComponent>
            </div>
          </div>
        </div>
        <div class="columnd">
          <SuggestedChordsComponent 
            v-show="appStore.chordssuggestDisplay" 
            :nbnotes="notesStore.nbnotes" 
            :selectedNotes="notesStore.noteSlectedList" 
            :selectedGamme="notesStore.gammeSelected"
          />
          <TunerComponent 
            v-show="appStore.tunderDisplay" 
            @changenote="appController.handleNoteChange($event)" 
            :notePlayed="notesStore.notePlayed"
          ></TunerComponent>
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
import { inject, computed } from 'vue'
import { useAppStore } from '@/stores/appStore.js'
import { useNotesStore } from '@/stores/notesStore.js'
import { useTuningStore } from '@/stores/tuningStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { useVideoStore } from '@/stores/videoStore.js'

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
    TabReaderComponent
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
      handleKeyboardClearAll
    }
  }
}
</script>

<style scoped>
.guitar-training-container {
  background: var(--bg-primary);
  min-height: 100vh;
  padding: var(--spacing-lg);
  color: var(--text-primary);
  width: 100%;
  height: 100%;
}

.main-content {
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
  padding: var(--spacing-md);
}

.row {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}

.column {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  float: left;
  width: 80%;
}

.columnd {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 280px;
  float: left;
  width: 20%;
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
    padding: var(--spacing-md);
  }
  
  .video-training-tree {
    padding: var(--spacing-lg);
  }
  
  .columnhalf {
    margin-bottom: var(--spacing-lg);
  }
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

.video-training-tree {
  animation: fadeInUp var(--transition-slow) ease-out;
}
</style>
