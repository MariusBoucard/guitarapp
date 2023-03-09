<template>
  <div>
    <h1>{{this.note}}</h1>

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

    }
    },

    mounted() {
  
    const ui = new JsTunerUI(document.getElementById("tuner"));
  const recorder = new Recorder();
  recorder.onData = (wave, hz, note)=>{
    ui.draw(wave, hz, note);
    this.note = note;
  }
  recorder.main();
  },
  beforeUnmount() {
   
  },

}
</script>