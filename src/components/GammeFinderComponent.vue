<template>
  <div class="gamme-finder-container">
    <div class="header-section">
      <div class="current-scale">
        <h3 class="current-scale-title">🎵 Current Scale</h3>
        <p class="current-scale-value">{{ this.gammeSelected || 'No scale selected' }}</p>
      </div>
      
      <div class="color-option">
        <div class="checkbox-wrapper">
          <input type="checkbox" v-model="this.colorScaleBool" id="colorScale" class="custom-checkbox">
          <label for="colorScale" class="checkbox-label">
            <span class="checkmark">✓</span>
            Color relative to position in scale
          </label>
        </div>
      </div>
    </div>

    <div class="scales-section">
      <h2 class="section-title">🎼 Available Scales</h2>
      
      <div v-if="!listeGammes.length" class="no-scales-message">
        <p>No scales available. Please select some notes first.</p>
      </div>
      
      <div v-else class="scales-grid">
        <div v-for="gammes in this.listeGammes" :key="gammes" class="scale-card">
          <div v-if="gammes !== undefined" class="scale-content">
            <button 
              class="scale-button" 
              @click="this.setGamme(gammes.root, gammes.name)"
              :class="{ active: gammeSelected === `${gammes.root} - ${gammes.name}` }"
            >
              <div class="scale-info">
                <span class="scale-root">{{ gammes.root }}</span>
                <span class="scale-name">{{ gammes.name }}</span>
              </div>
              <span class="scale-arrow">→</span>
            </button>

            <div class="notes-preview">
              <div class="notes-label">Notes:</div>
              <div class="notes-list">
                <span 
                  v-for="(note, index) in gammes.notes" 
                  :key="note" 
                  class="note-chip"
                  :style="{ '--note-index': index }"
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
.gamme-finder-container {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin: var(--spacing-lg) 0;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px var(--shadow-medium);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

.gamme-finder-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-dark);
}

.header-section {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--border-accent);
}

.current-scale {
  background: rgba(52, 152, 219, 0.1);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--secondary-blue);
  margin-bottom: var(--spacing-lg);
}

.current-scale-title {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--secondary-blue);
  font-size: 1.1rem;
  font-weight: var(--font-semibold);
}

.current-scale-value {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: var(--font-medium);
  text-transform: capitalize;
}

.color-option {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
}

.checkbox-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.custom-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-label {
  position: relative;
  padding-left: var(--spacing-xxl);
  cursor: pointer;
  color: var(--text-primary);
  font-weight: var(--font-medium);
  user-select: none;
  transition: all var(--transition-normal);
}

.checkbox-label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-accent);
  border-radius: var(--radius-sm);
  background: transparent;
  transition: all var(--transition-normal);
}

.custom-checkbox:checked + .checkbox-label::before {
  background: var(--btn-primary);
  border-color: var(--secondary-blue);
}

.checkmark {
  position: absolute;
  left: 3px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-primary);
  font-size: 0.8rem;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.custom-checkbox:checked + .checkbox-label .checkmark {
  opacity: 1;
}

.checkbox-label:hover::before {
  border-color: var(--secondary-blue);
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.3);
}

.scales-section {
  margin-top: var(--spacing-xl);
}

.section-title {
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  padding-bottom: var(--spacing-md);
}

.no-scales-message {
  text-align: center;
  padding: var(--spacing-xxl);
  color: var(--text-secondary);
  font-style: italic;
  background: rgba(52, 73, 94, 0.3);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-primary);
}

.scales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.scale-card {
  background: rgba(44, 62, 80, 0.6);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 8px var(--shadow-light);
}

.scale-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow-medium);
  border-color: var(--border-accent);
}

.scale-content {
  padding: 0;
}

.scale-button {
  width: 100%;
  background: var(--btn-primary);
  border: none;
  color: var(--text-primary);
  padding: var(--spacing-lg);
  cursor: pointer;
  font-weight: var(--font-semibold);
  font-size: 1rem;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.scale-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left var(--transition-slow);
}

.scale-button:hover::before {
  left: 100%;
}

.scale-button:hover {
  background: var(--btn-primary-hover);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.1);
}

.scale-button.active {
  background: var(--btn-success);
  box-shadow: 0 0 15px rgba(46, 204, 113, 0.4);
}

.scale-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.scale-root {
  background: rgba(255, 255, 255, 0.2);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-weight: var(--font-bold);
  font-size: 1.1rem;
  min-width: 40px;
  text-align: center;
}

.scale-name {
  font-weight: var(--font-medium);
  text-transform: capitalize;
}

.scale-arrow {
  font-size: 1.2rem;
  transition: transform var(--transition-normal);
}

.scale-button:hover .scale-arrow {
  transform: translateX(4px);
}

.notes-preview {
  padding: var(--spacing-lg);
  background: rgba(52, 73, 94, 0.3);
}

.notes-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notes-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.note-chip {
  background: var(--secondary-blue);
  color: var(--text-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
  cursor: default;
  position: relative;
  overflow: hidden;
}

.note-chip:hover {
  background: var(--secondary-blue-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.note-chip:nth-child(odd) {
  background: var(--accent-purple);
}

.note-chip:nth-child(odd):hover {
  background: #8e44ad;
}

/* Responsive Design */
@media (max-width: 768px) {
  .gamme-finder-container {
    padding: var(--spacing-lg);
  }
  
  .scales-grid {
    grid-template-columns: 1fr;
  }
  
  .checkbox-label {
    font-size: 0.9rem;
  }
  
  .scale-info {
    flex-direction: column;
    gap: var(--spacing-xs);
    text-align: left;
  }
}

/* Animation for scale cards */
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

.scale-card {
  animation: slideInUp var(--transition-slow) ease-out;
}

.scale-card:nth-child(even) {
  animation-delay: 0.1s;
}

.scale-card:nth-child(3n) {
  animation-delay: 0.2s;
}
</style>

<script>

import * as myKey from '../../mydata.json';
// import  saveAs from 'file-saver';
export default {
    props: {
        //Peut etre qu'on peut definir un array de note ici
        notesSelected: { required: true, type: [Object] },
        color: { required: true, type: [Object] },
        nbnotes: { required: true, type: [Object] },
        colorsave : { required : true, type : [Object]},
        gammeSelected : { required: true, type: String },
    },
    data() {
        return {
            colorScaleBool : false,
            gammeSelectedIntra : this.gammeSelected,
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
        // Use the prop directly instead of copying it to data
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

            // Create a copy of the notes array and modify it
            const updatedNotes = this.notesSelected.map(n => ({ ...n, enabled: false }))
            gamme.notes.forEach(note => {
                var find = updatedNotes.find(notesel => notesel.note === note)
                if (find) {
                    find.enabled = true
                }
            })
            
            // Emit the updated notes back to parent instead of modifying props directly
            this.$emit("notes-updated", updatedNotes)
            this.$emit("newscale", fonda + " " + type)

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
                this.colorSave = this.color
                //get the intervals :
                localStorage.setItem("oldnotescolor",JSON.stringify(this.colorSave))

                this.colorIntra = this.generateColors(rootnote,type)
                console.log(this.colorIntra)
                this.$emit("colorgamme",this.colorIntra)
            }
            else{
                this.colorIntra = this.colorSave
                this.$emit("colorgamme",this.colorIntra)


            }
        }
    }
  }

}


// console.log(this.noteSlectedList)















</script>