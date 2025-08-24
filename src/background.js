'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { join } from 'path'
import { fileURLToPath } from 'url'

const fs = require('fs-extra')
const isDevelopment = process.env.NODE_ENV !== 'production'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

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
      webSecurity: false
    }
  })
  
  win.setMenu(null)
  
  if (isDevelopment) {
    // Load the Vite dev server URL
    await win.loadURL('http://localhost:8080')
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    // Load the built files
    await win.loadFile('dist/index.html')
  }
}

// IPC handlers
ipcMain.on('load-video', (event, filePath) => {
  const videoBuffer = fs.readFileSync(filePath)
  const videoURL = URL.createObjectURL(new Blob([videoBuffer]))
  event.reply('video-loaded', videoURL)
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
app.once('ready-to-show', () => {
  protocol.interceptFileProtocol('file', (request, callback) => {
    const filePath = request.url.replace('app://', '');
    const url = request.url.includes('img/') ? filePath.normalize(`${__dirname}/${filePath}`) : filePath;

    callback({ path: url });
  }, err => {
    if (err) console.error('Failed to register protocol');
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
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
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