#pragma once

#include <vector>
#include <string>
#include <memory>
#include <atomic>

struct AudioConfig {
    uint32_t sampleRate = 44100;
    uint32_t bufferSize = 512;
    uint32_t inputChannels = 2;
    uint32_t outputChannels = 2;
    int32_t inputDeviceId = -1;  // -1 for default
    int32_t outputDeviceId = -1; // -1 for default
};

/**
 * Audio Device Manager
 * Handles audio device enumeration and basic audio setup
 */
class AudioDeviceManager {
public:
    AudioDeviceManager();
    ~AudioDeviceManager();

    // Device enumeration
    std::vector<std::string> GetAvailableDevices();
    
    // Audio initialization
    bool Initialize(const AudioConfig& config = AudioConfig());
    void Shutdown();
    
    // Processing control
    bool StartProcessing();
    void StopProcessing();
    bool IsProcessing() const;
    
    // Configuration
    AudioConfig GetCurrentConfig() const { return currentConfig; }
    void SetConfig(const AudioConfig& config);

private:
    AudioConfig currentConfig;
    std::atomic<bool> isProcessing;
    std::atomic<bool> isInitialized;
    
    // Platform-specific audio implementation would go here
    // For now, this is a stub implementation
    void* audioDevice; // Platform-specific audio device handle
    
    bool InitializeWASAPI();
    void ShutdownWASAPI();
};
