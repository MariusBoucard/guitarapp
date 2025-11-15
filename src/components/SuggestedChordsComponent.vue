<template>
  <div class="chords-container">
    <!-- Stacking Thirds -->
    <div class="columnchords" :class="{ collapsed: collapsed.stackingThirds }">
      <p @click="toggleCollapse('stackingThirds')" class="chord-header">
        <span class="title-text">{{ $t('suggestion_accords.stacking_thirds') }}</span>
        <span class="toggle-icon">{{ collapsed.stackingThirds ? '▼' : '▲' }}</span>
      </p>
      <transition name="slide-fade">
        <ul v-show="!collapsed.stackingThirds">
          <li class="chordtext" v-for="chord in StackingThirdsChords" :key="chord">
            {{ chord.chord }}
          </li>
        </ul>
      </transition>
    </div>

    <!-- Diatonic Chords -->
    <div class="columnchords" :class="{ collapsed: collapsed.diatonic }">
      <p @click="toggleCollapse('diatonic')" class="chord-header">
        <span class="title-text">{{ $t('suggestion_accords.diatonic_chords') }}</span>
        <span class="toggle-icon">{{ collapsed.diatonic ? '▼' : '▲' }}</span>
      </p>
      <transition name="slide-fade">
        <ul v-show="!collapsed.diatonic">
          <li class="chordtext" v-for="chord2 in DiatonicChords" :key="chord2">
            {{ chord2.chord }}
          </li>
        </ul>
      </transition>
    </div>

    <!-- Seventh Chords -->
    <div class="columnchords" :class="{ collapsed: collapsed.seventh }">
      <p @click="toggleCollapse('seventh')" class="chord-header">
        <span class="title-text">{{ $t('suggestion_accords.seventh_chords') }}</span>
        <span class="toggle-icon">{{ collapsed.seventh ? '▼' : '▲' }}</span>
      </p>
      <transition name="slide-fade">
        <ul v-show="!collapsed.seventh">
          <li class="chordtext" v-for="chord3 in SeventhChords" :key="chord3">
            {{ chord3.chord }}
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<script>
  import { useNotesStore } from '@/stores/notesStore'

  export default {
    setup() {
      const notesStore = useNotesStore()
      return { notesStore }
    },

    data() {
      return {
        collapsed: {
          stackingThirds: false,
          diatonic: false,
          seventh: false,
        },
        relativeKey: '',
        DiatonicChords: [],
        SeventhChords: [],
        HarmonicChords: [],
        BorrowedChords: [],
        StackingThirdsChords: [],

        Diatonics: [
          {
            quality: 'Major',
            liste: [
              { id: '0', quality: 'Major' },
              { id: '1', quality: 'Minor' },
              { id: '2', quality: 'Minor' },
              { id: '3', quality: 'Major' },
              { id: '4', quality: 'Major' },
              { id: '5', quality: 'Minor' },
              { id: '6', quality: 'Diminished' },
            ],
          },
          {
            quality: 'Natural Minor',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Diminished' },
              { id: '2', quality: 'Major' },
              { id: '3', quality: 'Minor' },
              { id: '4', quality: 'Minor' },
              { id: '5', quality: 'Major' },
              { id: '6', quality: 'Major' },
            ],
          },
          {
            quality: 'Harmonic Minor',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Diminished' },
              { id: '2', quality: 'Augmented' },
              { id: '3', quality: 'Minor' },
              { id: '4', quality: 'Major' },
              { id: '5', quality: 'Major' },
              { id: '6', quality: 'Diminished' },
            ],
          },
          {
            quality: 'Melodic Minor',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Minor' },
              { id: '2', quality: 'Augmented' },
              { id: '3', quality: 'Major' },
              { id: '4', quality: 'Major' },
              { id: '5', quality: 'Diminished' },
              { id: '6', quality: 'Diminished' },
            ],
          },
          {
            quality: 'Dorian',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Minor' },
              { id: '2', quality: 'Augmented' },
              { id: '3', quality: 'Major' },
              { id: '4', quality: 'Minor' },
              { id: '5', quality: 'Diminished' },
              { id: '6', quality: 'Major' },
            ],
          },
          {
            quality: 'Phrygian',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Major' },
              { id: '2', quality: 'Major' },
              { id: '3', quality: 'Minor' },
              { id: '4', quality: 'Diminished' },
              { id: '5', quality: 'Major' },
              { id: '6', quality: 'Minor' },
            ],
          },
          {
            quality: 'Hirojoshi',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Major' },
              { id: '2', quality: 'Minor' },
              { id: '3', quality: 'Diminished' },
              { id: '4', quality: 'Major' },
            ],
          },
        ],

        Seventh: [
          {
            quality: 'Major',
            liste: [
              { id: '0', quality: 'Major7' },
              { id: '1', quality: 'Minor7' },
              { id: '2', quality: 'Minor7' },
              { id: '3', quality: 'Major7' },
              { id: '4', quality: '7' },
              { id: '5', quality: 'Minor7' },
              { id: '6', quality: ' Half-diminished 7th chord' },
            ],
          },
          {
            quality: 'Natural Minor',
            liste: [
              { id: '0', quality: 'Minor7' },
              { id: '1', quality: 'half-diminished7' },
              { id: '2', quality: 'Major7' },
              { id: '3', quality: 'Minor7' },
              { id: '4', quality: 'Minor7' },
              { id: '5', quality: 'Major7' },
              { id: '6', quality: 'Dominant7' },
            ],
          },
          {
            quality: 'Harmonic Minor',
            liste: [
              { id: '0', quality: 'Minor-maj7' },
              { id: '1', quality: 'Half-diminished7' },
              { id: '2', quality: 'augmented-major7' },
              { id: '3', quality: 'Minor7' },
              { id: '4', quality: 'Dominant7' },
              { id: '5', quality: 'Major7#5' },
              { id: '6', quality: 'Fully-Diminished7' },
            ],
          },
          {
            quality: 'Melodic Minor',
            liste: [
              { id: '0', quality: 'minor7' },
              { id: '1', quality: 'minor7' },
              { id: '2', quality: 'augmented-major7' },
              { id: '3', quality: 'dominant7' },
              { id: '4', quality: 'dominant7' },
              { id: '5', quality: 'half-diminished7' },
              { id: '6', quality: 'fully-diminished7' },
            ],
          },
          {
            quality: 'Dorian',
            liste: [
              { id: '0', quality: 'minor7' },
              { id: '1', quality: 'minor7' },
              { id: '2', quality: 'major7' },
              { id: '3', quality: 'dominant7' },
              { id: '4', quality: 'minor7' },
              { id: '5', quality: 'minor7' },
              { id: '6', quality: 'half-diminished7' },
            ],
          },
          {
            quality: 'Phrygian',
            liste: [
              { id: '0', quality: 'Minor7' },
              { id: '1', quality: 'Major7' },
              { id: '2', quality: 'Augmented7' },
              { id: '3', quality: 'Minor7' },
              { id: '4', quality: 'Diminished7' },
              { id: '5', quality: 'Major7' },
              { id: '6', quality: 'Minor7' },
            ],
          },
          {
            quality: 'Hirojoshi',
            liste: [
              { id: '0', quality: 'minor7' },
              { id: '1', quality: 'major7' },
              { id: '2', quality: 'minor7' },
              { id: '3', quality: 'dominant7' },
              { id: '4', quality: 'major7' },
            ],
          },
        ],
        StackingThirds: [
          {
            quality: 'Major',
            liste: [
              { id: '0', quality: 'Major' },
              { id: '1', quality: 'Minor' },
              { id: '2', quality: 'Minor' },
              { id: '3', quality: 'Major' },
              { id: '4', quality: 'Major' },
              { id: '5', quality: 'Minor' },
              { id: '6', quality: 'Diminished' },
            ],
          },
          {
            quality: 'Natural Minor',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Diminished' },
              { id: '2', quality: 'Major' },
              { id: '3', quality: 'Minor' },
              { id: '4', quality: 'Minor' },
              { id: '5', quality: 'Major' },
              { id: '6', quality: 'Major' },
            ],
          },
          {
            quality: 'Harmonic Minor',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Diminished' },
              { id: '2', quality: 'Augmented' },
              { id: '3', quality: 'Minor' },
              { id: '4', quality: 'Major' },
              { id: '5', quality: 'Major' },
              { id: '6', quality: 'Diminished' },
            ],
          },
          {
            quality: 'Melodic Minor',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Minor' },
              { id: '2', quality: 'Augmented' },
              { id: '3', quality: 'Major' },
              { id: '4', quality: 'Major' },
              { id: '5', quality: 'Diminished' },
              { id: '6', quality: 'Diminished' },
            ],
          },
          {
            quality: 'Dorian',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Minor' },
              { id: '2', quality: 'Major' },
              { id: '3', quality: 'Major' },
              { id: '4', quality: 'Minor' },
              { id: '5', quality: 'Diminished' },
              { id: '6', quality: 'Major' },
            ],
          },
          {
            quality: 'Phrygian',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Major' },
              { id: '2', quality: 'Major' },
              { id: '3', quality: 'Minor' },
              { id: '4', quality: 'Diminished' },
              { id: '5', quality: 'Major' },
              { id: '6', quality: 'Minor' },
            ],
          },
          {
            quality: 'Hirojoshi',
            liste: [
              { id: '0', quality: 'Minor' },
              { id: '1', quality: 'Major' },
              { id: '2', quality: 'Minor' },
              { id: '3', quality: 'Diminished' },
              { id: '4', quality: 'Major' },
            ],
          },
        ],
      }
    },
    computed: {
      // Reference store data directly (per-user)
      selectedGamme() {
        return this.notesStore.gammeSelected
      },

      selectedNotes() {
        return this.notesStore.noteSlectedList
      },

      nbnotes() {
        return this.notesStore.nbnotes
      },
    },

    methods: {
      toggleCollapse(section) {
        this.collapsed[section] = !this.collapsed[section]
      },

      setRelativeScale() {},
      updateChords() {
        this.setRelativeScale()
        //on récupere la gamme selectionnée et en extrait la rootnote
        const gamme = this.selectedGamme
        let rootnote = gamme.split(' ').at(0)
        let quality = gamme.split(' ')
        quality = quality.slice(1, quality.length)
        quality = quality.join(' ')
        console.log(quality)
        //Extraction de la qualité
        //Prend le numero de la rootnote en A
        console.log('rootnote' + rootnote)
        let rootid = this.nbnotes.find((note) => note.note === rootnote)
        let idNotes = []
        this.selectedNotes.forEach((note) => {
          if (note.enabled) {
            let noteid = this.nbnotes.find((notes) => notes.note === note.note)
            idNotes.push(noteid.id)
          }
        })
        idNotes = idNotes.sort((a, b) => a > b)
        console.log(idNotes + 'Id notes should be sorted')
        //On recupere les id de toutes les notes selectionnées
        let rootpos = idNotes.indexOf(rootid.id)
        //On prend ce qu'il y a depuis la rootnote jusqu'a la fin
        let orderNbNotes = []
        if (rootpos != 0) {
          let deb = idNotes.slice(0, rootpos)
          let fin = idNotes.slice(rootpos, idNotes.length)
          //On prend ce qu'il Y a depuis le debut justqu'a la rootnote

          //On order lke this : rootnum, 1st num ... so [5,7,9,11,1,3] par exemple
          orderNbNotes = fin.concat(deb)
        } else {
          orderNbNotes = idNotes
        }
        console.log(orderNbNotes)

        this.DiatonicChords = []
        this.HarmonicChords = []
        this.BorrowedChords = []
        this.StackingThirdsChords = []
        //Possibly have to change order of loops

        for (let i = 0; i < orderNbNotes.length; i++) {
          let chordName = this.nbnotes.find((note) => note.id === orderNbNotes.at(i))
          //essay avec une gamme
          let listeNotes = this.StackingThirds.find((thirds) => thirds.quality === quality)
          let quall = listeNotes.liste.at(i)
          this.StackingThirdsChords.push({
            quality: quality,
            chord: chordName.note + quall.quality,
          })
        }

        for (let i = 0; i < orderNbNotes.length; i++) {
          let chordName3 = this.nbnotes.find((note) => note.id === orderNbNotes.at(i))
          let listeNotes3 = this.Diatonics.find((thirds) => thirds.quality === quality)
          let quall3 = listeNotes3.liste.at(i)
          this.DiatonicChords.push({ quality: quality, chord: chordName3.note + quall3.quality })
        }
        this.SeventhChords = []

        for (let i = 0; i < orderNbNotes.length; i++) {
          let chordName4 = this.nbnotes.find((note) => note.id === orderNbNotes.at(i))
          //essay avec une gamme
          let listeNotes4 = this.Seventh.find((thirds) => thirds.quality === quality)
          let quall4 = listeNotes4.liste.at(i)
          this.SeventhChords.push({ quality: quality, chord: chordName4.note + quall4.quality })
        }
      },
    },

    watch: {
      selectedGamme: {
        handler() {
          if (this.selectedGamme !== '') {
            console.log('yolo')
            this.updateChords()
          }
        },
      },
    },
  }
</script>

<style scoped>
  .chords-container {
    margin: 20px auto;
    padding: 15px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .columnchords {
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }

  .columnchords:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .chord-header {
    font-size: 1.2rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 20px 0;
    text-align: center;
    padding: 10px 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 25px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    position: relative;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chord-header:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .chord-header:active {
    transform: scale(0.98);
  }

  .toggle-icon {
    font-size: 0.9rem;
    transition: transform 0.3s ease;
    display: inline-block;
  }

  .collapsed .toggle-icon {
    transform: rotate(0deg);
  }

  .columnchords:not(.collapsed) .toggle-icon {
    transform: rotate(180deg);
  }

  .chord-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .chord-header:hover::before {
    left: 100%;
  }

  /* Slide fade transitions for collapse/expand */
  .slide-fade-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
    max-height: 0;
    overflow: hidden;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chordtext {
    font-size: 1rem;
    font-weight: 500;
    color: #2c3e50;
    margin: 0;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    cursor: pointer;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .chordtext::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: -1;
  }

  .chordtext:hover {
    transform: translateX(5px);
    border-color: #667eea;
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .chordtext:hover::before {
    opacity: 1;
  }

  .chordtext:active {
    transform: translateX(5px) scale(0.98);
  }

  /* Musical notation styling */
  .chordtext:nth-child(1) {
    border-left: 4px solid #e74c3c;
  }
  .chordtext:nth-child(2) {
    border-left: 4px solid #f39c12;
  }
  .chordtext:nth-child(3) {
    border-left: 4px solid #f1c40f;
  }
  .chordtext:nth-child(4) {
    border-left: 4px solid #2ecc71;
  }
  .chordtext:nth-child(5) {
    border-left: 4px solid #3498db;
  }
  .chordtext:nth-child(6) {
    border-left: 4px solid #9b59b6;
  }
  .chordtext:nth-child(7) {
    border-left: 4px solid #e67e22;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .chords-container {
      width: 95%;
      min-width: unset;
      max-width: unset;
      margin: 10px auto;
      padding: 15px;
      gap: 15px;
    }

    .chord-header {
      font-size: 1.1rem;
    }

    .chordtext {
      font-size: 0.9rem;
      padding: 10px 14px;
    }
  }

  /* Animation for loading */
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .columnchords {
    animation: slideInUp 0.6s ease forwards;
  }

  .columnchords:nth-child(1) {
    animation-delay: 0.1s;
  }
  .columnchords:nth-child(2) {
    animation-delay: 0.2s;
  }
  .columnchords:nth-child(3) {
    animation-delay: 0.3s;
  }

  /* Scroll enhancement for long chord lists */
  .columnchords {
    max-height: 500px;
    overflow-y: auto;
  }

  .columnchords::-webkit-scrollbar {
    width: 6px;
  }

  .columnchords::-webkit-scrollbar-track {
    background: rgba(102, 126, 234, 0.1);
    border-radius: 3px;
  }

  .columnchords::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 3px;
  }

  .columnchords::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  }
</style>
