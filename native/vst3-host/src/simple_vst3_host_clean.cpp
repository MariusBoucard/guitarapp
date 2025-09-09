#include <nan.h>
#include <windows.h>
#include <combaseapi.h>
#include <objbase.h>
#include <iostream>
#include <string>
#include <memory>
#include <map>

// Simple VST3 definitions - minimal interface
namespace Steinberg {
    typedef int32_t int32;
    typedef uint32_t uint32;
    typedef uint16_t uint16;
    typedef int16_t int16;
    typedef int32 tresult;
    static const tresult kResultOk = 0;
    
    struct FUID {
        uint32 data[4];
        FUID(uint32 d1, uint32 d2, uint32 d3, uint32 d4) { 
            data[0] = d1; data[1] = d2; data[2] = d3; data[3] = d4; 
        }
    };
    
    struct FUnknown {
        virtual tresult queryInterface(const FUID& iid, void** obj) = 0;
        virtual uint32 addRef() = 0;
        virtual uint32 release() = 0;
    };
    
    struct IPluginFactory : public FUnknown {
        virtual tresult getFactoryInfo(void* info) = 0;
        virtual int32 countClasses() = 0;
        virtual tresult getClassInfo(int32 index, void* info) = 0;
        virtual tresult createInstance(FUID cid, FUID iid, void** obj) = 0;
    };
    
    struct IComponent : public FUnknown {
        virtual tresult initialize(FUnknown* context) = 0;
        virtual tresult terminate() = 0;
    };
    
    struct IEditController : public FUnknown {
        virtual tresult setComponentState(void* state) = 0;
        virtual tresult setState(void* state) = 0;
        virtual tresult getState(void* state) = 0;
    };
    
    struct IPlugView : public FUnknown {
        virtual tresult isPlatformTypeSupported(const char* type) = 0;
        virtual tresult attached(void* parent, const char* type) = 0;
        virtual tresult removed() = 0;
        virtual tresult onWheel(float distance) = 0;
        virtual tresult onKeyDown(uint16 key, int16 keyModifiers) = 0;
        virtual tresult onKeyUp(uint16 key, int16 keyModifiers) = 0;
        virtual tresult getSize(void* size) = 0;
        virtual tresult onSize(void* newSize) = 0;
        virtual tresult onFocus(bool state) = 0;
        virtual tresult setFrame(void* frame) = 0;
        virtual tresult canResize() = 0;
        virtual tresult checkSizeConstraint(void* rect) = 0;
    };
    
    // View rectangle structure
    struct ViewRect {
        int32 left;
        int32 top;
        int32 right;
        int32 bottom;
        
        ViewRect(int32 l = 0, int32 t = 0, int32 r = 0, int32 b = 0) 
            : left(l), top(t), right(r), bottom(b) {}
    };
    
    // Plugin factory interface IDs (simplified)
    static const FUID kIComponentIID(0x22888DDB, 0x156E45AE, 0x8358B348, 0x08190625);
    static const FUID kIEditControllerIID(0xDCD7BBE3, 0x7742448D, 0xA874AACC, 0x979C759E);
    static const FUID kIPlugViewIID(0x5BC32507, 0xD06049EA, 0xA6151B52, 0x2B755B29);
    
    // IEditController2 interface for UI support
    struct IEditController2 : public IEditController {
        virtual tresult setKnobMode(int32 mode) = 0;
        virtual tresult openHelp(bool onlyCheck) = 0;
        virtual tresult openAboutBox(bool onlyCheck) = 0;
    };
}

// Simple plugin wrapper
class SimplePlugin {
public:
    std::string id;
    std::string name;
    std::string path;
    HMODULE module;
    Steinberg::IComponent* component;
    Steinberg::IEditController* editController;
    Steinberg::IPlugView* plugView;
    HWND uiWindow;
    HWND parentWindow;  // For embedding
    bool hasUI;
    bool initialized;
    bool uiVisible;
    Steinberg::ViewRect viewRect;
    
    SimplePlugin() : module(nullptr), component(nullptr), editController(nullptr), 
                     plugView(nullptr), uiWindow(nullptr), parentWindow(nullptr), 
                     hasUI(false), initialized(false), uiVisible(false) {}
    
    ~SimplePlugin() {
        if (plugView && uiVisible) {
            plugView->removed();
            plugView->release();
            plugView = nullptr;
        }
        if (editController) {
            editController->release();
            editController = nullptr;
        }
        if (component) {
            component->terminate();
            component->release();
            component = nullptr;
        }
        if (uiWindow) {
            DestroyWindow(uiWindow);
            uiWindow = nullptr;
        }
        if (module) {
            FreeLibrary(module);
            module = nullptr;
        }
    }
};

class VST3Host : public Nan::ObjectWrap {
private:
    std::map<std::string, std::unique_ptr<SimplePlugin>> loadedPlugins;
    bool audioInitialized;
    
public:
    static NAN_MODULE_INIT(Init) {
        v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
        tpl->SetClassName(Nan::New("VST3Host").ToLocalChecked());
        tpl->InstanceTemplate()->SetInternalFieldCount(1);

        // Essential methods only
        Nan::SetPrototypeMethod(tpl, "loadPlugin", LoadPlugin);
        Nan::SetPrototypeMethod(tpl, "unloadPlugin", UnloadPlugin);
        Nan::SetPrototypeMethod(tpl, "getLoadedPlugins", GetLoadedPlugins);
        Nan::SetPrototypeMethod(tpl, "initializeAudio", InitializeAudio);
        Nan::SetPrototypeMethod(tpl, "showPluginUI", ShowPluginUI);
        Nan::SetPrototypeMethod(tpl, "hidePluginUI", HidePluginUI);
        Nan::SetPrototypeMethod(tpl, "getPluginInfo", GetPluginInfo);
        Nan::SetPrototypeMethod(tpl, "getPluginWindowHandle", GetPluginWindowHandle);

        constructor_template.Reset(tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
        
        // Export both names for compatibility
        Nan::Set(target, Nan::New("VST3Host").ToLocalChecked(),
                 tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
        Nan::Set(target, Nan::New("SimpleVST3Host").ToLocalChecked(),
                 tpl->GetFunction(Nan::GetCurrentContext()).ToLocalChecked());
    }

    VST3Host() : audioInitialized(false) {
        CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
        std::cout << "🎵 VST3Host created" << std::endl;
    }

    ~VST3Host() {
        loadedPlugins.clear();
        CoUninitialize();
    }

private:
    static Nan::Persistent<v8::Function> constructor_template;

    static NAN_METHOD(New) {
        if (info.IsConstructCall()) {
            VST3Host* obj = new VST3Host();
            obj->Wrap(info.This());
            info.GetReturnValue().Set(info.This());
        } else {
            const int argc = 0;
            v8::Local<v8::Value> argv[1];
            v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor_template);
            info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
        }
    }

    static NAN_METHOD(LoadPlugin) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            Nan::ThrowTypeError("Plugin path required");
            return;
        }

        Nan::Utf8String pluginPath(info[0]);
        std::string path(*pluginPath);
        
        std::cout << "🔍 Loading plugin: " << path << std::endl;
        
        bool success = host->loadVST3Plugin(path);
        info.GetReturnValue().Set(Nan::New(success));
    }

    static NAN_METHOD(UnloadPlugin) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            info.GetReturnValue().Set(Nan::New(false));
            return;
        }

        Nan::Utf8String pluginId(info[0]);
        std::string id(*pluginId);
        
        auto it = host->loadedPlugins.find(id);
        if (it != host->loadedPlugins.end()) {
            host->loadedPlugins.erase(it);
            info.GetReturnValue().Set(Nan::New(true));
        } else {
            info.GetReturnValue().Set(Nan::New(false));
        }
    }

    static NAN_METHOD(GetLoadedPlugins) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        v8::Local<v8::Array> plugins = Nan::New<v8::Array>();
        uint32_t index = 0;
        
        try {
            for (const auto& pair : host->loadedPlugins) {
                try {
                    v8::Local<v8::Object> pluginInfo = Nan::New<v8::Object>();
                    
                    // Safely access plugin properties
                    if (pair.second) {
                        Nan::Set(pluginInfo, Nan::New("id").ToLocalChecked(), Nan::New(pair.second->id).ToLocalChecked());
                        Nan::Set(pluginInfo, Nan::New("name").ToLocalChecked(), Nan::New(pair.second->name).ToLocalChecked());
                        Nan::Set(pluginInfo, Nan::New("path").ToLocalChecked(), Nan::New(pair.second->path).ToLocalChecked());
                        Nan::Set(pluginInfo, Nan::New("hasUI").ToLocalChecked(), Nan::New(pair.second->hasUI));
                        Nan::Set(pluginInfo, Nan::New("initialized").ToLocalChecked(), Nan::New(pair.second->initialized));
                        
                        Nan::Set(plugins, index++, pluginInfo);
                    }
                } catch (const std::exception& e) {
                    std::cerr << "❌ Error accessing plugin info: " << e.what() << std::endl;
                    continue; // Skip this plugin but continue with others
                }
            }
        } catch (const std::exception& e) {
            std::cerr << "❌ Error in GetLoadedPlugins: " << e.what() << std::endl;
        }
        
        info.GetReturnValue().Set(plugins);
    }

    static NAN_METHOD(InitializeAudio) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        // Simple audio initialization
        host->audioInitialized = true;
        std::cout << "🎵 Audio initialized" << std::endl;
        
        info.GetReturnValue().Set(Nan::New(true));
    }

    static NAN_METHOD(ShowPluginUI) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            info.GetReturnValue().Set(Nan::New(false));
            return;
        }

        Nan::Utf8String pluginId(info[0]);
        std::string id(*pluginId);
        
        // Optional parent window handle parameter
        HWND parentHwnd = nullptr;
        if (info.Length() > 1 && info[1]->IsNumber()) {
            v8::Maybe<int64_t> maybeValue = info[1]->IntegerValue(Nan::GetCurrentContext());
            if (!maybeValue.IsNothing()) {
                parentHwnd = (HWND)(maybeValue.FromJust());
            }
        }
        
        auto it = host->loadedPlugins.find(id);
        if (it != host->loadedPlugins.end() && it->second->hasUI && !it->second->uiVisible) {
            std::cout << "🎛️ Creating native VST3 UI for: " << it->second->name << std::endl;
            
            bool success = host->createPluginUI(it->second.get(), parentHwnd);
            info.GetReturnValue().Set(Nan::New(success));
        } else {
            std::cout << "⚠️ Plugin not found, has no UI, or UI already visible" << std::endl;
            info.GetReturnValue().Set(Nan::New(false));
        }
    }

    static NAN_METHOD(HidePluginUI) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            info.GetReturnValue().Set(Nan::New(false));
            return;
        }

        Nan::Utf8String pluginId(info[0]);
        std::string id(*pluginId);
        
        auto it = host->loadedPlugins.find(id);
        if (it != host->loadedPlugins.end() && it->second->uiVisible) {
            std::cout << "🎛️ Hiding UI for: " << it->second->name << std::endl;
            
            if (it->second->uiWindow) {
                DestroyWindow(it->second->uiWindow);
                it->second->uiWindow = nullptr;
            }
            it->second->uiVisible = false;
            
            std::cout << "✅ UI window closed successfully" << std::endl;
            info.GetReturnValue().Set(Nan::New(true));
        } else {
            std::cout << "⚠️ Plugin not found or UI not visible" << std::endl;
            info.GetReturnValue().Set(Nan::New(false));
        }
    }

    static NAN_METHOD(GetPluginInfo) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        v8::Local<v8::Object> info_obj = Nan::New<v8::Object>();
        Nan::Set(info_obj, Nan::New("loaded").ToLocalChecked(), Nan::New(!host->loadedPlugins.empty()));
        Nan::Set(info_obj, Nan::New("hasEditor").ToLocalChecked(), Nan::New(!host->loadedPlugins.empty()));
        Nan::Set(info_obj, Nan::New("audioInitialized").ToLocalChecked(), Nan::New(host->audioInitialized));
        Nan::Set(info_obj, Nan::New("pluginCount").ToLocalChecked(), Nan::New(static_cast<uint32_t>(host->loadedPlugins.size())));
        
        info.GetReturnValue().Set(info_obj);
    }

    static NAN_METHOD(GetPluginWindowHandle) {
        VST3Host* host = Nan::ObjectWrap::Unwrap<VST3Host>(info.Holder());
        
        if (info.Length() < 1 || !info[0]->IsString()) {
            info.GetReturnValue().Set(Nan::New(0));
            return;
        }

        Nan::Utf8String pluginId(info[0]);
        std::string id(*pluginId);
        
        auto it = host->loadedPlugins.find(id);
        if (it != host->loadedPlugins.end() && it->second->uiWindow) {
            // Return the window handle as a number that can be used by Electron
            intptr_t hwndValue = reinterpret_cast<intptr_t>(it->second->uiWindow);
            info.GetReturnValue().Set(Nan::New(static_cast<double>(hwndValue)));
        } else {
            info.GetReturnValue().Set(Nan::New(0));
        }
    }

    bool createPluginUI(SimplePlugin* plugin, HWND parentWindow = nullptr) {
        if (!plugin || !plugin->hasUI || !plugin->editController) {
            std::cout << "❌ Cannot create UI: plugin invalid or no edit controller" << std::endl;
            return false;
        }

        try {
            // Get the plugin view from the edit controller
            Steinberg::IPlugView* view = nullptr;
            Steinberg::tresult result = plugin->editController->queryInterface(Steinberg::kIPlugViewIID, (void**)&view);
            
            if (result != Steinberg::kResultOk || !view) {
                std::cout << "❌ Could not get plugin view interface" << std::endl;
                return false;
            }

            plugin->plugView = view;

            // Check if the plugin supports Windows platform
            if (view->isPlatformTypeSupported("HWND") != Steinberg::kResultOk) {
                std::cout << "❌ Plugin doesn't support Windows HWND platform" << std::endl;
                view->release();
                plugin->plugView = nullptr;
                return false;
            }

            // Get the preferred size of the plugin UI
            Steinberg::ViewRect rect;
            if (view->getSize(&rect) == Steinberg::kResultOk) {
                plugin->viewRect = rect;
                std::cout << "📐 Plugin UI size: " << rect.right - rect.left << "x" << rect.bottom - rect.top << std::endl;
            } else {
                // Default size if plugin doesn't specify
                plugin->viewRect = Steinberg::ViewRect(0, 0, 800, 600);
                std::cout << "📐 Using default UI size: 800x600" << std::endl;
            }

            HWND hostWindow = nullptr;
            
            if (parentWindow) {
                // Embed in provided parent window
                plugin->parentWindow = parentWindow;
                hostWindow = parentWindow;
                std::cout << "🔗 Embedding UI in parent window" << std::endl;
            } else {
                // Create a new native window
                std::string windowTitle = plugin->name + " - VST3 Plugin";
                int width = plugin->viewRect.right - plugin->viewRect.left;
                int height = plugin->viewRect.bottom - plugin->viewRect.top;
                
                hostWindow = CreateWindowExA(
                    0,
                    "STATIC",
                    windowTitle.c_str(),
                    WS_OVERLAPPEDWINDOW | WS_VISIBLE,
                    CW_USEDEFAULT, CW_USEDEFAULT, width + 16, height + 39, // Add window frame size
                    NULL, NULL, GetModuleHandle(NULL), NULL
                );
                
                if (!hostWindow) {
                    std::cout << "❌ Failed to create host window" << std::endl;
                    view->release();
                    plugin->plugView = nullptr;
                    return false;
                }
                
                plugin->uiWindow = hostWindow;
                std::cout << "🪟 Created native window for plugin UI" << std::endl;
            }

            // Attach the plugin view to our window
            result = view->attached(hostWindow, "HWND");
            if (result != Steinberg::kResultOk) {
                std::cout << "❌ Failed to attach plugin view to window" << std::endl;
                if (!parentWindow && hostWindow) {
                    DestroyWindow(hostWindow);
                    plugin->uiWindow = nullptr;
                }
                view->release();
                plugin->plugView = nullptr;
                return false;
            }

            plugin->uiVisible = true;
            std::cout << "✅ Plugin UI created and attached successfully!" << std::endl;
            return true;

        } catch (const std::exception& e) {
            std::cout << "❌ Exception creating plugin UI: " << e.what() << std::endl;
            return false;
        }
    }

    bool loadVST3Plugin(const std::string& path) {
        try {
            // Load the DLL
            std::wstring widePath(path.begin(), path.end());
            HMODULE module = LoadLibraryW(widePath.c_str());
            
            if (!module) {
                DWORD error = GetLastError();
                std::cerr << "❌ Failed to load DLL: " << error << std::endl;
                return false;
            }

            std::cout << "✅ DLL loaded successfully" << std::endl;

            // Get required functions
            typedef bool (*InitDllFunc)();
            typedef Steinberg::IPluginFactory* (*GetFactoryFunc)();

            InitDllFunc initDll = (InitDllFunc)GetProcAddress(module, "InitDll");
            GetFactoryFunc getFactory = (GetFactoryFunc)GetProcAddress(module, "GetPluginFactory");

            if (!initDll || !getFactory) {
                std::cerr << "❌ Missing required VST3 functions" << std::endl;
                FreeLibrary(module);
                return false;
            }

            // Initialize plugin
            if (!initDll()) {
                std::cerr << "❌ Plugin initialization failed" << std::endl;
                FreeLibrary(module);
                return false;
            }

            auto factory = getFactory();
            if (!factory) {
                std::cerr << "❌ Could not get plugin factory" << std::endl;
                FreeLibrary(module);
                return false;
            }

            // Create plugin wrapper
            auto plugin = std::make_unique<SimplePlugin>();
            plugin->module = module;
            plugin->path = path;
            
            // Extract plugin name from path
            size_t lastSlash = path.find_last_of("\\/");
            std::string filename = (lastSlash != std::string::npos) ? path.substr(lastSlash + 1) : path;
            size_t lastDot = filename.find_last_of(".");
            plugin->name = (lastDot != std::string::npos) ? filename.substr(0, lastDot) : filename;
            plugin->id = plugin->name; // Use name as ID for simplicity
            
            // Try to create actual plugin instances
            Steinberg::int32 classCount = factory->countClasses();
            std::cout << "🔍 Plugin has " << classCount << " factory classes" << std::endl;
            
            bool componentCreated = false;
            bool editControllerCreated = false;
            
            for (Steinberg::int32 i = 0; i < classCount; i++) {
                // Try to create component
                if (!componentCreated) {
                    Steinberg::IComponent* component = nullptr;
                    // Use a null FUID for first attempt - plugin factory will try to find appropriate class
                    Steinberg::FUID nullFuid(0, 0, 0, 0);
                    if (factory->createInstance(nullFuid, Steinberg::kIComponentIID, (void**)&component) == Steinberg::kResultOk && component) {
                        if (component->initialize(nullptr) == Steinberg::kResultOk) {
                            plugin->component = component;
                            componentCreated = true;
                            std::cout << "✅ Component created and initialized" << std::endl;
                        } else {
                            component->release();
                        }
                    }
                }
                
                // Try to create edit controller
                if (!editControllerCreated) {
                    Steinberg::IEditController* editController = nullptr;
                    Steinberg::FUID nullFuid(0, 0, 0, 0);
                    if (factory->createInstance(nullFuid, Steinberg::kIEditControllerIID, (void**)&editController) == Steinberg::kResultOk && editController) {
                        plugin->editController = editController;
                        editControllerCreated = true;
                        std::cout << "✅ Edit controller created" << std::endl;
                    }
                }
                
                if (componentCreated && editControllerCreated) break;
            }
            
            // Determine UI support - for VST3, assume UI support unless explicitly no edit controller
            // Most VST3 plugins have some form of UI, even if edit controller detection fails
            plugin->hasUI = true; // Default to true for VST3 plugins
            
            if (editControllerCreated) {
                std::cout << "✅ Plugin has UI support (edit controller confirmed)" << std::endl;
            } else {
                std::cout << "ℹ️ Plugin UI status: assumed available (edit controller not detected)" << std::endl;
            }
            
            plugin->initialized = true;

            // Store the plugin name before moving the object
            std::string pluginName = plugin->name;
            
            // Store plugin
            loadedPlugins[plugin->id] = std::move(plugin);

            std::cout << "🎉 Plugin loaded: " << pluginName << std::endl;
            return true;

        } catch (const std::exception& e) {
            std::cerr << "❌ Exception loading plugin: " << e.what() << std::endl;
            return false;
        }
    }
};

Nan::Persistent<v8::Function> VST3Host::constructor_template;

NAN_MODULE_INIT(InitModule) {
    VST3Host::Init(target);
}

NODE_MODULE(vst3_host, InitModule)
