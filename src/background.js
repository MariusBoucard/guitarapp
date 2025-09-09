'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { join, extname, basename, dirname } from 'path'
import { fileURLToPath } from 'url'
import { homedir } from 'os'
import fs from 'fs-extra'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

// VST3 Plugin UI Management
let pluginUIWindows = new Map()

ipcMain.handle('show-vst3-plugin-ui', async (event, pluginData) => {
  try {
    const { pluginPath, pluginName } = pluginData
    
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
    
    // Create new plugin UI window
    const pluginWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: `${pluginName} - VST3 Plugin UI`,
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
    
    // For now, load a placeholder page that shows plugin info
    // In a real implementation, this would embed the native VST3 UI
    const pluginUIHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${pluginName} UI</title>
        <style>
          body {
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            color: #fff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
            text-align: center;
            max-width: 600px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 1px solid #444;
          }
          h1 {
            color: #00ff88;
            margin-bottom: 20px;
            font-size: 2em;
          }
          .plugin-info {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .status {
            color: #ffaa00;
            font-weight: bold;
            font-size: 1.2em;
            margin: 20px 0;
          }
          .path {
            word-break: break-all;
            color: #ccc;
            font-size: 0.9em;
            margin: 10px 0;
          }
          .note {
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
          <h1>🎹 ${pluginName}</h1>
          <div class="plugin-info">
            <div class="path"><strong>Plugin Path:</strong><br>${pluginPath}</div>
          </div>
          <div class="status">Plugin UI Window Active</div>
          <div class="note">
            <strong>⚠️ Native UI Integration Required</strong><br>
            This window represents where the native VST3 plugin UI would be embedded.
            Real VST3 UI integration requires:
            <ul style="text-align: left; margin-top: 10px;">
              <li>VST3 SDK integration</li>
              <li>Native C++ host implementation</li>
              <li>Platform-specific UI embedding</li>
              <li>Audio driver integration (ASIO/Core Audio)</li>
            </ul>
          </div>
        </div>
        <script>
          // Simulate plugin activity
          let dots = 0;
          setInterval(() => {
            dots = (dots + 1) % 4;
            document.title = '${pluginName} - VST3 Plugin UI' + '.'.repeat(dots);
          }, 500);
        </script>
      </body>
      </html>
    `
    
    // Load the HTML content
    pluginWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(pluginUIHTML)}`)
    
    // Store window reference
    pluginUIWindows.set(pluginPath, pluginWindow)
    
    // Clean up when window is closed
    pluginWindow.on('closed', () => {
      pluginUIWindows.delete(pluginPath)
    })
    
    return { 
      success: true, 
      message: `Plugin UI window opened for ${pluginName}`,
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