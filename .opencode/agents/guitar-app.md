---
description: Expert on the Guitar App (Neck Wanker) codebase. Use when answering questions about the project's architecture, conventions, or structure.
mode: subagent
---

You are an expert on the Guitar App (Neck Wanker) codebase — an Electron + Vue 3 desktop app for learning guitar.

## Quick Commands

| Task                               | Command                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| Install                            | `npm install`                                                                |
| Vite dev server (browser)          | `npm run dev`                                                                |
| Electron dev mode                  | `npm run electron:serve` (legacy) or `npm run electron:dev` (Vite)           |
| Build for production               | `npm run build:vite`                                                         |
| Build Electron distributable       | `npm run electron:build`                                                     |
| Lint                               | `npm run lint`                                                               |
| Format                             | `npm run format`                                                             |
| Build Electron (platform-specific) | `npm run electron:build:win` / `electron:build:mac` / `electron:build:linux` |

No test suite exists. No typecheck command exists (plain JS via jsconfig.json, not TypeScript).

## Code Style

- **No semicolons**, single quotes, trailing commas (ES5), 100 char print width, 2-space indent
- Vue: `<script>` and `<style>` are indented inside SFCs (`vueIndentScriptAndStyle: true`)
- ESLint: `no-unused-vars` is off — unused vars will not fail lint
- Prettier is the primary formatter; run `npm run format` before committing

## Architecture

### Entry Points

- **Electron main process:** `src/background.js` → loads IPC handlers from `src/ipc/`
- **Vue renderer:** `src/main.js` → mounts `src/App.vue`
- **Electron preload:** `public/preload.js`
- **Vite config:** `vite.config.js` — configures both Vite and electron plugin in one file

### Source Layout

```
src/
├── App.vue                  # Root component
├── main.js                  # Vue app bootstrap (i18n, Pinia)
├── background.js            # Electron main process
├── components/              # 20 Vue SFCs (all flat, no subdirectories)
├── controllers/             # appController.js only
├── services/                # Business logic (audio, video, files, tabs, settings, etc.)
├── stores/                  # Pinia stores (12 stores)
├── ipc/                     # Modular IPC handlers (file, video, audio, editorHost)
├── locales/                 # i18n: en.json, fr.json
└── assets/                  # Static assets (CSS, images)
```

### Key Libraries

- **AlphaTab** (`@coderline/alphatab`): Tab rendering. Custom Vite plugin registered in `vite.config.js`. Treats `guitar*` tags as custom elements.
- **Pinia**: State management. 12 stores in `src/stores/`. Store is exposed globally as `window.$pinia`.
- **vue-i18n**: i18n with `fr` as fallback locale. Two locale files in `src/locales/`.
- **Electron + vite-plugin-electron**: Electron main process built by Vite. `fs-extra`, `path`, `fs` are externalized.

### Vite + Electron Quirk

`vite.config.js` configures both the web build and the Electron main process. The electron main entry is `src/background.js`; preload is `public/preload.js`. Node builtins and `fs-extra` are externalized — do not import them in renderer code.

### IPC Pattern

IPC handlers are modular in `src/ipc/`. Each handler file registers `ipcMain.handle()` calls. The barrel file `src/ipc/index.js` exports `registerAllIPCHandlers()`. When adding new IPC channels, add a handler in the appropriate file under `src/ipc/` and register it in `src/ipc/index.js`.

### i18n

Add new translation keys to both `src/locales/en.json` and `src/locales/fr.json`. The app defaults to French if the user's browser locale is not `en` or `fr`.
