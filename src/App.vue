<template>
  <body style="margin: 0px; background-image: url(/assets/frettebackground.jpeg);">
    <div class="image-container">
      <img class="background-image" src="../public/sky.jpg">
      <div class="content">
        <!-- Navigation Bar -->
        <ul class="ulnavbar">
          <li class="linavbar" :class="appStore.mancheDisplay ? 'enabled' : 'disabled'">
            <a href="#home" @click="appStore.toggleManche()">Manche</a>
          </li>
          <li class="linavbar" :class="appStore.notesSelectedDisplay ? 'enabled' : 'disabled'">
            <a href="#news" @click="appStore.toggleNotesSelected()">Selection notes</a>
          </li>
          <li class="linavbar" :class="appStore.autoGammeSelect ? 'enabled' : 'disabled'">
            <a @click="appStore.toggleAutoGammeSelect()">Auto gamme select</a>
          </li>
          <li class="linavbar" :class="appStore.scalesDisplay ? 'enabled' : 'disabled'">
            <a @click="appStore.toggleScales()">Scales</a>
          </li>
          <li class="linavbar" :class="appStore.settingsView ? 'enabled' : 'disabled'" style="float:right">
            <a class="active" @click="appStore.toggleSettings()">Settings</a>
          </li>
          <li class="linavbar" :class="appStore.tunderDisplay ? 'enabled' : 'disabled'" style="float:right">
            <a class="active" @click="appStore.toggleTuner()">Tuner</a>
          </li>
          <li class="linavbar" :class="appStore.pictureDisplay ? 'enabled' : 'disabled'" style="float:right">
            <a class="active" @click="appStore.togglePicture()">Display Picture</a>
          </li>
          <li class="linavbar" :class="appStore.soundDisplay ? 'enabled' : 'disabled'" style="float:right">
            <a class="active" @click="appStore.toggleSound()">Play sound</a>
          </li>
          <li class="linavbar" :class="appStore.videoDisplay ? 'enabled' : 'disabled'" style="float:right">
            <a class="active" @click="appStore.toggleVideo()">Play video</a>
          </li>
          <li class="linavbar" :class="appStore.videoDisplayNew ? 'enabled' : 'disabled'" style="float:right">
            <a class="active" @click="appStore.toggleVideoNew()">Play video new</a>
          </li>
          <li class="linavbar" :class="appStore.gameDisplay ? 'enabled' : 'disabled'" style="float:right">
            <a class="active" @click="appStore.toggleGame()">Play game</a>
          </li>
          <li class="linavbar" :class="appStore.chordssuggestDisplay ? 'enabled' : 'disabled'" style="float:right">
            <a class="active" @click="appStore.toggleChordssuggestion()">Suggestion accords</a>
          </li>
          <li class="linavbar" :class="appStore.keyboard ? 'enabled' : 'disabled'" style="float:right">
            <a class="active" @click="appStore.toggleKeyboard()">Keyboard</a>
          </li>
        </ul>

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
              <VideoComponentNewRefactored v-show="appStore.videoDisplayNew"></VideoComponentNewRefactored>
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
  </body>
</template>

<script>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore.js'
import { useNotesStore } from '@/stores/notesStore.js'
import { useTuningStore } from '@/stores/tuningStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { AppController } from '@/controllers/appController.js'
import { serviceManager } from '@/services/index.js'

// Components
import MancheComponent from './components/MancheComponent.vue'
import NotesSelectedComponent from './components/NotesSelectedComponent.vue'
import TuningComponent from './components/TuningComponent.vue'
import ColorComponent from './components/ColorComponent.vue'
import GammeFinderComponent from './components/GammeFinderComponent.vue'
import TunerComponent from './components/TunerComponent.vue'
import PlaySoundComponentNew from './components/PlaySoundComponentNew.vue'
import LoadPictureComponent from './components/LoadPictureComponent.vue'
import VideoComponent from './components/videoComponent.vue'
import VideoSettingsCOmponent from './components/VideoSettingsCOmponent.vue'
import NotesAJouerComponent from './components/NoteAJouerComponent.vue'
import SuggestedChordsComponent from './components/SuggestedChordsComponent.vue'
import VideoComponentNewRefactored from './components/VideoComponentNewRefactored.vue'
import KeyboardComponent from './components/KeyboardComponent.vue'

export default {
  name: 'App',
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
    VideoSettingsCOmponent,
    NotesAJouerComponent,
    VideoComponentNewRefactored,
    KeyboardComponent,
    SuggestedChordsComponent
  },
  
  setup() {
    // Initialize stores
    const appStore = useAppStore()
    const notesStore = useNotesStore()
    const tuningStore = useTuningStore()
    const gameStore = useGameStore()
    
    // Initialize controller
    const appController = new AppController(serviceManager)
    
    // Initialize application on mount
    onMounted(async () => {
      try {
        await appController.initialize()
        appController.setupAutoSave()
        console.log('App Mounted')
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    })
    
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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

 .column {
  float: left;
  width: 80%;
}
.columnd {
  float: left;
  width: 20%;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}.enabled
{
  background-color: #111;
}
.disabled{
  background-color: #333;
}
.ulnavbar {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #333;
}

.linavbar {
  float: left;
}

.lianavbar {
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

/* Change the link color to #111 (black) on hover */
.lianavbar a:hover {
  background-color: #111;
}

h1,p,h3 {
  color : white
}
.background-image{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  /* object-fit: cover; */
}
.image-container {
  position: relative;
  /* display: inline-block; */
}

.content {
  position: relative;
  z-index: 1;
  
  /* Your styles here */
}
</style>
