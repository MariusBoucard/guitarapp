<template>
  <div class="vst3-plugin-container">
    <div class="vst3-header">
      <h2>🎛️ VST3 Plugin Manager</h2>
      <p class="vst3-subtitle">Load and control VST3 audio plugins</p>
    </div>

    <!-- Audio Configuration Section -->
    <div class="vst3-section">
      <h3>🔊 Audio Configuration</h3>
      <div class="audio-config" :class="{ 'config-complete': isAudioInitialized }">
        <div class="audio-status">
          <div class="status-indicator" :class="{ active: isAudioInitialized }">
            <span class="status-icon">{{ isAudioInitialized ? '✅' : '⚠️' }}</span>
            <span class="status-text">
              {{ isAudioInitialized ? 'Audio System Ready' : 'Audio System Not Initialized' }}
            </span>
          </div>
          <p class="status-description">
            {{ isAudioInitialized 
              ? 'VST3 plugins can now be loaded with proper audio configuration' 
              : 'Configure and initialize audio settings before loading plugins for optimal performance' }}
          </p>
        </div>

        <!-- Audio Configuration Grid -->
        <div class="audio-config-grid">
          <div class="config-group">
            <h4>Sample Rate</h4>
            <select v-model="audioConfig.sampleRate" :disabled="isAudioInitialized">
              <option value="44100">44.1 kHz (CD Quality)</option>
              <option value="48000">48 kHz (Professional)</option>
              <option value="88200">88.2 kHz (High Quality)</option>
              <option value="96000">96 kHz (Studio)</option>
              <option value="192000">192 kHz (Ultra High)</option>
            </select>
          </div>

          <div class="config-group">
            <h4>Buffer Size</h4>
            <select v-model="audioConfig.bufferSize" :disabled="isAudioInitialized">
              <option value="64">64 samples (Low Latency)</option>
              <option value="128">128 samples (Balanced)</option>
              <option value="256">256 samples (Standard)</option>
              <option value="512">512 samples (Stable)</option>
              <option value="1024">1024 samples (High Latency)</option>
            </select>
          </div>

          <div class="config-group">
            <h4>Input Channels</h4>
            <select v-model="audioConfig.inputChannels" :disabled="isAudioInitialized">
              <option value="1">Mono (1 channel)</option>
              <option value="2">Stereo (2 channels)</option>
              <option value="4">Quad (4 channels)</option>
              <option value="8">Surround (8 channels)</option>
            </select>
          </div>

          <div class="config-group">
            <h4>Output Channels</h4>
            <select v-model="audioConfig.outputChannels" :disabled="isAudioInitialized">
              <option value="1">Mono (1 channel)</option>
              <option value="2">Stereo (2 channels)</option>
              <option value="4">Quad (4 channels)</option>
              <option value="8">Surround (8 channels)</option>
            </select>
          </div>

          <div class="config-group">
            <h4>Input Device</h4>
            <select v-model="audioConfig.inputDevice" :disabled="isAudioInitialized">
              <option value="">Default Input Device</option>
              <option 
                v-for="device in availableInputDevices" 
                :key="device.deviceId" 
                :value="device.deviceId"
              >
                {{ device.label }}
              </option>
            </select>
          </div>

          <div class="config-group">
            <h4>Output Device</h4>
            <select v-model="audioConfig.outputDevice" :disabled="isAudioInitialized">
              <option value="">Default Output Device</option>
              <option 
                v-for="device in availableOutputDevices" 
                :key="device.deviceId" 
                :value="device.deviceId"
              >
                {{ device.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Audio Configuration Controls -->
        <div class="audio-config-controls">
          <button 
            class="initialize-audio-btn"
            @click="initializeAudioHost"
            :disabled="isInitializingAudio || isAudioInitialized"
            :class="{ 'initializing': isInitializingAudio }"
          >
            <span class="btn-icon">{{ isInitializingAudio ? '⏳' : '🎵' }}</span>
            {{ isInitializingAudio ? 'Initializing Audio...' : 'Initialize Audio Host' }}
          </button>

          <button 
            v-if="isAudioInitialized"
            class="reset-audio-btn"
            @click="resetAudioHost"
          >
            <span class="btn-icon">🔄</span>
            Reset Audio Configuration
          </button>
        </div>

        <!-- Audio Configuration Info -->
        <div v-if="isAudioInitialized" class="audio-config-info">
          <h4>Current Audio Configuration</h4>
          <div class="config-info-grid">
            <div class="config-info-item">
              <span class="config-label">Sample Rate:</span>
              <span class="config-value">{{ audioConfig.sampleRate }} Hz</span>
            </div>
            <div class="config-info-item">
              <span class="config-label">Buffer Size:</span>
              <span class="config-value">{{ audioConfig.bufferSize }} samples</span>
            </div>
            <div class="config-info-item">
              <span class="config-label">Latency:</span>
              <span class="config-value">{{ calculatedLatency }} ms</span>
            </div>
            <div class="config-info-item">
              <span class="config-label">Channels:</span>
              <span class="config-value">{{ audioConfig.inputChannels }}→{{ audioConfig.outputChannels }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Plugin Loader Section -->
    <div class="vst3-section">
      <h3>Plugin Loader</h3>
      <div class="plugin-loader">
        <div v-if="!isAudioInitialized" class="audio-warning">
          <span class="warning-icon">⚠️</span>
          <span class="warning-text">
            Initialize audio configuration first for optimal plugin performance
          </span>
        </div>
        
        <button 
          class="load-plugin-btn"
          @click="selectVST3Plugin"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Loading...' : '📁 Load VST3 Plugin' }}
        </button>
        
        <div v-if="currentPlugin" class="plugin-info">
          <div class="plugin-details">
            <h4>{{ currentPlugin.name }}</h4>
            <p><strong>Version:</strong> {{ currentPlugin.version }}</p>
            <p><strong>Vendor:</strong> {{ currentPlugin.vendor }}</p>
            <p><strong>Category:</strong> {{ currentPlugin.category }}</p>
            <p><strong>Path:</strong> <span class="plugin-path">{{ currentPlugin.path }}</span></p>
          </div>
          <div class="native-ui-notice">
            <div class="notice-content">
              <span class="notice-icon">🖥️</span>
              <div class="notice-text">
                <strong>Native UI Available</strong>
                <p>Click "Show Native UI" to open the plugin's interface in a separate window</p>
              </div>
            </div>
          </div>
          <button 
            class="unload-plugin-btn"
            @click="unloadPlugin"
          >
            🗑️ Unload Plugin
          </button>
        </div>
      </div>
    </div>

    <!-- Audio Input/Output Section -->
    <div class="vst3-section" v-if="currentPlugin">
      <h3>Audio I/O</h3>
      <div class="audio-io">
        <div class="audio-input">
          <h4>Input</h4>
          <select v-model="selectedInputDevice" @change="updateAudioInput">
            <option value="">Select Input Device</option>
            <option 
              v-for="device in inputDevices" 
              :key="device.deviceId" 
              :value="device.deviceId"
            >
              {{ device.label }}
            </option>
          </select>
          <div class="input-level">
            <span>Level:</span>
            <div class="level-meter">
              <div 
                class="level-bar" 
                :style="{ width: inputLevel + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="audio-output">
          <h4>Output</h4>
          <select v-model="selectedOutputDevice" @change="updateAudioOutput">
            <option value="">Select Output Device</option>
            <option 
              v-for="device in outputDevices" 
              :key="device.deviceId" 
              :value="device.deviceId"
            >
              {{ device.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Plugin Controls Section -->
    <div class="vst3-section" v-if="currentPlugin">
      <h3>Plugin Controls</h3>
      <div class="plugin-controls">
        <div class="transport-controls">
          <button 
            class="control-btn"
            :class="{ active: isProcessing }"
            @click="toggleProcessing"
          >
            {{ isProcessing ? '⏸️ Stop' : '▶️ Start' }}
          </button>
          <button 
            class="control-btn"
            @click="showPluginUI"
            :disabled="!currentPlugin.hasUI"
            title="Opens plugin UI in separate window"
          >
            🖥️ Show Native UI
          </button>
        </div>

        <!-- Parameter Controls -->
        <div class="parameter-controls" v-if="pluginParameters.length > 0">
          <h4>Parameters</h4>
          <div class="parameters-grid">
            <div 
              v-for="param in pluginParameters" 
              :key="param.id"
              class="parameter-control"
            >
              <label>{{ param.name }}</label>
              <input 
                type="range"
                :min="param.min"
                :max="param.max"
                :step="param.step"
                :value="param.value"
                @input="updateParameter(param.id, $event.target.value)"
                class="parameter-slider"
              >
              <span class="parameter-value">
                {{ formatParameterValue(param) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Presets Section -->
    <div class="vst3-section" v-if="currentPlugin">
      <h3>Presets</h3>
      <div class="presets-section">
        <div class="preset-controls">
          <select v-model="selectedPreset" @change="loadPreset">
            <option value="">Select Preset</option>
            <option 
              v-for="preset in presets" 
              :key="preset.id" 
              :value="preset.id"
            >
              {{ preset.name }}
            </option>
          </select>
          <button 
            class="control-btn"
            @click="saveCurrentPreset"
          >
            💾 Save Preset
          </button>
        </div>
      </div>
    </div>

    <!-- Performance Monitor -->
    <div class="vst3-section" v-if="currentPlugin">
      <h3>Performance</h3>
      <div class="performance-monitor">
        <div class="performance-metric">
          <span>CPU Usage:</span>
          <div class="cpu-meter">
            <div 
              class="cpu-bar" 
              :style="{ width: cpuUsage + '%' }"
              :class="{ 
                warning: cpuUsage > 70, 
                critical: cpuUsage > 90 
              }"
            ></div>
          </div>
          <span>{{ cpuUsage.toFixed(1) }}%</span>
        </div>
        
        <div class="performance-metric">
          <span>Latency:</span>
          <span class="latency-value">{{ latency }}ms</span>
        </div>
        
        <div class="performance-metric">
          <span>Sample Rate:</span>
          <span>{{ sampleRate }}Hz</span>
        </div>
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="errorMessage" class="error-message">
      <h4>⚠️ Error</h4>
      <p>{{ errorMessage }}</p>
      <button @click="clearError">Dismiss</button>
    </div>

    <!-- Plugin UI Modal -->
    <div v-if="showingPluginUI" class="plugin-ui-modal">
      <div class="plugin-ui-backdrop" @click="closePluginUI"></div>
      <div class="plugin-ui-window">
        <div class="plugin-ui-header">
          <h3>{{ currentPlugin?.name || 'Plugin UI' }}</h3>
          <button class="close-btn" @click="closePluginUI">✕</button>
        </div>
        <div class="plugin-ui-content">
          <div class="plugin-ui-info">
            <p><strong>Plugin:</strong> {{ currentPlugin?.name }}</p>
            <p><strong>Path:</strong> {{ currentPlugin?.path }}</p>
            <p><strong>Status:</strong> {{ isProcessing ? 'Processing' : 'Idle' }}</p>
          </div>
          
          <!-- Mock Plugin Interface -->
          <div class="mock-plugin-interface">
            <h4>Plugin Parameters</h4>
            <div class="parameter-grid">
              <div 
                v-for="param in pluginParameters" 
                :key="param.id"
                class="parameter-control"
              >
                <label>{{ param.name }}</label>
                <div class="control-wrapper">
                  <input
                    type="range"
                    :min="param.min"
                    :max="param.max"
                    :step="param.step || 0.01"
                    v-model="param.value"
                    @input="updateParameter(param)"
                    class="parameter-slider"
                  />
                  <span class="parameter-value">
                    {{ formatParameterValue(param) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Presets Section in UI -->
            <div class="ui-presets-section" v-if="presets.length > 0">
              <h4>Presets</h4>
              <div class="preset-buttons">
                <button 
                  v-for="preset in presets"
                  :key="preset.id"
                  @click="loadPreset(preset.id)"
                  :class="{ active: selectedPreset === preset.id }"
                  class="preset-btn"
                >
                  {{ preset.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'

export default {
  name: 'VST3PluginComponent',
  setup() {
    // Reactive state
    const currentPlugin = ref(null)
    const isLoading = ref(false)
    const isProcessing = ref(false)
    const errorMessage = ref('')
    
    // Audio configuration state
    const isAudioInitialized = ref(false)
    const isInitializingAudio = ref(false)
    const audioConfig = ref({
      sampleRate: 44100,
      bufferSize: 256,
      inputChannels: 2,
      outputChannels: 2,
      inputDevice: '',
      outputDevice: ''
    })
    
    // Available audio devices
    const availableInputDevices = ref([])
    const availableOutputDevices = ref([])
    
    // Legacy audio devices (for backward compatibility)
    const inputDevices = ref([])
    const outputDevices = ref([])
    const selectedInputDevice = ref('')
    const selectedOutputDevice = ref('')
    
    // Audio monitoring
    const inputLevel = ref(0)
    const cpuUsage = ref(0)
    const latency = ref(0)
    const sampleRate = ref(44100)
    
    // Plugin parameters
    const pluginParameters = ref([])
    const presets = ref([])
    const selectedPreset = ref('')
    
    // Plugin UI state
    const showingPluginUI = ref(false)
    const pluginUIData = ref(null)
    
    // Web Audio API context
    const audioContext = ref(null)
    const mediaStream = ref(null)
    const analyser = ref(null)
    const processorNode = ref(null)

    // Computed properties
    const calculatedLatency = computed(() => {
      if (!isAudioInitialized.value) return 0
      return Math.round((audioConfig.value.bufferSize / audioConfig.value.sampleRate) * 1000 * 100) / 100
    })

    // Initialize audio host with VST3 backend
    const initializeAudioHost = async () => {
      if (isInitializingAudio.value || isAudioInitialized.value) return
      
      isInitializingAudio.value = true
      errorMessage.value = ''
      
      try {
        console.log('🎵 Initializing VST3 audio host with configuration:', audioConfig.value)
        
        // Check if VST3 native is available
        if (!window.electronAPI?.vst3Native?.initializeAudio) {
          throw new Error('VST3 native audio initialization not available')
        }
        
        // Call the native VST3 audio initialization through IPC
        const result = await window.electronAPI.vst3Native.initializeAudio({
          sampleRate: parseInt(audioConfig.value.sampleRate),
          bufferSize: parseInt(audioConfig.value.bufferSize),
          inputChannels: parseInt(audioConfig.value.inputChannels),
          outputChannels: parseInt(audioConfig.value.outputChannels),
          inputDevice: audioConfig.value.inputDevice || 'default',
          outputDevice: audioConfig.value.outputDevice || 'default'
        })
        
        if (result.success) {
          isAudioInitialized.value = true
          sampleRate.value = audioConfig.value.sampleRate
          console.log('✅ VST3 audio host initialized successfully')
          console.log('🔊 Audio configuration active:', {
            sampleRate: audioConfig.value.sampleRate,
            bufferSize: audioConfig.value.bufferSize,
            latency: calculatedLatency.value + 'ms',
            channels: `${audioConfig.value.inputChannels}→${audioConfig.value.outputChannels}`
          })
        } else {
          throw new Error(result.error || 'Failed to initialize audio host')
        }
      } catch (error) {
        console.error('❌ Audio host initialization failed:', error)
        errorMessage.value = `Failed to initialize audio host: ${error.message}`
        isAudioInitialized.value = false
      } finally {
        isInitializingAudio.value = false
      }
    }

    // Reset audio host
    const resetAudioHost = async () => {
      try {
        console.log('🔄 Resetting VST3 audio host...')
        
        // Stop any current processing
        if (isProcessing.value) {
          await toggleProcessing()
        }
        
        // Unload current plugin if any
        if (currentPlugin.value) {
          await unloadPlugin()
        }
        
        // Reset audio state
        isAudioInitialized.value = false
        isInitializingAudio.value = false
        
        // Call native reset if available
        if (window.vst3Audio && window.vst3Audio.resetAudio) {
          await window.vst3Audio.resetAudio()
        }
        
        console.log('✅ Audio host reset complete')
      } catch (error) {
        console.error('❌ Failed to reset audio host:', error)
        errorMessage.value = `Failed to reset audio host: ${error.message}`
      }
    }

    // Initialize Web Audio API
    const initializeAudio = async () => {
      try {
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
        sampleRate.value = audioContext.value.sampleRate
        console.log('Audio context initialized:', audioContext.value.state)
      } catch (error) {
        console.error('Failed to initialize audio context:', error)
        errorMessage.value = 'Failed to initialize audio system'
      }
    }

    // Get available audio devices for configuration
    const getAvailableAudioDevices = async () => {
      try {
        // Request permissions first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop()) // Stop immediately after getting permission
        
        const devices = await navigator.mediaDevices.enumerateDevices()
        availableInputDevices.value = devices.filter(device => 
          device.kind === 'audioinput' && device.deviceId !== 'default'
        )
        availableOutputDevices.value = devices.filter(device => 
          device.kind === 'audiooutput' && device.deviceId !== 'default'
        )
        
        // Also update legacy device arrays for backward compatibility
        inputDevices.value = availableInputDevices.value
        outputDevices.value = availableOutputDevices.value
        
        console.log('🎵 Available audio devices found:', { 
          inputs: availableInputDevices.value.length, 
          outputs: availableOutputDevices.value.length 
        })
      } catch (error) {
        console.error('❌ Failed to enumerate audio devices:', error)
        // Continue without device enumeration - use defaults
        availableInputDevices.value = []
        availableOutputDevices.value = []
      }
    }

    // Get available audio devices
    const getAudioDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        inputDevices.value = devices.filter(device => device.kind === 'audioinput')
        outputDevices.value = devices.filter(device => device.kind === 'audiooutput')
        console.log('Audio devices found:', { 
          inputs: inputDevices.value.length, 
          outputs: outputDevices.value.length 
        })
      } catch (error) {
        console.error('Failed to enumerate audio devices:', error)
        errorMessage.value = 'Failed to access audio devices'
      }
    }

    // VST3 Plugin Selection (Electron IPC)
    const selectVST3Plugin = async () => {
      if (!window.electronAPI?.selectVst3Plugin) {
        errorMessage.value = 'VST3 plugin selection requires Electron environment'
        return
      }

      try {
        isLoading.value = true
        errorMessage.value = ''
        
        const pluginPaths = await window.electronAPI.selectVst3Plugin()
        if (pluginPaths && pluginPaths.length > 0) {
          // Load the first selected plugin with audio configuration
          await loadVST3AudioPlugin(pluginPaths[0])
          
          // If multiple plugins selected, show info
          if (pluginPaths.length > 1) {
            console.log(`Selected ${pluginPaths.length} plugins. Loading first: ${pluginPaths[0]}`)
          }
        }
      } catch (error) {
        console.error('Failed to select VST3 plugin:', error)
        errorMessage.value = 'Failed to select plugin: ' + error.message
      } finally {
        isLoading.value = false
      }
    }

    // Load VST3 Plugin
    const loadVST3AudioPlugin = async (pluginPath) => {
      try {
        console.log('🎵 Loading VST3 plugin with audio configuration:', pluginPath)
        
        // Warn if audio is not initialized
        if (!isAudioInitialized.value) {
          console.warn('⚠️ Audio host not initialized - plugin may not function optimally')
        }
        
        // Check if native VST3 host is available
        if (window.electronAPI?.vst3Native?.loadPlugin) {
          // Use native VST3 host - send just the plugin path for now
          // The background.js handler will handle the audio config integration
          const result = await window.electronAPI.vst3Native.loadPlugin(pluginPath)
          
          if (result.success) {
            console.log('✅ Native VST3 plugin loaded successfully:', result.pluginId)
            
            // Store plugin with enhanced information
            currentPlugin.value = {
              name: result.name || pluginPath.split(/[\\\/]/).pop().replace('.vst3', ''),
              version: result.version || '1.0.0',
              vendor: result.vendor || 'VST3 Plugin',
              category: result.category || 'Effect/Instrument',
              path: pluginPath,
              pluginId: result.pluginId,
              hasUI: result.hasUI !== undefined ? result.hasUI : true,
              isNative: true,
              audioConfigured: isAudioInitialized.value
            }
            
            // Update performance metrics
            if (isAudioInitialized.value) {
              latency.value = calculatedLatency.value
              sampleRate.value = audioConfig.value.sampleRate
            }
            
            console.log('🎹 Plugin loaded with configuration:', {
              name: currentPlugin.value.name,
              vendor: currentPlugin.value.vendor,
              audioConfigured: currentPlugin.value.audioConfigured,
              sampleRate: isAudioInitialized.value ? audioConfig.value.sampleRate : 'N/A'
            })
            
          } else {
            throw new Error(result.error || 'Failed to load plugin with native host')
          }
        } else {
          // Fallback to simulated plugin loading
          console.log('🔧 Native VST3 host not available, using simulation')
          
          const pluginFileName = pluginPath.split(/[\\\/]/).pop().replace('.vst3', '')
          currentPlugin.value = {
            name: pluginFileName,
            version: '1.0.0',
            vendor: 'VST3 Plugin',
            category: 'Effect/Instrument',
            path: pluginPath,
            hasUI: true,
            isNative: false,
            audioConfigured: isAudioInitialized.value
          }
        }
        
        // Simulate parameters for both native and simulated
        pluginParameters.value = [
          {
            id: 0,
            name: 'Gain',
            min: 0,
            max: 100,
            step: 1,
            value: 50,
            unit: '%'
          },
          {
            id: 1,
            name: 'Frequency',
            min: 20,
            max: 20000,
            step: 1,
            value: 1000,
            unit: 'Hz'
          },
          {
            id: 2,
            name: 'Resonance',
            min: 0,
            max: 10,
            step: 0.1,
            value: 1.0,
            unit: ''
          }
        ]
        
        // Simulate presets
        presets.value = [
          { id: 'preset1', name: 'Clean' },
          { id: 'preset2', name: 'Overdrive' },
          { id: 'preset3', name: 'Distortion' }
        ]
        
        console.log('Plugin loaded successfully')
        
      } catch (error) {
        console.error('Failed to load VST3 plugin:', error)
        errorMessage.value = 'Failed to load plugin: ' + error.message
        currentPlugin.value = null
      }
    }

    // Unload plugin
    const unloadPlugin = async () => {
      if (isProcessing.value) {
        stopProcessing()
      }
      
      // If it's a native plugin, unload it from native host
      if (currentPlugin.value?.isNative && currentPlugin.value.pluginId && window.electronAPI?.vst3Native?.unloadPlugin) {
        try {
          console.log('Unloading native plugin:', currentPlugin.value.pluginId)
          const result = await window.electronAPI.vst3Native.unloadPlugin(currentPlugin.value.pluginId)
          if (result.success) {
            console.log('Native plugin unloaded successfully')
          } else {
            console.error('Failed to unload native plugin:', result.error)
          }
        } catch (error) {
          console.error('Error unloading native plugin:', error)
        }
      }
      
      currentPlugin.value = null
      pluginParameters.value = []
      presets.value = []
      selectedPreset.value = ''
      console.log('Plugin unloaded')
    }

    // Audio processing control
    const toggleProcessing = async () => {
      if (isProcessing.value) {
        stopProcessing()
      } else {
        await startProcessing()
      }
    }

    const startProcessing = async () => {
      try {
        if (!selectedInputDevice.value) {
          errorMessage.value = 'Please select an input device'
          return
        }

        // Request microphone access
        mediaStream.value = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: selectedInputDevice.value,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        })

        // Create audio nodes
        const source = audioContext.value.createMediaStreamSource(mediaStream.value)
        analyser.value = audioContext.value.createAnalyser()
        analyser.value.fftSize = 256
        
        // Create a simple gain node as placeholder for VST3 processing
        processorNode.value = audioContext.value.createGain()
        
        // Connect audio graph
        source.connect(analyser.value)
        analyser.value.connect(processorNode.value)
        processorNode.value.connect(audioContext.value.destination)
        
        isProcessing.value = true
        startInputLevelMonitoring()
        startPerformanceMonitoring()
        
        console.log('Audio processing started')
        
      } catch (error) {
        console.error('Failed to start audio processing:', error)
        errorMessage.value = 'Failed to start audio processing: ' + error.message
      }
    }

    const stopProcessing = () => {
      if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop())
        mediaStream.value = null
      }
      
      if (processorNode.value) {
        processorNode.value.disconnect()
        processorNode.value = null
      }
      
      if (analyser.value) {
        analyser.value.disconnect()
        analyser.value = null
      }
      
      isProcessing.value = false
      inputLevel.value = 0
      
      console.log('Audio processing stopped')
    }

    // Input level monitoring
    const startInputLevelMonitoring = () => {
      if (!analyser.value) return
      
      const dataArray = new Uint8Array(analyser.value.frequencyBinCount)
      
      const updateLevel = () => {
        if (!isProcessing.value || !analyser.value) return
        
        analyser.value.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        inputLevel.value = (average / 255) * 100
        
        requestAnimationFrame(updateLevel)
      }
      
      updateLevel()
    }

    // Performance monitoring
    const startPerformanceMonitoring = () => {
      const updatePerformance = () => {
        if (!isProcessing.value) return
        
        // Simulate CPU usage (would be real in actual implementation)
        cpuUsage.value = Math.random() * 30 + 10
        
        // Calculate latency (simplified)
        if (audioContext.value) {
          latency.value = Math.round((audioContext.value.baseLatency || 0) * 1000)
        }
        
        setTimeout(updatePerformance, 100)
      }
      
      updatePerformance()
    }

    // Parameter control
    const updateParameter = (paramId, value) => {
      const param = pluginParameters.value.find(p => p.id === paramId)
      if (param) {
        param.value = parseFloat(value)
        console.log(`Parameter ${param.name} updated to ${param.value}`)
        
        // Apply parameter change to audio processing
        if (processorNode.value && param.name === 'Gain') {
          processorNode.value.gain.value = param.value / 100
        }
      }
    }

    const formatParameterValue = (param) => {
      const value = typeof param.value === 'number' ? param.value.toFixed(1) : param.value
      return `${value}${param.unit || ''}`
    }

    // Preset management
    const loadPreset = () => {
      if (selectedPreset.value) {
        console.log('Loading preset:', selectedPreset.value)
        // In real implementation, would load actual preset data
      }
    }

    const saveCurrentPreset = () => {
      const presetName = prompt('Enter preset name:')
      if (presetName) {
        const newPreset = {
          id: Date.now().toString(),
          name: presetName
        }
        presets.value.push(newPreset)
        selectedPreset.value = newPreset.id
        console.log('Preset saved:', presetName)
      }
    }

    // Plugin UI
    const showPluginUI = async () => {
      if (currentPlugin.value?.hasUI) {
        console.log('Showing native plugin UI for:', currentPlugin.value.name)
        
        try {
          // Check if we have a native plugin with ID
          if (currentPlugin.value.isNative && currentPlugin.value.pluginId && window.electronAPI?.vst3Native?.showUI) {
            console.log('Using native VST3 UI for plugin ID:', currentPlugin.value.pluginId)
            
            const result = await window.electronAPI.vst3Native.showUI(currentPlugin.value.pluginId)
            
            if (result.success) {
              console.log('Native plugin UI shown successfully:', result.message || 'UI opened')
              // Show success message if available
              if (result.message) {
                // You could show a toast or notification here
                console.log('Native UI message:', result.message)
              }
            } else {
              errorMessage.value = result.error || 'Failed to show native plugin UI'
            }
          } else if (window.electronAPI?.showVst3PluginUI) {
            // Fallback to mock UI window
            console.log('Using mock VST3 UI window')
            
            const result = await window.electronAPI.showVst3PluginUI({
              pluginPath: currentPlugin.value.path,
              pluginName: currentPlugin.value.name
            })
            
            if (result.success) {
              console.log('Plugin UI window opened:', result.message)
            } else {
              errorMessage.value = result.message
            }
          } else {
            errorMessage.value = 'Native plugin UI requires Electron environment'
          }
        } catch (error) {
          console.error('Failed to show plugin UI:', error)
          errorMessage.value = 'Failed to open plugin UI: ' + error.message
        }
      } else {
        errorMessage.value = 'This plugin does not have a user interface'
      }
    }

    const closePluginUI = async () => {
      if (currentPlugin.value?.path && window.electronAPI?.closeVst3PluginUI) {
        try {
          const result = await window.electronAPI.closeVst3PluginUI(currentPlugin.value.path)
          console.log('Plugin UI close result:', result.message)
        } catch (error) {
          console.error('Failed to close plugin UI:', error)
        }
      }
      
      // Also close the modal if it was open
      showingPluginUI.value = false
      pluginUIData.value = null
    }

    // Audio device updates
    const updateAudioInput = () => {
      console.log('Input device changed to:', selectedInputDevice.value)
      if (isProcessing.value) {
        stopProcessing()
      }
    }

    const updateAudioOutput = () => {
      console.log('Output device changed to:', selectedOutputDevice.value)
    }

    // Error handling
    const clearError = () => {
      errorMessage.value = ''
    }

    // Lifecycle
    onMounted(async () => {
      console.log('🎵 VST3PluginComponent initializing...')
      await initializeAudio()
      await getAudioDevices()
      await getAvailableAudioDevices()
      console.log('✅ VST3PluginComponent mounted and ready')
    })

    onUnmounted(() => {
      if (isProcessing.value) {
        stopProcessing()
      }
      if (audioContext.value) {
        audioContext.value.close()
      }
      console.log('VST3PluginComponent unmounted')
    })

    return {
      // State
      currentPlugin,
      isLoading,
      isProcessing,
      errorMessage,
      
      // Audio configuration state
      isAudioInitialized,
      isInitializingAudio,
      audioConfig,
      availableInputDevices,
      availableOutputDevices,
      
      // Audio devices (legacy)
      inputDevices,
      outputDevices,
      selectedInputDevice,
      selectedOutputDevice,
      
      // Monitoring
      inputLevel,
      cpuUsage,
      latency,
      sampleRate,
      
      // Plugin data
      pluginParameters,
      presets,
      selectedPreset,
      
      // Plugin UI
      showingPluginUI,
      pluginUIData,
      
      // Computed
      calculatedLatency,
      
      // Audio configuration methods
      initializeAudioHost,
      resetAudioHost,
      
      // Methods
      selectVST3Plugin,
      loadVST3AudioPlugin,
      unloadPlugin,
      toggleProcessing,
      updateParameter,
      formatParameterValue,
      loadPreset,
      saveCurrentPreset,
      showPluginUI,
      closePluginUI,
      updateAudioInput,
      updateAudioOutput,
      clearError
    }
  }
}
</script>

<style scoped>
.vst3-plugin-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 25px;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.vst3-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 20px;
}

.vst3-header h2 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.vst3-subtitle {
  margin: 0;
  opacity: 0.8;
  font-size: 1.1rem;
}

.vst3-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.vst3-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
}

.vst3-section h4 {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

/* Plugin Loader */
.plugin-loader {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.load-plugin-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.load-plugin-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.load-plugin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.plugin-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.plugin-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.plugin-details h4 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #fff;
}

.plugin-details p {
  margin: 3px 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.plugin-path {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #00ff88;
  word-break: break-all;
}

.native-ui-notice {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  padding: 12px;
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notice-icon {
  font-size: 1.5em;
  opacity: 0.8;
}

.notice-text strong {
  color: #00ff88;
  font-size: 0.95rem;
  display: block;
  margin-bottom: 3px;
}

.notice-text p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
}

.unload-plugin-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.unload-plugin-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

/* Audio I/O */
.audio-io {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.audio-input, .audio-output {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

select option {
  background: #333;
  color: white;
}

/* Level Meters */
.input-level {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.level-meter {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.level-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #FFC107 70%, #f44336 100%);
  transition: width 0.1s ease;
}

/* Controls */
.transport-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.control-btn.active {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border-color: #4CAF50;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Parameters */
.parameters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.parameter-control {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.parameter-control label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.parameter-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  margin-bottom: 8px;
}

.parameter-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.parameter-value {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: monospace;
}

/* Presets */
.preset-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.preset-controls select {
  flex: 1;
  margin-bottom: 0;
}

/* Performance Monitor */
.performance-monitor {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  align-items: center;
}

.performance-metric {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.cpu-meter {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.cpu-bar {
  height: 100%;
  background: #4CAF50;
  transition: all 0.3s ease;
}

.cpu-bar.warning {
  background: #FFC107;
}

.cpu-bar.critical {
  background: #f44336;
}

.latency-value {
  font-family: monospace;
  font-weight: 600;
}

/* Error Messages */
.error-message {
  background: rgba(244, 67, 54, 0.9);
  border: 1px solid #f44336;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
}

.error-message h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
}

.error-message p {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
}

.error-message button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  cursor: pointer;
}

/* Responsive Design */
@media (max-width: 768px) {
  .audio-io {
    grid-template-columns: 1fr;
  }
  
  .performance-monitor {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .parameters-grid {
    grid-template-columns: 1fr;
  }
  
  .preset-controls {
    flex-direction: column;
  }
}

/* Plugin UI Modal */
.plugin-ui-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plugin-ui-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.plugin-ui-window {
  position: relative;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 2px solid #444;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

.plugin-ui-header {
  background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
  padding: 15px 20px;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plugin-ui-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.2em;
  font-weight: 600;
}

.close-btn {
  background: #ff4444;
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #ff6666;
  transform: scale(1.1);
}

.plugin-ui-content {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.plugin-ui-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.plugin-ui-info p {
  margin: 5px 0;
  color: #ccc;
  font-size: 0.9em;
}

.mock-plugin-interface h4 {
  color: #fff;
  margin-bottom: 15px;
  border-bottom: 1px solid #444;
  padding-bottom: 5px;
}

.parameter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.parameter-control {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #333;
}

.parameter-control label {
  display: block;
  color: #ccc;
  font-size: 0.9em;
  margin-bottom: 8px;
  font-weight: 500;
}

.control-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.parameter-slider {
  width: 100%;
  height: 6px;
  background: #333;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.parameter-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #00ff88;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 255, 136, 0.3);
}

.parameter-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #00ff88;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 255, 136, 0.3);
}

.parameter-value {
  color: #00ff88;
  font-size: 0.9em;
  font-weight: 600;
  text-align: center;
}

.ui-presets-section {
  border-top: 1px solid #444;
  padding-top: 20px;
}

.preset-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preset-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #444;
  color: #ccc;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9em;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #666;
}

.preset-btn.active {
  background: #00ff88;
  color: #000;
  border-color: #00ff88;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.vst3-section {
  animation: fadeInUp 0.3s ease-out;
}

/* Audio Configuration Styles */
.audio-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.audio-config.config-complete {
  border: 2px solid rgba(76, 175, 80, 0.5);
  background: rgba(76, 175, 80, 0.1);
}

.audio-status {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-indicator.active {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.5);
}

.status-icon {
  font-size: 1.5rem;
}

.status-text {
  font-weight: 600;
  font-size: 1.1rem;
}

.status-description {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
  line-height: 1.4;
}

.audio-config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-group h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.config-group select {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
}

.config-group select:focus {
  border-color: rgba(76, 175, 80, 0.7);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.config-group select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.config-group select option {
  background: #333;
  color: white;
}

.audio-config-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.initialize-audio-btn, .reset-audio-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #FF6B6B 0%, #ee5a52 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  min-width: 200px;
  justify-content: center;
}

.initialize-audio-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.initialize-audio-btn.initializing {
  background: linear-gradient(135deg, #FF9800 0%, #f57c00 100%);
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.initialize-audio-btn:hover:not(:disabled), 
.reset-audio-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.reset-audio-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.initialize-audio-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1.2rem;
}

.audio-config-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.audio-config-info h4 {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

.config-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.config-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.config-label {
  font-weight: 500;
  opacity: 0.8;
}

.config-value {
  font-weight: 600;
  color: #4CAF50;
}

.audio-warning {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255, 152, 0, 0.2);
  border: 1px solid rgba(255, 152, 0, 0.5);
  border-radius: 8px;
  margin-bottom: 15px;
}

.warning-icon {
  font-size: 1.2rem;
  color: #FF9800;
}

.warning-text {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}
</style>
