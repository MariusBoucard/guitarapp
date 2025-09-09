const { VST3Host } = require('./build/Release/vst3_host.node');
const EventEmitter = require('events');

/**
 * JavaScript wrapper for the native VST3 host
 * Provides a clean, Promise-based API for plugin management
 */
class VST3HostWrapper extends EventEmitter {
    constructor() {
        super();
        this.nativeHost = new VST3Host();
        this.loadedPlugins = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize the VST3 host
     */
    async initialize() {
        try {
            this.isInitialized = true;
            this.emit('initialized');
            return { success: true };
        } catch (error) {
            this.emit('error', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load a VST3 plugin
     * @param {string} pluginPath - Path to the .vst3 file
     * @returns {Promise<Object>} Plugin information or error
     */
    async loadPlugin(pluginPath) {
        try {
            const result = this.nativeHost.loadPlugin(pluginPath);
            
            if (result.success) {
                const pluginInfo = {
                    id: result.pluginId,
                    name: result.pluginName,
                    vendor: result.vendor,
                    version: result.version,
                    category: result.category,
                    path: pluginPath,
                    hasUI: result.hasUI,
                    parameterCount: result.parameterCount,
                    loadedAt: new Date().toISOString()
                };
                
                this.loadedPlugins.set(result.pluginId, pluginInfo);
                this.emit('pluginLoaded', pluginInfo);
                
                return { success: true, plugin: pluginInfo };
            } else {
                this.emit('pluginLoadError', { path: pluginPath, error: result.error });
                return { success: false, error: result.error };
            }
        } catch (error) {
            this.emit('error', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Unload a VST3 plugin
     * @param {string} pluginId - Plugin ID to unload
     * @returns {Promise<Object>} Success status
     */
    async unloadPlugin(pluginId) {
        try {
            const result = this.nativeHost.unloadPlugin(pluginId);
            
            if (result.success) {
                const pluginInfo = this.loadedPlugins.get(pluginId);
                this.loadedPlugins.delete(pluginId);
                this.emit('pluginUnloaded', { id: pluginId, plugin: pluginInfo });
            }
            
            return result;
        } catch (error) {
            this.emit('error', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get list of loaded plugins
     * @returns {Array} Array of plugin information objects
     */
    getLoadedPlugins() {
        try {
            const nativePlugins = this.nativeHost.getPluginList();
            return nativePlugins;
        } catch (error) {
            this.emit('error', error);
            return [];
        }
    }

    /**
     * Show plugin UI
     * @param {string} pluginId - Plugin ID
     * @param {number} parentWindow - Parent window handle (optional)
     * @returns {Promise<Object>} Success status
     */
    async showPluginUI(pluginId, parentWindow = null) {
        try {
            const result = this.nativeHost.showPluginUI(pluginId, parentWindow);
            
            if (result.success) {
                this.emit('pluginUIShown', { pluginId });
            } else {
                this.emit('pluginUIError', { pluginId, error: result.error });
            }
            
            return result;
        } catch (error) {
            this.emit('error', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Hide plugin UI
     * @param {string} pluginId - Plugin ID
     * @returns {Promise<Object>} Success status
     */
    async hidePluginUI(pluginId) {
        try {
            const result = this.nativeHost.hidePluginUI(pluginId);
            
            if (result.success) {
                this.emit('pluginUIHidden', { pluginId });
            }
            
            return result;
        } catch (error) {
            this.emit('error', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Start audio processing
     * @returns {Promise<Object>} Success status
     */
    async startAudioProcessing() {
        try {
            const result = this.nativeHost.startAudioProcessing();
            
            if (result.success) {
                this.emit('audioProcessingStarted');
            } else {
                this.emit('audioProcessingError', { error: result.error });
            }
            
            return result;
        } catch (error) {
            this.emit('error', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Stop audio processing
     * @returns {Promise<Object>} Success status
     */
    async stopAudioProcessing() {
        try {
            const result = this.nativeHost.stopAudioProcessing();
            
            if (result.success) {
                this.emit('audioProcessingStopped');
            }
            
            return result;
        } catch (error) {
            this.emit('error', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get available audio devices
     * @returns {Promise<Object>} Audio devices information
     */
    async getAudioDevices() {
        try {
            const result = this.nativeHost.getAudioDevices();
            return result;
        } catch (error) {
            this.emit('error', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Set parameter value
     * @param {string} pluginId - Plugin ID
     * @param {number} parameterId - Parameter ID
     * @param {number} value - Parameter value (0.0 to 1.0)
     * @returns {Promise<Object>} Success status
     */
    async setParameterValue(pluginId, parameterId, value) {
        try {
            const result = this.nativeHost.setParameterValue(pluginId, parameterId, value);
            
            if (result.success) {
                this.emit('parameterChanged', { pluginId, parameterId, value });
            }
            
            return result;
        } catch (error) {
            this.emit('error', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get parameter value
     * @param {string} pluginId - Plugin ID
     * @param {number} parameterId - Parameter ID
     * @returns {Promise<Object>} Parameter value or error
     */
    async getParameterValue(pluginId, parameterId) {
        try {
            const result = this.nativeHost.getParameterValue(pluginId, parameterId);
            return result;
        } catch (error) {
            this.emit('error', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cleanup and destroy the host
     */
    destroy() {
        this.loadedPlugins.clear();
        this.nativeHost = null;
        this.isInitialized = false;
        this.emit('destroyed');
    }
}

module.exports = VST3HostWrapper;
