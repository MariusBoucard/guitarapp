<template>
<div id="tuner" style="height:100px;background-color: red;">

    
</div>

</template>

<script>
import '../../jstuner/public/assets/bundle.js'
import { JsTunerUI, Recorder } from 'jstuner-ui';

export default {

    mounted() {
        let recaptchaScript = document.createElement('script')
      recaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js')
      document.head.appendChild(recaptchaScript)
    const ui = new JsTunerUI(document.getElementById("tuner"));
  const recorder = new Recorder();
  recorder.onData = (wave, hz, note)=>{
    ui.draw(wave, hz, note);
  }
  recorder.main();
  },
  beforeUnmount() {
    this.tuner.stop()
  },

}
</script>