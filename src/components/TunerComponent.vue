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
  data(){
    return{
      note:"A"

    }},
    methods : {
      name() {
              const names = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
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
    this.note = hzs;
  }
  recorder.main();
  },
  beforeUnmount() {
   
  },

}
</script>