#include "audio_device_manager.h"
#include <iostream>
#include <windows.h>
#include <mmdeviceapi.h>
#include <audioclient.h>
#include <comdef.h>

AudioDeviceManager::AudioDeviceManager() 
    : isProcessing(false), isInitialized(false), audioDevice(nullptr) {
    CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
}

AudioDeviceManager::~AudioDeviceManager() {
    Shutdown();
    CoUninitialize();
}

std::vector<std::string> AudioDeviceManager::GetAvailableDevices() {
    std::vector<std::string> devices;
    
    try {
        IMMDeviceEnumerator* deviceEnumerator = nullptr;
        HRESULT hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), nullptr, 
                                     CLSCTX_ALL, __uuidof(IMMDeviceEnumerator), 
                                     (void**)&deviceEnumerator);
        
        if (SUCCEEDED(hr) && deviceEnumerator) {
            IMMDeviceCollection* deviceCollection = nullptr;
            hr = deviceEnumerator->EnumAudioEndpoints(eRender, DEVICE_STATE_ACTIVE, &deviceCollection);
            
            if (SUCCEEDED(hr) && deviceCollection) {
                UINT deviceCount = 0;
                deviceCollection->GetCount(&deviceCount);
                
                for (UINT i = 0; i < deviceCount; ++i) {
                    IMMDevice* device = nullptr;
                    hr = deviceCollection->Item(i, &device);
                    
                    if (SUCCEEDED(hr) && device) {
                        IPropertyStore* propertyStore = nullptr;
                        hr = device->OpenPropertyStore(STGM_READ, &propertyStore);
                        
                        if (SUCCEEDED(hr) && propertyStore) {
                            PROPVARIANT deviceName;
                            PropVariantInit(&deviceName);
                            
                            hr = propertyStore->GetValue(PKEY_Device_FriendlyName, &deviceName);
                            if (SUCCEEDED(hr) && deviceName.vt == VT_LPWSTR) {
                                // Convert wide string to narrow string
                                int size = WideCharToMultiByte(CP_UTF8, 0, deviceName.pwszVal, -1, nullptr, 0, nullptr, nullptr);
                                if (size > 0) {
                                    std::string deviceNameStr(size - 1, 0);
                                    WideCharToMultiByte(CP_UTF8, 0, deviceName.pwszVal, -1, &deviceNameStr[0], size, nullptr, nullptr);
                                    devices.push_back(deviceNameStr);
                                }
                            }
                            
                            PropVariantClear(&deviceName);
                            propertyStore->Release();
                        }
                        
                        device->Release();
                    }
                }
                
                deviceCollection->Release();
            }
            
            deviceEnumerator->Release();
        }
        
    } catch (const std::exception& e) {
        std::cerr << "❌ Error enumerating audio devices: " << e.what() << std::endl;
    }
    
    // Add default device if none found
    if (devices.empty()) {
        devices.push_back("Default Audio Device");
    }
    
    return devices;
}

bool AudioDeviceManager::Initialize(const AudioConfig& config) {
    if (isInitialized) {
        return true;
    }
    
    currentConfig = config;
    
    std::cout << "🔧 Initializing audio with:" << std::endl;
    std::cout << "   Sample Rate: " << config.sampleRate << " Hz" << std::endl;
    std::cout << "   Buffer Size: " << config.bufferSize << " samples" << std::endl;
    std::cout << "   Channels: " << config.inputChannels << " in, " << config.outputChannels << " out" << std::endl;
    
    if (InitializeWASAPI()) {
        isInitialized = true;
        std::cout << "✅ Audio initialized successfully" << std::endl;
        return true;
    } else {
        std::cerr << "❌ Failed to initialize audio" << std::endl;
        return false;
    }
}

void AudioDeviceManager::Shutdown() {
    StopProcessing();
    
    if (isInitialized) {
        ShutdownWASAPI();
        isInitialized = false;
        std::cout << "🔧 Audio shutdown complete" << std::endl;
    }
}

bool AudioDeviceManager::StartProcessing() {
    if (!isInitialized) {
        std::cerr << "❌ Audio not initialized" << std::endl;
        return false;
    }
    
    if (isProcessing) {
        return true;
    }
    
    // In a real implementation, this would start the audio callback
    isProcessing = true;
    std::cout << "▶️ Audio processing started" << std::endl;
    return true;
}

void AudioDeviceManager::StopProcessing() {
    if (isProcessing) {
        // In a real implementation, this would stop the audio callback
        isProcessing = false;
        std::cout << "⏹️ Audio processing stopped" << std::endl;
    }
}

bool AudioDeviceManager::IsProcessing() const {
    return isProcessing;
}

void AudioDeviceManager::SetConfig(const AudioConfig& config) {
    bool wasProcessing = isProcessing;
    
    if (wasProcessing) {
        StopProcessing();
    }
    
    currentConfig = config;
    
    if (isInitialized) {
        Shutdown();
        Initialize(config);
    }
    
    if (wasProcessing) {
        StartProcessing();
    }
}

bool AudioDeviceManager::InitializeWASAPI() {
    try {
        IMMDeviceEnumerator* deviceEnumerator = nullptr;
        HRESULT hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), nullptr, 
                                     CLSCTX_ALL, __uuidof(IMMDeviceEnumerator), 
                                     (void**)&deviceEnumerator);
        
        if (FAILED(hr)) {
            std::cerr << "❌ Failed to create device enumerator" << std::endl;
            return false;
        }
        
        IMMDevice* device = nullptr;
        hr = deviceEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &device);
        deviceEnumerator->Release();
        
        if (FAILED(hr)) {
            std::cerr << "❌ Failed to get default audio endpoint" << std::endl;
            return false;
        }
        
        IAudioClient* audioClient = nullptr;
        hr = device->Activate(__uuidof(IAudioClient), CLSCTX_ALL, nullptr, (void**)&audioClient);
        device->Release();
        
        if (FAILED(hr)) {
            std::cerr << "❌ Failed to activate audio client" << std::endl;
            return false;
        }
        
        // Get the device format
        WAVEFORMATEX* deviceFormat = nullptr;
        hr = audioClient->GetMixFormat(&deviceFormat);
        
        if (SUCCEEDED(hr) && deviceFormat) {
            std::cout << "🔧 Device format: " << deviceFormat->nSamplesPerSec << " Hz, " 
                      << deviceFormat->nChannels << " channels" << std::endl;
            CoTaskMemFree(deviceFormat);
        }
        
        // Store the audio client (in a real implementation)
        audioDevice = audioClient;
        
        std::cout << "✅ WASAPI initialized" << std::endl;
        return true;
        
    } catch (const std::exception& e) {
        std::cerr << "❌ Exception initializing WASAPI: " << e.what() << std::endl;
        return false;
    }
}

void AudioDeviceManager::ShutdownWASAPI() {
    if (audioDevice) {
        IAudioClient* audioClient = static_cast<IAudioClient*>(audioDevice);
        audioClient->Release();
        audioDevice = nullptr;
    }
}
