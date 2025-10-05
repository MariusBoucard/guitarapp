# IPC Handlers Documentation

This directory contains modular IPC (Inter-Process Communication) handlers for the Guitar App's Electron backend. The handlers have been split from the main `background.js` file for better organization and maintainability.

## File Structure

```
src/ipc/
├── index.js              # Main module that imports and registers all handlers
├── fileHandlers.js       # File and directory selection handlers
├── videoHandlers.js      # Video file processing handlers
├── vst3Handlers.js       # VST3 plugin management handlers
├── audioHandlers.js      # Audio processing handlers
└── editorHostHandlers.js # EditorHost bridge handlers
```

## Modules

### `index.js`
The main entry point that imports all handler modules and provides:
- `registerAllIPCHandlers(vst3Instance, editorInstance)` - Registers all handlers
- Individual handler exports for selective importing

### `fileHandlers.js`
Handles file and directory operations:
- `select-audio-file` - Audio file selection dialog
- `select-video-file` - Video file selection dialog
- `select-directory` - Directory selection dialog
- `select-vst3-plugin` - VST3 plugin file selection
- `save-directory-tree` - Save directory structure to file
- `load-directory-tree` - Load saved directory structure
- `parse-directory` - Legacy directory parsing (commented out)

### `videoHandlers.js`
Handles video file operations:
- `load-video-file` - Load and encode video file to base64
- `scan-video-directory` - Recursively scan directory for video files

### `vst3Handlers.js`
Handles VST3 plugin management:
- `vst3-native-load-plugin` - Load VST3 plugin
- `vst3-native-unload-plugin` - Unload VST3 plugin
- `vst3-native-get-plugins` - Get loaded plugins list
- `vst3-native-show-ui` - Show plugin UI
- `vst3-native-hide-ui` - Hide plugin UI
- `vst3-native-start-processing` - Start audio processing
- `vst3-native-stop-processing` - Stop audio processing
- `vst3-native-get-audio-devices` - Get available audio devices
- `vst3-native-check-availability` - Check VST3 host availability
- `show-vst3-plugin-ui` - Enhanced plugin UI with fallback
- `close-vst3-plugin-ui` - Close plugin UI window

### `audioHandlers.js`
Handles audio processing operations:
- `vst3-initialize-audio` - Initialize audio subsystem
- `vst3-load-audio-plugin` - Load plugin with audio configuration
- `vst3-process-audio` - Process audio through plugin
- `vst3-get-parameters` - Get plugin parameters
- `vst3-set-parameter` - Set plugin parameter value
- `vst3-unload-audio-plugin` - Unload audio plugin

### `editorHostHandlers.js`
Handles EditorHost bridge operations:
- `editor-host-set-path` - Set EditorHost executable path
- `editor-host-launch` - Launch EditorHost application
- `editor-host-load-plugin` - Load plugin in EditorHost
- `editor-host-embed-window` - Embed EditorHost window
- `editor-host-detach-window` - Detach EditorHost window
- `editor-host-close` - Close EditorHost application
- `editor-host-is-running` - Check if EditorHost is running
- `editor-host-get-window-info` - Get window information
- `editor-host-check-availability` - Check EditorHost availability
- `get-browser-window-handle` - Get browser window handle for embedding

## Usage

### In background.js
```javascript
import { registerAllIPCHandlers } from './ipc/index.js'

// Register all handlers with instances
registerAllIPCHandlers(vst3HostInstance, editorHostBridgeInstance)
```

### Selective Import
```javascript
import { registerFileHandlers, registerVideoHandlers } from './ipc/index.js'

// Register only specific handlers
registerFileHandlers()
registerVideoHandlers()
```

## Benefits of Modular Structure

1. **Better Organization**: Related handlers are grouped together
2. **Easier Maintenance**: Each module can be updated independently
3. **Improved Readability**: Smaller, focused files are easier to understand
4. **Reduced Complexity**: Main background.js file is significantly smaller
5. **Selective Loading**: Can load only needed handlers if required
6. **Better Testing**: Each module can be unit tested separately

## Dependencies

Each handler module has minimal dependencies:
- `electron` - For IPC and dialog functionality
- `path` - For file path operations
- `fs-extra` - For file system operations (where needed)

The VST3 and EditorHost handlers require their respective instances to be passed during registration.
