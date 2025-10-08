<template>
  <div class="card">
    <!-- Header Section -->
    <div class="card-header">
      <div class="info-panel">
        <h3 class="info-panel-title">🎵 Current Scale</h3>
        <p class="info-panel-value">{{ this.gammeSelected || 'No scale selected' }}</p>
      </div>
      
      <div class="flex-center">
        <div class="checkbox-wrapper">
          <input 
            type="checkbox" 
            v-model="this.colorScaleBool" 
            id="colorScale" 
            class="checkbox-custom"
          >
          <label for="colorScale" class="checkbox-label">
            <span class="checkbox-checkmark">✓</span>
            Color relative to position in scale
          </label>
        </div>
      </div>
    </div>

    <!-- Scales Section -->
    <div class="card-section">
      <h2 class="section-title">🎼 Available Scales</h2>
      
      <div v-if="!listeGammes.length" class="no-content-message">
        <p>No scales available. Please select some notes first.</p>
      </div>
      
      <div v-else class="card-grid">
        <div 
          v-for="gammes in this.listeGammes" 
          :key="gammes" 
          class="card-item slide-in-up"
        >
          <div v-if="gammes !== undefined" class="card-content">
            <button 
              class="btn-card arrow-hover" 
              @click="this.setGamme(gammes.root, gammes.name)"
              :class="{ active: gammeSelected === `${gammes.root} - ${gammes.name}` }"
            >
              <div class="content-info">
                <span class="content-root">{{ gammes.root }}</span>
                <span class="content-name">{{ gammes.name }}</span>
              </div>
              <span class="arrow">→</span>
            </button>

            <div class="preview-section">
              <div class="preview-label">Notes:</div>
              <div class="preview-content">
                <span 
                  v-for="(note, index) in gammes.notes" 
                  :key="note" 
                  class="chip"
                  :class="{ 'chip-alt': index % 2 === 0 }"
                >
                  {{ note }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific overrides only */
.chip {
  /* Use CSS custom properties for dynamic coloring if needed */
  --chip-index: var(--note-index, 0);
}

.chip:nth-child(odd) {
  /* Already handled by chip-alt class */
}

/* Any component-specific animations or behaviors */
.card-item {
  /* Animation delay handled by global classes */
}

/* Mobile-specific adjustments that aren't covered globally */
@media (max-width: 320px) {
  .content-info {
    /* Additional mobile tweaks if needed */
  }
}
</style>
<script>

import * as myKey from '../../mydata.json';
import { useNotesStore } from '@/stores/notesStore'
// import  saveAs from 'file-saver';
export default {
    setup() {
        const notesStore = useNotesStore()
        return { notesStore }
    },
    
    data() {
        return {
            colorScaleBool : false,
            listeNotes: [
                { id: 0, note: "A" },
                { id: 1, note: "AS" },
                { id: 2, note: "B" },
                { id: 3, note: "C" },
                { id: 4, note: "CS" },
                { id: 5, note: "D" },
                { id: 6, note: "DS" },
                { id: 7, note: "E" },
                { id: 8, note: "F" },
                { id: 9, note: "FS" },
                { id: 10, note: "G" },
                { id: 11, note: "GS" },
            ],
            colorIntra : this.color,
            notesTab: ["A", "AS", "B", "C", "CS", "D", "DS", "E", "F", "FS", "G", "GS"],
            scaleTypes: [
                { name: 'Major', noteName: '', intervals: [0, 2, 4, 5, 7, 9, 11], notes: [] },
                { name: 'Natural Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 8, 10], notes: [] },
                { name: 'Harmonic Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 8, 11], notes: [] },
                { name: 'Melodic Minor', noteName: '', intervals: [0, 2, 3, 5, 7, 9, 11], notes: [] },
                { name: 'Dorian', noteName: 'D', intervals: [0, 2, 3, 5, 7, 9, 10], notes: [] },
                { name: 'Phrygian', noteName: 'E', intervals: [0, 1, 3, 5, 7, 8, 10], notes: [] },
                { name: 'Hirojoshi', noteName: 'C', intervals: [0, 2, 3, 7, 8], notes: [] }
            ],
            colorScale : [
                { id : 0 , color : "black"},
                { id : 1 , color : "red"},
                { id : 2 , color : "green"},
                { id : 3 , color : "lightgreen"},
                { id : 4 , color : "purple"},
                { id : 5 , color : "blue"},
                { id : 6 , color : "lightblue"},
                { id : 7 , color : "orange"},
                { id : 8 , color : "lightorange"},
                { id : 9 , color : "grey"},
                { id : 10 , color : "white"},
                { id : 11, color : "yellow"},
        ],
            colorSave : this.colorsave,
            scalestot: []
        }
    },
    computed : {
        // Reference store data directly (per-user)
        notesSelected() {
            return this.notesStore.noteSlectedList
        },
        
        color() {
            return this.notesStore.colors
        },
        
        nbnotes() {
            return this.notesStore.nbnotes
        },
        
        colorsave() {
            return this.notesStore.colorSave
        },
        
        gammeSelected() {
            return this.notesStore.gammeSelected
        },
        
        // Use the computed property instead of data
        notesSelectionnees() {
            return this.notesSelected;
        },
        
        listeGammes(){
            var notes = []
            // Use the computed property instead of data
            this.notesSelectionnees.forEach(element => {
                if (element.enabled) {
                    notes.push(element.note)
                }
            });

             const scales = this.generateScales(notes);
            return scales

        }

    },
    methods: {
        generateColors(fonda,type){
            const colorsRender = []
            var scaleType = this.scaleTypes.find(scaleType => scaleType.name === type)
            var rootNote = this.nbnotes.find(note => note.note === fonda)
            //put as well the not in the interval number
            const nbinterval = [0,1,2,3,4,5,6,7,8,9,10,11]
            scaleType.intervals.forEach(numero => {
                var numnew = this.nbnotes.find(note => note.id === (rootNote.id+numero)%12)
                var colorSc = this.colorScale.find(inter => inter.id === numero)
                colorsRender.push({ note : numnew.note , color : colorSc.color })


                    const index = nbinterval.indexOf(numero);
                    if (index > -1) { // only splice array when item is found
                    nbinterval.splice(index, 1); // 2nd parameter means remove one item only
                    }

                    
            })
            console.log(nbinterval)

            nbinterval.forEach(numero => {
                var numnew = this.nbnotes.find(note => note.id === ((rootNote.id+numero)%12))
                console.log(numero)
                var colorSc2 = this.colorScale.find(inter => inter.id === numero)
                colorsRender.push({ note : numnew.note , color : colorSc2.color })
            })
            return colorsRender
        },
        setGamme(fonda, type) {
            // console.log(fonda,type)
            var gamme = this.generateGammes(type, fonda)

            // Update notes in store directly
            this.notesStore.noteSlectedList.forEach(note => {
                note.enabled = false
            })
            
            gamme.notes.forEach(note => {
                var find = this.notesStore.noteSlectedList.find(notesel => notesel.note === note)
                if (find) {
                    find.enabled = true
                }
            })
            
            // Update scale in store
            this.notesStore.setScale(fonda + " " + type)
        },
        generatePopulation(nomGamme) {
            // console.log(nomGamme)
            var genScale = this.scaleTypes.find(gamme => gamme.name === nomGamme)
            var soluce = []
            var i =0
            this.listeNotes.forEach(note => {
                var tabNotes = []
                genScale.intervals.forEach(
                    step => {
                        tabNotes.push(this.listeNotes.find(caca => caca.id === ((step + note.id) % 12)).note)
                    }
                )

                soluce.push({ id : i, name: nomGamme, root: note.note, notes: tabNotes })
                i+=1
            })
            return soluce
        }



        ,

        generateScales(notes) {
            const scalesfinal = [];
            notes.sort();
            
            this.scalestot.forEach((elem, index) => {
                if (elem && elem.notes && Array.isArray(elem.notes)) {
                    // Check if all selected notes are included in this scale
                    const allNotesIncluded = notes.every(val => elem.notes.includes(val));
                    if (allNotesIncluded) {
                        scalesfinal.push(elem);
                    }
                }
            });
            
            return scalesfinal;
        },


       
        
        listeGammesFunc() {
            var notes = []
            this.notesSelectionnees.forEach(element => {
                if (element.enabled) {
                    notes.push(element.note)
                }
            });

             const scales = this.generateScales(notes);
            return scales
        },
        generateGammes(type, rootnote) {

            var genScale = this.scaleTypes.find(gamme => gamme.name === type)
            // var soluce = {}
            var notefonda = this.listeNotes.find(n => n.note === rootnote)

            var tabNotes = []
            genScale.intervals.forEach(
                step => {
                    tabNotes.push(this.listeNotes.find(caca => caca.id === ((step + notefonda.id) % 12)).note)
                }
            )

            // console.log("gamme generated "+soluce)
            return { notes: tabNotes, name: type, root: rootnote }

        }
    }
    ,
    mounted() {
        
    },
    created() {
        // Load scales from JSON file
        this.scalestot = []
        try {
            for(var i=0;i<84;i++){
                if (myKey[i]) {
                    this.scalestot.push(myKey[i])
                }
            }
            console.log('Loaded scales from JSON:', this.scalestot.length);
        } catch (error) {
            console.error('Error loading scales from JSON:', error);
        }
        
        // Fallback: generate scales if JSON didn't work
        if (this.scalestot.length === 0) {
            console.log('Generating scales as fallback...');
            this.scaleTypes.forEach(scale => {
                const population = this.generatePopulation(scale.name);
                this.scalestot.push(...population);
            });
            console.log('Generated scales as fallback:', this.scalestot.length);
        }
    },
  watch : {
    colorScaleBool : {
        handler(){
            // console.log(this.gammeSelected)
            var rootnote = this.gammeSelected.split(" ").at(0);
            var type = this.gammeSelected.split(" ")
            type = type.slice(1,type.length);
            type = type.join(" ")
            console.log("root")
            console.log("Rootnote gamme "+rootnote+type)
            if(this.colorScaleBool && rootnote !== "" && type !== ""){
                //Parse over the name to get the rootNote
                //get the intervals :
                const newColors = this.generateColors(rootnote, type)
                console.log(newColors)
                // Update colors in store
                this.notesStore.changeColor(newColors)
            }
            else{
                // Reset to saved colors
                this.notesStore.changeColor(this.colorsave)
            }
        }
    }
  }

}


// console.log(this.noteSlectedList)















</script>