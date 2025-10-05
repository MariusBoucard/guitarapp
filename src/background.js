'use strict'

import { app, protocol, BrowserWindow, crashReporter } from 'electron'
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

// VST3 Host Integration
let VST3HostWrapper = null
let EditorHostBridgeWrapper = null
let vst3HostInstance = null
let editorHostBridgeInstance = null

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
}

// Register all IPC handlers using modular approach
registerAllIPCHandlers(vst3HostInstance, editorHostBridgeInstance)

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