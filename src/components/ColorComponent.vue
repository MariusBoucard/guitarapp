<template>
  <div class="color-component-container">
    <div class="header">
      <h1>🎨 Note Color Configuration</h1>
    </div>

    <!-- Color Display Section -->
    <div class="color-display-section">
      <div class="section-header">
        <h3>🌈 Current Note Colors</h3>
      </div>
      <div class="colors-grid">
        <div v-for="couleur in dictionnairecouleur" :key="couleur.note" class="color-item">
          <div class="note-label">
            {{ couleur.note }}
          </div>
          <div class="color-preview" :style="{ backgroundColor: getColor(couleur) }">
            <span class="color-value">{{ couleur.color }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Editor Section -->
    <div class="color-editor-section">
      <div class="section-header">
        <h3>✏️ Edit Note Color</h3>
      </div>
      <form @submit.prevent="onSubmit" class="color-form">
        <div class="selected-note-display">
          <div class="note-indicator">
            Selected Note: <strong>{{ this.selectedforchange }}</strong>
          </div>
        </div>
        
        <div class="form-controls">
          <div class="form-group">
            <label class="form-label">🎵 Select Note</label>
            <select class="note-select" v-model="this.selectedforchange">
              <option v-for="option in this.dictionnairecouleur" :value="option.note" :key="option.note">
                {{ option.note }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">🎨 New Color (CSS format)</label>
            <input
              type="text"
              class="color-input"
              placeholder="e.g., #ff0000, red, rgb(255,0,0)"
              autocomplete="off"
              v-model="label"
            />
          </div>

          <button type="submit" class="submit-button">
            🔄 Update Color
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    couleurdict: { required: true, type: [Object] }
  }
  ,
  data() {
    return {
      selectedforchange : 'A',
      dictionnairecouleur: this.couleurdict,
      label:""
    };
  },
  methods: {
    getColor(couleur) {
      return couleur.color
    },
    onSubmit(){
 
        var find = this.couleurdict.find((entree) => entree.note === this.selectedforchange)
        find.color = this.label
        this.label = ""
        localStorage.setItem("colordict",JSON.stringify(this.couleurdict))

    }
  }
}
</script>

<style scoped>
/* Main Container */
.color-component-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  color: #2c3e50;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 700px;
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

/* Sections */
.color-display-section,
.color-editor-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.color-display-section:hover,
.color-editor-section:hover {
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

/* Colors Grid */
.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
}

.color-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 15px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  transition: all 0.2s ease;
  text-align: center;
}

.color-item:hover {
  border-color: #667eea;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
}

.note-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 15px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.color-preview {
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.color-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

/* Color Editor Form */
.color-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.selected-note-display {
  text-align: center;
  padding: 15px;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.note-indicator {
  font-size: 1.1rem;
  font-weight: 600;
}

.form-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.note-select {
  padding: 12px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background: white;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.2);
}

.note-select:hover {
  border-color: #667eea;
  transform: translateY(-1px);
}

.color-input {
  padding: 12px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #2c3e50;
  transition: all 0.2s ease;
}

.color-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.2);
}

.color-input:hover {
  border-color: #667eea;
}

.color-input::placeholder {
  color: #95a5a6;
  font-style: italic;
}

.submit-button {
  padding: 15px 25px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  text-align: center;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
}

.submit-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .color-component-container {
    padding: 20px;
    margin: 10px;
    max-width: none;
  }
  
  .colors-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }
  
  .color-display-section,
  .color-editor-section {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .form-controls {
    gap: 15px;
  }
  
  .header h1 {
    font-size: 1.4rem;
    padding: 18px 20px;
  }
}

@media (max-width: 480px) {
  .colors-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .color-item {
    padding: 12px;
  }
  
  .color-preview {
    height: 50px;
  }
  
  .note-label {
    font-size: 1rem;
    padding: 6px 10px;
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

.color-display-section,
.color-editor-section {
  animation: fadeInUp 0.3s ease-out;
}

.color-editor-section {
  animation-delay: 0.1s;
}

@keyframes colorPulse {
  0%, 100% {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 20px rgba(102, 126, 234, 0.3);
  }
}

.color-preview:hover {
  animation: colorPulse 1s ease-in-out infinite;
}

/* Special hover effects */
.color-display-section:hover .section-header h3 {
  background: rgba(255, 152, 0, 0.1);
  border-color: rgba(255, 152, 0, 0.3);
  color: #FF9800;
}

.color-editor-section:hover .section-header h3 {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
  color: #4CAF50;
}

/* Color item specific effects */
.color-item:nth-child(even) {
  animation-delay: 0.05s;
}

.color-item:nth-child(odd) {
  animation-delay: 0.1s;
}
</style>