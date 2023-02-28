<template>
   <div class="row">
  <div class="column">
    <div style="background-color: red; display: flex;">
      <MancheComponent :diap=this.diapason :nbFrettes=this.nbfrettes :colorNotes=this.colors :notesSelected="this.noteSlectedList" :tuning="this.tuningList" />
    </div>
    <div class="row">
      <div class="columnhalf"> 
        <NotesSelectedComponent :colorNotes=this.colors :listNotes=this.noteSlectedList
    @note-checked="changeNoteSelection( $event)"></NotesSelectedComponent> 
      </div>
      <div class="columnhalf">
        <TuningComponent :notesColor=this.colors :notesnumber=this.nbnotes :tuningList=this.tuningList :cordesNumber=this.nbStrings></TuningComponent> 

      </div>
    </div>
   
  </div>
  <div class="columnd">
    <ColorComponent :couleurdict=this.colors ></ColorComponent>
  </div>
</div> 
  
  
</template>

<script>
import MancheComponent from './components/MancheComponent.vue'
import NotesSelectedComponent from './components/NotesSelectedComponent.vue';
import TuningComponent from './components/TuningComponent.vue';
import ColorComponent from './components/ColorComponent.vue';

export default {
  name: 'App',
  components: {
    MancheComponent,
    NotesSelectedComponent,
    TuningComponent,
    ColorComponent
  },
  data () {
    return {
      nbfrettes : 24,
      diapason : 648,
      nbStrings: 7,
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

    changeNoteSelection(note){
      console.log('caca'+note);
      const find = this.noteSlectedList.find((notes) => notes.note == note.note )
      find.enabled = note.enabled
       console.log(find)
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
}

</style>
