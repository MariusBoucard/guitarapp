const EventEmitter = require('events');

// Try to load the native module
let NativeVST3Host = null;
try {
    const nativeModule = require('./build/Release/vst3_host.node');
    NativeVST3Host = nativeModule.VST3Host || nativeModule.SimpleVST3Host;
    console.log('✅ Native VST3 module loaded successfully');
} catch (error) {
    console.error('❌ Failed to load native VST3 module:', error.message);
}

/**
 * Simple VST3 Host wrapper for frontend integration
 */
class VST3HostWrapper extends EventEmitter {
    constructor() {
        super();
        this.nativeHost = null;
        this.isInitialized = false;
        this.audioInitialized = false;
        
        if (NativeVST3Host) {
            try {
                this.nativeHost = new NativeVST3Host();
                this.isInitialized = true;
                console.log('✅ VST3 Host wrapper created');
            } catch (error) {
                console.error('❌ Failed to create native host instance:', error);
            }
        } else {
            console.log('⚠️ VST3 Host running in fallback mode (no native support)');
        }
    }

    /**
     * Initialize audio processing
     */
    async initializeAudio(config = {}) {
        if (!this.nativeHost) {
            return { success: false, error: 'Native host not available' };
        }

        try {
            const success = this.nativeHost.initializeAudio();
            this.audioInitialized = success;
            
            if (success) {
                this.emit('audioInitialized', config);
                console.log('🎵 Audio processing initialized');
            }
            
            return { success, audioConfig: config };
        } catch (error) {
            console.error('❌ Audio initialization error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load a VST3 plugin from path
     */
    async loadPlugin(pluginPath) {
        if (!this.nativeHost) {
            return { success: false, error: 'Native host not available' };
        }

        try {
            console.log('🔍 Loading plugin:', pluginPath);
            const success = this.nativeHost.loadPlugin(pluginPath);
            
            if (success) {
                console.log('✅ Plugin loaded successfully');
                
                // Create basic plugin object from path
                const pluginName = pluginPath.split(/[\\\/]/).pop().replace('.vst3', '');
                let loadedPlugin = {
                    id: pluginName,
                    name: pluginName,
                    path: pluginPath,
                    hasUI: true, // Assume VST3 plugins have UI by default
                    isLoaded: true
                };
                
                // Try to get detailed plugin info after a small delay to avoid crashes
                try {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    const plugins = this.nativeHost.getLoadedPlugins();
                    if (plugins && plugins.length > 0) {
                        const detailedPlugin = plugins[plugins.length - 1];
                        if (detailedPlugin) {
                            loadedPlugin = {
                                ...loadedPlugin,
                                hasUI: detailedPlugin.hasUI !== undefined ? detailedPlugin.hasUI : true,
                                initialized: detailedPlugin.initialized || true
                            };
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Could not get detailed plugin info:', error.message);
                    // Keep the basic plugin object
                }
                
                this.emit('pluginLoaded', loadedPlugin);
                
                return {
                    success: true,
                    plugin: loadedPlugin
                };
            } else {
                return { success: false, error: 'Plugin loading failed' };
            }
        } catch (error) {
            console.error('❌ Plugin load error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Unload a plugin
     */
    async unloadPlugin(pluginId) {
        if (!this.nativeHost) {
            return { success: false, error: 'Native host not available' };
        }

        try {
            const success = this.nativeHost.unloadPlugin(pluginId);
            
            if (success) {
                this.emit('pluginUnloaded', pluginId);
                console.log('✅ Plugin unloaded:', pluginId);
            }
            
            return { success };
        } catch (error) {
            console.error('❌ Plugin unload error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get list of loaded plugins
     */
    getLoadedPlugins() {
        if (!this.nativeHost) {
            return [];
        }

        try {
            return this.nativeHost.getLoadedPlugins();
        } catch (error) {
            console.error('❌ Error getting plugins:', error);
            return [];
        }
    }

    /**
     * Show plugin UI
     */
    async showPluginUI(pluginId) {
        if (!this.nativeHost) {
            return { success: false, error: 'Native host not available' };
        }

        try {
            const success = this.nativeHost.showPluginUI(pluginId);
            
            if (success) {
                this.emit('pluginUIShown', pluginId);
                console.log('🎛️ Plugin UI shown:', pluginId);
            }
            
            return { success };
        } catch (error) {
            console.error('❌ Error showing plugin UI:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Hide plugin UI
     */
    async hidePluginUI(pluginId) {
        if (!this.nativeHost) {
            return { success: false, error: 'Native host not available' };
        }

        try {
            const success = this.nativeHost.hidePluginUI(pluginId);
            
            if (success) {
                this.emit('pluginUIHidden', pluginId);
                console.log('🎛️ Plugin UI hidden:', pluginId);
            }
            
            return { success };
        } catch (error) {
            console.error('❌ Error hiding plugin UI:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get general plugin host info
     */
    getPluginInfo() {
        if (!this.nativeHost) {
            return { 
                loaded: false, 
                hasEditor: false, 
                audioInitialized: this.audioInitialized,
                pluginCount: 0 
            };
        }

        try {
            return this.nativeHost.getPluginInfo();
        } catch (error) {
            console.error('❌ Error getting plugin info:', error);
            return { 
                loaded: false, 
                hasEditor: false, 
                audioInitialized: this.audioInitialized,
                pluginCount: 0 
            };
        }
    }

    /**
     * Check if native host is available
     */
    isNativeHostAvailable() {
        return this.nativeHost !== null;
    }

    /**
     * Get host status
     */
    getStatus() {
        return {
            nativeHostAvailable: this.isNativeHostAvailable(),
            initialized: this.isInitialized,
            audioInitialized: this.audioInitialized,
            loadedPlugins: this.getLoadedPlugins().length
        };
    }
}

// Backward compatibility exports
module.exports = {
    VST3HostWrapper,
    VST3Host: VST3HostWrapper, // Alias for compatibility
    SimpleVST3Host: VST3HostWrapper, // Alias for compatibility
    isNativeSupported: () => NativeVST3Host !== null
};
