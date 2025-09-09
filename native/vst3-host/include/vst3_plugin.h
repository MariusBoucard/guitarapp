#pragma once

#include <nan.h>
#include <memory>
#include <string>
#include <atomic>
#include <windows.h>

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

/**
 * VST3Plugin wrapper class
 * Manages individual VST3 plugin instances
 */
class VST3Plugin {
public:
    VST3Plugin();
    ~VST3Plugin();

    // Plugin lifecycle
    bool LoadFromPath(const std::string& pluginPath);
    void Unload();
    bool IsLoaded() const;

    // Plugin information
    std::string GetPluginId() const { return pluginId; }
    std::string GetPluginName() const { return pluginName; }
    std::string GetVendorName() const { return vendorName; }
    std::string GetPluginPath() const { return pluginPath; }

    // Audio processing
    bool SetupProcessing(double sampleRate, int32 maxBlockSize);
    bool ProcessAudio(float** inputs, float** outputs, int32 numSamples);
    
    // Parameters
    bool SetParameterValue(uint32_t paramId, double value);
    double GetParameterValue(uint32_t paramId);
    int32 GetParameterCount() const;

    // UI Management
    bool HasUI() const;
    bool ShowUI(HWND parentWindow = nullptr);
    void HideUI();
    bool IsUIVisible() const;

private:
    // Plugin data
    std::string pluginId;
    std::string pluginName;
    std::string vendorName;
    std::string pluginPath;
    
    // VST3 interfaces
    VST3::Hosting::Module::Ptr module;
    IComponent* component;
    IAudioProcessor* audioProcessor;
    IEditController* editController;
    IPlugView* plugView;
    
    // UI data
    HWND pluginWindow;
    std::atomic<bool> uiVisible;
    
    // Audio data
    HostApplication* hostApplication;
    HostContext* hostContext;
    
    // Internal helpers
    bool InitializePlugin();
    void CleanupPlugin();
    bool ConnectInterfaces();
    void CreatePluginWindow(HWND parent);
    
    // Static callback for plugin window
    static LRESULT CALLBACK PluginWindowProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
};
