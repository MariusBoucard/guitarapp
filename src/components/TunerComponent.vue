<template>
  <div>
    <h1>{{name()}}</h1>

    <div id="tuner" style="background-color: red;">
        
    </div>

  </div>

</template>

<script>
/* eslint-disable */

import { JsTunerUI, Recorder } from 'jstuner-ui';

export default {
  props : {
    notePlayed : { required : true, type : String}
  },
  data(){
    return{

      note: this.notePlayed,
      

    }},
    methods : {
      name() {
              const names = ["A", "AS", "B", "C", "CS", "D", "DS", "E", "F", "FS", "G", "GS"];
              const note12 = (this.note >= 0) ? this.note % 12 : this.note % 12 + 12;
              var i = Math.floor((note12 + 0.5) % 12);
              return names[i];
            }
    },
    mounted() {
  
    const ui = new JsTunerUI(document.getElementById("tuner"));
  const recorder = new Recorder();
  recorder.onData = (wave, hz, note)=>{
    ui.draw(wave, hz, note);
    //this.note = hz;
    this.base = 55;
    this.note = Math.log(hz / this.base) / Math.log(2) * 12;
    this.$emit('changenote', this.note);
  }
  recorder.main();
  },
  beforeUnmount() {
   
  },

}
</script>