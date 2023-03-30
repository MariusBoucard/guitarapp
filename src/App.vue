<template>
  <body style="margin : 0">

    <ul class="ulnavbar">
      <li class="linavbar"><a href="#home" @click="this.mancheDisplay = ! this.mancheDisplay">Manche</a></li>
      <li class="linavbar"><a href="#news" @click="this.notesSelectedDisplay = ! this.notesSelectedDisplay" >Selection notes</a></li>
      <li class="linavbar" ><a  style="{ backgroundColor: red;}" @click="$event => {this.autoGammeSelect = !this.autoGammeSelect}" > Auto gamme select</a></li>

      <li class="linavbar"><a  @click="this.scalesDisplay = ! this.scalesDisplay">Scales</a></li>
      <li class="linavbar" style="float:right"><a class="active" @click="this.settingsView = ! this.settingsView">Settings</a></li>
      <li class="linavbar" style="float:right"><a class="active"  @click="this.tunderDisplay = ! this.tunderDisplay">Tuner</a></li>
      <li class="linavbar" style="float:right"><a class="active" @click="this.pictureDisplay = ! this.pictureDisplay">Display Picture</a></li>
      <li class="linavbar" style="float:right"><a class="active" @click="this.soundDisplay = ! this.soundDisplay">Play sound</a></li>
      <li class="linavbar" style="float:right"><a class="active" href="#about">Play video</a></li>



    </ul> 
    <div class="row">
      <div class="column">
        <div style=" display: flex;">
          <MancheComponent v-show="this.mancheDisplay" :allnotesc="this.allNotesC" :allnotes="this.allNotes" :notePlayed="this.notePlayed" :diap=this.diapason :nbFrettes=this.nbfrettes :colorNotes=this.colors :notesSelected="this.noteSlectedList" :tuning="this.tuningList" />
        </div>
    <div class="row">
      <div class="columnhalf"> 
        <NotesSelectedComponent :colorNotes=this.colors :listNotes=this.noteSlectedList
        @note-checked="changeNoteSelection( $event)"></NotesSelectedComponent> 
      </div>
      <div class="columnhalf">
        <TuningComponent :allNotes="this.allNotes" v-show="this.settingsView" @diap="changeDiap( $event)" :diapason=this.diapason :notesColor=this.colors :notesnumber=this.nbnotes :notesval="this.allNotes" :tuningList=this.tuningList :cordesNumber=this.nbStrings></TuningComponent> 
        <TunerComponent v-show="this.tunderDisplay" @changenote="changeNote($event,note)" :notePlayed="this.notePlayed" ></TunerComponent>
        <PlaySoundComponent v-show="this.soundDisplay" ></PlaySoundComponent>
        <LoadPictureComponent v-show="this.pictureDisplay"></LoadPictureComponent>
      </div>
    </div>
    
  </div>
  <div class="columnd">
   
    <ColorComponent v-show="this.settingsView" :couleurdict=this.colors ></ColorComponent>
    <GammeFinderComponent v-show="this.scalesDisplay" :notesSelected="this.noteSlectedList"></GammeFinderComponent>
  </div>
  
  
</div> 



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
    LoadPictureComponent
},
  data () {
    return {
      mancheDisplay : false,
      notesSelectedDisplay : true,
      tunderDisplay : false,
      pictureDisplay : false,
      soundDisplay : true,
      scalesDisplay : true,
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
        {note : "A",color:"blue"},
        {note : "AS",color:"DarkTurquoise"},
        {note : "B",color:"Purple"},
        {note : "C",color:"Red"},
        {note : "CS",color:"DarkRed"},
        {note : "D",color:"Orange"},
        {note : "DS",color:"SandyBrown"},
        {note : "E",color:"Yellow"},
        {note : "F",color:"Green"},
        {note : "FS",color:"LightGreen"},
        {note : "G",color:"Purple"},
        {note : "GS",color:"Pink"},
      
      ],

    }


  },
  methods : {
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
       console.log(dick)
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
      //  console.log(find)
    },
    changeDiap(diap){
      console.log("diap "+diap)
      this.diapason = diap
    },
    name(note) {
              const names = ["A", "AS", "B", "C", "CS", "D", "DS", "E", "F", "FS", "G", "GS"];
              const note12 = (note >= 0) ? note % 12 : note % 12 + 12;
              var i = Math.floor((note12 + 0.5) % 12);
              return names[i];
            }
  },
  watch: {
    colors: {
        handler() {
            this.colors.forEach(
              col => localStorage.setItem(col.note,col.color)
            )
            console.log('Colors array changed!');
        },
        deep: true,
    },
  
   
  
  
  },
  created(){

  },
    mounted(){
      this.colors.forEach(
              col => {
                if (localStorage.getItem(col.note)!=="null") {
                  col.color= localStorage.getItem(col.note)
                }

              }
            )
            this.allNotes = this.allNotesComp()
            this.allNotesC = this.allNotesCompc()

       
            // console.log(this.noteSlectedList)
  console.log('App Mounted');


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

</style>
