<template>
  <div class="color-component-container">
    <div class="header">
      <h1 class="gradient-header">🎨 {{ $t('color_component.title') }}</h1>
    </div>

    <!-- Color Display Section -->
    <div class="section-card">
      <div class="section-header">
        <h3>🌈 {{ $t('color_component.current_colors') }}</h3>
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
    <div class="section-card">
      <div class="section-header">
        <h3>✏️ {{ $t('color_component.edit_color') }}</h3>
      </div>
      <form @submit.prevent="onSubmit" class="color-form">
        <div class="selected-note-display">
          <div class="note-indicator">
            {{ $t('color_component.selected_note') }} :
            <strong>{{ this.selectedforchange }}</strong>
          </div>
        </div>

        <div class="form-controls">
          <div class="form-group">
            <label class="form-label">🎵 {{ $t('color_component.select_note') }}</label>
            <select class="note-select" v-model="this.selectedforchange">
              <option
                v-for="option in this.dictionnairecouleur"
                :value="option.note"
                :key="option.note"
              >
                {{ option.note }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">🎨 {{ $t('color_component.new_color') }}</label>
            <input
              type="text"
              class="color-input"
              :placeholder="$t('color_component.placeholder_color')"
              autocomplete="off"
              v-model="label"
            />
          </div>

          <button type="submit" class="btn btn-success">
            🔄 {{ $t('color_component.update_button') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      couleurdict: { required: true, type: [Object] },
    },
    data() {
      return {
        selectedforchange: 'A',
        dictionnairecouleur: this.couleurdict,
        label: '',
      }
    },
    methods: {
      getColor(couleur) {
        return couleur.color
      },
      onSubmit() {
        let find = this.couleurdict.find((entree) => entree.note === this.selectedforchange)
        find.color = this.label
        this.label = ''
        localStorage.setItem('colordict', JSON.stringify(this.couleurdict))
      },
    },
  }
</script>

<style scoped>
  .color-component-container {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    padding: 25px;
    box-shadow: var(--shadow-main);
    backdrop-filter: blur(10px);
    color: var(--text-dark);
    font-family: var(--font-family);
    max-width: 700px;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    margin-bottom: 30px;
  }

  .colors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 15px;
  }

  .color-item {
    background: rgba(255, 255, 255, 0.9);
    border-radius: var(--border-radius);
    padding: 15px;
    border: 2px solid var(--bg-primary-border);
    transition: var(--transition-fast);
    text-align: center;
  }

  .color-item:hover {
    border-color: var(--primary-color);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
  }

  .note-label {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 10px;
    padding: 8px 12px;
    background: var(--bg-primary-light);
    border-radius: 15px;
    border: 1px solid var(--bg-primary-border);
  }

  .color-preview {
    height: 60px;
    border-radius: var(--radius-md);
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

  .selected-note-display {
    text-align: center;
    padding: 15px;
    background: var(--warning-gradient);
    border-radius: var(--border-radius);
    color: white;
    box-shadow: var(--shadow-warning);
  }

  .color-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
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
    color: var(--text-dark);
    font-size: 1rem;
  }
</style>
