# CSS Refactoring Design — Guitar App (Neck Wanker)

**Date:** 2026-06-25
**Status:** Design approved, ready for implementation

## Problem

The app has two competing global CSS files (`src/assets/css/global.css` and `src/assets/styles/colors.css`) with overlapping variable names and different values. Many Vue components duplicate the same CSS patterns in scoped `<style>` sections (gradient headers, card containers, pill buttons, scrollbar styles, hover effects). This makes theme changes laborious — a single gradient change requires editing 5+ files.

## Goal

Create a single `src/assets/main.css` with all shared styles, imported globally. Components use classes from `main.css` for shared patterns. Scoped styles contain only truly unique component CSS. Theme changes require editing only `main.css`.

## Approach: Systematic Extraction

### main.css Structure

1. **CSS Custom Properties** — merge both files into one unified set
2. **Base Reset** — `* { box-sizing: border-box }`
3. **Layout** — `.two-columns`, `.column-left`, `.column-right`
4. **Cards & Sections** — `.card`, `.card-header`, `.card-grid`, `.section-card`, `.section-title`, `.info-panel`
5. **Buttons** — `.btn`, `.btn-primary`, `.btn-success`, `.btn-warning`, `.btn-danger`, `.btn-small`, `.btn-icon-round`, `.btn-card`, `.btn-group`
6. **Checkboxes** — `.checkbox-wrapper`, `.checkbox-custom`, `.checkbox-label`
7. **Form Inputs** — `.form-input`, `.note-select`
8. **Sliders** — `.slider-section`, `.slider-container`, `.range-input`
9. **Lists** — `.list-unstyled`, `.list-item`, `.list-item-selected`, `.list-scrollable`
10. **Chips** — `.chip`, `.chip-alt`
11. **Animations** — `.fade-in-up`, `.slide-in-up`, `@keyframes fadeInUp`, `@keyframes slideInUp`
12. **Utilities** — `.flex-center`, `.flex-between`, `.flex-items-center`, `.gap-*`, `.mb-*`, `.text-center`, `.hidden`, `.hover-lift`
13. **Responsive** — all `@media` breakpoints

### Extracted Patterns

| Pattern                  | Source                    | Extracted Class       |
| ------------------------ | ------------------------- | --------------------- |
| Gradient pill headers    | global.css + 3 components | `.gradient-header`    |
| White-semi card sections | 5 components              | `.section-card`       |
| Pill buttons             | global.css + 3 components | `.btn` (standardized) |
| Custom scrollbars        | 6 components              | `.custom-scrollbar`   |
| Hover lift effect        | 10+ locations             | `.hover-lift`         |

### Migration Phases

1. **Create main.css** — merge both files, resolve variable conflicts, add extracted patterns
2. **Update import** — import main.css from `main.js`, remove `colors.css` import and direct `global.css` imports from components
3. **Update components** — for each component:
   - Move duplicated CSS rules from scoped `<style>` to `main.css`
   - Update `<template>` class bindings to use global classes
   - Keep only unique CSS in scoped `<style>`
4. **Cleanup** — delete `src/assets/css/global.css` and `src/assets/styles/colors.css`

### Files Affected

| File                                             | Change                                              |
| ------------------------------------------------ | --------------------------------------------------- |
| `src/assets/main.css`                            | **New** — all shared CSS                            |
| `src/main.js`                                    | Import `main.css` instead of `colors.css`           |
| `src/App.vue`                                    | Keep app-specific layout styles                     |
| `src/components/GammeFinderComponent.vue`        | Remove global.css import, keep using global classes |
| `src/components/LoadPictureComponent.vue`        | Remove global.css import, keep using global classes |
| `src/components/ColorComponent.vue`              | Extract gradient-header, section-card patterns      |
| `src/components/NoteToPlayComponent.vue`         | Extract gradient-header, section-card, btn patterns |
| `src/components/PlaySoundComponent.vue`          | Extract section-card, btn, slider patterns          |
| `src/components/SuggestedChordsComponent.vue`    | Extract gradient-header, section-card patterns      |
| `src/components/KeyboardComponent.vue`           | Extract btn and chip patterns                       |
| `src/components/NotesSelectedComponent.vue`      | Extract btn and section patterns                    |
| `src/components/GuitarTrainingComponent.vue`     | Extract scrollbar, card patterns                    |
| `src/components/SidebarComponent.vue`            | Extract scrollbar patterns                          |
| `src/components/MancheComponent.vue`             | Extract scrollbar, button patterns                  |
| `src/components/TrainingComponent.vue`           | Remove global.css import                            |
| `src/components/VideoComponent.vue`              | Remove global.css import                            |
| `src/components/VideoComponentNewRefactored.vue` | Remove global.css import                            |
| Other components                                 | Minimal or no changes                               |

### CSS Variable Conflict Resolution

Where both files define the same variable with different values, use the `colors.css` dark-theme value as the default (it's imported globally), and add the `global.css` variables that don't exist in `colors.css`:

- Keep `colors.css` → `--text-primary: #ecf0f1` (dark theme)
- Add `global.css` → `--primary-gradient`, `--bg-white-translucent`, `--bg-main-gradient` (for light-themed sections)
- Keep `colors.css` spacing (no `--spacing-xxxl`)
- Keep `colors.css` radius values (slightly smaller)
- Keep `colors.css` font weights

### Constraints

- Template classes must stay synchronized with CSS classes (isomorphic)
- No semicolons, single quotes, 2-space indent, 100 char print width (project Prettier config)
- ESLint `no-unused-vars` is off — unused CSS classes are fine
