'use strict'

import { app, protocol, BrowserWindow, crashReporter, ipcMain } from 'electron'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Import modular IPC handlers
import { registerAllIPCHandlers } from './ipc/index.js'

// Treat the app as development when NODE_ENV !== 'production' and the
// Electron app is not packaged. This prevents dev-only behavior (like
// opening DevTools or installing dev extensions) in production builds
// where NODE_ENV might not be set to 'production'.
const isDevelopment = (process.env.NODE_ENV !== 'production') && !app.isPackaged

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

// VST3 Support Removed - was causing startup delays and quit issues

// Register schemes before app ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
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
      webSecurity: isDevelopment ? false : true, // Enable webSecurity in production
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      backgroundThrottling: false, // Prevent background throttling
      sandbox: false,
      // CRITICAL: Use consistent partition for localStorage across dev/prod
      partition: 'persist:guitarapp'
    }
  })
  win.maximize()
  win.setMenu(null)
  
  // Configure session to reduce cache errors and enable fullscreen
  const session = win.webContents.session
  if (isDevelopment) {
    session.setPermissionRequestHandler(() => true)
    // REMOVED: session.clearCache() - This was clearing localStorage on every restart!
    // Only clear cache if explicitly needed for debugging
    console.log('📁 localStorage will persist in:', app.getPath('userData'))
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
    if (isDevelopment && !process.env.IS_TEST) {
      try {
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
      } catch (e) {
        // If DevTools cannot be opened (e.g., in packaged app), ignore silently
      }
    }
  } else {
    // Load the built files
    const indexPath = join(__dirname, '../dist/index.html')
    await win.loadFile(indexPath)
    // Remove DevTools opening in production for security
    // win.webContents.openDevTools()
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

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.once('ready', () => {
  // Register file protocol handler using fileURLToPath so file:// URLs
  // are converted to correct OS file paths (handles Windows drive letters
  // and percent-encoded characters like spaces).
  protocol.interceptFileProtocol('file', (request, callback) => {
    try {
      const filePath = fileURLToPath(request.url)
      callback({ path: filePath })
    } catch (err) {
      console.error('Failed to resolve file URL for protocol handler:', request.url, err)
      // Let the request fail with FILE_NOT_FOUND
      callback({ error: -6 })
    }
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
  console.log('🚀 App starting...')
  console.log('📁 User data directory:', app.getPath('userData'))
  console.log('📁 App data directory:', app.getPath('appData'))
  console.log('💾 localStorage will be stored in the user data directory')
  
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools with better error handling (dev only)
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
      if (e && e.message && e.message.includes('already exists')) {
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