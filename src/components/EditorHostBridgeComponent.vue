<template>
  <div class="editor-host-bridge-container">
    <div class="bridge-header">
      <h2>🎛️ EditorHost Bridge</h2>
      <p class="bridge-subtitle">Embed VST3 plugin UIs using external EditorHost</p>
    </div>

    <!-- Status Section -->
    <div class="bridge-section">
      <h3>🔗 Bridge Status</h3>
      <div class="status-grid">
        <div class="status-item" :class="{ active: bridgeAvailable }">
          <span class="status-icon">{{ bridgeAvailable ? '✅' : '❌' }}</span>
          <span class="status-text">Bridge Available</span>
        </div>
        <div class="status-item" :class="{ active: editorHostRunning }">
          <span class="status-icon">{{ editorHostRunning ? '✅' : '⚠️' }}</span>
          <span class="status-text">EditorHost Running</span>
        </div>
        <div class="status-item" :class="{ active: windowEmbedded }">
          <span class="status-icon">{{ windowEmbedded ? '🔗' : '🔓' }}</span>
          <span class="status-text">Window Embedded</span>
        </div>
      </div>
    </div>

    <!-- EditorHost Configuration -->
    <div class="bridge-section">
      <h3>⚙️ EditorHost Configuration</h3>
      <div class="config-group">
        <label for="editorHostPath">EditorHost Executable Path:</label>
        <div class="path-input-group">
          <input 
            id="editorHostPath"
            v-model="editorHostPath" 
            type="text" 
            placeholder="Path to VST3PluginTestHost.exe or similar"
            :disabled="editorHostRunning"
          />
          <button 
            @click="browseEditorHost" 
            :disabled="editorHostRunning"
            class="browse-button"
          >
            📂 Browse
          </button>
        </div>
        <button 
          @click="setEditorHostPath" 
          :disabled="!editorHostPath || editorHostRunning"
          class="action-button"
        >
          Set Path
        </button>
      </div>
    </div>

    <!-- EditorHost Control -->
    <div class="bridge-section">
      <h3>🎮 EditorHost Control</h3>
      <div class="control-buttons">
        <button 
          @click="launchEditorHost" 
          :disabled="!bridgeAvailable || editorHostRunning || !editorHostPath"
          class="action-button launch"
        >
          🚀 Launch EditorHost
        </button>
        <button 
          @click="closeEditorHost" 
          :disabled="!bridgeAvailable || !editorHostRunning"
          class="action-button close"
        >
          🛑 Close EditorHost
        </button>
      </div>
    </div>

    <!-- Plugin Loading -->
    <div class="bridge-section" v-if="editorHostRunning">
      <h3>🔌 Plugin Management</h3>
      <div class="plugin-controls">
        <div class="plugin-input-group">
          <input 
            v-model="selectedPluginPath" 
            type="text" 
            placeholder="VST3 Plugin Path"
            readonly
          />
          <button @click="browsePlugin" class="browse-button">
            📂 Browse Plugin
          </button>
        </div>
        <button 
          @click="loadPluginInEditorHost" 
          :disabled="!selectedPluginPath"
          class="action-button"
        >
          Load Plugin in EditorHost
        </button>
      </div>
    </div>

    <!-- Window Embedding -->
    <div class="bridge-section" v-if="editorHostRunning">
      <h3>🖼️ Window Embedding</h3>
      <div class="embed-controls">
        <div class="embed-container" ref="embedContainer">
          <div v-if="!windowEmbedded" class="embed-placeholder">
            <p>Click "Embed Window" to embed the EditorHost UI here</p>
            <button @click="embedWindow" class="action-button embed">
              🔗 Embed Window
            </button>
          </div>
          <div v-else class="embedded-info">
            <p>✅ EditorHost window is embedded</p>
            <button @click="detachWindow" class="action-button detach">
              🔓 Detach Window
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Window Info -->
    <div class="bridge-section" v-if="editorHostRunning">
      <h3>📊 Window Information</h3>
      <div class="window-info">
        <div class="info-item">
          <strong>Process ID:</strong> {{ windowInfo.processId || 'N/A' }}
        </div>
        <div class="info-item">
          <strong>Is Running:</strong> {{ windowInfo.isRunning ? 'Yes' : 'No' }}
        </div>
        <div class="info-item">
          <strong>Is Embedded:</strong> {{ windowInfo.isEmbedded ? 'Yes' : 'No' }}
        </div>
        <div class="info-item">
          <strong>Has Window:</strong> {{ windowInfo.hasWindow ? 'Yes' : 'No' }}
        </div>
        <div v-if="windowInfo.windowRect" class="info-item">
          <strong>Window Size:</strong> {{ windowInfo.windowRect.width }}x{{ windowInfo.windowRect.height }}
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="errorMessage" class="error-section">
      <h3>❌ Error</h3>
      <p class="error-message">{{ errorMessage }}</p>
      <button @click="clearError" class="action-button">Clear</button>
    </div>

    <!-- Success Messages -->
    <div v-if="successMessage" class="success-section">
      <h3>✅ Success</h3>
      <p class="success-message">{{ successMessage }}</p>
      <button @click="clearSuccess" class="action-button">Clear</button>
    </div>

    <!-- Debug Log -->
    <div class="bridge-section">
      <h3>🐛 Debug Log</h3>
      <div class="debug-log">
        <div v-for="(log, index) in debugLog" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <button @click="clearLog" class="action-button">Clear Log</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'

// Reactive state
const bridgeAvailable = ref(false)
const editorHostRunning = ref(false)
const windowEmbedded = ref(false)
const editorHostPath = ref('C:\\Program Files\\Steinberg\\VST3PluginTestHost\\VST3PluginTestHost.exe')
const selectedPluginPath = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const debugLog = ref([])
const embedContainer = ref(null)

const windowInfo = reactive({
  processId: null,
  isRunning: false,
  isEmbedded: false,
  hasWindow: false,
  windowRect: null
})

// Utility functions
const log = (message) => {
  const timestamp = new Date().toLocaleTimeString()
  debugLog.value.unshift({
    time: timestamp,
    message: message
  })
  
  // Keep only last 50 log entries
  if (debugLog.value.length > 50) {
    debugLog.value = debugLog.value.slice(0, 50)
  }
}

const showError = (message) => {
  errorMessage.value = message
  log(`❌ Error: ${message}`)
}

const showSuccess = (message) => {
  successMessage.value = message
  log(`✅ Success: ${message}`)
}

const clearError = () => {
  errorMessage.value = ''
}

const clearSuccess = () => {
  successMessage.value = ''
}

const clearLog = () => {
  debugLog.value = []
}

// EditorHost Bridge functions
const checkAvailability = async () => {
  try {
    if (window.electronAPI?.editorHost?.checkAvailability) {
      const result = await window.electronAPI.editorHost.checkAvailability()
      bridgeAvailable.value = result.available
      editorHostRunning.value = result.isRunning
      log(`Bridge availability: ${result.available ? 'Available' : 'Not available'}`)
      return result.available
    }
    return false
  } catch (error) {
    showError(`Failed to check bridge availability: ${error.message}`)
    return false
  }
}

const setEditorHostPath = async () => {
  try {
    const result = await window.electronAPI.editorHost.setPath(editorHostPath.value)
    if (result.success) {
      showSuccess('EditorHost path set successfully')
    } else {
      showError(result.error || 'Failed to set EditorHost path')
    }
  } catch (error) {
    showError(`Failed to set EditorHost path: ${error.message}`)
  }
}

const launchEditorHost = async () => {
  try {
    clearError()
    clearSuccess()
    log('Launching EditorHost...')
    
    const result = await window.electronAPI.editorHost.launch()
    if (result.success) {
      showSuccess('EditorHost launched successfully')
      editorHostRunning.value = true
      // Start monitoring window info
      setTimeout(updateWindowInfo, 1000)
    } else {
      showError(result.error || 'Failed to launch EditorHost')
    }
  } catch (error) {
    showError(`Failed to launch EditorHost: ${error.message}`)
  }
}

const closeEditorHost = async () => {
  try {
    log('Closing EditorHost...')
    
    const result = await window.electronAPI.editorHost.close()
    if (result.success) {
      showSuccess('EditorHost closed successfully')
      editorHostRunning.value = false
      windowEmbedded.value = false
    } else {
      showError(result.error || 'Failed to close EditorHost')
    }
  } catch (error) {
    showError(`Failed to close EditorHost: ${error.message}`)
  }
}

const loadPluginInEditorHost = async () => {
  try {
    log(`Loading plugin: ${selectedPluginPath.value}`)
    
    const result = await window.electronAPI.editorHost.loadPlugin(selectedPluginPath.value)
    if (result.success) {
      showSuccess(`Plugin load command sent: ${selectedPluginPath.value}`)
      log('Note: Manual plugin loading may be required in EditorHost UI')
    } else {
      showError(result.error || 'Failed to load plugin')
    }
  } catch (error) {
    showError(`Failed to load plugin: ${error.message}`)
  }
}

const embedWindow = async () => {
  try {
    log('Getting browser window handle...')
    
    // Get the browser window handle
    const handleResult = await window.electronAPI.editorHost.getBrowserWindowHandle()
    if (!handleResult.success) {
      showError('Failed to get browser window handle')
      return
    }
    
    log(`Browser window handle: ${handleResult.handle}`)
    
    // Embed the EditorHost window
    const result = await window.electronAPI.editorHost.embedWindow(handleResult.handle)
    if (result.success) {
      showSuccess('EditorHost window embedded successfully')
      windowEmbedded.value = true
      updateWindowInfo()
    } else {
      showError(result.error || 'Failed to embed window')
    }
  } catch (error) {
    showError(`Failed to embed window: ${error.message}`)
  }
}

const detachWindow = async () => {
  try {
    log('Detaching EditorHost window...')
    
    const result = await window.electronAPI.editorHost.detachWindow()
    if (result.success) {
      showSuccess('EditorHost window detached successfully')
      windowEmbedded.value = false
      updateWindowInfo()
    } else {
      showError(result.error || 'Failed to detach window')
    }
  } catch (error) {
    showError(`Failed to detach window: ${error.message}`)
  }
}

const updateWindowInfo = async () => {
  try {
    const info = await window.electronAPI.editorHost.getWindowInfo()
    Object.assign(windowInfo, info)
    
    editorHostRunning.value = info.isRunning
    windowEmbedded.value = info.isEmbedded
  } catch (error) {
    log(`Failed to update window info: ${error.message}`)
  }
}

const browseEditorHost = async () => {
  try {
    if (window.electronAPI?.selectVst3Plugin) {
      const result = await window.electronAPI.selectVst3Plugin()
      if (result.success && result.filePath) {
        editorHostPath.value = result.filePath
      }
    }
  } catch (error) {
    showError(`Failed to browse for EditorHost: ${error.message}`)
  }
}

const browsePlugin = async () => {
  try {
    if (window.electronAPI?.selectVst3Plugin) {
      const result = await window.electronAPI.selectVst3Plugin()
      if (result.success && result.filePath) {
        selectedPluginPath.value = result.filePath
      }
    }
  } catch (error) {
    showError(`Failed to browse for plugin: ${error.message}`)
  }
}

// Lifecycle
onMounted(async () => {
  log('EditorHost Bridge component mounted')
  await checkAvailability()
  
  // Start monitoring interval
  const interval = setInterval(updateWindowInfo, 2000)
  
  onUnmounted(() => {
    clearInterval(interval)
    log('EditorHost Bridge component unmounted')
  })
})
</script>

<style scoped>
.editor-host-bridge-container {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  font-family: 'Consolas', 'Courier New', monospace;
  min-height: 100vh;
}

.bridge-header {
  text-align: center;
  margin-bottom: 30px;
}

.bridge-header h2 {
  color: #00d4ff;
  font-size: 2.2em;
  margin-bottom: 10px;
}

.bridge-subtitle {
  color: #a0a0a0;
  font-size: 1.1em;
}

.bridge-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #444;
}

.bridge-section h3 {
  color: #00ff88;
  margin-bottom: 15px;
  font-size: 1.4em;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 4px solid #666;
}

.status-item.active {
  border-left-color: #00ff88;
}

.status-icon {
  margin-right: 10px;
  font-size: 1.2em;
}

.config-group {
  margin-bottom: 15px;
}

.config-group label {
  display: block;
  margin-bottom: 5px;
  color: #00d4ff;
}

.path-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.path-input-group input {
  flex: 1;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
}

.browse-button, .action-button {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(45deg, #00d4ff, #0099cc);
  color: #fff;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.browse-button:hover, .action-button:hover {
  background: linear-gradient(45deg, #0099cc, #00d4ff);
  transform: translateY(-1px);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.control-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-button.launch {
  background: linear-gradient(45deg, #00ff88, #00cc6a);
}

.action-button.close {
  background: linear-gradient(45deg, #ff4444, #cc3333);
}

.action-button.embed {
  background: linear-gradient(45deg, #ffaa00, #cc8800);
}

.action-button.detach {
  background: linear-gradient(45deg, #ff6600, #cc5500);
}

.plugin-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.plugin-input-group input {
  flex: 1;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
}

.embed-container {
  min-height: 400px;
  border: 2px dashed #444;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.embed-placeholder {
  text-align: center;
}

.embedded-info {
  text-align: center;
}

.window-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.info-item {
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.error-section {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.error-message {
  color: #ff6666;
  margin-bottom: 10px;
}

.success-section {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.success-message {
  color: #00ff88;
  margin-bottom: 10px;
}

.debug-log {
  max-height: 200px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.log-entry {
  display: flex;
  margin-bottom: 5px;
}

.log-time {
  color: #888;
  margin-right: 10px;
  flex-shrink: 0;
}

.log-message {
  color: #fff;
}
</style>
