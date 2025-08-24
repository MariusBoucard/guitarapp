<template>
    
      <guitar-chords class="chord"
      
  fingering="1 X 2 3 4 X"
  chordName= "Fmaj7"
  width="250"
  height="250"
      />

  </template>
  
  <script>
// Try different import approaches for guitar-chords-viewer
let GuitarChords;
try {
  // Try named import
  GuitarChords = require('guitar-chords-viewer');
} catch (e) {
  console.warn('guitar-chords-viewer not available:', e);
  // Fallback component
  GuitarChords = {
    name: 'guitar-chords',
    template: '<div>Guitar chords component not available</div>'
  };
}

export default {
  components: {
    GuitarChords,
  },
    props: {
      chord: {
        type: String,
        required: false,
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