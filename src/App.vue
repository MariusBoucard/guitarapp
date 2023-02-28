<template>
   <div class="row">
  <div class="column">
    <MancheComponent :diap=this.diapason :nbFrettes=this.nbfrettes :colorNotes=this.colors :notesSelected="this.noteSlectedList" :tuning="this.tuningList" />
    <NotesSelectedComponent :listNotes=this.noteSlectedList
    @note-checked="changeNoteSelection( $event)"></NotesSelectedComponent> 
    <TuningComponent :tuningList=this.tuningList :cordesNumber=this.nbStrings></TuningComponent> 
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
      nbStrings: 6,
      tuningList: [
        {cordeId: 0,tuning : 'E'},
        {cordeId: 1,tuning : 'A'},
        {cordeId: 2,tuning : 'D'},
        {cordeId: 3,tuning : 'G'},
        {cordeId: 4,tuning : 'B'},
        {cordeId: 5,tuning : 'E'}
      
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
