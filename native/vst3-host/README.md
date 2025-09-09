# VST3 Host Native Addon

This directory contains the native C++ addon for VST3 plugin hosting in the Guitar App.

## Prerequisites

### Windows
- Visual Studio 2019 or later with C++ tools
- Python 3.x
- Node.js 14.x or later
- VST3 SDK (Steinberg)

### macOS
- Xcode Command Line Tools
- Python 3.x
- Node.js 14.x or later
- VST3 SDK (Steinberg)

### Linux
- GCC 7+ or Clang 5+
- Python 3.x
- Node.js 14.x or later
- VST3 SDK (Steinberg)
- ALSA development libraries
- JACK development libraries (optional)

## Setup Instructions

### 1. Install VST3 SDK

Download the VST3 SDK from Steinberg:
https://www.steinberg.net/developers/

Extract to: `guitarapp/third_party/vst3sdk/`

### 2. Install Dependencies

```bash
cd native/vst3-host
npm install
```

### 3. Build the Native Addon

```bash
# Debug build
npm run build-debug

# Release build
npm run build
```

### 4. Test the Integration

```bash
npm test
```

## Directory Structure

```
native/vst3-host/
├── src/                    # C++ source files
│   ├── vst3_host.cpp      # Main host implementation
│   ├── vst3_plugin.cpp    # Plugin wrapper
│   ├── audio_device_manager.cpp  # Audio I/O
│   ├── vst3_audio_processor.cpp  # Audio processing
│   └── vst3_ui_manager.cpp       # UI management
├── include/               # Header files
│   └── vst3_host.h       # Main header
├── build/                 # Build output (generated)
├── binding.gyp           # Build configuration
├── package.json          # NPM configuration
├── index.js              # JavaScript wrapper
└── README.md             # This file
```

## Usage in Electron

```javascript
const VST3Host = require('./native/vst3-host');

const host = new VST3Host();
await host.initialize();

// Load a plugin
const result = await host.loadPlugin('path/to/plugin.vst3');
if (result.success) {
    console.log('Plugin loaded:', result.plugin.name);
    
    // Show plugin UI
    await host.showPluginUI(result.plugin.id);
}
```

## Platform-Specific Notes

### Windows
- ASIO support requires ASIO SDK (separate download)
- WASAPI is used as primary audio API
- Plugin UIs are embedded using HWND

### macOS
- Core Audio is used for audio I/O
- Plugin UIs are embedded using NSView
- Requires macOS 10.14 or later

### Linux
- ALSA is used as primary audio API
- JACK support is optional but recommended
- Plugin UIs use X11 embedding

## Troubleshooting

### Build Errors
1. Ensure VST3 SDK is properly installed
2. Check that all dependencies are installed
3. Verify compiler version compatibility

### Runtime Errors
1. Check that VST3 plugins are 64-bit (if using 64-bit Node.js)
2. Ensure audio drivers are properly installed
3. Check plugin permissions and file access

### Audio Issues
1. Verify audio device permissions
2. Check sample rate and buffer size compatibility
3. Ensure exclusive mode access for low-latency

## Development

### Adding New Features
1. Add C++ implementation in `src/`
2. Expose methods in `vst3_host.cpp`
3. Update JavaScript wrapper in `index.js`
4. Add tests

### Debugging
- Use debug builds for development
- Enable VST3 SDK debug output
- Check console for native module logs

## License

This addon interfaces with the VST3 SDK which has its own licensing terms.
Check Steinberg's licensing for commercial use.
