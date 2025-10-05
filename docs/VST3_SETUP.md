# 🎛️ Native VST3 Integration Setup Guide

This guide will help you set up native VST3 plugin support in your Guitar App.

## 🚀 Quick Start

```bash
# 1. Run the setup script
node scripts/setup-vst3.js

# 2. Download and install VST3 SDK (see below)

# 3. Build the native addon
npm run vst3:build

# 4. Test the integration
npm run electron:serve
```

## 📋 Prerequisites

### All Platforms
- **Node.js 14+** 
- **Python 3.x** (for node-gyp)
- **Git**

### Windows
- **Visual Studio 2019/2022** with C++ development tools
- **Windows 10 SDK**

### macOS  
- **Xcode Command Line Tools**: `xcode-select --install`
- **macOS 10.14+**

### Linux
- **Build tools**: `sudo apt-get install build-essential`
- **ALSA dev**: `sudo apt-get install libasound2-dev`
- **JACK dev** (optional): `sudo apt-get install libjack-jackd2-dev`

## 🔧 Detailed Setup

### Step 1: VST3 SDK Installation

1. **Visit**: https://www.steinberg.net/developers/
2. **Register** for a free developer account
3. **Download** VST3 SDK (latest version)
4. **Extract** to: `guitarapp/third_party/vst3sdk/`

**Directory structure should be:**
```
third_party/vst3sdk/
├── base/
├── pluginterfaces/
├── public.sdk/
├── cmake/
├── doc/
└── samples/
```

### Step 2: Build Dependencies

```bash
# Install native addon dependencies
cd native/vst3-host
npm install

# Return to project root
cd ../..
```

### Step 3: Build Native Addon

```bash
# Debug build (recommended for development)
npm run vst3:build-debug

# OR Release build (optimized)
npm run vst3:build
```

### Step 4: Verify Installation

```bash
# Check if native module loads correctly
node -e "console.log(require('./native/vst3-host'))"

# Start the app and check console for VST3 messages
npm run electron:serve
```

## 🎹 Using Native VST3 Integration

### In Your Vue Components

```javascript
// Check if native VST3 is available
const availability = await window.electronAPI.vst3Native.checkAvailability()
if (availability.available) {
  console.log('✅ Native VST3 host available')
  
  // Load a plugin
  const result = await window.electronAPI.vst3Native.loadPlugin('path/to/plugin.vst3')
  if (result.success) {
    console.log('Plugin loaded:', result.plugin.name)
    
    // Show native UI
    await window.electronAPI.vst3Native.showUI(result.plugin.id)
    
    // Start audio processing
    await window.electronAPI.vst3Native.startProcessing()
  }
} else {
  console.log('⚠️ Using fallback mock interface')
}
```

### Available APIs

```javascript
// Plugin Management
await window.electronAPI.vst3Native.loadPlugin(pluginPath)
await window.electronAPI.vst3Native.unloadPlugin(pluginId)
await window.electronAPI.vst3Native.getPlugins()

// UI Management  
await window.electronAPI.vst3Native.showUI(pluginId, parentWindowId)
await window.electronAPI.vst3Native.hideUI(pluginId)

// Audio Processing
await window.electronAPI.vst3Native.startProcessing()
await window.electronAPI.vst3Native.stopProcessing()
await window.electronAPI.vst3Native.getAudioDevices()

// System
await window.electronAPI.vst3Native.checkAvailability()
```

## 🏗️ Architecture Overview

```
Guitar App (Electron)
├── Frontend (Vue 3)
│   └── VST3PluginComponent.vue
├── Main Process (background.js)
│   ├── IPC Handlers
│   └── VST3 Host Instance
└── Native Addon (C++)
    ├── VST3Host (Main class)
    ├── VST3Plugin (Plugin wrapper)
    ├── AudioDeviceManager (I/O)
    └── VST3 SDK Integration
```

## 🔍 Troubleshooting

### Build Issues

**"Cannot find VST3 SDK"**
```bash
# Verify SDK location
ls third_party/vst3sdk/pluginterfaces/

# Re-run setup if needed
node scripts/setup-vst3.js
```

**"Python not found"**
```bash
# Windows
npm config set python python3

# macOS/Linux  
which python3
npm config set python /usr/bin/python3
```

**"Visual Studio not found" (Windows)**
- Install Visual Studio 2019/2022
- Include "C++ build tools" workload
- Restart terminal after installation

### Runtime Issues

**"VST3 host not available"**
- Check console for native module loading errors
- Rebuild with debug: `npm run vst3:build-debug`
- Check Node.js architecture matches (x64 vs ARM)

**"Plugin failed to load"**
- Verify plugin architecture (32-bit vs 64-bit)
- Check plugin file permissions
- Ensure plugin is a valid VST3 file

**"Audio device not found"**
- Check audio driver installation
- Verify exclusive mode permissions
- Test with different buffer sizes

### Development Debugging

```bash
# Enable detailed logging
export DEBUG=vst3:*

# Or on Windows
set DEBUG=vst3:*

# Rebuild with debug symbols
npm run vst3:build-debug

# Check native module exports
node -pe "Object.keys(require('./native/vst3-host'))"
```

## ⚙️ Advanced Configuration

### Custom Build Options

Edit `native/vst3-host/binding.gyp`:

```json
{
  "defines": [
    "DEVELOPMENT=1",      // Enable debug output
    "ENABLE_TRACE=1",     // Detailed tracing
    "VST3_THREAD_SAFE=1"  // Thread safety
  ]
}
```

### Audio Device Settings

```javascript
// Get available devices
const devices = await window.electronAPI.vst3Native.getAudioDevices()

// Set preferred device
await window.electronAPI.vst3Native.setAudioDevice({
  inputDeviceId: 'device_id',
  outputDeviceId: 'device_id', 
  sampleRate: 48000,
  bufferSize: 256
})
```

## 📚 Additional Resources

- **VST3 SDK Documentation**: https://steinbergmedia.github.io/vst3_doc/
- **Node.js Native Addons**: https://nodejs.org/api/addons.html
- **Electron Native Modules**: https://www.electronjs.org/docs/tutorial/using-native-node-modules

## 🔐 License Considerations

- **VST3 SDK**: Steinberg's license (free for non-commercial, license required for commercial)
- **Your App**: Follow your chosen license
- **Distribution**: Native modules must be rebuilt for target platform

## 🚢 Distribution

When building for distribution:

```bash
# Build for current platform
npm run electron:build

# The native addon will be automatically included
# Ensure VST3 SDK compliance for commercial use
```

## 🎯 Next Steps

1. **Test** with your favorite VST3 plugins
2. **Implement** parameter automation  
3. **Add** preset management
4. **Integrate** with your guitar training features
5. **Consider** MIDI support for advanced plugins

---

**🎸 Happy coding with native VST3 integration! 🎹**
