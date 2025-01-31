<template>
    <div class="music-keyboard">
      <div class="white-keys">
        <div
          v-for="note in whiteKeys"
          :key="note"
          class="white-key"
          @click="selectKey(note)"
          :class="{  selected: selectedKey.has(note)  }"
        >
          {{ note }}
        </div>
      </div>
      <div class="black-keys">
        <div
          v-for="note,index in blackKeys"
          :key="note"
          class="black-key"
          @click="selectKey(note)"
          :class="{ selected: selectedKey.has(note) }"
          :style="{ left: getBlackKeyPosition(index) + '%' }">
          {{ note }}
        </div>
      </div>
      <div class="selected-note">
        Selected Note: {{ selectedKey }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        whiteKeys: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'],
        blackKeys: ['C#', 'D#', 'F#', 'G#', 'A#', 'C#', 'D#', 'F#', 'G#', 'A#'],
        selectedKey: new Set()
      };
    },
    methods: {
      isSelected(note) {
        return note.replace('#', '♯');
      },
      selectKey(note) {
        if(this.selectedKey.has(note)) {
          this.selectedKey.delete(note);
        } else {
          this.selectedKey.add(note);
        }
      },
      getBlackKeyPosition(note) {
        const positions = [
          5.5,
          12.5,
          26.5,
          33.5,
          40.5,
          55,
          62,
          76.5,
          83.5,
          90.5,
          98.5
      ];
        return positions[note];
      }
    }
  };
  </script>
  
  <style>
  .music-keyboard {
    position: relative;
    width: 700px;
    height: 200px;
    margin: 0 auto;
  }
  .white-keys {
    display: flex;
  }
  .white-key {
    width: 50px;
    height: 200px;
    background-color: white;
    border: 1px solid black;
    box-sizing: border-box;
    text-align: center;
    line-height: 200px;
    cursor: pointer;
  }
  .white-key.selected {
    background-color: #007bff;
    color: white;
  }
  .black-keys {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 120px;
    display: flex;
    justify-content: space-between;
  }
  .black-key {
    width: 30px;
    height: 120px;
    background-color: black;
    position: absolute;
    cursor: pointer;
    text-align: center;
    line-height: 120px;
    color: white;
  }
  .black-key.selected {
    background-color: #007bff;
  }
  .selected-note {
    margin-top: 20px;
    font-size: 18px;
    text-align: center;
  }
  </style>