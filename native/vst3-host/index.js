const EventEmitter = require('events');

// Try to load the native module
let NativeVST3Host = null;
let NativeEditorHostBridge = null;

try {
    const nativeModule = require('./build/Release/vst3_host.node');
    NativeVST3Host = nativeModule.VST3Host || nativeModule.SimpleVST3Host;
    NativeEditorHostBridge = nativeModule.EditorHostBridge;
    console.log('✅ Native VST3 module loaded successfully');
    if (NativeEditorHostBridge) {
        console.log('✅ EditorHostBridge available');
    }
} catch (error) {
    console.error('❌ Failed to load native VST3 module:', error.message);
}

/**
 * EditorHost Bridge wrapper for external VST3 plugin host integration
 */
class EditorHostBridgeWrapper extends EventEmitter {
    constructor() {
        super();
        this.bridge = null;
        this.isInitialized = false;
        this.currentEditorHostPath = null;
        
        if (NativeEditorHostBridge) {
            try {
                this.bridge = new NativeEditorHostBridge();
                this.isInitialized = true;
                console.log('✅ EditorHostBridge wrapper created');
            } catch (error) {
                console.error('❌ Failed to create EditorHostBridge instance:', error);
            }
        } else {
            console.log('⚠️ EditorHostBridge not available');
        }
    }

    /**
     * Set the path to the editorHost executable
     */
    setEditorHostPath(hostPath) {
        if (!this.bridge) {
            return { success: false, error: 'EditorHostBridge not available' };
        }

        try {
            const success = this.bridge.setEditorHostPath(hostPath);
            if (success) {
                this.currentEditorHostPath = hostPath;
                console.log('📂 EditorHost path set:', hostPath);
            }
            return { success };
        } catch (error) {
            console.error('❌ Failed to set EditorHost path:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Launch the editorHost process
     */
    async launchEditorHost() {
        if (!this.bridge) {
            return { success: false, error: 'EditorHostBridge not available' };
        }

        try {
            const success = this.bridge.launchEditorHost();
            if (success) {
                console.log('🚀 EditorHost launched successfully');
                this.emit('editorHostLaunched');
            }
            return { success };
        } catch (error) {
            console.error('❌ Failed to launch EditorHost:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load a plugin in the editorHost
     */
    async loadPlugin(pluginPath) {
        if (!this.bridge) {
            return { success: false, error: 'EditorHostBridge not available' };
        }

        try {
            const success = this.bridge.loadPlugin(pluginPath);
            if (success) {
                console.log('🔌 Plugin load command sent:', pluginPath);
                this.emit('pluginLoadRequested', pluginPath);
            }
            return { success, pluginPath };
        } catch (error) {
            console.error('❌ Failed to load plugin:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Embed the editorHost window into a parent window
     */
    async embedWindow(parentWindowHandle) {
        if (!this.bridge) {
            return { success: false, error: 'EditorHostBridge not available' };
        }

        try {
            // Set parent window first
            this.bridge.setParentWindow(parentWindowHandle);
            
            // Then embed
            const success = this.bridge.embedWindow();
            if (success) {
                console.log('🔗 EditorHost window embedded successfully');
                this.emit('windowEmbedded');
            }
            return { success };
        } catch (error) {
            console.error('❌ Failed to embed window:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Detach the embedded window
     */
    async detachWindow() {
        if (!this.bridge) {
            return { success: false, error: 'EditorHostBridge not available' };
        }

        try {
            const success = this.bridge.detachWindow();
            if (success) {
                console.log('🔓 EditorHost window detached successfully');
                this.emit('windowDetached');
            }
            return { success };
        } catch (error) {
            console.error('❌ Failed to detach window:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Close the editorHost process
     */
    async closeEditorHost() {
        if (!this.bridge) {
            return { success: false, error: 'EditorHostBridge not available' };
        }

        try {
            const success = this.bridge.closeEditorHost();
            if (success) {
                console.log('🛑 EditorHost closed successfully');
                this.emit('editorHostClosed');
            }
            return { success };
        } catch (error) {
            console.error('❌ Failed to close EditorHost:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if editorHost is running
     */
    isRunning() {
        if (!this.bridge) return false;
        
        try {
            return this.bridge.isEditorHostRunning();
        } catch (error) {
            console.error('❌ Failed to check EditorHost status:', error);
            return false;
        }
    }

    /**
     * Get window information
     */
    getWindowInfo() {
        if (!this.bridge) {
            return { isRunning: false, isEmbedded: false };
        }

        try {
            return this.bridge.getWindowInfo();
        } catch (error) {
            console.error('❌ Failed to get window info:', error);
            return { isRunning: false, isEmbedded: false };
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.isRunning()) {
            this.closeEditorHost();
        }
    }
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
    EditorHostBridgeWrapper,
    VST3Host: VST3HostWrapper, // Alias for compatibility
    SimpleVST3Host: VST3HostWrapper, // Alias for compatibility
    EditorHostBridge: EditorHostBridgeWrapper, // Alias for compatibility
    isNativeSupported: () => NativeVST3Host !== null,
    isEditorHostBridgeSupported: () => NativeEditorHostBridge !== null
};
