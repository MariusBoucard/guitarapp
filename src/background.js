'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const fs = require('fs-extra')
const isDevelopment = process.env.NODE_ENV !== 'production'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Register schemes before app ready
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
      preload: join(__dirname, '../public/preload.js'),
      webSecurity: isDevelopment ? false : true // Only disable in development
    }
  })
  
  win.setMenu(null)
  
  if (isDevelopment) {
    // Load the Vite dev server URL - updated port to match your logs
    await win.loadURL('http://localhost:8081')
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    // Load the built files
    await win.loadFile('dist/index.html')
  }
  
  return win
}

// IPC handlers
ipcMain.on('load-video', (event, filePath) => {
  try {
    const videoBuffer = fs.readFileSync(filePath)
    const videoURL = URL.createObjectURL(new Blob([videoBuffer]))
    event.reply('video-loaded', videoURL)
  } catch (error) {
    console.error('Error loading video:', error)
    event.reply('video-load-error', error.message)
  }
})

ipcMain.handle('select-audio-file', async () => {
  try {
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
  } catch (error) {
    console.error('Error selecting audio file:', error)
    return null
  }
})

ipcMain.handle('select-video-file', async () => {
  try {
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
  } catch (error) {
    console.error('Error selecting video file:', error)
    return null
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  // Set up protocol handling
  protocol.handle('app', (request) => {
    const filePath = request.url.slice('app://'.length)
    return net.fetch(`file://${join(__dirname, '../public', filePath)}`)
  })

  // Install Vue Devtools only in development
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      // Use the newer session API
      const { session } = require('electron')
      const path = require('path')
      
      // Check if Vue Devtools is already installed
      const extensions = session.defaultSession.getAllExtensions()
      const vueDevtoolsId = 'nhdogjmejiglipccpnnnanhbledajbpd'
      
      if (!extensions[vueDevtoolsId]) {
        // Try to install Vue Devtools
        const { default: installExtension, VUEJS3_DEVTOOLS } = await import('electron-devtools-installer')
        await installExtension(VUEJS3_DEVTOOLS)
        console.log('Vue Devtools installed successfully')
      }
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
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