<template>
<div id="tuner" style="background-color: red;">

    
</div>

</template>

<script>
import '../../jstuner/public/assets/bundle.js'
import { JsTunerUI, Recorder } from 'jstuner-ui';

export default {

    mounted() {
  
    const ui = new JsTunerUI(document.getElementById("tuner"));
  const recorder = new Recorder();
  recorder.onData = (wave, hz, note)=>{
    ui.draw(wave, hz, note);
  }
  recorder.main();
  },
  beforeUnmount() {
   
  },

}
</script>