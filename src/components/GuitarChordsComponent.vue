<template>
    
      <guitar-chords class="chord"
      
  fingering="1 X 2 3 4 X"
  :chordName= "Fmaj7"
  width="250"
  height="250"
      />

  </template>
  
  <script>
import GuitarChords from 'guitar-chords-viewer';  
  export default {
    components: {
      GuitarChords,
    },
    props: {
      chord: {
        type: String,
        required: true,
      },
      variation: {
        type: String,
        default: '1',
      },
      frets: {
        type: String,
        default: '',
      },
      mutedStrings: {
        type: String,
        default: '',
      },
      width: {
        type: String,
        default: '250',
      },
      height: {
        type: String,
        default: '250',
      },
    },
  };
  </script>
  <style>
</style>