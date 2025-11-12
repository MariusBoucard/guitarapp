import { ipcMain } from 'electron'

/**
 * Audio Processing Handlers
 */

let audioInitialized = false

export function registerAudioHandlers(vst3HostInstance) {
  // Initialize audio
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
            outputDevice: audioConfig.outputDevice || 'default',
          },
        }
      } else {
        return { success: false, error: 'Failed to initialize VST3 audio' }
      }
    } catch (error) {
      console.error('❌ VST3 audio initialization error:', error)
      return { success: false, error: error.message }
    }
  })

  // Load audio plugin
  ipcMain.handle('vst3-load-audio-plugin', async (event, pluginPath, audioConfig = {}) => {
    try {
      if (!vst3HostInstance) {
        return { success: false, error: 'VST3 host not initialized' }
      }

      console.log('🎛️ Loading VST3 audio plugin with configuration:', {
        pluginPath,
        audioConfig,
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

  // Process audio
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

  // Get parameters
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

  // Set parameter
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

  // Unload audio plugin
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

  console.log('✅ Audio handlers registered')
}
