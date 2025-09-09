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
  
  // Configure session to reduce cache errors
  const session = win.webContents.session
  if (isDevelopment) {
    session.setPermissionRequestHandler(() => true)
    session.clearCache() // Clear cache on startup in dev mode
  }
  
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
      // Suppress deprecation warnings temporarily
      const originalEmit = process.emit
      process.emit = function (name, data, ...args) {
        if (name === 'warning' && data.name === 'DeprecationWarning' && 
            data.message.includes('session.')) {
          return
        }
        return originalEmit.apply(process, arguments)
      }
      
      const extensionName = await installExtension(VUEJS3_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
        forceDownload: false,
      })
      
      // Restore original emit
      process.emit = originalEmit
      
      console.log(`Vue Devtools installed successfully`)
    } catch (e) {
      console.warn('Vue Devtools installation failed (this is non-critical):', e.message)
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