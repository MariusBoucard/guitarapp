# CSS Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate two competing CSS files into one `src/assets/main.css`, extract duplicated component styles into shared classes, and update all Vue component templates to match.

**Architecture:** A single `main.css` replaces both `colors.css` and `global.css`, providing CSS custom properties (harmonized from both files) plus shared component classes. Each Vue component's scoped `<style>` retains only truly unique CSS. Components that imported `global.css` directly switch to the global `main.css` import.

**Tech Stack:** Plain CSS (no preprocessor), Vue 3 SFCs with scoped styles, Prettier (no semicolons, single quotes, 2-space indent, 100 char width), ESLint

## Global Constraints

- No semicolons in CSS
- Single quotes in CSS (where quotes are needed, like `font-family`)
- 2-space indentation
- 100 character print width for CSS selectors/rules (use Prettier wrapping)
- `vueIndentScriptAndStyle: true` in components (`<script>` and `<style>` inside SFCs are indented)
- Template class names must stay perfectly synchronized with CSS class names (isomorphic)
- Run `npm run lint && npm run format` before final verification

---

### Task 1: Create `src/assets/main.css`

**Files:**

- Create: `src/assets/main.css`
- Read: `src/assets/css/global.css`
- Read: `src/assets/styles/colors.css`

**Interfaces:**

- Consumes: All CSS rules from both existing files
- Produces: `src/assets/main.css` — the single shared stylesheet

- [ ] **Step 1: Create main.css**

Read both existing CSS files fully. Create `src/assets/main.css` as the merged, deduplicated, and reorganized single file. Use the dark theme values from `colors.css` as the base, add the extra values from `global.css` that don't conflict. Remove duplicate classes (`.card`, `.btn`, `.btn-primary`, `.btn-success`, `.btn-danger`, `.btn-warning` from `global.css` — they're the active ones). Keep ONLY the `global.css` versions of these classes since they're more complete.

Here's the complete file:

```css
/* ===== CSS CUSTOM PROPERTIES ===== */
:root {
  /* Primary Colors */
  --primary-dark: #2c3e50;
  --primary-medium: #34495e;
  --primary-light: #3a4f63;
  --primary-accent: #4a5f7a;
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;

  /* Secondary Colors */
  --secondary-blue: #3498db;
  --secondary-blue-dark: #2980b9;
  --secondary-blue-darker: #1f4e79;

  /* Accent Colors */
  --accent-red: #e74c3c;
  --accent-green: #2ecc71;
  --accent-orange: #f39c12;
  --accent-purple: #9b59b6;

  /* Gradients */
  --success-gradient: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  --warning-gradient: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  --danger-gradient: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  --danger-alt-gradient: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);

  /* Text Colors */
  --text-primary: #ecf0f1;
  --text-secondary: #bdc3c7;
  --text-muted: #95a5a6;
  --text-dark: #2c3e50;
  --text-light: white;

  /* Background Colors */
  --bg-primary: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  --bg-secondary: linear-gradient(135deg, #3498db, #2980b9);
  --bg-tertiary: linear-gradient(135deg, #2980b9, #1f4e79);
  --bg-main-gradient: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  --bg-white-translucent: rgba(255, 255, 255, 0.9);
  --bg-white-semi: rgba(255, 255, 255, 0.7);
  --bg-white-light: rgba(255, 255, 255, 0.3);
  --bg-primary-light: rgba(102, 126, 234, 0.1);
  --bg-primary-border: rgba(102, 126, 234, 0.2);
  --bg-primary-border-light: rgba(102, 126, 234, 0.3);
  --bg-card: rgba(52, 73, 94, 0.9);
  --bg-dark-translucent: rgba(44, 62, 80, 0.6);
  --bg-darker-translucent: rgba(52, 73, 94, 0.3);
  --bg-info-light: rgba(52, 152, 219, 0.1);
  --bg-muted: rgba(52, 73, 94, 0.3);
  --bg-hover: #3a4f63;

  /* Border Colors */
  --border-light: #e0e6ed;
  --border-secondary: rgba(149, 165, 166, 0.3);
  --border-primary: #34495e;
  --border-accent: #3498db;
  --border-active: #e74c3c;
  --card-border: rgba(127, 140, 141, 0.3);

  /* Shadows */
  --shadow-main: 0 10px 30px rgba(0, 0, 0, 0.15);
  --shadow-card: 0 4px 15px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.15);
  --shadow-light: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 8px 32px rgba(0, 0, 0, 0.15);
  --shadow-dark: 0 12px 40px rgba(0, 0, 0, 0.2);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-primary: 0 4px 15px rgba(102, 126, 234, 0.3);
  --shadow-primary-hover: 0 6px 20px rgba(102, 126, 234, 0.4);
  --shadow-success: 0 4px 15px rgba(76, 175, 80, 0.3);
  --shadow-success-hover: 0 6px 20px rgba(76, 175, 80, 0.4);
  --shadow-warning: 0 4px 15px rgba(255, 152, 0, 0.3);
  --shadow-warning-hover: 0 6px 20px rgba(255, 152, 0, 0.4);
  --shadow-danger: 0 4px 15px rgba(244, 67, 54, 0.3);
  --shadow-danger-hover: 0 6px 20px rgba(244, 67, 54, 0.4);
  --shadow-danger-alt: 0 4px 15px rgba(255, 107, 107, 0.3);
  --shadow-danger-alt-hover: 0 6px 20px rgba(255, 107, 107, 0.4);

  /* Typography */
  --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Spacing Scale */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-xxl: 24px;
  --spacing-xxxl: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --border-radius: 12px;
  --border-radius-large: 16px;
  --border-radius-pill: 25px;
  --border-radius-circle: 50%;

  /* Transitions */
  --transition-fast: all 0.2s ease;
  --transition-medium: all 0.3s ease;
  --transition-normal: all 0.3s ease;
  --transition-slow: all 0.5s ease;
}

/* ===== BASE ===== */
* {
  box-sizing: border-box;
}

/* ===== LAYOUT ===== */
.two-columns {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 25px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.column-left {
  background: var(--bg-white-translucent);
  border-radius: var(--border-radius-large);
  padding: 25px;
  box-shadow: var(--shadow-main);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.column-right {
  background: var(--bg-white-translucent);
  border-radius: var(--border-radius-large);
  padding: 25px;
  box-shadow: var(--shadow-main);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-x: hidden;
}

/* ===== VIDEO CONTAINER ===== */
.video-container {
  width: 100%;
  background: var(--bg-main-gradient);
  font-family: var(--font-family);
  color: var(--text-dark);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* ===== CARDS ===== */
.card {
  background: var(--bg-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin: var(--spacing-lg) 0;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-medium);
  color: var(--text-primary);
  transition: var(--transition-normal);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-dark);
}

.card-header {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--border-accent);
}

.card-section {
  margin-top: var(--spacing-xl);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: var(--spacing-lg);
}

.card-item {
  background: var(--bg-dark-translucent);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-light);
  min-width: 0;
  width: 100%;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
  border-color: var(--border-accent);
}

.card-content {
  padding: 0;
}

/* ===== SECTION CARD ===== */
.section-card {
  background: var(--bg-white-semi);
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-card);
}

.section-title {
  margin: 0 0 20px 0;
  color: var(--text-light);
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  padding: 15px 20px;
  background: var(--primary-gradient);
  border-radius: var(--border-radius-pill);
  box-shadow: var(--shadow-primary);
}

/* ===== GRADIENT HEADER ===== */
.gradient-header {
  margin: 0;
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  padding: 15px 20px;
  background: var(--primary-gradient);
  border-radius: var(--border-radius-pill);
  box-shadow: var(--shadow-primary);
}

.gradient-header:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  box-shadow: var(--shadow-primary-hover);
}

/* ===== INFO PANEL ===== */
.info-panel {
  background: var(--bg-info-light);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--secondary-blue);
  margin-bottom: var(--spacing-lg);
}

.info-panel-title {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--secondary-blue);
  font-size: 1.1rem;
  font-weight: var(--font-semibold);
}

.info-panel-value {
  margin: 0;
  color: var(--text-dark);
  font-size: 1.2rem;
  font-weight: var(--font-medium);
  text-transform: capitalize;
}

/* ===== BUTTONS ===== */
.btn {
  padding: 12px 20px;
  border: none;
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: var(--transition-fast);
  text-align: center;
  text-decoration: none;
  display: inline-block;
  min-width: 80px;
}

.btn-primary {
  background: var(--primary-gradient);
  color: var(--text-light);
  box-shadow: var(--shadow-primary);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary-hover);
}

.btn-success {
  background: var(--success-gradient);
  color: var(--text-light);
  box-shadow: var(--shadow-success);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-success-hover);
}

.btn-warning {
  background: var(--warning-gradient);
  color: var(--text-light);
  box-shadow: var(--shadow-warning);
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-warning-hover);
}

.btn-danger {
  background: var(--danger-gradient);
  color: var(--text-light);
  box-shadow: var(--shadow-danger);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-danger-hover);
}

.btn-danger-alt {
  background: var(--danger-alt-gradient);
  color: var(--text-light);
  box-shadow: var(--shadow-danger-alt);
}

.btn-danger-alt:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-danger-alt-hover);
}

.btn-small {
  padding: 8px 16px;
  font-size: 0.85rem;
  min-width: auto;
}

.btn-icon-round {
  border-radius: var(--border-radius-circle);
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  min-width: auto;
}

.btn-icon-round:hover {
  transform: scale(1.1);
}

.btn-icon-round::before {
  content: '\2715';
}

.btn-card {
  width: 100%;
  background: var(--btn-primary);
  border: none;
  color: var(--text-primary);
  padding: var(--spacing-lg);
  cursor: pointer;
  font-weight: var(--font-semibold);
  font-size: 1rem;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.btn-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left var(--transition-slow);
}

.btn-card:hover::before {
  left: 100%;
}

.btn-card:hover {
  background: var(--btn-primary-hover);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.1);
}

.btn-card.active {
  background: var(--btn-success);
  box-shadow: 0 0 15px rgba(46, 204, 113, 0.4);
}

.btn-group {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.btn-group-vertical {
  flex-direction: column;
}

.btn-group-center {
  justify-content: center;
}

/* ===== CHECKBOXES ===== */
.checkbox-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--bg-white-semi);
  border-radius: var(--border-radius);
  padding: 15px 20px;
  box-shadow: var(--shadow-card);
  margin: 15px 0;
}

.checkbox-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.checkbox-custom {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-label {
  position: relative;
  padding-left: var(--spacing-xxl);
  cursor: pointer;
  color: var(--text-dark);
  font-weight: var(--font-medium);
  user-select: none;
  margin: 10px;
  transition: var(--transition-normal);
}

.checkbox-custom:checked + .checkbox-label::before {
  background: var(--btn-primary);
  border-color: var(--secondary-blue);
}

.checkbox-checkmark {
  position: absolute;
  left: 3px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-primary);
  font-size: 0.8rem;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.checkbox-custom:checked + .checkbox-label .checkbox-checkmark {
  opacity: 1;
}

.checkbox-label:hover::before {
  border-color: var(--secondary-blue);
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.3);
}

/* ===== FORM INPUTS ===== */
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-pill);
  font-size: 0.9rem;
  background: white;
  transition: var(--transition-fast);
  color: var(--text-dark);
  margin-bottom: 15px;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 15px var(--bg-primary-border-light);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

/* ===== SLIDERS ===== */
.slider-section {
  background: var(--bg-white-semi);
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-card);
  margin: 20px 0;
}

.slider-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 15px 0;
}

.slider-container-vertical {
  flex-direction: column;
  gap: 10px;
}

.slider-label {
  min-width: 120px;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.slider-value {
  min-width: 80px;
  margin: 0;
  font-family: monospace;
  font-weight: 600;
  color: var(--text-dark) !important;
  text-align: center;
  background: var(--bg-primary-light);
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
}

.range-input {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #ecf0f1;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: var(--border-radius-circle);
  background: var(--primary-gradient);
  cursor: pointer;
  box-shadow: var(--shadow-primary);
  transition: var(--transition-fast);
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-primary-hover);
}

.range-input-thick {
  height: 8px;
  border-radius: 4px;
}

.range-input-thick::-webkit-slider-thumb {
  width: 24px;
  height: 24px;
  background: var(--warning-gradient);
  box-shadow: var(--shadow-warning);
}

.range-input-thick::-webkit-slider-thumb:hover {
  box-shadow: var(--shadow-warning-hover);
}

/* ===== LISTS ===== */
.list-unstyled {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-horizontal {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.list-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: center;
  font-weight: 500;
  background: var(--bg-white-translucent);
  color: var(--text-dark);
  border: 2px solid var(--border-light);
}

.list-item:hover {
  background: var(--bg-main-gradient);
  border-color: var(--primary-color);
  color: var(--text-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-card);
}

.list-item-selected {
  background: var(--primary-gradient);
  color: var(--text-light);
  box-shadow: var(--shadow-primary);
  transform: translateY(-2px);
  border-color: transparent;
}

.list-item p {
  margin: 0;
  font-size: 0.9rem;
}

.list-scrollable {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.list-item-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  border-radius: 8px;
  background: var(--bg-white-translucent);
  border: 2px solid transparent;
  transition: var(--transition-fast);
  font-weight: 500;
  color: var(--text-dark);
}

.list-item-with-action:hover {
  background: var(--bg-primary-light);
  border-color: var(--primary-color);
  transform: translateX(5px);
  box-shadow: var(--shadow-card);
}

/* ===== CHIPS ===== */
.chip {
  background: var(--secondary-blue);
  color: var(--text-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: var(--font-medium);
  transition: var(--transition-normal);
  cursor: default;
  position: relative;
  overflow: hidden;
}

.chip:hover {
  background: var(--secondary-blue-dark);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.chip-alt {
  background: var(--accent-purple);
}

.chip-alt:hover {
  background: #8e44ad;
}

/* ===== NO CONTENT ===== */
.no-content-message {
  text-align: center;
  padding: var(--spacing-xxxl);
  color: var(--text-secondary);
  font-style: italic;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-primary);
}

/* ===== PREVIEW SECTION ===== */
.preview-section {
  padding: var(--spacing-lg);
  background: var(--bg-darker-translucent);
}

.preview-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-content {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

/* ===== VIDEO PLAYER ===== */
.video-player {
  width: 100%;
  height: 400px;
  background: #000;
  border-radius: var(--border-radius);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.video-player-full-height {
  height: 60%;
}

.video-player:fullscreen,
.video-player:-webkit-full-screen,
.video-player:-moz-full-screen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

/* ===== TRAINING TREE ===== */
.training-tree {
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 8px;
}

.training-category {
  margin-bottom: 15px;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: var(--bg-white-translucent);
  box-shadow: var(--shadow-card);
  transition: var(--transition-fast);
  border: 2px solid var(--bg-primary-border);
}

.training-category:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.training-category-header {
  background: var(--primary-gradient);
  color: var(--text-light);
  padding: 15px 20px;
  margin: 0;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px 10px 0 0;
  box-shadow: var(--shadow-primary);
}

.training-category-header:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.training-category-header-expanded {
  background: var(--success-gradient);
  border-radius: 10px 10px 0 0;
}

.training-category-header::after {
  content: '\25BC';
  transition: transform 0.2s ease;
  font-size: 0.8rem;
}

.training-category-header-expanded::after {
  transform: rotate(180deg);
}

.training-items {
  background: rgba(52, 73, 94, 0.05);
  padding: 0;
}

.training-item {
  border-top: 1px solid var(--bg-primary-border);
}

.training-item-header {
  background: var(--bg-white-translucent);
  color: var(--text-dark);
  padding: 12px 20px;
  margin: 0;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid transparent;
}

.training-item-header:hover {
  background: var(--bg-primary-light);
  border-color: var(--primary-color);
}

.training-item-header-expanded {
  background: var(--warning-gradient);
  color: var(--text-light);
}

.training-item-header::after {
  content: '\25B6';
  transition: transform 0.2s ease;
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.training-item-header-expanded::after {
  transform: rotate(90deg);
  color: var(--text-light);
}

.video-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: var(--bg-white-light);
}

.video-item {
  padding: 12px 25px;
  border-bottom: 1px solid var(--bg-primary-light);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.video-item:hover {
  background: var(--bg-primary-light);
  color: var(--primary-color);
  padding-left: 35px;
  box-shadow: inset 4px 0 0 #4caf50;
}

.video-item:last-child {
  border-bottom: none;
}

/* ===== CUSTOM SCROLLBAR ===== */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--bg-primary-light);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--primary-gradient);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

/* ===== HOVER LIFT ===== */
.hover-lift {
  transition: var(--transition-fast);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* ===== UTILITIES ===== */
.text-center {
  text-align: center;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-items-center {
  display: flex;
  align-items: center;
}

.flex-gap-sm {
  gap: var(--spacing-sm);
}

.flex-gap-md {
  gap: var(--spacing-md);
}

.flex-gap-lg {
  gap: var(--spacing-lg);
}

.gap-small {
  gap: 10px;
}

.gap-medium {
  gap: 15px;
}

.gap-large {
  gap: 25px;
}

.mb-small {
  margin-bottom: 10px;
}

.mb-medium {
  margin-bottom: 15px;
}

.mb-large {
  margin-bottom: 25px;
}

.hidden {
  display: none;
}

.arrow {
  font-size: 1.2rem;
  transition: transform var(--transition-normal);
}

.arrow-hover:hover .arrow {
  transform: translateX(4px);
}

.content-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.content-root {
  background: rgba(255, 255, 255, 0.2);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-weight: var(--font-bold);
  font-size: 1.1rem;
  min-width: 20px;
  text-align: center;
}

.content-name {
  font-weight: var(--font-medium);
  text-transform: capitalize;
}

/* ===== ANIMATIONS ===== */
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

.fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

.slide-in-up {
  animation: slideInUp var(--transition-slow) ease-out;
}

.slide-in-up:nth-child(even) {
  animation-delay: 0.1s;
}

.slide-in-up:nth-child(3n) {
  animation-delay: 0.2s;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .two-columns {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .column-left {
    max-height: 400px;
  }

  .slider-grid {
    grid-template-columns: 1fr;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .video-container {
    padding: 10px;
  }

  .column-left,
  .column-right {
    padding: 15px;
  }

  .slider-container {
    flex-direction: column;
    gap: 10px;
  }

  .slider-label {
    min-width: auto;
    text-align: center;
  }

  .btn-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .card {
    padding: var(--spacing-lg);
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .checkbox-label {
    font-size: 0.9rem;
  }

  .content-info {
    flex-direction: column;
    gap: var(--spacing-xs);
    text-align: left;
  }
}

@media (max-width: 500px) {
  .card-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .btn-card {
    padding: var(--spacing-md);
    font-size: 0.9rem;
  }

  .content-info {
    flex-direction: row;
    gap: var(--spacing-sm);
  }

  .content-root {
    font-size: 0.9rem;
    padding: var(--spacing-xs);
  }

  .content-name {
    font-size: 0.9rem;
  }

  .preview-section {
    padding: var(--spacing-md);
  }
}

@media (max-width: 320px) {
  .card {
    padding: var(--spacing-md);
  }

  .card-grid {
    gap: var(--spacing-sm);
  }

  .btn-card {
    padding: var(--spacing-sm);
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .content-info {
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: center;
  }

  .arrow {
    display: none;
  }
}
```

- [ ] **Step 2: Run format on main.css**

```bash
npx prettier --write src/assets/main.css
```

Expected: Prettier formats the file in place with no semicolons, single quotes, 2-space indent.

- [ ] **Step 3: Verify lint passes**

```bash
npm run lint
```

Expected: No errors (the linter may not check CSS files, but verify).

---

### Task 2: Wire main.css into the app globally

**Files:**

- Modify: `src/main.js`
- Modify: `src/components/TrainingComponent.vue`
- Modify: `src/components/VideoComponent.vue`
- Modify: `src/components/VideoComponentNewRefactored.vue`

**Interfaces:**

- Consumes: `src/assets/main.css` from Task 1
- Produces: Global CSS import via `src/main.js`; clean component imports

- [ ] **Step 1: Update main.js** — replace `colors.css` import with `main.css`

Change `src/main.js` line 4:

```js
import './assets/styles/colors.css'
```

to:

```js
import './assets/main.css'
```

- [ ] **Step 2: Remove global.css imports from components**

In `TrainingComponent.vue` (likely near top of `<script>` section), find and remove any line that imports global.css:

```js
// Remove this line:
import '../assets/css/global.css'
```

Same for `VideoComponent.vue` and `VideoComponentNewRefactored.vue`.

No template or style changes needed for these three components — they already use the class names from global.css which are now in main.css.

- [ ] **Step 3: Run lint and format**

```bash
npm run format
npm run lint
```

Expected: No errors.

---

### Task 3: Update GammeFinderComponent (already uses global classes)

**Files:**

- Modify: `src/components/GammeFinderComponent.vue`

**Interfaces:**

- Consumes: `src/assets/main.css` (now has `gradient-header` class)

- [ ] **Step 1: Check template and scoped style**

Read `GammeFinderComponent.vue` fully. This component already uses global.css classes (`card`, `card-header`, `info-panel`, `section-title`, `card-grid`, `card-item`, `chip`, etc.). Its scoped styles are essentially empty (just `chip` and `card-item` with empty blocks).

Replace the hardcoded gradient in the template with the `gradient-header` class if applicable. Update the section-title usage if it's used as a section header spanning content.

No changes needed — this component is already clean.

---

### Task 4: Update ColorComponent

**Files:**

- Modify: `src/components/ColorComponent.vue`

**Interfaces:**

- Consumes: `src/assets/main.css` (gradient-header, section-card, hover-lift, btn classes)

- [ ] **Step 1: Read full ColorComponent.vue**

Read the template and scoped style sections.

- [ ] **Step 2: Replace duplicated CSS patterns**

In the `<template>`:

- Replace `<div class="color-display-section">` with `<div class="section-card">` (same visual)
- Replace `<div class="color-editor-section">` with `<div class="section-card">`
- Replace the `<h1>` gradient styling with `class="gradient-header"`
- Replace `.submit-button` with `class="btn btn-success"`
- Replace `.note-select` with `class="form-input"` (after checking they match)

In the `<style scoped>`:

- Remove all CSS rules that are now covered by global classes
- Keep only truly unique styles (`.color-component-container`, `.colors-grid`, `.color-item`, `.color-preview`, `.color-value`, `.selected-note-display`, `.color-form`, `.form-controls`, `.form-group`, `.color-input`, `.color-component-container` layout styles)

Here's the new scoped style block (keep only unique styles):

```css
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
```

- [ ] **Step 3: Update template class references**

Replace hardcoded styles with global classes:

- `.color-display-section` → `.section-card`
- `.color-editor-section` → `.section-card`
- `.submit-button` → `.btn btn-success`
- The header `<h1>` block: add `class="gradient-header"`

- [ ] **Step 4: Run format and lint**

```bash
npm run format
npm run lint
```

Expected: No errors.

---

### Task 5: Update NoteToPlayComponent

**Files:**

- Modify: `src/components/NoteToPlayComponent.vue`

- [ ] **Step 1: Read full component**

- [ ] **Step 2: Replace template classes**

In the template:

- `.note-to-play-container` → keep (unique container)
- `.header h2` → add `class="gradient-header"` to the h2
- `.controls-section` → `.section-card`
- `.setting-group` → `.section-card`
- `.game-display` → `.section-card`
- `.play-button` → `.btn btn-success`
- `.stop-button` → `.btn btn-danger`
- `.submit-button` → `.btn btn-success`
- `.setting-select` → `.form-input`

- [ ] **Step 3: Reduce scoped CSS**

Remove from scoped style:

- `.header h2 { ... }` — now uses `.gradient-header`
- `.controls-section { ... }` — now uses `.section-card`
- `.setting-group { ... }` — now uses `.section-card`
- `.game-display { ... }` — now uses `.section-card`
- `.play-button { ... }` — now uses `.btn btn-success`
- `.stop-button { ... }` — now uses `.btn btn-danger`

Keep unique styles only:

```css
.note-to-play-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 25px;
  box-shadow: var(--shadow-main);
  backdrop-filter: blur(10px);
  color: var(--text-dark);
  font-family: var(--font-family);
  max-width: 400px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 25px;
}

.playback-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}

.cheat-section {
  display: flex;
  justify-content: center;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
}

.setting-label {
  display: block;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 10px;
  font-size: 1rem;
}

.metronome-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metronome-divider {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-color);
  padding: 0 5px;
}

.note-display {
  margin-bottom: 25px;
}

.current-note {
  background: var(--primary-gradient);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.current-note:hover {
  animation-play-state: paused;
  transform: scale(1.02);
}

.root-note {
  margin: 0;
  font-size: 3rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 2px;
}

.interval-text {
  margin: 10px 0 0 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.score-section {
  display: flex;
  justify-content: center;
}

.score-display {
  background: var(--warning-gradient);
  border-radius: 20px;
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-warning);
}

.score-display:hover {
  transform: scale(1.05);
}

.score-label {
  font-weight: 600;
  color: white;
  font-size: 1rem;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.user-feedback {
  display: flex;
  justify-content: center;
}

.played-note {
  background: rgba(52, 152, 219, 0.1);
  border: 2px solid rgba(52, 152, 219, 0.3);
  border-radius: 15px;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  justify-content: center;
}

.played-note:hover {
  border-color: var(--secondary-blue);
  background: rgba(52, 152, 219, 0.15);
}

.feedback-label {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.feedback-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--secondary-blue);
  padding: 5px 12px;
  background: rgba(52, 152, 219, 0.1);
  border-radius: var(--radius-md);
  min-width: 40px;
  text-align: center;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.current-note {
  animation: pulse 2s ease-in-out infinite;
}

@media (max-width: 768px) {
  .note-to-play-container {
    max-width: 100%;
  }
}
```

- [ ] **Step 4: Run format and lint**

```bash
npm run format
npm run lint
```

---

### Task 6: Update PlaySoundComponent

**Files:**

- Modify: `src/components/PlaySoundComponent.vue`

- [ ] **Step 1: Read full component**

- [ ] **Step 2: Replace template classes**

In the template:

- `.training-section` → `.section-card`
- `.audio-files-section` → `.section-card`
- `.speed-control` → `.section-card`
- `.time-controls` → `.section-card`
- `.buttonbis` → `.btn btn-primary`
- `.button-cross` → `.btn-icon-round btn-danger`
- `.button` (playback) → `.btn btn-success` / `.btn btn-warning` / `.btn btn-danger` depending on nth-child

- [ ] **Step 3: Reduce scoped CSS**

Remove section-card, btn-icon-round patterns from scoped style.

- [ ] **Step 4: Run format and lint**

```bash
npm run format
npm run lint
```

---

### Task 7: Update SuggestedChordsComponent

**Files:**

- Modify: `src/components/SuggestedChordsComponent.vue`

- [ ] **Step 1: Read full component**

- [ ] **Step 2: Replace template classes**

- `.chord-header` → add gradient pattern: remove the inline `background` in favor of `class="gradient-header"` (the template already has a chord-header with gradient header styling)
- `.columnchords` → `.section-card` (same visual: translucent white bg, rounded, shadow, padding)

- [ ] **Step 3: Reduce scoped CSS**

Remove from scoped style:

- `.columnchords { ... }` — now uses `.section-card`
- `.chord-header { ... }` gradient header — now uses `.gradient-header`

Keep unique styles:

```css
.chords-container {
  margin: 20px auto;
  padding: 15px;
  background: var(--bg-main-gradient);
  border-radius: 16px;
  box-shadow: var(--shadow-main);
  font-family: var(--font-family);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chord-header {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chord-header:active {
  transform: scale(0.98);
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

.toggle-icon {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
  display: inline-block;
}

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
  color: var(--text-dark);
  margin: 0;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-md);
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
  background: var(--primary-gradient);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: -1;
}

.chordtext:hover {
  transform: translateX(5px);
  border-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.chordtext:hover::before {
  opacity: 1;
}

.chordtext:active {
  transform: translateX(5px) scale(0.98);
}

.chordtext:nth-child(1) {
  border-left: 4px solid var(--accent-red);
}
.chordtext:nth-child(2) {
  border-left: 4px solid var(--accent-orange);
}
.chordtext:nth-child(3) {
  border-left: 4px solid #f1c40f;
}
.chordtext:nth-child(4) {
  border-left: 4px solid var(--accent-green);
}
.chordtext:nth-child(5) {
  border-left: 4px solid var(--secondary-blue);
}
.chordtext:nth-child(6) {
  border-left: 4px solid var(--accent-purple);
}
.chordtext:nth-child(7) {
  border-left: 4px solid var(--accent-orange);
}

@media (max-width: 768px) {
  .chords-container {
    margin: 10px;
  }
}

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

.section-card {
  max-height: 500px;
  overflow-y: auto;
}
```

- [ ] **Step 4: Run format and lint**

```bash
npm run format
npm run lint
```

---

### Task 8: Update KeyboardComponent

**Files:**

- Modify: `src/components/KeyboardComponent.vue`

- [ ] **Step 1: Read full component**

- [ ] **Step 2: Replace template classes**

- `.clear-btn` → `class="btn btn-danger-alt"` (matches the same danger-alt gradient)
- `.note-chip` → keep but can use `class="chip"` pattern (currently chip has blue background, note-chip uses primary-gradient — keep unique)

- [ ] **Step 3: Run format and lint**

```bash
npm run format
npm run lint
```

---

### Task 9: Update NotesSelectedComponent

**Files:**

- Modify: `src/components/NotesSelectedComponent.vue`

- [ ] **Step 1: Read full component**

- [ ] **Step 2: Replace template classes**

- `.clear-all-btn` → `class="btn btn-danger-alt"`
- `.preview-note` → keep (unique color-per-note logic)

- [ ] **Step 3: Run format and lint**

```bash
npm run format
npm run lint
```

---

### Task 10: Update GuitarTrainingComponent

**Files:**

- Modify: `src/components/GuitarTrainingComponent.vue`

- [ ] **Step 1: Read full component**

- [ ] **Step 2: Replace scrollbar styles with `.custom-scrollbar`**

In the template, add `class="custom-scrollbar"` to elements that currently have scrollbar styling in scoped CSS:

- `.column`
- `.columnd`
- `.training-tree`
- `.states-container`

In the scoped `<style>`, remove the duplicated scrollbar CSS blocks (for `.column::-webkit-scrollbar`, `.columnd::-webkit-scrollbar`, `.training-tree::-webkit-scrollbar`, `.states-container::-webkit-scrollbar`).

- [ ] **Step 3: Run format and lint**

```bash
npm run format
npm run lint
```

---

### Task 11: Update SidebarComponent

**Files:**

- Modify: `src/components/SidebarComponent.vue`

- [ ] **Step 1: Read full component**

- [ ] **Step 2: Replace scrollbar styles**

Add `class="custom-scrollbar"` to the `.sidebar` element in the template.
In scoped `<style>`, remove the `.sidebar::-webkit-scrollbar` block.

- [ ] **Step 3: Run format and lint**

```bash
npm run format
npm run lint
```

---

### Task 12: Update MancheComponent

**Files:**

- Modify: `src/components/MancheComponent.vue`

- [ ] **Step 1: Read full component**

- [ ] **Step 2: Replace scrollbar and button patterns**

Add `class="custom-scrollbar"` to `.ulmanche` and the `ul:not(.ulmanche)` selector areas.
Replace `.button` style with `class="btn btn-primary"` in template if buttons exist.

- [ ] **Step 3: Run format and lint**

```bash
npm run format
npm run lint
```

---

### Task 13: Delete old CSS files and final verification

**Files:**

- Delete: `src/assets/css/global.css`
- Delete: `src/assets/styles/colors.css`

- [ ] **Step 1: Delete old CSS files**

```bash
rm src/assets/css/global.css
rm src/assets/styles/colors.css
```

- [ ] **Step 2: Run format and lint**

```bash
npm run format
npm run lint
```

Expected: No errors.

- [ ] **Step 3: Verify build**

```bash
npm run build:vite 2>&1 | head -30
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Summary**

Verify no remaining references to `colors.css` or `global.css` in the codebase:

```bash
grep -r "colors.css\|global.css" src/ --include="*.vue" --include="*.js" --include="*.css"
```

Expected: No matches (all references replaced by main.css).
