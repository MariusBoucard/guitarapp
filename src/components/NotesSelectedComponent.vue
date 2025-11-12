<template>
  <div class="notes-selector-container">
    <div class="header-section">
      <h3 class="title">Note Selection</h3>
      <p class="subtitle">Choose notes to display on the fretboard</p>

      <div class="selection-summary" v-if="selectedCount > 0">
        <span class="selection-count"
          >{{ selectedCount }} note{{ selectedCount !== 1 ? 's' : '' }} selected</span
        >
        <button class="clear-all-btn" @click="reinit()">
          <span class="clear-icon">🗑️</span>
          Clear All
        </button>
      </div>
      <div class="no-selection-message" v-else>
        <span class="message">No notes selected - click notes below to get started</span>
      </div>
    </div>

    <div class="notes-grid-container">
      <div class="notes-grid">
        <div
          v-for="note in this.localNoteList"
          :key="note.note"
          class="note-card"
          :class="{ selected: note.enabled, sharp: isSharpNote(note.note) }"
          :style="{ backgroundColor: backGroundColor(note.note) }"
          @click="userChecked(note)"
        >
          <div class="note-content">
            <span class="note-symbol">{{ formatNote(note.note) }}</span>
            <div class="note-indicator" :class="{ active: note.enabled }">
              <span class="checkmark" v-if="note.enabled">✓</span>
            </div>
          </div>
          <div class="note-ripple"></div>
        </div>
      </div>
    </div>

    <div class="footer-section" v-if="selectedCount > 0">
      <div class="selected-notes-preview">
        <span class="preview-label">Selected:</span>
        <div class="preview-notes">
          <span
            v-for="note in selectedNotes"
            :key="note.note"
            class="preview-note"
            :style="{ backgroundColor: getPreviewColor(note.note) }"
          >
            {{ formatNote(note.note) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      listNotes: { required: true, type: [Object] },
      colorNotes: { required: true, type: [Object] },
    },
    data() {
      return {
        localNoteList: this.listNotes,
        colornoteList: this.colorNotes,
      }
    },
    computed: {
      selectedCount() {
        return this.listNotes.filter((note) => note.enabled).length
      },
      selectedNotes() {
        return this.listNotes.filter((note) => note.enabled)
      },
    },
    methods: {
      formatNote(note) {
        return note.replace('#', '♯')
      },

      isSharpNote(note) {
        return note.includes('#')
      },

      reinit() {
        this.$emit('reinitSelected')
        console.log('clearing all notes')
        this.listNotes.forEach((note) => {
          note.enabled = false
          this.$emit('note-checked', note)
        })
        this.$emit('reinitSelected')
      },

      userChecked(note) {
        const find = this.listNotes.find((notes) => notes.note === note.note)
        find.enabled = !find.enabled
        console.log(`Note ${note.note} toggled to: ${find.enabled}`)
        this.$emit('note-checked', find)
        this.$emit('unselectgamme')
      },

      isChecked(note) {
        const find = this.listNotes.find((notes) => notes.note === note)
        return find.enabled
      },

      backGroundColor(note) {
        const find = this.listNotes.find((notes) => notes.note === note)
        if (find && find.enabled) {
          const couleur = this.colornoteList.find((color) => color.note === find.note)
          return couleur ? couleur.color : '#4CAF50'
        } else {
          return this.getDefaultColor(note)
        }
      },

      getDefaultColor(note) {
        return this.isSharpNote(note) ? '#2c2c2c' : '#f8f9fa'
      },

      getPreviewColor(note) {
        const couleur = this.colornoteList.find((color) => color.note === note)
        return couleur ? couleur.color : '#4CAF50'
      },
    },
  }
</script>

<style scoped>
  .notes-selector-container {
    width: 100%;
    max-width: 900px;
    margin: 20px auto;
    padding: 25px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .header-section {
    text-align: center;
    margin-bottom: 25px;
  }

  .title {
    margin: 0 0 8px 0;
    color: #2c3e50;
    font-size: 1.8rem;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .subtitle {
    margin: 0 0 20px 0;
    color: #666;
    font-size: 1rem;
    font-weight: 400;
  }

  .selection-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.7);
    padding: 12px 20px;
    border-radius: 12px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .selection-count {
    color: #2c3e50;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .clear-all-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    box-shadow: 0 3px 10px rgba(255, 107, 107, 0.3);
  }

  .clear-all-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
  }

  .clear-all-btn:active {
    transform: translateY(0);
  }

  .clear-icon {
    font-size: 1rem;
  }

  .no-selection-message {
    background: rgba(255, 255, 255, 0.5);
    padding: 15px 20px;
    border-radius: 12px;
    border: 2px dashed #bbb;
  }

  .message {
    color: #666;
    font-style: italic;
    font-size: 1rem;
  }

  .notes-grid-container {
    margin: 25px 0;
  }

  .notes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 12px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .note-card {
    position: relative;
    aspect-ratio: 1;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
    border: 2px solid transparent;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .note-card:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .note-card:active {
    transform: translateY(-1px) scale(1.02);
  }

  .note-card.selected {
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .note-card.selected:hover {
    transform: translateY(-4px) scale(1.08);
    box-shadow:
      0 10px 25px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  .note-card.sharp {
    position: relative;
  }

  .note-card.sharp::before {
    content: '';
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .note-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .note-symbol {
    font-size: 1.4rem;
    font-weight: 700;
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.3),
      0 1px 2px rgba(255, 255, 255, 0.3);
    mix-blend-mode: difference;
    color: #fff;
    margin-bottom: 4px;
  }

  .note-indicator {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .note-indicator.active {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 1);
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .checkmark {
    color: #2c3e50;
    font-weight: 900;
    font-size: 0.9rem;
  }

  .note-ripple {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transform: scale(0);
    transition: all 0.3s ease;
    pointer-events: none;
  }

  .note-card:active .note-ripple {
    opacity: 1;
    transform: scale(1);
  }

  .footer-section {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .selected-notes-preview {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
  }

  .preview-label {
    color: #2c3e50;
    font-weight: 600;
    font-size: 1rem;
    min-width: 70px;
  }

  .preview-notes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
  }

  .preview-note {
    padding: 6px 12px;
    border-radius: 16px;
    color: white;
    font-weight: 600;
    font-size: 0.85rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.2);
    mix-blend-mode: normal;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .notes-selector-container {
      margin: 10px;
      padding: 20px;
    }

    .notes-grid {
      grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
      gap: 10px;
      padding: 15px;
    }

    .title {
      font-size: 1.5rem;
    }

    .subtitle {
      font-size: 0.9rem;
    }

    .selection-summary {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }

    .selected-notes-preview {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .preview-label {
      min-width: auto;
    }

    .note-symbol {
      font-size: 1.2rem;
    }

    .note-indicator {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 480px) {
    .notes-grid {
      grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
      gap: 8px;
      padding: 12px;
    }

    .note-symbol {
      font-size: 1rem;
    }

    .note-indicator {
      width: 16px;
      height: 16px;
    }
  }
</style>
