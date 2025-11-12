<template>
  <div>
    <h1>{{ name() }}</h1>

    <div id="tuner" class="tun" style="background-color: none"></div>
  </div>
</template>

<script>
  /* eslint-disable */

  import { JsTunerUI, Recorder } from 'jstuner-ui'

  export default {
    props: {
      notePlayed: { required: true, type: String },
    },
    data() {
      return {
        note: this.notePlayed,
      }
    },
    methods: {
      name() {
        const names = ['A', 'AS', 'B', 'C', 'CS', 'D', 'DS', 'E', 'F', 'FS', 'G', 'GS']
        const note12 = this.note >= 0 ? this.note % 12 : (this.note % 12) + 12
        let i = Math.floor((note12 + 0.5) % 12)
        let ret = names[i]
        if (names[i] !== undefined) {
          return names[i]
        } else {
          return '-'
        }
      },
    },
    mounted() {
      const ui = new JsTunerUI(document.getElementById('tuner'))
      const recorder = new Recorder()
      recorder.onData = (wave, hz, note) => {
        ui.draw(wave, hz, note)
        //this.note = hz;
        this.base = 55
        this.note = (Math.log(hz / this.base) / Math.log(2)) * 12
        let oct = 0
        let hz2 = hz
        while (hz2 > 16.35) {
          hz2 = hz2 / 2
          oct = oct + 1
        }
        this.oct = oct
        this.$emit('changenote', { note: this.note, octave: this.oct })
      }
      recorder.main()
    },
    beforeUnmount() {},
  }
</script>

<style>
  .tun ::p {
    color: white;
  }
</style>
