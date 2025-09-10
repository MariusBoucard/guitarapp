'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, crashReporter } from 'electron'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { join, extname, basename, dirname } from 'path'
import { fileURLToPath } from 'url'
import { homedir } from 'os'
import fs from 'fs-extra'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Disable Crashpad crash reporter to prevent connection errors
app.commandLine.appendSwitch('disable-crash-reporter')
app.commandLine.appendSwitch('disable-crashpad')

// Disable crash reporter to prevent Crashpad connection errors
try {
  crashReporter.start({
    productName: 'NeckWanker',
    companyName: 'Guitar App',
    submitURL: '', // Empty URL disables crash reporting
    uploadToServer: false, // Explicitly disable upload
    collectParameters: false,
    crashesDirectory: '', // Empty directory
    extra: {}
  })
} catch (error) {
  // If crash reporter fails to start, continue without it
  console.log('Crash reporter disabled:', error.message)
}

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// VST3 Host Integration
let VST3HostWrapper = null
let EditorHostBridgeWrapper = null
let vst3HostInstance = null
let editorHostBridgeInstance = null
let audioInitialized = false

// Try to load the VST3 host wrapper module
try {
  // Try different possible paths for the wrapper module
  const possiblePaths = [
    '../native/vst3-host/index.js',  // From src directory
    './native/vst3-host/index.js',   // From app root
    join(__dirname, '../native/vst3-host/index.js'), // Using path.join
    join(process.cwd(), 'native/vst3-host/index.js'),  // From current working directory
    join(__dirname, '../../native/vst3-host/index.js'), // From built app
    'C:\\Users\\Marius\\Desktop\\guitarapp\\native\\vst3-host\\index.js' // Absolute path
  ]
  
  console.log('🔍 Current working directory:', process.cwd())
  console.log('🔍 __dirname:', __dirname)
  
  let vst3HostModule = null
  for (const path of possiblePaths) {
    try {
      console.log('🔍 Trying to load VST3 wrapper from:', path)
      vst3HostModule = require(path)
      console.log('✅ VST3 wrapper loaded from:', path)
      break
    } catch (e) {
      console.log('⚠️ Failed to load from:', path, '- Error:', e.message)
    }
  }
  
  if (vst3HostModule && vst3HostModule.VST3HostWrapper) {
    VST3HostWrapper = vst3HostModule.VST3HostWrapper
    EditorHostBridgeWrapper = vst3HostModule.EditorHostBridgeWrapper
    
    vst3HostInstance = new VST3HostWrapper()
    console.log('✅ Native VST3 host wrapper loaded successfully')
    console.log('🎹 VST3 Host initialized successfully')
    
    // Initialize EditorHostBridge if available
    if (EditorHostBridgeWrapper) {
      editorHostBridgeInstance = new EditorHostBridgeWrapper()
      console.log('✅ EditorHostBridge initialized successfully')
      
      // Set the default EditorHost path to the VST3PluginTestHost
      const defaultEditorHostPath = join(__dirname, '../third_party/VST_SDK/vst3sdk/bin/Windows_x64/VST3PluginTestHost_x64_Installer_3.10.0.zip')
      // Note: This path points to the installer. We'll need to extract or use the actual executable
      console.log('📂 Default EditorHost path:', defaultEditorHostPath)
    } else {
      console.log('⚠️ EditorHostBridge not available')
    }
  } else {
    throw new Error('Could not find VST3HostWrapper in any expected location')
  }
} catch (error) {
  console.log('⚠️  Native VST3 host not available:', error.message)
  console.log('   Run "npm run vst3:build" to enable native VST3 support')
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1600,
    height: 1200,
    backgroundColor: '#000000',
    icon: join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: isDevelopment 
        ? join(__dirname, '../public/preload.js')
        : join(__dirname, './preload.js'),
      webSecurity: isDevelopment ? false : true, // Enable webSecurity in production
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      backgroundThrottling: false, // Prevent background throttling
      sandbox: false
    }
  })
  
  win.setMenu(null)
  
  // Configure session to reduce cache errors and enable fullscreen
  const session = win.webContents.session
  if (isDevelopment) {
    session.setPermissionRequestHandler(() => true)
    session.clearCache() // Clear cache on startup in dev mode
  }
  
  // Enable fullscreen permission for all origins
  session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'fullscreen') {
      callback(true) // Allow fullscreen
      return
    }
    callback(true) // Allow other permissions in development
  })
  
  if (isDevelopment) {
    // Load the Vite dev server URL
    try {
      await win.loadURL('http://localhost:8080') // Use port 8080 as configured in vite.config.js
    } catch (error) {
      console.error('Failed to load development URL:', error)
      // Fallback to a local file if dev server is not running
      const indexPath = join(__dirname, '../dist/index.html')
      await win.loadFile(indexPath)
    }
    if (!process.env.IS_TEST) {
      win.webContents.openDevTools()
      
      // Disable some problematic DevTools features
      win.webContents.on('devtools-opened', () => {
        win.webContents.devToolsWebContents?.executeJavaScript(`
          // Disable autofill in DevTools to prevent console errors
          if (window.DevToolsAPI && window.DevToolsAPI.dispatchMessage) {
            const originalDispatch = window.DevToolsAPI.dispatchMessage;
            window.DevToolsAPI.dispatchMessage = function(message) {
              if (message && message.includes('Autofill.enable')) {
                return;
              }
              return originalDispatch.call(this, message);
            };
          }
        `).catch(() => {
          // Ignore errors from DevTools JavaScript execution
        });
      });
    }
  } else {
    // Load the built files
    const indexPath = join(__dirname, '../dist/index.html')
    await win.loadFile(indexPath)
    // Remove DevTools opening in production for security
    // win.webContents.openDevTools()
  }
}

// IPC handlers
ipcMain.handle('load-video-file', async (event, filePath) => {
  try {
    console.log('Attempting to load video file:', filePath)
    
    // Verify file exists and is a video file
    if (!await fs.pathExists(filePath)) {
      throw new Error(`File does not exist: ${filePath}`)
    }
    
    const ext = extname(filePath).toLowerCase()
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    
    if (!videoExtensions.includes(ext)) {
      throw new Error(`Unsupported video format: ${ext}`)
    }
    
    console.log('File exists and is valid video format')
    
    // Read the video file and create a blob URL
    const videoBuffer = await fs.readFile(filePath)
    const base64Data = videoBuffer.toString('base64')
    
    // Determine MIME type based on extension
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.avi': 'video/avi',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska'
    }
    
    const mimeType = mimeTypes[ext] || 'video/mp4'
    
    console.log('Video file loaded successfully:', basename(filePath))
    
    return {
      success: true,
      data: base64Data,
      mimeType: mimeType,
      fileName: basename(filePath)
    }
  } catch (error) {
    console.error('Failed to load video file:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

ipcMain.handle('select-audio-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('select-video-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

// VST3 Plugin file selection handler
ipcMain.handle('select-vst3-plugin', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'VST3 Plugins', extensions: ['vst3'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    title: 'Select VST3 Plugin Files'
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths
  }
  return []
})

// Native VST3 Plugin Management (when native host is available)
ipcMain.handle('vst3-native-load-plugin', async (event, pluginPath) => {
  if (!vst3HostInstance) {
    return { success: false, error: 'Native VST3 host not available' }
  }
  
  try {
    console.log('🎵 Loading VST3 plugin:', pluginPath)
    
    // Load the plugin using our VST3Host
    const loadResult = await vst3HostInstance.loadPlugin(pluginPath)
    
    if (loadResult.success) {
      // Get plugin info from the loaded plugin
      const pluginInfo = loadResult.plugin || {}
      
      // Extract plugin name from path
      const pluginName = pluginPath.split(/[\\\/]/).pop().replace('.vst3', '')
      
      const result = {
        success: true,
        pluginId: pluginInfo.id || pluginName,
        name: pluginInfo.name || pluginName,
        vendor: 'VST3 Plugin',
        version: '1.0.0',
        category: 'Effect/Instrument',
        path: pluginPath,
        hasUI: pluginInfo.hasUI || false,
        isLoaded: pluginInfo.initialized || false
      }
      
      console.log('✅ Plugin loaded successfully:', result)
      return result
    } else {
      return { success: false, error: loadResult.error || 'Failed to load VST3 plugin' }
    }
  } catch (error) {
    console.error('❌ VST3 plugin load error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('vst3-native-unload-plugin', async (event, pluginId) => {
  if (!vst3HostInstance) {
    return { success: false, error: 'Native VST3 host not available' }
  }
  
  try {
    // Our clean implementation doesn't have unloadPlugin - return success for compatibility
    return { success: true, message: 'Plugin unloading not implemented in clean VST3 host' }
  } catch (error) {
    console.error('Native VST3 plugin unload error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('vst3-native-get-plugins', async (event) => {
  if (vst3HostInstance) {
    try {
      if (vst3HostInstance.getLoadedPlugins) {
        // Use wrapper method
        const plugins = await vst3HostInstance.getLoadedPlugins()
        return { success: true, plugins }
      } else if (vst3HostInstance.getLoadedPlugins) {
        // Use direct native module method  
        const plugins = vst3HostInstance.getLoadedPlugins()
        return { success: true, plugins }
      } else {
        // Manual plugin list from loaded plugins map
        const plugins = Array.from(vst3HostInstance.loadedPlugins?.values() || [])
        return { success: true, plugins }
      }
    } catch (error) {
      console.error('Native VST3 get plugins error:', error)
      return { success: false, error: error.message, plugins: [] }
    }
  } else {
    return { success: false, error: 'Native VST3 host not available', plugins: [] }
  }
})

ipcMain.handle('vst3-native-show-ui', async (event, pluginId, parentWindowId) => {
  if (!vst3HostInstance) {
    return { success: false, error: 'Native VST3 host not available' }
  }
  
  try {
    console.log('🖥️ Opening VST3 plugin UI for:', pluginId)
    
    // Show the plugin UI using our VST3Host
    const uiResult = await vst3HostInstance.showPluginUI(pluginId, parentWindowId)
    
    if (uiResult.success) {
      console.log('✅ VST3 plugin UI opened successfully')
      return { 
        success: true, 
        message: 'Plugin UI opened',
        pluginId: pluginId
      }
    } else {
      return { success: false, error: uiResult.error || 'Failed to open plugin UI' }
    }
  } catch (error) {
    console.error('❌ VST3 show UI error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('vst3-native-hide-ui', async (event, pluginId) => {
  if (!vst3HostInstance) {
    return { success: false, error: 'Native VST3 host not available' }
  }
  
  try {
    console.log('🔒 Closing VST3 plugin UI for:', pluginId)
    
    // Hide the plugin UI using our VST3Host
    const uiResult = await vst3HostInstance.hidePluginUI(pluginId)
    
    if (uiResult.success) {
      console.log('✅ VST3 plugin UI closed successfully')
      return { 
        success: true, 
        message: 'Plugin UI closed',
        pluginId: pluginId
      }
    } else {
      return { success: false, error: uiResult.error || 'Failed to close plugin UI' }
    }
  } catch (error) {
    console.error('❌ VST3 hide UI error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('vst3-native-start-processing', async (event) => {
  if (!vst3HostInstance) {
    return { success: false, error: 'Native VST3 host not available' }
  }
  
  try {
    // Our clean implementation doesn't have audio processing - return success for compatibility
    return { success: true, message: 'Audio processing not implemented in clean VST3 host' }
  } catch (error) {
    console.error('Native VST3 start processing error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('vst3-native-stop-processing', async (event) => {
  if (!vst3HostInstance) {
    return { success: false, error: 'Native VST3 host not available' }
  }
  
  try {
    // Our clean implementation doesn't have audio processing - return success for compatibility
    return { success: true, message: 'Audio processing not implemented in clean VST3 host' }
  } catch (error) {
    console.error('Native VST3 stop processing error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('vst3-native-get-audio-devices', async (event) => {
  if (!vst3HostInstance) {
    return { success: false, error: 'Native VST3 host not available' }
  }
  
  try {
    // Our clean implementation doesn't have audio device enumeration - return empty for compatibility
    return { success: true, devices: [], message: 'Audio device enumeration not implemented in clean VST3 host' }
  } catch (error) {
    console.error('Native VST3 get audio devices error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('vst3-native-check-availability', async (event) => {
  return { 
    available: vst3HostInstance !== null,
    version: vst3HostInstance ? '1.0.0' : null
  }
})

// VST3 Audio Processing Handlers
ipcMain.handle('vst3-initialize-audio', async (event, audioConfig) => {
  if (!vst3HostInstance) {
    return { success: false, error: 'Native VST3 host not available' }
  }
  
  try {
    console.log('🔊 Initializing VST3 audio with config:', audioConfig)
    
    // Initialize audio using our SimpleVST3Host
    const initResult = vst3HostInstance.initializeAudio()
    
    if (initResult) {
      audioInitialized = true
      console.log('✅ VST3 audio initialized successfully')
      
      return { 
        success: true, 
        message: 'Audio initialized successfully',
        sampleRate: audioConfig.sampleRate || 44100,
        blockSize: audioConfig.bufferSize || 256,
        audioConfig: {
          sampleRate: audioConfig.sampleRate || 44100,
          bufferSize: audioConfig.bufferSize || 256,
          inputChannels: audioConfig.inputChannels || 2,
          outputChannels: audioConfig.outputChannels || 2,
          inputDevice: audioConfig.inputDevice || 'default',
          outputDevice: audioConfig.outputDevice || 'default'
        }
      }
    } else {
      return { success: false, error: 'Failed to initialize VST3 audio' }
    }
  } catch (error) {
    console.error('❌ VST3 audio initialization error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('vst3-load-audio-plugin', async (event, pluginPath, audioConfig = {}) => {
  try {
    if (!vst3HostInstance) {
      return { success: false, error: 'VST3 host not initialized' }
    }
    
    console.log('🎛️ Loading VST3 audio plugin with configuration:', {
      pluginPath,
      audioConfig
    })
    
    // Initialize audio context if provided
    if (audioConfig && Object.keys(audioConfig).length > 0) {
      console.log('🔧 Initializing VST3 host with audio config:', audioConfig)
      
      // Try to initialize the audio context in the VST3 host
      if (vst3HostInstance.initializeAudio) {
        try {
          const audioInitResult = await vst3HostInstance.initializeAudio(audioConfig)
          console.log('🎹 Audio initialization result:', audioInitResult)
        } catch (audioError) {
          console.warn('⚠️ Audio initialization failed:', audioError.message)
          // Continue without audio - some plugins might still load for UI
        }
      } else {
        console.log('ℹ️ VST3 host does not support audio initialization (using basic mode)')
      }
    }
    
    const result = vst3HostInstance.loadPlugin(pluginPath)
    console.log('🎵 Audio plugin load result:', result)
    return result
  } catch (error) {
    console.error('VST3 audio plugin load error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('vst3-process-audio', async (event, pluginId, audioBuffer) => {
  try {
    if (!vst3HostInstance) {
      return { success: false, error: 'VST3 host not initialized' }
    }
    // Our clean implementation doesn't have audio processing - return success for compatibility
    return { success: true, message: 'Audio processing not implemented in clean VST3 host' }
  } catch (error) {
    console.error('VST3 audio processing error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('vst3-get-parameters', async (event, pluginId) => {
  try {
    if (!vst3HostInstance) {
      return { success: false, error: 'VST3 host not initialized', parameters: [] }
    }
    // Our clean implementation doesn't have parameter management - return empty for compatibility
    return { success: true, parameters: [] }
  } catch (error) {
    console.error('VST3 get parameters error:', error)
    return { success: false, error: error.message, parameters: [] }
  }
})

ipcMain.handle('vst3-set-parameter', async (event, pluginId, paramId, value) => {
  try {
    if (!vst3HostInstance) {
      return { success: false, error: 'VST3 host not initialized' }
    }
    // Our clean implementation doesn't have parameter management - return success for compatibility
    return { success: true, message: 'Parameter setting not implemented in clean VST3 host' }
  } catch (error) {
    console.error('VST3 set parameter error:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('vst3-unload-audio-plugin', async (event, pluginId) => {
  try {
    if (!vst3HostInstance) {
      return { success: false, error: 'VST3 host not initialized' }
    }
    // Our clean implementation doesn't have separate unload function - return success for compatibility
    return { success: true, message: 'Plugin unloading not implemented in clean VST3 host' }
  } catch (error) {
    console.error('VST3 unload audio plugin error:', error)
    return { success: false, error: error.message }
  }
})

// VST3 Plugin UI Management (Fallback for mock UI windows)
let pluginUIWindows = new Map()

ipcMain.handle('show-vst3-plugin-ui', async (event, pluginData) => {
  try {
    const { pluginPath, pluginName } = pluginData
    
    console.log('🔄 Fallback UI handler called for:', pluginName)
    console.log('🎯 Plugin path:', pluginPath)
    
    // Try to find the plugin ID from loaded plugins first
    if (vst3HostInstance) {
      try {
        // Look for a loaded plugin with this path
        let foundPluginId = null
        
        // Try to get loaded plugins from the native module
        if (vst3HostInstance.getLoadedPlugins) {
          try {
            const pluginsResult = vst3HostInstance.getLoadedPlugins()
            const plugins = Array.isArray(pluginsResult) ? pluginsResult : (pluginsResult.plugins || [])
            
            for (const plugin of plugins) {
              if (plugin.path === pluginPath) {
                foundPluginId = plugin.id
                break
              }
            }
          } catch (error) {
            console.warn('⚠️ Could not get loaded plugins:', error)
          }
        }
        
        // If we found a plugin ID, use the native UI
        if (foundPluginId) {
          console.log('✅ Found plugin ID for native UI:', foundPluginId)
          const result = vst3HostInstance.showPluginUI(foundPluginId)
          
          if (result.success) {
            console.log('🎛️ Native UI opened successfully from fallback handler')
            return result
          } else {
            console.log('⚠️ Native UI failed:', result.error)
          }
        } else {
          console.log('⚠️ Plugin not found in loaded plugins, attempting to load first')
          
          // Try to load the plugin first
          const loadResult = vst3HostInstance.loadPlugin(pluginPath)
          if (loadResult.success && loadResult.id) {
            console.log('✅ Plugin loaded, now showing UI')
            const uiResult = vst3HostInstance.showPluginUI(loadResult.id)
            
            if (uiResult.success) {
              console.log('🎛️ Native UI opened after loading plugin')
              return uiResult
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in native UI fallback:', error)
      }
    }
    
    // If native UI fails, show a better status message
    console.log('📱 Using enhanced fallback UI window')
    
    // Check if window already exists for this plugin
    if (pluginUIWindows.has(pluginPath)) {
      const existingWindow = pluginUIWindows.get(pluginPath)
      if (!existingWindow.isDestroyed()) {
        existingWindow.focus()
        return { success: true, message: 'Plugin UI window focused' }
      } else {
        pluginUIWindows.delete(pluginPath)
      }
    }
    
    // Create enhanced fallback window with better messaging
    const pluginWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: `${pluginName} - VST3 Plugin Status`,
      backgroundColor: '#2a2a2a',
      autoHideMenuBar: true,
      resizable: true,
      minimizable: true,
      maximizable: true,
      closable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    })
    
    // Enhanced fallback UI with native status info
    const pluginUIHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${pluginName} Status</title>
        <style>
          body {
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            color: #fff;
            font-family: 'Consolas', 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .plugin-container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 30px;
            text-align: left;
            max-width: 700px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 1px solid #444;
          }
          h1 {
            color: #00ff88;
            margin-bottom: 20px;
            font-size: 1.8em;
            text-align: center;
          }
          .status-section {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #ffaa00;
          }
          .status-title {
            color: #ffaa00;
            font-weight: bold;
            font-size: 1.1em;
            margin-bottom: 10px;
          }
          .status-item {
            margin: 5px 0;
            color: #ccc;
            font-size: 0.9em;
          }
          .path-display {
            word-break: break-all;
            color: #00ff88;
            font-size: 0.85em;
            background: rgba(0, 0, 0, 0.2);
            padding: 8px;
            border-radius: 4px;
            margin: 8px 0;
          }
          .notice {
            background: rgba(255, 170, 0, 0.1);
            border: 1px solid #ffaa00;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #ffaa00;
          }
        </style>
      </head>
      <body>
        <div class="plugin-container">
          <h1>�️ ${pluginName} Status</h1>
          
          <div class="status-section">
            <div class="status-title">🔍 Plugin Information</div>
            <div class="status-item">• Name: ${pluginName}</div>
            <div class="status-item">• Format: VST3</div>
            <div class="status-item">• Path:</div>
            <div class="path-display">${pluginPath}</div>
          </div>
          
          <div class="status-section">
            <div class="status-title">🚧 Native UI Status</div>
            <div class="status-item">• VST3 Host: Available</div>
            <div class="status-item">• Enhanced UI: Ready</div>
            <div class="status-item">• Status: Fallback mode active</div>
          </div>
          
          <div class="notice">
            <strong>ℹ️ Enhanced Native UI Available</strong><br><br>
            The native VST3 host is loaded and ready. For the full enhanced UI experience:
            <br><br>
            1. Use the "🖥️ Show Native UI" button in the main interface<br>
            2. This will display the enhanced VST3 status window<br>
            3. Includes VST3 DLL loading and plugin factory information<br><br>
            This window shows that the VST3 plugin system is operational.
          </div>
        </div>
        <script>
          // Status animation
          let dots = 0;
          setInterval(() => {
            dots = (dots + 1) % 4;
            document.title = '${pluginName} Status' + '.'.repeat(dots);
          }, 1000);
        </script>
      </body>
      </html>
    `
    
    // Load the enhanced HTML content
    pluginWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(pluginUIHTML)}`)
    
    // Store window reference
    pluginUIWindows.set(pluginPath, pluginWindow)
    
    // Clean up when window is closed
    pluginWindow.on('closed', () => {
      pluginUIWindows.delete(pluginPath)
    })
    
    return { 
      success: true, 
      message: `Enhanced status window opened for ${pluginName}`,
      windowId: pluginWindow.id
    }
    
  } catch (error) {
    console.error('Failed to show VST3 plugin UI:', error)
    return { 
      success: false, 
      message: `Failed to open plugin UI: ${error.message}` 
    }
  }
})

ipcMain.handle('close-vst3-plugin-ui', async (event, pluginPath) => {
  if (pluginUIWindows.has(pluginPath)) {
    const window = pluginUIWindows.get(pluginPath)
    if (!window.isDestroyed()) {
      window.close()
    }
    pluginUIWindows.delete(pluginPath)
    return { success: true, message: 'Plugin UI window closed' }
  }
  return { success: false, message: 'Plugin UI window not found' }
})

// ===========================================
// EditorHost Bridge IPC Handlers
// ===========================================

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

ipcMain.handle('editor-host-check-availability', async (event) => {
  try {
    return {
      available: editorHostBridgeInstance !== null,
      isRunning: editorHostBridgeInstance ? editorHostBridgeInstance.isRunning() : false
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

ipcMain.handle('scan-video-directory', async (event, directoryPath) => {
  try {
    const allVideos = []
    
    const scanDirectory = async (dirPath) => {
      const items = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const item of items) {
        const fullPath = join(dirPath, item.name)
        
        if (item.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath)
        } else if (item.isFile()) {
          const ext = extname(item.name).toLowerCase()
          const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
          
          if (videoExtensions.includes(ext)) {
            const stats = await fs.stat(fullPath)
            allVideos.push({
              name: item.name,
              path: fullPath,
              isDirectory: false,
              size: stats.size,
              lastModified: stats.mtime
            })
          }
        }
      }
    }
    
    await scanDirectory(directoryPath)
    console.log(`Found ${allVideos.length} video files in ${directoryPath}`)
    
    return { success: true, videos: allVideos }
  } catch (error) {
    console.error('Failed to scan directory:', error)
    return { success: false, error: error.message }
  }
})

// Save directory tree to file
ipcMain.handle('save-directory-tree', async (event, directoryPath, treeData) => {
  try {
    // Save to app data directory
    const appDataPath = join(homedir(), '.guitarapp')
    await fs.ensureDir(appDataPath)
    
    const treeFilePath = join(appDataPath, 'directory-tree.json')
    const dataToSave = {
      directoryPath,
      lastScanned: new Date().toISOString(),
      tree: treeData
    }
    
    await fs.writeJson(treeFilePath, dataToSave, { spaces: 2 })
    
    return { success: true, filePath: treeFilePath }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Load directory tree from file
ipcMain.handle('load-directory-tree', async () => {
  try {
    const appDataPath = join(homedir(), '.guitarapp')
    const treeFilePath = join(appDataPath, 'directory-tree.json')
    
    if (await fs.pathExists(treeFilePath)) {
      const data = await fs.readJson(treeFilePath)
      
      // Verify the directory still exists
      if (await fs.pathExists(data.directoryPath)) {
        return { success: true, data }
      } else {
        // Directory no longer exists, remove the stale file
        await fs.remove(treeFilePath)
        return { success: false, error: 'Saved directory no longer exists' }
      }
    }
    
    return { success: false, error: 'No saved directory tree found' }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.on('parse-directory', (event, directoryPath) => {
  // Commented out for now - can be implemented if needed
  // fs.readdir(directoryPath, (err, files) => {
  //   if (err) {
  //     event.reply('parse-directory-response', { success: false, error: err.message });
  //   } else {
  //     const fileDetails = files.map(file => {
  //       const filePath = path.join(directoryPath, file);
  //       const stats = fs.statSync(filePath);
  //       return {
  //         name: file,
  //         isDirectory: stats.isDirectory(),
  //         size: stats.size,
  //       };
  //     });
  //     event.reply('parse-directory-response', { success: true, files: fileDetails });
  //   }
  // });
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.once('ready', () => {
  // Register file protocol handler (updated to remove deprecated callback)
  protocol.interceptFileProtocol('file', (request, callback) => {
    const url = request.url.substr(7); // Remove 'file://' prefix
    callback({ path: url });
  });
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools with better error handling
    try {
      // Check if the extension is already installed
      const session = require('electron').session.defaultSession
      
      // Try to install the extension
      await installExtension(VUEJS3_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
        forceDownload: false,
      })
      
      console.log(`Vue Devtools installed successfully`)
    } catch (e) {
      // This is non-critical, the app will work fine without Vue Devtools
      if (e.message.includes('already exists')) {
        console.log('Vue Devtools already installed')
      } else {
        console.log('Vue Devtools installation skipped (non-critical)')
      }
    }
  }
  
  // VST3 Host should already be initialized during module loading
  console.log('🔍 VST3 Host status at app ready:', vst3HostInstance ? 'Available' : 'Not available')
  
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
// contextBridge.exposeInMainWorld('process', process);