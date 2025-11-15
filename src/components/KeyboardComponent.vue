<template>
  <div class="keyboard-container">
    <div class="keyboard-header">
      <h3>{{ $t('keyboard_component.title') }}</h3>

      <div class="selected-notes-display" v-if="selectedKey.size > 0">
        <span class="label">{{ $t('keyboard_component.selected_notes') }}</span>

        <div class="note-chips">
          <span
            v-for="note in Array.from(selectedKey)"
            :key="note"
            class="note-chip"
            @click="removeNote(note)"
          >
            {{ formatNote(note) }}
            <span class="remove-icon">×</span>
          </span>
        </div>
      </div>

      <div class="no-selection" v-else>
        <span class="label">{{ $t('keyboard_component.click_to_select') }}</span>
      </div>
    </div>

    <div class="piano-keyboard">
      <div class="white-keys">
        <div
          v-for="(note, index) in whiteKeys"
          :key="`white-${note}-${index}`"
          class="white-key"
          @click="selectKey(note)"
          :class="{ selected: selectedKey.has(note) }"
          :style="{ background: getKeyColor(note) }"
        >
          <span class="note-label" :style="{ color: getTextColor(note, false) }">
            {{ formatNote(note) }}
          </span>
        </div>
      </div>

      <div class="black-keys">
        <div
          v-for="(note, index) in blackKeys"
          :key="`black-${note}-${index}`"
          class="black-key"
          @click="selectKey(note)"
          :class="{ selected: selectedKey.has(note) }"
          :style="{
            left: getBlackKeyPosition(index) + '%',
            background: getKeyColor(note, true),
          }"
        >
          <span class="note-label" :style="{ color: getTextColor(note, true) }">
            {{ formatNote(note) }}
          </span>
        </div>
      </div>
    </div>

    <div class="keyboard-footer">
      <button class="clear-btn" @click="clearSelection" v-if="selectedKey.size > 0">
        {{ $t('keyboard_component.clear_all') }}
      </button>

      <div class="note-count">
        {{ $t('keyboard_component.note_count', selectedKey.size, { count: selectedKey.size }) }}
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      selectedNotes: {
        type: Array,
        default: () => [],
      },
      colorNotes: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        whiteKeys: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'],
        blackKeys: ['C#', 'D#', 'F#', 'G#', 'A#', 'C#', 'D#', 'F#', 'G#', 'A#'],
      }
    },
    computed: {
      selectedKey() {
        // Create a reactive Set based on selectedNotes prop
        // Convert from store notation (S) to keyboard notation (#)
        const selectedSet = new Set()
        this.selectedNotes.forEach((noteObj) => {
          if (noteObj.enabled) {
            // Convert 'S' notation to '#' notation for keyboard display
            const keyboardNote = noteObj.note.replace('S', '#')
            selectedSet.add(keyboardNote)
          }
        })
        return selectedSet
      },
    },
    methods: {
      formatNote(note) {
        return note.replace('#', '♯')
      },
      selectKey(note) {
        // Toggle the note selection
        if (this.selectedKey.has(note)) {
          // If note is already selected, remove it
          this.$emit('note-removed', note)
        } else {
          // If note is not selected, add it
          this.$emit('note-selected', note)
        }
      },
      removeNote(note) {
        // Emit the note removal to parent
        this.$emit('note-removed', note)
      },
      clearSelection() {
        // Emit clear all selection to parent
        this.$emit('clear-all')
      },
      getKeyColor(note, isBlackKey = false) {
        // Return beautiful gradient colors when selected
        if (this.selectedKey.has(note)) {
          if (isBlackKey) {
            // Beautiful soft orange gradient for sharp notes
            return 'linear-gradient(to bottom, #FF8A65 0%, #FF7043 50%, #FF5722 100%)'
          } else {
            // Beautiful green gradient for natural notes
            return 'linear-gradient(to bottom, #4CAF50 0%, #43A047 50%, #388E3C 100%)'
          }
        }

        // Return beautiful default gradients for unselected keys
        if (isBlackKey) {
          return 'linear-gradient(to bottom, #2c2c2c 0%, #1a1a1a 100%)'
        } else {
          return 'linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%)'
        }
      },
      getTextColor(note, isBlackKey = false) {
        if (this.selectedKey.has(note)) {
          return 'white'
        }

        return isBlackKey ? 'white' : '#2c3e50'
      },
      getBlackKeyPosition(index) {
        // With 14 white keys, each white key takes up 100/14
        const whiteKeyWidth = 100 / 14

        const positions = [
          whiteKeyWidth * 0.5 + whiteKeyWidth * 0.5,
          whiteKeyWidth * 1.5 + whiteKeyWidth * 0.5,
          whiteKeyWidth * 3.5 + whiteKeyWidth * 0.5,
          whiteKeyWidth * 4.5 + whiteKeyWidth * 0.5,
          whiteKeyWidth * 5.5 + whiteKeyWidth * 0.5,

          // Second octave (C, D, E, F, G, A, B)
          whiteKeyWidth * 7.5 + whiteKeyWidth * 0.5,
          whiteKeyWidth * 8.5 + whiteKeyWidth * 0.5,
          whiteKeyWidth * 10.5 + whiteKeyWidth * 0.5,
          whiteKeyWidth * 11.5 + whiteKeyWidth * 0.5,
          whiteKeyWidth * 12.5 + whiteKeyWidth * 0.5,
        ]

        return positions[index]
      },
    },
  }
</script>

<style scoped>
  .keyboard-container {
    width: 900px;
    min-width: 900px;
    max-width: 900px;
    margin: 20px auto;
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .keyboard-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .keyboard-header h3 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-size: 1.8rem;
    font-weight: 600;
  }

  .selected-notes-display {
    margin-bottom: 15px;
    min-height: 40px;
  }

  .label {
    display: block;
    color: #555;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .note-chips {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 32px;
    align-items: center;
    padding: 4px 0;
  }

  .note-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  .note-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .remove-icon {
    font-size: 1.2rem;
    line-height: 1;
    opacity: 0.8;
  }

  .remove-icon:hover {
    opacity: 1;
  }

  .no-selection .label {
    color: #888;
    font-style: italic;
  }

  .piano-keyboard {
    position: relative;
    width: 100%;
    max-width: 840px;
    height: 200px;
    margin: 0 auto;
    background: #1a1a1a;
    border-radius: 8px;
    padding: 10px;
    box-shadow:
      inset 0 5px 15px rgba(0, 0, 0, 0.3),
      0 5px 20px rgba(0, 0, 0, 0.2);
  }

  .white-keys {
    display: flex;
    height: 100%;
    gap: 1px;
  }

  .white-key {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 0 0 6px 6px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }

  .white-key.selected {
    transform: translateY(2px);
    box-shadow:
      0 1px 4px rgba(0, 0, 0, 0.2),
      0 0 15px rgba(76, 175, 80, 0.4);
    border-color: #4caf50;
  }

  .white-key:hover {
    filter: brightness(0.95);
    transform: translateY(2px);
  }

  .white-key:active {
    filter: brightness(0.9);
    transform: translateY(4px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .white-key .note-label {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 15px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }

  .black-keys {
    position: absolute;
    top: 10px;
    left: 10px;
    width: calc(100% - 20px);
    height: 60%;
    pointer-events: none;
  }

  .black-key {
    width: 4.5%;
    height: 100%;
    position: absolute;
    cursor: pointer;
    border-radius: 0 0 4px 4px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    transition: all 0.2s ease;
    pointer-events: auto;
    transform: translateX(-50%);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .black-key.selected {
    transform: translateX(-50%) translateY(2px);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.6),
      0 0 15px rgba(255, 138, 101, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .black-key:hover {
    filter: brightness(1.2);
    transform: translateX(-50%) translateY(1px);
  }

  .black-key:active {
    filter: brightness(0.8);
    transform: translateX(-50%) translateY(3px);
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .black-key .note-label {
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 10px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }

  .keyboard-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    min-height: 50px;
  }

  .clear-btn {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 3px 10px rgba(255, 107, 107, 0.3);
  }

  .clear-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
  }

  .clear-btn:active {
    transform: translateY(0);
  }

  .note-count {
    color: #666;
    font-size: 0.9rem;
    font-weight: 500;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .keyboard-container {
      margin: 10px;
      padding: 15px;
    }

    .piano-keyboard {
      height: 150px;
    }

    .white-key .note-label {
      font-size: 0.8rem;
      margin-bottom: 10px;
    }

    .black-key .note-label {
      font-size: 0.7rem;
      margin-bottom: 8px;
    }

    .black-key {
      width: 4%;
    }

    .keyboard-header h3 {
      font-size: 1.5rem;
    }

    .note-chips {
      justify-content: center;
    }

    .keyboard-footer {
      flex-direction: column;
      gap: 10px;
      text-align: center;
    }
  }
</style>
