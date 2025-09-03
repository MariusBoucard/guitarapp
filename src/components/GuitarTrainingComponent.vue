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
import { inject, nextTick } from 'vue'
import { useAppStore } from '@/stores/appStore.js'
import { useNotesStore } from '@/stores/notesStore.js'
import { useTuningStore } from '@/stores/tuningStore.js'
import { useGameStore } from '@/stores/gameStore.js'

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
    
    return {
      appStore,
      notesStore,
      tuningStore,
      gameStore,
      appController
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
</style>
