/**
 * Main IPC Handlers Module
 *
 * This module imports and registers all IPC handlers from separate modules
 * to organize the background.js file better.
 */

import { registerFileHandlers } from './fileHandlers.js'
import { registerVideoHandlers } from './videoHandlers.js'
// VST3 support removed
// import { registerVST3Handlers } from './vst3Handlers.js'
// import { registerAudioHandlers } from './audioHandlers.js'
// import { registerEditorHostHandlers } from './editorHostHandlers.js'

/**
 * Register all IPC handlers
 */
export function registerAllIPCHandlers() {
  console.log('🔧 Registering all IPC handlers...')

  // Register file and directory handlers
  registerFileHandlers()

  // Register video handlers
  registerVideoHandlers()

  // VST3 handlers removed - feature disabled
  // registerVST3Handlers(vst3HostInstance)
  // registerAudioHandlers(vst3HostInstance)
  // registerEditorHostHandlers(editorHostBridgeInstance)

  console.log('✅ All IPC handlers registered successfully')
}

/**
 * Individual exports for selective importing
 */
export {
  registerFileHandlers,
  registerVideoHandlers,
  // VST3 handlers removed
  // registerVST3Handlers,
  // registerAudioHandlers,
  // registerEditorHostHandlers
}
