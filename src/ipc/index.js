/**
 * Main IPC Handlers Module
 * 
 * This module imports and registers all IPC handlers from separate modules
 * to organize the background.js file better.
 */

import { registerFileHandlers } from './fileHandlers.js'
import { registerVideoHandlers } from './videoHandlers.js'
import { registerVST3Handlers } from './vst3Handlers.js'
import { registerAudioHandlers } from './audioHandlers.js'
import { registerEditorHostHandlers } from './editorHostHandlers.js'

/**
 * Register all IPC handlers
 * @param {Object} vst3HostInstance - The VST3 host instance
 * @param {Object} editorHostBridgeInstance - The EditorHost bridge instance
 */
export function registerAllIPCHandlers(vst3HostInstance, editorHostBridgeInstance) {
  console.log('🔧 Registering all IPC handlers...')
  
  // Register file and directory handlers
  registerFileHandlers()
  
  // Register video handlers
  registerVideoHandlers()
  
  // Register VST3 handlers (requires VST3 host instance)
  registerVST3Handlers(vst3HostInstance)
  
  // Register audio handlers (requires VST3 host instance)
  registerAudioHandlers(vst3HostInstance)
  
  // Register EditorHost handlers (requires EditorHost bridge instance)
  registerEditorHostHandlers(editorHostBridgeInstance)
  
  console.log('✅ All IPC handlers registered successfully')
}

/**
 * Individual exports for selective importing
 */
export {
  registerFileHandlers,
  registerVideoHandlers,
  registerVST3Handlers,
  registerAudioHandlers,
  registerEditorHostHandlers
}
