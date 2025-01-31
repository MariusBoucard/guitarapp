<template>
  <body style="margin : 0px  ;background-image: url(/assets/frettebackground.jpeg);" >
    <div class="image-container">
<img class="background-image" src="../public/sky.jpg">
<div class="content">
  <!-- <GammeFromChordsComponent></GammeFromChordsComponent> -->
    <ul class="ulnavbar">
      <li class="linavbar" :class=" this.mancheDisplay ?  'enabled' :'disabled' " ><a href="#home" @click=" this.mancheDisplay = ! this.mancheDisplay">Manche</a></li>
      <li class="linavbar" :class=" this.notesSelectedDisplay ?  'enabled' :'disabled' "><a href="#news" @click="this.notesSelectedDisplay = ! this.notesSelectedDisplay" >Selection notes</a></li>
      <li class="linavbar" :class=" this.autoGammeSelect ?  'enabled' :'disabled' " ><a  style="{ backgroundColor: red;}" @click="$event => {this.autoGammeSelect = !this.autoGammeSelect}" > Auto gamme select</a></li>

      <li class="linavbar" :class=" this.scalesDisplay ?  'enabled' :'disabled' " ><a  @click="this.scalesDisplay = ! this.scalesDisplay">Scales</a></li>
      <li class="linavbar" :class=" this.settingsView ?  'enabled' :'disabled' " style="float:right"><a class="active" @click="this.settingsView = ! this.settingsView">Settings</a></li>
      <li class="linavbar" :class=" this.tunderDisplay ?  'enabled' :'disabled' " style="float:right"><a class="active"  @click="this.tunderDisplay = ! this.tunderDisplay">Tuner</a></li>
      <li class="linavbar" :class=" this.pictureDisplay ?  'enabled' :'disabled' " style="float:right"><a class="active" @click="this.pictureDisplay = ! this.pictureDisplay">Display Picture</a></li>
      <li class="linavbar" :class=" this.soundDisplay ?  'enabled' :'disabled' " style="float:right"><a class="active" @click="this.soundDisplay = ! this.soundDisplay">Play sound</a></li>
      <li class="linavbar" :class=" this.videoDisplay ?  'enabled' :'disabled' " style="float:right"><a class="active"  @click="this.videoDisplay = ! this.videoDisplay">Play video</a></li>
      <li class="linavbar" :class=" this.videoDisplayNew ?  'enabled' :'disabled' " style="float:right"><a class="active"  @click="this.videoDisplayNew = ! this.videoDisplayNew">Play video new</a></li>

      <li class="linavbar" :class=" this.gameDisplay ?  'enabled' :'disabled' " style="float:right"><a class="active"  @click="this.gameDisplay = ! this.gameDisplay ">Play game</a></li>
      <li class="linavbar" :class=" this.chordsDisplay ?  'enabled' :'disabled' " style="float:right"><a class="active"  @click="this.chordsDisplay = ! this.chordsDisplay">Affichage accords</a></li>
      <li class="linavbar" :class=" this.chordssuggestDisplay ?  'enabled' :'disabled' " style="float:right"><a class="active"  @click="this.chordssuggestDisplay = ! this.chordssuggestDisplay">Suggestion accords</a></li>
      <li class="linavbar" :class=" this.keyboard ?  'enabled' :'disabled' " style="float:right"><a class="active"  @click="this.keyboard = ! this.keyboard">Keyboard</a></li>
    


    </ul> 
    <div class="row">
      <div class="column">
        <div style="">
          <MancheComponent :lefty="this.lefty" :noteToPlay="this.noteexpected" :cheat="this.cheat" :score="this.score" :showgame="this.gameDisplay" :gamePlay="this.isPlayingRoot" v-show="this.mancheDisplay"  @unselectgamme="unselectGamme()" :allnotesc="this.allNotesC" :allnotes="this.allNotes" :notePlayed="this.notePlayed" :diap=parseInt(this.diapason) :nbFrettes=this.nbfrettes :colorNotes=this.colorsComp :notesSelected="this.noteselectedcomp" :tuning=this.tuningList />
          <VideoComponent v-show="this.videoDisplay"></VideoComponent> 
          <VideoComponentNew v-show="this.videoDisplayNew"></VideoComponentNew>
          <keyboardComponent v-show="this.keyboard"></keyboardComponent>
        </div>
        <div class="row">
          <div class="columnhalf"> 
            <LoadPictureComponent v-show="this.pictureDisplay"></LoadPictureComponent>
            <NotesSelectedComponent :colorNotes=this.colors :listNotes=this.noteSlectedList @unselectgamme="unselectGamme()"
             @note-checked="changeNoteSelection( $event)" @reinitSelected="this.reinit()"></NotesSelectedComponent> 
 
         </div>
         <div class="columnhalf">
           <TuningComponent  @lefty="this.lefty = $event" :lefty="this.lefty" :allNotes="this.allNotes" v-show="this.settingsView" @diap="changeDiap( $event)" :diapason=parseInt(this.diapason) :notesColor=this.colors :notesnumber=this.nbnotes :notesval="this.allNotes" :tuningList=this.tuningList :cordesNumber=parseInt(this.nbStrings)></TuningComponent> 
          
           <PlaySoundComponent v-show="this.soundDisplay" ></PlaySoundComponent>
          </div>
        </div>
        
      </div>
      <div class="columnd">
        <SuggestedChordsComponent v-show="this.chordssuggestDisplay" :nbnotes="this.nbnotes" :selectedNotes="this.noteSlectedList" :selectedGamme="this.gammeSelected"/>

        <TunerComponent v-show="this.tunderDisplay" @changenote="changeNote($event,note)" :notePlayed="this.notePlayed" ></TunerComponent>
    <NotesAJouerComponent  v-show="this.gameDisplay" @noteexpected="this.noteexpected = $event" @cheatchanged="this.cheat= $event" @scorechanged="this.score = $event" @playchanged="this.isPlayingRoot = ! this.isPlayingRoot" @greatNote="resultPlayed($event,val)" :notesSelected=this.noteSlectedList :listeNote=this.nbnotes :noteTuner=this.notePlayed>
    </NotesAJouerComponent>
              <VideoSettingsCOmponent :videoFolderAll="this.videoFolder"></VideoSettingsCOmponent>
    <ColorComponent v-show="this.settingsView" :couleurdict=this.colors ></ColorComponent>
    <GammeFinderComponent @colorgamme="this.changeColor($event,colors)"  :colorsave="this.colorSave" :color="this.colors" :nbnotes="this.nbnotes" :gammeSelected="this.gammeSelectedComp" @newscale="setScale($event,scale)" v-show="this.scalesDisplay" :notesSelected="this.noteSlectedList"></GammeFinderComponent>
    <!-- <metronome></metronome> -->
  </div>
  
    <GuitarChordsComponent v-show="this.chordsDisplay" />

  
  
</div> 

</div></div>

</body>
</template>

<script>
import MancheComponent from './components/MancheComponent.vue'
import NotesSelectedComponent from './components/NotesSelectedComponent.vue';
import TuningComponent from './components/TuningComponent.vue';
import ColorComponent from './components/ColorComponent.vue';
import GammeFinderComponent from './components/GammeFinderComponent.vue';
import TunerComponent from './components/TunerComponent.vue';
import PlaySoundComponent from './components/PlaySoundComponent.vue';
import LoadPictureComponent from './components/LoadPictureComponent.vue';
import VideoComponent from './components/videoComponent.vue';
import VideoSettingsCOmponent from './components/VideoSettingsCOmponent.vue';
import NotesAJouerComponent from './components/NoteAJouerComponent.vue'
import myImage from '@/assets/frettebackground.jpeg';
import GuitarChordsComponent from './components/GuitarChordsComponent.vue';
import SuggestedChordsComponent from './components/SuggestedChordsComponent.vue';
import VideoComponentNew from './components/videoComponentNew.vue';
import KeyboardComponent from './components/KeyboardComponent.vue';
// import GammeFromChordsComponent from './components/GammeFromChordsComponent.vue';
// import metronome from 'vue-metronome'
export default {
  name: 'App',
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
    VideoSettingsCOmponent,
    NotesAJouerComponent,
    VideoComponentNew
    // metronome
    ,
    KeyboardComponent,
    GuitarChordsComponent,
    SuggestedChordsComponent,
    // GammeFromChordsComponent
},
  data () {
    return {
      lefty : false,
      noteexpected:"",
      cheat:false,
      mancheDisplay : true,
      notesSelectedDisplay : true,
      tunderDisplay : false,
      pictureDisplay : false,
      soundDisplay : false,
      scalesDisplay : true,
      videoDisplay : false,
      videoDisplayNew : true,
      gameDisplay : false,
      chordsDisplay : false,
      chordssuggestDisplay : false,
      score:0,
      gammeSelected : "",
      keyboard : false,
      noteGreat :  undefined,

      nbfrettes : 24,
      diapason : 648,
      nbStrings: 7,
      notePlayed : "",
      notesPlayedList :[],
      nbnotes: [
                { id: 0, note: "A" },
                { id: 1, note: "AS" },
                { id: 2, note: "B" },
                { id: 3, note: "C" },
                { id: 4, note: "CS" },
                { id: 5, note: "D" },
                { id: 6, note: "DS" },
                { id: 7, note: "E" },
                { id: 8, note: "F" },
                { id: 9, note: "FS" },
                { id: 10, note: "G" },
                { id: 11, note: "GS" },
            ],
            nbnotesc: [
                { id: 0, note: "C" },
                { id: 1, note: "CS" },
                { id: 2, note: "D" },
                { id: 3, note: "DS" },
                { id: 4, note: "E" },
                { id: 5, note: "F" },
                { id: 6, note: "FS" },
                { id: 7, note: "G" },
                { id: 8, note: "GS" },
                { id: 9, note: "A" },
                { id: 10, note: "AS" },
                { id: 11, note: "B" },
            ],
      tuningList: [
        {cordeId: 0,tuning : 'E5'},
        {cordeId: 1,tuning : 'B4'},
        {cordeId: 2,tuning : 'G4'},
        {cordeId: 3,tuning : 'D4'},
        {cordeId: 4,tuning : 'A3'},
        {cordeId: 5,tuning : 'E3'},
        {cordeId: 6,tuning : 'A2'}
      
      ],
      autoGammeSelect : false,
      allNotesC : [],
      notesPlayedDict: 
      [
        { note : 'A',nb : 0},
        { note : 'AS',nb : 0},
        { note : 'B',nb : 0},
        { note : 'C',nb : 0},
        { note : 'CS',nb : 0},
        { note : 'D',nb : 0},
        { note : 'DS',nb : 0},
        { note : 'E',nb : 0},
        { note : 'F',nb : 0},
        { note : 'FS',nb : 0},
        { note : 'G',nb : 0},
        { note : 'GS',nb : 0}
    ],
    settingsView : false
,
      noteSlectedList: 
      [
        { note : 'A',enabled : false},
        { note : 'AS',enabled : false},
        { note : 'B',enabled : false},
        { note : 'C',enabled : false},
        { note : 'CS',enabled : false},
        { note : 'D',enabled : false},
        { note : 'DS',enabled : false},
        { note : 'E',enabled : true},
        { note : 'F',enabled : false},
        { note : 'FS',enabled : false},
        { note : 'G',enabled : false},
        { note : 'GS',enabled : false}
    ],
    allNotes : [],
    colors : [
        {note : "A",color:"black"},
        {note : "AS",color:"grey"},
        {note : "B",color:"white"},
        {note : "C",color:"blue"},
        {note : "CS",color:"lightblue"},
        {note : "D",color:"red"},
        {note : "DS",color:"pink"},
        {note : "E",color:"green"},
        {note : "F",color:"brown"},
        {note : "FS",color:"#b5651d"},
        {note : "G",color:"yellow"},
        {note : "GS",color:"lightyellow"},
      
      ],
      isPlayingRoot : false,
      colorSave : [
        {note : "A",color:"black"},
        {note : "AS",color:"grey"},
        {note : "B",color:"white"},
        {note : "C",color:"blue"},
        {note : "CS",color:"lightblue"},
        {note : "D",color:"red"},
        {note : "DS",color:"pink"},
        {note : "E",color:"green"},
        {note : "F",color:"brown"},
        {note : "FS",color:"lightbrown"},
        {note : "G",color:"yellow"},
        {note : "GS",color:"lightyellow"},
      
      ],
      videoFolder : ""

    }


  },
  methods : {
    changeColor(colors){
      console.log(colors)
      this.colors = colors
    },
    reinit(){
      this.notesPlayedList = []
      this.notesPlayedDict.forEach( a => a.nb =0)
    },
    resultPlayed(noteBoolean){
      this.noteGreat = noteBoolean
    },
    setScale(scale){
      console.log(scale)
      this.gammeSelected = scale
    },
    allNotesComp(){
      var a = []
      
      for (let i = 0; i <9; i++) { 

          this.nbnotes.forEach(note =>
          {
            // console.log(note)
            a.push({id : (i*12+note.id) , note : note.note+i})
          }

          )
         
        }
        return a
      }
    ,
    allNotesCompc(){
      var a = []
      
      for (let i = 0; i <9; i++) { 

          this.nbnotesc.forEach(note =>
          {
            // console.log(note)
            a.push({id : (i*12+note.id) , note : note.note+i})
          }

          )
         
        }
        return a
      },
    changeNote(note){
     
      if (this.name(note.note)!==undefined){

        this.notePlayed = this.name(note.note)+note.octave
        if(this.autoGammeSelect){
          if(this.notesPlayedList.length >100){
            var a = this.notesPlayedList.shift()
            var find = this.notesPlayedDict.find(note => note.note === a)
            find.nb = find.nb -1
          }
          this.notesPlayedList.push(this.notePlayed.slice(0,this.notePlayed.length-1))
          find = this.notesPlayedDict.find(note => note.note === this.notePlayed.slice(0,this.notePlayed.length-1))
          find.nb +=1
          this.selectGamme()
        }
      }
    },
    unselectGamme(){
      this.gammeSelected=""
    },
    selectGamme(){
      // console.log("damn")
      //Il faut ici selectionner les notes au dessus d'un certain nb d occurences en fct du dict
      var dick =this.notesPlayedDict.sort((a,b) => a.nb -b.nb)
      var dick2 = dick.slice(0,dick.length-7)

       dick = dick.slice((dick.length-7),dick.length)
       dick2.forEach(a => {
        var find = this.noteSlectedList.find(note => note.note === a.note)
        find.enabled=false
       })
      //  console.log(dick)
    dick.forEach(a =>{
  if(a.nb > 2){
   var find = this.noteSlectedList.find(note => note.note === a.note)
    find.enabled=true
  } else {
    find = this.noteSlectedList.find(note => note.note === a.note)
    find.enabled=false
  }
})
},
    changeNoteSelection(note){
      // console.log('caca'+note);
      const find = this.noteSlectedList.find((notes) => notes.note == note.note )
      find.enabled = note.enabled
      this.noteSlectedList.forEach(
              col => {localStorage.setItem(col.note+"Selected",col.enabled)
             console.log(col.enabled)}
            )
            console.log("change note selection is called")

            this.gammeSelected = ""
    },
    changeDiap(diap){
      // console.log("diap "+diap)
      this.diapason = diap
      localStorage.setItem('diap',this.diapason)
    },
    name(note) {
              const names = ["A", "AS", "B", "C", "CS", "D", "DS", "E", "F", "FS", "G", "GS"];
              const note12 = (note >= 0) ? note % 12 : note % 12 + 12;
              var i = Math.floor((note12 + 0.5) % 12);
              return names[i];
            }
  },
  watch: {

      mancheDisplay : {
        handler() {
          localStorage.setItem('mancheDisplay',this.mancheDisplay)
        }
      } ,
      notesSelectedDisplay :  {
        handler() {
            localStorage.setItem('notesSelectedDisplay',this.notesSelectedDisplay)
        }
      } ,
      tunderDisplay : {
        handler() {
            localStorage.setItem('tunerDisplay',this.tunderDisplay)
        }
      } ,
      pictureDisplay :  {
        handler() {
            localStorage.setItem('pictureDisplay',this.pictureDisplay)
        }
      } ,
      soundDisplay :  {
        handler() {
            localStorage.setItem('soundDisplay',this.soundDisplay)
        }
      } ,
      scalesDisplay :  {
        handler() {
            localStorage.setItem('scaleDisplay',this.scalesDisplay)
        }
      } ,
      videoDisplay :  {
        handler() {
            localStorage.setItem('videoDisplay',this.videoDisplay)
        }
      } ,
      videoDisplayNew :  {
        handler() {
            localStorage.setItem('videoDisplayNew',this.videoDisplayNew)
        }
      } ,
      gameDisplay :  {
        handler() {
            localStorage.setItem('gameDisplay',this.gameDisplay)
        }
      } ,
      chordsDisplay :  {
        handler() {
            localStorage.setItem('chordsDisplay',this.chordsDisplay)
        }
      } ,
      chordssuggestDisplay : {
        handler() {
            localStorage.setItem('chordssuggestDisplay',this.chordssuggestDisplay)
        }
      } ,
    colors: {        handler() {
            this.colors.forEach(
              col => localStorage.setItem(col.note,col.color)
            )
            console.log('Colors array changed!');
        },
        deep: true,
    },
    noteSlectedList: {
        handler() {
            // this.noteSlectedList.forEach(
            //   col => {localStorage.setItem(col.note+"Selected",JSON.stringify(col.enabled))
            //  console.log(col.enabled)}
            // )
            console.log('selected changed!');
            console.log(this.noteSlectedList)
        },
        deep: true,
    },
    
  
   
  
  
  },
  created(){
    
  },
 mounted(){
 

                  if(localStorage.getItem('mancheDisplay')!==null){
                    this.mancheDisplay = ( localStorage.getItem('mancheDisplay') === "true")
                  }
                  if(localStorage.getItem('notesSelectedDisplay')!==null){
                    this.notesSelectedDisplay =  ( localStorage.getItem('notesSelectedDisplay') === "true")
                  }
                  if(localStorage.getItem('tunerDisplay')!==null){
                    this.tunderDisplay =  ( localStorage.getItem('tunerDisplay') === "true")
                  } if(localStorage.getItem('pictureDisplay')!==null){
                    this.pictureDisplay = ( localStorage.getItem('pictureDisplay') === "true")
                  } 
                  if(localStorage.getItem('chordsDisplay')!==null){
                    this.chordsDisplay = ( localStorage.getItem('chordsDisplay') === "true")
                  }
                  if(localStorage.getItem('chordssuggestDisplay')!==null){
                    this.chordssuggestDisplay =  ( localStorage.getItem('chordssuggestDisplay') === "true")
                  }


                  if(localStorage.getItem('soundDisplay')!==null){
                    this.soundDisplay =  ( localStorage.getItem('soundDisplay') === "true")
                  }
                   if(localStorage.getItem('scalesDisplay')!==null){
                    this.scalesDisplay =  ( localStorage.getItem('scalesDisplay') === "true")
                  }
                  if(localStorage.getItem('videoDisplay')!==null){
                    this.videoDisplay =  ( localStorage.getItem('videoDisplay') === "true")
                  }
                  if(localStorage.getItem('gameDisplay')!==null){
                    this.gameDisplay = ( localStorage.getItem('gameDisplay') === "true")
                  }
                  if(localStorage.getItem('videoDisplayNew')!==null){
                    this.videoDisplayNew = ( localStorage.getItem('videoDisplayNew') === "true")
                  }
                  this.noteSlectedList.forEach(
                    col => {
                      if (localStorage.getItem(col.note+"Selected")!=="null") {
                        col.enabled= localStorage.getItem(col.note+"Selected") === "true"? true : false
                        console.log(col.enabled)
                      }
      
                    }
                  )
                    if(localStorage.getItem('nbCordes')!==null){
                      this.nbStrings = localStorage.getItem('nbCordes')
                      console.log("yolo")
                      this.tuningList = []
                    }

                    for(var i=0;i<this.nbStrings;i++){
                      if(localStorage.getItem(i+'tuning')!== null){
                        console.log("caca", localStorage.getItem(i+'tuning'))
                        this.tuningList.push({ cordeId : i, tuning : localStorage.getItem(i+'tuning') })
                        
                      }
                    }
                    console.log(this.tuningList)
                  console.log(localStorage.getItem("colordict"))
                  if(JSON.parse(localStorage.getItem("colordict")) !== null){
                    this.colors = JSON.parse( localStorage.getItem("colordict"))
                    console.log(this.colors)

                  }
                  if(JSON.parse(localStorage.getItem("oldnotescolor")) !== null){
                  this.colorSave = JSON.parse( localStorage.getItem("oldnotescolor"))
                  }
                  if(localStorage.getItem('diap')!==null){
                    this.diapason = localStorage.getItem('diap')
                  }


      // this.colors.forEach(
      //         col => {
      //           if (localStorage.getItem(col.note)!=="null") {
      //             console.log(localStorage.getItem(col.note))
      //             col.color= localStorage.getItem(col.note)
      //           }

              // }
            // )
            //Diapason
              // if (localStorage.getItem("diapason")!=="null") {
              //   this.diapason =localStorage.getItem("diapason")
              //   console.log("loading diap")
              // }
              // //nbstrings
              // if (localStorage.getItem("nbstrings")!==undefined) {
              //   this.nbStrings =localStorage.getItem("nbstrings")
              //   console.log("loading nbstrings")
              // }
              // if (localStorage.getItem("listeTuning")!==undefined) {
              //   this.tuningList = JSON.parse(localStorage.getItem("listeTuning"))
              //   console.log("loading tuning")
              // }
            //cordes tuning and nb cordes
            this.allNotes = this.allNotesComp()
            this.allNotesC = this.allNotesCompc()
        

       
            // console.log(this.noteSlectedList)
  console.log('App Mounted');
              console.log(myImage)
        this.$forceUpdate()
  }

,
computed : {
  
  colorsComp(){
    return this.colors
  },
  gammeSelectedComp(){
    return this.gammeSelected
  },
  noteselectedcomp()
{return this.noteSlectedList}
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
