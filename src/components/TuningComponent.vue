<template>
  <div class="tuning-container">
    <div class="header">
      <h1>🎸 Instrument Tuning Settings</h1>
    </div>
    
    <div class="tuning-sections">
      <!-- String Count Section -->
      <div class="section string-count-section">
        <div class="section-header">
          <h3>🔢 Number of Strings</h3>
        </div>
        <div class="counter-control">
          <button @click="this.delCorde()" class="counter-button minus-button">−</button>
          <div class="counter-display">{{ this.nbCordes }}</div>
          <button @click="this.addCorde()" class="counter-button plus-button">+</button>
        </div>
      </div>

      <!-- Tuning List Section -->
      <div class="section tuning-list-section">
        <div class="section-header">
          <h3>🎵 String Tuning</h3>
        </div>
        <div class="strings-container">
          <div class="string-item" v-for="corde in tuningList" :key="corde.cordeId">
            <label class="string-label">String {{ corde.cordeId }}</label>
            <select 
              class="note-select" 
              :style="{ backgroundColor: colorFromNote(corde.tuning) }"
              @change="onChangeTune($event, corde.cordeId)">
              <option selected="selected">{{ corde.tuning }}</option>
              <option v-for="option in this.notesall" :value="option.note" :key="option.id">
                {{ option.note }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Fretboard Settings Section -->
      <div class="section fretboard-section">
        <div class="section-header">
          <h3>📏 Fretboard Settings</h3>
        </div>
        <div class="fretboard-controls">
          <div class="diapason-control">
            <label class="control-label">Scale Length</label>
            <div class="counter-control">
              <button @click="this.diapasonMoins()" class="counter-button minus-button">−</button>
              <div class="counter-display">{{ this.diap }}</div>
              <button @click="this.diapasonPlus()" class="counter-button plus-button">+</button>
            </div>
          </div>
          
          <div class="lefty-control">
            <label class="checkbox-container">
              <input type="checkbox" v-model="this.leftyintra">
              <span class="checkmark"></span>
              <span class="checkbox-label">🔄 Left-handed Mode</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  props: {
    lefty : {required : true, type : Boolean},
    allNotes : {required : true, type : [Object]},
    cordesNumber: { required: true, type: Number },
    diapason: { required: true, type: Number },
    tuningList: { required: true, type: [Object] },
    notesnumber: { required: true, type: [Object] },
    notesColor: { required: true, type: [Object] }
  },
  methods: {
    addCorde() {

      this.listTuning.push({ cordeId: this.nbCordes, tuning: "A2" })
      this.nbCordes++
      this.listTuning.forEach(
              col => localStorage.setItem(col.cordeId+'tuning',col.tuning)
            )
            localStorage.setItem('nbCordes',this.listTuning.length)
    },
    delCorde() {
      this.listTuning.pop()
      this.nbCordes--
      this.listTuning.forEach(
              col => localStorage.setItem(col.cordeId+'tuning',col.tuning)
            )
            localStorage.setItem('nbCordes',this.listTuning.length)
    },
    onChangeTune(event, corde) {

      var found = this.listTuning.find((cor) => cor.cordeId === corde)
      found.tuning = event.target.value
      this.listTuning.forEach(
              col => localStorage.setItem(col.cordeId+'tuning',col.tuning)
            )
            localStorage.setItem('nbCordes',this.listTuning.length)
    },
    colorFromNote(tuning) {
      // console.log(tuning)

      var find = this.couleurnoteliste.find((col) => col.note === tuning.slice(0,tuning.length-1))
      return find.color
    },
    diapasonPlus() {
      this.diap += 10
      this.$emit('diap', this.diap);
      localStorage.setItem("diapason",this.diap)


    },
    diapasonMoins() {
      this.diap -= 10
      // console.log("diapmoins")

      // console.log("Find das userc" + this.diap)
      this.$emit('diap', this.diap);
      localStorage.setItem("diapason",this.diap)

    }

  },
  computed : {
    notesall() {
      return this.allNotes
    }
  },
  watch : {
      leftyintra : {
        handler() {
          this.$emit('lefty',this.leftyintra)
        }
      },
      tuningList : {
        handler() {
          this.listTuning = this.tuningList
          this.$forceUpdate()
        }
      },
      cordesNumber : {
        handler() {
          this.nbCordes = this.cordesNumber
          this.$forceUpdate()

        }
      },
      notesColor : {
        handler(){
          this.couleurnoteliste =  this.notesColor
          this.$forceUpdate()


        }
      }

  },
  data() {
    return {
      diap: this.diapason,
      nbnotes: this.notesnumber,
      nbCordes: this.cordesNumber,
      listTuning: this.tuningList,
      couleurnoteliste: this.notesColor,
      leftyintra : this.lefty
      // notesall : this.allNotes
    };
  }

}

</script>

<style scoped>
/* Main Container */
.tuning-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  color: #2c3e50;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 800px;
  margin: 0 auto;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.6rem;
  font-weight: 700;
  padding: 20px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Sections Layout */
.tuning-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;
}

.section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 12px 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  text-align: center;
}

/* Counter Controls */
.counter-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.counter-button {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: bold;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.minus-button {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
}

.plus-button {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.counter-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.counter-display {
  font-size: 2rem;
  font-weight: 800;
  color: #2c3e50;
  background: rgba(102, 126, 234, 0.1);
  padding: 15px 25px;
  border-radius: 15px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  min-width: 80px;
  text-align: center;
}

/* String Settings */
.strings-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.string-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  transition: all 0.2s ease;
}

.string-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.string-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  text-align: center;
}

.note-select {
  width: 80px;
  height: 45px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #2c3e50;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.note-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.3);
}

.note-select:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.note-select option {
  background: white;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  padding: 8px 12px;
  border: none;
}

/* Fretboard Controls */
.fretboard-controls {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.diapason-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.control-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
  text-align: center;
}

/* Left-handed Mode */
.lefty-control {
  display: flex;
  justify-content: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 15px 20px;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(102, 126, 234, 0.2);
}

.checkbox-container:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  transform: translateY(-1px);
}

.checkbox-container input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 24px;
  height: 24px;
  background: white;
  border: 2px solid #e0e6ed;
  border-radius: 6px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-container input[type="checkbox"]:checked + .checkmark {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.checkbox-container input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.checkbox-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tuning-container {
    padding: 20px;
    margin: 10px;
    max-width: none;
  }
  
  .tuning-sections {
    gap: 20px;
  }
  
  .section {
    padding: 20px;
  }
  
  .strings-container {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
  }
  
  .fretboard-controls {
    gap: 20px;
  }
  
  .counter-button {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
  
  .counter-display {
    font-size: 1.8rem;
    padding: 12px 20px;
    min-width: 70px;
  }
  
  .header h1 {
    font-size: 1.4rem;
    padding: 18px 20px;
  }
}

@media (max-width: 480px) {
  .strings-container {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .fretboard-controls {
    align-items: center;
  }
  
  .diapason-control {
    width: 100%;
  }
  
  .checkbox-container {
    justify-content: center;
    width: 100%;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section {
  animation: fadeInUp 0.3s ease-out;
}

.section:nth-child(1) {
  animation-delay: 0.1s;
}

.section:nth-child(2) {
  animation-delay: 0.2s;
}

.section:nth-child(3) {
  animation-delay: 0.3s;
}

/* Special Effects for Note Colors */
.note-select {
  position: relative;
  overflow: hidden;
}

.note-select::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  opacity: 0.8;
  z-index: -1;
  border-radius: 6px;
}

/* Hover effects for sections */
.string-count-section:hover .section-header h3 {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
  color: #4CAF50;
}

.tuning-list-section:hover .section-header h3 {
  background: rgba(255, 152, 0, 0.1);
  border-color: rgba(255, 152, 0, 0.3);
  color: #FF9800;
}

.fretboard-section:hover .section-header h3 {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.4);
  color: #667eea;
}
</style>