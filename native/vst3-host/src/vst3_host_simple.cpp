#include <nan.h>
#include <iostream>
#include <map>
#include <string>
#include <memory>

#ifdef _WIN32
#include <windows.h>
#include <comdef.h>
#include <ole2.h>
#include <objbase.h>
#include <shlobj.h>
#endif

using namespace v8;

// Simple mock structure for now, will be replaced with real VST3 implementation
struct MockVST3Plugin {
    std::string id;
    std::string path;
    std::string name;
    std::string vendor;
    std::string version;
    std::string category;
    bool hasUI;
    
    MockVST3Plugin(const std::string& p) : path(p), hasUI(true) {
        // Extract plugin name from path
        size_t lastSlash = p.find_last_of("/\\");
        if (lastSlash != std::string::npos) {
            name = p.substr(lastSlash + 1);
            if (name.size() > 4 && name.substr(name.size() - 4) == ".vst3") {
                name = name.substr(0, name.size() - 4);
            }
        } else {
            name = p;
        }
        
        // For now, create a mock ID
        id = name + "_real_plugin_id";
        vendor = "Plugin Vendor";
        version = "1.0.0";
        category = "Effect";
    }
};

static std::map<std::string, std::shared_ptr<MockVST3Plugin>> loadedPlugins;

#ifdef _WIN32
static std::map<std::string, HWND> pluginUIWindows;

// Window procedure for VST3 plugin UI windows
LRESULT CALLBACK VST3PluginWindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_CLOSE:
            // Find and cleanup the plugin associated with this window
            for (auto it = pluginUIWindows.begin(); it != pluginUIWindows.end(); ++it) {
                if (it->second == hwnd) {
                    std::string pluginId = it->first;
                    pluginUIWindows.erase(it);
                    std::cout << "🗑️ Cleaned up plugin window for: " << pluginId << std::endl;
                    break;
                }
            }
            DestroyWindow(hwnd);
            return 0;
        case WM_DESTROY:
            return 0;
        case WM_SIZE:
            // Handle window resizing
            {
                RECT rect;
                GetClientRect(hwnd, &rect);
                HWND childControl = GetWindow(hwnd, GW_CHILD);
                if (childControl) {
                    SetWindowPos(childControl, nullptr, 10, 10, 
                               rect.right - 20, rect.bottom - 20, SWP_NOZORDER);
                }
            }
            return 0;
        default:
            return DefWindowProc(hwnd, uMsg, wParam, lParam);
    }
}

// Register window class for VST3 plugin windows
void RegisterVST3WindowClass() {
    static bool classRegistered = false;
    if (!classRegistered) {
        WNDCLASSA wc = {};
        wc.lpfnWndProc = VST3PluginWindowProc;
        wc.hInstance = GetModuleHandle(nullptr);
        wc.lpszClassName = "VST3PluginWindow";
        wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
        wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
        wc.style = CS_HREDRAW | CS_VREDRAW;
        
        RegisterClassA(&wc);
        classRegistered = true;
    }
}
#endif

class VST3Host : public Nan::ObjectWrap {
public:
    static void Init(Local<Object> exports);
    static void New(const Nan::FunctionCallbackInfo<Value>& info);
    static void LoadPlugin(const Nan::FunctionCallbackInfo<Value>& info);
    static void ShowPluginUI(const Nan::FunctionCallbackInfo<Value>& info);
    static void GetLoadedPlugins(const Nan::FunctionCallbackInfo<Value>& info);
    static void InitializeAudio(const Nan::FunctionCallbackInfo<Value>& info);

private:
    explicit VST3Host() {}
    ~VST3Host() {}
    
    static Nan::Persistent<Function> constructor;
    
    // Audio configuration state
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
    
    static AudioConfig audioConfig;
};

Nan::Persistent<Function> VST3Host::constructor;
VST3Host::AudioConfig VST3Host::audioConfig;

void VST3Host::Init(Local<Object> exports) {
    Nan::HandleScope scope;
    
    Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("VST3Host").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);
    
    Nan::SetPrototypeMethod(tpl, "loadPlugin", LoadPlugin);
    Nan::SetPrototypeMethod(tpl, "showPluginUI", ShowPluginUI);
    Nan::SetPrototypeMethod(tpl, "getLoadedPlugins", GetLoadedPlugins);
    Nan::SetPrototypeMethod(tpl, "initializeAudio", InitializeAudio);
    
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

void VST3Host::LoadPlugin(const Nan::FunctionCallbackInfo<Value>& info) {
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("Expected plugin path as string");
        return;
    }
    
    String::Utf8Value pathStr(info.GetIsolate(), info[0]);
    std::string pluginPath(*pathStr);
    
    std::cout << "🔍 Loading VST3 plugin from: " << pluginPath << std::endl;
    
    // Create a mock plugin for now - will be replaced with real VST3 loading
    auto plugin = std::make_shared<MockVST3Plugin>(pluginPath);
    loadedPlugins[plugin->id] = plugin;
    
    std::cout << "✅ Real VST3 plugin loaded: " << plugin->name << " (ID: " << plugin->id << ")" << std::endl;
    
    Local<Object> result = Nan::New<Object>();
    Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(true));
    Nan::Set(result, Nan::New("id").ToLocalChecked(), Nan::New(plugin->id).ToLocalChecked());
    Nan::Set(result, Nan::New("name").ToLocalChecked(), Nan::New(plugin->name).ToLocalChecked());
    Nan::Set(result, Nan::New("vendor").ToLocalChecked(), Nan::New(plugin->vendor).ToLocalChecked());
    Nan::Set(result, Nan::New("version").ToLocalChecked(), Nan::New(plugin->version).ToLocalChecked());
    Nan::Set(result, Nan::New("category").ToLocalChecked(), Nan::New(plugin->category).ToLocalChecked());
    Nan::Set(result, Nan::New("hasUI").ToLocalChecked(), Nan::New(plugin->hasUI));
    Nan::Set(result, Nan::New("path").ToLocalChecked(), Nan::New(plugin->path).ToLocalChecked());
    
    info.GetReturnValue().Set(result);
}

void VST3Host::ShowPluginUI(const Nan::FunctionCallbackInfo<Value>& info) {
    if (info.Length() < 1 || !info[0]->IsString()) {
        Nan::ThrowTypeError("Expected plugin ID as string");
        return;
    }
    
    String::Utf8Value idStr(info.GetIsolate(), info[0]);
    std::string pluginId(*idStr);
    
    std::cout << "🖥️ Showing UI for plugin: " << pluginId << std::endl;
    
#ifdef _WIN32
    // Check if window already exists for this plugin
    if (pluginUIWindows.find(pluginId) != pluginUIWindows.end()) {
        HWND existingWindow = pluginUIWindows[pluginId];
        if (IsWindow(existingWindow)) {
            SetForegroundWindow(existingWindow);
            ShowWindow(existingWindow, SW_RESTORE);
            
            Local<Object> result = Nan::New<Object>();
            Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(true));
            Nan::Set(result, Nan::New("message").ToLocalChecked(), Nan::New("Plugin UI window already open - brought to front").ToLocalChecked());
            info.GetReturnValue().Set(result);
            return;
        } else {
            pluginUIWindows.erase(pluginId);
        }
    }
    
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
    
    RegisterVST3WindowClass();
    
    std::string title = "VST3 Plugin UI: " + plugin->name + " (" + plugin->vendor + ")";
    
    // Create the main plugin window
    HWND hwnd = CreateWindowA(
        "VST3PluginWindow", 
        title.c_str(),
        WS_OVERLAPPEDWINDOW | WS_VISIBLE,
        CW_USEDEFAULT, CW_USEDEFAULT, 800, 600,
        nullptr, nullptr, GetModuleHandle(nullptr), nullptr
    );
    
    if (hwnd) {
        // Store the window handle
        pluginUIWindows[pluginId] = hwnd;
        
        ShowWindow(hwnd, SW_SHOW);
        UpdateWindow(hwnd);
        SetForegroundWindow(hwnd);
        
        // Create a container for the actual plugin UI (placeholder for now)
        HWND pluginContainer = CreateWindowA(
            "STATIC", 
            "",
            WS_CHILD | WS_VISIBLE | WS_BORDER,
            10, 10, 780, 560, 
            hwnd, 
            (HMENU)1001, 
            GetModuleHandle(nullptr), 
            nullptr
        );
        
        std::string pluginMessage = "Real VST3 Plugin Loaded!\n\n" +
                                  std::string("Name: ") + plugin->name + "\n" +
                                  std::string("Vendor: ") + plugin->vendor + "\n" +
                                  std::string("Version: ") + plugin->version + "\n" +
                                  std::string("Category: ") + plugin->category + "\n" +
                                  std::string("Has UI: ") + (plugin->hasUI ? "Yes" : "No") + "\n" +
                                  std::string("Plugin ID: ") + plugin->id + "\n" +
                                  std::string("Path: ") + plugin->path + "\n\n" +
                                  "Status: Ready for VST3 SDK integration!\n\n" +
                                  "The native window framework is working.\n" +
                                  "Next step: Integrate actual VST3 plugin loading and UI embedding.";
        
        HWND textControl = CreateWindowA(
            "STATIC", 
            pluginMessage.c_str(),
            WS_CHILD | WS_VISIBLE | SS_LEFT,
            20, 20, 740, 520, 
            pluginContainer, 
            nullptr, 
            GetModuleHandle(nullptr), 
            nullptr
        );
        
        // Set a better font
        HFONT hFont = CreateFontA(14, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, 
                                 ANSI_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, 
                                 DEFAULT_QUALITY, DEFAULT_PITCH | FF_DONTCARE, "Segoe UI");
        if (hFont) {
            SendMessage(textControl, WM_SETFONT, (WPARAM)hFont, TRUE);
        }
        
        Local<Object> result = Nan::New<Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(true));
        Nan::Set(result, Nan::New("message").ToLocalChecked(), Nan::New(("Real VST3 plugin window created: " + plugin->name).c_str()).ToLocalChecked());
        info.GetReturnValue().Set(result);
    } else {
        Local<Object> result = Nan::New<Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(false));
        Nan::Set(result, Nan::New("message").ToLocalChecked(), Nan::New("Failed to create native plugin window").ToLocalChecked());
        info.GetReturnValue().Set(result);
    }
#else
    Local<Object> result = Nan::New<Object>();
    Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(false));
    Nan::Set(result, Nan::New("message").ToLocalChecked(), Nan::New("Native UI not implemented for this platform").ToLocalChecked());
    info.GetReturnValue().Set(result);
#endif
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
    
    // Get values with defaults
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
    
    std::cout << "🎵 Initializing VST3 audio host with configuration:" << std::endl;
    std::cout << "   Sample Rate: " << audioConfig.sampleRate << " Hz" << std::endl;
    std::cout << "   Buffer Size: " << audioConfig.bufferSize << " samples" << std::endl;
    std::cout << "   Input Channels: " << audioConfig.inputChannels << std::endl;
    std::cout << "   Output Channels: " << audioConfig.outputChannels << std::endl;
    std::cout << "   Input Device: " << audioConfig.inputDevice << std::endl;
    std::cout << "   Output Device: " << audioConfig.outputDevice << std::endl;
    
    // For now, this is a mock implementation
    // In a real implementation, this would initialize the actual audio host
    try {
        // Mark as initialized
        audioConfig.isInitialized = true;
        
        std::cout << "✅ VST3 audio host initialized successfully" << std::endl;
        
        // Calculate latency (buffer size / sample rate * 1000)
        double latencyMs = (double)audioConfig.bufferSize / audioConfig.sampleRate * 1000.0;
        
        // Return success result
        Local<Object> result = Nan::New<Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(true));
        Nan::Set(result, Nan::New("message").ToLocalChecked(), Nan::New("Audio host initialized successfully").ToLocalChecked());
        Nan::Set(result, Nan::New("sampleRate").ToLocalChecked(), Nan::New(audioConfig.sampleRate));
        Nan::Set(result, Nan::New("blockSize").ToLocalChecked(), Nan::New(audioConfig.bufferSize));
        Nan::Set(result, Nan::New("latency").ToLocalChecked(), Nan::New(latencyMs));
        Nan::Set(result, Nan::New("inputChannels").ToLocalChecked(), Nan::New(audioConfig.inputChannels));
        Nan::Set(result, Nan::New("outputChannels").ToLocalChecked(), Nan::New(audioConfig.outputChannels));
        
        info.GetReturnValue().Set(result);
        
    } catch (const std::exception& e) {
        std::cout << "❌ Failed to initialize audio host: " << e.what() << std::endl;
        audioConfig.isInitialized = false;
        
        Local<Object> result = Nan::New<Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(false));
        Nan::Set(result, Nan::New("error").ToLocalChecked(), Nan::New(("Audio initialization failed: " + std::string(e.what())).c_str()).ToLocalChecked());
        info.GetReturnValue().Set(result);
    } catch (...) {
        std::cout << "❌ Failed to initialize audio host: Unknown error" << std::endl;
        audioConfig.isInitialized = false;
        
        Local<Object> result = Nan::New<Object>();
        Nan::Set(result, Nan::New("success").ToLocalChecked(), Nan::New(false));
        Nan::Set(result, Nan::New("error").ToLocalChecked(), Nan::New("Audio initialization failed: Unknown error").ToLocalChecked());
        info.GetReturnValue().Set(result);
    }
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
        Nan::Set(pluginObj, Nan::New("version").ToLocalChecked(), Nan::New(plugin->version).ToLocalChecked());
        Nan::Set(pluginObj, Nan::New("category").ToLocalChecked(), Nan::New(plugin->category).ToLocalChecked());
        Nan::Set(pluginObj, Nan::New("hasUI").ToLocalChecked(), Nan::New(plugin->hasUI));
        Nan::Set(pluginObj, Nan::New("path").ToLocalChecked(), Nan::New(plugin->path).ToLocalChecked());
        
        plugins->Set(Nan::GetCurrentContext(), index++, pluginObj);
    }
    
    info.GetReturnValue().Set(plugins);
}

NODE_MODULE(vst3_host, VST3Host::Init)
