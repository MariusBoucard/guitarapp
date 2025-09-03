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
            
            <keyboardComponent v-show="appStore.keyboard"></keyboardComponent>
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
              <PlaySoundComponentNew v-show="appStore.soundDisplay"></PlaySoundComponentNew>
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
          <NotesAJouerComponent  
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
          </NotesAJouerComponent>
          <VideoSettingsCOmponent :videoFolderAll="appStore.videoFolder"></VideoSettingsCOmponent>
          <ColorComponent 
            v-show="appStore.settingsView" 
            :couleurdict="notesStore.colors"
          ></ColorComponent>
          <GammeFinderComponent 
            @colorgamme="appController.handleColorChange($event)"  
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
import PlaySoundComponentNew from './PlaySoundComponentNew.vue'
import LoadPictureComponent from './LoadPictureComponent.vue'
import VideoComponent from './videoComponent.vue'
import TrainingComponent from './TrainingComponent.vue'
import VideoSettingsCOmponent from './VideoSettingsCOmponent.vue'
import NotesAJouerComponent from './NoteAJouerComponent.vue'
import SuggestedChordsComponent from './SuggestedChordsComponent.vue'
import VideoComponentNewRefactored from './VideoComponentNewRefactored.vue'
import KeyboardComponent from './KeyboardComponent.vue'

export default {
  name: 'GuitarTrainingComponent',
  components: {
    TunerComponent,
    MancheComponent,
    NotesSelectedComponent,
    TuningComponent,
    ColorComponent,
    GammeFinderComponent,
    PlaySoundComponentNew,
    LoadPictureComponent,
    VideoComponent,
    TrainingComponent,
    VideoSettingsCOmponent,
    NotesAJouerComponent,
    VideoComponentNewRefactored,
    KeyboardComponent,
    SuggestedChordsComponent
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
      playVideoFromTree
    }
  }
}
</script>

<style scoped>
.guitar-training-container {
  width: 100%;
  height: 100%;
}

.main-content {
  width: 100%;
  padding: 10px;
}

.column {
  float: left;
  width: 80%;
}

.columnd {
  float: left;
  width: 20%;
}

.columnhalf {
  float: left;
  width: 50%;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}

h1, p, h3 {
  color: white;
}

/* Video Training Tree Styles */
.video-training-tree {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0;
  color: white;
}

.video-training-tree h2 {
  color: #4CAF50;
  margin-bottom: 15px;
  text-align: center;
}

.no-videos-message {
  text-align: center;
  padding: 20px;
  color: #888;
  font-style: italic;
}

.training-tree {
  max-height: 400px;
  overflow-y: auto;
}

.training-category {
  margin-bottom: 10px;
  border: 1px solid #444;
  border-radius: 5px;
  background-color: #333;
}

.training-category-header {
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  margin: 0;
  cursor: pointer;
  user-select: none;
  border-radius: 5px 5px 0 0;
  transition: background-color 0.3s;
}

.training-category-header:hover {
  background-color: #45a049;
}

.training-category-header.expanded {
  border-radius: 5px 5px 0 0;
}

.training-items {
  padding: 0;
}

.training-item {
  border-top: 1px solid #555;
}

.training-item-header {
  background-color: #555;
  color: white;
  padding: 8px 15px;
  margin: 0;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s;
}

.training-item-header:hover {
  background-color: #666;
}

.video-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #2a2a2a;
}

.video-item {
  padding: 8px 20px;
  border-bottom: 1px solid #444;
  cursor: pointer;
  transition: background-color 0.3s;
}

.video-item:hover {
  background-color: #4CAF50;
  color: white;
}

.video-item:last-child {
  border-bottom: none;
}

/* Scrollbar styling for webkit browsers */
.training-tree::-webkit-scrollbar {
  width: 8px;
}

.training-tree::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 4px;
}

.training-tree::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.training-tree::-webkit-scrollbar-thumb:hover {
  background: #777;
}
</style>
