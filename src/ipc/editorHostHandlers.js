import { ipcMain, BrowserWindow } from 'electron'

/**
 * EditorHost Bridge IPC Handlers
 */

export function registerEditorHostHandlers(editorHostBridgeInstance) {
  // Set EditorHost path
  ipcMain.handle('editor-host-set-path', async (event, hostPath) => {
    try {
      if (!editorHostBridgeInstance) {
        return { success: false, error: 'EditorHostBridge not available' }
      }

      console.log('🔧 Setting EditorHost path:', hostPath)
      const result = editorHostBridgeInstance.setEditorHostPath(hostPath)

      return result
    } catch (error) {
      console.error('EditorHost set path error:', error)
      return { success: false, error: error.message }
    }
  })

  // Launch EditorHost
  ipcMain.handle('editor-host-launch', async (event) => {
    try {
      if (!editorHostBridgeInstance) {
        return { success: false, error: 'EditorHostBridge not available' }
      }

      console.log('🚀 Launching EditorHost...')
      const result = await editorHostBridgeInstance.launchEditorHost()

      return result
    } catch (error) {
      console.error('EditorHost launch error:', error)
      return { success: false, error: error.message }
    }
  })

  // Load plugin in EditorHost
  ipcMain.handle('editor-host-load-plugin', async (event, pluginPath) => {
    try {
      if (!editorHostBridgeInstance) {
        return { success: false, error: 'EditorHostBridge not available' }
      }

      console.log('🔌 Loading plugin in EditorHost:', pluginPath)
      const result = await editorHostBridgeInstance.loadPlugin(pluginPath)

      return result
    } catch (error) {
      console.error('EditorHost load plugin error:', error)
      return { success: false, error: error.message }
    }
  })

  // Embed EditorHost window
  ipcMain.handle('editor-host-embed-window', async (event, parentWindowHandle) => {
    try {
      if (!editorHostBridgeInstance) {
        return { success: false, error: 'EditorHostBridge not available' }
      }

      console.log('🔗 Embedding EditorHost window with parent handle:', parentWindowHandle)
      const result = await editorHostBridgeInstance.embedWindow(parentWindowHandle)

      return result
    } catch (error) {
      console.error('EditorHost embed window error:', error)
      return { success: false, error: error.message }
    }
  })

  // Detach EditorHost window
  ipcMain.handle('editor-host-detach-window', async (event) => {
    try {
      if (!editorHostBridgeInstance) {
        return { success: false, error: 'EditorHostBridge not available' }
      }

      console.log('🔓 Detaching EditorHost window...')
      const result = await editorHostBridgeInstance.detachWindow()

      return result
    } catch (error) {
      console.error('EditorHost detach window error:', error)
      return { success: false, error: error.message }
    }
  })

  // Close EditorHost
  ipcMain.handle('editor-host-close', async (event) => {
    try {
      if (!editorHostBridgeInstance) {
        return { success: false, error: 'EditorHostBridge not available' }
      }

      console.log('🛑 Closing EditorHost...')
      const result = await editorHostBridgeInstance.closeEditorHost()

      return result
    } catch (error) {
      console.error('EditorHost close error:', error)
      return { success: false, error: error.message }
    }
  })

  // Check if EditorHost is running
  ipcMain.handle('editor-host-is-running', async (event) => {
    try {
      if (!editorHostBridgeInstance) {
        return false
      }

      return editorHostBridgeInstance.isRunning()
    } catch (error) {
      console.error('EditorHost is running check error:', error)
      return false
    }
  })

  // Get EditorHost window info
  ipcMain.handle('editor-host-get-window-info', async (event) => {
    try {
      if (!editorHostBridgeInstance) {
        return { isRunning: false, isEmbedded: false }
      }

      return editorHostBridgeInstance.getWindowInfo()
    } catch (error) {
      console.error('EditorHost get window info error:', error)
      return { isRunning: false, isEmbedded: false }
    }
  })

  // Check EditorHost availability
  ipcMain.handle('editor-host-check-availability', async (event) => {
    try {
      return {
        available: editorHostBridgeInstance !== null,
        isRunning: editorHostBridgeInstance ? editorHostBridgeInstance.isRunning() : false,
      }
    } catch (error) {
      console.error('EditorHost availability check error:', error)
      return { available: false, isRunning: false }
    }
  })

  // Get browser window handle for embedding
  ipcMain.handle('get-browser-window-handle', async (event) => {
    try {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) {
        const handle = focusedWindow.getNativeWindowHandle()
        // Convert Buffer to number for Windows HWND
        const hwnd = handle.readUIntLE(0, handle.length)
        console.log('🎯 Browser window handle:', hwnd.toString(16))
        return { success: true, handle: hwnd }
      }
      return { success: false, error: 'No focused window found' }
    } catch (error) {
      console.error('Get browser window handle error:', error)
      return { success: false, error: error.message }
    }
  })

  console.log('✅ EditorHost handlers registered')
}
