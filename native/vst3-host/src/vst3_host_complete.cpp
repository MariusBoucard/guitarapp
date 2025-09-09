#include <nan.h>
#include <iostream>
#include <map>
#include <string>
#include <memory>
#include <vector>

// Windows includes
#ifdef _WIN32
#include <windows.h>
#include <comdef.h>
#include <ole2.h>
#include <objbase.h>
#include <shlobj.h>
#include <mmdeviceapi.h>
#include <audioclient.h>
#include <functiondiscoverykeys_devpkey.h>
#endif

// VST3 SDK includes
#include "pluginterfaces/base/ipluginbase.h"
#include "pluginterfaces/vst/ivstcomponent.h"
#include "pluginterfaces/vst/ivsteditcontroller.h"
#include "pluginterfaces/vst/ivstaudioprocessor.h"
#include "pluginterfaces/vst/ivsthostapplication.h"
#include "pluginterfaces/gui/iplugview.h"
#include "pluginterfaces/vst/ivstprocesscontext.h"
#include "pluginterfaces/vst/ivstparameterchanges.h"
#include "pluginterfaces/vst/ivstevents.h"

// VST3 SDK hosting classes
#include "public.sdk/source/vst/hosting/hostclasses.h"
#include "public.sdk/source/vst/hosting/eventlist.h"
#include "public.sdk/source/vst/hosting/parameterchanges.h"
#include "public.sdk/source/vst/hosting/processdata.h"

using namespace v8;
using namespace Steinberg;
using namespace Steinberg::Vst;

// Audio configuration structure
struct AudioConfig {
    int sampleRate;
    int bufferSize;
    int inputChannels;
    int outputChannels;
    std::string inputDevice;
    std::string outputDevice;
    bool isInitialized;
    
    AudioConfig() : sampleRate(44100), bufferSize(256), inputChannels(2), 
                   outputChannels(2), inputDevice("default"), 
                   outputDevice("default"), isInitialized(false) {}
};

// VST3 Plugin wrapper
class VST3PluginWrapper {
public:
    std::string id;
    std::string path;
    std::string name;
    std::string vendor;
    std::string category;
    bool hasUI;
    
    // VST3 interfaces
    HMODULE moduleHandle;
    IPtr<IComponent> component;
    IPtr<IEditController> controller;
    IPtr<IAudioProcessor> processor;
    IPtr<IPlugView> plugView;
    
    // Audio processing
    HostProcessData processData;
    ParameterChanges inputParameterChanges;
    ParameterChanges outputParameterChanges;
    EventList inputEvents;
    EventList outputEvents;
    
    VST3PluginWrapper(const std::string& pluginPath) 
        : path(pluginPath), hasUI(false), moduleHandle(nullptr) {
        // Generate unique ID
        static int counter = 0;
        id = "vst3_plugin_" + std::to_string(++counter);
        
        // Extract plugin name from path
        size_t lastSlash = pluginPath.find_last_of("/\\");
        if (lastSlash != std::string::npos) {
            name = pluginPath.substr(lastSlash + 1);
            if (name.size() > 4 && name.substr(name.size() - 4) == ".vst3") {
                name = name.substr(0, name.size() - 4);
            }
        } else {
            name = pluginPath;
        }
        
        vendor = "VST3 Plugin";
        category = "Effect";
    }
    
    ~VST3PluginWrapper() {
        cleanup();
    }
    
    void cleanup() {
        if (plugView) {
            plugView = nullptr;
        }
        if (controller) {
            controller->terminate();
            controller = nullptr;
        }
        if (component) {
            component->terminate();
            component = nullptr;
        }
        processor = nullptr;
        
        if (moduleHandle) {
            FreeLibrary(moduleHandle);
            moduleHandle = nullptr;
        }
    }
    
    bool initialize(const AudioConfig& config) {
        // Setup process data
        processData.prepare(*component, config.bufferSize, kSample32);
        
        // Setup parameter changes
        processData.inputParameterChanges = &inputParameterChanges;
        processData.outputParameterChanges = &outputParameterChanges;
        
        // Setup events
        processData.inputEvents = &inputEvents;
        processData.outputEvents = &outputEvents;
        
        // Setup audio buffers
        setupAudioBuffers(config);
        
        return true;
    }
    
private:
    void setupAudioBuffers(const AudioConfig& config) {
        // Setup input and output audio buffers based on configuration
        // This would be expanded based on the actual bus configuration
    }
};

// Global state
static std::map<std::string, std::shared_ptr<VST3PluginWrapper>> loadedPlugins;
static AudioConfig audioConfig;
static IPtr<HostApplication> gHostApplication;

// Windows audio system integration
#ifdef _WIN32
static std::map<std::string, HWND> pluginUIWindows;

// Window procedure for VST3 plugin windows
LRESULT CALLBACK VST3WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_CLOSE:
            DestroyWindow(hwnd);
            return 0;
        case WM_DESTROY:
            // Remove from the map when window is destroyed
            for (auto it = pluginUIWindows.begin(); it != pluginUIWindows.end(); ++it) {
                if (it->second == hwnd) {
                    pluginUIWindows.erase(it);
                    break;
                }
            }
            return 0;
        default:
            return DefWindowProc(hwnd, uMsg, wParam, lParam);
    }
}

// Register window class for VST3 plugin windows
void RegisterVST3WindowClass() {
    static bool registered = false;
    if (!registered) {
        WNDCLASSA wc = {};
        wc.lpfnWndProc = VST3WindowProc;
        wc.hInstance = GetModuleHandle(nullptr);
        wc.lpszClassName = "VST3PluginWindow";
        wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
        wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
        
        RegisterClassA(&wc);
        registered = true;
    }
}

// Initialize Windows audio system
bool InitializeWindowsAudio(const AudioConfig& config) {
    HRESULT hr;
    
    // Initialize COM
    hr = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    if (FAILED(hr)) {
        std::cout << "Failed to initialize COM: " << std::hex << hr << std::endl;
        return false;
    }
    
    std::cout << "✅ Windows Audio System initialized" << std::endl;
    std::cout << "   Sample Rate: " << config.sampleRate << " Hz" << std::endl;
    std::cout << "   Buffer Size: " << config.bufferSize << " samples" << std::endl;
    std::cout << "   Channels: " << config.inputChannels << " → " << config.outputChannels << std::endl;
    
    return true;
}
#endif

// VST3 Host class
class VST3Host : public Nan::ObjectWrap {
public:
    static void Init(Local<Object> exports);
    static void New(const Nan::FunctionCallbackInfo<Value>& info);
    static void InitializeAudio(const Nan::FunctionCallbackInfo<Value>& info);
    static void LoadPlugin(const Nan::FunctionCallbackInfo<Value>& info);
    static void ShowPluginUI(const Nan::FunctionCallbackInfo<Value>& info);
    static void GetLoadedPlugins(const Nan::FunctionCallbackInfo<Value>& info);

private:
    explicit VST3Host() {}
    ~VST3Host() {}
    
    static Nan::Persistent<Function> constructor;
};

Nan::Persistent<Function> VST3Host::constructor;

void VST3Host::Init(Local<Object> exports) {
    Nan::HandleScope scope;
    
    Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("VST3Host").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);
    
    Nan::SetPrototypeMethod(tpl, "initializeAudio", InitializeAudio);
    Nan::SetPrototypeMethod(tpl, "loadPlugin", LoadPlugin);
    Nan::SetPrototypeMethod(tpl, "showPluginUI", ShowPluginUI);
    Nan::SetPrototypeMethod(tpl, "getLoadedPlugins", GetLoadedPlugins);
    
    constructor.Reset(tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
    exports->Set(Nan::GetCurrentContext(), Nan::New("VST3Host").ToLocalChecked(), 
                 tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
}

void VST3Host::New(const Nan::FunctionCallbackInfo<Value>& info) {
    if (info.IsConstructCall()) {
        VST3Host* obj = new VST3Host();
        obj->Wrap(info.This());
        info.GetReturnValue().Set(info.This());
    } else {
        const int argc = 1;
        Local<Value> argv[argc] = { info[0] };
        Local<Function> cons = Nan::New<Function>(constructor);
        info.GetReturnValue().Set(cons->NewInstance(Nan::GetCurrentContext(), argc, argv).ToLocalChecked());
    }
}

void VST3Host::InitializeAudio(const Nan::FunctionCallbackInfo<Value>& info) {
    if (info.Length() < 1 || !info[0]->IsObject()) {
        Nan::ThrowTypeError("Expected audio configuration object");
        return;
    }
    
    Local<Object> configObj = info[0]->ToObject(Nan::GetCurrentContext()).ToLocalChecked();
    
    // Extract audio configuration parameters
    Local<String> sampleRateKey = Nan::New("sampleRate").ToLocalChecked();
    Local<String> bufferSizeKey = Nan::New("bufferSize").ToLocalChecked();
    Local<String> inputChannelsKey = Nan::New("inputChannels").ToLocalChecked();
    Local<String> outputChannelsKey = Nan::New("outputChannels").ToLocalChecked();
    Local<String> inputDeviceKey = Nan::New("inputDevice").ToLocalChecked();
    Local<String> outputDeviceKey = Nan::New("outputDevice").ToLocalChecked();
    
    // Update configuration
    if (Nan::Has(configObj, sampleRateKey).FromJust()) {
        audioConfig.sampleRate = Nan::To<int32_t>(Nan::Get(configObj, sampleRateKey).ToLocalChecked()).FromJust();
    }
    if (Nan::Has(configObj, bufferSizeKey).FromJust()) {
        audioConfig.bufferSize = Nan::To<int32_t>(Nan::Get(configObj, bufferSizeKey).ToLocalChecked()).FromJust();
    }
    if (Nan::Has(configObj, inputChannelsKey).FromJust()) {
        audioConfig.inputChannels = Nan::To<int32_t>(Nan::Get(configObj, inputChannelsKey).ToLocalChecked()).FromJust();
    }
    if (Nan::Has(configObj, outputChannelsKey).FromJust()) {
        audioConfig.outputChannels = Nan::To<int32_t>(Nan::Get(configObj, outputChannelsKey).ToLocalChecked()).FromJust();
    }
    if (Nan::Has(configObj, inputDeviceKey).FromJust()) {
        String::Utf8Value inputDeviceStr(info.GetIsolate(), Nan::Get(configObj, inputDeviceKey).ToLocalChecked());
        audioConfig.inputDevice = std::string(*inputDeviceStr);
    }
    if (Nan::Has(configObj, outputDeviceKey).FromJust()) {
        String::Utf8Value outputDeviceStr(info.GetIsolate(), Nan::Get(configObj, outputDeviceKey).ToLocalChecked());
        audioConfig.outputDevice = std::string(*outputDeviceStr);
    }
    
    std::cout << "🎵 Initializing VST3 Audio Host..." << std::endl;
    
    try {
        // Initialize host application
        if (!gHostApplication) {
            gHostApplication = owned(new HostApplication());
        }
        
        #ifdef _WIN32
        // Initialize Windows audio system
        if (!InitializeWindowsAudio(audioConfig)) {
            throw std::runtime_error("Failed to initialize Windows audio system");
        }
        #endif
        
        // Mark as initialized
        audioConfig.isInitialized = true;
        
        std::cout << "✅ VST3 Audio Host initialized successfully!" << std::endl;
        
        // Calculate latency
        double latencyMs = (double)audioConfig.bufferSize / audioConfig.sampleRate * 1000.0;
        
        // Return success result
        Local<Object> result = Nan::New<Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(true));
        Nan::Set(result, Nan::New("message").ToLocalChecked(), Nan::New("VST3 Audio Host initialized successfully").ToLocalChecked());
        Nan::Set(result, Nan::New("sampleRate").ToLocalChecked(), Nan::New(audioConfig.sampleRate));
        Nan::Set(result, Nan::New("blockSize").ToLocalChecked(), Nan::New(audioConfig.bufferSize));
        Nan::Set(result, Nan::New("latency").ToLocalChecked(), Nan::New(latencyMs));
        Nan::Set(result, Nan::New("inputChannels").ToLocalChecked(), Nan::New(audioConfig.inputChannels));
        Nan::Set(result, Nan::New("outputChannels").ToLocalChecked(), Nan::New(audioConfig.outputChannels));
        
        info.GetReturnValue().Set(result);
        
    } catch (const std::exception& e) {
        std::cout << "❌ Failed to initialize VST3 Audio Host: " << e.what() << std::endl;
        audioConfig.isInitialized = false;
        
        Local<Object> result = Nan::New<Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(false));
        Nan::Set(result, Nan::New("error").ToLocalChecked(), Nan::New(("Audio initialization failed: " + std::string(e.what())).c_str()).ToLocalChecked());
        info.GetReturnValue().Set(result);
    }
}

void VST3Host::LoadPlugin(const Nan::FunctionCallbackInfo<Value>& info) {
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("Expected plugin path as string");
        return;
    }
    
    String::Utf8Value pathStr(info.GetIsolate(), info[0]);
    std::string pluginPath(*pathStr);
    
    std::cout << "🎵 Loading VST3 Plugin: " << pluginPath << std::endl;
    
    if (!audioConfig.isInitialized) {
        std::cout << "⚠️ Audio context not initialized - please call initializeAudio() first" << std::endl;
    }
    
    try {
        // Create plugin wrapper
        auto plugin = std::make_shared<VST3PluginWrapper>(pluginPath);
        
        // Load VST3 DLL
        std::wstring wPath(pluginPath.begin(), pluginPath.end());
        plugin->moduleHandle = LoadLibraryW(wPath.c_str());
        
        if (!plugin->moduleHandle) {
            DWORD error = GetLastError();
            throw std::runtime_error("Failed to load VST3 DLL: Error " + std::to_string(error));
        }
        
        std::cout << "✅ VST3 DLL loaded successfully" << std::endl;
        
        // Get the plugin factory function
        typedef IPluginFactory* (*GetPluginFactoryProc)();
        GetPluginFactoryProc getPluginFactory = (GetPluginFactoryProc)GetProcAddress(plugin->moduleHandle, "GetPluginFactory");
        
        if (!getPluginFactory) {
            throw std::runtime_error("GetPluginFactory function not found - not a valid VST3 plugin");
        }
        
        // Get the factory
        IPluginFactory* factory = getPluginFactory();
        if (!factory) {
            throw std::runtime_error("Failed to get plugin factory");
        }
        
        std::cout << "✅ Plugin factory obtained" << std::endl;
        
        // Get factory info
        PFactoryInfo factoryInfo;
        if (factory->getFactoryInfo(&factoryInfo) == kResultOk) {
            plugin->vendor = factoryInfo.vendor;
            std::cout << "📝 Plugin vendor: " << factoryInfo.vendor << std::endl;
        }
        
        // Find and create the first audio component
        int32 classCount = factory->countClasses();
        std::cout << "🔍 Found " << classCount << " classes in plugin" << std::endl;
        
        PClassInfo classInfo;
        bool foundComponent = false;
        TUID componentCID;
        
        for (int32 i = 0; i < classCount; ++i) {
            if (factory->getClassInfo(i, &classInfo) == kResultOk) {
                std::cout << "   Class " << i << ": \"" << classInfo.name << "\" (Category: \"" << classInfo.category << "\")" << std::endl;
                
                // Check if this is an audio processor
                if (strcmp(classInfo.category, "Fx") == 0 ||
                    strcmp(classInfo.category, "Instrument") == 0 ||
                    strstr(classInfo.category, "Fx") != nullptr) {
                    foundComponent = true;
                    plugin->name = classInfo.name;
                    plugin->category = classInfo.category;
                    memcpy(&componentCID, &classInfo.cid, sizeof(TUID));
                    std::cout << "✅ Selected audio component: \"" << classInfo.name << "\"" << std::endl;
                    break;
                }
            }
        }
        
        if (!foundComponent) {
            throw std::runtime_error("No audio effect component found");
        }
        
        // Create the component
        void* componentPtr = nullptr;
        if (factory->createInstance(componentCID, IComponent::iid, &componentPtr) == kResultOk) {
            plugin->component = owned((IComponent*)componentPtr);
        }
        
        if (!plugin->component) {
            throw std::runtime_error("Failed to create VST3 component");
        }
        
        // Initialize the component
        if (plugin->component->initialize(gHostApplication) != kResultOk) {
            throw std::runtime_error("Failed to initialize VST3 component");
        }
        
        std::cout << "✅ VST3 component initialized" << std::endl;
        
        // Get the edit controller
        TUID controllerCID;
        if (plugin->component->getControllerClassId(controllerCID) == kResultOk) {
            void* controllerPtr = nullptr;
            if (factory->createInstance(controllerCID, IEditController::iid, &controllerPtr) == kResultOk) {
                plugin->controller = owned((IEditController*)controllerPtr);
            }
            
            if (plugin->controller) {
                plugin->controller->initialize(gHostApplication);
                std::cout << "✅ Edit controller initialized" << std::endl;
                
                // Check if plugin has UI
                plugin->plugView = owned(plugin->controller->createView(ViewType::kEditor));
                if (plugin->plugView) {
                    plugin->hasUI = true;
                    std::cout << "✅ Plugin has native UI" << std::endl;
                }
            }
        }
        
        // Get the audio processor
        plugin->component->queryInterface(IAudioProcessor::iid, (void**)&plugin->processor);
        if (plugin->processor) {
            std::cout << "✅ Audio processor obtained" << std::endl;
        }
        
        // Initialize audio processing if audio is configured
        if (audioConfig.isInitialized) {
            plugin->initialize(audioConfig);
            std::cout << "✅ Plugin audio processing initialized" << std::endl;
        }
        
        // Store the loaded plugin
        loadedPlugins[plugin->id] = plugin;
        
        std::cout << "🎉 VST3 plugin loaded successfully: " << plugin->name << " (ID: " << plugin->id << ")" << std::endl;
        
        // Return success result
        Local<Object> resultObj = Nan::New<Object>();
        Nan::Set(resultObj, Nan::New("success").ToLocalChecked(), Nan::New(true));
        Nan::Set(resultObj, Nan::New("id").ToLocalChecked(), Nan::New(plugin->id).ToLocalChecked());
        Nan::Set(resultObj, Nan::New("pluginId").ToLocalChecked(), Nan::New(plugin->id).ToLocalChecked());
        Nan::Set(resultObj, Nan::New("name").ToLocalChecked(), Nan::New(plugin->name).ToLocalChecked());
        Nan::Set(resultObj, Nan::New("vendor").ToLocalChecked(), Nan::New(plugin->vendor).ToLocalChecked());
        Nan::Set(resultObj, Nan::New("category").ToLocalChecked(), Nan::New(plugin->category).ToLocalChecked());
        Nan::Set(resultObj, Nan::New("hasUI").ToLocalChecked(), Nan::New(plugin->hasUI));
        Nan::Set(resultObj, Nan::New("path").ToLocalChecked(), Nan::New(plugin->path).ToLocalChecked());
        info.GetReturnValue().Set(resultObj);
        
    } catch (const std::exception& e) {
        std::cout << "❌ Failed to load plugin: " << e.what() << std::endl;
        Local<Object> resultObj = Nan::New<Object>();
        Nan::Set(resultObj, Nan::New("success").ToLocalChecked(), Nan::New(false));
        Nan::Set(resultObj, Nan::New("error").ToLocalChecked(), Nan::New(("Plugin loading failed: " + std::string(e.what())).c_str()).ToLocalChecked());
        info.GetReturnValue().Set(resultObj);
    }
}

void VST3Host::ShowPluginUI(const Nan::FunctionCallbackInfo<Value>& info) {
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("Expected plugin ID as string");
        return;
    }
    
    String::Utf8Value idStr(info.GetIsolate(), info[0]);
    std::string pluginId(*idStr);
    
    std::cout << "🖥️ Showing VST3 UI for plugin: " << pluginId << std::endl;
    
    // Find the loaded plugin
    auto pluginIt = loadedPlugins.find(pluginId);
    if (pluginIt == loadedPlugins.end()) {
        Local<Object> result = Nan::New<Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(false));
        Nan::Set(result, Nan::New("message").ToLocalChecked(), Nan::New("Plugin not found - please load the plugin first").ToLocalChecked());
        info.GetReturnValue().Set(result);
        return;
    }
    
    auto plugin = pluginIt->second;
    
    #ifdef _WIN32
    if (plugin->plugView) {
        try {
            // Register window class
            RegisterVST3WindowClass();
            
            std::string title = "VST3 Plugin: " + plugin->name + " (" + plugin->vendor + ")";
            
            // Create the main plugin window
            HWND hwnd = CreateWindowA(
                "VST3PluginWindow", 
                title.c_str(),
                WS_OVERLAPPEDWINDOW | WS_VISIBLE,
                CW_USEDEFAULT, CW_USEDEFAULT, 800, 600,
                nullptr, nullptr, GetModuleHandle(nullptr), nullptr
            );
            
            if (hwnd) {
                // Attach the plugin view to the window
                if (plugin->plugView->attached(hwnd, ViewType::kEditor) == kResultOk) {
                    // Get the preferred size from the plugin
                    ViewRect rect;
                    if (plugin->plugView->getSize(&rect) == kResultOk) {
                        SetWindowPos(hwnd, nullptr, 0, 0, 
                                   rect.right - rect.left + 16, 
                                   rect.bottom - rect.top + 39, 
                                   SWP_NOMOVE | SWP_NOZORDER);
                    }
                    
                    pluginUIWindows[pluginId] = hwnd;
                    
                    std::cout << "✅ VST3 native UI embedded successfully" << std::endl;
                    
                    Local<Object> result = Nan::New<Object>();
                    Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(true));
                    Nan::Set(result, Nan::New("message").ToLocalChecked(), Nan::New(("VST3 native UI opened: " + plugin->name).c_str()).ToLocalChecked());
                    info.GetReturnValue().Set(result);
                    return;
                } else {
                    DestroyWindow(hwnd);
                    throw std::runtime_error("Failed to attach plugin view to window");
                }
            } else {
                throw std::runtime_error("Failed to create plugin window");
            }
        } catch (const std::exception& e) {
            std::cout << "❌ Failed to show plugin UI: " << e.what() << std::endl;
            Local<Object> result = Nan::New<Object>();
            Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(false));
            Nan::Set(result, Nan::New("message").ToLocalChecked(), Nan::New(("Failed to show VST3 UI: " + std::string(e.what())).c_str()).ToLocalChecked());
            info.GetReturnValue().Set(result);
            return;
        }
    }
    #endif
    
    // Fallback message
    Local<Object> result = Nan::New<Object>();
    Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(false));
    Nan::Set(result, Nan::New("message").ToLocalChecked(), Nan::New("Plugin does not have a native UI or UI creation failed").ToLocalChecked());
    info.GetReturnValue().Set(result);
}

void VST3Host::GetLoadedPlugins(const Nan::FunctionCallbackInfo<Value>& info) {
    Local<Array> plugins = Nan::New<Array>();
    
    uint32_t index = 0;
    for (const auto& pair : loadedPlugins) {
        const auto& plugin = pair.second;
        
        Local<Object> pluginObj = Nan::New<Object>();
        Nan::Set(pluginObj, Nan::New("id").ToLocalChecked(), Nan::New(plugin->id).ToLocalChecked());
        Nan::Set(pluginObj, Nan::New("name").ToLocalChecked(), Nan::New(plugin->name).ToLocalChecked());
        Nan::Set(pluginObj, Nan::New("vendor").ToLocalChecked(), Nan::New(plugin->vendor).ToLocalChecked());
        Nan::Set(pluginObj, Nan::New("category").ToLocalChecked(), Nan::New(plugin->category).ToLocalChecked());
        Nan::Set(pluginObj, Nan::New("hasUI").ToLocalChecked(), Nan::New(plugin->hasUI));
        Nan::Set(pluginObj, Nan::New("path").ToLocalChecked(), Nan::New(plugin->path).ToLocalChecked());
        
        plugins->Set(Nan::GetCurrentContext(), index++, pluginObj);
    }
    
    Local<Object> result = Nan::New<Object>();
    Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(true));
    Nan::Set(result, Nan::New("plugins").ToLocalChecked(), plugins);
    
    info.GetReturnValue().Set(result);
}

NODE_MODULE(vst3_host, VST3Host::Init)
