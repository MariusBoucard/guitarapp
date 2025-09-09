#pragma once

#include <nan.h>
#include <memory>
#include <string>
#include <vector>
#include <map>
#include <mutex>
#include <atomic>

// VST3 SDK includes
#include "pluginterfaces/vst/ivstaudioprocessor.h"
#include "pluginterfaces/vst/ivsteditcontroller.h"
#include "pluginterfaces/vst/ivstcomponent.h"
#include "pluginterfaces/vst/ivstparameterchanges.h"
#include "pluginterfaces/gui/iplugview.h"
#include "public.sdk/source/vst/hosting/module.h"
#include "public.sdk/source/vst/hosting/hostclasses.h"

using namespace Steinberg;
using namespace Steinberg::Vst;

class VST3Plugin;
class AudioDeviceManager;

/**
 * Main VST3 Host class
 * Manages plugin loading, audio processing, and UI integration
 */
class VST3Host : public Nan::ObjectWrap {
public:
    static void Init(v8::Local<v8::Object> exports);
    static void NewInstance(const Nan::FunctionCallbackInfo<v8::Value>& info);

private:
    explicit VST3Host();
    ~VST3Host();

    // Node.js binding methods
    static void New(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void LoadPlugin(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void UnloadPlugin(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void GetPluginList(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void StartAudioProcessing(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void StopAudioProcessing(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void SetParameterValue(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void GetParameterValue(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void ShowPluginUI(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void HidePluginUI(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void GetAudioDevices(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void SetAudioDevice(const Nan::FunctionCallbackInfo<v8::Value>& info);

    // Core functionality
    bool Initialize();
    void Shutdown();
    std::shared_ptr<VST3Plugin> LoadVST3Plugin(const std::string& pluginPath);
    bool UnloadVST3Plugin(const std::string& pluginId);
    void ProcessAudioBlock(float** inputBuffers, float** outputBuffers, int32 numSamples);

    // Member variables
    std::map<std::string, std::shared_ptr<VST3Plugin>> m_loadedPlugins;
    std::unique_ptr<AudioDeviceManager> m_audioDeviceManager;
    std::mutex m_pluginsMutex;
    std::atomic<bool> m_isProcessing;
    double m_sampleRate;
    int32 m_blockSize;
    
    static Nan::Persistent<v8::Function> constructor;
};

/**
 * VST3 Plugin wrapper class
 * Handles individual plugin lifecycle and operations
 */
class VST3Plugin {
public:
    VST3Plugin(const std::string& pluginPath);
    ~VST3Plugin();

    bool Load();
    void Unload();
    bool Initialize(double sampleRate, int32 blockSize);
    void Process(ProcessData& processData);
    
    // Parameter management
    bool SetParameter(ParamID id, ParamValue value);
    ParamValue GetParameter(ParamID id) const;
    int32 GetParameterCount() const;
    bool GetParameterInfo(int32 index, ParameterInfo& info) const;
    
    // UI management
    bool HasUI() const;
    bool ShowUI(void* parentWindow);
    void HideUI();
    bool IsUIVisible() const;
    
    // Plugin info
    std::string GetName() const;
    std::string GetVendor() const;
    std::string GetVersion() const;
    std::string GetCategory() const;
    std::string GetPath() const { return m_pluginPath; }
    std::string GetId() const { return m_pluginId; }

private:
    std::string m_pluginPath;
    std::string m_pluginId;
    std::string m_pluginName;
    
    // VST3 interfaces
    IPtr<IComponent> m_component;
    IPtr<IAudioProcessor> m_audioProcessor;
    IPtr<IEditController> m_editController;
    IPtr<IPlugView> m_plugView;
    
    // VST3 hosting
    VST3::Hosting::Module::Ptr m_module;
    
    // State
    bool m_isLoaded;
    bool m_isInitialized;
    bool m_isUIVisible;
    double m_sampleRate;
    int32 m_blockSize;
    
    // Helper methods
    bool CreatePluginInstance();
    bool ConnectComponents();
    void ReleaseComponents();
    std::string GeneratePluginId() const;
};

/**
 * Audio Device Manager
 * Handles audio I/O device enumeration and management
 */
class AudioDeviceManager {
public:
    struct AudioDevice {
        std::string id;
        std::string name;
        int32 inputChannels;
        int32 outputChannels;
        double defaultSampleRate;
        std::vector<double> supportedSampleRates;
        std::vector<int32> supportedBlockSizes;
        bool isDefault;
    };

    AudioDeviceManager();
    ~AudioDeviceManager();

    bool Initialize();
    void Shutdown();
    
    std::vector<AudioDevice> GetInputDevices() const;
    std::vector<AudioDevice> GetOutputDevices() const;
    
    bool SetInputDevice(const std::string& deviceId);
    bool SetOutputDevice(const std::string& deviceId);
    
    bool StartAudioStream(double sampleRate, int32 blockSize);
    void StopAudioStream();
    
    bool IsStreaming() const { return m_isStreaming; }
    double GetSampleRate() const { return m_currentSampleRate; }
    int32 GetBlockSize() const { return m_currentBlockSize; }

private:
    std::vector<AudioDevice> m_inputDevices;
    std::vector<AudioDevice> m_outputDevices;
    std::string m_currentInputDevice;
    std::string m_currentOutputDevice;
    
    std::atomic<bool> m_isStreaming;
    double m_currentSampleRate;
    int32 m_currentBlockSize;
    
    void EnumerateDevices();
    
#ifdef _WIN32
    // Windows-specific ASIO/WASAPI implementation
    void EnumerateWASAPIDevices();
    void EnumerateASIODevices();
#elif __APPLE__
    // macOS Core Audio implementation
    void EnumerateCoreAudioDevices();
#elif __linux__
    // Linux ALSA/JACK implementation
    void EnumerateALSADevices();
    void EnumerateJACKDevices();
#endif
};
