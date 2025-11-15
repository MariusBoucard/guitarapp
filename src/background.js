'use strict'

import { app, protocol, BrowserWindow, crashReporter, ipcMain, net } from 'electron'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { join, dirname, basename,extname } from 'path'
import { Readable} from 'stream'
import mime from 'mime-types'
import { fileURLToPath, pathToFileURL  } from 'url'
import * as url from 'url'
import fs from 'fs-extra' 

// Import modular IPC handlers
import { registerAllIPCHandlers } from './ipc/index.js'

// Treat the app as development when NODE_ENV !== 'production' and the
// Electron app is not packaged. This prevents dev-only behavior (like
// opening DevTools or installing dev extensions) in production builds
// where NODE_ENV might not be set to 'production'.
const isDevelopment = process.env.NODE_ENV !== 'production' && !app.isPackaged

app.commandLine.appendSwitch('disable-crash-reporter')
app.commandLine.appendSwitch('disable-crashpad')

try {
  crashReporter.start({
    productName: 'NeckWanker',
    companyName: 'Guitar App',
    submitURL: '',
    uploadToServer: false,
    collectParameters: false,
    crashesDirectory: '',
    extra: {},
  })
} catch (error) {}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
    {
    scheme: 'video-stream',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true
    }
  }
])

// Track app quit state
let isQuitting = false

// Set app name for consistent userData path
app.setName('GuitarApp')

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
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      backgroundThrottling: false,
      sandbox: false,
      partition: 'persist:guitarapp',
    },
  })
  win.maximize()
  win.setMenu(null)

  const session = win.webContents.session

  session.setPermissionRequestHandler(() => true)
  console.log('📁 localStorage will persist in:', app.getPath('userData'))

  session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'fullscreen') {
      callback(true)
      return
    }
    callback(true)
  })

session.protocol.handle('video-stream', (request) => {
  const schemePrefixLength = 'video-stream://'.length;
  const urlPath = request.url.slice(schemePrefixLength).replace(/\/$/, '');
  
  try {
    let decodedPath = Buffer.from(urlPath, 'hex').toString('utf-8');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🟢 SESSION HANDLER CALLED');
    console.log('📝 Decoded Path:', decodedPath);
    
    if (!fs.existsSync(decodedPath)) {
      console.error('❌ FILE DOES NOT EXIST:', decodedPath);
      return new Response('File not found', { status: 404 });
    }
    
    console.log('✅ File exists, converting to file URL...');
    
    // Use pathToFileURL (imported at the top)
    const fileUrl = pathToFileURL(decodedPath).href;
    
    console.log('📝 File URL:', fileUrl);
    console.log('🚀 Calling net.fetch...');
    
    return net.fetch(fileUrl);
  } catch (err) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ SESSION PROTOCOL FAILED');
    console.error('❌ Error:', err);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return new Response('Internal server error', { status: 500 });
  }
});
  if (isDevelopment) {
    try {
      await win.loadURL('http://localhost:8080')
    } catch (error) {
      console.error('Failed to load development URL:', error)
      const indexPath = join(__dirname, '../dist/index.html')
      await win.loadFile(indexPath)
    }
  } else {
    // Load the built files
    const indexPath = join(__dirname, '../dist/index.html')
    await win.loadFile(indexPath)
  }

  if (true) {
    try {
      win.webContents.openDevTools()

      win.webContents.on('devtools-opened', () => {
        win.webContents.devToolsWebContents
          ?.executeJavaScript(
            `
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
          `
          )
          .catch(() => {
            // Ignore errors from DevTools JavaScript execution
          })
      })
    } catch (e) {
      console.log('pas cool')
      // If DevTools cannot be opened (e.g., in packaged app), ignore silently
    }
  }

  // Intercept window close to save data before quit
  win.on('close', async (event) => {
    if (!isQuitting) {
      event.preventDefault()
      isQuitting = true

      console.log('📦 Window closing - requesting data save...')

      // Send save request to renderer
      win.webContents.send('app-before-quit')

      // Wait briefly for renderer to save, then close
      setTimeout(() => {
        console.log('🚪 Closing application...')
        win.destroy()
        app.quit()
      }, 500) // Short delay to allow save to complete
    }
  })

  return win
}

// Register all IPC handlers using modular approach
registerAllIPCHandlers()

// Handle save-complete message from renderer (optional confirmation)
ipcMain.handle('app-save-complete', async () => {
  console.log('📥 Save-complete signal from renderer')
  return { success: true }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.whenReady().then(async () => {
  console.log('🚀 App starting...')
  console.log('📁 User data directory:', app.getPath('userData'))
  console.log('📁 App data directory:', app.getPath('appData'))
  console.log('💾 localStorage will be stored in the user data directory')

    protocol.interceptFileProtocol('file', (request, callback) => {
    try {
      const filePath = fileURLToPath(request.url)
      callback({ path: filePath })
    } catch (err) {
      console.error('Failed to resolve file URL for protocol handler:', request.url, err)
      callback({ error: -6 })
    }
  })
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      const session = require('electron').session.defaultSession

      await installExtension(VUEJS3_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
        forceDownload: false,
      })

      console.log(`Vue Devtools installed successfully`)
    } catch (e) {
      if (e && e.message && e.message.includes('already exists')) {
        console.log('Vue Devtools already installed')
      } else {
        console.log('Vue Devtools installation skipped (non-critical)')
      }
    }
  }

  createWindow()
})


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
