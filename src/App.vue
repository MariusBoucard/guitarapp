<template>
   <div class="row">
  <div class="column">
    <div style=" display: flex;">
      <MancheComponent :notePlayed="this.notePlayed" :diap=this.diapason :nbFrettes=this.nbfrettes :colorNotes=this.colors :notesSelected="this.noteSlectedList" :tuning="this.tuningList" />
    </div>
    <div class="row">
      <div class="columnhalf"> 
        <NotesSelectedComponent :colorNotes=this.colors :listNotes=this.noteSlectedList
    @note-checked="changeNoteSelection( $event)"></NotesSelectedComponent> 
      </div>
      <div class="columnhalf">
        <TuningComponent @diap="changeDiap( $event)" :diapason=this.diapason :notesColor=this.colors :notesnumber=this.nbnotes :tuningList=this.tuningList :cordesNumber=this.nbStrings></TuningComponent> 
        <TunerComponent @changenote="changeNote($event,note)" :notePlayed="this.notePlayed" ></TunerComponent>
      </div>
    </div>
   
  </div>
  <div class="columnd">
    <ColorComponent :couleurdict=this.colors ></ColorComponent>
    <GammeFinderComponent :notesSelected="this.noteSlectedList"></GammeFinderComponent>
  </div>
</div> 
  
  
</template>

<script>
import MancheComponent from './components/MancheComponent.vue'
import NotesSelectedComponent from './components/NotesSelectedComponent.vue';
import TuningComponent from './components/TuningComponent.vue';
import ColorComponent from './components/ColorComponent.vue';
import GammeFinderComponent from './components/GammeFinderComponent.vue';
import TunerComponent from './components/TunerComponent.vue';

export default {
  name: 'App',
  components: {
    TunerComponent,
    MancheComponent,
    NotesSelectedComponent,
    TuningComponent,
    ColorComponent,
    GammeFinderComponent
  },
  data () {
    return {
      nbfrettes : 24,
      diapason : 648,
      nbStrings: 7,
      notePlayed : "",
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
      tuningList: [
        {cordeId: 0,tuning : 'E'},
        {cordeId: 1,tuning : 'B'},
        {cordeId: 2,tuning : 'G'},
        {cordeId: 3,tuning : 'D'},
        {cordeId: 4,tuning : 'A'},
        {cordeId: 5,tuning : 'E'},
        {cordeId: 6,tuning : 'A'}
      
      ],
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
    };


  },
  methods : {
    changeNote(note){
      console.log("cacapute"+note)
      this.notePlayed = this.name(note)
      console.log("Nooote"+this.notePlayed)
    },
    changeNoteSelection(note){
      console.log('caca'+note);
      const find = this.noteSlectedList.find((notes) => notes.note == note.note )
      find.enabled = note.enabled
       console.log(find)
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
                if (localStorage.getItem(col.note)) {
                col.color= localStorage.getItem(col.note)}

              }
            )

       
            console.log(this.noteSlectedList)
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

</style>
