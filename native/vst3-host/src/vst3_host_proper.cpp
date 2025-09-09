//-----------------------------------------------------------------------------
// VST3 Host Implementation for Electron
// Based on Steinberg VST3 SDK hosting examples
//-----------------------------------------------------------------------------

#include <windows.h>
#include <combaseapi.h>
#include <nan.h>
#include <iostream>
#include <string>
#include <memory>

// VST3 SDK includes
#include "pluginterfaces/base/funknown.h"
#include "pluginterfaces/vst/ivstaudioprocessor.h"
#include "pluginterfaces/vst/ivsteditcontroller.h"
#include "pluginterfaces/gui/iplugview.h"
#include "pluginterfaces/gui/iplugviewcontentscalesupport.h"
#include "public.sdk/source/vst/hosting/module.h"
#include "public.sdk/source/vst/hosting/plugprovider.h"
#include "public.sdk/source/vst/hosting/hostclasses.h"
#include "public.sdk/source/vst/hosting/processdata.h"
#include "public.sdk/source/vst/hosting/eventlist.h"
#include "public.sdk/source/vst/hosting/parameterchanges.h"
#include "base/source/fstring.h"

using namespace Steinberg;
using namespace Steinberg::Vst;

//-----------------------------------------------------------------------------
// Global VST3 Host Application Context
//-----------------------------------------------------------------------------
class ElectronHostApplication : public HostApplication
{
public:
    ElectronHostApplication() {}
    virtual ~ElectronHostApplication() {}
    
    String128 name;
    tresult PLUGIN_API getName(String128 nameOut) override
    {
        str8ToStr16(nameOut, "ElectronVST3Host", 128);
        return kResultOk;
    }
};

static ElectronHostApplication gHostApplication;

//-----------------------------------------------------------------------------
// VST3 Plugin Wrapper Class
//-----------------------------------------------------------------------------
class VST3Plugin
{
public:
    VST3Plugin() = default;
    ~VST3Plugin() { terminate(); }

    bool loadPlugin(const std::string& pluginPath)
    {
        try {
            // Create module from plugin path
            std::string error;
            module = VST3::Hosting::Module::create(pluginPath, error);
            if (!module) {
                lastError = "Could not load module: " + error;
                return false;
            }

            // Get factory and find audio effect class
            auto factory = module->getFactory();
            for (auto& classInfo : factory.classInfos()) {
                if (classInfo.category() == kVstAudioEffectClass) {
                    // Create plugin provider
                    plugProvider = owned(new PlugProvider(factory, classInfo, true));
                    if (!plugProvider->initialize()) {
                        lastError = "Could not initialize plugin provider";
                        return false;
                    }
                    
                    // Get component and controller
                    component = plugProvider->getComponent();
                    controller = plugProvider->getController();
                    
                    if (!component || !controller) {
                        lastError = "Could not get component or controller";
                        return false;
                    }
                    
                    // Initialize component
                    if (component->initialize(&gHostApplication) != kResultOk) {
                        lastError = "Could not initialize component";
                        return false;
                    }
                    
                    // Initialize controller
                    if (controller->initialize(&gHostApplication) != kResultOk) {
                        lastError = "Could not initialize controller";
                        return false;
                    }
                    
                    isLoaded = true;
                    return true;
                }
            }
            
            lastError = "No VST3 audio effect class found in plugin";
            return false;
        }
        catch (const std::exception& e) {
            lastError = "Exception loading plugin: " + std::string(e.what());
            return false;
        }
    }

    bool initializeAudio(double sampleRate, int32 bufferSize, int32 numChannels)
    {
        if (!isLoaded || !component) {
            lastError = "Plugin not loaded";
            return false;
        }

        try {
            // Setup processing
            ProcessSetup setup;
            setup.processMode = kRealtime;
            setup.symbolicSampleSize = kSample32;
            setup.maxSamplesPerBlock = bufferSize;
            setup.sampleRate = sampleRate;

            if (component->setupProcessing(setup) != kResultOk) {
                lastError = "Could not setup processing";
                return false;
            }

            // Activate busses
            activateBusses(numChannels);

            // Set component active
            if (component->setActive(true) != kResultOk) {
                lastError = "Could not activate component";
                return false;
            }

            // Initialize processing data
            processData.prepare(*component, bufferSize, kSample32);
            
            audioInitialized = true;
            return true;
        }
        catch (const std::exception& e) {
            lastError = "Exception initializing audio: " + std::string(e.what());
            return false;
        }
    }

    HWND createPluginWindow(HWND parentWindow)
    {
        if (!isLoaded || !controller) {
            lastError = "Plugin not loaded or no controller";
            return nullptr;
        }

        try {
            // Create plugin view
            auto view = owned(controller->createView(ViewType::kEditor));
            if (!view) {
                lastError = "Plugin does not provide editor";
                return nullptr;
            }

            // Get view size
            ViewRect viewRect;
            if (view->getSize(&viewRect) != kResultOk) {
                lastError = "Could not get view size";
                return nullptr;
            }

            // Create window
            WNDCLASSEX wc = {};
            wc.cbSize = sizeof(WNDCLASSEX);
            wc.style = CS_HREDRAW | CS_VREDRAW;
            wc.lpfnWndProc = DefWindowProc;
            wc.hInstance = GetModuleHandle(nullptr);
            wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
            wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
            wc.lpszClassName = L"VST3PluginWindow";
            RegisterClassEx(&wc);

            int width = viewRect.right - viewRect.left;
            int height = viewRect.bottom - viewRect.top;

            HWND pluginWindow = CreateWindowEx(
                WS_EX_TOOLWINDOW,
                L"VST3PluginWindow",
                L"VST3 Plugin",
                WS_OVERLAPPEDWINDOW,
                CW_USEDEFAULT, CW_USEDEFAULT,
                width, height,
                parentWindow,
                nullptr,
                GetModuleHandle(nullptr),
                nullptr
            );

            if (!pluginWindow) {
                lastError = "Could not create plugin window";
                return nullptr;
            }

            // Check platform type support
            FIDString platformType = kPlatformTypeHWND;
            if (view->isPlatformTypeSupported(platformType) != kResultOk) {
                lastError = "Platform type not supported";
                DestroyWindow(pluginWindow);
                return nullptr;
            }

            // Attach view to window
            if (view->attached(pluginWindow, platformType) != kResultOk) {
                lastError = "Could not attach view to window";
                DestroyWindow(pluginWindow);
                return nullptr;
            }

            // Store view for cleanup
            pluginView = view;
            
            ShowWindow(pluginWindow, SW_SHOW);
            UpdateWindow(pluginWindow);
            
            return pluginWindow;
        }
        catch (const std::exception& e) {
            lastError = "Exception creating plugin window: " + std::string(e.what());
            return nullptr;
        }
    }

    void processAudio(float** inputs, float** outputs, int32 numChannels, int32 numSamples)
    {
        if (!audioInitialized || !component) {
            return;
        }

        try {
            // Set up input/output buffers
            for (int32 i = 0; i < numChannels && i < processData.numInputs; ++i) {
                processData.inputs[i].channelBuffers32[0] = inputs[i];
            }
            
            for (int32 i = 0; i < numChannels && i < processData.numOutputs; ++i) {
                processData.outputs[i].channelBuffers32[0] = outputs[i];
            }

            processData.numSamples = numSamples;
            
            // Process audio
            component->process(processData);
        }
        catch (const std::exception& e) {
            // Silent error handling in audio thread
        }
    }

    std::string getLastError() const { return lastError; }
    bool isPluginLoaded() const { return isLoaded; }
    bool isAudioInitialized() const { return audioInitialized; }

private:
    void activateBusses(int32 numChannels)
    {
        if (!component) return;

        // Activate audio input busses
        int32 busCount = component->getBusCount(kAudio, kInput);
        for (int32 i = 0; i < busCount; ++i) {
            component->activateBus(kAudio, kInput, i, true);
        }

        // Activate audio output busses
        busCount = component->getBusCount(kAudio, kOutput);
        for (int32 i = 0; i < busCount; ++i) {
            component->activateBus(kAudio, kOutput, i, true);
        }
    }

    void terminate()
    {
        if (pluginView) {
            pluginView->removed();
            pluginView = nullptr;
        }

        if (component && audioInitialized) {
            component->setActive(false);
        }

        if (controller) {
            controller->terminate();
            controller = nullptr;
        }

        if (component) {
            component->terminate();
            component = nullptr;
        }

        plugProvider.reset();
        module.reset();
        
        isLoaded = false;
        audioInitialized = false;
    }

    VST3::Hosting::Module::Ptr module;
    IPtr<PlugProvider> plugProvider;
    IPtr<IComponent> component;
    IPtr<IEditController> controller;
    IPtr<IPlugView> pluginView;
    
    HostProcessData processData;
    bool isLoaded = false;
    bool audioInitialized = false;
    std::string lastError;
};

//-----------------------------------------------------------------------------
// Global plugin instance
//-----------------------------------------------------------------------------
static std::unique_ptr<VST3Plugin> g_plugin;

//-----------------------------------------------------------------------------
// NAN Method Implementations
//-----------------------------------------------------------------------------

NAN_METHOD(InitializeAudio) {
    Nan::HandleScope scope;

    if (info.Length() < 4) {
        Nan::ThrowError("Expected 4 arguments: sampleRate, bufferSize, numChannels, deviceName");
        return;
    }

    try {
        // Initialize COM
        HRESULT hr = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
        if (FAILED(hr) && hr != RPC_E_CHANGED_MODE) {
            Nan::ThrowError("Failed to initialize COM");
            return;
        }

        // Set plugin context
        PluginContextFactory::instance().setPluginContext(&gHostApplication);

        double sampleRate = Nan::To<double>(info[0]).FromJust();
        int32 bufferSize = Nan::To<int32>(info[1]).FromJust();
        int32 numChannels = Nan::To<int32>(info[2]).FromJust();
        
        // Create plugin instance if needed
        if (!g_plugin) {
            g_plugin = std::make_unique<VST3Plugin>();
        }

        // Return success for now - plugin loading happens separately
        v8::Local<v8::Object> result = Nan::New<v8::Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(true));
        Nan::Set(result, Nan::New("sampleRate").ToLocalChecked(), Nan::New(sampleRate));
        Nan::Set(result, Nan::New("bufferSize").ToLocalChecked(), Nan::New(bufferSize));
        Nan::Set(result, Nan::New("channels").ToLocalChecked(), Nan::New(numChannels));
        
        info.GetReturnValue().Set(result);
    }
    catch (const std::exception& e) {
        Nan::ThrowError(("Exception in InitializeAudio: " + std::string(e.what())).c_str());
    }
}

NAN_METHOD(LoadPlugin) {
    Nan::HandleScope scope;

    if (info.Length() < 1) {
        Nan::ThrowError("Expected plugin path");
        return;
    }

    try {
        std::string pluginPath = *Nan::Utf8String(info[0]);
        
        if (!g_plugin) {
            g_plugin = std::make_unique<VST3Plugin>();
        }

        bool success = g_plugin->loadPlugin(pluginPath);
        
        v8::Local<v8::Object> result = Nan::New<v8::Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(success));
        
        if (!success) {
            Nan::Set(result, Nan::New("error").ToLocalChecked(), 
                    Nan::New(g_plugin->getLastError().c_str()).ToLocalChecked());
        }
        
        info.GetReturnValue().Set(result);
    }
    catch (const std::exception& e) {
        Nan::ThrowError(("Exception in LoadPlugin: " + std::string(e.what())).c_str());
    }
}

NAN_METHOD(InitializePluginAudio) {
    Nan::HandleScope scope;

    if (info.Length() < 3) {
        Nan::ThrowError("Expected 3 arguments: sampleRate, bufferSize, numChannels");
        return;
    }

    try {
        if (!g_plugin || !g_plugin->isPluginLoaded()) {
            Nan::ThrowError("No plugin loaded");
            return;
        }

        double sampleRate = Nan::To<double>(info[0]).FromJust();
        int32 bufferSize = Nan::To<int32>(info[1]).FromJust();
        int32 numChannels = Nan::To<int32>(info[2]).FromJust();

        bool success = g_plugin->initializeAudio(sampleRate, bufferSize, numChannels);
        
        v8::Local<v8::Object> result = Nan::New<v8::Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(success));
        
        if (!success) {
            Nan::Set(result, Nan::New("error").ToLocalChecked(), 
                    Nan::New(g_plugin->getLastError().c_str()).ToLocalChecked());
        }
        
        info.GetReturnValue().Set(result);
    }
    catch (const std::exception& e) {
        Nan::ThrowError(("Exception in InitializePluginAudio: " + std::string(e.what())).c_str());
    }
}

NAN_METHOD(ShowUI) {
    Nan::HandleScope scope;

    try {
        if (!g_plugin || !g_plugin->isPluginLoaded()) {
            Nan::ThrowError("No plugin loaded");
            return;
        }

        // Create plugin window (parentWindow can be null for standalone)
        HWND pluginWindow = g_plugin->createPluginWindow(nullptr);
        
        v8::Local<v8::Object> result = Nan::New<v8::Object>();
        if (pluginWindow) {
            Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(true));
            Nan::Set(result, Nan::New("windowHandle").ToLocalChecked(), 
                    Nan::New(reinterpret_cast<uintptr_t>(pluginWindow)));
        } else {
            Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(false));
            Nan::Set(result, Nan::New("error").ToLocalChecked(), 
                    Nan::New(g_plugin->getLastError().c_str()).ToLocalChecked());
        }
        
        info.GetReturnValue().Set(result);
    }
    catch (const std::exception& e) {
        Nan::ThrowError(("Exception in ShowUI: " + std::string(e.what())).c_str());
    }
}

NAN_METHOD(GetPluginInfo) {
    Nan::HandleScope scope;

    try {
        v8::Local<v8::Object> result = Nan::New<v8::Object>();
        
        if (g_plugin) {
            Nan::Set(result, Nan::New("loaded").ToLocalChecked(), 
                    Nan::New(g_plugin->isPluginLoaded()));
            Nan::Set(result, Nan::New("audioInitialized").ToLocalChecked(), 
                    Nan::New(g_plugin->isAudioInitialized()));
        } else {
            Nan::Set(result, Nan::New("loaded").ToLocalChecked(), Nan::New(false));
            Nan::Set(result, Nan::New("audioInitialized").ToLocalChecked(), Nan::New(false));
        }
        
        info.GetReturnValue().Set(result);
    }
    catch (const std::exception& e) {
        Nan::ThrowError(("Exception in GetPluginInfo: " + std::string(e.what())).c_str());
    }
}

//-----------------------------------------------------------------------------
// Module initialization
//-----------------------------------------------------------------------------
NAN_MODULE_INIT(Init) {
    Nan::Set(target, Nan::New("initializeAudio").ToLocalChecked(),
             Nan::GetFunction(Nan::New<v8::FunctionTemplate>(InitializeAudio)).ToLocalChecked());
    
    Nan::Set(target, Nan::New("loadPlugin").ToLocalChecked(),
             Nan::GetFunction(Nan::New<v8::FunctionTemplate>(LoadPlugin)).ToLocalChecked());
    
    Nan::Set(target, Nan::New("initializePluginAudio").ToLocalChecked(),
             Nan::GetFunction(Nan::New<v8::FunctionTemplate>(InitializePluginAudio)).ToLocalChecked());
    
    Nan::Set(target, Nan::New("showUI").ToLocalChecked(),
             Nan::GetFunction(Nan::New<v8::FunctionTemplate>(ShowUI)).ToLocalChecked());
    
    Nan::Set(target, Nan::New("getPluginInfo").ToLocalChecked(),
             Nan::GetFunction(Nan::New<v8::FunctionTemplate>(GetPluginInfo)).ToLocalChecked());
}

NODE_MODULE(vst3_host, Init)
